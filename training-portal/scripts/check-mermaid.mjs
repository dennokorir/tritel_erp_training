// Local QA (needs Google Chrome and a running preview): Mermaid diagrams are drawn in the browser, so a
// syntax error doesn't fail the build. This opens every built page that has a diagram and reports any
// that Mermaid couldn't draw.   Usage: npm run preview -- --port 4399 &  then  node scripts/check-mermaid.mjs http://localhost:4399
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const base = (process.argv[2] || 'http://localhost:4399').replace(/\/$/, '');
const pages = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : e.name === 'index.html' && fs.readFileSync(p, 'utf8').includes('class="mermaid"') && pages.push(p); } };
walk('dist');
let bad = 0;
for (const p of pages) {
  const url = base + '/' + path.relative('dist', path.dirname(p)).split(path.sep).join('/') + '/';
  const dom = execFileSync('google-chrome', ['--headless=new', '--disable-gpu', '--virtual-time-budget=10000', '--dump-dom', url.replace(/\/\/$/, '/')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 });
  const total = (dom.match(/class="mermaid"/g) || []).length;
  const drawn = (dom.match(/<svg[^>]+id="mermaid-/g) || []).length;
  const errors = (dom.match(/Syntax error in text|Parse error on line/g) || []).length;
  if (errors || drawn < total) { bad++; console.log(`FAIL ${url}: ${drawn}/${total} drawn, ${errors} error(s)`); }
  else console.log(`ok   ${url}: ${drawn}/${total}`);
}
console.log(`check-mermaid: ${pages.length} pages with diagrams, ${bad} with problems`);
process.exit(bad ? 1 : 0);
