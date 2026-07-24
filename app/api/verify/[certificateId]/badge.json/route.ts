import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Open Badges 3.0 Standard JSON-LD Endpoint
 * 
 * Returns a W3C Verifiable Credential / Open Badges v3.0 compliant
 * JSON-LD payload. This allows students to import their KodeToCareer
 * credentials into badge platforms like Credly, Badgr, and LinkedIn.
 * 
 * Specification: https://www.imsglobal.org/spec/ob/v3p0/
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params;
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost"))
      ? process.env.NEXT_PUBLIC_APP_URL
      : (host && !host.includes("localhost") ? `${protocol}://${host}` : "https://certificate-verification-portal-4fazbzqjx.vercel.app");

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
            user: { select: { name: true, email: true } },
            organization: { select: { name: true, logo: true, website: true, email: true } },
          },
        },
        course: { select: { title: true, description: true, duration: true } },
        trainer: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!cert || cert.status === "DRAFT") {
      return NextResponse.json(
        { error: "Badge not found or credential is still in DRAFT status." },
        { status: 404 }
      );
    }

    if (cert.status === "REVOKED") {
      return NextResponse.json(
        { error: "This credential has been revoked by the issuer." },
        { status: 410 }
      );
    }

    // Build Open Badges 3.0 compliant JSON-LD response
    const badge = {
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
      ],
      id: `${appUrl}/api/verify/${cert.certificateId}/badge.json`,
      type: ["VerifiableCredential", "OpenBadgeCredential"],
      name: `${cert.course.title} – Certificate of Completion`,
      issuer: {
        id: cert.student.organization.website || `${appUrl}`,
        type: ["Profile"],
        name: cert.student.organization.name,
        url: cert.student.organization.website || appUrl,
        email: cert.student.organization.email || undefined,
        image: cert.student.organization.logo
          ? {
              id: cert.student.organization.logo,
              type: "Image",
            }
          : undefined,
      },
      issuanceDate: cert.issueDate.toISOString(),
      expirationDate: cert.expiryDate ? cert.expiryDate.toISOString() : undefined,
      credentialSubject: {
        id: `mailto:${cert.student.user.email}`,
        type: ["AchievementSubject"],
        name: cert.student.user.name,
        achievement: {
          id: `${appUrl}/api/verify/${cert.certificateId}/badge.json#achievement`,
          type: ["Achievement"],
          name: cert.course.title,
          description:
            cert.course.description ||
            `Successfully completed the ${cert.course.title} program.`,
          criteria: {
            type: "Criteria",
            narrative: `To earn this credential, ${cert.student.user.name} successfully completed the ${cert.course.title} program${cert.course.duration ? ` (${cert.course.duration})` : ""} under the supervision of ${cert.trainer.user.name}.`,
          },
          image: cert.student.organization.logo
            ? {
                id: cert.student.organization.logo,
                type: "Image",
              }
            : undefined,
        },
      },
      credentialStatus: {
        id: `${appUrl}/api/verify/${cert.certificateId}`,
        type: "1EdTechRevocationList",
      },
      proof: {
        type: "DataIntegrityProof",
        cryptosuite: "sha256-hash",
        created: cert.createdAt.toISOString(),
        proofPurpose: "assertionMethod",
        proofValue: cert.pdfHash || undefined,
      },
      evidence: cert.pdfUrl
        ? [
            {
              id: cert.pdfUrl,
              type: ["Evidence"],
              name: "Certificate PDF Document",
              description: `Official PDF certificate for ${cert.course.title}.`,
            },
          ]
        : undefined,
    };

    return NextResponse.json(badge, {
      headers: {
        "Content-Type": "application/ld+json",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Open Badges endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
