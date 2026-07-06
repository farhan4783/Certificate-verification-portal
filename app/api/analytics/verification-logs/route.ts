import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admins only" } },
        { status: 403 }
      );
    }

    // 1. Fetch group data
    const deviceGroups = await prisma.verificationLog.groupBy({
      by: ["device"],
      _count: { id: true },
    });

    const countryGroups = await prisma.verificationLog.groupBy({
      by: ["country"],
      _count: { id: true },
    });

    const resultGroups = await prisma.verificationLog.groupBy({
      by: ["result"],
      _count: { id: true },
    });

    // 2. Fetch recent verification logs (last 10)
    const recentLogs = await prisma.verificationLog.findMany({
      take: 10,
      orderBy: { verifiedAt: "desc" },
      include: {
        certificate: {
          select: {
            certificateId: true,
            student: {
              select: {
                user: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    // 3. Fetch top verified certificates (top 5 by scan count)
    const topCertificates = await prisma.certificate.findMany({
      take: 5,
      include: {
        student: {
          select: {
            user: { select: { name: true } },
          },
        },
        course: { select: { title: true } },
        _count: {
          select: { verificationLogs: true },
        },
      },
    });

    // Sort in-memory to guarantee descending order since Prisma relation count order can be driver-dependent
    const sortedTopCertificates = topCertificates
      .map(c => ({
        id: c.id,
        certificateId: c.certificateId,
        studentName: c.student.user.name,
        courseTitle: c.course.title,
        scanCount: c._count.verificationLogs,
      }))
      .sort((a, b) => b.scanCount - a.scanCount);

    // 4. Fetch logs from the last 7 days to generate timeline
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logsLast7Days = await prisma.verificationLog.findMany({
      where: {
        verifiedAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        verifiedAt: true,
      },
    });

    // Group timeline in JS (day by day)
    const timeline: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      timeline[dateStr] = 0;
    }

    logsLast7Days.forEach((log) => {
      const dateStr = log.verifiedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (timeline[dateStr] !== undefined) {
        timeline[dateStr]++;
      }
    });

    const timelineData = Object.entries(timeline).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        devices: deviceGroups.map((g) => ({
          name: g.device || "Unknown",
          count: g._count.id,
        })),
        countries: countryGroups.map((g) => ({
          name: g.country || "Local",
          count: g._count.id,
        })),
        results: resultGroups.map((g) => ({
          name: g.result,
          count: g._count.id,
        })),
        timeline: timelineData,
        topCertificates: sortedTopCertificates,
        recentLogs: recentLogs.map((rl) => ({
          id: rl.id,
          certificateId: rl.certificate?.certificateId || "Deleted Cert",
          studentName: rl.certificate?.student?.user?.name || "Unknown Student",
          result: rl.result,
          country: rl.country || "Local",
          device: rl.device || "Desktop",
          verifiedAt: rl.verifiedAt,
        })),
      },
    });
  } catch (error: any) {
    console.error("[GET /api/analytics/verification-logs] Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to fetch analytics" } },
      { status: 500 }
    );
  }
}
