import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import KtcLogo from "@/components/ui/KtcLogo";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed top-0 left-0 h-full z-10">
        <div className="px-6 py-5 border-b border-slate-200">
          <KtcLogo size="md" href="/" />
        </div>
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/70">
          <span className="inline-block px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-[10px] font-mono font-bold text-blue-700 uppercase tracking-wider">
            Super Admin
          </span>
          <p className="text-sm font-bold text-slate-900 mt-1 truncate">{session.email}</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {[
            { href: "/dashboard/admin", label: "Overview", icon: "📊" },
            { href: "/dashboard/admin/courses", label: "Courses", icon: "📚" },
            { href: "/dashboard/admin/trainers", label: "Trainers", icon: "👨‍🏫" },
            { href: "/dashboard/admin/students", label: "Students", icon: "🎓" },
            { href: "/dashboard/admin/certificates", label: "Certificates", icon: "📜" },
            { href: "/dashboard/admin/templates", label: "Templates", icon: "🎨" },
            { href: "/dashboard/admin/analytics", label: "Analytics", icon: "📈" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-200">
          <a
            href="/api/auth/logout"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all duration-150"
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
