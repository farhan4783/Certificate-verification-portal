import Link from "next/link";
import { Award, ShieldCheck, Download, Users, Zap, Lock, ArrowRight, CheckCircle2, Cpu } from "lucide-react";
import HomeVerifyWidget from "@/components/dashboard/HomeVerifyWidget";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden antialiased">
      
      {/* Background Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/70 backdrop-blur-lg border-b border-slate-900/60">
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
            <span className="font-bold text-base tracking-wide text-sky-400 font-mono">
              KodeToCareer
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-205 border border-slate-800 font-semibold text-sm rounded-lg transition-colors"
            >
              Console
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          {/* Glowing Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold tracking-wide uppercase select-none animate-pulse">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Sovereign Ledger Anchored · Tamper-proof
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
            <span className="text-slate-100">Certificates you can </span>
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              trust forever.
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The industry standard for credential verification. Issue, audit, and showcase high-fidelity digital certificates backed by SHA-256 file hashes and decentralized ledger proof.
          </p>

          {/* Verification Widget Integrated Directly on Hero */}
          <div className="pt-4 max-w-xl mx-auto">
            <HomeVerifyWidget />
          </div>

          {/* Quick CTA links */}
          <div className="flex gap-4 items-center justify-center pt-2 text-xs">
            <Link
              href="/login"
              className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 font-semibold group"
            >
              Issue credentials as Trainer
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <span className="text-slate-700">|</span>
            <Link
              href="/login"
              className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 font-semibold group"
            >
              Manage student portal
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-6 border-t border-slate-900 bg-slate-950/50 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100">
              Sovereign trust architecture
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Engineered with advanced hashing and auditing to secure certifications against fraud.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                title: "Instant Public Verification",
                desc: "Anyone can verify the authenticity of a credential with a scan of the QR code or ID. No signup, logins, or fees.",
                color: "amber",
              },
              {
                icon: <Lock className="h-5 w-5" />,
                title: "SHA-256 PDF Integrity",
                desc: "Every certificate yields a unique cryptographic signature. Any attempt to modify text or signatures invalidates the verification hash.",
                color: "emerald",
              },
              {
                icon: <Cpu className="h-5 w-5" />,
                title: "Decentralized Anchoring",
                desc: "Certificates are permanently anchored to public ledger transaction blocks, ensuring irreversible proof of existence.",
                color: "cyan",
              },
              {
                icon: <Users className="h-5 w-5" />,
                title: "Secure RBAC Dashboards",
                desc: "Specially tailoured interfaces for Admins, Instructors, and Students with strict cookie-gated auth constraints.",
                color: "violet",
              },
              {
                icon: <Zap className="h-5 w-5" />,
                title: "CSV Bulk Cohort Issuance",
                desc: "Generate hundreds of custom PDFs simultaneously. Automated email dispatch and tracking for large student batches.",
                color: "rose",
              },
              {
                icon: <Award className="h-5 w-5" />,
                title: "Dynamic Portfolios",
                desc: "Students display verified certificates alongside custom project galleries and achievements on a public portfolio page.",
                color: "amber",
              },
            ].map((f, index) => {
              const colorMap: Record<string, string> = {
                amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
                rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
              };
              return (
                <div
                  key={index}
                  className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-950/50 group"
                >
                  <div className={`h-10 w-10 rounded-xl border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 ${colorMap[f.color]}`}>
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-200 mb-2.5">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Info Callout Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-850 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-violet-650/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-md">
                <h3 className="text-xl font-bold text-slate-100">Ready to secure your educational credentials?</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Join hundreds of trainers issuing secure, blockchain-verified digital certificates. Create courses, issue batches, and give your students credentials they can show off globally.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Multi-language</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Custom branding</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Rate limited</span>
                </div>
              </div>
              <div className="shrink-0 w-full md:w-auto">
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-xl transition duration-150 shadow-lg shadow-amber-500/10 hover:scale-105"
                >
                  Request Institution Access
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-10 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
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
            <span>© 2026 KodeToCareer. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-slate-500 font-semibold">
            <Link href="/login" className="hover:text-slate-350 transition-colors">Console Logins</Link>
            <span className="text-slate-800">·</span>
            <a href="https://kodetocareer.com/privacy" target="_blank" rel="noreferrer" className="hover:text-slate-350 transition-colors">Privacy Policy</a>
            <span className="text-slate-800">·</span>
            <a href="https://kodetocareer.com/terms" target="_blank" rel="noreferrer" className="hover:text-slate-350 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
