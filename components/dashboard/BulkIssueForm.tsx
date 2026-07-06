"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";

interface Course {
  id: string;
  title: string;
}

interface Props {
  courses: Course[];
}

export default function BulkIssueForm({ courses }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bulkResult, setBulkResult] = useState<any>(null);
  const [csvText, setCsvText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setBulkResult(null);

    const form = e.currentTarget;
    const courseId = (form.elements.namedItem("courseId") as HTMLSelectElement).value;
    const language = (form.elements.namedItem("language") as HTMLSelectElement).value;

    if (!csvText.trim()) {
      setError("Please paste CSV data or upload a CSV file.");
      setLoading(false);
      return;
    }

    // Basic CSV Parsing
    const lines = csvText.split("\n");
    const parsedStudents: Array<{ enrollmentNumber: string; grade?: string }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Skip header if matches common header names
      if (i === 0 && (line.toLowerCase().includes("enrollment") || line.toLowerCase().includes("grade"))) {
        continue;
      }

      const parts = line.split(",");
      const enrollmentNumber = parts[0]?.trim();
      const grade = parts[1]?.trim();

      if (enrollmentNumber) {
        parsedStudents.push({
          enrollmentNumber,
          grade: grade || undefined,
        });
      }
    }

    if (parsedStudents.length === 0) {
      setError("No valid student enrollment records found in CSV.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/certificates/bulk-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          language,
          students: parsedStudents,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message ?? "Failed to issue certificates");
        return;
      }

      setBulkResult(data.data);
      setCsvText("");
      form.reset();
      router.refresh(); // Refresh history
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      setError("Only CSV files are supported.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
      setError("");
    };
    reader.readAsText(file);
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sticky top-6">
      <h2 className="text-sm font-semibold text-slate-200 mb-4">Bulk Issue Certificates</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-xs text-rose-400 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {bulkResult && (
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <CheckCircle2 className="h-4 w-4" />
              <span>Bulk Issuance Complete!</span>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <p>Batch: <strong className="text-slate-200">{bulkResult.batchName}</strong></p>
              <p>Issued: <strong className="text-emerald-400">{bulkResult.successCount}</strong> / {bulkResult.totalCount}</p>
            </div>

            {/* Results Logs */}
            <div className="max-h-40 overflow-y-auto border border-slate-800 rounded-lg p-2 bg-slate-900/50 space-y-1">
              {bulkResult.results.map((r: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start gap-2 text-[10px] py-1 border-b border-slate-800/40 last:border-0">
                  <span className="font-mono text-slate-400">{r.enrollmentNumber}</span>
                  {r.success ? (
                    <span className="text-emerald-400 font-semibold">Success ({r.certificateId})</span>
                  ) : (
                    <span className="text-rose-400 text-right truncate max-w-[150px]" title={r.error}>
                      Error: {r.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Course</label>
          <select
            name="courseId"
            required
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-violet-500 transition-colors"
          >
            <option value="">— Select course —</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Language</label>
          <select
            name="language"
            required
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-violet-500 transition-colors"
          >
            <option value="en">English (EN)</option>
            <option value="es">Español (ES)</option>
            <option value="fr">Français (FR)</option>
          </select>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-150 ${
            dragActive
              ? "border-violet-500 bg-violet-500/5"
              : csvText
              ? "border-emerald-500/50 bg-emerald-500/5"
              : "border-slate-800 hover:border-slate-700 bg-slate-900/30"
          }`}
        >
          <input
            type="file"
            id="csv-file-upload"
            accept=".csv"
            className="hidden"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          />
          <label htmlFor="csv-file-upload" className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
            {csvText ? (
              <>
                <FileSpreadsheet className="h-8 w-8 text-emerald-400 mb-2" />
                <p className="text-xs font-medium text-emerald-400">CSV Loaded Successfully</p>
                <p className="text-[10px] text-slate-500 mt-1">Click to replace file</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-slate-500 mb-2" />
                <p className="text-xs font-medium text-slate-300">Drag & drop CSV file</p>
                <p className="text-[10px] text-slate-500 mt-1">or click to browse from device</p>
              </>
            )}
          </label>
        </div>

        {/* Text Area copy-paste fallback */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-medium text-slate-400">Or Paste CSV Data</label>
            <span className="text-[9px] text-slate-500 font-mono">Format: enrollmentNumber,grade</span>
          </div>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="KTC-2026-0001,A&#10;KTC-2026-0002,B+"
            rows={4}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 placeholder:text-slate-650 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-all"
        >
          {loading ? "Issuing Batch..." : "🚀 Launch Bulk Issuance"}
        </button>
      </form>
    </div>
  );
}
