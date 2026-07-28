import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Calendar, ExternalLink, FolderOpen, MonitorPlay, Play, Video } from "lucide-react";

export default async function StudentRecordingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const student = await prisma.student.findFirst({
    where: { user: { email: session.email } },
    include: {
      batch: {
        include: {
          sessions: {
            where: { recordingUrl: { not: null } },
            orderBy: { sessionDate: "desc" },
          },
          course: { select: { title: true } },
        },
      },
    },
  });

  if (!student || !student.batch) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white border border-dashed border-slate-300 rounded-2xl">
        <Video className="h-12 w-12 text-slate-300 mb-4" />
        <p className="text-sm font-bold text-slate-900">No batch assigned</p>
        <p className="text-xs text-slate-500 mt-1">Contact your admin to be assigned to a batch with recordings.</p>
      </div>
    );
  }

  const batch = student.batch;
  const sessions = batch.sessions || [];

  // Group sessions by week
  const weekMap = new Map<string, typeof sessions>();
  sessions.forEach((s) => {
    const d = new Date(s.sessionDate);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split("T")[0];
    if (!weekMap.has(key)) weekMap.set(key, []);
    weekMap.get(key)!.push(s);
  });

  const weeks = Array.from(weekMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Video className="h-6 w-6 text-blue-600" />
          Class Recording Vault
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          All recorded sessions for <span className="font-bold text-slate-900">{batch.batchName}</span> · {batch.course.title}
        </p>
      </div>

      {/* Google Drive Folder Quick Access */}
      {batch.driveFolderUrl && (
        <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Complete Google Drive Recording Folder</h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Access all class recordings, slides, and resources in one place.
              </p>
            </div>
          </div>
          <a
            href={batch.driveFolderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-colors flex items-center gap-2 shrink-0"
          >
            <FolderOpen className="h-4 w-4" />
            Open Google Drive Folder
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Session Recordings by Week */}
      {weeks.length > 0 ? (
        <div className="space-y-8">
          {weeks.map(([weekKey, weekSessions]) => {
            const weekDate = new Date(weekKey);
            const weekEndDate = new Date(weekDate);
            weekEndDate.setDate(weekDate.getDate() + 6);
            const weekLabel = `${weekDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekEndDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

            return (
              <div key={weekKey}>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Week of {weekLabel}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weekSessions.sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()).map((s) => {
                    const sessionDate = new Date(s.sessionDate);
                    const dayName = sessionDate.toLocaleDateString("en-US", { weekday: "short" });
                    const dateStr = sessionDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                    const typeColor = s.sessionType === "LECTURE"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : s.sessionType === "DOUBT_SESSION"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200";

                    const typeLabel = s.sessionType === "LECTURE"
                      ? "📚 Lecture"
                      : s.sessionType === "DOUBT_SESSION"
                      ? "❓ Doubt Session"
                      : "🛠️ Project Day";

                    return (
                      <div
                        key={s.id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${typeColor}`}>
                              {typeLabel}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">{dayName}, {dateStr}</span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 mb-1">
                            {s.dayNumber ? `Day ${s.dayNumber}: ` : ""}{s.title}
                          </h4>

                          {s.description && (
                            <p className="text-xs text-slate-600 leading-relaxed mb-3">{s.description}</p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                          {s.recordingUrl && (
                            <a
                              href={s.recordingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
                            >
                              <Play className="h-3.5 w-3.5" />
                              Watch Recording
                            </a>
                          )}
                          {s.resourceUrl && (
                            <a
                              href={s.resourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-200"
                            >
                              Resources ↗
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl">
          <Video className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-900">No recordings available yet</p>
          <p className="text-xs text-slate-500 mt-1">
            {batch.driveFolderUrl
              ? "Session recordings will appear here once your trainer uploads them. You can also access the full Drive folder above."
              : "Recordings will appear here once your trainer uploads them."}
          </p>
        </div>
      )}
    </div>
  );
}
