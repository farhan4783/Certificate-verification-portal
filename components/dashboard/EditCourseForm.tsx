"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, ShieldAlert } from "lucide-react";

interface Trainer {
  id: string;
  user: {
    name: string;
  };
}

interface Template {
  id: string;
  name: string;
}

interface CourseData {
  id: string;
  title: string;
  code: string | null;
  subtitle: string | null;
  duration: string | null;
  description: string | null;
  trainerId: string;
  templateId: string | null;
}

interface Props {
  course: CourseData;
  trainers: Trainer[];
  templates: Template[];
}

export default function EditCourseForm({ course, trainers, templates }: Props) {
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
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.id = course.id; // Include Course ID

    try {
      const res = await fetch("/api/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message || "Failed to update course");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/admin/courses");
        router.refresh();
      }, 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/dashboard/admin/courses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to courses
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Edit Course Details</h1>
        <p className="text-slate-400 text-sm mt-1">
          Modify course descriptions, durations, code, template designs, or assign to another instructor.
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/25 rounded-lg text-sm text-rose-400">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-sm text-emerald-400">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Course updated and saved successfully! Redirecting...
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Course Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Course Title</label>
              <input
                name="title"
                type="text"
                required
                defaultValue={course.title}
                placeholder="Full Stack Web Development Bootcamp"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Course Code */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Course Code (optional)</label>
              <input
                name="code"
                type="text"
                defaultValue={course.code || ""}
                placeholder="FSWDB-2026"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600 font-mono"
              />
            </div>

            {/* Course Duration */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Duration</label>
              <input
                name="duration"
                type="text"
                defaultValue={course.duration || ""}
                placeholder="12 Weeks"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Trainer Assign Select */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Assign Trainer (Instructor)</label>
              <select
                name="trainerId"
                required
                defaultValue={course.trainerId}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="">— Select trainer —</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Certificate Template Assign Select */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Assign Certificate Template</label>
              <select
                name="templateId"
                defaultValue={course.templateId || ""}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="">— Select design template —</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Course Description</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={course.description || ""}
              placeholder="Brief course curriculum summary..."
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold text-sm rounded-xl transition-all"
          >
            {loading ? "Saving modifications..." : "🚀 Save Course Details"}
          </button>
        </form>
      </div>
    </div>
  );
}
