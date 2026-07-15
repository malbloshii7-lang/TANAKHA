import asyncio
import json

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from . import db
from .ingestion import feed_broadcaster
from .normalize import attach_relative_time

router = APIRouter(prefix="/api/climate")

SOURCES = ("WMO", "NHMS", "UN", "Climate", "Finance")


def _format_count(n: int) -> str:
    n = int(n)
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}".rstrip("0").rstrip(".") + "m"
    if n >= 1_000:
        return f"{n / 1_000:.1f}".rstrip("0").rstrip(".") + "k"
    return str(n)


@router.get("/feed")
def get_feed(
    source: str | None = Query(default=None),
    search: str | None = Query(default=None),
    cursor: int | None = Query(default=None),
    limit: int = Query(default=30, ge=1, le=100),
) -> dict:
    if source not in (None, "all", *SOURCES):
        source = None
    items = db.list_feed_items(source=source, search=search, cursor=cursor, limit=limit)
    items = [attach_relative_time(i) for i in items]
    next_cursor = items[-1]["cursor"] if len(items) == limit else None
    counts = db.source_counts(search=search)
    return {"items": items, "next_cursor": next_cursor, "counts": counts}


@router.get("/events")
def get_events(limit: int = Query(default=20, ge=1, le=50)) -> dict:
    return {"events": db.list_events(limit=limit), "count": db.event_count()}


@router.get("/stats")
def get_stats() -> dict:
    s = db.stats()
    return {
        "posts_today": s["posts_today"],
        "posts_today_trend": s["posts_today_trend"],
        "alerts": s["alerts"],
        "alerts_trend": s["alerts_trend"],
        "active_sources": s["active_sources"],
        "active_sources_trend": s["active_sources_trend"],
        "engagement": _format_count(s["engagement_score"]),
        "engagement_trend": s["engagement_trend"],
        "recent_alerts": [
            {"text": a["text"], "time": attach_relative_time({"timestamp": a["timestamp"], "text": ""})["time"]}
            for a in s["recent_alerts"]
        ],
    }


@router.get("/feed/stream")
async def stream_feed() -> StreamingResponse:
    async def event_source():
        queue = feed_broadcaster.subscribe()
        try:
            yield "retry: 3000\n\n"
            while True:
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"event: {event['event']}\ndata: {json.dumps(event['data'])}\n\n"
                except asyncio.TimeoutError:
                    yield ": heartbeat\n\n"
        finally:
            feed_broadcaster.unsubscribe(queue)

    return StreamingResponse(
        event_source(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
