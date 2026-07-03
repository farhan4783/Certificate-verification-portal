interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: "amber" | "emerald" | "blue" | "violet" | "rose";
}

const colorMap = {
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
};

export default function StatCard({ label, value, icon, trend, trendUp, color = "amber" }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-start gap-4">
      <div className={`${c.bg} ${c.border} border rounded-lg p-2.5`}>
        <span className={c.text}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-slate-100 mt-0.5">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trendUp ? "text-emerald-400" : "text-rose-400"}`}>
            {trendUp ? "↑" : "↓"} {trend}
          </p>
        )}
      </div>
    </div>
  );
}
