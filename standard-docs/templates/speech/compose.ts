/**
 * STANDARD — Speech Composer
 *
 * Takes a MinisterSpeech input and composes it into an array of Paragraphs
 * using the component library from Task 2.
 *
 * No styling decisions here — all styling comes from the components, which
 * read the frozen tokens. Spacing between paragraphs is handled by the
 * components' paragraph spacing (from tokens), NOT by blank lines, so the
 * output matches the original's flow rather than double-spacing it.
 */

import {
  makeBodyParagraph,
  makeParagraphWithBoldLead,
  makeRunParagraph,
  makeBulletList,
  makeDashList,
  makeSectionBreak,
  Run,
  ListItem,
} from "../../engine/components";
import { MinisterSpeech, BodyItem, validateSpeech } from "./schema";

function salutationRuns(sal: string | Run[]): Run[] {
  if (typeof sal === "string") return [{ text: sal, bold: true }];
  // Force bold on every salutation run.
  return sal.map((r) => ({ text: r.text, bold: true }));
}

function listParagraphs(
  list: NonNullable<BodyItem["list"]>,
  lang: "en" | "ar"
) {
  const items: ListItem[] = list.items;
  return list.marker === "bullet"
    ? makeBulletList(items, lang)
    : makeDashList(items, lang);
}

export function composeSpeech(input: MinisterSpeech) {
  const errors = validateSpeech(input);
  if (errors.length > 0) {
    throw new Error(`Speech validation failed: ${errors.join("; ")}`);
  }

  const lang = input.control.language;
  const paragraphs: any[] = [];

  // 1. Salutation block (bold).
  paragraphs.push(makeRunParagraph(salutationRuns(input.salutationBlock.salutation), lang));

  // 2. Body.
  input.body.forEach((item) => {
    // Paragraph text first (runs > leadInBold/text), then any list.
    if (item.runs && item.runs.length > 0) {
      paragraphs.push(makeRunParagraph(item.runs, lang));
    } else if (item.leadInBold && item.text) {
      paragraphs.push(makeParagraphWithBoldLead(item.leadInBold, item.text, lang));
    } else if (item.leadInBold && !item.text) {
      paragraphs.push(makeRunParagraph([{ text: item.leadInBold, bold: true }], lang));
    } else if (item.text) {
      paragraphs.push(makeBodyParagraph(item.text, lang));
    }

    if (item.list) {
      paragraphs.push(...listParagraphs(item.list, lang));
    }
  });

  // 3. Closing (bold, per house style for the sign-off line).
  paragraphs.push(makeRunParagraph([{ text: input.closing.text, bold: true }], lang));
  if (input.closing.signature) {
    paragraphs.push(makeSectionBreak());
    paragraphs.push(makeBodyParagraph(input.closing.signature, lang));
  }

  return paragraphs;
}

export default { composeSpeech };
