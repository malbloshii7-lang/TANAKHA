"""Transparent, documented confidence scoring.

The final confidence of an analytical claim is a weighted blend of evidence
properties — NEVER just the language model's self-reported score:

    factor                  weight   meaning
    ------------------------------------------------------------------
    source_count            0.20     more independent evidence -> higher
    source_reliability      0.20     mean publisher reliability score
    source_independence     0.15     distinct publishers / sources cited
    recency                 0.15     newest citation vs knowledge cutoff
    extraction_confidence   0.10     confidence of the extraction step
    contradiction_penalty   0.10     open contradictions reduce confidence
    temporal_consistency    0.05     cited dates agree with each other
    model_confidence        0.05     model self-report, capped contribution

Each factor is normalized to [0, 1]; the result is a weighted sum, so the
model's own opinion can move the final score by at most 5 points.
"""

import datetime

WEIGHTS = {
    "source_count": 0.20,
    "source_reliability": 0.20,
    "source_independence": 0.15,
    "recency": 0.15,
    "extraction_confidence": 0.10,
    "contradiction_penalty": 0.10,
    "temporal_consistency": 0.05,
    "model_confidence": 0.05,
}


def _recency_factor(dates: list[str], knowledge_cutoff: str | None) -> float:
    """1.0 for evidence <=30 days old at the cutoff, decaying to 0.2 at 2y+."""
    usable = [d for d in dates if d]
    if not usable:
        return 0.5  # unknown recency: neutral
    ref = None
    if knowledge_cutoff:
        try:
            ref = datetime.date.fromisoformat(knowledge_cutoff[:10])
        except ValueError:
            ref = None
    if ref is None:
        ref = datetime.date.today()
    newest = max(usable)
    try:
        age_days = (ref - datetime.date.fromisoformat(newest[:10])).days
    except ValueError:
        return 0.5
    if age_days <= 30:
        return 1.0
    if age_days >= 730:
        return 0.2
    return round(1.0 - 0.8 * (age_days - 30) / 700, 3)


def score_confidence(
    *,
    sources: list[dict],
    knowledge_cutoff: str | None = None,
    extraction_confidence: float = 0.7,
    contradiction_count: int = 0,
    model_confidence: float | None = None,
) -> dict:
    """Compute the blended confidence with a full per-factor breakdown."""
    n = len(sources)
    factors = {
        "source_count": min(n / 4.0, 1.0),  # saturates at 4 sources
        "source_reliability": (
            sum(s.get("reliability_score", 0.25) for s in sources) / n if n else 0.0),
        "source_independence": (
            len({s.get("publisher") or s.get("source_id") for s in sources}) / n
            if n else 0.0),
        "recency": _recency_factor(
            [s.get("publication_date") for s in sources], knowledge_cutoff),
        "extraction_confidence": max(0.0, min(1.0, extraction_confidence)),
        "contradiction_penalty": max(0.0, 1.0 - 0.35 * contradiction_count),
        "temporal_consistency": _temporal_consistency(sources),
        "model_confidence": (
            max(0.0, min(1.0, model_confidence)) if model_confidence is not None
            else 0.5),
    }
    score = sum(WEIGHTS[k] * v for k, v in factors.items())
    return {
        "score": round(score, 2),
        "factors": {k: round(v, 3) for k, v in factors.items()},
        "weights": WEIGHTS,
        "explanation": explain(factors, n),
    }


def _temporal_consistency(sources: list[dict]) -> float:
    dates = sorted(s["publication_date"] for s in sources if s.get("publication_date"))
    if len(dates) < 2:
        return 0.8
    try:
        spread = (datetime.date.fromisoformat(dates[-1][:10])
                  - datetime.date.fromisoformat(dates[0][:10])).days
    except ValueError:
        return 0.5
    if spread <= 45:
        return 1.0
    if spread >= 540:
        return 0.3
    return round(1.0 - 0.7 * (spread - 45) / 495, 3)


def explain(factors: dict, source_count: int) -> str:
    parts = [f"{source_count} supporting source(s)"]
    if factors["source_reliability"] >= 0.75:
        parts.append("high average source reliability")
    elif factors["source_reliability"] <= 0.45:
        parts.append("low average source reliability")
    if factors["source_independence"] >= 0.99 and source_count > 1:
        parts.append("independent publishers")
    if factors["recency"] >= 0.9:
        parts.append("recent evidence")
    elif factors["recency"] <= 0.4:
        parts.append("dated evidence")
    if factors["contradiction_penalty"] < 1.0:
        parts.append("open contradictions reduce confidence")
    return "; ".join(parts) + "."
