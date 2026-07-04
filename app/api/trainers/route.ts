import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
      designation,
      bio,
      skills,
      yearsOfExperience,
      linkedinUrl,
      githubUrl,
      website,
      organizationId,
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Name, email, and password are required" } },
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

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create inside a transaction
    const newTrainer = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "TRAINER",
          organizationId: resolvedOrgId,
        },
      });

      const trainer = await tx.trainer.create({
        data: {
          userId: user.id,
          designation: designation || null,
          bio: bio || null,
          skills: skills ? skills.split(",").map((s: string) => s.trim()) : [],
          yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
          linkedinUrl: linkedinUrl || null,
          githubUrl: githubUrl || null,
          website: website || null,
          organizationId: resolvedOrgId,
        },
      });

      // Log Audit Trail
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "CREATE",
          table: "Trainer",
          recordId: trainer.id,
          metadata: { trainerEmail: email, trainerName: name },
        },
      });

      return trainer;
    });

    return NextResponse.json({ success: true, data: { trainer: newTrainer } }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/trainers] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to create trainer" } },
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
        { success: false, error: { code: "VALIDATION_ERROR", message: "Trainer ID is required" } },
        { status: 400 }
      );
    }

    const trainer = await prisma.trainer.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!trainer) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Trainer not found" } },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete verification logs linked to trainer's certificates
      await tx.verificationLog.deleteMany({
        where: { certificate: { trainerId: id } },
      });
      // 2. Delete email logs linked to trainer's certificates
      await tx.emailLog.deleteMany({
        where: { certificate: { trainerId: id } },
      });
      // 3. Delete certificates linked to trainer
      await tx.certificate.deleteMany({
        where: { trainerId: id },
      });
      // 4. Delete batches linked to trainer
      await tx.certificateBatch.deleteMany({
        where: { trainerId: id },
      });
      // 5. Delete students linked to courses of this trainer (disconnect/cascade if needed, or nullify/restrict)
      // Actually we disconnect students from this trainer's course or delete students enrolled in trainer's courses
      await tx.student.deleteMany({
        where: { course: { trainerId: id } },
      });
      // 6. Delete courses linked to trainer
      await tx.course.deleteMany({
        where: { trainerId: id },
      });
      // 7. Delete trainer profile
      await tx.trainer.delete({
        where: { id },
      });
      // 8. Delete user record
      await tx.user.delete({
        where: { id: trainer.userId },
      });
      // 9. Log admin action
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "DELETE",
          table: "Trainer",
          recordId: trainer.userId as any,
          metadata: { trainerName: trainer.user.name, trainerEmail: trainer.user.email },
        },
      });
    });

    return NextResponse.json({ success: true, message: "Trainer and associated data deleted successfully" });
  } catch (error: any) {
    console.error("[DELETE /api/trainers] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to delete trainer" } },
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
    const {
      id,
      name,
      email,
      designation,
      bio,
      skills,
      yearsOfExperience,
      linkedinUrl,
      githubUrl,
      website,
    } = body;

    if (!id || !name || !email) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Trainer ID, name, and email are required" } },
        { status: 400 }
      );
    }

    const trainer = await prisma.trainer.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!trainer) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Trainer not found" } },
        { status: 404 }
      );
    }

    const emailConflict = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: trainer.userId },
      },
    });
    if (emailConflict) {
      return NextResponse.json(
        { success: false, error: { code: "CONFLICT", message: "Email is already taken by another account" } },
        { status: 409 }
      );
    }

    const updatedTrainer = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: trainer.userId },
        data: { name, email },
      });

      const t = await tx.trainer.update({
        where: { id },
        data: {
          designation: designation || null,
          bio: bio || null,
          skills: skills ? skills.split(",").map((s: string) => s.trim()) : [],
          yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
          linkedinUrl: linkedinUrl || null,
          githubUrl: githubUrl || null,
          website: website || null,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "UPDATE",
          table: "Trainer",
          recordId: id,
          metadata: { trainerEmail: email, trainerName: name },
        },
      });

      return t;
    });

    return NextResponse.json({ success: true, data: { trainer: updatedTrainer } });
  } catch (error: any) {
    console.error("[PUT /api/trainers] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to update trainer" } },
      { status: 500 }
    );
  }
}


