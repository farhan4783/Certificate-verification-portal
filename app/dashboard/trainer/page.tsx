import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import StatCard from "@/components/dashboard/StatCard";
import { BookOpen, Users, Award, CheckCircle, Video, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function TrainerOverviewPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const trainer = await prisma.trainer.findFirst({
    where: { user: { email: session.email } },
    include: {
      user: { select: { name: true } },
      courses: {
        select: { id: true, title: true, code: true, _count: { select: { students: true, batches: true } } },
      },
      batches: {
        select: { id: true, batchName: true, meetLink: true, driveFolderUrl: true, _count: { select: { students: true, sessions: true } } },
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
          batches: true,
        },
      },
    },
  });

  if (!trainer) {
    return (
      <div className="flex items-center justify-center h-64 bg-white border border-dashed border-slate-300 rounded-2xl">
        <p className="text-slate-500 text-sm">Trainer profile not found. Contact admin.</p>
      </div>
    );
  }

  const issuedCount = await prisma.certificate.count({
    where: { trainerId: trainer.id, status: "ISSUED" },
  });
  const studentCount = await prisma.student.count({
    where: { trainer: { some: { id: trainer.id } } },
  });

  // Count pending submissions to grade
  const pendingSubmissionsCount = await prisma.assignmentSubmission.count({
    where: { status: "SUBMITTED" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Welcome back, {trainer.user.name || "Trainer"}! 👋</h1>
        <p className="text-slate-600 text-sm mt-1">
          Your KodeToCareer Trainer Command Center — manage your batches, recordings, assignments, and student progress.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Assigned Courses" value={trainer._count.courses} icon={<BookOpen className="h-5 w-5" />} color="violet" />
        <StatCard label="Active Students" value={studentCount} icon={<Users className="h-5 w-5" />} color="blue" />
        <StatCard label="Certificates Issued" value={issuedCount} icon={<Award className="h-5 w-5" />} color="emerald" />
        <StatCard label="Pending Grading" value={pendingSubmissionsCount} icon={<FileText className="h-5 w-5" />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Batches */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">My Batches ({trainer.batches.length})</h2>
            <Link href="/dashboard/admin/batches" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              Manage Batches →
            </Link>
          </div>
          <div className="space-y-3">
            {trainer.batches.map((batch) => (
              <div key={batch.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900">{batch.batchName}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {batch._count.students} Students
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  {batch.meetLink && (
                    <a
                      href={batch.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <Video className="h-3.5 w-3.5" /> Meet Link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {batch.driveFolderUrl && (
                    <a
                      href={batch.driveFolderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      📁 Drive Folder <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
            {trainer.batches.length === 0 && (
              <p className="text-xs text-slate-500 py-6 text-center">No active batches assigned yet.</p>
            )}
          </div>
        </div>

        {/* Recent Certificates */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Recent Certificates Issued</h2>
            <Link href="/dashboard/trainer/certificates" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              Issue New →
            </Link>
          </div>
          <div className="space-y-3">
            {trainer.certificates.map((cert) => (
              <div key={cert.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                  <span className="text-blue-700 text-xs font-bold">{cert.student.user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{cert.student.user.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{cert.course.title}</p>
                </div>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  cert.status === "ISSUED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"
                }`}>
                  {cert.status}
                </span>
              </div>
            ))}
            {trainer.certificates.length === 0 && (
              <p className="text-xs text-slate-500 py-6 text-center">No certificates issued yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
