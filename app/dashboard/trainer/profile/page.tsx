import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function TrainerProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const trainer = await prisma.trainer.findFirst({
    where: { user: { email: session.email } },
    include: {
      user: { select: { name: true, email: true, avatar: true } },
      organization: { select: { name: true, logoUrl: true } },
    },
  });

  if (!trainer) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Profile not found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Experience Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Your public trainer profile and credentials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/30 border-2 border-violet-500/40 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-violet-300">{trainer.user.name.charAt(0)}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100">{trainer.user.name}</h2>
            {trainer.designation && (
              <p className="text-sm text-violet-400 mt-1">{trainer.designation}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">{trainer.user.email}</p>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500">🏢 {trainer.organization.name}</p>
              {trainer.yearsOfExperience && (
                <p className="text-xs text-slate-500 mt-1">⏱ {trainer.yearsOfExperience} years experience</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Bio */}
          {trainer.bio && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">Bio</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{trainer.bio}</p>
            </div>
          )}

          {/* Skills */}
          {trainer.skills && trainer.skills.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {trainer.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs rounded-md font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">Social Profiles</h3>
            <div className="space-y-2">
              {trainer.linkedinUrl && (
                <a
                  href={trainer.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>🔗</span> LinkedIn Profile
                </a>
              )}
              {trainer.githubUrl && (
                <a
                  href={trainer.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span>🐙</span> GitHub Profile
                </a>
              )}
              {trainer.website && (
                <a
                  href={trainer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span>🌐</span> Personal Website
                </a>
              )}
              {!trainer.linkedinUrl && !trainer.githubUrl && !trainer.website && (
                <p className="text-sm text-slate-500">No social links configured. Contact admin to update profile.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
