import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function TrainerStudentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const trainer = await prisma.trainer.findFirst({
    where: { user: { email: session.email } },
    select: { id: true },
  });

  const students = trainer
    ? await prisma.student.findMany({
        where: { trainer: { some: { id: trainer.id } } },
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } },
          certificates: {
            where: { trainerId: trainer.id },
            select: { id: true, status: true, certificateId: true },
          },
        },
        orderBy: { user: { name: "asc" } },
      })
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">My Students</h1>
        <p className="text-slate-400 text-sm mt-1">{students.length} students enrolled across your courses</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Student</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Enrollment</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Course</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Certificates</th>
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
                  <td className="px-6 py-4 text-sm text-slate-400 max-w-[200px] truncate">{student.course.title}</td>
                  <td className="px-6 py-4">
                    {student.certificates.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300">{student.certificates.length}</span>
                        {student.certificates.some(c => c.status === "ISSUED") && (
                          <span className="text-xs text-emerald-400">✓ Issued</span>
                        )}
                      </div>
                    ) : (
                      <a
                        href="/dashboard/trainer/certificates"
                        className="text-xs text-violet-400 hover:text-violet-300"
                      >
                        Issue →
                      </a>
                    )}
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No students found for your courses.
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
