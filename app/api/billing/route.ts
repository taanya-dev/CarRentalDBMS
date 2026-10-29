
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";
import { getSessionUser } from "@/lib/auth";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

type BillRow = RowDataPacket & {
  Bill_ID: number;
  Rental_ID: number;
};

type RentalBillingRow = RowDataPacket & {
  Rental_ID: number;
  Total_Distance: number | string | null;
  Base_Rate: number | string;
  Start_Date: string;
  End_Date: string | null;
};

const DISTANCE_RATE_PER_KM = 2.5;

async function authorizeBilling() {
  const user = await getSessionUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "Admin" && user.role !== "Staff") {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, error: "Forbidden." },
        { status: 403 }
      ),
    };
  }

  return { user, response: null };
}

// GET /api/billing
export async function GET() {
  try {
    const auth = await authorizeBilling();
    if (auth.response) return auth.response;

    const [rows] = await pool.query(
      `SELECT
         Bill_ID,
         Rental_ID,
         Base_Amount,
         Distance_Charge,
         Penalty_Charge,
         Total_Amount,
         Payment_Date,
         Payment_Status
       FROM Bill
       ORDER BY Bill_ID DESC`
    );

    return NextResponse.json({ success: true, bills: rows });
  } catch (error) {
    console.error("Billing GET error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load billing records." },
      { status: 500 }
    );
  }
}

// PATCH /api/billing
// Mark a bill Paid or Pending.
export async function PATCH(request: NextRequest) {
  try {
    const auth = await authorizeBilling();
    if (auth.response) return auth.response;

    let body: { billId?: unknown; status?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const billId = Number(body.billId);
    const status = body.status;

    if (!Number.isSafeInteger(billId) || billId <= 0) {
      return NextResponse.json(
        { success: false, error: "A valid Bill ID is required." },
        { status: 400 }
      );
    }

    if (status !== "Paid" && status !== "Pending") {
      return NextResponse.json(
        { success: false, error: "Status must be Paid or Pending." },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE Bill
       SET Payment_Status = ?,
           Payment_Date = CASE
             WHEN ? = 'Paid'
               THEN COALESCE(Payment_Date, CURRENT_DATE())
             ELSE NULL
           END
       WHERE Bill_ID = ?`,
      [status, status, billId]
    );

    if (result.affectedRows === 0) {
      const [existingRows] = await pool.execute<BillRow[]>(
        "SELECT Bill_ID, Rental_ID FROM Bill WHERE Bill_ID = ?",
        [billId]
      );

      if (existingRows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Bill not found." },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bill #${billId} payment status updated to ${status}.`,
    });
  } catch (error) {
    console.error("Billing PATCH error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to update payment status." },
      { status: 500 }
    );
  }
}

// PUT /api/billing
// Recalculate an existing bill from its rental's real distance.
// Body: { "rentalId": 123 }
export async function PUT(request: NextRequest) {
  let connection:
    | Awaited<ReturnType<typeof pool.getConnection>>
    | undefined;

  try {
    const auth = await authorizeBilling();
    if (auth.response) return auth.response;

    let body: { rentalId?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const rentalId = Number(body.rentalId);

    if (!Number.isSafeInteger(rentalId) || rentalId <= 0) {
      return NextResponse.json(
        { success: false, error: "A valid Rental ID is required." },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rentals] = await connection.execute<RentalBillingRow[]>(
      `SELECT
         r.Rental_ID,
         r.Total_Distance,
         r.Start_Date,
         r.End_Date,
         v.Base_Rate
       FROM Rental r
       JOIN Vehicle v ON v.Vehicle_ID = r.Vehicle_ID
       WHERE r.Rental_ID = ?
       FOR UPDATE`,
      [rentalId]
    );

    if (rentals.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        { success: false, error: "Rental not found." },
        { status: 404 }
      );
    }

    const rental = rentals[0];
    const distance = Number(rental.Total_Distance);

    if (!Number.isFinite(distance) || distance <= 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error:
            "No positive recorded distance is available for this rental. Record the actual distance first.",
        },
        { status: 400 }
      );
    }

    const dailyRate = Number(rental.Base_Rate);

    if (!Number.isFinite(dailyRate) || dailyRate < 0) {
      await connection.rollback();

      return NextResponse.json(
        { success: false, error: "Invalid vehicle base rate." },
        { status: 500 }
      );
    }

    const start = new Date(
      `${String(rental.Start_Date).slice(0, 10)}T00:00:00.000Z`
    );

    const end = rental.End_Date
      ? new Date(
          `${String(rental.End_Date).slice(0, 10)}T00:00:00.000Z`
        )
      : null;

    if (
      Number.isNaN(start.getTime()) ||
      !end ||
      Number.isNaN(end.getTime())
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error:
            "A valid rental end date is required before final billing.",
        },
        { status: 400 }
      );
    }

    const rentalDays = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / 86400000)
    );

    const baseAmount = Number((dailyRate * rentalDays).toFixed(2));
    const distanceCharge = Number(
      (distance * DISTANCE_RATE_PER_KM).toFixed(2)
    );

    const [existingBills] = await connection.execute<BillRow[]>(
      `SELECT Bill_ID, Rental_ID
       FROM Bill
       WHERE Rental_ID = ?
       FOR UPDATE`,
      [rentalId]
    );

    if (existingBills.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error:
            "No bill exists for this rental. Create its bill before recalculating it.",
        },
        { status: 404 }
      );
    }

    const [penaltyRows] = await connection.execute<RowDataPacket[]>(
      `SELECT Penalty_Charge
       FROM Bill
       WHERE Rental_ID = ?`,
      [rentalId]
    );

    const penaltyCharge = Number(penaltyRows[0].Penalty_Charge ?? 0);
    const totalAmount = Number(
      (baseAmount + distanceCharge + penaltyCharge).toFixed(2)
    );

    await connection.execute(
      `UPDATE Bill
       SET Base_Amount = ?,
           Distance_Charge = ?,
           Total_Amount = ?
       WHERE Rental_ID = ?`,
      [baseAmount, distanceCharge, totalAmount, rentalId]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: `Bill for rental #${rentalId} recalculated.`,
      billing: {
        rentalId,
        rentalDays,
        dailyRate,
        distanceKm: distance,
        distanceRatePerKm: DISTANCE_RATE_PER_KM,
        baseAmount,
        distanceCharge,
        penaltyCharge,
        totalAmount,
      },
    });
  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => {});
    }

    console.error("Billing PUT error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to recalculate this bill." },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}
