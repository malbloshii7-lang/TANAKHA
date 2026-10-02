// The subtitle files, from the build itself: every words set the film draws (recorded by recText with its film times and
// its Arabic), written as SRT in English (the screen's own words, for accessibility) and in Arabic (the translation).
//
//   node subtitles.js out/        → out/four-weeks-three-regions.en.srt, .ar.srt, and text.json
//
// One cue per words set: the headline and the line under it (the kicker's place and date lead the cue).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const outDir = process.argv[2] || 'out';
  const browser = await chromium.launch(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {});
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  page.on('pageerror', e => { console.error('page error:', e.message); process.exitCode = 1; });
  await page.goto('file://' + path.resolve(__dirname, 'film.html') + '?capture&colour', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.__ready);
  const rec = await page.evaluate(() => {
    TEXT_REC = [];
    SCENES.forEach(s => { ctx.save(); try { SA = 0; REAL_LT = s.dur / 2; s.draw.call(s, s.dur / 2, s.dur / 2); if (s.words) s.words.call(s, s.dur / 2, s.dur / 2); } finally { SA = 1; ctx.restore(); } });
    const r = TEXT_REC; TEXT_REC = null; return r;
  });
  await browser.close();
  // group the parts of each set (same in and out times) into one cue
  const sets = [];
  rec.forEach(r => {
    let s = sets.find(x => Math.abs(x.tin - r.tin) < 1e-6 && Math.abs(x.tout - r.tout) < 1e-6);
    if (!s) sets.push(s = { tin: r.tin, tout: r.tout, parts: [] });
    s.parts.push(r);
  });
  sets.sort((a, b) => a.tin - b.tin);
  const tc = t => { const ms = Math.round(t * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  // cues may not overlap: a set that starts before the previous one ends (the close's two totals lines) is merged into it
  const cues = [];
  sets.forEach(s => {
    const last = cues[cues.length - 1];
    if (last && s.tin < last.tout - 0.01) { last.parts.push(...s.parts); last.tout = Math.max(last.tout, s.tout); } else cues.push({ ...s, parts: [...s.parts] });
  });
  const write = (lang, pick) => {
    const body = cues.map((c, i) => {
      const order = { K: 0, A: 1, N: 1, B: 2 };
      const lines = c.parts.slice().sort((a, b) => order[a.level] - order[b.level]).map(p => pick(p)).filter(Boolean);
      return `${i + 1}\n${tc(c.tin)} --> ${tc(c.tout)}\n${lines.join('\n')}\n`;
    }).join('\n');
    const f = path.join(outDir, `four-weeks-three-regions.${lang}.srt`);
    fs.writeFileSync(f, body); console.log('wrote', f, cues.length, 'cues');
  };
  write('en', p => p.en.join(' '));
  // the Arabic keeps its isolates (U+2066/2069) around every Latin and number run, so a range such as 9–11 cannot reorder
  write('ar', p => p.ar.join(' '));
  fs.writeFileSync(path.join(outDir, 'text.json'), JSON.stringify(rec, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
