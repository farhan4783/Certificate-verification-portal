import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CopyLinkButton from "@/components/ui/CopyLinkButton";
import MintNftButton from "@/components/dashboard/MintNftButton";

export default async function StudentCertificatesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const student = await prisma.student.findFirst({
    where: { user: { email: session.email } },
    include: {
      certificates: {
        orderBy: { createdAt: "desc" },
        include: {
          course: { select: { title: true } },
          trainer: { include: { user: { select: { name: true } } } },
          verificationLogs: { select: { id: true } },
          web3Credential: true,
        },
      },
    },
  });

  const certificates = student?.certificates ?? [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">My Certificates</h1>
        <p className="text-slate-400 text-sm mt-1">
          {certificates.length} certificate{certificates.length !== 1 ? "s" : ""} earned
        </p>
      </div>

      {/* Empty State */}
      {certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-900 border border-dashed border-slate-700 rounded-xl">
          <span className="text-5xl mb-4">📜</span>
          <p className="text-slate-400 text-sm">
            No certificates yet. Complete your course to receive your certificate!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/30 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Certificate Icon */}
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <span className="text-2xl">🏆</span>
                </div>

                {/* Certificate Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="text-base font-semibold text-slate-100">
                        {cert.course.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Issued by {cert.trainer.user.name} ·{" "}
                        {cert.issueDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                        cert.status === "ISSUED"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                          : cert.status === "REVOKED"
                          ? "bg-rose-500/15 text-rose-400 border-rose-500/25"
                          : cert.status === "EXPIRED"
                          ? "bg-orange-500/15 text-orange-400 border-orange-500/25"
                          : "bg-slate-700/50 text-slate-300 border-slate-600"
                      }`}
                    >
                      {cert.status}
                    </span>
                  </div>

                  {/* Certificate meta */}
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                      {cert.certificateId}
                    </span>
                    {cert.grade && (
                      <span className="text-xs text-slate-400">
                        Grade:{" "}
                        <span className="text-slate-200 font-medium">{cert.grade}</span>
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      {cert.verificationLogs.length} verification
                      {cert.verificationLogs.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Action Buttons — only visible for issued certs */}
                {cert.status === "ISSUED" && (
                  <div className="flex flex-row flex-wrap items-center gap-2 shrink-0">
                    {cert.web3Credential ? (
                      <div className="px-3 py-2 bg-cyan-950/20 text-cyan-400 border border-cyan-500/20 font-mono text-[10px] rounded-lg flex items-center gap-1.5 shrink-0 select-none">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span>Minted Polygon #{cert.web3Credential.tokenId}</span>
                      </div>
                    ) : (
                      <MintNftButton certificateId={cert.certificateId} certificateDbId={cert.id} />
                    )}
                    {cert.pdfUrl && (
                      <a
                        href={cert.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors text-center"
                      >
                        ⬇ Download PDF
                      </a>
                    )}
                    <a
                      href={`/verify/${cert.certificateId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-350 text-xs font-semibold rounded-lg transition-colors text-center"
                    >
                      🔍 Verify
                    </a>
                    {/* Client Component for clipboard access */}
                    <CopyLinkButton certificateId={cert.certificateId} />
                  </div>
                )}
              </div>

              {/* LinkedIn Tip */}
              {cert.status === "ISSUED" && (
                <div className="mt-4 pt-4 border-t border-slate-800/70">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    💡 <span className="text-slate-400 font-medium">Add to LinkedIn:</span>{" "}
                    Go to your LinkedIn profile → Add Profile Section → Licenses &amp; Certifications,
                    then enter the certificate ID:{" "}
                    <span className="font-mono text-amber-400">{cert.certificateId}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
