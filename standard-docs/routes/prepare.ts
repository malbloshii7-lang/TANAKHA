/**
 * STANDARD — Prepare Route (offline phrase-bank draft layer)
 *
 *   POST /api/prepare            -> JSON { speech, preview, language }  (on-page preview)
 *   POST /api/copy?lang=en|ar    -> .docx download, drafted in that language
 *
 * Fully offline: drafting uses the built-in phrase bank; rendering uses the
 * FROZEN engine + speech template. No network calls.
 */

import { Router, Request, Response } from "express";
import fs from "fs";
import os from "os";
import path from "path";

import { draftSpeech, speechToPreview, DraftIntake, Lang } from "../templates/speech/phrasebank";
import { composeSpeech } from "../templates/speech/compose";
const { renderDocxEnglish, renderDocxArabic } = require("../engine/render-docx");
const { applyRTLToDocument } = require("../engine/rtl");

function langOf(v: any): Lang {
  return v === "ar" ? "ar" : "en";
}

function requireCore(intake: DraftIntake, res: Response): boolean {
  if (!intake || !intake.occasion || !intake.principal) {
    res.status(400).json({ error: "Occasion and Principal are required to prepare a speech." });
    return false;
  }
  return true;
}

const router = Router();

// On-page preview — draft in the selected language, return text + structure.
router.post("/prepare", (req: Request, res: Response) => {
  const intake: DraftIntake = req.body;
  if (!requireCore(intake, res)) return;
  const lang = langOf((req.body && req.body.language) || req.query.lang);
  const speech = draftSpeech(intake, lang);
  res.json({ speech, preview: speechToPreview(speech), language: lang });
});

// DOCX download — "English copy" / "Arabic copy".
router.post("/copy", async (req: Request, res: Response) => {
  try {
    const intake: DraftIntake = req.body;
    if (!requireCore(intake, res)) return;
    const lang = langOf(req.query.lang || (req.body && req.body.language));

    const speech = draftSpeech(intake, lang);

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
    const filename = `${safe || "speech"}-HE-${lang}.docx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error("Copy render error:", error);
    res.status(500).json({ error: "Failed to render document" });
  }
});

export default router;
