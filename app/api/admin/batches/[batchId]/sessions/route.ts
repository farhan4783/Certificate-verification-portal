import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const sessionSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  sessionDate: z.string(),
  sessionType: z.enum(["LECTURE", "DOUBT_SESSION", "PROJECT_DAY"]).default("LECTURE"),
  meetLink: z.string().url().optional().or(z.literal("")),
  recordingUrl: z.string().url().optional().or(z.literal("")),
  resourceUrl: z.string().url().optional().or(z.literal("")),
  dayNumber: z.number().int().positive().optional(),
  isCompleted: z.boolean().default(false),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "TRAINER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { batchId } = await params;

    const sessions = await prisma.classSession.findMany({
      where: { batchId },
      include: {
        attendance: { include: { student: { include: { user: { select: { name: true, email: true } } } } } },
        _count: { select: { attendance: true } },
      },
      orderBy: { sessionDate: "desc" },
    });

    return NextResponse.json({ success: true, data: sessions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error?.message } }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "TRAINER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { batchId } = await params;
    const body = await request.json();
    const result = sessionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: "Validation failed", details: result.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }

    const { title, description, sessionDate, sessionType, meetLink, recordingUrl, resourceUrl, dayNumber, isCompleted } = result.data;

    const classSession = await prisma.classSession.create({
      data: {
        batchId,
        title,
        description: description || null,
        sessionDate: new Date(sessionDate),
        sessionType,
        meetLink: meetLink || null,
        recordingUrl: recordingUrl || null,
        resourceUrl: resourceUrl || null,
        dayNumber: dayNumber || null,
        isCompleted,
      },
    });

    // Update batch total sessions count
    const totalSessions = await prisma.classSession.count({ where: { batchId } });
    await prisma.certificateBatch.update({
      where: { id: batchId },
      data: { totalSessions },
    });

    return NextResponse.json({ success: true, data: classSession }, { status: 201 });
  } catch (error: any) {
    console.error("Create session error:", error);
    return NextResponse.json({ success: false, error: { message: error?.message } }, { status: 500 });
  }
}
