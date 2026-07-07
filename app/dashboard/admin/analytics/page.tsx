import prisma from "@/lib/prisma";
import GeoScanCharts from "@/components/dashboard/GeoScanCharts";
import SecurityAlertsPanel from "@/components/dashboard/SecurityAlertsPanel";

export default async function AdminAnalyticsPage() {
  const [
    certificatesByStatus,
    topCourses,
    topTrainers,
  ] = await Promise.all([
    prisma.certificate.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.course.findMany({
      take: 5,
      include: {
        _count: { select: { students: true, certificates: true } },
      },
      orderBy: { students: { _count: "desc" } },
    }),
    prisma.trainer.findMany({
      take: 5,
      include: {
        user: { select: { name: true } },
        _count: { select: { certificates: true, courses: true } },
      },
      orderBy: { certificates: { _count: "desc" } },
    }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Platform metrics and performance insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Certificates by Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:col-span-1">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Certificates by Status</h2>
          <div className="space-y-3">
            {certificatesByStatus.map((item) => {
              const total = certificatesByStatus.reduce((acc, i) => acc + i._count.status, 0);
              const pct = total > 0 ? Math.round((item._count.status / total) * 100) : 0;
              const color: Record<string, string> = {
                ISSUED: "bg-emerald-500",
                DRAFT: "bg-slate-600",
                REVOKED: "bg-rose-500",
                EXPIRED: "bg-orange-500",
                GENERATED: "bg-blue-500",
              };
              return (
                <div key={item.status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{item.status}</span>
                    <span className="text-slate-300 font-medium">{item._count.status} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color[item.status] ?? "bg-slate-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {certificatesByStatus.length === 0 && (
              <p className="text-sm text-slate-500">No certificate data yet.</p>
            )}
          </div>
        </div>

        {/* Top Trainers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:col-span-1">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Top Trainers</h2>
          <div className="space-y-3">
            {topTrainers.map((trainer, idx) => (
              <div key={trainer.id} className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500 w-4">{idx + 1}</span>
                <div className="h-7 w-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                  <span className="text-violet-400 text-xs font-bold">{trainer.user.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-200">{trainer.user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{trainer._count.courses} courses · {trainer._count.certificates} certs</p>
                </div>
              </div>
            ))}
            {topTrainers.length === 0 && (
              <p className="text-sm text-slate-500">No trainer data yet.</p>
            )}
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:col-span-1">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Most Popular Courses</h2>
          <div className="space-y-3">
            {topCourses.map((course, idx) => (
              <div key={course.id} className="flex items-start gap-3">
                <span className="text-xs font-mono text-slate-500 w-4 mt-0.5">{idx + 1}</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-200 truncate">{course.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{course._count.students} students · {course._count.certificates} certs</p>
                </div>
              </div>
            ))}
            {topCourses.length === 0 && (
              <p className="text-sm text-slate-500">No course data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Security & Anomaly Detection */}
      <div className="border-t border-slate-800/80 pt-8 mt-8">
        <SecurityAlertsPanel />
      </div>

      <div className="border-t border-slate-800/80 pt-8 mt-8">
        <div className="mb-6">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>🔍 Verification Scan Auditing & Geo-Tracking</span>
            <span className="text-[9px] font-mono font-normal uppercase bg-violet-500/10 border border-violet-500/25 px-2 py-0.5 rounded text-violet-400 animate-pulse">Live</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">Real-time geolocation tracking, browser/device signatures, and scan timelines</p>
        </div>
        <GeoScanCharts />
      </div>
    </div>
  );
}
