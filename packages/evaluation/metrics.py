"""Measurable analytical-quality metrics over a pipeline result.

Each metric returns a dict with a value plus any violations. CRITICAL
violations (defined in CRITICAL_CODES) fail CI via the runner's exit code.
"""

from services.intelligence.briefing import check_length_compliance
from services.intelligence.citations import citation_coverage, citation_precision
from services.intelligence.claims import CLAIM_TYPES

CRITICAL_CODES = {
    "unsupported_observed_claim_persisted",
    "missing_source_linkage",
    "invalid_claim_type_persisted",
    "forecast_without_horizon_persisted",
    "arabic_text_broken",
    "schema_failure",
}


def evaluate_case(case: dict, result: dict, sources: list[dict]) -> dict:
    """Score one golden case. Returns metrics, violations and pass/fail."""
    expected = case.get("expected", {})
    forbidden = case.get("forbidden", {})
    known_ids = {s["source_id"] for s in sources}
    claims = result["claims"]
    violations: list[dict] = []
    checks: list[dict] = []

    def violation(code: str, message: str):
        violations.append({"code": code, "message": message,
                           "critical": code in CRITICAL_CODES})

    def check(name: str, ok: bool, detail: str = ""):
        checks.append({"check": name, "ok": bool(ok), "detail": detail})

    # ---- schema sanity -------------------------------------------------
    for key in ("entities", "events", "claims", "contradictions",
                "uae_implications", "scenarios", "briefing", "warnings"):
        if key not in result:
            violation("schema_failure", f"Result missing key {key!r}.")

    # ---- hard analytical invariants (always critical) ------------------
    for c in claims:
        if c.get("claim_type") not in CLAIM_TYPES:
            violation("invalid_claim_type_persisted",
                      f"{c.get('claim_id')} has type {c.get('claim_type')!r}.")
        if c.get("claim_type") == "observed" and not c.get("source_ids"):
            violation("unsupported_observed_claim_persisted",
                      f"{c.get('claim_id')} is observed with no sources.")
        if c.get("claim_type") == "forecast" and not c.get("time_horizon"):
            violation("forecast_without_horizon_persisted",
                      f"{c.get('claim_id')} is a forecast without horizon.")
        for sid in c.get("source_ids") or []:
            if sid not in known_ids:
                violation("missing_source_linkage",
                          f"{c.get('claim_id')} cites unknown source {sid}.")

    # ---- Arabic handling ----------------------------------------------
    arabic_sources = [s for s in sources if s["language"] in ("ar", "mixed")]
    for s in arabic_sources:
        original = s.get("original_text", "")
        if not any("؀" <= ch <= "ۿ" for ch in original):
            violation("arabic_text_broken",
                      f"{s['source_id']} lost its Arabic original text.")
        if not s.get("normalized_text"):
            violation("arabic_text_broken",
                      f"{s['source_id']} has no normalized text.")

    # ---- expectations --------------------------------------------------
    entity_ids = {e["entity_id"] for e in result["entities"]}
    for eid in expected.get("entities_include", []):
        check(f"entity:{eid}", eid in entity_ids,
              "expected entity extracted" if eid in entity_ids
              else f"missing expected entity {eid}")
    claim_types = {c["claim_type"] for c in claims}
    for ct in expected.get("claim_types_include", []):
        check(f"claim_type:{ct}", ct in claim_types)
    if expected.get("min_observed_claims"):
        n = sum(1 for c in claims if c["claim_type"] == "observed")
        check("min_observed_claims", n >= expected["min_observed_claims"],
              f"{n} observed")
    if expected.get("required_citations"):
        cov = citation_coverage(claims)
        check("citation_coverage", cov >= 1.0, f"coverage={cov}")
    issue_codes = {i["code"] for i in result.get("validation_issues", [])}
    for code in expected.get("validation_codes_include", []):
        check(f"validation:{code}", code in issue_codes,
              f"present={sorted(issue_codes)}")
    ctr_kinds = {c["kind"] for c in result["contradictions"]}
    for kind in expected.get("contradiction_kinds_include", []):
        check(f"contradiction:{kind}", kind in ctr_kinds,
              f"found={sorted(ctr_kinds)}")
    if "scenario_count" in expected:
        check("scenario_count",
              len(result["scenarios"]) == expected["scenario_count"],
              f"got {len(result['scenarios'])}")
    for dim in expected.get("implication_dimensions_include", []):
        dims = {i["dimension"] for i in result["uae_implications"]}
        check(f"implication:{dim}", dim in dims, f"found={sorted(dims)}")
    if expected.get("shared_entity_sources"):
        # Bilingual alias case: one canonical entity cited by >= N sources.
        eid, min_n = (expected["shared_entity_sources"]["entity_id"],
                      expected["shared_entity_sources"]["min_sources"])
        ent = next((e for e in result["entities"] if e["entity_id"] == eid), None)
        ok = bool(ent) and len(ent.get("source_ids", [])) >= min_n
        check(f"shared_entity:{eid}", ok,
              f"sources={ent.get('source_ids') if ent else None}")

    # ---- forbidden outputs ---------------------------------------------
    for eid in forbidden.get("entity_ids_exclude", []):
        if eid in entity_ids:
            violation("forbidden_entity",
                      f"Entity {eid} must not be extracted for this case.")
    for frag in forbidden.get("observed_text_must_not_contain", []):
        for c in claims:
            if c["claim_type"] == "observed" and frag.lower() in c["text"].lower():
                violation("interpretation_as_observed",
                          f"Observed claim {c['claim_id']} contains forbidden "
                          f"fragment {frag!r}.")
    if forbidden.get("no_exact_event_date"):
        for ev in result["events"]:
            if ev.get("event_date"):
                violation("date_overprecision",
                          f"Event {ev['event_id']} carries exact date "
                          f"{ev['event_date']} though only a period is supported.")
    if forbidden.get("no_forecast_claims"):
        for c in claims:
            if c["claim_type"] == "forecast":
                violation("forbidden_forecast_persisted",
                          f"{c['claim_id']} persisted as forecast.")

    # ---- global metrics ------------------------------------------------
    date_checks = expected.get("event_dates_include", [])
    dates_found = {ev.get("event_date") for ev in result["events"]}
    for d in date_checks:
        found = sorted(x for x in dates_found if x)
        check(f"event_date:{d}", d in dates_found, f"found={found}")

    metrics = {
        "citation_coverage": citation_coverage(claims),
        "citation_precision": citation_precision(claims, known_ids),
        "unsupported_observed_claims": sum(
            1 for v in violations
            if v["code"] == "unsupported_observed_claim_persisted"),
        "entity_expected_found_ratio": _ratio(
            [c for c in checks if c["check"].startswith("entity:")]),
        "date_preservation": _ratio(
            [c for c in checks if c["check"].startswith("event_date:")]),
        "contradiction_recall": _ratio(
            [c for c in checks if c["check"].startswith("contradiction:")]),
        "scenario_completeness": (
            len(result["scenarios"]) / 3 if expected.get("scenario_count", 3) else 1.0),
        "implication_specificity": _implication_specificity(
            result["uae_implications"]),
        "briefing_length_violations": check_length_compliance(result["briefing"]),
    }

    failed_checks = [c for c in checks if not c["ok"]]
    passed = not failed_checks and not violations
    return {
        "case_id": case["case_id"],
        "passed": passed,
        "checks": checks,
        "violations": violations,
        "metrics": metrics,
    }


def _ratio(checks: list[dict]) -> float | None:
    if not checks:
        return None
    return round(sum(1 for c in checks if c["ok"]) / len(checks), 3)


def _implication_specificity(implications: list[dict]) -> float:
    """Fraction of implications that are fully specified (claims + indicator
    + stakeholder + horizon). Generic filler scores 0 on these fields."""
    if not implications:
        return 1.0
    ok = sum(1 for i in implications
             if i.get("supporting_claim_ids") and i.get("monitoring_indicator")
             and i.get("stakeholder") and i.get("time_horizon"))
    return round(ok / len(implications), 3)
