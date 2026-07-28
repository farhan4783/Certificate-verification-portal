import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import KtcLogo from "@/components/ui/KtcLogo";
import { Award, ShieldCheck, ExternalLink, Code, Globe, Briefcase, Trophy, GraduationCap } from "lucide-react";

interface PageProps {
  params: Promise<{ enrollmentNumber: string }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { enrollmentNumber } = await params;

  const student = await prisma.student.findFirst({
    where: { enrollmentNumber },
    include: {
      user: { select: { name: true, avatar: true } },
      organization: { select: { name: true, logo: true } },
      course: { select: { title: true } },
      certificates: {
        where: { status: "ISSUED" },
        orderBy: { issueDate: "desc" },
        include: {
          course: { select: { title: true } },
        },
      },
      projects: {
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      achievements: {
        orderBy: { achievementDate: "desc" },
        take: 6,
      },
    },
  });

  if (!student) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      {/* Ambient Background */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-sky-200/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 w-full px-6 py-4 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <KtcLogo size="md" href="/" />
          <span className="text-xs text-slate-500 font-mono hidden sm:block">
            Public Candidate Profile · {student.enrollmentNumber}
          </span>
        </div>
      </header>

      {/* Profile Hero */}
      <main className="max-w-5xl mx-auto px-6 py-12 relative z-0 space-y-10">
        <div className="flex flex-col sm:flex-row items-start gap-6 bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-lg shadow-sky-500/20 shrink-0">
            {student.user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {student.user.name}
              </h1>
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                KodeToCareer Verified Graduate
              </span>
            </div>
            <p className="text-slate-600 text-sm font-medium">
              Graduate of <span className="font-bold text-slate-900">{student.course.title}</span> · {student.organization.name}
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Enrollment ID: {student.enrollmentNumber}
            </p>
          </div>
        </div>

        {/* Verified Credentials */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            Verified Digital Credentials ({student.certificates.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {student.certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold">
                      {cert.certificateId}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(cert.issueDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{cert.course.title}</h3>
                  {cert.grade && (
                    <p className="text-xs text-slate-600">
                      Grade Achieved: <span className="font-bold text-emerald-700">{cert.grade}</span>
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Ledger Authentic
                  </span>
                  <Link
                    href={`/verify/${cert.certificateId}`}
                    target="_blank"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    Verify Credential ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Projects */}
        {student.projects.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Featured Technical Projects ({student.projects.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {student.projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900">{project.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {project.techStack.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700 font-semibold"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-3">
                    {project.projectUrl && (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        Live Demo ↗
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                      >
                        Source Code ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {student.achievements.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Academic & Tech Achievements ({student.achievements.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {student.achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-start gap-4"
                >
                  <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{ach.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">{ach.description}</p>
                    {ach.issuer && (
                      <p className="text-[10px] text-slate-500 font-mono mt-1">Issued by {ach.issuer}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-6 mt-16">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <p>© 2026 KodeToCareer Verified Student Directory.</p>
          <Link href="/graduates" className="text-blue-600 hover:text-blue-700 font-bold">
            ← Back to Recruiter Directory
          </Link>
        </div>
      </footer>
    </div>
  );
}
