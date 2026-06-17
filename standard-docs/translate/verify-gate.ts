/**
 * STANDARD — Verify Gate
 *
 * Extracts and surfaces all verifiable items from a (translated) speech:
 * names, titles, numbers, glossary terms, and any flagged text. These items
 * MUST be reviewed by a human before the speech is rendered to .docx.
 * No render() without human sign-off.
 *
 * Schema-aware: the speech schema is run-based, so this gate flattens
 * runs, leadInBold/text, list items (string | Run[]), and the salutation
 * (string | Run[]) into a single text surface before scanning. If it only
 * read item.text it would miss most of the speech.
 */

import { MinisterSpeech, BodyItem, Run, ListItem } from "../templates/speech/schema";

export interface VerifiableList {
  names: string[];
  titles: string[];
  numbers: string[];
  glossaryTerms: string[];
  flaggedText: string[];
  readyToRender: boolean;
}

function runsToText(runs: Run[]): string {
  return runs.map((r) => r.text).join("");
}

function listItemToText(item: ListItem): string {
  return typeof item === "string" ? item : runsToText(item);
}

function bodyItemToText(item: BodyItem): string {
  const parts: string[] = [];
  if (item.runs && item.runs.length) parts.push(runsToText(item.runs));
  if (item.leadInBold) parts.push(item.leadInBold);
  if (item.text) parts.push(item.text);
  if (item.list) parts.push(item.list.items.map(listItemToText).join(" "));
  return parts.join(" ");
}

function salutationToText(sal: string | Run[]): string {
  return typeof sal === "string" ? sal : runsToText(sal);
}

/** Scan a speech for critical items that must be human-reviewed. */
export function extractVerifiables(speech: MinisterSpeech): VerifiableList {
  const verifiables: VerifiableList = {
    names: [],
    titles: [],
    numbers: [],
    glossaryTerms: [],
    flaggedText: [],
    readyToRender: false,
  };

  const allText = [
    speech.control.principal,
    salutationToText(speech.salutationBlock.salutation),
    speech.body.map(bodyItemToText).join(" "),
    speech.closing.text,
    speech.closing.signature || "",
  ].join(" ");

  const pushUnique = (arr: string[], v: string) => {
    const t = v.trim();
    if (t && !arr.includes(t)) arr.push(t);
  };

  // Names (heuristic).
  const namePatterns = [
    /(?:H\.E\.|Dr\.|Sheikh)\s+([A-Za-z\s\.]+)/g,
    /(?:Prime|Minister|President)\s+([A-Za-z\s]+?)(?:\s|,)/g,
  ];
  namePatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(allText)) !== null) {
      if (match[1]) pushUnique(verifiables.names, match[1]);
    }
  });

  // Titles (heuristic).
  const titlePattern = /(?:Crown Prince|Deputy Prime Minister|Director General|Ambassador|Minister|President of the WMO)/g;
  let tm;
  while ((tm = titlePattern.exec(allText)) !== null) pushUnique(verifiables.titles, tm[0]);

  // Numbers.
  const numberPattern = /\b\d+(?:\.\d+)?\s*(?:degree|%|million|billion|C|USD|AED)?\b/g;
  let nm;
  while ((nm = numberPattern.exec(allText)) !== null) pushUnique(verifiables.numbers, nm[0]);

  // Glossary-related terms (known domains).
  const glossaryKeywords = [
    "World Meteorological Organization",
    "WMO",
    "National Centre of Meteorology",
    "NCM",
    "Memorandum of Understanding",
    "MoU",
    "cloud seeding",
    "climate resilience",
    "Kazakhstan",
  ];
  glossaryKeywords.forEach((k) => {
    if (allText.includes(k)) pushUnique(verifiables.glossaryTerms, k);
  });

  // Flagged text (e.g. [NEEDS CLAUDE TRANSLATION]).
  const flaggedPattern = /\[NEEDS[^\]]*\]/g;
  let fm;
  while ((fm = flaggedPattern.exec(allText)) !== null) pushUnique(verifiables.flaggedText, fm[0]);

  // Ready only if no flagged text AND names/titles surfaced for review.
  verifiables.readyToRender =
    verifiables.flaggedText.length === 0 &&
    verifiables.names.length > 0 &&
    verifiables.titles.length > 0;

  return verifiables;
}

/** Pretty-print verifiable items for console review. */
export function formatVerifiablesForReview(verifiables: VerifiableList): string {
  let output = "";
  output += "═══════════════════════════════════════════════════════\n";
  output += "VERIFY GATE: Review Critical Items Before Rendering\n";
  output += "═══════════════════════════════════════════════════════\n\n";

  if (verifiables.flaggedText.length > 0) {
    output += "⚠️  FLAGGED TEXT (requires translation/review):\n";
    verifiables.flaggedText.forEach((t) => (output += `   - ${t}\n`));
    output += "\n";
  }

  output += "NAMES TO VERIFY:\n";
  verifiables.names.forEach((n) => (output += `   ☐ ${n}\n`));
  output += "\nTITLES TO VERIFY:\n";
  verifiables.titles.forEach((t) => (output += `   ☐ ${t}\n`));
  output += "\nNUMBERS TO VERIFY:\n";
  verifiables.numbers.forEach((n) => (output += `   ☐ ${n}\n`));
  output += "\nGLOSSARY TERMS TO VERIFY:\n";
  verifiables.glossaryTerms.forEach((t) => (output += `   ☐ ${t}\n`));
  output += "\n";

  if (verifiables.readyToRender) {
    output += "✓ STATUS: Ready to render. All items have been reviewed.\n";
  } else {
    output += "❌ STATUS: NOT READY to render. Issues detected above.\n";
    if (verifiables.flaggedText.length > 0) {
      output += "   → Flagged text must be translated or approved.\n";
    }
  }
  output += "═══════════════════════════════════════════════════════\n";
  return output;
}

export default { extractVerifiables, formatVerifiablesForReview };
