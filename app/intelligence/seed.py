"""Seeded Red Sea demonstration briefing.

Idempotent: content-hash dedup in the DB means re-running seed() never
duplicates sources. The seeded briefing is the regression baseline — it must
keep producing a full analysis (see tests/test_intelligence_regression.py).
"""

from services.intelligence.source_processor import build_source

from . import db

BRIEF_ID = "brf_redsea"
BRIEF_TITLE = "Red Sea Shipping Disruption — UAE Exposure"
STRATEGIC_QUESTION = (
    "How does the current Red Sea shipping disruption affect UAE trade, "
    "logistics and investment positioning over the next two quarters?"
)

SEED_SOURCES = [
    dict(
        text=(
            "أعلنت جماعة الحوثي في اليمن أنها هاجمت سفينة حاويات تجارية في "
            "البحر الأحمر بالقرب من مضيق باب المندب يوم 2026-06-12، وقالت إن "
            "الهجمات ستستمر ضد السفن المرتبطة بإسرائيل. وأكدت مصادر ملاحية أن "
            "عدد السفن العابرة في قناة السويس انخفض إلى ٤٥ سفينة يومياً."
        ),
        title="هجوم على سفينة حاويات في البحر الأحمر",
        publisher="وكالة أنباء إقليمية",
        source_type="news",
        publication_date="2026-06-13",
        event_date="2026-06-12",
        reliability="medium",
    ),
    dict(
        text=(
            "Maersk announced on 14 June 2026 that it has suspended all Red "
            "Sea transits and rerouted vessels around the Cape of Good Hope, "
            "citing repeated attacks near the Bab el-Mandeb Strait. Suez "
            "Canal daily transits fell to 52 ships, down from about 75 before "
            "the disruption. Container volumes at Jebel Ali Port increased by "
            "12 percent month-on-month as carriers consolidated cargo in the "
            "Gulf."
        ),
        title="Maersk suspends Red Sea transits",
        publisher="Reuters",
        source_type="news",
        publication_date="2026-06-14",
        reliability="high",
    ),
    dict(
        text=(
            "AD Ports Group signed an agreement with two regional carriers on "
            "20 June 2026 to expand transshipment capacity at Khalifa Port. "
            "The group expects throughput to grow further over the next 6 "
            "months if Red Sea diversions persist. DP World also announced "
            "additional feeder services connecting Jebel Ali with East "
            "African ports."
        ),
        title="AD Ports expands transshipment capacity",
        publisher="Gulf Business Desk",
        source_type="press_release",
        publication_date="2026-06-21",
        reliability="medium",
    ),
]


def seed() -> dict:
    """Create the Red Sea brief and its sources. Returns brief + source IDs."""
    db.upsert_brief(BRIEF_ID, BRIEF_TITLE, STRATEGIC_QUESTION)
    source_ids = []
    for spec in SEED_SOURCES:
        record = build_source(
            spec["text"],
            title=spec["title"],
            publisher=spec["publisher"],
            source_type=spec["source_type"],
            publication_date=spec["publication_date"],
            event_date=spec.get("event_date"),
            reliability=spec["reliability"],
            origin="seed",
        )
        source_id, _created = db.insert_source(record, brief_id=BRIEF_ID)
        source_ids.append(source_id)
    return {"brief_id": BRIEF_ID, "source_ids": source_ids}
