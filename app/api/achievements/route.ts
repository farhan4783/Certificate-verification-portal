import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AchievementType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Students only" } },
        { status: 403 }
      );
    }

    const student = await prisma.student.findFirst({
      where: { user: { email: session.email } },
      select: { id: true },
    });
    if (!student) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Student profile not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, issuer, type, achievementDate, credentialUrl, isFeatured } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Achievement title is required" } },
        { status: 400 }
      );
    }

    const newAchievement = await prisma.achievement.create({
      data: {
        studentId: student.id,
        title,
        description: description || null,
        issuer: issuer || null,
        type: (type as AchievementType) || AchievementType.OTHER,
        achievementDate: achievementDate ? new Date(achievementDate) : null,
        credentialUrl: credentialUrl || null,
        isFeatured: !!isFeatured,
      },
    });

    // Log Audit Trail
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "CREATE",
        table: "Achievement",
        recordId: newAchievement.id,
        metadata: { achievementTitle: title },
      },
    });

    return NextResponse.json({ success: true, data: { achievement: newAchievement } }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/achievements] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to create achievement" } },
      { status: 500 }
    );
  }
}
