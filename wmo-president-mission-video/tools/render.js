// node tools/render.js <outdir> <fps> <worker> <workers> [fromFrame] [toFrame]
// Renders every n-th frame (f % workers == worker). Fast-motion frames are rendered as
// SUB sub-frames across a 180-degree shutter and merged later (tools/merge.py).
const { chromium } = (() => { try { return require('playwright'); } catch { return require('/opt/node22/lib/node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
(async () => {
  const [out, fpsS, wS, nS, fromS, toS] = process.argv.slice(2);
  const fps = +fpsS, w = +wS, n = +nS;
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto('http://127.0.0.1:8765/index.html');
  await page.evaluate(() => window.ready);
  const TL = await page.evaluate(() => window.TL);
  const T = TL.T, A = TL.ARR, PAN = TL.PAN;
  const total = Math.round(T.end * fps);
  const from = fromS ? +fromS : 0, to = toS ? +toS : total;
  const SHUTTER = 0.5, STEP = 2.2, MAXSUB = 24; // 180-degree shutter, <=2.2 px between samples
  const subsFor = async t => {
    const v = await page.evaluate(x => window.speedAt(x), t);
    return Math.max(1, Math.min(MAXSUB, Math.ceil(v * SHUTTER / fps / STEP)));
  };
  const cdp = await page.context().newCDPSession(page);
  const shot = async file => {
    const r = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
    fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
  };
  const t0 = Date.now(); let count = 0;
  for (let f = from; f < to; f++) {
    if (f % n !== w) continue;
    const t = f / fps, name = path.join(out, String(f).padStart(5, '0'));
    if (fs.existsSync(name + '.png')) { count++; continue; }
    const SUB = await subsFor(t);
    if (SUB > 1) {
      for (let j = 0; j < SUB; j++) {
        const ts = Math.max(0, t + ((j + 0.5) / SUB - 0.5) * SHUTTER / fps);
        await page.evaluate(x => window.renderFrame(x), ts);
        await shot(`${name}_s${j}.png`);
      }
    } else {
      await page.evaluate(x => window.renderFrame(x), t);
      await shot(`${name}.png`);
    }
    count++;
    if (count % 50 === 0) console.log(`w${w}: ${count} frames, ${((Date.now() - t0) / count).toFixed(0)} ms/frame, f=${f}`);
  }
  await browser.close();
  console.log(`w${w} done: ${count} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
})();
