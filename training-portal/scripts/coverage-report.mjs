#!/usr/bin/env node
// Inventory of the user-facing elements of each documented Odoo module, read from the code, compared with
// docs-manifest.json. Used by /docs-sync (see ../README.md, "Keeping the portal in step with the code").
//
//   node scripts/coverage-report.mjs                      all modules, human-readable
//   node scripts/coverage-report.mjs --module tenders     one module (manifest key)
//   node scripts/coverage-report.mjs --json               machine-readable (inventory + status per item)
//   node scripts/coverage-report.mjs --ref <git ref>      read the code at another ref (default: manifest track_ref)
//   node scripts/coverage-report.mjs --worktree           read the module repo's working tree instead of a ref
//   node scripts/coverage-report.mjs --suggest            for unmapped items, list pages whose text mentions them
//   node scripts/coverage-report.mjs --module tenders,board   several modules in one report (shared pages listed once)
//   node scripts/coverage-report.mjs --suggest-watch      propose each module's `watch` list (supporting addons)
//   node scripts/coverage-report.mjs --changes            files changed since last_synced_commit (owned + watched
//                                                         addons) and the pages that cite them
//
// What counts as an inventory item: models (and their description), selection/state fields with their values,
// menus, security groups, wizards (transient models), reports, scheduled jobs (crons), mail templates and
// client actions (the custom screens). Each has a stable id: <addon>:<kind>:<key>.
//
// Portal pages (@http.route handlers serving HTML) are items too, kind 'route'.
// Extensions of other modules are items too: 'view_ext' (a button, tab or field an addon adds to another module's
// view, by its label) and 'field' (a field added to another module's model; user-facing when shown in a view).
//
// Each module may `watch` supporting addons: their changes are reported by --changes (so /docs-sync reviews the
// module's pages) but they are not inventoried as the module's own.
//
// Status per item: COVERED (mapped to at least one page in the manifest), EXCLUDED (listed in the module's
// `excluded` with a reason), UNCOVERED (user-facing, neither), TECHNICAL (not user-facing: not reported as a gap).
// Manifest items that no longer exist in the code are reported as REMOVED.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORTAL = path.resolve(HERE, '..');
const MANIFEST = path.join(PORTAL, 'docs-manifest.json');

// ---------- arguments ----------
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const onlyModule = opt('--module');            // one key or several, comma-separated
const asJson = flag('--json');
const useWorktree = flag('--worktree');
const suggest = flag('--suggest');
const suggestWatch = flag('--suggest-watch');
const changes = flag('--changes');

// ---------- reading code from a git ref or the working tree ----------
function git(repo, ...a) { return execFileSync('git', ['-C', repo, ...a], { encoding: 'utf8', maxBuffer: 256 << 20 }); }
function listFiles(repo, ref, addon) {
  if (useWorktree) {
    const out = []; const root = path.join(repo, addon);
    const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (!['__pycache__', 'node_modules', 'tests', 'migrations', 'static'].includes(e.name)) walk(p); } else out.push(path.relative(repo, p)); } };
    walk(root); return out;
  }
  return git(repo, 'ls-tree', '-r', '--name-only', ref, '--', addon).split('\n').filter((f) => f && !/\/(tests|migrations|static)\//.test(f));
}
function readFile(repo, ref, file) { return useWorktree ? fs.readFileSync(path.join(repo, file), 'utf8') : git(repo, 'show', `${ref}:${file}`); }

// ---------- Python parsing (best effort, regex + bracket matching) ----------
const lineOf = (text, idx) => text.slice(0, idx).split('\n').length;
function balanced(text, start) { // text[start] === '('  → index after matching ')'
  let depth = 0, q = null;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') { depth--; if (depth === 0) return i + 1; }
  }
  return text.length;
}
const strArg = (body, name) => { const m = body.match(new RegExp(`\\b${name}\\s*=\\s*_?\\(?\\s*(['"])((?:\\\\.|(?!\\1).)*)\\1`)); return m ? m[2] : null; };

function parsePython(text, file, addon, items, ctx = {}) {
  // Portal and web pages: @http.route(...) handlers serving HTML (JSON endpoints are technical)
  for (const r of text.matchAll(/@http\.route\(/g)) {
    const open = r.index + r[0].length - 1; const args = text.slice(open + 1, balanced(text, open) - 1);
    const paths = [...args.replace(/\b\w+\s*=[\s\S]*$/, '').matchAll(/['"](\/[^'"]*)['"]/g)].map((m) => m[1]);
    if (!paths.length) continue;
    const type = (args.match(/type\s*=\s*['"](\w+)['"]/) || [])[1] || 'http';
    const post = /methods\s*=\s*\[\s*['"]POST['"]\s*\]/.test(args);
    items.push({ id: `${addon}:route:${paths[0]}`, addon, kind: 'route', key: paths[0], label: paths[0], paths, file,
                 line: lineOf(text, r.index), user_facing: type === 'http' && !post,
                 note: type !== 'http' ? 'JSON endpoint' : post ? 'form submission' : '' });
  }
  // Split into classes
  const classRe = /^class\s+(\w+)\s*\(([^)]*)\)\s*:/gm; const starts = [];
  let m; while ((m = classRe.exec(text))) starts.push({ idx: m.index, name: m[1], bases: m[2] });
  starts.forEach((c, i) => {
    const body = text.slice(c.idx, i + 1 < starts.length ? starts[i + 1].idx : text.length);
    const name = (body.match(/^\s+_name\s*=\s*['"]([\w.]+)['"]/m) || [])[1];
    const inherit = (body.match(/^\s+_inherit\s*=\s*['"]([\w.]+)['"]/m) || [])[1];
    const desc = (body.match(/^\s+_description\s*=\s*_?\(?\s*['"]([^'"]+)['"]/m) || [])[1];
    const transient = /TransientModel/.test(c.bases);
    const abstract = /AbstractModel/.test(c.bases);
    const model = name || inherit;
    if (!model) return;
    if (name && !(inherit && inherit === name)) {
      const kind = transient ? 'wizard' : 'model';
      items.push({ id: `${addon}:${kind}:${name}`, addon, kind, key: name, label: desc || name, file, line: lineOf(text, c.idx),
                   user_facing: !abstract, note: abstract ? 'abstract (data service)' : '' });
    }
    // Plain fields this addon adds to a model it doesn't define (an extension of another module)
    if (!name && inherit && !(ctx.ownModels || new Set()).has(inherit)) {
      const fRe = /^\s+(\w+)\s*=\s*fields\.(\w+)\(/gm; let f;
      while ((f = fRe.exec(body))) {
        if (f[2] === 'Selection') continue;           // inventoried as 'selection' below
        const open = f.index + f[0].length - 1; const fargs = body.slice(open + 1, balanced(body, open) - 1);
        // The label: string=..., else the first positional text that reads like a label (not a model name)
        const positional = [...fargs.replace(/\b\w+\s*=[\s\S]*$/, '').matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]);
        const label = strArg(fargs, 'string') || positional.find((x) => /\s/.test(x) || (/[A-Z]/.test(x) && !/^[a-z_]+(\.[a-z_]+)+$/.test(x))) || null;
        const shown = (ctx.shownFields || new Set()).has(f[1]);
        items.push({ id: `${addon}:field:${inherit}.${f[1]}`, addon, kind: 'field', key: `${inherit}.${f[1]}`, label: label || f[1],
                     file, line: lineOf(text, c.idx + f.index), user_facing: shown && !f[1].startsWith('_'),
                     note: shown ? `adds to ${inherit}` : 'not shown in this addon\'s views' });
      }
    }
    // Selection fields
    const selRe = /^\s+(\w+)\s*=\s*fields\.Selection\(/gm; let s;
    while ((s = selRe.exec(body))) {
      const open = s.index + s[0].length - 1; const end = balanced(body, open); const args = body.slice(open + 1, end - 1);
      const values = [...args.matchAll(/\(\s*['"]([\w.-]+)['"]\s*,\s*_?\(?\s*['"]([^'"]+)['"]/g)].map((v) => ({ value: v[1], label: v[2] }));
      let label = strArg(args, 'string');
      if (!label) { const pos = args.replace(/^\s*(\[[\s\S]*?\]|[\w.]+|'[^']*'|"[^"]*")\s*,\s*/, ''); const p = pos.match(/^\s*_?\(?\s*['"]([^'"]+)['"]/); if (p) label = p[1]; }
      const fname = s[1];
      items.push({ id: `${addon}:selection:${model}.${fname}`, addon, kind: 'selection', key: `${model}.${fname}`,
                   label: label || fname, values, file, line: lineOf(text, c.idx + s.index), user_facing: !transient && !fname.startsWith('_'),
                   note: transient ? 'wizard option' : '' });
    }
  });
}

// ---------- XML parsing ----------
const attr = (tag, a) => { const m = tag.match(new RegExp(`\\b${a}\\s*=\\s*"([^"]*)"`)); return m ? m[1] : null; };
const fieldVal = (rec, f) => { const m = rec.match(new RegExp(`<field\\s+name="${f}"[^>]*?(?:/>|>([\\s\\S]*?)</field>)`)); return m ? (m[1] || '').replace(/<[^>]+>/g, '').trim() : null; };
function parseXml(text, file, addon, items) {
  // Commented-out records and menus are not on screen: blank comments out (keeping line numbers)
  text = text.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ' '));
  for (const m of text.matchAll(/<menuitem\b[^>]*>/g)) {
    const id = attr(m[0], 'id'); if (!id) continue;
    items.push({ id: `${addon}:menu:${id}`, addon, kind: 'menu', key: id, label: attr(m[0], 'name') || id, groups: attr(m[0], 'groups') || '',
                 action: attr(m[0], 'action') || '', parent: attr(m[0], 'parent') || '', file, line: lineOf(text, m.index), user_facing: true });
  }
  for (const m of text.matchAll(/<record\b([^>]*)>([\s\S]*?)<\/record>/g)) {
    const id = attr(m[1], 'id'); const model = attr(m[1], 'model'); if (!id || !model) continue;
    const rec = m[2]; const line = lineOf(text, m.index); const name = fieldVal(rec, 'name') || id;
    const push = (kind, extra = {}) => items.push({ id: `${addon}:${kind}:${id}`, addon, kind, key: id, label: name, file, line, user_facing: true, ...extra });
    if (model === 'res.groups') push('group');
    else if (model === 'ir.cron') push('cron', { user_facing: true });
    else if (model === 'mail.template') push('mail_template', { subject: fieldVal(rec, 'subject') || '' });
    else if (model === 'ir.actions.report') push('report');
    else if (model === 'ir.actions.client') push('client_action', { tag: fieldVal(rec, 'tag') || '' });
    else if (model === 'ir.ui.menu') push('menu');
  }
  // Inherited views of OTHER modules: what this addon adds to their screens (buttons, tabs, fields), by label
  for (const m of text.matchAll(/<record\b([^>]*)>([\s\S]*?)<\/record>/g)) {
    if (attr(m[1], 'model') !== 'ir.ui.view') continue;
    const inh = (m[2].match(/<field\s+name="inherit_id"\s+ref="([^"]+)"/) || [])[1];
    if (!inh || !inh.includes('.') || inh.split('.')[0] === addon) continue;        // own views are part of own screens
    const arch = (m[2].match(/<field\s+name="arch"[^>]*>([\s\S]*)<\/field>/) || [])[1] || '';
    const line = lineOf(text, m.index); const seen = new Set();
    for (const t of arch.matchAll(/<(button|page|field)\b([^>]*?)\/?>/g)) {
      const tag = t[1]; const a = t[2];
      if (/\binvisible="(1|True)"/.test(a) || /\bposition=/.test(a) && !/\bstring=/.test(a)) continue;
      // Fields count here only with their own label in the view; otherwise the 'field' kind (label from the code) covers them
      const label = attr(a, 'string') || (tag === 'button' ? attr(a, 'name') : null);
      if (!label || seen.has(tag + label)) continue; seen.add(tag + label);
      const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      items.push({ id: `${addon}:view_ext:${inh}:${tag}:${slug}`, addon, kind: 'view_ext', key: `${inh}:${tag}:${slug}`,
                   label, tag, view: inh, file, line, user_facing: true, note: `${tag} added to ${inh}` });
    }
  }
  for (const m of text.matchAll(/<report\b[^>]*>/g)) {
    const id = attr(m[0], 'id'); if (id) items.push({ id: `${addon}:report:${id}`, addon, kind: 'report', key: id, label: attr(m[0], 'string') || id, file, line: lineOf(text, m.index), user_facing: true });
  }
}

export function inventory(mod, ref) {
  const items = [];
  for (const addon of mod.addons) {
    const files = listFiles(mod.repo_root, ref, addon);
    const xml = files.filter((f) => f.endsWith('.xml')); const py = files.filter((f) => f.endsWith('.py'));
    const before = items.length; items.shown = new Set();
    for (const f of xml) parseXml(readFile(mod.repo_root, ref, f), f, addon, items);
    // Fields visible in any of this addon's views (inherited or own), for the 'field' kind
    // (fields inside a <button> are smart-button figures, not something staff read or fill in)
    for (const f of xml) for (const t of readFile(mod.repo_root, ref, f).replace(/<!--[\s\S]*?-->/g, '').replace(/<button\b(?:[^>"']|"[^"]*"|'[^']*')*?(?<!\/)>[\s\S]*?<\/button>/g, '').matchAll(/<field\b([^>]*?)\/?>/g))
      if (!/\binvisible="(1|True)"/.test(t[1]) && attr(t[1], 'name')) items.shown.add(attr(t[1], 'name'));
    const ownModels = new Set();
    for (const f of py) for (const m of readFile(mod.repo_root, ref, f).matchAll(/^\s+_name\s*=\s*['"]([\w.]+)['"]/gm)) ownModels.add(m[1]);
    for (const f of py) parsePython(readFile(mod.repo_root, ref, f), f, addon, items, { ownModels, shownFields: items.shown });
    void before;
  }
  delete items.shown;
  // De-duplicate (a record id defined twice keeps the first) and mark menus that only group others as technical
  const seen = new Map(); for (const it of items) if (!seen.has(it.id)) seen.set(it.id, it);
  return [...seen.values()];
}

// ---------- addons, sources and changes (watch lists) ----------
function dependsOf(repo, ref, addon) {
  let txt = ''; try { txt = useWorktree ? fs.readFileSync(path.join(repo, addon, '__manifest__.py'), 'utf8') : git(repo, 'show', `${ref}:${addon}/__manifest__.py`); } catch { return []; }
  const m = txt.match(/['"]depends['"]\s*:\s*\[([^\]]*)\]/); return m ? [...m[1].matchAll(/['"]([\w.]+)['"]/g)].map((x) => x[1]) : [];
}
function repoAddons(repo, ref) {
  try { return new Set(git(repo, 'ls-tree', '-d', '--name-only', ref).split('\n').filter(Boolean)); } catch { return new Set(); }
}
function pageSources() {             // page slug -> [module-relative source files]
  const dir = path.join(PORTAL, 'src/content/docs'); const out = {};
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.mdx?$/.test(e.name)) {
    const t = fs.readFileSync(p, 'utf8'); if (!t.startsWith('---\n')) continue; const fm = t.slice(4).split('\n---\n')[0];
    const block = fm.match(/^sources:\s*\n((?:\s+-\s+.*\n?)*)/m); const inline = fm.match(/^sources:\s*\[(.*)\]/m);
    const list = block ? [...block[1].matchAll(/-\s+(.+)/g)].map((x) => x[1].trim().replace(/^['"]|['"]$/g, '')) : inline ? inline[1].split(',').map((x) => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean) : [];
    out[path.relative(dir, p).replace(/\.mdx?$/, '')] = list; } } };
  walk(dir); return out;
}
const watchedNames = (mod) => (mod.watch || []).map((w) => (typeof w === 'string' ? w : w.addon));

// ---------- pages, for --suggest ----------
function readPages() {
  const dir = path.join(PORTAL, 'src/content/docs'); const out = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.mdx?$/.test(e.name)) out.push(p); } };
  walk(dir);
  return out.map((p) => ({ rel: path.relative(dir, p).replace(/\.mdx?$/, ''), text: fs.readFileSync(p, 'utf8').toLowerCase() }));
}

// ---------- run ----------
function main() {
  if (!fs.existsSync(MANIFEST)) { console.error(`No ${MANIFEST}. See the README.`); process.exit(2); }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const keys = onlyModule ? onlyModule.split(',').map((k) => k.trim()).filter(Boolean) : Object.keys(manifest.modules);
  const pages = suggest ? readPages() : [];
  const report = {};
  for (const key of keys) {
    const mod = manifest.modules[key];
    if (!mod) { console.error(`Unknown module "${key}". Known: ${Object.keys(manifest.modules).join(', ')}`); process.exit(2); }
    const ref = opt('--ref') || mod.track_ref || 'HEAD';
    const inv = inventory(mod, ref);
    const mapped = mod.items || {}; const excluded = mod.excluded || {};
    const rows = inv.map((it) => {
      const m = mapped[it.id];
      const status = excluded[it.id] ? 'EXCLUDED' : (m && m.pages && m.pages.length) ? 'COVERED' : it.user_facing ? 'UNCOVERED' : 'TECHNICAL';
      return { ...it, status, pages: m?.pages || [], illustrations: m?.illustrations || [], reason: excluded[it.id] || '' };
    });
    const live = new Set(inv.map((i) => i.id));
    const removed = Object.keys(mapped).filter((id) => !live.has(id));
    let head = null; try { head = git(mod.repo_root, 'rev-parse', useWorktree ? 'HEAD' : ref).trim(); } catch { /* unknown ref */ }
    report[key] = { title: mod.title, ref: useWorktree ? 'worktree' : ref, head, last_synced_commit: mod.last_synced_commit,
                    counts: rows.reduce((c, r) => ((c[r.status] = (c[r.status] || 0) + 1), c), { REMOVED: removed.length }),
                    items: rows, removed };
    if (suggest) for (const r of rows.filter((x) => x.status === 'UNCOVERED')) {
      const needles = [r.label, ...(r.values || []).map((v) => v.label)].filter((s) => s && s.length > 3).map((s) => s.toLowerCase());
      r.suggest = pages.filter((p) => p.rel.startsWith(mod.pages_dir.replace(/^src\/content\/docs\//, '')) && needles.some((n) => p.text.includes(n))).map((p) => p.rel).slice(0, 8);
    }
  }
  // Supporting addons: watch lists, suggestions, and addons pages rely on that nobody tracks
  const srcs = pageSources();
  const owned = new Set(Object.values(manifest.modules).flatMap((m) => m.addons));
  const watchedAll = new Set(Object.values(manifest.modules).flatMap(watchedNames));
  const cited = {};                                   // addon -> pages citing it
  // Only entries that are module-relative file paths ("addon/dir/file.ext"), not free-text notes
  for (const [pg, files] of Object.entries(srcs)) for (const f of files) { if (!/^[\w.-]+\/\S+$/.test(f)) continue; const a = f.split('/')[0]; (cited[a] ||= new Set()).add(pg); }
  const untracked = Object.keys(cited).filter((a) => !owned.has(a) && !watchedAll.has(a)).sort();
  for (const key of keys) {
    const mod = manifest.modules[key]; const ref = opt('--ref') || mod.track_ref || 'HEAD'; const r = report[key];
    const section = mod.pages_dir.replace(/^src\/content\/docs\//, '');
    r.watch = mod.watch || [];
    if (suggestWatch) {
      const tritel = repoAddons(mod.repo_root, ref); const props = {};
      for (const a of mod.addons) for (const d of dependsOf(mod.repo_root, ref, a)) if (tritel.has(d) && !mod.addons.includes(d)) (props[d] ||= { addon: d, why: new Set(), pages: new Set() }).why.add(`${a} depends on it`);
      for (const [a, pgs] of Object.entries(cited)) {
        if (mod.addons.includes(a)) continue;
        const inSection = [...pgs].filter((p) => p.startsWith(section));
        if (inSection.length) { const pr = (props[a] ||= { addon: a, why: new Set(), pages: new Set() }); pr.why.add(`cited in ${inSection.length} ${section} page(s)`); inSection.forEach((p) => pr.pages.add(p)); }
      }
      r.watch_suggestions = Object.values(props).map((p) => ({ addon: p.addon, why: [...p.why], pages: [...p.pages].sort(),
                                                               already: watchedNames(mod).includes(p.addon) }));
    }
    if (changes && mod.last_synced_commit) {
      const paths = [...mod.addons, ...watchedNames(mod)];
      const files = git(mod.repo_root, 'diff', '--name-only', `${mod.last_synced_commit}..${ref}`, '--', ...paths).split('\n').filter(Boolean);
      const byFile = files.map((f) => ({ file: f, owner: mod.addons.includes(f.split('/')[0]) ? 'owned' : 'watched',
                                         pages: Object.entries(srcs).filter(([, l]) => l.includes(f)).map(([p]) => p).sort() }));
      r.changes = { range: `${mod.last_synced_commit.slice(0, 7)}..${ref}`, files: byFile,
                    commits: git(mod.repo_root, 'log', '--oneline', '--no-merges', `${mod.last_synced_commit}..${ref}`, '--', ...paths).split('\n').filter(Boolean) };
    }
  }
  // Pages shared by the modules in this run (listed once)
  const pageModules = {};
  for (const key of keys) for (const it of report[key].items) for (const p of it.pages) (pageModules[p] ||= new Set()).add(key);
  const shared = Object.entries(pageModules).filter(([, ks]) => ks.size > 1).map(([p, ks]) => ({ page: p, modules: [...ks].sort() })).sort((a, b) => a.page.localeCompare(b.page));
  if (asJson) { console.log(JSON.stringify({ modules: report, shared_pages: keys.length > 1 ? shared : [], untracked_addons: untracked.map((a) => ({ addon: a, pages: [...cited[a]].sort() })) }, null, 2)); return; }
  for (const [key, r] of Object.entries(report)) {
    const behind = r.head && r.last_synced_commit && r.head !== r.last_synced_commit;
    console.log(`\n== ${r.title} (${key}) — code at ${r.ref} ${r.head ? r.head.slice(0, 7) : ''}; last synced ${r.last_synced_commit ? r.last_synced_commit.slice(0, 7) : 'never'}${behind ? '  ← code has moved on: run /docs-sync' : ''}`);
    console.log('   ' + Object.entries(r.counts).map(([k, v]) => `${k} ${v}`).join(' · '));
    for (const it of r.items.filter((x) => x.status === 'UNCOVERED')) {
      console.log(`   UNCOVERED  ${it.kind.padEnd(13)} ${it.label}  [${it.id}]  ${it.file}:${it.line}${it.suggest?.length ? `\n              maybe: ${it.suggest.join(', ')}` : ''}`);
    }
    for (const id of r.removed) console.log(`   REMOVED    ${id}  (in the manifest, gone from the code)`);
    if (r.watch.length) console.log(`   watching: ${r.watch.map((w) => (typeof w === 'string' ? w : w.addon)).join(', ')}`);
    for (const s of r.watch_suggestions || []) console.log(`   ${s.already ? 'WATCHED' : 'SUGGEST'}    watch ${s.addon}: ${s.why.join('; ')}${s.pages.length ? ` — ${s.pages.slice(0, 5).join(', ')}${s.pages.length > 5 ? ' …' : ''}` : ''}`);
    if (r.changes) {
      console.log(`   changes ${r.changes.range}: ${r.changes.commits.length} commit(s), ${r.changes.files.length} file(s)`);
      for (const c of r.changes.commits) console.log(`     ${c}`);
      for (const f of r.changes.files) console.log(`     ${f.owner.padEnd(7)} ${f.file}${f.pages.length ? `  → ${f.pages.join(', ')}` : ''}`);
    }
  }
  if (keys.length > 1) {
    const all = keys.flatMap((k) => report[k].items.filter((x) => x.status === 'UNCOVERED').map((x) => x.id));
    console.log(`\n== Combined (${keys.join(', ')}): ${new Set(all).size} uncovered · ${shared.length} page(s) shared between these modules`);
    for (const s of shared.slice(0, 40)) console.log(`   ${s.page}  [${s.modules.join(', ')}]`);
  }
  if (untracked.length) {
    console.log(`\n!! Addons cited in page sources but neither tracked nor watched (add to a module's "watch"):`);
    for (const a of untracked) console.log(`   ${a}: ${[...cited[a]].sort().join(', ')}`);
  }
}
if (process.argv[1] && import.meta.url === `file://${path.resolve(process.argv[1])}`) main();
