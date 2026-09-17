#!/usr/bin/env node
// Headless verification: starts the Vite dev server, loads the app in
// Chromium, fails on any console error / page error, and saves a screenshot.
//
// Usage:
//   node scripts/check.mjs <shot-name> [--viewport WxH] [--eval "js"]... [--settle ms]
// Each --eval runs in order in the page context (async supported), with a
// short wait after each, before the screenshot is taken.

import { spawn } from 'node:child_process';
import { mkdirSync, readdirSync, existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const shotName = args[0] && !args[0].startsWith('--') ? args[0] : 'check';
let viewport = { width: 1440, height: 900 };
const evals = [];
let settle = 2500;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--viewport') {
    const [w, h] = args[++i].split('x').map(Number);
    viewport = { width: w, height: h };
  } else if (args[i] === '--eval') evals.push(args[++i]);
  else if (args[i] === '--settle') settle = Number(args[++i]);
}

function findChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers';
  for (const dir of readdirSync(base)) {
    if (!dir.startsWith('chromium')) continue;
    for (const candidate of [
      `${base}/${dir}/chrome-linux/chrome`,
      `${base}/${dir}/chrome-linux/headless_shell`,
    ]) if (existsSync(candidate)) return candidate;
  }
  if (existsSync(`${base}/chromium`)) return `${base}/chromium`;
  throw new Error(`No chromium found under ${base}`);
}

const PORT = 5173;
const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverOut = '';
server.stdout.on('data', (d) => { serverOut += d; });
server.stderr.on('data', (d) => { serverOut += d; });

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}/`);
      if (res.ok) return;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Vite dev server did not start.\n${serverOut}`);
}

let exitCode = 0;
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ executablePath: findChromium() });
  const page = await browser.newPage({ viewport });

  const problems = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`console.error: ${msg.text()}`);
    if (msg.type() === 'warning' && msg.text().includes('THREE')) problems.push(`three warning: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => problems.push(`requestfailed: ${req.url()} ${req.failure()?.errorText}`));

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(settle);

  for (const code of evals) {
    await page.evaluate(code);
    await page.waitForTimeout(1200);
  }

  mkdirSync('screenshots', { recursive: true });
  const path = `screenshots/${shotName}.png`;
  await page.screenshot({ path });

  if (problems.length > 0) {
    console.error(`✗ ${shotName}: ${problems.length} problem(s):`);
    for (const p of problems) console.error(`  ${p}`);
    exitCode = 1;
  } else {
    console.log(`✓ ${shotName}: zero console errors, screenshot → ${path}`);
  }
} catch (e) {
  console.error(`✗ ${shotName}: ${e.message}`);
  exitCode = 1;
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
process.exit(exitCode);
