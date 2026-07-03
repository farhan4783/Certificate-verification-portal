"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, ShieldAlert } from "lucide-react";

export default function CreateTrainerPage() {
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
      const res = await fetch("/api/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message || "Failed to create trainer");
        return;
      }

      setSuccess(true);
      form.reset();
      setTimeout(() => {
        router.push("/dashboard/admin/trainers");
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
          href="/dashboard/admin/trainers"
          className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to trainers
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Add New Trainer</h1>
        <p className="text-slate-400 text-sm mt-1">
          Create a new user account with the Trainer role and set up their profile.
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
              Trainer created successfully! Redirecting...
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
              <input
                name="name"
                type="text"
                required
                placeholder="John Doe"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
              <input
                name="email"
                type="email"
                required
                placeholder="trainer@kodetocareer.com"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Designation</label>
              <input
                name="designation"
                type="text"
                placeholder="Lead Web Development Instructor"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Years of Experience</label>
              <input
                name="yearsOfExperience"
                type="number"
                placeholder="10"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Skills (comma-separated)</label>
              <input
                name="skills"
                type="text"
                placeholder="React, Node.js, TypeScript"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">LinkedIn Profile Link</label>
              <input
                name="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/..."
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* GitHub */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">GitHub Profile Link</label>
              <input
                name="githubUrl"
                type="url"
                placeholder="https://github.com/..."
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Professional Bio</label>
            <textarea
              name="bio"
              rows={3}
              placeholder="Tell us about the instructor's background..."
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold text-sm rounded-xl transition-all"
          >
            {loading ? "Creating account..." : "🚀 Create Trainer Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
