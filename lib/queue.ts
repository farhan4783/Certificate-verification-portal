import { after } from "next/server";
import prisma from "./prisma";
import { generateCertificatePDF } from "./pdf";
import { generateQRCode } from "./qr";
import { uploadToCloudinary } from "./cloudinary";
import { signCertificatePayload } from "./crypto-sign";
import crypto from "crypto";
import logger from "./logger";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "certificates@kodetocareer.com";

// Asynchronous worker function for PDF generation
async function processPdfGeneration(certificateId: string) {
  try {
    logger.info(`Starting background PDF generation for certificate ID: ${certificateId}`);

    const cert = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        student: { include: { user: true, organization: true } },
        course: true,
        trainer: { include: { user: true } },
        template: true,
      },
    });

    if (!cert) {
      logger.error(`Certificate ${certificateId} not found in database for background processing.`);
      return;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/verify/${cert.certificateId}`;

    // 1. Generate QR Code containing the public verification link + offline signature
    const signedPayload = signCertificatePayload({
      certificateId: cert.certificateId,
      studentName: cert.student.user.name,
      courseTitle: cert.course.title,
      issueDate: cert.issueDate.toISOString(),
    });

    // QR code embeds: verification URL + Ed25519 signature for offline mode
    const qrPayload = JSON.stringify({
      url: verificationUrl,
      sig: signedPayload,
      id: cert.certificateId,
      name: cert.student.user.name,
      course: cert.course.title,
      issued: cert.issueDate.toISOString(),
    });
    const qrCodeDataUrl = await generateQRCode(qrPayload);
    let qrCodeUrl = "";
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        const qrUpload = await uploadToCloudinary(qrCodeDataUrl, "certificates_qr");
        if (qrUpload) {
          qrCodeUrl = qrUpload.url;
        }
      } catch (err) {
        logger.error(`Cloudinary QR upload failed, falling back:`, err);
      }
    }
    if (!qrCodeUrl) {
      qrCodeUrl = qrCodeDataUrl; // Inline data URL fallback
    }

    // 2. Generate A4 Landscape PDF buffer
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
      orgLogoUrl: cert.student.organization.logo || undefined,
      issueDate: formattedIssueDate,
      certificateId: cert.certificateId,
      qrCodeDataUrl,
      verificationUrl,
      language: cert.language,
    });

    // 3. Compute SHA-256 integrity hash
    const pdfHash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

    // 4. Upload PDF to Cloudinary (or fallback to local file)
    let pdfUrl = "";
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        const pdfBase64 = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
        const pdfUpload = await uploadToCloudinary(pdfBase64, "certificates_pdf");
        if (pdfUpload) {
          pdfUrl = pdfUpload.url;
        }
      } catch (err) {
        logger.error(`Cloudinary PDF upload failed, falling back:`, err);
      }
    }

    if (!pdfUrl) {
      // Local development mock fallback
      const fs = require("fs");
      const path = require("path");
      const localDir = path.join(process.cwd(), "public", "uploads", "certs");
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      const localPath = path.join(localDir, `${cert.certificateId}.pdf`);
      fs.writeFileSync(localPath, pdfBuffer);
      pdfUrl = `/uploads/certs/${cert.certificateId}.pdf`;
      logger.info(`Saved certificate PDF locally at: ${pdfUrl}`);
    }

    // 5. Update database status to ISSUED
    await prisma.certificate.update({
      where: { id: cert.id },
      data: {
        status: "ISSUED",
        pdfUrl,
        pdfHash,
        qrCode: qrCodeUrl,
      },
    });

    logger.info(`Successfully completed background PDF generation for: ${cert.certificateId}`);

    // 6. Enqueue email notification to student
    enqueueEmailDispatch(
      cert.student.user.email,
      `Your Certificate for ${cert.course.title} is ready!`,
      `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #0ea5e9;">Congratulations, ${cert.student.user.name}!</h2>
          <p>Your official certification for <strong>${cert.course.title}</strong> has been issued and verified.</p>
          <p><strong>Credential ID:</strong> ${cert.certificateId}</p>
          <p style="margin: 24px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #f59e0b; color: #0f172a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
               View Ledger Verification
            </a>
          </p>
          <p style="font-size: 11px; color: #64748b;">This certificate is secured by SHA-256 cryptographic hashing and anchored to the Polygon blockchain mainnet.</p>
        </div>
      `
    );
  } catch (err: any) {
    logger.error(`Error processing background PDF generation for certificate ${certificateId}:`, err);
  }
}

// Asynchronous worker function for Email dispatch
async function processEmailDispatch(to: string, subject: string, html: string) {
  try {
    logger.info(`Sending background email to: ${to} - Subject: ${subject}`);

    if (resend) {
      const emailRes = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });

      if (emailRes.error) {
        logger.error(`Resend dispatch returned error:`, emailRes.error);
      } else {
        logger.info(`Email successfully dispatched via Resend to ${to}. ID: ${emailRes.data?.id}`);
      }
    } else {
      logger.warn(`RESEND_API_KEY is missing. Mock email content would be:`);
      logger.info(`To: ${to}\nSubject: ${subject}\nHTML: ${html.substring(0, 200)}...`);
    }
  } catch (err: any) {
    logger.error(`Failed to send background email to ${to}:`, err);
  }
}

export function enqueuePdfGeneration(certificateId: string) {
  try {
    after(async () => {
      await processPdfGeneration(certificateId);
    });
    logger.info(`Enqueued background PDF generation job for certificate: ${certificateId}`);
  } catch (e) {
    // If called outside of request context (like inside seeding or testing), run immediately
    logger.info(`Enqueue called outside request context. Processing PDF generation synchronously.`);
    processPdfGeneration(certificateId);
  }
}

export function enqueueEmailDispatch(to: string, subject: string, html: string) {
  try {
    after(async () => {
      await processEmailDispatch(to, subject, html);
    });
    logger.info(`Enqueued background email job to: ${to}`);
  } catch (e) {
    // If called outside request context, run immediately
    logger.info(`Enqueue called outside request context. Dispatching email synchronously.`);
    processEmailDispatch(to, subject, html);
  }
}
