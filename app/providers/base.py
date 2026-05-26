from abc import ABC, abstractmethod


class ImageProvider(ABC):
    """Renders an 'after' image from a 'before' yard photo + a design brief."""

    name: str = "base"

    @abstractmethod
    def render(self, before_bytes: bytes, brief: dict, style: str) -> bytes:
        """Return JPEG/PNG bytes of the transformed 'after' image."""
        raise NotImplementedError
