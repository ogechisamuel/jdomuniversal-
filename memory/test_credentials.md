# JDOM Universal Concept Ltd — Test Credentials

## Admin (seeded on backend startup)
- Email: `admin@jdomuniversal.live`
- Password: `admin@jdom`
- Role: `admin`

## Test Importer (create via /api/auth/register or use seeded one below)
- Email: `importer@test.com`
- Password: `Importer@123`
- Role: `importer`

## Auth Endpoints
- POST `/api/auth/register` — { name, email, password, phone? } → sets cookies, returns user
- POST `/api/auth/login` — { email, password } → sets cookies, returns user
- POST `/api/auth/logout` — clears cookies
- GET  `/api/auth/me` — returns current user from cookie/Bearer
- POST `/api/auth/google/session` — { session_id } from Emergent Auth (called after redirect)

## Public Endpoints
- POST `/api/leads` — public lead capture (homepage form)
- GET  `/api/testimonials` — public approved testimonials
- GET  `/api/gallery` — public gallery images
- GET  `/api/tracking/{tracking_number}` — public tracking lookup

## Importer Endpoints (Bearer / cookie)
- POST `/api/applications` — create clearing application
- GET  `/api/applications/mine` — list importer's applications
- POST `/api/documents` — upload doc to vault (base64)
- GET  `/api/documents/mine` — list importer docs

## Admin Endpoints (admin role required)
- GET  `/api/admin/leads` / PATCH `/api/admin/leads/{id}` (contacted)
- GET  `/api/admin/users`
- GET  `/api/admin/applications` / PATCH `/api/admin/applications/{id}` (status + notes + tracking)
- POST/PATCH/DELETE `/api/admin/testimonials`
- POST/DELETE `/api/admin/gallery`
