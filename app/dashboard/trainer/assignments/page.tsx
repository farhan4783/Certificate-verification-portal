import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import GradeSubmissionModal from "@/components/dashboard/GradeSubmissionModal";
import { ExternalLink, FileCheck, FileCode, FileText, CheckCircle2, Clock } from "lucide-react";

export default async function TrainerAssignmentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const trainer = await prisma.trainer.findFirst({
    where: { user: { email: session.email } },
    select: { id: true },
  });

  const submissions = await prisma.assignmentSubmission.findMany({
    include: {
      student: {
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } },
          batch: { select: { batchName: true } },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  const pending = submissions.filter((s) => s.status === "SUBMITTED" || s.status === "UNDER_REVIEW");
  const graded = submissions.filter((s) => s.status === "GRADED");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          Sunday Assignments &amp; Capstone Projects
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Review student project code submissions, grade work out of 100, and provide written feedback.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-extrabold text-slate-900">{submissions.length}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Submissions</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-extrabold text-amber-700">{pending.length}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Grading</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-extrabold text-emerald-700">{graded.length}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Graded</p>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-900 mb-4">All Project Submissions</h2>

        <div className="space-y-4">
          {submissions.map((sub) => {
            const isPending = sub.status === "SUBMITTED" || sub.status === "UNDER_REVIEW";

            return (
              <div
                key={sub.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{sub.student.user.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">({sub.student.enrollmentNumber})</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      sub.status === "GRADED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {sub.status === "GRADED" ? `Graded: ${sub.score}/100` : "Needs Grading"}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900">{sub.title}</h3>

                  <p className="text-xs text-slate-600">
                    Course: <span className="font-medium">{sub.student.course.title}</span>
                    {sub.student.batch && ` · ${sub.student.batch.batchName}`}
                  </p>

                  {/* Submission Links */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {sub.githubUrl && (
                      <a
                        href={sub.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
                      >
                        <FileCode className="h-3.5 w-3.5 text-blue-600" />
                        GitHub Repository
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                      </a>
                    )}
                    {sub.liveUrl && (
                      <a
                        href={sub.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
                      >
                        🌐 Live Demo
                        <ExternalLink className="h-3 w-3 text-emerald-500" />
                      </a>
                    )}
                  </div>

                  {sub.trainerFeedback && (
                    <p className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg p-2.5 mt-2 italic">
                      Feedback: &quot;{sub.trainerFeedback}&quot;
                    </p>
                  )}
                </div>

                {/* Grade Action */}
                <div className="shrink-0 flex items-center gap-2">
                  <GradeSubmissionModal
                    submissionId={sub.id}
                    studentName={sub.student.user.name}
                    projectTitle={sub.title}
                    currentScore={sub.score}
                    currentFeedback={sub.trainerFeedback}
                  />
                </div>
              </div>
            );
          })}

          {submissions.length === 0 && (
            <div className="text-center py-12 border border-dashed border-slate-300 rounded-xl">
              <FileCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-900">No project submissions yet</p>
              <p className="text-xs text-slate-500 mt-1">Student Sunday project submissions will appear here for evaluation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
