import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "@/components/dashboard/DeleteButton";

export default async function AdminCoursesPage() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const courses = await prisma.course.findMany({
    include: {
      trainer: { include: { user: { select: { name: true } } } },
      template: { select: { name: true } },
      _count: { select: { students: true } },
    },
    orderBy: { title: "asc" },
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Course Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            Create courses and assign them to trainers (instructors).
          </p>
        </div>
        <Link
          href="/dashboard/admin/courses/create"
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-sm rounded-lg transition-colors"
        >
          + Add Course
        </Link>
      </div>

      {/* Courses List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="px-6 py-4 text-left text-xs font-mono uppercase tracking-widest text-slate-500">
                  Course Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-mono uppercase tracking-widest text-slate-500">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-mono uppercase tracking-widest text-slate-500">
                  Trainer (Instructor)
                </th>
                <th className="px-6 py-4 text-left text-xs font-mono uppercase tracking-widest text-slate-500">
                  Template Design
                </th>
                <th className="px-6 py-4 text-left text-xs font-mono uppercase tracking-widest text-slate-500">
                  Students Enrolled
                </th>
                <th className="px-6 py-4 text-left text-xs font-mono uppercase tracking-widest text-slate-500">
                  Duration
                </th>
                <th className="px-6 py-4 text-right text-xs font-mono uppercase tracking-widest text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-sky-400">
                    {course.code || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-200">
                    {course.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {course.trainer.user.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {course.template?.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    <span className="bg-sky-500/10 text-sky-400 border border-sky-500/25 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      {course._count.students} students
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {course.duration || "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/admin/courses/${course.id}/edit`}
                        className="p-2 bg-slate-800 hover:bg-sky-500/10 border border-slate-700 hover:border-sky-500/30 text-slate-400 hover:text-sky-400 rounded-lg transition-all duration-150"
                        title="Edit"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </Link>
                      <DeleteButton
                        id={course.id}
                        endpoint="/api/courses"
                        confirmMessage={`Are you sure you want to delete course ${course.title}? This will also delete all certificates, batches, and student enrollments linked to this course.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No courses created yet. Click "+ Add Course" to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
