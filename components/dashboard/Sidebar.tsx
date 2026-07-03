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
        <Link href="/" className="flex items-center gap-2.5">
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
        <a
          href="/api/auth/logout"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-900/20 transition-all duration-150"
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
