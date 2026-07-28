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
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen">
      {/* Brand Logo Header */}
      <div className="px-6 py-5 border-b border-slate-200">
        <KtcLogo size="md" href="/" />
      </div>

      {/* User Info Badge */}
      <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/70">
        <span className="inline-block px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-[10px] font-mono font-bold text-blue-700 uppercase tracking-wider">
          {user.role.replace("_", " ")}
        </span>
        <p className="text-sm font-bold text-slate-900 mt-1 truncate">{user.name}</p>
        <p className="text-xs text-slate-500 truncate">{user.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              item.active
                ? "bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span className={`shrink-0 ${item.active ? "text-blue-600" : "text-slate-400"}`}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-slate-200">
        <a
          href="/api/auth/logout"
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all duration-150"
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
