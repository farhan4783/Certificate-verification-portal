"use client";

import { useState } from "react";
import { ShieldCheck, AlertTriangle, XCircle, Search, ExternalLink, RefreshCw, Cpu, Award } from "lucide-react";

export default function HomeVerifyWidget() {
  const [certId, setCertId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!certId.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/verify/${certId.trim()}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to verify credential");
      }

      setResult(json.data);
    } catch (err: any) {
      setError(err.message || "An error occurred during verification");
    } finally {
      setLoading(false);
    }
  }

  const statusStyles: Record<string, { bg: string; text: string; border: string; icon: any; title: string }> = {
    VALID: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      icon: <ShieldCheck className="h-10 w-10 text-emerald-400" />,
      title: "Verified Credential",
    },
    REVOKED: {
      bg: "bg-rose-500/10",
      text: "text-rose-450",
      border: "border-rose-500/20",
      icon: <XCircle className="h-10 w-10 text-rose-400" />,
      title: "Revoked Credential",
    },
    EXPIRED: {
      bg: "bg-amber-500/10",
      text: "text-amber-450",
      border: "border-amber-500/20",
      icon: <AlertTriangle className="h-10 w-10 text-amber-400" />,
      title: "Expired Credential",
    },
    INVALID: {
      bg: "bg-slate-905",
      text: "text-rose-400",
      border: "border-slate-800",
      icon: <XCircle className="h-10 w-10 text-rose-400" />,
      title: "Invalid Credential",
    },
  };

  const style = result ? statusStyles[result.result] || statusStyles.INVALID : statusStyles.INVALID;

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      
      {/* Search Input Box */}
      <form onSubmit={handleVerify} className="relative flex gap-2 p-1.5 bg-slate-900 border border-slate-800/80 rounded-2xl focus-within:border-amber-500/50 shadow-2xl transition-all duration-300">
        <div className="flex items-center pl-3 text-slate-500">
          <Search className="h-5 w-5" />
        </div>
        <input
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          type="text"
          placeholder="Enter Certificate ID (e.g. KTC-BOOTCAMP-2026-0001)"
          className="flex-1 bg-transparent border-0 text-slate-205 text-sm rounded-xl px-2 py-3 focus:outline-none placeholder:text-slate-600 font-mono"
        />
        <button
          type="submit"
          disabled={loading || !certId.trim()}
          className="px-5 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-sm rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-amber-500/10"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            "Verify"
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-450 flex items-center gap-2 animate-slide-down">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Slide-Open Result Card */}
      {result && (
        <div className={`border rounded-2xl p-6 sm:p-8 bg-slate-900/60 shadow-2xl backdrop-blur-xl animate-scale-up ${style.border} transition-all duration-300`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
            <div className={`p-3.5 rounded-2xl border shrink-0 ${style.bg} ${style.border}`}>
              {style.icon}
            </div>
            
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <h3 className={`text-lg font-bold tracking-tight ${style.text}`}>{style.title}</h3>
                <span className="font-mono text-xs text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg select-all max-w-max self-center sm:self-auto">
                  {result.certificate?.certificateId || certId}
                </span>
              </div>

              {result.result === "VALID" && result.certificate ? (
                <>
                  <div className="text-xs text-slate-400 space-y-1 pt-1.5">
                    <p>Recipient: <strong className="text-slate-200">{result.certificate.studentName}</strong></p>
                    <p>Program: <strong className="text-slate-200">{result.certificate.courseTitle}</strong></p>
                    <p>Institution: <strong className="text-slate-300">{result.certificate.organizationName}</strong></p>
                    <p>Instructor: <strong className="text-slate-350">{result.certificate.trainerName}</strong></p>
                    <p>Issue Date: <strong className="text-slate-350">{result.certificate.issueDate}</strong></p>
                    {result.certificate.language && (
                      <p>Language: <strong className="text-slate-350">{result.certificate.language === "es" ? "Español (ES)" : result.certificate.language === "fr" ? "Français (FR)" : "English (EN)"}</strong></p>
                    )}
                  </div>

                  {/* Blockchain Anchor verification */}
                  {result.certificate.blockchainTxHash && (
                    <div className="mt-4 p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between gap-3 text-[10px] font-mono">
                      <div className="flex items-center gap-2 text-cyan-400">
                        <Cpu className="h-4 w-4 shrink-0" />
                        <span className="font-bold">Ledger verified</span>
                      </div>
                      <span className="text-slate-450 truncate max-w-[180px]">{result.certificate.blockchainTxHash}</span>
                    </div>
                  )}

                  {/* Detail link & PDF button */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <a
                      href={`/verify/${result.certificate.certificateId}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-650 font-semibold text-xs rounded-xl transition duration-150"
                    >
                      <Award className="h-4 w-4" />
                      View Audit Details
                    </a>
                    {result.certificate.pdfUrl && (
                      <a
                        href={result.certificate.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-md transition duration-150"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Original PDF
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-500 pt-2 leading-relaxed">
                  {result.result === "REVOKED"
                    ? "This credential has been officially revoked by the issuing authority and is no longer valid."
                    : result.result === "EXPIRED"
                    ? "This credential has passed its expiration date and is no longer active."
                    : "No record matches this ID. Verify spelling, ensure the document has been fully issued, or contact support."}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
