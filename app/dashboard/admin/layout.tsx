import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 fixed top-0 left-0 h-full z-10">
        <div className="px-6 py-5 border-b border-slate-800">
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
        </div>
        <div className="px-6 py-4 border-b border-slate-800">
          <p className="text-[10px] font-mono text-sky-500 uppercase tracking-widest">Super Admin</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5 truncate">{session.email}</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {[
            { href: "/dashboard/admin", label: "Overview", icon: "📊" },
            { href: "/dashboard/admin/trainers", label: "Trainers", icon: "👨‍🏫" },
            { href: "/dashboard/admin/students", label: "Students", icon: "🎓" },
            { href: "/dashboard/admin/certificates", label: "Certificates", icon: "📜" },
            { href: "/dashboard/admin/templates", label: "Templates", icon: "🎨" },
            { href: "/dashboard/admin/analytics", label: "Analytics", icon: "📈" },
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
