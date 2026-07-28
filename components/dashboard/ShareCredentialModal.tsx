"use client";

import React, { useState } from "react";
import { Share2, Check, Copy, X, ExternalLink } from "lucide-react";

interface ShareCredentialModalProps {
  certificateId: string;
  courseTitle: string;
  issueDate?: string;
  studentName?: string;
}

export default function ShareCredentialModal({
  certificateId,
  courseTitle,
  issueDate = "2026",
  studentName = "Student",
}: ShareCredentialModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPost, setCopiedPost] = useState(false);

  const fullVerifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${certificateId}`
    : `https://kodetocareer.com/verify/${certificateId}`;

  // Pre-formatted social post text
  const shareText = `🎓 Excited to announce that I have successfully earned my verified credential in "${courseTitle}" from KodeToCareer!

Verifiable Certificate ID: ${certificateId}
Verify authenticity here: ${fullVerifyUrl}

#KodeToCareer #MERNStack #AI #VerifiedCredential #TechCareer #SkillPassport`;

  // LinkedIn Certification Link builder
  // Format: https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=...&organizationName=KodeToCareer&issueYear=2026&certUrl=...&certId=...
  const issueYear = issueDate.includes(",") ? issueDate.split(",")[1]?.trim() : "2026";
  const linkedInCertUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
    courseTitle
  )}&organizationName=${encodeURIComponent(
    "KodeToCareer"
  )}&issueYear=${issueYear}&certUrl=${encodeURIComponent(
    fullVerifyUrl
  )}&certId=${encodeURIComponent(certificateId)}`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `🎓 Just earned my official verified credential in "${courseTitle}" from @KodeToCareer!\n\nVerify certificate: ${fullVerifyUrl}\n\n#KodeToCareer #TechCareer #SoftwareEngineer`
  )}`;

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `🎓 I've earned my verified credential in "${courseTitle}" from KodeToCareer! Check out my official certificate here: ${fullVerifyUrl}`
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullVerifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyPostText = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedPost(true);
    setTimeout(() => setCopiedPost(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-sky-500/10 flex items-center gap-1.5 shrink-0"
      >
        <Share2 className="h-3.5 w-3.5" />
        <span>Share Credential</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Share2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Share KodeToCareer Credential</h3>
                  <p className="text-xs text-slate-400">Showcase your achievement to recruiters & network</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick 1-Click Platform Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <a
                href={linkedInCertUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-3 bg-blue-950/40 border border-blue-600/30 hover:border-blue-500 rounded-xl transition-all group"
              >
                <div className="h-9 w-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm group-hover:scale-105 transition-transform">
                  in
                </div>
                <span className="text-xs font-semibold text-slate-200">Add to LinkedIn</span>
                <span className="text-[10px] text-blue-400 flex items-center gap-0.5">
                  Direct License <ExternalLink className="h-2.5 w-2.5" />
                </span>
              </a>

              <a
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group"
              >
                <div className="h-9 w-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-sm group-hover:scale-105 transition-transform">
                  𝕏
                </div>
                <span className="text-xs font-semibold text-slate-200">Post on X</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                  Share Post <ExternalLink className="h-2.5 w-2.5" />
                </span>
              </a>

              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-3 bg-emerald-950/40 border border-emerald-600/30 hover:border-emerald-500 rounded-xl transition-all group"
              >
                <div className="h-9 w-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm group-hover:scale-105 transition-transform">
                  💬
                </div>
                <span className="text-xs font-semibold text-slate-200">WhatsApp</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                  Send Link <ExternalLink className="h-2.5 w-2.5" />
                </span>
              </a>
            </div>

            {/* Direct Link Copy */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Official Verification URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={fullVerifyUrl}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedLink ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Pre-formatted Post Text Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400">Copy Pre-formatted Social Post</label>
                <button
                  onClick={handleCopyPostText}
                  className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
                >
                  {copiedPost ? "Copied Post Text!" : "Copy Post Text"}
                </button>
              </div>
              <textarea
                readOnly
                rows={4}
                value={shareText}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 font-sans focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
