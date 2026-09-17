import { defineConfig, type Plugin } from 'vite';
import { readFileSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

// The editable JSON lives in /data at the project root (per the data
// architecture). This plugin serves it at /data/* in dev and copies it into
// dist/data on build, so the app works identically before and after `build`.
function serveDataDir(): Plugin {
  let outDir = 'dist';
  return {
    name: 'serve-data-dir',
    configResolved(config) { outDir = config.build.outDir; },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/data/') && req.url.endsWith('.json')) {
          try {
            const file = readFileSync(join(process.cwd(), req.url.split('?')[0]));
            res.setHeader('Content-Type', 'application/json');
            res.end(file);
            return;
          } catch { /* fall through to 404 */ }
        }
        next();
      });
    },
    closeBundle() {
      const src = join(process.cwd(), 'data');
      const dest = join(process.cwd(), outDir, 'data');
      mkdirSync(dest, { recursive: true });
      for (const f of readdirSync(src)) {
        if (f.endsWith('.json')) copyFileSync(join(src, f), join(dest, f));
      }
    },
  };
}

export default defineConfig({
  plugins: [serveDataDir()],
  server: { port: 5173, strictPort: true },
});
