import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Students only" } },
        { status: 403 }
      );
    }

    const student = await prisma.student.findFirst({
      where: { user: { email: session.email } },
      select: { id: true },
    });
    if (!student) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Student profile not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, techStack, projectUrl, githubUrl, imageUrl, isFeatured } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Project title is required" } },
        { status: 400 }
      );
    }

    const newProject = await prisma.project.create({
      data: {
        studentId: student.id,
        title,
        description: description || null,
        techStack: techStack ? techStack.split(",").map((t: string) => t.trim()) : [],
        projectUrl: projectUrl || null,
        githubUrl: githubUrl || null,
        imageUrl: imageUrl || null,
        isFeatured: !!isFeatured,
      },
    });

    // Log Audit Trail
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "CREATE",
        table: "Project",
        recordId: newProject.id,
        metadata: { projectTitle: title },
      },
    });

    return NextResponse.json({ success: true, data: { project: newProject } }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/projects] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to create project" } },
      { status: 500 }
    );
  }
}
