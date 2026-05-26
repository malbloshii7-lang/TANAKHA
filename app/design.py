import base64
import json
import os
import re

STYLE_TEMPLATES = {
    "modern": {
        "summary": "A clean, architectural yard with crisp geometry, low-maintenance "
        "plantings, and sleek hardscaping that feels calm and contemporary.",
        "features": [
            "Poured-concrete or large-format pavers",
            "Linear raised planters",
            "Ornamental grasses and structured shrubs",
            "Integrated low-voltage lighting",
            "Minimalist seating area",
        ],
        "suggested_plants": ["Boxwood", "Feather reed grass", "Agave", "Japanese maple"],
        "est_budget_range": "$8,000 – $25,000",
    },
    "lush garden": {
        "summary": "A vibrant, layered garden bursting with color and greenery, with "
        "winding beds, a healthy lawn, and a welcoming, lived-in feel.",
        "features": [
            "Fresh, healthy lawn",
            "Layered flowering beds",
            "Stone or mulch pathways",
            "Mixed perennials and shrubs",
            "Accent trees for shade",
        ],
        "suggested_plants": ["Hydrangea", "Lavender", "Hostas", "Roses", "Ferns"],
        "est_budget_range": "$6,000 – $20,000",
    },
    "desert xeriscape": {
        "summary": "A water-wise desert landscape using gravel, boulders, and sculptural "
        "drought-tolerant plants for a striking, near-zero-irrigation yard.",
        "features": [
            "Decomposed granite ground cover",
            "Accent boulders",
            "Drip irrigation",
            "Sculptural succulents and cacti",
            "Steel or stone edging",
        ],
        "suggested_plants": ["Agave", "Red yucca", "Barrel cactus", "Desert spoon", "Sage"],
        "est_budget_range": "$5,000 – $15,000",
    },
    "family yard": {
        "summary": "A durable, kid- and pet-friendly yard balancing open lawn for play "
        "with shade, soft borders, and an easy-care gathering space.",
        "features": [
            "Open, resilient lawn",
            "Shade tree",
            "Soft planting borders",
            "Patio or play area",
            "Low-maintenance shrubs",
        ],
        "suggested_plants": ["Fescue lawn", "Maple", "Daylilies", "Spirea", "Creeping thyme"],
        "est_budget_range": "$5,000 – $18,000",
    },
}


def _fallback_brief(style: str) -> dict:
    tpl = STYLE_TEMPLATES.get(style.lower(), STYLE_TEMPLATES["lush garden"])
    return {"style": style, "source": "template", **tpl}


def _extract_json(text: str) -> dict:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("no JSON object in model response")
    return json.loads(match.group(0))


def generate_brief(image_bytes: bytes, style: str, media_type: str = "image/jpeg") -> dict:
    """Use Claude vision to produce a landscape design brief for the photo.

    Falls back to a templated brief if Claude is disabled, unavailable, or errors,
    so the endpoint never hard-fails.
    """
    if os.getenv("TANAKHA_DISABLE_CLAUDE") == "1":
        return _fallback_brief(style)

    try:
        from anthropic import Anthropic

        client = Anthropic()
        model = os.getenv("CLAUDE_MODEL", "claude-haiku-4-5-20251001")
        b64 = base64.standard_b64encode(image_bytes).decode()
        prompt = (
            f"You are a professional landscape designer. The attached photo is a "
            f"homeowner's yard. Propose a '{style}' makeover. Respond with ONLY a JSON "
            f"object, no prose, with keys: summary (string, 1-2 sentences), features "
            f"(array of 4-6 short strings), suggested_plants (array of 3-6 plant names), "
            f"est_budget_range (string like '$6,000 - $20,000'). Keep it realistic and "
            f"specific to what you see in the photo."
        )
        msg = client.messages.create(
            model=model,
            max_tokens=700,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": b64,
                            },
                        },
                        {"type": "text", "text": prompt},
                    ],
                }
            ],
        )
        text = "".join(b.text for b in msg.content if getattr(b, "type", None) == "text")
        data = _extract_json(text)
        data["style"] = style
        data["source"] = "claude"
        return data
    except Exception:
        return _fallback_brief(style)
