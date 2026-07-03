import crypto from "crypto";
import prisma from "@/lib/prisma";
import { generateCertificateId, generateVerificationToken } from "@/lib/utils";
import { generateQRCode } from "@/lib/qr";
import { generateCertificatePDF } from "@/lib/pdf";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { sendEmail } from "@/lib/resend";
import { CertificateStatus, EmailStatus, AuditAction } from "@prisma/client";

interface IssueCertificateInput {
  studentId: string;
  courseId: string;
  trainerId: string;
  templateId?: string;
  batchId?: string;
  grade?: string;
  issueDate?: Date;
  expiryDate?: Date;
}

/** Standalone convenience wrapper around CertificateService.issueCertificate */
export async function issueCertificate(input: IssueCertificateInput) {
  return CertificateService.issueCertificate(input);
}

export class CertificateService {
  /**
   * Issues a single certificate. Generates PDF, embeds QR code, uploads to Cloudinary,
   * stores metadata in DB, and dispatches an email to the student.
   */
  static async issueCertificate(input: IssueCertificateInput) {
    const { studentId, courseId, trainerId, templateId, batchId, issueDate, expiryDate } = input;

    // 1. Fetch relations and details
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, organization: true },
    });

    if (!student) {
      throw new Error(`Student with ID ${studentId} not found`);
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new Error(`Course with ID ${courseId} not found`);
    }

    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
      include: { user: true },
    });

    if (!trainer) {
      throw new Error(`Trainer with ID ${trainerId} not found`);
    }

    // Auto-select template: prefer the one linked to the course, then org's first active template
    let resolvedTemplateId = templateId;
    if (!resolvedTemplateId && course.templateId) {
      resolvedTemplateId = course.templateId;
    }
    if (!resolvedTemplateId) {
      const firstTemplate = await prisma.certificateTemplate.findFirst({
        where: { organizationId: student.organizationId, status: "ACTIVE" },
        select: { id: true },
      });
      resolvedTemplateId = firstTemplate?.id;
    }
    const template = resolvedTemplateId
      ? await prisma.certificateTemplate.findUnique({ where: { id: resolvedTemplateId } })
      : null;

    // 2. Generate unique identifiers
    const certificateId = generateCertificateId(course.title);
    const verificationToken = generateVerificationToken();
    
    // 3. Define URLs
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/verify/${certificateId}`;

    // 4. Generate QR code (containing verification link)
    const qrCodeDataUrl = await generateQRCode(verificationUrl);

    // 5. Generate Landscape PDF Buffer
    const formattedIssueDate = (issueDate || new Date()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const pdfBuffer = await generateCertificatePDF({
      studentName: student.user.name,
      courseTitle: course.title,
      trainerName: trainer.user.name,
      trainerDesignation: trainer.designation || undefined,
      trainerSignatureUrl: trainer.signature || undefined,
      orgLogoUrl: student.organization.logo || undefined,
      issueDate: formattedIssueDate,
      certificateId,
      qrCodeDataUrl,
      verificationUrl,
    });

    // 6. Compute SHA-256 PDF hash for integrity checking
    const pdfHash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

    // 7. Upload PDF and QR code to Cloudinary (in base64 format)
    const pdfBase64 = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
    const pdfUpload = await uploadToCloudinary(pdfBase64, "certificates_pdf");
    
    const qrUpload = await uploadToCloudinary(qrCodeDataUrl, "certificates_qr");

    if (!pdfUpload || !qrUpload) {
      throw new Error("Failed to upload certificate assets to Cloudinary");
    }

    // 8. Write DB records inside a transaction
    const finalCertificate = await prisma.$transaction(async (tx) => {
      const cert = await tx.certificate.create({
        data: {
          certificateId,
          studentId,
          trainerId,
          courseId,
          templateId,
          batchId: batchId || null,
          issueDate: issueDate || new Date(),
          expiryDate: expiryDate || null,
          pdfUrl: pdfUpload.url,
          pdfHash,
          qrCode: qrUpload.url,
          verificationToken,
          status: CertificateStatus.ISSUED,
        },
      });

      // Write Audit Log
      await tx.auditLog.create({
        data: {
          userId: trainer.user.id,
          action: "GENERATE",
          table: "Certificate",
          recordId: cert.id,
          metadata: { certificateId, studentName: student.user.name },
        },
      });

      return cert;
    });

    // 9. Dispatch Email with Certificate details
    const emailSubject = `Your Certificate for ${course.title} is ready!`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #0b1e44; text-align: center;">Congratulations, ${student.user.name}!</h2>
        <p>You have successfully completed the course <strong>${course.title}</strong> at <strong>${student.organization.name}</strong>.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #d4af37; color: #0b1e44; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 4px; display: inline-block;">Verify Certificate</a>
        </div>

        <p>Your unique Certificate ID is: <code>${certificateId}</code></p>
        <p>You can view and download the PDF of your certificate here: <a href="${pdfUpload.url}">${pdfUpload.url}</a></p>
        
        <p style="margin-top: 30px; font-size: 12px; color: #888;">
          This is an automated message from Kode To Career. Every credential issued is secured and permanently verifiable.
        </p>
      </div>
    `;

    const emailSent = await sendEmail({
      to: student.user.email,
      subject: emailSubject,
      html: emailHtml,
    });

    // 10. Record Email Log
    try {
      await prisma.emailLog.create({
        data: {
          studentId,
          certificateId: finalCertificate.id,
          status: emailSent.success ? EmailStatus.SENT : EmailStatus.FAILED,
        },
      });

      if (emailSent.success) {
        await prisma.auditLog.create({
          data: {
            userId: trainer.user.id,
            action: "EMAIL",
            table: "Certificate",
            recordId: finalCertificate.id,
            metadata: { emailSentTo: student.user.email },
          },
        });
      }
    } catch (logError) {
      console.error("Failed to write email/audit log for email dispatch:", logError);
    }

    return finalCertificate;
  }
}
