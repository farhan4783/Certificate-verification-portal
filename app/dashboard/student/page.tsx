import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import StatCard from "@/components/dashboard/StatCard";
import { Award, ShieldCheck, Trophy, Briefcase } from "lucide-react";

export default async function StudentOverviewPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const student = await prisma.student.findFirst({
    where: { user: { email: session.email } },
    include: {
      user: { select: { name: true } },
      course: { select: { title: true } },
      organization: { select: { name: true } },
      certificates: {
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          course: { select: { title: true } },
          verificationLogs: { select: { id: true } },
        },
      },
      projects: { select: { id: true } },
      achievements: { select: { id: true } },
    },
  });

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-900 border border-dashed border-slate-700 rounded-xl">
        <span className="text-4xl mb-4">⚠️</span>
        <p className="text-slate-400 text-sm">Student profile not found. Please contact your admin.</p>
      </div>
    );
  }

  const issuedCerts = student.certificates.filter((c) => c.status === "ISSUED");
  const totalVerifications = student.certificates.reduce(
    (acc, c) => acc + c.verificationLogs.length,
    0
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">
          Welcome, {student.user.name}! 🎓
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {student.course.title} · {student.organization.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Certificates"
          value={issuedCerts.length}
          icon={<Award className="h-5 w-5" />}
          color="emerald"
        />
        <StatCard
          label="Verifications"
          value={totalVerifications}
          icon={<ShieldCheck className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          label="Projects"
          value={student.projects.length}
          icon={<Briefcase className="h-5 w-5" />}
          color="violet"
        />
        <StatCard
          label="Achievements"
          value={student.achievements.length}
          icon={<Trophy className="h-5 w-5" />}
          color="amber"
        />
      </div>

      {/* Certificate Showcase */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-200">My Certificates</h2>
          <a
            href="/dashboard/student/certificates"
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View all →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {student.certificates.map((cert) => (
            <div
              key={cert.id}
              className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-5 overflow-hidden hover:border-emerald-500/40 transition-all"
            >
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />

              <div className="relative">
                <div className="h-10 w-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-3">
                  <span className="text-xl">📜</span>
                </div>
                <p className="text-xs font-mono text-amber-400 mb-1 truncate">
                  {cert.certificateId}
                </p>
                <h3 className="text-sm font-semibold text-slate-200 truncate">
                  {cert.course.title}
                </h3>

                <div className="flex items-center justify-between mt-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded border ${
                      cert.status === "ISSUED"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                        : cert.status === "REVOKED"
                        ? "bg-rose-500/15 text-rose-400 border-rose-500/25"
                        : "bg-slate-700/50 text-slate-400 border-slate-600"
                    }`}
                  >
                    {cert.status}
                  </span>
                  {cert.status === "ISSUED" && (
                    <a
                      href={`/verify/${cert.certificateId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Verify ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {student.certificates.length === 0 && (
            <div className="col-span-3 py-10 text-center text-slate-500 text-sm border border-dashed border-slate-700 rounded-xl">
              <span className="text-3xl block mb-3">📋</span>
              No certificates yet. Complete your course to receive a certificate!
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/dashboard/student/certificates", label: "Download PDFs", icon: "⬇️" },
          { href: "/dashboard/student/portfolio", label: "Add Projects", icon: "💡" },
          { href: "/dashboard/student/achievements", label: "Achievements", icon: "🏆" },
          { href: "/dashboard/student/profile", label: "View Profile", icon: "👤" },
          { href: `/api/students/${student.id}/id-card`, label: "My ID Card", icon: "🪪" },
          { href: `/profile/${student.enrollmentNumber}`, label: "Public Portfolio", icon: "🌐" },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="flex items-center gap-2.5 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 hover:border-slate-700 transition-all"
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
