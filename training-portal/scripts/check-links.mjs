// After the build: every internal link in dist/ must point at a page that exists, and every
// #anchor at an id on that page. Also flags how-to pages without an illustration.
// Exits with an error so a broken link fails the Netlify build.
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const files = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : e.name.endsWith('.html') && files.push(p); } };
walk(DIST);

const ids = new Map();
const html = new Map();
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8'); html.set(f, s);
  ids.set(f, new Set([...s.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}
const target = (urlPath) => {
  const clean = decodeURI(urlPath).replace(/^\//, '');
  for (const c of [path.join(DIST, clean, 'index.html'), path.join(DIST, clean), path.join(DIST, clean + '.html')]) if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  return null;
};

const broken = []; let checked = 0;
for (const [f, s] of html) {
  if (f === path.join(DIST, '404.html')) continue;
  for (const m of s.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    const href = m[1].replace(/&amp;/g, '&');
    if (!href.startsWith('/') && !href.startsWith('#')) continue;
    if (href.startsWith('/_astro/') || href.startsWith('/pagefind/')) continue;
    checked++;
    const [p, anchor] = href.startsWith('#') ? ['', href.slice(1)] : href.split('#');
    const t = p ? target(p.split('?')[0]) : f;
    if (!t) { broken.push(`${f}: ${href} (no such page)`); continue; }
    if (anchor && !ids.get(t)?.has(decodeURIComponent(anchor))) broken.push(`${f}: ${href} (no #${anchor} on that page)`);
  }
}

// Every how-to page carries at least one illustration (inline SVG figure or Mermaid diagram)
const noIll = [];
for (const [f, s] of html) if (/data-pagefind-meta="type:how-to"/.test(s) && !/class="tp-figure|class="mermaid/.test(s)) noIll.push(f);

console.log(`check-links: ${files.length} pages, ${checked} internal links checked`);
if (noIll.length) console.error(`How-to pages without an illustration:\n  ${noIll.join('\n  ')}`);
if (broken.length) console.error(`Broken links (${broken.length}):\n  ${broken.slice(0, 200).join('\n  ')}`);
if (broken.length || noIll.length) process.exit(1);
