// Render "Reading the Sky" (film.html) frame by frame with headless Chromium.
//
//   node render.js preview <out-prefix> <seconds...>   PNG stills at those times
//   node render.js film <out.mp4> [score.wav]          every frame at 30 fps → H.264 (+ AAC)
//
// Needs Playwright (NODE_PATH pointing at a global install is fine) and an ffmpeg
// with libx264: set FFMPEG, e.g. to imageio-ffmpeg's bundled binary.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const FPS = 30;

(async () => {
  const [mode, out, ...rest] = process.argv.slice(2);
  if (!['preview', 'film'].includes(mode) || !out) {
    console.error('usage: node render.js preview <prefix> <t...> | film <out.mp4> [score.wav]');
    process.exit(2);
  }
  const browser = await chromium.launch(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {});
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  // Fonts come from Google Fonts. Fetch them from Node so TLS is verified against
  // the system CA bundle (NODE_EXTRA_CA_CERTS) behind an intercepting proxy.
  await context.route(/^https:\/\//, async route => {
    try { await route.fulfill({ response: await route.fetch() }); } catch { await route.abort(); }
  });
  const page = await context.newPage();
  page.on('pageerror', e => { console.error('page error:', e.message); process.exitCode = 1; });
  await page.goto('file://' + path.resolve(__dirname, 'film.html') + '?capture', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.__ready);
  const clip = { x: 0, y: 0, width: 1920, height: 1080 };
  const frame = (t, type) => page.evaluate(t => window.__render(t), t).then(() => page.screenshot({ clip, type, ...(type === 'jpeg' ? { quality: 95 } : {}) }));

  if (mode === 'preview') {
    for (const t of rest.map(Number)) {
      await require('fs').promises.writeFile(`${out}-${String(t).replace('.', '_')}.png`, await frame(t, 'png'));
      console.log('still', t);
    }
  } else {
    const duration = await page.evaluate(() => window.__duration);
    const frames = Math.round(duration * FPS), audio = rest[0];
    const args = ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-'];
    if (audio) args.push('-i', audio);
    args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', String(FPS));
    if (audio) args.push('-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-shortest');
    args.push('-movflags', '+faststart', out);
    const ff = spawn(process.env.FFMPEG || 'ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exited ' + c)))));
    const started = Date.now();
    for (let i = 0; i < frames; i++) {
      const buf = await frame(i / FPS, 'jpeg');
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 150 === 0) console.log(`frame ${i}/${frames}  ${((Date.now() - started) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await done;
    console.log(`wrote ${out}: ${frames} frames in ${((Date.now() - started) / 1000).toFixed(0)}s`);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
