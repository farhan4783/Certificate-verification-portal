# UI Design System

**Project:** Kode To Career — Certificate & Credential Verification Platform
**Styling:** Tailwind CSS v4

---

## 1. Branding

- **Logo:** Kode To Career logo, used in navbar, dashboard header, certificate PDFs, and emails.
- **Typography:** A clean, professional sans-serif for UI (e.g., Inter or similar); a more formal serif/script accent font reserved for certificate PDF text only.
- **Spacing:** Consistent Tailwind spacing scale (4px base unit) across all dashboards for visual rhythm.
- **Colors:** Primary brand palette drawn from KTC's existing materials; needs a defined token set (primary, secondary, accent, success, warning, danger, neutral grays) before implementation.
- **Icons:** A single icon library used consistently across admin/trainer/student dashboards (outline style for nav, filled for status badges).

---

## 2. Layout

- **Navbar:** Top-level, shows logo, current role/user menu, notifications (future).
- **Sidebar:** Role-specific navigation (Admin / Trainer / Student sections differ — see each dashboard's Navigation section below).
- **Dashboard shell:** Sidebar + top navbar + content area, responsive collapse to a hamburger/drawer on mobile.
- **Cards:** Used for summary metrics (e.g., "Certificates Issued", "Average Rating").
- **Tables:** Used for certificate lists, student lists, course lists — sortable, paginated, filterable.
- **Forms:** Used for course creation, certificate issuance, profile editing — client + server (Zod) validation.

---

## 3. Components

- Buttons (primary, secondary, destructive, ghost)
- Inputs (text, number, date, file/photo upload)
- Dropdowns / Selects
- Badges (certificate status: Draft, Generated, Issued, Revoked, Expired)
- Alerts / Toasts (success, error, warning, info)
- Dialogs / Modals (confirmations, e.g. "Delete Certificate")
- Tables (with sorting, pagination, row actions)
- Charts (bar/line for analytics: issuance trends, rating trends, verification counts)
- Pagination controls
- Search bar (instant + server-side)
- Filter panels (per-entity filters, see below)

---

## 4. Dashboard Design

### 4.1 Admin Dashboard
- **Overview:** Total Students, Total Trainers, Certificates Issued, Verification Count, Recent Activity, Pending Certificates.
- **Sections:** Trainers, Students, Certificates, Templates, Analytics, Bulk Issue.

### 4.2 Trainer Dashboard
- **Overview cards:** Courses Assigned, Active Students, Certificates Issued, Certificates Verified, Average Rating, Years of Experience.
- **Sections:** Overview, My Profile, Certificates, Courses, Students, Ratings & Reviews, Experience, Analytics, Settings.
- **Certificates table columns:** Certificate Number, Student, Course, Batch, Issue Date, Status, Verification Count — with View / Download / Email / Reissue actions.
- **Courses view:** Course Name, Description, Duration, Batch Count, Student Count, Certificates Issued, Completion Rate, Status.
- **Students table columns:** Enrollment Number, Student Name, Course, Batch, Certificate Status, Email, Progress.
- **Ratings & Reviews:** Overall Rating, Total Reviews, Recommendation %, per-review detail (student name or anonymous, course, 1–5 rating, review text, date), plus rating distribution/trend charts.
- **Experience profile:** Total Experience, Current Role, Previous Organizations, Areas of Expertise, Certifications, Workshops Conducted, Seminars, Conferences, Publications, Awards.
- **Analytics:** Certificate analytics (issued/downloaded/verified, monthly trend), Student analytics (trained/active/completion rate), Course analytics (enrollment, completion %, issuance by course), Performance analytics (avg rating, review count, top courses).

### 4.3 Student Dashboard
- **Overview cards:** Total Certificates, Active Certificates, Expired Certificates, Projects Completed, Achievements Earned; Recent Activity (new certificates, downloads, shares, achievements); Quick Actions (View Certificates, Download Latest, Share, Add Project, Update Profile).
- **My Certificates table columns:** Certificate Number, Course, Issue Date, Expiry Date, Status, Actions (View / Download PDF / Share / Copy Link).
- **Certificate Details view:** certificate preview, student name, course name, trainer name, organization, certificate number, issue date, expiry date, status, QR code, download + share buttons.
- **Download Center:** individual downloads, "download latest", download-all (ZIP, future phase), download history (certificate, date, device, browser).
- **Share Certificate:** copy public link, email sharing, QR download, native device share; share card shows student name, course, organization, certificate number, public verification link.
- **LinkedIn Integration:** generates LinkedIn-ready fields (Certification Name, Issuing Organization, Issue Date, Expiration Date, Credential ID, Credential URL); copy credential info; deep-link into LinkedIn's "Add License & Certification" flow.
- **Projects:** add/edit/delete, thumbnail upload, GitHub URL, live demo URL, technologies used, featured flag. Fields: Title, Description, Technologies, GitHub URL, Live Demo URL, Completion Date, Thumbnail.
- **Achievements:** categorized list + timeline + featured achievements. Types: Course Completion, Top Performer, Perfect Attendance, Hackathon, Internship, Workshop, Competition, Community Contribution. Fields: Title, Description, Issuer, Date, Badge/Icon, optional Supporting Link.
- **Profile:** personal info (name, email, photo, enrollment number, organization, bio), academic info (course, batch, joining date), social links (LinkedIn, GitHub, portfolio).

---

## 5. Certificate Design (PDF Layout)

- **PDF Layout:** landscape or portrait per template setting; clear hierarchy — organization branding at top, student name as focal point, course/trainer/date details below, QR + certificate number in a consistent footer position.
- **QR Position:** bottom corner (consistent across all templates), always paired with the certificate number.
- **Signature:** trainer's digital signature image placed near their name/designation.
- **Fonts:** a formal display font for the student's name; a readable body font for supporting details.
- **Logo:** organization logo placed top-center or top-left per template.

---

## 6. Responsive Design

- **Desktop:** full sidebar + multi-column dashboard layouts, full-width tables.
- **Tablet:** collapsible sidebar, tables scroll horizontally or condense columns.
- **Mobile:** drawer navigation, stacked cards instead of tables where practical, single-column forms.

---

## 7. Accessibility

- Semantic HTML for all structural elements (nav, main, headings hierarchy).
- Sufficient color contrast for text/badges against backgrounds.
- All interactive elements keyboard-navigable and screen-reader labeled.
- Form inputs paired with visible labels and inline validation messages.

---

## 8. Dark Mode

Planned as a **future** enhancement; design tokens should be structured (CSS variables / Tailwind theme config) from the start so dark mode can be added without a full component rewrite.

---

## 9. Search & Filters (UI Behavior)

- **Certificate filters:** Course, Status, Issue Date, Expiry Date, Verification Count.
- **Student filters:** Course, Batch, Active/Inactive.
- **Course filters:** Active, Archived, Duration.
- **Review filters:** Rating, Course, Date Range.
- **Project filters (student):** Technology, Completion Year, Featured.
- **Achievement filters (student):** Category, Year, Issuer.
- Search supports instant client-side filtering plus server-side pagination for large datasets, with sortable table results.
