#!/usr/bin/env node
// Runs the Astro CLI on a Node.js version Astro supports (>=22.23.4).
// Netlify CI honours NODE_VERSION from netlify.toml, but some build environments
// (e.g. CLI-driven deploys) run whatever Node.js is first on PATH. If that one is
// too old, fall back to the newest suitable Node.js installed via nvm.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

const MIN = [22, 23, 4];

const parse = (v) => v.replace(/^v/, '').split('.').map((n) => Number.parseInt(n, 10) || 0);
const cmp = (a, b) => {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
};
const supported = (v) => cmp(parse(v), MIN) >= 0;

function findNode() {
  if (supported(process.versions.node)) return process.execPath;
  const roots = new Set(
    [process.env.NVM_DIR, join(homedir(), '.nvm'), dirname(dirname(dirname(dirname(process.execPath))))]
      .filter(Boolean)
      .map((d) => (d.endsWith(join('versions', 'node')) ? d : join(d, 'versions', 'node'))),
  );
  // Also scan nvm installs found anywhere on PATH.
  for (const p of (process.env.PATH || '').split(':')) {
    const m = p.match(/^(.*[\\/]versions[\\/]node)[\\/]v[^\\/]+[\\/]bin$/);
    if (m) roots.add(m[1]);
  }
  const candidates = [];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const dir of readdirSync(root)) {
      const bin = join(root, dir, 'bin', 'node');
      if (/^v\d+\.\d+\.\d+$/.test(dir) && supported(dir) && existsSync(bin)) candidates.push([parse(dir), bin]);
    }
  }
  candidates.sort((a, b) => cmp(b[0], a[0]));
  return candidates[0]?.[1] ?? process.execPath; // let Astro report the error if nothing fits
}

const require = createRequire(import.meta.url);
const astroBin = join(dirname(require.resolve('astro/package.json')), 'bin', 'astro.mjs');
const node = findNode();
if (node !== process.execPath) console.log(`run-astro: Node.js ${process.versions.node} is too old for Astro; using ${node}`);

const result = spawnSync(node, [astroBin, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
});
process.exit(result.status ?? 1);
