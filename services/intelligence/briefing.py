"""Executive briefing composition with enforced length discipline.

Sections and hard limits:
- what_changed: <= 80 words
- executive_judgement: <= 120 words
- why_it_matters: <= 5 concise points
- uae_implications: <= 7 material implications
- scenarios: exactly 3 when evidence suffices
- indicators_to_watch: <= 8
- leadership_takeaway: <= 30 words
- source_appendix: every material statement links to evidence

Concise executive language, not academic prose or news summary.
"""

import re

from .citations import build_appendix, collect_used_source_ids

LIMITS = {
    "what_changed": 80,
    "executive_judgement": 120,
    "leadership_takeaway": 30,
    "why_it_matters_points": 5,
    "uae_implications": 7,
    "indicators_to_watch": 8,
}


def word_count(text: str) -> int:
    return len(re.findall(r"[\w؀-ۿ]+", text or ""))


def _truncate_words(text: str, limit: int) -> str:
    words = re.findall(r"\S+", text or "")
    if len(words) <= limit:
        return text.strip()
    return " ".join(words[:limit]).rstrip(",;:—-") + "."


def compose_briefing(
    *,
    sources: list[dict],
    events: list[dict],
    claims: list[dict],
    contradictions: list[dict],
    implications: list[dict],
    scenarios: list[dict],
    confidence: dict,
    strategic_question: str | None = None,
) -> dict:
    observed = [c for c in claims if c["claim_type"] == "observed"]
    inferred = [c for c in claims if c["claim_type"] == "inferred"]
    forecasts = [c for c in claims if c["claim_type"] == "forecast"]
    used_ids = collect_used_source_ids(claims, events)

    # What changed: lead with the most-sourced observed claims.
    top_observed = sorted(observed, key=lambda c: -len(c.get("source_ids", [])))[:3]
    what_changed = _truncate_words(
        " ".join(c["text"] for c in top_observed) or
        "No adequately sourced development was identified in the provided evidence.",
        LIMITS["what_changed"])

    # Executive judgement: inference-led, confidence-qualified.
    judgement_bits = []
    if inferred:
        judgement_bits.append(inferred[0]["text"])
    if scenarios:
        base = next((s for s in scenarios if s["scenario_type"] == "base"), None)
        if base:
            judgement_bits.append(
                f"Base case ({base['probability']}%): {base['title']}.")
    judgement_bits.append(
        f"Overall analytical confidence {confidence['score']:.2f} — "
        f"{confidence['explanation']}")
    executive_judgement = _truncate_words(
        " ".join(judgement_bits), LIMITS["executive_judgement"])

    why_it_matters = []
    for imp in implications[:LIMITS["why_it_matters_points"]]:
        why_it_matters.append({
            "point": _truncate_words(imp["statement"], 28),
            "claim_ids": imp["supporting_claim_ids"],
        })
    if not why_it_matters and observed:
        why_it_matters.append({
            "point": _truncate_words(observed[0]["text"], 28),
            "claim_ids": [observed[0]["claim_id"]],
        })

    indicators: list[str] = []
    for imp in implications:
        if imp["monitoring_indicator"] not in indicators:
            indicators.append(imp["monitoring_indicator"])
    for sc in scenarios:
        for ind in sc.get("confirming_indicators", [])[:2]:
            if ind not in indicators:
                indicators.append(ind)
    indicators = indicators[:LIMITS["indicators_to_watch"]]

    takeaway_focus = (implications[0]["statement"] if implications
                      else (top_observed[0]["text"] if top_observed else
                            "Evidence base is currently insufficient for action."))
    leadership_takeaway = _truncate_words(takeaway_focus, LIMITS["leadership_takeaway"])

    return {
        "strategic_question": strategic_question,
        "what_changed": what_changed,
        "executive_judgement": executive_judgement,
        "why_it_matters": why_it_matters,
        "uae_implications": implications[:LIMITS["uae_implications"]],
        "scenarios": scenarios,
        "scenario_note": (
            "Scenario probabilities are directional analytical estimates, "
            "not statistical predictions; they need not total 100%."),
        "indicators_to_watch": indicators,
        "leadership_takeaway": leadership_takeaway,
        "confidence": confidence,
        "counts": {
            "sources": len(sources),
            "events": len(events),
            "observed_claims": len(observed),
            "inferred_claims": len(inferred),
            "forecasts": len(forecasts),
            "contradictions": len(contradictions),
        },
        "source_appendix": build_appendix(sources, used_ids),
    }


def check_length_compliance(briefing: dict) -> list[str]:
    """Machine-checkable length violations (used by evaluation + CI)."""
    problems = []
    if word_count(briefing.get("what_changed", "")) > LIMITS["what_changed"]:
        problems.append("what_changed_over_limit")
    if word_count(briefing.get("executive_judgement", "")) > LIMITS["executive_judgement"]:
        problems.append("executive_judgement_over_limit")
    if word_count(briefing.get("leadership_takeaway", "")) > LIMITS["leadership_takeaway"]:
        problems.append("leadership_takeaway_over_limit")
    if len(briefing.get("why_it_matters", [])) > LIMITS["why_it_matters_points"]:
        problems.append("why_it_matters_over_limit")
    if len(briefing.get("uae_implications", [])) > LIMITS["uae_implications"]:
        problems.append("uae_implications_over_limit")
    if len(briefing.get("indicators_to_watch", [])) > LIMITS["indicators_to_watch"]:
        problems.append("indicators_over_limit")
    if len(briefing.get("scenarios", [])) > 3:
        problems.append("too_many_scenarios")
    return problems
