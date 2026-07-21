/**
 * STANDARD — Render Engine (Task 2)
 *
 * Wraps composed Paragraphs in the frozen page geometry (US Letter,
 * margins, header, footer) and packs to a .docx buffer.
 *
 * Geometry, fonts and list markers all read from tokens.json — the same
 * source the skeleton uses, so every template inherits identical chrome.
 */

import fs from "fs";
import path from "path";
import { BULLET_REF, DASH_REF } from "./components";

const ROOT = path.resolve(__dirname, "..");
const tokens = JSON.parse(
  fs.readFileSync(path.join(ROOT, "tokens", "tokens.json"), "utf-8")
);

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Header,
  Footer,
  PageNumber,
  AlignmentType,
  BorderStyle,
  LevelFormat,
} = require("docx");

const inToDXA = (inches: number): number => Math.round(inches * 1440);
const ink = () => tokens.color.ink.replace("#", "");
const rule = () => tokens.color.rule.replace("#", "");

// Numbering config shared by both languages — markers come from tokens.
function numberingConfig() {
  const lvl = (reference: string, marker: string) => ({
    reference,
    levels: [
      {
        level: 0,
        format: LevelFormat.BULLET,
        text: marker,
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: inToDXA(0.5), hanging: inToDXA(0.25) } } },
      },
    ],
  });
  return {
    config: [
      lvl(BULLET_REF, tokens.lists.level0Marker),
      lvl(DASH_REF, tokens.lists.level1Marker),
    ],
  };
}

function pageProps() {
  return {
    page: {
      size: { width: inToDXA(tokens.page.widthIn), height: inToDXA(tokens.page.heightIn) },
      margin: {
        top: inToDXA(tokens.page.marginTopIn),
        bottom: inToDXA(tokens.page.marginBottomIn),
        left: inToDXA(tokens.page.marginLeftIn),
        right: inToDXA(tokens.page.marginRightIn),
        header: inToDXA(tokens.page.headerHeightIn),
        footer: inToDXA(tokens.page.footerHeightIn),
      },
    },
  };
}

function headerEN() {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: rule() } },
        children: [
          new TextRun({
            text: "STANDARD",
            font: tokens.type.body.familyEN,
            size: tokens.type.body.sizeEN * 2,
            color: ink(),
          }),
        ],
      }),
    ],
  });
}

function footerEN() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Page ", font: tokens.type.body.familyEN, size: tokens.type.body.sizeEN * 2, color: ink() }),
          new TextRun({ children: [PageNumber.CURRENT], font: tokens.type.body.familyEN, size: tokens.type.body.sizeEN * 2 }),
          new TextRun({ text: " of ", font: tokens.type.body.familyEN, size: tokens.type.body.sizeEN * 2 }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], font: tokens.type.body.familyEN, size: tokens.type.body.sizeEN * 2 }),
        ],
      }),
    ],
  });
}

function headerAR() {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: rule() } },
        children: [
          new TextRun({
            text: "معيار",
            font: tokens.type.body.familyAR,
            size: tokens.type.body.sizeAR * 2,
            color: ink(),
            rightToLeft: true,
          }),
        ],
      }),
    ],
  });
}

function footerAR() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        children: [
          new TextRun({ text: "صفحة ", font: tokens.type.body.familyAR, size: tokens.type.body.sizeAR * 2, color: ink(), rightToLeft: true }),
          new TextRun({ children: [PageNumber.CURRENT], font: tokens.type.body.familyAR, size: tokens.type.body.sizeAR * 2, rightToLeft: true }),
        ],
      }),
    ],
  });
}

async function pack(doc: any, outputPath: string) {
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
}

/** Render composed paragraphs as an English (LTR) .docx. */
export async function renderDocxEnglish(paragraphs: any[], outputPath: string) {
  const doc = new Document({
    numbering: numberingConfig(),
    sections: [
      {
        properties: pageProps(),
        headers: { default: headerEN() },
        footers: { default: footerEN() },
        children: paragraphs,
      },
    ],
  });
  await pack(doc, outputPath);
}

/** Render composed paragraphs as an Arabic (RTL) .docx. */
export async function renderDocxArabic(paragraphs: any[], outputPath: string) {
  const doc = new Document({
    numbering: numberingConfig(),
    sections: [
      {
        properties: pageProps(),
        headers: { default: headerAR() },
        footers: { default: footerAR() },
        children: paragraphs,
      },
    ],
  });
  await pack(doc, outputPath);
}

module.exports = { renderDocxEnglish, renderDocxArabic };
export { renderDocxEnglish as _renderDocxEnglish };
