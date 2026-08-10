# Local Development Setup

Guide for running the ISTE MITS website on your own machine.

## Prerequisites

| Tool | Version | Check with |
|---|---|---|
| Node.js | 20+ | `node -v` |
| Python | 3.11+ | `python --version` |
| Git | any recent | `git --version` |

You do **not** need a local MongoDB — use the shared MongoDB Atlas cluster (ask the team lead for the connection string), or run a local `mongod` if you prefer full isolation.

## 1. Clone the repository

```bash
git clone https://github.com/istemitsgwl/ISTE-Web.git
cd ISTE-Web
```

## 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev          # starts http://localhost:5173
```

The dev server proxies nothing — API calls default to `/api`, which only works in production. For local development create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=<ask the team lead>
```

## 3. Backend (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

pip install -r requirements.txt
```

Create `backend/.env` by copying the template and filling in values:

```bash
copy .env.example .env       # Windows (cp on macOS/Linux)
```

At minimum set `MONGODB_URI`. If you leave `JWT_SECRET_KEY` empty, a random one is generated per run (logins reset on every restart — fine for dev). Then:

```bash
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: http://localhost:8000/docs

## 4. Verify everything works

- Frontend: http://localhost:5173 loads the homepage.
- Backend: http://localhost:8000/api/health returns `{"status": "healthy", ...}`.
- Contact form on `/contact` submits successfully (stores in MongoDB).

## Quality checks before committing

```bash
# Frontend — must pass
cd frontend && npm run build

# Backend — syntax check (no venv needed)
python -m compileall backend/app -q

# Backend tests (needs venv with deps installed)
cd backend && python -m pytest tests/ -v
```

## Common issues

- **`npm run dev` works but API calls fail** → you forgot `frontend/.env.local` with `VITE_API_URL`.
- **Google login fails locally** → `http://localhost:5173` must be listed in the Google OAuth client's *Authorized JavaScript origins*, and your email must exist in the `admins` collection.
- **MongoDB connection refused** → your IP isn't whitelisted in Atlas (Network Access → Add IP), or the URI password contains unescaped special characters.
