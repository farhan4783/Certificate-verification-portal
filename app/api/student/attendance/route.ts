import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST: Student marks themselves present for today's session
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 422 });
    }

    const student = await prisma.student.findFirst({
      where: { user: { email: session.email } },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Verify session exists and belongs to student's batch
    const classSession = await prisma.classSession.findUnique({
      where: { id: sessionId },
    });

    if (!classSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (student.batchId !== classSession.batchId) {
      return NextResponse.json({ error: "Session does not belong to your batch" }, { status: 403 });
    }

    // Upsert attendance record
    const attendance = await prisma.studentAttendance.upsert({
      where: { studentId_sessionId: { studentId: student.id, sessionId } },
      update: { isPresent: true, checkedInAt: new Date() },
      create: { studentId: student.id, sessionId, isPresent: true, checkedInAt: new Date() },
    });

    // Recalculate progress
    const totalSessions = await prisma.classSession.count({
      where: { batchId: student.batchId!, isCompleted: true },
    });
    const attendedSessions = await prisma.studentAttendance.count({
      where: { studentId: student.id, isPresent: true },
    });

    const totalAssignments = await prisma.classSession.count({
      where: { batchId: student.batchId!, sessionType: "PROJECT_DAY", isCompleted: true },
    });
    const submittedAssignments = await prisma.assignmentSubmission.count({
      where: { studentId: student.id, status: { in: ["SUBMITTED", "GRADED", "UNDER_REVIEW"] } },
    });

    const gradedSubmissions = await prisma.assignmentSubmission.findMany({
      where: { studentId: student.id, status: "GRADED", score: { not: null } },
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
      where: { studentId: student.id },
      update: {
        attendanceRate,
        assignmentRate,
        capstoneScore,
        totalPercentage,
        totalSessionsAttended: attendedSessions,
        totalSessionsAvailable: totalSessions,
        totalAssignmentsSubmitted: submittedAssignments,
        totalAssignmentsAvailable: totalAssignments,
        isComplete: totalPercentage >= 100,
        completedAt: totalPercentage >= 100 ? new Date() : null,
      },
      create: {
        studentId: student.id,
        attendanceRate,
        assignmentRate,
        capstoneScore,
        totalPercentage,
        totalSessionsAttended: attendedSessions,
        totalSessionsAvailable: totalSessions,
        totalAssignmentsSubmitted: submittedAssignments,
        totalAssignmentsAvailable: totalAssignments,
        isComplete: totalPercentage >= 100,
        completedAt: totalPercentage >= 100 ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: { attendance, progress: { attendanceRate, assignmentRate, totalPercentage } },
    });
  } catch (error: any) {
    console.error("Attendance check-in error:", error);
    return NextResponse.json({ success: false, error: { message: error?.message } }, { status: 500 });
  }
}
