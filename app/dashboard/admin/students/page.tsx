import prisma from "@/lib/prisma";

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
        <a
          href="/dashboard/admin/students/create"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm rounded-lg transition-colors"
        >
          + Add Student
        </a>
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
