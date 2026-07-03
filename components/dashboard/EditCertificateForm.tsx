"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, ShieldAlert } from "lucide-react";

interface CertificateData {
  id: string;
  certificateId: string;
  grade: string | null;
  status: string;
  student: {
    user: {
      name: string;
    };
  };
  course: {
    title: string;
  };
}

interface Props {
  certificate: CertificateData;
}

export default function EditCertificateForm({ certificate }: Props) {
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
    data.id = certificate.id; // Include Certificate ID

    try {
      const res = await fetch("/api/certificates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message || "Failed to update certificate");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/admin/certificates");
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
          href="/dashboard/admin/certificates"
          className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to certificates
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Edit Certificate Status</h1>
        <p className="text-slate-400 text-sm mt-1">
          Revoke, expire, re-issue, or edit grades for certificate ID: <span className="font-mono text-amber-400">{certificate.certificateId}</span>.
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
              Certificate state updated successfully! Redirecting...
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Info */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Recipient Student</label>
              <input
                type="text"
                disabled
                defaultValue={certificate.student.user.name}
                className="w-full bg-slate-800/40 border border-slate-800 text-slate-400 text-sm rounded-xl px-4 py-3 cursor-not-allowed"
              />
            </div>

            {/* Course Info */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Enrolled Course</label>
              <input
                type="text"
                disabled
                defaultValue={certificate.course.title}
                className="w-full bg-slate-800/40 border border-slate-800 text-slate-400 text-sm rounded-xl px-4 py-3 cursor-not-allowed"
              />
            </div>

            {/* Grade Field */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Grade / Evaluation</label>
              <input
                name="grade"
                type="text"
                defaultValue={certificate.grade || ""}
                placeholder="A+ or 98%"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Certificate Status State</label>
              <select
                name="status"
                required
                defaultValue={certificate.status}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="GENERATED">GENERATED (Approved)</option>
                <option value="ISSUED">ISSUED (Live & Verified)</option>
                <option value="REVOKED">REVOKED (Invalidated)</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold text-sm rounded-xl transition-all"
          >
            {loading ? "Saving modifications..." : "🚀 Save Certificate State"}
          </button>
        </form>
      </div>
    </div>
  );
}
