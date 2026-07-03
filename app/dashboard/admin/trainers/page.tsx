import prisma from "@/lib/prisma";

export default async function AdminTrainersPage() {
  const trainers = await prisma.trainer.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, createdAt: true } },
      organization: { select: { name: true } },
      courses: { select: { id: true } },
      certificates: { select: { id: true } },
    },
    orderBy: { user: { createdAt: "desc" } },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Trainers</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all trainer accounts on the platform</p>
        </div>
        <a
          href="/dashboard/admin/trainers/create"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm rounded-lg transition-colors"
        >
          + Add Trainer
        </a>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Name</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Email</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Organization</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Courses</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Certificates</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {trainers.map((trainer) => (
                <tr key={trainer.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                        <span className="text-violet-400 text-xs font-bold">{trainer.user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{trainer.user.name}</p>
                        {trainer.designation && (
                          <p className="text-xs text-slate-500">{trainer.designation}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{trainer.user.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{trainer.organization.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{trainer.courses.length}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{trainer.certificates.length}</td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                    {trainer.user.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
              {trainers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No trainers found. Add the first trainer to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
