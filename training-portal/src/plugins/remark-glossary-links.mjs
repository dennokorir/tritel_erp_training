// Links the first occurrence of each glossary term on a page to its glossary entry.
// Terms and aliases come from src/data/glossary.yaml. Headings, links, code, and the
// glossary page itself are left alone. Matching is whole-word and case-insensitive.
import fs from 'node:fs';
import * as yaml from 'js-yaml';

export const slugify = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-');

function loadTerms() {
  const dir = 'src/data/glossary';
  const entries = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).flatMap((f) => yaml.load(fs.readFileSync(`${dir}/${f}`, 'utf8')) || []) : [];
  const terms = [];
  for (const e of entries) {
    for (const name of [e.term, ...(e.aliases || [])]) terms.push({ name, slug: slugify(e.term), definition: e.definition });
  }
  return terms.sort((a, b) => b.name.length - a.name.length); // longest first: "review pack" before "review"
}

const SKIP = new Set(['heading', 'link', 'linkReference', 'code', 'inlineCode', 'mdxJsxFlowElement', 'mdxJsxTextElement', 'html', 'mdxFlowExpression', 'mdxTextExpression', 'tableCell']);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default function remarkGlossaryLinks() {
  const terms = loadTerms();
  const re = terms.length ? new RegExp(`\\b(${terms.map((t) => esc(t.name)).join('|')})\\b`, 'gi') : null;
  const byName = new Map(terms.map((t) => [t.name.toLowerCase(), t]));
  return (tree, file) => {
    if (!re) return;
    const path = String(file.history?.[0] || file.path || '');
    if (/reference\/glossary/.test(path) || /\/reference\/index/.test(path)) return;
    const used = new Set();
    const walk = (node) => {
      if (!node.children) return;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (SKIP.has(child.type)) continue;
        if (child.type !== 'text') { walk(child); continue; }
        const out = []; let last = 0; let m; re.lastIndex = 0;
        while ((m = re.exec(child.value))) {
          const t = byName.get(m[1].toLowerCase());
          if (!t || used.has(t.slug)) continue;
          used.add(t.slug);
          if (m.index > last) out.push({ type: 'text', value: child.value.slice(last, m.index) });
          out.push({ type: 'link', url: `/reference/glossary/#${t.slug}`, title: t.definition,
            data: { hProperties: { className: ['tp-term'] } }, children: [{ type: 'text', value: m[1] }] });
          last = m.index + m[1].length;
        }
        if (!out.length) continue;
        if (last < child.value.length) out.push({ type: 'text', value: child.value.slice(last) });
        node.children.splice(i, 1, ...out); i += out.length - 1;
      }
    };
    walk(tree);
  };
}
