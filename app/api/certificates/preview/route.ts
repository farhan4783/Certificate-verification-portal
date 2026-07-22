import { NextResponse } from "next/server";
import { generateCertificatePDF, CertificateLayoutConfig } from "@/lib/pdf";
import { generateQRCode } from "@/lib/qr";
import { signCertificatePayload } from "@/lib/crypto-sign";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentName = "Jane Doe",
      courseTitle = "Full Stack Web Development",
      trainerName = "Alex Rivera",
      trainerDesignation = "Lead Technical Instructor",
      orgName = "Kode To Career",
      orgLogoUrl,
      trainerSignatureUrl,
      issueDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      language = "en",
      presetStyle = "classic-gold",
      primaryColor,
      secondaryColor,
      accentColor,
      showWatermark = true,
      watermarkText,
      showMicrotextBorder = true,
    } = body;

    const dummyCertId = "KTC-PREVIEW-2026-0000";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/verify/${dummyCertId}`;

    const signedPayload = signCertificatePayload({
      certificateId: dummyCertId,
      studentName,
      courseTitle,
      issueDate: new Date().toISOString(),
    });

    const qrPayload = JSON.stringify({
      url: verificationUrl,
      sig: signedPayload,
      id: dummyCertId,
      name: studentName,
      course: courseTitle,
      issued: new Date().toISOString(),
    });

    const qrCodeDataUrl = await generateQRCode(qrPayload);

    const layoutConfig: CertificateLayoutConfig = {
      presetStyle,
      primaryColor,
      secondaryColor,
      accentColor,
      showWatermark,
      watermarkText,
      showMicrotextBorder,
    };

    const pdfBuffer = await generateCertificatePDF({
      studentName,
      courseTitle,
      trainerName,
      trainerDesignation,
      trainerSignatureUrl,
      orgLogoUrl,
      issueDate: String(issueDate),
      certificateId: dummyCertId,
      qrCodeDataUrl,
      verificationUrl,
      language,
      layoutConfig,
    });

    const pdfBase64 = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

    return NextResponse.json({
      success: true,
      pdfUrl: pdfBase64,
    });
  } catch (error: any) {
    console.error("Preview API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate certificate preview" },
      { status: 500 }
    );
  }
}
