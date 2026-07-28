"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import KtcLogo from "@/components/ui/KtcLogo";
import { ArrowLeft, Loader2, Plus, Calendar, Link2, FolderOpen, MonitorPlay } from "lucide-react";

interface Course {
  id: string;
  title: string;
  code?: string;
}

interface Trainer {
  id: string;
  user: { name: string };
}

export default function CreateBatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [form, setForm] = useState({
    batchName: "",
    courseId: "",
    trainerId: "",
    meetLink: "",
    driveFolderUrl: "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch courses and trainers
  useEffect(() => {
    async function loadOptions() {
      try {
        const [coursesRes, trainersRes] = await Promise.all([
          fetch("/api/courses"),
          fetch("/api/trainers"),
        ]);
        const coursesData = await coursesRes.json();
        const trainersData = await trainersRes.json();
        setCourses(coursesData.data || []);
        setTrainers(trainersData.data || []);
      } catch {}
    }
    loadOptions();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to create batch");
      }

      setSuccess(`Batch "${form.batchName}" created successfully!`);
      setTimeout(() => router.push("/dashboard/admin/batches"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Batches
        </button>
        <h1 className="text-2xl font-extrabold text-slate-900">Create New Batch</h1>
        <p className="text-sm text-slate-600 mt-1">
          Set up a new KodeToCareer batch with Google Meet &amp; Drive integration.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        {/* Batch Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Batch Name *
          </label>
          <input
            type="text"
            placeholder='e.g. "MERN Stack Batch 3 - July 2026"'
            value={form.batchName}
            onChange={(e) => setForm({ ...form, batchName: e.target.value })}
            required
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Course + Trainer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Course *
            </label>
            <select
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
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
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Trainer *
            </label>
            <select
              value={form.trainerId}
              onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select Trainer</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Meet Link */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MonitorPlay className="h-3.5 w-3.5 text-blue-600" />
            Google Meet Link
          </label>
          <input
            type="url"
            placeholder="https://meet.google.com/abc-defg-hij"
            value={form.meetLink}
            onChange={(e) => setForm({ ...form, meetLink: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            The daily Google Meet link for this batch. Students will see a &quot;Join Class&quot; button on their dashboard.
          </p>
        </div>

        {/* Drive Folder */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FolderOpen className="h-3.5 w-3.5 text-amber-600" />
            Google Drive Recording Folder URL
          </label>
          <input
            type="url"
            placeholder="https://drive.google.com/drive/folders/..."
            value={form.driveFolderUrl}
            onChange={(e) => setForm({ ...form, driveFolderUrl: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Paste your batch recording folder. Use the &quot;Copy All Emails&quot; button in Batch Control to quickly share the folder with all enrolled students.
          </p>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-600" />
              Start Date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-600" />
              End Date
            </label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-3 rounded-xl">
            {success}
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
              Creating Batch...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create Batch
            </>
          )}
        </button>
      </form>
    </div>
  );
}
