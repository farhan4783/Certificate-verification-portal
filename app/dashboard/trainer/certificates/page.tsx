import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import TrainerIssuanceTabs from "@/components/dashboard/TrainerIssuanceTabs";
import RevokeButton from "@/components/dashboard/RevokeButton";

export default async function TrainerCertificatesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const trainer = await prisma.trainer.findFirst({
    where: { user: { email: session.email } },
    include: {
      courses: {
        include: {
          students: {
            include: {
              user: { select: { name: true, email: true } },
              certificates: { where: {}, select: { id: true, status: true, certificateId: true } },
            },
          },
          template: { select: { id: true, name: true } },
        },
      },
    },
  });

  const certificates = trainer
    ? await prisma.certificate.findMany({
        where: { trainerId: trainer.id },
        take: 30,
        orderBy: { createdAt: "desc" },
        include: {
          student: { include: { user: { select: { name: true } } } },
          course: { select: { title: true } },
        },
      })
    : [];

  const students = trainer?.courses.flatMap(c => c.students) ?? [];
  const eligibleStudents = students.filter(
    s => !s.certificates.some(c => c.status === "ISSUED")
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Issue Certificates</h1>
        <p className="text-slate-400 text-sm mt-1">Generate and issue certificates for your students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issue Form Tabs */}
        <div className="lg:col-span-1">
          <TrainerIssuanceTabs
            eligibleStudents={eligibleStudents}
            courses={trainer?.courses ?? []}
          />
        </div>

        {/* Certificates History */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-200">Certificate History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Cert ID</th>
                    <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Student</th>
                    <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Course</th>
                    <th className="px-6 py-3 text-left text-[11px] font-mono uppercase tracking-widest text-slate-500">Status</th>
                    <th className="px-6 py-3 text-right text-[11px] font-mono uppercase tracking-widest text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-violet-400">{cert.certificateId}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{cert.student.user.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-400 max-w-[160px] truncate">{cert.course.title}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                          cert.status === "ISSUED" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" :
                          cert.status === "DRAFT" ? "bg-amber-500/15 text-amber-400 border-amber-500/25 animate-pulse" :
                          cert.status === "REVOKED" ? "bg-rose-500/15 text-rose-400 border-rose-500/25" :
                          "bg-blue-500/15 text-blue-400 border-blue-500/25"
                        }`}>
                          {cert.status === "DRAFT" ? "GENERATING" : cert.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {cert.status !== "REVOKED" && (
                          <RevokeButton id={cert.id} certificateId={cert.certificateId} />
                        )}
                      </td>
                    </tr>
                  ))}
                  {certificates.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
                        No certificates issued yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
