import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function StudentProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const student = await prisma.student.findFirst({
    where: { user: { email: session.email } },
    include: {
      user: { select: { name: true, email: true, avatar: true } },
      course: { select: { title: true, code: true, duration: true } },
      organization: { select: { name: true, logoUrl: true } },
      batch: { select: { batchName: true } },
    },
  });

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Profile not found.</p>
      </div>
    );
  }

  const enrollmentDate = student.enrollmentDate;
  const completionDate = student.completionDate;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Your enrollment details and account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500/30 to-blue-500/30 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-emerald-300">{student.user.name.charAt(0)}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100">{student.user.name}</h2>
            <p className="text-sm text-emerald-400 mt-1">{student.course.title}</p>
            <p className="text-xs text-slate-500 mt-1">{student.user.email}</p>

            <div className="mt-4 pt-4 border-t border-slate-800 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Enrollment No.</span>
                <span className="text-amber-400 font-mono">{student.enrollmentNumber}</span>
              </div>
              {student.batch && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Batch</span>
                  <span className="text-slate-300">{student.batch.batchName}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Organization</span>
                <span className="text-slate-300">{student.organization.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollment Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Course Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">Course Information</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Course</span>
                <span className="text-sm text-slate-200">{student.course.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Code</span>
                <span className="text-xs font-mono text-violet-400">{student.course.code}</span>
              </div>
              {student.course.duration && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Duration</span>
                  <span className="text-sm text-slate-200">{student.course.duration}</span>
                </div>
              )}
            </div>
          </div>

          {/* Enrollment Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">Enrollment Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                <div className="flex-1 flex justify-between">
                  <span className="text-sm text-slate-400">Enrolled</span>
                  <span className="text-sm text-slate-200 font-mono">
                    {enrollmentDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
              </div>
              {completionDate && (
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                  <div className="flex-1 flex justify-between">
                    <span className="text-sm text-slate-400">Completed</span>
                    <span className="text-sm text-slate-200 font-mono">
                      {completionDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          {(student.linkedinUrl || student.githubUrl || student.portfolioUrl) && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">Social Links</h3>
              <div className="space-y-2">
                {student.linkedinUrl && (
                  <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                    🔗 LinkedIn
                  </a>
                )}
                {student.githubUrl && (
                  <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
                    🐙 GitHub
                  </a>
                )}
                {student.portfolioUrl && (
                  <a href={student.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300">
                    🌐 Portfolio
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
