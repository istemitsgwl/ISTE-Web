# Admin / CMS Guide

For chapter members who manage site content — no coding needed.

## Logging in

1. Go to **`/patidar/admin`** (the login page; `/login` redirects there).
2. Click **Sign in with Google** and use the Google account that a super admin has registered for you.
3. You land on the dashboard at `/admin/dashboard`.

If you see *"You are not authorized to access the Admin Portal"*, your email isn't registered (or was disabled) — ask a super admin to add you.

Sessions last **24 hours**, then you sign in again.

## Roles

| Role | Can do |
|---|---|
| `admin` | Manage events, gallery, team members, contact inbox |
| `super_admin` | Everything above **plus** add/remove/disable admins and change roles |

Safety rails: you cannot demote/disable/delete your own account, and the last active super admin can never be removed.

## Managing admins (super admin only)

Dashboard → **Admins** tab:

- **Add admin:** enter their Gmail address, name, and role. They can sign in immediately with Google.
- **Disable:** blocks access instantly (even mid-session). Re-enable any time.
- **Promote/demote:** switch between `admin` and `super_admin`.

## Managing events

Dashboard → **Events** tab:

- **Create:** title, category, date, venue, description, status (`upcoming`/`completed`), and a banner image (upload a file or paste an image URL — it's stored on Cloudinary automatically).
- **Edit:** click an event's edit button; the form pre-fills.
- **Delete:** removes the event and its banner image.
- **Registrations** are free; students sign in and register from the public Events page. Capacity (if set) is enforced automatically.

## Managing the team page

Dashboard → **Team** tab: add members with name, role, committee, optional email/LinkedIn, and a profile photo (required for new members). Committees display on the public Team page in a fixed order; unknown committee names appear after the standard ones.

## Managing the gallery

Dashboard → **Gallery** tab: upload images with a title and category. Newest images show first on the public Gallery page. Deleting removes the image from Cloudinary too.

## Contact inbox

Dashboard → **Messages** tab: every public contact-form submission appears here (and is also emailed to the notification address). You can search, filter by read/unread, mark read, and delete. Visitors are rate-limited to 5 messages per minute to prevent spam.

## Good practices

- Prefer image uploads under ~1 MB — they load faster on the public site.
- Don't share your Google account; admin actions are logged under your email.
- If a laptop with a logged-in session is lost, a super admin should **disable** that account — this revokes access immediately.
