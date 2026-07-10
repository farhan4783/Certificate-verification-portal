import { ImageResponse } from "next/og";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params;

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
            user: { select: { name: true } },
            organization: { select: { name: true, logo: true } },
          },
        },
        course: { select: { title: true } },
        trainer: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!cert || cert.status === "DRAFT") {
      return new Response("Not found", { status: 404 });
    }

    const orgName = cert.student.organization.name;
    const studentName = cert.student.user.name;
    const courseTitle = cert.course.title;
    const issueDateStr = cert.issueDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Create the image response using JSX (with Tailwind CSS utilities supported by Satori)
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: "#030712", // slate-950
            backgroundImage: "radial-gradient(circle at 75% 25%, #1e1b4b 0%, #030712 60%)", // Indigo glow
            padding: "80px",
            fontFamily: "sans-serif",
            position: "relative",
            borderTop: "8px solid #f59e0b", // Gold accent top
            borderBottom: "4px solid #f59e0b", // Gold accent bottom
          }}
        >
          {/* Top Row - Organization & Badge */}
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "16px", fontWeight: "bold", color: "#9ca3af", letterSpacing: "2px", textTransform: "uppercase" }}>
              {orgName}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: "9999px",
                padding: "6px 16px",
              }}
            >
              <span style={{ color: "#10b981", fontSize: "14px", fontWeight: "bold" }}>
                ✓ VERIFIED CREDENTIAL
              </span>
            </div>
          </div>

          {/* Main Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "40px" }}>
            <span style={{ fontSize: "48px", fontWeight: "bold", color: "#f59e0b", letterSpacing: "-1px" }}>
              {studentName}
            </span>
            {/* Divider */}
            <div style={{ height: "2px", width: "520px", backgroundColor: "rgba(75, 85, 99, 0.4)" }} />
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "#f3f4f6", marginTop: "8px" }}>
              {courseTitle}
            </span>
            <span style={{ fontSize: "16px", color: "#9ca3af" }}>
              Authorized by {cert.trainer.user.name} on {issueDateStr}
            </span>
          </div>

          {/* Footer Row */}
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto" }}>
            <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#4b5563" }}>
              ID: {cert.certificateId}
            </span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: "18px", fontWeight: "bold", color: "#0ea5e9" }}>
                KODE TO CAREER
              </span>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                Secure Credential Ledger
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG image generation error:", error);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
