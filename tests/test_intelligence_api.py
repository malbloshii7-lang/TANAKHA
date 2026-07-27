"""Integration tests: source ingestion -> analysis -> persistence -> review."""

import os
import tempfile

import pytest

_TMP = tempfile.mkdtemp(prefix="tanakha_intel_test_")
os.environ["DATABASE_PATH"] = os.path.join(_TMP, "test.db")
os.environ["MEDIA_DIR"] = os.path.join(_TMP, "media")
os.environ["IMAGE_PROVIDER"] = "mock"
os.environ["TANAKHA_DISABLE_CLAUDE"] = "1"
os.environ["CLIMATE_INGESTION_ENABLED"] = "0"
os.environ.pop("INTELLIGENCE_PROVIDER", None)


@pytest.fixture(scope="module")
def client():
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as c:
        yield c


AR_TEXT = (
    "أعلنت جماعة الحوثي أنها هاجمت سفينة حاويات في البحر الأحمر "
    "بالقرب من مضيق باب المندب يوم 2026-06-12."
)
EN_TEXT = (
    "Maersk suspended Red Sea transits on 14 June 2026 and rerouted vessels "
    "around the Cape of Good Hope. Container volumes at Jebel Ali Port "
    "increased by 12 percent."
)


def _ingest(client, text, **kw):
    payload = {"text": text, "source_type": "news", "reliability": "medium"}
    payload.update(kw)
    res = client.post("/api/intel/sources", json=payload)
    assert res.status_code == 200, res.text
    return res.json()


def test_source_ingestion_arabic_and_english(client):
    ar = _ingest(client, AR_TEXT, publisher="وكالة", publication_date="2026-06-13")
    en = _ingest(client, EN_TEXT, publisher="Reuters",
                 publication_date="2026-06-14", reliability="high")
    assert ar["language"] == "ar" and en["language"] == "en"
    assert ar["created"] and en["created"]


def test_duplicate_ingestion_blocked_by_hash(client):
    first = _ingest(client, "A unique piece of evidence for dedup testing.")
    second = _ingest(client, "A unique piece of evidence for dedup testing.")
    assert second["duplicate"] is True
    assert second["source_id"] == first["source_id"]


def test_upload_txt_and_pdf(client):
    res = client.post("/api/intel/sources/upload",
                      files={"file": ("note.txt",
                                      b"Etihad Rail expanded freight capacity "
                                      b"in 2026 across the UAE network.",
                                      "text/plain")},
                      data={"reliability": "medium", "source_type": "report"})
    assert res.status_code == 200, res.text
    assert res.json()["sources"][0]["created"]

    # A blank (scanned-like) PDF must be rejected with a clear flag.
    import io

    from pypdf import PdfWriter
    buf = io.BytesIO()
    w = PdfWriter()
    w.add_blank_page(width=100, height=100)
    w.write(buf)
    res = client.post("/api/intel/sources/upload",
                      files={"file": ("scan.pdf", buf.getvalue(),
                                      "application/pdf")})
    assert res.status_code == 422
    assert "scanned" in res.json()["detail"] or "extractable" in res.json()["detail"]


def test_full_analysis_run_and_persistence(client):
    ar = _ingest(client, AR_TEXT, publisher="وكالة", publication_date="2026-06-13")
    en = _ingest(client, EN_TEXT, publisher="Reuters",
                 publication_date="2026-06-14", reliability="high")
    res = client.post("/api/analysis/run", json={
        "source_ids": [ar["source_id"], en["source_id"]],
        "strategic_question": "UAE impact?",
        "knowledge_cutoff": "2026-07-01",
        "provider": "deterministic",
    })
    assert res.status_code == 200, res.text
    body = res.json()
    run_id = body["analysis_run_id"]

    # Contract shape from the assignment.
    for key in ("entities", "events", "claims", "contradictions",
                "uae_implications", "scenarios", "briefing", "provider",
                "warnings"):
        assert key in body

    assert body["provider"]["provider"] == "deterministic"
    assert any(e["entity_id"] == "ent_houthis" for e in body["entities"])
    observed = [c for c in body["claims"] if c["claim_type"] == "observed"]
    assert observed and all(c["source_ids"] for c in observed)
    assert len(body["scenarios"]) == 3
    assert body["briefing"]["knowledge_cutoff"] == "2026-07-01"

    # Persistence: run is retrievable with its claims and result.
    got = client.get(f"/api/analysis/runs/{run_id}")
    assert got.status_code == 200
    stored = got.json()
    assert stored["status"] == "completed"
    assert stored["result"]["briefing"]["what_changed"]
    assert len(stored["claims"]) == len(body["claims"])
    # Raw provider output is stored separately, off by default.
    assert "raw_provider_output" not in stored
    with_raw = client.get(f"/api/analysis/runs/{run_id}",
                          params={"include_raw": "true"}).json()
    assert "raw_provider_output" in with_raw

    globals()["_RUN_ID"] = run_id  # reused by later tests in this module


def test_rerun_analysis(client):
    run_id = globals()["_RUN_ID"]
    res = client.post(f"/api/analysis/runs/{run_id}/rerun")
    assert res.status_code == 200, res.text
    rerun_id = res.json()["analysis_run_id"]
    assert rerun_id != run_id

    cmp = client.get("/api/analysis/compare",
                     params={"run_a": run_id, "run_b": rerun_id})
    assert cmp.status_code == 200
    diff = cmp.json()
    # Deterministic provider must reproduce identical claims.
    assert diff["claims_only_in_a"] == [] and diff["claims_only_in_b"] == []
    assert diff["shared_claim_count"] > 0
    globals()["_RERUN_ID"] = rerun_id


def test_claim_review_workflow(client):
    run_id = globals()["_RUN_ID"]
    claims = client.get(f"/api/analysis/runs/{run_id}/claims").json()["claims"]
    assert all(c["review_status"] == "pending" for c in claims)
    claim_id = claims[0]["claim_id"]

    for status in ("reviewed", "approved"):
        res = client.post(
            f"/api/analysis/runs/{run_id}/claims/{claim_id}/review",
            json={"status": status})
        assert res.status_code == 200

    updated = client.get(f"/api/analysis/runs/{run_id}/claims").json()["claims"]
    assert next(c for c in updated
                if c["claim_id"] == claim_id)["review_status"] == "approved"

    res = client.post(
        f"/api/analysis/runs/{run_id}/claims/{claim_id}/review",
        json={"status": "nonsense"})
    assert res.status_code == 422


def test_contradictions_create_review_queue_items(client):
    a = _ingest(client,
                "Suez Canal daily transits decreased to 52 ships, "
                "authorities said on 2026-06-14.",
                publisher="Canal Desk", publication_date="2026-06-14",
                reliability="high")
    b = _ingest(client,
                "أكدت مصادر ملاحية أن عدد السفن العابرة في قناة السويس "
                "انخفض إلى ٤٥ سفينة يومياً.",
                publisher="وكالة إقليمية", publication_date="2026-06-15")
    res = client.post("/api/analysis/run", json={
        "source_ids": [a["source_id"], b["source_id"]],
        "knowledge_cutoff": "2026-07-01",
    })
    assert res.status_code == 200
    body = res.json()
    kinds = {c["kind"] for c in body["contradictions"]}
    assert "conflicting_quantities" in kinds
    run_id = body["analysis_run_id"]

    queue = client.get("/api/analysis/review-queue",
                       params={"run_id": run_id}).json()["items"]
    assert queue and queue[0]["status"] == "open"
    item_id = queue[0]["item_id"]
    res = client.post(f"/api/analysis/review-queue/{item_id}",
                      json={"status": "resolved"})
    assert res.status_code == 200
    updated = client.get("/api/analysis/review-queue",
                         params={"run_id": run_id}).json()["items"]
    assert updated[0]["status"] == "resolved"


def test_unknown_sources_and_provider_rejected(client):
    res = client.post("/api/analysis/run",
                      json={"source_ids": ["src_doesnotexist"]})
    assert res.status_code == 404
    res = client.post("/api/analysis/run",
                      json={"source_ids": [], "provider": "quantum"})
    assert res.status_code in (400, 422)


def test_huggingface_without_config_fails_loudly(client, monkeypatch):
    """No silent fallback: unconfigured HF provider is a 422, not a quiet
    deterministic run."""
    monkeypatch.delenv("HF_TOKEN", raising=False)
    src = _ingest(client, "Some evidence text about DP World operations.")
    res = client.post("/api/analysis/run", json={
        "source_ids": [src["source_id"]], "provider": "huggingface"})
    assert res.status_code == 422
    assert "HF_TOKEN" in res.json()["detail"]
