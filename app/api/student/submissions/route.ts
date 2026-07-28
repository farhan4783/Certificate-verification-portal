import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const submissionSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  weekNumber: z.number().int().positive().optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  liveUrl: z.string().url().optional().or(z.literal("")),
  submissionNote: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const student = await prisma.student.findFirst({
      where: { user: { email: session.email } },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const submissions = await prisma.assignmentSubmission.findMany({
      where: { studentId: student.id },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: submissions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error?.message } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const result = submissionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: "Validation failed", details: result.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }

    const student = await prisma.student.findFirst({
      where: { user: { email: session.email } },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const { title, description, weekNumber, githubUrl, liveUrl, submissionNote } = result.data;

    const submission = await prisma.assignmentSubmission.create({
      data: {
        studentId: student.id,
        title,
        description: description || null,
        weekNumber: weekNumber || null,
        githubUrl: githubUrl || null,
        liveUrl: liveUrl || null,
        submissionNote: submissionNote || null,
      },
    });

    // Recalculate student progress
    await recalculateProgress(student.id);

    return NextResponse.json({ success: true, data: submission }, { status: 201 });
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json({ success: false, error: { message: error?.message } }, { status: 500 });
  }
}

async function recalculateProgress(studentId: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { batch: true },
    });

    if (!student || !student.batchId) return;

    // Count attendance
    const totalSessions = await prisma.classSession.count({
      where: { batchId: student.batchId, isCompleted: true },
    });
    const attendedSessions = await prisma.studentAttendance.count({
      where: { studentId, isPresent: true },
    });

    // Count assignments
    const totalAssignments = await prisma.classSession.count({
      where: { batchId: student.batchId, sessionType: "PROJECT_DAY", isCompleted: true },
    });
    const submittedAssignments = await prisma.assignmentSubmission.count({
      where: { studentId, status: { in: ["SUBMITTED", "GRADED", "UNDER_REVIEW"] } },
    });

    // Get average capstone score from graded assignments
    const gradedSubmissions = await prisma.assignmentSubmission.findMany({
      where: { studentId, status: "GRADED", score: { not: null } },
    });
    const capstoneScore = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length
      : 0;

    // Calculate rates
    const attendanceRate = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;
    const assignmentRate = totalAssignments > 0 ? Math.min(100, (submittedAssignments / totalAssignments) * 100) : 0;

    // Weighted total: 40% attendance + 40% assignments + 20% capstone
    const totalPercentage = Math.min(100, Math.round(
      (attendanceRate * 0.4) + (assignmentRate * 0.4) + (capstoneScore * 0.2)
    ));

    const isComplete = totalPercentage >= 100;

    await prisma.studentProgress.upsert({
      where: { studentId },
      update: {
        attendanceRate,
        assignmentRate,
        capstoneScore,
        totalPercentage,
        totalSessionsAttended: attendedSessions,
        totalSessionsAvailable: totalSessions,
        totalAssignmentsSubmitted: submittedAssignments,
        totalAssignmentsAvailable: totalAssignments,
        isComplete,
        completedAt: isComplete ? new Date() : null,
      },
      create: {
        studentId,
        attendanceRate,
        assignmentRate,
        capstoneScore,
        totalPercentage,
        totalSessionsAttended: attendedSessions,
        totalSessionsAvailable: totalSessions,
        totalAssignmentsSubmitted: submittedAssignments,
        totalAssignmentsAvailable: totalAssignments,
        isComplete,
        completedAt: isComplete ? new Date() : null,
      },
    });
  } catch (err) {
    console.error("Progress recalculation error:", err);
  }
}
