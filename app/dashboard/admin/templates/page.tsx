import prisma from "@/lib/prisma";

export default async function AdminTemplatesPage() {
  const templates = await prisma.certificateTemplate.findMany({
    include: {
      organization: { select: { name: true } },
      _count: { select: { certificates: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Certificate Templates</h1>
          <p className="text-slate-400 text-sm mt-1">Manage design templates for certificate generation</p>
        </div>
        <a
          href="/dashboard/admin/templates/create"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm rounded-lg transition-colors"
        >
          + New Template
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all"
          >
            {/* Preview Placeholder */}
            <div className="w-full h-28 rounded-lg bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-slate-700 mb-4 flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>

            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">{template.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{template.organization?.name ?? "—"}</p>
              </div>
              <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                template.status === "ACTIVE"
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                  : "bg-slate-700/50 text-slate-300 border-slate-600"
              }`}>
                {template.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Version {template.version}</span>
              <span>{template._count.certificates} certificates issued</span>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-3 py-12 text-center text-slate-500 text-sm">
            No templates found. Create the first template.
          </div>
        )}
      </div>
    </div>
  );
}
