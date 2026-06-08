"""SQLite storage for the campaign portal.

Tables: portal_users, contacts, documents, share_links, status_updates.
Kept separate from the legacy `leads` table so the two apps never collide.
"""
import datetime
import os
import sqlite3


def _db_path() -> str:
    # Reuse the app-wide DATABASE_PATH so a single managed DB holds everything.
    return os.getenv("DATABASE_PATH", "tanakha.db")


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def now() -> str:
    return datetime.datetime.utcnow().isoformat(timespec="seconds")


def init_db() -> None:
    with _conn() as c:
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS portal_users (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                username   TEXT NOT NULL UNIQUE,
                name       TEXT,
                role       TEXT NOT NULL DEFAULT 'editor',   -- admin | editor | viewer
                lang       TEXT NOT NULL DEFAULT 'en',
                pw_salt    TEXT NOT NULL,
                pw_hash    TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS contacts (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                name         TEXT NOT NULL,
                country      TEXT,
                role         TEXT,        -- PR | MFA | Embassy | Other
                region       TEXT,        -- RA I .. RA VI
                organization TEXT,
                email        TEXT,
                phone        TEXT,
                language     TEXT,
                owner        TEXT,        -- relationship owner on our team
                stance       TEXT DEFAULT 'unknown',  -- supportive|neutral|opposed|unknown
                last_contact TEXT,
                next_action  TEXT,
                notes        TEXT,
                created_at   TEXT NOT NULL,
                updated_at   TEXT NOT NULL
            )
            """
        )
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS documents (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                title_en   TEXT,
                title_ar   TEXT,
                doc_type   TEXT,         -- cv | portfolio | vision | endorsement | other
                url        TEXT NOT NULL,
                version    TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS share_links (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
                token       TEXT NOT NULL UNIQUE,
                expires_at  TEXT,
                views       INTEGER NOT NULL DEFAULT 0,
                created_at  TEXT NOT NULL
            )
            """
        )
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS status_updates (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                phase            TEXT,
                vote_estimate    TEXT,
                regional_snapshot TEXT,
                key_dates        TEXT,
                note_en          TEXT,
                note_ar          TEXT,
                updated_by       TEXT,
                updated_at       TEXT NOT NULL
            )
            """
        )


# ---- users -------------------------------------------------------------

def get_user(username: str) -> dict | None:
    with _conn() as c:
        row = c.execute(
            "SELECT * FROM portal_users WHERE username = ?", (username,)
        ).fetchone()
    return dict(row) if row else None


def create_user(username: str, name: str, role: str, salt: str, pw_hash: str,
                lang: str = "en") -> int:
    with _conn() as c:
        cur = c.execute(
            """INSERT INTO portal_users (username, name, role, lang, pw_salt, pw_hash, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (username, name, role, lang, salt, pw_hash, now()),
        )
        return int(cur.lastrowid)


def count_users() -> int:
    with _conn() as c:
        return int(c.execute("SELECT COUNT(*) AS n FROM portal_users").fetchone()["n"])


# ---- contacts ----------------------------------------------------------

CONTACT_FIELDS = [
    "name", "country", "role", "region", "organization", "email", "phone",
    "language", "owner", "stance", "last_contact", "next_action", "notes",
]


def list_contacts() -> list[dict]:
    with _conn() as c:
        rows = c.execute("SELECT * FROM contacts ORDER BY country, name").fetchall()
    return [dict(r) for r in rows]


def insert_contact(data: dict) -> int:
    vals = [data.get(f) for f in CONTACT_FIELDS]
    with _conn() as c:
        cur = c.execute(
            f"""INSERT INTO contacts ({', '.join(CONTACT_FIELDS)}, created_at, updated_at)
                VALUES ({', '.join('?' for _ in CONTACT_FIELDS)}, ?, ?)""",
            (*vals, now(), now()),
        )
        return int(cur.lastrowid)


def update_contact(contact_id: int, data: dict) -> bool:
    fields = [f for f in CONTACT_FIELDS if f in data]
    if not fields:
        return False
    assignments = ", ".join(f"{f} = ?" for f in fields)
    vals = [data[f] for f in fields]
    with _conn() as c:
        cur = c.execute(
            f"UPDATE contacts SET {assignments}, updated_at = ? WHERE id = ?",
            (*vals, now(), contact_id),
        )
        return cur.rowcount > 0


def delete_contact(contact_id: int) -> bool:
    with _conn() as c:
        cur = c.execute("DELETE FROM contacts WHERE id = ?", (contact_id,))
        return cur.rowcount > 0


# ---- documents & share links ------------------------------------------

def list_documents() -> list[dict]:
    with _conn() as c:
        docs = [dict(r) for r in c.execute(
            "SELECT * FROM documents ORDER BY id DESC").fetchall()]
        for d in docs:
            d["share_links"] = [dict(r) for r in c.execute(
                "SELECT id, token, expires_at, views FROM share_links WHERE document_id = ?",
                (d["id"],)).fetchall()]
    return docs


def insert_document(data: dict) -> int:
    with _conn() as c:
        cur = c.execute(
            """INSERT INTO documents (title_en, title_ar, doc_type, url, version, created_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (data.get("title_en"), data.get("title_ar"), data.get("doc_type"),
             data["url"], data.get("version"), now()),
        )
        return int(cur.lastrowid)


def delete_document(doc_id: int) -> bool:
    with _conn() as c:
        cur = c.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
        return cur.rowcount > 0


def create_share_link(document_id: int, token: str, expires_at: str | None) -> int:
    with _conn() as c:
        cur = c.execute(
            """INSERT INTO share_links (document_id, token, expires_at, created_at)
               VALUES (?, ?, ?, ?)""",
            (document_id, token, expires_at, now()),
        )
        return int(cur.lastrowid)


def resolve_share_link(token: str) -> dict | None:
    """Return the document for a valid (unexpired) token and bump the view count."""
    with _conn() as c:
        row = c.execute(
            """SELECT sl.id AS link_id, sl.expires_at, d.*
               FROM share_links sl JOIN documents d ON d.id = sl.document_id
               WHERE sl.token = ?""",
            (token,),
        ).fetchone()
        if not row:
            return None
        rec = dict(row)
        if rec.get("expires_at") and rec["expires_at"] < now():
            return None
        c.execute("UPDATE share_links SET views = views + 1 WHERE id = ?",
                  (rec["link_id"],))
    return rec


# ---- status ------------------------------------------------------------

def latest_status() -> dict | None:
    with _conn() as c:
        row = c.execute(
            "SELECT * FROM status_updates ORDER BY id DESC LIMIT 1").fetchone()
    return dict(row) if row else None


def insert_status(data: dict) -> int:
    with _conn() as c:
        cur = c.execute(
            """INSERT INTO status_updates
                 (phase, vote_estimate, regional_snapshot, key_dates,
                  note_en, note_ar, updated_by, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (data.get("phase"), data.get("vote_estimate"),
             data.get("regional_snapshot"), data.get("key_dates"),
             data.get("note_en"), data.get("note_ar"),
             data.get("updated_by"), now()),
        )
        return int(cur.lastrowid)
