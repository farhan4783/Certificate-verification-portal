import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CreateStudentForm from "@/components/dashboard/CreateStudentForm";

export default async function AdminCreateStudentPage() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const courses = await prisma.course.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return <CreateStudentForm courses={courses} />;
}
