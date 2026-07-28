import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import StatCard from "@/components/dashboard/StatCard";
import { Award, ShieldCheck, Trophy, Briefcase, MonitorPlay, Video, Calendar, BookOpen, ArrowRight, ExternalLink } from "lucide-react";
import KtcCareerPassport from "@/components/dashboard/KtcCareerPassport";
import Link from "next/link";

export default async function StudentOverviewPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const student = await prisma.student.findFirst({
    where: { user: { email: session.email } },
    include: {
      user: { select: { name: true } },
      course: { select: { title: true } },
      organization: { select: { name: true } },
      batch: { select: { batchName: true, meetLink: true, driveFolderUrl: true } },
      progress: true,
      certificates: {
        orderBy: { createdAt: "desc" },
        include: {
          course: { select: { title: true } },
          verificationLogs: { select: { id: true } },
        },
      },
      projects: { select: { id: true } },
      achievements: { select: { id: true } },
      attendance: { where: { isPresent: true }, select: { id: true } },
      submissions: { select: { id: true } },
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

  // Determine today's activity type
  const dayOfWeek = new Date().getDay();
  const dayConfig = dayOfWeek === 0
    ? { type: "🛠️ Project Day", label: "Sunday — Assignment & Project Building", color: "emerald" }
    : dayOfWeek === 6
    ? { type: "❓ Doubt Session", label: "Saturday — Live Doubt Clearing & Q&A", color: "amber" }
    : { type: "📚 Daily Class", label: `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeek]} — Live Interactive Lecture`, color: "blue" };

  const progressPct = student.progress?.totalPercentage || 0;

  return (
    <div>
      {/* Today's Schedule Banner */}
      <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-white border border-blue-200 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{dayConfig.type.split(" ")[0]}</span>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today&apos;s Schedule</p>
                <h2 className="text-lg font-extrabold text-slate-900">{dayConfig.label}</h2>
              </div>
            </div>

            {student.batch && (
              <p className="text-xs text-slate-600">
                Batch: <span className="font-bold text-slate-900">{student.batch.batchName}</span> · {student.course.title}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Join Google Meet Button */}
            {student.batch?.meetLink && (
              <a
                href={student.batch.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-500/20 hover:from-sky-600 hover:to-blue-700 transition-all flex items-center gap-2 animate-pulse hover:animate-none"
              >
                <MonitorPlay className="h-5 w-5" />
                Join Google Meet Class
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            {/* Drive Recordings */}
            {student.batch?.driveFolderUrl && (
              <Link
                href="/dashboard/student/recordings"
                className="px-4 py-3 bg-white border border-slate-200 text-slate-800 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-2xs"
              >
                <Video className="h-4 w-4 text-blue-600" />
                Class Recordings
              </Link>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative z-10 mt-5 pt-4 border-t border-blue-200/60">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-700">Course Completion Progress</p>
            <p className="text-xs font-extrabold text-blue-700">{Math.round(progressPct)}%</p>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(100, progressPct)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] font-medium text-slate-500">
            <span>{student.attendance.length} classes attended · {student.submissions.length} assignments submitted</span>
            {progressPct >= 100 && (
              <span className="text-emerald-700 font-bold">🎉 Course Complete! Certificate Ready</span>
            )}
          </div>
        </div>
      </div>

      {/* KTC Career Passport */}
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {[
          { href: "/dashboard/student/certificates", label: "Download PDFs", icon: "⬇️" },
          { href: "/dashboard/student/recordings", label: "Class Recordings", icon: "🎬" },
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
