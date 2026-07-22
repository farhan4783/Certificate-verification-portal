import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { VerificationResult } from "@prisma/client";
import { CheckCircle2, XCircle, AlertTriangle, ExternalLink, Award, ShieldCheck, Cpu } from "lucide-react";
import BlockchainAuditCard from "@/components/dashboard/BlockchainAuditCard";
import SocialShareBar from "@/components/dashboard/SocialShareBar";
import PdfFileVerifier from "@/components/dashboard/PdfFileVerifier";
import { after } from "next/server";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function generateMetadata({ params }: PageProps) {
  const { certificateId } = await params;

  const cert = await prisma.certificate.findFirst({
    where: {
      OR: [
        { certificateId: certificateId },
        { verificationToken: certificateId },
      ],
    },
    include: {
      student: { include: { user: { select: { name: true } }, organization: { select: { name: true } } } },
      course: { select: { title: true } },
    },
  });

  if (!cert) {
    return { title: "Invalid Credential – KodeToCareer" };
  }

  const title = `${cert.student.user.name} – ${cert.course.title} | Verified Credential`;
  const description = `Verified credential for ${cert.student.user.name} in ${cert.course.title}, issued by ${cert.student.organization.name}. Secured with SHA-256 hashing and Ed25519 digital signatures.`;
  const ogImageUrl = `${appUrl}/api/verify/${cert.certificateId}/og-image`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${appUrl}/verify/${cert.certificateId}`,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
      type: "article",
      siteName: "KodeToCareer",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

interface PageProps {
  params: Promise<{ certificateId: string }>;
}

export default async function VerifyPage({ params }: PageProps) {
  const { certificateId } = await params;

  // 1. Fetch certificate details using Prisma directly on the server
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
      web3Credential: true,
    },
  });

  // Determine verification result
  let result: VerificationResult = "INVALID";
  let statusText = "Invalid Credential";
  
  if (cert) {
    if (cert.status === "REVOKED") {
      result = "REVOKED";
      statusText = "Revoked Credential";
    } else if (cert.status === "EXPIRED" || (cert.expiryDate && new Date() > cert.expiryDate)) {
      result = "EXPIRED";
      statusText = "Expired Credential";
    } else if (cert.status === "ISSUED" || cert.status === "GENERATED") {
      result = "VALID";
      statusText = "Verified Credential";
    }
  }

  // 2. Log verification attempt (if certificate exists and not a prefetch request)
  if (cert) {
    try {
      const { headers } = await import("next/headers");
      const headersList = await headers();
      
      const purpose = headersList.get("purpose") || headersList.get("x-purpose") || "";
      const isPrefetch = purpose === "prefetch" || headersList.get("x-middleware-prefetch") === "1";

      if (!isPrefetch) {
        const ipAddress = headersList.get("x-forwarded-for") || "127.0.0.1";
        const userAgent = headersList.get("user-agent") || "unknown";
        const referrer = headersList.get("referer") || "unknown";
        const country = headersList.get("x-vercel-ip-country") || "local";
        const isMobile = /mobile/i.test(userAgent);
        const device = isMobile ? "Mobile" : "Desktop";

        after(async () => {
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
            console.error("Failed to save verification log in after():", logError);
          }
        });
      }
    } catch (logError) {
      console.error("Failed to log verification page view:", logError);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased selection:bg-amber-500/30">
      {/* Background glowing ambient effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 w-full px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Award className="h-7 w-7 text-amber-500 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              KODE TO CAREER
            </span>
          </Link>
          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            Secure Credential Network v1.0
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-0">
        <div className="w-full max-w-2xl bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-300">
          
          {/* Card Accent Top Line */}
          <div className={`h-1.5 w-full ${
            result === "VALID" ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
            result === "EXPIRED" ? "bg-gradient-to-r from-amber-500 to-orange-500" :
            "bg-gradient-to-r from-rose-500 to-red-500"
          }`} />

          <div className="p-8 sm:p-12">
            
            {/* Status Section */}
            <div className="flex flex-col items-center text-center mb-8">
              {result === "VALID" && (
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl scale-125 animate-pulse" />
                  <ShieldCheck className="h-16 w-16 text-emerald-400 relative" />
                </div>
              )}
              {result === "EXPIRED" && (
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl scale-125" />
                  <AlertTriangle className="h-16 w-16 text-amber-400 relative" />
                </div>
              )}
              {(result === "INVALID" || result === "REVOKED") && (
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-xl scale-125" />
                  <XCircle className="h-16 w-16 text-rose-400 relative" />
                </div>
              )}

              <h1 className={`text-2xl font-bold tracking-tight ${
                result === "VALID" ? "text-emerald-400" :
                result === "EXPIRED" ? "text-amber-400" :
                "text-rose-400"
              }`}>
                {statusText}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {result === "VALID" 
                  ? "This credential has been verified as authentic and active." 
                  : "We could not verify the authenticity of this credential."}
              </p>
            </div>

            {/* Content Details Block */}
            {result === "VALID" && cert ? (
              <div className="space-y-6">
                
                {/* Certificate Details Info grid */}
                <div className="bg-slate-950/50 rounded-xl border border-slate-800/60 p-6 space-y-4">
                  
                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-800/40">
                    <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Recipient</span>
                    <span className="col-span-2 text-sm font-semibold text-slate-100">{cert.student.user.name}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-800/40">
                    <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Course / Program</span>
                    <span className="col-span-2 text-sm font-medium text-slate-200">{cert.course.title}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-800/40">
                    <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Issuing Institution</span>
                    <span className="col-span-2 text-sm font-medium text-slate-200">{cert.student.organization.name}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-800/40">
                    <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Authorized Trainer</span>
                    <span className="col-span-2 text-sm font-medium text-slate-300">{cert.trainer.user.name}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-800/40">
                    <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Issue Date</span>
                    <span className="col-span-2 text-sm text-slate-300">
                      {cert.issueDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {cert.expiryDate && (
                    <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-800/40">
                      <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Expiration Date</span>
                      <span className="col-span-2 text-sm text-slate-300">
                        {cert.expiryDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-800/40">
                    <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Credential ID</span>
                    <span className="col-span-2 text-sm font-mono text-amber-400 select-all">{cert.certificateId}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2">
                    <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Language</span>
                    <span className="col-span-2 text-sm font-semibold text-slate-200">
                      {cert.language === "es" ? "Español (ES) 🇪🇸" : cert.language === "fr" ? "Français (FR) 🇫🇷" : "English (EN) 🇬🇧"}
                    </span>
                  </div>

                </div>

                {/* Web3 Credential (NFT) Details */}
                {cert.web3Credential && (
                  <div className="border border-cyan-800/80 bg-cyan-950/10 rounded-xl p-5 shadow-lg shadow-cyan-500/5 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 animate-pulse">
                        <Cpu className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Soulbound Token Credential</h3>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            ERC-721
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          This certificate has been minted as an on-chain non-transferable Soulbound NFT, verifying ownership and registry directly against the public blockchain contract.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-[10px] font-mono">
                          <div className="p-2 rounded bg-slate-950/80 border border-slate-850 truncate">
                            <span className="text-slate-500 block mb-0.5">CONTRACT ADDRESS</span>
                            <a
                              href={`https://polygonscan.com/address/${cert.web3Credential.contractAddress}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 select-all"
                            >
                              {cert.web3Credential.contractAddress}
                            </a>
                          </div>
                          <div className="p-2 rounded bg-slate-950/80 border border-slate-850">
                            <span className="text-slate-500 block mb-0.5">TOKEN ID / NETWORK</span>
                            <span className="text-slate-200">
                              #{cert.web3Credential.tokenId} ({cert.web3Credential.networkName})
                            </span>
                          </div>
                          <div className="p-2 rounded bg-slate-950/80 border border-slate-850 sm:col-span-2 truncate">
                            <span className="text-slate-500 block mb-0.5">OWNER WALLET</span>
                            <a
                              href={`https://polygonscan.com/address/${cert.web3Credential.ownerWallet}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 select-all"
                            >
                              {cert.web3Credential.ownerWallet}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Blockchain Audit Anchor */}
                <BlockchainAuditCard
                  txHash={cert.blockchainTxHash}
                  block={cert.blockchainBlock}
                  pdfHash={cert.pdfHash}
                  language={cert.language}
                  issueDate={cert.issueDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                />

                {/* Embedded PDF Live Viewer */}
                {cert.pdfUrl && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-400" /> Embedded Official PDF Document Preview
                    </h3>
                    <div className="w-full h-96 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative">
                      <iframe
                        src={cert.pdfUrl}
                        className="w-full h-full border-0"
                        title="Official PDF Certificate Document"
                      />
                    </div>
                  </div>
                )}

                {/* Social Sharing */}
                <SocialShareBar
                  certificateId={cert.certificateId}
                  studentName={cert.student.user.name}
                  courseTitle={cert.course.title}
                  organizationName={cert.student.organization.name}
                  verifyUrl={`${appUrl}/verify/${cert.certificateId}`}
                />

                {cert.pdfUrl && (
                  <div className="pt-2">
                    <a
                      href={cert.pdfUrl}
                      target={cert.pdfUrl.startsWith("data:") ? "_self" : "_blank"}
                      download={cert.pdfUrl.startsWith("data:") ? `${cert.certificateId}.pdf` : undefined}
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold text-sm rounded-xl transition duration-200 group shadow-lg shadow-amber-500/10 cursor-pointer"
                    >
                      {cert.pdfUrl.startsWith("data:") ? "Download Official PDF Certificate" : "View Original PDF Certificate"}
                      <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                    </a>
                  </div>
                )}

                {/* PDF Drag-and-Drop Tamper Inspector */}
                <div className="pt-4 border-t border-slate-850">
                  <PdfFileVerifier />
                </div>

              </div>
            ) : (
              /* Invalid State details */
              <div className="space-y-6">
                <div className="bg-rose-950/20 rounded-xl border border-rose-900/30 p-6 text-center space-y-3">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    This certificate could not be resolved in the Kode To Career platform database.
                  </p>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    If this credential was issued recently, it might still be in DRAFT mode or the link could contain typographical errors. Please double check the QR scan address or verify with the issuer.
                  </p>
                </div>
                <div className="text-center pt-2">
                  <a
                    href="mailto:info@kodetocareer.com"
                    className="inline-flex items-center justify-center text-xs font-semibold text-amber-400 hover:text-amber-300 transition duration-200 border-b border-transparent hover:border-amber-350"
                  >
                    Contact platform support at info@kodetocareer.com
                  </a>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-6 w-full text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Kode To Career. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="https://kodetocareer.com/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="https://kodetocareer.com/terms" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
