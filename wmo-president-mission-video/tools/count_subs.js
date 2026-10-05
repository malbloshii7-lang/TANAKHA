const { chromium } = (() => { try { return require('playwright'); } catch { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  await p.goto('http://127.0.0.1:8765/index.html'); await p.evaluate(() => window.ready);
  const r = await p.evaluate(() => { let tot = 0, hist = {}; for (let f = 0; f < 1500; f++) { const v = window.speedAt(f / 30); const n = Math.max(1, Math.min(24, Math.ceil(v * 0.5 / 30 / 2.2))); tot += n; hist[n] = (hist[n] || 0) + 1; } return { tot, hist }; });
  console.log(JSON.stringify(r)); await b.close();
})();
