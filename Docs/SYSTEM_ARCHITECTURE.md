# System Architecture

**Project:** Kode To Career — Certificate & Credential Verification Platform
**Status:** Phase 0 — Architecture Approved, No Code Yet

---

## 1. High-Level Architecture

```
                    Internet
                        │
                Next.js 16 Application
                        │
        ┌───────────────┴────────────────┐
        │                                │
 React Client                     Server Components
        │                                │
        └───────────────┬────────────────┘
                        │
                 Route Handlers (API)
                        │
              Authentication Middleware
                        │
      ┌─────────────────┴────────────────┐
      │                                  │
 Prisma ORM                       Business Services
      │                                  │
 PostgreSQL                  PDF / QR / Email
      │                                  │
      └──────────────┬───────────────────┘
                     │
             Cloudinary Storage
                     │
              Certificate Assets
```

The frontend (React client + Server Components) talks to Route Handlers under `/api`. All protected routes pass through Authentication Middleware, which reads the JWT from the HttpOnly cookie and attaches role/user context. Route handlers delegate to a Business Services layer, which coordinates Prisma (PostgreSQL) for data and dedicated PDF/QR/Email services for certificate generation. Generated assets (PDFs, images) are pushed to Cloudinary; only URLs/IDs come back into PostgreSQL.

---

## 2. Folder Structure

```
certificate-platform/
│
├── app/
│   ├── (public)/
│   │      page.tsx
│   │      verify/
│   │      certificates/
│   │
│   ├── dashboard/
│   │      admin/
│   │      trainer/
│   │      student/
│   │
│   ├── api/
│   │      auth/
│   │      certificates/
│   │      students/
│   │      trainers/
│   │      organizations/
│   │      verification/
│   │      uploads/
│   │
│   ├── login/
│   ├── register/
│   └── layout.tsx
│
├── components/
│   ├── ui/
│   ├── forms/
│   ├── dashboard/
│   ├── certificate/
│   ├── qr/
│   └── shared/
│
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── cloudinary.ts
│   ├── resend.ts
│   ├── pdf.ts
│   ├── qr.ts
│   ├── validation.ts
│   └── utils.ts
│
├── services/
│   ├── certificate.service.ts
│   ├── student.service.ts
│   ├── trainer.service.ts
│   ├── auth.service.ts
│   └── email.service.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│      logo/
│      templates/
│
├── types/
├── hooks/
├── middleware.ts
└── package.json
```

### 2.1 Dashboard-Specific Sub-Structures

**Student Dashboard**
```
app/dashboard/student/
  page.tsx
  certificates/ (page.tsx, [id]/)
  downloads/
  share/
  linkedin/
  projects/
  achievements/
  profile/

components/student/
  dashboard/ certificates/ downloads/ share/ linkedin/ projects/ achievements/ profile/

services/
  student.service.ts, certificate.service.ts, download.service.ts,
  share.service.ts, linkedin.service.ts, project.service.ts, achievement.service.ts
```

**Trainer Dashboard**
```
app/dashboard/trainer/
  page.tsx
  profile/
  certificates/ (page.tsx, issue/, [id]/)
  courses/ (page.tsx, create/, [id]/)
  students/
  ratings/
  experience/
  analytics/
  settings/

components/trainer/
  dashboard/ profile/ certificates/ courses/ students/ ratings/ experience/ analytics/ shared/

services/
  trainer.service.ts, course.service.ts, certificate.service.ts, student.service.ts,
  analytics.service.ts, rating.service.ts, experience.service.ts
```

---

## 3. Module Architecture

| Module | Responsibility |
|---|---|
| **Authentication** | Login/logout, JWT issuance, cookie handling, middleware guards, role checks |
| **Certificate Engine** | Certificate ID/token generation, PDF rendering, QR embedding, Cloudinary upload, email trigger |
| **Verification** | Public verification page/API, verification logging |
| **Admin** | Trainer/student/template management, bulk issuance, platform analytics |
| **Trainer** | Course/batch/student management, certificate issuance, ratings, experience, analytics |
| **Student** | Certificate viewing/downloading/sharing, LinkedIn export, projects, achievements, profile |

---

## 4. Authentication Flow

**Strategy:** JWT + HttpOnly Cookies

```
Login
  ↓
Validate credentials
  ↓
Generate JWT
  ↓
Store in HttpOnly Cookie
  ↓
Middleware verifies cookie
  ↓
Role Access
  ↓
Dashboard
```

- JWT payload: `{ id, email, role }`
- Passwords hashed with **bcrypt**, salt rounds = **12**
- Session expiry: **7 days**
- Refresh tokens: planned as a future feature
- `middleware.ts` intercepts requests to `/dashboard/**` and `/api/**` (excluding public/auth/verification routes), verifies the JWT, and enforces role-based route access.

---

## 5. User Roles

See `PROJECT_OVERVIEW.md` §3 for the full role matrix. In architectural terms, role is carried in the JWT and checked at two layers:
1. **Middleware** — coarse-grained: is this role allowed into `/dashboard/admin`, `/dashboard/trainer`, `/dashboard/student` at all.
2. **Service layer** — fine-grained: e.g., a trainer's queries are always scoped to their own `trainerId`/`organizationId`; a student can only ever query their own `studentId`.

---

## 6. Certificate Workflow

```
Admin creates Trainer
  ↓
Trainer creates Course
  ↓
Trainer creates Batch
  ↓
Students added
  ↓
Generate Certificates
  ↓
PDF Generated
  ↓
QR Generated
  ↓
Upload PDF (Cloudinary)
  ↓
Email Sent
  ↓
Student Downloads
  ↓
Public Verification
```

## 7. Trainer Workflow

```
Login → Dashboard → Create Course → Create Batch → Import Students
  → Preview → Generate Certificates → Email Students → View Analytics
```

## 8. Student Workflow

```
Register/Login → Dashboard → My Certificates → Download PDF
  → Share Certificate → Verify → View History
```

---

## 9. QR Verification Workflow

Every certificate carries a **unique Certificate ID** and a separate **Verification Token**.

QR payload: `https://domain.com/verify/ABC123XYZ`

```
Scan QR
  ↓
Open Verify Page
  ↓
Read Token
  ↓
Database Lookup
  ↓
Valid → Show Certificate
   OR
Invalid → Show "not valid" state
```

Fields shown for a valid certificate: Student Name, Course, Trainer, Issue Date, Status, Certificate Number.

---

## 10. Security Architecture (Summary)

Full detail in `SECURITY_GUIDELINES.md`. Architectural highlights:
- **Authentication:** JWT, HttpOnly cookies, bcrypt, middleware guards
- **Authorization:** RBAC (Admin / Trainer / Student / Public)
- **Validation:** Zod schemas enforced server-side (and mirrored client-side)
- **Database:** Prisma parameterized queries only — no raw string interpolation
- **Rate limiting:** applied to verification, login, and email-sending endpoints
- **Security headers:** CSP, XSS protection, HSTS, SameSite cookies, CSRF protection
- **Audit logging:** every sensitive action (login, delete, generate, email, download, verification) is recorded

---

## 11. Storage Strategy

**Provider:** Cloudinary

Stored there:
- Student photos
- Trainer photos
- Organization logos
- Certificate PDFs
- Certificate background templates
- Digital signatures

**Database stores only:** Cloudinary URL + Public ID. Files are **never** stored inside PostgreSQL.

---

## 12. PDF Generation

```
Certificate Data
  ↓
Load Template
  ↓
Insert Student Data
  ↓
Insert QR
  ↓
Insert Signature
  ↓
Generate PDF
  ↓
Upload Cloudinary
  ↓
Save URL
  ↓
Email Student
```

Each PDF contains: QR Code, Certificate Number, Trainer Signature, Organization Logo, Issue Date, Secure Verification Link.

---

## 13. Email System

**Provider:** Resend

Events: Welcome Email, Certificate Issued, Password Reset, Verification Success *(future)*.

---

## 14. Deployment Architecture

- Next.js application deployed as a single unit (SSR + API routes + middleware).
- PostgreSQL as a managed instance, connected via Prisma.
- Cloudinary as the external media CDN/store.
- Resend as the external transactional email provider.
- Environment variables hold all credentials/secrets (see `SECURITY_GUIDELINES.md`).

---

## 15. Future Scalability

**Phase 2**
- Multi-organization (multi-tenant) support
- Certificate revocation
- Expiring certificates
- Blockchain hash storage
- Open Badge support
- Digital wallet integration

**Phase 3**
- AI fraud detection
- Bulk PDF generation queue
- Redis cache
- Background jobs
- Event bus
- Microservices
- Analytics warehouse

**Phase 4**
- Mobile app
- Public API
- Webhooks
- SSO (Google/Microsoft)
- LMS integrations
- API keys for institutions

---

## 16. Recommended Improvements (Adopted as Architectural Principles)

- Use **UUIDs** as primary keys for all tables (security + distributed-system friendliness).
- Every organization-owned record includes `organizationId` from day one, even with a single organization initially.
- Store a **SHA-256 hash** of each generated PDF to detect tampering.
- Certificates carry lifecycle states: `DRAFT → GENERATED → ISSUED → REVOKED → EXPIRED`.
- Certificate templates are **versioned** so old certificates keep rendering with their original design.
- Introduce background job processing (queue) for bulk PDF generation/email in a later phase to avoid request timeouts.
- Record detailed verification metadata: timestamp, approximate location, IP address, user agent, referrer.
- Separate business logic from API routes via a **service layer** (and repository-style data access) to keep the app maintainable as it grows.
