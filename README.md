# ISTE Student's Chapter MITS-DU Websit

Official website of the **Indian Society for Technical Education (ISTE) Student's Chapter, MITS-DU Gwalior** — public site + CMS admin portal.

🌐 **Live:** https://iste.mitsgwalior.in

## 📚 Team Documentation

| Doc | Read it when you want to… |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | Run the project locally |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Understand how frontend, backend, and data fit together |
| [docs/API.md](docs/API.md) | Call or extend the REST API |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploy, manage env vars, custom domain, rollback |
| [docs/ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) | Use the CMS (events, gallery, team, inbox) — non-technical |
| [docs/SECURITY.md](docs/SECURITY.md) | Follow the security rules & handle incidents |

## 🛠️ Tech Stack

- **Frontend:** React 19 (Vite), TypeScript, Tailwind CSS 4, Framer Motion, GSAP, Three.js/OGL, Zustand, React Router 7
- **Backend:** FastAPI (Python), Motor (async MongoDB), PyJWT, google-auth
- **Data & services:** MongoDB Atlas · Cloudinary (images) · Google OAuth 2.0 (admin auth) · Resend/SMTP (email alerts)
- **Hosting:** Vercel (multi-service: static frontend + Python backend in one project)

## 📁 Project Structure

```
ISTE-Web/
├── frontend/               # React + Vite TypeScript app
│   ├── src/pages/          # Public pages + Admin CMS
│   ├── src/components/     # UI, animations, Seo component
│   ├── src/store/          # Zustand auth store
│   └── public/             # robots.txt, sitemap.xml, static assets
│
├── backend/                # FastAPI app
│   ├── app/routes/         # REST endpoints (auth, events, content, contact…)
│   ├── app/schemas/        # Pydantic validation
│   ├── app/rate_limit.py   # Per-IP rate limiting
│   ├── main.py             # Vercel service entrypoint
│   └── .env.example        # All required environment variables
│
├── docs/                   # Team documentation (start here)
└── vercel.json             # Multi-service routing + security headers
```

## ⚡ Quick Start

```bash
# Frontend
cd frontend && npm install && npm run dev      # http://localhost:5173

# Backend (separate terminal)
cd backend
python -m venv venv && venv\Scripts\activate   # source venv/bin/activate on macOS/Linux
pip install -r requirements.txt
copy .env.example .env                         # fill in MONGODB_URI at minimum
uvicorn app.main:app --reload --port 8000      # http://localhost:8000/docs
```

Full instructions (env vars, Google login locally, checks before committing): [docs/SETUP.md](docs/SETUP.md).

## 🔀 Contributing Workflow

1. Branch from `main`, make changes, and verify: `npm run build` (frontend) and `python -m compileall backend/app -q` (backend).
2. Follow the rules in [docs/SECURITY.md](docs/SECURITY.md) — never commit secrets, always auth-guard and rate-limit new endpoints.
3. Merge to `main` and push to **both** remotes (deploys automatically from `istemits`):
   ```bash
   git push istemits main
   git push origin main
   ```

## 👨‍💻 Web Team

- **Shivam Patidar** — Lead Developer & Architect
- **Ayan Ahmed Khan** — Deployment & Security Engineer

*Guided by the faculty mentors of the ISTE Student's Chapter, MITS-DU Gwalior.*
