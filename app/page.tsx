import Link from "next/link";
import { Award, ShieldCheck, Download, Users, Zap, Lock, ArrowRight, CheckCircle2, Cpu, Sparkles } from "lucide-react";
import HomeVerifyWidget from "@/components/dashboard/HomeVerifyWidget";
import PdfFileVerifier from "@/components/dashboard/PdfFileVerifier";
import KtcLogo from "@/components/ui/KtcLogo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden antialiased">
      
      {/* Light Mode Grid & Ambient Blue Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-sky-200/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Light Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <KtcLogo size="md" href="/" />
          <div className="flex items-center gap-4">
            <Link
              href="/graduates"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
            >
              🎓 Recruiter Directory
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-sky-500/20"
            >
              Console
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Glowing Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide uppercase shadow-xs">
            <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
            Sovereign Ledger Anchored · Tamper-Proof Credentials
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-slate-900">
            <span>Certificates you can </span>
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              trust forever.
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The industry standard for credential verification. Issue, audit, and showcase high-fidelity digital certificates backed by SHA-256 integrity and decentralized ledger proof.
          </p>

          {/* Verification Widget Integrated Directly on Hero */}
          <div className="pt-4 max-w-xl mx-auto space-y-6">
            <HomeVerifyWidget />
            <PdfFileVerifier />
          </div>

          {/* Quick CTA links */}
          <div className="flex gap-4 items-center justify-center pt-2 text-xs font-medium">
            <Link
              href="/login"
              className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1 font-semibold group"
            >
              Issue credentials as Trainer
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform text-blue-600" />
            </Link>
            <span className="text-slate-300">|</span>
            <Link
              href="/login"
              className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1 font-semibold group"
            >
              Manage student portal
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform text-blue-600" />
            </Link>
          </div>

        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 border-t border-slate-200 bg-white relative z-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Sovereign trust architecture
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto">
              Engineered with cryptographic hashing and verification to protect KodeToCareer certifications against fraud.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                title: "Instant Public Verification",
                desc: "Anyone can verify credential authenticity instantly with a scan of the QR code or ID. No login required.",
                color: "blue",
              },
              {
                icon: <Lock className="h-5 w-5" />,
                title: "SHA-256 PDF Integrity",
                desc: "Every certificate yields a unique cryptographic signature. Any modification invalidates the verification hash.",
                color: "emerald",
              },
              {
                icon: <Cpu className="h-5 w-5" />,
                title: "Decentralized Anchoring",
                desc: "Certificates are permanently anchored to public ledger transaction blocks for irreversible proof.",
                color: "cyan",
              },
              {
                icon: <Users className="h-5 w-5" />,
                title: "Secure RBAC Dashboards",
                desc: "Tailored interfaces for Admins, Instructors, and Students with cookie-gated authentication constraints.",
                color: "violet",
              },
              {
                icon: <Zap className="h-5 w-5" />,
                title: "CSV Bulk Cohort Issuance",
                desc: "Generate hundreds of custom PDFs simultaneously with automated email dispatch and batch tracking.",
                color: "rose",
              },
              {
                icon: <Award className="h-5 w-5" />,
                title: "Dynamic Portfolios",
                desc: "Students display verified certificates alongside custom project galleries on public profile pages.",
                color: "sky",
              },
            ].map((f, index) => {
              const colorMap: Record<string, string> = {
                blue: "bg-blue-50 text-blue-600 border-blue-200",
                emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
                cyan: "bg-cyan-50 text-cyan-600 border-cyan-200",
                violet: "bg-indigo-50 text-indigo-600 border-indigo-200",
                rose: "bg-rose-50 text-rose-600 border-rose-200",
                sky: "bg-sky-50 text-sky-600 border-sky-200",
              };
              return (
                <div
                  key={index}
                  className="bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-xs group"
                >
                  <div className={`h-10 w-10 rounded-xl border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${colorMap[f.color]}`}>
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Info Callout Section */}
      <section className="py-20 px-6 relative z-10 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-white to-blue-50/50 border border-blue-200/80 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-md">
                <h3 className="text-xl font-bold text-slate-900">Ready to verify & showcase your credentials?</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Join hundreds of KodeToCareer graduates showcasing verified digital certificates to global tech recruiters and employers.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-slate-600 font-medium">
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Multi-language</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Custom branding</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Ledger Verified</span>
                </div>
              </div>
              <div className="shrink-0 w-full md:w-auto">
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm rounded-xl transition duration-150 shadow-lg shadow-sky-500/20 hover:scale-105"
                >
                  Access Student Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Light Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <KtcLogo size="sm" href="/" showText={false} />
            <span className="font-medium">© 2026 KodeToCareer. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-slate-600 font-semibold">
            <Link href="/login" className="hover:text-blue-600 transition-colors">Console Logins</Link>
            <span className="text-slate-300">·</span>
            <a href="https://kodetocareer.com/privacy" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <span className="text-slate-300">·</span>
            <a href="https://kodetocareer.com/terms" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
