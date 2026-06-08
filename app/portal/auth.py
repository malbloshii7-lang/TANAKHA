"""Stateless, team-only auth using stdlib only (no extra deps).

- Passwords: PBKDF2-HMAC-SHA256 with a per-user salt.
- Sessions: signed, expiring tokens (HMAC) — no server-side session store needed,
  which keeps it robust on ephemeral/free hosting.

Set PORTAL_SECRET in production. A random secret is generated if unset, which
simply means existing tokens are invalidated on restart (acceptable for a demo).
"""
import base64
import hashlib
import hmac
import json
import os
import secrets
import time

_PBKDF2_ROUNDS = 200_000
_TOKEN_TTL_SECONDS = 7 * 24 * 3600  # 7 days


def _secret() -> bytes:
    return os.getenv("PORTAL_SECRET", _RUNTIME_SECRET).encode("utf-8")


_RUNTIME_SECRET = secrets.token_hex(32)


# ---- passwords ---------------------------------------------------------

def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    salt = salt or secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"),
                             salt.encode("utf-8"), _PBKDF2_ROUNDS)
    return salt, dk.hex()


def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    _, computed = hash_password(password, salt)
    return hmac.compare_digest(computed, expected_hash)


# ---- tokens ------------------------------------------------------------

def _b64e(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def _b64d(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def issue_token(username: str, role: str) -> str:
    payload = {"u": username, "r": role, "exp": int(time.time()) + _TOKEN_TTL_SECONDS}
    body = _b64e(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    sig = _b64e(hmac.new(_secret(), body.encode("ascii"), hashlib.sha256).digest())
    return f"{body}.{sig}"


def verify_token(token: str) -> dict | None:
    try:
        body, sig = token.split(".", 1)
    except ValueError:
        return None
    expected = _b64e(hmac.new(_secret(), body.encode("ascii"), hashlib.sha256).digest())
    if not hmac.compare_digest(sig, expected):
        return None
    try:
        payload = json.loads(_b64d(body))
    except (ValueError, json.JSONDecodeError):
        return None
    if int(payload.get("exp", 0)) < int(time.time()):
        return None
    return payload
