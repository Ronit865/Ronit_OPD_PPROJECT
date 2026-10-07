# Project Rules

## Scope
1. Build only what the PDF asks, plus what is logically required (login ⇒ register, logout, guards).
2. No extra features, pages, or dependencies. If unsure, ask first.
3. Out of scope: RBAC, reports, edit/delete/cancel flows, password reset, dashboards.

## Workflow
1. Work phase by phase as in [PLAN.md](PLAN.md). One phase at a time.
2. Each phase ends with its Validation gate. Tick boxes only after the gate passes.
3. Report result after each phase before starting the next.
4. Check official docs before scaffolding/adding a library (versions change).
5. Do not create unnecessary files (no scratch files, duplicate docs, unused components). Delete dead code.

## Backend
- Java 21, Spring Boot 4.x. Feature packages; controller → service → repository.
- DTOs (records) + Bean Validation at the edge; never return entities.
- All schema changes via Flyway migrations; `ddl-auto=validate`.
- Business errors throw typed exceptions → `GlobalExceptionHandler` → error contract (architecture.md).
- Secrets/config from environment variables; no secrets in git. Each app owns its config: backend settings live in `backend/.env` (git-ignored) with `backend/.env.example` committed. The repo root holds only `backend/`, `frontend/`, `docs/`, `.gitignore`, `README.md`.
- Every new rule (409/400 cases) has a test. Service logic transactional.

## Frontend
- Angular 22 standalone + signals; typed reactive forms; lazy-loaded routes.
- UI from Spartan components + Tailwind utilities; follow [design.md](design.md).
- HTTP only in services; components never call `HttpClient` directly.
- Every API action: loading state, success toast, error toast; no silent failures.
- No `any`; strict TypeScript; no `console.log` left behind.

## Git / hygiene
- `.gitignore` for `target/`, `node_modules/`, `.angular/`, `.env`.
- Small, meaningful commits per phase (if git is used).

## Definition of Done (final)
- [ ] All PDF deliverables work: patient register/list/search, appointment book/list today, consultation (2 vitals + notes, complete, history), login
- [ ] Register exists alongside login
- [ ] Postgres used; schema from Flyway
- [ ] Every success and error path shows a proper toast; forms show inline errors
- [ ] Responsive at 375 / 768 / 1280
- [ ] Design rules respected (no gradients/neon, smooth radius, pills, cards)
- [ ] `./mvnw test` and `npm run build` pass
- [ ] README explains setup, code flow, functional flow
- [ ] No unused files or dead code
