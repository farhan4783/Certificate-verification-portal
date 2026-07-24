import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateCertificatePDF } from "@/lib/pdf";
import { generateQRCode } from "@/lib/qr";
import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [
          { id: id },
          { certificateId: id },
          { verificationToken: id },
        ],
      },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
            organization: { select: { name: true, logo: true } },
          },
        },
        course: { select: { title: true } },
        trainer: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!cert) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    let pdfBuffer: Buffer | null = null;

    // 1. Try reading from local public folder if pdfUrl is relative
    if (cert.pdfUrl && cert.pdfUrl.startsWith("/generated-certificates/")) {
      const localPath = path.join(process.cwd(), "public", cert.pdfUrl);
      if (fs.existsSync(localPath)) {
        pdfBuffer = fs.readFileSync(localPath);
      }
    }

    // 2. Try fetching remote Cloudinary URL if available
    if (!pdfBuffer && cert.pdfUrl && cert.pdfUrl.startsWith("http")) {
      try {
        const res = await fetch(cert.pdfUrl);
        if (res.ok) {
          const arrayBuf = await res.arrayBuffer();
          pdfBuffer = Buffer.from(arrayBuf);
        }
      } catch (err) {
        console.warn("Failed to fetch remote PDF URL, falling back to on-the-fly rendering:", err);
      }
    }

    // 3. Fallback: On-the-fly rendering using generateCertificatePDF
    if (!pdfBuffer) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const verificationUrl = `${appUrl}/verify/${cert.certificateId}`;
      const qrCodeDataUrl = cert.qrCode || (await generateQRCode(verificationUrl));

      const formattedIssueDate = cert.issueDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      pdfBuffer = await generateCertificatePDF({
        studentName: cert.student.user.name,
        courseTitle: cert.course.title,
        trainerName: cert.trainer.user.name,
        trainerDesignation: cert.trainer.designation || undefined,
        trainerSignatureUrl: cert.trainer.signature || undefined,
        orgLogoUrl: cert.student.organization?.logo || undefined,
        issueDate: formattedIssueDate,
        certificateId: cert.certificateId,
        qrCodeDataUrl,
        verificationUrl,
      });
    }

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cert.certificateId}.pdf"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Certificate download error:", error);
    return NextResponse.json({ error: "Failed to download certificate" }, { status: 500 });
  }
}
