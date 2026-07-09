import datetime
import logging
import re

import httpx
from defusedxml.ElementTree import fromstring

from ..normalize import is_breaking, stable_id
from .base import FeedSource

logger = logging.getLogger(__name__)

MAX_FEED_BYTES = 2 * 1024 * 1024  # bound entity-expansion / memory impact per feed
FETCH_TIMEOUT = 12.0

# Free, keyless, public RSS/Atom feeds relevant to weather hazards and climate
# response coordination. No X/Twitter or LinkedIn equivalent exists without a
# paid/partnered API (see README) — this is the "real, no-key" ingestion path.
FEEDS = [
    {"url": "https://alerts.weather.gov/cap/us.php?x=0", "source": "NHMS",
     "author": "NWS Alerts", "handle": "@NWS", "avatar": "US", "role": "United States"},
    {"url": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.atom",
     "source": "Climate", "author": "USGS Earthquake Hazards", "handle": "@USGS",
     "avatar": "US", "role": "Geological Survey"},
    {"url": "https://reliefweb.int/updates/rss.xml", "source": "UN",
     "author": "ReliefWeb", "handle": "@reliefweb", "avatar": "RW",
     "role": "UN OCHA Humanitarian Updates"},
    {"url": "https://www.gdacs.org/xml/rss.xml", "source": "UN",
     "author": "GDACS", "handle": "@gdacs", "avatar": "GD",
     "role": "Global Disaster Alert Coordination System"},
]

_ATOM_NS = "{http://www.w3.org/2005/Atom}"
_TAG_RE = re.compile(r"<[^>]+>")


def _strip_html(text: str | None) -> str:
    if not text:
        return ""
    return _TAG_RE.sub("", text).strip()


def _parse_entries(xml_bytes: bytes) -> list[dict]:
    root = fromstring(xml_bytes)
    entries: list[dict] = []

    if root.tag == f"{_ATOM_NS}feed":
        for entry in root.findall(f"{_ATOM_NS}entry"):
            title = entry.findtext(f"{_ATOM_NS}title") or ""
            summary = entry.findtext(f"{_ATOM_NS}summary") or entry.findtext(f"{_ATOM_NS}content") or ""
            entry_id = entry.findtext(f"{_ATOM_NS}id") or title
            published = entry.findtext(f"{_ATOM_NS}updated") or entry.findtext(f"{_ATOM_NS}published")
            entries.append({
                "guid": entry_id, "title": title.strip(),
                "summary": _strip_html(summary), "published": published,
            })
        return entries

    # RSS 2.0
    for item in root.findall(".//item"):
        title = item.findtext("title") or ""
        summary = item.findtext("description") or ""
        guid = item.findtext("guid") or item.findtext("link") or title
        published = item.findtext("pubDate")
        entries.append({
            "guid": guid, "title": title.strip(),
            "summary": _strip_html(summary), "published": published,
        })
    return entries


def _parse_timestamp(raw: str | None) -> str:
    if raw:
        for fmt in ("%a, %d %b %Y %H:%M:%S %z", "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%SZ"):
            try:
                ts = datetime.datetime.strptime(raw, fmt)
                if ts.tzinfo is None:
                    ts = ts.replace(tzinfo=datetime.timezone.utc)
                return ts.isoformat()
            except ValueError:
                continue
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


class RssFeedSource(FeedSource):
    name = "rss"
    poll_interval = 300.0  # 5 minutes — polite cadence for free public feeds

    def __init__(self, feeds: list[dict] | None = None) -> None:
        self.feeds = feeds if feeds is not None else FEEDS

    async def seed(self) -> list[dict]:
        return await self.poll()

    async def poll(self) -> list[dict]:
        items: list[dict] = []
        async with httpx.AsyncClient(timeout=FETCH_TIMEOUT, follow_redirects=True) as client:
            for feed in self.feeds:
                try:
                    items.extend(await self._poll_one(client, feed))
                except Exception:
                    logger.warning("climate rss: failed to poll %s", feed["url"], exc_info=True)
        return items

    async def _poll_one(self, client: httpx.AsyncClient, feed: dict) -> list[dict]:
        resp = await client.get(feed["url"], headers={"User-Agent": "TANAKHA-ClimatePulse/1.0"})
        resp.raise_for_status()
        body = resp.content[:MAX_FEED_BYTES]
        entries = _parse_entries(body)

        out = []
        for entry in entries[:20]:
            title, summary = entry["title"], entry["summary"]
            text = title if not summary else f"{title} — {summary}" if title else summary
            text = text.strip()[:600]
            if not text:
                continue
            out.append({
                "id": stable_id(feed["source"] + feed["url"], entry["guid"] or title),
                "source": feed["source"],
                "platform": "rss",
                "author": feed["author"],
                "handle": feed["handle"],
                "avatar": feed["avatar"],
                "role": feed["role"],
                "text": text,
                "timestamp": _parse_timestamp(entry["published"]),
                "engagement": None,
                "engagement_score": 0,
                "hasImage": False,
                "imageLabel": None,
                "isBreaking": is_breaking(text),
            })
        return out
