# API Reference

Base URL: `https://iste.mitsgwalior.in/api` (production) · `http://localhost:8000/api` (local).
Interactive docs with schemas: `/docs` on the backend.

**Auth:** endpoints marked 🔑 require `Authorization: Bearer <JWT>` (from Google login). 🔐 additionally require the `super_admin` role.
**Rate limits** are per IP; exceeding them returns `429` with a `Retry-After` header.

## Authentication

| Method & path | Auth | Notes |
|---|---|---|
| `POST /auth/google` | — | Body `{ "id_token": "<google id token>" }`. Verifies with Google, returns `{ access_token, token_type, user }`. Only emails present & active in `admins` succeed. **10 req/min.** |
| `GET /users/profile` | 🔑 | Current admin's profile. |
| `PUT /users/profile` | 🔑 | Update own profile (name, phone, college, branch, year, enrollmentNo — validated). |

## Admin account management (RBAC)

| Method & path | Auth | Notes |
|---|---|---|
| `GET /v1/admins` | 🔐 | List all admin accounts. |
| `GET /v1/admins/{id}` | 🔐 | Single account. |
| `POST /v1/admins` | 🔐 | Body `{ email, name, role }`; role `admin` or `super_admin`. |
| `PATCH /v1/admins/{id}` | 🔐 | Update name/role. Can't demote yourself. |
| `PATCH /v1/admins/{id}/status` | 🔐 | `{ "status": "active" \| "disabled" }`. Can't disable yourself or the last super admin. |
| `PATCH /v1/admins/{id}/role` | 🔐 | `{ "role": "super_admin" \| "admin" }`. Same self/last-admin protections. |
| `DELETE /v1/admins/{id}` | 🔐 | Permanent. Same protections. |

## Events

| Method & path | Auth | Notes |
|---|---|---|
| `GET /events` | — | All events, newest first. |
| `GET /events/{eventId}` | — | Single event (accepts our `id` or Mongo `_id`). |
| `POST /events` | 🔑 admin | Create. Base64 `bannerImage` (`data:image/...`) is uploaded to Cloudinary automatically. |
| `PUT /events/{eventId}` | 🔑 admin | Update. Only whitelisted fields are applied (title, desc, category, date, venue, status, images, speakers, customFieldsSchema, maxParticipants, …). |
| `DELETE /events/{eventId}` | 🔑 admin | Also deletes the Cloudinary banner. |
| `POST /events/{eventId}/register` | 🔑 | Free registration. Body = answers object for the event's custom fields. Capacity is enforced atomically; duplicate registration returns the existing one. **10 req/min.** |

## Content

| Method & path | Auth | Notes |
|---|---|---|
| `GET /content/mentors` | — | Faculty mentors (static fallback if DB empty). |
| `GET /content/committees` | — | Team members grouped by committee, in display order. |
| `GET /content/team` | — | Flat member list (used by CMS). |
| `POST /content/team` | 🔑 admin | Multipart form: `name`, `role`, `committee`, optional `email`, `linkedin`, and image as `file` upload **or** `imageUrl`. Pass `id` to update an existing member. |
| `DELETE /content/team/{memberId}` | 🔑 admin | Removes member + Cloudinary image. |
| `GET /content/gallery` | — | Gallery, newest first. |
| `POST /content/gallery` | 🔑 admin | Multipart form: `title`, `category`, image as `file` or `imageUrl`. |
| `PUT /content/gallery/{imageId}` | 🔑 admin | Update title/category/image. |
| `DELETE /content/gallery/{imageId}` | 🔑 admin | Removes item + Cloudinary image. |
| `GET /content/faqs` | — | Static FAQ list. |
| `GET /content/contact` | — | Chapter contact details. |

## Contact form & inbox

| Method & path | Auth | Notes |
|---|---|---|
| `POST /contact` | — | Body `{ name, email, subject, message }` (validated lengths). Stores message, emails the notification address. **5 req/min per IP.** |
| `GET /admin/contact` | 🔑 admin | Inbox with `search`, `status` (`All/Unread/Read`), `page`, `limit` query params. Returns messages + counts. |
| `GET /admin/contact/{id}` | 🔑 admin | Single message. |
| `PATCH /admin/contact/{id}/read` | 🔑 admin | Toggle or set read status (`?status=read|unread`). |
| `DELETE /admin/contact/{id}` | 🔑 admin | Delete message. |

## Health

| Method & path | Auth | Notes |
|---|---|---|
| `GET /health` | — | `{ status, mongodb_connected, latency_ms }`. |
| `GET /health/mongodb` | — | DB ping with latency. |

## Error shape

Errors return FastAPI's standard body:

```json
{ "detail": "Human-readable message" }
```

Common statuses: `401` bad/expired token, `403` insufficient role or unauthorized email, `404` not found, `422` validation error, `429` rate-limited, `500` server error (details are in server logs, never in the response).
