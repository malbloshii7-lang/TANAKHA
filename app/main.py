import datetime
import io
import os

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
from pydantic import BaseModel

from . import db, design, storage, transfer
from .providers import get_provider
from .providers.mock import MockProvider

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB_DIR = os.path.join(BASE_DIR, "web")

ALLOWED_STYLES = {"modern", "lush garden", "desert xeriscape", "family yard"}
MAX_UPLOAD_BYTES = 12 * 1024 * 1024

# Initialize side-effects at import so the app (and tests) are ready immediately.
db.init_db()
storage.ensure_media_dir()
transfer.ensure_transfer_dir()
try:
    transfer.purge_expired()
except Exception:
    pass  # cleanup must never block startup

app = FastAPI(title="TANAKHA — AI Yard Makeover Visualizer")
app.mount("/media", StaticFiles(directory=storage.ensure_media_dir()), name="media")
app.mount("/static", StaticFiles(directory=WEB_DIR), name="static")


@app.get("/")
def index() -> FileResponse:
    return FileResponse(os.path.join(WEB_DIR, "index.html"))


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/visualize")
async def visualize(image: UploadFile = File(...), style: str = Form("lush garden")) -> dict:
    style = style.strip().lower()
    if style not in ALLOWED_STYLES:
        style = "lush garden"

    raw = await image.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty image upload.")
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image too large (max 12 MB).")

    try:
        im = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Unsupported or corrupt image file.")

    buf = io.BytesIO()
    im.save(buf, format="JPEG", quality=90)
    before_bytes = buf.getvalue()
    before_url = storage.save_image(before_bytes, "jpg")

    brief = design.generate_brief(before_bytes, style, "image/jpeg")

    try:
        after_bytes = get_provider().render(before_bytes, brief, style)
    except Exception:
        # Resilient fallback: never fail the request if the real model errors.
        after_bytes = MockProvider().render(before_bytes, brief, style)
    after_url = storage.save_image(after_bytes, "jpg")

    return {"before_url": before_url, "after_url": after_url, "brief": brief, "style": style}


@app.get("/transfer")
def transfer_page() -> FileResponse:
    return FileResponse(os.path.join(WEB_DIR, "transfer.html"))


@app.post("/api/transfers")
async def create_transfer(file: UploadFile = File(...)) -> dict:
    token = transfer.new_token()
    safe_name = transfer.sanitize_filename(file.filename or "")
    dest = os.path.join(transfer.ensure_transfer_dir(), token)

    try:
        size = await transfer.save_upload(file, dest)
    except transfer.TransferTooLarge:
        max_gb = transfer.max_transfer_bytes() / 1024**3
        raise HTTPException(status_code=413, detail=f"File too large (max {max_gb:g} GB).")
    if size == 0:
        transfer.remove_quiet(dest)
        raise HTTPException(status_code=400, detail="Empty file upload.")

    now = transfer.now_utc()
    expires_at = transfer.iso(now + datetime.timedelta(days=transfer.TRANSFER_TTL_DAYS))
    db.insert_transfer(token, safe_name, dest, size, transfer.iso(now), expires_at)

    return {
        "token": token,
        "filename": safe_name,
        "size_bytes": size,
        "expires_at": expires_at,
        "download_url": f"/d/{token}",
    }


@app.get("/d/{token}")
def download_transfer(token: str) -> FileResponse:
    not_found = HTTPException(status_code=404, detail="Link expired or not found.")
    row = db.get_transfer(token)
    if row is None:
        raise not_found
    if row["expires_at"] <= transfer.iso(transfer.now_utc()):
        transfer.purge_expired()
        raise not_found
    if not os.path.exists(row["stored_path"]):
        # Ephemeral disk wiped the file (e.g. redeploy); drop the stale row.
        db.delete_transfer(token)
        raise not_found
    return FileResponse(
        row["stored_path"],
        filename=row["filename"],
        media_type="application/octet-stream",
    )


class LeadIn(BaseModel):
    email: str
    name: str | None = None
    address: str | None = None
    zip: str | None = None
    style: str | None = None
    brief: dict | None = None
    before_url: str | None = None
    after_url: str | None = None


@app.post("/api/leads")
def create_lead(lead: LeadIn) -> dict:
    if not lead.email or "@" not in lead.email:
        raise HTTPException(status_code=400, detail="A valid email is required.")
    lead_id = db.insert_lead(lead.model_dump())
    return {"id": lead_id, "status": "new"}


@app.get("/api/leads")
def get_leads() -> dict:
    return {"leads": db.list_leads()}
