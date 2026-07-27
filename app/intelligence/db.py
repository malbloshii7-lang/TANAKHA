"""SQLite persistence for the PrimeAI Situation Room intelligence feature.

Follows the repo's established SQLite conventions (see app/db.py and
app/climate/db.py): one connection per operation, Row factory, idempotent
init. Analysis runs are audit records — raw provider output is stored on the
run, separately from the approved analytical objects.
"""

import datetime
import json
import os
import sqlite3
import uuid


def _db_path() -> str:
    return os.getenv("DATABASE_PATH", "tanakha.db")


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(_db_path())
    conn.row_factory = sqlite3.Row
    return conn


def _now() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")


def _new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:10]}"


def init_db() -> None:
    with _conn() as c:
        c.executescript(
            """
            CREATE TABLE IF NOT EXISTS intel_briefs (
                brief_id            TEXT PRIMARY KEY,
                title               TEXT NOT NULL,
                strategic_question  TEXT,
                created_at          TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS intel_sources (
                source_id        TEXT PRIMARY KEY,
                brief_id         TEXT,
                title            TEXT,
                original_text    TEXT NOT NULL,
                normalized_text  TEXT NOT NULL,
                language         TEXT NOT NULL,
                rendering_json   TEXT,
                publication_date TEXT,
                event_date       TEXT,
                publisher        TEXT,
                source_type      TEXT NOT NULL,
                url              TEXT,
                reliability      TEXT NOT NULL,
                reliability_score REAL NOT NULL,
                origin           TEXT NOT NULL,
                ingested_at      TEXT NOT NULL,
                content_hash     TEXT NOT NULL UNIQUE
            );
            CREATE TABLE IF NOT EXISTS intel_runs (
                run_id             TEXT PRIMARY KEY,
                brief_id           TEXT,
                strategic_question TEXT,
                knowledge_cutoff   TEXT,
                provider           TEXT NOT NULL,
                model_id           TEXT,
                source_ids_json    TEXT NOT NULL,
                status             TEXT NOT NULL,
                error              TEXT,
                result_json        TEXT,
                raw_provider_json  TEXT,
                warnings_json      TEXT,
                created_at         TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS intel_claims (
                claim_id      TEXT NOT NULL,
                run_id        TEXT NOT NULL,
                claim_type    TEXT NOT NULL,
                text          TEXT NOT NULL,
                source_ids_json TEXT NOT NULL,
                confidence    REAL,
                claim_json    TEXT NOT NULL,
                review_status TEXT NOT NULL DEFAULT 'pending',
                reviewed_at   TEXT,
                PRIMARY KEY (run_id, claim_id)
            );
            CREATE TABLE IF NOT EXISTS intel_review_queue (
                item_id     TEXT PRIMARY KEY,
                run_id      TEXT NOT NULL,
                item_type   TEXT NOT NULL,
                ref_id      TEXT NOT NULL,
                kind        TEXT,
                description TEXT,
                status      TEXT NOT NULL DEFAULT 'open',
                created_at  TEXT NOT NULL
            );
            """
        )


# ------------------------------------------------------------------- briefs
def upsert_brief(brief_id: str, title: str, strategic_question: str | None) -> None:
    with _conn() as c:
        c.execute(
            "INSERT OR IGNORE INTO intel_briefs "
            "(brief_id, title, strategic_question, created_at) VALUES (?,?,?,?)",
            (brief_id, title, strategic_question, _now()),
        )


def list_briefs() -> list[dict]:
    with _conn() as c:
        rows = c.execute(
            "SELECT * FROM intel_briefs ORDER BY created_at DESC").fetchall()
    return [dict(r) for r in rows]


# ------------------------------------------------------------------ sources
def insert_source(source: dict, brief_id: str | None = None) -> tuple[str, bool]:
    """Insert a source record. Returns (source_id, created). Duplicate
    content (by hash) returns the existing record instead of re-ingesting."""
    with _conn() as c:
        row = c.execute(
            "SELECT source_id FROM intel_sources WHERE content_hash = ?",
            (source["content_hash"],),
        ).fetchone()
        if row:
            return row["source_id"], False
        source_id = _new_id("src")
        c.execute(
            """
            INSERT INTO intel_sources
                (source_id, brief_id, title, original_text, normalized_text,
                 language, rendering_json, publication_date, event_date,
                 publisher, source_type, url, reliability, reliability_score,
                 origin, ingested_at, content_hash)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                source_id, brief_id, source.get("title"),
                source["original_text"], source["normalized_text"],
                source["language"], json.dumps(source.get("rendering")),
                source.get("publication_date"), source.get("event_date"),
                source.get("publisher"), source["source_type"],
                source.get("url"), source["reliability"],
                source["reliability_score"], source["origin"],
                source["ingested_at"], source["content_hash"],
            ),
        )
        return source_id, True


def _source_row_to_dict(r: sqlite3.Row) -> dict:
    d = dict(r)
    raw = d.pop("rendering_json", None)
    d["rendering"] = json.loads(raw) if raw else None
    return d


def get_sources(source_ids: list[str]) -> list[dict]:
    if not source_ids:
        return []
    qs = ",".join("?" * len(source_ids))
    with _conn() as c:
        rows = c.execute(
            f"SELECT * FROM intel_sources WHERE source_id IN ({qs})",
            source_ids).fetchall()
    by_id = {r["source_id"]: _source_row_to_dict(r) for r in rows}
    return [by_id[s] for s in source_ids if s in by_id]


def list_sources(brief_id: str | None = None) -> list[dict]:
    with _conn() as c:
        if brief_id:
            rows = c.execute(
                "SELECT * FROM intel_sources WHERE brief_id = ? "
                "ORDER BY ingested_at DESC", (brief_id,)).fetchall()
        else:
            rows = c.execute(
                "SELECT * FROM intel_sources ORDER BY ingested_at DESC").fetchall()
    return [_source_row_to_dict(r) for r in rows]


# --------------------------------------------------------------------- runs
def create_run(
    *, brief_id: str | None, strategic_question: str | None,
    knowledge_cutoff: str | None, provider: str, model_id: str | None,
    source_ids: list[str],
) -> str:
    run_id = _new_id("run")
    with _conn() as c:
        c.execute(
            """
            INSERT INTO intel_runs
                (run_id, brief_id, strategic_question, knowledge_cutoff,
                 provider, model_id, source_ids_json, status, created_at)
            VALUES (?,?,?,?,?,?,?,?,?)
            """,
            (run_id, brief_id, strategic_question, knowledge_cutoff,
             provider, model_id, json.dumps(source_ids), "running", _now()),
        )
    return run_id


def complete_run(run_id: str, result: dict, raw_provider_output: list,
                 warnings: list) -> None:
    with _conn() as c:
        c.execute(
            "UPDATE intel_runs SET status='completed', result_json=?, "
            "raw_provider_json=?, warnings_json=? WHERE run_id=?",
            (json.dumps(result, ensure_ascii=False),
             json.dumps(raw_provider_output, ensure_ascii=False),
             json.dumps(warnings, ensure_ascii=False), run_id),
        )


def fail_run(run_id: str, error: str) -> None:
    with _conn() as c:
        c.execute(
            "UPDATE intel_runs SET status='failed', error=? WHERE run_id=?",
            (error, run_id))


def get_run(run_id: str) -> dict | None:
    with _conn() as c:
        row = c.execute(
            "SELECT * FROM intel_runs WHERE run_id=?", (run_id,)).fetchone()
    if not row:
        return None
    d = dict(row)
    d["source_ids"] = json.loads(d.pop("source_ids_json") or "[]")
    d["result"] = json.loads(d.pop("result_json") or "null")
    d["warnings"] = json.loads(d.pop("warnings_json") or "[]")
    d["raw_provider_output"] = json.loads(d.pop("raw_provider_json") or "[]")
    return d


def list_runs(brief_id: str | None = None) -> list[dict]:
    with _conn() as c:
        if brief_id:
            rows = c.execute(
                "SELECT run_id, brief_id, provider, model_id, status, "
                "created_at, knowledge_cutoff FROM intel_runs "
                "WHERE brief_id=? ORDER BY created_at DESC", (brief_id,)).fetchall()
        else:
            rows = c.execute(
                "SELECT run_id, brief_id, provider, model_id, status, "
                "created_at, knowledge_cutoff FROM intel_runs "
                "ORDER BY created_at DESC").fetchall()
    return [dict(r) for r in rows]


# ------------------------------------------------------------------- claims
def insert_claims(run_id: str, claims: list[dict]) -> None:
    with _conn() as c:
        for claim in claims:
            c.execute(
                """
                INSERT OR REPLACE INTO intel_claims
                    (claim_id, run_id, claim_type, text, source_ids_json,
                     confidence, claim_json, review_status)
                VALUES (?,?,?,?,?,?,?,?)
                """,
                (claim["claim_id"], run_id, claim["claim_type"], claim["text"],
                 json.dumps(claim.get("source_ids", [])),
                 claim.get("confidence"),
                 json.dumps(claim, ensure_ascii=False),
                 claim.get("review_status", "pending")),
            )


def get_claim(run_id: str, claim_id: str) -> dict | None:
    with _conn() as c:
        row = c.execute(
            "SELECT * FROM intel_claims WHERE run_id=? AND claim_id=?",
            (run_id, claim_id)).fetchone()
    if not row:
        return None
    d = json.loads(row["claim_json"])
    d["review_status"] = row["review_status"]
    d["reviewed_at"] = row["reviewed_at"]
    return d


def set_claim_review(run_id: str, claim_id: str, status: str) -> bool:
    with _conn() as c:
        cur = c.execute(
            "UPDATE intel_claims SET review_status=?, reviewed_at=? "
            "WHERE run_id=? AND claim_id=?",
            (status, _now(), run_id, claim_id))
        return cur.rowcount > 0


def list_claims(run_id: str) -> list[dict]:
    with _conn() as c:
        rows = c.execute(
            "SELECT * FROM intel_claims WHERE run_id=? ORDER BY claim_id",
            (run_id,)).fetchall()
    out = []
    for row in rows:
        d = json.loads(row["claim_json"])
        d["review_status"] = row["review_status"]
        d["reviewed_at"] = row["reviewed_at"]
        out.append(d)
    return out


# ------------------------------------------------------------- review queue
def insert_review_items(run_id: str, items: list[dict]) -> None:
    with _conn() as c:
        for item in items:
            c.execute(
                """
                INSERT INTO intel_review_queue
                    (item_id, run_id, item_type, ref_id, kind, description,
                     status, created_at)
                VALUES (?,?,?,?,?,?,?,?)
                """,
                (_new_id("rvw"), run_id, item["item_type"], item["ref_id"],
                 item.get("kind"), item.get("description"),
                 item.get("status", "open"), _now()),
            )


def list_review_queue(run_id: str | None = None, status: str | None = None) -> list[dict]:
    q = "SELECT * FROM intel_review_queue WHERE 1=1"
    params: list = []
    if run_id:
        q += " AND run_id=?"
        params.append(run_id)
    if status:
        q += " AND status=?"
        params.append(status)
    q += " ORDER BY created_at DESC"
    with _conn() as c:
        rows = c.execute(q, params).fetchall()
    return [dict(r) for r in rows]


def set_review_item_status(item_id: str, status: str) -> bool:
    with _conn() as c:
        cur = c.execute(
            "UPDATE intel_review_queue SET status=? WHERE item_id=?",
            (status, item_id))
        return cur.rowcount > 0
