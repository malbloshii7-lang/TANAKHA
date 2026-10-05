const { chromium } = (() => { try { return require('playwright'); } catch { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  await p.goto('http://127.0.0.1:8765/index.html'); await p.evaluate(() => window.ready);
  const tl = await p.evaluate(() => window.TL);
  require('fs').writeFileSync('audio/timeline.json', JSON.stringify(tl, null, 1)); console.log(JSON.stringify(tl.WAVE_PASS), JSON.stringify(tl.T));
  await b.close();
})();
