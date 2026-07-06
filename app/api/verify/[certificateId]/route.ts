import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { VerificationResult } from "@prisma/client";

// Simple in-memory rate limiting map for local dev (key: IP, value: timestamp[])
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  
  // Filter out timestamps outside the window
  const activeTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  
  if (activeTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  
  activeTimestamps.push(now);
  rateLimitMap.set(ip, activeTimestamps);
  return false;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params;
    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";

    // 1. Enforce rate limiting
    if (isRateLimited(ipAddress)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOO_MANY_REQUESTS",
            message: "Too many verification requests. Please try again in a minute.",
          },
        },
        { status: 429 }
      );
    }

    // 2. Query certificate
    // Search by certificateId OR verificationToken
    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [
          { certificateId: certificateId },
          { verificationToken: certificateId },
        ],
      },
      include: {
        student: {
          include: {
            user: {
              select: { name: true },
            },
            organization: {
              select: { name: true, logo: true },
            },
          },
        },
        course: {
          select: { title: true },
        },
        trainer: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    // 3. Gather request metadata for logging
    const userAgent = request.headers.get("user-agent") || "unknown";
    const referrer = request.headers.get("referer") || "unknown";
    const country = request.headers.get("x-vercel-ip-country") || "local";
    const isMobile = /mobile/i.test(userAgent);
    const device = isMobile ? "Mobile" : "Desktop";

    // 4. Handle Not Found (INVALID)
    if (!cert) {
      // Cannot log to VerificationLog due to missing foreign key, log to AuditLog
      try {
        await prisma.auditLog.create({
          data: {
            action: "VERIFY",
            table: "Certificate",
            recordId: "00000000-0000-0000-0000-000000000000", // Nil UUID
            metadata: {
              ipAddress,
              userAgent,
              result: "INVALID",
              attemptedId: certificateId,
            },
          },
        });
      } catch (logError) {
        console.error("Failed to log invalid verification:", logError);
      }

      return NextResponse.json({
        success: true,
        data: {
          result: "INVALID",
          certificate: null,
        },
      });
    }

    // 5. Determine verification status
    let result: VerificationResult = "VALID";
    
    if (cert.status === "REVOKED") {
      result = "REVOKED";
    } else if (cert.status === "EXPIRED" || (cert.expiryDate && new Date() > cert.expiryDate)) {
      result = "EXPIRED";
    } else if (cert.status === "DRAFT") {
      // Draft certificates are not publicly verifiable
      result = "INVALID";
    }

    // 6. Log attempt in VerificationLog
    try {
      await prisma.verificationLog.create({
        data: {
          certificateId: cert.id,
          result,
          ipAddress,
          device,
          userAgent,
          referrer,
          country,
        },
      });
    } catch (logError) {
      console.error("Failed to save verification log:", logError);
    }

    // 7. Return payload scoped to public requirements (never leak sensitive fields)
    if (result !== "VALID") {
      return NextResponse.json({
        success: true,
        data: {
          result,
          certificate: {
            certificateId: cert.certificateId,
            status: cert.status,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        result,
        certificate: {
          certificateId: cert.certificateId,
          studentName: cert.student.user.name,
          courseTitle: cert.course.title,
          trainerName: cert.trainer.user.name,
          organizationName: cert.student.organization.name,
          organizationLogo: cert.student.organization.logo,
          issueDate: cert.issueDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          expiryDate: cert.expiryDate
            ? cert.expiryDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : null,
          status: cert.status,
          pdfUrl: cert.pdfUrl,
          blockchainTxHash: cert.blockchainTxHash,
          blockchainBlock: cert.blockchainBlock,
          language: cert.language,
        },
      },
    });
  } catch (error) {
    console.error("Verification API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
