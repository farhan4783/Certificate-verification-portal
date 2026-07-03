import { PrismaClient, UserRole, CertificateStatus, CourseStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

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
  const passwordHash = await bcrypt.hash("Password@123", 12);

  // 2. Create Super Admin User
  const adminUser = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@kodetocareer.com",
      password: passwordHash,
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
      password: passwordHash,
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
      organizationId: org.id,
    },
  });
  console.log(`Created Trainer: ${trainerUser.name} (${trainer.id})`);

  // 4. Create Course
  const course = await prisma.course.create({
    data: {
      title: "Full Stack Web Development Bootcamp",
      duration: "12 Weeks",
      description: "An intensive coding bootcamp covering HTML, CSS, JavaScript, React, Node.js, and PostgreSQL.",
      trainerId: trainer.id,
      status: CourseStatus.ACTIVE,
      organizationId: org.id,
    },
  });
  console.log(`Created Course: ${course.title} (${course.id})`);

  // 5. Create Student User & Profile
  const studentUser = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "student@kodetocareer.com",
      password: passwordHash,
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
    },
  });
  console.log(`Created Student: ${studentUser.name} (${student.id})`);

  // 6. Create Certificate Template
  const template = await prisma.certificateTemplate.create({
    data: {
      name: "Default Landscape Certificate Template",
      backgroundImage: "https://res.cloudinary.com/demo/image/upload/v1620000000/certificate-bg.png",
      orientation: "landscape",
      font: "Inter",
      version: 1,
      active: true,
    },
  });
  console.log(`Created Template: ${template.name} (${template.id})`);

  // 7. Create Certificate Batch
  const batch = await prisma.certificateBatch.create({
    data: {
      trainerId: trainer.id,
      courseId: course.id,
      batchName: "Full Stack Cohort 2026-A",
      totalCertificates: 1,
    },
  });
  console.log(`Created Batch: ${batch.batchName} (${batch.id})`);

  // 8. Create Sample Certificate
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
      pdfUrl: "https://res.cloudinary.com/demo/image/upload/v1620000000/sample-certificate.pdf",
      pdfHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // SHA-256 for empty file as placeholder
      qrCode: "https://res.cloudinary.com/demo/image/upload/v1620000000/sample-qr.png",
    },
  });
  console.log(`Created Sample Certificate: ${certificate.certificateId}`);

  // 9. Add a Student Project
  const project = await prisma.project.create({
    data: {
      studentId: student.id,
      title: "FinSync AI - FinTech Dashboard",
      description: "A professional FinTech dashboard built using Next.js, React, Tailwind CSS, and Gemini API.",
      technologies: ["Next.js", "React", "Tailwind CSS", "Gemini API", "PostgreSQL"],
      githubUrl: "https://github.com/janesmith/finsync-ai",
      liveDemoUrl: "https://finsync-ai.vercel.app",
      completionDate: new Date(),
      thumbnail: "https://res.cloudinary.com/demo/image/upload/v1620000000/project-thumbnail.png",
      featured: true,
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
      date: new Date(),
      category: "Top Performer",
      badgeIcon: "award",
      supportingLink: "https://kodetocareer.com/awards/2026-top-performer",
      featured: true,
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
