/**
 * STANDARD — Translation Engine
 *
 * Translates speech content with glossary + protocol enforcement.
 *
 * Glossary terms are LOCKED — the LLM cannot change them.
 * Protocol titles are LOCKED — substituted verbatim from protocol.json.
 * Result is sent to the verify gate before any .docx is rendered.
 *
 * NOTE: This engine is a CONSTRAINT ENFORCER, not a free translator.
 * Free translation of non-glossary text is a marked TODO (Claude API).
 * Until that is wired, any text that still contains Latin words after
 * glossary/protocol substitution is flagged "[NEEDS CLAUDE TRANSLATION]"
 * so the verify gate blocks rendering.
 *
 * Schema compatibility: the approved speech schema (Task 3) is run-based —
 * a BodyItem may carry `runs` (inline bold spans) and lists may carry
 * Run[] items, and the salutation may be string | Run[]. This engine
 * substitutes into ALL of those so no content is silently skipped.
 */

import fs from "fs";
import path from "path";
import { MinisterSpeech, BodyItem, Run, ListItem } from "../templates/speech/schema";

// Load glossaries (resolved relative to this file — cross-platform).
const ROOT = path.resolve(__dirname, "..");
const termsPath = path.join(ROOT, "glossary", "terms.json");
const protocolPath = path.join(ROOT, "glossary", "protocol.json");

const termsData = JSON.parse(fs.readFileSync(termsPath, "utf-8"));
const protocolData = JSON.parse(fs.readFileSync(protocolPath, "utf-8"));

/** Build a glossary lookup (en → ar) from CONFIRMED entries only. */
function buildGlossaryLookup(): Map<string, string> {
  const lookup = new Map<string, string>();
  termsData.entries.forEach((entry: any) => {
    if (entry.status === "confirmed") lookup.set(entry.en.toLowerCase(), entry.ar);
  });
  return lookup;
}

/** Build a protocol lookup (en → ar) from CONFIRMED entries only. */
function buildProtocolLookup(): Map<string, string> {
  const lookup = new Map<string, string>();
  protocolData.entries.forEach((entry: any) => {
    if (entry.status === "confirmed") lookup.set(entry.en, entry.ar); // EXACT match
  });
  return lookup;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Apply CONFIRMED glossary terms (case-insensitive, word-boundary). */
function applyGlossary(text: string, glossary: Map<string, string>): string {
  let result = text;
  glossary.forEach((ar, en) => {
    const regex = new RegExp(`\\b${escapeRegExp(en)}\\b`, "gi");
    result = result.replace(regex, ar);
  });
  return result;
}

/** Apply CONFIRMED protocol titles (exact, case-sensitive). Done FIRST. */
function applyProtocol(text: string, protocol: Map<string, string>): string {
  let result = text;
  protocol.forEach((ar, en) => {
    result = result.split(en).join(ar);
  });
  return result;
}

/** Protocol first (longest/most specific), then glossary. */
function enforce(text: string, glossary: Map<string, string>, protocol: Map<string, string>): string {
  return applyGlossary(applyProtocol(text, protocol), glossary);
}

/** Latin words remaining = untranslated free text → flag for the gate. */
const UNTRANSLATED_FLAG = " [NEEDS CLAUDE TRANSLATION]";
function flagIfUntranslated(text: string): string {
  if (!text) return text;
  if (/[A-Za-z]{2,}/.test(text) && !text.includes(UNTRANSLATED_FLAG)) {
    return text + UNTRANSLATED_FLAG;
  }
  return text;
}

function enforceRun(run: Run, glossary: Map<string, string>, protocol: Map<string, string>): Run {
  return { text: flagIfUntranslated(enforce(run.text, glossary, protocol)), bold: run.bold };
}

function enforceListItem(item: ListItem, glossary: Map<string, string>, protocol: Map<string, string>): ListItem {
  if (typeof item === "string") return flagIfUntranslated(enforce(item, glossary, protocol));
  return item.map((r) => enforceRun(r, glossary, protocol));
}

/**
 * Main translation function: EN → AR with glossary + protocol enforcement.
 *
 * 1. Apply locked protocol titles (verbatim, complete blocks)
 * 2. Apply locked glossary terms (verbatim)
 * 3. Flag any remaining Latin text for the verify gate (Claude API = TODO)
 * 4. Return the constrained speech data (NOT yet render-ready)
 */
export async function translateSpeechENtoAR(inputSpeech: MinisterSpeech): Promise<MinisterSpeech> {
  if (inputSpeech.control.language !== "en") {
    throw new Error("Input speech must be in English");
  }

  const glossary = buildGlossaryLookup();
  const protocol = buildProtocolLookup();

  console.log(`Glossary size: ${glossary.size} confirmed terms`);
  console.log(`Protocol size: ${protocol.size} confirmed titles`);
  console.warn("⚠️  Free translation of non-glossary text requires Claude API integration.");
  console.warn("   Until wired, untranslated text is flagged and the verify gate blocks render.");

  // Salutation (string | Run[]).
  const sal = inputSpeech.salutationBlock.salutation;
  const translatedSalutation =
    typeof sal === "string"
      ? flagIfUntranslated(enforce(sal, glossary, protocol))
      : sal.map((r) => enforceRun(r, glossary, protocol));

  // Body — handle runs, leadInBold/text, and lists.
  const translatedBody: BodyItem[] = inputSpeech.body.map((item) => {
    const out: BodyItem = {};

    if (item.runs && item.runs.length > 0) {
      out.runs = item.runs.map((r) => enforceRun(r, glossary, protocol));
    } else {
      if (item.leadInBold) out.leadInBold = flagIfUntranslated(enforce(item.leadInBold, glossary, protocol));
      if (item.text) out.text = flagIfUntranslated(enforce(item.text, glossary, protocol));
    }

    if (item.list) {
      out.list = {
        marker: item.list.marker,
        items: item.list.items.map((it) => enforceListItem(it, glossary, protocol)),
      };
    }
    return out;
  });

  // Closing.
  const translatedClosing = flagIfUntranslated(enforce(inputSpeech.closing.text, glossary, protocol));

  const translatedSpeech: MinisterSpeech = {
    control: { ...inputSpeech.control, language: "ar" },
    salutationBlock: { salutation: translatedSalutation },
    body: translatedBody,
    closing: { text: translatedClosing, signature: inputSpeech.closing.signature },
  };

  return translatedSpeech;
}

/**
 * INTEGRATION REQUIRED:
 * The above applies glossary + protocol but does NOT call Claude for free
 * translation of non-glossary text. To complete:
 *   1. Add a Claude API key to the environment (ANTHROPIC_API_KEY).
 *   2. Call the Anthropic Messages API with a system prompt enforcing
 *      formal/ceremonial Arabic and preservation of glossary/protocol terms.
 *   3. Replace flagIfUntranslated(...) with the API result for non-locked text.
 * Until then, the verify gate surfaces every flagged item.
 */

export default { translateSpeechENtoAR };
