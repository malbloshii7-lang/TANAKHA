/**
 * STANDARD — Speech Text Parser (single-editor source of truth)
 *
 * Turns the plain text a user pastes/writes in the single body editor into
 * the run-based MinisterSpeech schema, so the generated .docx reflects the
 * typed formatting exactly:
 *
 *   blank line            -> new paragraph
 *   line starting "- "    -> bullet item (also *, •, –)
 *   **text**              -> bold run (real <w:b/> in the .docx)
 *
 * Also provides the inverse (speech body -> markup) so the phrase-bank
 * "Prepare" action can seed the same editor with editable text.
 */

import { MinisterSpeech, BodyItem, Run, ListItem } from "./schema";

export interface ParseIntake {
  occasion: string;
  principal: string;
  audience: string;
  location?: string;
  date?: string;
  language: "en" | "ar";
  body: string; // raw editor text
  closing?: string;
}

const BULLET_RE = /^\s*[-*•–]\s+(.*)$/;

/** Split a line into runs on **bold** spans. */
export function parseInline(s: string): Run[] {
  const runs: Run[] = [];
  const re = /\*\*([\s\S]+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) runs.push({ text: s.slice(last, m.index) });
    runs.push({ text: m[1], bold: true });
    last = re.lastIndex;
  }
  if (last < s.length) runs.push({ text: s.slice(last) });
  return runs.filter((r) => r.text.length > 0);
}

/** A list item collapses to a plain string when it has no bold. */
function inlineToListItem(s: string): ListItem {
  const runs = parseInline(s);
  if (runs.length === 1 && !runs[0].bold) return runs[0].text;
  return runs;
}

/** Parse one block (between blank lines) into a BodyItem. */
function parseBlock(block: string): BodyItem | null {
  const lines = block.split(/\r?\n/);
  const textLines: string[] = [];
  const bullets: string[] = [];

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) continue;
    const bm = line.match(BULLET_RE);
    if (bm) {
      bullets.push(bm[1].trim());
    } else if (bullets.length === 0) {
      textLines.push(line.trim());
    } else {
      // Non-bullet line after bullets started: treat as continuation.
      bullets[bullets.length - 1] += " " + line.trim();
    }
  }

  const out: BodyItem = {};
  const text = textLines.join(" ").trim();
  if (text) {
    const runs = parseInline(text);
    if (runs.length === 1 && !runs[0].bold) out.text = runs[0].text;
    else out.runs = runs;
  }
  if (bullets.length) {
    out.list = { marker: "bullet", items: bullets.map(inlineToListItem) };
  }

  return out.text || out.runs || out.list ? out : null;
}

/** Parse the raw editor text into ordered BodyItems. */
export function parseBody(bodyText: string): BodyItem[] {
  if (!bodyText) return [];
  return bodyText
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map(parseBlock)
    .filter((b): b is BodyItem => b !== null);
}

/** Build a MinisterSpeech from intake + the parsed editor text (faithful). */
export function parseSpeechFromText(intake: ParseIntake): MinisterSpeech {
  const lang = intake.language === "ar" ? "ar" : "en";
  return {
    control: {
      occasion: (intake.occasion || "").trim(),
      principal: (intake.principal || "").trim(),
      audience: (intake.audience || "").trim(),
      location: (intake.location || "").trim(),
      date: (intake.date || "").trim(),
      language: lang,
    },
    salutationBlock: { salutation: (intake.audience || "").trim() },
    body: parseBody(intake.body || ""),
    closing: { text: (intake.closing || "").trim() || (lang === "ar" ? "شكراً لكم." : "Thank you.") },
  };
}

// ---- inverse: speech body -> editor markup (for "Prepare" seeding) ----

function runsToMarkup(runs: Run[]): string {
  return runs.map((r) => (r.bold ? `**${r.text}**` : r.text)).join("");
}

function listItemToMarkup(item: ListItem): string {
  return typeof item === "string" ? item : runsToMarkup(item);
}

/** Serialize a speech's BODY into editor markup (excludes salutation/closing). */
export function speechBodyToMarkup(speech: MinisterSpeech): string {
  const blocks: string[] = [];
  speech.body.forEach((item) => {
    const paraParts: string[] = [];
    if (item.leadInBold) paraParts.push(`**${item.leadInBold}**`);
    if (item.text) paraParts.push(item.text);
    if (item.runs) paraParts.push(runsToMarkup(item.runs));
    const para = paraParts.join("");

    const lines: string[] = [];
    if (para.trim()) lines.push(para.trim());
    if (item.list) {
      item.list.items.forEach((it) => lines.push("- " + listItemToMarkup(it)));
    }
    if (lines.length) blocks.push(lines.join("\n"));
  });
  return blocks.join("\n\n");
}

export default { parseInline, parseBody, parseSpeechFromText, speechBodyToMarkup };
