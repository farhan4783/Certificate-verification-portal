import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = await checkRateLimit(`cert-revoke:${ipAddress}`, 30, 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many revocation attempts. Please wait a minute." } },
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
    if (!body || !body.id) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Certificate ID is required" } },
        { status: 400 }
      );
    }

    const { id, reason } = body;

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

    // Trainers can only revoke their own certificates
    if (session.role === "TRAINER" && cert.trainer.user.email !== session.email) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Trainers can only revoke certificates they issued" } },
        { status: 403 }
      );
    }

    const updatedCert = await prisma.$transaction(async (tx) => {
      // 1. Update certificate status to REVOKED
      const updated = await tx.certificate.update({
        where: { id },
        data: { status: "REVOKED" },
      });

      // 2. Write Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "UPDATE",
          table: "Certificate",
          recordId: id,
          metadata: {
            certificateId: cert.certificateId,
            previousStatus: cert.status,
            newStatus: "REVOKED",
            reason: reason || "No reason specified",
          },
        },
      });

      return updated;
    });

    return NextResponse.json({ success: true, data: { certificate: updatedCert } });
  } catch (error: any) {
    console.error("[POST /api/certificates/revoke] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to revoke certificate" } },
      { status: 500 }
    );
  }
}
