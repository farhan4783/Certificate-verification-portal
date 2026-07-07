import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limiter";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["SUPER_ADMIN", "ORG_ADMIN", "TRAINER", "STUDENT"]),
  organizationId: z.string().uuid().optional(),
  // Student fields
  enrollmentNumber: z.string().optional(),
  courseId: z.string().uuid().optional(),
  // Trainer fields
  designation: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = await checkRateLimit(`register:${ipAddress}`, 5, 900);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOO_MANY_REQUESTS",
            message: "Too many registration attempts. Please try again in 15 minutes.",
          },
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: result.error.flatten().fieldErrors,
          },
        },
        { status: 422 }
      );
    }

    const {
      name,
      email,
      password,
      role,
      organizationId,
      enrollmentNumber,
      courseId,
      designation,
    } = result.data;

    // Check session for authorization
    const session = await getSession();

    // Authorization Guard:
    // 1. Only Super Admins can register other Admins or Trainers.
    // 2. Public register is ONLY allowed for STUDENT (or if no users exist in system).
    const isCreatingAdminOrTrainer = role === "SUPER_ADMIN" || role === "ORG_ADMIN" || role === "TRAINER";
    
    if (isCreatingAdminOrTrainer) {
      if (!session || session.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Only Super Admins can register admins or trainers",
            },
          },
          { status: 403 }
        );
      }
    }

    // Check if email already in use
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: "Email address is already registered",
          },
        },
        { status: 409 }
      );
    }

    // Determine target organization ID
    let targetOrgId = organizationId;
    if (!targetOrgId) {
      // Find the first organization in the database as default
      const defaultOrg = await prisma.organization.findFirst();
      if (!defaultOrg) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INTERNAL_SERVER_ERROR",
              message: "No default organization exists. Run database seeding.",
            },
          },
          { status: 500 }
        );
      }
      targetOrgId = defaultOrg.id;
    }

    // Additional validations based on roles
    if (role === "STUDENT") {
      if (!enrollmentNumber) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Student enrollment number is required",
              details: { enrollmentNumber: ["Enrollment number is required"] },
            },
          },
          { status: 422 }
        );
      }
      if (!courseId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Student course assignment is required",
              details: { courseId: ["Course ID is required"] },
            },
          },
          { status: 422 }
        );
      }

      // Check if enrollment number is unique
      const existingStudent = await prisma.student.findUnique({
        where: { enrollmentNumber },
      });
      if (existingStudent) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "CONFLICT",
              message: "Enrollment number is already in use",
            },
          },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and associated profile in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          organizationId: targetOrgId!,
        },
      });

      if (role === "TRAINER") {
        await tx.trainer.create({
          data: {
            userId: user.id,
            designation: designation || null,
            organizationId: targetOrgId!,
          },
        });
      } else if (role === "STUDENT") {
        await tx.student.create({
          data: {
            userId: user.id,
            enrollmentNumber: enrollmentNumber!,
            courseId: courseId!,
            organizationId: targetOrgId!,
          },
        });
      }

      return user;
    });

    // Write Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: session?.id || null, // null if public registration
          action: "CREATE",
          table: "User",
          recordId: newUser.id,
          metadata: { createdRole: role, email: newUser.email },
        },
      });
    } catch (auditError) {
      console.error("Failed to write audit log:", auditError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            organizationId: newUser.organizationId,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
