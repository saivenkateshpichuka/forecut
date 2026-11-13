/* Forecut Pattern Maker: CAD-style editing on the drawing board.
   Edit mode: pick a piece, drag corner points (both meeting seams stretch) or curve points (smooth reshape), measure and walk seams, add notches.
   Edits apply to every size (same change on each graded piece) and flow into the PDF, DXF, AAMA, costing and tech pack. */
(function () {
  'use strict';
  var API = window.PMUI, PM = window.PM; if (!API || !PM) return;
  function $(s) { return document.querySelector(s); }
  var ON = false, TOOL = 'move', SELP = null, SELE = [], RAD = 8, drag = null, UNDO = [], REDO = [];
  var NS = 'http://www.w3.org/2000/svg';

  // stage button
  var anchor = $('#pm-markb'); if (!anchor) return;
  var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ib'; btn.id = 'pm-editb'; btn.setAttribute('aria-pressed', 'false'); btn.title = 'Edit the pattern: move points, reshape curves, walk seams, add notches';
  btn.innerHTML = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/></svg><span>Edit</span>';
  anchor.after(btn);
  // desktop: open the current garment in 3D Drape Studio
  var D3 = { tshirt: 'tshirt', top: 'top', tank: 'tank', hoodie: 'sweat', kurta: 'kurta', dress: 'dress', skirt: 'skirt', trousers: 'trousers', jeans: 'jeans', churidar: 'churidar', salwar: 'salwar', patiala: 'patiala', gharara: 'gharara', lehenga: 'lehenga', shirt: 'shirt', shirtdress: 'shirtdress', blouse: 'blouse', polo: 'polo', jacket: 'jacket', bandhgala: 'bandhgala', sherwani: 'sherwani', blazer: 'blazer', coat: 'coat', bomber: 'bomber', bodice: 'bodice', anarkali: 'anarkali', jumpsuit: 'jumpsuit' };
  if (window.matchMedia && matchMedia('(min-width: 1024px) and (pointer: fine)').matches) {
    var b3 = document.createElement('button'); b3.type = 'button'; b3.className = 'ib'; b3.id = 'pm-3db'; b3.title = 'See this garment sewn and draped in 3D (opens 3D Drape Studio)';
    b3.innerHTML = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg><span>3D</span>';
    btn.after(b3);
    b3.addEventListener('click', function () {
      var s = S(), st = D3[s.gid], o = s.o || {};
      if (st === 'skirt') st = { aline: 'aline', straight: 'pencil', circle: 'circle', gathered: 'gathered', panels: 'kalis' }[o.skirt] || '';
      if (st === 'dress' && o.dress === 'frock') st = 'frock'; if (st === 'top' && +o.peplum) st = 'peplum'; if (st === 'sweat' && +o.hood) st = 'hoodie';
      if (!st) { API.toast('3D view works for tops, T-shirts, sweatshirts, kurtas, shift dresses, shirts, blouses, polos, jackets, bandhgalas, sherwanis, blazers, coats, bombers, skirts, lehengas, trousers, jeans, churidar, salwar, patiala and gharara. Angrakhas are coming next.'); return; }
      var keep = {}; ['len', 'ease', 'neck', 'sleeve', 'slen', 'flare', 'slit', 'slen2', 'leg', 'pfit', 'tlen', 'mohri', 'fullness', 'ruch', 'gfull', 'panels', 'hemc', 'circle'].forEach(function (k) { if (o[k] !== undefined && o[k] !== '') keep[k] = o[k]; });
      var size = s.size && s.size !== 'custom' ? s.size : '', mm = '';
      if (!size && s.m) { var mk = {}; ['bust', 'waist', 'hip', 'shoulder', 'nape', 'bicep'].forEach(function (k) { if (+s.m[k] > 0) mk[k] = +s.m[k]; }); mm = '&m=' + encodeURIComponent(JSON.stringify(mk)); }
      window.open('3d-drape-studio.html?style=' + st + '&gender=' + encodeURIComponent(s.gender) + (size ? '&size=' + encodeURIComponent(size) : '') + '&o=' + encodeURIComponent(JSON.stringify(keep)) + mm, '_blank', 'noopener');
    });
  }
  var panel = document.createElement('div'); panel.id = 'pm-edpanel'; panel.hidden = true; panel.setAttribute('role', 'region'); panel.setAttribute('aria-label', 'Pattern editing');
  var view = $('#pm-view'); (view.parentNode || document.body).appendChild(panel);

  var TOOLS = [['move', 'Move points'], ['measure', 'Measure / walk seams'], ['notch', 'Notch'], ['len', 'Lengthen / shorten'], ['wid', 'Widen / narrow'], ['spread', 'Slash and spread'], ['pleat', 'Add pleat'], ['dart', 'Add dart'], ['drill', 'Drill hole']];
  var AMT = { len: 2, wid: 1, spread: 4, pleat: 3, dart: 2, dartL: 9 }, SPA = null;
  var HELP = { len: 'Click across the piece where it should get longer. A positive amount lengthens, a negative amount shortens. Everything below the line moves.',
    wid: 'Click where the piece should get wider. A positive amount adds width, a negative amount takes it out. Everything to the right of the line moves.',
    spread: 'Click the hinge point, then the point where the slash ends (usually on the hem). The piece opens by the amount at that end: use it for flare and fullness. A negative amount closes it (slash and overlap).',
    pleat: 'Click where the pleat goes. The piece widens by the pleat depth and the pleat lines are marked.', dart: 'Click on a seam where the dart should sit. It points into the piece.', drill: 'Click inside the piece to mark a drill hole (pocket corners, dart points).' };
  function S() { return API.S(); }
  function store() { var s = S(); s.edits = s.edits || {}; var k = API.key(); return (s.edits[k] = s.edits[k] || {}); }
  function snap() { UNDO.push(JSON.stringify(store())); if (UNDO.length > 100) UNDO.shift(); REDO = []; }
  function setStore(o) { S().edits[API.key()] = o; }
  function fabScale() { var f = S().fab || {}; return [1 / (1 - (+f.shw || 0) / 100), 1 / (1 - (+f.shl || 0) / 100)]; }
  function fmt(v) { return API.U(v) + ' ' + API.unit(); }

  btn.addEventListener('click', function () { ON = !ON; btn.setAttribute('aria-pressed', ON); panel.hidden = !ON; view.classList.toggle('pm-editing', ON); if (!ON) { SELP = null; SELE = []; } overlay(); renderPanel(); });

  /* geometry of what is on screen */
  function scene() { var L = API.last(); return L && L.r ? L : null; }
  function offsetOf(L, p) { var pc = (L.pcs || []).filter(function (x) { return x.id === p.id; })[0]; if (!pc) return null; var o = PM.outline(p); return [pc.seam[0][0] - o[0][0], pc.seam[0][1] - o[0][1]]; }
  function toCm(ev) { var sv = $('#pm-svg svg'); if (!sv) return null; var pt = sv.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; var m = sv.getScreenCTM(); if (!m) return null; var q = pt.matrixTransform(m.inverse()); return [q.x, q.y]; }
  function pxPerCm() { var sv = $('#pm-svg svg'), m = sv && sv.getScreenCTM(); return m ? m.a : 10; }
  function pip(pt, poly) { var c = false; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { var a = poly[i], b = poly[j]; if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1] || 1e-9) + a[0]) c = !c; } return c; }
  function segDist(p, a, b) { var vx = b[0] - a[0], vy = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / (vx * vx + vy * vy || 1))); return [Math.hypot(a[0] + vx * t - p[0], a[1] + vy * t - p[1]), t]; }
  function plen(p) { var s = 0; for (var i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; }
  function nearestEdge(p, off, q) { var best = null; p.edges.forEach(function (e, ei) { var acc = 0, tot = plen(e.p); for (var i = 1; i < e.p.length; i++) { var a = [e.p[i - 1][0] + off[0], e.p[i - 1][1] + off[1]], b = [e.p[i][0] + off[0], e.p[i][1] + off[1]], r = segDist(q, a, b), sl = Math.hypot(b[0] - a[0], b[1] - a[1]); if (!best || r[0] < best.d) best = { e: ei, d: r[0], t: tot ? (acc + sl * r[1]) / tot : 0 }; acc += sl; } }); return best; }
  function pieceById(L, id) { return L.r.pieces.filter(function (p) { return p.id === id; })[0]; }

  /* overlay: handles for the selected piece, highlighted edges */
  function el(tag, at) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); return e; }
  function overlay() {
    var sv = $('#pm-svg svg'); if (!sv) return; var old = sv.querySelector('#pm-ed'); if (old) old.remove(); if (!ON) return;
    var L = scene(); if (!L) return; var g = el('g', { id: 'pm-ed' }), k = 1 / pxPerCm();
    L.r.pieces.forEach(function (p) { var off = offsetOf(L, p); if (!off) return; if (p.id === SELP) g.appendChild(el('path', { d: 'M' + PM.outline(p).map(function (q) { return (q[0] + off[0]).toFixed(2) + ' ' + (q[1] + off[1]).toFixed(2); }).join('L') + 'Z', fill: 'rgba(47,111,214,.06)', stroke: '#2f6fd6', 'stroke-width': (2 * k).toFixed(3), 'pointer-events': 'none' })); });
    var P = SELP && pieceById(L, SELP), off = P && offsetOf(L, P);
    if (P && off) {
      SELE.forEach(function (ei, n) { var e = P.edges[ei]; if (!e) return; g.appendChild(el('path', { d: 'M' + e.p.map(function (q) { return (q[0] + off[0]).toFixed(2) + ' ' + (q[1] + off[1]).toFixed(2); }).join('L'), fill: 'none', stroke: n ? '#c4643f' : '#1aa36b', 'stroke-width': (4 * k).toFixed(3), 'stroke-linecap': 'round', 'pointer-events': 'none' })); });
      if (TOOL === 'move') P.edges.forEach(function (e, ei) {
        var c = e.p[0]; g.appendChild(el('rect', { x: (c[0] + off[0] - 5 * k).toFixed(3), y: (c[1] + off[1] - 5 * k).toFixed(3), width: (10 * k).toFixed(3), height: (10 * k).toFixed(3), fill: '#fff', stroke: '#2f6fd6', 'stroke-width': (1.6 * k).toFixed(3), 'data-h': 'c', 'data-e': ei, style: 'cursor:move' }));
        if (e.p.length > 3 && plen(e.p) > 4) [.25, .5, .75].forEach(function (t) { var q = PM.edgePoint(e.p, t); g.appendChild(el('circle', { cx: (q[0] + off[0]).toFixed(3), cy: (q[1] + off[1]).toFixed(3), r: (4.5 * k).toFixed(3), fill: '#2f6fd6', stroke: '#fff', 'stroke-width': (1.4 * k).toFixed(3), 'data-h': 's', 'data-e': ei, 'data-t': t, style: 'cursor:move' })); });
      });
      if (drag && drag.preview) g.appendChild(el('path', { d: 'M' + drag.preview.map(function (q) { return (q[0] + off[0]).toFixed(2) + ' ' + (q[1] + off[1]).toFixed(2); }).join('L') + 'Z', fill: 'none', stroke: '#c4643f', 'stroke-width': (2 * k).toFixed(3), 'stroke-dasharray': (6 * k) + ' ' + (4 * k), 'pointer-events': 'none' }));
    }
    sv.appendChild(g);
  }
  new MutationObserver(function () { if (ON && !document.querySelector('#pm-svg svg #pm-ed')) overlay(); }).observe($('#pm-svg'), { childList: true });

  /* pointer handling on the drawing */
  view.addEventListener('pointerdown', function (ev) {
    if (!ON || ev.button > 0) return;
    var L = scene(), q = toCm(ev); if (!L || !q) return;
    var h = ev.target.closest && ev.target.closest('[data-h]');
    if (h && SELP) { ev.stopPropagation(); ev.preventDefault(); drag = { k: h.getAttribute('data-h') === 'c' ? 'corner' : 'smooth', e: +h.getAttribute('data-e'), t: +(h.getAttribute('data-t') || 0), sx: q[0], sy: q[1] }; view.setPointerCapture(ev.pointerId); return; }
    var hit = null; L.r.pieces.forEach(function (p) { var off = offsetOf(L, p); if (!off) return; var poly = PM.outline(p).map(function (x) { return [x[0] + off[0], x[1] + off[1]]; }); if (pip(q, poly)) hit = p; });
    var tol = 8 / pxPerCm();
    if (['len', 'wid', 'pleat', 'drill', 'spread'].indexOf(TOOL) > -1) { // tools that act at a point of the piece
      var P2 = hit || (SELP && pieceById(L, SELP)); if (!P2) return; ev.stopPropagation(); var off2 = offsetOf(L, P2), pc2 = [q[0] - off2[0], q[1] - off2[1]], f2 = fabScale(); pc2 = [pc2[0] / f2[0], pc2[1] / f2[1]];
      if (SELP !== P2.id) { SELP = P2.id; SPA = null; }
      var op2 = null;
      if (TOOL === 'len') op2 = { k: 'len', y: +pc2[1].toFixed(2), d: AMT.len };
      if (TOOL === 'wid') op2 = { k: 'wid', x: +pc2[0].toFixed(2), d: AMT.wid };
      if (TOOL === 'pleat') op2 = { k: 'pleat', x: +pc2[0].toFixed(2), d: AMT.pleat };
      if (TOOL === 'drill') op2 = { k: 'drill', c: [+pc2[0].toFixed(2), +pc2[1].toFixed(2)] };
      if (TOOL === 'spread') { var o3 = PM.outline(P2), bi = 0, bd = 1e9; o3.forEach(function (x, i) { var d = Math.hypot(x[0] - pc2[0], x[1] - pc2[1]); if (d < bd) { bd = d; bi = i; } }); var pt = bd < 3 ? o3[bi] : pc2;
        if (!SPA) { SPA = [+pt[0].toFixed(2), +pt[1].toFixed(2)]; API.toast('Hinge set. Now click where the slash ends.'); renderPanel(); return; }
        op2 = { k: 'spread', a: SPA, b: [+pt[0].toFixed(2), +pt[1].toFixed(2)], d: AMT.spread, dir: 1 }; SPA = null; }
      if (op2) { snap(); var st2 = store(); (st2[P2.id] = st2[P2.id] || []).push(op2); API.draw(); API.toast({ len: 'Length changed', wid: 'Width changed', pleat: 'Pleat added', drill: 'Drill hole added', spread: 'Slashed and spread' }[TOOL]); }
      renderPanel(); return;
    }
    if (TOOL !== 'move') { // measure, notch or dart: nearest edge of the selected (or clicked) piece
      var P = (SELP && pieceById(L, SELP)) || hit; if (!P) return; var off = offsetOf(L, P), ne = nearestEdge(P, off, q); if (!ne || ne.d > Math.max(tol, 1.2)) { if (hit) { SELP = hit.id; SELE = []; overlay(); renderPanel(); } return; }
      ev.stopPropagation(); SELP = P.id;
      if (TOOL === 'notch') { snap(); var st = store(); (st[P.id] = st[P.id] || []).push({ k: 'notch', e: ne.e, t: +ne.t.toFixed(4) }); API.draw(); API.toast('Notch added'); renderPanel(); return; }
      if (TOOL === 'dart') { snap(); var std = store(); (std[P.id] = std[P.id] || []).push({ k: 'dart', e: ne.e, t: +ne.t.toFixed(4), w: AMT.dart, l: AMT.dartL }); API.draw(); API.toast('Dart added'); renderPanel(); return; }
      if (ev.shiftKey && SELE.length) SELE = [SELE[0], ne.e]; else SELE = [ne.e];
      overlay(); renderPanel(); return;
    }
    if (hit) { ev.stopPropagation(); SELP = hit.id; SELE = []; overlay(); renderPanel(); }
  }, true);
  view.addEventListener('pointermove', function (ev) {
    if (!drag) return; var q = toCm(ev); if (!q) return; var L = scene(), P = pieceById(L, SELP); if (!P) return;
    var f = fabScale(), op = { k: drag.k, e: drag.e, t: drag.t, dx: (q[0] - drag.sx) / f[0], dy: (q[1] - drag.sy) / f[1], r: RAD };
    if (ev.shiftKey) { if (Math.abs(op.dx) > Math.abs(op.dy)) op.dy = 0; else op.dx = 0; } // constrain to horizontal or vertical
    drag.op = op; var tmp = {}; tmp[P.id] = [op]; var pv = PM.applyEdits({ pieces: [P] }, tmp).pieces[0];
    drag.preview = PM.outline(pv).map(function (x) { return [x[0], x[1]]; }); overlay();
    var tip = $('#pm-edtip'); if (tip) tip.textContent = 'Moved ' + fmt(Math.hypot(op.dx, op.dy)) + (drag.k === 'smooth' ? ' · smoothing ' + fmt(RAD) : ' · corner');
  });
  function end() {
    if (!drag) return; var d = drag; drag = null;
    if (d.op && Math.hypot(d.op.dx, d.op.dy) > .02) { snap(); var st = store(); d.op.dx = +d.op.dx.toFixed(3); d.op.dy = +d.op.dy.toFixed(3); (st[SELP] = st[SELP] || []).push(d.op); API.draw(); }
    else overlay();
    renderPanel();
  }
  view.addEventListener('pointerup', end); view.addEventListener('pointercancel', end);

  /* panel */
  function renderPanel() {
    if (!ON) return; var L = scene(), P = SELP && L && pieceById(L, SELP), st = store(), n = Object.keys(st).reduce(function (a, k) { return a + (st[k] || []).length; }, 0);
    var h = '<div class="ed-head"><b>Edit pattern</b><button type="button" data-x="close" aria-label="Close editing">×</button></div>' +
      '<div class="ed-tools" role="radiogroup" aria-label="Edit tool">' + TOOLS.map(function (t) { return '<button type="button" role="radio" aria-checked="' + (TOOL === t[0]) + '" data-tool="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>';
    if (!P) h += '<p class="ed-hint">Click a pattern piece to select it.</p>';
    else {
      h += '<p class="ed-sel">' + (P.comp || P.id) + (st[P.id] && st[P.id].length ? ' · ' + st[P.id].length + ' edit' + (st[P.id].length > 1 ? 's' : '') : '') + '</p>';
      if (TOOL === 'move') h += '<p class="ed-hint">Drag a <b>square</b> to move a corner: both seams that meet there stretch with it. Drag a <b>dot</b> to reshape a curve smoothly. Hold Shift to move straight across or down.</p><label class="ed-rad">Curve smoothing ' + '<input type="range" min="2" max="30" step="1" value="' + RAD + '" data-rad> <span>' + fmt(RAD) + '</span></label><p id="pm-edtip" class="ed-tip"></p>';
      if (TOOL === 'measure') {
        h += '<p class="ed-hint">Click a seam to measure it. Shift-click a second seam to compare (seam walking).</p>';
        if (SELE.length) { var e1 = P.edges[SELE[0]], l1 = plen(e1.p); h += '<div class="ed-m"><span class="ed-k" style="background:#1aa36b"></span>Seam ' + (SELE[0] + 1) + ' (' + e1.t + '): <b>' + fmt(l1) + '</b></div>';
          if (SELE[1] != null) { var e2 = P.edges[SELE[1]], l2 = plen(e2.p); h += '<div class="ed-m"><span class="ed-k" style="background:#c4643f"></span>Seam ' + (SELE[1] + 1) + ' (' + e2.t + '): <b>' + fmt(l2) + '</b></div><div class="ed-diff">Difference <b>' + fmt(Math.abs(l1 - l2)) + '</b>' + (Math.abs(l1 - l2) <= .3 ? ' · walks evenly' : ' · ease or trim needed') + '</div>'; } }
        h += '<p class="ed-hint">To compare seams on two different pieces, use the Checks tab, which walks the main seams of every piece.</p>';
      }
      if (TOOL === 'notch') h += '<p class="ed-hint">Click on a seam line to place a notch there.</p>';
      if (HELP[TOOL]) {
        h += '<p class="ed-hint">' + HELP[TOOL] + '</p>';
        var num = function (k, lab) { return '<label class="ed-num">' + lab + ' <input type="number" step="any" data-amt="' + k + '" value="' + API.U(AMT[k]) + '"> ' + API.unit() + '</label>'; };
        if (TOOL === 'len') h += num('len', 'Amount'); if (TOOL === 'wid') h += num('wid', 'Amount'); if (TOOL === 'pleat') h += num('pleat', 'Pleat depth'); if (TOOL === 'spread') h += num('spread', 'Spread at the end') + (SPA ? '<p class="ed-tip">Hinge set at ' + fmt(SPA[0]) + ', ' + fmt(SPA[1]) + '. Click where the slash ends.</p>' : '');
        if (TOOL === 'dart') h += num('dart', 'Dart width') + num('dartL', 'Dart length');
      }
      if (TOOL === 'move') h += '<div class="ed-exact"><b>Move a corner exactly</b><label>Corner <select data-cn>' + P.edges.map(function (e, i) { var c = e.p[0]; return '<option value="' + i + '">' + (i + 1) + ' · at ' + fmt(c[0]) + ', ' + fmt(c[1]) + '</option>'; }).join('') + '</select></label><div class="ed-row"><label class="ed-num">Across <input type="number" step="any" data-dx value="0"></label><label class="ed-num">Down <input type="number" step="any" data-dy value="0"></label><button type="button" data-x="exact">Move</button></div></div>';
      h += '<div class="ed-row"><button type="button" data-x="resetp"' + (st[P.id] && st[P.id].length ? '' : ' disabled') + '>Reset this piece</button></div>';
    }
    h += '<div class="ed-row"><button type="button" data-x="undo"' + (UNDO.length ? '' : ' disabled') + '>Undo</button><button type="button" data-x="redo"' + (REDO.length ? '' : ' disabled') + '>Redo</button><button type="button" data-x="resetall"' + (n ? '' : ' disabled') + '>Reset all edits</button></div>' +
      '<p class="ed-note">Edits apply to every size and go into all downloads and the costing. The automatic checks still measure the original draft, so walk edited seams here before cutting.</p>';
    panel.innerHTML = h;
  }
  panel.addEventListener('change', function (e) { var k = e.target.getAttribute && e.target.getAttribute('data-amt'); if (k) { var v = API.cm ? API.cm(+e.target.value) : +e.target.value; if (isFinite(v)) AMT[k] = v; } });
  panel.addEventListener('input', function (e) { if (e.target.hasAttribute('data-rad')) { RAD = +e.target.value; var sp = e.target.nextElementSibling; if (sp) sp.textContent = fmt(RAD); } });
  panel.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.tool) { TOOL = b.dataset.tool; SELE = []; SPA = null; overlay(); renderPanel(); return; }
    var x = b.dataset.x;
    if (x === 'close') btn.click();
    if (x === 'undo' && UNDO.length) { REDO.push(JSON.stringify(store())); setStore(JSON.parse(UNDO.pop())); API.draw(); }
    if (x === 'redo' && REDO.length) { UNDO.push(JSON.stringify(store())); setStore(JSON.parse(REDO.pop())); API.draw(); }
    if (x === 'resetp' && SELP) { snap(); delete store()[SELP]; API.draw(); }
    if (x === 'exact' && SELP) { var cn = +panel.querySelector('[data-cn]').value, dxi = +panel.querySelector('[data-dx]').value || 0, dyi = +panel.querySelector('[data-dy]').value || 0, cv = API.cm || function (v) { return v; }; if (dxi || dyi) { snap(); var se = store(); (se[SELP] = se[SELP] || []).push({ k: 'corner', e: cn, t: 0, dx: +cv(dxi).toFixed(3), dy: +cv(dyi).toFixed(3) }); API.draw(); API.toast('Corner moved'); } }
    if (x === 'resetall') { if (confirm('Remove every edit on this pattern?')) { snap(); setStore({}); API.draw(); } }
    renderPanel();
  });
  document.addEventListener('keydown', function (e) {
    if (!ON || /input|select|textarea/i.test(e.target.tagName)) return;
    var mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); panel.querySelector('[data-x=' + (e.shiftKey ? 'redo' : 'undo') + ']').click(); }
    if (e.key === 'Escape') { SELP = null; SELE = []; overlay(); renderPanel(); }
  });
})();
