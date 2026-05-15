"""End-to-end backend test suite for JDOM Universal Concept API."""
import os
import uuid
import base64
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://clearing-express.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@jdomuniversal.live"
ADMIN_PASSWORD = "admin@jdom"

_state = {}


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["user"]["role"] == "admin"
    return data["access_token"]


@pytest.fixture(scope="session")
def importer_token():
    suffix = uuid.uuid4().hex[:8]
    email = f"TEST_imp_{suffix}@test.com"
    r = requests.post(f"{API}/auth/register", json={
        "name": "Test Importer",
        "email": email,
        "password": "Importer@123",
        "phone": "+2348000000000"
    })
    assert r.status_code == 200, f"register failed: {r.status_code} {r.text}"
    data = r.json()
    _state["importer_email"] = email
    _state["importer_id"] = data["user"]["user_id"]
    return data["access_token"]


@pytest.fixture(scope="session")
def importer2_token():
    suffix = uuid.uuid4().hex[:8]
    email = f"TEST_imp2_{suffix}@test.com"
    r = requests.post(f"{API}/auth/register", json={
        "name": "Second Importer",
        "email": email,
        "password": "Importer@123"
    })
    assert r.status_code == 200
    return r.json()["access_token"]


def H(token):
    return {"Authorization": f"Bearer {token}"}


# ---------------- Health ----------------
def test_root():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("ok") is True


# ---------------- Auth ----------------
class TestAuth:
    def test_register_login_me(self, importer_token):
        r = requests.get(f"{API}/auth/me", headers=H(importer_token))
        assert r.status_code == 200
        assert r.json()["role"] == "importer"

    def test_login_admin(self, admin_token):
        r = requests.get(f"{API}/auth/me", headers=H(admin_token))
        assert r.status_code == 200
        assert r.json()["role"] == "admin"
        assert r.json()["email"] == ADMIN_EMAIL

    def test_invalid_login(self):
        r = requests.post(f"{API}/auth/login", json={"email": "no@no.com", "password": "x"})
        assert r.status_code == 401

    def test_register_dupe_email(self):
        r = requests.post(f"{API}/auth/register", json={
            "name": "Dup", "email": ADMIN_EMAIL, "password": "abcdef"
        })
        assert r.status_code == 400


# ---------------- Leads ----------------
class TestLeads:
    def test_create_lead_public(self):
        r = requests.post(f"{API}/leads", json={
            "name": "TEST Lead", "email": "lead@test.com", "phone": "+234123",
            "cargo_type": "General", "port": "Apapa", "containers": "2x40HC"
        })
        assert r.status_code == 200
        body = r.json()
        assert body.get("ok") is True
        assert "lead_id" in body
        _state["lead_id"] = body["lead_id"]

    def test_admin_lists_leads(self, admin_token):
        r = requests.get(f"{API}/admin/leads", headers=H(admin_token))
        assert r.status_code == 200
        items = r.json()
        ids = [i["lead_id"] for i in items]
        assert _state["lead_id"] in ids

    def test_importer_cannot_list_leads(self, importer_token):
        r = requests.get(f"{API}/admin/leads", headers=H(importer_token))
        assert r.status_code == 403

    def test_admin_marks_contacted(self, admin_token):
        r = requests.patch(f"{API}/admin/leads/{_state['lead_id']}",
                           json={"status": "contacted"}, headers=H(admin_token))
        assert r.status_code == 200
        # verify
        r2 = requests.get(f"{API}/admin/leads", headers=H(admin_token))
        item = next(i for i in r2.json() if i["lead_id"] == _state["lead_id"])
        assert item["status"] == "contacted"


# ---------------- Applications ----------------
class TestApplications:
    def test_create_application_with_doc(self, importer_token):
        b64 = base64.b64encode(b"hello-paar-doc").decode()
        r = requests.post(f"{API}/applications", json={
            "cargo_type": "Machinery",
            "port": "Tin Can",
            "containers": "1x20",
            "weight": "12T",
            "eta": "2026-02-01",
            "notes": "Urgent",
            "new_documents": [{
                "name": "PAAR.pdf", "type": "PAAR", "mime_type": "application/pdf",
                "data_base64": b64
            }]
        }, headers=H(importer_token))
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("ok") is True
        _state["application_id"] = body["application_id"]

    def test_mine_returns_app(self, importer_token):
        r = requests.get(f"{API}/applications/mine", headers=H(importer_token))
        assert r.status_code == 200
        ids = [a["application_id"] for a in r.json()]
        assert _state["application_id"] in ids

    def test_admin_lists_apps(self, admin_token):
        r = requests.get(f"{API}/admin/applications", headers=H(admin_token))
        assert r.status_code == 200
        items = r.json()
        match = next((a for a in items if a["application_id"] == _state["application_id"]), None)
        assert match is not None
        assert len(match["document_ids"]) >= 1

    def test_admin_updates_status_tracking(self, admin_token):
        tracking = f"JD{uuid.uuid4().hex[:8].upper()}"
        _state["tracking_number"] = tracking
        r = requests.patch(f"{API}/admin/applications/{_state['application_id']}",
                           json={"status": "processing", "tracking_number": tracking,
                                 "tracking_status": "At Apapa terminal", "admin_notes": "Reviewing"},
                           headers=H(admin_token))
        assert r.status_code == 200

    def test_public_tracking(self):
        r = requests.get(f"{API}/tracking/{_state['tracking_number']}")
        assert r.status_code == 200
        body = r.json()
        assert body["tracking_number"] == _state["tracking_number"]
        assert body["status"] == "processing"

    def test_public_tracking_404(self):
        r = requests.get(f"{API}/tracking/NOSUCHTRACKING12345")
        assert r.status_code == 404

    def test_importer_cannot_admin_apps(self, importer_token):
        r = requests.get(f"{API}/admin/applications", headers=H(importer_token))
        assert r.status_code == 403


# ---------------- Documents ----------------
class TestDocuments:
    def test_upload_doc(self, importer_token):
        b64 = base64.b64encode(b"bill-of-lading-content").decode()
        r = requests.post(f"{API}/documents", json={
            "name": "BOL.pdf", "type": "BOL", "mime_type": "application/pdf",
            "data_base64": b64
        }, headers=H(importer_token))
        assert r.status_code == 200
        _state["document_id"] = r.json()["document_id"]

    def test_mine_lists_docs(self, importer_token):
        r = requests.get(f"{API}/documents/mine", headers=H(importer_token))
        assert r.status_code == 200
        ids = [d["document_id"] for d in r.json()]
        assert _state["document_id"] in ids
        # ensure base64 not leaked in list
        assert "data_base64" not in r.json()[0]

    def test_owner_can_fetch(self, importer_token):
        r = requests.get(f"{API}/documents/{_state['document_id']}", headers=H(importer_token))
        assert r.status_code == 200
        assert r.json()["data_base64"]

    def test_other_importer_forbidden(self, importer2_token):
        r = requests.get(f"{API}/documents/{_state['document_id']}", headers=H(importer2_token))
        assert r.status_code == 403

    def test_admin_can_fetch_any(self, admin_token):
        r = requests.get(f"{API}/documents/{_state['document_id']}", headers=H(admin_token))
        assert r.status_code == 200

    def test_unauthenticated_blocked(self):
        r = requests.get(f"{API}/documents/mine")
        assert r.status_code == 401


# ---------------- Testimonials ----------------
class TestTestimonials:
    def test_public_list(self):
        r = requests.get(f"{API}/testimonials")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert len(r.json()) >= 1

    def test_admin_create_delete(self, admin_token):
        r = requests.post(f"{API}/admin/testimonials", json={
            "name": "TEST Person", "role": "CEO", "company": "TEST Co",
            "quote": "JDOM is the best.", "rating": 5
        }, headers=H(admin_token))
        assert r.status_code == 200
        tid = r.json()["testimonial_id"]
        # delete
        d = requests.delete(f"{API}/admin/testimonials/{tid}", headers=H(admin_token))
        assert d.status_code == 200

    def test_importer_cannot_create_testimonial(self, importer_token):
        r = requests.post(f"{API}/admin/testimonials", json={
            "name": "x", "role": "y", "quote": "z", "rating": 5
        }, headers=H(importer_token))
        assert r.status_code == 403


# ---------------- Gallery ----------------
class TestGallery:
    def test_public_gallery(self):
        r = requests.get(f"{API}/gallery")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_create_delete(self, admin_token):
        b64 = base64.b64encode(b"PNGDATA").decode()
        r = requests.post(f"{API}/admin/gallery", json={
            "title": "TEST Gallery", "caption": "Apapa", "image_base64": b64,
            "mime_type": "image/png"
        }, headers=H(admin_token))
        assert r.status_code == 200
        gid = r.json()["gallery_id"]
        d = requests.delete(f"{API}/admin/gallery/{gid}", headers=H(admin_token))
        assert d.status_code == 200

    def test_importer_cannot_create_gallery(self, importer_token):
        r = requests.post(f"{API}/admin/gallery", json={
            "title": "x", "image_base64": "AA==", "mime_type": "image/png"
        }, headers=H(importer_token))
        assert r.status_code == 403


# ---------------- Stats ----------------
class TestStats:
    def test_admin_stats(self, admin_token):
        r = requests.get(f"{API}/admin/stats", headers=H(admin_token))
        assert r.status_code == 200
        body = r.json()
        for k in ["leads_total", "applications_total", "importers_total"]:
            assert k in body
            assert isinstance(body[k], int)

    def test_importer_cannot_stats(self, importer_token):
        r = requests.get(f"{API}/admin/stats", headers=H(importer_token))
        assert r.status_code == 403


# ---------------- Google session endpoint exists ----------------
def test_google_session_endpoint_exists():
    r = requests.post(f"{API}/auth/google/session", json={"session_id": "invalid-test-session"})
    # Should call Emergent and get 401 (invalid) or 502 (unreachable). Not 404.
    assert r.status_code in (401, 502), f"Unexpected: {r.status_code} {r.text}"
