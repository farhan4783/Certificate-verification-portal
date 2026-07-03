import { NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getSession();

    if (session) {
      // Record Audit Log for logout
      try {
        await prisma.auditLog.create({
          data: {
            userId: session.id,
            action: "UPDATE", // Logout represents a session update state, or we can use another action
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
