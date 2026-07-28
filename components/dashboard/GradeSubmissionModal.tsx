"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Star, X } from "lucide-react";

interface GradeSubmissionModalProps {
  submissionId: string;
  studentName: string;
  projectTitle: string;
  currentScore?: number | null;
  currentFeedback?: string | null;
}

export default function GradeSubmissionModal({
  submissionId,
  studentName,
  projectTitle,
  currentScore,
  currentFeedback,
}: GradeSubmissionModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [score, setScore] = useState(currentScore !== undefined && currentScore !== null ? String(currentScore) : "85");
  const [feedback, setFeedback] = useState(currentFeedback || "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/trainer/assignments/${submissionId}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: Number(score),
          feedback,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to grade submission");
      }

      setSuccess("Submission graded successfully! Progress updated.");
      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
          currentScore !== undefined && currentScore !== null
            ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
        }`}
      >
        {currentScore !== undefined && currentScore !== null ? "Edit Grade" : "Grade Project →"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Grade Sunday Project</h2>
                <p className="text-xs text-slate-500">{studentName} · {projectTitle}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-500" /> Score (out of 100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Trainer Written Feedback
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Excellent work on API route handling and state management. UI looks polished."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-3 py-2 rounded-xl">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5">
                  <Check className="h-4 w-4" /> {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold rounded-xl shadow-md hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Grade & Update Progress"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
