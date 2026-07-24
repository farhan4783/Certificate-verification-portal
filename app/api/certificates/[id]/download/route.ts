import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateCertificatePDF } from "@/lib/pdf";
import { generateQRCode } from "@/lib/qr";
import { getAppBaseUrl } from "@/lib/utils";

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

    // Dynamically detect current protocol and host from request headers
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const appUrl = getAppBaseUrl(host);
    const verificationUrl = `${appUrl}/verify/${cert.certificateId}`;
    const qrCodeDataUrl = await generateQRCode(verificationUrl);

    const formattedIssueDate = cert.issueDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const pdfBuffer = await generateCertificatePDF({
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

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cert.certificateId}.pdf"`,
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    console.error("Certificate download error:", error);
    return NextResponse.json({ error: "Failed to download certificate" }, { status: 500 });
  }
}
