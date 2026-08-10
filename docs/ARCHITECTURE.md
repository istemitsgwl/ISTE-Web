# Architecture

How the ISTE MITS website is put together.

## System overview

```
Browser
  │
  ▼
Vercel edge (iste.mitsgwalior.in)
  │  root vercel.json routes by path:
  ├── /api/*  ──► backend service  (FastAPI, Python serverless)
  │                  │
  │                  ├── MongoDB Atlas   (data)
  │                  ├── Cloudinary      (image CDN)
  │                  ├── Google OAuth    (admin identity)
  │                  └── Resend / SMTP   (contact-form email alerts)
  │
  └── /*      ──► frontend service (Vite static build + SPA fallback)
```

One Vercel project, two services (Vercel **Services** beta). The frontend and backend deploy together from a single repo; same domain, so no CORS pain in production.

## Frontend (`frontend/`)

- **Stack:** React 19, Vite 7, TypeScript, Tailwind CSS 4, Framer Motion, GSAP, Three.js/OGL (WebGL visuals), Zustand (state), React Router 7.
- **Pages** (`src/pages/`): Home, About, Mentors, Team, Developers, Events, Gallery, Faqs, Contact — all public; `Login` (`/patidar/admin`) and `Admin` (`/admin/dashboard`) are the CMS.
- **Routing:** client-side via React Router. Every route is declared in `src/App.tsx`, wrapped with a `Seo` component that sets per-page title/description/canonical (`src/components/Seo.tsx`).
- **State:** `src/store/authStore.ts` holds the admin session (JWT + profile, persisted to `localStorage`).
- **Data:** pages `fetch` from `VITE_API_URL` (defaults to `/api`). No server-side rendering — content is fetched at runtime.
- **Code splitting:** pages are lazy-loaded; heavy vendors (three.js, animation libs) are separate chunks.

## Backend (`backend/`)

- **Stack:** FastAPI + Motor (async MongoDB driver), PyJWT, google-auth, Cloudinary SDK.
- **Entry points:** `backend/main.py` (Vercel service entrypoint) → `app/main.py` (the real app). Legacy `api/index.py` at repo root is unused by the current deployment.
- **Routes** (`app/routes/`):
  - `auth_google.py` — Google OAuth login → issues our own JWT.
  - `auth.py` — admin profile get/update.
  - `admin.py` — super-admin CRUD over admin accounts (RBAC).
  - `events.py` — public event listing + admin CRUD + free registration.
  - `content.py` — mentors, committees/team, gallery, FAQs, contact info.
  - `contact.py` — public contact form + admin message inbox.
  - `health.py` — health/DB-latency probes.
- **Cross-cutting** (`app/`):
  - `config.py` — pydantic-settings; every secret comes from env / `.env`.
  - `dependencies.py` — `get_current_user`, `require_admin`, `require_super_admin` (JWT decode + live status check against MongoDB on every request).
  - `rate_limit.py` — per-IP sliding-window limiter used as a route dependency.
  - `cloudinary_service.py` — unified image upload (file / URL / base64) + delete.
  - `email_service.py` — contact-form notifications via Resend, SMTP fallback.
  - `database.py` — Mongo client singleton + startup index creation + super-admin seeding.

Routers are registered twice — under `/api` and at root — so the API works both behind the Vercel `/api/*` rewrite and when hit directly.

## Data model (MongoDB collections)

| Collection | Purpose | Notable indexes |
|---|---|---|
| `admins` | CMS users (role: `super_admin` / `admin`, status: `active` / `disabled`) | unique `email` |
| `events` | Events shown on the site | unique `id`, `date`, `status` |
| `event_registrations` | Free event sign-ups | unique `registrationId`, `(eventId, userId)` |
| `team` | Committee members (Team page) | — |
| `gallery` | Gallery images (Cloudinary URLs) | — |
| `mentors` | Faculty mentors (falls back to static data if empty) | — |
| `contact_messages` | Contact form inbox | `createdAt`, `status`, `email` |
| `settings` | Misc site settings (e.g. `_id: "contact"`) | — |

## Authentication flow

1. Admin clicks "Sign in with Google" on `/patidar/admin`; Google Identity Services returns an **ID token**.
2. Frontend POSTs it to `/api/auth/google`.
3. Backend verifies the token against `GOOGLE_CLIENT_ID`, requires a verified email, looks the email up in `admins` (must be `active`), and returns a **signed JWT (24 h)** + profile.
4. Frontend stores the JWT in `localStorage` and sends it as `Authorization: Bearer <jwt>` on admin requests.
5. Every protected endpoint re-checks the account still exists and is `active` — disabling an admin locks them out immediately, even with a valid token.

There is **no password login**. Access is granted by a super admin adding your Google email in the Admin panel.
