import Link from "next/link";
import { Award } from "lucide-react";

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
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 min-h-screen">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <Award className="h-6 w-6 text-amber-500" />
          <span className="font-bold text-sm tracking-wider bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
            KODE TO CAREER
          </span>
        </Link>
      </div>

      {/* Role Badge */}
      <div className="px-6 py-4 border-b border-slate-800">
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">{user.role.replace("_", " ")}</p>
        <p className="text-sm font-semibold text-slate-200 mt-0.5 truncate">{user.name}</p>
        <p className="text-xs text-slate-500 truncate">{user.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              item.active
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <span className={`shrink-0 ${item.active ? "text-amber-400" : "text-slate-500"}`}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-slate-800">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-900/20 transition-all duration-150"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
