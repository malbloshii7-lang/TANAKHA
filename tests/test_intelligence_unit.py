"""Unit tests for the intelligence engine's analytical building blocks."""

import pytest

from services.intelligence.arabic_normalizer import (
    normalize_arabic,
    remove_diacritics,
    remove_tatweel,
    rendering_metadata,
    transliterate,
)
from services.intelligence.briefing import (
    LIMITS,
    check_length_compliance,
    compose_briefing,
    word_count,
)
from services.intelligence.citations import (
    build_appendix,
    build_citation,
    citation_coverage,
    citation_precision,
)
from services.intelligence.claims import validate_claim, validate_claims
from services.intelligence.confidence import WEIGHTS, score_confidence
from services.intelligence.entities import match_entities
from services.intelligence.events import extract_date
from services.intelligence.language import detect_language, normalize_digits
from services.intelligence.scenarios import round_probability, validate_scenario
from services.intelligence.source_processor import (
    SourceError,
    build_source,
    content_hash,
    ingest_upload,
)


# ─────────────────────────── Arabic normalization ───────────────────────────
class TestArabicNormalization:
    def test_tatweel_removed(self):
        assert remove_tatweel("الإمــــارات") == "الإمارات"

    def test_diacritics_removed(self):
        assert remove_diacritics("مُحَمَّد") == "محمد"

    def test_alef_variants_unified(self):
        assert normalize_arabic("أحمد") == normalize_arabic("احمد")
        assert normalize_arabic("إيران") == normalize_arabic("ايران")

    def test_ta_marbuta_and_alef_maqsura(self):
        assert normalize_arabic("سفينة") == normalize_arabic("سفينه")
        assert normalize_arabic("مصطفى") == normalize_arabic("مصطفي")

    def test_arabic_indic_digits_normalized(self):
        assert "45" in normalize_arabic("انخفض إلى ٤٥ سفينة")
        assert normalize_digits("٥٠٪ و۳۲") == "50٪ و32"

    def test_original_text_never_altered_by_build_source(self):
        text = "أعلنــت وزارة الاقتصاد عن ٥٠ مشروعاً"
        src = build_source(text)
        assert src["original_text"] == text  # verbatim, tatweel intact
        assert "50" in src["normalized_text"]

    def test_rtl_rendering_metadata(self):
        assert rendering_metadata("ar")["direction"] == "rtl"
        assert rendering_metadata("en")["direction"] == "ltr"

    def test_transliteration_is_latin(self):
        out = transliterate("محمد")
        assert out and all(ord(ch) < 128 for ch in out)


# ─────────────────────────── language detection ───────────────────────────
class TestLanguageDetection:
    def test_detects_arabic_english_mixed(self):
        assert detect_language("أعلنت الوزارة عن مشروع جديد") == "ar"
        assert detect_language("The ministry announced a project") == "en"
        assert detect_language("أعلنت DP World Group عن مشروع contract deal") == "mixed"
        assert detect_language("12345 !!!") == "unknown"


# ─────────────────────────── content hashing ───────────────────────────
class TestContentHashing:
    def test_hash_stability_and_dedup_semantics(self):
        a = content_hash("Some source text.")
        assert a == content_hash("  Some source text.  ")  # strip-insensitive
        assert a != content_hash("Some other text.")

    def test_hash_present_on_built_source(self):
        src = build_source("hello evidence world")
        assert src["content_hash"] == content_hash("hello evidence world")


# ─────────────────────────── date handling ───────────────────────────
class TestDateHandling:
    def test_iso_and_english_dates_exact(self):
        assert extract_date("It happened on 2026-06-12.").exact == "2026-06-12"
        assert extract_date("announced on 14 June 2026").exact == "2026-06-14"
        assert extract_date("on June 14, 2026").exact == "2026-06-14"

    def test_arabic_month_year_gives_period_not_exact(self):
        d = extract_date("في يونيو 2026 وقع الحادث")
        assert d.exact is None
        assert d.period == "2026-06"

    def test_year_only_gives_year_period(self):
        d = extract_date("during 2025 the volume grew")
        assert d.exact is None and d.period == "2025"

    def test_no_date_stays_empty(self):
        d = extract_date("no temporal information here")
        assert d.exact is None and d.period is None

    def test_arabic_indic_digit_dates(self):
        assert extract_date("يوم ٢٠٢٦-٠٦-١٢ وقع الهجوم").exact == "2026-06-12"

    def test_publication_date_validation(self):
        with pytest.raises(SourceError):
            build_source("x" * 50, publication_date="June 2026")


# ─────────────────────────── entity aliases ───────────────────────────
class TestEntityAliases:
    def test_english_and_arabic_alias_same_entity(self):
        en = match_entities("DP World expanded operations.")
        ar = match_entities("أعلنت شركة دي بي ورلد عن التوسع.")
        assert en and ar
        assert en[0][0].entity_id == ar[0][0].entity_id == "ent_dpworld"

    def test_alias_with_diacritics_and_variants(self):
        a = match_entities("تحركت أنصار الله في الحديدة")
        ids = {e.entity_id for e, _ in a}
        assert "ent_houthis" in ids and "ent_hodeidah" in ids

    def test_partial_name_does_not_false_positive(self):
        # A company named أنصار must not match the armed group أنصار الله.
        ids = {e.entity_id for e, _ in
               match_entities("وقعت شركة أنصار للتجارة اتفاقية توريد")}
        assert "ent_houthis" not in ids

    def test_longest_alias_wins(self):
        found = match_entities("The Suez Canal Authority issued a statement.")
        assert found[0][0].entity_id == "ent_scz"


# ─────────────────────────── claim validation ───────────────────────────
class TestClaimValidation:
    KNOWN = {"src_001", "src_002"}

    def test_observed_without_sources_blocked(self):
        issues = validate_claim(
            {"claim_id": "c1", "claim_type": "observed", "text": "X happened.",
             "source_ids": []}, self.KNOWN)
        assert any(i.code == "unsupported_observed_claim" for i in issues)

    def test_observed_with_interpretation_blocked(self):
        issues = validate_claim(
            {"claim_id": "c1", "claim_type": "observed",
             "text": "This probably means escalation.",
             "source_ids": ["src_001"]}, self.KNOWN)
        assert any(i.code == "interpretation_as_fact" for i in issues)

    def test_unknown_citation_blocked(self):
        issues = validate_claim(
            {"claim_id": "c1", "claim_type": "observed", "text": "X.",
             "source_ids": ["src_999"]}, self.KNOWN)
        assert any(i.code == "unknown_citation" for i in issues)

    def test_inferred_requires_reasoning_confidence_counterevidence(self):
        issues = validate_claim(
            {"claim_id": "c2", "claim_type": "inferred", "text": "Y implies Z.",
             "source_ids": ["src_001"]}, self.KNOWN)
        codes = {i.code for i in issues}
        assert {"inference_without_reasoning", "inference_without_confidence",
                "counterevidence_not_recorded"} <= codes

    def test_valid_inferred_passes(self):
        issues = validate_claim(
            {"claim_id": "c2", "claim_type": "inferred", "text": "Y implies Z.",
             "source_ids": ["src_001"], "reasoning": "because",
             "confidence": 0.5, "counterevidence": None}, self.KNOWN)
        assert not issues

    def test_forecast_without_horizon_blocked(self):
        issues = validate_claim(
            {"claim_id": "c3", "claim_type": "forecast", "text": "Will grow.",
             "source_ids": ["src_001"], "assumptions": ["a"],
             "confirming_indicators": ["b"], "weakening_indicators": ["c"]},
            self.KNOWN)
        assert any(i.code == "forecast_without_horizon" for i in issues)

    def test_invalid_type_blocked(self):
        issues = validate_claim(
            {"claim_id": "c4", "claim_type": "opinion", "text": "?"}, self.KNOWN)
        assert any(i.code == "invalid_claim_type" for i in issues)

    def test_validate_claims_partitions(self):
        result = validate_claims([
            {"claim_id": "ok", "claim_type": "observed", "text": "X.",
             "source_ids": ["src_001"]},
            {"claim_id": "bad", "claim_type": "observed", "text": "Y.",
             "source_ids": []},
        ], self.KNOWN)
        assert [c["claim_id"] for c in result.valid] == ["ok"]
        assert [c["claim_id"] for c in result.rejected] == ["bad"]
        assert result.rejected[0]["rejected_reasons"] == [
            "unsupported_observed_claim"]


# ─────────────────────────── confidence ───────────────────────────
class TestConfidence:
    SRC = {"source_id": "src_001", "publisher": "A", "reliability_score": 0.9,
           "publication_date": "2026-06-20"}

    def test_weights_sum_to_one(self):
        assert abs(sum(WEIGHTS.values()) - 1.0) < 1e-9

    def test_more_sources_higher_confidence(self):
        one = score_confidence(sources=[self.SRC], knowledge_cutoff="2026-07-01")
        two = score_confidence(
            sources=[self.SRC,
                     {**self.SRC, "source_id": "src_002", "publisher": "B"}],
            knowledge_cutoff="2026-07-01")
        assert two["score"] > one["score"]

    def test_contradictions_reduce_confidence(self):
        clean = score_confidence(sources=[self.SRC], knowledge_cutoff="2026-07-01")
        dirty = score_confidence(sources=[self.SRC], knowledge_cutoff="2026-07-01",
                                 contradiction_count=2)
        assert dirty["score"] < clean["score"]

    def test_model_confidence_capped_at_5_points(self):
        low = score_confidence(sources=[self.SRC], knowledge_cutoff="2026-07-01",
                               model_confidence=0.0)
        high = score_confidence(sources=[self.SRC], knowledge_cutoff="2026-07-01",
                                model_confidence=1.0)
        assert high["score"] - low["score"] <= 0.05 + 1e-9

    def test_breakdown_documented(self):
        out = score_confidence(sources=[self.SRC], knowledge_cutoff="2026-07-01")
        assert set(out["factors"]) == set(WEIGHTS)
        assert out["explanation"]


# ─────────────────────────── scenario validation ───────────────────────────
class TestScenarioValidation:
    def _scenario(self, **over):
        base = {
            "scenario_type": "base", "title": "T", "summary": "S",
            "probability": 55, "time_horizon": "3-6 months",
            "assumptions": ["a"], "confirming_indicators": ["c"],
            "weakening_indicators": ["w"], "uae_opportunity": "o",
            "uae_risk": "r", "linked_claim_ids": ["clm_001"],
        }
        base.update(over)
        return base

    def test_complete_scenario_passes(self):
        assert validate_scenario(self._scenario()) == []

    def test_missing_fields_rejected(self):
        problems = validate_scenario(self._scenario(assumptions=[], uae_risk=""))
        assert "missing_assumptions" in problems and "missing_uae_risk" in problems

    def test_pseudo_precision_rejected(self):
        assert "probability_pseudo_precision" in validate_scenario(
            self._scenario(probability=53.27))

    def test_round_probability(self):
        assert round_probability(0.5327) == 55
        assert round_probability(0.01) == 5
        assert round_probability(0.99) == 90


# ─────────────────────────── citations ───────────────────────────
class TestCitations:
    SOURCES = [
        {"source_id": "src_001", "title": "A", "publisher": "P1",
         "publication_date": "2026-06-01", "url": None, "language": "en",
         "reliability": "high"},
        {"source_id": "src_002", "title": "B", "publisher": "P2",
         "publication_date": "2026-06-02", "url": None, "language": "ar",
         "reliability": "medium"},
    ]

    def test_citation_construction(self):
        cite = build_citation(self.SOURCES[0])
        assert cite["source_id"] == "src_001" and cite["reliability"] == "high"

    def test_appendix_restricted_to_used(self):
        appendix = build_appendix(self.SOURCES, {"src_002"})
        assert [a["source_id"] for a in appendix] == ["src_002"]

    def test_coverage_and_precision(self):
        claims = [
            {"source_ids": ["src_001"]},
            {"source_ids": []},
        ]
        assert citation_coverage(claims) == 0.5
        assert citation_precision(
            [{"source_ids": ["src_001", "src_999"]}], {"src_001"}) == 0.5


# ─────────────────────────── briefing limits ───────────────────────────
class TestBriefingLimits:
    def test_word_count_counts_arabic(self):
        assert word_count("أعلنت الوزارة عن مشروع") == 4

    def test_length_compliance_flags_violations(self):
        over = " ".join(["word"] * (LIMITS["what_changed"] + 5))
        problems = check_length_compliance(
            {"what_changed": over, "executive_judgement": "ok",
             "leadership_takeaway": "ok", "why_it_matters": [],
             "uae_implications": [], "indicators_to_watch": [],
             "scenarios": []})
        assert problems == ["what_changed_over_limit"]

    def test_compose_briefing_respects_limits(self):
        claims = [{"claim_id": f"clm_{i}", "claim_type": "observed",
                   "text": "Entity did thing number %d in some place." % i,
                   "source_ids": ["src_001"]} for i in range(10)]
        briefing = compose_briefing(
            sources=[{"source_id": "src_001", "title": "t", "publisher": "p",
                      "publication_date": "2026-06-01", "url": None,
                      "language": "en", "reliability": "high"}],
            events=[], claims=claims, contradictions=[], implications=[],
            scenarios=[], confidence={"score": 0.6, "explanation": "test",
                                      "factors": {}, "weights": {}})
        assert check_length_compliance(briefing) == []
        assert briefing["source_appendix"]


# ─────────────────────────── uploads ───────────────────────────
class TestUploads:
    def test_txt_and_json_ingestion(self):
        [src] = ingest_upload("a.txt", "hello evidence text".encode())
        assert src["origin"] == "txt"
        [src] = ingest_upload("a.json", b'{"text": "from json", "publisher": "P"}')
        assert src["origin"] == "json" and src["publisher"] == "P"

    def test_scanned_pdf_flagged_not_faked(self):
        import io

        from pypdf import PdfWriter
        buf = io.BytesIO()
        writer = PdfWriter()
        writer.add_blank_page(width=200, height=200)  # no extractable text
        writer.write(buf)
        with pytest.raises(SourceError, match="scanned|no extractable"):
            ingest_upload("scan.pdf", buf.getvalue())

    def test_invalid_json_rejected(self):
        with pytest.raises(SourceError):
            ingest_upload("bad.json", b"{not json")
