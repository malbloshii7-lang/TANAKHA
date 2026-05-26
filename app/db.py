import datetime
import json
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
            CREATE TABLE IF NOT EXISTS leads (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at  TEXT NOT NULL,
                name        TEXT,
                email       TEXT NOT NULL,
                address     TEXT,
                zip         TEXT,
                style       TEXT,
                brief_json  TEXT,
                before_url  TEXT,
                after_url   TEXT,
                status      TEXT NOT NULL DEFAULT 'new'
            )
            """
        )


def insert_lead(data: dict) -> int:
    brief = data.get("brief")
    with _conn() as c:
        cur = c.execute(
            """
            INSERT INTO leads
                (created_at, name, email, address, zip, style, brief_json,
                 before_url, after_url, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                datetime.datetime.utcnow().isoformat(timespec="seconds"),
                data.get("name"),
                data.get("email"),
                data.get("address"),
                data.get("zip"),
                data.get("style"),
                json.dumps(brief) if brief is not None else None,
                data.get("before_url"),
                data.get("after_url"),
                data.get("status", "new"),
            ),
        )
        return int(cur.lastrowid)


def list_leads() -> list[dict]:
    with _conn() as c:
        rows = c.execute("SELECT * FROM leads ORDER BY id DESC").fetchall()
    out = []
    for r in rows:
        d = dict(r)
        raw = d.pop("brief_json", None)
        if raw:
            try:
                d["brief"] = json.loads(raw)
            except (ValueError, TypeError):
                d["brief"] = None
        else:
            d["brief"] = None
        out.append(d)
    return out
