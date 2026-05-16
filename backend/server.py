from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import bcrypt
import jwt
import requests
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# ---------------- Config ----------------
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60 * 24  # 24h for convenience on a B2B platform
REFRESH_TOKEN_DAYS = 7
SESSION_DAYS = 7

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

app = FastAPI(title="JDOM Universal Concept API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("jdom")


# ---------------- Helpers ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES),
               "type": "access"}
    return jwt.encode(payload, jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id,
               "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_DAYS),
               "type": "refresh"}
    return jwt.encode(payload, jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none",
                        max_age=ACCESS_TOKEN_MINUTES * 60, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none",
                        max_age=REFRESH_TOKEN_DAYS * 86400, path="/")


def clear_auth_cookies(response: Response):
    for k in ("access_token", "refresh_token", "session_token"):
        response.delete_cookie(k, path="/")


def send_admin_email(subject: str, html: str):
    """Send email to admin notification address via SendGrid. Silently log failures."""
    to = os.environ.get("ADMIN_NOTIFICATION_EMAIL") or os.environ.get("SENDER_EMAIL", "")
    if not to:
        logger.warning(f"[email skipped: no admin recipient] {subject}")
        return
    send_email(to, subject, html)


def send_email(to_email: str, subject: str, html: str):
    """Send an arbitrary email via SendGrid. Returns True on success."""
    api_key = os.environ.get("SENDGRID_API_KEY", "")
    sender = os.environ.get("SENDER_EMAIL", "noreply@jdomuniversal.online")
    if not api_key:
        logger.warning(f"[email skipped: no SENDGRID_API_KEY] to={to_email} subj={subject}")
        return False
    try:
        msg = Mail(from_email=sender, to_emails=to_email, subject=subject, html_content=html)
        sg = SendGridAPIClient(api_key)
        r = sg.send(msg)
        logger.info(f"SendGrid status {r.status_code} to={to_email} subj={subject}")
        return 200 <= r.status_code < 300
    except Exception as e:
        logger.error(f"SendGrid failure to={to_email}: {e}")
        return False


STATUS_COPY = {
    "pending":    {"label": "Pending",    "color": "#B45309", "msg": "Your clearing application has been received and is in our review queue. A JDOM broker will reach out shortly."},
    "processing": {"label": "Processing", "color": "#1D4ED8", "msg": "Good news — your application is now actively being processed at the port. Our agents are filing documentation on your behalf."},
    "cleared":    {"label": "Cleared",    "color": "#047857", "msg": "Your cargo has been cleared by Nigerian Customs. Please coordinate pickup or last-mile delivery."},
}


def build_status_email_html(user_name: str, app_doc: dict, custom_message: Optional[str] = None) -> str:
    s = STATUS_COPY.get(app_doc.get("status", "pending"), STATUS_COPY["pending"])
    tracking = app_doc.get("tracking_number") or "—"
    track_status = app_doc.get("tracking_status") or "—"
    admin_notes = app_doc.get("admin_notes") or ""
    extra = f"<div style='margin-top:18px;padding:14px;border-left:4px solid #D4AF37;background:#FBF5DD;color:#1A202C;font-size:14px'>{custom_message}</div>" if custom_message else ""
    notes = f"<p style='font-size:13px;color:#475569;margin-top:18px'><strong>Notes from your broker:</strong><br/>{admin_notes}</p>" if admin_notes else ""
    return f"""
    <div style='font-family:Arial,sans-serif;background:#F8F9FA;padding:24px'>
      <div style='max-width:560px;margin:0 auto;background:#fff;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden'>
        <div style='background:#0B1F3A;padding:24px;color:#fff'>
          <div style='color:#D4AF37;text-transform:uppercase;letter-spacing:.18em;font-size:11px'>JDOM UNIVERSAL CONCEPT LTD</div>
          <h1 style='margin:8px 0 0;font-size:22px'>Application update</h1>
        </div>
        <div style='padding:24px;color:#1A202C'>
          <p>Hello {user_name},</p>
          <p>Your clearing application status has been updated.</p>
          <div style='margin:18px 0;padding:14px;border:1px solid #E2E8F0;border-radius:8px'>
            <table style='width:100%;font-size:14px;color:#1A202C'>
              <tr><td style='padding:4px 0;color:#475569'>Cargo</td><td style='padding:4px 0;text-align:right'><strong>{app_doc.get('cargo_type','')}</strong></td></tr>
              <tr><td style='padding:4px 0;color:#475569'>Port</td><td style='padding:4px 0;text-align:right'><strong>{app_doc.get('port','')}</strong></td></tr>
              <tr><td style='padding:4px 0;color:#475569'>Containers</td><td style='padding:4px 0;text-align:right'><strong>{app_doc.get('containers','')}</strong></td></tr>
              <tr><td style='padding:4px 0;color:#475569'>Tracking #</td><td style='padding:4px 0;text-align:right;font-family:monospace'>{tracking}</td></tr>
              <tr><td style='padding:4px 0;color:#475569'>Latest update</td><td style='padding:4px 0;text-align:right'>{track_status}</td></tr>
              <tr><td style='padding:8px 0 0;color:#475569'>Status</td><td style='padding:8px 0 0;text-align:right'><span style='background:{s["color"]};color:#fff;padding:4px 10px;border-radius:999px;font-size:12px;text-transform:uppercase;letter-spacing:.08em'>{s["label"]}</span></td></tr>
            </table>
          </div>
          <p style='color:#1A202C;font-size:14px'>{s["msg"]}</p>
          {extra}
          {notes}
          <p style='margin-top:24px;font-size:13px;color:#475569'>Need to chat? <a href='https://wa.me/message/KWLEOBTILCU7H1' style='color:#0B1F3A;text-decoration:underline'>WhatsApp our desk</a> or sign in to your dashboard.</p>
        </div>
        <div style='background:#0B1F3A;color:#94A3B8;padding:14px 24px;font-size:11px;text-align:center'>JDOM UNIVERSAL CONCEPT LTD · Apapa · Tin Can · Onne</div>
      </div>
    </div>
    """


# ---------------- Models ----------------
class UserPublic(BaseModel):
    user_id: str
    email: EmailStr
    name: str
    role: Literal["admin", "importer"] = "importer"
    phone: Optional[str] = None
    picture: Optional[str] = None
    auth_provider: str = "password"
    created_at: datetime


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleSessionRequest(BaseModel):
    session_id: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    origin: str  # frontend origin, used to build the reset link


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(min_length=6)


class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    company: Optional[str] = None
    cargo_type: str
    port: Optional[str] = None
    containers: Optional[str] = None
    eta: Optional[str] = None
    message: Optional[str] = None
    source: Optional[str] = "homepage"


class Lead(LeadCreate):
    lead_id: str
    status: Literal["new", "contacted"] = "new"
    created_at: datetime


class DocumentUpload(BaseModel):
    name: str
    type: str  # PAAR, BOL, FORM_M, PROFORMA, OTHER
    mime_type: str
    data_base64: str  # raw base64 content


class DocumentRecord(BaseModel):
    document_id: str
    user_id: str
    name: str
    type: str
    mime_type: str
    size_bytes: int
    created_at: datetime


class ApplicationCreate(BaseModel):
    cargo_type: str
    port: str
    containers: str
    weight: Optional[str] = None
    eta: Optional[str] = None
    notes: Optional[str] = None
    # references to docs already in vault, or fresh uploads
    document_ids: List[str] = []
    new_documents: List[DocumentUpload] = []


class Application(BaseModel):
    application_id: str
    user_id: str
    user_email: str
    user_name: str
    cargo_type: str
    port: str
    containers: str
    weight: Optional[str] = None
    eta: Optional[str] = None
    notes: Optional[str] = None
    document_ids: List[str] = []
    status: Literal["pending", "processing", "cleared"] = "pending"
    admin_notes: Optional[str] = None
    tracking_number: Optional[str] = None
    tracking_status: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ApplicationUpdate(BaseModel):
    status: Optional[Literal["pending", "processing", "cleared"]] = None
    admin_notes: Optional[str] = None
    tracking_number: Optional[str] = None
    tracking_status: Optional[str] = None
    notify_importer: bool = True  # auto-send email when status changes


class AdminNotifyRequest(BaseModel):
    subject: str = Field(min_length=3, max_length=140)
    message: str = Field(min_length=3)


class LeadUpdate(BaseModel):
    status: Literal["new", "contacted"]


class TestimonialCreate(BaseModel):
    name: str
    role: str
    company: Optional[str] = None
    quote: str
    rating: int = Field(ge=1, le=5, default=5)


class Testimonial(TestimonialCreate):
    testimonial_id: str
    created_at: datetime


class GalleryCreate(BaseModel):
    title: str
    caption: Optional[str] = None
    image_base64: str
    mime_type: str = "image/jpeg"


class GalleryItem(BaseModel):
    gallery_id: str
    title: str
    caption: Optional[str] = None
    image_base64: str
    mime_type: str
    created_at: datetime


# ---------------- Auth Dependency ----------------
async def get_current_user(request: Request) -> dict:
    # Try JWT (access_token cookie or bearer)
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]

    if token:
        try:
            payload = jwt.decode(token, jwt_secret(), algorithms=[JWT_ALGORITHM])
            if payload.get("type") == "access":
                user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0, "password_hash": 0})
                if user:
                    return user
        except jwt.PyJWTError:
            pass

    # Try Emergent session_token
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            session_token = auth_header[7:]

    if session_token:
        sess = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
        if sess:
            exp = sess.get("expires_at")
            if isinstance(exp, str):
                exp = datetime.fromisoformat(exp)
            if exp and exp.tzinfo is None:
                exp = exp.replace(tzinfo=timezone.utc)
            if exp and exp > datetime.now(timezone.utc):
                user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0, "password_hash": 0})
                if user:
                    return user

    raise HTTPException(status_code=401, detail="Not authenticated")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def serialize_user(u: dict) -> dict:
    return {
        "user_id": u["user_id"],
        "email": u["email"],
        "name": u["name"],
        "role": u.get("role", "importer"),
        "phone": u.get("phone"),
        "picture": u.get("picture"),
        "auth_provider": u.get("auth_provider", "password"),
        "created_at": u["created_at"] if isinstance(u["created_at"], datetime) else datetime.fromisoformat(u["created_at"]),
    }


# ---------------- Auth Routes ----------------
@api.post("/auth/register")
async def register(payload: RegisterRequest, response: Response):
    email = payload.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": user_id,
        "email": email,
        "name": payload.name.strip(),
        "phone": payload.phone,
        "password_hash": hash_password(payload.password),
        "role": "importer",
        "auth_provider": "password",
        "created_at": now.isoformat(),
    }
    await db.users.insert_one(doc)
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    set_auth_cookies(response, access, refresh)
    return {"user": serialize_user(doc), "access_token": access, "refresh_token": refresh}


@api.post("/auth/login")
async def login(payload: LoginRequest, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash") or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access = create_access_token(user["user_id"], email)
    refresh = create_refresh_token(user["user_id"])
    set_auth_cookies(response, access, refresh)
    return {"user": serialize_user(user), "access_token": access, "refresh_token": refresh}


@api.post("/auth/logout")
async def logout(response: Response, request: Request):
    # delete session_token row if present
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    clear_auth_cookies(response)
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return serialize_user(user)


@api.post("/auth/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    # Always return ok to avoid email enumeration
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if user and user.get("auth_provider", "password") == "password":
        import secrets
        token = secrets.token_urlsafe(32)
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(minutes=30)
        await db.password_reset_tokens.insert_one({
            "token": token,
            "user_id": user["user_id"],
            "email": email,
            "expires_at": expires_at,  # native datetime for TTL index
            "used": False,
            "created_at": now.isoformat(),
        })
        origin = (payload.origin or "").rstrip("/")
        reset_link = f"{origin}/reset-password?token={token}"
        subject = "Reset your JDOM Universal password"
        html = f"""
        <div style='font-family:Arial,sans-serif;background:#F8F9FA;padding:24px'>
          <div style='max-width:520px;margin:0 auto;background:#fff;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden'>
            <div style='background:#0B1F3A;padding:24px;color:#fff'>
              <div style='color:#D4AF37;text-transform:uppercase;letter-spacing:.18em;font-size:11px'>JDOM Universal Concept</div>
              <h1 style='margin:8px 0 0;font-size:22px'>Password reset request</h1>
            </div>
            <div style='padding:24px;color:#1A202C'>
              <p>Hello {user.get('name','')},</p>
              <p>We received a request to reset the password for your JDOM Universal account.</p>
              <p style='margin:24px 0'>
                <a href='{reset_link}' style='background:#D4AF37;color:#0B1F3A;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:700;display:inline-block'>Reset my password</a>
              </p>
              <p style='font-size:13px;color:#475569'>This link expires in <strong>30 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
              <p style='font-size:12px;color:#94A3B8;word-break:break-all;margin-top:24px'>If the button doesn't work, paste this URL in your browser:<br/>{reset_link}</p>
            </div>
          </div>
        </div>
        """
        # send email directly to the user (not the admin notification address)
        try:
            api_key = os.environ.get("SENDGRID_API_KEY", "")
            sender = os.environ.get("SENDER_EMAIL", "noreply@jdomuniversal.online")
            if api_key:
                msg = Mail(from_email=sender, to_emails=email, subject=subject, html_content=html)
                sg = SendGridAPIClient(api_key)
                r = sg.send(msg)
                logger.info(f"Password reset email status={r.status_code} email={email}")
            else:
                logger.warning(f"[reset link skipped: no SENDGRID_API_KEY] {reset_link}")
        except Exception as e:
            logger.error(f"Reset email failed for {email}: {e}")
    return {"ok": True, "message": "If an account exists for this email, a reset link has been sent."}


@api.post("/auth/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    row = await db.password_reset_tokens.find_one({"token": payload.token}, {"_id": 0})
    if not row or row.get("used"):
        raise HTTPException(status_code=400, detail="Invalid or already used reset link.")
    exp = row["expires_at"]
    if isinstance(exp, str):
        exp = datetime.fromisoformat(exp)
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This reset link has expired. Please request a new one.")
    new_hash = hash_password(payload.password)
    await db.users.update_one({"user_id": row["user_id"]}, {"$set": {"password_hash": new_hash}})
    await db.password_reset_tokens.update_one({"token": payload.token},
                                              {"$set": {"used": True, "used_at": datetime.now(timezone.utc).isoformat()}})
    return {"ok": True, "message": "Password updated. You can now sign in with your new password."}


@api.post("/auth/google/session")
async def google_session(payload: GoogleSessionRequest, response: Response):
    # Call Emergent session-data endpoint
    try:
        r = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": payload.session_id},
            timeout=10,
        )
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session id")
        data = r.json()
    except requests.RequestException as e:
        logger.error(f"Emergent auth call failed: {e}")
        raise HTTPException(status_code=502, detail="Auth provider unreachable")

    email = data["email"].lower()
    now = datetime.now(timezone.utc)
    existing = await db.users.find_one({"email": email})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": data.get("name") or existing.get("name"),
                       "picture": data.get("picture"),
                       "auth_provider": existing.get("auth_provider", "google")}},
        )
        user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": data.get("name") or email.split("@")[0],
            "picture": data.get("picture"),
            "role": "importer",
            "auth_provider": "google",
            "created_at": now.isoformat(),
        }
        await db.users.insert_one(user_doc)

    session_token = data["session_token"]
    expires_at = now + timedelta(days=SESSION_DAYS)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": now.isoformat(),
    })
    response.set_cookie("session_token", session_token, httponly=True, secure=True,
                        samesite="none", max_age=SESSION_DAYS * 86400, path="/")
    return {"user": serialize_user(user_doc), "session_token": session_token}


# ---------------- Public Lead ----------------
@api.post("/leads")
async def create_lead(payload: LeadCreate):
    lead_id = f"lead_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    doc = {**payload.model_dump(), "lead_id": lead_id, "status": "new",
           "created_at": now.isoformat()}
    await db.leads.insert_one(doc)
    subj = f"New Clearing Lead – {payload.cargo_type} – {payload.port or 'N/A'}"
    html = f"""
    <h2 style='color:#0B1F3A;font-family:Arial'>New Lead via Website</h2>
    <p><strong>Name:</strong> {payload.name}</p>
    <p><strong>Email:</strong> {payload.email}</p>
    <p><strong>Phone:</strong> {payload.phone}</p>
    <p><strong>Company:</strong> {payload.company or '-'}</p>
    <p><strong>Cargo Type:</strong> {payload.cargo_type}</p>
    <p><strong>Port:</strong> {payload.port or '-'}</p>
    <p><strong>Containers:</strong> {payload.containers or '-'}</p>
    <p><strong>ETA:</strong> {payload.eta or '-'}</p>
    <p><strong>Message:</strong><br/>{payload.message or '-'}</p>
    <hr/><small>JDOM Universal Concept Ltd — Lead Notification</small>
    """
    send_admin_email(subj, html)
    return {"ok": True, "lead_id": lead_id}


@api.get("/testimonials")
async def list_testimonials():
    items = await db.testimonials.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items


@api.get("/gallery")
async def list_gallery():
    items = await db.gallery.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items


@api.get("/tracking/{tracking_number}")
async def public_tracking(tracking_number: str):
    app_doc = await db.applications.find_one(
        {"tracking_number": tracking_number},
        {"_id": 0, "tracking_number": 1, "tracking_status": 1, "status": 1,
         "cargo_type": 1, "port": 1, "containers": 1, "updated_at": 1, "user_name": 1}
    )
    if not app_doc:
        raise HTTPException(status_code=404, detail="Tracking number not found")
    return app_doc


# ---------------- Importer Routes ----------------
@api.post("/applications")
async def create_application(payload: ApplicationCreate, user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    # Persist new docs into vault
    doc_ids = list(payload.document_ids)
    for d in payload.new_documents:
        document_id = f"doc_{uuid.uuid4().hex[:12]}"
        size = int(len(d.data_base64) * 3 / 4)
        await db.documents.insert_one({
            "document_id": document_id,
            "user_id": user["user_id"],
            "name": d.name,
            "type": d.type,
            "mime_type": d.mime_type,
            "size_bytes": size,
            "data_base64": d.data_base64,
            "created_at": now.isoformat(),
        })
        doc_ids.append(document_id)

    application_id = f"app_{uuid.uuid4().hex[:12]}"
    doc = {
        "application_id": application_id,
        "user_id": user["user_id"],
        "user_email": user["email"],
        "user_name": user["name"],
        "cargo_type": payload.cargo_type,
        "port": payload.port,
        "containers": payload.containers,
        "weight": payload.weight,
        "eta": payload.eta,
        "notes": payload.notes,
        "document_ids": doc_ids,
        "status": "pending",
        "admin_notes": None,
        "tracking_number": None,
        "tracking_status": None,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    await db.applications.insert_one(doc)
    subj = f"New Clearing Request – {payload.cargo_type} – {payload.containers} – {payload.port}"
    html = f"""
    <h2 style='color:#0B1F3A;font-family:Arial'>New Clearing Application</h2>
    <p><strong>Importer:</strong> {user['name']} ({user['email']})</p>
    <p><strong>Cargo:</strong> {payload.cargo_type}</p>
    <p><strong>Port:</strong> {payload.port}</p>
    <p><strong>Containers:</strong> {payload.containers}</p>
    <p><strong>Weight:</strong> {payload.weight or '-'}</p>
    <p><strong>ETA:</strong> {payload.eta or '-'}</p>
    <p><strong>Notes:</strong> {payload.notes or '-'}</p>
    <p><strong>Documents attached:</strong> {len(doc_ids)}</p>
    """
    send_admin_email(subj, html)
    return {"ok": True, "application_id": application_id}


@api.get("/applications/mine")
async def my_applications(user: dict = Depends(get_current_user)):
    apps = await db.applications.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return apps


@api.post("/documents")
async def upload_document(payload: DocumentUpload, user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    document_id = f"doc_{uuid.uuid4().hex[:12]}"
    size = int(len(payload.data_base64) * 3 / 4)
    await db.documents.insert_one({
        "document_id": document_id,
        "user_id": user["user_id"],
        "name": payload.name,
        "type": payload.type,
        "mime_type": payload.mime_type,
        "size_bytes": size,
        "data_base64": payload.data_base64,
        "created_at": now.isoformat(),
    })
    return {"ok": True, "document_id": document_id}


@api.get("/documents/mine")
async def my_documents(user: dict = Depends(get_current_user)):
    docs = await db.documents.find(
        {"user_id": user["user_id"]},
        {"_id": 0, "data_base64": 0}
    ).sort("created_at", -1).to_list(500)
    return docs


@api.get("/documents/{document_id}")
async def get_document(document_id: str, user: dict = Depends(get_current_user)):
    doc = await db.documents.find_one({"document_id": document_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    # Importer can only access their own. Admin can access any.
    if user.get("role") != "admin" and doc["user_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return doc


# ---------------- Admin Routes ----------------
@api.get("/admin/leads")
async def admin_list_leads(_: dict = Depends(require_admin)):
    items = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return items


@api.patch("/admin/leads/{lead_id}")
async def admin_update_lead(lead_id: str, payload: LeadUpdate, _: dict = Depends(require_admin)):
    res = await db.leads.update_one({"lead_id": lead_id}, {"$set": {"status": payload.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"ok": True}


@api.get("/admin/users")
async def admin_list_users(_: dict = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(1000)
    return users


@api.get("/admin/applications")
async def admin_list_applications(_: dict = Depends(require_admin)):
    apps = await db.applications.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return apps


@api.patch("/admin/applications/{application_id}")
async def admin_update_application(application_id: str, payload: ApplicationUpdate,
                                   _: dict = Depends(require_admin)):
    existing = await db.applications.find_one({"application_id": application_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Application not found")
    update = {k: v for k, v in payload.model_dump(exclude={"notify_importer"}, exclude_none=True).items()}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.applications.update_one({"application_id": application_id}, {"$set": update})

    status_changed = "status" in update and update["status"] != existing.get("status")
    email_sent = False
    if status_changed and payload.notify_importer:
        merged = {**existing, **update}
        html = build_status_email_html(existing.get("user_name", ""), merged)
        subject = f"JDOM Update · {STATUS_COPY[merged['status']]['label']} · {existing.get('cargo_type','')}"
        email_sent = send_email(existing["user_email"], subject, html)

    return {"ok": True, "status_changed": status_changed, "email_sent": email_sent}


@api.post("/admin/applications/{application_id}/notify")
async def admin_notify_importer(application_id: str, payload: AdminNotifyRequest,
                                _: dict = Depends(require_admin)):
    app_doc = await db.applications.find_one({"application_id": application_id}, {"_id": 0})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Application not found")
    html = build_status_email_html(app_doc.get("user_name", ""), app_doc, custom_message=payload.message)
    ok = send_email(app_doc["user_email"], payload.subject, html)
    # Log the notification for audit trail
    await db.application_notifications.insert_one({
        "application_id": application_id,
        "user_email": app_doc["user_email"],
        "subject": payload.subject,
        "message": payload.message,
        "sent": bool(ok),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    if not ok:
        raise HTTPException(status_code=502, detail="Email could not be sent. Check SendGrid configuration.")
    return {"ok": True, "sent": True}


@api.get("/admin/stats")
async def admin_stats(_: dict = Depends(require_admin)):
    return {
        "leads_total": await db.leads.count_documents({}),
        "leads_new": await db.leads.count_documents({"status": "new"}),
        "applications_total": await db.applications.count_documents({}),
        "applications_pending": await db.applications.count_documents({"status": "pending"}),
        "applications_processing": await db.applications.count_documents({"status": "processing"}),
        "applications_cleared": await db.applications.count_documents({"status": "cleared"}),
        "importers_total": await db.users.count_documents({"role": "importer"}),
    }


@api.post("/admin/testimonials")
async def admin_create_testimonial(payload: TestimonialCreate, _: dict = Depends(require_admin)):
    testimonial_id = f"tst_{uuid.uuid4().hex[:12]}"
    doc = {**payload.model_dump(), "testimonial_id": testimonial_id,
           "created_at": datetime.now(timezone.utc).isoformat()}
    await db.testimonials.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.delete("/admin/testimonials/{testimonial_id}")
async def admin_delete_testimonial(testimonial_id: str, _: dict = Depends(require_admin)):
    res = await db.testimonials.delete_one({"testimonial_id": testimonial_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


@api.post("/admin/gallery")
async def admin_create_gallery(payload: GalleryCreate, _: dict = Depends(require_admin)):
    gallery_id = f"gal_{uuid.uuid4().hex[:12]}"
    doc = {**payload.model_dump(), "gallery_id": gallery_id,
           "created_at": datetime.now(timezone.utc).isoformat()}
    await db.gallery.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.delete("/admin/gallery/{gallery_id}")
async def admin_delete_gallery(gallery_id: str, _: dict = Depends(require_admin)):
    res = await db.gallery.delete_one({"gallery_id": gallery_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


@api.get("/")
async def root():
    return {"service": "jdom-universal", "ok": True}


# ---------------- Startup ----------------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # cookies handled separately; we also accept Bearer
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.applications.create_index("application_id", unique=True)
    await db.applications.create_index("user_id")
    await db.applications.create_index("tracking_number")
    await db.documents.create_index("document_id", unique=True)
    await db.documents.create_index("user_id")
    await db.leads.create_index("lead_id", unique=True)
    await db.user_sessions.create_index("session_token", unique=True)
    await db.password_reset_tokens.create_index("token", unique=True)
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "email": admin_email,
            "name": "JDOM Admin",
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "auth_provider": "password",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin: {admin_email}")
    else:
        # Always keep password in sync with env
        if not existing.get("password_hash") or not verify_password(admin_password, existing["password_hash"]):
            await db.users.update_one({"email": admin_email},
                                      {"$set": {"password_hash": hash_password(admin_password), "role": "admin"}})
            logger.info("Admin password synced from env")

    # Seed some testimonials if empty
    if await db.testimonials.count_documents({}) == 0:
        now = datetime.now(timezone.utc).isoformat()
        await db.testimonials.insert_many([
            {"testimonial_id": f"tst_{uuid.uuid4().hex[:12]}",
             "name": "Emeka Obi", "role": "Procurement Lead",
             "company": "Niger Delta Energy Services",
             "quote": "JDOM cleared our 14-container oil-rig consignment at Onne in 72 hours. Zero demurrage. Best in the business.",
             "rating": 5, "created_at": now},
            {"testimonial_id": f"tst_{uuid.uuid4().hex[:12]}",
             "name": "Fatima Bello", "role": "Operations Manager",
             "company": "Sahara Textiles Ltd",
             "quote": "Apapa clearing used to take us 3 weeks. With JDOM it is now 5 days, every time.",
             "rating": 5, "created_at": now},
            {"testimonial_id": f"tst_{uuid.uuid4().hex[:12]}",
             "name": "Captain Adebola", "role": "Logistics Director",
             "company": "Westflow PPE Importers",
             "quote": "Their command of Form M and PAAR documentation is unmatched. Trusted partner since 2021.",
             "rating": 5, "created_at": now},
        ])
        logger.info("Seeded testimonials")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
