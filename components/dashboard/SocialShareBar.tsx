"use client";

import { useState } from "react";
import { Share2, ExternalLink, Copy, Check, MessageCircle, Link2 } from "lucide-react";

interface Props {
  certificateId: string;
  studentName?: string;
  courseTitle?: string;
  organizationName?: string;
  verifyUrl?: string;
}

export default function SocialShareBar({
  certificateId,
  studentName = "Student",
  courseTitle = "Course",
  organizationName = "KodeToCareer",
  verifyUrl,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const effectiveVerifyUrl = verifyUrl || (typeof window !== "undefined" ? window.location.href : `https://kodetocareer.com/verify/${certificateId}`);

  const shareText = `I just earned a verified credential for "${courseTitle}" from ${organizationName}! Verify it here:`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(effectiveVerifyUrl);

  const linkedinAddUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(courseTitle)}&organizationName=${encodeURIComponent(organizationName)}&certId=${encodeURIComponent(certificateId)}&certUrl=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(effectiveVerifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.createElement("input");
      input.value = effectiveVerifyUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="mt-6">
      {/* Toggle Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        type="button"
        className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-sm font-bold shadow-2xs transition-all duration-200 group"
      >
        <Share2 className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
        Share & Add to Profile
      </button>

      {/* Expandable Panel */}
      {showPanel && (
        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs animate-in fade-in slide-in-from-top-2 duration-300">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Share this credential
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* LinkedIn Add to Profile */}
            <a
              href={linkedinAddUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0A66C2] hover:bg-[#084e96] text-white rounded-xl text-xs font-bold shadow-2xs transition-all duration-200 group"
            >
              <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
              LinkedIn
            </a>

            {/* OpenBadges 3.0 JSON-LD */}
            <a
              href={`/api/verify/${certificateId}/badge.json`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-2xs transition-all duration-200 group"
            >
              <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
              OpenBadge 3.0
            </a>

            {/* Twitter/X Share */}
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-all duration-200 group"
            >
              <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Post on X
            </a>

            {/* Copy Link */}
            <button
              onClick={handleCopy}
              type="button"
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 group border ${
                copied
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-bold"
                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  Copy Link
                </>
              )}
            </button>
          </div>

          {/* Direct URL Preview */}
          <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-3">
            <Link2 className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-[10px] font-mono text-slate-700 font-medium truncate select-all">
              {effectiveVerifyUrl}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
