import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import StatCard from "@/components/dashboard/StatCard";
import { Award, ShieldCheck, Trophy, Briefcase } from "lucide-react";
import KtcCareerPassport from "@/components/dashboard/KtcCareerPassport";

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
      <div className="flex flex-col items-center justify-center h-64 bg-white border border-dashed border-slate-300 rounded-2xl">
        <span className="text-4xl mb-4">⚠️</span>
        <p className="text-slate-600 text-sm">Student profile not found. Please contact your admin.</p>
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
      {/* KTC Career Passport Header */}
      <KtcCareerPassport
        studentName={student.user.name}
        enrollmentNumber={student.enrollmentNumber}
        courseTitle={student.course.title}
        organizationName={student.organization.name}
        certificatesCount={issuedCerts.length}
        projectsCount={student.projects.length}
        achievementsCount={student.achievements.length}
      />

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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900">My Certificates</h2>
          <a
            href="/dashboard/student/certificates"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {student.certificates.map((cert) => (
            <div
              key={cert.id}
              className="relative bg-white border border-slate-200 rounded-2xl p-5 overflow-hidden hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-3 text-xl">
                  📜
                </div>
                <p className="text-xs font-mono font-bold text-blue-600 mb-1 truncate">
                  {cert.certificateId}
                </p>
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {cert.course.title}
                </h3>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      cert.status === "ISSUED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : cert.status === "REVOKED"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {cert.status}
                  </span>
                  {cert.status === "ISSUED" && (
                    <a
                      href={`/verify/${cert.certificateId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Verify ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {student.certificates.length === 0 && (
            <div className="col-span-3 py-10 text-center text-slate-500 text-sm border border-dashed border-slate-300 bg-white rounded-2xl">
              <span className="text-3xl block mb-3">📋</span>
              No certificates yet. Complete your course to receive a certificate!
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
            className="flex items-center gap-2.5 px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 hover:border-blue-200 transition-all shadow-2xs"
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
