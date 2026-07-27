"""Analytical pipeline: sources -> entities -> events -> claims ->
contradictions -> confidence -> UAE implications -> scenarios -> briefing.

The pipeline is provider-neutral and enforces validation gates itself, so no
provider (deterministic or model-backed) can slip unsupported output into
approved analytical records. Rejected material is preserved in warnings and
in ``rejected_claims`` for audit — never silently dropped, never silently
approved.
"""

import logging
from dataclasses import dataclass, field

from .briefing import check_length_compliance
from .claims import validate_claims
from .confidence import score_confidence
from .contradictions import detect_contradictions
from .providers.base import AnalysisProvider, ProviderError

log = logging.getLogger("intelligence.pipeline")


@dataclass
class PipelineResult:
    entities: list = field(default_factory=list)
    events: list = field(default_factory=list)
    claims: list = field(default_factory=list)
    rejected_claims: list = field(default_factory=list)
    contradictions: list = field(default_factory=list)
    uae_implications: list = field(default_factory=list)
    scenarios: list = field(default_factory=list)
    briefing: dict = field(default_factory=dict)
    warnings: list = field(default_factory=list)
    validation_issues: list = field(default_factory=list)
    provider: dict = field(default_factory=dict)
    raw_provider_output: list = field(default_factory=list)
    review_queue: list = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "entities": self.entities,
            "events": self.events,
            "claims": self.claims,
            "rejected_claims": self.rejected_claims,
            "contradictions": self.contradictions,
            "uae_implications": self.uae_implications,
            "scenarios": self.scenarios,
            "briefing": self.briefing,
            "warnings": self.warnings,
            "validation_issues": self.validation_issues,
            "provider": self.provider,
            "review_queue": self.review_queue,
        }


class IntelligencePipeline:
    def __init__(self, provider: AnalysisProvider):
        self.provider = provider

    def run(
        self,
        sources: list[dict],
        *,
        strategic_question: str | None = None,
        knowledge_cutoff: str | None = None,
    ) -> PipelineResult:
        if not sources:
            raise ValueError("Analysis requires at least one source.")
        result = PipelineResult(provider=self.provider.info())
        known_ids = {s["source_id"] for s in sources}

        # 1-2. Entities and events (provider may raise ProviderError; we do
        # not catch it here — a failed provider is a failed run, reported as
        # such, never replaced with invented output).
        result.entities = self.provider.extract_entities(sources)
        result.events = self.provider.extract_events(sources, result.entities)
        if not result.entities:
            result.warnings.append("No entities extracted from the evidence.")
        if not result.events:
            result.warnings.append("No events extracted from the evidence.")

        # 3. Claims + counterevidence, then hard validation.
        raw_claims = self.provider.extract_claims(
            sources, result.entities, result.events)
        raw_claims = self.provider.identify_counterevidence(
            raw_claims, sources, result.events)
        validation = validate_claims(raw_claims, known_ids)
        result.claims = validation.valid
        result.rejected_claims = validation.rejected
        result.validation_issues = [i.to_dict() for i in validation.issues]
        for issue in validation.issues:
            if issue.severity == "error":
                result.warnings.append(
                    f"Claim blocked ({issue.code}): {issue.message}")

        # 4. Contradictions — both sides referenced, none auto-resolved.
        result.contradictions = detect_contradictions(
            sources, result.events, result.claims,
            knowledge_cutoff=knowledge_cutoff)
        material = [c for c in result.contradictions if c["material"]]
        result.review_queue = [
            {
                "item_type": "contradiction",
                "ref_id": c["contradiction_id"],
                "kind": c["kind"],
                "description": c["description"],
                "status": "open",
            }
            for c in material
        ]
        contradicted_claim_count = len(material)

        # 5. Per-claim blended confidence (never just model self-report).
        src_by_id = {s["source_id"]: s for s in sources}
        for claim in result.claims:
            cited = [src_by_id[sid] for sid in claim.get("source_ids", [])
                     if sid in src_by_id]
            conf = score_confidence(
                sources=cited,
                knowledge_cutoff=knowledge_cutoff,
                extraction_confidence=claim.get("extraction_confidence", 0.6),
                contradiction_count=sum(
                    1 for c in material
                    if _claim_touched(claim, c)),
                model_confidence=claim.get("confidence"),
            )
            claim["confidence"] = conf["score"]
            claim["confidence_breakdown"] = conf

        # 6-7. Implications and scenarios from validated claims only.
        result.uae_implications = self.provider.generate_uae_implications(
            result.events, result.claims, result.entities)
        result.scenarios, scenario_warnings = self.provider.generate_scenarios(
            result.events, result.claims, result.uae_implications)
        result.warnings.extend(scenario_warnings)

        # 8. Overall confidence + briefing.
        overall = score_confidence(
            sources=sources,
            knowledge_cutoff=knowledge_cutoff,
            extraction_confidence=_mean(
                [c.get("extraction_confidence", 0.6) for c in result.claims]),
            contradiction_count=contradicted_claim_count,
        )
        result.briefing = self.provider.compose_briefing(
            sources=sources,
            events=result.events,
            claims=result.claims,
            contradictions=result.contradictions,
            implications=result.uae_implications,
            scenarios=result.scenarios,
            confidence=overall,
            strategic_question=strategic_question,
        )
        length_problems = check_length_compliance(result.briefing)
        for p in length_problems:
            result.warnings.append(f"Briefing length violation: {p}")
        result.briefing["knowledge_cutoff"] = knowledge_cutoff
        result.briefing["provider"] = result.provider

        # Raw model output is carried separately from approved records.
        result.raw_provider_output = getattr(self.provider, "raw_responses", [])
        return result


def _claim_touched(claim: dict, contradiction: dict) -> bool:
    claim_sources = set(claim.get("source_ids", []))
    for side in (contradiction.get("side_a"), contradiction.get("side_b")):
        if isinstance(side, dict):
            if claim_sources & set(side.get("source_ids", [])):
                return True
    return False


def _mean(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.6


__all__ = ["IntelligencePipeline", "PipelineResult", "ProviderError"]
