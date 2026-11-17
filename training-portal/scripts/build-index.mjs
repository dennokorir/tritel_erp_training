// Runs before every build (npm run generate). Produces, from the pages and src/data:
//   - illustrations      src/illustrations/**/*.yaml  → src/generated/illustrations/**/*.svg
//   - glossary           src/data/glossary.yaml       → /reference/glossary/
//   - workflow states    src/data/states.yaml         → /reference/states/
//   - field reference    src/data/fields/<module>.yaml → /reference/fields/<module>/
//   - tag pages          page frontmatter `tags`       → /reference/tags/ and /reference/tags/<tag>/
//   - A–Z master index   titles, headings, keywords and glossary terms of every page → /reference/index/
// Generated pages are gitignored; edit the sources above instead.
import fs from 'node:fs';
import path from 'node:path';
import * as yaml from 'js-yaml';
import { renderAll } from './render-illustrations.mjs';
import { slugify } from '../src/plugins/remark-glossary-links.mjs';

const DOCS = 'src/content/docs';
const REF = path.join(DOCS, 'reference');
const GENERATED = new Set(['reference/glossary.md', 'reference/states.md']);
const isGenerated = (rel) => GENERATED.has(rel) || rel.startsWith('reference/tags/') || rel.startsWith('reference/fields/');
const MODULE_LABELS = { general: 'General', accountability: 'Accountability', projects: 'Projects', tenders: 'Tenders', board: 'Board', leave: 'Time Off', 'end-to-end': 'End-to-end', reference: 'Reference' };

const load = (p, dflt = []) => (fs.existsSync(p) ? yaml.load(fs.readFileSync(p, 'utf8')) ?? dflt : dflt);
const write = (rel, body) => { const p = path.join(DOCS, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); };
const fm = (o) => `---\n${yaml.dump(o, { lineWidth: 200 }).trim()}\n---\n`;
const htmlEsc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mdEsc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
// Same rules as Starlight's heading ids (github-slugger)
const headingSlug = (s) => s.toLowerCase().trim().replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '').replace(/ /g, '-');
const letterOf = (s) => { const c = s.trim().charAt(0).toUpperCase(); return /[A-Z]/.test(c) ? c : '#'; };
const letterBar = (letters) => `<nav class="tp-letters" aria-label="Jump to letter">${letters.map((l) => `<a href="#${l === '#' ? 'other' : l.toLowerCase()}">${l}</a>`).join('')}</nav>\n\n`;
const letterHeading = (l) => `## ${l === '#' ? 'Other' : l}\n\n`;

// ---------- read pages ----------
function readPages() {
  const pages = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!/\.mdx?$/.test(e.name)) continue;
      const rel = path.relative(DOCS, p).split(path.sep).join('/');
      if (isGenerated(rel)) continue;
      const raw = fs.readFileSync(p, 'utf8');
      const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      if (!m) throw new Error(`${rel}: missing frontmatter`);
      const data = yaml.load(m[1]) || {};
      const slug = rel.replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '');
      pages.push({ rel, url: slug ? `/${slug}/` : '/', data, body: m[2] });
    }
  };
  walk(DOCS);
  return pages.sort((a, b) => a.url.localeCompare(b.url));
}

// Split a body into sections by ## / ### headings (outside code fences)
function sections(body) {
  const out = [{ heading: null, anchor: null, text: '' }]; const seen = {}; let fence = false;
  for (const line of body.split('\n')) {
    if (/^(```|~~~)/.test(line.trim())) fence = !fence;
    const h = !fence && line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (h) {
      const text = h[2].replace(/[*_`]/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
      let a = headingSlug(text); if (seen[a] !== undefined) a = `${a}-${++seen[a]}`; else seen[a] = 0;
      out.push({ heading: text, anchor: a, level: h[1].length, text: '' });
    } else out[out.length - 1].text += line + '\n';
  }
  return out;
}

// ---------- glossary ----------
function buildGlossary(glossary, pagesByUrl) {
  const sorted = [...glossary].sort((a, b) => a.term.localeCompare(b.term));
  const letters = [...new Set(sorted.map((g) => letterOf(g.term)))];
  let body = fm({ title: 'Glossary', description: 'Every business term and field label used in Tritel’s systems, A to Z.', module: 'reference', pageType: 'reference', tags: ['reference'], keywords: ['definitions', 'terms', 'meaning', 'what does it mean'] });
  body += 'Plain-English meanings of the words you will meet on screen. Terms are linked from the first place they appear on each page.\n\n' + letterBar(letters);
  let cur = null;
  for (const g of sorted) {
    const l = letterOf(g.term); if (l !== cur) { body += letterHeading(l); cur = l; }
    const mod = g.module ? ` <span class="tp-badge">${MODULE_LABELS[g.module] ?? g.module}</span>` : '';
    const see = (g.see || []).map((s) => { const p = pagesByUrl[`/${s.replace(/^\/|\/$/g, '').replace(/(^|\/)index$/, '')}/`.replace(/^\/\/$/, '/')]; if (!p) throw new Error(`glossary "${g.term}": see "${s}" is not a page`); return `<a href="${p.url}">${htmlEsc(p.data.title)}</a>`; });
    // One line of HTML per entry, so the id anchors the term and Markdown can't split it
    body += `<dl class="tp-gloss" id="${slugify(g.term)}"><dt><strong>${htmlEsc(g.term)}</strong>${mod}</dt><dd>${htmlEsc(g.definition)}` +
      (g.aliases?.length ? ` <em>Also called: ${htmlEsc(g.aliases.join(', '))}.</em>` : '') + (see.length ? ` See ${see.join(', ')}.` : '') + '</dd></dl>\n\n';
  }
  write('reference/glossary.md', body);
}

// ---------- states ----------
function buildStates(states) {
  let body = fm({ title: 'Workflow states', description: 'Every status a record can be in, across all of Tritel’s systems, in one place.', module: 'reference', pageType: 'reference', tags: ['reference', 'workflows'], keywords: ['status', 'stage', 'state', 'what does this status mean'] });
  body += 'Each row is one status. **Moves to** lists where the record can go next and the button that does it.\n\n';
  const byModule = {};
  for (const s of states) ((byModule[s.module] ??= {})[s.workflow] ??= { link: s.link, rows: [] }).rows.push(s);
  for (const [mod, wfs] of Object.entries(byModule)) {
    body += `## ${MODULE_LABELS[mod] ?? mod}\n\n`;
    for (const [wf, { link, rows }] of Object.entries(wfs)) {
      body += `### ${wf}\n\n` + (link ? `Diagram and details: [${wf}](${link})\n\n` : '');
      body += '| Status | What it means | Moves to | Who moves it |\n|---|---|---|---|\n';
      for (const r of rows) body += `| **${mdEsc(r.state)}** | ${mdEsc(r.meaning)} | ${mdEsc(r.next ?? '—')} | ${mdEsc(r.who ?? '—')} |\n`;
      body += '\n';
    }
  }
  write('reference/states.md', body);
}

// ---------- fields ----------
function buildFields() {
  const dir = 'src/data/fields'; if (!fs.existsSync(dir)) return [];
  const mods = [];
  for (const f of fs.readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).sort()) {
    const mod = f.replace(/\.ya?ml$/, ''); const data = load(path.join(dir, f), {}); mods.push(mod);
    let body = fm({ title: `Field reference: ${MODULE_LABELS[mod] ?? mod}`, description: `What every field on the ${MODULE_LABELS[mod] ?? mod} screens means and where you see it.`, module: 'reference', pageType: 'reference', tags: ['reference', 'fields'], keywords: ['field', 'label', 'column', 'what does this field mean'] });
    body += 'Fields are grouped by the screen they belong to. Labels are exactly as they appear in the system.\n\n';
    for (const screen of data.screens || []) {
      body += `## ${screen.name}\n\n` + (screen.where ? `*Where:* ${screen.where}\n\n` : '');
      body += '| Field | What it means | Where you see it |\n|---|---|---|\n';
      for (const r of screen.fields) body += `| **${mdEsc(r.label)}** | ${mdEsc(r.meaning)} | ${mdEsc(r.where ?? '')} |\n`;
      body += '\n';
    }
    write(`reference/fields/${mod}.md`, body);
  }
  return mods;
}

// ---------- tags ----------
function buildTags(pages) {
  const tags = {};
  for (const p of pages) for (const t of p.data.tags || []) (tags[t] ??= []).push(p);
  const names = Object.keys(tags).sort();
  let idx = fm({ title: 'Tags', description: 'Browse pages by topic.', module: 'reference', pageType: 'reference', tags: [] });
  idx += names.map((t) => `- [${t}](/reference/tags/${slugify(t)}/) (${tags[t].length})`).join('\n') + '\n';
  write('reference/tags/index.md', idx);
  for (const t of names) {
    let body = fm({ title: `Tag: ${t}`, description: `Pages tagged “${t}”.`, module: 'reference', pageType: 'reference', sidebar: { hidden: true }, tags: [] });
    const byMod = {};
    for (const p of tags[t]) (byMod[MODULE_LABELS[p.data.module] ?? 'General'] ??= []).push(p);
    for (const [m, ps] of Object.entries(byMod)) body += `## ${m}\n\n` + ps.map((p) => `- [${p.data.title}](${p.url})${p.data.description ? ` — ${p.data.description}` : ''}`).join('\n') + '\n\n';
    body += '[All tags](/reference/tags/)\n';
    write(`reference/tags/${slugify(t)}.md`, body);
  }
  return names.length;
}

// ---------- A–Z index ----------
function buildIndex(pages, glossary) {
  const entries = {}; // term -> Map(href -> label)
  const add = (term, href, label) => { term = term.trim(); if (!term) return; (entries[term] ??= new Map()).set(href, label); };
  for (const p of pages) {
    if (p.data.template === 'splash' && p.url === '/') continue;
    add(p.data.title, p.url, p.data.title);
    for (const k of p.data.keywords || []) add(k, p.url, p.data.title);
    for (const s of sections(p.body)) if (s.heading && s.level === 2 && !/^(related|steps|what happens next|common mistakes|before you start)/i.test(s.heading))
      add(s.heading, `${p.url}#${s.anchor}`, `${p.data.title} › ${s.heading}`);
  }
  // Glossary terms: the glossary entry plus every page section that mentions the term
  for (const g of glossary) {
    add(g.term, `/reference/glossary/#${slugify(g.term)}`, 'Glossary');
    const names = [g.term, ...(g.aliases || [])].map((n) => new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'));
    for (const p of pages) for (const s of sections(p.body)) {
      if (!names.some((re) => re.test(s.text) || re.test(s.heading || ''))) continue;
      add(g.term, s.anchor ? `${p.url}#${s.anchor}` : p.url, s.heading ? `${p.data.title} › ${s.heading}` : p.data.title);
    }
    for (const a of g.aliases || []) add(a, `/reference/glossary/#${slugify(g.term)}`, `see ${g.term}`);
  }
  const terms = Object.keys(entries).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  const letters = [...new Set(terms.map(letterOf))];
  let body = fm({ title: 'A–Z index', description: 'Every topic, screen, term and keyword in the training portal, A to Z.', module: 'reference', pageType: 'reference', tags: ['reference'], keywords: ['index', 'find', 'where is', 'a-z'], tableOfContents: false });
  body += 'Every page title, section, glossary term and common word staff use, with a link to each place it appears.\n\n' + letterBar(letters);
  let cur = null;
  for (const t of terms) {
    const l = letterOf(t); if (l !== cur) { body += letterHeading(l); cur = l; }
    const links = [...entries[t].entries()].map(([href, label]) => `[${label.replace(/[[\]]/g, '')}](${href})`);
    body += `- **${t.replace(/[*_]/g, '')}**: ${links.join(' · ')}\n`;
  }
  // Starlight serves any ".../index" page at its parent URL, so the A–Z index is rendered by
  // src/pages/reference/[page].astro at /reference/index/ from this file instead.
  fs.mkdirSync('src/generated', { recursive: true });
  fs.writeFileSync('src/generated/a-z-index.md', body);
  return terms.length;
}

// ---------- run ----------
const n = renderAll();
// One YAML file per area (src/data/glossary/<area>.yaml, src/data/states/<area>.yaml), so authors never collide
const loadDir = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).sort().flatMap((f) => load(path.join(dir, f))) : []);
const glossary = loadDir('src/data/glossary');
const states = loadDir('src/data/states');
const dupes = glossary.map((g) => slugify(g.term)).filter((s, i, a) => a.indexOf(s) !== i);
if (dupes.length) throw new Error(`Glossary terms defined twice: ${[...new Set(dupes)].join(', ')}`);
const pages = readPages();
const pagesByUrl = Object.fromEntries(pages.map((p) => [p.url, p]));
buildGlossary(glossary, pagesByUrl);
buildStates(states);
const mods = buildFields();
const tagCount = buildTags(pages);
const termCount = buildIndex(pages, glossary);
console.log(`generate: ${n} illustrations, ${glossary.length} glossary terms, ${states.length} states, fields for [${mods.join(', ')}], ${tagCount} tags, ${termCount} index entries from ${pages.length} pages`);
