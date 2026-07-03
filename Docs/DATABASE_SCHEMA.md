# Database Schema

**Project:** Kode To Career — Certificate & Credential Verification Platform
**ORM:** Prisma · **Database:** PostgreSQL
**Primary Key Strategy:** UUID for all tables

---

## 1. Enums

```
UserRole          SUPER_ADMIN | ORG_ADMIN | TRAINER | STUDENT
CertificateStatus DRAFT | GENERATED | ISSUED | REVOKED | EXPIRED
CourseStatus      ACTIVE | ARCHIVED
EmailStatus       PENDING | SENT | FAILED
VerificationResult VALID | INVALID | REVOKED | EXPIRED
AuditAction       LOGIN | CREATE | UPDATE | DELETE | GENERATE | EMAIL | DOWNLOAD | VERIFY
```

---

## 2. Core Tables (Conceptual)

### Organization
| Field | Notes |
|---|---|
| id | UUID, PK |
| name | |
| logo | Cloudinary URL |
| website | |
| email | |
| phone | |
| address | |
| createdAt | |

### Users
| Field | Notes |
|---|---|
| id | UUID, PK |
| name | |
| email | unique |
| password | bcrypt hash |
| role | `UserRole` |
| organizationId | FK → Organization |
| createdAt / updatedAt | |

### Trainer
| Field | Notes |
|---|---|
| id | UUID, PK |
| userId | FK → Users (1:1) |
| designation | |
| bio | |
| photo | Cloudinary URL |
| signature | Cloudinary URL |
| organizationId | FK → Organization |

### Student
| Field | Notes |
|---|---|
| id | UUID, PK |
| userId | FK → Users (1:1) |
| enrollmentNumber | unique |
| courseId | FK → Course |
| photo | Cloudinary URL |
| organizationId | FK → Organization |

### Course
| Field | Notes |
|---|---|
| id | UUID, PK |
| title | |
| duration | |
| description | |
| trainerId | FK → Trainer |
| status | `CourseStatus` |
| organizationId | FK → Organization |

### CertificateBatch
| Field | Notes |
|---|---|
| id | UUID, PK |
| trainerId | FK → Trainer |
| courseId | FK → Course |
| batchName | |
| totalCertificates | |
| createdAt | |

### CertificateTemplate
| Field | Notes |
|---|---|
| id | UUID, PK |
| name | |
| backgroundImage | Cloudinary URL |
| orientation | landscape / portrait |
| font | |
| version | integer, incremented per revision |
| active | boolean |

### Certificate
| Field | Notes |
|---|---|
| id | UUID, PK |
| certificateId | unique, human-readable ID |
| studentId | FK → Student |
| trainerId | FK → Trainer |
| courseId | FK → Course |
| templateId | FK → CertificateTemplate (specific version) |
| batchId | FK → CertificateBatch (nullable) |
| issueDate | |
| expiryDate | nullable |
| pdfUrl | Cloudinary URL |
| pdfHash | SHA-256 hash of PDF, for integrity checking |
| qrCode | Cloudinary URL or embedded data |
| verificationToken | unique, indexed |
| status | `CertificateStatus` |
| createdAt / updatedAt | |

### VerificationLog
| Field | Notes |
|---|---|
| id | UUID, PK |
| certificateId | FK → Certificate |
| result | `VerificationResult` |
| ipAddress | |
| device | |
| userAgent | |
| referrer | |
| country | approximate, derived from IP |
| verifiedAt | |

### AuditLog
| Field | Notes |
|---|---|
| id | UUID, PK |
| userId | FK → Users (nullable, for system actions) |
| action | `AuditAction` |
| table | affected table name |
| recordId | affected record UUID |
| metadata | JSON, optional context |
| createdAt | |

### EmailLog
| Field | Notes |
|---|---|
| id | UUID, PK |
| studentId | FK → Student (nullable) |
| certificateId | FK → Certificate (nullable) |
| status | `EmailStatus` |
| sentAt | |

---

## 3. Relationships

```
Organization
  ├── Users (1:N)
  ├── Trainers (1:N)
  ├── Students (1:N)
  └── Courses (1:N)

Course
  ├── Trainer (N:1)
  ├── Students (1:N)
  └── Certificates (1:N)

Student
  ├── User (1:1)
  └── Certificates (1:N)

Certificate
  ├── Student (N:1)
  ├── Trainer (N:1)
  ├── Course (N:1)
  ├── Template (N:1, versioned)
  ├── Batch (N:1, optional)
  └── VerificationLogs (1:N)
```

**Cardinality notes**
- One-to-One: `Users ↔ Trainer`, `Users ↔ Student`
- One-to-Many: `Organization → Users/Trainers/Students/Courses`, `Certificate → VerificationLog`
- Many-to-One: `Certificate → Student/Trainer/Course/Template`

---

## 4. Prisma Models — Structural Outline

Model list to be implemented in `prisma/schema.prisma`:
`User`, `Organization`, `Trainer`, `Student`, `Course`, `Certificate`, `CertificateBatch`, `CertificateTemplate`, `VerificationLog`, `AuditLog`, `EmailLog`.

Conventions to apply when writing the actual schema (Phase 1):
- `id String @id @default(uuid())` on every model.
- All organization-owned models include `organizationId String` with a relation to `Organization`, plus an index on `organizationId`.
- `@@index` on frequently filtered/sorted columns: `Certificate.status`, `Certificate.issueDate`, `VerificationLog.verifiedAt`, `Course.status`.
- `@@unique` on `Users.email`, `Student.enrollmentNumber`, `Certificate.certificateId`, `Certificate.verificationToken`.
- `onDelete` behavior defined explicitly per relation (e.g., restrict deleting a Course that has issued Certificates).

---

## 5. Indexes

- **Unique:** `Users.email`, `Student.enrollmentNumber`, `Certificate.certificateId`, `Certificate.verificationToken`
- **Composite:** `(organizationId, status)` on Certificate for scoped dashboard queries; `(trainerId, courseId)` on CertificateBatch
- **Performance:** index on `Certificate.issueDate` and `VerificationLog.verifiedAt` for analytics/time-range queries

---

## 6. Constraints

- **Foreign keys:** every relational field above is enforced at the database level via Prisma relations.
- **Unique keys:** see Indexes §5.
- **Defaults:** `status` defaults to `DRAFT` on Certificate creation; `createdAt` defaults to `now()`; `active` defaults to `true` on CertificateTemplate.

---

## 7. Migration Strategy

**Migration order** (dependency-respecting):
1. `Organization`
2. `User`
3. `Trainer`, `Student` (depend on User + Organization)
4. `CertificateTemplate`
5. `Course` (depends on Trainer, Organization)
6. `CertificateBatch` (depends on Trainer, Course)
7. `Certificate` (depends on Student, Trainer, Course, Template, Batch)
8. `VerificationLog`, `AuditLog`, `EmailLog` (depend on Certificate/User/Student)

**Seed order** mirrors migration order: seed one Organization → an Admin user → a Trainer → a Course → a CertificateTemplate → sample Students → a sample Certificate, so every foreign key has a valid target during local development.
