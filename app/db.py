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
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS transfers (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                token       TEXT NOT NULL UNIQUE,
                filename    TEXT NOT NULL,
                stored_path TEXT NOT NULL,
                size_bytes  INTEGER NOT NULL,
                created_at  TEXT NOT NULL,
                expires_at  TEXT NOT NULL
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


def insert_transfer(
    token: str,
    filename: str,
    stored_path: str,
    size_bytes: int,
    created_at: str,
    expires_at: str,
) -> int:
    with _conn() as c:
        cur = c.execute(
            """
            INSERT INTO transfers
                (token, filename, stored_path, size_bytes, created_at, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (token, filename, stored_path, size_bytes, created_at, expires_at),
        )
        return int(cur.lastrowid)


def get_transfer(token: str) -> dict | None:
    with _conn() as c:
        row = c.execute("SELECT * FROM transfers WHERE token = ?", (token,)).fetchone()
    return dict(row) if row else None


def delete_transfer(token: str) -> None:
    with _conn() as c:
        c.execute("DELETE FROM transfers WHERE token = ?", (token,))


def list_expired_transfers(now_iso: str) -> list[dict]:
    with _conn() as c:
        rows = c.execute(
            "SELECT * FROM transfers WHERE expires_at <= ?", (now_iso,)
        ).fetchall()
    return [dict(r) for r in rows]


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
