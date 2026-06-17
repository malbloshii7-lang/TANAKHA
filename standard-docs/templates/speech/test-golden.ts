/**
 * STANDARD — Speech Golden Test
 *
 * Re-renders the Kazakhstan fixture and writes the generated .docx for
 * side-by-side comparison with the original.
 */

import path from "path";
import kazakhSpeech from "./fixtures/kazakhstan-speech";
import { renderSpeech } from "./render";

const ROOT = path.resolve(__dirname, "..", "..");
const OUT = path.join(ROOT, "kazakhstan-speech-GENERATED.docx");

(async () => {
  try {
    console.log("════════════════════════════════════════════════════════");
    console.log("TASK 3: SPEECH TEMPLATE — GOLDEN TEST");
    console.log("════════════════════════════════════════════════════════\n");

    console.log("INPUT: Kazakhstan speech fixture");
    console.log(`  Occasion: ${kazakhSpeech.control.occasion}`);
    console.log(`  Principal: ${kazakhSpeech.control.principal}`);
    console.log(`  Language: ${kazakhSpeech.control.language}`);
    console.log(`  Body items: ${kazakhSpeech.body.length}`);

    console.log("\nRENDERING...");
    await renderSpeech(kazakhSpeech, OUT);

    console.log("\n" + "════════════════════════════════════════════════════════");
    console.log("TASK 3: SPEECH TEMPLATE — COMPLETE");
    console.log("════════════════════════════════════════════════════════");
    console.log("\nDELIVERABLES:");
    console.log("1. ✓ templates/speech/schema.ts");
    console.log("2. ✓ templates/speech/compose.ts");
    console.log("3. ✓ templates/speech/fixtures/kazakhstan-speech.ts");
    console.log("4. ✓ templates/speech/render.ts");
    console.log(`5. ✓ ${OUT}`);

    console.log("\nNEXT GATE: Visual diff");
    console.log("  — Open original reference speech");
    console.log("  — Open generated: kazakhstan-speech-GENERATED.docx");
    console.log("  — Compare side-by-side:");
    console.log("    ✓ Font (Verdana 12)");
    console.log("    ✓ Bold lead-ins / inline bold in correct places");
    console.log("    ✓ Bullet lists");
    console.log("    ✓ Spacing and alignment");
    console.log("    ✓ Text content exact (no typos or changes)");
    console.log("  — If IDENTICAL, reply: 'Generated speech matches original'");
    console.log("  — If DIFFERENT, list the specific differences");
    console.log("\n════════════════════════════════════════════════════════");
  } catch (error) {
    console.error("\n❌ ERROR:", error);
    process.exit(1);
  }
})();
