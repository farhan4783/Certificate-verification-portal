import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CertificateService } from "@/services/certificate.service";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = await checkRateLimit(`cert-bulk-issue:${ipAddress}`, 30, 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many bulk issuance attempts. Please wait a minute." } },
        { status: 429 }
      );
    }

    const session = await getSession();

    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "TRAINER")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admins or Trainers only" } },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.courseId || !Array.isArray(body.students)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "courseId and students array are required" } },
        { status: 400 }
      );
    }

    const { courseId, language, students } = body;
    const lang = language || "en";

    // 1. Resolve trainerId
    let trainerId: string;
    if (session.role === "TRAINER") {
      const trainer = await prisma.trainer.findFirst({
        where: { user: { email: session.email } },
        select: { id: true },
      });
      if (!trainer) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Trainer profile not found" } },
          { status: 404 }
        );
      }
      trainerId = trainer.id;
    } else {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { trainerId: true },
      });
      if (!course?.trainerId) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "No trainer assigned to this course" } },
          { status: 404 }
        );
      }
      trainerId = course.trainerId;
    }

    // Create a new batch for this bulk issuance
    const batchName = `Bulk Batch - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    const batch = await prisma.certificateBatch.create({
      data: {
        trainerId,
        courseId,
        batchName,
        totalCertificates: 0,
      },
    });

    const results: Array<{ enrollmentNumber: string; success: boolean; error?: string; certificateId?: string }> = [];
    let successCount = 0;

    for (const studentInput of students) {
      const { enrollmentNumber, grade } = studentInput;
      if (!enrollmentNumber) {
        results.push({ enrollmentNumber: "UNKNOWN", success: false, error: "Missing enrollment number" });
        continue;
      }

      try {
        // Find the student profile by enrollment number
        const student = await prisma.student.findUnique({
          where: { enrollmentNumber },
          include: { user: { select: { name: true } } },
        });

        if (!student) {
          results.push({ enrollmentNumber, success: false, error: `Student with enrollment number ${enrollmentNumber} not found` });
          continue;
        }

        // Check if student is already issued a certificate for this course
        const existing = await prisma.certificate.findFirst({
          where: { studentId: student.id, courseId, status: { in: ["ISSUED", "GENERATED", "DRAFT"] } },
        });

        if (existing) {
          results.push({ enrollmentNumber, success: false, error: "Active certificate already exists for this student in this course" });
          continue;
        }

        // Issue certificate
        const cert = await CertificateService.issueCertificate({
          studentId: student.id,
          courseId,
          trainerId,
          grade: grade?.toString(),
          language: lang,
          batchId: batch.id,
        });

        results.push({ enrollmentNumber, success: true, certificateId: cert.certificateId });
        successCount++;
      } catch (err: any) {
        console.error(`Failed to issue bulk certificate for student ${enrollmentNumber}:`, err);
        results.push({ enrollmentNumber, success: false, error: err.message || "Internal generation error" });
      }
    }

    // Update batch count
    await prisma.certificateBatch.update({
      where: { id: batch.id },
      data: {
        totalCertificates: successCount,
        status: successCount > 0 ? "COMPLETED" : "CANCELLED",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        batchId: batch.id,
        batchName,
        successCount,
        totalCount: students.length,
        results,
      },
    });
  } catch (error: any) {
    console.error("[POST /api/certificates/bulk-issue] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to process bulk issuance" } },
      { status: 500 }
    );
  }
}
