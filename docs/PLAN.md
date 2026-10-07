# OPD Mini-Module – Phased Plan

Source: `OPD-Development - For Full Stack.pdf` (Patient Registration, Appointment Booking, Consultation Summary).
Tracking: `[ ]` pending · `[x]` done. **A phase is only checked off after its Validation gate passes.**
Workflow: finish phase → run validation → report result → tick boxes → next phase. Never start a phase with a failing gate.

## Confirmed Decisions
- Database: **PostgreSQL** (changed from MySQL). Everything else per PDF.
- Auth included: **login + register** (JWT, no RBAC). Sample reports excluded.
- Doctors = registered users (with specialization).
- Vitals: Blood Pressure + Temperature.
- Seed data (Flyway `V2__seed.sql`): 3 doctors (required – appointments need a doctor, and the PDF has no doctor screen) + 3 sample patients (demo convenience). No seeded appointments/consultations – the demo flow creates them.
- "Today" list: all doctors' appointments.
- Full detail: [architecture.md](architecture.md) · [design.md](design.md) · [rules.md](rules.md)

## Verified Stack (checked 2026-10-07 against npm / start.spring.io)
| Layer | Choice | Version |
|---|---|---|
| Backend | Spring Boot (+ Spring Data JPA, Security, Validation, Flyway) | 4.1.1 |
| Java | JDK installed 24.0.1; project targets Java 21 (LTS) | 21 |
| DB | PostgreSQL | latest stable (17 or 18) |
| Frontend | Angular (standalone, signals, zoneless default) | 22.2.2 |
| UI kit | Spartan UI (`@spartan-ng/brain` + CLI, shadcn-style) | 1.6.1 |
| CSS | Tailwind CSS (required by Spartan) | 4.3.3 |
| Tooling | Node 24.18, npm 11.6 (installed) · Maven via wrapper (`mvnw`) | – |

> Before each scaffold step re-check the official docs (angular.dev, spartan.ng, docs.spring.io) – these versions move fast.

---

## Phase 0 – Prerequisites
- [x] Install PostgreSQL locally (PostgreSQL 18 already installed and running)
- [x] Create DB `opd_db` and user `opd_user`
- [x] Confirm `psql` works and credentials are noted for `backend/.env` (git-ignored; `backend/.env.example` committed)
**Validation:** `psql -U opd_user -d opd_db -c "select 1"` returns 1.

## Phase 1 – Backend base setup
- [x] Generate Spring Boot 4.1.1 project in `/backend` (Initializr: web, data-jpa, validation, security, oauth2-resource-server, postgresql, flyway, lombok, test starters)
- [x] `application.yml` using env vars (`DB_URL`, `DB_USER`, `DB_PASS`, `JWT_SECRET`), `ddl-auto=validate`
- [x] Flyway `V1__init.sql` (users, patients, appointments, consultations + constraints)
- [x] Flyway `V2__seed.sql`: 3 doctors (BCrypt hash of a documented demo password, listed in README) + 3 patients; idempotent (`ON CONFLICT DO NOTHING`) – demo password `Doctor@123`
- [x] JPA entities + repositories
- [x] `GlobalExceptionHandler` + error response contract
- [x] CORS for `http://localhost:4200`
**Validation (PASSED):** `./mvnw test` green (2 tests, separate `opd_test` DB) · app boots on `opd_db` · Flyway applied (3 doctors + 3 patients, 2 migrations) · unknown route returns the JSON error contract.

## Phase 2 – Backend: Auth
- [x] `POST /api/auth/register` (BCrypt, unique email → 409)
- [x] `POST /api/auth/login` → JWT + user
- [x] Security config: stateless, everything except `/api/auth/**` requires JWT (JSON 401 in the error contract)
**Validation (PASSED):** 8 tests green (register, login, seeded doctor login, duplicate email 409, field errors 400, wrong password / unknown email 401 with same message, no/invalid token 401, valid token accepted).

## Phase 3 – Backend: Doctors & Patients
- [x] `GET /api/doctors`
- [x] `POST /api/patients` (duplicate phone → 409 with field error)
- [x] `GET /api/patients?q=` search by name or phone (case-insensitive, partial, wildcard-safe)
**Validation (PASSED):** 16 tests green (8 new: register, duplicate phone 409 + field error, validation 400 field errors, unknown gender 400, search by name part and phone, blank query lists all, `%` treated literally, auth required, doctors list without sensitive data).

## Phase 4 – Backend: Appointments & Consultations
- [x] `POST /api/appointments` (slot taken → 409, past date → 400)
- [x] `GET /api/appointments/today`
- [x] `PUT /api/consultations/{appointmentId}` (save vitals + notes, mark COMPLETED; already completed → 409)
- [x] `GET /api/patients/{id}/consultations`
**Validation (PASSED):** 24/24 tests green — 8 new (double-booking 409 + field error, past date 400 + field error, unknown patient/doctor 404, full consultation completion flow, already-completed 409, invalid vitals 400 field errors, history 404 for unknown patient).

## Phase 5 – Frontend base setup
- [x] Angular 22 app in `/frontend` (zoneless, strict, Tailwind 4)
- [x] `@spartan-ng/brain` + `@lucide/angular` + `@fontsource-variable/inter` installed
- [x] Design tokens in `styles.css` via Tailwind 4 `@theme` (teal-700 primary, slate surfaces, Inter font)
- [x] `core/`: AuthService (signals), auth guard, JWT interceptor, error interceptor → ToastService
- [x] `shared/`: StatusPill, PageHeader, EmptyState, SkeletonCard/Grid, ToastContainer
- [x] App shell (sidebar desktop / drawer mobile), lazy routes, environment config
**Validation (PASSED):** `ng build` clean — 269 kB initial, 5 lazy chunks, 0 errors.

## Phase 6 – Frontend: Auth screens
- [x] Login page: reactive form, inline field errors, server error banner, loading state, link to register
- [x] Register page: fullName/email/specialization/password, client + server field errors, success toast → redirect
- [x] logout in shell sidebar/topbar; auth guard redirects to /login; 401 interceptor logs out + toast
**Validation (PASSED):** `ng build` clean — login 4.2 kB, register 6.2 kB chunks, 0 errors.

## Phase 7 – Frontend: Patients screen
- [x] Card grid with initials avatar, age/gender/phone pills (font-numeric for numbers)
- [x] Debounced search (350ms) by name or phone
- [x] Register dialog: name/gender/age/phone, client + server field errors, 409 duplicate phone shown inline
- [x] Skeleton loading, empty state with CTA
**Validation (PASSED):** `ng build` clean — patients-component 10.2 kB chunk, 0 errors.

## Phase 8 – Frontend: Appointments screen
- [x] Today's cards: time pill (font-numeric), patient name, doctor avatar + specialization, status pill
- [x] Book dialog: patient search filter, doctor select, datetime-local input, server field errors (scheduledAt)
- [x] "Start Consultation" action button on SCHEDULED cards
**Validation (PASSED):** `ng build` clean — appointments-component 17.2 kB chunk.

## Phase 9 – Frontend: Consultation screen
- [x] Consultation form in dialog: blood pressure (pattern 120/80), temperature (30-45 °C), notes — all with field errors
- [x] Complete button marks appointment COMPLETED inline (no page reload)
- [x] Green "Consultation completed" banner replaces action button
**Validation (PASSED):** Combined with Phase 8 — `ng build` 0 errors, 0 warnings.

## Phase 10 – Final QA & handover
- [ ] Full end-to-end browser pass (all PDF scenarios)
- [ ] Responsive + error/success toast audit (no silent failures)
- [ ] `README.md` (setup, run, code flow, functional flow – PDF requires explaining in review)
- [ ] Remove dead code / unused files; final `./mvnw test` and `npm run build`
**Validation:** checklist in rules.md "Definition of Done" fully ticked.
