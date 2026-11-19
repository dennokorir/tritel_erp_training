// Renders src/illustrations/**/*.yaml into src/generated/illustrations/**/*.svg.
//
// Three kinds of picture, all drawn from the same tokens so they read the same in light and dark:
//   type: screen  – simplified wireframe of an Odoo or portal screen, built from the view XML,
//                   with numbered callouts (n: 1, 2 ...) that match the numbered steps in the text
//   type: calc    – "how it's calculated": inputs → steps → result, optional bars
//   type: matrix  – roles × actions permission grid
// Every picture must have `title` and `desc` (they become <title>/<desc> and the alt text) and
// `source` (the view or model file it was drawn from) so it can be traced back to the code.
import fs from 'node:fs';
import path from 'node:path';
import * as yaml from 'js-yaml';

const SRC = 'src/illustrations';
const OUT = 'src/generated/illustrations';
const W = 720;          // drawing width (scales to the column; scrolls sideways on phones)
const PAD = 16;
const CW = 7.1;         // average character width at 13px, for layout estimates
const CWS = 6.2;        // at 11.5px

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fit = (s, px, cw = CW) => { s = String(s ?? ''); const max = Math.max(3, Math.floor(px / cw)); return s.length > max ? s.slice(0, max - 1) + '…' : s; };
function wrap(s, px, cw = CW) {
  const max = Math.max(8, Math.floor(px / cw)); const out = []; let line = '';
  for (const word of String(s ?? '').split(/\s+/)) {
    if ((line + ' ' + word).trim().length > max) { if (line) out.push(line); line = word; } else line = (line + ' ' + word).trim();
  }
  if (line) out.push(line); return out.length ? out : [''];
}
const TONE = { good: 'var(--tp-ill-good)', warn: 'var(--tp-ill-warn)', bad: 'var(--tp-ill-bad)', accent: 'var(--tp-ill-accent)', muted: 'var(--tp-ill-muted)' };
const tone = (t) => TONE[t] || 'var(--tp-ill-text)';

class Canvas {
  constructor() { this.parts = []; this.callouts = []; }
  add(s) { this.parts.push(s); }
  rect(x, y, w, h, { fill = 'var(--tp-ill-panel)', stroke = 'var(--tp-ill-line)', r = 4, sw = 1, dash } = {}) {
    this.add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`);
  }
  text(x, y, s, { size = 13, fill = 'var(--tp-ill-text)', weight = 400, anchor = 'start' } = {}) {
    this.add(`<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`);
  }
  line(x1, y1, x2, y2, { stroke = 'var(--tp-ill-line)', sw = 1, dash } = {}) {
    this.add(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`);
  }
  // Numbered callout: drawn last so it sits above everything
  callout(n, x, y) { if (n !== undefined && n !== null) this.callouts.push([n, x, y]); }
  flushCallouts() {
    for (const [n, x, y] of this.callouts) {
      this.add(`<g class="tp-callout"><circle cx="${x}" cy="${y}" r="10" fill="var(--tp-ill-callout)" stroke="var(--tp-ill-bg)" stroke-width="2"/>` +
        `<text x="${x}" y="${y + 4}" font-size="11.5" font-weight="700" fill="var(--tp-ill-callout-text)" text-anchor="middle">${esc(n)}</text></g>`);
    }
  }
}

// ---------- screen ----------
function button(c, x, y, b) {
  const w = Math.max(56, String(b.label).length * CW + 22);
  c.rect(x, y, w, 26, b.primary ? { fill: 'var(--tp-ill-primary)', stroke: 'var(--tp-ill-primary)' } : { fill: 'var(--tp-ill-panel)' });
  c.text(x + w / 2, y + 17, b.label, { anchor: 'middle', weight: 600, fill: b.primary ? 'var(--tp-ill-primary-text)' : 'var(--tp-ill-text)' });
  c.callout(b.n, x + w - 2, y);
  return w;
}

function statusbar(c, xRight, y, s) {
  const widths = s.steps.map((t) => Math.max(54, String(t).length * CWS + 22));
  let x = xRight - widths.reduce((a, b) => a + b, 0);
  const x0 = x;
  s.steps.forEach((t, i) => {
    const on = t === s.current; const w = widths[i];
    c.add(`<path d="M${x} ${y} h${w - 8} l8 13 l-8 13 h${-(w - 8)} ${i ? 'l8 -13 z' : 'z'}" fill="${on ? 'var(--tp-ill-accent)' : 'var(--tp-ill-panel)'}" stroke="var(--tp-ill-line)"/>`);
    c.text(x + w / 2 + (i ? 3 : 0), y + 17, t, { size: 11.5, anchor: 'middle', weight: on ? 700 : 400, fill: on ? 'var(--tp-ill-accent-text)' : 'var(--tp-ill-muted)' });
    x += w;
  });
  c.callout(s.n, x0 - 4, y);
}

const BLOCKS = {
  buttons(c, y, b, X, IW) {
    let x = X;
    for (const bt of b.buttons || []) x += button(c, x, y, bt) + 8;
    if (b.status) statusbar(c, X + IW, y, b.status);
    return 26;
  },
  status(c, y, b, X, IW) { statusbar(c, X + IW, y, b.status); return 26; },
  title(c, y, b, X) {
    const t = typeof b.title === 'string' ? { text: b.title } : b.title;
    c.text(X, y + 20, t.text, { size: 19, weight: 700 });
    if (t.sub) c.text(X, y + 40, t.sub, { size: 12, fill: 'var(--tp-ill-muted)' });
    c.callout(t.n, X - 16, y + 14);
    return t.sub ? 46 : 28;
  },
  smart(c, y, b, X, IW) {
    const n = b.smart.length; const w = Math.min(150, (IW - (n - 1) * 8) / n); let x = X + IW - n * w - (n - 1) * 8;
    for (const s of b.smart) {
      c.rect(x, y, w, 40, {});
      c.text(x + 10, y + 17, fit(s.value, w - 20), { weight: 700, fill: tone(s.tone) });
      c.text(x + 10, y + 33, fit(s.label, w - 20, CWS), { size: 11.5, fill: 'var(--tp-ill-muted)' });
      c.callout(s.n, x + w - 2, y);
      x += w + 8;
    }
    return 40;
  },
  fields(c, y, b, X, IW) {
    let yy = y;
    for (const row of b.fields) {
      const cols = Array.isArray(row) ? row : [row]; const cw = cols.length > 1 ? (IW - 24) / 2 : IW;
      cols.forEach((f, i) => {
        const x = X + i * (cw + 24); const lw = Math.min(150, cw * 0.42);
        c.text(x, yy + 16, fit(f.label, lw - 8, CWS), { size: 11.5, weight: 600, fill: 'var(--tp-ill-muted)' });
        const vx = x + lw;
        if (f.input !== false) c.line(vx, yy + 22, x + cw, yy + 22, { stroke: f.readonly ? 'transparent' : 'var(--tp-ill-line)' });
        c.text(vx + 2, yy + 16, fit(f.value, cw - lw - 4), { fill: f.tone ? tone(f.tone) : 'var(--tp-ill-text)', weight: f.bold ? 700 : 400 });
        c.callout(f.n, x - 16, yy + 11);
      });
      yy += 30;
    }
    return yy - y;
  },
  tabs(c, y, b, X, IW) {
    let x = X;
    for (const t of b.tabs.items) {
      const w = String(t).length * CW + 24; const on = t === b.tabs.active;
      if (on) { c.rect(x, y, w, 30, { fill: 'var(--tp-ill-panel)', r: 3 }); c.add(`<rect x="${x + 1}" y="${y + 26}" width="${w - 2}" height="6" fill="var(--tp-ill-panel)"/>`); }
      c.text(x + 12, y + 20, t, { weight: on ? 700 : 400, fill: on ? 'var(--tp-ill-text)' : 'var(--tp-ill-muted)' });
      x += w + 2;
    }
    c.line(X, y + 30, X + IW, y + 30);
    c.callout(b.tabs.n, X - 16, y + 15);
    return 32;
  },
  table(c, y, b, X, IW) {
    const t = b.table; const cols = t.columns; const widths = t.widths || cols.map(() => 1);
    const tw = widths.reduce((a, v) => a + v, 0); const cx = []; let acc = X;
    widths.forEach((w) => { cx.push(acc); acc += (w / tw) * IW; }); cx.push(X + IW);
    c.rect(X, y, IW, 26, { fill: 'var(--tp-ill-bg)', r: 2 });
    cols.forEach((h, i) => c.text(cx[i] + 8, y + 17, fit(h, cx[i + 1] - cx[i] - 12, CWS), { size: 11.5, weight: 700, fill: 'var(--tp-ill-muted)' }));
    let yy = y + 26;
    (t.rows || []).forEach((r, ri) => {
      const cells = Array.isArray(r) ? r : r.cells; const meta = Array.isArray(r) ? {} : r;
      // A comma inside an unquoted YAML cell silently splits it into two: catch that here
      if (cells.length !== cols.length) throw new Error(`table row ${ri + 1} has ${cells.length} cells for ${cols.length} columns: ${JSON.stringify(cells).slice(0, 120)}`);
      if (ri === t.highlight || meta.highlight) c.add(`<rect x="${X}" y="${yy}" width="${IW}" height="28" fill="var(--tp-ill-accent)" opacity="0.14"/>`);
      cells.forEach((v, i) => {
        const cell = typeof v === 'object' && v !== null ? v : { text: v };
        if (cell.badge) {
          const bw = Math.min(String(cell.text).length * CWS + 16, cx[i + 1] - cx[i] - 12);
          c.rect(cx[i] + 8, yy + 6, bw, 17, { fill: 'none', stroke: tone(cell.tone), r: 8 });
          c.text(cx[i] + 8 + bw / 2, yy + 18.5, fit(cell.text, bw - 8, CWS), { size: 11, anchor: 'middle', fill: tone(cell.tone), weight: 600 });
        } else c.text(cx[i] + 8, yy + 18, fit(cell.text, cx[i + 1] - cx[i] - 12), { fill: cell.tone ? tone(cell.tone) : 'var(--tp-ill-text)', weight: cell.bold ? 700 : 400 });
      });
      c.line(X, yy + 28, X + IW, yy + 28, { stroke: 'var(--tp-ill-line)' });
      c.callout(meta.n, X - 16, yy + 14);
      yy += 28;
    });
    c.callout(t.n, X + IW - 4, y);
    return yy - y;
  },
  tiles(c, y, b, X, IW) {
    const n = b.tiles.length; const w = (IW - (n - 1) * 10) / n;
    b.tiles.forEach((t, i) => {
      const x = X + i * (w + 10);
      c.rect(x, y, w, 58, {});
      c.add(`<rect x="${x}" y="${y}" width="4" height="58" rx="2" fill="${t.tone ? tone(t.tone) : 'var(--tp-ill-accent)'}"/>`);
      c.text(x + 14, y + 22, fit(t.label, w - 22, CWS), { size: 11.5, fill: 'var(--tp-ill-muted)', weight: 600 });
      c.text(x + 14, y + 46, fit(t.value, w - 22, 11), { size: 20, weight: 700, fill: t.tone ? tone(t.tone) : 'var(--tp-ill-text)' });
      c.callout(t.n, x + w - 2, y);
    });
    return 58;
  },
  search(c, y, b, X, IW) {
    const s = b.search;
    c.rect(X, y, IW, 30, { r: 4 });
    let x = X + 8;
    for (const f of s.facets || []) {
      const w = String(f).length * CWS + 26;
      c.rect(x, y + 6, w, 18, { fill: 'var(--tp-ill-accent)', stroke: 'none', r: 3 });
      c.text(x + 8, y + 19, f + ' ×', { size: 11, fill: 'var(--tp-ill-accent-text)', weight: 600 });
      x += w + 6;
    }
    c.text(x + 4, y + 20, s.placeholder || 'Search…', { fill: 'var(--tp-ill-muted)' });
    c.callout(s.n, X + IW - 4, y);
    if (s.filters) {
      let fx = X; const fy = y + 38;
      for (const f of s.filters) { const w = button(c, fx, fy, typeof f === 'string' ? { label: f } : f); fx += w + 8; }
      return 64;
    }
    return 30;
  },
  kanban(c, y, b, X, IW) {
    const cols = b.kanban; const n = cols.length; const w = (IW - (n - 1) * 10) / n; let maxH = 0;
    cols.forEach((col, i) => {
      const x = X + i * (w + 10);
      c.text(x + 4, y + 16, fit(col.title + (col.count !== undefined ? `  (${col.count})` : ''), w - 8), { weight: 700 });
      c.callout(col.n, x + w - 6, y + 4);
      let yy = y + 26;
      for (const card of col.cards || []) {
        const lines = card.lines || []; const h = 30 + lines.length * 17 + (card.tag ? 22 : 0);
        c.rect(x, yy, w, h, {});
        if (card.tone) c.add(`<rect x="${x}" y="${yy}" width="4" height="${h}" rx="2" fill="${tone(card.tone)}"/>`);
        c.text(x + 12, yy + 20, fit(card.title, w - 24), { weight: 600 });
        lines.forEach((l, li) => c.text(x + 12, yy + 38 + li * 17, fit(l, w - 24, CWS), { size: 11.5, fill: 'var(--tp-ill-muted)' }));
        if (card.tag) {
          const tw = Math.min(String(card.tag).length * CWS + 16, w - 24);
          c.rect(x + 12, yy + h - 24, tw, 17, { fill: 'none', stroke: tone(card.tagTone || 'accent'), r: 8 });
          c.text(x + 12 + tw / 2, yy + h - 11.5, fit(card.tag, tw - 8, CWS), { size: 11, anchor: 'middle', fill: tone(card.tagTone || 'accent'), weight: 600 });
        }
        c.callout(card.n, x + w - 4, yy);
        yy += h + 8;
      }
      maxH = Math.max(maxH, yy - y);
    });
    return maxH - 8;
  },
  bars(c, y, b, X, IW) {
    const lw = 190; let yy = y;
    for (const bar of b.bars) {
      const max = bar.max ?? 100; const frac = Math.max(0, Math.min(1, bar.value / max)); const bw = IW - lw - 70;
      c.text(X, yy + 15, fit(bar.label, lw - 10), {});
      c.rect(X + lw, yy + 4, bw, 14, { fill: 'var(--tp-ill-bg)', r: 7 });
      if (frac > 0) c.rect(X + lw, yy + 4, Math.max(14, bw * frac), 14, { fill: tone(bar.tone || 'accent'), stroke: 'none', r: 7 });
      if (bar.mark !== undefined) { const mx = X + lw + bw * Math.min(1, bar.mark / max); c.line(mx, yy, mx, yy + 22, { stroke: 'var(--tp-ill-text)', sw: 2 }); }
      c.text(X + IW, yy + 15, bar.display ?? `${bar.value}${bar.unit ?? '%'}`, { anchor: 'end', weight: 700 });
      c.callout(bar.n, X - 16, yy + 11);
      yy += 28;
    }
    return yy - y - 6;
  },
  note(c, y, b, X, IW) {
    const nb = typeof b.note === 'string' ? { text: b.note } : b.note; const lines = wrap(nb.text, IW - 30);
    const h = 14 + lines.length * 18;
    c.rect(X, y, IW, h, { fill: 'var(--tp-ill-bg)', stroke: tone(nb.tone || 'accent'), r: 4 });
    lines.forEach((l, i) => c.text(X + 14, y + 22 + i * 18, l, { size: 12.5 }));
    c.callout(nb.n, X + IW - 4, y);
    return h;
  },
  text(c, y, b, X, IW) {
    const lines = wrap(b.text, IW); lines.forEach((l, i) => c.text(X, y + 15 + i * 18, l, { fill: 'var(--tp-ill-muted)' }));
    return lines.length * 18;
  },
  heading(c, y, b, X) { c.text(X, y + 16, b.heading, { size: 14, weight: 700 }); c.callout(b.n, X - 16, y + 11); return 22; },
  divider(c, y, b, X, IW) { c.line(X, y + 6, X + IW, y + 6); return 12; },
  dialog(c, y, b, X, IW) {
    // A pop-up window drawn inset, over a dimmed band
    const d = b.dialog; const inner = new Canvas(); const DX = X + 40; const DW = IW - 80;
    let h = 44;
    for (const blk of d.blocks || []) h += drawBlock(inner, y + h, blk, DX + 16, DW - 32) + 12;
    h += 4;
    c.add(`<rect x="${X - PAD}" y="${y - 6}" width="${W}" height="${h + 12}" fill="var(--tp-ill-text)" opacity="0.08"/>`);
    c.rect(DX, y, DW, h, { r: 6, sw: 1.5 });
    c.add(`<rect x="${DX}" y="${y}" width="${DW}" height="36" rx="6" fill="var(--tp-ill-header)"/><rect x="${DX}" y="${y + 30}" width="${DW}" height="6" fill="var(--tp-ill-header)"/>`);
    c.text(DX + 16, y + 23, d.title, { weight: 700, fill: 'var(--tp-ill-header-text)' });
    c.callout(d.n, DX + DW - 4, y);
    c.parts.push(...inner.parts); c.callouts.push(...inner.callouts);
    return h;
  },
  columns(c, y, b, X, IW) {
    // Side-by-side panels, each a list of blocks
    const n = b.columns.length; const gap = 16; const cw = (IW - (n - 1) * gap) / n; let maxH = 0;
    b.columns.forEach((col, i) => {
      const cx = X + i * (cw + gap); let h = 0;
      if (col.panel) { /* outline drawn after we know the height */ }
      const inner = new Canvas();
      for (const blk of col.blocks || []) h += drawBlock(inner, y + h + (col.panel ? 12 : 0), blk, cx + (col.panel ? 12 : 0), cw - (col.panel ? 24 : 0)) + 12;
      h -= 12; if (col.panel) { h += 24; c.rect(cx, y, cw, h, {}); }
      c.parts.push(...inner.parts); c.callouts.push(...inner.callouts);
      maxH = Math.max(maxH, h);
    });
    return maxH;
  },
};

function drawBlock(c, y, blk, X, IW) {
  const kind = Object.keys(BLOCKS).find((k) => k in blk);
  if (!kind) throw new Error(`Unknown block: ${JSON.stringify(blk).slice(0, 80)}`);
  return BLOCKS[kind](c, y, blk, X, IW);
}

function renderScreen(spec) {
  const c = new Canvas(); const X = PAD + 14; const IW = W - 2 * X;
  const f = spec.frame || {};
  let y = 0;
  // App bar (navy), like Odoo's top bar or the portal header
  c.add(`<rect x="0" y="0" width="${W}" height="40" fill="var(--tp-ill-header)"/>`);
  // Optional app-switcher grid (Odoo's top-left icon); callout with grid: <n>
  let ax = PAD;
  if (f.grid !== undefined) {
    for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) c.add(`<rect x="${PAD + q * 6}" y="${13 + r * 6}" width="4" height="4" rx="1" fill="var(--tp-ill-header-text)"/>`);
    if (f.grid !== true) c.callout(f.grid, PAD + 24, 12);
    ax = PAD + 34;
  }
  c.text(ax, 25, f.app || '', { weight: 700, fill: 'var(--tp-ill-header-text)' });
  let mx = ax + String(f.app || '').length * 8 + 26;
  // Long menu bars (six top menus) shrink to fit the drawing width instead of running off the edge
  const items = (f.menu || []).map((m) => (typeof m === 'string' ? { label: m } : m));
  const natural = items.reduce((t, it) => t + it.label.length * 7 + 22, 0) - 22 + (items.some((it) => it.n) ? 18 : 0);
  const k = Math.min(1, (W - PAD - mx) / Math.max(natural, 1));
  for (const item of items) {
    const lw = item.label.length * 7 * k;
    c.text(mx, 25, item.label, { size: 12.5 * k, fill: 'var(--tp-ill-header-text)', weight: item.active ? 700 : 400 });
    if (item.active) c.line(mx, 33, mx + lw, 33, { stroke: 'var(--tp-ill-accent)', sw: 2 });
    c.callout(item.n, mx + lw + 6, 12);
    mx += lw + 22 * k;
  }
  y = 40;
  if (f.breadcrumb) {
    c.add(`<rect x="0" y="${y}" width="${W}" height="34" fill="var(--tp-ill-bg)"/>`);
    let bx = PAD; f.breadcrumb.forEach((b, i) => {
      const last = i === f.breadcrumb.length - 1;
      c.text(bx, y + 22, b, { size: 13, fill: last ? 'var(--tp-ill-text)' : 'var(--tp-ill-accent)', weight: last ? 700 : 400 });
      bx += String(b).length * CW + 6;
      if (!last) { c.text(bx, y + 22, '/', { fill: 'var(--tp-ill-muted)' }); bx += 14; }
    });
    c.callout(f.n, W - PAD - 6, y + 17);
    y += 34;
  }
  c.line(0, y, W, y);
  y += 16;
  for (const blk of spec.blocks || []) y += drawBlock(c, y, blk, X, IW) + 14;
  y += 4;
  return { c, h: y };
}

// ---------- calc ----------
function renderCalc(spec) {
  const c = new Canvas(); const X = PAD + 8; const IW = W - 2 * X; let y = PAD;
  if (spec.heading) { c.text(X, y + 16, spec.heading, { size: 15, weight: 700 }); y += 30; }
  const arrow = () => { c.add(`<path d="M${W / 2} ${y + 2} v14 m-6 -6 l6 6 l6 -6" fill="none" stroke="var(--tp-ill-muted)" stroke-width="2"/>`); y += 22; };
  if (spec.inputs) {
    const n = spec.inputs.length; const w = (IW - (n - 1) * 10) / n;
    spec.inputs.forEach((inp, i) => {
      const x = X + i * (w + 10); c.rect(x, y, w, 56, {});
      c.text(x + w / 2, y + 22, fit(inp.label, w - 12, CWS), { size: 11.5, anchor: 'middle', fill: 'var(--tp-ill-muted)', weight: 600 });
      c.text(x + w / 2, y + 44, fit(inp.value, w - 12, 9.5), { size: 17, anchor: 'middle', weight: 700 });
      c.callout(inp.n, x + w - 2, y);
    });
    y += 56; arrow();
  }
  for (const s of spec.steps || []) {
    const lines = wrap(s.label, IW - 260, CWS);
    const h = Math.max(40, 16 + lines.length * 16);
    c.rect(X, y, IW, h, { fill: 'var(--tp-ill-bg)' });
    lines.forEach((l, i) => c.text(X + 14, y + 24 + i * 16 - (lines.length - 1) * 8, l, { size: 12.5 }));
    c.text(X + IW - 14, y + h / 2 + 5, s.value, { anchor: 'end', weight: 700, fill: s.tone ? tone(s.tone) : 'var(--tp-ill-text)' });
    c.callout(s.n, X - 4, y + 4);
    y += h; arrow();
  }
  if (spec.result) {
    const r = spec.result; c.rect(X, y, IW, 52, { stroke: tone(r.tone || 'accent'), sw: 2 });
    c.text(X + 16, y + 31, r.label, { size: 14, weight: 700 });
    c.text(X + IW - 16, y + 33, r.value, { size: 20, anchor: 'end', weight: 700, fill: tone(r.tone || 'accent') });
    c.callout(r.n, X - 4, y + 4);
    y += 52;
  }
  if (spec.bars) { y += 18; y += BLOCKS.bars(c, y, { bars: spec.bars }, X, IW) + 6; }
  if (spec.note) { y += 14; y += BLOCKS.note(c, y, { note: spec.note }, X, IW); }
  return { c, h: y + PAD };
}

// ---------- matrix ----------
function renderMatrix(spec) {
  const c = new Canvas(); const X = PAD; const cols = spec.columns; const lw = spec.labelWidth ?? 250;
  const cw = (W - 2 * X - lw) / cols.length; let y = PAD;
  // Column headings, wrapped onto up to 3 lines
  const heads = cols.map((h) => wrap(h, cw - 6, CWS).slice(0, 3)); const hh = Math.max(...heads.map((l) => l.length)) * 14 + 10;
  heads.forEach((lines, i) => lines.forEach((l, li) =>
    c.text(X + lw + i * cw + cw / 2, y + 14 + li * 14, l, { size: 11.5, anchor: 'middle', weight: 700, fill: 'var(--tp-ill-muted)' })));
  y += hh; c.line(X, y, W - X, y);
  const SYMS = {
    y: (x, yy) => c.add(`<circle cx="${x}" cy="${yy}" r="8" fill="var(--tp-ill-good)"/><path d="M${x - 4} ${yy} l3 3 l5 -6" fill="none" stroke="var(--tp-ill-bg)" stroke-width="2"/>`),
    p: (x, yy) => c.add(`<circle cx="${x}" cy="${yy}" r="7.5" fill="none" stroke="var(--tp-ill-warn)" stroke-width="2"/><path d="M${x} ${yy - 7.5} a7.5 7.5 0 0 1 0 15 z" fill="var(--tp-ill-warn)"/>`),
    n: (x, yy) => c.line(x - 6, yy, x + 6, yy, { stroke: 'var(--tp-ill-muted)', sw: 2 }),
  };
  for (const row of spec.rows) {
    if (row.group) { y += 6; c.text(X, y + 16, row.group, { size: 12, weight: 700, fill: 'var(--tp-ill-accent)' }); y += 24; continue; }
    const lines = wrap(row.action, lw - 12, CWS).slice(0, 2); const h = Math.max(30, lines.length * 15 + 12);
    lines.forEach((l, i) => c.text(X, y + 19 + i * 15 - (lines.length - 1) * 4, l, { size: 12.5 }));
    row.cells.forEach((v, i) => (SYMS[v] || SYMS.n)(X + lw + i * cw + cw / 2, y + h / 2));
    c.line(X, y + h, W - X, y + h, { stroke: 'var(--tp-ill-line)', dash: '2 3' });
    y += h;
  }
  // Legend
  y += 14; let lx = X;
  const legend = { y: 'Yes', p: spec.legend?.p || 'Partly (see notes)', n: 'No', ...(spec.legend || {}) };
  for (const k of ['y', 'p', 'n']) { SYMS[k](lx + 8, y + 8); c.text(lx + 22, y + 12, legend[k], { size: 11.5, fill: 'var(--tp-ill-muted)' }); lx += legend[k].length * CWS + 50; }
  return { c, h: y + 28 };
}

const RENDER = { screen: renderScreen, calc: renderCalc, matrix: renderMatrix };

export function renderOne(file) {
  const spec = yaml.load(fs.readFileSync(file, 'utf8'));
  for (const k of ['type', 'title', 'desc', 'source']) if (!spec[k]) throw new Error(`${file}: missing "${k}"`);
  const fn = RENDER[spec.type]; if (!fn) throw new Error(`${file}: unknown type "${spec.type}"`);
  const { c, h } = fn(spec); c.flushCallouts();
  const id = path.relative(SRC, file).replace(/\.ya?ml$/, '').replace(/[^a-z0-9]+/gi, '-');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${Math.ceil(h)}" role="img" aria-labelledby="${id}-t ${id}-d" font-family="Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">` +
    `<title id="${id}-t">${esc(spec.title)}</title><desc id="${id}-d">${esc(spec.desc)}</desc>` +
    `<rect width="${W}" height="${Math.ceil(h)}" fill="var(--tp-ill-bg)"/>${c.parts.join('')}</svg>\n`;
}

export function renderAll() {
  const files = [];
  const walk = (d) => { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : /\.ya?ml$/.test(e.name) && files.push(p); } };
  walk(SRC);
  fs.rmSync(OUT, { recursive: true, force: true });
  for (const f of files) {
    const out = path.join(OUT, path.relative(SRC, f).replace(/\.ya?ml$/, '.svg'));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, renderOne(f));
  }
  return files.length;
}

// Check-only: node scripts/render-illustrations.mjs <file.yaml> [...]  renders in memory and reports problems
if (process.argv[1] && import.meta.url === `file://${path.resolve(process.argv[1])}`) {
  let bad = 0;
  for (const f of process.argv.slice(2)) {
    try { const svg = renderOne(f); console.log(`ok   ${f} (${svg.length} bytes)`); }
    catch (e) { bad++; console.log(`FAIL ${f}: ${e.message}`); }
  }
  process.exit(bad ? 1 : 0);
}
