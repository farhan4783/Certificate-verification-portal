# 🎓 Kode To Career — Live Certificate & Credential Verification Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)

**An industry-grade, tamper-proof digital certificate issuance and verification platform built for training organizations.**

[Live Demo](#running-locally) · [API Reference](#api-reference) · [Tech Stack](#tech-stack) · [Screenshots](#screenshots)

</div>

---

## ✨ Overview

**Kode To Career** is a full-stack SaaS platform that allows training organizations to **issue, manage, and publicly verify digital certificates**. Every certificate is:

- 🔐 Secured with **SHA-256 PDF integrity hashing**
- 📱 Embedded with a unique **QR code** pointing to the public verification URL
- 📄 Rendered as a professional **A4 Landscape PDF** using `pdf-lib`
- 📧 Dispatched to students via **automated email** (Resend)
- ☁️ Stored on **Cloudinary** for global CDN delivery
- 🔍 Publicly verifiable by **anyone** — no account required

---

## 🎯 Core Features

### 🛡️ Multi-Role Authentication (RBAC)
| Role | Access |
|------|--------|
| **Super Admin** | Full platform control — manage trainers, students, templates, certificates, analytics |
| **Trainer** | Course management, student oversight, certificate issuance, personal profile |
| **Student** | View certificates, download PDFs, manage portfolio & achievements, verify credentials |

### 📜 Certificate Engine
- Auto-generate unique human-readable Certificate IDs (e.g. `KTC-FSWDB-2026-1024`)
- Server-side PDF rendering with organizational logos, trainer signatures, QR codes
- SHA-256 integrity hash stored per certificate for tamper detection
- Template versioning system for visual consistency

### 🔍 Public Verification
- Anyone can verify at `/verify/[certificateId]` — **no login required**
- Returns status: `VALID`, `EXPIRED`, `REVOKED`, or `INVALID`
- Records every scan in `VerificationLog` (IP, device, country, browser)
- Rate-limited to prevent abuse

### 📊 Admin Dashboard
- Platform-wide statistics (students, trainers, certificates, verifications)
- Manage all trainers, students, and certificates
- Certificate template CRUD
- Analytics: certificates by status, top trainers, popular courses

### 👨‍🏫 Trainer Dashboard
- View and manage assigned courses and batches
- Student roster per course with enrollment status
- Certificate issuance form — select student, course, grade
- Experience profile: bio, skills, social links

### 🎓 Student Dashboard
- Certificate showcase with download, share, and verify actions
- LinkedIn certification generator (certification ID card)
- Project portfolio with tech stack, live demo, and GitHub links
- Achievement tracker (hackathons, awards, certifications)
- Enrollment timeline and profile details

---


![alt text](image-1.png)

## 🧰 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma 7 (driver adapter: `@prisma/adapter-pg`) |
| **Auth** | `jose` JWT cookies (HttpOnly, SameSite=Strict) |
| **PDF Generation** | `pdf-lib` (server-side A4 Landscape rendering) |
| **QR Codes** | `qrcode` library |
| **File Storage** | Cloudinary (PDFs, QR codes, photos) |
| **Email** | Resend (transactional HTML emails) |
| **Schema Validation** | Zod |
| **Password Hashing** | bcrypt (12 rounds) |

---

## 🗄️ Database Schema

The platform uses **13 Prisma models** with full relational integrity:

```
Organization → Users, Trainers, Students, Courses, Templates
User → Trainer (1:1), Student (1:1)
Trainer → Courses, Certificates, Batches, Students (M:N)
Student → Course, Batch, Certificates, Projects, Achievements
Course → Trainer, Template, Students, Certificates, Batches
Certificate → Student, Trainer, Course, Template, Batch
CertificateTemplate → Organization, Courses, Certificates
CertificateBatch → Trainer, Course, Students, Certificates
VerificationLog → Certificate (audit trail)
EmailLog → Student, Certificate
AuditLog → User (all actions)
Project → Student (portfolio)
Achievement → Student (credentials)
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 20+
- PostgreSQL 16 running locally

### 1. Clone & Install

```bash
git clone https://github.com/farhan4783/Certificate-verification-portal.git
cd Certificate-verification-portal
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ktc_platform"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# App URL (for QR code generation)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cloudinary (optional — uses mock fallback if not set)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Resend Email (optional — uses mock fallback if not set)
RESEND_API_KEY=
RESEND_FROM_EMAIL="certificates@yourdomain.com"
```

### 3. Database Setup

```bash
# Create database
createdb ktc_platform

# Run migrations
npx prisma migrate deploy

# Seed with demo data
npx prisma db seed
```

### 4. Start Dev Server

```bash
npm run dev
```

Visit **http://localhost:3000** 🎉

---

## 🔑 Demo Credentials

After seeding, use these accounts to explore all three dashboards:

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `admin@kodetocareer.com` | `admin1234` |
| **Trainer** | `trainer@kodetocareer.com` | `trainer1234` |
| **Student** | `student@kodetocareer.com` | `student1234` |

---

## 🌐 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Sign in and receive JWT cookie |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/auth/profile` | Fetch authenticated user profile |
| `POST` | `/api/auth/register` | Register a new user (admin/trainer/student) |

### Certificates
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/certificates/issue` | Issue a certificate (trainer or admin) |
| `GET` | `/api/verify/[certificateId]` | Verify a certificate (public) |

### Request Body — `POST /api/certificates/issue`
```json
{
  "studentId": "uuid",
  "courseId": "uuid",
  "grade": "A"
}
```

### Response — `GET /api/verify/:certificateId`
```json
{
  "success": true,
  "data": {
    "result": "VALID",
    "certificate": {
      "certificateId": "KTC-BOOTCAMP-2026-0001",
      "studentName": "Jane Smith",
      "courseTitle": "Full Stack Web Development",
      "issueDate": "2026-07-03",
      "status": "ISSUED"
    }
  }
}
```

---

## 📁 Project Structure

```
├── app/
│   ├── (public)/              # Login, verify pages (no auth required)
│   │   ├── login/page.tsx
│   │   └── verify/[certificateId]/page.tsx
│   ├── dashboard/
│   │   ├── admin/             # Super Admin dashboard (protected)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx       # Overview & stats
│   │   │   ├── trainers/      # Trainer management
│   │   │   ├── students/      # Student management
│   │   │   ├── certificates/  # All certificates
│   │   │   ├── templates/     # Design templates
│   │   │   └── analytics/     # Platform analytics
│   │   ├── trainer/           # Trainer dashboard (protected)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx       # Overview
│   │   │   ├── courses/       # Course & batch management
│   │   │   ├── students/      # Student roster
│   │   │   ├── certificates/  # Issuance form + history
│   │   │   └── profile/       # Experience profile
│   │   └── student/           # Student dashboard (protected)
│   │       ├── layout.tsx
│   │       ├── page.tsx       # Overview & certificate showcase
│   │       ├── certificates/  # Download + share + LinkedIn
│   │       ├── portfolio/     # Project showcase
│   │       ├── achievements/  # Achievement tracker
│   │       └── profile/       # Enrollment & social profile
│   ├── api/
│   │   ├── auth/              # Auth route handlers
│   │   ├── certificates/issue/ # Certificate issuance endpoint
│   │   └── verify/            # Public verification endpoint
│   ├── layout.tsx
│   └── page.tsx               # Landing page
├── components/
│   ├── dashboard/
│   │   ├── Sidebar.tsx        # Shared nav sidebar
│   │   └── StatCard.tsx       # Metric card component
│   └── ui/
│       └── StatusBadge.tsx    # Certificate status badge
├── lib/
│   ├── auth.ts                # JWT session management
│   ├── prisma.ts              # Prisma client with PgAdapter
│   ├── pdf.ts                 # Server-side PDF generation
│   ├── qr.ts                  # QR code generator
│   ├── cloudinary.ts          # Asset upload service
│   ├── resend.ts              # Email dispatch service
│   └── utils.ts               # ID/token generators
├── services/
│   └── certificate.service.ts # Certificate issuance orchestration
├── prisma/
│   ├── schema.prisma          # Database schema (13 models)
│   ├── seed.ts                # Demo data seeding script
│   └── migrations/            # SQL migration history
└── proxy.ts                   # Next.js 16 request proxy (RBAC + auth)
```

---

## 🔒 Security

- **RBAC Enforcement** at the request proxy level (roles: SUPER_ADMIN, TRAINER, STUDENT)
- **HttpOnly JWT cookies** with 7-day expiry — resistant to XSS attacks
- **bcrypt password hashing** with 12 rounds
- **SHA-256 PDF integrity hashing** — detect any tampering
- **Rate limiting** on the public verification API (30 req/min per IP)
- All API routes validate sessions before executing queries

---

## 📈 Roadmap

- [ ] Bulk certificate issuance (upload CSV → issue to entire batch)
- [ ] Certificate revocation flow with audit logging
- [ ] Organisation admin role
- [ ] LinkedIn API integration (auto-add to profile)
- [ ] Email template customization
- [ ] Multi-language certificate support
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'feat: Add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ by the **Kode To Career** team.

**Empowering learners, one verified credential at a time.**

</div>
