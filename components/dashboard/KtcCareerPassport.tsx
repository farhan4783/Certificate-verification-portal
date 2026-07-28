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
    if (score >= 85) return { label: "Industry Ready (Top 5%)", color: "from-blue-600 to-indigo-600", text: "text-blue-700", border: "border-blue-300" };
    if (score >= 60) return { label: "Career Competent", color: "from-emerald-500 to-teal-600", text: "text-emerald-700", border: "border-emerald-300" };
    return { label: "In Development", color: "from-sky-500 to-blue-600", text: "text-sky-700", border: "border-sky-300" };
  };

  const tier = getScoreTier(readinessScore);

  const copyEmbedBadge = () => {
    const embedHtml = `<a href="${window.location.origin}/profile/${enrollmentNumber}" target="_blank"><img src="${window.location.origin}/api/students/${enrollmentNumber}/badge" alt="${studentName} - KodeToCareer Verified Student" /></a>`;
    navigator.clipboard.writeText(embedHtml);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2500);
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/40 to-sky-50 border border-blue-200/80 rounded-2xl p-6 relative overflow-hidden shadow-sm mb-8">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-blue-200/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            KodeToCareer Skill Passport
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            {studentName}
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-semibold">
              {enrollmentNumber}
            </span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Track: <span className="text-slate-900 font-bold">{courseTitle}</span> · {organizationName}
          </p>
        </div>

        {/* Career Readiness Score Badge */}
        <div className="flex items-center gap-4 bg-white/90 border border-slate-200 rounded-2xl p-3.5 shrink-0 shadow-xs">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 border border-blue-200">
            <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-600 transition-all duration-1000 ease-out"
                strokeDasharray={`${readinessScore}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-sm font-extrabold text-blue-700 font-mono">
              {readinessScore}%
            </span>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">KTC Readiness Index</p>
            <p className={`text-xs font-bold ${tier.text}`}>{tier.label}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Verified by KodeToCareer</p>
          </div>
        </div>
      </div>

      {/* Skills & Badges Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {/* Verified Competencies */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Verified Technical Competencies
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:border-blue-300 transition-colors"
              >
                <Zap className="h-3 w-3 text-blue-600" />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Links & Passport Actions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            KTC Recruiter Passport
          </h3>
          <div className="flex flex-col gap-2">
            <a
              href={`/profile/${enrollmentNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 transition-colors shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                Public Talent Profile
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">Recruiter Ready ↗</span>
            </a>

            <button
              onClick={copyEmbedBadge}
              className="inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 transition-colors text-left shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                {copiedBadge ? "HTML Embed Copied!" : "Copy Embed Badge HTML"}
              </span>
              <span className="text-[10px] text-blue-600 font-mono font-bold">
                {copiedBadge ? "✓ Copied" : "Copy"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
