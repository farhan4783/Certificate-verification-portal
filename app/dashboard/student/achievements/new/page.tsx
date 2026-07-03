"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, ShieldAlert } from "lucide-react";

export default function NewAchievementPage() {
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
      const res = await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message || "Failed to add achievement");
        return;
      }

      setSuccess(true);
      form.reset();
      setTimeout(() => {
        router.push("/dashboard/student/achievements");
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
          href="/dashboard/student/achievements"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to achievements
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Add Achievement</h1>
        <p className="text-slate-400 text-sm mt-1">
          Record hackathons, academic awards, certificates, or competitions to showcase on your profile.
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
              Achievement added successfully! Redirecting...
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Achievement Title</label>
              <input
                name="title"
                type="text"
                required
                placeholder="1st Place - Silicon Valley Hackathon"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Issuer */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Issuer / Organization</label>
              <input
                name="issuer"
                type="text"
                placeholder="Major League Hacking (MLH)"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Category Type</label>
              <select
                name="type"
                required
                defaultValue="OTHER"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="ACADEMIC">Academic Degree/Scholarship</option>
                <option value="HACKATHON">Hackathon Award</option>
                <option value="COMPETITION">Coding Competition</option>
                <option value="CERTIFICATION">Professional Certification</option>
                <option value="OPEN_SOURCE">Open Source Contribution</option>
                <option value="PUBLICATION">Research Publication</option>
                <option value="AWARD">Honors &amp; General Award</option>
                <option value="OTHER">Other Achievement</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Date Earned</label>
              <input
                name="achievementDate"
                type="date"
                required
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Credential URL */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Credential Verification Link (optional)</label>
              <input
                name="credentialUrl"
                type="url"
                placeholder="https://verify.mlh.io/..."
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
              placeholder="Briefly describe what you did, the competition scale, or the certification details..."
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
              Pin this achievement to your dashboard showcase (Featured Achievement)
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold text-sm rounded-xl transition-all"
          >
            {loading ? "Adding achievement..." : "🚀 Add Achievement"}
          </button>
        </form>
      </div>
    </div>
  );
}
