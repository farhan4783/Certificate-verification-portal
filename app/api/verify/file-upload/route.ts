import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(request: Request) {
  try {
    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = await checkRateLimit(`verify-file:${ipAddress}`, 20, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again shortly.",
        },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Compute SHA-256 Hash of uploaded file
    const calculatedHash = crypto.createHash("sha256").update(buffer).digest("hex");

    // Search Database for matching PDF Hash
    const cert = await prisma.certificate.findFirst({
      where: {
        pdfHash: calculatedHash,
      },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
            organization: { select: { name: true, logo: true } },
          },
        },
        course: { select: { title: true } },
        trainer: { include: { user: { select: { name: true } } } },
        web3Credential: true,
      },
    });

    if (!cert) {
      return NextResponse.json({
        success: true,
        verified: false,
        status: "TAMPERED_OR_UNREGISTERED",
        hash: calculatedHash,
        message: "The uploaded PDF checksum does not match any official credential record. The file may have been modified or tampered with.",
      });
    }

    return NextResponse.json({
      success: true,
      verified: cert.status === "ISSUED" || cert.status === "GENERATED",
      status: cert.status,
      hash: calculatedHash,
      certificate: {
        certificateId: cert.certificateId,
        studentName: cert.student.user.name,
        courseTitle: cert.course.title,
        trainerName: cert.trainer.user.name,
        organizationName: cert.student.organization.name,
        issueDate: cert.issueDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        status: cert.status,
        blockchainTxHash: cert.blockchainTxHash,
        blockchainBlock: cert.blockchainBlock,
        verifyUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/${cert.certificateId}`,
      },
    });
  } catch (error: any) {
    console.error("File Verification API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process PDF file verification" },
      { status: 500 }
    );
  }
}
