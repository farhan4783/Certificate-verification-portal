type BadgeVariant = "DRAFT" | "GENERATED" | "ISSUED" | "REVOKED" | "EXPIRED" | "ACTIVE" | "ARCHIVED" | "VALID" | "INVALID";

const styles: Record<string, string> = {
  DRAFT: "bg-slate-700/50 text-slate-300 border-slate-600",
  GENERATED: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  ISSUED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  REVOKED: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  EXPIRED: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  ARCHIVED: "bg-slate-700/50 text-slate-300 border-slate-600",
  VALID: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  INVALID: "bg-rose-500/15 text-rose-400 border-rose-500/25",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[status] ?? "bg-slate-700/50 text-slate-300 border-slate-600"}`}>
      {status}
    </span>
  );
}
