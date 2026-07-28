import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

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
          batch: { select: { batchName: true } },
          progress: { select: { totalPercentage: true, isComplete: true } },
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
        <h1 className="text-2xl font-extrabold text-slate-900">My Enrolled Students</h1>
        <p className="text-slate-600 text-sm mt-1">{students.length} students enrolled across your assigned courses and batches</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Student</th>
                <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Enrollment</th>
                <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Course / Batch</th>
                <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Progress</th>
                <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Certificates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => {
                const progressPct = Math.round(student.progress?.totalPercentage || 0);
                const isComplete = student.progress?.isComplete || false;

                return (
                  <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                          <span className="text-blue-700 text-xs font-bold">{student.user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{student.user.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{student.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono font-bold text-blue-700">{student.enrollmentNumber}</td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{student.course.title}</p>
                      {student.batch && (
                        <p className="text-[10px] text-slate-500 mt-0.5">{student.batch.batchName}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isComplete ? "bg-emerald-500" : progressPct > 50 ? "bg-blue-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.min(100, progressPct)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{progressPct}%</span>
                        {isComplete && <span className="text-[10px]">✅</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {student.certificates.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{student.certificates.length}</span>
                          {student.certificates.some(c => c.status === "ISSUED") && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Issued
                            </span>
                          )}
                        </div>
                      ) : (
                        <Link
                          href="/dashboard/trainer/certificates"
                          className="text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                          Issue Cert →
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-900">No students enrolled yet</p>
                    <p className="text-xs text-slate-500 mt-1">Students assigned to your courses will appear here.</p>
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
