import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signToken, generateRefreshToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    
    // Extract ktc_refresh cookie manually
    const match = cookieHeader.match(/ktc_refresh=([^;]+)/);
    const refreshTokenValue = match ? match[1] : null;

    if (!refreshTokenValue) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Refresh token missing" } },
        { status: 401 }
      );
    }

    // Lookup token
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenValue },
      include: { user: true },
    });

    // Check expiration or validity
    if (!dbToken || dbToken.expiresAt < new Date()) {
      // Clean up old token if exists
      if (dbToken) {
        await prisma.refreshToken.delete({ where: { id: dbToken.id } }).catch(() => {});
      }

      const response = NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Refresh token expired or invalid" } },
        { status: 401 }
      );

      // Clear cookies on client side
      response.headers.append("Set-Cookie", "ktc_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
      response.headers.append("Set-Cookie", "ktc_refresh=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
      return response;
    }

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { id: dbToken.id } }).catch(() => {});
    const newRefreshToken = await generateRefreshToken(dbToken.userId);

    const payload = {
      id: dbToken.user.id,
      email: dbToken.user.email,
      role: dbToken.user.role,
      organizationId: dbToken.user.organizationId,
    };

    // Sign new access token
    const newAccessToken = await signToken(payload, "15m");

    const response = NextResponse.json({
      success: true,
      message: "Tokens rotated successfully",
      user: {
        id: dbToken.user.id,
        name: dbToken.user.name,
        role: dbToken.user.role,
      }
    });

    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

    // Set new cookies in header so they are passed back
    response.headers.append(
      "Set-Cookie",
      `ktc_session=${newAccessToken}; Path=/; Max-Age=900; HttpOnly; SameSite=Lax${secure}`
    );
    response.headers.append(
      "Set-Cookie",
      `ktc_refresh=${newRefreshToken}; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax${secure}`
    );

    return response;
  } catch (err: any) {
    console.error("Token Refresh Error:", err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to refresh token" } },
      { status: 500 }
    );
  }
}
