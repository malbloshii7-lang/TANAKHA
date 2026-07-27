"""Evaluation report writers: machine-readable JSON + human Markdown."""

import datetime
import json
import pathlib


def write_reports(report: dict, out_dir: str) -> tuple[str, str]:
    out = pathlib.Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    json_path = out / f"evaluation-{stamp}.json"
    with open(json_path, "w", encoding="utf-8") as fh:
        json.dump(report, fh, ensure_ascii=False, indent=2)
    latest = out / "latest.json"
    with open(latest, "w", encoding="utf-8") as fh:
        json.dump(report, fh, ensure_ascii=False, indent=2)

    md_path = out / f"evaluation-{stamp}.md"
    with open(md_path, "w", encoding="utf-8") as fh:
        fh.write(render_markdown(report))
    return str(json_path), str(md_path)


def render_markdown(report: dict) -> str:
    lines = [
        "# Golden evaluation report",
        "",
        f"- Provider: `{report['provider']['provider']}` "
        f"(model `{report['provider'].get('model_id')}`)",
        f"- Cases: **{report['passed']}/{report['case_count']} passed**",
        f"- Critical violations: **{len(report['critical_violations'])}**",
        f"- CI gate: {'PASS ✅' if report['ci_pass'] else 'FAIL ❌'}",
        "",
        "| Case | Result | Failed checks | Violations |",
        "|---|---|---|---|",
    ]
    for r in report["results"]:
        failed = [c["check"] for c in r["checks"] if not c["ok"]]
        viols = [v["code"] for v in r["violations"]]
        lines.append(
            f"| {r['case_id']} | {'✅' if r['passed'] else '❌'} | "
            f"{', '.join(failed) or '—'} | {', '.join(viols) or '—'} |")
    lines.append("")
    lines.append("## Aggregate metrics")
    lines.append("")
    agg: dict[str, list[float]] = {}
    for r in report["results"]:
        for key, value in r["metrics"].items():
            if isinstance(value, (int, float)):
                agg.setdefault(key, []).append(float(value))
    for key, values in sorted(agg.items()):
        mean = sum(values) / len(values)
        lines.append(f"- **{key}**: mean {mean:.3f} over {len(values)} case(s)")
    lines.append("")
    return "\n".join(lines)
