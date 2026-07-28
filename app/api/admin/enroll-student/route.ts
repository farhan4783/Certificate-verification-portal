import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const enrollSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  courseId: z.string().uuid("Invalid course ID"),
  batchId: z.string().uuid("Invalid batch ID").optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: { message: "Forbidden: Super Admin access required" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = enrollSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: "Validation failed", details: result.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }

    const { name, email, password, courseId, batchId } = result.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { message: "A user with this email already exists" } },
        { status: 409 }
      );
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { organization: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: { message: "Course not found" } },
        { status: 404 }
      );
    }

    // Generate enrollment number: KTC-2026-XXXX
    const year = new Date().getFullYear();
    const studentCount = await prisma.student.count();
    const enrollmentNumber = `KTC-${year}-${String(studentCount + 1).padStart(4, "0")}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User + Student + Progress in a transaction
    const newStudent = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          name,
          email: email.trim().toLowerCase(),
          password: hashedPassword,
          role: "STUDENT",
          organizationId: course.organizationId,
        },
      });

      // 2. Create Student profile
      const student = await tx.student.create({
        data: {
          userId: user.id,
          enrollmentNumber,
          courseId,
          batchId: batchId || null,
          organizationId: course.organizationId,
        },
      });

      // 3. Initialize StudentProgress tracker at 0%
      await tx.studentProgress.create({
        data: {
          studentId: student.id,
          attendanceRate: 0,
          assignmentRate: 0,
          capstoneScore: 0,
          totalPercentage: 0,
        },
      });

      return { user, student };
    });

    // Log audit
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.id,
          action: "CREATE",
          table: "Student",
          recordId: newStudent.student.id,
          metadata: { enrollmentNumber, courseId, batchId, email },
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Student enrolled successfully",
      data: {
        student: {
          id: newStudent.student.id,
          enrollmentNumber,
          name,
          email,
          courseId,
          batchId,
        },
        credentials: {
          email,
          password, // Return plaintext so admin can share with student (one-time)
        },
      },
    });
  } catch (error: any) {
    console.error("Enroll Student Error:", error);
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to enroll student" } },
      { status: 500 }
    );
  }
}
