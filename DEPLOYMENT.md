# ShahVerse — Vercel Deployment Guide

## ──────────────────────────────────────
## BACKEND DEPLOYMENT (API)
## ──────────────────────────────────────

### Step 1 — Go to vercel.com → New Project
- Import from GitHub: `CodeAlpha_ShahVerse`
- **Root Directory:** `backend`
- **Framework Preset:** Other
- **Build Command:** (leave empty)
- **Output Directory:** (leave empty)
- **Install Command:** `npm install`

### Step 2 — Add Environment Variables in Vercel Dashboard:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | *(copy from backend/.env)* |
| `JWT_SECRET` | *(copy from backend/.env)* |
| `JWT_EXPIRE` | `30d` |
| `JWT_COOKIE_EXPIRE` | `30` |
| `STRIPE_SECRET_KEY` | *(copy from backend/.env)* |
| `STRIPE_PUBLISHABLE_KEY` | *(copy from backend/.env)* |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` |

### Step 3 — Deploy
- Click Deploy → note the backend URL (e.g. `https://shahverse-backend.vercel.app`)

---

## ──────────────────────────────────────
## FRONTEND DEPLOYMENT
## ──────────────────────────────────────

### Step 1 — New Project → same repo
- **Root Directory:** `frontend`
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Step 2 — Add Environment Variables in Vercel Dashboard:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-backend.vercel.app/api` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | *(copy from frontend/.env)* |

### Step 3 — Deploy
- After frontend deploy, update backend `FRONTEND_URL` to actual frontend URL
- Redeploy backend

---

## ──────────────────────────────────────
## AFTER DEPLOYMENT — Seed Database
## ──────────────────────────────────────

Run **once** locally after setting up env:
```bash
cd backend
node src/utils/seeder.js
```

### Admin: `shahzaibzaman465@gmail.com` / `admin123`
### User: `user@shahverse.com` / `user123456`

---

## Stripe Test Card:
```
Number : 4242 4242 4242 4242
Expiry : Any future date (e.g. 12/26)
CVC    : Any 3 digits (e.g. 123)
```
