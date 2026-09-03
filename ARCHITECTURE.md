# MITS SPSM — System Architecture

> **Sistem Pembangunan Sahsiah Murid (SPSM) · Maahad Integrasi Tahfiz Selangor (MITS)**
> This document is the research + design blueprint for the production system. It supersedes the `sample/` prototype as the source of truth for architecture. Business rules and workflow logic were validated in `sample/` (see `sample/tests/reports/`) and are ported here.

---

## 1. Overview

| Layer | Technology | Location |
|---|---|---|
| Frontend | Next.js (App Router, TypeScript, Tailwind) | `client/` |
| Backend | FastAPI (Python 3.13+, SQLAlchemy 2, Pydantic v2) | `server/src/server/` |
| Database | PostgreSQL (Neon) | via `DATABASE_URL` |
| AuthN — staff | Zitadel (OIDC Authorization Code + PKCE) | blueprint: `client/zitadel.md` |
| AuthN — pengawas | **Local email+password (FastAPI)** — kiosk mode | dual auth, see §3 |
| Email / push | `EMAIL_API` (`api.motionukict.com/api/v1/emails/send-html`) | `server/.env` |
| Student master data | External MITS student server (read-only API) | proxied + cached, §6.5 |

### Roles

| Role | Meaning | Auth |
|---|---|---|
| `guru_biasa` | Ordinary teacher — files complaints (B01) | Zitadel |
| `pengawas` | Prefect — issues Kad Peringatan (B03) only | **Local account** |
| `guru_disiplin` | Discipline teacher — full operational control, **can also file B01** | Zitadel |
| `pentadbir` | Administrator — everything operational + **files B01** + **sole signer of B06** + manages pengawas accounts | Zitadel (MFA) |
| `super_admin` | Everything in-app | Zitadel (MFA) |

Staff roles are **Zitadel project roles** (assigned in the Zitadel console). Pengawas accounts are **local rows** in the app database (managed in-app by pentadbir/super_admin).

---

## 2. Authentication

### 2.1 Staff — Zitadel OIDC

Full blueprint in `client/zitadel.md` (Authorization Code + PKCE S256). Summary:

1. `GET /api/auth/login` builds the authorize URL (PKCE, state, nonce, org scope `urn:zitadel:iam:org:id:{ZITADEL_ALLOWED_ORG_ID}`); verifier/state/nonce stashed in a 10-min `httpOnly` `oidc-state` cookie.
2. Zitadel redirects back to `/api/auth/callback` → token exchange → **ID token verified** (JWKS signature, pinned issuer, nonce, org membership).
3. Next.js mints its **own session JWT** (HS256, `NEXTAUTH_SECRET`) in an `httpOnly` cookie. The session payload carries `sub`, `name`, `email`, `access_token`, `expires_at`, and **`roles`** (from Zitadel project roles claim).
4. `proxy.ts` guards protected routes; server components re-verify via `getSession()`.
5. **MFA is enforced in the Zitadel console for `pentadbir` and `super_admin`** (they hold signing and user-management power).

### 2.2 Pengawas — local credentials (kiosk mode)

Rationale (decision log): pengawas cannot bring phones to school (no MFA), they use public/shared computers, and only 1–3 pengawas accounts exist (they key in the reporting pengawas' name manually). Zitadel SSO would leave a lingering SSO session on a public browser — unacceptable.

Flow:

```
Public PC browser          Next.js                  FastAPI
     │  POST /login-pengawas (email+password)       │
     │─────────────────────────────────────────────▶│  verify against pengawas_accounts
     │                                              │  (argon2 hash, lockout check)
     │◀────────────────────── 200 { jwt (15 min) }  │
     │  sets httpOnly cookie "pw_session" (15 min)  │
     │  GET /kad (proxy checks pw_session cookie)   │
```

- Password hashes: **argon2** (`pengawas_accounts.password_hash`).
- Session: **15-minute absolute JWT** (HS256, `APP_SECRET`), **no refresh** — must re-login after 15 min.
- Lockout: 5 failed attempts → locked 15 minutes (`failed_attempts`, `locked_until`).
- Kiosk hardening: visible countdown in UI, `Cache-Control: no-store` on pengawas pages, mandatory logout button, optional IP binding (config flag), every action audited with the manual reporter name.
- Account management: in-app page (pentadbir/super_admin): create, reset password, lock/unlock.

### 2.3 API tokens

- Staff client → FastAPI: `Authorization: Bearer <zitadel access_token>` (from session payload).
- Pengawas client → FastAPI: `Authorization: Bearer <pengawas jwt>` (from `pw_session` cookie).
- FastAPI `deps.py` accepts both schemes and yields a `Principal {auth_type, sub, name, email, roles}`.

---

## 3. Authorization & UI Gating

Port of the sample's `canAct` / `canAccessRoute` / `visibleDocs` / `flowPanels` — enforced **both** server-side (per-endpoint) and client-side (UI).

### 3.1 Route access (`canAccessRoute`)

| Route | guru_biasa | pengawas | guru_disiplin | pentadbir | super_admin |
|---|---|---|---|---|---|
| `/dashboard` | — | — | ✅ | ✅ | ✅ |
| `/aduan` (B01) | ✅ | — | ✅ | ✅ | ✅ |
| `/kad` (B03) | — | ✅ | — | — | ✅ |
| `/kes/[id]` | own only | — | ✅ | ✅ | ✅ |
| `/murid`, `/murid/[id]` | own only | — | ✅ | ✅ | ✅ |
| `/katalog` | ✅ | — | ✅ | ✅ | ✅ |
| `/pengawas-accounts` | — | — | — | ✅ | ✅ |

### 3.2 Action permissions (`canAct`) — enforced in the FastAPI state machine

| Action | Roles |
|---|---|
| `startInvestigation, confirm, dismiss, approveWarning, rejectWarning, record, ack, prepare, approve, execute, notify, meeting, close` | guru_disiplin, pentadbir, super_admin |
| `sign` (B06) | **pentadbir, super_admin** |
| File B01 | guru_biasa, guru_disiplin, pentadbir, super_admin |
| File B03 | pengawas, super_admin |
| B02 fill | guru_biasa (own >5 case), guru_disiplin, pentadbir, super_admin |
| Manage pengawas accounts | pentadbir, super_admin |

### 3.3 Document visibility (`visibleDocs`)

| Role | Docs |
|---|---|
| guru_biasa | b01, b02 (own case) |
| pengawas | b03 |
| guru_disiplin / pentadbir / super_admin | all (B01–B08, B04 register, Kad SPSM) |

### 3.4 Ownership scoping

`guru_biasa` sees **only cases where `case.reporter_sub == principal.sub`**. `guru_disiplin`/`pentadbir`/`super_admin` see all cases. Enforcement is server-side in the cases router (never trust client-side hiding alone).

---

## 4. Workflow State Machine

Ported verbatim from the sample (`sample/assets/js/workflow.js`), server-side in `services/workflow.py`.

**Statuses:** `REPORTED → INVESTIGATING → CONFIRMED → RECORDED → STUDENT_ACK → ACTION_PREPARED → PRINCIPAL_APPROVAL → EXECUTED → PARENT_NOTIFIED → MEETING → CLOSED` (+ terminal `DISMISSED`).

**Entry sources:** `COMPLAINT` (B01), `PREFECT_WARNING` (B03), `SPOT_CHECK`.

**Rules (all tested in the sample suite):**
- Guru aduan **≤5 mata** → auto `RECORDED` (direct to B04), no B02.
- Guru aduan **>5 mata** → `REPORTED` → needs B02 siasatan; **anyone** (guru pengadu, guru_disiplin, pentadbir, super_admin) may fill B02 — **multiple B02 per case**, each tracked with `fill_by`/`fill_role`/`filled_at`.
- Pengawas B03 → `REPORTED` → `approveWarning` (→ `RECORDED`) or `rejectWarning` (→ `DISMISSED`). Max **5 mata**, only ≤5-mata offences.
- Spot check → B02 (by disiplin staff) → confirm → `RECORDED`.
- Heavy path (≥10 mata): B05 pengakuan → B06/B08 sediakan → **pentadbir signs B06** → hukuman → maklum ibu bapa → (pertemuan?) → `CLOSED`.
- Light path (<10 mata): `RECORDED → EXECUTED → CLOSED`.
- Transitions validate `from` status + `src` source + role, exactly like the sample (guards added from test findings).

---

## 5. Email Notifications

`services/email_service.py` → `POST {EMAIL_API}/api/v1/emails/send-html` with `API_KEY`:

| Event | Recipient(s) | Trigger |
|---|---|---|
| Aduan B01 baharu | guru_disiplin, pentadbir (super_admin optional copy) | `POST /cases` (COMPLAINT) |
| Kad Peringatan menunggu semakan | guru_disiplin, pentadbir | `POST /cases` (PREFECT_WARNING) |
| B03 disahkan / ditolak | pengawas reporter (local account email) | `approveWarning` / `rejectWarning` |
| B06 surat dikeluarkan | ibu bapa/penjaga | `prepare`/`sign` |
| Ibu bapa dipanggil | ibu bapa/penjaga | `meeting` |

> Note: student API has **no parent email**. Parent notifications currently use a placeholder address — the field must be added to the student data source before go-live. In-app notifications (`notifications` table) are also stored so disiplin staff have an inbox regardless of email deliverability.

---

## 6. Backend (FastAPI)

### 6.1 Layout (matches `server/project_folder.md`)

```
server/
├── alembic/               # Alembic migrations (env.py, versions/)
├── app/                   # application package — entry point: server = "app:main"
│   ├── __init__.py        # main() -> uvicorn app.main:app
│   ├── main.py            # app factory, CORS, router mounting, /health
│   ├── config.py          # pydantic-settings (reads server/.env)
│   ├── database.py        # SQLAlchemy engine/session/Base
│   ├── dependencies.py    # Principal model, staff (Zitadel) + pengawas bearer deps, require_roles
│   ├── models/            # SQLAlchemy models (case.py, pengawas.py, student.py)
│   ├── schemas/           # Pydantic request/response models (auth.py, cases.py, catalogue.py, notifications.py)
│   ├── seed.py            # offences catalogue + SPSM ladder (ported from sample)
│   ├── auth/
│   │   ├── zitadel.py     # JWT validation via JWKS (cached), role extraction
│   │   └── pengawas.py    # argon2 verify, lockout, 15-min session JWT
│   ├── services/
│   │   ├── workflow.py    # state machine (statuses, transitions, pathFor, needsB02)
│   │   ├── cases_service.py
│   │   ├── students_service.py   # sync/cache from student server
│   │   └── email_service.py      # EMAIL_API wrapper + notification mapping
│   └── routers/
│       ├── auth.py        # /auth/pengawas/login, /auth/pengawas/logout, /auth/me
│       ├── accounts.py    # /accounts/pengawas (pentadbir/super_admin)
│       ├── students.py    # /students (cache, filters), /students/{id}, /students/sync
│       ├── offences.py    # /offences, /spsm/ladder
│       ├── cases.py       # /cases CRUD + /cases/{id}/b02 + /transitions + /docs + /events
│       └── notifications.py  # /notifications (own inbox)
├── alembic.ini
└── pyproject.toml         # [project.scripts] server = "app:main"; [tool.uv.build-backend] module-name="app"
```

### 6.2 Data model (Postgres)

| Table | Purpose |
|---|---|
| `pengawas_accounts` | email, password_hash (argon2), full_name, active, failed_attempts, locked_until |
| `students_cache` | mirror of student-server rows (id, ic_number, name, gender, tingkatan, kelas, birth_year, year, synced_at) |
| `cases` | id, seq, source, status, student_source_id, **student_snapshot JSONB** (identity at offence time), reporter_sub/name/role, points, details, warning_level, meeting JSONB, created_at, updated_at |
| `case_offences` | case_id, code, name, points |
| `case_events` | case_id, ts, text, by_name, by_role (audit timeline) |
| `b02_forms` | case_id, fill_by, fill_role, filled_at, fields JSONB |
| `case_docs` | case_id, doc_code, data JSONB (b01/b03/b05/b06/b07/b08) |
| `notifications` | recipient_sub/role, type, case_id, text, read, created_at |

### 6.3 Auth dependencies

- **Staff:** `deps.require_roles("guru_disiplin", ...)` → validates Bearer JWT against `ZITADEL_JWKS_URI`, checks `aud` = `ZITADEL_AUDIENCE`, extracts project-role claims (`urn:zitadel:iam:org:project:{aud}:roles` / `urn:zitadel:iam:org:project:roles`), rejects if `ZITADEL_REQUIRED_ROLE` is set and absent.
- **Pengawas:** validates the HS256 `APP_SECRET` session JWT; role fixed to `pengawas`.

### 6.4 Cases API (summary)

```
POST   /cases                    # B01 / B03 / SPOT_CHECK (auto-record ≤5 complaint)
GET    /cases                    # role-scoped list (own vs all), status filters
GET    /cases/{id}               # detail + events + b02 forms + docs
POST   /cases/{id}/b02           # add tracked B02 (any authorized filler)
POST   /cases/{id}/transitions   # {action} — server-side state machine, role+from+src guard
PATCH  /cases/{id}/docs          # save B05/B06/B07/B08 fields
GET    /cases/{id}/events        # timeline
```

### 6.5 Student master data

- Read-only proxy to `https://mits-student-server-1088310577603.asia-southeast1.run.app` (`GET /api/v1/students/` with filters, `GET /api/v1/students/{id}`).
- **Hybrid storage** (decision log): students are **cached** in `students_cache` (periodic sync + on-demand), cases store a **snapshot** of the student's identity so history survives transfer/graduation. Only offenders get full case records.

---

## 7. Client (Next.js)

```
client/
├── proxy.ts                    # edge guard: staff session cookie + pengawas pw_session cookie
├── lib/auth.ts                 # adapted from zitadel.md (+ roles claim in Session)
├── lib/session.ts              # getSession() server-side
├── lib/permissions.ts          # canAct / canAccessRoute / visibleDocs (ported)
├── lib/api.ts                  # fetch wrapper → FastAPI (Bearer token, typed)
├── app/
│   ├── page.tsx                # redirect by session
│   ├── login/page.tsx          # staff "Sign in with Zitadel"
│   ├── login-pengawas/page.tsx # kiosk email+password, 15-min countdown
│   ├── dashboard/page.tsx      # role-aware queues + case table
│   ├── aduan/page.tsx          # B01 form (student picker: Tingkatan→Kelas→Murid)
│   ├── kad/page.tsx            # B03 form (≤5 mata), auto-logout timer
│   ├── kes/[id]/page.tsx       # stepper, Langkah Seterusnya, B02 multi-form, docs
│   ├── murid/page.tsx          # Senarai Murid (filters)
│   ├── murid/[id]/page.tsx     # student profile + Kad SPSM
│   ├── katalog/page.tsx        # offences + ladder
│   ├── pengawas-accounts/page.tsx  # pentadbir/super_admin only
│   └── api/auth/{login,callback,logout,me}/route.ts
└── components/Sidebar.tsx      # role-aware nav (mirrors sample gating)
```

- Server components fetch FastAPI with the session access token; role checks run through `permissions.ts`.
- Print: the sample's templates ported as React print views (A4 CSS) — initial phase reuses the sample's template strings in a `lib/print.ts`, later server-side PDF.
- Pengawas pages: `Cache-Control: no-store`, countdown overlay, single-route surface (`/kad`).

---

## 8. Sample → Real Migration Map

| Sample file | Production home |
|---|---|
| `offences.js`, `spsm.js` | `server/src/server/seed.py` (+ `/offences`, `/spsm/ladder`) |
| `workflow.js` | `server/src/server/services/workflow.py` (state machine) |
| `store.js` | SQLAlchemy models + `cases_service.py` |
| `student-api.js` | `students_service.py` (proxy + cache + snapshots) |
| `app.js` (roles/router) | `proxy.ts` + `permissions.ts` + `deps.py` |
| `views/*` | `app/*` pages |
| `print/templates.js` | `lib/print.ts` (React print views) |
| `tests/run-tests.js` | pytest suites for workflow/state machine; ported expectations from `sample/tests/reports/` |

---

## 9. Build Phases

1. **Phase 1 — Auth:** Zitadel staff flow (per zitadel.md) + roles claim; pengawas local accounts + login + 15-min session + lockout; `proxy.ts` guards.
2. **Phase 2 — Data:** Postgres schema (Alembic), students sync, offences/ladder seed, `/offences`, `/students`.
3. **Phase 3 — Cases:** cases CRUD + state machine + multi-B02 + events + ownership scoping.
4. **Phase 4 — UI:** dashboard, aduan, kad, kes detail, murid, katalog, print views.
5. **Phase 5 — Notifications:** email service + in-app notifications.
6. **Phase 6 — Pengawas hardening:** kiosk countdown, no-store, IP binding (optional), audit review.

---

## 10. Decisions Log

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | B06 signing authority | **pentadbir only** (+super_admin) | inherits pengetua role; disiplin prepares only |
| 2 | B03 access | **pengawas only** (+super_admin) | disiplin/pentadbir create cases directly |
| 3 | User management | **Zitadel console** for staff; small in-app page for pengawas accounts | avoids heavy Zitadel Admin API integration |
| 4 | Architecture doc | single `ARCHITECTURE.md` at root | single source of truth |
| 5 | Pengawas auth | **dual auth** — Zitadel for staff, local email+password for pengawas | public PCs, no MFA, SSO-session leakage risk |
| 6 | Pengawas session | **15-min absolute**, no refresh | shared/public computers |
| 7 | Student storage | hybrid: cache catalog + snapshot in cases | history survives transfers; teacher can search all students |
| 8 | B02 | multi-entry, tracked by filler | multiple officers can investigate one case |
| 9 | Status badge colours / prints | semantic status colours kept; official docs stay B/W | clarity + official forms |

### Open items

- Parent/guardian email addresses for B06/meeting notifications (student API lacks them).
- Staff refresh tokens / silent refresh (zitadel.md §13) for long-lived staff sessions.
- PDF generation strategy for official documents (client print views vs server-side PDF).
- Whether `guru_disiplin`/`pentadbir` need a dedicated B03 path later (decided: no).