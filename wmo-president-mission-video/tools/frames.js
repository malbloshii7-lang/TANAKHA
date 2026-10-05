// usage: node tools/frames.js out_dir t1 t2 ...   -> out_dir/f_<t>.png
const { chromium } = (() => { try { return require('playwright'); } catch { return require('/opt/node22/lib/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs');
(async () => {
  const [out, ...ts] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto('http://127.0.0.1:8765/index.html');
  await page.evaluate(() => window.ready);
  for (const t of ts) {
    const t0 = Date.now();
    await page.evaluate(t => window.renderFrame(t), parseFloat(t));
    await page.screenshot({ path: path.join(out, `f_${(+t).toFixed(2).padStart(6, '0')}.png`) });
    console.log('t=' + t, (Date.now() - t0) + 'ms');
  }
  await browser.close();
})();
