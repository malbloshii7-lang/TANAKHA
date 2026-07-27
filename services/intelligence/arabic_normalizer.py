"""Arabic text normalization.

The normalized form is used ONLY for matching, search and analytics.
The original Arabic text is always stored verbatim and permanently —
normalization must never replace or discard politically meaningful wording.
"""

import re
import unicodedata

from .language import normalize_digits

# Tatweel / kashida — purely typographic elongation.
_TATWEEL = "ـ"

# Arabic diacritics (harakat) — fathatan..sukun, plus superscript alef & quranic marks.
_DIACRITICS_RE = re.compile(r"[ً-ٰٟۖ-ۭ]")

# Alef variants -> bare alef (for matching only).
_ALEF_MAP = {ord(c): "ا" for c in "آأإٱ"}  # آ أ إ ٱ
# Alef maqsura -> ya, ta marbuta -> ha (standard IR normalizations for matching).
_CHAR_MAP = {**_ALEF_MAP, ord("ى"): "ي", ord("ة"): "ه"}

_WS_RE = re.compile(r"\s+")

# Minimal transliteration table for producing searchable Latin hints for
# Arabic names. Not a linguistic romanization — a matching aid only.
_TRANSLIT = {
    "ا": "a", "ب": "b", "ت": "t", "ث": "th", "ج": "j", "ح": "h", "خ": "kh",
    "د": "d", "ذ": "dh", "ر": "r", "ز": "z", "س": "s", "ش": "sh", "ص": "s",
    "ض": "d", "ط": "t", "ظ": "z", "ع": "a", "غ": "gh", "ف": "f", "ق": "q",
    "ك": "k", "ل": "l", "م": "m", "ن": "n", "ه": "h", "و": "w", "ي": "y",
    "ء": "", "ئ": "y", "ؤ": "w", "ة": "a", "ى": "a", "آ": "a", "أ": "a",
    "إ": "i", "لا": "la",
}


def remove_tatweel(text: str) -> str:
    return text.replace(_TATWEEL, "")


def remove_diacritics(text: str) -> str:
    return _DIACRITICS_RE.sub("", text)


def normalize_arabic(text: str, strip_diacritics: bool = True) -> str:
    """Produce the matching/normalized form of Arabic (or mixed) text.

    Steps: NFC unicode normalization, tatweel removal, optional diacritic
    removal, alef/ya/ta-marbuta unification, Arabic-Indic digit conversion
    and whitespace collapsing. Case is lowered for any Latin content.
    """
    if not text:
        return ""
    out = unicodedata.normalize("NFC", text)
    out = remove_tatweel(out)
    if strip_diacritics:
        out = remove_diacritics(out)
    out = out.translate(_CHAR_MAP)
    out = normalize_digits(out)
    out = _WS_RE.sub(" ", out).strip()
    return out.lower()


def transliterate(text: str) -> str:
    """Rough Arabic-to-Latin transliteration used for alias hints."""
    norm = normalize_arabic(text)
    out = []
    for ch in norm:
        out.append(_TRANSLIT.get(ch, ch))
    return _WS_RE.sub(" ", "".join(out)).strip()


def rendering_metadata(language: str) -> dict:
    """RTL rendering hints for the interface."""
    rtl = language in ("ar", "mixed")
    return {"direction": "rtl" if rtl else "ltr", "lang": language}
