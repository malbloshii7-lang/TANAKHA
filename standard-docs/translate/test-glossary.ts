/**
 * STANDARD — Glossary Proof Test
 *
 * Validates that the glossary and protocol tables are correctly structured
 * and can be loaded without error. Does NOT translate.
 */

import fs from "fs";
import path from "path";

(async () => {
  try {
    console.log("════════════════════════════════════════════════════════");
    console.log("TASK 4: TRANSLATION PIPELINE — GLOSSARY VALIDATION");
    console.log("════════════════════════════════════════════════════════\n");

    const ROOT = path.resolve(__dirname, "..");
    const termsPath = path.join(ROOT, "glossary", "terms.json");
    const protocolPath = path.join(ROOT, "glossary", "protocol.json");

    if (!fs.existsSync(termsPath)) throw new Error(`Glossary not found: ${termsPath}`);
    if (!fs.existsSync(protocolPath)) throw new Error(`Protocol table not found: ${protocolPath}`);

    const terms = JSON.parse(fs.readFileSync(termsPath, "utf-8"));
    const protocol = JSON.parse(fs.readFileSync(protocolPath, "utf-8"));

    console.log("✓ Glossary loaded");
    console.log(`  Total entries: ${terms.entries.length}`);
    console.log(`  Confirmed: ${terms.entries.filter((e: any) => e.status === "confirmed").length}`);
    console.log(`  Pending: ${terms.entries.filter((e: any) => e.status === "unconfirmed").length}`);

    console.log("\n✓ Protocol table loaded");
    console.log(`  Total titles: ${protocol.entries.length}`);
    console.log(`  Confirmed: ${protocol.entries.filter((e: any) => e.status === "confirmed").length}`);
    console.log(`  Pending: ${protocol.entries.filter((e: any) => e.status === "unconfirmed").length}`);

    const pendingTerms = terms.entries.filter((e: any) => e.status === "unconfirmed");
    const pendingProtocol = protocol.entries.filter((e: any) => e.status === "unconfirmed");

    if (pendingTerms.length > 0 || pendingProtocol.length > 0) {
      console.log("\n⚠️  PENDING APPROVAL:");
      if (pendingTerms.length > 0) {
        console.log("\n  Glossary terms:");
        pendingTerms.forEach((entry: any) => {
          console.log(`    • ${entry.en} → ${entry.ar}`);
          console.log(`      Context: ${entry.context}`);
        });
      }
      if (pendingProtocol.length > 0) {
        console.log("\n  Protocol titles:");
        pendingProtocol.forEach((entry: any) => {
          console.log(`    • ${entry.en}`);
          console.log(`      → ${entry.ar}`);
        });
      }
      console.log("\nNEXT STEP:");
      console.log("  1. Review the entries above");
      console.log("  2. Correct any Arabic translations if needed");
      console.log("  3. Mark each as status: 'confirmed' when correct");
      console.log("  4. Reply: 'Glossary approved' when done");
      console.log("  5. Do NOT proceed to translation until approved");
    } else {
      console.log("\n✓ All glossary entries confirmed");
      console.log("✓ All protocol titles confirmed");
      console.log("\nREADY TO TRANSLATE");
    }

    console.log("\n" + "════════════════════════════════════════════════════════");
    console.log("TASK 4: GLOSSARY VALIDATION COMPLETE");
    console.log("════════════════════════════════════════════════════════\n");
  } catch (error) {
    console.error("❌ ERROR:", error);
    process.exit(1);
  }
})();
