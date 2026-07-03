import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "TRAINER") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 fixed top-0 left-0 h-full z-10">
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <span className="text-violet-400 text-xs font-bold">KTC</span>
            </div>
            <span className="font-bold text-sm tracking-wider bg-gradient-to-r from-violet-200 to-violet-400 bg-clip-text text-transparent">
              KODE TO CAREER
            </span>
          </div>
        </div>
        <div className="px-6 py-4 border-b border-slate-800">
          <p className="text-[10px] font-mono text-violet-500 uppercase tracking-widest">Trainer Portal</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5 truncate">{session.email}</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {[
            { href: "/dashboard/trainer", label: "Overview", icon: "📊" },
            { href: "/dashboard/trainer/courses", label: "My Courses", icon: "📚" },
            { href: "/dashboard/trainer/students", label: "My Students", icon: "🎓" },
            { href: "/dashboard/trainer/certificates", label: "Issue Certificates", icon: "📜" },
            { href: "/dashboard/trainer/profile", label: "Experience Profile", icon: "👤" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all duration-150"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-800">
          <a
            href="/api/auth/logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-900/20 transition-all duration-150"
          >
            <span className="text-base">🚪</span>
            Sign Out
          </a>
        </div>
      </aside>
      <main className="flex-1 md:ml-64 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
