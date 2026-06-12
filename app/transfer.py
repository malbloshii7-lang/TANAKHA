"""Heavy file transfers: streamed storage, share tokens, and expiry cleanup."""

import datetime
import os
import re
import secrets

from fastapi import UploadFile

from . import db

TRANSFER_TTL_DAYS = 7
_CHUNK_BYTES = 1024 * 1024
_UNSAFE_CHARS = re.compile(r"[\x00-\x1f\x7f]")


class TransferTooLarge(Exception):
    pass


def max_transfer_bytes() -> int:
    return int(os.getenv("MAX_TRANSFER_BYTES", str(2 * 1024**3)))


def transfer_dir() -> str:
    return os.getenv("TRANSFER_DIR", "transfers")


def ensure_transfer_dir() -> str:
    d = transfer_dir()
    os.makedirs(d, exist_ok=True)
    return d


def new_token() -> str:
    return secrets.token_urlsafe(24)


def now_utc() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


def iso(dt: datetime.datetime) -> str:
    return dt.isoformat(timespec="seconds")


def sanitize_filename(name: str) -> str:
    """Safe value for Content-Disposition: no path parts, no control chars."""
    name = os.path.basename(name.replace("\\", "/"))
    name = _UNSAFE_CHARS.sub("", name).strip().strip(".")
    return name or "download"


async def save_upload(upload: UploadFile, dest_path: str) -> int:
    """Stream the upload to dest_path in chunks; returns total bytes written.

    Removes the partial file and raises TransferTooLarge past the size limit.
    """
    limit = max_transfer_bytes()
    total = 0
    try:
        with open(dest_path, "wb") as out:
            while True:
                chunk = await upload.read(_CHUNK_BYTES)
                if not chunk:
                    break
                total += len(chunk)
                if total > limit:
                    raise TransferTooLarge()
                out.write(chunk)
    except TransferTooLarge:
        remove_quiet(dest_path)
        raise
    return total


def purge_expired() -> int:
    """Delete expired transfer files and rows; returns count removed."""
    removed = 0
    for row in db.list_expired_transfers(iso(now_utc())):
        remove_quiet(row["stored_path"])
        db.delete_transfer(row["token"])
        removed += 1
    return removed


def remove_quiet(path: str) -> None:
    try:
        os.remove(path)
    except FileNotFoundError:
        pass
