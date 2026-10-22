import { NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT
        Vehicle_ID,
        Registration_No,
        Model,
        Type,
        Year,
        Fuel_Type,
        Base_Rate,
        Branch_ID
      FROM Vehicle
      ORDER BY Vehicle_ID ASC`
    );

    return NextResponse.json({
      success: true,
      vehicles: rows,
    });
  } catch (error) {
    console.error("Failed to fetch vehicles:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch vehicles from MySQL.",
      },
      { status: 500 }
    );
  }
}