import * as jose from "jose";
import { cookies } from "next/headers";
import prisma from "./prisma";
import crypto from "crypto";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "local-dev-jwt-secret-key-1234567890"
);
const ACCESS_COOKIE_NAME = "ktc_session";
const REFRESH_COOKIE_NAME = "ktc_refresh";

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  organizationId: string;
}

export async function signToken(payload: JWTPayload, expiresIn: string = "15m"): Promise<string> {
  return await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
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

export async function generateRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
}

export async function setSessionCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  
  cookieStore.set(ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60, // 15 minutes
    path: "/",
  });

  cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60, // 15 minutes
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  
  const refreshCookie = cookieStore.get(REFRESH_COOKIE_NAME);
  if (refreshCookie?.value) {
    try {
      await prisma.refreshToken.delete({
        where: { token: refreshCookie.value },
      });
    } catch {}
  }

  cookieStore.delete(ACCESS_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ACCESS_COOKIE_NAME);
  if (!cookie || !cookie.value) {
    return null;
  }
  return verifyToken(cookie.value);
}
