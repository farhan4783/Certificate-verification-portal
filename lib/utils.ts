import crypto from "crypto";

export function generateCertificateId(courseTitle: string): string {
  const words = courseTitle.toUpperCase().split(/\s+/);
  let abbreviation = words
    .map((word) => word.replace(/[^A-Z]/g, ""))
    .filter((word) => word.length > 0)
    .map((word) => word[0])
    .join("");

  if (abbreviation.length === 0) {
    abbreviation = "KTC";
  }

  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);

  return `KTC-${abbreviation}-${year}-${randomNum}`;
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function getAppBaseUrl(hostHeader?: string | null): string {
  let url = process.env.NEXT_PUBLIC_APP_URL || "https://certificate-verification-portal.vercel.app";
  
  if (hostHeader && !hostHeader.includes("localhost")) {
    url = `https://${hostHeader}`;
  }

  // Strip temporary Vercel preview deployment hashes (e.g. -4fazbzqjx.vercel.app -> .vercel.app)
  url = url.replace(/-[a-z0-9]{8,}\.vercel\.app$/i, ".vercel.app");

  if (url.includes("localhost")) {
    return "http://localhost:3000";
  }

  return url;
}
