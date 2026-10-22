import { NextRequest, NextResponse } from "next/server";
import pool  from "@/lib/mysql";
import type { RowDataPacket } from "mysql2";

type RentalRow = RowDataPacket & {
  Rental_ID: number;
  Customer_ID: number;
  Vehicle_ID: number;
  Start_Date: string;
  End_Date: string | null;
  Pickup_Location: string | null;
  Drop_Location: string | null;
  Total_Distance: number;
  Model: string | null;
  Registration_No: string | null;
  First_Name: string | null;
  Last_Name: string | null;
};

type IdRow = RowDataPacket & {
  id: number;
};

// GET /api/rentals
export async function GET() {
  try {
    const [rentals] = await pool.execute<RentalRow[]>(`
      SELECT
        r.Rental_ID,
        r.Customer_ID,
        r.Vehicle_ID,
        r.Start_Date,
        r.End_Date,
        r.Pickup_Location,
        r.Drop_Location,
        r.Total_Distance,
        v.Model,
        v.Registration_No,
        c.First_Name,
        c.Last_Name
      FROM Rental AS r
      LEFT JOIN Vehicle AS v
        ON v.Vehicle_ID = r.Vehicle_ID
      LEFT JOIN Customer AS c
        ON c.Customer_ID = r.Customer_ID
      ORDER BY r.Start_Date DESC, r.Rental_ID DESC
    `);

    return NextResponse.json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    console.error("GET /api/rentals:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch rentals." },
      { status: 500 }
    );
  }
}

// POST /api/rentals
export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();

    const customerId = Number(body.customerId);
    const vehicleId = Number(body.vehicleId);
    const startDate = body.startDate;
    const endDate = body.endDate;
    const pickupLocation = body.pickupLocation;
    const dropLocation = body.dropLocation;

    if (
      !Number.isSafeInteger(customerId) ||
      customerId <= 0 ||
      !Number.isSafeInteger(vehicleId) ||
      vehicleId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid customerId and vehicleId are required.",
        },
        { status: 400 }
      );
    }

    const isValidDate = (value: unknown): value is string => {
      if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
      ) {
        return false;
      }

      const date = new Date(`${value}T00:00:00.000Z`);

      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    };

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return NextResponse.json(
        {
          success: false,
          error: "Use valid startDate and endDate values in YYYY-MM-DD format.",
        },
        { status: 400 }
      );
    }

    if (endDate < startDate) {
      return NextResponse.json(
        {
          success: false,
          error: "End date cannot be before start date.",
        },
        { status: 400 }
      );
    }

    if (
      typeof pickupLocation !== "string" ||
      !pickupLocation.trim() ||
      pickupLocation.trim().length > 50 ||
      typeof dropLocation !== "string" ||
      !dropLocation.trim() ||
      dropLocation.trim().length > 50
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Pickup and drop locations are required (maximum 50 characters).",
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Lock the customer record and verify it exists.
    const [customers] = await connection.execute<IdRow[]>(
      `SELECT Customer_ID AS id
       FROM Customer
       WHERE Customer_ID = ?
       FOR UPDATE`,
      [customerId]
    );

    if (customers.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        { success: false, error: "Customer not found." },
        { status: 404 }
      );
    }

    // Lock the vehicle record to coordinate concurrent bookings.
    const [vehicles] = await connection.execute<IdRow[]>(
      `SELECT Vehicle_ID AS id
       FROM Vehicle
       WHERE Vehicle_ID = ?
       FOR UPDATE`,
      [vehicleId]
    );

    if (vehicles.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        { success: false, error: "Vehicle not found." },
        { status: 404 }
      );
    }

    // Reject bookings that overlap existing rentals.
    const [conflicts] = await connection.execute<RowDataPacket[]>(
      `SELECT Rental_ID
       FROM Rental
       WHERE Vehicle_ID = ?
         AND Start_Date <= ?
         AND COALESCE(End_Date, '9999-12-31') >= ?
       LIMIT 1`,
      [vehicleId, endDate, startDate]
    );

    if (conflicts.length > 0) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          error: "This vehicle is already booked during those dates.",
        },
        { status: 409 }
      );
    }

    // Generate an ID while holding a lock on the vehicle.
    // Every rental for this vehicle uses the same lock.
    const [maxRows] = await connection.execute<IdRow[]>(
      `SELECT COALESCE(MAX(Rental_ID), 0) + 1 AS id
       FROM Rental
       FOR UPDATE`
    );

    const rentalId = Number(maxRows[0].id);

    await connection.execute(
      `INSERT INTO Rental (
        Rental_ID,
        Customer_ID,
        Vehicle_ID,
        Start_Date,
        End_Date,
        Pickup_Location,
        Drop_Location,
        Total_Distance
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rentalId,
        customerId,
        vehicleId,
        startDate,
        endDate,
        pickupLocation.trim(),
        dropLocation.trim(),
        0,
      ]
    );

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Rental created successfully.",
        rentalId,
      },
      { status: 201 }
    );
  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => {});
    }

    console.error("POST /api/rentals:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Could not create rental. Check the server logs.",
      },
      { status: 500 }
    );
  } finally {
    connection?.release();
  }
}