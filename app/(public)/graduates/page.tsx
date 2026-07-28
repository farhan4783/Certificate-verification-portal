import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import KtcLogo from "@/components/ui/KtcLogo";
import { Award, Briefcase, CheckCircle2, ExternalLink, Search, ShieldCheck, Sparkles, UserCheck } from "lucide-react";

export const metadata = {
  title: "KodeToCareer Graduate & Talent Verification Directory",
  description: "Official directory of verified KodeToCareer bootcamp graduates, certified credentials, and technical talent profiles.",
};

export default async function GraduatesDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; track?: string }>;
}) {
  const params = await searchParams;
  const query = params.query || "";
  const track = params.track || "";

  // Fetch all students with verified certificates, courses, projects, and web3 details
  const students = await prisma.student.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { user: { name: { contains: query, mode: "insensitive" } } },
                { enrollmentNumber: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
        track
          ? {
              course: { title: { contains: track, mode: "insensitive" } },
            }
          : {},
      ],
    },
    include: {
      user: { select: { name: true, email: true, avatar: true } },
      course: { select: { title: true, code: true } },
      organization: { select: { name: true } },
      certificates: {
        where: { status: "ISSUED" },
        take: 2,
        select: {
          id: true,
          certificateId: true,
          status: true,
          grade: true,
          issueDate: true,
          web3Credential: { select: { tokenId: true, networkName: true } },
        },
      },
      projects: { take: 3, select: { title: true, techStack: true, projectUrl: true, githubUrl: true } },
      achievements: { take: 2, select: { title: true, type: true } },
    },
    orderBy: { enrollmentDate: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden antialiased">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-sky-200/40 rounded-full blur-[130px] pointer-events-none" />

      {/* Light Header Bar */}
      <header className="relative z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <KtcLogo size="md" href="/" />

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
              Home
            </Link>
            <Link href="/login" className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
              Student / Admin Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wide shadow-2xs">
            <UserCheck className="h-4 w-4 text-blue-600" />
            Official Verified Graduate Directory
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Recruiter & Employer <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Talent Audit</span>
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Direct access to KodeToCareer graduates. Every candidate listed below possesses authentic, SHA-256 cryptographically verified credentials.
          </p>
        </div>

        {/* Filter Bar */}
        <form method="GET" className="bg-white border border-slate-200 rounded-2xl p-4 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Search candidate by name or enrollment ID (e.g. KTC-ENR-2026-0001)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              name="track"
              defaultValue={track}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none"
            >
              <option value="">All KodeToCareer Tracks</option>
              <option value="MERN">MERN Stack with AI</option>
              <option value="Web3">Web3 & Blockchain</option>
              <option value="Python">Python & Data Science</option>
            </select>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs rounded-xl transition-colors shrink-0 shadow-xs"
            >
              Filter Candidates
            </button>
          </div>
        </form>

        {/* Graduates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => {
            const hasIssuedCert = student.certificates.length > 0;
            const primaryCert = student.certificates[0];

            return (
              <div
                key={student.id}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Avatar & Name */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-sky-500/20">
                        {student.user.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">{student.user.name}</h3>
                        <p className="text-xs font-mono text-blue-600 font-bold">{student.enrollmentNumber}</p>
                      </div>
                    </div>
                    {hasIssuedCert && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified
                      </span>
                    )}
                  </div>

                  {/* Course Track */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">KodeToCareer Track</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{student.course.title}</p>
                  </div>

                  {/* Issued Credentials info */}
                  {primaryCert && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium">
                          <Award className="h-3.5 w-3.5 text-blue-600" />
                          Credential ID:
                        </span>
                        <span className="font-mono font-bold text-slate-900">{primaryCert.certificateId}</span>
                      </div>

                      {primaryCert.web3Credential && (
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span className="flex items-center gap-1 font-medium">
                            <ShieldCheck className="h-3.5 w-3.5 text-cyan-600" />
                            Soulbound Token:
                          </span>
                          <span className="font-mono text-cyan-700 font-bold text-[11px]">
                            Polygon #{primaryCert.web3Credential.tokenId}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Featured Projects preview */}
                  {student.projects.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-blue-600" /> Candidate Projects ({student.projects.length})
                      </p>
                      <div className="space-y-1">
                        {student.projects.slice(0, 2).map((p, i) => (
                          <div key={i} className="text-xs text-slate-700 truncate flex items-center justify-between font-medium">
                            <span className="truncate">· {p.title}</span>
                            {p.techStack.length > 0 && (
                              <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                                [{p.techStack.slice(0, 2).join(", ")}]
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    href={`/profile/${student.enrollmentNumber}`}
                    className="flex-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors text-center flex items-center justify-center gap-1"
                  >
                    <span>View Talent Profile</span>
                    <ExternalLink className="h-3 w-3 text-slate-300" />
                  </Link>

                  {primaryCert && (
                    <Link
                      href={`/verify/${primaryCert.certificateId}`}
                      target="_blank"
                      className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold rounded-xl transition-colors text-center"
                    >
                      Audit Cert ↗
                    </Link>
                  )}
                </div>
              </div>
            );
          })}

          {students.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-600 bg-white border border-dashed border-slate-300 rounded-2xl">
              <span className="text-4xl block mb-3">🔍</span>
              <p className="text-sm font-bold text-slate-900">No KodeToCareer candidates matched your search criteria.</p>
              <p className="text-xs text-slate-500 mt-1">Try searching with a different name or clearing filters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
