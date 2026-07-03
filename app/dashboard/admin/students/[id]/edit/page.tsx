import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import EditStudentForm from "@/components/dashboard/EditStudentForm";

interface Params {
  id: string;
}

export default async function AdminEditStudentPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const resolvedParams = await params;
  const student = await prisma.student.findUnique({
    where: { id: resolvedParams.id },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  if (!student) {
    notFound();
  }

  const courses = await prisma.course.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return <EditStudentForm student={student} courses={courses} />;
}
