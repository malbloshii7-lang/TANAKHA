/**
 * STANDARD — Phrase-Bank Draft Layer (offline)
 *
 * Built-in, deterministic copywriting layer. Takes sparse intake (occasion,
 * principal, location + any points the user typed) and expands it into a
 * full Kazakhstan-style ministerial speech:
 *   formal opening → polished paragraphs → bullet sections → forward-looking closing.
 *
 * 100% OFFLINE: no network, no translation API, no cloud. The Arabic and
 * English scaffolding lives in this file; user-entered specifics (names,
 * occasion, location) are placed verbatim into the chosen-language frame.
 * Rendering goes through the FROZEN engine, so LTR/RTL DOCX formatting is
 * already correct.
 */

import { MinisterSpeech, BodyItem } from "./schema";

export type Lang = "en" | "ar";

export interface DraftIntake {
  occasion: string;
  principal: string;
  audience?: string;
  location?: string;
  date?: string;
  closing?: string;
  body?: Array<{
    text?: string;
    bold?: boolean;
    list?: { marker: "bullet" | "dash"; items: string[] };
  }>;
}

interface Bank {
  salutationDefault: string;
  openingLead: string;
  openingRest: (occasion: string, location?: string) => string;
  significanceLead: string;
  significanceRest: (occasion: string) => string;
  bridgeToPoints: string;
  forwardLookingLead: string;
  forwardLookingRest: string;
  closingDefault: string;
}

const EN: Bank = {
  salutationDefault: "Excellencies, Ladies and Gentlemen,",
  openingLead: "It is a distinct honor to join you today",
  openingRest: (occasion, location) =>
    ` on the occasion of ${occasion}` + (location ? ` in ${location}` : "") + ".",
  significanceLead: "We gather at a moment of shared purpose",
  significanceRest: (occasion) =>
    ` — to mark ${occasion} and to reaffirm the partnership, the trust, and the common resolve that bring us together.`,
  bridgeToPoints: "Allow me to highlight the priorities that define our work ahead:",
  forwardLookingLead: "Looking ahead,",
  forwardLookingRest:
    " we remain committed to translating today's intent into lasting, measurable progress — built on cooperation and a shared vision for the future.",
  closingDefault: "Thank you.",
};

const AR: Bank = {
  salutationDefault: "أصحاب المعالي والسعادة، الحضور الكرام،",
  openingLead: "إنه لشرفٌ كبير أن أنضمّ إليكم اليوم",
  openingRest: (occasion, location) =>
    ` بمناسبة ${occasion}` + (location ? ` في ${location}` : "") + ".",
  significanceLead: "نلتقي اليوم في لحظةٍ تجمعنا حول هدفٍ مشترك",
  significanceRest: (occasion) =>
    `، لنحتفي بـ ${occasion} ونؤكد عمق الشراكة والثقة والإرادة المشتركة التي تجمعنا.`,
  bridgeToPoints: "واسمحوا لي أن أبيّن الأولويات التي ترسم ملامح عملنا في المرحلة المقبلة:",
  forwardLookingLead: "وإذ نتطلع إلى المستقبل،",
  forwardLookingRest:
    " فإننا ملتزمون بترجمة نوايا هذا اليوم إلى تقدمٍ ملموسٍ ودائم، يقوم على التعاون ورؤيةٍ مشتركة للغد.",
  closingDefault: "شكراً لكم.",
};

function bankFor(lang: Lang): Bank {
  return lang === "ar" ? AR : EN;
}

/**
 * draftSpeech — expand intake into a full MinisterSpeech using the phrase bank.
 * Honors any body paragraphs/lists the user already typed, wrapping them in
 * the formal opening / forward-looking closing scaffold.
 */
export function draftSpeech(intake: DraftIntake, lang: Lang): MinisterSpeech {
  const P = bankFor(lang);
  const occasion = (intake.occasion || "").trim();
  const location = (intake.location || "").trim();

  const salutation = (intake.audience || "").trim() || P.salutationDefault;
  const body: BodyItem[] = [];

  // 1. Formal opening (bold lead-in).
  body.push({ leadInBold: P.openingLead, text: P.openingRest(occasion, location) });

  // 2. Significance / partnership paragraph.
  body.push({ leadInBold: P.significanceLead, text: P.significanceRest(occasion) });

  // 3. The user's own content — polished paragraphs + bullet sections.
  let bridgedOnce = false;
  (intake.body || []).forEach((item) => {
    const text = (item.text || "").trim();
    const listItems = (item.list?.items || []).map((s) => (s || "").trim()).filter(Boolean);

    if (text) {
      if (item.bold) body.push({ leadInBold: text });
      else body.push({ text });
    }

    if (listItems.length) {
      // Add a single connective bridge line before the first bullet section
      // that has no preceding paragraph of its own.
      if (!text && !bridgedOnce) {
        body.push({ text: P.bridgeToPoints });
        bridgedOnce = true;
      }
      body.push({ list: { marker: item.list?.marker || "bullet", items: listItems } });
    }
  });

  // 4. Forward-looking closing paragraph.
  body.push({ leadInBold: P.forwardLookingLead, text: P.forwardLookingRest });

  const closing = (intake.closing || "").trim() || P.closingDefault;

  return {
    control: {
      occasion,
      principal: (intake.principal || "").trim(),
      audience: salutation,
      location,
      date: (intake.date || "").trim(),
      language: lang,
    },
    salutationBlock: { salutation },
    body,
    closing: { text: closing },
  };
}

/** Plain-text preview of a drafted speech, for the on-page preview pane. */
export function speechToPreview(speech: MinisterSpeech): string {
  const lines: string[] = [];
  const sal = speech.salutationBlock.salutation;
  lines.push(typeof sal === "string" ? sal : sal.map((r) => r.text).join(""));
  lines.push("");

  speech.body.forEach((item) => {
    const lead = item.leadInBold || "";
    const text = item.text || "";
    const runs = item.runs ? item.runs.map((r) => r.text).join("") : "";
    const paragraph = (lead + text + runs).trim();
    if (paragraph) lines.push(paragraph);
    if (item.list) {
      item.list.items.forEach((it) => {
        const t = typeof it === "string" ? it : it.map((r) => r.text).join("");
        lines.push("   • " + t);
      });
    }
    if (paragraph || item.list) lines.push("");
  });

  lines.push(speech.closing.text);
  return lines.join("\n");
}

export default { draftSpeech, speechToPreview };
