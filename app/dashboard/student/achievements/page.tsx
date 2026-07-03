import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

const achievementIcons: Record<string, string> = {
  ACADEMIC: "🎓",
  HACKATHON: "⚡",
  COMPETITION: "🏆",
  CERTIFICATION: "📜",
  OPEN_SOURCE: "🌐",
  PUBLICATION: "📰",
  AWARD: "🥇",
  OTHER: "🌟",
};

export default async function StudentAchievementsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const student = await prisma.student.findFirst({
    where: { user: { email: session.email } },
    include: {
      achievements: {
        orderBy: { achievementDate: "desc" },
      },
    },
  });

  const achievements = student?.achievements ?? [];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Achievements</h1>
          <p className="text-slate-400 text-sm mt-1">{achievements.length} achievement{achievements.length !== 1 ? "s" : ""} earned</p>
        </div>
        <a
          href="/dashboard/student/achievements/new"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-sm rounded-lg transition-colors"
        >
          + Add Achievement
        </a>
      </div>

      {achievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-900 border border-dashed border-slate-700 rounded-xl">
          <span className="text-5xl mb-4">🏆</span>
          <p className="text-slate-400 text-sm">No achievements yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-amber-500/30 transition-all flex gap-4"
            >
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-2xl">
                {achievementIcons[achievement.type] ?? "🌟"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">{achievement.title}</h3>
                    {achievement.issuer && (
                      <p className="text-xs text-slate-500 mt-0.5">Issued by {achievement.issuer}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-md">
                      {achievement.type}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {achievement.achievementDate?.toLocaleDateString("en-US", { year: "numeric", month: "short" }) ?? ""}
                    </span>
                  </div>
                </div>
                {achievement.description && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{achievement.description}</p>
                )}
                {achievement.credentialUrl && (
                  <a
                    href={achievement.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 mt-2 transition-colors"
                  >
                    🔗 View Credential
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
