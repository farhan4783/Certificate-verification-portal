import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function StudentPortfolioPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const student = await prisma.student.findFirst({
    where: { user: { email: session.email } },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const projects = student?.projects ?? [];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Project Portfolio</h1>
          <p className="text-slate-400 text-sm mt-1">Showcase your work to employers and collaborators</p>
        </div>
        <a
          href="/dashboard/student/portfolio/new"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition-colors"
        >
          + Add Project
        </a>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-900 border border-dashed border-slate-700 rounded-xl">
          <span className="text-5xl mb-4">💡</span>
          <p className="text-slate-400 text-sm">No projects yet. Start showcasing your work!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/30 transition-all"
            >
              {project.imageUrl && (
                <div className="w-full h-36 rounded-lg bg-slate-800 mb-4 overflow-hidden">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-slate-200">{project.title}</h3>
                {project.isFeatured && (
                  <span className="shrink-0 px-2 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/25 text-xs rounded-md">Featured</span>
                )}
              </div>

              {project.description && (
                <p className="text-xs text-slate-500 mb-3 line-clamp-3">{project.description}</p>
              )}

              {project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 text-xs rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    🔗 Live Demo
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    🐙 GitHub
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
