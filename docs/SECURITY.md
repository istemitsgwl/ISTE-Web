# Security Practices

What protects this site, and the rules to keep it that way. Last hardening pass: **August 2026**.

## Current protections

- **Authentication:** Google OAuth only — no passwords to leak. The backend verifies Google ID tokens server-side (`GOOGLE_CLIENT_ID` audience + verified email) and issues its own 24-hour JWT signed with `JWT_SECRET_KEY` from the environment.
- **Authorization:** every protected endpoint re-validates the account against MongoDB on each request (`active` status + role), so disabling an admin takes effect immediately. Super-admin-only routes are enforced server-side (`require_super_admin`).
- **Rate limiting** (`app/rate_limit.py`, per IP, sliding window): Google login 10/min, contact form 5/min, event registration 10/min. Responses include `Retry-After`. State is per-instance — acceptable at our scale; move to Redis/Upstash if the site ever scales to many instances.
- **Input hygiene:**
  - Pydantic validation on all structured bodies (lengths, email formats, patterns).
  - Contact-form fields are HTML-escaped before storage; the email subject is stripped of CR/LF (header-injection protection).
  - Admin inbox search is `re.escape`d — no user-controlled regex (NoSQL-injection / ReDoS).
  - Event updates apply a **field whitelist**; free-form registration answers are stripped of Mongo operator keys (`$…`, dotted) and size-capped.
  - Event capacity is claimed atomically (no overbooking race).
- **Error handling:** clients get generic messages; real exception details go to server logs only. Health endpoints don't leak connection strings.
- **CORS:** explicit origin allow-list from `ALLOWED_ORIGINS`; wildcard (if ever set) automatically disables credentials.
- **Security headers** on every response (API middleware + Vercel headers): `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS.
- **SEO/robots:** admin routes are `noindex` and disallowed in `robots.txt`.

## Rules for contributors

1. **Never commit secrets.** All credentials come from environment variables; `.env` is git-ignored. If a secret lands in a commit — even briefly — treat it as compromised and rotate it.
2. **Never weaken the auth dependencies.** New admin endpoints must use `require_admin` / `require_super_admin`; new user endpoints use `get_current_user`.
3. **Rate-limit anything public that writes** (forms, registrations): add a `RateLimiter(...)` dependency.
4. **Don't return raw exceptions** to clients — `logger.exception(...)` + a generic `HTTPException` message.
5. **Whitelist, don't blacklist** when accepting update payloads into MongoDB.
6. **No password-based login endpoints.** The old passwordless `admin-login` endpoint was removed for a reason (it allowed full account takeover); don't reintroduce shortcuts "for testing".

## Incident response

- **Compromised admin account** → super admin disables it in the dashboard (immediate lockout), then investigates.
- **Leaked `JWT_SECRET_KEY`** → set a new random value in Vercel env and redeploy; all sessions are invalidated.
- **Leaked DB/Cloudinary/Resend credentials** → rotate in the respective dashboard, update Vercel env, redeploy.
- **Spam floods** → rate limits absorb bursts; for sustained attacks enable Vercel's WAF / firewall rules on the project.

## Known accepted trade-offs

- JWT stored in `localStorage` (standard SPA pattern; mitigated by 24 h expiry + server-side status checks). A future improvement is an HttpOnly cookie flow.
- No Content-Security-Policy header yet (would need careful allow-listing of Google/Cloudinary/fonts before enabling).
- In-memory rate limiter is per serverless instance, not global.
