import base64
import os

import httpx

from .base import ImageProvider

API_URL = "https://api.replicate.com/v1/models/{model}/predictions"
DEFAULT_MODEL = "black-forest-labs/flux-dev"


def _build_prompt(brief: dict, style: str) -> str:
    summary = brief.get("summary", "")
    features = ", ".join(brief.get("features", [])[:5])
    parts = [
        f"A professionally landscaped {style} yard",
        summary,
        f"featuring {features}" if features else "",
        "photorealistic, golden hour, magazine quality, high detail",
    ]
    return ", ".join(p for p in parts if p)


class ReplicateProvider(ImageProvider):
    """Real image-to-image renderer via Replicate (e.g. FLUX).

    Reads IMAGE_API_KEY. Used only when IMAGE_PROVIDER=replicate and a key is
    present. Network-dependent; not exercised by the offline test suite.
    """

    name = "replicate"

    def __init__(self) -> None:
        self.token = os.getenv("IMAGE_API_KEY", "")
        self.model = os.getenv("REPLICATE_MODEL", DEFAULT_MODEL)
        if not self.token:
            raise RuntimeError("IMAGE_API_KEY is not set for ReplicateProvider")

    def render(self, before_bytes: bytes, brief: dict, style: str) -> bytes:
        data_uri = "data:image/jpeg;base64," + base64.standard_b64encode(before_bytes).decode()
        payload = {
            "input": {
                "prompt": _build_prompt(brief, style),
                "image": data_uri,
                "prompt_strength": 0.78,
                "output_format": "jpg",
            }
        }
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
            "Prefer": "wait",
        }
        url = API_URL.format(model=self.model)
        with httpx.Client(timeout=120) as client:
            resp = client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            body = resp.json()
            output = body.get("output")
            image_url = output[0] if isinstance(output, list) else output
            if not image_url:
                raise RuntimeError(f"Replicate returned no image: {body.get('status')}")
            img = client.get(image_url)
            img.raise_for_status()
            return img.content
