/**
 * STANDARD — Page Skeleton
 *
 * Reads tokens.json and constructs US Letter page geometry
 * with header, footer, margins. No body content — just the chrome.
 * Renders in both LTR (English) and RTL (Arabic).
 *
 * Paths are resolved relative to this file so the engine runs on any OS.
 */

import fs from "fs";
import path from "path";

// Resolve project paths relative to this file (engine/ -> project root)
const ROOT = path.resolve(__dirname, "..");
const tokensPath = path.join(ROOT, "tokens", "tokens.json");

// Load tokens
const tokens = JSON.parse(fs.readFileSync(tokensPath, "utf-8"));

// Import docx-js (assume installed globally or locally)
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
} = require("docx");

// Convert inches to DXA (1 inch = 1440 DXA)
const inToDXA = (inches: number): number => Math.round(inches * 1440);

/**
 * Create a blank page skeleton in English (LTR)
 * Returns a docx-js Document with:
 * - US Letter size
 * - 1" margins
 * - Header (top)
 * - Footer (bottom, with page number)
 * - One blank paragraph (for composition layers to add body content)
 */
function pageSkeletonEN(): typeof Document {
  const marginTopDXA = inToDXA(tokens.page.marginTopIn);
  const marginBottomDXA = inToDXA(tokens.page.marginBottomIn);
  const marginLeftDXA = inToDXA(tokens.page.marginLeftIn);
  const marginRightDXA = inToDXA(tokens.page.marginRightIn);
  const pageWidthDXA = inToDXA(tokens.page.widthIn);
  const pageHeightDXA = inToDXA(tokens.page.heightIn);

  const headerContent = new Paragraph({
    children: [
      new TextRun({
        text: "STANDARD",
        font: tokens.type.body.familyEN,
        size: tokens.type.body.sizeEN * 2, // half-points
        bold: false,
        color: tokens.color.ink.replace("#", ""),
      }),
    ],
    alignment: AlignmentType.LEFT,
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: tokens.color.rule.replace("#", "") },
    },
  });

  const footerContent = [
    new Paragraph({
      children: [
        new TextRun({
          text: "Page ",
          font: tokens.type.body.familyEN,
          size: tokens.type.body.sizeEN * 2,
          color: tokens.color.ink.replace("#", ""),
        }),
        new TextRun({
          children: [PageNumber.CURRENT],
          font: tokens.type.body.familyEN,
          size: tokens.type.body.sizeEN * 2,
        }),
        new TextRun({
          text: " of ",
          font: tokens.type.body.familyEN,
          size: tokens.type.body.sizeEN * 2,
        }),
        new TextRun({
          children: [PageNumber.TOTAL_PAGES],
          font: tokens.type.body.familyEN,
          size: tokens.type.body.sizeEN * 2,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: pageWidthDXA, height: pageHeightDXA },
            margin: {
              top: marginTopDXA,
              bottom: marginBottomDXA,
              left: marginLeftDXA,
              right: marginRightDXA,
              header: inToDXA(tokens.page.headerHeightIn),
              footer: inToDXA(tokens.page.footerHeightIn),
            },
          },
        },
        headers: { default: new Header({ children: [headerContent] }) },
        footers: { default: new Footer({ children: footerContent }) },
        children: [
          new Paragraph({
            children: [new TextRun("")],
          }),
        ],
      },
    ],
  });

  return doc;
}

/**
 * Create a blank page skeleton in Arabic (RTL)
 * Same as English but with direction reversed.
 */
function pageSkeletonAR(): typeof Document {
  const marginTopDXA = inToDXA(tokens.page.marginTopIn);
  const marginBottomDXA = inToDXA(tokens.page.marginBottomIn);
  const marginLeftDXA = inToDXA(tokens.page.marginLeftIn);
  const marginRightDXA = inToDXA(tokens.page.marginRightIn);
  const pageWidthDXA = inToDXA(tokens.page.widthIn);
  const pageHeightDXA = inToDXA(tokens.page.heightIn);

  const headerContent = new Paragraph({
    children: [
      new TextRun({
        text: "معيار",
        font: tokens.type.body.familyAR,
        size: tokens.type.body.sizeAR * 2,
        bold: false,
        color: tokens.color.ink.replace("#", ""),
        rightToLeft: true,
      }),
    ],
    alignment: AlignmentType.RIGHT,
    bidirectional: true,
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: tokens.color.rule.replace("#", "") },
    },
  });

  const footerContent = [
    new Paragraph({
      children: [
        new TextRun({
          text: "صفحة ",
          font: tokens.type.body.familyAR,
          size: tokens.type.body.sizeAR * 2,
          rightToLeft: true,
          color: tokens.color.ink.replace("#", ""),
        }),
        new TextRun({
          children: [PageNumber.CURRENT],
          font: tokens.type.body.familyAR,
          size: tokens.type.body.sizeAR * 2,
          rightToLeft: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      bidirectional: true,
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: pageWidthDXA, height: pageHeightDXA },
            margin: {
              top: marginTopDXA,
              bottom: marginBottomDXA,
              left: marginLeftDXA,
              right: marginRightDXA,
              header: inToDXA(tokens.page.headerHeightIn),
              footer: inToDXA(tokens.page.footerHeightIn),
            },
          },
        },
        headers: { default: new Header({ children: [headerContent] }) },
        footers: { default: new Footer({ children: footerContent }) },
        children: [
          new Paragraph({
            children: [new TextRun("")],
            bidirectional: true,
          }),
        ],
      },
    ],
  });

  return doc;
}

// Export for use by other modules
export { pageSkeletonEN, pageSkeletonAR };

// Render the skeleton to .docx files (standalone execution)
if (require.main === module) {
  (async () => {
    const outEN = path.join(ROOT, "skeleton-EN.docx");
    const outAR = path.join(ROOT, "skeleton-AR.docx");

    console.log("Rendering skeleton-EN.docx...");
    const docEN = pageSkeletonEN();
    const bufferEN = await Packer.toBuffer(docEN);
    fs.writeFileSync(outEN, bufferEN);
    console.log("✓ skeleton-EN.docx written");

    console.log("Rendering skeleton-AR.docx...");
    const docAR = pageSkeletonAR();
    const bufferAR = await Packer.toBuffer(docAR);
    fs.writeFileSync(outAR, bufferAR);
    console.log("✓ skeleton-AR.docx written");

    console.log("\nSUCCESS: Both skeleton files rendered.");
    console.log("Next step: open both .docx files and verify:");
    console.log("  ✓ Page margins are 1 inch");
    console.log("  ✓ Header appears at top (English: 'STANDARD', Arabic: 'معيار')");
    console.log("  ✓ Footer appears at bottom with page number placeholder");
    console.log("  ✓ Text direction correct (LTR for EN, RTL for AR)");
  })();
}
