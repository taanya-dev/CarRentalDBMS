
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/mysql";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      `SELECT User_ID, Username, Password_Hash, Role
       FROM App_User
       WHERE Username = ? AND Is_Active = TRUE
       LIMIT 1`,
      [username]
    );

    const users = rows as {
      User_ID: number;
      Username: string;
      Password_Hash: string;
      Role: "Admin" | "Staff";
    }[];

    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user?.Password_Hash ?? ""))) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: user.User_ID,
      username: user.Username,
      role: user.Role,
    });

    const response = NextResponse.json({
      message: "Login successful.",
      user: {
        userId: user.User_ID,
        username: user.Username,
        role: user.Role,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please check the server configuration." },
      { status: 500 }
    );
  }
}
