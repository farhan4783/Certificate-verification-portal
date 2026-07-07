import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { runAnomalyDetection } from "@/lib/anomaly-detector";

/**
 * Security Alerts API
 * 
 * Runs the anomaly detection scan and returns all active alerts.
 * Protected: Admin-only access.
 * 
 * GET /api/analytics/security-alerts
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ORG_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const alerts = await runAnomalyDetection();

    return NextResponse.json({
      success: true,
      data: {
        totalAlerts: alerts.length,
        criticalCount: alerts.filter((a) => a.severity === "CRITICAL").length,
        highCount: alerts.filter((a) => a.severity === "HIGH").length,
        mediumCount: alerts.filter((a) => a.severity === "MEDIUM").length,
        lowCount: alerts.filter((a) => a.severity === "LOW").length,
        alerts,
      },
    });
  } catch (error) {
    console.error("Security alerts API error:", error);
    return NextResponse.json(
      { error: "Failed to run anomaly detection." },
      { status: 500 }
    );
  }
}
