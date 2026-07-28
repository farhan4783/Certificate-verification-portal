import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Calendar, Clock, ExternalLink, MonitorPlay, BookOpen, HelpCircle, Hammer, CheckCircle2, Circle } from "lucide-react";

export default async function StudentSchedulePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const student = await prisma.student.findFirst({
    where: { user: { email: session.email } },
    include: {
      batch: {
        include: {
          sessions: {
            orderBy: { sessionDate: "asc" },
          },
          course: { select: { title: true } },
        },
      },
      attendance: { select: { sessionId: true, isPresent: true } },
    },
  });

  if (!student || !student.batch) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white border border-dashed border-slate-300 rounded-2xl">
        <Calendar className="h-12 w-12 text-slate-300 mb-4" />
        <p className="text-sm font-bold text-slate-900">No batch assigned</p>
        <p className="text-xs text-slate-500 mt-1">Contact your admin to be assigned to a batch.</p>
      </div>
    );
  }

  const batch = student.batch;
  const sessions = batch.sessions || [];
  const attendanceMap = new Map(student.attendance.map((a) => [a.sessionId, a.isPresent]));

  // Group sessions by week
  const weekMap = new Map<string, typeof sessions>();
  sessions.forEach((s) => {
    const d = new Date(s.sessionDate);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];
    if (!weekMap.has(weekKey)) weekMap.set(weekKey, []);
    weekMap.get(weekKey)!.push(s);
  });

  const weeks = Array.from(weekMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  // Calculate stats
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.isCompleted).length;
  const attendedSessions = student.attendance.filter((a) => a.isPresent).length;

  // Determine current week
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayWeekStart = new Date(today);
  todayWeekStart.setDate(today.getDate() - today.getDay());
  const currentWeekKey = todayWeekStart.toISOString().split("T")[0];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          Weekly Course Schedule
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          <span className="font-bold text-slate-900">{batch.batchName}</span> · {batch.course.title}
        </p>
      </div>

      {/* Week Legend & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-extrabold text-slate-900">{totalSessions}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Sessions</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-extrabold text-emerald-700">{completedSessions}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-extrabold text-blue-700">{attendedSessions}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">You Attended</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-extrabold text-amber-700">{totalSessions - completedSessions}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Remaining</p>
        </div>
      </div>

      {/* Day Type Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-white border border-slate-200 rounded-xl px-4 py-3">
        <span className="text-xs font-bold text-slate-500">Legend:</span>
        <span className="flex items-center gap-1.5 text-xs">
          <span className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-slate-700 font-medium">Mon-Fri Lecture</span>
        </span>
        <span className="flex items-center gap-1.5 text-xs">
          <span className="h-3 w-3 rounded-full bg-amber-500" />
          <span className="text-slate-700 font-medium">Saturday Doubts</span>
        </span>
        <span className="flex items-center gap-1.5 text-xs">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-slate-700 font-medium">Sunday Projects</span>
        </span>
      </div>

      {/* Weekly Timeline */}
      {weeks.length > 0 ? (
        <div className="space-y-8">
          {weeks.map(([weekKey, weekSessions], weekIdx) => {
            const weekDate = new Date(weekKey);
            const weekEndDate = new Date(weekDate);
            weekEndDate.setDate(weekDate.getDate() + 6);
            const weekLabel = `${weekDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekEndDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
            const isCurrentWeek = weekKey === currentWeekKey;

            return (
              <div key={weekKey} id={`week-${weekKey}`}>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Week {weekIdx + 1}: {weekLabel}
                  </h3>
                  {isCurrentWeek && (
                    <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold rounded-full animate-pulse">
                      📍 Current Week
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {weekSessions
                    .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())
                    .map((s) => {
                      const sessionDate = new Date(s.sessionDate);
                      const dayName = sessionDate.toLocaleDateString("en-US", { weekday: "short" });
                      const dateStr = sessionDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      const isAttended = attendanceMap.get(s.id) || false;
                      const isToday = sessionDate.toDateString() === new Date().toDateString();
                      const isPast = sessionDate < today;

                      const typeIcon = s.sessionType === "LECTURE"
                        ? <BookOpen className="h-3.5 w-3.5" />
                        : s.sessionType === "DOUBT_SESSION"
                        ? <HelpCircle className="h-3.5 w-3.5" />
                        : <Hammer className="h-3.5 w-3.5" />;

                      const typeColor = s.sessionType === "LECTURE"
                        ? "text-blue-600 bg-blue-50 border-blue-200"
                        : s.sessionType === "DOUBT_SESSION"
                        ? "text-amber-600 bg-amber-50 border-amber-200"
                        : "text-emerald-600 bg-emerald-50 border-emerald-200";

                      const dotColor = s.sessionType === "LECTURE"
                        ? "bg-blue-500"
                        : s.sessionType === "DOUBT_SESSION"
                        ? "bg-amber-500"
                        : "bg-emerald-500";

                      return (
                        <div
                          key={s.id}
                          className={`flex items-center gap-4 bg-white border rounded-xl px-4 py-3 transition-all ${
                            isToday
                              ? "border-blue-300 shadow-md shadow-blue-500/10 ring-2 ring-blue-100"
                              : isAttended
                              ? "border-emerald-200 bg-emerald-50/30"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {/* Status Dot */}
                          <div className="flex flex-col items-center shrink-0 w-12">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{dayName}</span>
                            <span className="text-sm font-extrabold text-slate-900">{sessionDate.getDate()}</span>
                            {s.isCompleted ? (
                              <CheckCircle2 className={`h-4 w-4 mt-0.5 ${isAttended ? "text-emerald-500" : "text-slate-400"}`} />
                            ) : (
                              <Circle className={`h-4 w-4 mt-0.5 ${isToday ? "text-blue-500" : "text-slate-300"}`} />
                            )}
                          </div>

                          {/* Vertical line */}
                          <div className={`w-1 self-stretch rounded-full ${dotColor} opacity-30`} />

                          {/* Session Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeColor}`}>
                                {typeIcon}
                                {s.sessionType === "LECTURE" ? "Lecture" : s.sessionType === "DOUBT_SESSION" ? "Doubt" : "Project"}
                              </span>
                              {isToday && (
                                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                  TODAY
                                </span>
                              )}
                              {isAttended && (
                                <span className="text-[10px] font-bold text-emerald-700">✅ Attended</span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {s.dayNumber ? `Day ${s.dayNumber}: ` : ""}{s.title}
                            </p>
                            {s.description && (
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">{s.description}</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {isToday && (s.meetLink || batch.meetLink) && (
                              <a
                                href={s.meetLink || batch.meetLink || ""}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[11px] font-bold rounded-lg shadow-sm hover:from-sky-600 hover:to-blue-700 transition-all flex items-center gap-1.5"
                              >
                                <MonitorPlay className="h-3.5 w-3.5" />
                                Join
                              </a>
                            )}
                            {s.recordingUrl && (
                              <a
                                href={s.recordingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                              >
                                🎬 Watch
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
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-900">No sessions scheduled yet</p>
          <p className="text-xs text-slate-500 mt-1">Your trainer will add class sessions to the schedule.</p>
        </div>
      )}
    </div>
  );
}
