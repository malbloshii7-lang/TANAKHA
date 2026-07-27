"""PrimeAI Situation Room API.

Endpoints:
    POST /api/intel/sources                ingest a pasted/JSON source
    POST /api/intel/sources/upload         ingest TXT / MD / PDF / JSON file
    GET  /api/intel/sources                list sources
    GET  /api/intel/briefs                 list briefs (incl. seeded Red Sea)
    POST /api/analysis/run                 run the intelligence pipeline
    GET  /api/analysis/runs                list runs
    GET  /api/analysis/runs/{run_id}       retrieve a persisted run
    POST /api/analysis/runs/{run_id}/rerun rerun with the same inputs
    GET  /api/analysis/compare             compare two runs
    GET  /api/analysis/runs/{run_id}/claims        claims w/ review status
    POST /api/analysis/runs/{run_id}/claims/{id}/review   review a claim
    GET  /api/analysis/review-queue        open contradiction review items
    POST /api/analysis/review-queue/{item_id}      update review item status

Provider failure returns 502 with the reason — the API never substitutes
invented analysis for a failed provider (no silent fallback).
"""

import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from services.intelligence.pipeline import IntelligencePipeline
from services.intelligence.providers import ProviderError, get_provider
from services.intelligence.source_processor import (
    SourceError,
    build_source,
    ingest_upload,
)

from . import db

log = logging.getLogger("intelligence.api")

router = APIRouter(prefix="/api")

MAX_UPLOAD_BYTES = 8 * 1024 * 1024


class SourceIn(BaseModel):
    text: str
    title: str | None = None
    publisher: str | None = None
    source_type: str = "other"
    url: str | None = None
    publication_date: str | None = None
    event_date: str | None = None
    reliability: str = "unverified"
    brief_id: str | None = None


class AnalysisRequest(BaseModel):
    brief_id: str | None = None
    source_ids: list[str] = Field(default_factory=list)
    strategic_question: str | None = None
    knowledge_cutoff: str | None = None
    provider: str | None = None


class ReviewIn(BaseModel):
    status: str  # reviewed | approved | rejected


# ------------------------------------------------------------------ sources
@router.post("/intel/sources")
def create_source(payload: SourceIn) -> dict:
    try:
        record = build_source(
            payload.text,
            title=payload.title,
            publisher=payload.publisher,
            source_type=payload.source_type,
            url=payload.url,
            publication_date=payload.publication_date,
            event_date=payload.event_date,
            reliability=payload.reliability,
            origin="pasted_text",
        )
    except SourceError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    source_id, created = db.insert_source(record, brief_id=payload.brief_id)
    return {"source_id": source_id, "created": created,
            "duplicate": not created, "language": record["language"],
            "content_hash": record["content_hash"]}


@router.post("/intel/sources/upload")
async def upload_source(
    file: UploadFile = File(...),
    brief_id: str | None = Form(None),
    publisher: str | None = Form(None),
    source_type: str = Form("other"),
    reliability: str = Form("unverified"),
    publication_date: str | None = Form(None),
) -> dict:
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty upload.")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 8 MB).")
    try:
        records = ingest_upload(file.filename or "upload", data, {
            "publisher": publisher, "source_type": source_type,
            "reliability": reliability, "publication_date": publication_date,
        })
    except SourceError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    out = []
    for record in records:
        source_id, created = db.insert_source(record, brief_id=brief_id)
        out.append({"source_id": source_id, "created": created,
                    "duplicate": not created, "language": record["language"]})
    return {"sources": out}


@router.get("/intel/sources")
def get_sources(brief_id: str | None = None) -> dict:
    sources = db.list_sources(brief_id)
    for s in sources:
        s["original_text"] = s["original_text"][:2000]
    return {"sources": sources}


@router.get("/intel/briefs")
def get_briefs() -> dict:
    return {"briefs": db.list_briefs()}


# ----------------------------------------------------------------- analysis
def _execute_analysis(req: AnalysisRequest) -> dict:
    source_ids = list(req.source_ids)
    if not source_ids and req.brief_id:
        source_ids = [s["source_id"] for s in db.list_sources(req.brief_id)]
    sources = db.get_sources(source_ids)
    missing = set(source_ids) - {s["source_id"] for s in sources}
    if missing:
        raise HTTPException(status_code=404,
                            detail=f"Unknown source IDs: {sorted(missing)}")
    if not sources:
        raise HTTPException(status_code=400,
                            detail="No sources selected for analysis.")

    try:
        provider = get_provider(req.provider)
    except ProviderError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    run_id = db.create_run(
        brief_id=req.brief_id,
        strategic_question=req.strategic_question,
        knowledge_cutoff=req.knowledge_cutoff,
        provider=provider.name,
        model_id=provider.model_id,
        source_ids=source_ids,
    )
    try:
        result = IntelligencePipeline(provider).run(
            sources,
            strategic_question=req.strategic_question,
            knowledge_cutoff=req.knowledge_cutoff,
        )
    except ProviderError as exc:
        db.fail_run(run_id, str(exc))
        log.error("analysis run %s failed: %s", run_id, exc)
        raise HTTPException(
            status_code=502,
            detail={"analysis_run_id": run_id, "provider_failure": str(exc)})
    except Exception as exc:  # audit trail even for unexpected errors
        db.fail_run(run_id, f"internal: {exc}")
        log.exception("analysis run %s crashed", run_id)
        raise HTTPException(status_code=500,
                            detail={"analysis_run_id": run_id,
                                    "error": "Analysis failed internally."})

    payload = result.to_dict()
    db.complete_run(run_id, payload, result.raw_provider_output,
                    payload["warnings"])
    db.insert_claims(run_id, payload["claims"])
    db.insert_review_items(run_id, payload["review_queue"])

    return {
        "analysis_run_id": run_id,
        "entities": payload["entities"],
        "events": payload["events"],
        "claims": payload["claims"],
        "rejected_claims": payload["rejected_claims"],
        "contradictions": payload["contradictions"],
        "uae_implications": payload["uae_implications"],
        "scenarios": payload["scenarios"],
        "briefing": payload["briefing"],
        "provider": payload["provider"],
        "warnings": payload["warnings"],
        "validation_issues": payload["validation_issues"],
    }


@router.post("/analysis/run")
def run_analysis(req: AnalysisRequest) -> dict:
    return _execute_analysis(req)


@router.get("/analysis/runs")
def get_runs(brief_id: str | None = None) -> dict:
    return {"runs": db.list_runs(brief_id)}


@router.get("/analysis/runs/{run_id}")
def get_run(run_id: str, include_raw: bool = False) -> dict:
    run = db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Unknown analysis run.")
    if not include_raw:
        run.pop("raw_provider_output", None)
    run["claims"] = db.list_claims(run_id)  # carries live review status
    return run


@router.post("/analysis/runs/{run_id}/rerun")
def rerun_analysis(run_id: str, provider: str | None = None) -> dict:
    run = db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Unknown analysis run.")
    return _execute_analysis(AnalysisRequest(
        brief_id=run["brief_id"],
        source_ids=run["source_ids"],
        strategic_question=run["strategic_question"],
        knowledge_cutoff=run["knowledge_cutoff"],
        provider=provider or run["provider"],
    ))


@router.get("/analysis/compare")
def compare_runs(run_a: str, run_b: str) -> dict:
    a, b = db.get_run(run_a), db.get_run(run_b)
    if not a or not b:
        raise HTTPException(status_code=404, detail="Unknown analysis run(s).")

    def summary(run: dict) -> dict:
        result = run.get("result") or {}
        claims = result.get("claims", [])
        return {
            "run_id": run["run_id"],
            "provider": run["provider"],
            "model_id": run["model_id"],
            "status": run["status"],
            "created_at": run["created_at"],
            "source_count": len(run["source_ids"]),
            "entity_count": len(result.get("entities", [])),
            "event_count": len(result.get("events", [])),
            "claim_counts": {
                t: sum(1 for c in claims if c.get("claim_type") == t)
                for t in ("observed", "inferred", "forecast")},
            "contradiction_count": len(result.get("contradictions", [])),
            "scenario_count": len(result.get("scenarios", [])),
            "warning_count": len(run.get("warnings", [])),
            "claim_texts": {c["claim_id"]: c["text"] for c in claims},
        }

    sa, sb = summary(a), summary(b)
    texts_a = set(sa.pop("claim_texts").values())
    texts_b = set(sb.pop("claim_texts").values())
    return {
        "run_a": sa,
        "run_b": sb,
        "claims_only_in_a": sorted(texts_a - texts_b)[:20],
        "claims_only_in_b": sorted(texts_b - texts_a)[:20],
        "shared_claim_count": len(texts_a & texts_b),
    }


# ------------------------------------------------------------ claims review
@router.get("/analysis/runs/{run_id}/claims")
def get_run_claims(run_id: str) -> dict:
    if not db.get_run(run_id):
        raise HTTPException(status_code=404, detail="Unknown analysis run.")
    return {"claims": db.list_claims(run_id)}


@router.post("/analysis/runs/{run_id}/claims/{claim_id}/review")
def review_claim(run_id: str, claim_id: str, payload: ReviewIn) -> dict:
    if payload.status not in ("reviewed", "approved", "rejected"):
        raise HTTPException(
            status_code=422,
            detail="status must be reviewed, approved or rejected.")
    if not db.set_claim_review(run_id, claim_id, payload.status):
        raise HTTPException(status_code=404, detail="Unknown claim.")
    return {"claim_id": claim_id, "review_status": payload.status}


@router.get("/analysis/review-queue")
def review_queue(run_id: str | None = None, status: str | None = None) -> dict:
    return {"items": db.list_review_queue(run_id, status)}


@router.post("/analysis/review-queue/{item_id}")
def update_review_item(item_id: str, payload: ReviewIn) -> dict:
    if payload.status not in ("open", "reviewed", "resolved", "dismissed"):
        raise HTTPException(status_code=422, detail="Invalid status.")
    if not db.set_review_item_status(item_id, payload.status):
        raise HTTPException(status_code=404, detail="Unknown review item.")
    return {"item_id": item_id, "status": payload.status}
