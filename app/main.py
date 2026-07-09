import contextlib
import io
import os

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
from pydantic import BaseModel

from . import db, design, storage
from .climate import db as climate_db
from .climate import routes as climate_routes
from .climate.ingestion import IngestionManager, build_event_sources, build_feed_sources
from .providers import get_provider
from .providers.mock import MockProvider

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB_DIR = os.path.join(BASE_DIR, "web")
CLIMATE_WEB_DIR = os.path.join(WEB_DIR, "climate")

ALLOWED_STYLES = {"modern", "lush garden", "desert xeriscape", "family yard"}
MAX_UPLOAD_BYTES = 12 * 1024 * 1024

# Initialize side-effects at import so the app (and tests) are ready immediately.
db.init_db()
storage.ensure_media_dir()
climate_db.init_db()

_ingestion_manager: IngestionManager | None = None


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    global _ingestion_manager
    # Disabled in tests (see tests/test_climate_api.py) so no background
    # polling/network happens during the test suite.
    if os.getenv("CLIMATE_INGESTION_ENABLED", "1") == "1":
        _ingestion_manager = IngestionManager(build_feed_sources(), build_event_sources())
        await _ingestion_manager.start()
    yield
    if _ingestion_manager is not None:
        await _ingestion_manager.stop()


app = FastAPI(title="TANAKHA — AI Yard Makeover Visualizer", lifespan=lifespan)
app.mount("/media", StaticFiles(directory=storage.ensure_media_dir()), name="media")
app.mount("/static", StaticFiles(directory=WEB_DIR), name="static")
app.include_router(climate_routes.router)


@app.get("/")
def index() -> FileResponse:
    return FileResponse(os.path.join(WEB_DIR, "index.html"))


@app.get("/climate")
def climate_page() -> FileResponse:
    return FileResponse(os.path.join(CLIMATE_WEB_DIR, "index.html"))


# --- "The Art of Crafting Prompts" landing page + interactive D.N.A builder ---
# Both are self-contained static pages at the repo root that link to each other
# by filename, so we register the friendly path and the raw filename for each.
PERKS_PAGE = os.path.join(BASE_DIR, "the-art-of-crafting-prompts.html")
BUILDER_PAGE = os.path.join(BASE_DIR, "builder.html")


@app.get("/perks")
@app.get("/the-art-of-crafting-prompts.html")
def perks() -> FileResponse:
    return FileResponse(PERKS_PAGE)


@app.get("/builder")
@app.get("/builder.html")
def builder() -> FileResponse:
    return FileResponse(BUILDER_PAGE)


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
