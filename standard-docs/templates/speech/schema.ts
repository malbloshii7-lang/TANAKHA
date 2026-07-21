/**
 * STANDARD — Speech Template Schema
 *
 * Input contract for speech composition.
 * A speech is: metadata + salutation + body (paragraphs, bullets, dashes) + closing
 *
 * Fidelity note: the original speeches contain bold spans *mid-sentence*,
 * not only bold lead-ins. So a BodyItem may carry an explicit `runs` array
 * (text + bold flag per run) for exact reproduction. `leadInBold` + `text`
 * remain as a convenience for the common "bold opener" case.
 */

/** A single inline run: a span of text with an optional bold flag. */
export interface Run {
  text: string;
  bold?: boolean;
}

/** A list item is either plain text or a sequence of inline runs. */
export type ListItem = string | Run[];

export interface BodyItem {
  // Convenience: bold text at the start of the paragraph...
  leadInBold?: string;
  // ...followed by this regular text.
  text?: string;

  // Faithful path: arbitrary inline runs (bold anywhere). If present,
  // `runs` takes precedence over leadInBold/text.
  runs?: Run[];

  // Optional list. Items may themselves carry inline bold.
  list?: {
    marker: "bullet" | "dash";
    items: ListItem[];
  };
}

export interface MinisterSpeech {
  control: {
    occasion: string;           // e.g. "Kazakhstan Cloud Seeding Project Launch"
    principal: string;          // e.g. "H.E. Dr. Abdulla Al Mandoos"
    audience: string;           // e.g. "Distinguished Deputy Prime Minister, Excellencies..."
    location: string;           // e.g. "Turkistan, Republic of Kazakhstan"
    date: string;               // e.g. "2025-06-17"
    language: "en" | "ar";      // Output language (EN or AR)
  };

  salutationBlock: {
    // The opening salutation. Rendered bold. May span multiple runs/lines.
    salutation: string | Run[];
  };

  body: BodyItem[];             // Body paragraphs, in order.

  closing: {
    text: string;
    signature?: string;
  };
}

/**
 * Utility: validate schema. Ensures required fields are non-empty.
 */
export function validateSpeech(input: MinisterSpeech): string[] {
  const errors: string[] = [];

  if (!input.control.occasion) errors.push("control.occasion is required");
  if (!input.control.principal) errors.push("control.principal is required");
  if (!input.control.audience) errors.push("control.audience is required");
  if (!input.control.language) errors.push("control.language is required");

  const sal = input.salutationBlock.salutation;
  const salEmpty = typeof sal === "string" ? !sal : !sal || sal.length === 0;
  if (salEmpty) errors.push("salutationBlock.salutation is required");

  if (!input.body || input.body.length === 0) errors.push("body must have at least one item");
  if (!input.closing.text) errors.push("closing.text is required");

  return errors;
}

export default { validateSpeech };
