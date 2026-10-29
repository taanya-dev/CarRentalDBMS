import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

export type AppRole = "Admin" | "Staff";
export type SessionUser = { userId: number; username: string; role: AppRole };
const COOKIE_NAME = "roadwise_session";
function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must be at least 32 characters in .env.local");
  return new TextEncoder().encode(secret);
}
export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ username: user.username, role: user.role })
    .setProtectedHeader({ alg: "HS256" }).setSubject(String(user.userId))
    .setIssuedAt().setExpirationTime("8h").sign(secretKey());
}
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const role = payload.role;
    if ((role !== "Admin" && role !== "Staff") || !payload.sub || !payload.username) return null;
    return { userId: Number(payload.sub), username: String(payload.username), role };
  } catch { return null; }
}
export { COOKIE_NAME };
