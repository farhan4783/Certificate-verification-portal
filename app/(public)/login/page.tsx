"use client";

import { useState } from "react";
import { Award, Eye, EyeOff, Shield } from "lucide-react";
import Link from "next/link";

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
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message ?? "Invalid credentials");
        return;
      }

      // Redirect based on role
      const role = data.data?.user?.role;
      if (role === "SUPER_ADMIN") window.location.href = "/dashboard/admin";
      else if (role === "TRAINER") window.location.href = "/dashboard/trainer";
      else if (role === "STUDENT") window.location.href = "/dashboard/student";
      else window.location.href = "/";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Award className="h-6 w-6 text-amber-400" />
            </div>
            <span className="font-bold text-sm tracking-widest bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent uppercase">
              Kode To Career
            </span>
          </Link>
          <h1 className="text-xl font-bold text-slate-100 mt-6">Sign in to your portal</h1>
          <p className="text-sm text-slate-500 mt-1">Access your certificates and dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-950/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/25 rounded-lg text-sm text-rose-400">
                <Shield className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-slate-400 mb-1.5">
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
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-bold text-sm rounded-xl transition-all mt-2"
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 pt-5 border-t border-slate-800">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-2 text-center">Demo Credentials</p>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { role: "Admin", email: "admin@kodetocareer.com", pwd: "admin1234" },
                { role: "Trainer", email: "trainer@kodetocareer.com", pwd: "trainer1234" },
                { role: "Student", email: "student@kodetocareer.com", pwd: "student1234" },
              ].map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => {
                    (document.getElementById("email") as HTMLInputElement).value = cred.email;
                    (document.getElementById("password") as HTMLInputElement).value = cred.pwd;
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition-colors"
                >
                  <span className="text-xs text-slate-400 font-medium">{cred.role}</span>
                  <span className="text-xs text-slate-600 font-mono truncate ml-2">{cred.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Want to verify a certificate?{" "}
          <Link href="/verify" className="text-amber-400 hover:text-amber-300 transition-colors">
            Verify here →
          </Link>
        </p>
      </div>
    </div>
  );
}
