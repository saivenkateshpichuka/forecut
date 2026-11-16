/* Forecut tools: one shared frame for every tool page (header, tool list, workspace menu, results jump on phones). */
(function () {
  'use strict';
  var STAGES = [
    ['Plan the collection', [
      ['rangeboard', 'Collection Planner', 'Plan styles, sizes, quantities and drops'],
      ['trend-to-style', 'Trend to Style Brief', 'Boards and style briefs'],
      ['style-tracker', 'Style Tracker', 'Status, milestones, samples and approvals']]],
    ['Colour and fabric', [
      ['swatchsmith', 'Colour Palette Builder', 'Season palettes and swatch sheets'],
      ['textile-calculator', 'Textile Calculator', 'Yarn, GSM, weaving, knitting and costing'],
      ['textile-processing-studio', 'Textile Processing Studio', 'Dyeing, processing and colour blends'],
      ['materials-library', 'Fabric & Trims Library', 'Fabrics and trims with tests, vendors and substitutes']]],
    ['Pattern and fit', [
      ['pattern-maker', 'Garment Studio', 'Patterns, grading and 3D fitting · opens full window'],
      ['size-chart-builder', 'Size Chart Builder', 'Grade measurements across sizes']]],
    ['Sampling and tech pack', [
      ['decoration-cost-estimator', 'Embroidery & Print Cost', 'Decoration cost per piece'],
      ['tech-pack-builder', 'Tech Pack Builder', 'Supplier-ready tech packs'],
      ['fit-qc-studio', 'Fit & QC Studio', 'Fit sessions, measurements, issues and AQL']]],
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
        return '<a href="' + t[0] + '"' + (t[0] === 'pattern-maker' ? ' target="_blank" rel="noopener"' : '') + (t[0] === cur ? ' aria-current="page"' : '') + '><span>' + esc(t[1]) + '</span><small>' + esc(t[2]) + '</small></a>';
      }).join('') + '</div>';
    }).join('') + '<a class="fx-all" href="tools/">All tools overview →</a>';
  }

  /* ---------- Stage 10: breadcrumb and save state, command palette, simple view, friendly errors ---------- */
  function J2(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
  function toolName(slug) { var n = ''; STAGES.forEach(function (st) { st[1].forEach(function (t) { if (t[0] === slug) n = t[1]; }); }); return n; }
  function crumb() {
    var title = document.querySelector('.fx-title'); if (!title || document.querySelector('.fx-crumb')) return;
    var el = document.createElement('nav'); el.className = 'fx-crumb no-print'; el.setAttribute('aria-label', 'Where you are'); title.parentNode.insertBefore(el, title); paint();
    function paint() {
      var col = (document.getElementById('collectionName') || {}).value || (J2('fc-collection-workspace-v1', {}) || {}).name || 'My collection';
      var F = window.ForecutStyle, s = F && F.active && F.active(), R = window.ForecutRev, c = R && R.current && R.current();
      var last = J2('fc-last-backup', null), days = last ? Math.floor((Date.now() - Date.parse(last)) / 864e5) : null;
      var bk = days == null ? '<a href="account#files" class="fx-bk warn">No backup yet</a>' : days > 14 ? '<a href="account#files" class="fx-bk warn">Last backup ' + days + ' days ago</a>' : '<a href="account#files" class="fx-bk">Backed up ' + (days ? days + ' day' + (days > 1 ? 's' : '') + ' ago' : 'today') + '</a>';
      el.innerHTML = '<ol><li><a href="rangeboard">' + esc(col) + '</a></li>' + (s ? '<li><a href="style-tracker">' + esc(s.id) + ' · ' + esc(s.name) + '</a></li><li>Rev ' + (s.rev || 1) + (c ? ' · ' + esc(c.status) : '') + '</li>' : '<li><span class="fx-dim">No style selected</span></li>') + '<li aria-current="page">' + esc(toolName(here()) || document.title.split('|')[0].trim()) + '</li></ol><span class="fx-save"><span aria-hidden="true">●</span> Saved in this browser · ' + bk + '<button type="button" class="fx-k" data-fxk title="Search tools and actions">Ctrl K</button></span>';
    }
    setTimeout(paint, 900);
  }
  var ACTIONS = [['New style', function () { var F = window.ForecutStyle; if (F && F.dialog) F.dialog(null); else location.href = 'account#styles'; }], ['Revisions and sign-off', function () { if (window.ForecutRev) ForecutRev.open(); else alert('Choose a style first.'); }], ['Print or save this tool as PDF', function () { var p = document.getElementById('print'); if (p) p.click(); else window.print(); }], ['Back up all my work', function () { location.href = 'account#files'; }], ['My styles', function () { location.href = 'account#styles'; }], ['Style tracker', function () { location.href = 'style-tracker'; }], ['Toggle simple view', function () { setSimple(!document.body.classList.contains('fx-simple')); }], ['Keyboard shortcuts', function () { alert('Ctrl/⌘ K: search tools and actions\n/ in the Textile Calculator: search calculators\nEsc: close dialogs and menus\nGarment Studio: hover a tool for its shortcut'); }]];
  function palette() {
    var old = document.querySelector('.fx-pal'); if (old) { old.remove(); return; }
    var items = [], F = window.ForecutStyle; STAGES.forEach(function (st) { st[1].forEach(function (t) { items.push({ t: t[1], s: st[0] + ' · ' + t[2], go: t[0] }); }); });
    ACTIONS.forEach(function (a) { items.push({ t: a[0], s: 'Action', fn: a[1] }); });
    if (F && F.list) F.list().slice(0, 40).forEach(function (s) { items.push({ t: s.id + ' · ' + s.name, s: 'Switch to this style', fn: function () { F.setActive(s.id); } }); });
    var w = document.createElement('div'); w.className = 'fx-pal'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); w.setAttribute('aria-label', 'Search tools and actions');
    w.innerHTML = '<div><input type="search" placeholder="Search tools, actions and styles…" aria-label="Search" role="combobox" aria-expanded="true" aria-controls="fxPalL"><ul id="fxPalL" role="listbox"></ul><p>↑ ↓ to move · Enter to open · Esc to close</p></div>';
    document.body.appendChild(w); var inp = w.querySelector('input'), ul = w.querySelector('ul'), on = 0, M = [];
    function draw() { var q = inp.value.toLowerCase().trim(); M = items.filter(function (i) { return !q || (i.t + ' ' + i.s).toLowerCase().indexOf(q) > -1; }).slice(0, 12); on = Math.min(on, Math.max(0, M.length - 1)); ul.innerHTML = M.map(function (i, k) { return '<li role="option" id="fxp' + k + '" aria-selected="' + (k === on) + '" data-k="' + k + '"><b>' + esc(i.t) + '</b><small>' + esc(i.s) + '</small></li>'; }).join('') || '<li class="none">Nothing found</li>'; inp.setAttribute('aria-activedescendant', 'fxp' + on); }
    function run(k) { var i = M[k]; if (!i) return; w.remove(); if (i.go) location.href = i.go; else i.fn(); }
    inp.addEventListener('input', function () { on = 0; draw(); });
    inp.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown') { on = Math.min(M.length - 1, on + 1); draw(); e.preventDefault(); } else if (e.key === 'ArrowUp') { on = Math.max(0, on - 1); draw(); e.preventDefault(); } else if (e.key === 'Enter') { run(on); } else if (e.key === 'Escape') w.remove(); });
    ul.addEventListener('click', function (e) { var li = e.target.closest('[data-k]'); if (li) run(+li.dataset.k); });
    w.addEventListener('click', function (e) { if (e.target === w) w.remove(); });
    draw(); inp.focus();
  }
  // simple view: hides advanced sections, never changes any calculation
  var ADV = { 'tech-pack-builder': ['Quality checkpoints', 'Saved revision snapshots'], 'size-chart-builder': ['Grading checks', 'Pattern check'], rangeboard: ['Target vs actual cost', 'Start with a category mix'], cutclock: ['Key dates around this schedule', 'Tracking'], 'materials-library': ['Approved substitutes', 'Change history'], 'export-market-checker': [], pricefold: ['Pricing history'], 'style-tracker': [] };
  function markAdv() { var L = ADV[here()] || []; if (!L.length) return; document.querySelectorAll('.fx-app section.panel, .fx-app .panel').forEach(function (p) { var h = p.querySelector('h2'); if (h && L.some(function (t) { return h.textContent.trim().indexOf(t) === 0; })) p.classList.add('fx-adv'); }); }
  function setSimple(on) { document.body.classList.toggle('fx-simple', on); try { localStorage.setItem('fc-simple', on ? '1' : '0'); } catch (e) { } var b = document.querySelector('[data-fx-simple]'); if (b) b.setAttribute('aria-pressed', on); markAdv(); }
  function extras() {
    crumb();
    document.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); palette(); } });
    document.addEventListener('click', function (e) { if (e.target.closest('[data-fxk]')) palette(); });
    var pop = document.querySelector('.fx-ws:not(.fx-app-menu) .fx-ws-pop'); if (pop && (ADV[here()] || []).length) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('data-fx-simple', ''); b.innerHTML = 'Simple view<small>Hide advanced sections. Calculations stay the same.</small>'; b.addEventListener('click', function () { setSimple(!document.body.classList.contains('fx-simple')); }); pop.insertBefore(b, pop.firstChild); }
    var app = document.querySelector('.fx-app'); if (app && window.MutationObserver) new MutationObserver(function () { if (document.body.classList.contains('fx-simple')) markAdv(); }).observe(app, { childList: true, subtree: false });
    try { if (localStorage.getItem('fc-simple') === '1') setSimple(true); } catch (e) { }
    // a plain message instead of a silent failure
    var shown = 0; window.addEventListener('error', function (ev) { if (shown++ > 2 || !ev.message || /ResizeObserver|Script error/.test(ev.message)) return; var n = document.createElement('div'); n.className = 'fx-err'; n.setAttribute('role', 'alert'); n.innerHTML = '<b>Something went wrong on this page.</b> Your saved work is safe in this browser. Reload the page; if it happens again, send us the steps at <a href="mailto:hello@forecut.in">hello@forecut.in</a>. <button type="button" aria-label="Dismiss">×</button>'; n.querySelector('button').onclick = function () { n.remove(); }; document.body.appendChild(n); setTimeout(function () { if (n.parentNode) n.remove(); }, 15000); });
    document.addEventListener('click', function (e) { if (e.target.closest('#backup')) try { localStorage.setItem('fc-last-backup', new Date().toISOString()); } catch (x) { } }, true);
  }
  function init() {
    var cur = here(), nav = document.getElementById('fxNav');
    try { var R = JSON.parse(localStorage.getItem('fc-recent-tools') || '[]').filter(function (r) { return r.slug !== cur; }); R.unshift({ slug: cur, at: Date.now() }); localStorage.setItem('fc-recent-tools', JSON.stringify(R.slice(0, 15))); } catch (e) { }
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
    try { extras(); } catch (e) { }
  }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
