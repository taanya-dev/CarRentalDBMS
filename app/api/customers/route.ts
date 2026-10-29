
import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import type { RowDataPacket } from "mysql2";

type CustomerRow = RowDataPacket & {
  Customer_ID: number;
  First_Name: string;
  Last_Name: string;
  Email: string | null;
};

export async function GET() {
  try {
    const [customers] = await pool.query<CustomerRow[]>(
      `SELECT Customer_ID, First_Name, Last_Name, Email
       FROM Customer
       ORDER BY First_Name ASC, Last_Name ASC`
    );

    return NextResponse.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("GET /api/customers failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch customers from MySQL.",
      },
      { status: 500 }
    );
  }
}
