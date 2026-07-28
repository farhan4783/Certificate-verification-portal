"use client";

import { useState } from "react";
import { Eye, EyeOff, Shield } from "lucide-react";
import Link from "next/link";
import KtcLogo from "@/components/ui/KtcLogo";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        const text = await res.text().catch(() => "");
        setError(`Server returned status ${res.status}: ${text || "Invalid response"}`);
        return;
      }

      if (!res.ok) {
        setError(data.error?.message ?? "Invalid email or password");
        return;
      }

      // Redirect based on role
      const role = data.data?.user?.role;
      if (role === "SUPER_ADMIN") {
        window.location.assign("/dashboard/admin");
      } else if (role === "TRAINER") {
        window.location.assign("/dashboard/trainer");
      } else if (role === "STUDENT") {
        window.location.assign("/dashboard/student");
      } else {
        window.location.assign("/");
      }
    } catch (err: any) {
      setError(err?.message ? `Connection error: ${err.message}` : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm z-10">
        {/* Logo Header */}
        <div className="text-center mb-6 flex justify-center">
          <KtcLogo size="xl" href="/" />
        </div>
        <div className="text-center mb-6">
          <h1 className="text-xl font-extrabold text-slate-900">Sign in to KodeToCareer</h1>
          <p className="text-xs text-slate-600 mt-1">Access your verified credentials and portal</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Display */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 leading-relaxed">
                <Shield className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@kodetocareer.com"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all mt-2 shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5"
            >
              {loading ? "Authenticating…" : "Sign In →"}
            </button>
          </form>

          {/* Quick Demo credentials */}
          <div className="mt-5 pt-5 border-t border-slate-200">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 mb-2.5 text-center">
              Quick Test Credentials
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { role: "Super Admin", email: "admin@kodetocareer.com", pwd: "admin1234" },
                { role: "Trainer", email: "arbaaz@kodetocareer.com", pwd: "trainer1234" },
                { role: "Student", email: "student@kodetocareer.com", pwd: "student1234" },
              ].map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => {
                    (document.getElementById("email") as HTMLInputElement).value = cred.email;
                    (document.getElementById("password") as HTMLInputElement).value = cred.pwd;
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors text-left"
                >
                  <span className="text-xs text-blue-600 font-bold">{cred.role}</span>
                  <span className="text-xs text-slate-600 font-mono truncate ml-2">{cred.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Verify a credential without logging in?{" "}
          <Link href="/verify" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
            Verify here →
          </Link>
        </p>
      </div>
    </div>
  );
}
