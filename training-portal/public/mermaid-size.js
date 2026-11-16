// Mermaid shrinks every diagram to the column width, which makes big state diagrams and swimlanes
// unreadable. Once a diagram is drawn, size it to 80% of its natural width (text stays ~13px),
// never narrower than the column; wider diagrams scroll sideways inside their box.
(() => {
  const SCALE = 0.8;
  const size = (svg) => {
    const natural = parseFloat(svg.getAttribute('width')) || svg.viewBox?.baseVal?.width;
    const pre = svg.parentElement; if (!pre) return;
    const cs = getComputedStyle(pre);
    const box = pre.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);   // content width
    if (!natural || !box) return;
    svg.style.width = Math.max(Math.min(natural, box), natural * SCALE) + 'px';
  };
  const run = () => document.querySelectorAll('pre.mermaid > svg').forEach(size);
  new MutationObserver(run).observe(document.documentElement, { subtree: true, childList: true });
  addEventListener('resize', run);
})();
