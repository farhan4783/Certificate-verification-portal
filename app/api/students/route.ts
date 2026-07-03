import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

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
    const {
      name,
      email,
      password,
      enrollmentNumber,
      courseId,
      organizationId,
    } = body;

    if (!name || !email || !password || !enrollmentNumber || !courseId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Name, email, password, enrollment number, and courseId are required" } },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: "CONFLICT", message: "User with this email already exists" } },
        { status: 409 }
      );
    }

    // Check if enrollment number already exists
    const existingStudent = await prisma.student.findUnique({ where: { enrollmentNumber } });
    if (existingStudent) {
      return NextResponse.json(
        { success: false, error: { code: "CONFLICT", message: "Student with this enrollment number already exists" } },
        { status: 409 }
      );
    }

    // Resolve Organization
    let resolvedOrgId = organizationId;
    if (!resolvedOrgId) {
      const org = await prisma.organization.findFirst({ select: { id: true } });
      if (!org) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "No organization found. Please seed the DB." } },
          { status: 404 }
        );
      }
      resolvedOrgId = org.id;
    }

    // Check Course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { trainerId: true },
    });
    if (!course) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Course not found" } },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create inside a transaction
    const newStudent = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "STUDENT",
          organizationId: resolvedOrgId,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          enrollmentNumber,
          courseId,
          organizationId: resolvedOrgId,
          trainer: { connect: { id: course.trainerId } }, // Auto-link student to the course instructor
        },
      });

      // Log Audit Trail
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "CREATE",
          table: "Student",
          recordId: student.id,
          metadata: { studentEmail: email, enrollmentNumber },
        },
      });

      return student;
    });

    return NextResponse.json({ success: true, data: { student: newStudent } }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/students] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to create student" } },
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
        { success: false, error: { code: "VALIDATION_ERROR", message: "Student ID is required" } },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Student not found" } },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete verification logs linked to student's certificates
      await tx.verificationLog.deleteMany({
        where: { certificate: { studentId: id } },
      });
      // 2. Delete email logs linked to student
      await tx.emailLog.deleteMany({
        where: { studentId: id },
      });
      // 3. Delete certificates linked to student
      await tx.certificate.deleteMany({
        where: { studentId: id },
      });
      // 4. Delete projects linked to student
      await tx.project.deleteMany({
        where: { studentId: id },
      });
      // 5. Delete achievements linked to student
      await tx.achievement.deleteMany({
        where: { studentId: id },
      });
      // 6. Delete student profile
      await tx.student.delete({
        where: { id },
      });
      // 7. Delete user record
      await tx.user.delete({
        where: { id: student.userId },
      });
      // 8. Log admin action
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "DELETE",
          table: "Student",
          recordId: student.userId as any,
          metadata: { studentName: student.user.name, studentEmail: student.user.email },
        },
      });
    });

    return NextResponse.json({ success: true, message: "Student and associated data deleted successfully" });
  } catch (error: any) {
    console.error("[DELETE /api/students] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to delete student" } },
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
    const { id, name, email, enrollmentNumber, courseId } = body;

    if (!id || !name || !email || !enrollmentNumber || !courseId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "All fields are required" } },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Student not found" } },
        { status: 404 }
      );
    }

    const emailConflict = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: student.userId },
      },
    });
    if (emailConflict) {
      return NextResponse.json(
        { success: false, error: { code: "CONFLICT", message: "Email is already taken by another account" } },
        { status: 409 }
      );
    }

    const enrollmentConflict = await prisma.student.findFirst({
      where: {
        enrollmentNumber,
        NOT: { id },
      },
    });
    if (enrollmentConflict) {
      return NextResponse.json(
        { success: false, error: { code: "CONFLICT", message: "Enrollment number is already taken" } },
        { status: 409 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { trainerId: true },
    });
    if (!course) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Selected course not found" } },
        { status: 404 }
      );
    }

    const updatedStudent = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: student.userId },
        data: { name, email },
      });

      const s = await tx.student.update({
        where: { id },
        data: {
          enrollmentNumber,
          courseId,
          trainer: {
            set: [{ id: course.trainerId }],
          },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "UPDATE",
          table: "Student",
          recordId: id,
          metadata: { studentEmail: email, enrollmentNumber },
        },
      });

      return s;
    });

    return NextResponse.json({ success: true, data: { student: updatedStudent } });
  } catch (error: any) {
    console.error("[PUT /api/students] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to update student" } },
      { status: 500 }
    );
  }
}


