"""Golden-case evaluation runner.

Usage:
    python -m packages.evaluation.runner [--report-dir DIR] [--provider NAME]

Loads every JSON case in packages/evaluation/golden_cases/, runs the
intelligence pipeline (deterministic by default, offline), evaluates the
expectations and writes a machine-readable JSON report plus a human-readable
Markdown summary. Exit code 1 when any case fails a critical analytical
invariant OR any expectation check fails — this is the CI gate.
"""

import argparse
import json
import pathlib
import sys

from services.intelligence.pipeline import IntelligencePipeline
from services.intelligence.providers import get_provider
from services.intelligence.source_processor import build_source

from .metrics import evaluate_case
from .reports import write_reports

CASES_DIR = pathlib.Path(__file__).parent / "golden_cases"


def load_cases() -> list[dict]:
    cases = []
    for path in sorted(CASES_DIR.glob("*.json")):
        with open(path, encoding="utf-8") as fh:
            case = json.load(fh)
        case.setdefault("case_id", path.stem)
        cases.append(case)
    return cases


def build_case_sources(case: dict) -> list[dict]:
    sources = []
    for i, spec in enumerate(case["sources"], start=1):
        record = build_source(
            spec["text"],
            title=spec.get("title"),
            publisher=spec.get("publisher"),
            source_type=spec.get("source_type", "other"),
            url=spec.get("url"),
            publication_date=spec.get("publication_date"),
            event_date=spec.get("event_date"),
            reliability=spec.get("reliability", "medium"),
            origin="golden_case",
        )
        record["source_id"] = spec.get("source_id") or f"src_{i:03d}"
        sources.append(record)
    return sources


def run_evaluation(provider_name: str = "deterministic") -> dict:
    cases = load_cases()
    provider = get_provider(provider_name)
    results = []
    for case in cases:
        sources = build_case_sources(case)
        pipeline = IntelligencePipeline(provider)
        result = pipeline.run(
            sources,
            strategic_question=case.get("strategic_question"),
            knowledge_cutoff=case.get("knowledge_cutoff"),
        ).to_dict()
        results.append(evaluate_case(case, result, sources))

    critical = [v for r in results for v in r["violations"] if v["critical"]]
    failed = [r for r in results if not r["passed"]]
    return {
        "provider": provider.info(),
        "case_count": len(results),
        "passed": len(results) - len(failed),
        "failed": len(failed),
        "critical_violations": critical,
        "results": results,
        "ci_pass": not failed and not critical,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--report-dir", default="evaluation-reports")
    parser.add_argument("--provider", default="deterministic")
    args = parser.parse_args()

    report = run_evaluation(args.provider)
    json_path, md_path = write_reports(report, args.report_dir)
    print(f"Machine-readable report: {json_path}")
    print(f"Human-readable summary:  {md_path}")
    print(f"Cases: {report['passed']}/{report['case_count']} passed; "
          f"critical violations: {len(report['critical_violations'])}")
    if not report["ci_pass"]:
        for r in report["results"]:
            if not r["passed"]:
                print(f"FAILED {r['case_id']}:")
                for c in r["checks"]:
                    if not c["ok"]:
                        print(f"  - check {c['check']}: {c['detail']}")
                for v in r["violations"]:
                    tag = "CRITICAL" if v["critical"] else "violation"
                    print(f"  - {tag} {v['code']}: {v['message']}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
