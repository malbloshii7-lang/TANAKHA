import asyncio
import logging
import os

from . import db
from .normalize import attach_relative_time
from .sources import EventSource, FeedSource, MockEventSource, MockFeedSource, RssFeedSource, TwitterFeedSource

logger = logging.getLogger(__name__)


class Broadcaster:
    """Tiny in-process pub/sub so SSE clients see new rows the moment ingestion writes them."""

    def __init__(self) -> None:
        self._subscribers: set[asyncio.Queue] = set()

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue(maxsize=200)
        self._subscribers.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        self._subscribers.discard(q)

    def publish(self, event: str, payload: dict) -> None:
        for q in list(self._subscribers):
            try:
                q.put_nowait({"event": event, "data": payload})
            except asyncio.QueueFull:
                logger.warning("climate broadcaster: dropping event for slow subscriber")


feed_broadcaster = Broadcaster()


def build_feed_sources() -> list[FeedSource]:
    names = [n.strip() for n in os.getenv("CLIMATE_SOURCES", "mock").split(",") if n.strip()]
    sources: list[FeedSource] = []
    for name in names:
        if name == "mock":
            sources.append(MockFeedSource())
        elif name == "rss":
            sources.append(RssFeedSource())
        elif name == "twitter":
            twitter = TwitterFeedSource()
            if twitter.enabled:
                sources.append(twitter)
            else:
                logger.info("climate ingestion: X_BEARER_TOKEN not set, skipping twitter source")
    return sources


def build_event_sources() -> list[EventSource]:
    names = [n.strip() for n in os.getenv("CLIMATE_EVENT_SOURCES", "mock").split(",") if n.strip()]
    sources: list[EventSource] = []
    for name in names:
        if name == "mock":
            sources.append(MockEventSource())
    return sources


class IngestionManager:
    def __init__(self, feed_sources: list[FeedSource], event_sources: list[EventSource]) -> None:
        self.feed_sources = feed_sources
        self.event_sources = event_sources
        self._tasks: list[asyncio.Task] = []

    async def start(self) -> None:
        for source in self.feed_sources:
            self._tasks.append(asyncio.create_task(self._run_feed_source(source)))
        for source in self.event_sources:
            self._tasks.append(asyncio.create_task(self._run_event_source(source)))

    async def stop(self) -> None:
        for task in self._tasks:
            task.cancel()
        if self._tasks:
            await asyncio.gather(*self._tasks, return_exceptions=True)
        self._tasks = []

    async def _run_feed_source(self, source: FeedSource) -> None:
        try:
            for item in await source.seed():
                db.insert_feed_item(item)
        except Exception:
            logger.exception("climate ingestion: seed failed for source %s", source.name)

        while True:
            try:
                await asyncio.sleep(source.next_delay())
                for item in await source.poll():
                    if db.insert_feed_item(item):
                        feed_broadcaster.publish("item", attach_relative_time(dict(item)))
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("climate ingestion: poll failed for source %s", source.name)

    async def _run_event_source(self, source: EventSource) -> None:
        try:
            for ev in await source.seed():
                db.insert_event(ev)
        except Exception:
            logger.exception("climate ingestion: event seed failed for source %s", source.name)

        while True:
            try:
                await asyncio.sleep(source.next_delay())
                for ev in await source.poll():
                    if db.insert_event(ev):
                        feed_broadcaster.publish("calendar_event", ev)
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("climate ingestion: event poll failed for source %s", source.name)
