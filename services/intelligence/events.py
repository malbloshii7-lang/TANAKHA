"""Event extraction from Arabic and English sentences.

An event is (actor, action, target, location, sector, date, sources).
Date discipline: an exact event_date is only set when the source text (or
source metadata) supports a specific day. When only a month/year or vague
period is supported, the event carries `event_period` instead — we never
infer precision the evidence does not contain.
"""

import re
from dataclasses import dataclass

from .arabic_normalizer import normalize_arabic
from .language import normalize_digits

_SENT_SPLIT_RE = re.compile(r"(?<=[.!?؟۔])\s+|\n{2,}")

# action key -> (english patterns, arabic patterns (normalized form), sector hint)
ACTION_LEXICON: dict[str, tuple[list[str], list[str], str | None]] = {
    "attacked": (["attack", "attacked", "struck", "strike", "targeted", "hit"],
                 ["هاجم", "هاجمت", "استهدف", "استهدفت", "قصف", "قصفت", "ضرب", "ضربت"],
                 "security"),
    "announced": (["announce", "announced", "unveiled", "declared", "stated"],
                  ["اعلن", "اعلنت", "كشف", "كشفت", "صرح", "صرحت"], None),
    "suspended": (["suspend", "suspended", "halted", "paused", "stopped"],
                  ["علق", "علقت", "اوقف", "اوقفت", "توقف", "توقفت"], "trade"),
    "rerouted": (["reroute", "rerouted", "diverted", "divert", "rerouting",
                  "around the cape of good hope"],
                 ["حول", "حولت", "غير مسار", "غيرت مسار", "تحويل"], "trade"),
    "signed": (["sign", "signed", "agreement signed", "concluded a deal",
                "memorandum of understanding"],
               ["وقع", "وقعت", "ابرم", "ابرمت", "اتفاقيه", "مذكره تفاهم"], "investment"),
    "invested": (["invest", "invested", "investment of", "acquire", "acquired",
                  "stake in"],
                 ["استثمر", "استثمرت", "استحوذ", "استحوذت", "حصه في"], "investment"),
    "increased": (["increase", "increased", "rose", "rise", "surged", "grew",
                   "expanded", "up by"],
                  ["ارتفع", "ارتفعت", "زاد", "زادت", "نما", "نمت", "توسع", "توسعت"],
                  None),
    "decreased": (["decrease", "decreased", "fell", "dropped", "declined",
                   "down by", "shrank", "plunged"],
                  ["انخفض", "انخفضت", "تراجع", "تراجعت", "هبط", "هبطت"], None),
    "sanctioned": (["sanction", "sanctioned", "designated", "blacklisted"],
                   ["فرض عقوبات", "عقوبات علي", "ادرج"], "security"),
    "seized": (["seize", "seized", "intercepted", "detained", "hijacked"],
               ["احتجز", "احتجزت", "اعترض", "اعترضت", "استولت"], "security"),
    "launched": (["launch", "launched", "inaugurated", "opened", "commissioned"],
                 ["اطلق", "اطلقت", "افتتح", "افتتحت", "دشن", "دشنت"], None),
    "warned": (["warn", "warned", "cautioned", "alerted"],
               ["حذر", "حذرت", "نبه", "نبهت"], None),
    "negotiated": (["negotiate", "negotiating", "talks", "discussions", "met with"],
                   ["تفاوض", "مفاوضات", "محادثات", "اجتمع", "اجتمعت"], "political"),
}

_MONTHS_EN = {m.lower(): i + 1 for i, m in enumerate(
    ["January", "February", "March", "April", "May", "June", "July",
     "August", "September", "October", "November", "December"])}
_MONTHS_AR = {
    "يناير": 1, "فبراير": 2, "مارس": 3, "ابريل": 4, "أبريل": 4, "مايو": 5,
    "يونيو": 6, "يوليو": 7, "اغسطس": 8, "أغسطس": 8, "سبتمبر": 9,
    "اكتوبر": 10, "أكتوبر": 10, "نوفمبر": 11, "ديسمبر": 12,
    "كانون الثاني": 1, "شباط": 2, "اذار": 3, "نيسان": 4, "ايار": 5,
    "حزيران": 6, "تموز": 7, "اب": 8, "ايلول": 9, "تشرين الاول": 10,
    "تشرين الثاني": 11, "كانون الاول": 12,
}

_ISO_RE = re.compile(r"\b(\d{4})-(\d{2})-(\d{2})\b")
_DMY_EN_RE = re.compile(r"\b(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\b")
_MDY_EN_RE = re.compile(r"\b([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})\b")
_MY_RE = re.compile(r"\b([A-Za-z؀-ۿ]+(?:\s[A-Za-z؀-ۿ]+)?)\s+(\d{4})\b")
_YEAR_RE = re.compile(r"\b(20\d{2})\b")


@dataclass
class ExtractedDate:
    exact: str | None = None      # ISO date when a specific day is supported
    period: str | None = None     # e.g. "2026-06" or "2026" when only that is supported

    def to_dict(self) -> dict:
        return {"event_date": self.exact, "event_period": self.period}


def _month_lookup(word: str) -> int | None:
    w = word.lower().strip(".")
    if w in _MONTHS_EN:
        return _MONTHS_EN[w]
    return _MONTHS_AR.get(normalize_arabic(word))


def extract_date(text: str) -> ExtractedDate:
    """Extract the most specific date the text actually supports."""
    t = normalize_digits(text)
    m = _ISO_RE.search(t)
    if m:
        return ExtractedDate(exact=f"{m.group(1)}-{m.group(2)}-{m.group(3)}")
    m = _DMY_EN_RE.search(t)
    if m:
        mon = _month_lookup(m.group(2))
        if mon:
            return ExtractedDate(exact=f"{m.group(3)}-{mon:02d}-{int(m.group(1)):02d}")
    m = _MDY_EN_RE.search(t)
    if m:
        mon = _month_lookup(m.group(1))
        if mon:
            return ExtractedDate(exact=f"{m.group(3)}-{mon:02d}-{int(m.group(2)):02d}")
    for m in _MY_RE.finditer(t):
        mon = _month_lookup(m.group(1).split()[-1]) or _month_lookup(m.group(1))
        if mon:
            return ExtractedDate(period=f"{m.group(2)}-{mon:02d}")
    m = _YEAR_RE.search(t)
    if m:
        return ExtractedDate(period=m.group(1))
    return ExtractedDate()


def split_sentences(text: str) -> list[str]:
    return [s.strip() for s in _SENT_SPLIT_RE.split(text) if s.strip()]


def detect_action(sentence: str) -> tuple[str, str | None] | None:
    """Return (action_key, sector_hint) for the first lexicon action found."""
    norm = normalize_arabic(sentence)
    for action, (en_pats, ar_pats, sector) in ACTION_LEXICON.items():
        for pat in en_pats:
            if re.search(r"\b" + re.escape(pat) + r"\b", norm):
                return action, sector
        for pat in ar_pats:
            if pat in norm:
                return action, sector
    return None


def _location_of(entity_dicts: list[dict]) -> str | None:
    for ent in entity_dicts:
        if ent["entity_type"] in ("port", "corridor"):
            return ent["name_en"]
    for ent in entity_dicts:
        if ent["entity_type"] == "country":
            return ent["name_en"]
    return None


def extract_events(sources: list[dict], entities: list[dict]) -> list[dict]:
    """Extract structured events sentence-by-sentence from each source."""
    from .entities import match_entities  # local import to avoid cycle

    ent_by_id = {e["entity_id"]: e for e in entities}
    events: list[dict] = []
    seen_keys: set[tuple] = set()
    counter = 0
    for src in sources:
        src_date_hint = src.get("event_date") or src.get("publication_date")
        for sentence in split_sentences(src.get("original_text", "")):
            action_hit = detect_action(sentence)
            if not action_hit:
                continue
            action, sector_hint = action_hit
            matched = [ent_by_id[e.entity_id] for e, _a in match_entities(sentence)
                       if e.entity_id in ent_by_id]
            if not matched:
                continue
            actor = matched[0]
            target = matched[1] if len(matched) > 1 else None
            date = extract_date(sentence)
            if not date.exact and not date.period:
                # Fall back to source-level dates only as a *period*-grade
                # hint when the source explicitly carries an event date.
                if src.get("event_date"):
                    date = ExtractedDate(exact=src["event_date"])
                elif src_date_hint:
                    date = ExtractedDate(period=src_date_hint[:7])
            key = (actor["entity_id"], action,
                   target["entity_id"] if target else None,
                   date.exact or date.period)
            if key in seen_keys:
                for ev in events:
                    if (ev["actor"], ev["action"],
                        ev.get("target_id"), ev["event_date"] or ev["event_period"]) == key \
                            and src["source_id"] not in ev["source_ids"]:
                        ev["source_ids"].append(src["source_id"])
                continue
            seen_keys.add(key)
            counter += 1
            events.append({
                "event_id": f"evt_{counter:03d}",
                "actor": actor["entity_id"],
                "actor_name": actor["name_en"],
                "action": action,
                "target": target["name_en"] if target else _object_phrase(sentence),
                "target_id": target["entity_id"] if target else None,
                "location": _location_of(matched),
                "sector": sector_hint or _sector_of(matched),
                "event_date": date.exact,
                "event_period": date.period,
                "sentence": sentence[:500],
                "source_ids": [src["source_id"]],
                "confidence": round(0.6 + 0.1 * min(len(matched), 3), 2),
            })
    return events


def _object_phrase(sentence: str) -> str | None:
    words = sentence.split()
    return " ".join(words[:12]) + ("…" if len(words) > 12 else "") if words else None


def _sector_of(entity_dicts: list[dict]) -> str | None:
    for ent in entity_dicts:
        if ent["entity_type"] in ("port", "corridor"):
            return "trade_logistics"
        if ent["entity_type"] == "commodity":
            return "energy" if ent["entity_id"] in ("ent_crude", "ent_lng") else "trade"
        if ent["entity_type"] == "financial_institution":
            return "investment"
    return None
