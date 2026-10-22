
import { NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function GET() {
  try {
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

    return NextResponse.json({
      success: true,
      bills: rows,
    });
  } catch (error) {
    console.error("Billing API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load billing records from MySQL.",
      },
      { status: 500 }
    );
  }
}
