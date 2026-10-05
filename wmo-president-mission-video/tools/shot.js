// usage: node tools/shot.js <html> <out.png> [w] [h] [evalJS]
const { chromium } = (() => { try { return require('playwright'); } catch { return require('/opt/node22/lib/node_modules/playwright'); } })();
(async () => {
  const [html, out, w = '1080', h = '1350', js] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto('file://' + require('path').resolve(html));
  await page.evaluate(() => document.fonts.ready);
  if (js) await page.evaluate(js);
  await page.waitForTimeout(150);
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
})();
