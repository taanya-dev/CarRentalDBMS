
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  let sqlConnection;

  try {
    // Test MySQL
    sqlConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    await sqlConnection.query("SELECT 1");

    // Test MongoDB
    const mongoClient = await clientPromise;
    const mongoDb = mongoClient.db(
      process.env.MONGODB_DATABASE
    );

    await mongoDb.command({ ping: 1 });

    return NextResponse.json({
      success: true,
      mysql: "Connected",
      mongodb: "Connected",
    });
  } catch (error) {
    console.error("Database connection test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown connection error",
      },
      { status: 500 }
    );
  } finally {
    if (sqlConnection) {
      await sqlConnection.end();
    }
  }
}
