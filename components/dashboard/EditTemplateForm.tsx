"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, ShieldAlert } from "lucide-react";

interface TemplateData {
  id: string;
  name: string;
  backgroundImage: string;
  orientation: string;
  font: string;
  active: boolean;
}

interface Props {
  template: TemplateData;
}

export default function EditTemplateForm({ template }: Props) {
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
    data.id = template.id; // Include Template ID
    data.active = formData.get("active") === "true" ? (true as any) : (false as any);

    try {
      const res = await fetch("/api/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message || "Failed to update template");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/admin/templates");
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
          href="/dashboard/admin/templates"
          className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to templates
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Edit Certificate Template</h1>
        <p className="text-slate-400 text-sm mt-1">
          Modify font styles, orientation layouts, background image assets, and activation state.
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
              Certificate template configuration updated! Redirecting...
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Template Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Template Name</label>
              <input
                name="name"
                type="text"
                required
                defaultValue={template.name}
                placeholder="Full Stack Web Dev Graduation Layout"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Background Image URL */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Background Image URL</label>
              <input
                name="backgroundImage"
                type="url"
                required
                defaultValue={template.backgroundImage}
                placeholder="https://example.com/certificate-bg.png"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Orientation Select */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Orientation</label>
              <select
                name="orientation"
                required
                defaultValue={template.orientation}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="landscape">Landscape (Horizontal)</option>
                <option value="portrait">Portrait (Vertical)</option>
              </select>
            </div>

            {/* Font Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Primary Font</label>
              <select
                name="font"
                required
                defaultValue={template.font}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="Inter">Inter</option>
                <option value="Playfair Display">Playfair Display (Serif)</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Lora">Lora</option>
                <option value="Alex Brush">Alex Brush (Script)</option>
              </select>
            </div>

            {/* Active Status */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Active Status</label>
              <select
                name="active"
                required
                defaultValue={template.active ? "true" : "false"}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="true">Active (Available for issuance)</option>
                <option value="false">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold text-sm rounded-xl transition-all"
          >
            {loading ? "Saving template modifications..." : "🚀 Save Template Configurations"}
          </button>
        </form>
      </div>
    </div>
  );
}
