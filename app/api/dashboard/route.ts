
import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import type { RowDataPacket } from "mysql2";

type CountRow = RowDataPacket & {
  total: number | string;
};

export async function GET() {
  try {
    const [[vehicles]] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS total FROM Vehicle"
    );

    const [[rentals]] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS total FROM Rental"
    );

    const [[bills]] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS total FROM Bill"
    );

    const [[pending]] = await pool.query<CountRow[]>(
      `SELECT COALESCE(SUM(Total_Amount), 0) AS total
       FROM Bill
       WHERE Payment_Status = 'Pending'`
    );

    const [[active]] = await pool.query<CountRow[]>(
      `SELECT COUNT(DISTINCT Vehicle_ID) AS total
       FROM Rental
       WHERE Start_Date <= CURDATE()
         AND (End_Date IS NULL OR End_Date >= CURDATE())`
    );

    const totalVehicles = Number(vehicles.total);
    const currentlyRented = Number(active.total);
    const notCurrentlyRented = Math.max(
      0,
      totalVehicles - currentlyRented
    );

    const utilizationPercent =
      totalVehicles > 0
        ? Math.round((currentlyRented / totalVehicles) * 100)
        : 0;

    return NextResponse.json({
      success: true,
      totalVehicles,
      totalRentals: Number(rentals.total),
      totalBills: Number(bills.total),
      pendingPayments: Number(pending.total),
      fleetStatus: {
        currentlyRented,
        notCurrentlyRented,
        utilizationPercent,
      },
    });
  } catch (error) {
    console.error("Dashboard API failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown database error",
      },
      { status: 500 }
    );
  }
}
