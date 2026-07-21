/**
 * STANDARD — Render Route
 *
 * POST /api/render : intake JSON -> MinisterSpeech -> frozen compose + render -> .docx
 *
 * This route imports the FROZEN engine and speech template. It does NOT
 * re-implement components, so every document the cockpit produces matches
 * the approved Task 3 house style exactly (run-based bold, real bullet
 * numbering, US Letter geometry, header/footer — all from tokens.json).
 */

import { Router, Request, Response } from "express";
import fs from "fs";
import os from "os";
import path from "path";

import { composeSpeech } from "../templates/speech/compose";
import { MinisterSpeech, BodyItem } from "../templates/speech/schema";
const { renderDocxEnglish, renderDocxArabic } = require("../engine/render-docx");
const { applyRTLToDocument } = require("../engine/rtl");

export interface IntakeData {
  occasion: string;
  principal: string;
  audience: string;
  location: string;
  date: string;
  language: "en" | "ar";
  body: Array<{
    text: string;
    bold?: boolean;
    list?: { marker: "bullet" | "dash"; items: string[] };
  }>;
  closing: string;
}

/** Map the cockpit's flat intake into the run-based MinisterSpeech schema. */
export function buildSpeechFromIntake(intake: IntakeData): MinisterSpeech {
  const body: BodyItem[] = [];

  (intake.body || []).forEach((item) => {
    const out: BodyItem = {};
    const text = (item.text || "").trim();

    // "Bold lead-in" checkbox = whole paragraph bold (cockpit has no
    // sub-run editor); plain text otherwise.
    if (text) {
      if (item.bold) out.leadInBold = text;
      else out.text = text;
    }

    if (item.list && Array.isArray(item.list.items)) {
      const items = item.list.items.map((s) => (s || "").trim()).filter(Boolean);
      if (items.length) out.list = { marker: item.list.marker || "bullet", items };
    }

    // Skip fully empty items.
    if (out.text || out.leadInBold || out.list) body.push(out);
  });

  return {
    control: {
      occasion: intake.occasion,
      principal: intake.principal,
      audience: intake.audience,
      location: intake.location || "",
      date: intake.date || "",
      language: intake.language,
    },
    salutationBlock: { salutation: intake.audience },
    body,
    closing: { text: intake.closing || "" },
  };
}

const router = Router();

router.post("/render", async (req: Request, res: Response) => {
  try {
    const intake: IntakeData = req.body;

    if (!intake || !intake.occasion || !intake.principal || !intake.language) {
      return res.status(400).json({ error: "Missing required fields (occasion, principal, language)" });
    }
    if (!intake.audience) {
      return res.status(400).json({ error: "Opening salutation (audience) is required" });
    }
    if (!intake.closing) {
      return res.status(400).json({ error: "Closing text is required" });
    }

    const speech = buildSpeechFromIntake(intake);

    let paragraphs;
    try {
      paragraphs = composeSpeech(speech); // validates internally
    } catch (e: any) {
      return res.status(400).json({ error: e.message || "Composition failed" });
    }

    if (speech.control.language === "ar") {
      paragraphs = applyRTLToDocument(paragraphs);
    }

    // Render via frozen engine to a temp file, then stream the bytes back.
    const tmp = path.join(os.tmpdir(), `standard-${Date.now()}-${Math.random().toString(36).slice(2)}.docx`);
    if (speech.control.language === "en") {
      await renderDocxEnglish(paragraphs, tmp);
    } else {
      await renderDocxArabic(paragraphs, tmp);
    }
    const buffer = fs.readFileSync(tmp);
    fs.unlink(tmp, () => {});

    const safeName = (intake.occasion || "speech").replace(/[^\w؀-ۿ-]+/g, "-").replace(/^-+|-+$/g, "");
    const filename = `${safeName || "speech"}-${intake.language}.docx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error("Render error:", error);
    res.status(500).json({ error: "Failed to render document" });
  }
});

export default router;
