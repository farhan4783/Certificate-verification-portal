"use client";

import { useState } from "react";
import { Upload, FileCheck2, AlertTriangle, ShieldCheck, RefreshCw, ExternalLink } from "lucide-react";

export default function PdfFileVerifier() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      verifyFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      verifyFile(selected);
    }
  };

  const verifyFile = async (fileToVerify: File) => {
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", fileToVerify);

    try {
      const res = await fetch("/api/verify/file-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        success: false,
        error: "Failed to connect to verification server.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-100">PDF Document Tamper Inspector</h3>
          <p className="text-xs text-slate-400">
            Upload your downloaded PDF certificate to run a live SHA-256 binary checksum integrity verification.
          </p>
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative overflow-hidden ${
          dragOver
            ? "border-amber-500 bg-amber-500/10"
            : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/70"
        }`}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />

        {loading ? (
          <div className="space-y-3 py-4">
            <RefreshCw className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs font-mono text-amber-400">Computing SHA-256 Hash & Querying DB Ledger...</p>
          </div>
        ) : file ? (
          <div className="space-y-2 py-2">
            <FileCheck2 className="h-8 w-8 text-amber-400 mx-auto" />
            <p className="text-xs font-bold text-slate-200">{file.name}</p>
            <p className="text-[10px] text-slate-400 font-mono">{(file.size / 1024).toFixed(1)} KB • PDF Document</p>
            <p className="text-[10px] text-amber-400 underline">Click or drop another file to re-verify</p>
          </div>
        ) : (
          <div className="space-y-2 py-4">
            <Upload className="h-8 w-8 text-slate-500 mx-auto group-hover:scale-110 transition-transform" />
            <p className="text-sm font-semibold text-slate-300">Drag & Drop PDF Certificate here</p>
            <p className="text-xs text-slate-500">or browse from your device</p>
          </div>
        )}
      </div>

      {/* Result Display */}
      {result && (
        <div className="pt-2">
          {result.verified ? (
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <FileCheck2 className="h-5 w-5" /> 100% Genuine & Authentic Credential
              </div>
              <p className="text-xs text-slate-300">
                The binary SHA-256 hash matches the active issue record in the official database ledger.
              </p>

              <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient:</span>
                  <span className="text-slate-100 font-sans font-bold">{result.certificate.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Course:</span>
                  <span className="text-slate-200 font-sans">{result.certificate.courseTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Credential ID:</span>
                  <span className="text-amber-400">{result.certificate.certificateId}</span>
                </div>
                <div className="truncate">
                  <span className="text-slate-500 block mb-0.5">SHA-256 HASH:</span>
                  <span className="text-[10px] text-emerald-400 select-all">{result.hash}</span>
                </div>
              </div>

              <div className="pt-1">
                <a
                  href={result.certificate.verifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  Open Full Verified Certificate Page <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="h-5 w-5" /> Integrity Check Failed / Tampered Document
              </div>
              <p className="text-xs text-slate-300">{result.message || "This PDF file hash does not exist in our registry."}</p>

              {result.hash && (
                <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800 text-[10px] font-mono">
                  <span className="text-slate-500 block mb-0.5">COMPUTED FILE HASH:</span>
                  <span className="text-rose-400 select-all">{result.hash}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
