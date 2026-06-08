"""FastAPI router for the campaign portal API (prefix: /api/portal)."""
import os
import re
import secrets

from fastapi import (APIRouter, Depends, File, Form, Header, HTTPException,
                     UploadFile)
from fastapi.responses import FileResponse, RedirectResponse
from pydantic import BaseModel

from .. import storage
from . import auth, db

router = APIRouter()

ALLOWED_DOC_EXT = {"pdf", "doc", "docx", "ppt", "pptx", "png", "jpg", "jpeg", "webp"}
MAX_DOC_BYTES = 25 * 1024 * 1024


# ---- bootstrap: tables + seed admin/sample data -----------------------

def bootstrap() -> None:
    db.init_db()
    if db.count_users() == 0:
        username = os.getenv("PORTAL_ADMIN_USER", "admin")
        password = os.getenv("PORTAL_ADMIN_PASSWORD", "changeme")
        salt, pw_hash = auth.hash_password(password)
        db.create_user(username, "Campaign Admin", "admin", salt, pw_hash)
    if not db.latest_status():
        db.insert_status({
            "phase": "Pre-announcement",
            "vote_estimate": "—",
            "regional_snapshot": "RA I: building · RA II: strong · RA III–VI: to map",
            "key_dates": "WMO Congress (next presidential election cycle)",
            "note_en": "Portal initialized. Update this status from the dashboard.",
            "note_ar": "تم تهيئة البوابة. حدّث هذه الحالة من لوحة التحكم.",
            "updated_by": "system",
        })
    if not db.list_contacts():
        for sample in _SAMPLE_CONTACTS:
            db.insert_contact(sample)


_SAMPLE_CONTACTS = [
    {"name": "Permanent Representative (example)", "country": "Sample Country",
     "role": "PR", "region": "RA II", "organization": "National Met Service",
     "stance": "supportive", "owner": "—",
     "next_action": "Schedule introductory call"},
    {"name": "MFA Focal Point (example)", "country": "Sample Country",
     "role": "MFA", "region": "RA I", "organization": "Ministry of Foreign Affairs",
     "stance": "neutral", "owner": "—", "next_action": "Send candidacy brief"},
]


# ---- auth dependency ---------------------------------------------------

def current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authentication required.")
    token = authorization.split(" ", 1)[1].strip()
    payload = auth.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")
    return payload


def require_editor(user: dict = Depends(current_user)) -> dict:
    if user.get("r") not in ("admin", "editor"):
        raise HTTPException(status_code=403, detail="Editor access required.")
    return user


# ---- login ------------------------------------------------------------

class LoginIn(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(body: LoginIn) -> dict:
    user = db.get_user(body.username.strip())
    if not user or not auth.verify_password(body.password, user["pw_salt"], user["pw_hash"]):
        raise HTTPException(status_code=401, detail="Wrong username or password.")
    token = auth.issue_token(user["username"], user["role"])
    return {"token": token, "user": {"username": user["username"],
            "name": user["name"], "role": user["role"], "lang": user["lang"]}}


@router.get("/me")
def me(user: dict = Depends(current_user)) -> dict:
    return {"username": user["u"], "role": user["r"]}


# ---- contacts ---------------------------------------------------------

@router.get("/contacts")
def get_contacts(user: dict = Depends(current_user)) -> dict:
    return {"contacts": db.list_contacts()}


@router.post("/contacts")
def add_contact(data: dict, user: dict = Depends(require_editor)) -> dict:
    if not (data.get("name") or "").strip():
        raise HTTPException(status_code=400, detail="Contact name is required.")
    return {"id": db.insert_contact(data)}


@router.put("/contacts/{contact_id}")
def edit_contact(contact_id: int, data: dict, user: dict = Depends(require_editor)) -> dict:
    if not db.update_contact(contact_id, data):
        raise HTTPException(status_code=404, detail="Contact not found.")
    return {"ok": True}


@router.delete("/contacts/{contact_id}")
def remove_contact(contact_id: int, user: dict = Depends(require_editor)) -> dict:
    if not db.delete_contact(contact_id):
        raise HTTPException(status_code=404, detail="Contact not found.")
    return {"ok": True}


# ---- documents --------------------------------------------------------

@router.get("/documents")
def get_documents(user: dict = Depends(current_user)) -> dict:
    return {"documents": db.list_documents()}


@router.post("/documents")
async def add_document(
    title_en: str = Form(""),
    title_ar: str = Form(""),
    doc_type: str = Form("other"),
    version: str = Form(""),
    file: UploadFile = File(...),
    user: dict = Depends(require_editor),
) -> dict:
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_DOC_EXT:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: .{ext}")
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file.")
    if len(raw) > MAX_DOC_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 25 MB).")
    storage.ensure_media_dir()
    name = f"doc_{secrets.token_hex(8)}.{ext}"
    with open(os.path.join(storage.media_dir(), name), "wb") as f:
        f.write(raw)
    doc_id = db.insert_document({
        "title_en": title_en or file.filename, "title_ar": title_ar,
        "doc_type": doc_type, "url": f"/media/{name}", "version": version,
    })
    return {"id": doc_id, "url": f"/media/{name}"}


@router.delete("/documents/{doc_id}")
def remove_document(doc_id: int, user: dict = Depends(require_editor)) -> dict:
    if not db.delete_document(doc_id):
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"ok": True}


class ShareIn(BaseModel):
    expires_at: str | None = None  # ISO date, optional


@router.post("/documents/{doc_id}/share")
def share_document(doc_id: int, body: ShareIn, user: dict = Depends(require_editor)) -> dict:
    token = secrets.token_urlsafe(12)
    db.create_share_link(doc_id, token, body.expires_at)
    return {"token": token, "path": f"/s/{token}"}


# ---- status -----------------------------------------------------------

@router.get("/status")
def get_status(user: dict = Depends(current_user)) -> dict:
    return {"status": db.latest_status()}


@router.post("/status")
def set_status(data: dict, user: dict = Depends(require_editor)) -> dict:
    data["updated_by"] = user.get("u")
    return {"id": db.insert_status(data)}
