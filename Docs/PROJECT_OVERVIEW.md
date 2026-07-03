# Project Overview

**Project:** Kode To Career — Certificate & Credential Verification Platform
**Owner:** Kode To Career (kodetocareer.com)
**Document Status:** Phase 0 — Approved Architecture Baseline

---

## 1. Project Introduction

### 1.1 Project Name
Kode To Career – Certificate & Credential Verification Platform

### 1.2 Vision
To give Kode To Career a professional, tamper-evident, self-serve system for issuing, managing, and publicly verifying certificates for every student who completes a bootcamp, course, or internship — reinforcing trust in KTC credentials with employers, students, and trainers alike.

### 1.3 Objectives
- Replace manual/ad-hoc certificate creation with a structured, auditable issuance pipeline.
- Give every certificate a permanent, publicly verifiable identity (QR + verification link).
- Provide trainers a self-service workflow to issue certificates for their own courses/batches.
- Give students a professional portal to view, download, and showcase credentials (including LinkedIn export).
- Build on a stack and data model that can scale from a single organization to a multi-tenant platform without a rewrite.

### 1.4 Target Users
- **Super Admin** — KTC platform owner/operator.
- **Organization Admin** *(future)* — per-organization administrator once multi-tenancy ships.
- **Trainer** — creates courses/batches and issues certificates.
- **Student** — receives, downloads, and shares certificates.
- **Public Visitor** — anyone verifying a certificate via QR/link, no login required.

### 1.5 Problems Solved
- **No proof of authenticity today** — certificates can be forged or altered with no way to check.
- **Manual issuance is slow and error-prone** — no batch tooling, no audit trail.
- **No central record** — certificates live in scattered PDFs/emails rather than a queryable system.
- **No professional showcase** — students have no single place to present certificates, projects, and achievements to employers or on LinkedIn.

---

## 2. Key Features

- Authentication (JWT + HttpOnly cookies)
- Role-Based Access Control (Super Admin, Trainer, Student, Public)
- Certificate generation (unique certificate ID + verification token)
- QR-code-based certificate verification
- Server-generated PDF certificates
- Cloudinary-based asset storage (photos, logos, signatures, PDFs)
- Transactional email delivery via Resend (issuance, welcome, password reset)
- Public, no-login certificate verification page
- Verification analytics (IP, device, country, timestamp per scan)
- Role-specific dashboards for Admin, Trainer, and Student

---

## 3. User Roles

| Role | Summary |
|---|---|
| **Super Admin** | Full platform control: organizations, trainers, students, certificate approval/deletion, templates, analytics |
| **Organization Admin** *(future)* | Same as Super Admin but scoped to a single organization |
| **Trainer** | Creates courses/batches, imports students, generates and emails certificates, views own analytics; cannot delete approved certificates |
| **Student** | Views/downloads/shares own certificates, manages projects & achievements, edits own profile |
| **Public Visitor** | Verifies a certificate by scanning a QR code or opening a verification link — no account required |

---

## 4. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| ORM | Prisma |
| Database | PostgreSQL |
| Authentication | JWT + HttpOnly Cookies (Auth.js-compatible pattern) |
| Media/File Storage | Cloudinary |
| Transactional Email | Resend |

---

## 5. Core Modules

1. **Authentication Module** — login, session/cookie handling, middleware-based route guarding, RBAC.
2. **Certificate Engine** — certificate ID generation, PDF rendering, QR embedding, Cloudinary upload, email dispatch.
3. **Verification Module** — public verification page and API, verification logging.
4. **Admin Dashboard** — trainers, students, templates, bulk issuance, platform-wide analytics.
5. **Trainer Dashboard** — courses, batches, students, certificate issuance, ratings, experience, analytics.
6. **Student Dashboard** — certificates, downloads, sharing, LinkedIn export, projects, achievements, profile.

---

## 6. Future Vision

- **Multi-tenant institutions** — support many organizations on one platform, each with isolated data.
- **Blockchain verification** — anchor a certificate's hash on-chain for independent tamper-proofing.
- **Digital badges** — Open Badges–compatible credentials, digital wallet support.
- **Mobile application** — native access to the student/trainer dashboards.
- **Public APIs & webhooks** — allow partner institutions and employers to verify certificates programmatically.
- **AI-assisted analytics** — fraud detection on verification patterns, insight generation for admins.

---

## 7. Related Documents

- `PRODUCT_REQUIREMENTS.md` — full functional/non-functional requirements
- `SYSTEM_ARCHITECTURE.md` — technical architecture and workflows
- `DATABASE_SCHEMA.md` — data model and Prisma schema
- `API_SPECIFICATION.md` — REST API contract
- `UI_DESIGN_SYSTEM.md` — design system and component library
- `DEVELOPMENT_ROADMAP.md` — phased build plan
- `CODING_STANDARDS.md` — engineering conventions
- `SECURITY_GUIDELINES.md` — security posture and controls
- `TASKS.md` — master implementation checklist
