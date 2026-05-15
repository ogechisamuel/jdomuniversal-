# JDOM Universal Concept Ltd — PRD

## Problem Statement (verbatim from user)
Build a full production-ready web application for a Nigerian customs clearing company called JDOM Universal Concept Ltd. The platform should generate high-quality leads, allow importers to submit clearing requests, and provide dashboards for both admin and importers — focused on speed, trust, and oil & gas specialization. Pages: Homepage (Hero + Industry sections + Fast Track 5-step + Testimonials + Gallery + multi-step Lead Capture), About, Resource Center (PDFs + email capture), Contact. Importer dashboard: Apply Agent (cargo form + doc uploads PAAR/B/L/Form M/Proforma), My Applications, Document Vault, Track Shipment. Admin dashboard: Lead Management, Importer Management, Application Control, Document Access, Testimonial Manager, Gallery Manager, Email Notifications (SendGrid). Floating WhatsApp button on all pages.

## User Choices (Iteration 1)
- Auth: BOTH JWT email/password + Emergent Google login
- Email: SendGrid (key provided)
- File storage: base64 in MongoDB
- Admin: admin@jdomuniversal.live / admin@jdom

## Architecture
- Backend: FastAPI + Motor (MongoDB) + bcrypt + PyJWT + SendGrid
- Frontend: React 19 + react-router-dom v7 + Tailwind + shadcn/ui + sonner
- Auth: Bearer tokens stored in localStorage (`jdom_token`); also writes httpOnly cookies for completeness
- All API routes prefixed `/api`. Role-based gating via `require_admin` dependency.

## User Personas
1. **Importer** — submits clearing requests, uploads documents, tracks status
2. **Admin (JDOM ops)** — manages leads, applications, testimonials, gallery; receives SendGrid notifications

## Implemented (2026-02-15, iteration 1)
- Public site: Home (hero + multi-step lead form + industries + 5-step fast track + testimonials carousel + gallery + tracking lookup), About, Resources (gated PDF downloads), Contact
- Auth: register/login/logout/me (JWT) + Emergent Google session endpoint + auth callback handler
- Importer dashboard: overview stats, Apply Agent (cargo form with PAAR/BOL/Form M/Proforma file upload + vault reuse), My Applications, Document Vault (CRUD), Track Shipment
- Admin dashboard: overview stats, Leads (mark contacted), Applications (status + tracking + admin notes), Importers list, Testimonials manager (CRUD), Gallery manager (CRUD)
- SendGrid notifications on new lead + new application (with fallback log if API key missing)
- Floating WhatsApp button (sitewide on public shell)
- Seed: admin user + 3 starter testimonials

## Backlog (P1/P2)
- P1: Email service — async wrapper around SendGrid (currently sync blocking inside async handlers)
- P1: Real PDF resources hosted in object storage instead of placeholder downloads
- P2: Importer profile/settings page
- P2: Notifications via email to importer on status change
- P2: Split `server.py` into routers (auth/leads/apps/admin) for maintainability
- P2: Add password reset flow

## Next Action Items
1. Verify SendGrid sender domain — currently using `noreply@jdomuniversal.live` placeholder; emails will fail until verified at SendGrid
2. Replace placeholder phone/WhatsApp number in `/app/frontend/src/lib/company.js` with real JDOM numbers
3. Add real PDF resources or wire S3/Emergent object storage for resource center
