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
os.environ["TRANSFER_DIR"] = os.path.join(_TMP, "transfers")
os.environ["MAX_TRANSFER_BYTES"] = str(1024 * 1024)  # 1 MB so the size test is cheap


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


def test_lead_requires_valid_email(client):
    res = client.post("/api/leads", json={"email": "not-an-email"})
    assert res.status_code == 400


def _transfer_files(name="report.pdf", payload=b"x" * 50000):
    return {"file": (name, payload, "application/octet-stream")}


def test_transfer_roundtrip(client):
    payload = b"x" * 50000
    res = client.post("/api/transfers", files=_transfer_files(payload=payload))
    assert res.status_code == 200
    body = res.json()
    assert body["filename"] == "report.pdf"
    assert body["size_bytes"] == len(payload)
    assert body["download_url"] == f"/d/{body['token']}"

    import datetime

    expires = datetime.datetime.fromisoformat(body["expires_at"])
    now = datetime.datetime.now(datetime.timezone.utc)
    assert datetime.timedelta(days=6) < expires - now <= datetime.timedelta(days=7)

    dl = client.get(body["download_url"])
    assert dl.status_code == 200
    assert dl.content == payload
    assert "report.pdf" in dl.headers["content-disposition"]
    assert dl.headers["content-type"] == "application/octet-stream"


def test_transfer_expiry_deletes_file_and_row(client):
    import sqlite3

    res = client.post("/api/transfers", files=_transfer_files(name="old.bin"))
    token = res.json()["token"]
    stored = os.path.join(os.environ["TRANSFER_DIR"], token)
    assert os.path.exists(stored)

    with sqlite3.connect(os.environ["DATABASE_PATH"]) as conn:
        conn.execute(
            "UPDATE transfers SET expires_at = ? WHERE token = ?",
            ("2000-01-01T00:00:00+00:00", token),
        )

    assert client.get(f"/d/{token}").status_code == 404
    assert not os.path.exists(stored)
    with sqlite3.connect(os.environ["DATABASE_PATH"]) as conn:
        row = conn.execute("SELECT 1 FROM transfers WHERE token = ?", (token,)).fetchone()
    assert row is None


def test_transfer_size_limit(client):
    too_big = b"x" * (int(os.environ["MAX_TRANSFER_BYTES"]) + 1)
    before = set(os.listdir(os.environ["TRANSFER_DIR"]))
    res = client.post("/api/transfers", files=_transfer_files(name="big.bin", payload=too_big))
    assert res.status_code == 413
    assert set(os.listdir(os.environ["TRANSFER_DIR"])) == before


def test_transfer_rejects_empty_file(client):
    res = client.post("/api/transfers", files=_transfer_files(name="empty.bin", payload=b""))
    assert res.status_code == 400


def test_transfer_unknown_token_404(client):
    assert client.get("/d/" + "a" * 32).status_code == 404


def test_transfer_page_served(client):
    res = client.get("/transfer")
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("text/html")


def test_transfer_filename_sanitized(client):
    res = client.post("/api/transfers", files=_transfer_files(name="../../evil\r\nX: y.bin"))
    assert res.status_code == 200
    body = res.json()
    assert "/" not in body["filename"] and ".." not in body["filename"]
    disp = client.get(body["download_url"]).headers["content-disposition"]
    assert "\r" not in disp and "\n" not in disp and "../" not in disp


def test_provider_selector_returns_mock_without_key(monkeypatch):
    from app.providers import get_provider
    from app.providers.mock import MockProvider

    monkeypatch.delenv("IMAGE_API_KEY", raising=False)
    # Even when 'replicate' is requested, no key => safe fallback to mock.
    monkeypatch.setenv("IMAGE_PROVIDER", "replicate")
    assert isinstance(get_provider(), MockProvider)
    assert isinstance(get_provider("mock"), MockProvider)
