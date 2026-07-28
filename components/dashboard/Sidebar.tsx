import Link from "next/link";
import KtcLogo from "@/components/ui/KtcLogo";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

interface SidebarProps {
  items: NavItem[];
  user: { name: string; email: string; role: string };
}

export default function DashboardSidebar({ items, user }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900/90 border-r border-slate-800 min-h-screen">
      {/* Brand Logo Header */}
      <div className="px-6 py-5 border-b border-slate-800">
        <KtcLogo size="md" href="/" />
      </div>

      {/* User Info Badge */}
      <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/40">
        <span className="inline-block px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-[10px] font-mono text-sky-400 uppercase tracking-wider">
          {user.role.replace("_", " ")}
        </span>
        <p className="text-sm font-semibold text-slate-100 mt-1 truncate">{user.name}</p>
        <p className="text-xs text-slate-400 truncate">{user.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              item.active
                ? "bg-gradient-to-r from-sky-500/15 to-blue-600/15 text-sky-400 border border-sky-500/30 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
          >
            <span className={`shrink-0 ${item.active ? "text-sky-400" : "text-slate-500"}`}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-slate-800">
        <a
          href="/api/auth/logout"
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all duration-150"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </a>
      </div>
    </aside>
  );
}
