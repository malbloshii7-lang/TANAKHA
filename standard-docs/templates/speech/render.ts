/**
 * STANDARD — Speech Render
 *
 * Takes a MinisterSpeech input, composes it to Paragraphs, and renders to .docx
 */

import { composeSpeech } from "./compose";
import { MinisterSpeech } from "./schema";

const { renderDocxEnglish, renderDocxArabic } = require("../../engine/render-docx");
const { applyRTLToDocument } = require("../../engine/rtl");

/**
 * renderSpeech — main entry point: compose + language-specific render.
 */
export async function renderSpeech(
  input: MinisterSpeech,
  outputPath: string
): Promise<void> {
  console.log(`Composing speech: ${input.control.occasion}...`);

  let paragraphs = composeSpeech(input);
  console.log(`✓ Composed: ${paragraphs.length} paragraphs`);

  if (input.control.language === "ar") {
    console.log("Applying RTL enforcement...");
    paragraphs = applyRTLToDocument(paragraphs);
  }

  if (input.control.language === "en") {
    await renderDocxEnglish(paragraphs, outputPath);
  } else if (input.control.language === "ar") {
    await renderDocxArabic(paragraphs, outputPath);
  } else {
    throw new Error(`Unknown language: ${input.control.language}`);
  }

  console.log(`✓ Speech rendered: ${outputPath}`);
}

export default { renderSpeech };
