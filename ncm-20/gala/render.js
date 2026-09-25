// Render the gala edition of "Reading the Sky" (film.html) frame by frame with headless Chromium.
//
//   node render.js preview <out-prefix> <seconds...> [--scale 2]          PNG stills at those times
//   node render.js film <out.mp4> [score.wav] [--scale 2] [--jobs 3]       every frame at 30 fps → H.264 (+ AAC)
//   node render.js cues <cues.json>                                        the timeline, for score.py and subtitles
//        [--from S] [--to S] [--afrom S] [--crf 16] [--fps 50] [--grade led]   a time range (--afrom 0 when the audio file starts there); 50 fps; the LED-wall grade
//
// --scale 2 renders a 3840×2160 master. --jobs N renders N contiguous chunks in parallel pages and joins
// them without re-encoding. Needs Playwright (NODE_PATH may point at a global install) and an ffmpeg with
// libx264: set FFMPEG, e.g. to imageio-ffmpeg's bundled binary.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const opt = (name, dflt) => { const i = argv.indexOf('--' + name); if (i < 0) return dflt; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const FPS = Number(opt('fps', 30)), SCALE = Number(opt('scale', 1)), JOBS = Number(opt('jobs', 1)), CRF = String(opt('crf', SCALE > 1 ? 18 : 16));
const FROM = opt('from', null), TO = opt('to', null), GRADE = opt('grade', 'web'), AFROM = opt('afrom', null); // --afrom: film time where the audio file starts (default --from); 0 for part2.wav
const FF = process.env.FFMPEG || 'ffmpeg';
const run = (args, stdio = ['ignore', 'inherit', 'inherit']) => new Promise((res, rej) => { const p = spawn(FF, args, { stdio }); p.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exited ' + c)))); });

async function openPage(browser) {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: SCALE });
  // The fonts are self-hosted (fonts/); any other https request is fetched from Node so TLS is verified normally.
  await context.route(/^https:\/\//, async route => { try { await route.fulfill({ response: await route.fetch() }); } catch { await route.abort(); } });
  const page = await context.newPage();
  page.on('pageerror', e => { console.error('page error:', e.message); process.exitCode = 1; });
  await page.goto('file://' + path.resolve(__dirname, process.env.FILM_HTML || 'film.html') + `?capture&scale=${SCALE}&grade=${GRADE}` + (process.env.FILM_QUERY ? '&' + process.env.FILM_QUERY : ''), { waitUntil: 'networkidle' });
  await page.evaluate(() => window.__ready);
  const clip = { x: 0, y: 0, width: 1920, height: 1080 };
  page.frame = (t, type) => page.evaluate(t => window.__render(t), t).then(() => page.screenshot({ clip, type, ...(type === 'jpeg' ? { quality: 95 } : {}) }));
  return page;
}

(async () => {
  const [mode, out, ...rest] = argv;
  if (mode === 'cues') { // the timeline as JSON, for score.py and the subtitle files
    const browser = await chromium.launch(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {});
    const page = await openPage(browser);
    const cues = await page.evaluate(() => ({ duration: DURATION, scenes: SCENES.map(s => ({ id: s.id, start: s.start, dur: s.dur, speed: s.speed || 1, offset: s.offset || 0, night: !!s.night, xf: s.xf ?? XF, enter: (s.enter && s.enter.type) || 'fade', t20: s.id === 'gauge' ? s.t20 : undefined, dt: s.id === 'gauge' ? s.dt : undefined, role: s.role || null, text: s.text || null, sub: s.sub || null })),
      // every words block with its film times (recorded by calling each scene's words once), and the narration
      text: (() => { TEXT_REC = []; SCENES.forEach(s => { if (s.words) { ctx.save(); try { s.words.call(s, 0.5 * s.dur); } catch (e) { TEXT_REC.push({ error: s.id + ': ' + e.message }); } ctx.restore(); } }); const r = TEXT_REC; TEXT_REC = null; return r; })(),
      vo: typeof VO === 'undefined' ? [] : VO.map(v => ({ id: v.id, in: v.in, out: v.out, ar: v.ar, sub: voSubAr(v), en: v.en })) }));
    fs.writeFileSync(out, JSON.stringify(cues, null, 1)); console.log('wrote', out, cues.scenes.length, 'scenes,', cues.duration, 's');
    await browser.close(); return;
  }
  if (!['preview', 'film'].includes(mode) || !out) {
    console.error('usage: node render.js preview <prefix> <t...> | film <out.mp4> [score.wav] [--scale 2] [--jobs N] [--from S --to S]');
    process.exit(2);
  }
  const browser = await chromium.launch(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {});
  if (mode === 'preview') {
    const page = await openPage(browser);
    for (const t of rest.map(Number)) {
      fs.writeFileSync(`${out}-${String(t).replace('.', '_')}.png`, await page.frame(t, 'png'));
      console.log('still', t);
    }
    await browser.close();
    return;
  }
  const probe = await openPage(browser);
  const duration = await probe.evaluate(() => window.__duration);
  await probe.context().close();
  const f0 = Math.round((FROM != null ? Number(FROM) : 0) * FPS), f1 = Math.round((TO != null ? Number(TO) : duration) * FPS);
  const audio = rest[0], started = Date.now(), n = f1 - f0;
  const parts = [], per = Math.ceil(n / JOBS);
  for (let j = 0; j < JOBS; j++) { const a = f0 + j * per, b = Math.min(f1, a + per); if (b > a) parts.push({ a, b, file: `${out}.part${j}.mp4` }); }
  let done = 0;
  await Promise.all(parts.map(async part => {
    const page = await openPage(browser);
    const ff = spawn(FF, ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF, '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', String(FPS), part.file], { stdio: ['pipe', 'inherit', 'inherit'] });
    const closed = new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exited ' + c)))));
    for (let i = part.a; i < part.b; i++) {
      const buf = await page.frame(i / FPS, 'jpeg');
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (++done % 150 === 0) console.log(`frame ${done}/${n}  ${((Date.now() - started) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await closed; await page.context().close();
  }));
  await browser.close();
  // join the chunks without re-encoding, then lay the score under the picture
  const list = `${out}.parts.txt`;
  fs.writeFileSync(list, parts.map(p => `file '${path.resolve(p.file)}'`).join('\n') + '\n');
  const args = ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list];
  if (audio) args.push('-ss', String(AFROM != null ? Number(AFROM) : f0 / FPS), '-i', audio);
  args.push('-map', '0:v');
  if (audio) args.push('-map', '1:a', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest');
  args.push('-c:v', 'copy', '-movflags', '+faststart', out);
  await run(args);
  if (!process.env.KEEP_PARTS) { parts.forEach(p => fs.unlinkSync(p.file)); fs.unlinkSync(list); }
  console.log(`wrote ${out}: ${n} frames at ${1920 * SCALE}×${1080 * SCALE} in ${((Date.now() - started) / 1000).toFixed(0)}s`);
})().catch(e => { console.error(e); process.exit(1); });
