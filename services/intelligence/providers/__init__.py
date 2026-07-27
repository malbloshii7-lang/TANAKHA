import os

from .base import AnalysisProvider, ProviderError  # noqa: F401
from .deterministic import DeterministicProvider  # noqa: F401


def get_provider(name: str | None = None) -> "AnalysisProvider":
    """Resolve a provider by explicit name or INTELLIGENCE_PROVIDER env var.

    There is NO silent fallback: asking for the huggingface provider without
    configuration raises ProviderError instead of quietly degrading.
    """
    name = (name or os.getenv("INTELLIGENCE_PROVIDER", "deterministic")).lower()
    if name == "deterministic":
        return DeterministicProvider()
    if name == "huggingface":
        from .huggingface import HuggingFaceProvider

        return HuggingFaceProvider()
    raise ProviderError(f"Unknown intelligence provider {name!r}.")
