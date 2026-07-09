import asyncio
import os
import tempfile

import pytest

# Isolated DB, no background ingestion loop, no network — this file exercises
# the API layer directly by seeding through the source classes / db module.
_TMP = tempfile.mkdtemp(prefix="tanakha_climate_test_")
os.environ["DATABASE_PATH"] = os.path.join(_TMP, "climate_test.db")
os.environ["CLIMATE_INGESTION_ENABLED"] = "0"
os.environ["MEDIA_DIR"] = os.path.join(_TMP, "media")
os.environ["IMAGE_PROVIDER"] = "mock"
os.environ.pop("IMAGE_API_KEY", None)
os.environ["TANAKHA_DISABLE_CLAUDE"] = "1"


@pytest.fixture(scope="module")
def client():
    from fastapi.testclient import TestClient

    from app.climate import db as climate_db
    from app.main import app

    # app.main may have already run init_db() against a different DATABASE_PATH
    # (module import order across test files) — re-init against ours explicitly.
    climate_db.init_db()
    return TestClient(app)


@pytest.fixture(autouse=True)
def _clean_climate_tables():
    from app.climate import db as climate_db

    with climate_db._conn() as c:
        c.execute("DELETE FROM climate_feed_items")
        c.execute("DELETE FROM climate_events")
    yield


def _seed_feed_items(n=12):
    from app.climate.sources.mock import MockFeedSource

    source = MockFeedSource()
    items = asyncio.run(source.seed())
    from app.climate import db as climate_db

    inserted = 0
    for item in items[:n]:
        if climate_db.insert_feed_item(item):
            inserted += 1
    return inserted


def _seed_events(n=6):
    from app.climate.sources.mock import MockEventSource

    source = MockEventSource()
    events = asyncio.run(source.seed())
    from app.climate import db as climate_db

    inserted = 0
    for ev in events[:n]:
        if climate_db.insert_event(ev):
            inserted += 1
    return inserted


def test_feed_seed_shape_and_dedup(client):
    inserted = _seed_feed_items(12)
    assert inserted == 12

    from app.climate.sources.mock import MockFeedSource

    source = MockFeedSource()
    items = asyncio.run(source.seed())
    from app.climate import db as climate_db

    # Re-inserting the same seed ids must not create duplicates.
    reinserted = sum(1 for item in items[:12] if climate_db.insert_feed_item(item))
    assert reinserted == 0

    res = client.get("/api/climate/feed", params={"limit": 50})
    assert res.status_code == 200
    body = res.json()
    assert len(body["items"]) == 12
    item = body["items"][0]
    for key in ("id", "author", "handle", "avatar", "source", "platform", "role",
                "text", "time", "timestamp", "engagement", "hasImage", "isBreaking"):
        assert key in item, key
    assert item["source"] in ("WMO", "NHMS", "UN", "Climate", "Finance")


def test_feed_pagination_cursor(client):
    _seed_feed_items(12)
    first = client.get("/api/climate/feed", params={"limit": 5}).json()
    assert len(first["items"]) == 5
    assert first["next_cursor"] is not None

    second = client.get("/api/climate/feed", params={"limit": 5, "cursor": first["next_cursor"]}).json()
    assert len(second["items"]) == 5
    first_ids = {i["id"] for i in first["items"]}
    second_ids = {i["id"] for i in second["items"]}
    assert first_ids.isdisjoint(second_ids)


def test_feed_source_filter_and_counts(client):
    _seed_feed_items(12)
    counts = client.get("/api/climate/feed", params={"limit": 50}).json()["counts"]
    assert counts["all"] == 12

    for key in ("WMO", "NHMS", "UN", "Climate", "Finance"):
        if counts.get(key):
            res = client.get("/api/climate/feed", params={"source": key, "limit": 50})
            items = res.json()["items"]
            assert items, key
            assert all(i["source"] == key for i in items)
            break
    else:
        pytest.fail("expected at least one populated source category")


def test_feed_search(client):
    _seed_feed_items(12)
    res = client.get("/api/climate/feed", params={"search": "climate", "limit": 50})
    assert res.status_code == 200
    for item in res.json()["items"]:
        haystack = (item["text"] + item["author"]).lower()
        assert "climate" in haystack


def test_events_sorted_and_shaped(client):
    inserted = _seed_events(6)
    assert inserted == 6
    res = client.get("/api/climate/events")
    assert res.status_code == 200
    body = res.json()
    events = body["events"]
    assert len(events) == 6
    dates = [e["date"] for e in events]
    assert dates == sorted(dates)
    for ev in events:
        for key in ("id", "date", "day", "month", "title", "location"):
            assert key in ev


def test_stats_reflects_seeded_data(client):
    _seed_feed_items(12)
    res = client.get("/api/climate/stats")
    assert res.status_code == 200
    body = res.json()
    assert body["posts_today"] == 12
    assert isinstance(body["engagement"], str)
    assert body["active_sources"] > 0
    assert isinstance(body["recent_alerts"], list)


def test_climate_page_serves_html(client):
    res = client.get("/climate")
    assert res.status_code == 200
    assert "Climate Pulse" in res.text


def test_broadcaster_pub_sub():
    from app.climate.ingestion import Broadcaster

    b = Broadcaster()
    q1 = b.subscribe()
    q2 = b.subscribe()
    b.publish("item", {"id": "abc"})
    assert q1.get_nowait() == {"event": "item", "data": {"id": "abc"}}
    assert q2.get_nowait() == {"event": "item", "data": {"id": "abc"}}

    b.unsubscribe(q1)
    b.publish("item", {"id": "def"})
    assert q2.get_nowait() == {"event": "item", "data": {"id": "def"}}
    assert q1.empty()
