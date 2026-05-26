import os

from .base import ImageProvider
from .mock import MockProvider


def get_provider(name: str | None = None) -> ImageProvider:
    """Select the image provider.

    Defaults to the offline mock. Only returns the real (Replicate) provider
    when explicitly selected AND an API key is present — so the app never has a
    hard dependency on a key it doesn't have.
    """
    name = (name or os.getenv("IMAGE_PROVIDER", "mock")).lower()
    if name == "replicate" and os.getenv("IMAGE_API_KEY"):
        from .replicate import ReplicateProvider

        return ReplicateProvider()
    return MockProvider()


__all__ = ["ImageProvider", "MockProvider", "get_provider"]
