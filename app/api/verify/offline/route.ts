import { NextResponse } from "next/server";
import { verifyCertificateSignature, getPublicKeyPEM } from "@/lib/crypto-sign";

/**
 * Offline Cryptographic Verification Endpoint
 * 
 * Verifies a certificate's Ed25519 digital signature without querying
 * the database. This is used when air-gapped auditors scan a QR code
 * containing the signed payload and need to validate authenticity.
 * 
 * POST /api/verify/offline
 * Body: { payload: { certificateId, studentName, courseTitle, issueDate }, signature: "base64url" }
 * 
 * GET /api/verify/offline
 * Returns the platform's public key for third-party verification tools.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payload, signature } = body;

    if (!payload || !signature) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing payload or signature. Both are required for offline verification.",
        },
        { status: 400 }
      );
    }

    const { certificateId, studentName, courseTitle, issueDate } = payload;

    if (!certificateId || !studentName || !courseTitle || !issueDate) {
      return NextResponse.json(
        {
          success: false,
          error: "Payload must include: certificateId, studentName, courseTitle, issueDate.",
        },
        { status: 400 }
      );
    }

    const isValid = verifyCertificateSignature(
      { certificateId, studentName, courseTitle, issueDate },
      signature
    );

    return NextResponse.json({
      success: true,
      data: {
        verified: isValid,
        method: "Ed25519",
        payload: { certificateId, studentName, courseTitle, issueDate },
        message: isValid
          ? "Signature is VALID. This certificate was authentically signed by the KodeToCareer platform."
          : "Signature is INVALID. This certificate may have been tampered with or was not issued by this platform.",
      },
    });
  } catch (error) {
    console.error("Offline verification error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request format." },
      { status: 400 }
    );
  }
}

/**
 * GET /api/verify/offline
 * Returns the platform's public key so third-party tools can verify
 * signatures without contacting the platform at all.
 */
export async function GET() {
  try {
    const publicKeyPem = getPublicKeyPEM();

    return NextResponse.json({
      success: true,
      data: {
        algorithm: "Ed25519",
        publicKey: publicKeyPem,
        usage: "Use this public key to verify Ed25519 signatures embedded in certificate QR codes.",
        verifyEndpoint: "/api/verify/offline",
      },
    });
  } catch (error) {
    console.error("Public key export error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export public key." },
      { status: 500 }
    );
  }
}
