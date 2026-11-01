
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
export async function POST(request: Request) {
  try {
    const { licenseNo, firstName, lastName, email } = await request.json();

    const [maxId]: any = await pool.query(
  `SELECT COALESCE(MAX(Customer_ID), 100) + 1 AS nextId
   FROM Customer`
);

const nextCustomerId = maxId[0].nextId; 

  await pool.query(
  `INSERT INTO Customer
(Customer_ID, License_No, First_Name, Last_Name, Email)
VALUES (?, ?, ?, ?, ?)`,
  [nextCustomerId, licenseNo, firstName, lastName, email]
);

    const [rows] = await pool.query<CustomerRow[]>(
  `SELECT Customer_ID, First_Name, Last_Name, Email
   FROM Customer
   WHERE Customer_ID = ?`,
  [nextCustomerId]
);

    return NextResponse.json(rows[0]);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to add customer" },
      { status: 500 }
    );
  }
}
