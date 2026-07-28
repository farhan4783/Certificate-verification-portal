"use client";

import React, { useState } from "react";
import { Award, Briefcase, CheckCircle2, ExternalLink, ShieldCheck, Sparkles, Trophy, Zap } from "lucide-react";

interface KtcCareerPassportProps {
  studentName: string;
  enrollmentNumber: string;
  courseTitle: string;
  organizationName: string;
  certificatesCount: number;
  projectsCount: number;
  achievementsCount: number;
  skills?: string[];
}

export default function KtcCareerPassport({
  studentName,
  enrollmentNumber,
  courseTitle,
  organizationName,
  certificatesCount,
  projectsCount,
  achievementsCount,
  skills = ["MongoDB", "Express.js", "React.js", "Node.js", "Next.js", "Generative AI", "Git & GitHub", "REST APIs"],
}: KtcCareerPassportProps) {
  const [copiedBadge, setCopiedBadge] = useState(false);

  // Calculate readiness score (max 100)
  const certScore = Math.min(40, certificatesCount * 40);
  const projectScore = Math.min(30, projectsCount * 15);
  const achievementScore = Math.min(20, achievementsCount * 10);
  const baseScore = 10; // Registration & active track
  const readinessScore = certScore + projectScore + achievementScore + baseScore;

  const getScoreTier = (score: number) => {
    if (score >= 85) return { label: "Industry Ready (Top 5%)", color: "from-amber-400 to-amber-600", text: "text-amber-400", border: "border-amber-500/30" };
    if (score >= 60) return { label: "Career Competent", color: "from-emerald-400 to-emerald-600", text: "text-emerald-400", border: "border-emerald-500/30" };
    return { label: "In Development", color: "from-sky-400 to-blue-600", text: "text-sky-400", border: "border-sky-500/30" };
  };

  const tier = getScoreTier(readinessScore);

  const copyEmbedBadge = () => {
    const embedHtml = `<a href="${window.location.origin}/profile/${enrollmentNumber}" target="_blank"><img src="${window.location.origin}/api/students/${enrollmentNumber}/badge" alt="${studentName} - KodeToCareer Verified Student" /></a>`;
    navigator.clipboard.writeText(embedHtml);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2500);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl mb-8">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            KodeToCareer Skill Passport
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            {studentName}
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400">
              {enrollmentNumber}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track: <span className="text-slate-200 font-medium">{courseTitle}</span> · {organizationName}
          </p>
        </div>

        {/* Career Readiness Score Badge */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 shrink-0">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 border border-slate-700">
            <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-amber-400 transition-all duration-1000 ease-out"
                strokeDasharray={`${readinessScore}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-sm font-extrabold text-amber-400 font-mono">
              {readinessScore}%
            </span>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">KTC Readiness Index</p>
            <p className={`text-xs font-bold ${tier.text}`}>{tier.label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Verified by KodeToCareer</p>
          </div>
        </div>
      </div>

      {/* Skills & Badges Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {/* Verified Competencies */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Verified Technical Competencies
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-950/70 border border-slate-800 text-xs font-medium text-slate-300 hover:border-slate-700 transition-colors"
              >
                <Zap className="h-3 w-3 text-amber-400" />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Links & Passport Actions */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            KTC Recruiter Passport
          </h3>
          <div className="flex flex-col gap-2">
            <a
              href={`/profile/${enrollmentNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="h-3.5 w-3.5 text-sky-400" />
                Public Talent Profile
              </span>
              <span className="text-[10px] text-slate-400">Recruiter Ready ↗</span>
            </a>

            <button
              onClick={copyEmbedBadge}
              className="inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors text-left"
            >
              <span className="flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                {copiedBadge ? "HTML Embed Copied!" : "Copy Embed Badge HTML"}
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                {copiedBadge ? "✓ Copied" : "Copy"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
