# Deployment

How the site ships to production, and how to operate it.

## Where things live

| Thing | Location |
|---|---|
| Production project | Vercel project **iste-web** (team `istemitsgwl`) |
| Deployed from | GitHub `istemitsgwl/ISTE-Web`, branch `main` |
| Mirror repo | GitHub `ShivamPatidar03/ISTE-MITS-website` (keep both in sync) |
| Live URL | https://iste-web-dyis.vercel.app → custom domain **https://iste.mitsgwalior.in** |
| Database | MongoDB Atlas cluster `ISTE-Cluster` |
| Images | Cloudinary |

Every push to `main` on `istemitsgwl/ISTE-Web` triggers an automatic production deploy. **Always push to both remotes:**

```bash
git push istemits main   # deploys
git push origin main     # keeps the mirror in sync
```

## Vercel multi-service configuration

The root `vercel.json` uses Vercel **Services** (beta): one project, two services.

- `frontend` — Vite static build from `frontend/`. Contains its own SPA-fallback rewrite (`/(.*) → /index.html`) **inside the service block** — this is required; deep links 404 without it.
- `backend` — FastAPI from `backend/`, entrypoint `main.py` (which re-exports `app.main:app`).
- Top-level rewrites: `/api/*` → backend, everything else → frontend.
- Security headers are set top-level for all responses.

Things we learned the hard way (don't re-learn them):

1. **`frontend/vercel.json` is ignored** in services mode. Per-service rewrites/headers must live in the *root* `vercel.json` inside the service object.
2. **Routing into a service is final.** If a path doesn't match inside the service, Vercel returns that service's 404 — it never falls back to later top-level rules.
3. The backend service **requires an explicit `entrypoint`** — auto-detection alone fails the build.

## Environment variables

Set in Vercel → Project → Settings → Environment Variables (one shared list for both services). The full key list with descriptions is in [`backend/.env.example`](../backend/.env.example). Summary:

| Key | Used by | Notes |
|---|---|---|
| `MONGODB_URI`, `MONGODB_DB_NAME` | backend | Atlas connection |
| `JWT_SECRET_KEY` | backend | **Required.** Random 48+ chars. Rotating it logs every admin out. |
| `GOOGLE_CLIENT_ID` | backend | Must match the frontend's client ID |
| `SUPER_ADMIN_EMAIL` | backend | Bootstrap super-admin (auto-seeded) |
| `ALLOWED_ORIGINS`, `FRONTEND_URL` | backend | Production origin(s) for CORS |
| `CLOUDINARY_*` (3 keys) | backend | Image CDN credentials |
| `RESEND_API_KEY`, `NOTIFICATION_EMAIL` | backend | Contact-form email alerts (optional) |
| `VITE_API_URL` | frontend build | `/api` in production (same-domain routing) |
| `VITE_GOOGLE_CLIENT_ID` | frontend build | Google OAuth client ID |

**Env changes only apply on the next deploy** — redeploy after editing them.

## Custom domain checklist

When attaching `iste.mitsgwalior.in`:

1. Vercel → Settings → Domains → add `iste.mitsgwalior.in`; create the CNAME it shows in the `mitsgwalior.in` DNS panel.
2. Update `ALLOWED_ORIGINS` and `FRONTEND_URL` env vars to the new URL; redeploy.
3. Google Cloud Console → the OAuth client → add the domain to **Authorized JavaScript origins**.
4. Google Search Console → add the property, verify, submit `https://iste.mitsgwalior.in/sitemap.xml`.

## Rollback

Vercel → Deployments → pick the last good deployment → ⋯ → **Promote to Production**. This is instant and doesn't touch git. Then fix forward in git as usual.

## Health monitoring

- `GET /api/health` — overall + DB connectivity and latency.
- Vercel dashboard → Logs shows backend logs (all 5xx details are logged there, never returned to clients).
