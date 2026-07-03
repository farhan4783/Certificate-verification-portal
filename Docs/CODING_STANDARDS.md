# Coding Standards

**Project:** Kode To Career — Certificate & Credential Verification Platform

---

## 1. TypeScript Standards
- `strict` mode enabled in `tsconfig.json`; no implicit `any`.
- Prefer `interface` for object shapes that may be extended; `type` for unions/utility compositions.
- Enums mirror the Prisma enums (`UserRole`, `CertificateStatus`, etc.) — import shared types from `types/` rather than redefining them per feature.
- No `any` in service layer or API route handlers; use `unknown` + narrowing when a type is genuinely unknown (e.g., raw webhook payloads).

## 2. React Standards
- Default to **Server Components**; only mark a component `"use client"` when it needs interactivity, state, or browser APIs.
- Hooks follow the `useX` naming convention and live in `hooks/` when shared across features.
- Component naming: PascalCase file and export name matching (`CertificateCard.tsx` → `CertificateCard`).
- Folder structure mirrors domain, not type-first sprawl: `components/certificate/`, `components/student/`, etc., as defined in `SYSTEM_ARCHITECTURE.md`.

## 3. Next.js Standards
- App Router only — no `pages/` directory.
- Server Actions may be introduced in a later phase for form mutations; Phase 1–7 use API Route Handlers under `app/api/`.
- `middleware.ts` is the single source of truth for auth/role gating at the routing layer; do not duplicate that logic ad hoc inside individual pages.
- Route handlers stay thin: parse/validate input, call a service, return a formatted response (see `API_SPECIFICATION.md` §12).

## 4. Prisma Standards
- Model names: PascalCase singular (`Certificate`, not `Certificates`).
- Field names: camelCase.
- All relations explicitly named; `onDelete` behavior set deliberately, not left to default.
- Every organization-owned model includes and indexes `organizationId` (see `DATABASE_SCHEMA.md`).
- Transactions (`prisma.$transaction`) required for any multi-table write (e.g., certificate generation touching Certificate + AuditLog + EmailLog).

## 5. UI Standards
- Tailwind CSS v4 utility classes; avoid inline styles.
- Shared, reusable components live in `components/ui/`; feature-specific components stay in their domain folder.
- Design tokens (colors, spacing, typography) centralized per `UI_DESIGN_SYSTEM.md` rather than hardcoded per component.
- Accessibility: every interactive element has a label/role; forms use associated `<label>` elements.

## 6. Git Standards
- **Branch naming:** `feature/<short-description>`, `fix/<short-description>`, `chore/<short-description>`.
- **Commit messages:** imperative mood, scoped where useful — e.g., `feat(certificates): add bulk issue endpoint`.
- **Pull requests:** small and single-purpose where possible; description links back to the relevant `TASKS.md` item.
- **Code reviews:** required before merge to main; reviewer checks against this document and `SECURITY_GUIDELINES.md`.

## 7. Error Handling

**API layer**
- All route handlers wrap logic in try/catch and return the standard error envelope from `API_SPECIFICATION.md` §12.
- Never leak stack traces or internal error messages to the client in production.

**Database layer**
- Prisma errors are caught and translated into domain-meaningful errors (e.g., unique constraint violation → `409 Conflict` with a clear message) rather than surfaced raw.

**Validation**
- All external input (API bodies, query params) validated with **Zod** at the boundary before reaching the service layer.
- Validation errors return `422` with field-level detail (see `API_SPECIFICATION.md`).

**Logging**
- Sensitive actions (login, delete, generate, email, download, verification) are recorded via the audit logging service, not ad hoc `console.log`.
- Application-level errors are logged with enough context (route, user id if available, error code) to debug without exposing PII in logs unnecessarily.
