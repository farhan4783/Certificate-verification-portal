import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Copy, ExternalLink, FolderOpen, MonitorPlay, Plus, Users, Video } from "lucide-react";
import CopyEmailsButton from "@/components/dashboard/CopyEmailsButton";

export default async function AdminBatchesPage() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") redirect("/login");

  const batches = await prisma.certificateBatch.findMany({
    include: {
      course: { select: { title: true, code: true } },
      trainer: { include: { user: { select: { name: true } } } },
      students: { include: { user: { select: { name: true, email: true } } } },
      _count: { select: { students: true, sessions: true, certificates: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Batch Control Center</h1>
          <p className="text-slate-600 text-sm mt-1">
            Manage all active KodeToCareer batches, Google Meet links, Drive recording folders, and class sessions.
          </p>
        </div>
        <Link
          href="/dashboard/admin/batches/create"
          className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold rounded-xl shadow-md shadow-sky-500/20 hover:from-sky-600 hover:to-blue-700 transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Batch
        </Link>
      </div>

      {/* Batch Cards */}
      <div className="space-y-6">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Batch Header */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-extrabold text-slate-900">{batch.batchName}</h2>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    batch.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : batch.status === "COMPLETED"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}>
                    {batch.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{batch.course.title}</span> · Trainer: {batch.trainer.user.name}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <p className="text-xl font-extrabold text-blue-700">{batch._count.students}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-extrabold text-slate-900">{batch._count.sessions}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Sessions</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-extrabold text-emerald-700">{batch._count.certificates}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Certificates</p>
                </div>
              </div>
            </div>

            {/* Links Row */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {batch.meetLink && (
                <a
                  href={batch.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <MonitorPlay className="h-4 w-4" />
                  Google Meet Link
                  <ExternalLink className="h-3 w-3 text-blue-500" />
                </a>
              )}

              {batch.driveFolderUrl && (
                <a
                  href={batch.driveFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-xl hover:bg-amber-100 transition-colors"
                >
                  <FolderOpen className="h-4 w-4" />
                  Drive Recording Folder
                  <ExternalLink className="h-3 w-3 text-amber-500" />
                </a>
              )}

              {!batch.meetLink && (
                <span className="text-xs text-slate-500 italic">No Meet link configured</span>
              )}
            </div>

            {/* Enrolled Students with Email Copy */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-blue-600" />
                  Enrolled Students ({batch.students.length})
                </h3>
                {batch.students.length > 0 && (
                  <CopyEmailsButton
                    emails={batch.students.map((s) => s.user.email)}
                    batchName={batch.batchName}
                  />
                )}
              </div>

              {batch.students.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {batch.students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{student.user.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{student.user.email}</p>
                      </div>
                      <span className="text-[10px] font-mono text-blue-600 font-bold">{student.enrollmentNumber}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No students enrolled in this batch yet.</p>
              )}
            </div>
          </div>
        ))}

        {batches.length === 0 && (
          <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-900">No batches created yet</p>
            <p className="text-xs text-slate-500 mt-1">Create your first batch to start enrolling students.</p>
          </div>
        )}
      </div>
    </div>
  );
}
