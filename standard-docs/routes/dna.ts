/**
 * STANDARD — Speech DNA Studio routes (offline)
 *
 *   POST /api/dna/analyze   {text, name, lang}         -> fingerprint (saved profile)
 *   GET  /api/dna/profiles                              -> saved profiles
 *   POST /api/dna/generate  {name|fingerprint, topic, lang, targetWords}
 *                                                       -> styled draft + its fingerprint
 *   POST /api/dna/trace     {name|fingerprint, text}    -> per-dimension match + overall %
 *
 * Profiles are JSON files under standard-docs/dna-profiles/. Everything is
 * computed on-device; there is no provider call anywhere in this module.
 */

import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { measure, compare, generateInStyle, StyleFingerprint, Lang } from "../templates/speech/dna";
import { fetchTranscript } from "../templates/speech/youtube";

const ROOT = path.resolve(__dirname, "..");
const DIR = path.join(ROOT, "dna-profiles");
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const safeName = (n: string) => (n || "").trim().toLowerCase().replace(/[^\w؀-ۿ-]+/g, "-").slice(0, 60);
const profilePath = (n: string) => path.join(DIR, safeName(n) + ".json");

function loadProfile(name: string): any | null {
  const p = profilePath(name);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf-8")) : null;
}

function resolveFingerprint(body: any, res: Response): StyleFingerprint | null {
  if (body.fingerprint) return body.fingerprint as StyleFingerprint;
  if (body.name) {
    const prof = loadProfile(body.name);
    if (prof) return prof.fingerprint as StyleFingerprint;
    res.status(404).json({ error: `No saved profile named '${body.name}'` });
    return null;
  }
  res.status(400).json({ error: "Provide 'name' (saved profile) or 'fingerprint'" });
  return null;
}

const router = Router();

// The ONE online action in the suite: fetch a YouTube caption track
// server-side. Everything downstream (fingerprint, generate, trace)
// stays on-device.
router.post("/dna/extract", async (req: Request, res: Response) => {
  try {
    const { url, lang } = req.body || {};
    if (!url) return res.status(400).json({ error: "url is required" });
    const out = await fetchTranscript(String(url), lang === "ar" ? "ar" : "en");
    res.json(out);
  } catch (e: any) {
    res.status(502).json({ error: e.message || "Extraction failed — is this machine online?" });
  }
});

router.post("/dna/analyze", (req: Request, res: Response) => {
  const { text, name, lang } = req.body || {};
  if (!text || !String(text).trim()) return res.status(400).json({ error: "text is required" });
  const l: Lang = lang === "ar" ? "ar" : "en";
  const fingerprint = measure(String(text), l);
  if (fingerprint.words < 40) {
    return res.status(400).json({ error: `Transcript too short to fingerprint reliably (${fingerprint.words} words; need 40+).` });
  }
  let saved: string | null = null;
  if (name && safeName(name)) {
    const profile = {
      schema: 1,
      name: safeName(name),
      lang: l,
      created: new Date().toISOString(),
      engine: "standard-dna-offline",
      fingerprint,
    };
    fs.writeFileSync(profilePath(name), JSON.stringify(profile, null, 2) + "\n", "utf-8");
    saved = profile.name;
  }
  res.json({ fingerprint, saved });
});

router.get("/dna/profiles", (_req: Request, res: Response) => {
  const profiles = fs.readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        const p = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf-8"));
        return { name: p.name, lang: p.lang, created: p.created, words: p.fingerprint?.words };
      } catch { return null; }
    })
    .filter(Boolean);
  res.json({ profiles });
});

router.post("/dna/generate", (req: Request, res: Response) => {
  const fp = resolveFingerprint(req.body || {}, res);
  if (!fp) return;
  const topic = String((req.body && req.body.topic) || "").trim();
  if (!topic) return res.status(400).json({ error: "topic is required" });
  const lang: Lang = (req.body.lang === "ar" ? "ar" : req.body.lang === "en" ? "en" : fp.lang);
  const text = generateInStyle(fp, { topic, lang, targetWords: Number(req.body.targetWords) || undefined });
  const generatedFingerprint = measure(text, lang);
  res.json({
    text,
    generatedFingerprint,
    engine: "offline-template-synthesis",
    note: "Measured template synthesis (no model, no network). A cloud/LLM provider layer is an optional gated add-on, kept off the default path.",
  });
});

router.post("/dna/trace", (req: Request, res: Response) => {
  const fp = resolveFingerprint(req.body || {}, res);
  if (!fp) return;
  const text = String((req.body && req.body.text) || "").trim();
  if (!text) return res.status(400).json({ error: "text is required" });
  const genFp = measure(text, (req.body.lang === "ar" || req.body.lang === "en") ? req.body.lang : fp.lang);
  res.json({ trace: compare(fp, genFp), generatedFingerprint: genFp });
});

export default router;
