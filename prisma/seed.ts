import { PrismaClient, UserRole, CertificateStatus, CourseStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { generateQRCode } from "../lib/qr";
import { generateCertificatePDF } from "../lib/pdf";
import { uploadToCloudinary } from "../lib/cloudinary";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getAppBaseUrl } from "../lib/utils";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const STUDENT_NAMES = [
  "Sumit Kumar",
  "Vivek",
  "Sahil Talmale",
  "Arshad Hussain",
  "Rijvan KHAN",
  "DIGAMBER SIG",
  "ABUNASAR",
  "AKSHAY",
  "SANSKR SONI",
  "AMAN SIGNH",
  "Manish Bhardhw",
  "khushal",
  "GUNGUN"
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, ".")
    .replace(/\.+/g, ".");
}

async function main() {
  console.log("🌱 Seeding database for Kode To Career...");

  // 0. Clear existing data (in dependency order)
  await prisma.web3Credential.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.project.deleteMany();
  await prisma.emailLog.deleteMany();
  await prisma.verificationLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.certificateBatch.deleteMany();
  await prisma.certificateTemplate.deleteMany();
  await prisma.student.deleteMany();
  await prisma.course.deleteMany();
  await prisma.trainer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  console.log("✓ Cleared existing database records.");

  // 1. Create Main Organization
  const org = await prisma.organization.create({
    data: {
      name: "Kode To Career",
      logo: "https://res.cloudinary.com/demo/image/upload/v1620000000/ktc-logo.png",
      website: "https://kodetocareer.com",
      email: "info@kodetocareer.com",
      phone: "+91 9876543210",
      address: "Kode To Career Tech Hub, India",
    },
  });
  console.log(`✓ Created Organization: ${org.name}`);

  // Default Passwords
  const adminPasswordHash = await bcrypt.hash("admin1234", 12);
  const trainerPasswordHash = await bcrypt.hash("trainer1234", 12);
  const studentPasswordHash = await bcrypt.hash("student1234", 12);

  // 2. Create Super Admin Account
  const adminUser = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@kodetocareer.com",
      password: adminPasswordHash,
      role: UserRole.SUPER_ADMIN,
      organizationId: org.id,
    },
  });
  console.log(`✓ Created Super Admin: ${adminUser.email} (Password: admin1234)`);

  // 3. Create Trainer - Md. Arbaaz
  const trainerUser = await prisma.user.create({
    data: {
      name: "Md. Arbaaz",
      email: "arbaaz@kodetocareer.com",
      password: trainerPasswordHash,
      role: UserRole.TRAINER,
      organizationId: org.id,
    },
  });

  const trainer = await prisma.trainer.create({
    data: {
      userId: trainerUser.id,
      designation: "Lead MERN Stack & AI Development Instructor",
      bio: "Senior Full Stack Engineer & AI Specialist leading the MERN Stack with AI Development Program at Kode To Career.",
      skills: ["MongoDB", "Express.js", "React", "Node.js", "Next.js", "Python", "Generative AI", "LangChain"],
      yearsOfExperience: 8,
      organizationId: org.id,
    },
  });
  console.log(`✓ Created Trainer: ${trainerUser.name} (${trainerUser.email})`);

  // 4. Create Certificate Template
  const template = await prisma.certificateTemplate.create({
    data: {
      name: "MERN Stack with AI Verified Certificate Template",
      orientation: "landscape",
      font: "Inter",
      version: 1,
      active: true,
      organizationId: org.id,
    },
  });

  // 5. Create Course - MERN Stack with AI Development
  const course = await prisma.course.create({
    data: {
      title: "MERN Stack with AI Development",
      code: "KTC-MERN-AI-2026",
      duration: "16 Weeks",
      description: "Comprehensive industry-grade program covering MongoDB, Express.js, React, Node.js, Next.js, OpenAI & Gemini AI Integrations.",
      trainerId: trainer.id,
      templateId: template.id,
      status: CourseStatus.ACTIVE,
      organizationId: org.id,
    },
  });
  console.log(`✓ Created Course: ${course.title}`);

  // 6. Create Batch
  const batch = await prisma.certificateBatch.create({
    data: {
      trainerId: trainer.id,
      courseId: course.id,
      batchName: "MERN AI Cohort 2026",
      totalCertificates: STUDENT_NAMES.length,
    },
  });

  // 7. Process & Issue Certificates for all 13 Students
  console.log(`\n🎓 Issuing verified certificates for ${STUDENT_NAMES.length} students...`);

  const publicCertDir = path.join(process.cwd(), "public", "generated-certificates");
  if (!fs.existsSync(publicCertDir)) {
    fs.mkdirSync(publicCertDir, { recursive: true });
  }

  const appUrl = getAppBaseUrl();

  for (let i = 0; i < STUDENT_NAMES.length; i++) {
    const rawName = STUDENT_NAMES[i];
    const emailSlug = slugify(rawName);
    const email = `${emailSlug}@kodetocareer.com`;
    const certNumStr = String(i + 1).padStart(4, "0");
    const certificateId = `KTC-MERN-2026-${certNumStr}`;
    const enrollmentNumber = `KTC-ENR-2026-${certNumStr}`;
    const token = `ktcv_token_${certificateId.toLowerCase()}_${crypto.randomBytes(4).toString("hex")}`;

    // Create Student User
    const studentUser = await prisma.user.create({
      data: {
        name: rawName,
        email,
        password: studentPasswordHash,
        role: UserRole.STUDENT,
        organizationId: org.id,
      },
    });

    // Create Student Profile
    const student = await prisma.student.create({
      data: {
        userId: studentUser.id,
        enrollmentNumber,
        courseId: course.id,
        batchId: batch.id,
        organizationId: org.id,
        trainer: { connect: { id: trainer.id } },
      },
    });

    // Generate Verification & QR Code
    const verificationUrl = `${appUrl}/verify/${certificateId}`;
    const qrCodeDataUrl = await generateQRCode(verificationUrl);

    const formattedIssueDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Render A4 Landscape PDF
    const pdfBuffer = await generateCertificatePDF({
      studentName: rawName,
      courseTitle: course.title,
      trainerName: trainerUser.name,
      trainerDesignation: trainer.designation || undefined,
      issueDate: formattedIssueDate,
      certificateId,
      qrCodeDataUrl,
      verificationUrl,
    });

    const pdfHash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");
    const pdfBase64 = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

    let pdfUrl = "";
    let qrUrl = "";

    // Upload to Cloudinary or save locally as fallback
    const pdfUpload = await uploadToCloudinary(pdfBase64, "certificates_pdf");
    const qrUpload = await uploadToCloudinary(qrCodeDataUrl, "certificates_qr");

    if (pdfUpload?.url) {
      pdfUrl = pdfUpload.url;
    } else {
      const pdfFileName = `${certificateId}.pdf`;
      const pdfFilePath = path.join(publicCertDir, pdfFileName);
      fs.writeFileSync(pdfFilePath, pdfBuffer);
      pdfUrl = `/generated-certificates/${pdfFileName}`;
    }

    if (qrUpload?.url) {
      qrUrl = qrUpload.url;
    } else {
      qrUrl = qrCodeDataUrl;
    }

    // Create Issued Certificate Record
    const cert = await prisma.certificate.create({
      data: {
        certificateId,
        studentId: student.id,
        trainerId: trainer.id,
        courseId: course.id,
        templateId: template.id,
        batchId: batch.id,
        issueDate: new Date(),
        verificationToken: token,
        grade: "A+",
        status: CertificateStatus.ISSUED,
        pdfUrl,
        pdfHash,
        qrCode: qrUrl,
        blockchainTxHash: `0x${crypto.randomBytes(32).toString("hex")}`,
        blockchainBlock: 12040000 + i * 42,
        language: "en",
      },
    });

    // Create Initial Audit Log
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: "GENERATE",
        table: "Certificate",
        recordId: cert.id,
        metadata: { certificateId, studentName: rawName },
      },
    });

    console.log(`  [${i + 1}/${STUDENT_NAMES.length}] ✓ Issued Cert ${certificateId} for ${rawName} (${email})`);
  }

  console.log("\n🎉 All 13 students successfully enrolled & certificates issued!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
