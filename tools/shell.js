/* Forecut tools: one shared frame for every tool page (header, tool list, workspace menu, results jump on phones). */
(function () {
  'use strict';
  var STAGES = [
    ['Plan the collection', [
      ['rangeboard', 'Collection Planner', 'Plan styles, sizes, quantities and drops'],
      ['trend-to-style', 'Trend to Style Brief', 'Turn a trend detail into a style brief']]],
    ['Colour and fabric', [
      ['swatchsmith', 'Colour Palette Builder', 'Season palettes and swatch sheets'],
      ['fabric-finder', 'Fabric Finder', 'Choose fabric by weight, stretch and drape'],
      ['textile-calculator', 'Textile Calculator', 'Yarn, GSM, weaving, knitting and costing'],
      ['textile-processing-studio', 'Textile Processing Studio', 'Dyeing, processing and colour blends']]],
    ['Pattern and fit', [
      ['pattern-maker', 'Pattern Maker', 'Draft and grade garment patterns · opens full window'],
      ['size-chart-builder', 'Size Chart Builder', 'Grade measurements across sizes']]],
    ['Sampling and tech pack', [
      ['decoration-cost-estimator', 'Embroidery & Print Cost', 'Decoration cost per piece'],
      ['tech-pack-builder', 'Tech Pack Builder', 'Supplier-ready tech packs']]],
    ['Costing and production', [
      ['pricefold', 'Price & Margin Calculator', 'Real margin after GST, fees and returns'],
      ['evenpoint', 'Break-even Calculator', 'Pieces you must sell to cover costs'],
      ['cutclock', 'Production Calendar', 'Deadlines worked back from launch']]],
    ['Labels, listing and export', [
      ['care-label-generator', 'Care Label Generator', 'Fibre content and care instructions'],
      ['product-description-writer', 'Product Description Writer', 'Listing titles, bullets and tags'],
      ['export-market-checker', 'Export Market Checker', 'Rules and dates by country']]]
  ];
  window.ForecutTools = STAGES;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function here() { var p = location.pathname.split('/').pop().replace(/\.html$/, ''); return p || 'index'; }

  function navHTML(cur) {
    return STAGES.map(function (st, i) {
      return '<div class="fx-group"><span class="fx-group-name"><b>0' + (i + 1) + '</b> ' + esc(st[0]) + '</span>' + st[1].map(function (t) {
        return '<a href="' + t[0] + '.html"' + (t[0] === 'pattern-maker' ? ' target="_blank" rel="noopener"' : '') + (t[0] === cur ? ' aria-current="page"' : '') + '><span>' + esc(t[1]) + '</span><small>' + esc(t[2]) + '</small></a>';
      }).join('') + '</div>';
    }).join('') + '<a class="fx-all" href="tools.html">All tools overview →</a>';
  }

  function init() {
    var cur = here(), nav = document.getElementById('fxNav');
    if (nav) nav.innerHTML = navHTML(cur);
    var tog = document.querySelector('.fx-side-toggle'), side = document.querySelector('.fx-side');
    if (tog && side) tog.addEventListener('click', function () { var open = side.classList.toggle('open'); tog.setAttribute('aria-expanded', open); });
    // workspace menu closes on outside click and Escape
    var ws = document.querySelector('.fx-ws');
    if (ws) {
      document.addEventListener('click', function (e) { if (ws.open && !ws.contains(e.target)) ws.open = false; });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ws.open) { ws.open = false; ws.querySelector('summary').focus(); } });
    }
    // phones and tablets: a pill that jumps to the live result
    function findRail() { var sel = document.body.getAttribute('data-rail'); return sel ? document.querySelector('.fx-app > ' + sel) : null; }
    var pill = document.createElement('button');
    pill.type = 'button'; pill.className = 'fx-jump'; pill.hidden = true; pill.textContent = 'See results ↓';
    document.body.appendChild(pill);
    pill.addEventListener('click', function () { var r = findRail(); if (r) r.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    var markRail = function () {
      var app = document.querySelector('.fx-app'); if (!app) return;
      var sel = document.body.getAttribute('data-rail');
      if (sel) { var el = app.querySelector(sel); if (el && !el.classList.contains('fx-rail')) el.classList.add('fx-rail'); }
    };
    var app = document.querySelector('.fx-app');
    if (app && window.MutationObserver) new MutationObserver(markRail).observe(app, { childList: true });
    markRail();
    function check() {
      var r = findRail(), narrow = window.innerWidth < 1100;
      if (!r || !narrow) { pill.hidden = true; return; }
      var b = r.getBoundingClientRect();
      pill.hidden = b.top < window.innerHeight * 0.85;
    }
    window.addEventListener('scroll', check, { passive: true }); window.addEventListener('resize', check); setTimeout(check, 600);
  }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
