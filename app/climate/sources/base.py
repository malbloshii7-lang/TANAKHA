class FeedSource:
    """A pollable source of normalized feed items (see data contract in README).

    Subclasses implement `poll()`. `seed()` is optional and is used once, at
    first startup, to backfill a non-empty feed instead of starting blank.
    """

    name = "base"
    poll_interval = 60.0

    async def poll(self) -> list[dict]:
        raise NotImplementedError

    async def seed(self) -> list[dict]:
        return []

    def next_delay(self) -> float:
        return self.poll_interval


class EventSource:
    """A pollable source of normalized calendar events."""

    name = "base"
    poll_interval = 300.0

    async def poll(self) -> list[dict]:
        raise NotImplementedError

    async def seed(self) -> list[dict]:
        return []

    def next_delay(self) -> float:
        return self.poll_interval
