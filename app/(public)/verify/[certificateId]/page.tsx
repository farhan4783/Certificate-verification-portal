import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { VerificationResult } from "@prisma/client";
import { CheckCircle2, XCircle, AlertTriangle, ExternalLink, Award, ShieldCheck, Cpu } from "lucide-react";
import KtcLogo from "@/components/ui/KtcLogo";
import BlockchainAuditCard from "@/components/dashboard/BlockchainAuditCard";
import SocialShareBar from "@/components/dashboard/SocialShareBar";
import PdfFileVerifier from "@/components/dashboard/PdfFileVerifier";
import { headers } from "next/headers";
import { getAppBaseUrl } from "@/lib/utils";

const appUrl = getAppBaseUrl();

interface PageProps {
  params: Promise<{ certificateId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const { certificateId } = await params;
    const rawId = certificateId ? decodeURIComponent(certificateId).trim() : "";
    const hyphenatedId = rawId.replace(/\s+/g, "-");

    const cert = await prisma.certificate.findFirst({
      where: {
        OR: [
          { certificateId: certificateId },
          { certificateId: rawId },
          { certificateId: hyphenatedId },
          { verificationToken: certificateId },
          { verificationToken: rawId },
          { verificationToken: hyphenatedId },
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

    const studentName = cert.student?.user?.name || "Student";
    const courseTitle = cert.course?.title || "Course";
    const orgName = cert.student?.organization?.name || "Kode To Career";

    const title = `${studentName} – ${courseTitle} | Verified Credential`;
    const description = `Verified credential for ${studentName} in ${courseTitle}, issued by ${orgName}. Secured with SHA-256 hashing and Ed25519 digital signatures.`;
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
  } catch (e) {
    return { title: "Credential Verification – KodeToCareer" };
  }
}

export default async function VerifyPage({ params }: PageProps) {
  const { certificateId } = await params;
  const rawId = certificateId ? decodeURIComponent(certificateId).trim() : "";
  const hyphenatedId = rawId.replace(/\s+/g, "-");

  // 1. Fetch certificate details safely
  let cert: any = null;
  try {
    cert = await prisma.certificate.findFirst({
      where: {
        OR: [
          { certificateId: certificateId },
          { certificateId: rawId },
          { certificateId: hyphenatedId },
          { verificationToken: certificateId },
          { verificationToken: rawId },
          { verificationToken: hyphenatedId },
        ],
      },
      include: {
        student: {
          select: {
            enrollmentNumber: true,
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
  } catch (err) {
    console.error("Failed to query certificate in VerifyPage:", err);
  }

  // Determine verification result
  let result: VerificationResult = VerificationResult.INVALID;
  let statusText = "INVALID CREDENTIAL";

  if (cert) {
    if (cert.status === "ISSUED") {
      if (cert.expiryDate && new Date(cert.expiryDate) < new Date()) {
        result = VerificationResult.EXPIRED;
        statusText = "EXPIRED CREDENTIAL";
      } else {
        result = VerificationResult.VALID;
        statusText = "OFFICIALLY VERIFIED CREDENTIAL";
      }
    } else if (cert.status === "REVOKED") {
      result = VerificationResult.REVOKED;
      statusText = "REVOKED CREDENTIAL";
    }
  }

  // 2. Log Verification Event
  if (cert) {
    try {
      const headersList = await headers();
      const purposeHeader = headersList.get("purpose") || headersList.get("sec-purpose") || "";
      const isPrefetch = purposeHeader.toLowerCase().includes("prefetch");

      if (!isPrefetch) {
        const ipAddress = headersList.get("x-forwarded-for") || "127.0.0.1";
        const userAgent = headersList.get("user-agent") || "unknown";
        const referrer = headersList.get("referer") || "unknown";
        const country = headersList.get("x-vercel-ip-country") || "local";
        const isMobile = /mobile/i.test(userAgent);
        const device = isMobile ? "Mobile" : "Desktop";

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
        }).catch((logError) => {
          console.error("Failed to save verification log:", logError);
        });
      }
    } catch (logError) {
      console.error("Failed to process verification log headers:", logError);
    }
  }

  const studentName = cert?.student?.user?.name || "N/A";
  const courseTitle = cert?.course?.title || "N/A";
  const orgName = cert?.student?.organization?.name || "Kode To Career";
  const trainerName = cert?.trainer?.user?.name || "Authorized Instructor";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between antialiased">
      {/* Background glowing ambient effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Light Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 w-full px-6 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <KtcLogo size="md" href="/" />
          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            Sovereign Ledger Verification v1.0
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-0">
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl">
          
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
                  <ShieldCheck className="h-16 w-16 text-emerald-600 relative" />
                </div>
              )}
              {result === "EXPIRED" && (
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl scale-125" />
                  <AlertTriangle className="h-16 w-16 text-amber-500 relative" />
                </div>
              )}
              {(result === "INVALID" || result === "REVOKED") && (
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-xl scale-125" />
                  <XCircle className="h-16 w-16 text-rose-600 relative" />
                </div>
              )}

              <h1 className={`text-2xl font-extrabold tracking-tight ${
                result === "VALID" ? "text-emerald-700" :
                result === "EXPIRED" ? "text-amber-700" :
                "text-rose-700"
              }`}>
                {statusText}
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                {result === "VALID" 
                  ? "This credential has been verified as authentic and active." 
                  : "We could not verify the authenticity of this credential."}
              </p>
            </div>

            {/* Content Details Block */}
            {result === "VALID" && cert ? (
              <div className="space-y-6">
                
                {/* Certificate Details Info grid */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                  
                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200/80">
                    <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Recipient</span>
                    <div className="col-span-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-extrabold text-slate-900">{studentName}</span>
                      {cert?.student?.enrollmentNumber && (
                        <Link
                          href={`/profile/${cert.student.enrollmentNumber}`}
                          className="text-xs text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200"
                        >
                          KTC Talent Profile ↗
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200/80">
                    <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Course / Program</span>
                    <span className="col-span-2 text-sm font-semibold text-slate-800">{courseTitle}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200/80">
                    <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Issuing Institution</span>
                    <span className="col-span-2 text-sm font-semibold text-slate-800">{orgName}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200/80">
                    <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Authorized Trainer</span>
                    <span className="col-span-2 text-sm font-medium text-slate-700">{trainerName}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200/80">
                    <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Issue Date</span>
                    <span className="col-span-2 text-sm font-medium text-slate-700">
                      {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }) : "N/A"}
                    </span>
                  </div>

                  {cert.expiryDate && (
                    <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200/80">
                      <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Expiry Date</span>
                      <span className="col-span-2 text-sm text-slate-700">
                        {new Date(cert.expiryDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200/80">
                    <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Credential ID</span>
                    <span className="col-span-2 text-sm font-mono font-bold text-blue-700">{cert.certificateId}</span>
                  </div>

                  {cert.grade && (
                    <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200/80">
                      <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Final Grade</span>
                      <span className="col-span-2 text-sm font-bold text-emerald-700">{cert.grade}</span>
                    </div>
                  )}

                  {cert.pdfHash && (
                    <div className="grid grid-cols-3 gap-2 py-2">
                      <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">SHA-256 Integrity</span>
                      <span className="col-span-2 text-[10px] font-mono text-slate-600 break-all bg-white p-2 rounded border border-slate-200">
                        {cert.pdfHash}
                      </span>
                    </div>
                  )}
                </div>

                {/* Web3 Blockchain Audit Card */}
                {cert.web3Credential && (
                  <BlockchainAuditCard web3Credential={cert.web3Credential} />
                )}

                {/* PDF Verification & Download Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {cert.pdfUrl && (
                    <a
                      href={cert.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md shadow-sky-500/20 text-center flex items-center justify-center gap-2"
                    >
                      <span>Download Official PDF Certificate</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                {/* Social Share Component */}
                <SocialShareBar
                  certificateId={cert.certificateId}
                  courseTitle={courseTitle}
                  studentName={studentName}
                />

                {/* PDF Drag & Drop Integrity Verifier */}
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-bold text-slate-900 mb-2">Cryptographic PDF Verification</h3>
                  <PdfFileVerifier expectedHash={cert.pdfHash || ""} />
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-600 text-sm mb-4">
                  The requested certificate ID <span className="font-mono font-bold text-rose-600">{certificateId}</span> was not found in our verified ledger.
                </p>
                <Link
                  href="/"
                  className="inline-block px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 KodeToCareer Sovereign Verification System. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
            <Link href="/graduates" className="hover:text-slate-800 transition-colors">Talent Showcase</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
