"""Citation construction and coverage checks.

A citation binds an analytical object (claim, implication, scenario, briefing
statement) to the source evidence that supports it. Traceability beats prose:
every material statement must resolve to at least one real source.
"""


def build_citation(source: dict) -> dict:
    return {
        "source_id": source["source_id"],
        "title": source.get("title"),
        "publisher": source.get("publisher"),
        "publication_date": source.get("publication_date"),
        "url": source.get("url"),
        "language": source.get("language"),
        "reliability": source.get("reliability"),
    }


def build_appendix(sources: list[dict], used_source_ids: set[str]) -> list[dict]:
    """Source appendix restricted to sources actually cited by the analysis."""
    return [build_citation(s) for s in sources if s["source_id"] in used_source_ids]


def collect_used_source_ids(claims: list[dict], events: list[dict]) -> set[str]:
    used: set[str] = set()
    for obj in [*claims, *events]:
        used.update(obj.get("source_ids") or [])
    return used


def citation_coverage(claims: list[dict]) -> float:
    """Fraction of claims that carry at least one supporting source."""
    if not claims:
        return 1.0
    cited = sum(1 for c in claims
                if c.get("source_ids") or c.get("supporting_claim_ids"))
    return round(cited / len(claims), 3)


def citation_precision(claims: list[dict], known_source_ids: set[str]) -> float:
    """Fraction of cited source IDs that resolve to real sources."""
    total, valid = 0, 0
    for c in claims:
        for sid in c.get("source_ids") or []:
            total += 1
            if sid in known_source_ids:
                valid += 1
    return round(valid / total, 3) if total else 1.0
