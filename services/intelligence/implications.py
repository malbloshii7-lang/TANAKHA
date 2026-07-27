"""UAE implication framework.

Dimensions evaluated for each material development:
political_influence, trade_logistics, investment, energy, security,
technology, soft_power.

An implication is only emitted when the underlying claims genuinely touch the
dimension — empty dimensions are preferable to generic filler. Every
implication carries direction, statement, confidence, supporting claim IDs,
time horizon, affected stakeholder category and a monitoring indicator.
"""

UAE_DIMENSIONS = [
    "political_influence", "trade_logistics", "investment", "energy",
    "security", "technology", "soft_power",
]

STAKEHOLDERS = {
    "trade_logistics": "ports_and_logistics_operators",
    "energy": "energy_producers_and_traders",
    "investment": "sovereign_investment_entities",
    "security": "security_and_defense_authorities",
    "political_influence": "foreign_policy_leadership",
    "technology": "technology_and_ai_sector",
    "soft_power": "diplomatic_and_cultural_institutions",
}

# Dimension routing rules: (dimension, trigger predicate over an event/claim
# context, direction heuristic, statement builder). Rules only fire on real
# extracted content — no dimension is force-filled.
_UAE_LOGISTICS_ENTS = {"ent_jebelali", "ent_khalifaport", "ent_fujairah",
                       "ent_dpworld", "ent_adports", "ent_etihad_rail"}
_CORRIDOR_ENTS = {"ent_scz", "ent_babelmandeb", "ent_redsea", "ent_hormuz"}
_ENERGY_ENTS = {"ent_crude", "ent_lng", "ent_adnoc", "ent_aramco", "ent_opec",
                "ent_masdar"}
_INVEST_ENTS = {"ent_adq", "ent_mubadala", "ent_adia", "ent_uae_cb"}
_SECURITY_ACTIONS = {"attacked", "seized", "sanctioned", "warned"}
_INVEST_ACTIONS = {"invested", "signed"}


def derive_implications(
    events: list[dict], claims: list[dict], entities: list[dict],
) -> list[dict]:
    ent_ids = {e["entity_id"] for e in entities}
    claim_ids_by_source: dict[str, list[str]] = {}
    for c in claims:
        for sid in c.get("source_ids") or []:
            claim_ids_by_source.setdefault(sid, []).append(c["claim_id"])

    def claims_for(ev: dict) -> list[str]:
        out: list[str] = []
        for sid in ev.get("source_ids", []):
            for cid in claim_ids_by_source.get(sid, []):
                if cid not in out:
                    out.append(cid)
        return out

    implications: list[dict] = []
    counter = 0

    def add(dimension: str, direction: str, statement: str, ev: dict,
            confidence: float, horizon: str, indicator: str):
        nonlocal counter
        supporting = claims_for(ev)
        if not supporting:
            return  # implications must be claim-backed; no filler
        for existing in implications:
            if existing["dimension"] == dimension and existing["statement"] == statement:
                for cid in supporting:
                    if cid not in existing["supporting_claim_ids"]:
                        existing["supporting_claim_ids"].append(cid)
                return
        counter += 1
        implications.append({
            "implication_id": f"imp_{counter:03d}",
            "dimension": dimension,
            "direction": direction,          # opportunity | risk | mixed
            "statement": statement,
            "confidence": round(confidence, 2),
            "supporting_claim_ids": supporting,
            "time_horizon": horizon,
            "stakeholder": STAKEHOLDERS[dimension],
            "monitoring_indicator": indicator,
        })

    corridor_disrupted = any(
        ev["action"] in ("attacked", "suspended", "rerouted", "seized")
        and (ev["actor"] in _CORRIDOR_ENTS or ev.get("target_id") in _CORRIDOR_ENTS
             or (ev.get("location") or "") in ("Red Sea", "Bab el-Mandeb Strait",
                                               "Suez Canal"))
        for ev in events)

    for ev in events:
        actor, target = ev["actor"], ev.get("target_id")
        touched = {actor, target} & ent_ids

        # trade_logistics
        if touched & (_UAE_LOGISTICS_ENTS | _CORRIDOR_ENTS) or \
                ev.get("sector") in ("trade", "trade_logistics"):
            if ev["action"] in ("attacked", "suspended", "seized"):
                add("trade_logistics", "mixed",
                    f"Disruption around {ev.get('location') or ev['actor_name']} "
                    f"raises transit risk on Red Sea routing while increasing "
                    f"demand for UAE transshipment and overland alternatives.",
                    ev, 0.62, "0-3 months",
                    "Weekly container volumes at Jebel Ali and Khalifa Port vs. "
                    "Suez Canal transit counts")
            elif ev["action"] == "rerouted":
                add("trade_logistics", "mixed",
                    f"Carrier rerouting away from the Red Sea lengthens UAE "
                    f"supply chains but strengthens the case for UAE hubs as "
                    f"consolidation points.",
                    ev, 0.6, "0-3 months",
                    "Number of major carriers announcing Cape of Good Hope routings")
            elif ev["action"] in ("launched", "signed", "increased"):
                add("trade_logistics", "opportunity",
                    f"{ev['actor_name']} activity ({ev['action']}) supports "
                    f"expanded cargo throughput relevant to UAE logistics operators.",
                    ev, 0.58, "3-6 months",
                    "Port throughput statistics for UAE terminals")

        # energy
        if touched & _ENERGY_ENTS or ev.get("sector") == "energy":
            direction = "risk" if ev["action"] in _SECURITY_ACTIONS else "mixed"
            add("energy", direction,
                f"Developments involving {ev['actor_name']} affect energy "
                f"flows through Gulf and Red Sea corridors that UAE exporters "
                f"and bunkering hubs depend on.",
                ev, 0.55, "0-3 months",
                "Fujairah bunkering volumes and tanker insurance premiums for "
                "Red Sea transits")

        # security
        if ev["action"] in _SECURITY_ACTIONS:
            add("security", "risk",
                f"'{ev['action']}' activity attributed to {ev['actor_name']} "
                f"elevates the maritime security threat environment near UAE "
                f"trade routes.",
                ev, 0.6, "0-3 months",
                "Frequency of reported maritime incidents in the Bab el-Mandeb "
                "and southern Red Sea")

        # investment
        if ev["action"] in _INVEST_ACTIONS or touched & _INVEST_ENTS:
            add("investment", "opportunity",
                f"{ev['actor_name']} '{ev['action']}' activity opens "
                f"co-investment or acquisition entry points for UAE sovereign "
                f"and private capital.",
                ev, 0.55, "3-6 months",
                "Announced deal values involving UAE entities in the affected sector")

        # political_influence
        if ev["action"] in ("negotiated", "announced", "signed", "warned") and \
                (actor.startswith("ent_") and not actor.startswith("prov_")):
            actor_ent = next((e for e in entities if e["entity_id"] == actor), None)
            if actor_ent and actor_ent.get("entity_type") in (
                    "country", "government", "international_organization"):
                add("political_influence", "mixed",
                    f"Diplomatic positioning by {ev['actor_name']} reshapes the "
                    f"regional alignment space in which UAE mediation and "
                    f"convening carry weight.",
                    ev, 0.5, "3-6 months",
                    "UAE participation in region-related multilateral meetings")

        # technology
        if ev.get("sector") == "technology" or "technology" in (
                ev.get("sentence") or "").lower():
            add("technology", "opportunity",
                f"Technology-linked developments around {ev['actor_name']} "
                f"intersect with UAE digital-infrastructure and AI ambitions.",
                ev, 0.5, "6-12 months",
                "New technology partnership announcements naming UAE entities")

    # soft_power: only when humanitarian/aid context appears in real events.
    for ev in events:
        sent = (ev.get("sentence") or "").lower()
        if any(k in sent for k in ("humanitarian", "aid", "relief", "إغاثة",
                                   "مساعدات")):
            add("soft_power", "opportunity",
                f"Humanitarian dimension around {ev.get('location') or ev['actor_name']} "
                f"creates space for visible UAE relief and reconstruction roles.",
                ev, 0.5, "0-3 months",
                "UAE-flagged humanitarian shipments and pledges announced")

    if corridor_disrupted:
        # Consolidated corridor risk statement replaces per-event noise when
        # more than 7 implications accumulate.
        implications.sort(key=lambda i: -i["confidence"])
    return implications[:7]  # briefing carries at most 7 material implications
