"""Tests for the WMO campaign portal (auth, contacts, documents, sharing, status)."""
import importlib
import os

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "portal.db"))
    monkeypatch.setenv("MEDIA_DIR", str(tmp_path / "media"))
    monkeypatch.setenv("PORTAL_ADMIN_USER", "admin")
    monkeypatch.setenv("PORTAL_ADMIN_PASSWORD", "secret123")
    # Re-import so module-level bootstrap runs against the temp DB.
    import app.main as main
    importlib.reload(main)
    return TestClient(main.app)


def _auth(client):
    r = client.post("/api/portal/login", json={"username": "admin", "password": "secret123"})
    assert r.status_code == 200, r.text
    return {"Authorization": "Bearer " + r.json()["token"]}


def test_static_pages_served(client):
    assert client.get("/portal").status_code == 200
    assert client.get("/portal/manifest.webmanifest").status_code == 200
    assert client.get("/portal/sw.js").status_code == 200


def test_requires_auth_and_rejects_bad_login(client):
    assert client.get("/api/portal/contacts").status_code == 401
    assert client.post("/api/portal/login",
                       json={"username": "admin", "password": "x"}).status_code == 401


def test_seed_status_and_contacts(client):
    h = _auth(client)
    assert client.get("/api/portal/status", headers=h).json()["status"]["phase"]
    assert len(client.get("/api/portal/contacts", headers=h).json()["contacts"]) == 2


def test_contact_crud(client):
    h = _auth(client)
    cid = client.post("/api/portal/contacts", headers=h,
                      json={"name": "PR Testland", "role": "PR", "stance": "supportive"}).json()["id"]
    assert client.put(f"/api/portal/contacts/{cid}", headers=h,
                      json={"stance": "neutral"}).status_code == 200
    assert client.delete(f"/api/portal/contacts/{cid}", headers=h).status_code == 200
    assert client.delete(f"/api/portal/contacts/{cid}", headers=h).status_code == 404


def test_document_upload_share_and_public_access(client):
    h = _auth(client)
    files = {"file": ("cv.pdf", b"%PDF-1.4 cv", "application/pdf")}
    did = client.post("/api/portal/documents", headers=h,
                      data={"title_en": "CV", "doc_type": "cv"}, files=files).json()["id"]
    path = client.post(f"/api/portal/documents/{did}/share", headers=h, json={}).json()["path"]

    # Public link works with no auth header and bumps the view counter.
    pub = client.get(path)
    assert pub.status_code == 200 and pub.content == b"%PDF-1.4 cv"
    docs = client.get("/api/portal/documents", headers=h).json()["documents"]
    assert docs[0]["share_links"][0]["views"] == 1


def test_expired_share_link_rejected(client):
    h = _auth(client)
    files = {"file": ("cv.pdf", b"data", "application/pdf")}
    did = client.post("/api/portal/documents", headers=h,
                      data={"doc_type": "cv"}, files=files).json()["id"]
    path = client.post(f"/api/portal/documents/{did}/share", headers=h,
                       json={"expires_at": "2000-01-01T00:00:00"}).json()["path"]
    assert client.get(path).status_code == 404


def test_status_update(client):
    h = _auth(client)
    assert client.post("/api/portal/status", headers=h,
                       json={"phase": "Campaigning"}).status_code == 200
    assert client.get("/api/portal/status", headers=h).json()["status"]["phase"] == "Campaigning"
