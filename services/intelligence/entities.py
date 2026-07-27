"""Entity extraction with bilingual (Arabic/English) alias matching.

A curated gazetteer of Gulf / Red Sea / trade-relevant actors gives canonical
records (preferred English + Arabic names, aliases, type, country). Unknown
capitalized English name sequences are surfaced as provisional entities so
nothing silently disappears — but only gazetteer matches carry canonical IDs.
"""

import re
from dataclasses import dataclass, field

from .arabic_normalizer import normalize_arabic, transliterate

ENTITY_TYPES = {
    "country", "government", "international_organization", "company", "person",
    "armed_group", "port", "corridor", "commodity", "infrastructure_asset",
    "financial_institution",
}


@dataclass
class CanonicalEntity:
    entity_id: str
    name_en: str
    name_ar: str | None
    entity_type: str
    country: str | None
    aliases: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "entity_id": self.entity_id,
            "name_en": self.name_en,
            "name_ar": self.name_ar,
            "entity_type": self.entity_type,
            "country": self.country,
            "aliases": list(self.aliases),
            "transliteration": transliterate(self.name_ar) if self.name_ar else None,
        }


def _e(eid, en, ar, etype, country, *aliases) -> CanonicalEntity:
    return CanonicalEntity(eid, en, ar, etype, country, list(aliases))


# Canonical gazetteer. Aliases include common Arabic and Latin transliteration
# variants; matching is done on normalized text so diacritics/alef variants
# and Arabic-Indic digits do not break lookups.
GAZETTEER: list[CanonicalEntity] = [
    _e("ent_uae", "United Arab Emirates", "الإمارات العربية المتحدة", "country", "AE",
       "UAE", "U.A.E.", "Emirates", "الامارات", "دولة الإمارات"),
    _e("ent_saudi", "Saudi Arabia", "المملكة العربية السعودية", "country", "SA",
       "KSA", "Kingdom of Saudi Arabia", "السعودية", "المملكة"),
    _e("ent_yemen", "Yemen", "اليمن", "country", "YE", "Republic of Yemen"),
    _e("ent_iran", "Iran", "إيران", "country", "IR", "Islamic Republic of Iran", "ايران"),
    _e("ent_egypt", "Egypt", "مصر", "country", "EG", "Arab Republic of Egypt"),
    _e("ent_israel", "Israel", "إسرائيل", "country", "IL", "اسرائيل"),
    _e("ent_usa", "United States", "الولايات المتحدة", "country", "US",
       "US", "U.S.", "USA", "America", "الولايات المتحدة الأمريكية", "أمريكا", "واشنطن"),
    _e("ent_china", "China", "الصين", "country", "CN", "PRC", "People's Republic of China"),
    _e("ent_india", "India", "الهند", "country", "IN"),
    _e("ent_qatar", "Qatar", "قطر", "country", "QA"),
    _e("ent_oman", "Oman", "عمان", "country", "OM", "Sultanate of Oman", "سلطنة عمان"),
    _e("ent_djibouti", "Djibouti", "جيبوتي", "country", "DJ"),
    _e("ent_sudan", "Sudan", "السودان", "country", "SD"),
    _e("ent_ethiopia", "Ethiopia", "إثيوبيا", "country", "ET", "اثيوبيا"),
    _e("ent_uae_gov", "UAE Government", "حكومة الإمارات", "government", "AE",
       "UAE Ministry of Foreign Affairs", "UAE Ministry of Economy",
       "وزارة الخارجية الإماراتية", "وزارة الاقتصاد الإماراتية"),
    _e("ent_saudi_gov", "Saudi Government", "الحكومة السعودية", "government", "SA",
       "Saudi Ministry of Energy", "وزارة الطاقة السعودية", "الديوان الملكي"),
    _e("ent_yemen_gov", "Government of Yemen", "الحكومة اليمنية", "government", "YE",
       "Yemeni government", "internationally recognized government of Yemen"),
    _e("ent_un", "United Nations", "الأمم المتحدة", "international_organization", None,
       "UN", "U.N.", "UN Security Council", "مجلس الأمن"),
    _e("ent_imf", "International Monetary Fund", "صندوق النقد الدولي",
       "international_organization", None, "IMF"),
    _e("ent_wfp", "World Food Programme", "برنامج الأغذية العالمي",
       "international_organization", None, "WFP"),
    _e("ent_imo", "International Maritime Organization", "المنظمة البحرية الدولية",
       "international_organization", None, "IMO"),
    _e("ent_opec", "OPEC", "أوبك", "international_organization", None,
       "OPEC+", "Organization of the Petroleum Exporting Countries", "اوبك"),
    _e("ent_eu", "European Union", "الاتحاد الأوروبي", "international_organization",
       None, "EU"),
    _e("ent_gcc", "Gulf Cooperation Council", "مجلس التعاون الخليجي",
       "international_organization", None, "GCC"),
    _e("ent_houthis", "Houthi Movement", "الحوثيون", "armed_group", "YE",
       "Houthis", "Ansar Allah", "Ansarallah", "أنصار الله", "انصار الله",
       "جماعة الحوثي", "الحوثيين"),
    _e("ent_dpworld", "DP World", "موانئ دبي العالمية", "company", "AE",
       "DP World Ltd", "دي بي ورلد"),
    _e("ent_adports", "AD Ports Group", "مجموعة موانئ أبوظبي", "company", "AE",
       "Abu Dhabi Ports", "AD Ports", "موانئ أبوظبي", "موانئ ابوظبي"),
    _e("ent_adnoc", "ADNOC", "أدنوك", "company", "AE",
       "Abu Dhabi National Oil Company", "شركة بترول أبوظبي الوطنية", "ادنوك"),
    _e("ent_aramco", "Saudi Aramco", "أرامكو السعودية", "company", "SA",
       "Aramco", "أرامكو", "ارامكو"),
    _e("ent_maersk", "Maersk", "ميرسك", "company", "DK",
       "A.P. Moller-Maersk", "A.P. Moller Maersk", "ميرسك لاين"),
    _e("ent_msc", "MSC", "إم إس سي", "company", "CH",
       "Mediterranean Shipping Company"),
    _e("ent_cma", "CMA CGM", "سي إم إيه سي جي إم", "company", "FR"),
    _e("ent_hapag", "Hapag-Lloyd", "هاباغ لويد", "company", "DE", "Hapag Lloyd"),
    _e("ent_etihad_rail", "Etihad Rail", "الاتحاد للقطارات", "infrastructure_asset",
       "AE", "قطار الاتحاد"),
    _e("ent_masdar", "Masdar", "مصدر", "company", "AE",
       "Abu Dhabi Future Energy Company"),
    _e("ent_scz", "Suez Canal", "قناة السويس", "corridor", "EG",
       "Suez", "Suez Canal Authority", "هيئة قناة السويس"),
    _e("ent_babelmandeb", "Bab el-Mandeb Strait", "مضيق باب المندب", "corridor", None,
       "Bab al-Mandab", "Bab el Mandeb", "Bab al-Mandeb", "باب المندب"),
    _e("ent_redsea", "Red Sea", "البحر الأحمر", "corridor", None, "البحر الاحمر"),
    _e("ent_hormuz", "Strait of Hormuz", "مضيق هرمز", "corridor", None, "Hormuz"),
    _e("ent_jebelali", "Jebel Ali Port", "ميناء جبل علي", "port", "AE",
       "Jebel Ali", "جبل علي"),
    _e("ent_khalifaport", "Khalifa Port", "ميناء خليفة", "port", "AE"),
    _e("ent_fujairah", "Port of Fujairah", "ميناء الفجيرة", "port", "AE",
       "Fujairah", "الفجيرة"),
    _e("ent_jeddah", "Jeddah Islamic Port", "ميناء جدة الإسلامي", "port", "SA",
       "Port of Jeddah", "Jeddah port", "ميناء جدة"),
    _e("ent_hodeidah", "Port of Hodeidah", "ميناء الحديدة", "port", "YE",
       "Hodeidah", "Hudaydah", "Al Hudaydah", "الحديدة"),
    _e("ent_aden", "Port of Aden", "ميناء عدن", "port", "YE", "Aden", "عدن"),
    _e("ent_berbera", "Port of Berbera", "ميناء بربرة", "port", "SO", "Berbera", "بربرة"),
    _e("ent_crude", "Crude Oil", "النفط الخام", "commodity", None,
       "oil", "petroleum", "النفط", "نفط", "البترول"),
    _e("ent_lng", "Liquefied Natural Gas", "الغاز الطبيعي المسال", "commodity", None,
       "LNG", "natural gas", "الغاز"),
    _e("ent_wheat", "Wheat", "القمح", "commodity", None, "grain", "الحبوب", "قمح"),
    _e("ent_containers", "Container Freight", "الشحن بالحاويات", "commodity", None,
       "containers", "container shipping", "الحاويات", "حاويات"),
    _e("ent_uae_cb", "Central Bank of the UAE", "مصرف الإمارات المركزي",
       "financial_institution", "AE", "CBUAE"),
    _e("ent_adq", "ADQ", "القابضة", "financial_institution", "AE", "ADQ Holding"),
    _e("ent_mubadala", "Mubadala", "مبادلة", "financial_institution", "AE",
       "Mubadala Investment Company", "شركة مبادلة للاستثمار"),
    _e("ent_adia", "Abu Dhabi Investment Authority", "جهاز أبوظبي للاستثمار",
       "financial_institution", "AE", "ADIA"),
]

_INDEX: dict[str, CanonicalEntity] = {}
for _ent in GAZETTEER:
    for alias in [_ent.name_en, _ent.name_ar, *_ent.aliases]:
        if alias:
            _INDEX[normalize_arabic(alias)] = _ent

# Longest aliases first so "Suez Canal Authority" wins over "Suez Canal".
_ALIASES_SORTED = sorted(_INDEX.keys(), key=len, reverse=True)
_ALIAS_RES = [
    (re.compile(r"(?<![\w؀-ۿ])" + re.escape(a) + r"(?![\w؀-ۿ])"), a)
    for a in _ALIASES_SORTED
]

# Provisional (non-gazetteer) English proper-name sequences.
_CAPSEQ_RE = re.compile(
    r"\b(?!The |A |An |In |On |At |It |He |She |They |We |This |That )"
    r"([A-Z][A-Za-z&'\.-]+(?: (?:of|al|el|bin|for|and|the)| [A-Z][A-Za-z&'\.-]+){1,5})\b"
)


def entity_by_id(entity_id: str) -> CanonicalEntity | None:
    for ent in GAZETTEER:
        if ent.entity_id == entity_id:
            return ent
    return None


def match_entities(text: str) -> list[tuple[CanonicalEntity, str]]:
    """Return (entity, matched_alias) pairs found in text, in match order."""
    norm = normalize_arabic(text)
    found: list[tuple[CanonicalEntity, str, int]] = []
    seen_spans: list[tuple[int, int]] = []
    for regex, alias in _ALIAS_RES:
        for m in regex.finditer(norm):
            span = (m.start(), m.end())
            if any(s < span[1] and span[0] < e for s, e in seen_spans):
                continue  # overlapping longer alias already matched
            seen_spans.append(span)
            found.append((_INDEX[alias], alias, m.start()))
    found.sort(key=lambda item: item[2])
    out, seen_ids = [], set()
    for ent, alias, _pos in found:
        if ent.entity_id not in seen_ids:
            seen_ids.add(ent.entity_id)
            out.append((ent, alias))
    return out


def provisional_entities(text: str, known: set[str]) -> list[dict]:
    """English capitalized sequences not covered by the gazetteer."""
    from .events import split_sentences  # avoid matching across sentences

    known_norm = {normalize_arabic(k) for k in known}
    out, seen = [], set()
    for m in (m for s in split_sentences(text) for m in _CAPSEQ_RE.finditer(s)):
        name = m.group(1).strip(" .")
        norm = normalize_arabic(name)
        if norm in seen or len(name) < 5:
            continue
        if any(norm in k or k in norm for k in known_norm):
            continue
        seen.add(norm)
        out.append({
            "entity_id": f"prov_{abs(hash(norm)) % 10**8:08d}",
            "name_en": name,
            "name_ar": None,
            "entity_type": "other",
            "country": None,
            "aliases": [],
            "provisional": True,
        })
    return out


def extract_entities_from_sources(sources: list[dict]) -> list[dict]:
    """Canonical entity records with source references, across all sources."""
    records: dict[str, dict] = {}
    known_names: set[str] = set()
    for src in sources:
        text = src.get("original_text", "")
        for ent, alias in match_entities(text):
            rec = records.setdefault(
                ent.entity_id, {**ent.to_dict(), "source_ids": [], "matched_aliases": []}
            )
            if src["source_id"] not in rec["source_ids"]:
                rec["source_ids"].append(src["source_id"])
            if alias not in rec["matched_aliases"]:
                rec["matched_aliases"].append(alias)
            known_names.update([ent.name_en, *(a for a in ent.aliases)])
    provisional: dict[str, dict] = {}
    for src in sources:
        if src.get("language") == "ar":
            continue  # capitalization heuristic is Latin-script only
        for prov in provisional_entities(src.get("original_text", ""), known_names):
            rec = provisional.setdefault(prov["entity_id"], {**prov, "source_ids": []})
            if src["source_id"] not in rec["source_ids"]:
                rec["source_ids"].append(src["source_id"])
    return list(records.values()) + list(provisional.values())
