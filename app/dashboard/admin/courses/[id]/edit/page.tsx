import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import EditCourseForm from "@/components/dashboard/EditCourseForm";

interface Params {
  id: string;
}

export default async function AdminEditCoursePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const resolvedParams = await params;
  const course = await prisma.course.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!course) {
    notFound();
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

  return <EditCourseForm course={course} trainers={trainers} templates={templates} />;
}
