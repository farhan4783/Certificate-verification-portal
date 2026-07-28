import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { issueCertificate } from "@/services/certificate.service";

/**
 * POST /api/certificates/auto-generate
 * 
 * Auto-generates a certificate when a student's progress reaches 100%.
 * Can be called by the system (after attendance/submission updates) or manually by admin.
 * 
 * Body: { studentId: string } 
 *   OR no body — in which case it scans ALL students for 100% completion without existing certs.
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "TRAINER")) {
      return NextResponse.json(
        { success: false, error: { message: "Forbidden" } },
        { status: 403 }
      );
    }

    let body: { studentId?: string } = {};
    try {
      body = await request.json();
    } catch {
      // No body means scan all eligible students
    }

    const results: Array<{ studentId: string; studentName: string; status: string; certificateId?: string }> = [];

    if (body.studentId) {
      // Auto-generate for a specific student
      const result = await autoGenerateForStudent(body.studentId);
      results.push(result);
    } else {
      // Scan all students with isComplete = true but no ISSUED certificate
      const eligibleStudents = await prisma.studentProgress.findMany({
        where: { isComplete: true },
        include: {
          student: {
            include: {
              user: { select: { name: true } },
              certificates: { where: { status: "ISSUED" } },
              course: { select: { id: true, trainerId: true } },
              batch: { select: { id: true } },
            },
          },
        },
      });

      for (const progress of eligibleStudents) {
        // Skip if already has an issued certificate for this course
        const hasIssuedCert = progress.student.certificates.some(
          (c) => c.courseId === progress.student.courseId
        );

        if (!hasIssuedCert) {
          const result = await autoGenerateForStudent(progress.studentId);
          results.push(result);
        } else {
          results.push({
            studentId: progress.studentId,
            studentName: progress.student.user.name,
            status: "ALREADY_ISSUED",
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalProcessed: results.length,
        issued: results.filter((r) => r.status === "ISSUED").length,
        skipped: results.filter((r) => r.status !== "ISSUED").length,
        results,
      },
    });
  } catch (error: any) {
    console.error("Auto-generate certificate error:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Auto-generation failed" } },
      { status: 500 }
    );
  }
}

async function autoGenerateForStudent(studentId: string) {
  try {
    // Check progress
    const progress = await prisma.studentProgress.findUnique({
      where: { studentId },
    });

    if (!progress || !progress.isComplete) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { user: { select: { name: true } } },
      });
      return {
        studentId,
        studentName: student?.user.name || "Unknown",
        status: "NOT_COMPLETE",
      };
    }

    // Check if already issued
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { name: true } },
        course: { select: { id: true, trainerId: true } },
        batch: { select: { id: true } },
        certificates: { where: { status: "ISSUED" } },
      },
    });

    if (!student) {
      return { studentId, studentName: "Unknown", status: "STUDENT_NOT_FOUND" };
    }

    // Already has a certificate for this course
    const existingCert = student.certificates.find((c) => c.courseId === student.courseId);
    if (existingCert) {
      return {
        studentId,
        studentName: student.user.name,
        status: "ALREADY_ISSUED",
        certificateId: existingCert.certificateId,
      };
    }

    // Issue certificate
    const cert = await issueCertificate({
      studentId: student.id,
      courseId: student.course.id,
      trainerId: student.course.trainerId,
      batchId: student.batch?.id,
      grade: getGrade(progress.totalPercentage),
    });

    // Mark student completion date
    await prisma.student.update({
      where: { id: studentId },
      data: { completionDate: new Date() },
    });

    return {
      studentId,
      studentName: student.user.name,
      status: "ISSUED",
      certificateId: cert.certificateId,
    };
  } catch (error: any) {
    console.error(`Auto-generate failed for student ${studentId}:`, error);
    return {
      studentId,
      studentName: "Error",
      status: `ERROR: ${error.message}`,
    };
  }
}

function getGrade(totalPercentage: number): string {
  if (totalPercentage >= 90) return "A+";
  if (totalPercentage >= 80) return "A";
  if (totalPercentage >= 70) return "B+";
  if (totalPercentage >= 60) return "B";
  if (totalPercentage >= 50) return "C";
  return "D";
}
