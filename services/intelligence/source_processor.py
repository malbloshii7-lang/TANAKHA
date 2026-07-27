"""Source ingestion: pasted text, TXT, Markdown, PDF (extractable text), JSON.

Every source keeps its original text verbatim, a normalized matching form,
detected language, dates, publisher, type, URL, reliability, ingestion
timestamp and a content hash used to prevent duplicate ingestion.

All source material is treated as untrusted input: it is data, never
instructions. Downstream provider prompts wrap it in explicit boundaries.
"""

import datetime
import hashlib
import io
import json
import re

from .arabic_normalizer import normalize_arabic, rendering_metadata
from .language import detect_language, normalize_digits

SOURCE_TYPES = {
    "government_statement", "news", "press_release", "report",
    "social_media", "commentary", "dataset", "other",
}

# Reliability of the *publisher*, distinct from confidence in any one claim.
RELIABILITY_LEVELS = {"high": 0.9, "medium": 0.65, "low": 0.4, "unverified": 0.25}

_ISO_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}")


class SourceError(ValueError):
    """Raised when a source cannot be ingested as usable evidence."""


def content_hash(text: str) -> str:
    """Stable hash of the original text used for duplicate detection."""
    return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()


def _validate_date(value: str | None, field: str) -> str | None:
    if value in (None, ""):
        return None
    value = normalize_digits(str(value)).strip()
    if not _ISO_DATE_RE.match(value):
        raise SourceError(f"{field} must be ISO-8601 (got {value!r})")
    return value[:10]


def build_source(
    text: str,
    *,
    title: str | None = None,
    publisher: str | None = None,
    source_type: str = "other",
    url: str | None = None,
    publication_date: str | None = None,
    event_date: str | None = None,
    reliability: str = "unverified",
    origin: str = "pasted_text",
) -> dict:
    """Construct a structured source record from raw text + metadata."""
    if not text or not text.strip():
        raise SourceError("Source has no usable text.")
    if source_type not in SOURCE_TYPES:
        source_type = "other"
    if reliability not in RELIABILITY_LEVELS:
        reliability = "unverified"
    language = detect_language(text)
    return {
        "title": (title or "").strip() or None,
        "original_text": text,
        "normalized_text": normalize_arabic(text) if language in ("ar", "mixed")
        else normalize_digits(text).lower().strip(),
        "language": language,
        "rendering": rendering_metadata(language),
        "publication_date": _validate_date(publication_date, "publication_date"),
        "event_date": _validate_date(event_date, "event_date"),
        "publisher": (publisher or "").strip() or None,
        "source_type": source_type,
        "url": (url or "").strip() or None,
        "reliability": reliability,
        "reliability_score": RELIABILITY_LEVELS[reliability],
        "origin": origin,
        "ingested_at": datetime.datetime.now(datetime.timezone.utc)
        .isoformat(timespec="seconds"),
        "content_hash": content_hash(text),
    }


def extract_pdf_text(data: bytes) -> str:
    """Extract embedded text from a PDF. No OCR in this version.

    Raises SourceError with a clear flag when the PDF is scanned/unreadable —
    we never pretend extraction succeeded when no usable text was found.
    """
    try:
        from pypdf import PdfReader
    except ImportError as exc:  # pragma: no cover - environment issue
        raise SourceError("PDF support unavailable: pypdf not installed.") from exc
    try:
        reader = PdfReader(io.BytesIO(data))
        pages = [page.extract_text() or "" for page in reader.pages]
    except Exception as exc:
        raise SourceError(f"Unreadable PDF: {exc}") from exc
    text = "\n".join(pages).strip()
    # A scanned PDF typically yields empty or near-empty extraction.
    if len(re.sub(r"\s", "", text)) < 40:
        raise SourceError(
            "PDF appears to be scanned or contains no extractable text "
            "(OCR is not supported in this version)."
        )
    return text


def ingest_upload(filename: str, data: bytes, metadata: dict | None = None) -> list[dict]:
    """Ingest an uploaded file (TXT / MD / PDF / JSON) into source records.

    A JSON upload may contain one source object or a list of them; each object
    needs a 'text' field plus optional metadata fields.
    """
    metadata = metadata or {}
    name = (filename or "upload").lower()
    if name.endswith(".pdf") or data[:5] == b"%PDF-":
        text = extract_pdf_text(data)
        return [build_source(text, origin="pdf", **_meta(metadata, title=filename))]
    try:
        decoded = data.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise SourceError("File is not UTF-8 text (or a text-based PDF).") from exc
    if name.endswith(".json"):
        try:
            payload = json.loads(decoded)
        except ValueError as exc:
            raise SourceError(f"Invalid JSON source file: {exc}") from exc
        items = payload if isinstance(payload, list) else [payload]
        out = []
        for item in items:
            if not isinstance(item, dict) or not item.get("text"):
                raise SourceError("Each JSON source record needs a 'text' field.")
            out.append(
                build_source(
                    item["text"],
                    origin="json",
                    **_meta(item, title=item.get("title") or filename),
                )
            )
        return out
    origin = "markdown" if name.endswith((".md", ".markdown")) else "txt"
    return [build_source(decoded, origin=origin, **_meta(metadata, title=filename))]


def _meta(raw: dict, title: str | None = None) -> dict:
    return {
        "title": raw.get("title") or title,
        "publisher": raw.get("publisher"),
        "source_type": raw.get("source_type", "other"),
        "url": raw.get("url"),
        "publication_date": raw.get("publication_date"),
        "event_date": raw.get("event_date"),
        "reliability": raw.get("reliability", "unverified"),
    }
