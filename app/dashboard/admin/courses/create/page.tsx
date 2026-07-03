import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CreateCourseForm from "@/components/dashboard/CreateCourseForm";

export default async function AdminCreateCoursePage() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const trainers = await prisma.trainer.findMany({
    select: {
      id: true,
      user: { select: { name: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  const templates = await prisma.certificateTemplate.findMany({
    select: { id: true, name: true },
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return <CreateCourseForm trainers={trainers} templates={templates} />;
}
