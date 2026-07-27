"""End-to-end workflow test + seeded Red Sea regression + golden evaluation.

E2E path (per the assignment):
Upload Arabic and English sources -> Run intelligence analysis -> Inspect
extracted event -> Open observed claim -> Verify source evidence -> Review
contradiction -> Approve claim -> Read UAE implications -> Inspect scenarios
-> Export executive briefing.
"""

import os
import tempfile

import pytest

_TMP = tempfile.mkdtemp(prefix="tanakha_e2e_test_")
os.environ["DATABASE_PATH"] = os.path.join(_TMP, "test.db")
os.environ["MEDIA_DIR"] = os.path.join(_TMP, "media")
os.environ["IMAGE_PROVIDER"] = "mock"
os.environ["TANAKHA_DISABLE_CLAUDE"] = "1"
os.environ["CLIMATE_INGESTION_ENABLED"] = "0"


@pytest.fixture(scope="module")
def client():
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as c:
        yield c


def test_end_to_end_intelligence_workflow(client):
    # 1. Upload Arabic and English sources (one pasted, one file upload).
    ar = client.post("/api/intel/sources", json={
        "text": ("أعلنت جماعة الحوثي أنها هاجمت سفينة حاويات في البحر الأحمر "
                 "يوم 2026-06-12 بالقرب من مضيق باب المندب. وأكدت مصادر "
                 "ملاحية أن عدد السفن العابرة في قناة السويس انخفض إلى ٤٥ "
                 "سفينة يومياً."),
        "publisher": "وكالة أنباء إقليمية", "source_type": "news",
        "publication_date": "2026-06-13", "reliability": "medium",
    })
    assert ar.status_code == 200 and ar.json()["language"] == "ar"
    en = client.post("/api/intel/sources/upload", files={
        "file": ("maersk.md",
                 ("Maersk suspended Red Sea transits on 14 June 2026 and "
                  "rerouted vessels around the Cape of Good Hope. Suez Canal "
                  "daily transits decreased to 52 ships. Container volumes "
                  "at Jebel Ali Port increased by 12 percent.").encode(),
                 "text/markdown")},
        data={"publisher": "Reuters", "source_type": "news",
              "publication_date": "2026-06-14", "reliability": "high"})
    assert en.status_code == 200
    src_ids = [ar.json()["source_id"], en.json()["sources"][0]["source_id"]]

    # 2. Run intelligence analysis.
    run = client.post("/api/analysis/run", json={
        "source_ids": src_ids,
        "strategic_question": "How exposed is UAE logistics?",
        "knowledge_cutoff": "2026-07-01",
        "provider": "deterministic",
    })
    assert run.status_code == 200, run.text
    body = run.json()
    run_id = body["analysis_run_id"]

    # 3. Inspect extracted event.
    attack = next(e for e in body["events"] if e["action"] == "attacked")
    assert attack["actor"] == "ent_houthis"
    assert attack["event_date"] == "2026-06-12"
    assert attack["source_ids"]

    # 4. Open observed claim and 5. verify source evidence.
    observed = next(c for c in body["claims"] if c["claim_type"] == "observed")
    assert observed["source_ids"]
    listed = {s["source_id"] for s in
              client.get("/api/intel/sources").json()["sources"]}
    assert set(observed["source_ids"]) <= listed
    assert observed["confidence_breakdown"]["explanation"]

    # 6. Review contradiction (45 vs 52 ships -> review queue).
    kinds = {c["kind"] for c in body["contradictions"]}
    assert "conflicting_quantities" in kinds
    queue = client.get("/api/analysis/review-queue",
                       params={"run_id": run_id}).json()["items"]
    assert queue
    assert client.post(f"/api/analysis/review-queue/{queue[0]['item_id']}",
                       json={"status": "reviewed"}).status_code == 200

    # 7. Approve claim.
    assert client.post(
        f"/api/analysis/runs/{run_id}/claims/{observed['claim_id']}/review",
        json={"status": "approved"}).status_code == 200

    # 8. Read UAE implications — specific, claim-backed, no filler.
    imps = body["uae_implications"]
    assert imps
    for imp in imps:
        assert imp["supporting_claim_ids"]
        assert imp["monitoring_indicator"]
        assert imp["direction"] in ("opportunity", "risk", "mixed")

    # 9. Inspect scenarios — exactly three, rounded probabilities.
    assert len(body["scenarios"]) == 3
    for sc in body["scenarios"]:
        assert sc["probability"] % 5 == 0
        assert sc["confirming_indicators"] and sc["weakening_indicators"]

    # 10. Export executive briefing.
    briefing = body["briefing"]
    assert briefing["what_changed"] and briefing["leadership_takeaway"]
    assert briefing["provider"]["provider"] == "deterministic"
    assert briefing["knowledge_cutoff"] == "2026-07-01"
    assert briefing["source_appendix"]
    stored = client.get(f"/api/analysis/runs/{run_id}").json()
    assert stored["result"]["briefing"]["what_changed"] == briefing["what_changed"]


def test_seeded_red_sea_briefing_regression(client):
    """The original seeded Red Sea briefing must still work end to end."""
    briefs = client.get("/api/intel/briefs").json()["briefs"]
    red_sea = next(b for b in briefs if b["brief_id"] == "brf_redsea")
    assert "Red Sea" in red_sea["title"]

    sources = client.get("/api/intel/sources",
                         params={"brief_id": "brf_redsea"}).json()["sources"]
    assert len(sources) == 3
    langs = {s["language"] for s in sources}
    assert "ar" in langs and "en" in langs

    run = client.post("/api/analysis/run", json={
        "brief_id": "brf_redsea",
        "strategic_question": red_sea["strategic_question"],
        "knowledge_cutoff": "2026-07-01",
    })
    assert run.status_code == 200, run.text
    body = run.json()
    assert len(body["scenarios"]) == 3
    assert {c["claim_type"] for c in body["claims"]} >= {"observed", "inferred",
                                                         "forecast"}
    assert any(e["entity_id"] == "ent_houthis" for e in body["entities"])
    assert any(i["dimension"] == "trade_logistics"
               for i in body["uae_implications"])
    # The seeded 45-vs-52 transit figures must surface as a contradiction.
    assert any(c["kind"] == "conflicting_quantities"
               for c in body["contradictions"])
    # Arabic original preserved verbatim in the appendix chain.
    ar_src = next(s for s in sources if s["language"] == "ar")
    assert "جماعة الحوثي" in ar_src["original_text"]


def test_home_and_situation_room_pages_still_serve(client):
    assert client.get("/").status_code == 200
    res = client.get("/situation-room")
    assert res.status_code == 200
    assert "Situation Room" in res.text
    assert client.get("/health").json() == {"status": "ok"}


def test_golden_evaluation_suite_passes():
    """Golden evaluation is part of the test suite: CI fails on analytical
    violations (unsupported observed claims, missing linkage, invalid claim
    types, horizonless forecasts, broken Arabic handling, schema failures)."""
    from packages.evaluation.runner import run_evaluation

    report = run_evaluation("deterministic")
    assert report["case_count"] >= 12
    failed = [r["case_id"] for r in report["results"] if not r["passed"]]
    assert not failed, f"golden cases failed: {failed}"
    assert report["critical_violations"] == []
    assert report["ci_pass"] is True
