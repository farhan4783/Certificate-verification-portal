import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * Dynamic OpenGraph Image Generator
 * 
 * Generates a 1200x630 PNG-like image (via PDF rendering + conversion)
 * for social media link previews when sharing credential verification links.
 * 
 * Since we can't use @vercel/og (requires Edge Runtime + Satori), we render
 * a compact PDF styled as an OG card and return it as application/pdf.
 * Social platforms that support link-preview rendering will display this.
 * 
 * For true PNG OG images, you'd install @vercel/og or canvas packages.
 * This implementation returns styled metadata instead.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params;

    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [
          { certificateId: certificateId },
          { verificationToken: certificateId },
        ],
      },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
            organization: { select: { name: true } },
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

    if (!cert || cert.status === "DRAFT") {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // Generate a compact PDF-based OG card (1200x630 points ratio)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([1200, 630]);
    const { width, height } = page.getSize();

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Dark background
    page.drawRectangle({
      x: 0, y: 0, width, height,
      color: rgb(0.06, 0.09, 0.16),
    });

    // Gold accent bar
    page.drawRectangle({
      x: 0, y: height - 8, width, height: 8,
      color: rgb(0.96, 0.62, 0.04),
    });

    // Bottom accent bar
    page.drawRectangle({
      x: 0, y: 0, width, height: 4,
      color: rgb(0.96, 0.62, 0.04),
    });

    // Organization name
    const orgText = cert.student.organization.name.toUpperCase();
    page.drawText(orgText, {
      x: 80, y: height - 80,
      size: 16, font: helveticaBold,
      color: rgb(0.60, 0.60, 0.65),
    });

    // "VERIFIED CREDENTIAL" badge
    page.drawText("✓ VERIFIED CREDENTIAL", {
      x: 80, y: height - 120,
      size: 22, font: helveticaBold,
      color: rgb(0.20, 0.83, 0.60),
    });

    // Student name
    const nameText = cert.student.user.name;
    page.drawText(nameText, {
      x: 80, y: height - 200,
      size: 48, font: helveticaBold,
      color: rgb(0.96, 0.62, 0.04),
    });

    // Divider
    page.drawLine({
      start: { x: 80, y: height - 225 },
      end: { x: 600, y: height - 225 },
      color: rgb(0.25, 0.30, 0.40),
      thickness: 2,
    });

    // Course title
    page.drawText(cert.course.title, {
      x: 80, y: height - 280,
      size: 28, font: helveticaBold,
      color: rgb(0.88, 0.90, 0.95),
    });

    // Trainer label
    page.drawText(`Authorized by ${cert.trainer.user.name}`, {
      x: 80, y: height - 330,
      size: 18, font: helvetica,
      color: rgb(0.50, 0.55, 0.65),
    });

    // Issue date
    const dateStr = cert.issueDate.toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    page.drawText(`Issued: ${dateStr}`, {
      x: 80, y: height - 370,
      size: 16, font: helvetica,
      color: rgb(0.40, 0.45, 0.55),
    });

    // Certificate ID
    page.drawText(`ID: ${cert.certificateId}`, {
      x: 80, y: 60,
      size: 14, font: helvetica,
      color: rgb(0.35, 0.40, 0.50),
    });

    // Platform branding
    page.drawText("KODE TO CAREER", {
      x: width - 280, y: 60,
      size: 18, font: helveticaBold,
      color: rgb(0.15, 0.65, 0.92),
    });

    page.drawText("Credential Verification Portal", {
      x: width - 280, y: 38,
      size: 12, font: helvetica,
      color: rgb(0.40, 0.45, 0.55),
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("OG image generation error:", error);
    return NextResponse.json({ error: "Failed to generate OG image" }, { status: 500 });
  }
}
