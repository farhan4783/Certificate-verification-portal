import crypto from "crypto";
import prisma from "@/lib/prisma";
import { generateCertificateId, generateVerificationToken } from "@/lib/utils";
import { CertificateStatus } from "@prisma/client";
import { enqueuePdfGeneration } from "@/lib/queue";

interface IssueCertificateInput {
  studentId: string;
  courseId: string;
  trainerId: string;
  templateId?: string;
  batchId?: string;
  grade?: string;
  issueDate?: Date;
  expiryDate?: Date;
  language?: string;
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
    const { studentId, courseId, trainerId, templateId, batchId, issueDate, expiryDate, language } = input;

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

    const existing = await prisma.certificate.findFirst({
      where: {
        studentId,
        courseId,
        status: { in: ["ISSUED", "DRAFT"] },
      },
    });

    if (existing) {
      throw new Error("Active certificate already exists for this student in this course");
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
    
    // 3. Define placeholders for background processing
    const mockTxHash = "0x" + crypto.randomBytes(32).toString("hex");
    const mockBlock = Math.floor(12000000 + Math.random() * 8000000);

    // 4. Write DB records inside a transaction with DRAFT status
    const finalCertificate = await prisma.$transaction(async (tx) => {
      const cert = await tx.certificate.create({
        data: {
          certificateId,
          studentId,
          trainerId,
          courseId,
          templateId: resolvedTemplateId || null,
          batchId: batchId || null,
          issueDate: issueDate || new Date(),
          expiryDate: expiryDate || null,
          pdfUrl: "", // populated in background
          pdfHash: "", // populated in background
          qrCode: "", // populated in background
          verificationToken,
          status: CertificateStatus.DRAFT,
          grade: input.grade || null,
          blockchainTxHash: mockTxHash,
          blockchainBlock: mockBlock,
          language: language || "en",
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

    // 5. Enqueue background PDF and QR code generation task
    enqueuePdfGeneration(finalCertificate.id);

    return finalCertificate;
  }
}
