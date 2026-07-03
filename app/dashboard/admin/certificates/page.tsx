import prisma from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "@/components/dashboard/DeleteButton";


export default async function AdminCertificatesPage() {
  const certificates = await prisma.certificate.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      student: { include: { user: { select: { name: true } } } },
      course: { select: { title: true } },
      trainer: { include: { user: { select: { name: true } } } },
      verificationLogs: { select: { id: true } },
    },
  });

  const statusStyle: Record<string, string> = {
    DRAFT: "bg-slate-700/50 text-slate-300 border-slate-600",
    GENERATED: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    ISSUED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    REVOKED: "bg-rose-500/15 text-rose-400 border-rose-500/25",
    EXPIRED: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Certificates</h1>
        <p className="text-slate-400 text-sm mt-1">View, approve, and manage all platform certificates</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Cert ID</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Student</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Course</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Trainer</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Verifications</th>
                <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Issued</th>
                <th className="px-6 py-3 text-right text-[11px] font-mono uppercase tracking-widest text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-amber-400">{cert.certificateId}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{cert.student.user.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 max-w-[180px] truncate">{cert.course.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{cert.trainer.user.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${statusStyle[cert.status] ?? ""}`}>
                      {cert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{cert.verificationLogs.length}</td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                    {cert.issueDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/admin/certificates/${cert.id}/edit`}
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
                        id={cert.id}
                        endpoint="/api/certificates"
                        confirmMessage={`Are you sure you want to delete certificate ${cert.certificateId}? This will remove it from the student portal and revoke all verification URL scans.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {certificates.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No certificates found.
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
