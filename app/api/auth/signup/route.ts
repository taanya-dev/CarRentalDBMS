
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/mysql";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3–50 characters (letters, numbers, underscores)." },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 72) {
      return NextResponse.json(
        { error: "Password must be between 8 and 72 characters." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.execute(
      `INSERT INTO App_User (Username, Password_Hash, Role)
       VALUES (?, ?, 'Staff')`,
      [username, passwordHash]
    );

    return NextResponse.json(
      { message: "Account created. Please log in." },
      { status: 201 }
    );
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;

    if (code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "That username is already taken." },
        { status: 409 }
      );
    }

    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Could not create account. Check your database configuration." },
      { status: 500 }
    );
  }
}
