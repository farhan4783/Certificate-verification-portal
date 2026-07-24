import prisma from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "@/components/dashboard/DeleteButton";
import RevokeButton from "@/components/dashboard/RevokeButton";

export default async function AdminCertificatesPage() {
  const certificates = await prisma.certificate.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      student: { include: { user: { select: { name: true, email: true } } } },
      course: { select: { title: true } },
      trainer: { include: { user: { select: { name: true } } } },
      verificationLogs: { select: { id: true } },
    },
  });

  const statusStyle: Record<string, string> = {
    DRAFT: "bg-amber-500/15 text-amber-400 border-amber-500/25 animate-pulse",
    GENERATED: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    ISSUED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    REVOKED: "bg-rose-500/15 text-rose-400 border-rose-500/25",
    EXPIRED: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Certificates Ledger</h1>
          <p className="text-slate-400 text-sm mt-1">
            View, verify, and download verified certificates for all enrolled students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg">
            Total Issued: {certificates.length}
          </span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                <th className="px-6 py-3.5 text-left text-[11px] font-mono uppercase tracking-widest text-slate-400">Cert ID</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-mono uppercase tracking-widest text-slate-400">Student Name</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-mono uppercase tracking-widest text-slate-400">Student Email</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-mono uppercase tracking-widest text-slate-400">Course</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-mono uppercase tracking-widest text-slate-400">Trainer</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-mono uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-3.5 text-right text-[11px] font-mono uppercase tracking-widest text-slate-400">Download & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-amber-400 font-semibold">{cert.certificateId}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-100">{cert.student.user.name}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{cert.student.user.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-300 max-w-[200px] truncate">{cert.course.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{cert.trainer.user.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${statusStyle[cert.status] ?? ""}`}>
                      {cert.status === "DRAFT" ? "GENERATING" : cert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Direct PDF Download Button */}
                      <a
                        href={`/api/certificates/${cert.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 shrink-0 shadow-sm"
                        title="Download Verified PDF Certificate"
                      >
                        <span>⬇ Download</span>
                      </a>

                      {/* Verification Link */}
                      <a
                        href={`/verify/${cert.certificateId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 shrink-0"
                        title="Public Verification Page"
                      >
                        <span>🔍 Verify</span>
                      </a>

                      <Link
                        href={`/dashboard/admin/certificates/${cert.id}/edit`}
                        className="p-1.5 bg-slate-800 hover:bg-sky-500/10 border border-slate-700 hover:border-sky-500/30 text-slate-400 hover:text-sky-400 rounded-lg transition-all duration-150"
                        title="Edit Certificate Details"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </Link>

                      {cert.status !== "REVOKED" && (
                        <RevokeButton id={cert.id} certificateId={cert.certificateId} />
                      )}

                      <DeleteButton
                        id={cert.id}
                        endpoint="/api/certificates"
                        confirmMessage={`Are you sure you want to delete certificate ${cert.certificateId}?`}
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
