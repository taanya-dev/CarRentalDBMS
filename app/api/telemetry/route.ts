
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;

    // These names must match your actual MongoDB setup.
    const databaseName = process.env.MONGODB_DATABASE;
    const collectionName =
      process.env.MONGODB_TELEMETRY_COLLECTION;

    if (!databaseName || !collectionName) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Set MONGODB_DATABASE and MONGODB_TELEMETRY_COLLECTION in .env.local",
        },
        { status: 500 }
      );
    }

    const collection = client
      .db(databaseName)
      .collection(collectionName);

    const documents = await collection
      .find({})
      .limit(100)
      .toArray();

    const telemetry = documents.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      count: telemetry.length,
      telemetry,
    });
  } catch (error) {
    console.error("Telemetry API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to retrieve telemetry from MongoDB.",
      },
      { status: 500 }
    );
  }
}
