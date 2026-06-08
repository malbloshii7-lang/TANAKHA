import io
import os

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
from pydantic import BaseModel

from . import db, design, storage
from .portal import db as portal_db
from .portal import routes as portal_routes
from .providers import get_provider
from .providers.mock import MockProvider

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB_DIR = os.path.join(BASE_DIR, "web")

ALLOWED_STYLES = {"modern", "lush garden", "desert xeriscape", "family yard"}
MAX_UPLOAD_BYTES = 12 * 1024 * 1024

# Initialize side-effects at import so the app (and tests) are ready immediately.
db.init_db()
portal_routes.bootstrap()
storage.ensure_media_dir()

app = FastAPI(title="TANAKHA — AI Yard Makeover Visualizer")
app.mount("/media", StaticFiles(directory=storage.ensure_media_dir()), name="media")
app.mount("/static", StaticFiles(directory=WEB_DIR), name="static")

# --- WMO Presidential Campaign Portal (team-only bilingual PWA) ---
app.include_router(portal_routes.router, prefix="/api/portal")
PORTAL_DIR = os.path.join(WEB_DIR, "portal")
app.mount("/portal/assets", StaticFiles(directory=PORTAL_DIR), name="portal_assets")


@app.get("/portal")
@app.get("/portal/")
def portal_index() -> FileResponse:
    return FileResponse(os.path.join(PORTAL_DIR, "index.html"))


@app.get("/portal/manifest.webmanifest")
def portal_manifest() -> FileResponse:
    return FileResponse(os.path.join(PORTAL_DIR, "manifest.webmanifest"),
                        media_type="application/manifest+json")


@app.get("/portal/sw.js")
def portal_sw() -> FileResponse:
    # Served from /portal/ so the service worker scope covers the whole portal.
    return FileResponse(os.path.join(PORTAL_DIR, "sw.js"),
                        media_type="application/javascript")


@app.get("/s/{token}")
def open_share_link(token: str):
    """Public, no-auth document link for sharing via WhatsApp/email."""
    rec = portal_db.resolve_share_link(token)
    if not rec:
        raise HTTPException(status_code=404, detail="Link not found or expired.")
    rel = rec["url"].removeprefix("/media/")
    path = os.path.join(storage.media_dir(), rel)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File missing.")
    return FileResponse(path)


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
