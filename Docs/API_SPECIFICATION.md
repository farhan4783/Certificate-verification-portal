# API Specification

**Project:** Kode To Career — Certificate & Credential Verification Platform
**Style:** REST, via Next.js Route Handlers under `/api`

---

## 1. Conventions

- Base path: `/api`
- Auth: JWT read from HttpOnly cookie on every request; unauthenticated requests to protected routes return `401`.
- Content type: `application/json` for all requests/responses except file downloads.
- All list endpoints support pagination, filtering, and search (see §9).

---

## 2. Authentication — `/api/auth`

| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Validate credentials, issue JWT cookie | Public |
| POST | `/api/auth/logout` | Clear session cookie | Authenticated |
| POST | `/api/auth/register` | Create a new user (role-gated) | Public / Admin |
| GET | `/api/auth/profile` | Return current authenticated user | Authenticated |

---

## 3. Certificates — `/api/certificates`

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/certificates` | List certificates (scoped by role) | Authenticated |
| POST | `/api/certificates` | Create/generate a certificate | Admin, Trainer |
| GET | `/api/certificates/:id` | Get single certificate detail | Authenticated (owner/Admin/Trainer) |
| PATCH | `/api/certificates/:id` | Update certificate (status, metadata) | Admin, Trainer (own) |
| DELETE | `/api/certificates/:id` | Delete certificate | Admin only |
| GET | `/api/certificates/:id/download` | Download certificate PDF | Authenticated (owner/Admin/Trainer) |
| POST | `/api/certificates/issue` | Issue a single certificate (triggers PDF + QR + email) | Admin, Trainer |
| POST | `/api/certificates/bulk-issue` | Issue certificates for an entire batch | Admin, Trainer |

---

## 4. Trainers — `/api/trainers`

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/trainers` | List trainers | Admin |
| POST | `/api/trainers` | Create trainer | Admin |
| GET | `/api/trainers/:id` | Trainer detail | Admin, self |
| PATCH | `/api/trainers/:id` | Update trainer | Admin, self |
| DELETE | `/api/trainers/:id` | Deactivate/delete trainer | Admin |

---

## 5. Students — `/api/students`

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/students` | List students | Admin, Trainer (own course scope) |
| POST | `/api/students` | Create/import student(s) | Admin, Trainer |
| GET | `/api/students/:id` | Student detail | Admin, Trainer (own), self |
| PATCH | `/api/students/:id` | Update student/profile | Admin, self |
| DELETE | `/api/students/:id` | Deactivate/delete student | Admin |

---

## 6. Courses — `/api/courses`

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/courses` | List courses | Authenticated |
| POST | `/api/courses` | Create course | Admin, Trainer |
| GET | `/api/courses/:id` | Course detail | Authenticated |
| PATCH | `/api/courses/:id` | Update/archive course | Admin, Trainer (own) |
| DELETE | `/api/courses/:id` | Delete course | Admin |

---

## 7. Templates — `/api/templates`

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/templates` | List certificate templates | Admin |
| POST | `/api/templates` | Create template | Admin |
| PATCH | `/api/templates/:id` | Update/version template | Admin |
| DELETE | `/api/templates/:id` | Deactivate template | Admin |

---

## 8. Verification — `/api/verify`

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/verify/:certificateId` | Verify a certificate by ID/token; logs the attempt | Public |

Response includes `result: VALID | INVALID | REVOKED | EXPIRED` and, if valid, student name, course, trainer, issue date, status, certificate number. No sensitive data (email, phone, internal IDs) is ever returned.

---

## 9. Organizations — `/api/organizations`

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/organizations` | List organizations *(future multi-tenant)* | Super Admin |
| POST | `/api/organizations` | Create organization | Super Admin |
| PATCH | `/api/organizations/:id` | Update organization | Super Admin, Org Admin |

---

## 10. Uploads — `/api/uploads`

| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/uploads` | Upload an asset (photo, logo, signature, template background) to Cloudinary | Authenticated |

---

## 11. Dashboard / Analytics — `/api/dashboard`

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/dashboard/admin` | Platform-wide stats (students, trainers, certificates, verifications, pending) | Admin |
| GET | `/api/dashboard/trainer` | Trainer-scoped stats (courses, students, certificates, ratings, experience) | Trainer |
| GET | `/api/dashboard/student` | Student-scoped stats (certificates, downloads, verification status) | Student |

---

## 12. Response Standards

### Success
```json
{
  "success": true,
  "data": { },
  "message": "optional human-readable message"
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": { }
  }
}
```

### Validation
All request bodies are validated server-side with Zod before touching the service layer. Validation failures return `422` with field-level `details`.

---

## 13. Pagination

Query params: `?page=1&pageSize=20`
Response includes:
```json
{
  "data": [ ],
  "pagination": { "page": 1, "pageSize": 20, "total": 134, "totalPages": 7 }
}
```

## 14. Filtering & Search

- Filtering via query params matching field names, e.g. `?status=ISSUED&courseId=...`
- Search via `?q=` for full-text-style search across relevant fields (student name, certificate number, enrollment number, course name, batch name).
- Sorting via `?sortBy=issueDate&sortOrder=desc`.

---

## 15. Authentication Headers & Status Codes

- Auth is cookie-based (HttpOnly), not header-based; no `Authorization: Bearer` token required from the client.
- Standard status codes:
  - `200` OK, `201` Created
  - `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found
  - `422` Validation Error
  - `429` Too Many Requests (rate limited)
  - `500` Internal Server Error
