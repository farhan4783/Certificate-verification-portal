"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, X, Check, Copy, Eye, EyeOff } from "lucide-react";

interface EnrollStudentModalProps {
  courses: Array<{ id: string; title: string; code?: string | null }>;
  batches: Array<{ id: string; batchName: string; courseId: string }>;
}

interface CreatedCredentials {
  email: string;
  password: string;
  enrollmentNumber: string;
  name: string;
}

export default function EnrollStudentModal({ courses, batches }: EnrollStudentModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<CreatedCredentials | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    courseId: "",
    batchId: "",
  });

  // Filter batches by selected course
  const filteredBatches = form.courseId
    ? batches.filter((b) => b.courseId === form.courseId)
    : batches;

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", courseId: "", batchId: "" });
    setError("");
    setCredentials(null);
  };

  const handleOpen = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (credentials) {
      router.refresh();
    }
    resetForm();
  };

  const generatePassword = () => {
    const chars = "abcdefghijkmnpqrstuvwxyz23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, password: pass });
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 2000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 2000);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/enroll-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Enrollment failed");
      }

      setCredentials({
        email: data.data.credentials.email,
        password: data.data.credentials.password,
        enrollmentNumber: data.data.student.enrollmentNumber,
        name: form.name,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-500/20 hover:from-sky-600 hover:to-blue-700 transition-all flex items-center gap-2"
      >
        <UserPlus className="h-4 w-4" />
        Quick Enroll Student
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {credentials ? "✅ Student Enrolled!" : "Quick Enroll Student"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {credentials
                    ? "Share these credentials with the student."
                    : "Create login credentials and assign to a batch."}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              {credentials ? (
                /* Success — Show Credentials */
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-sm font-bold text-emerald-800">
                      🎉 {credentials.name} has been enrolled successfully!
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">
                      Enrollment ID: <span className="font-mono font-bold">{credentials.enrollmentNumber}</span>
                    </p>
                  </div>

                  {/* Credentials Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Login Credentials</h3>

                    {/* Email */}
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2.5">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Email</p>
                        <p className="text-sm font-mono font-bold text-slate-900">{credentials.email}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(credentials.email, "email")}
                        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        {copiedField === "email" ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    </div>

                    {/* Password */}
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2.5">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Password</p>
                        <p className="text-sm font-mono font-bold text-slate-900">
                          {showPassword ? credentials.password : "•".repeat(credentials.password.length)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-slate-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(credentials.password, "password")}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          {copiedField === "password" ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Copy All */}
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `KodeToCareer Login Credentials\n\nName: ${credentials.name}\nEnrollment ID: ${credentials.enrollmentNumber}\nEmail: ${credentials.email}\nPassword: ${credentials.password}\nLogin URL: ${typeof window !== "undefined" ? window.location.origin : ""}/login`,
                          "all"
                        )
                      }
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        copiedField === "all"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {copiedField === "all" ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          All Credentials Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy All Credentials (to share with student)
                        </>
                      )}
                    </button>
                  </div>

                  {/* Enroll Another */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={resetForm}
                      className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Enroll Another Student
                    </button>
                    <button
                      onClick={handleClose}
                      className="flex-1 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Student Email *
                    </label>
                    <input
                      type="email"
                      placeholder="priya@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Password *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Min 6 characters"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                        minLength={6}
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-colors whitespace-nowrap"
                      >
                        🎲 Generate
                      </button>
                    </div>
                  </div>

                  {/* Course */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Course *
                    </label>
                    <select
                      value={form.courseId}
                      onChange={(e) => setForm({ ...form, courseId: e.target.value, batchId: "" })}
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="">Select Course</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} {c.code ? `(${c.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Batch */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Batch (Optional)
                    </label>
                    <select
                      value={form.batchId}
                      onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="">No Batch (assign later)</option>
                      {filteredBatches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.batchName}
                        </option>
                      ))}
                    </select>
                    {form.courseId && filteredBatches.length === 0 && (
                      <p className="text-[10px] text-amber-600 font-medium mt-1">No active batches for this course.</p>
                    )}
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-5 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold rounded-xl shadow-md shadow-sky-500/20 hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enrolling Student...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Enroll Student
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
