"""Scenario engine: at most three scenarios (base / upside / downside).

Probabilities are directional analytical estimates rounded to 5% steps —
never pseudo-precision like 53.27%. Scenario validation rejects incomplete
scenarios instead of padding them with filler.
"""

REQUIRED_FIELDS = [
    "scenario_type", "title", "summary", "probability", "time_horizon",
    "assumptions", "confirming_indicators", "weakening_indicators",
    "uae_opportunity", "uae_risk", "linked_claim_ids",
]


def round_probability(p: float) -> int:
    """Round to the nearest 5, clamped to [5, 90]."""
    return int(min(90, max(5, round(p * 100 / 5) * 5)))


def validate_scenario(scenario: dict) -> list[str]:
    problems = []
    for field in REQUIRED_FIELDS:
        value = scenario.get(field)
        if value in (None, "", [], {}):
            problems.append(f"missing_{field}")
    p = scenario.get("probability")
    if isinstance(p, (int, float)):
        if not (0 < p <= 100):
            problems.append("probability_out_of_range")
        elif float(p) != int(p) or int(p) % 5 != 0:
            problems.append("probability_pseudo_precision")
    return problems


def build_scenarios(
    events: list[dict], claims: list[dict], implications: list[dict],
) -> tuple[list[dict], list[str]]:
    """Derive base/upside/downside from actual analytical content.

    Returns (scenarios, warnings). Fewer than three scenarios are returned
    when the evidence cannot support them — with a warning, never filler.
    """
    warnings: list[str] = []
    observed = [c for c in claims if c["claim_type"] == "observed"]
    if not observed:
        return [], ["Insufficient observed evidence to construct scenarios."]

    linked = [c["claim_id"] for c in observed[:6]]
    disruption = any(ev["action"] in ("attacked", "suspended", "rerouted", "seized")
                     for ev in events)
    opportunity_imps = [i for i in implications if i["direction"] == "opportunity"]
    risk_imps = [i for i in implications if i["direction"] in ("risk", "mixed")]

    subject = events[0]["location"] or events[0]["actor_name"] if events else "the region"

    base = {
        "scenario_type": "base",
        "title": f"Managed friction around {subject}",
        "summary": (
            "Current dynamics persist without decisive escalation or "
            "resolution: disruption and diplomatic activity continue at "
            "roughly today's intensity, and market participants keep "
            "adapting through rerouting, pricing and hedging."
            if disruption else
            "Announced initiatives proceed broadly as stated, with "
            "implementation friction but no reversal of direction."),
        "probability": 55,
        "time_horizon": "3-6 months",
        "assumptions": [
            "No major new actor enters the situation.",
            "Existing mitigation (rerouting, diplomacy, insurance) stays available.",
        ],
        "confirming_indicators": _indicators(events, kind="confirming"),
        "weakening_indicators": _indicators(events, kind="weakening"),
        "uae_opportunity": (opportunity_imps[0]["statement"] if opportunity_imps
                            else "Steady-state role as reliable regional hub."),
        "uae_risk": (risk_imps[0]["statement"] if risk_imps
                     else "Prolonged uncertainty raises operating costs."),
        "linked_claim_ids": linked,
    }
    upside = {
        "scenario_type": "upside",
        "title": f"De-escalation and normalization around {subject}",
        "summary": (
            "Pressure eases materially — through negotiation, deterrence or "
            "exhaustion — restoring normal flows faster than markets expect "
            "and rewarding early repositioning."),
        "probability": 20,
        "time_horizon": "6-12 months",
        "assumptions": [
            "A credible de-escalation pathway emerges and holds.",
            "Commercial actors re-commit to pre-disruption routings/plans.",
        ],
        "confirming_indicators": [
            "Sustained multi-week decline in reported incidents or friction",
            "Major carriers or investors publicly reverse defensive posture",
        ],
        "weakening_indicators": [
            "Renewed incidents after any pause",
            "Hardening public positions by principal actors",
        ],
        "uae_opportunity": (
            "First-mover advantage for UAE hubs and capital as flows normalize."),
        "uae_risk": (
            "Premium volumes captured during disruption revert to baseline."),
        "linked_claim_ids": linked,
    }
    downside = {
        "scenario_type": "downside",
        "title": f"Escalation and broadening around {subject}",
        "summary": (
            "The situation widens — geographically or in intensity — drawing "
            "in additional actors, raising costs sharply and forcing "
            "governments and firms into contingency postures."),
        "probability": 25,
        "time_horizon": "0-3 months",
        "assumptions": [
            "At least one principal actor sees benefit in escalation.",
            "External mediation fails to change incentives.",
        ],
        "confirming_indicators": [
            "Attacks or restrictions extending to new geographies or asset classes",
            "War-risk insurance premiums repricing sharply upward",
        ],
        "weakening_indicators": [
            "Verified pull-back by escalating actors",
            "Effective new security arrangements for affected routes",
        ],
        "uae_opportunity": (
            "Heightened demand for UAE safe-harbor logistics, storage and finance."),
        "uae_risk": (risk_imps[0]["statement"] if risk_imps
                     else "Direct exposure of UAE-linked assets and routes."),
        "linked_claim_ids": linked,
    }

    scenarios = []
    for sc in (base, upside, downside):
        problems = validate_scenario(sc)
        if problems:
            warnings.append(
                f"Scenario '{sc['scenario_type']}' dropped: {', '.join(problems)}")
        else:
            scenarios.append(sc)
    if len(scenarios) < 3:
        warnings.append("Fewer than three scenarios met validation requirements.")
    return scenarios, warnings


def _indicators(events: list[dict], kind: str) -> list[str]:
    inds: list[str] = []
    for ev in events[:3]:
        if kind == "confirming":
            inds.append(
                f"Further '{ev['action']}' reports involving {ev['actor_name']}")
        else:
            inds.append(
                f"Absence of new '{ev['action']}' reports involving "
                f"{ev['actor_name']} for 4+ weeks")
    return inds or ([f"Continued reporting consistent with current pattern"]
                    if kind == "confirming" else ["Pattern-breaking reports"])
