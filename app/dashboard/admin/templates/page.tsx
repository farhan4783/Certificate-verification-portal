import Link from "next/link";
import prisma from "@/lib/prisma";
import DeleteButton from "@/components/dashboard/DeleteButton";

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
        <Link
          href="/dashboard/admin/templates/create"
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-sm rounded-lg transition-colors"
        >
          + New Template
        </Link>
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
              <div className="flex items-center gap-1.5">
                <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                  template.status === "ACTIVE"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                    : "bg-slate-700/50 text-slate-300 border-slate-600"
                }`}>
                  {template.status}
                </span>
                <Link
                  href={`/dashboard/admin/templates/${template.id}/edit`}
                  className="p-2 bg-slate-800 hover:bg-sky-500/10 border border-slate-700 hover:border-sky-500/30 text-slate-400 hover:text-sky-400 rounded-lg transition-all duration-150"
                  title="Edit"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </Link>
                <DeleteButton
                  id={template.id}
                  endpoint="/api/templates"
                  confirmMessage={`Are you sure you want to delete template ${template.name}? This will also delete any issued certificates using this template layout.`}
                />
              </div>
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
