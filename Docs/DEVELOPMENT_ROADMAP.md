# Development Roadmap

**Project:** Kode To Career — Certificate & Credential Verification Platform

---

## Phase 1 — Foundation
- Project setup (Next.js 16, TypeScript, Tailwind CSS v4)
- Authentication (login, JWT, HttpOnly cookies, middleware, RBAC guards)
- Database setup (PostgreSQL + Prisma)
- Core Prisma models: User, Organization, Trainer, Student

## Phase 2 — Certificate Engine
- Certificate ID + verification token generation
- QR code generation
- PDF generation and template rendering
- Cloudinary upload integration
- Resend email integration (certificate issued, welcome, password reset)

## Phase 3 — Verification
- Public verification page (`/verify/:certificateId`)
- Verification API (`/api/verify/:certificateId`)
- Verification logging (IP, device, country, timestamp)
- Handling for revoked/expired certificates

## Phase 4 — Admin Dashboard
- Certificate management (view, approve, delete)
- Trainer management (CRUD)
- Student management (CRUD)
- Template management (create, version, activate/deactivate)
- Platform-wide analytics
- Bulk certificate issuance

## Phase 5 — Trainer Dashboard
- Course management (create, edit, archive)
- Batch creation and student import
- Certificate issuance (single + bulk) from trainer context
- Student roster views
- Ratings & reviews
- Experience profile
- Trainer-scoped analytics

## Phase 6 — Student Dashboard
- Certificate viewing and download
- Download history
- Sharing (link, email, QR, native share)
- LinkedIn export flow
- Projects portfolio (CRUD)
- Achievements (CRUD)
- Profile management

## Phase 7 — Hardening & Launch
- Testing (auth, APIs, database, PDF, email, QR, verification, UI)
- Deployment (production database, Cloudinary, Resend, environment variables)
- CI/CD pipeline
- Monitoring and error tracking
- Documentation finalization

---

## Future Phases (Post-Launch)

**Scalability & Infra**
- Redis caching
- Background job queues (bulk PDF generation, email sending)
- Microservices split where warranted
- Event bus for cross-module communication

**Trust & Verification**
- Blockchain hash anchoring for certificates
- AI-assisted fraud detection on verification patterns
- Open Badges compatibility, digital wallet integration

**Platform Expansion**
- Multi-tenant organization support (Org Admin role activated)
- Mobile application
- Public partner API + webhooks
- SSO (Google/Microsoft)
- LMS integrations
- API keys for institutional partners

---

## Sequencing Notes

- Phase 1 and 2 are hard prerequisites for everything else — no dashboard work should start before authentication and the certificate engine are functional end-to-end for at least one certificate.
- Phase 3 (verification) should be built immediately after Phase 2 since it's the platform's core trust feature and is fully public-facing.
- Phases 4–6 (the three dashboards) can be parallelized once Phases 1–3 are stable, since they consume the same underlying services but touch mostly separate UI surfaces.
- Background jobs/queues, Redis, and blockchain anchoring are explicitly deferred — the architecture is built so they can be added later without reworking the data model (see `SYSTEM_ARCHITECTURE.md` §16).
