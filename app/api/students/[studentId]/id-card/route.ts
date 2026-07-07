import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { generateQRCode } from "@/lib/qr";

/**
 * Student ID Card Generator
 * 
 * Generates a compact PDF identity card (credit-card size) containing:
 * - Student name, enrollment number, course, and organization
 * - QR code linking to the public profile page
 * - Total credentials count
 * 
 * GET /api/students/[studentId]/id-card
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { name: true } },
        organization: { select: { name: true } },
        course: { select: { title: true } },
        certificates: {
          where: { status: "ISSUED" },
          select: { id: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const profileUrl = `${appUrl}/profile/${student.enrollmentNumber}`;

    // Generate QR code pointing to public profile
    const qrDataUrl = await generateQRCode(profileUrl);

    // Create credit-card sized PDF (3.375" x 2.125" at 72 DPI = ~243 x 153 points)
    const cardWidth = 500;
    const cardHeight = 300;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([cardWidth, cardHeight]);

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Background
    page.drawRectangle({
      x: 0, y: 0, width: cardWidth, height: cardHeight,
      color: rgb(0.06, 0.09, 0.16),
    });

    // Top accent bar
    page.drawRectangle({
      x: 0, y: cardHeight - 6, width: cardWidth, height: 6,
      color: rgb(0.96, 0.62, 0.04),
    });

    // Left accent strip
    page.drawRectangle({
      x: 0, y: 0, width: 6, height: cardHeight,
      color: rgb(0.15, 0.65, 0.92),
    });

    // Organization name
    page.drawText(student.organization.name.toUpperCase(), {
      x: 25, y: cardHeight - 35,
      size: 10, font: helveticaBold,
      color: rgb(0.50, 0.55, 0.65),
    });

    // "STUDENT IDENTITY CARD" label
    page.drawText("STUDENT IDENTITY CARD", {
      x: 25, y: cardHeight - 55,
      size: 8, font: helveticaBold,
      color: rgb(0.15, 0.65, 0.92),
    });

    // Divider
    page.drawLine({
      start: { x: 25, y: cardHeight - 65 },
      end: { x: cardWidth - 130, y: cardHeight - 65 },
      color: rgb(0.20, 0.25, 0.35),
      thickness: 1,
    });

    // Student name
    page.drawText(student.user.name, {
      x: 25, y: cardHeight - 100,
      size: 20, font: helveticaBold,
      color: rgb(0.96, 0.62, 0.04),
    });

    // Enrollment number
    page.drawText(`ID: ${student.enrollmentNumber}`, {
      x: 25, y: cardHeight - 125,
      size: 11, font: helvetica,
      color: rgb(0.70, 0.72, 0.78),
    });

    // Course title
    page.drawText(student.course.title, {
      x: 25, y: cardHeight - 150,
      size: 10, font: helveticaBold,
      color: rgb(0.88, 0.90, 0.95),
    });

    // Credentials count
    page.drawText(`${student.certificates.length} Verified Credential${student.certificates.length !== 1 ? "s" : ""}`, {
      x: 25, y: 50,
      size: 9, font: helveticaBold,
      color: rgb(0.20, 0.83, 0.60),
    });

    // Platform branding
    page.drawText("KODE TO CAREER", {
      x: 25, y: 25,
      size: 8, font: helveticaBold,
      color: rgb(0.15, 0.65, 0.92),
    });

    page.drawText("Scan QR to verify →", {
      x: 25, y: 12,
      size: 7, font: helvetica,
      color: rgb(0.40, 0.45, 0.55),
    });

    // QR Code (right side)
    const qrBase64 = qrDataUrl.split(",")[1];
    const qrBytes = Buffer.from(qrBase64, "base64");
    const qrImage = await pdfDoc.embedPng(qrBytes);

    page.drawImage(qrImage, {
      x: cardWidth - 120,
      y: cardHeight / 2 - 50,
      width: 100,
      height: 100,
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${student.enrollmentNumber}-id-card.pdf"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Student ID card generation error:", error);
    return NextResponse.json({ error: "Failed to generate ID card" }, { status: 500 });
  }
}
