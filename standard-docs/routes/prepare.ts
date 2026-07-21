/**
 * STANDARD — Prepare / Parse / Copy routes (offline)
 *
 *   POST /api/parse           -> JSON { speech, preview }   live preview of the editor text
 *   POST /api/copy?lang=en|ar -> .docx download (faithful render of the editor text)
 *   POST /api/prepare         -> JSON { salutation, closing, bodyText, preview }
 *                                phrase-bank seed for the editor (Prepare H.E. speech)
 *
 * Single source of truth: the body editor text. /parse and /copy both run it
 * through the same parser, so the preview and the .docx always agree, and typed
 * **bold** / "- " bullets become real DOCX bold runs + bullet numbering.
 *
 * Fully offline: drafting + parsing are local; rendering uses the FROZEN engine.
 */

import { Router, Request, Response } from "express";
import fs from "fs";
import os from "os";
import path from "path";

import { parseSpeechFromText, speechBodyToMarkup, ParseIntake } from "../templates/speech/parse";
import { draftSpeech, speechToPreview, DraftIntake, Lang } from "../templates/speech/phrasebank";
import { composeSpeech } from "../templates/speech/compose";
const { renderDocxEnglish, renderDocxArabic } = require("../engine/render-docx");
const { applyRTLToDocument } = require("../engine/rtl");

function langOf(v: any): Lang {
  return v === "ar" ? "ar" : "en";
}

const router = Router();

// Live preview of whatever is in the editor (lenient — no required fields).
router.post("/parse", (req: Request, res: Response) => {
  const intake: ParseIntake = req.body || ({} as ParseIntake);
  intake.language = langOf(intake.language || req.query.lang);
  const speech = parseSpeechFromText(intake);
  res.json({ speech, preview: speechToPreview(speech), language: intake.language });
});

// Faithful DOCX render of the editor text — "English copy" / "Arabic copy".
router.post("/copy", async (req: Request, res: Response) => {
  try {
    const intake: ParseIntake = req.body || ({} as ParseIntake);
    const lang = langOf(req.query.lang || intake.language);
    intake.language = lang;

    if (!intake.occasion || !intake.principal) {
      return res.status(400).json({ error: "Occasion and Principal are required." });
    }
    if (!intake.audience) {
      return res.status(400).json({ error: "Opening salutation is required." });
    }

    const speech = parseSpeechFromText(intake);
    if (!speech.body.length) {
      return res.status(400).json({ error: "The speech body is empty — write or paste some text first." });
    }

    let paragraphs;
    try {
      paragraphs = composeSpeech(speech);
    } catch (e: any) {
      return res.status(400).json({ error: e.message || "Composition failed" });
    }
    if (lang === "ar") paragraphs = applyRTLToDocument(paragraphs);

    const tmp = path.join(os.tmpdir(), `standard-${Date.now()}-${Math.random().toString(36).slice(2)}.docx`);
    if (lang === "en") await renderDocxEnglish(paragraphs, tmp);
    else await renderDocxArabic(paragraphs, tmp);
    const buffer = fs.readFileSync(tmp);
    fs.unlink(tmp, () => {});

    const safe = (intake.occasion || "speech").replace(/[^\w؀-ۿ-]+/g, "-").replace(/^-+|-+$/g, "");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${safe || "speech"}-HE-${lang}.docx"`);
    res.send(buffer);
  } catch (error) {
    console.error("Copy render error:", error);
    res.status(500).json({ error: "Failed to render document" });
  }
});

// Phrase-bank seed: generate editable markup into the editor.
router.post("/prepare", (req: Request, res: Response) => {
  const intake: DraftIntake = req.body || ({} as DraftIntake);
  if (!intake.occasion || !intake.principal) {
    return res.status(400).json({ error: "Occasion and Principal are required to prepare a speech." });
  }
  const lang = langOf((req.body && req.body.language) || req.query.lang);
  const speech = draftSpeech(intake, lang);
  res.json({
    language: lang,
    salutation: typeof speech.salutationBlock.salutation === "string" ? speech.salutationBlock.salutation : "",
    closing: speech.closing.text,
    bodyText: speechBodyToMarkup(speech),
    preview: speechToPreview(speech),
  });
});

export default router;
