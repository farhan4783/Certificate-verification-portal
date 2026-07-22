"use client";

import { useState } from "react";
import { Share2, ExternalLink, Copy, Check, MessageCircle, Link2 } from "lucide-react";

interface Props {
  certificateId: string;
  studentName: string;
  courseTitle: string;
  organizationName: string;
  verifyUrl: string;
}

export default function SocialShareBar({
  certificateId,
  studentName,
  courseTitle,
  organizationName,
  verifyUrl,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const shareText = `I just earned a verified credential for "${courseTitle}" from ${organizationName}! Verify it here:`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(verifyUrl);

  const linkedinAddUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(courseTitle)}&organizationName=${encodeURIComponent(organizationName)}&certId=${encodeURIComponent(certificateId)}&certUrl=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = verifyUrl;
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
        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 rounded-xl text-sm font-semibold transition-all duration-200 group"
      >
        <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
        Share & Add to Profile
      </button>

      {/* Expandable Panel */}
      {showPanel && (
        <div className="mt-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Share this credential
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* LinkedIn Add to Profile */}
            <a
              href={linkedinAddUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0A66C2]/15 hover:bg-[#0A66C2]/25 border border-[#0A66C2]/30 hover:border-[#0A66C2]/50 text-[#0A66C2] rounded-lg text-xs font-semibold transition-all duration-200 group"
            >
              <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
              LinkedIn
            </a>

            {/* OpenBadges 3.0 JSON-LD */}
            <a
              href={`/api/verify/${certificateId}/badge.json`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-semibold transition-all duration-200 group"
            >
              <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
              OpenBadge 3.0
            </a>

            {/* Twitter/X Share */}
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-slate-300 rounded-lg text-xs font-semibold transition-all duration-200 group"
            >
              <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Post on X
            </a>

            {/* Copy Link */}
            <button
              onClick={handleCopy}
              type="button"
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all duration-200 group border ${
                copied
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-slate-800/60 hover:bg-slate-800 border-slate-700/50 hover:border-slate-600 text-slate-300"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
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
          <div className="flex items-center gap-2 bg-slate-950/60 rounded-lg border border-slate-800/60 p-3">
            <Link2 className="h-4 w-4 text-slate-500 shrink-0" />
            <span className="text-[10px] font-mono text-slate-400 truncate select-all">
              {verifyUrl}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
