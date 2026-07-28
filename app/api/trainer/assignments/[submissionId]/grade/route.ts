import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const gradeSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TRAINER" && session.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { submissionId } = await params;
    const body = await request.json();
    const result = gradeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Score must be between 0 and 100" }, { status: 422 });
    }

    const { score, feedback } = result.data;

    const submission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score,
        trainerFeedback: feedback || null,
        status: "GRADED",
        gradedAt: new Date(),
      },
      include: { student: true },
    });

    // Recalculate progress for the student
    const studentId = submission.studentId;
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (student?.batchId) {
      const totalSessions = await prisma.classSession.count({
        where: { batchId: student.batchId, isCompleted: true },
      });
      const attendedSessions = await prisma.studentAttendance.count({
        where: { studentId, isPresent: true },
      });

      const totalAssignments = await prisma.classSession.count({
        where: { batchId: student.batchId, sessionType: "PROJECT_DAY", isCompleted: true },
      });
      const submittedAssignments = await prisma.assignmentSubmission.count({
        where: { studentId, status: { in: ["SUBMITTED", "GRADED", "UNDER_REVIEW"] } },
      });

      const gradedSubmissions = await prisma.assignmentSubmission.findMany({
        where: { studentId, status: "GRADED", score: { not: null } },
      });

      const capstoneScore = gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length
        : 0;

      const attendanceRate = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;
      const assignmentRate = totalAssignments > 0 ? Math.min(100, (submittedAssignments / totalAssignments) * 100) : 0;
      const totalPercentage = Math.min(100, Math.round(
        (attendanceRate * 0.4) + (assignmentRate * 0.4) + (capstoneScore * 0.2)
      ));

      await prisma.studentProgress.upsert({
        where: { studentId },
        update: {
          attendanceRate,
          assignmentRate,
          capstoneScore,
          totalPercentage,
          isComplete: totalPercentage >= 100,
          completedAt: totalPercentage >= 100 ? new Date() : null,
        },
        create: {
          studentId,
          attendanceRate,
          assignmentRate,
          capstoneScore,
          totalPercentage,
          isComplete: totalPercentage >= 100,
          completedAt: totalPercentage >= 100 ? new Date() : null,
        },
      });
    }

    return NextResponse.json({ success: true, data: submission });
  } catch (error: any) {
    console.error("Grade assignment error:", error);
    return NextResponse.json({ success: false, error: { message: error?.message } }, { status: 500 });
  }
}
