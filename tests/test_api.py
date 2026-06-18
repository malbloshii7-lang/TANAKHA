import io
import os
import tempfile

import pytest
from PIL import Image

# Configure an isolated DB/media dir and force offline behavior BEFORE importing the app.
_TMP = tempfile.mkdtemp(prefix="tanakha_test_")
os.environ["DATABASE_PATH"] = os.path.join(_TMP, "test.db")
os.environ["MEDIA_DIR"] = os.path.join(_TMP, "media")
os.environ["IMAGE_PROVIDER"] = "mock"
os.environ.pop("IMAGE_API_KEY", None)
os.environ["TANAKHA_DISABLE_CLAUDE"] = "1"  # use templated brief, no network


def _png_bytes(color=(120, 90, 60), size=(200, 150)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture(scope="module")
def client():
    from fastapi.testclient import TestClient

    from app.main import app

    return TestClient(app)


def test_visualize_returns_before_after_and_brief(client):
    files = {"image": ("yard.png", _png_bytes(), "image/png")}
    res = client.post("/api/visualize", files=files, data={"style": "lush garden"})
    assert res.status_code == 200
    body = res.json()
    assert body["before_url"].startswith("/media/")
    assert body["after_url"].startswith("/media/")
    assert body["before_url"] != body["after_url"]
    assert body["style"] == "lush garden"
    brief = body["brief"]
    assert brief["style"] == "lush garden"
    assert brief["features"] and brief["suggested_plants"]
    # Files were actually written.
    assert os.path.exists(os.path.join(os.environ["MEDIA_DIR"], body["after_url"].split("/")[-1]))


def test_visualize_rejects_non_image(client):
    files = {"image": ("not.txt", b"hello world", "text/plain")}
    res = client.post("/api/visualize", files=files, data={"style": "modern"})
    assert res.status_code == 400


def test_lead_capture_roundtrip(client):
    payload = {
        "email": "homeowner@example.com",
        "name": "Pat Homeowner",
        "zip": "90210",
        "style": "modern",
        "brief": {"style": "modern", "features": ["lawn"]},
    }
    res = client.post("/api/leads", json=payload)
    assert res.status_code == 200
    lead_id = res.json()["id"]
    assert lead_id > 0

    listing = client.get("/api/leads").json()["leads"]
    match = [l for l in listing if l["id"] == lead_id]
    assert match, "inserted lead not found in listing"
    assert match[0]["email"] == "homeowner@example.com"
    assert match[0]["status"] == "new"
    assert match[0]["brief"]["style"] == "modern"


def test_team_portal_serves_html(client):
    res = client.get("/team")
    assert res.status_code == 200
    assert "text/html" in res.headers["content-type"]
    assert "Campaign Team Portal" in res.text


def test_lead_requires_valid_email(client):
    res = client.post("/api/leads", json={"email": "not-an-email"})
    assert res.status_code == 400


def test_provider_selector_returns_mock_without_key(monkeypatch):
    from app.providers import get_provider
    from app.providers.mock import MockProvider

    monkeypatch.delenv("IMAGE_API_KEY", raising=False)
    # Even when 'replicate' is requested, no key => safe fallback to mock.
    monkeypatch.setenv("IMAGE_PROVIDER", "replicate")
    assert isinstance(get_provider(), MockProvider)
    assert isinstance(get_provider("mock"), MockProvider)
