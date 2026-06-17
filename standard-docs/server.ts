/**
 * STANDARD — Web Cockpit Server
 *
 * Local Node.js + Express server for ministerial speech/brief intake.
 * Runs at http://localhost:3000
 *
 * The render endpoint is wired to the FROZEN engine + speech template
 * (see routes/render.ts), so cockpit output matches the approved house
 * style. This server file imports — it does not modify — any frozen code.
 */

import express from "express";
import path from "path";
import renderRouter from "./routes/render";
import prepareRouter from "./routes/prepare";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// API
app.use("/api", renderRouter);
app.use("/api", prepareRouter);

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`\n${"=".repeat(60)}`);
  console.log("STANDARD — H.E. Speech Builder");
  console.log("=".repeat(60));
  console.log(`\n✓ Server running at http://localhost:${PORT}`);
  console.log(`✓ Open in browser to access the Engine Bar`);
  console.log(`\nOFFLINE: localhost only — no internet, no cloud, no external APIs`);
  console.log(`\nENGINE: wired to frozen tokens + engine + speech template`);
  console.log(`  ✓ Verdana 12, US Letter, 1\" margins, header/footer`);
  console.log(`  ✓ Run-based bold + real bullet numbering`);
  console.log(`\nDRAFT LAYER: built-in phrase bank (Kazakhstan-style, EN + AR)`);
  console.log(`  ✓ Prepare H.E. speech  → on-page preview`);
  console.log(`  ✓ English copy / Arabic copy → .docx (LTR / RTL)`);
  console.log(`\n${"=".repeat(60)}\n`);
});
