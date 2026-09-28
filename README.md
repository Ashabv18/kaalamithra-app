# KAALA MITHRA — Backend API

Express + PostgreSQL backend for the KAALA MITHRA app (`kaalamithra-app`).

## Quick start

```bash
npm install
copy .env.example .env   # then edit DATABASE_URL / JWT_SECRET
node run_migrations.js
node server.js
```

Server runs on `http://localhost:5000` by default.

## Main files

- `server.js` — Express app entrypoint
- `routes/` — `auth.js`, `admin.js`, `client.js`
- `middleware/auth.js` — JWT auth helpers
- `migrations/` — SQL migrations (`node run_migrations.js`)
- `public/` — static frontend assets served by the API (if present)

## Env vars (see `.env.example`)

- `PORT`, `DATABASE_URL`, `JWT_SECRET`, `ADMIN_SETUP_KEY`
- `FRONTEND_URL` (or `CORS_ORIGINS`) — deployed frontend origin(s) for CORS
- `NODE_ENV=production` on Vercel (enables SSL pool + Secure cookies)

## Run the full app locally (backend + logo frontend)

```bash
node run_app.js              # starts backend :5000 + frontend :5500 (detached, logs to run-*.log)
node scripts/check_running.js  # verify: /api/health + /welcome + app/index.html + km-logo.png all 200
```

- Backend API: `http://127.0.0.1:5000` (`/welcome`, `/login`, `/api/health`)
- Logo frontend (patched file, NOT in this repo):
  `C:\Users\Lenovo\Downloads\kaalamithra-complete (1)\kaalamithra-complete\app\index.html`
  served at `http://127.0.0.1:5500/kaalamithra-complete/app/`
  (`images/km-logo.png` = real logo; `backend/public/login.html` is only the K-box page).
- Local DB: `kaalamithra_db` (`users=24`, `inquiries=4` as of 2026-09-28;
  `admin@kaalamithra-ai.com` active). Vercel uses a separate hosted
  `DATABASE_URL`, so counts differ there by design.

## Deploying on Vercel (same repo serves API + pages)

1. `git push origin main` (includes `vercel.json`, `api/index.js`, `lib/`).
2. Vercel Dashboard → Project → Settings → Environment Variables
   (Production + Preview):
   - `DATABASE_URL` — **hosted** Postgres URL (Neon / Supabase / Vercel
     Postgres). Vercel cannot reach `localhost`, so the local
     `postgres://...@localhost:5432/...` value must NOT be reused.
   - `JWT_SECRET`, `ADMIN_SETUP_KEY`
   - `FRONTEND_URL=https://kaalamithra-app.vercel.app`
   - `NODE_ENV=production`
3. Create tables in the hosted DB once:
   `DATABASE_URL=<hosted-url> node run_migrations.js`
   (or run the two files in `migrations/` in the provider SQL editor).
4. Redeploy, then verify:
   - `GET /api/health` → `{"success":true,"db":"connected",...}`
   - `GET /api/auth/me` → `401` (not a CORS error, not a 500)
   - Login works. If `/api/health` says `DATABASE_URL is not set`,
     the env var is missing on that deployment.
