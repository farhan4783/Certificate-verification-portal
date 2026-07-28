import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const batchSchema = z.object({
  batchName: z.string().min(2),
  courseId: z.string().uuid(),
  trainerId: z.string().uuid(),
  meetLink: z.string().url().optional().or(z.literal("")),
  driveFolderUrl: z.string().url().optional().or(z.literal("")),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "TRAINER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const batches = await prisma.certificateBatch.findMany({
      include: {
        course: { select: { title: true, code: true } },
        trainer: { include: { user: { select: { name: true } } } },
        students: { include: { user: { select: { name: true, email: true } } } },
        sessions: { orderBy: { sessionDate: "desc" }, take: 5 },
        _count: { select: { students: true, sessions: true, certificates: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: batches });
  } catch (error: any) {
    console.error("Fetch batches error:", error);
    return NextResponse.json({ success: false, error: { message: error?.message } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const result = batchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: "Validation failed", details: result.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }

    const { batchName, courseId, trainerId, meetLink, driveFolderUrl, startDate, endDate } = result.data;

    const batch = await prisma.certificateBatch.create({
      data: {
        batchName,
        courseId,
        trainerId,
        meetLink: meetLink || null,
        driveFolderUrl: driveFolderUrl || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ success: true, data: batch }, { status: 201 });
  } catch (error: any) {
    console.error("Create batch error:", error);
    return NextResponse.json({ success: false, error: { message: error?.message } }, { status: 500 });
  }
}
