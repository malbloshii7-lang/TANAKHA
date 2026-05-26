import io

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

from .base import ImageProvider

# Subtle per-style color grade applied over the enhanced photo.
STYLE_TINTS = {
    "modern": (205, 222, 214),
    "lush garden": (188, 238, 188),
    "desert xeriscape": (244, 220, 178),
    "family yard": (196, 234, 196),
}
LAWN_COLOR = (64, 150, 72)


class MockProvider(ImageProvider):
    """Zero-key offline renderer.

    Doesn't call any AI model — it applies a deterministic, makeover-style grade
    to the uploaded photo (richer greens, warm light, a fresh-lawn foreground,
    and a soft vignette) so the full product flow is demoable and testable
    without an image-generation API key. Swap in a real provider for production.
    """

    name = "mock"

    def render(self, before_bytes: bytes, brief: dict, style: str) -> bytes:
        img = Image.open(io.BytesIO(before_bytes)).convert("RGB")
        w, h = img.size

        # Pop + healthy color, like a freshly landscaped yard.
        img = ImageOps.autocontrast(img, cutoff=1)
        img = ImageEnhance.Color(img).enhance(1.5)
        img = ImageEnhance.Contrast(img).enhance(1.08)
        img = ImageEnhance.Brightness(img).enhance(1.04)

        # Push greens to suggest new lawn / planting.
        r, g, b = img.split()
        g = g.point(lambda v: min(255, int(v * 1.12)))
        img = Image.merge("RGB", (r, g, b))
        img = img.filter(ImageFilter.SMOOTH_MORE)

        # Style color grade + warm "golden hour" light.
        tint = Image.new("RGB", (w, h), STYLE_TINTS.get(style.lower(), (192, 234, 192)))
        img = Image.blend(img, tint, 0.10)
        warm = Image.new("RGB", (w, h), (255, 226, 170))
        img = Image.blend(img, warm, 0.05)

        img = self._lawn_foreground(img)
        img = self._vignette(img)
        self._badge(img, f"AI Preview · {style.title()}")

        out = io.BytesIO()
        img.save(out, format="JPEG", quality=88)
        return out.getvalue()

    @staticmethod
    def _lawn_foreground(img: Image.Image) -> Image.Image:
        """Blend a soft green gradient into the lower third to imply fresh turf."""
        w, h = img.size
        grad = Image.new("L", (1, h), 0)
        for y in range(h):
            frac = max(0.0, (y / h - 0.62) / 0.38)
            grad.putpixel((0, y), int(85 * frac))
        grad = grad.resize((w, h))
        lawn = Image.new("RGB", (w, h), LAWN_COLOR)
        return Image.composite(lawn, img, grad)

    @staticmethod
    def _vignette(img: Image.Image) -> Image.Image:
        w, h = img.size
        dark = ImageEnhance.Brightness(img).enhance(0.74)
        mask = Image.new("L", (w, h), 0)
        ImageDraw.Draw(mask).ellipse(
            [-0.15 * w, -0.15 * h, 1.15 * w, 1.15 * h], fill=255
        )
        mask = mask.filter(ImageFilter.GaussianBlur(min(w, h) * 0.14))
        return Image.composite(img, dark, mask)

    @staticmethod
    def _badge(img: Image.Image, text: str) -> None:
        draw = ImageDraw.Draw(img, "RGBA")
        w, h = img.size
        size = max(13, int(w * 0.022))
        try:
            font = ImageFont.truetype("DejaVuSans-Bold.ttf", size)
        except Exception:
            try:
                font = ImageFont.truetype("DejaVuSans.ttf", size)
            except Exception:
                font = ImageFont.load_default()

        bbox = draw.textbbox((0, 0), text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        pad = max(8, int(size * 0.6))
        x1, y1 = w - tw - pad * 3, h - th - pad * 3
        box = [x1 - pad, y1 - pad, w - pad, h - pad]
        try:
            draw.rounded_rectangle(box, radius=pad, fill=(12, 22, 16, 165))
        except (AttributeError, TypeError):
            draw.rectangle(box, fill=(12, 22, 16, 165))
        draw.text((x1, y1), text, fill=(235, 245, 235, 240), font=font)
