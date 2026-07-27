"""Language detection and digit normalization for Arabic/English evidence."""

import re

_ARABIC_RE = re.compile(r"[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]")
_LATIN_RE = re.compile(r"[A-Za-z]")

# Arabic-Indic (٠-٩) and Extended Arabic-Indic / Persian (۰-۹) digits.
_ARABIC_INDIC = {ord(c): str(i) for i, c in enumerate("٠١٢٣٤٥٦٧٨٩")}
_EASTERN_ARABIC_INDIC = {ord(c): str(i) for i, c in enumerate("۰۱۲۳۴۵۶۷۸۹")}
_DIGIT_MAP = {**_ARABIC_INDIC, **_EASTERN_ARABIC_INDIC}
# Arabic decimal separator (٫) and thousands separator (٬).
_DIGIT_MAP[ord("٫")] = "."
_DIGIT_MAP[ord("٬")] = ","


def detect_language(text: str) -> str:
    """Return 'ar', 'en', 'mixed' or 'unknown' based on script composition."""
    if not text or not text.strip():
        return "unknown"
    arabic = len(_ARABIC_RE.findall(text))
    latin = len(_LATIN_RE.findall(text))
    total = arabic + latin
    if total == 0:
        return "unknown"
    ar_ratio = arabic / total
    if ar_ratio >= 0.85:
        return "ar"
    if ar_ratio <= 0.15:
        return "en"
    return "mixed"


def is_rtl(language: str) -> bool:
    return language in ("ar", "mixed")


def normalize_digits(text: str) -> str:
    """Convert Arabic-Indic digits to ASCII digits (٥٠ -> 50)."""
    return text.translate(_DIGIT_MAP)
