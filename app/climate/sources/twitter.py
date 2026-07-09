import datetime
import logging
import os

import httpx

from ..normalize import is_breaking, stable_id
from .base import FeedSource

logger = logging.getLogger(__name__)

SEARCH_URL = "https://api.twitter.com/2/tweets/search/recent"

# Seed account list from the design handoff's SAMPLE_FEED — a reasonable
# starting point for which WMO/NHMS/UN accounts to track. Real X API v2
# search requires a paid tier and a bearer token; this source is a no-op
# unless X_BEARER_TOKEN is set (see get_sources() in ingestion.py).
SEED_ACCOUNTS = {
    "WMO": "WMO", "NOAA": "NHMS", "NWS": "NHMS", "metoffice": "NHMS",
    "JMA_kishou": "NHMS", "UNEP": "UN", "UNFCCC": "UN", "WHO": "UN",
    "IPCC_CH": "Climate", "NASAClimate": "Climate", "GCF": "Finance",
}


def _initials(name: str) -> str:
    parts = [p for p in name.replace(".", " ").split() if p]
    if not parts:
        return "??"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()


class TwitterFeedSource(FeedSource):
    name = "twitter"
    poll_interval = 90.0

    def __init__(self, bearer_token: str | None = None) -> None:
        self.bearer_token = bearer_token or os.getenv("X_BEARER_TOKEN")
        self._since_id: str | None = None

    @property
    def enabled(self) -> bool:
        return bool(self.bearer_token)

    async def poll(self) -> list[dict]:
        if not self.enabled:
            return []
        query = " OR ".join(f"from:{h}" for h in SEED_ACCOUNTS)
        params = {
            "query": f"({query}) -is:retweet",
            "tweet.fields": "created_at,public_metrics,author_id",
            "expansions": "author_id",
            "user.fields": "name,username",
            "max_results": "25",
        }
        if self._since_id:
            params["since_id"] = self._since_id

        headers = {"Authorization": f"Bearer {self.bearer_token}"}
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                resp = await client.get(SEARCH_URL, params=params, headers=headers)
                resp.raise_for_status()
                payload = resp.json()
        except Exception:
            logger.warning("climate twitter: search request failed", exc_info=True)
            return []

        tweets = payload.get("data", [])
        if tweets:
            self._since_id = tweets[0]["id"]
        users = {u["id"]: u for u in payload.get("includes", {}).get("users", [])}

        out = []
        for tweet in tweets:
            author = users.get(tweet.get("author_id"), {})
            username = author.get("username", "unknown")
            name = author.get("name", username)
            metrics = tweet.get("public_metrics", {})
            reposts = metrics.get("retweet_count", 0)
            likes = metrics.get("like_count", 0)
            out.append({
                "id": stable_id("twitter", tweet["id"]),
                "source": SEED_ACCOUNTS.get(username, "Climate"),
                "platform": "twitter",
                "author": name,
                "handle": f"@{username}",
                "avatar": _initials(name),
                "role": None,
                "text": tweet.get("text", "").strip()[:600],
                "timestamp": tweet.get("created_at", datetime.datetime.now(datetime.timezone.utc).isoformat()),
                "engagement": f"{reposts} reposts · {likes} likes",
                "engagement_score": reposts + likes,
                "hasImage": False,
                "imageLabel": None,
                "isBreaking": is_breaking(tweet.get("text", "")),
            })
        return out
