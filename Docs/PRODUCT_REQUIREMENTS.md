# Product Requirements Document (PRD)

**Project:** Kode To Career — Certificate & Credential Verification Platform

---

## 1. Purpose
This document defines what the platform must do (functional requirements) and the quality bars it must meet (non-functional requirements). It is the source of truth for scope during implementation.

---

## 2. Functional Requirements

### 2.1 Authentication
- FR-A1: Users log in with email + password.
- FR-A2: Passwords are hashed with bcrypt (salt rounds = 12); never stored in plaintext.
- FR-A3: On successful login, a JWT containing `{ id, email, role }` is issued and stored in an HttpOnly cookie.
- FR-A4: Sessions expire after 7 days; user must re-authenticate after expiry.
- FR-A5: Users can log out, which clears the session cookie.
- FR-A6: Role is embedded in the JWT and enforced by middleware on every protected route.
- FR-A7 *(future)*: Refresh token support to extend sessions without re-login.

### 2.2 Certificate Engine
- FR-C1: System generates a unique, human-readable Certificate ID and a separate verification token per certificate.
- FR-C2: System renders a certificate PDF from a template, populated with student, course, trainer, and organization data.
- FR-C3: Each PDF embeds a QR code linking to the public verification page for that certificate.
- FR-C4: Generated PDFs are uploaded to Cloudinary; only the resulting URL and public ID are persisted in the database.
- FR-C5: On successful generation, the platform emails the certificate (or a link to it) to the student via Resend.
- FR-C6: Certificates support lifecycle states: `DRAFT → GENERATED → ISSUED → REVOKED → EXPIRED`.
- FR-C7: Certificates can be issued individually or in bulk via a batch.

### 2.3 Verification
- FR-V1: Anyone can verify a certificate by scanning its QR code or visiting `/verify/:certificateId` — no login required.
- FR-V2: The verification page displays student name, course, trainer, issue date, status, and certificate number for valid certificates.
- FR-V3: Invalid, revoked, or expired certificates return a clear "not valid" state without leaking unrelated data.
- FR-V4: Every verification attempt is logged (IP address, device, approximate location/country, timestamp).

### 2.4 Admin Features
- FR-AD1: Create, update, and deactivate trainer accounts.
- FR-AD2: Create, update, and deactivate student accounts.
- FR-AD3: Manage certificate templates (create, edit, activate/deactivate).
- FR-AD4: Approve or delete certificates (deletion restricted to Admin; trainers cannot delete approved certificates).
- FR-AD5: Issue certificates in bulk across a batch.
- FR-AD6: View platform-wide analytics (students, trainers, certificates issued, verification counts, recent activity, pending certificates).

### 2.5 Trainer Features
- FR-T1: Create and manage assigned courses.
- FR-T2: Create batches under a course and import students into a batch.
- FR-T3: Generate certificates for a batch, individually or in bulk.
- FR-T4: Email issued certificates to students.
- FR-T5: View own students, courses, and issued certificates with filters (course, batch, status, date).
- FR-T6: View ratings/reviews submitted by students and aggregate rating analytics.
- FR-T7: Maintain a professional experience profile (qualifications, specializations, workshops, publications, awards).
- FR-T8: View certificate, student, course, and performance analytics scoped to their own data.
- FR-T9: Cannot delete an approved certificate or access another organization's data.

### 2.6 Student Features
- FR-S1: View all issued certificates with status, issue date, and expiry date.
- FR-S2: Download individual certificate PDFs; download history is tracked (date, device, browser).
- FR-S3: Share a certificate via public link, email, or QR download; native device share where supported.
- FR-S4: Export credential details formatted for LinkedIn's "Add License & Certification" flow (name, issuer, dates, credential ID, credential URL).
- FR-S5: Maintain a project portfolio (title, description, technologies, GitHub URL, live demo URL, completion date, thumbnail, featured flag).
- FR-S6: Maintain an achievements record (course completion, top performer, attendance, hackathon, internship, workshop, competition, community contribution) with title, description, issuer, date, badge/icon, optional link.
- FR-S7: Edit personal profile (name, photo, bio, enrollment number, academic info, social links) and cannot view other students' data.

---

## 3. Non-Functional Requirements

### 3.1 Performance
- Public verification page must respond in under 1s for a cached/simple lookup under normal load.
- PDF generation for a single certificate should complete without blocking other requests; bulk generation must not cause request timeouts (background/queued processing in a later phase).

### 3.2 Scalability
- Every organization-owned record includes an `organizationId` from day one so the schema supports multi-tenancy without migration surgery.
- Architecture separates business logic (services) from API routes so background workers/queues can be introduced later without rewriting core logic.

### 3.3 Availability
- Core verification flow (public, unauthenticated) should degrade gracefully and remain available even under load spikes (e.g., certificate shared widely on social media).

### 3.4 Security
- All authentication, authorization, validation, and storage practices follow `SECURITY_GUIDELINES.md`.
- No file (PDF, image) is ever stored directly in PostgreSQL — only Cloudinary URLs/IDs.
- Certificate integrity is verifiable via a stored SHA-256 hash of the generated PDF.

### 3.5 Maintainability
- UUID primary keys across all tables.
- Service layer + repository-style separation between API routes and business logic.
- Certificate templates are versioned so historical certificates always render with their original design.

### 3.6 Accessibility
- Dashboards and public verification pages meet basic WCAG-aligned practices (semantic HTML, sufficient contrast, keyboard navigability).

### 3.7 Browser Support
- Latest two versions of Chrome, Edge, Firefox, and Safari on desktop and mobile.

---

## 4. Out of Scope for Phase 1
- Multi-organization (multi-tenant) UI and org-admin role
- Blockchain hash anchoring
- Open Badges / digital wallet integration
- Mobile app
- Public partner API / webhooks
- AI fraud detection

These are captured under Future Scalability in `SYSTEM_ARCHITECTURE.md` and later phases in `DEVELOPMENT_ROADMAP.md`.
