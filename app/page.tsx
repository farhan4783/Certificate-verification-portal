import Link from "next/link";
import { Award, ShieldCheck, Download, Users, Zap, Lock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg className="h-7 w-7" viewBox="0 0 100 100" fill="none">
              <path d="M20 15C20 12.2 22.2 10 25 10H32C34.8 10 37 12.2 37 15V85C37 87.8 34.8 90 32 90H25C22.2 90 20 87.8 20 85V15Z" fill="url(#ktcLogoGrad)" />
              <path d="M42 45L72 15C74 13 77 13 79 15C81 17 81 20 79 22L52.5 48.5L79 75C81 77 81 80 79 82C77 84 74 84 72 82L42 52C40 50 40 47 42 45Z" fill="url(#ktcLogoGrad)" />
              <defs>
                <linearGradient id="ktcLogoGrad" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0ea5e9" />
                  <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-bold text-base tracking-wide text-sky-400">
              KodeToCareer
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/verify"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm rounded-lg transition-colors"
            >
              Verify Certificate
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-medium mb-8">
            <ShieldCheck className="h-3.5 w-3.5" />
            Blockchain-secured · Tamper-proof · Instant verification
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
            <span className="text-slate-100">Certificates you can </span>
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              trust forever.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            The Kode To Career platform issues, manages, and verifies digital certificates with SHA-256 integrity hashing, QR codes, and tamper-proof audit trails.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl transition-all hover:scale-105"
            >
              Access Dashboard →
            </Link>
            <Link
              href="/verify"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-xl transition-all hover:border-slate-600"
            >
              Verify a Certificate
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3">
              Everything you need for digital credentials
            </h2>
            <p className="text-slate-400 text-sm">
              Built for training organizations, educational institutes, and learners.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                title: "Instant Verification",
                desc: "Anyone can verify a certificate authenticity with a unique QR code or certificate ID — no login required.",
                color: "amber",
              },
              {
                icon: <Lock className="h-5 w-5" />,
                title: "SHA-256 Integrity",
                desc: "Every PDF is hashed with SHA-256 and stored immutably so any tampering is immediately detectable.",
                color: "emerald",
              },
              {
                icon: <Download className="h-5 w-5" />,
                title: "PDF Generation",
                desc: "Professionally designed A4 landscape PDFs with logos, signatures, QR codes, and organizational branding.",
                color: "blue",
              },
              {
                icon: <Users className="h-5 w-5" />,
                title: "Multi-Role RBAC",
                desc: "Separate, secure dashboards for Super Admins, Trainers, and Students with strict access controls.",
                color: "violet",
              },
              {
                icon: <Zap className="h-5 w-5" />,
                title: "Bulk Issuance",
                desc: "Issue certificates to entire batches simultaneously with automated email delivery and tracking.",
                color: "rose",
              },
              {
                icon: <Award className="h-5 w-5" />,
                title: "Student Portfolios",
                desc: "Students can build their project portfolio and track achievements — all linked to their credentials.",
                color: "amber",
              },
            ].map((f) => {
              const colorMap: Record<string, string> = {
                amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
                rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
              };
              return (
                <div
                  key={f.title}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all"
                >
                  <div className={`h-9 w-9 rounded-lg border flex items-center justify-center mb-4 ${colorMap[f.color]}`}>
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Verify CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-10">
            <ShieldCheck className="h-10 w-10 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-100 mb-3">Have a certificate to verify?</h2>
            <p className="text-slate-400 text-sm mb-6">Enter the certificate ID to instantly check its authenticity and view all credential details.</p>
            <form action="/verify" method="GET" className="flex gap-2 max-w-sm mx-auto">
              <input
                name="id"
                type="text"
                placeholder="KTC-FSWDB-2026-1024"
                className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-sm rounded-xl transition-colors shrink-0"
              >
                Verify
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 100 100" fill="none">
              <path d="M20 15C20 12.2 22.2 10 25 10H32C34.8 10 37 12.2 37 15V85C37 87.8 34.8 90 32 90H25C22.2 90 20 87.8 20 85V15Z" fill="url(#ktcLogoGrad2)" />
              <path d="M42 45L72 15C74 13 77 13 79 15C81 17 81 20 79 22L52.5 48.5L79 75C81 77 81 80 79 82C77 84 74 84 72 82L42 52C40 50 40 47 42 45Z" fill="url(#ktcLogoGrad2)" />
              <defs>
                <linearGradient id="ktcLogoGrad2" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0ea5e9" />
                  <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-sm text-slate-500">© 2026 KodeToCareer. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-xs text-slate-600">
            <a href="/login" className="hover:text-slate-400 transition-colors">Sign In</a>
            <a href="/verify" className="hover:text-slate-400 transition-colors">Verify</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
