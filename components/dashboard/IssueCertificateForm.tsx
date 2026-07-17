"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, ShieldCheck, Sparkles, CheckCircle2, RefreshCw } from "lucide-react";

interface Student {
  id: string;
  user: {
    name: string;
    email: string;
  };
}

interface Course {
  id: string;
  title: string;
}

interface Props {
  eligibleStudents: Student[];
  courses: Course[];
}

export default function IssueCertificateForm({ eligibleStudents, courses }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [grade, setGrade] = useState("");
  const [language, setLanguage] = useState("en");

  const router = useRouter();

  const selectedStudent = eligibleStudents.find((s) => s.id === studentId);
  const selectedCourse = courses.find((c) => c.id === courseId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!studentId || !courseId) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/certificates/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, courseId, grade, language }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message ?? "Failed to issue certificate");
        return;
      }

      setSuccess(true);
      setStudentId("");
      setCourseId("");
      setGrade("");
      setLanguage("en");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const langTitleMap: Record<string, string> = {
    en: "CERTIFICATE OF COMPLETION",
    es: "CERTIFICADO DE FINALIZACIÓN",
    fr: "CERTIFICAT DE RÉUSSITE",
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sticky top-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-400" />
          Issue New Certificate
        </h2>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-850 px-2 py-0.5 rounded border border-slate-800">
          Instant Ledger Engine
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-xs text-rose-400 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Certificate issued successfully & background task enqueued!</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Student</label>
          <select
            name="studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="">— Select student —</option>
            {eligibleStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.user.name} ({student.user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Course</label>
          <select
            name="courseId"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="">— Select course —</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Grade / Score (optional)</label>
            <input
              name="grade"
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g. A, 95%"
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 placeholder:text-slate-650 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Language</label>
            <select
              name="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="en">English (EN)</option>
              <option value="es">Español (ES)</option>
              <option value="fr">Français (FR)</option>
            </select>
          </div>
        </div>

        {/* Live Visual Certificate Card Preview */}
        <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/60 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-850 pb-2">
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> Live Visual Certificate Preview
            </span>
            <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {language}
            </span>
          </div>

          <div className="text-center space-y-2 py-2">
            <div className="text-[10px] tracking-wider text-amber-500 font-bold uppercase">
              {langTitleMap[language] || langTitleMap.en}
            </div>
            <div className="text-sm font-bold text-slate-100">
              {selectedStudent ? selectedStudent.user.name : "Student Full Name"}
            </div>
            <div className="text-xs text-slate-400">
              {selectedCourse ? selectedCourse.title : "Course / Program Name"}
            </div>
            {grade && (
              <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Grade: {grade}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-[10px] text-slate-500 font-mono">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="h-3 w-3 text-emerald-400" /> Tamper-proof SHA-256
            </span>
            <span>KTC-{new Date().getFullYear()}-XXXX</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !studentId || !courseId}
          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-sm rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating & Issuing...
            </>
          ) : (
            <>
              🚀 Issue Certificate
            </>
          )}
        </button>
      </form>
    </div>
  );
}

