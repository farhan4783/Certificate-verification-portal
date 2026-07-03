# Security Guidelines

**Project:** Kode To Career — Certificate & Credential Verification Platform

---

## 1. Authentication
- JWT-based sessions, stored in **HttpOnly** cookies (not accessible to client-side JS).
- JWT payload limited to `{ id, email, role }` — no sensitive data embedded in the token.
- Session expiry: 7 days; user must re-authenticate afterward.
- All protected routes pass through `middleware.ts`, which verifies the JWT and enforces role guards before the request reaches a page or API route.

## 2. Authorization
- Role-Based Access Control (RBAC) enforced at two layers:
  1. **Middleware** — coarse route-level gating (e.g., only Trainer/Admin can reach `/dashboard/trainer`, `/dashboard/admin`).
  2. **Service layer** — fine-grained data scoping (a Trainer's queries are always filtered to their own `trainerId`/`organizationId`; a Student can only ever access their own records).
- Public verification routes are explicitly excluded from auth checks but still rate-limited and logged.

## 3. Input Validation
- **Zod** schemas validate every API request body and relevant query params server-side, regardless of client-side validation.
- Reject unknown/unexpected fields rather than silently ignoring them.

## 4. Password Security
- **bcrypt** hashing, salt rounds = **12**.
- Plaintext passwords are never logged, stored, or transmitted outside the initial HTTPS request.

## 5. Database Security
- All queries go through **Prisma** — no raw SQL string interpolation.
- Parameterized queries only; if raw queries are ever required, they must use Prisma's tagged-template safe raw query API, never string concatenation.

## 6. File Security
- No file (image, PDF) is ever stored directly in PostgreSQL — only Cloudinary URLs and public IDs are persisted.
- Uploads are validated for file type/size before being sent to Cloudinary.
- Cloudinary access credentials are never exposed client-side; uploads proxy through a server route (`/api/uploads`) or use signed upload presets.

## 7. Environment Variables
- All secrets (database URL, JWT secret, Cloudinary keys, Resend API key) live in environment variables, never committed to source control.
- Separate environment variable sets per environment (local, staging, production).

## 8. Rate Limiting
Applied at minimum to:
- Login endpoint (`/api/auth/login`) — prevent brute-force attempts.
- Public verification endpoint (`/api/verify/:certificateId`) — prevent scraping/enumeration.
- Email-sending endpoints — prevent abuse of the Resend integration.

## 9. Security Headers
- **CSP** (Content Security Policy) to restrict allowed script/style/asset origins.
- **XSS protection** headers and React's default output-escaping relied on for rendering user-provided content.
- **HSTS** to enforce HTTPS.
- **SameSite** cookie attribute set on the session cookie to mitigate CSRF.
- **CSRF** protection on state-changing requests beyond SameSite cookies where applicable (e.g., double-submit token for form-based flows if introduced later).

## 10. Audit Logging
Every sensitive action is recorded in `AuditLog`:
- Login
- Delete
- Generate (certificate)
- Email (sent)
- Download
- Verification (also separately captured in `VerificationLog` with richer metadata)

## 11. Verification Logs
`VerificationLog` records: certificate reference, result (VALID/INVALID/REVOKED/EXPIRED), IP address, device, user agent, referrer, approximate country, and timestamp — supporting both fraud analysis and trainer/admin analytics.

## 12. Download Permissions
- A certificate PDF can only be downloaded by: the owning Student, the issuing Trainer, or an Admin.
- Public verification never exposes a direct PDF download link — only certificate metadata is shown; download remains gated behind authentication.

## 13. Certificate Integrity
- Every generated PDF has a **SHA-256 hash** computed and stored alongside it.
- The hash allows a future integrity check (regenerate/compare) to detect if a PDF has been tampered with outside the platform.

## 14. Future Security Enhancements
- **2FA** for Admin and Trainer accounts.
- **Refresh tokens** to allow shorter-lived access tokens with silent renewal.
- **Blockchain anchoring** of certificate hashes for independent, platform-external tamper-proofing.
