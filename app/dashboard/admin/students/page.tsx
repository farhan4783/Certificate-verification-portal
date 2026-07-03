import Link from "next/link";
import prisma from "@/lib/prisma";
import DeleteButton from "@/components/dashboard/DeleteButton";

export default async function AdminStudentsPage() {
  const students = await prisma.student.findMany({
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      course: { select: { title: true } },
      organization: { select: { name: true } },
      certificates: { select: { id: true, status: true } },
    },
    orderBy: { user: { createdAt: "desc" } },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Students</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all student accounts on the platform</p>
        </div>
        <Link
          href="/dashboard/admin/students/create"
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-sm rounded-lg transition-colors"
        >
          + Add Student
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Student</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Enrollment No.</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Course</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Certificates</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Joined</th>
                <th className="px-6 py-3 text-right text-[11px] font-mono uppercase tracking-widest text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                        <span className="text-blue-400 text-xs font-bold">{student.user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{student.user.name}</p>
                        <p className="text-xs text-slate-500">{student.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-amber-400">{student.enrollmentNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 truncate max-w-[200px]">{student.course.title}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5">
                      <span className="text-sm text-slate-300">{student.certificates.length}</span>
                      {student.certificates.filter(c => c.status === "ISSUED").length > 0 && (
                        <span className="text-xs text-emerald-400">({student.certificates.filter(c => c.status === "ISSUED").length} issued)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                    {student.user.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/admin/students/${student.id}/edit`}
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
                        id={student.id}
                        endpoint="/api/students"
                        confirmMessage={`Are you sure you want to delete student ${student.user.name}? This will delete all their certificates, projects, and achievements.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No students found.
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
