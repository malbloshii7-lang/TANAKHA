import io

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

from .base import ImageProvider

# Subtle per-style color grade applied over the enhanced photo.
STYLE_TINTS = {
    "modern": (200, 224, 214),
    "lush garden": (190, 240, 190),
    "desert xeriscape": (244, 222, 184),
    "family yard": (198, 236, 198),
}


class MockProvider(ImageProvider):
    """Zero-key offline renderer.

    Doesn't call any AI model — it applies a deterministic 'makeover' grade to
    the uploaded photo so the full product flow is demoable (and testable)
    without an image-generation API key. Swap in a real provider for production.
    """

    name = "mock"

    def render(self, before_bytes: bytes, brief: dict, style: str) -> bytes:
        img = Image.open(io.BytesIO(before_bytes)).convert("RGB")

        # Make it pop like a freshly landscaped yard.
        img = ImageEnhance.Color(img).enhance(1.55)
        img = ImageEnhance.Contrast(img).enhance(1.08)
        img = ImageEnhance.Brightness(img).enhance(1.04)

        # Push greens to suggest new lawn / planting.
        r, g, b = img.split()
        g = g.point(lambda v: min(255, int(v * 1.12)))
        img = Image.merge("RGB", (r, g, b))

        img = img.filter(ImageFilter.SMOOTH_MORE)

        # Style color grade.
        tint = Image.new("RGB", img.size, STYLE_TINTS.get(style.lower(), (195, 235, 195)))
        img = Image.blend(img, tint, 0.12)

        self._watermark(img, f"AI Preview · {style.title()}")

        out = io.BytesIO()
        img.save(out, format="JPEG", quality=88)
        return out.getvalue()

    @staticmethod
    def _watermark(img: Image.Image, text: str) -> None:
        draw = ImageDraw.Draw(img, "RGBA")
        try:
            font = ImageFont.load_default()
        except Exception:
            font = None

        bbox = draw.textbbox((0, 0), text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        pad = 8
        w, h = img.size
        x1, y1 = w - tw - pad * 3, h - th - pad * 3
        draw.rectangle([x1 - pad, y1 - pad, w - pad, h - pad], fill=(15, 23, 18, 160))
        draw.text((x1, y1), text, fill=(235, 245, 235, 235), font=font)
