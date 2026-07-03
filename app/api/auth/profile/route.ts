import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "User session is invalid or expired",
          },
        },
        { status: 401 }
      );
    }

    // Fetch full user from database
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        trainer: {
          select: {
            id: true,
            designation: true,
            photo: true,
          },
        },
        student: {
          select: {
            id: true,
            enrollmentNumber: true,
            photo: true,
            courseId: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "User account not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Profile API Error:", error);
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
