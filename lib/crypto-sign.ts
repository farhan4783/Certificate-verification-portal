import crypto from "crypto";

/**
 * Ed25519 Cryptographic Signing & Verification Utilities
 * 
 * Used for offline verification of certificates. A signed payload is
 * embedded inside the QR code so that air-gapped scanners can verify
 * authenticity without an internet connection.
 */

interface CertificateSignPayload {
  certificateId: string;
  studentName: string;
  courseTitle: string;
  issueDate: string;
}

/**
 * Derive a deterministic Ed25519 key pair from a seed.
 * In production, you should use a dedicated SIGNING_PRIVATE_KEY env var.
 * This fallback derives from JWT_SECRET for local development convenience.
 */
function getKeyPair(): { privateKey: crypto.KeyObject; publicKey: crypto.KeyObject } {
  const signingKey = process.env.SIGNING_PRIVATE_KEY;
  
  if (signingKey) {
    // If a raw hex seed is provided (32 bytes = 64 hex chars)
    if (/^[0-9a-fA-F]{64}$/.test(signingKey)) {
      const seed = Buffer.from(signingKey, "hex");
      const privateKey = crypto.createPrivateKey({
        key: Buffer.concat([
          // DER prefix for Ed25519 private key (PKCS#8 wrapping of 32-byte seed)
          Buffer.from("302e020100300506032b657004220420", "hex"),
          seed,
        ]),
        format: "der",
        type: "pkcs8",
      });
      const publicKey = crypto.createPublicKey(privateKey);
      return { privateKey, publicKey };
    }
    
    // If a PEM key is provided
    const privateKey = crypto.createPrivateKey(signingKey);
    const publicKey = crypto.createPublicKey(privateKey);
    return { privateKey, publicKey };
  }
  
  // Fallback: derive from JWT_SECRET (development only)
  const secret = process.env.JWT_SECRET || "dev-fallback-signing-secret-key-0000";
  const seed = crypto.createHash("sha256").update(secret).digest().subarray(0, 32);
  
  const privateKey = crypto.createPrivateKey({
    key: Buffer.concat([
      Buffer.from("302e020100300506032b657004220420", "hex"),
      seed,
    ]),
    format: "der",
    type: "pkcs8",
  });
  const publicKey = crypto.createPublicKey(privateKey);
  return { privateKey, publicKey };
}

/**
 * Sign a certificate payload and return a compact base64url signature.
 */
export function signCertificatePayload(payload: CertificateSignPayload): string {
  const { privateKey } = getKeyPair();
  const message = canonicalize(payload);
  const signature = crypto.sign(null, Buffer.from(message), privateKey);
  return signature.toString("base64url");
}

/**
 * Verify a certificate payload against a base64url signature.
 * Returns true if the signature is valid.
 */
export function verifyCertificateSignature(
  payload: CertificateSignPayload,
  signatureB64: string
): boolean {
  try {
    const { publicKey } = getKeyPair();
    const message = canonicalize(payload);
    const signature = Buffer.from(signatureB64, "base64url");
    return crypto.verify(null, Buffer.from(message), publicKey, signature);
  } catch {
    return false;
  }
}

/**
 * Get the platform's public key in PEM format.
 * This can be shared publicly for offline verification.
 */
export function getPublicKeyPEM(): string {
  const { publicKey } = getKeyPair();
  return publicKey.export({ type: "spki", format: "pem" }) as string;
}

/**
 * Canonicalize a payload into a deterministic string for signing.
 * Sorted keys ensure consistent signatures regardless of property order.
 */
function canonicalize(payload: CertificateSignPayload): string {
  const record = payload as unknown as Record<string, string>;
  const sorted = Object.keys(record)
    .sort()
    .reduce((acc, key) => {
      acc[key] = record[key];
      return acc;
    }, {} as Record<string, string>);
  return JSON.stringify(sorted);
}
