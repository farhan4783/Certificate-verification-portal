import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
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
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      {/* Ambient Background */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-violet-500/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 w-full px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Award className="h-6 w-6 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-base tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              KODE TO CAREER
            </span>
          </Link>
          <span className="text-xs text-slate-500 font-mono hidden sm:block">
            Public Profile · {student.enrollmentNumber}
          </span>
        </div>
      </header>

      {/* Profile Hero */}
      <main className="max-w-5xl mx-auto px-6 py-12 relative z-0">
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-12">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl font-bold text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
            {student.user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
              {student.user.name}
            </h1>
            <p className="text-sm text-slate-400">
              <GraduationCap className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              {student.course.title} · {student.organization.name}
            </p>
            <div className="flex items-center gap-3 mt-1">
              {student.githubUrl && (
                <a href={student.githubUrl} target="_blank" rel="noreferrer"
                   className="text-slate-400 hover:text-slate-200 transition-colors">
                  <Code className="h-4 w-4" />
                </a>
              )}
              {student.linkedinUrl && (
                <a href={student.linkedinUrl} target="_blank" rel="noreferrer"
                   className="text-slate-400 hover:text-slate-200 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {student.portfolioUrl && (
                <a href={student.portfolioUrl} target="_blank" rel="noreferrer"
                   className="text-slate-400 hover:text-slate-200 transition-colors">
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                {student.certificates.length} Verified Credential{student.certificates.length !== 1 ? "s" : ""}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 font-semibold">
                {student.projects.length} Project{student.projects.length !== 1 ? "s" : ""}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                {student.achievements.length} Achievement{student.achievements.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Verified Credentials */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-100 mb-5 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            Verified Credentials
          </h2>
          {student.certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {student.certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <p className="text-xs font-mono text-amber-400">{cert.certificateId}</p>
                      <h3 className="text-sm font-semibold text-slate-200">{cert.course.title}</h3>
                      <p className="text-[11px] text-slate-500">
                        Issued {cert.issueDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                    <a
                      href={`/verify/${cert.certificateId}`}
                      className="shrink-0 text-xs text-emerald-400 hover:text-emerald-300 font-semibold opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1"
                    >
                      Verify <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
              No credentials issued yet.
            </div>
          )}
        </section>

        {/* Projects */}
        {student.projects.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-slate-100 mb-5 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-violet-400" />
              Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {student.projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-violet-500/30 transition-all"
                >
                  <h3 className="text-sm font-semibold text-slate-200 mb-2">{project.title}</h3>
                  {project.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{project.description}</p>
                  )}
                  {project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.techStack.map((tech) => (
                        <span key={tech} className="text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-slate-400 font-mono">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs">
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                        <Code className="h-3.5 w-3.5" /> Source
                      </a>
                    )}
                    {project.projectUrl && (
                      <a href={project.projectUrl} target="_blank" rel="noreferrer" className="text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                        <Globe className="h-3.5 w-3.5" /> Demo
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
          <section className="mb-12">
            <h2 className="text-lg font-bold text-slate-100 mb-5 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {student.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">{achievement.title}</h3>
                      {achievement.issuer && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{achievement.issuer}</p>
                      )}
                      {achievement.description && (
                        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{achievement.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 font-semibold uppercase">
                          {achievement.type.replace("_", " ")}
                        </span>
                        {achievement.achievementDate && (
                          <span className="text-[10px] text-slate-500">
                            {achievement.achievementDate.toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-6 text-center">
        <p className="text-xs text-slate-500">
          © 2026 Kode To Career. Credential verification powered by SHA-256 hashing & Ed25519 digital signatures.
        </p>
      </footer>
    </div>
  );
}
