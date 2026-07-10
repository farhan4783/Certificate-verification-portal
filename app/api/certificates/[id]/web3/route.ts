import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limiter";
import { verifyMessage } from "ethers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = await checkRateLimit(`web3-mint:${ipAddress}`, 15, 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate body
    const body = await request.json();
    const { contractAddress, tokenId, ownerWallet, networkName, signature } = body;

    if (!contractAddress || !tokenId || !ownerWallet || !networkName || !signature) {
      return NextResponse.json(
        { success: false, error: "Missing required Web3 parameters: contractAddress, tokenId, ownerWallet, networkName, signature" },
        { status: 400 }
      );
    }

    // Fetch the certificate and make sure it exists
    const cert = await prisma.certificate.findUnique({
      where: { id },
      include: {
        student: {
          include: { user: true },
        },
      },
    });

    if (!cert) {
      return NextResponse.json(
        { success: false, error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Verify the student ownership
    if (session.role === "STUDENT" && cert.student.user.email !== session.email) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You do not own this certificate" },
        { status: 403 }
      );
    }

    // Recover signer address from signature to verify wallet ownership
    const message = `I verify ownership of my certificate. Credential ID: ${cert.certificateId}. Owner Wallet: ${ownerWallet}.`;
    const recoveredAddress = verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== ownerWallet.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "Cryptographic wallet signature verification failed. Signer does not match ownerWallet." },
        { status: 400 }
      );
    }

    // Create or update the Web3Credential record
    const web3Cred = await prisma.web3Credential.upsert({
      where: { certificateId: id },
      create: {
        certificateId: id,
        contractAddress,
        tokenId,
        ownerWallet,
        networkName,
      },
      update: {
        contractAddress,
        tokenId,
        ownerWallet,
        networkName,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "UPDATE",
        table: "Web3Credential",
        recordId: web3Cred.id,
        metadata: { certificateId: cert.certificateId, tokenId, contractAddress },
      },
    });

    return NextResponse.json({
      success: true,
      data: web3Cred,
    });
  } catch (error: any) {
    console.error("[POST /api/certificates/[id]/web3] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record Web3 credential" },
      { status: 500 }
    );
  }
}
