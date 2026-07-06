"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const form = e.currentTarget;
    const studentId = (form.elements.namedItem("studentId") as HTMLSelectElement).value;
    const courseId = (form.elements.namedItem("courseId") as HTMLSelectElement).value;
    const grade = (form.elements.namedItem("grade") as HTMLInputElement).value;
    const language = (form.elements.namedItem("language") as HTMLSelectElement).value;

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
      form.reset();
      router.refresh(); // Refresh dashboard to show the new certificate in history
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sticky top-6">
      <h2 className="text-sm font-semibold text-slate-200 mb-4">Issue New Certificate</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-xs text-rose-400">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400">
            🎉 Certificate issued successfully and email dispatched!
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Student</label>
          <select
            name="studentId"
            required
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-violet-500 transition-colors"
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Grade / Score (optional)</label>
            <input
              name="grade"
              type="text"
              placeholder="e.g. A, 95%"
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 placeholder:text-slate-650 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Language</label>
            <select
              name="language"
              required
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="en">English (EN)</option>
              <option value="es">Español (ES)</option>
              <option value="fr">Français (FR)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-all"
        >
          {loading ? "Generating & Issuing..." : "🚀 Issue Certificate"}
        </button>
      </form>
    </div>
  );
}
