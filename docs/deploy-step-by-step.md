# Deploy: Cloudflare Pages (Frontend) + Render (API) + Neon (Postgres)

This guide is written for non‑coders. Follow it exactly; you’ll have a live site with a stable API.

## Overview
- Frontend (React build) → Cloudflare Pages (free, global CDN)
- API (Node/Express) → Render Starter plan (~$7/mo, always on)
- Database → Neon Postgres (free starter)

## 0) Prerequisites
- Domain in Cloudflare (optional but recommended). If not, you can use Cloudflare Pages default domain.
- GitHub or GitLab account to connect repos (recommended). If not, both Cloudflare and Render allow manual deploys.

## 1) Database (Neon)
1. Go to neon.tech → Create account → “New Project”
2. Choose a region close to you
3. Copy the “Postgres connection string” (DATABASE_URL). It starts with `postgresql://...`

## 2) API (Render)
1. Go to render.com → New → Blueprint → “Use existing render.yaml”
2. Connect your repo and pick this repository
3. Render reads `render.yaml` at root and sets up the service:
   - Name: “imperiumx-api”
   - Root directory: `server`
   - Build command: installs and builds; runs `prisma migrate deploy`
   - Start command: `node dist/index.js`
4. Set Environment Variables (click the service after creation → Environment):
   - DATABASE_URL = paste Neon connection string
   - JWT_SECRET = generate a long random string (e.g., from 1Password or `openssl rand -hex 32`)
   - FRONTEND_ORIGIN = https://YOUR_FRONTEND_DOMAIN (e.g., https://imperiumx.pages.dev or your custom domain)
   - GRAND_REOPENING_PROMO = true
5. Click “Manual Deploy” → “Deploy latest commit”
6. When it starts, verify Health Check passes at /api/health (linked in the Render dashboard). Copy the API base URL (e.g., https://imperiumx-api.onrender.com).

## 3) Frontend (Cloudflare Pages)
1. Go to dash.cloudflare.com → Pages → Create Project
2. Connect to your repo or “Upload assets” later
3. Framework preset: “None”
4. Build settings:
   - Build command: `npm ci && npm run build`
   - Output directory: `dist`
   - Environment variable (Production):
     - VITE_API_URL = https://YOUR_RENDER_HOST/api
       Example: https://imperiumx-api.onrender.com/api
5. Ensure SPA fallback is enabled:
   - This repo includes `public/_redirects` with `/* /index.html 200`. Cloudflare Pages will pick it up automatically.
6. Deploy
7. After deploy, open the assigned pages.dev URL.

## 4) Domain + CORS
1. If you have a custom domain, add it to Cloudflare Pages → follow DNS steps
2. Update Render service → Environment → FRONTEND_ORIGIN to the final domain (e.g., https://imperiumx.com)
3. Redeploy the Render service (so CORS picks up the new origin)

## 5) Verify Features
1. Visit your site
2. Login/Register:
   - Registration supports referral code (6–12 characters). Code is validated when the backend is reachable and re‑checked on submit.
3. Payments flow (staff only confirms):
   - Confirming payment creates an order and credits points. Referral commission is credited automatically on a referred user’s first completed order.
4. Browse manager (CEO):
   - “Add New Account” lets you create products. If your `/api/accounts` routes aren’t live yet, the app saves to local storage and shows “Account created (saved locally)”. Once you enable the backend routes, creations will persist in the database.

## 6) Optional: API Proxy (No CORS)
Instead of VITE_API_URL, you can proxy `/api/*` from Cloudflare Pages Functions to your Render API to avoid CORS. If you want this, tell me and I’ll add a small Functions scaffold.

## 7) Operations
- Backups: Enable automated backups in Neon (project settings)
- Monitoring: Add a free UptimeRobot check for the Render health endpoint
- Scaling: If traffic grows, bump Render plan; Pages and Neon scale seamlessly

## 8) Troubleshooting
- Frontend 200 but API 404: Verify VITE_API_URL is set correctly in Cloudflare Pages and redeploy.
- CORS error from API: Ensure FRONTEND_ORIGIN is your final domain (including https://).
- Referral validation says “Invalid”: After adding the new endpoint, redeploy server; also ensure your code exists on the user record (Profile → Referral shows the code).

## Notes on Backend Endpoints
This repo now includes:
- GET /api/referral/validate?code=CODE → { valid: boolean }
- POST /api/referral/credit { purchaseId } → idempotent “credit if not already created”; safe to call.

For a production “Accounts” feature, I can add a proper Prisma model + routes so products persist in Neon instead of local storage. Say the word and I’ll implement it.

