"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyEmailsButtonProps {
  emails: string[];
  batchName: string;
}

export default function CopyEmailsButton({ emails, batchName }: CopyEmailsButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Join emails with comma + space for easy pasting into Google Drive sharing
      const emailList = emails.join(", ");
      await navigator.clipboard.writeText(emailList);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = emails.join(", ");
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
        copied
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
      }`}
      title={`Copy all ${emails.length} student emails for Google Drive sharing`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          {emails.length} Emails Copied!
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy All Emails for Drive
        </>
      )}
    </button>
  );
}
