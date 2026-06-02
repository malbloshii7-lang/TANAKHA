"""Fetch meteorology-sector RSS/Atom feeds into web/feed.json.

Zero third-party dependencies — uses only the Python standard library so it
runs anywhere (cron, GitHub Action, a laptop) without a virtualenv. Sources
that fail (timeout, 404, malformed XML) are skipped so one bad feed never
breaks the run.

Usage:
    python -m metfeed.fetch            # fetch all sources -> web/feed.json
    python -m metfeed.fetch --limit 8  # cap items per source
"""

from __future__ import annotations

import argparse
import json
import re
import urllib.request
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from xml.etree import ElementTree as ET

from .sources import SOURCES

OUT = Path(__file__).parent / "web" / "feed.json"
USER_AGENT = "NCM-IntlAffairs-Feed/1.0 (+meteorology sector monitor)"
TIMEOUT = 15

_TAG_RE = re.compile(r"<[^>]+>")
_WS_RE = re.compile(r"\s+")


def _strip_html(text: str) -> str:
    text = _TAG_RE.sub(" ", text or "")
    text = (
        text.replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", '"')
        .replace("&#39;", "'")
        .replace("&nbsp;", " ")
    )
    return _WS_RE.sub(" ", text).strip()


def _parse_date(raw: str | None) -> str | None:
    """Return an ISO-8601 UTC string, or None if unparseable."""
    if not raw:
        return None
    raw = raw.strip()
    try:  # RFC-822 (RSS)
        return parsedate_to_datetime(raw).astimezone(timezone.utc).isoformat()
    except (TypeError, ValueError):
        pass
    for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(raw, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc).isoformat()
        except ValueError:
            continue
    return None


def _text(el, *tags) -> str | None:
    """First non-empty child text matching any of the given (namespace-agnostic) tags."""
    for child in el.iter():
        local = child.tag.split("}")[-1]
        if local in tags and child.text and child.text.strip():
            return child.text.strip()
    return None


def _items_from_xml(root) -> list:
    # RSS uses <item>, Atom uses <entry>
    items = [e for e in root.iter() if e.tag.split("}")[-1] in ("item", "entry")]
    return items


def _link_from(el) -> str | None:
    # RSS: <link>text</link>; Atom: <link href="..."/>
    for child in el.iter():
        if child.tag.split("}")[-1] == "link":
            if child.text and child.text.strip():
                return child.text.strip()
            href = child.attrib.get("href")
            if href:
                return href
    return None


def fetch_source(src: dict, limit: int) -> list[dict]:
    req = urllib.request.Request(src["url"], headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        raw = resp.read()
    root = ET.fromstring(raw)

    out = []
    for item in _items_from_xml(root)[:limit]:
        title = _text(item, "title")
        if not title:
            continue
        summary = _strip_html(_text(item, "description", "summary", "content") or "")
        if len(summary) > 320:
            summary = summary[:317].rstrip() + "…"
        out.append(
            {
                "title": _strip_html(title),
                "summary": summary,
                "link": _link_from(item),
                "published": _parse_date(
                    _text(item, "pubDate", "published", "updated", "date")
                ),
                "source_id": src["id"],
                "source": src["name"],
                "source_full": src["full_name"],
                "category": src["category"],
                "tier": src["tier"],
            }
        )
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description="Fetch meteorology-sector feeds.")
    ap.add_argument("--limit", type=int, default=12, help="max items per source")
    args = ap.parse_args()

    all_items: list[dict] = []
    ok, failed = 0, 0
    for src in SOURCES:
        try:
            items = fetch_source(src, args.limit)
            all_items.extend(items)
            ok += 1
            print(f"  ✓ {src['name']:<14} {len(items)} items")
        except Exception as exc:  # noqa: BLE001 — one bad feed must not stop the run
            failed += 1
            print(f"  ✗ {src['name']:<14} skipped ({exc})")

    # Don't clobber a good feed with an empty run (e.g. every source blocked).
    if not all_items and OUT.exists():
        print("\nNo items fetched — keeping existing feed.json untouched.")
        return

    # Newest first; undated items sink to the bottom.
    all_items.sort(key=lambda i: i.get("published") or "", reverse=True)

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "sources_ok": ok,
        "sources_failed": failed,
        "count": len(all_items),
        "items": all_items,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nWrote {len(all_items)} items from {ok} sources -> {OUT}")


if __name__ == "__main__":
    main()
