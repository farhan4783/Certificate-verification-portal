import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { issueCertificate } from "@/services/certificate.service";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null) ?? await request.formData().then(async (fd) => ({
      studentId: fd.get("studentId")?.toString() ?? "",
      courseId: fd.get("courseId")?.toString() ?? "",
      grade: fd.get("grade")?.toString() ?? undefined,
    })).catch(() => null);

    if (!body || !body.studentId || !body.courseId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "studentId and courseId are required" } },
        { status: 400 }
      );
    }

    // Get trainer record for this session user
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
    } else if (session.role === "SUPER_ADMIN") {
      // Admin can specify trainerId; default to first trainer in course
      const course = await prisma.course.findUnique({
        where: { id: body.courseId },
        select: { trainerId: true },
      });
      if (!course?.trainerId) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "No trainer assigned to this course" } },
          { status: 404 }
        );
      }
      trainerId = course.trainerId;
    } else {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Not allowed" } },
        { status: 403 }
      );
    }

    const cert = await issueCertificate({
      studentId: body.studentId,
      courseId: body.courseId,
      trainerId,
      grade: body.grade,
    });

    return NextResponse.json({ success: true, data: { certificate: cert } }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/certificates/issue]", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message ?? "Certificate issuance failed" } },
      { status: 500 }
    );
  }
}
