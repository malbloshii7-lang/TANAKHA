import os
import uuid


def media_dir() -> str:
    return os.getenv("MEDIA_DIR", "media")


def ensure_media_dir() -> str:
    d = media_dir()
    os.makedirs(d, exist_ok=True)
    return d


def save_image(data: bytes, ext: str = "jpg") -> str:
    """Persist image bytes to the media dir, return the served URL path."""
    ensure_media_dir()
    name = f"{uuid.uuid4().hex}.{ext}"
    with open(os.path.join(media_dir(), name), "wb") as f:
        f.write(data)
    return f"/media/{name}"
