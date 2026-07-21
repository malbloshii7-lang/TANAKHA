/**
 * STANDARD — Component Library (Task 2)
 *
 * Token-driven paragraph builders. No geometry here (that is render-docx);
 * these produce styled Paragraphs/runs from frozen tokens.
 *
 * All styling (font, size, color, alignment, list markers) reads from
 * tokens.json. Zero hardcoded design values.
 */

import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");
const tokens = JSON.parse(
  fs.readFileSync(path.join(ROOT, "tokens", "tokens.json"), "utf-8")
);

const { Paragraph, TextRun, AlignmentType } = require("docx");

export type Lang = "en" | "ar";

/** A single inline run: text + optional bold. */
export interface Run {
  text: string;
  bold?: boolean;
}

// Numbering reference names defined by render-docx's Document config.
export const BULLET_REF = "std-bullet";
export const DASH_REF = "std-dash";

const ink = () => tokens.color.ink.replace("#", "");
const familyFor = (lang: Lang) =>
  lang === "ar" ? tokens.type.body.familyAR : tokens.type.body.familyEN;
const sizeHalfPt = (lang: Lang) =>
  (lang === "ar" ? tokens.type.body.sizeAR : tokens.type.body.sizeEN) * 2;
const bodyAlign = (lang: Lang) =>
  lang === "ar" ? AlignmentType.RIGHT : AlignmentType.LEFT;

// Paragraph spacing derived from tokens (em -> twips; 1pt = 20 twips).
const spaceBefore = () =>
  Math.round(tokens.spacing.paraBeforeEm * tokens.type.body.sizeEN * 20);
const spaceAfter = () =>
  Math.round(tokens.spacing.paraAfterEm * tokens.type.body.sizeEN * 20);

/** Build a single docx TextRun from a Run, honouring language + tokens. */
function toTextRun(run: Run, lang: Lang) {
  return new TextRun({
    text: run.text,
    bold: !!run.bold,
    font: familyFor(lang),
    size: sizeHalfPt(lang),
    color: ink(),
    ...(lang === "ar" ? { rightToLeft: true } : {}),
  });
}

const paraOpts = (lang: Lang) => ({
  alignment: bodyAlign(lang),
  spacing: { before: spaceBefore(), after: spaceAfter(), line: 240 },
  ...(lang === "ar" ? { bidirectional: true } : {}),
});

/** Plain body paragraph (single run). */
export function makeBodyParagraph(text: string, lang: Lang = "en") {
  return new Paragraph({
    ...paraOpts(lang),
    children: [toTextRun({ text }, lang)],
  });
}

/** Bold lead-in followed by regular text in the same paragraph. */
export function makeParagraphWithBoldLead(
  lead: string,
  rest: string,
  lang: Lang = "en"
) {
  const children = [toTextRun({ text: lead, bold: true }, lang)];
  if (rest) children.push(toTextRun({ text: rest }, lang));
  return new Paragraph({ ...paraOpts(lang), children });
}

/** Arbitrary inline runs (the faithful path: bold spans anywhere). */
export function makeRunParagraph(runs: Run[], lang: Lang = "en") {
  return new Paragraph({
    ...paraOpts(lang),
    children: runs.map((r) => toTextRun(r, lang)),
  });
}

// A list item may be plain text or a sequence of inline runs.
export type ListItem = string | Run[];

function itemRuns(item: ListItem, lang: Lang) {
  const runs: Run[] = typeof item === "string" ? [{ text: item }] : item;
  return runs.map((r) => toTextRun(r, lang));
}

function makeList(items: ListItem[], reference: string, lang: Lang) {
  return items.map(
    (item) =>
      new Paragraph({
        ...paraOpts(lang),
        numbering: { reference, level: 0 },
        children: itemRuns(item, lang),
      })
  );
}

/** Bullet list (token level0Marker, e.g. •). */
export function makeBulletList(items: ListItem[], lang: Lang = "en") {
  return makeList(items, BULLET_REF, lang);
}

/** Dash list (token level1Marker, e.g. –). */
export function makeDashList(items: ListItem[], lang: Lang = "en") {
  return makeList(items, DASH_REF, lang);
}

/** Empty spacer paragraph (explicit blank line). */
export function makeSectionBreak() {
  return new Paragraph({ children: [new TextRun("")] });
}

export default {
  makeBodyParagraph,
  makeParagraphWithBoldLead,
  makeRunParagraph,
  makeBulletList,
  makeDashList,
  makeSectionBreak,
  BULLET_REF,
  DASH_REF,
};
