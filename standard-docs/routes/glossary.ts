/**
 * STANDARD — Glossary Review Route
 *
 * The sanctioned human-approval path for Task 4's glossaries. Instead of
 * hand-editing JSON (error-prone, especially for Arabic), the reviewer uses
 * the console at /glossary.html:
 *
 *   GET  /api/glossary          -> { terms, protocol } (both files, verbatim)
 *   POST /api/glossary/update   -> apply edits/approvals to one entry
 *
 * Rules preserved from Task 4:
 * - Only a human action here flips status to "confirmed" (approved_by required).
 * - Any change to the Arabic text of a confirmed entry reverts it to
 *   "unconfirmed" — re-approval required. No silent edits to locked terms.
 * - Files are written atomically (tmp + rename) to avoid corruption.
 */

import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");
const FILES: Record<string, string> = {
  terms: path.join(ROOT, "glossary", "terms.json"),
  protocol: path.join(ROOT, "glossary", "protocol.json"),
};

function load(file: string): any {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function saveAtomic(file: string, data: any): void {
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", "utf-8");
  fs.renameSync(tmp, file);
}

const router = Router();

router.get("/glossary", (_req: Request, res: Response) => {
  try {
    res.json({ terms: load(FILES.terms), protocol: load(FILES.protocol) });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to load glossaries" });
  }
});

interface UpdateBody {
  file: "terms" | "protocol";
  id: string;
  ar?: string;                  // corrected Arabic (optional)
  action: "save" | "approve" | "unapprove";
  approved_by?: string;         // required for approve
}

router.post("/glossary/update", (req: Request, res: Response) => {
  try {
    const body: UpdateBody = req.body;
    const filePath = FILES[body.file];
    if (!filePath) return res.status(400).json({ error: "file must be 'terms' or 'protocol'" });
    if (!body.id) return res.status(400).json({ error: "id is required" });

    const data = load(filePath);
    const entry = data.entries.find((e: any) => e.id === body.id);
    if (!entry) return res.status(404).json({ error: `No entry with id '${body.id}'` });

    // Arabic edit: apply, and force re-approval if it was confirmed.
    if (typeof body.ar === "string" && body.ar.trim() && body.ar !== entry.ar) {
      entry.ar = body.ar.trim();
      if (entry.status === "confirmed") {
        entry.status = "unconfirmed";
        entry.approved_by = null;
        entry.approved_date = null;
      }
    }

    if (body.action === "approve") {
      const who = (body.approved_by || "").trim();
      if (!who) return res.status(400).json({ error: "approved_by is required to approve" });
      entry.status = "confirmed";
      entry.approved_by = who;
      entry.approved_date = new Date().toISOString().slice(0, 10);
    } else if (body.action === "unapprove") {
      entry.status = "unconfirmed";
      entry.approved_by = null;
      entry.approved_date = null;
    }
    // action === "save": Arabic edit only, handled above.

    // Reflect overall state in the terms version string (metadata only).
    if (data.metadata && data.metadata.version) {
      const allConfirmed = data.entries.every((e: any) => e.status === "confirmed");
      data.metadata.version = String(data.metadata.version).replace(
        /-(pending-approval|approved)$/,
        allConfirmed ? "-approved" : "-pending-approval"
      );
    }

    saveAtomic(filePath, data);

    const confirmed = data.entries.filter((e: any) => e.status === "confirmed").length;
    res.json({ ok: true, entry, confirmed, total: data.entries.length });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Update failed" });
  }
});

export default router;
