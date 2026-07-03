import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import StatCard from "@/components/dashboard/StatCard";
import { Users, GraduationCap, Award, ShieldCheck, Clock } from "lucide-react";

export default async function AdminOverviewPage() {
  const session = await getSession();

  const [
    totalStudents,
    totalTrainers,
    totalCertificates,
    issuedCertificates,
    pendingCertificates,
    totalVerifications,
    recentCertificates,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.trainer.count(),
    prisma.certificate.count(),
    prisma.certificate.count({ where: { status: "ISSUED" } }),
    prisma.certificate.count({ where: { status: "DRAFT" } }),
    prisma.verificationLog.count(),
    prisma.certificate.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        student: { include: { user: { select: { name: true } } } },
        course: { select: { title: true } },
      },
    }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Admin Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Platform-wide statistics and recent activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Students"
          value={totalStudents}
          icon={<GraduationCap className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          label="Total Trainers"
          value={totalTrainers}
          icon={<Users className="h-5 w-5" />}
          color="violet"
        />
        <StatCard
          label="Certificates Issued"
          value={issuedCertificates}
          icon={<Award className="h-5 w-5" />}
          color="emerald"
        />
        <StatCard
          label="Total Verifications"
          value={totalVerifications}
          icon={<ShieldCheck className="h-5 w-5" />}
          color="amber"
        />
        <StatCard
          label="Pending Certificates"
          value={pendingCertificates}
          icon={<Clock className="h-5 w-5" />}
          color="rose"
        />
        <StatCard
          label="Total Certificates"
          value={totalCertificates}
          icon={<Award className="h-5 w-5" />}
          color="blue"
        />
      </div>

      {/* Recent Certificates */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">Recent Certificates</h2>
          <a href="/dashboard/admin/certificates" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Certificate ID</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Student</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Course</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentCertificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-amber-400">{cert.certificateId}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{cert.student.user.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 truncate max-w-[200px]">{cert.course.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                      cert.status === "ISSUED" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" :
                      cert.status === "DRAFT" ? "bg-slate-700/50 text-slate-300 border-slate-600" :
                      cert.status === "REVOKED" ? "bg-rose-500/15 text-rose-400 border-rose-500/25" :
                      "bg-blue-500/15 text-blue-400 border-blue-500/25"
                    }`}>
                      {cert.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentCertificates.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No certificates yet. Issue the first one from the Certificates section.
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
