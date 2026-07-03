/*
  Warnings:

  - You are about to drop the column `badgeIcon` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `featured` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `supportingLink` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `completionDate` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `featured` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `liveDemoUrl` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `technologies` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `Project` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AchievementType" AS ENUM ('ACADEMIC', 'HACKATHON', 'COMPETITION', 'CERTIFICATION', 'OPEN_SOURCE', 'PUBLICATION', 'AWARD', 'OTHER');

-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_templateId_fkey";

-- AlterTable
ALTER TABLE "Achievement" DROP COLUMN "badgeIcon",
DROP COLUMN "category",
DROP COLUMN "date",
DROP COLUMN "featured",
DROP COLUMN "supportingLink",
ADD COLUMN     "achievementDate" TIMESTAMP(3),
ADD COLUMN     "credentialUrl" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "AchievementType" NOT NULL DEFAULT 'OTHER',
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "issuer" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "grade" TEXT,
ALTER COLUMN "templateId" DROP NOT NULL,
ALTER COLUMN "issueDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "CertificateBatch" ADD COLUMN     "status" "BatchStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "totalCertificates" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "CertificateTemplate" ADD COLUMN     "organizationId" UUID,
ADD COLUMN     "status" "TemplateStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "orientation" SET DEFAULT 'landscape';

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "code" TEXT,
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "templateId" UUID,
ALTER COLUMN "duration" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "completionDate",
DROP COLUMN "featured",
DROP COLUMN "liveDemoUrl",
DROP COLUMN "technologies",
DROP COLUMN "thumbnail",
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectUrl" TEXT,
ADD COLUMN     "techStack" TEXT[],
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "batchId" UUID,
ADD COLUMN     "completionDate" TIMESTAMP(3),
ADD COLUMN     "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "portfolioUrl" TEXT;

-- AlterTable
ALTER TABLE "Trainer" ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "website" TEXT,
ADD COLUMN     "yearsOfExperience" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT;

-- CreateTable
CREATE TABLE "_StudentTrainers" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_StudentTrainers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_StudentTrainers_B_index" ON "_StudentTrainers"("B");

-- CreateIndex
CREATE INDEX "CertificateTemplate_organizationId_idx" ON "CertificateTemplate"("organizationId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "CertificateBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CertificateTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateTemplate" ADD CONSTRAINT "CertificateTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CertificateTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentTrainers" ADD CONSTRAINT "_StudentTrainers_A_fkey" FOREIGN KEY ("A") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentTrainers" ADD CONSTRAINT "_StudentTrainers_B_fkey" FOREIGN KEY ("B") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
