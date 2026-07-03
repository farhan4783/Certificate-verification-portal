import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import StatCard from "@/components/dashboard/StatCard";
import { BookOpen, Users, Award, CheckCircle } from "lucide-react";

export default async function TrainerOverviewPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const trainer = await prisma.trainer.findFirst({
    where: { user: { email: session.email } },
    include: {
      courses: {
        select: { id: true, title: true, _count: { select: { students: true } } },
      },
      certificates: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          student: { include: { user: { select: { name: true } } } },
          course: { select: { title: true } },
        },
      },
      _count: {
        select: {
          courses: true,
          certificates: true,
        },
      },
    },
  });

  if (!trainer) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Trainer profile not found. Contact admin.</p>
      </div>
    );
  }

  const issuedCount = await prisma.certificate.count({
    where: { trainerId: trainer.id, status: "ISSUED" },
  });
  const studentCount = await prisma.student.count({
    where: { trainer: { some: { id: trainer.id } } },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Welcome back! 👋</h1>
        <p className="text-slate-400 text-sm mt-1">Your trainer dashboard — manage courses, students, and certificates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="My Courses" value={trainer._count.courses} icon={<BookOpen className="h-5 w-5" />} color="violet" />
        <StatCard label="My Students" value={studentCount} icon={<Users className="h-5 w-5" />} color="blue" />
        <StatCard label="Certificates Issued" value={issuedCount} icon={<Award className="h-5 w-5" />} color="emerald" />
        <StatCard label="Total Certificates" value={trainer._count.certificates} icon={<CheckCircle className="h-5 w-5" />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">My Courses</h2>
            <a href="/dashboard/trainer/courses" className="text-xs text-violet-400 hover:text-violet-300">View all →</a>
          </div>
          <div className="space-y-3">
            {trainer.courses.slice(0, 4).map((course) => (
              <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="text-sm text-slate-300 truncate">{course.title}</span>
                <span className="text-xs text-slate-500 shrink-0 ml-2">{course._count.students} students</span>
              </div>
            ))}
            {trainer.courses.length === 0 && (
              <p className="text-sm text-slate-500 py-4 text-center">No courses assigned yet.</p>
            )}
          </div>
        </div>

        {/* Recent Certificates */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Recent Certificates</h2>
            <a href="/dashboard/trainer/certificates" className="text-xs text-violet-400 hover:text-violet-300">Issue new →</a>
          </div>
          <div className="space-y-3">
            {trainer.certificates.map((cert) => (
              <div key={cert.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="h-7 w-7 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <span className="text-blue-400 text-xs font-bold">{cert.student.user.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate">{cert.student.user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{cert.course.title}</p>
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded border ${
                  cert.status === "ISSUED" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-slate-700/50 text-slate-400 border-slate-600"
                }`}>
                  {cert.status}
                </span>
              </div>
            ))}
            {trainer.certificates.length === 0 && (
              <p className="text-sm text-slate-500 py-4 text-center">No certificates issued yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
