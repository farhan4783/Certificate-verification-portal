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
