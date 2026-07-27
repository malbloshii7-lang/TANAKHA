"""Contradiction and tension detection across sources, events and claims.

Detects: conflicting dates, conflicting quantities, conflicting actor
attribution, contradictory direction of movement, source disagreement,
fact-versus-opinion tension, and old information presented as current.

Every finding references BOTH sides. The detector never auto-selects a
"correct" source; material findings become review-queue items for analysts.
"""

import datetime
import re

from .arabic_normalizer import normalize_arabic
from .language import normalize_digits  # noqa: F401  (re-exported for tests)

_QTY_RE = re.compile(
    r"(\d[\d,\.]*)\s*(%|percent|في المئه|بالمئه|ships?|vessels?|سفينه|سفن|"
    r"containers?|حاويه|حاويات|tons?|طن|barrels?|برميل|براميل|billion|مليار|"
    r"million|مليون|teu)", re.IGNORECASE)

_OPINION_MARKERS = ["believe", "opinion", "argue", "claims that", "نعتقد",
                    "يري ان", "براي", "في رايه", "يزعم"]

_CURRENT_MARKERS = ["currently", "now", "today", "this week", "حاليا", "الان",
                    "اليوم", "هذا الاسبوع"]

_DIRECTION = {"increased": "up", "decreased": "down"}


def _qty_key(unit: str) -> str:
    unit_norm = normalize_arabic(unit)
    aliases = {
        "percent": "%", "في المئه": "%", "بالمئه": "%",
        "ship": "ships", "vessel": "ships", "vessels": "ships",
        "سفينه": "ships", "سفن": "ships",
        "container": "containers", "حاويه": "containers", "حاويات": "containers",
        "ton": "tons", "طن": "tons", "barrel": "barrels", "برميل": "barrels",
        "براميل": "barrels", "مليار": "billion", "مليون": "million",
    }
    return aliases.get(unit_norm, aliases.get(unit_norm.rstrip("s"), unit_norm))


def _quantities(text: str) -> list[tuple[float, str]]:
    # Match on the normalized form so Arabic-Indic digits and ta-marbuta
    # variants (سفينة/سفينه) resolve to the same unit keys.
    out = []
    for m in _QTY_RE.finditer(normalize_arabic(text)):
        try:
            out.append((float(m.group(1).replace(",", "")), _qty_key(m.group(2))))
        except ValueError:
            continue
    return out


def detect_contradictions(
    sources: list[dict], events: list[dict], claims: list[dict],
    knowledge_cutoff: str | None = None,
) -> list[dict]:
    findings: list[dict] = []
    counter = 0

    def add(kind: str, description: str, side_a: dict, side_b: dict,
            material: bool = True):
        nonlocal counter
        counter += 1
        findings.append({
            "contradiction_id": f"ctr_{counter:03d}",
            "kind": kind,
            "description": description,
            "side_a": side_a,
            "side_b": side_b,
            "material": material,
            "resolution": "unresolved",  # never auto-resolved by the engine
        })

    # 1. Conflicting dates: same actor + action reported with different exact
    # dates across sources. (Grouping by actor+action, not target, since
    # bilingual sources often surface different secondary entities.)
    by_actor_action: dict[tuple, list[dict]] = {}
    for ev in events:
        by_actor_action.setdefault((ev["actor"], ev["action"]), []).append(ev)
    for (_actor, action), group in by_actor_action.items():
        dates = {(e["event_date"] or e["event_period"]): e for e in group
                 if e["event_date"] or e["event_period"]}
        exact = {d: e for d, e in dates.items() if e["event_date"]}
        if len(exact) > 1:
            (da, ea), (db, eb) = list(exact.items())[:2]
            add("conflicting_dates",
                f"Sources give different dates ({da} vs {db}) for the same "
                f"'{action}' event.",
                _event_side(ea), _event_side(eb))
    # 3. Conflicting actor attribution: same attributable action + date,
    # different actors named by different sources.
    by_action_date: dict[tuple, list[dict]] = {}
    for ev in events:
        if ev["action"] in ("attacked", "seized", "sanctioned"):
            by_action_date.setdefault(
                (ev["action"], ev["event_date"] or ev["event_period"]),
                []).append(ev)
    for (action, _date), group in by_action_date.items():
        actors = {e["actor"]: e for e in group}
        if len(actors) > 1:
            (_aa, ea), (_ab, eb) = list(actors.items())[:2]
            add("conflicting_actor_attribution",
                f"Sources attribute the same '{action}' event to different "
                f"actors ({ea['actor_name']} vs {eb['actor_name']}).",
                _event_side(ea), _event_side(eb))

    # 4. Contradictory direction of movement on the same subject.
    by_actor: dict[str, list[dict]] = {}
    for ev in events:
        if ev["action"] in _DIRECTION:
            by_actor.setdefault(ev["actor"], []).append(ev)
    for _actor, group in by_actor.items():
        dirs = {_DIRECTION[e["action"]]: e for e in group}
        if len(dirs) > 1:
            add("contradictory_direction",
                f"Sources disagree on direction of movement for "
                f"{group[0]['actor_name']}: one reports an increase, another "
                f"a decrease.",
                _event_side(dirs["up"]), _event_side(dirs["down"]))

    # 2. Conflicting quantities: same subject entity + unit, different values
    # reported by different sources. Detected sentence-by-sentence over the
    # sources themselves so it survives event dedup/merging.
    from .entities import match_entities as _match
    from .events import split_sentences as _split

    qty_index: dict[tuple, list[tuple[float, dict, str]]] = {}
    for src in sources:
        for sent in _split(src.get("original_text", "")):
            ents = _match(sent)
            if not ents:
                continue
            subject = ents[0][0]
            for value, unit in _quantities(sent):
                qty_index.setdefault((subject.entity_id, unit), []).append(
                    (value, src, sent))
    for (subject_id, unit), triples in qty_index.items():
        by_value: dict[float, tuple[dict, str]] = {}
        for value, src, sent in triples:
            by_value.setdefault(value, (src, sent))
        if len(by_value) > 1:
            (va, (sa, sent_a)), (vb, (sb, sent_b)) = sorted(by_value.items())[:2]
            # Two figures from ONE source (e.g. "fell to 52, down from 75")
            # are context, not a cross-source contradiction.
            if sa["source_id"] != sb["source_id"] and \
                    max(va, vb) > 0 and abs(va - vb) / max(va, vb) > 0.1:
                from .entities import entity_by_id
                subject_name = getattr(entity_by_id(subject_id), "name_en",
                                       subject_id)
                add("conflicting_quantities",
                    f"Sources report different figures ({va:g} vs {vb:g} "
                    f"{unit}) for {subject_name}.",
                    {**_source_side(sa), "excerpt": sent_a[:200]},
                    {**_source_side(sb), "excerpt": sent_b[:200]})

    # 6. Fact-versus-opinion tension on overlapping subjects.
    opinionated = [s for s in sources
                   if any(m in normalize_arabic(s.get("original_text", ""))
                          for m in map(normalize_arabic, _OPINION_MARKERS))
                   or s.get("source_type") == "commentary"]
    factual = [s for s in sources
               if s.get("source_type") in ("government_statement", "report", "news")
               and s not in opinionated]
    for op in opinionated:
        for fa in factual:
            shared = _shared_entities(op, fa, events)
            if shared:
                add("fact_vs_opinion",
                    f"Commentary/opinion source and factual source cover the "
                    f"same subject ({', '.join(sorted(shared)[:3])}); treat the "
                    f"opinion as interpretation, not evidence.",
                    _source_side(op), _source_side(fa), material=False)
                break

    # 7. Old information presented as current.
    ref_date = None
    pub_dates = sorted(s["publication_date"] for s in sources
                       if s.get("publication_date"))
    if knowledge_cutoff:
        ref_date = knowledge_cutoff[:10]
    elif pub_dates:
        ref_date = pub_dates[-1]
    if ref_date:
        for s in sources:
            pd = s.get("publication_date")
            if not pd:
                continue
            try:
                age = (datetime.date.fromisoformat(ref_date)
                       - datetime.date.fromisoformat(pd)).days
            except ValueError:
                continue
            text_norm = normalize_arabic(s.get("original_text", ""))
            if age > 180 and any(normalize_arabic(m) in text_norm
                                 for m in _CURRENT_MARKERS):
                add("stale_presented_as_current",
                    f"Source published {pd} ({age} days before {ref_date}) uses "
                    f"present-tense 'current' framing; its facts may be outdated.",
                    _source_side(s),
                    {"kind": "reference_date", "date": ref_date})

    # 5. Generic source disagreement is covered by the typed findings above;
    # only claims explicitly marked disputed add an extra finding.
    for claim in claims:
        if claim.get("disputed_by"):
            add("source_disagreement",
                f"Claim {claim.get('claim_id')} is disputed by other sources.",
                {"kind": "claim", "claim_id": claim.get("claim_id"),
                 "source_ids": claim.get("source_ids", [])},
                {"kind": "sources", "source_ids": claim["disputed_by"]})
    return findings


def _event_side(ev: dict) -> dict:
    return {"kind": "event", "event_id": ev["event_id"],
            "source_ids": ev["source_ids"],
            "date": ev["event_date"] or ev["event_period"],
            "excerpt": ev.get("sentence", "")[:200]}


def _source_side(src: dict) -> dict:
    return {"kind": "source", "source_id": src["source_id"],
            "publisher": src.get("publisher"),
            "publication_date": src.get("publication_date")}


def _shared_entities(a: dict, b: dict, events: list[dict]) -> set[str]:
    from .entities import match_entities
    ents_a = {e.entity_id for e, _x in match_entities(a.get("original_text", ""))}
    ents_b = {e.entity_id for e, _x in match_entities(b.get("original_text", ""))}
    shared_ids = ents_a & ents_b
    names = set()
    for ev in events:
        if ev["actor"] in shared_ids:
            names.add(ev["actor_name"])
    if not names and shared_ids:
        from .entities import entity_by_id
        for eid in shared_ids:
            ent = entity_by_id(eid)
            if ent:
                names.add(ent.name_en)
    return names
