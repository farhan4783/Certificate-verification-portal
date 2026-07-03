import { PrismaClient, UserRole, CertificateStatus, CourseStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";
import { generateQRCode } from "../lib/qr";
import { generateCertificatePDF } from "../lib/pdf";
import { uploadToCloudinary } from "../lib/cloudinary";
import crypto from "crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clear existing data (order matters due to FK constraints)
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
  console.log("Cleared existing data.");


  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: "Kode To Career",
      logo: "https://res.cloudinary.com/demo/image/upload/v1620000000/ktc-logo.png",
      website: "https://kodetocareer.com",
      email: "info@kodetocareer.com",
      phone: "+1234567890",
      address: "123 Tech Avenue, Silicon Valley",
    },
  });
  console.log(`Created Organization: ${org.name} (${org.id})`);

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash("admin1234", 12);
  const trainerPasswordHash = await bcrypt.hash("trainer1234", 12);
  const studentPasswordHash = await bcrypt.hash("student1234", 12);

  // 2. Create Super Admin User
  const adminUser = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@kodetocareer.com",
      password: adminPasswordHash,
      role: UserRole.SUPER_ADMIN,
      organizationId: org.id,
    },
  });
  console.log(`Created Admin User: ${adminUser.email}`);

  // 3. Create Trainer User & Profile
  const trainerUser = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "trainer@kodetocareer.com",
      password: trainerPasswordHash,
      role: UserRole.TRAINER,
      organizationId: org.id,
    },
  });

  const trainer = await prisma.trainer.create({
    data: {
      userId: trainerUser.id,
      designation: "Lead Web Development Instructor",
      bio: "Industry expert with 10+ years of experience in Full Stack development.",
      photo: "https://res.cloudinary.com/demo/image/upload/v1620000000/trainer-photo.png",
      signature: "https://res.cloudinary.com/demo/image/upload/v1620000000/trainer-signature.png",
      skills: ["JavaScript", "React", "Node.js", "PostgreSQL", "TypeScript"],
      yearsOfExperience: 10,
      linkedinUrl: "https://linkedin.com/in/johndoe",
      githubUrl: "https://github.com/johndoe",
      organizationId: org.id,
    },
  });
  console.log(`Created Trainer: ${trainerUser.name} (${trainer.id})`);

  // 4. Create Certificate Template
  const template = await prisma.certificateTemplate.create({
    data: {
      name: "Default Landscape Certificate Template",
      backgroundImage: "https://res.cloudinary.com/demo/image/upload/v1620000000/certificate-bg.png",
      orientation: "landscape",
      font: "Inter",
      version: 1,
      active: true,
      organizationId: org.id,
    },
  });
  console.log(`Created Template: ${template.name} (${template.id})`);

  // 5. Create Course
  const course = await prisma.course.create({
    data: {
      title: "Full Stack Web Development Bootcamp",
      duration: "12 Weeks",
      description: "An intensive coding bootcamp covering HTML, CSS, JavaScript, React, Node.js, and PostgreSQL.",
      trainerId: trainer.id,
      templateId: template.id,
      status: CourseStatus.ACTIVE,
      organizationId: org.id,
    },
  });
  console.log(`Created Course: ${course.title} (${course.id})`);

  // 6. Create Student User & Profile (Jane Smith)
  const studentUser = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "student@kodetocareer.com",
      password: studentPasswordHash,
      role: UserRole.STUDENT,
      organizationId: org.id,
    },
  });

  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      enrollmentNumber: "KTC-2026-0001",
      courseId: course.id,
      photo: "https://res.cloudinary.com/demo/image/upload/v1620000000/student-photo.png",
      organizationId: org.id,
      trainer: { connect: { id: trainer.id } },
    },
  });
  console.log(`Created Student: ${studentUser.name} (${student.id})`);

  // Create a second student (Bob Johnson) who has no certificate yet
  const studentUser2 = await prisma.user.create({
    data: {
      name: "Bob Johnson",
      email: "bob@kodetocareer.com",
      password: studentPasswordHash,
      role: UserRole.STUDENT,
      organizationId: org.id,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      userId: studentUser2.id,
      enrollmentNumber: "KTC-2026-0002",
      courseId: course.id,
      photo: "https://res.cloudinary.com/demo/image/upload/v1620000000/student-photo.png",
      organizationId: org.id,
      trainer: { connect: { id: trainer.id } },
    },
  });
  console.log(`Created Second Student: ${studentUser2.name} (${student2.id})`);

  // 7. Create Certificate Batch
  const batch = await prisma.certificateBatch.create({
    data: {
      trainerId: trainer.id,
      courseId: course.id,
      batchName: "Full Stack Cohort 2026-A",
      totalCertificates: 2,
    },
  });
  console.log(`Created Batch: ${batch.batchName} (${batch.id})`);

  // 8. Create Sample Certificate
  console.log("Generating assets for Sample Certificate KTC-BOOTCAMP-2026-0001...");
  const verificationUrl = `http://localhost:3000/verify/KTC-BOOTCAMP-2026-0001`;
  const qrCodeDataUrl = await generateQRCode(verificationUrl);

  const formattedIssueDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const pdfBuffer = await generateCertificatePDF({
    studentName: "Jane Smith",
    courseTitle: course.title,
    trainerName: "John Doe",
    trainerDesignation: trainer.designation || undefined,
    trainerSignatureUrl: trainer.signature || undefined,
    orgLogoUrl: org.logo || undefined,
    issueDate: formattedIssueDate,
    certificateId: "KTC-BOOTCAMP-2026-0001",
    qrCodeDataUrl,
    verificationUrl,
  });

  const pdfHash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");
  const pdfBase64 = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
  
  const pdfUpload = await uploadToCloudinary(pdfBase64, "certificates_pdf");
  const qrUpload = await uploadToCloudinary(qrCodeDataUrl, "certificates_qr");

  if (!pdfUpload || !qrUpload) {
    throw new Error("Failed to generate and upload seed certificate assets");
  }

  const certificate = await prisma.certificate.create({
    data: {
      certificateId: "KTC-BOOTCAMP-2026-0001",
      studentId: student.id,
      trainerId: trainer.id,
      courseId: course.id,
      templateId: template.id,
      batchId: batch.id,
      issueDate: new Date(),
      verificationToken: "ktcv_token_demo_9876543210_xyz",
      status: CertificateStatus.ISSUED,
      pdfUrl: pdfUpload.url,
      pdfHash,
      qrCode: qrUpload.url,
    },
  });
  console.log(`Created Sample Certificate: ${certificate.certificateId}`);

  // 9. Add a Student Project
  const project = await prisma.project.create({
    data: {
      studentId: student.id,
      title: "FinSync AI - FinTech Dashboard",
      description: "A professional FinTech dashboard built using Next.js, React, Tailwind CSS, and Gemini API.",
      techStack: ["Next.js", "React", "Tailwind CSS", "Gemini API", "PostgreSQL"],
      githubUrl: "https://github.com/janesmith/finsync-ai",
      projectUrl: "https://finsync-ai.vercel.app",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1620000000/project-thumbnail.png",
      isFeatured: true,
    },
  });
  console.log(`Created Student Project: ${project.title}`);

  // 10. Add a Student Achievement
  const achievement = await prisma.achievement.create({
    data: {
      studentId: student.id,
      title: "Top Bootcamp Performer",
      description: "Awarded for outstanding performance, code quality, and active community participation.",
      issuer: "Kode To Career",
      achievementDate: new Date(),
      type: "AWARD",
      credentialUrl: "https://kodetocareer.com/awards/2026-top-performer",
      isFeatured: true,
    },
  });
  console.log(`Created Student Achievement: ${achievement.title}`);

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
