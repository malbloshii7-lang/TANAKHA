import datetime
import hashlib
import re

BREAKING_KEYWORDS = (
    "warning", "alert", "emergency", "evacuat", "tsunami", "earthquake",
    "wildfire", "flood", "heatwave", "heat wave", "hurricane", "cyclone",
    "typhoon", "record", "extreme", "red alert", "level 4", "severe",
    "highest alert", "excessive heat",
)

_MULTIPLIERS = {"k": 1_000, "m": 1_000_000, "b": 1_000_000_000}


def stable_id(source: str, external_id: str) -> str:
    """Deterministic dedup key so re-polling the same item never double-inserts."""
    raw = f"{source}:{external_id}".encode("utf-8")
    return hashlib.sha1(raw).hexdigest()[:20]


def parse_engagement_score(engagement: str | None) -> int:
    """Best-effort sum of the numbers in a freeform engagement string like
    '1.8k reposts · 4.2k likes' -> 6000."""
    if not engagement:
        return 0
    total = 0
    for match in re.finditer(r"(\d+(?:\.\d+)?)\s*([kmb])?", engagement.lower()):
        value = float(match.group(1))
        suffix = match.group(2)
        total += int(value * _MULTIPLIERS.get(suffix, 1))
    return total


def is_breaking(text: str) -> bool:
    lowered = text.lower()
    return any(kw in lowered for kw in BREAKING_KEYWORDS)


def relative_time(timestamp: str) -> str:
    try:
        ts = datetime.datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
    except ValueError:
        return timestamp
    now = datetime.datetime.now(datetime.timezone.utc)
    delta = (now - ts).total_seconds()
    if delta < 90:
        return "just now"
    if delta < 3600:
        return f"{int(delta // 60)}m ago"
    if delta < 86400:
        return f"{int(delta // 3600)}h ago"
    return f"{int(delta // 86400)}d ago"


def attach_relative_time(item: dict) -> dict:
    item["time"] = relative_time(item["timestamp"])
    return item
