# ApplyAI — Phase 1 Setup Guide

AI-powered resume screening, job matching, and automated applications.

---

## Tech stack

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind v4 | Vercel (free) |
| Backend | Python 3.13 + FastAPI | Render (free) |
| Database + Auth + Storage | Supabase | Supabase (free) |
| Email | Resend + Cloudflare Email Routing | — |
| Jobs API | JSearch (RapidAPI) | — |
| AI | Claude API (mocked in Phase 1) | — |

---

## Prerequisites

- Node.js 20+ (`node -v`)
- Python 3.13 (`python3 --version`)
- A [Supabase](https://supabase.com) account (free)
- A [Vercel](https://vercel.com) account (free)
- A [Render](https://render.com) account (free)
- Git

---

## STEP 1 — Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Pick a name (e.g. `applyai`), set a strong DB password, choose a region close to you
3. Wait ~2 min for provisioning
4. Open **SQL Editor** → paste the entire contents of `supabase/schema.sql` → click **Run**
5. Verify: go to **Table Editor** — you should see 6 tables: `users`, `resumes`, `job_applications`, `job_matches`, `email_threads`, `interview_sessions`
6. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret, never expose to browser)

> **Email confirmation**: For development, go to **Authentication → Providers → Email** and **disable** "Confirm email". This lets you test signup/login without checking your inbox every time. Re-enable before going to production.

---

## STEP 2 — Set up the Next.js frontend

```bash
# From the repo root
cp .env.local.example .env.local
```

Edit `.env.local` and paste the three Supabase values from Step 1:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the landing page.

**Test the auth flow:**
1. Click **Get started free** → fill in the signup form
2. You should be redirected to `/dashboard`
3. Refresh the page — you should stay logged in
4. Click **Sign out** in the sidebar → you should be redirected to the home page
5. Try going to `/dashboard` while logged out → should redirect to `/login`

---

## STEP 3 — Set up the Python backend

```bash
cd backend

# Create a virtual environment
python3 -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and fill in env vars
cp .env.example .env
```

Edit `backend/.env`:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
FRONTEND_URL=http://localhost:3000
USE_MOCK_AI=true
```

Run the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

Open [http://localhost:8000/docs](http://localhost:8000/docs) — you should see the FastAPI Swagger UI with `/health`, `/resume/parse`, and `/jobs/match` endpoints.

Test the health endpoint:
```bash
curl http://localhost:8000/health
# {"status":"ok","service":"applyai-api"}
```

---

## STEP 4 — Deploy frontend to Vercel

```bash
# Push to GitHub first
git init
git add .
git commit -m "feat: Phase 1 foundation"
git remote add origin https://github.com/YOUR_USERNAME/applyai.git
git push -u origin main
```

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your GitHub repo
2. Framework: **Next.js** (auto-detected)
3. Add environment variables (same as `.env.local` but with your production URL):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` → your Vercel URL (e.g. `https://applyai.vercel.app`)
   - `NEXT_PUBLIC_API_URL` → leave as `http://localhost:8000` for now, update after Render deploy
4. Click **Deploy**

**Update Supabase redirect URLs:**
- Go to Supabase → **Authentication → URL Configuration**
- Add your Vercel URL to **Site URL**: `https://applyai.vercel.app`
- Add to **Redirect URLs**: `https://applyai.vercel.app/auth/callback`

---

## STEP 5 — Deploy backend to Render

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build command**: `pip install -r requirements.txt`
   - **Start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_URL` → your Vercel URL
   - `USE_MOCK_AI` → `true`
5. Click **Create Web Service**

Once deployed, copy the Render URL (e.g. `https://applyai-api.onrender.com`) and update:
- Vercel env var `NEXT_PUBLIC_API_URL` → Render URL
- Redeploy Vercel

> **Free tier note**: Render free tier spins down after 15 min of inactivity. First request after sleep takes ~30s. This is fine for development; upgrade to the $7/mo plan when you go live.

---

## Phase 1 checklist

- [ ] Next.js runs locally without errors (`npm run dev`)
- [ ] Supabase: all 6 tables exist with correct columns and foreign keys
- [ ] Signup creates a row in the `users` table (check Table Editor)
- [ ] Login redirects to `/dashboard`
- [ ] Logout redirects to `/`
- [ ] Unauthenticated access to `/dashboard` redirects to `/login`
- [ ] Dashboard loads with sidebar (Overview, Resume, Jobs, Applications, Interview Prep)
- [ ] FastAPI running at `http://localhost:8000` with `/docs` accessible
- [ ] Vercel deployment live and auth works on the live URL
- [ ] Render deployment live and `/health` returns 200

---

## Project structure

```
applyai/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx          # Auth card wrapper
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # Sidebar + auth guard
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── resume/page.tsx
│   │   │   ├── jobs/page.tsx
│   │   │   ├── applications/page.tsx
│   │   │   └── interview/page.tsx
│   │   ├── auth/callback/route.ts  # Supabase OAuth callback
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Landing page
│   │   └── globals.css
│   ├── components/ui/
│   │   └── Sidebar.tsx
│   ├── lib/supabase/
│   │   ├── client.ts               # Browser client
│   │   └── server.ts               # Server component client
│   └── middleware.ts               # Route protection
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app + CORS
│   │   ├── config.py               # Settings (pydantic-settings)
│   │   ├── routers/
│   │   │   ├── health.py
│   │   │   ├── resume.py
│   │   │   └── jobs.py
│   │   └── services/
│   │       └── ai_service.py       # Mock AI — one flag switches to real
│   ├── requirements.txt
│   └── .env.example
├── supabase/
│   └── schema.sql                  # Run this in Supabase SQL Editor
├── .env.local.example
├── render.yaml
└── README.md
```

---

## Common issues

**"relation users does not exist"**
→ You forgot to run `supabase/schema.sql`. Open Supabase SQL Editor and run it.

**Signup works but no row in `users` table**
→ The `handle_new_user` trigger didn't fire. Re-run the schema SQL — make sure the trigger block ran without errors.

**Infinite redirect loop on `/dashboard`**
→ Your Supabase URL or anon key in `.env.local` is wrong. Double-check for trailing spaces.

**Backend CORS error in browser**
→ `FRONTEND_URL` in `backend/.env` must exactly match your Next.js origin (no trailing slash).

**Render deploy fails with Python version error**
→ Add a `runtime.txt` file in `backend/` containing `python-3.13.9`.

---

## What's next — Phase 2

Resume upload to Supabase Storage, PDF/DOCX text extraction, and wiring the parse endpoint to the real Claude API.
