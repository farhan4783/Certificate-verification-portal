import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (session) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: session.id,
            action: "UPDATE",
            table: "User",
            recordId: session.id,
            metadata: { info: "User logged out via GET" },
          },
        });
      } catch (auditError) {
        console.error("Failed to write audit log:", auditError);
      }
    }

    await clearSessionCookie();
    return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
  } catch (error) {
    console.error("Logout GET Error:", error);
    return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
  }
}

export async function POST() {
  try {
    const session = await getSession();

    if (session) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: session.id,
            action: "UPDATE",
            table: "User",
            recordId: session.id,
            metadata: { info: "User logged out" },
          },
        });
      } catch (auditError) {
        console.error("Failed to write audit log:", auditError);
      }
    }

    await clearSessionCookie();

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
      data: null,
    });
  } catch (error) {
    console.error("Logout API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}

