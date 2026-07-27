"""Deterministic rule-based provider.

Used for tests, offline development, reproducibility and CI. Its output is a
genuine function of the input text — gazetteer entity matching, lexicon-based
event extraction, sentence-level claim construction — never lorem ipsum,
random values or canned unrelated responses.
"""

import re

from .. import briefing as briefing_mod
from .. import entities as entities_mod
from .. import events as events_mod
from .. import implications as implications_mod
from .. import scenarios as scenarios_mod
from ..arabic_normalizer import normalize_arabic
from ..claims import _INTERPRETIVE_MARKERS
from ..events import extract_date, split_sentences
from .base import AnalysisProvider

_FUTURE_RE_EN = re.compile(
    r"\b(will|shall|expects?|anticipates?|projected to|forecasts? that|"
    r"plans? to|intends? to|is (?:likely|set|expected) to|by next)\b")
_FUTURE_MARKERS_AR = ["سوف", "من المتوقع", "يتوقع", "تتوقع", "تخطط", "يخطط",
                      "ستقوم", "سيقوم", "سترتفع", "سينخفض", "ستصل", "سيصل"]

_HORIZON_HINTS = [
    (re.compile(r"\b(next|coming|قادم\w*)\s+(few\s+)?(weeks?|اسابيع|أسابيع)"), "0-3 months"),
    (re.compile(r"\b(\d+)\s*(months?|اشهر|أشهر|شهر)"), None),  # numeric months
    (re.compile(r"\b(quarter|الربع)"), "0-3 months"),
    (re.compile(r"\b(next year|العام المقبل|السنه المقبله)"), "12-24 months"),
    (re.compile(r"\b(end of|بحلول نهايه|بنهايه)"), "6-12 months"),
]


def _derive_horizon(sentence: str) -> str | None:
    norm = normalize_arabic(sentence)
    for regex, horizon in _HORIZON_HINTS:
        m = regex.search(norm)
        if not m:
            continue
        if horizon:
            return horizon
        months = int(m.group(1))
        if months <= 3:
            return "0-3 months"
        if months <= 6:
            return "3-6 months"
        if months <= 12:
            return "6-12 months"
        return "12-24 months"
    date = extract_date(sentence)
    if date.exact or date.period:
        return "6-12 months"  # dated target -> bounded horizon
    return None


def _is_future(sentence: str) -> bool:
    norm = normalize_arabic(sentence)
    low = sentence.lower()
    return (bool(_FUTURE_RE_EN.search(low))
            or any(normalize_arabic(m) in norm for m in _FUTURE_MARKERS_AR))


def _is_interpretive(sentence: str) -> bool:
    norm = normalize_arabic(sentence)
    low = sentence.lower()
    return (any(m in low for m in _INTERPRETIVE_MARKERS if m.isascii())
            or any(normalize_arabic(m) in norm
                   for m in _INTERPRETIVE_MARKERS if not m.isascii()))


class DeterministicProvider(AnalysisProvider):
    name = "deterministic"
    model_id = "rules-v1"

    def extract_entities(self, sources):
        return entities_mod.extract_entities_from_sources(sources)

    def extract_events(self, sources, entities):
        return events_mod.extract_events(sources, entities)

    def extract_claims(self, sources, entities, events):
        claims: list[dict] = []
        counter = 0

        def next_id() -> str:
            nonlocal counter
            counter += 1
            return f"clm_{counter:03d}"

        seen_texts: set[str] = set()

        # Observed claims: one per extracted event, grounded in its sentence
        # and carrying the event's source IDs (evidence by construction).
        for ev in events:
            sentence = ev.get("sentence") or ""
            norm = normalize_arabic(sentence)
            if norm in seen_texts:
                continue
            if _is_future(sentence):
                continue  # handled as forecast below
            if _is_interpretive(sentence):
                # Interpretation is never presented as fact: reclassify.
                claims.append({
                    "claim_id": next_id(),
                    "claim_type": "inferred",
                    "text": sentence[:400],
                    "source_ids": list(ev["source_ids"]),
                    "event_ids": [ev["event_id"]],
                    "reasoning": (
                        "The source sentence uses interpretive/assessment "
                        "language, so it is recorded as an inference drawn "
                        "from the cited source, not as observed fact."),
                    "confidence": 0.45,
                    "counterevidence": None,
                    "extraction_confidence": ev["confidence"],
                    "chronology": {"event_date": ev["event_date"],
                                   "event_period": ev["event_period"]},
                })
                seen_texts.add(norm)
                continue
            claims.append({
                "claim_id": next_id(),
                "claim_type": "observed",
                "text": sentence[:400],
                "source_ids": list(ev["source_ids"]),
                "event_ids": [ev["event_id"]],
                "extraction_confidence": ev["confidence"],
                "chronology": {
                    "event_date": ev["event_date"],
                    "event_period": ev["event_period"],
                    "publication_dates": sorted({
                        s.get("publication_date")
                        for s in sources if s["source_id"] in ev["source_ids"]
                        and s.get("publication_date")}),
                },
            })
            seen_texts.add(norm)

        # Forecast claims: future-framed sentences from the sources.
        for src in sources:
            for sentence in split_sentences(src.get("original_text", "")):
                if not _is_future(sentence):
                    continue
                norm = normalize_arabic(sentence)
                if norm in seen_texts:
                    continue
                seen_texts.add(norm)
                matched = entities_mod.match_entities(sentence)
                if not matched:
                    continue
                horizon = _derive_horizon(sentence)
                claim = {
                    "claim_id": next_id(),
                    "claim_type": "forecast",
                    "text": sentence[:400],
                    "source_ids": [src["source_id"]],
                    "time_horizon": horizon,  # may be None -> validator blocks
                    "assumptions": [
                        "The source's stated plan or expectation is pursued as described.",
                        "No disruptive external shock changes the trajectory.",
                    ],
                    "confirming_indicators": [
                        f"Official follow-up announcements by {matched[0][0].name_en}",
                        "Independent reporting confirming implementation steps",
                    ],
                    "weakening_indicators": [
                        "Missed interim milestones or official walk-backs",
                        "Contradictory data in subsequent reporting",
                    ],
                    "confidence": 0.4,
                    "extraction_confidence": 0.55,
                }
                claims.append(claim)

        # Cross-source inferred claims: only when multiple sources genuinely
        # interact (e.g. disruption + UAE-relevant logistics exposure).
        disruption_events = [ev for ev in events if ev["action"] in
                             ("attacked", "suspended", "rerouted", "seized")]
        uae_touch = [e for e in entities if e.get("country") == "AE"
                     or e["entity_id"] in ("ent_scz", "ent_babelmandeb",
                                           "ent_redsea")]
        if disruption_events and uae_touch:
            ev = disruption_events[0]
            claims.append({
                "claim_id": next_id(),
                "claim_type": "inferred",
                "text": (
                    f"Sustained disruption around "
                    f"{ev.get('location') or ev['actor_name']} is likely to "
                    f"redirect cargo flows and raise the relative importance "
                    f"of UAE ports and logistics corridors in the near term."),
                "source_ids": sorted({sid for e in disruption_events
                                      for sid in e["source_ids"]}),
                "event_ids": [e["event_id"] for e in disruption_events],
                "reasoning": (
                    "Multiple sources report disruption on the primary route; "
                    "historic rerouting behavior and the cited carrier "
                    "responses imply substitution toward alternative hubs, of "
                    "which UAE ports are the closest large-capacity option."),
                "confidence": 0.6,
                "counterevidence": None,  # filled by identify_counterevidence
                "extraction_confidence": 0.6,
            })
        return claims

    def identify_counterevidence(self, claims, sources, events):
        """Attach counterevidence to inferred claims, or record none found."""
        for claim in claims:
            if claim["claim_type"] != "inferred":
                continue
            counter: list[dict] = []
            claim_norm = normalize_arabic(claim["text"])
            wants_up = any(w in claim_norm for w in
                           ("increase", "raise", "growth", "importance", "ارتفاع"))
            for ev in events:
                if ev["action"] == "decreased" and wants_up and \
                        set(ev["source_ids"]) - set(claim.get("source_ids", [])):
                    counter.append({
                        "source_ids": ev["source_ids"],
                        "event_id": ev["event_id"],
                        "note": f"Reported decrease involving {ev['actor_name']} "
                                f"cuts against this inference.",
                    })
            claim["counterevidence"] = counter if counter else {
                "found": False,
                "note": "No counterevidence found in the provided sources; "
                        "recorded explicitly per tradecraft policy.",
            }
        return claims

    def generate_uae_implications(self, events, claims, entities):
        return implications_mod.derive_implications(events, claims, entities)

    def generate_scenarios(self, events, claims, implications):
        return scenarios_mod.build_scenarios(events, claims, implications)

    def compose_briefing(self, **kwargs):
        return briefing_mod.compose_briefing(**kwargs)
