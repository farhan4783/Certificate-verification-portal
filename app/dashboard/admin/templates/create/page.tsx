"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, ShieldAlert } from "lucide-react";

export default function CreateTemplatePage() {
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

    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message || "Failed to create template");
        return;
      }

      setSuccess(true);
      form.reset();
      setTimeout(() => {
        router.push("/dashboard/admin/templates");
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
          href="/dashboard/admin/templates"
          className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to templates
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Create Certificate Template</h1>
        <p className="text-slate-400 text-sm mt-1">
          Set up a new certificate layout configuration with a design template, orientation, and typography settings.
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
              Template created successfully! Redirecting...
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Template Name</label>
              <input
                name="name"
                type="text"
                required
                placeholder="Advanced Cohort Golden Template"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Background Image URL */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Background Image URL (optional)</label>
              <input
                name="backgroundImage"
                type="url"
                placeholder="https://res.cloudinary.com/.../certificate-bg.png"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Orientation */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Orientation</label>
                <select
                  name="orientation"
                  required
                  defaultValue="landscape"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors"
                >
                  <option value="landscape">Landscape (A4 - 297mm x 210mm)</option>
                  <option value="portrait">Portrait (A4 - 210mm x 297mm)</option>
                </select>
              </div>

              {/* Font */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Font Style</label>
                <select
                  name="font"
                  required
                  defaultValue="Inter"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors"
                >
                  <option value="Inter">Inter (Clean, Modern Sans)</option>
                  <option value="Outfit">Outfit (Geometric, Premium)</option>
                  <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
                  <option value="Times New Roman">Times New Roman (Traditional)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold text-sm rounded-xl transition-all"
          >
            {loading ? "Creating template layout..." : "🎨 Create Certificate Template"}
          </button>
        </form>
      </div>
    </div>
  );
}
