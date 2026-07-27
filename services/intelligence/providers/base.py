"""Provider-neutral analysis interface.

A provider supplies raw analytical output; the pipeline validates everything
before persistence. Provider failure is reported, never papered over: a
failing provider must raise ProviderError — there is no fallback that invents
successful analysis.
"""

from abc import ABC, abstractmethod


class ProviderError(RuntimeError):
    """Provider could not produce valid output (configuration, network,
    timeout or malformed response). The pipeline surfaces this as a failed
    run — it never substitutes fabricated results."""


class AnalysisProvider(ABC):
    name: str = "abstract"
    model_id: str | None = None

    def info(self) -> dict:
        return {"provider": self.name, "model_id": self.model_id}

    @abstractmethod
    def extract_entities(self, sources: list[dict]) -> list[dict]: ...

    @abstractmethod
    def extract_events(self, sources: list[dict], entities: list[dict]) -> list[dict]: ...

    @abstractmethod
    def extract_claims(
        self, sources: list[dict], entities: list[dict], events: list[dict],
    ) -> list[dict]: ...

    @abstractmethod
    def identify_counterevidence(
        self, claims: list[dict], sources: list[dict], events: list[dict],
    ) -> list[dict]: ...

    @abstractmethod
    def generate_uae_implications(
        self, events: list[dict], claims: list[dict], entities: list[dict],
    ) -> list[dict]: ...

    @abstractmethod
    def generate_scenarios(
        self, events: list[dict], claims: list[dict], implications: list[dict],
    ) -> tuple[list[dict], list[str]]: ...

    @abstractmethod
    def compose_briefing(self, **kwargs) -> dict: ...
