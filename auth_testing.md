# Auth Testing Playbook for JDOM Universal Concept

## Admin Credentials
- Email: `admin@jdomuniversal.live`
- Password: `admin@jdom`

## Custom JWT Auth Flow
1. POST `/api/auth/register` with `{name,email,password,phone}` → response sets `access_token` + `refresh_token` httpOnly cookies, returns user object.
2. POST `/api/auth/login` with `{email,password}` → same cookies, returns user.
3. GET `/api/auth/me` (cookie or `Authorization: Bearer <access_token>`) → returns current user.
4. POST `/api/auth/logout` → clears cookies.
5. Admin seeded on startup using ADMIN_EMAIL/ADMIN_PASSWORD env vars.

## Emergent Google Auth Flow
1. Frontend redirects to `https://auth.emergentagent.com/?redirect=<window.location.origin>/auth/callback`.
2. After Google auth, user lands at `/auth/callback#session_id=<id>`.
3. Frontend posts session_id to `/api/auth/google/session`; backend calls Emergent `session-data` endpoint, upserts user (role=importer), creates a session_token row, sets httpOnly cookie `session_token` (path=/, secure=true, samesite=none, 7 days), returns user.
4. `get_current_user` accepts either JWT cookie/Bearer OR session_token cookie/Bearer.

## CURL Tests
```bash
API=http://localhost:8001/api
# Admin login
curl -c /tmp/c.txt -X POST $API/auth/login -H "Content-Type: application/json" -d '{"email":"admin@jdomuniversal.live","password":"admin@jdom"}'
curl -b /tmp/c.txt $API/auth/me
```

## MongoDB Checks
```js
db.users.find({role: "admin"})
db.users.createIndex({email:1}, {unique:true})
db.user_sessions.find()
```
