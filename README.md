# JDOM UNIVERSAL CONCEPT LTD

**Customs clearing platform for Nigeria's oil & gas, textile and PPE importers.**
Apapa · Tin Can · Onne

---

## What is this?

A production-ready full-stack web app built for [JDOM Universal Concept Ltd](https://jdomuniversal.online). It generates leads, lets importers submit clearing applications, and gives admins a full operations console.

### Public site
- Hero + multi-step lead capture form
- Industry showcase (Oil & Gas, Textiles, PPE)
- 5-step "Fast Track" clearing process
- Live testimonials carousel (CMS-driven)
- Real-work gallery (CMS-driven)
- About · Resource Center (gated PDFs) · Contact
- Floating WhatsApp + click-to-track shipment

### Importer dashboard
- Apply Agent — submit clearing requests with PAAR / BOL / Form M / Proforma uploads
- My Applications with live status (pending / processing / cleared)
- Document Vault for reusable docs
- Track Shipment by reference

### Admin console
- Leads management with one-click "mark contacted"
- Applications control: filter by status/port/age, save filter presets (with default flag), bulk-notify multiple importers via Email or WhatsApp, audit history per application
- Notification templates (DB-editable, channel-aware, variable substitution)
- Daily digest scheduler — default preset emailed every morning at chosen UTC hour
- Weekly performance summary — leads · cleared · avg clearance time · top ports, sent every Monday (or chosen day) to up to 10 recipients
- Testimonial + Gallery managers
- Importer directory

### Auth
- JWT (email + password, bcrypt-hashed)
- Emergent-managed Google social login
- Token-based password reset (30-min expiry, single-use)

---

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 19, react-router-dom v7, Tailwind, shadcn/ui, recharts, lucide-react |
| Backend | FastAPI, Motor (async MongoDB), PyJWT, bcrypt, SendGrid |
| Database | MongoDB |
| Email | SendGrid (sender `noreply@jdomuniversal.online`) |
| Build | yarn (frontend), pip (backend) |

---

## Quick start

```bash
# 1. Backend
cd backend
cp .env.example .env   # fill in MONGO_URL, SENDGRID_API_KEY, etc.
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# 2. Frontend
cd ../frontend
cp .env.example .env   # set REACT_APP_BACKEND_URL=http://localhost:8001
yarn install
yarn start
```

Default admin (seeded on first run): `admin@jdomuniversal.online` / value of `ADMIN_PASSWORD`.

---

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for a complete guide — Docker Compose, Render, Railway, Vercel and self-hosted VPS paths are all documented.

---

## Project layout

```
backend/
├── server.py            All endpoints, models, scheduler
├── requirements.txt
├── Dockerfile
└── .env.example
frontend/
├── src/
│   ├── App.js                       Router
│   ├── components/                  Navbar, Footer, Logo, FloatingWhatsApp, etc.
│   ├── context/AuthContext.jsx      JWT + Google session handling
│   ├── lib/
│   │   ├── api.js                   Axios instance with Bearer interceptor
│   │   ├── company.js               Phone, WhatsApp, logo, address (single source of truth)
│   │   └── notificationTemplates.js Var substitution helper
│   ├── pages/                       Home, About, Resources, Contact, auth
│   ├── pages/dashboard/             Importer area
│   └── pages/admin/                 Admin area
├── tailwind.config.js
├── package.json
├── Dockerfile
├── nginx.conf
└── .env.example
docker-compose.yml
DEPLOYMENT.md
README.md  ← you are here
```

---

## License

Private — © JDOM UNIVERSAL CONCEPT LTD. All rights reserved.
