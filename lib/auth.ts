import * as jose from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "local-dev-jwt-secret-key-1234567890"
);
const SESSION_COOKIE_NAME = "ktc_session";

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  organizationId: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!cookie || !cookie.value) {
    return null;
  }
  return verifyToken(cookie.value);
}
