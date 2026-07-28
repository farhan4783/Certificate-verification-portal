import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken, setSessionCookies, generateRefreshToken, hashUserAgent } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limiter";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = await checkRateLimit(`login:${ipAddress}`, 10, 300);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOO_MANY_REQUESTS",
            message: "Too many login attempts. Please try again in 5 minutes.",
          },
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: result.error.flatten().fieldErrors,
          },
        },
        { status: 422 }
      );
    }

    const { email, password } = result.data;

    // Find user by email (case insensitive)
    const user = await prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: "insensitive" } },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
      );
    }

    const userAgent = request.headers.get("user-agent") || "";
    const fingerprint = hashUserAgent(userAgent);

    // Sign JWT Token with normalized property names (id & userId, fingerprint & userFingerprint)
    const payload = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      fingerprint,
      userFingerprint: fingerprint,
    };
    
    const accessToken = await signToken(payload, "15m");
    const refreshToken = await generateRefreshToken(user.id);
    await setSessionCookies(accessToken, refreshToken);

    // Record Audit Log (safely caught)
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGIN",
          table: "User",
          recordId: user.id,
          metadata: { ip: request.headers.get("x-forwarded-for") || "unknown" },
        },
      });
    } catch (auditError) {
      console.error("Failed to write audit log:", auditError);
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        },
      },
    });
  } catch (error: any) {
    console.error("Login API Error:", error);

    let publicErrorMsg = "An unexpected error occurred during login";
    if (error?.code === "P1001" || error?.message?.includes("Can't reach database")) {
      publicErrorMsg = "Database Connection Error: Unable to reach database server.";
    } else if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
      publicErrorMsg = "Database Schema Error: Tables missing in database. Run database migrations/seeding.";
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: publicErrorMsg,
        },
      },
      { status: 500 }
    );
  }
}
