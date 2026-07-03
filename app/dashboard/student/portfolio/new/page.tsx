"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, ShieldAlert } from "lucide-react";

export default function NewProjectPage() {
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
    // Parse isFeatured checkbox
    data.isFeatured = (formData.get("isFeatured") === "on") as any;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message || "Failed to add project");
        return;
      }

      setSuccess(true);
      form.reset();
      setTimeout(() => {
        router.push("/dashboard/student/portfolio");
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
          href="/dashboard/student/portfolio"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to portfolio
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Add New Project</h1>
        <p className="text-slate-400 text-sm mt-1">
          Showcase your skills by adding a development project to your portfolio.
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
              Project added successfully! Redirecting...
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Project Title</label>
              <input
                name="title"
                type="text"
                required
                placeholder="FinSync AI - FinTech Dashboard"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Tech Stack */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Tech Stack (comma-separated)</label>
              <input
                name="techStack"
                type="text"
                placeholder="Next.js, Tailwind CSS, PostgreSQL"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Live Demo URL */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Live Demo URL (optional)</label>
              <input
                name="projectUrl"
                type="url"
                placeholder="https://my-app.vercel.app"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* GitHub URL */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">GitHub Repository URL (optional)</label>
              <input
                name="githubUrl"
                type="url"
                placeholder="https://github.com/username/repo"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Thumbnail Image URL (optional)</label>
              <input
                name="imageUrl"
                type="url"
                placeholder="https://res.cloudinary.com/.../project.png"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Briefly describe the project, its goals, and your achievements..."
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600 resize-none"
            />
          </div>

          {/* Featured checkbox */}
          <div className="flex items-center gap-2.5">
            <input
              id="isFeatured"
              name="isFeatured"
              type="checkbox"
              className="h-4 w-4 bg-slate-800 border-slate-700 rounded text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="isFeatured" className="text-xs text-slate-400 select-none">
              Pin this project to your dashboard showcase (Featured Project)
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold text-sm rounded-xl transition-all"
          >
            {loading ? "Adding project..." : "🚀 Add Project to Portfolio"}
          </button>
        </form>
      </div>
    </div>
  );
}
