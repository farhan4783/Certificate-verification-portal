import Link from "next/link";
import prisma from "@/lib/prisma";
import DeleteButton from "@/components/dashboard/DeleteButton";
import EnrollStudentModal from "@/components/dashboard/EnrollStudentModal";
import { Award, GraduationCap, UserPlus } from "lucide-react";

export default async function AdminStudentsPage() {
  const students = await prisma.student.findMany({
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      course: { select: { title: true } },
      batch: { select: { batchName: true } },
      organization: { select: { name: true } },
      certificates: { select: { id: true, status: true } },
      progress: { select: { totalPercentage: true, isComplete: true, attendanceRate: true, assignmentRate: true } },
    },
    orderBy: { user: { createdAt: "desc" } },
  });

  // Fetch courses and batches for the enrollment modal
  const courses = await prisma.course.findMany({
    select: { id: true, title: true, code: true },
    where: { status: "ACTIVE" },
  });

  const batches = await prisma.certificateBatch.findMany({
    select: { id: true, batchName: true, courseId: true },
    where: { status: "ACTIVE" },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Students</h1>
          <p className="text-slate-600 text-sm mt-1">
            Manage all {students.length} student accounts on the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <EnrollStudentModal courses={courses} batches={batches} />
          <Link
            href="/dashboard/admin/students/create"
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-colors shadow-2xs flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Advanced Create
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-extrabold text-slate-900">{students.length}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Total Students</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-extrabold text-emerald-700">{students.filter(s => s.progress?.isComplete).length}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Course Complete</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-extrabold text-blue-700">{students.filter(s => s.certificates.some(c => c.status === "ISSUED")).length}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Certified</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-extrabold text-amber-700">
            {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + (s.progress?.totalPercentage || 0), 0) / students.length) : 0}%
          </p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Avg. Progress</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Student</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Enrollment</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Course / Batch</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Progress</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Certificates</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Joined</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => {
                const progressPct = Math.round(student.progress?.totalPercentage || 0);
                const isComplete = student.progress?.isComplete || false;
                const hasIssuedCert = student.certificates.some(c => c.status === "ISSUED");

                return (
                  <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                          <span className="text-blue-700 text-xs font-bold">{student.user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{student.user.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{student.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono font-bold text-blue-700">{student.enrollmentNumber}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[160px]">{student.course.title}</p>
                      {student.batch && (
                        <p className="text-[10px] text-slate-500 mt-0.5">{student.batch.batchName}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isComplete ? "bg-emerald-500" : progressPct > 50 ? "bg-blue-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.min(100, progressPct)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${
                          isComplete ? "text-emerald-700" : "text-slate-700"
                        }`}>
                          {progressPct}%
                        </span>
                        {isComplete && <span className="text-[10px]">✅</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900">{student.certificates.length}</span>
                        {hasIssuedCert && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {student.certificates.filter(c => c.status === "ISSUED").length} issued
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-mono">
                      {student.user.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/admin/students/${student.id}/edit`}
                          className="p-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-500 hover:text-blue-600 rounded-lg transition-all duration-150"
                          title="Edit"
                        >
                          <svg
                            className="h-3.5 w-3.5"
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
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-900">No students enrolled yet</p>
                    <p className="text-xs text-slate-500 mt-1">Use the &quot;Quick Enroll&quot; button above to add your first student.</p>
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
