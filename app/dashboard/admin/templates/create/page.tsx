"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, ShieldAlert } from "lucide-react";
import TemplateBuilder from "@/components/dashboard/TemplateBuilder";

export default function CreateTemplatePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSave = async (data: any) => {
    setIsSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          orientation: "landscape",
          font: "Inter",
          layoutJson: data.layoutJson,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message || "Failed to create template");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/admin/templates");
      }, 1200);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/admin/templates"
          className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to template registry
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Create & Design Certificate Template</h1>
        <p className="text-slate-400 text-sm mt-1">
          Customize design theme presets, typography, watermarks, branding colors, and view real-time high-DPI PDF previews.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl text-sm text-rose-400">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-sm text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Certificate template saved successfully! Redirecting to templates list...
        </div>
      )}

      <TemplateBuilder onSave={handleSave} isSaving={isSaving} />
    </div>
  );
}
