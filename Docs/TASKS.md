# Master Task Checklist

**Project:** Kode To Career — Certificate & Credential Verification Platform

---

## Initial Setup
- [ ] Initialize Next.js 16 project (App Router, TypeScript)
- [ ] Configure Tailwind CSS v4
- [ ] Set up Prisma + PostgreSQL connection
- [ ] Set up Auth.js-compatible auth (JWT + HttpOnly cookies)
- [ ] Configure Cloudinary SDK/keys
- [ ] Configure Resend SDK/keys
- [ ] Set up environment variable files per environment

## Database
- [ ] Define all Prisma models (User, Organization, Trainer, Student, Course, Certificate, CertificateBatch, CertificateTemplate, VerificationLog, AuditLog, EmailLog)
- [ ] Define all enums (UserRole, CertificateStatus, CourseStatus, EmailStatus, VerificationResult, AuditAction)
- [ ] Define relations per `DATABASE_SCHEMA.md`
- [ ] Add indexes/unique constraints
- [ ] Run initial migration
- [ ] Write seed script (Organization → Admin → Trainer → Course → Template → Students → sample Certificate)

## Authentication
- [ ] Login endpoint + credential validation
- [ ] bcrypt password hashing (salt rounds 12)
- [ ] JWT issuance + HttpOnly cookie storage
- [ ] `middleware.ts` route guards (role-based)
- [ ] Session expiry handling (7 days)
- [ ] Logout endpoint
- [ ] Register endpoint (role-gated)
- [ ] Profile endpoint

## Certificate Engine
- [ ] Certificate ID generator
- [ ] Verification token generator
- [ ] QR code generation service
- [ ] PDF generation service (template + data + QR + signature)
- [ ] Cloudinary upload service
- [ ] SHA-256 PDF hash computation + storage
- [ ] Email dispatch on issuance (Resend)
- [ ] Certificate lifecycle state transitions (DRAFT → GENERATED → ISSUED → REVOKED → EXPIRED)

## Verification
- [ ] Public verification API (`/api/verify/:certificateId`)
- [ ] Public verification page (`/verify/:certificateId`)
- [ ] Verification logging (IP, device, country, user agent, referrer, timestamp)
- [ ] Revoked/expired certificate handling
- [ ] Rate limiting on verification endpoint

## Admin Dashboard
- [ ] Certificates: view, approve, delete
- [ ] Trainers: CRUD
- [ ] Students: CRUD
- [ ] Templates: create, version, activate/deactivate
- [ ] Analytics: overview cards + recent activity + pending certificates
- [ ] Bulk certificate issuance

## Trainer Dashboard
- [ ] Profile management (personal + professional info, documents)
- [ ] Courses: create, edit, archive, view batches/students
- [ ] Certificates: view, generate, reissue, download, email, filter by course/batch
- [ ] Students: view, search, filter, export list, bulk issuance from roster
- [ ] Ratings & Reviews: summary + detail + analytics
- [ ] Experience profile management
- [ ] Analytics: certificate, student, course, performance
- [ ] Search across students/certificates/courses/batches
- [ ] Filters (certificates, students, courses, reviews)

## Student Dashboard
- [ ] Overview (summary cards, recent activity, quick actions)
- [ ] My Certificates (list, detail view, filters)
- [ ] Download Center (individual, latest, history; ZIP download deferred)
- [ ] Share Certificate (link, email, QR download, native share)
- [ ] LinkedIn Integration (field generation, credential copy, deep link)
- [ ] Projects (CRUD, thumbnail upload, featured flag)
- [ ] Achievements (CRUD, categories, timeline, featured)
- [ ] Profile (personal info, academic info, social links)

## Testing
- [ ] Authentication flow tests
- [ ] API endpoint tests (all modules)
- [ ] Database/Prisma model tests
- [ ] PDF generation tests
- [ ] Email delivery tests
- [ ] QR generation/scan tests
- [ ] Verification flow tests (valid/invalid/revoked/expired)
- [ ] UI/component tests across Admin, Trainer, Student dashboards

## Deployment
- [ ] Provision production PostgreSQL database
- [ ] Configure production Cloudinary account/presets
- [ ] Configure production Resend domain/keys
- [ ] Set production environment variables
- [ ] Set up CI/CD pipeline
- [ ] Set up monitoring/error tracking

---

## Future Phase Backlog (Not Blocking Launch)
- [ ] Redis caching layer
- [ ] Background job queue (bulk PDF generation, bulk email)
- [ ] Multi-tenant organization support + Org Admin role
- [ ] Certificate revocation UI/flow refinements
- [ ] Blockchain hash anchoring
- [ ] Open Badges / digital wallet integration
- [ ] AI-assisted fraud detection on verification logs
- [ ] Mobile application
- [ ] Public API + webhooks for institutional partners
- [ ] SSO (Google/Microsoft)
- [ ] LMS integrations
- [ ] 2FA for Admin/Trainer accounts
- [ ] Refresh token support
