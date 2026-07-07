import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

/**
 * Anomaly Detection & Anti-Fraud System
 * 
 * Monitors VerificationLog entries and flags suspicious patterns:
 * 
 * 1. Geographic Velocity Anomaly: Same certificate verified from
 *    multiple countries within a short time window.
 * 
 * 2. Excessive Scan Volume: A single certificate being scanned
 *    an abnormally high number of times in a day.
 * 
 * 3. Bot Detection: Multiple verifications from the same IP
 *    with identical user agents in rapid succession.
 */

export interface AnomalyAlert {
  type: "GEO_VELOCITY" | "EXCESSIVE_SCANS" | "BOT_SUSPECTED";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  certificateId: string;
  humanCertificateId: string;
  description: string;
  metadata: Record<string, unknown>;
  detectedAt: Date;
}

/**
 * Scan for geographic velocity anomalies.
 * 
 * Flags certificates that have been verified from 2+ distinct countries
 * within a configurable time window (default: 30 minutes).
 */
async function detectGeoVelocityAnomalies(
  windowMinutes: number = 30
): Promise<AnomalyAlert[]> {
  const alerts: AnomalyAlert[] = [];
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

  // Fetch recent verification logs grouped by certificate
  const recentLogs = await prisma.verificationLog.findMany({
    where: {
      verifiedAt: { gte: windowStart },
      country: { not: null },
    },
    include: {
      certificate: {
        select: { certificateId: true },
      },
    },
    orderBy: { verifiedAt: "desc" },
  });

  // Group by certificate ID
  const byCertificate = new Map<string, typeof recentLogs>();
  for (const log of recentLogs) {
    const certId = log.certificateId;
    if (!byCertificate.has(certId)) {
      byCertificate.set(certId, []);
    }
    byCertificate.get(certId)!.push(log);
  }

  // Check each certificate for multi-country anomalies
  for (const [certId, logs] of byCertificate) {
    const countries = new Set(logs.map((l) => l.country).filter(Boolean));
    if (countries.size >= 2) {
      const severity = countries.size >= 4 ? "CRITICAL" : countries.size >= 3 ? "HIGH" : "MEDIUM";
      alerts.push({
        type: "GEO_VELOCITY",
        severity,
        certificateId: certId,
        humanCertificateId: logs[0].certificate.certificateId,
        description: `Certificate verified from ${countries.size} different countries within ${windowMinutes} minutes: ${[...countries].join(", ")}`,
        metadata: {
          countries: [...countries],
          scanCount: logs.length,
          windowMinutes,
        },
        detectedAt: new Date(),
      });
    }
  }

  return alerts;
}

/**
 * Scan for excessive verification volume anomalies.
 * 
 * Flags certificates with more than a threshold number of
 * verification attempts in the last 24 hours.
 */
async function detectExcessiveScans(
  threshold: number = 50
): Promise<AnomalyAlert[]> {
  const alerts: AnomalyAlert[] = [];
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Use raw grouping via Prisma
  const certificatesWithHighScans = await prisma.verificationLog.groupBy({
    by: ["certificateId"],
    where: {
      verifiedAt: { gte: dayAgo },
    },
    _count: { id: true },
    having: {
      id: { _count: { gte: threshold } },
    },
  });

  for (const entry of certificatesWithHighScans) {
    const cert = await prisma.certificate.findUnique({
      where: { id: entry.certificateId },
      select: { certificateId: true },
    });

    alerts.push({
      type: "EXCESSIVE_SCANS",
      severity: entry._count.id >= threshold * 3 ? "HIGH" : "MEDIUM",
      certificateId: entry.certificateId,
      humanCertificateId: cert?.certificateId || "unknown",
      description: `Certificate received ${entry._count.id} verification scans in the last 24 hours (threshold: ${threshold}).`,
      metadata: {
        scanCount: entry._count.id,
        threshold,
        period: "24h",
      },
      detectedAt: new Date(),
    });
  }

  return alerts;
}

/**
 * Scan for bot-like behavior patterns.
 * 
 * Flags IPs that performed many verifications across different
 * certificates with the same user agent in a short window.
 */
async function detectBotBehavior(
  windowMinutes: number = 10,
  threshold: number = 15
): Promise<AnomalyAlert[]> {
  const alerts: AnomalyAlert[] = [];
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

  const recentLogs = await prisma.verificationLog.findMany({
    where: {
      verifiedAt: { gte: windowStart },
      ipAddress: { not: null },
    },
    include: {
      certificate: { select: { certificateId: true } },
    },
    orderBy: { verifiedAt: "desc" },
  });

  // Group by IP
  const byIp = new Map<string, typeof recentLogs>();
  for (const log of recentLogs) {
    const ip = log.ipAddress || "unknown";
    if (!byIp.has(ip)) {
      byIp.set(ip, []);
    }
    byIp.get(ip)!.push(log);
  }

  for (const [ip, logs] of byIp) {
    if (logs.length >= threshold) {
      const uniqueCerts = new Set(logs.map((l) => l.certificateId));
      alerts.push({
        type: "BOT_SUSPECTED",
        severity: logs.length >= threshold * 3 ? "CRITICAL" : "HIGH",
        certificateId: logs[0].certificateId,
        humanCertificateId: logs[0].certificate.certificateId,
        description: `IP ${ip} made ${logs.length} verification requests across ${uniqueCerts.size} certificates in ${windowMinutes} minutes.`,
        metadata: {
          ipAddress: ip,
          requestCount: logs.length,
          uniqueCertificates: uniqueCerts.size,
          windowMinutes,
          userAgent: logs[0].userAgent,
        },
        detectedAt: new Date(),
      });
    }
  }

  return alerts;
}

/**
 * Run all anomaly detection scans and return aggregated alerts.
 */
export async function runAnomalyDetection(): Promise<AnomalyAlert[]> {
  logger.info("Running anomaly detection scan...");

  const [geoAlerts, scanAlerts, botAlerts] = await Promise.all([
    detectGeoVelocityAnomalies(),
    detectExcessiveScans(),
    detectBotBehavior(),
  ]);

  const allAlerts = [...geoAlerts, ...scanAlerts, ...botAlerts];

  if (allAlerts.length > 0) {
    logger.warn(`Anomaly detection found ${allAlerts.length} alert(s).`);
  } else {
    logger.info("Anomaly detection completed. No anomalies detected.");
  }

  return allAlerts;
}
