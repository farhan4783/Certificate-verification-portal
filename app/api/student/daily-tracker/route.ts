import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET student daily tracker — returns today's schedule, meet link, recordings
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const student = await prisma.student.findFirst({
      where: { user: { email: session.email } },
      include: {
        batch: {
          include: {
            sessions: {
              orderBy: { sessionDate: "desc" },
              take: 30,
            },
          },
        },
        progress: true,
        attendance: {
          include: { session: { select: { id: true, title: true, sessionDate: true, sessionType: true } } },
          orderBy: { createdAt: "desc" },
          take: 30,
        },
        submissions: {
          orderBy: { submittedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    // Determine today's session
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySession = student.batch?.sessions?.find((s) => {
      const sd = new Date(s.sessionDate);
      sd.setHours(0, 0, 0, 0);
      return sd.getTime() === today.getTime();
    });

    // Determine day type based on actual day of week
    const dayOfWeek = new Date().getDay(); // 0=Sun, 6=Sat
    let dayType: "LECTURE" | "DOUBT_SESSION" | "PROJECT_DAY" = "LECTURE";
    if (dayOfWeek === 0) dayType = "PROJECT_DAY";
    else if (dayOfWeek === 6) dayType = "DOUBT_SESSION";

    // Get meet link (session-specific or batch default)
    const meetLink = todaySession?.meetLink || student.batch?.meetLink || null;

    return NextResponse.json({
      success: true,
      data: {
        dayType,
        dayOfWeek,
        meetLink,
        driveFolderUrl: student.batch?.driveFolderUrl || null,
        batchName: student.batch?.batchName || null,
        todaySession: todaySession || null,
        progress: student.progress || null,
        recentAttendance: student.attendance,
        recentSubmissions: student.submissions,
        recentSessions: student.batch?.sessions?.slice(0, 10) || [],
      },
    });
  } catch (error: any) {
    console.error("Daily tracker error:", error);
    return NextResponse.json({ success: false, error: { message: error?.message } }, { status: 500 });
  }
}
