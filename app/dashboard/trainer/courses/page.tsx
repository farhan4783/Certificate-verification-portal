import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function TrainerCoursesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const trainer = await prisma.trainer.findFirst({
    where: { user: { email: session.email } },
    include: {
      courses: {
        include: {
          _count: { select: { students: true, certificates: true } },
          batches: { select: { id: true, batchName: true, status: true } },
        },
      },
    },
  });

  const courses = trainer?.courses ?? [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">My Courses</h1>
        <p className="text-slate-400 text-sm mt-1">Courses and batch management for your sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course) => (
          <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">{course.title}</h3>
                {course.subtitle && <p className="text-xs text-slate-500 mt-0.5">{course.subtitle}</p>}
              </div>
              <span className="text-xs font-mono text-violet-400 shrink-0">{course.code}</span>
            </div>

            {course.description && (
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{course.description}</p>
            )}

            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
              <span>🎓 {course._count.students} students</span>
              <span>📜 {course._count.certificates} certificates</span>
              {course.duration && <span>⏱ {course.duration}</span>}
            </div>

            {/* Batches */}
            {course.batches.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-mono uppercase text-slate-600 tracking-widest mb-2">Batches</p>
                {course.batches.slice(0, 3).map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <span className="text-xs text-slate-400">{batch.batchName}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${
                      batch.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-700/50 text-slate-400 border-slate-600"
                    }`}>
                      {batch.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-2 py-12 text-center text-slate-500 text-sm">
            No courses assigned. Contact admin to assign courses to your account.
          </div>
        )}
      </div>
    </div>
  );
}
