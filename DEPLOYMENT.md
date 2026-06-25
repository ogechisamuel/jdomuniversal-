# JDOM UNIVERSAL CONCEPT LTD — Deployment Guide

A complete deployment playbook for the JDOM customs-clearing platform.

## Stack

- **Backend**: FastAPI (Python 3.11) + Motor (MongoDB async driver) + bcrypt + PyJWT + SendGrid
- **Frontend**: React 19 + react-router-dom v7 + Tailwind + shadcn/ui (built with CRACO + yarn)
- **Database**: MongoDB 5+ (Atlas free-tier works)
- **Email**: SendGrid (sender domain `jdomuniversal.online` verified)
- **File uploads**: stored as base64 inside MongoDB documents (no separate object store needed)

---

## 1. Pre-flight — what you need

| Item | Where to get it |
|---|---|
| MongoDB connection string | [MongoDB Atlas](https://cloud.mongodb.com) → free M0 cluster → "Connect" → "Drivers" → copy URI |
| SendGrid API key | [app.sendgrid.com](https://app.sendgrid.com) → Settings → API Keys → Full Access → starts with `SG.` |
| Verified sender | SendGrid → Sender Authentication → verify `noreply@jdomuniversal.online` (already done) |
| Domain DNS | Cloudflare / Namecheap / etc. to point `api.jdomuniversal.online` → backend host, `jdomuniversal.online` → frontend host |

---

## 2. Configuration — environment variables

### Backend (`backend/.env`) — see `backend/.env.example`

```env
MONGO_URL=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?retryWrites=true&w=majority
DB_NAME=jdom_production
JWT_SECRET=<run: python -c "import secrets; print(secrets.token_hex(32))">
ADMIN_EMAIL=admin@jdomuniversal.online
ADMIN_PASSWORD=<a-strong-password>
SENDGRID_API_KEY=SG.xxxxx.yyyyy
SENDER_EMAIL=noreply@jdomuniversal.online
ADMIN_NOTIFICATION_EMAIL=admin@jdomuniversal.online
FRONTEND_URL=https://jdomuniversal.online
CORS_ORIGINS=*
```

> **Never commit `.env`**. Use your platform's secret manager.

### Frontend (`frontend/.env`) — see `frontend/.env.example`

```env
REACT_APP_BACKEND_URL=https://api.jdomuniversal.online
```

> Set this **at build time** — React inlines it into the bundle. Re-build after any change.

---

## 3. Local dry-run with Docker Compose

The fastest way to verify everything works end-to-end before deploying:

```bash
# From repo root
cp backend/.env.example backend/.env  # then fill in real values
docker-compose up --build
```

Once started:
- Frontend → http://localhost:3000
- Backend → http://localhost:8001/api/
- Mongo → mongodb://root:changeme@localhost:27017

The admin account is **auto-seeded** on first backend startup using `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

---

## 4. Production deployment options

### Option A — Render (one-click, recommended for simplicity)

1. **MongoDB**: Use MongoDB Atlas (free M0 tier) — connection string into `MONGO_URL`.
2. **Backend**: Render → New → Web Service → connect repo → root dir `backend/` → Dockerfile detected → add env vars from `.env.example`.
3. **Frontend**: Render → New → Static Site → root dir `frontend/` → build command: `yarn install && yarn build` → publish dir: `build` → env var: `REACT_APP_BACKEND_URL=<backend-url>`.
4. Add the SPA rewrite rule on Render: `/* → /index.html` (200).

### Option B — Railway

1. Create a new project, add **MongoDB** plugin (auto-injects `MONGO_URL`).
2. Deploy backend from `backend/` directory — Railway detects the Dockerfile. Inject env vars.
3. Deploy frontend from `frontend/` — same Dockerfile + `REACT_APP_BACKEND_URL` build arg.

### Option C — Vercel (frontend) + Fly.io / Render (backend)

1. Frontend → Vercel → import repo → set root to `frontend/`, build command `yarn build`, output dir `build`. Env var `REACT_APP_BACKEND_URL`.
2. Backend → Fly.io (`fly launch`) or Render Web Service from `backend/Dockerfile`.

### Option D — Self-host (VPS, Hetzner / DigitalOcean / etc.)

1. Install Docker + docker-compose.
2. `git clone` your repo, fill in `backend/.env`.
3. Edit `docker-compose.yml` and set `REACT_APP_BACKEND_URL` build arg to your real backend URL.
4. Put a reverse proxy (Caddy or Nginx) in front of ports 3000 + 8001 for HTTPS + custom domains. Caddy auto-renews Let's Encrypt:
   ```
   jdomuniversal.online {
     reverse_proxy localhost:3000
   }
   api.jdomuniversal.online {
     reverse_proxy localhost:8001
   }
   ```

---

## 5. Post-deployment checklist

- [ ] Visit `<backend>/api/` → should return `{"service":"jdom-universal","ok":true}`
- [ ] Visit `<frontend>/` → homepage renders with logo + hero
- [ ] Login as admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) → dashboard sidebar shows admin links
- [ ] Submit a test lead from the homepage form → confirm admin notification email arrives
- [ ] Open Admin → Overview → enable Daily Digest + Weekly Summary if desired
- [ ] Test password-reset flow end-to-end (request → click email link → set new password)
- [ ] Verify WhatsApp floating button opens `https://wa.me/2347064556109` with prefilled text
- [ ] Update Templates in Admin → Templates to match your house style

---

## 6. DNS

| Record | Type | Value |
|---|---|---|
| `jdomuniversal.online` | CNAME / A | → your frontend host |
| `api.jdomuniversal.online` | CNAME / A | → your backend host |
| `files.jdomuniversal.online` | CNAME / A | → your static-PDF host (already pointing to the resource PDFs) |
| SPF / DKIM | TXT | from SendGrid Sender Authentication |

---

## 7. Security / housekeeping

- Rotate `JWT_SECRET` and `ADMIN_PASSWORD` after first login.
- Lock down `CORS_ORIGINS` to your real domains in production (replace `*`).
- Enable MongoDB Atlas IP allowlist (or VPC peering).
- Take a Mongo Atlas backup snapshot weekly (Atlas does this automatically on M2+).
- The platform stores client documents (PAAR, BOL, Form M, Proforma) **base64-encoded inside MongoDB documents** — make sure your Mongo plan can handle the document size growth (M0 free tier is 512 MB).

---

## 8. Troubleshooting

| Symptom | Fix |
|---|---|
| `401 Unauthorized` on every API call | Check `REACT_APP_BACKEND_URL` matches your actual backend URL (and was set at **build time**) |
| Emails don't arrive | Check SendGrid → Activity log. Sender must be verified. `SENDGRID_API_KEY` must start with `SG.` |
| Admin login fails | `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars run the seed on every restart — if the email already exists it syncs the password from env |
| Daily digest doesn't fire | UTC time matters — set the hour in UTC, not local time. Check backend logs for `Daily digest fired:` |
| Login redirects to importer dashboard instead of admin | The admin role is assigned only to the seeded `ADMIN_EMAIL`. Other accounts default to `importer`. |

---

## 9. What lives where

```
/app
├── backend/                # FastAPI app
│   ├── server.py           # Single-file API (1600+ lines, all endpoints)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/               # React app
│   ├── src/
│   │   ├── App.js                  # Router
│   │   ├── components/             # Navbar, Footer, Logo, etc.
│   │   ├── context/AuthContext.jsx # JWT + Emergent Google auth
│   │   ├── lib/company.js          # Company info (phone, WhatsApp, logo)
│   │   ├── pages/                  # Public pages + auth screens
│   │   └── pages/dashboard/        # Importer dashboard
│   │   └── pages/admin/            # Admin console
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
├── docker-compose.yml      # Local dry-run
├── README.md               # Project overview
└── DEPLOYMENT.md           # This file
```

---

## 10. Updating in production

1. Pull latest code.
2. Backend: `docker-compose build backend && docker-compose up -d backend` (or `git push` on Render/Railway — auto-deploys).
3. Frontend: bump `REACT_APP_BACKEND_URL` if it changed, then `docker-compose build frontend && docker-compose up -d frontend`.
4. Database: schema is non-relational; no migrations needed. New collections auto-create on first write. Indexes are created on backend startup.

---

Questions? Reach out — and good shipping. 🚢
