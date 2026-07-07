import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function DELETE(request: NextRequest) {
  try {
    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = await checkRateLimit(`cert-delete:${ipAddress}`, 30, 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many delete attempts. Please wait a minute." } },
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Certificate ID is required" } },
        { status: 400 }
      );
    }

    const cert = await prisma.certificate.findUnique({
      where: { id },
      include: { trainer: { include: { user: true } } },
    });

    if (!cert) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Certificate not found" } },
        { status: 404 }
      );
    }

    // Trainers can only delete certificates they issued themselves
    if (session.role === "TRAINER") {
      if (cert.trainer.user.email !== session.email) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Trainers can only delete certificates they issued" } },
          { status: 403 }
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete verification logs linked to certificate
      await tx.verificationLog.deleteMany({
        where: { certificateId: id },
      });
      // 2. Delete email logs linked to certificate
      await tx.emailLog.deleteMany({
        where: { certificateId: id },
      });
      // 3. Delete certificate
      await tx.certificate.delete({
        where: { id },
      });
      // 4. Log admin action
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "DELETE",
          table: "Certificate",
          recordId: id as any,
          metadata: { certificateId: cert.certificateId },
        },
      });
    });

    return NextResponse.json({ success: true, message: "Certificate deleted successfully" });
  } catch (error: any) {
    console.error("[DELETE /api/certificates] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to delete certificate" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = await checkRateLimit(`cert-update:${ipAddress}`, 30, 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many update attempts. Please wait a minute." } },
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

    const body = await request.json();
    const { id, status, grade } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Certificate ID and Status are required" } },
        { status: 400 }
      );
    }

    const cert = await prisma.certificate.findUnique({
      where: { id },
      include: { trainer: { include: { user: { select: { email: true } } } } },
    });

    if (!cert) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Certificate not found" } },
        { status: 404 }
      );
    }

    if (session.role === "TRAINER" && cert.trainer.user.email !== session.email) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Trainers can only edit certificates they issued" } },
        { status: 403 }
      );
    }

    const updatedCert = await prisma.certificate.update({
      where: { id },
      data: {
        status,
        grade: grade !== undefined ? grade || null : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "UPDATE",
        table: "Certificate",
        recordId: id,
        metadata: { certificateId: cert.certificateId, newStatus: status },
      },
    });

    return NextResponse.json({ success: true, data: { certificate: updatedCert } });
  } catch (error: any) {
    console.error("[PUT /api/certificates] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to update certificate" } },
      { status: 500 }
    );
  }
}

