"""Claim construction and validation.

Three claim types with hard validation rules enforced BEFORE persistence:

- observed: requires supporting source IDs; no interpretation disguised as
  fact; blocked outright when evidence is absent.
- inferred: requires supporting evidence, written reasoning, a confidence
  value, and either counterevidence or an explicit record that none was found.
- forecast: requires a time horizon, assumptions, confirming indicators and
  weakening indicators; never displayable as observed fact.

The engine never silently converts unsupported model output into an approved
analytical claim — invalid claims are rejected with a recorded warning.
"""

from dataclasses import dataclass, field

CLAIM_TYPES = {"observed", "inferred", "forecast"}
VALID_HORIZONS = {"0-3 months", "3-6 months", "6-12 months", "12-24 months", "24+ months"}

# Interpretive language that must not appear in an observed (factual) claim.
_INTERPRETIVE_MARKERS = [
    "probably", "likely", "suggests", "appears to", "seems to", "may be",
    "could be", "we assess", "presumably", "arguably", "is expected to",
    "من المرجح", "يبدو ان", "قد يكون", "نرجح", "يحتمل",
]


@dataclass
class ValidationIssue:
    claim_ref: str
    code: str
    message: str
    severity: str = "error"  # error -> claim blocked; warning -> recorded only

    def to_dict(self) -> dict:
        return {"claim_ref": self.claim_ref, "code": self.code,
                "message": self.message, "severity": self.severity}


@dataclass
class ClaimValidationResult:
    valid: list[dict] = field(default_factory=list)
    rejected: list[dict] = field(default_factory=list)
    issues: list[ValidationIssue] = field(default_factory=list)


def _has_interpretation(text: str) -> bool:
    low = (text or "").lower()
    return any(marker in low for marker in _INTERPRETIVE_MARKERS)


def validate_claim(claim: dict, known_source_ids: set[str]) -> list[ValidationIssue]:
    """Return blocking/non-blocking issues for a single claim dict."""
    issues: list[ValidationIssue] = []
    ref = claim.get("claim_id") or claim.get("text", "?")[:60]
    ctype = claim.get("claim_type")

    if ctype not in CLAIM_TYPES:
        issues.append(ValidationIssue(ref, "invalid_claim_type",
                                      f"Unknown claim type {ctype!r}."))
        return issues
    if not (claim.get("text") or "").strip():
        issues.append(ValidationIssue(ref, "empty_claim", "Claim has no text."))
        return issues

    source_ids = claim.get("source_ids") or []
    unknown = [s for s in source_ids if s not in known_source_ids]
    if unknown:
        issues.append(ValidationIssue(
            ref, "unknown_citation",
            f"Claim cites source IDs that do not exist: {unknown}."))

    if ctype == "observed":
        if not source_ids:
            issues.append(ValidationIssue(
                ref, "unsupported_observed_claim",
                "Observed claim has no supporting source IDs — blocked."))
        if _has_interpretation(claim.get("text", "")):
            issues.append(ValidationIssue(
                ref, "interpretation_as_fact",
                "Observed claim contains interpretive language — it must be "
                "reclassified as inferred, not presented as fact."))
    elif ctype == "inferred":
        if not source_ids and not claim.get("supporting_claim_ids"):
            issues.append(ValidationIssue(
                ref, "inference_without_evidence",
                "Inferred claim has no supporting evidence."))
        if not (claim.get("reasoning") or "").strip():
            issues.append(ValidationIssue(
                ref, "inference_without_reasoning",
                "Inferred claim lacks written reasoning."))
        if claim.get("confidence") is None:
            issues.append(ValidationIssue(
                ref, "inference_without_confidence",
                "Inferred claim lacks a confidence value."))
        if "counterevidence" not in claim:
            issues.append(ValidationIssue(
                ref, "counterevidence_not_recorded",
                "Inferred claim must include counterevidence or explicitly "
                "record that none was found."))
    elif ctype == "forecast":
        if not claim.get("time_horizon"):
            issues.append(ValidationIssue(
                ref, "forecast_without_horizon",
                "Forecast lacks a time horizon — blocked."))
        elif claim["time_horizon"] not in VALID_HORIZONS:
            issues.append(ValidationIssue(
                ref, "forecast_invalid_horizon",
                f"Forecast horizon {claim['time_horizon']!r} is not one of "
                f"{sorted(VALID_HORIZONS)}.", severity="warning"))
        if not claim.get("assumptions"):
            issues.append(ValidationIssue(
                ref, "forecast_without_assumptions",
                "Forecast does not identify its assumptions."))
        if not claim.get("confirming_indicators"):
            issues.append(ValidationIssue(
                ref, "forecast_without_confirming_indicators",
                "Forecast does not identify confirming indicators."))
        if not claim.get("weakening_indicators"):
            issues.append(ValidationIssue(
                ref, "forecast_without_weakening_indicators",
                "Forecast does not identify weakening indicators."))

    conf = claim.get("confidence")
    if conf is not None and not (0.0 <= float(conf) <= 1.0):
        issues.append(ValidationIssue(
            ref, "confidence_out_of_range", "Confidence must be within [0, 1]."))
    return issues


def validate_claims(claims: list[dict], known_source_ids: set[str]) -> ClaimValidationResult:
    """Partition claims into valid/rejected; rejected claims never persist."""
    result = ClaimValidationResult()
    for claim in claims:
        issues = validate_claim(claim, known_source_ids)
        result.issues.extend(issues)
        if any(i.severity == "error" for i in issues):
            result.rejected.append(
                {**claim, "rejected_reasons": [i.code for i in issues
                                               if i.severity == "error"]})
        else:
            claim.setdefault("review_status", "pending")
            result.valid.append(claim)
    return result
