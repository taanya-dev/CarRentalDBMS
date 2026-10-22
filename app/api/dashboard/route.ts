
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    const [[vehicles]]: any = await connection.query(
      "SELECT COUNT(*) AS total FROM Vehicle"
    );

    const [[rentals]]: any = await connection.query(
      "SELECT COUNT(*) AS total FROM Rental"
    );

    const [[bills]]: any = await connection.query(
      "SELECT COUNT(*) AS total FROM Bill"
    );

    const [[pending]]: any = await connection.query(
      "SELECT COALESCE(SUM(Total_Amount), 0) AS total FROM Bill WHERE Payment_Status = 'Pending'"
    );

    return NextResponse.json({
      success: true,
      totalVehicles: vehicles.total,
      totalRentals: rentals.total,
      totalBills: bills.total,
      pendingPayments: pending.total,
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
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
