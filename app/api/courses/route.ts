import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admins only" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, code, subtitle, duration, description, trainerId, templateId } = body;

    if (!title || !trainerId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Course title and trainer are required" } },
        { status: 400 }
      );
    }

    // Verify trainer exists
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
    });
    if (!trainer) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Selected trainer not found" } },
        { status: 404 }
      );
    }

    const org = await prisma.organization.findFirst({ select: { id: true } });
    if (!org) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "No organization found. Please seed the DB." } },
        { status: 404 }
      );
    }

    const newCourse = await prisma.course.create({
      data: {
        title,
        code: code || null,
        subtitle: subtitle || null,
        duration: duration || null,
        description: description || null,
        trainerId,
        templateId: templateId || null,
        organizationId: org.id,
      },
    });

    // Log Audit Trail
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "CREATE",
        table: "Course",
        recordId: newCourse.id,
        metadata: { courseTitle: title, courseCode: code },
      },
    });

    return NextResponse.json({ success: true, data: { course: newCourse } }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/courses] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to create course" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admins only" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Course ID is required" } },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Course not found" } },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete verification logs linked to certificates of this course
      await tx.verificationLog.deleteMany({
        where: { certificate: { courseId: id } },
      });
      // 2. Delete email logs linked to certificates of this course
      await tx.emailLog.deleteMany({
        where: { certificate: { courseId: id } },
      });
      // 3. Delete certificates linked to course
      await tx.certificate.deleteMany({
        where: { courseId: id },
      });
      // 4. Delete batches linked to course
      await tx.certificateBatch.deleteMany({
        where: { courseId: id },
      });
      // 5. Delete students linked to course
      await tx.student.deleteMany({
        where: { courseId: id },
      });
      // 6. Delete course
      await tx.course.delete({
        where: { id },
      });
      // 7. Log admin action
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "DELETE",
          table: "Course",
          recordId: id as any,
          metadata: { courseTitle: course.title, courseCode: course.code },
        },
      });
    });

    return NextResponse.json({ success: true, message: "Course and associated data deleted successfully" });
  } catch (error: any) {
    console.error("[DELETE /api/courses] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to delete course" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admins only" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, title, code, subtitle, duration, description, trainerId, templateId } = body;

    if (!id || !title || !trainerId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Course ID, title, and trainer are required" } },
        { status: 400 }
      );
    }

    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
    });
    if (!trainer) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Selected trainer not found" } },
        { status: 404 }
      );
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title,
        code: code || null,
        subtitle: subtitle || null,
        duration: duration || null,
        description: description || null,
        trainerId,
        templateId: templateId || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "UPDATE",
        table: "Course",
        recordId: id,
        metadata: { courseTitle: title, courseCode: code },
      },
    });

    return NextResponse.json({ success: true, data: { course: updatedCourse } });
  } catch (error: any) {
    console.error("[PUT /api/courses] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to update course" } },
      { status: 500 }
    );
  }
}


