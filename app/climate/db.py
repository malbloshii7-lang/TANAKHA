import datetime
import os
import sqlite3


def _db_path() -> str:
    return os.getenv("DATABASE_PATH", "tanakha.db")


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(_db_path())
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _conn() as c:
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS climate_feed_items (
                seq              INTEGER PRIMARY KEY AUTOINCREMENT,
                id               TEXT NOT NULL UNIQUE,
                source           TEXT NOT NULL,
                platform         TEXT NOT NULL,
                author           TEXT NOT NULL,
                handle           TEXT NOT NULL,
                avatar           TEXT NOT NULL,
                role             TEXT,
                text             TEXT NOT NULL,
                timestamp        TEXT NOT NULL,
                engagement       TEXT,
                engagement_score INTEGER NOT NULL DEFAULT 0,
                has_image        INTEGER NOT NULL DEFAULT 0,
                image_label      TEXT,
                is_breaking      INTEGER NOT NULL DEFAULT 0,
                created_at       TEXT NOT NULL
            )
            """
        )
        c.execute(
            "CREATE INDEX IF NOT EXISTS idx_climate_feed_seq ON climate_feed_items(seq DESC)"
        )
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS climate_events (
                seq         INTEGER PRIMARY KEY AUTOINCREMENT,
                id          TEXT NOT NULL UNIQUE,
                date        TEXT NOT NULL,
                day         TEXT NOT NULL,
                month       TEXT NOT NULL,
                title       TEXT NOT NULL,
                location    TEXT,
                created_at  TEXT NOT NULL
            )
            """
        )
        c.execute(
            "CREATE INDEX IF NOT EXISTS idx_climate_events_date ON climate_events(date ASC)"
        )


def _row_to_item(r: sqlite3.Row) -> dict:
    d = dict(r)
    d["hasImage"] = bool(d.pop("has_image"))
    d["imageLabel"] = d.pop("image_label")
    d["isBreaking"] = bool(d.pop("is_breaking"))
    d.pop("engagement_score", None)
    d.pop("created_at", None)
    cursor = d.pop("seq")
    d["cursor"] = cursor
    return d


def insert_feed_item(item: dict) -> bool:
    """Insert a normalized feed item. Returns False if it's a dup (already ingested)."""
    with _conn() as c:
        try:
            c.execute(
                """
                INSERT INTO climate_feed_items
                    (id, source, platform, author, handle, avatar, role, text,
                     timestamp, engagement, engagement_score, has_image, image_label,
                     is_breaking, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    item["id"],
                    item["source"],
                    item["platform"],
                    item["author"],
                    item["handle"],
                    item["avatar"],
                    item.get("role"),
                    item["text"],
                    item["timestamp"],
                    item.get("engagement"),
                    int(item.get("engagement_score", 0)),
                    1 if item.get("hasImage") else 0,
                    item.get("imageLabel"),
                    1 if item.get("isBreaking") else 0,
                    datetime.datetime.utcnow().isoformat(timespec="seconds") + "Z",
                ),
            )
            return True
        except sqlite3.IntegrityError:
            return False


def list_feed_items(
    source: str | None = None,
    search: str | None = None,
    cursor: int | None = None,
    limit: int = 30,
) -> list[dict]:
    q = "SELECT * FROM climate_feed_items WHERE 1=1"
    params: list = []
    if source and source != "all":
        q += " AND source = ?"
        params.append(source)
    if search:
        q += " AND (lower(text) LIKE ? OR lower(author) LIKE ?)"
        needle = f"%{search.lower()}%"
        params.extend([needle, needle])
    if cursor is not None:
        q += " AND seq < ?"
        params.append(cursor)
    q += " ORDER BY seq DESC LIMIT ?"
    params.append(limit)
    with _conn() as c:
        rows = c.execute(q, params).fetchall()
    return [_row_to_item(r) for r in rows]


def get_feed_item_by_seq(seq: int) -> dict | None:
    with _conn() as c:
        row = c.execute(
            "SELECT * FROM climate_feed_items WHERE seq = ?", (seq,)
        ).fetchone()
    return _row_to_item(row) if row else None


def source_counts(search: str | None = None) -> dict[str, int]:
    q = "SELECT source, COUNT(*) AS n FROM climate_feed_items WHERE 1=1"
    params: list = []
    if search:
        q += " AND (lower(text) LIKE ? OR lower(author) LIKE ?)"
        needle = f"%{search.lower()}%"
        params.extend([needle, needle])
    q += " GROUP BY source"
    with _conn() as c:
        rows = c.execute(q, params).fetchall()
    counts = {r["source"]: r["n"] for r in rows}
    counts["all"] = sum(counts.values())
    return counts


def _pct_trend(current: float, previous: float) -> float | None:
    if previous <= 0:
        return None
    return round((current - previous) / previous * 100)


def stats() -> dict:
    now = datetime.datetime.utcnow()
    since = (now - datetime.timedelta(hours=24)).isoformat(timespec="seconds") + "Z"
    prev_since = (now - datetime.timedelta(hours=48)).isoformat(timespec="seconds") + "Z"

    with _conn() as c:
        posts_today = c.execute(
            "SELECT COUNT(*) FROM climate_feed_items WHERE created_at >= ?", (since,)
        ).fetchone()[0]
        posts_prev = c.execute(
            "SELECT COUNT(*) FROM climate_feed_items WHERE created_at >= ? AND created_at < ?",
            (prev_since, since),
        ).fetchone()[0]
        alerts = c.execute(
            "SELECT COUNT(*) FROM climate_feed_items WHERE is_breaking = 1 AND created_at >= ?",
            (since,),
        ).fetchone()[0]
        alerts_prev = c.execute(
            "SELECT COUNT(*) FROM climate_feed_items WHERE is_breaking = 1 AND created_at >= ? AND created_at < ?",
            (prev_since, since),
        ).fetchone()[0]
        active_sources = c.execute(
            "SELECT COUNT(DISTINCT handle) FROM climate_feed_items"
        ).fetchone()[0]
        active_sources_prev = c.execute(
            "SELECT COUNT(DISTINCT handle) FROM climate_feed_items WHERE created_at < ?", (since,)
        ).fetchone()[0]
        engagement = c.execute(
            "SELECT COALESCE(SUM(engagement_score), 0) FROM climate_feed_items WHERE created_at >= ?",
            (since,),
        ).fetchone()[0]
        engagement_prev = c.execute(
            "SELECT COALESCE(SUM(engagement_score), 0) FROM climate_feed_items WHERE created_at >= ? AND created_at < ?",
            (prev_since, since),
        ).fetchone()[0]
        recent_alerts = c.execute(
            """
            SELECT text, timestamp FROM climate_feed_items
            WHERE is_breaking = 1 ORDER BY seq DESC LIMIT 5
            """
        ).fetchall()
    return {
        "posts_today": posts_today,
        "posts_today_trend": _pct_trend(posts_today, posts_prev),
        "alerts": alerts,
        "alerts_trend": _pct_trend(alerts, alerts_prev),
        "active_sources": active_sources,
        "active_sources_trend": _pct_trend(active_sources, active_sources_prev),
        "engagement_score": engagement,
        "engagement_trend": _pct_trend(engagement, engagement_prev),
        "recent_alerts": [dict(r) for r in recent_alerts],
    }


def insert_event(ev: dict) -> bool:
    with _conn() as c:
        try:
            c.execute(
                """
                INSERT INTO climate_events (id, date, day, month, title, location, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    ev["id"],
                    ev["date"],
                    ev["day"],
                    ev["month"],
                    ev["title"],
                    ev.get("location"),
                    datetime.datetime.utcnow().isoformat(timespec="seconds") + "Z",
                ),
            )
            return True
        except sqlite3.IntegrityError:
            return False


def list_events(limit: int = 20) -> list[dict]:
    with _conn() as c:
        rows = c.execute(
            "SELECT * FROM climate_events WHERE date >= date('now') "
            "ORDER BY date ASC LIMIT ?",
            (limit,),
        ).fetchall()
    out = []
    for r in rows:
        d = dict(r)
        d["cursor"] = d.pop("seq")
        d.pop("created_at", None)
        out.append(d)
    return out


def event_count() -> int:
    with _conn() as c:
        return c.execute(
            "SELECT COUNT(*) FROM climate_events WHERE date >= date('now')"
        ).fetchone()[0]
