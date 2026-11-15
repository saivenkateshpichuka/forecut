/* Forecut Garment Studio: marker, yield and consumption (Stage 5).
   FCMarker.plan(C, P, cfg, nest) lays the graded pieces of a size ratio on the fabric and returns the marker, its efficiency,
   consumption per garment and per size, the lay totals and pass/fail checks. nest is PMC.marker (skyline nesting, grain along the length).
   Pieces are turned so their grainline runs along the fabric length, grown for shrinkage, padded by the cutting gap, and laid
   with 180° turns only when the fabric has no nap. Works in the browser (window.FCMarker) and in Node for tests. */
(function (root) {
  'use strict';
  var M = {};
  M.DEF = { fabric: '*', width: 147.32, wunit: 'in', selv: 1, gap: .2, ends: 2, shrL: 0, shrW: 0, nap: 'none', ratio: null, plies: 40, price: 0, splice: 1 };
  function area(p) { var a = 0; for (var i = 0, n = p.length; i < n; i++) { var q = p[i], r = p[(i + 1) % n]; a += q[0] * r[1] - r[0] * q[1]; } return Math.abs(a) / 2; }
  function refl(p, a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1; return p.map(function (q) { var t = ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / l2, fx = a[0] + t * dx, fy = a[1] + t * dy; return [2 * fx - q[0], 2 * fy - q[1]]; }); }
  function bb(polys) { var b = [1e9, 1e9, -1e9, -1e9]; polys.forEach(function (p) { p.forEach(function (q) { b[0] = Math.min(b[0], q[0]); b[1] = Math.min(b[1], q[1]); b[2] = Math.max(b[2], q[0]); b[3] = Math.max(b[3], q[1]); }); }); return b; }
  M.cfg = function (P) { var c = Object.assign({}, M.DEF, P.marker || {}); return c; };
  M.sizes = function (C, P) { var G = C.gradeSet(P); return G.list.length ? { list: G.list.slice(), base: G.base } : { list: [''], base: '' }; };
  M.ratioOf = function (C, P, cfg) { var S = M.sizes(C, P), r = {}; S.list.forEach(function (sz) { var v = cfg.ratio && cfg.ratio[sz]; r[sz] = v == null ? 1 : Math.max(0, Math.round(+v || 0)); }); return r; };
  M.pieces = function (C, P, cfg) { return P.pieces.filter(function (p) { return !p.hidden && (cfg.fabric === '*' || !cfg.fabric || p.fabric === cfg.fabric || (cfg.fabric === '-' && !p.fabric)); }); };
  /* one piece of one size as marker outlines: grain along +y, shrinkage added, fold pieces opened out */
  function outline(C, pc, size, base, pad, cfg) {
    var gp = size && size !== base ? C.gradedPiece(pc, size, base) : C.clone(pc);
    if (pad > 0) { gp.sa.def = (+gp.sa.def || 0) + pad; gp.sa.hem = (+gp.sa.hem || 0) + pad; Object.keys(gp.sa.edges || {}).forEach(function (k) { gp.sa.edges[k] = (+gp.sa.edges[k] || 0) + pad; }); }
    var polys = [C.cutLine(gp, true).pts];
    if (gp.fold >= 0 && gp.fold < C.segCount(gp)) { var k = C.ctrl(gp, gp.fold); polys.push(refl(polys[0], k.p0, k.p3)); }
    var g = gp.grain ? [gp.grain.b[0] - gp.grain.a[0], gp.grain.b[1] - gp.grain.a[1]] : [0, 1], th = Math.atan2(g[0], g[1]), c = Math.cos(th), s = Math.sin(th);
    var fx = 1 / Math.max(.5, 1 - (+cfg.shrW || 0) / 100), fy = 1 / Math.max(.5, 1 - (+cfg.shrL || 0) / 100);
    return polys.map(function (p) { return p.map(function (q) { return [(q[0] * c - q[1] * s) * fx, (q[0] * s + q[1] * c) * fy]; }); });
  }
  M.items = function (C, P, cfg) {
    var S = M.sizes(C, P), R = M.ratioOf(C, P, cfg), pcs = M.pieces(C, P, cfg), out = [], garArea = {}, pad = Math.max(0, +cfg.gap || 0) / 2;
    S.list.forEach(function (sz) { if (!R[sz]) return; var one = [];
      pcs.forEach(function (pc) { var real = outline(C, pc, sz, S.base, 0, cfg), padded = pad ? outline(C, pc, sz, S.base, pad, cfg) : real, a = real.reduce(function (t, p) { return t + area(p); }, 0), n = Math.max(1, Math.round(+pc.qty || 1));
        for (var i = 0; i < n; i++) one.push({ pid: pc.id, name: pc.name || 'Piece', size: sz, polys: padded, real: real, area: a, mirror: !!pc.pair && i % 2 === 1, mat: 'main', grain: !!pc.grain }); });
      garArea[sz] = one.reduce(function (t, it) { return t + it.area; }, 0);
      for (var g = 0; g < R[sz]; g++) one.forEach(function (it) { out.push(Object.assign({}, it, { id: it.pid + '|' + sz, comp: (sz ? sz + ' ' : '') + it.name, bundle: g + 1 })); }); });
    return { items: out, ratio: R, garArea: garArea, sizes: S, pieces: pcs };
  };
  function segX(a, b, c, d) { var d1 = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]), d2 = (b[0] - a[0]) * (d[1] - a[1]) - (b[1] - a[1]) * (d[0] - a[0]), d3 = (d[0] - c[0]) * (a[1] - c[1]) - (d[1] - c[1]) * (a[0] - c[0]), d4 = (d[0] - c[0]) * (b[1] - c[1]) - (d[1] - c[1]) * (b[0] - c[0]); return d1 * d2 < -1e-9 && d3 * d4 < -1e-9; }
  function inside(p, q) { var c = false; for (var i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > q[1]) !== (p[j][1] > q[1]) && q[0] < (p[j][0] - p[i][0]) * (q[1] - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; return c; }
  M.overlaps = function (placed) { // pairs of placed pieces whose cutting lines cross or sit inside each other
    var bad = [], B = placed.map(function (pl) { return bb(pl.real); });
    for (var i = 0; i < placed.length; i++) for (var j = i + 1; j < placed.length; j++) { var a = B[i], b = B[j]; if (a[2] <= b[0] + .01 || b[2] <= a[0] + .01 || a[3] <= b[1] + .01 || b[3] <= a[1] + .01) continue;
      var hit = false; placed[i].real.forEach(function (p) { placed[j].real.forEach(function (q) { if (hit) return; for (var s = 0; s < p.length && !hit; s++) { var p1 = p[s], p2 = p[(s + 1) % p.length]; if (Math.max(p1[0], p2[0]) < b[0] || Math.min(p1[0], p2[0]) > b[2] || Math.max(p1[1], p2[1]) < b[1] || Math.min(p1[1], p2[1]) > b[3]) continue; for (var t = 0; t < q.length; t++) if (segX(p1, p2, q[t], q[(t + 1) % q.length])) { hit = true; break; } } if (!hit && (inside(p, q[0]) || inside(q, p[0]))) hit = true; }); });
      if (hit) bad.push([placed[i].it.comp, placed[j].it.comp]); }
    return bad;
  };
  M.plan = function (C, P, cfg, nest) {
    cfg = Object.assign({}, M.DEF, cfg || {}); var W = +cfg.width || 0, selv = Math.max(0, +cfg.selv || 0), usable = W - 2 * selv, I = M.items(C, P, cfg), checks = [], ck = function (st, item, msg) { checks.push({ st: st, item: item, msg: msg }); };
    var garments = Object.keys(I.ratio).reduce(function (t, k) { return t + I.ratio[k]; }, 0);
    if (!I.pieces.length) return { err: 'No pieces are cut from this fabric. Choose another fabric, or give pieces a fabric in the Fabric tab.' };
    if (!garments) return { err: 'Set at least one garment in the size ratio.' };
    if (usable < 10) return { err: 'The fabric is too narrow once the selvedges are taken off.' };
    if (I.items.length > 600) return { err: I.items.length + ' pieces is too many for one marker here. Lower the ratio (most markers hold 2 to 8 garments).' };
    var mk = nest(I.items, W, { oneWay: cfg.nap !== 'none', selv: selv });
    var placed = mk.placed.map(function (pl) { var it = pl.it, tr = function (q) { var u = q[1], v = it.mirror ? -q[0] : q[0]; return pl.rot ? [-u, -v] : [u, v]; }, t0 = tr(it.polys[0][0]), du = pl.polys[0][0][0] - t0[0], dv = pl.polys[0][0][1] - t0[1];
      return { it: it, rot: pl.rot, real: it.real.map(function (p) { return p.map(function (q) { var t = tr(q); return [t[0] + du, t[1] + dv]; }); }) }; });
    var len = mk.length, total = len + 2 * Math.max(0, +cfg.ends || 0), used = placed.reduce(function (t, pl) { return t + pl.it.area; }, 0);
    var eff = len ? used / (len * usable) : 0, effFull = len ? used / (len * W) : 0, perG = total / garments / 100, splice = 1 + Math.max(0, +cfg.splice || 0) / 100;
    var sumA = Object.keys(I.ratio).reduce(function (t, k) { return t + I.ratio[k] * (I.garArea[k] || 0); }, 0), perSize = {};
    Object.keys(I.ratio).forEach(function (k) { perSize[k] = { n: I.ratio[k], area: (I.garArea[k] || 0) / 1e4, m: sumA ? total / 100 * (I.garArea[k] || 0) / sumA : 0 }; perSize[k].mSplice = perSize[k].m * splice; });
    var plies = Math.max(1, Math.round(+cfg.plies || 1)), lay = { plies: plies, garments: garments * plies, fabric: total / 100 * plies * splice, bySize: {} };
    Object.keys(I.ratio).forEach(function (k) { lay.bySize[k] = I.ratio[k] * plies; });
    // checks
    if (mk.tooWide.length) ck('fail', 'Fabric width', 'Too wide for ' + usable.toFixed(1) + ' cm of usable width: ' + mk.tooWide.filter(function (x, i, a) { return a.indexOf(x) === i; }).join(', ') + '. Use a wider fabric or split the piece.');
    else ck('pass', 'Fabric width', 'Every piece fits the usable width of ' + usable.toFixed(1) + ' cm (' + W.toFixed(1) + ' cm less ' + selv + ' cm selvedge each side).');
    var ng = I.pieces.filter(function (p) { return !p.grain; }); ck(ng.length ? 'warn' : 'pass', 'Grainline', ng.length ? 'No grainline on ' + ng.map(function (p) { return p.name; }).join(', ') + ': laid with the piece length along the fabric.' : 'Every piece is laid with its grainline along the fabric length.');
    var turned = placed.filter(function (pl) { return pl.rot; }).length;
    ck('pass', 'Direction', cfg.nap !== 'none' ? 'One-way fabric: no piece is turned, so nap, pile or print all run the same way.' : 'No nap: ' + turned + ' of ' + placed.length + ' pieces are turned 180° to save fabric; the grain stays along the length.');
    var ov = M.overlaps(placed); ck(ov.length ? 'fail' : 'pass', 'Overlaps', ov.length ? ov.length + ' overlapping pair' + (ov.length > 1 ? 's' : '') + ', e.g. ' + ov[0].join(' and ') + '.' : 'No cutting lines overlap' + (cfg.gap > 0 ? '; at least ' + (+cfg.gap).toFixed(1) + ' cm between pieces is kept for the knife.' : '.'));
    if (!(cfg.gap > 0)) ck('warn', 'Spacing', 'No gap between pieces. Straight-knife cutting usually needs 2 to 3 mm; die or laser cutting can work with less.');
    if ((+cfg.shrL || 0) > 8 || (+cfg.shrW || 0) > 8) ck('warn', 'Shrinkage', 'Shrinkage over 8%: pre-shrink or wash the fabric before cutting, and confirm with a wash test.');
    else if (cfg.shrL || cfg.shrW) ck('pass', 'Shrinkage', 'Pieces grown ' + (+cfg.shrL || 0) + '% in length and ' + (+cfg.shrW || 0) + '% in width before laying, so they finish at size after washing.');
    if (eff < .7 && !mk.tooWide.length) ck('warn', 'Efficiency', 'Marker efficiency is ' + (eff * 100).toFixed(1) + '%. Mixing more sizes or garments in one marker usually raises it.');
    return { cfg: cfg, width: W, usable: usable, length: len, total: total, ends: +cfg.ends || 0, eff: eff, effFull: effFull, waste: 1 - eff, garments: garments, ratio: I.ratio, perGarment: perG, perGarmentSplice: perG * splice, perSize: perSize, lay: lay, placed: placed, pieceArea: used / 1e4, checks: checks, tooWide: mk.tooWide, sizes: I.sizes };
  };
  M.FORMULAS = [
    ['Usable width', 'fabric width − 2 × selvedge'],
    ['Marker length', 'laid length of the pieces + 2 × end allowance'],
    ['Efficiency', 'area of the cut pieces ÷ (laid length × usable width)'],
    ['Per garment', 'marker length ÷ garments in the marker'],
    ['Per size', 'marker length × that size’s piece area ÷ total piece area in the marker'],
    ['Lay fabric', 'marker length × plies × (1 + splice and end loss %)'],
    ['Shrinkage', 'each piece is laid at length ÷ (1 − length shrinkage) and width ÷ (1 − width shrinkage)']];

  if (typeof module !== 'undefined' && module.exports) { module.exports = M; return; }
  root.FCMarker = M;

  /* ---------- Garment Studio wiring ---------- */
  var LAST = null, COLS = ['#f4e3c8', '#d8e8d4', '#dce4f2', '#f2dbe0', '#e8e0f2', '#f2ecc8', '#d4ecea', '#f0d8c8'];
  function S() { return root.FCStudio; }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function C() { return root.FCCad; }
  function n2(v, d) { return (+v).toFixed(d == null ? 2 : d); }
  function W2(cm, u) { return u === 'in' ? +(cm / 2.54).toFixed(2) : +(+cm).toFixed(1); }
  function styleId() { var F = root.ForecutStyle, s = F && F.active && F.active(); return s ? s.id : ''; }
  function cost() { try { return JSON.parse(localStorage.getItem('fc-pm-cost') || 'null'); } catch (e) { return null; } }
  M.pane = function () {
    var st = S(), P = st.P(), c = M.cfg(P), Z = M.sizes(C(), P), R = M.ratioOf(C(), P, c), u = c.wunit, fabs = P.fabrics || [];
    var row = function (lab, inp, note) { return '<label class="ps-r mk-r"><span>' + lab + (note ? ' <small>' + note + '</small>' : '') + '</span>' + inp + '</label>'; };
    var num = function (k, v, step, unit, extra) { return '<span class="mk-in"><input type="number" data-mk="' + k + '" value="' + v + '" step="' + step + '"' + (extra || ' min="0"') + '>' + (unit ? '<em>' + unit + '</em>' : '') + '</span>'; };
    var h = '<div class="mk-pane"><p class="ps-n">Lay the graded pieces on your fabric and get the consumption per garment and per size. Settings are saved with the pattern.</p>'
      + '<div class="ps-grp">Fabric</div>' + row('Pieces from', '<select data-mk="fabric"><option value="*"' + (c.fabric === '*' ? ' selected' : '') + '>Every piece</option>' + fabs.map(function (f) { return '<option value="' + esc(f.id) + '"' + (c.fabric === f.id ? ' selected' : '') + '>' + esc(f.name) + '</option>'; }).join('') + (fabs.length ? '<option value="-"' + (c.fabric === '-' ? ' selected' : '') + '>Pieces with no fabric</option>' : '') + '</select>')
      + row('Fabric width', num('width', W2(c.width, u), u === 'in' ? .5 : .5, '') + '<select data-mk="wunit" class="mk-u"><option value="in"' + (u === 'in' ? ' selected' : '') + '>in</option><option value="cm"' + (u === 'cm' ? ' selected' : '') + '>cm</option></select>', 'full width')
      + row('Selvedge, each side', num('selv', c.selv, .1, 'cm')) + row('Nap / direction', '<select data-mk="nap"><option value="none"' + (c.nap === 'none' ? ' selected' : '') + '>No nap: pieces may turn 180°</option><option value="oneway"' + (c.nap !== 'none' ? ' selected' : '') + '>One way (nap, pile, print)</option></select>')
      + row('Shrinkage, length', num('shrL', c.shrL, .5, '%')) + row('Shrinkage, width', num('shrW', c.shrW, .5, '%'))
      + '<div class="ps-grp">Lay</div>' + row('Gap between pieces', num('gap', c.gap, .1, 'cm')) + row('End allowance, each end', num('ends', c.ends, .5, 'cm')) + row('Plies', num('plies', c.plies, 1, '', ' min="1"')) + row('Splice and end loss', num('splice', c.splice, .5, '%')) + row('Fabric price', num('price', c.price, 1, '₹/m'))
      + '<div class="ps-grp">Size ratio <span>garments of each size in one marker</span></div><div class="mk-ratio">' + Z.list.map(function (sz) { return '<label><span>' + esc(sz || 'One size') + '</span><input type="number" min="0" step="1" data-mk="r:' + esc(sz) + '" value="' + R[sz] + '"></label>'; }).join('') + '</div>'
      + (Z.list.length < 2 ? '<p class="ps-n">Add sizes in the Grading tab to mix sizes in one marker.</p>' : '')
      + '<div class="ps-objb">' + '<button type="button" class="ps-b pri" data-a="mk:run">Make marker</button>' + (LAST ? '<button type="button" class="ps-b" data-a="mk:view">View marker</button>' : '') + '</div>';
    if (LAST && LAST.err) h += '<p class="ps-check no">' + esc(LAST.err) + '</p>';
    else if (LAST) { var r = LAST, cc = cost(), sent = cc && cc.marker && cc.marker.at === r.at;
      h += '<div class="mk-res"><div><span>Marker length</span><b>' + n2(r.total / 100) + ' m</b></div><div><span>Efficiency</span><b>' + n2(r.eff * 100, 1) + '%</b></div><div><span>Per garment</span><b>' + n2(r.perGarment, 3) + ' m</b></div><div><span>Garments</span><b>' + r.garments + '</b></div></div>'
        + r.checks.filter(function (x) { return x.st !== 'pass'; }).map(function (x) { return '<p class="ps-check ' + (x.st === 'fail' ? 'no' : 'warn') + '">' + esc(x.item) + ': ' + esc(x.msg) + '</p>'; }).join('')
        + '<div class="ps-objb"><button type="button" class="ps-b' + (sent ? '' : ' pri') + '" data-a="mk:cost">' + (sent ? '✓ In costing' : 'Use in costing') + '</button></div>'; }
    return h + '</div>';
  };
  function setCfg(k, v) {
    var st = S(), P = st.P(); st.act('Marker settings', function () { var c = P.marker = Object.assign({}, M.cfg(P), P.marker || {});
      if (k.indexOf('r:') === 0) { c.ratio = Object.assign({}, c.ratio || {}); c.ratio[k.slice(2)] = Math.max(0, Math.round(+v || 0)); }
      else if (k === 'width') c.width = c.wunit === 'in' ? (+v || 0) * 2.54 : (+v || 0);
      else if (k === 'fabric' || k === 'nap' || k === 'wunit') c[k] = v; else c[k] = +v || 0; });
  }
  document.addEventListener('change', function (e) { var el = e.target.closest && e.target.closest('[data-mk]'); if (!el || !S()) return; setCfg(el.dataset.mk, el.value); });
  function run() {
    var st = S(), P = st.P(); if (!root.PMC || !root.PMC.marker) return st.toast('Marker making is not available on this page.', 1);
    st.toast('Making the marker…'); setTimeout(function () { var t0 = Date.now(); try { LAST = M.plan(C(), P, M.cfg(P), root.PMC.marker); } catch (e) { LAST = { err: 'The marker could not be made: ' + e.message }; }
      if (!LAST.err) { LAST.at = new Date().toISOString(); LAST.ms = Date.now() - t0; st.toast('Marker: ' + n2(LAST.total / 100) + ' m for ' + LAST.garments + ' garment' + (LAST.garments > 1 ? 's' : '') + ', ' + n2(LAST.eff * 100, 1) + '% efficiency.'); }
      st.ST.tab = 'marker'; refreshPane(); if (!LAST.err) view(); }, 30);
  }
  function refreshPane() { var el = document.getElementById('ps-objs'); if (el && S().ST.tab === 'marker') el.innerHTML = M.pane(); }
  function svg(r, opt) {
    opt = opt || {}; var L = Math.max(10, r.total), Wd = r.width, pad = 4, e0 = r.ends, sizes = r.sizes.list, g = '';
    var col = function (sz) { var i = sizes.indexOf(sz); return COLS[(i < 0 ? 0 : i) % COLS.length]; };
    r.placed.forEach(function (pl) { pl.real.forEach(function (p) { g += '<path d="M' + p.map(function (q) { return (q[0] + e0).toFixed(2) + ' ' + q[1].toFixed(2); }).join('L') + 'Z" fill="' + col(pl.it.size) + '" stroke="#1c1714" stroke-width=".1"/>'; });
      var b = bb(pl.real), cx = (b[0] + b[2]) / 2 + e0, cy = (b[1] + b[3]) / 2, fs = Math.max(1.2, Math.min(3, (b[3] - b[1]) / 8));
      g += '<text x="' + cx.toFixed(1) + '" y="' + cy.toFixed(1) + '" font-size="' + fs.toFixed(1) + '" font-family="Arial,sans-serif" font-weight="700" fill="#3b332d" text-anchor="middle">' + esc((pl.it.size ? pl.it.size + ' · ' : '') + pl.it.name + (pl.it.mirror ? ' (R)' : '')) + '</text>'; });
    var sel = r.width - r.usable > 0 ? '<path d="M0 ' + (r.cfg.selv) + 'H' + L + 'M0 ' + (Wd - r.cfg.selv) + 'H' + L + '" stroke="#a9481f" stroke-width=".1" stroke-dasharray="1 .6" fill="none"/>' : '';
    var ends = e0 ? '<path d="M' + e0 + ' 0V' + Wd + 'M' + (L - e0) + ' 0V' + Wd + '" stroke="#a9481f" stroke-width=".1" stroke-dasharray="1 .6"/>' : '';
    var ticks = ''; for (var x = 0; x <= L; x += 10) ticks += '<path d="M' + x + ' ' + Wd + 'v' + (x % 50 ? 1.2 : 2.6) + '" stroke="#6e6259" stroke-width=".08"/>' + (x % 50 ? '' : '<text x="' + x + '" y="' + (Wd + 5) + '" font-size="2" font-family="Arial,sans-serif" fill="#6e6259" text-anchor="middle">' + (x / 100).toFixed(1) + ' m</text>');
    var nap = r.cfg.nap !== 'none' ? '<path d="M2 -3.5h12m-2.5 -1.6 2.5 1.6 -2.5 1.6" stroke="#a9481f" stroke-width=".25" fill="none"/><text x="15.5" y="-2.8" font-size="1.8" font-family="Arial,sans-serif" fill="#a9481f">one way: every piece points this way</text>' : '';
    var title = opt.title ? '<text x="0" y="' + (r.cfg.nap !== 'none' ? -6.5 : -2.5) + '" font-size="2.4" font-family="Arial,sans-serif" font-weight="700" fill="#1c1714">' + esc(opt.title) + '</text>' : '';
    var top = r.cfg.nap !== 'none' ? 10 : 6, w = L + 2 * pad, h = Wd + pad + top + 7;
    return { W: w, H: h, s: '<svg xmlns="http://www.w3.org/2000/svg"' + (opt.trueScale ? ' width="' + w.toFixed(2) + 'cm" height="' + h.toFixed(2) + 'cm"' : '') + ' viewBox="' + (-pad) + ' ' + (-top) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2) + '"><rect x="0" y="0" width="' + L.toFixed(2) + '" height="' + Wd.toFixed(2) + '" fill="#efe8dc" stroke="#6e6259" stroke-width=".12"/>' + sel + ends + g + ticks + nap + title + '</svg>' };
  }
  function titleOf(r) { var P = S().P(); return (styleId() ? styleId() + ' · ' : '') + (P.name || 'Pattern') + ' · marker ' + Object.keys(r.ratio).filter(function (k) { return r.ratio[k]; }).map(function (k) { return (k || 'One size') + '×' + r.ratio[k]; }).join(' ') + ' · ' + n2(r.width / 2.54, 1) + ' in (' + n2(r.width, 1) + ' cm) wide'; }
  function tables(r, light) {
    var u = 'm', szs = Object.keys(r.perSize).filter(function (k) { return r.perSize[k].n; });
    return '<table class="mk-t"><tr><th>Size</th><th>In marker</th><th>Piece area</th><th>Per garment</th><th>With splice ' + n2(r.cfg.splice, 1) + '%</th><th>In the lay (' + r.lay.plies + ' plies)</th></tr>'
      + szs.map(function (k) { var s = r.perSize[k]; return '<tr><td><b>' + esc(k || 'One size') + '</b></td><td>' + s.n + '</td><td>' + n2(s.area, 3) + ' m²</td><td>' + n2(s.m, 3) + ' ' + u + '</td><td>' + n2(s.mSplice, 3) + ' ' + u + '</td><td>' + r.lay.bySize[k] + ' garments</td></tr>'; }).join('')
      + '<tr class="mk-tot"><td><b>Average</b></td><td>' + r.garments + '</td><td>' + n2(r.pieceArea / r.garments, 3) + ' m²</td><td>' + n2(r.perGarment, 3) + ' m</td><td>' + n2(r.perGarmentSplice, 3) + ' m</td><td>' + r.lay.garments + ' garments · ' + n2(r.lay.fabric, 1) + ' m fabric</td></tr></table>'
      + '<table class="mk-t"><tr><th>Check</th><th>Result</th></tr>' + r.checks.map(function (x) { return '<tr><td><b class="mk-b ' + x.st + '">' + (x.st === 'pass' ? 'Pass' : x.st === 'fail' ? 'Fail' : 'Check') + '</b> ' + esc(x.item) + '</td><td>' + esc(x.msg) + '</td></tr>'; }).join('') + '</table>'
      + '<details class="mk-fx"' + (light ? ' open' : '') + '><summary>Formulas</summary><table class="mk-t">' + M.FORMULAS.map(function (f) { return '<tr><td><b>' + f[0] + '</b></td><td>' + f[1] + '</td></tr>'; }).join('') + '</table></details>';
  }
  function kpis(r) { var pr = +r.cfg.price || 0; return '<div class="mk-k"><div><span>Marker length</span><b>' + n2(r.total / 100, 3) + ' m</b><small>' + n2(r.length / 100, 3) + ' m laid + 2 × ' + n2(r.ends, 1) + ' cm ends</small></div><div><span>Efficiency</span><b>' + n2(r.eff * 100, 1) + '%</b><small>waste ' + n2(r.waste * 100, 1) + '% · ' + n2(r.effFull * 100, 1) + '% of full width</small></div><div><span>Per garment</span><b>' + n2(r.perGarment, 3) + ' m</b><small>' + n2(r.perGarmentSplice, 3) + ' m with splice' + (pr ? ' · ₹' + n2(r.perGarmentSplice * pr) : '') + '</small></div><div><span>Usable width</span><b>' + n2(r.usable, 1) + ' cm</b><small>' + n2(r.width, 1) + ' cm less selvedges</small></div></div>'; }
  function view() {
    var st = S(), r = LAST; if (!r || r.err) return;
    var sv = svg(r, { title: titleOf(r) });
    st.modal('<div class="mk-v"><div class="pck-h"><div><h4>Marker</h4><p class="ps-n">' + esc(titleOf(r)) + ' · ' + (r.cfg.nap !== 'none' ? 'one way' : 'no nap') + (r.cfg.shrL || r.cfg.shrW ? ' · shrinkage ' + r.cfg.shrL + '% × ' + r.cfg.shrW + '%' : '') + ' · gap ' + r.cfg.gap + ' cm</p></div><button type="button" class="ps-b" data-a="mclose" aria-label="Close">×</button></div>'
      + kpis(r) + '<div class="mk-svg">' + sv.s + '</div>' + tables(r)
      + '<p class="ps-n">Laid automatically on a 5 mm grid with the grain along the length. A marker from a CAD system or a marker maker is often a few per cent shorter: use this to plan and cost, and confirm consumption on the cutting table.</p>'
      + '<div class="ps-bs"><button type="button" class="ps-b pri" data-a="mk:cost">Use in costing</button><button type="button" class="ps-b" data-a="mk:svg">Marker SVG (true scale)</button><button type="button" class="ps-b" data-a="mk:dxf">Marker DXF (mm)</button><button type="button" class="ps-b" data-a="mk:csv">Consumption (CSV)</button><button type="button" class="ps-b" data-a="mk:print">Print / save PDF</button></div></div>');
    var box = document.querySelector('#ps-modal .ps-mbox'); if (box) box.classList.add('pck-box');
  }
  function toCost() {
    var st = S(), r = LAST; if (!r || r.err) return; var prev = cost(), sid = styleId(), P = st.P(), pr = +r.cfg.price || 0, per = +r.perGarmentSplice.toFixed(3);
    var same = prev && Array.isArray(prev.lines) && (!sid || !prev.style || prev.style === sid), lines = same ? prev.lines.map(function (l) { return l.slice(); }) : [];
    var fl = lines.filter(function (l) { return l[0] === 'Main fabric'; })[0], rate = pr || (fl ? +fl[3] : 0); if (fl) { fl[1] = per; fl[3] = rate; fl[4] = +(per * rate).toFixed(2); } else lines.unshift(['Main fabric', per, 'm', rate, +(per * rate).toFixed(2)]);
    var direct = lines.reduce(function (t, l) { return t + (+l[4] || 0); }, 0), oh = same && prev.total && prev.direct ? prev.total / prev.direct : 1;
    var rec = Object.assign({}, same ? prev : {}, { at: Date.now(), style: sid, garment: (same && prev.garment) || P.name, code: (same && prev.code) || sid, fabricWidth: +r.width.toFixed(1), fabricPerGarment: per, lines: lines, direct: +direct.toFixed(2), total: +(direct * oh).toFixed(2),
      marker: { at: r.at, length: +(r.total / 100).toFixed(3), width: +r.width.toFixed(1), usable: +r.usable.toFixed(1), eff: +(r.eff * 100).toFixed(1), garments: r.garments, ratio: r.ratio, plies: r.lay.plies, nap: r.cfg.nap, shrL: r.cfg.shrL, shrW: r.cfg.shrW, splice: r.cfg.splice, perSize: Object.keys(r.perSize).reduce(function (o, k) { o[k] = +r.perSize[k].mSplice.toFixed(3); return o; }, {}), pattern: P.name } });
    try { localStorage.setItem('fc-pm-cost', JSON.stringify(rec)); } catch (e) { return st.toast('Could not save: browser storage is full.', 1); }
    st.toast('Main fabric is now ' + per + ' m per garment from this marker. The Tech Pack BOM and Price & Margin will ask to update.'); refreshPane(); if (document.querySelector('.mk-v')) view();
  }
  function csvOf(rows) { return rows.map(function (r) { return r.map(function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\n'); }
  function printIt() {
    var r = LAST, P = S().P(), sv = svg(r, { title: titleOf(r) }), kit = {}; try { kit = JSON.parse(localStorage.getItem('fc-brand-kit') || '{}'); } catch (e) { }
    var w = window.open('', '_blank'); if (!w) return S().toast('Allow pop-ups to print the marker.', 1);
    w.document.write('<!doctype html><meta charset="utf-8"><title>' + esc((styleId() ? styleId() + ' ' : '') + 'Marker · ' + (P.name || 'Pattern')) + '</title><style>body{font:11px/1.45 Helvetica,Arial,sans-serif;color:#1b1d20;margin:0}h1{font:600 20px Georgia,serif;margin:0 0 2px}.m{color:#555;margin:0 0 10px}svg{width:100%;height:auto;border:1px solid #ddd;margin:8px 0}table{width:100%;border-collapse:collapse;margin:8px 0}th,td{text-align:left;padding:4px 6px;border-bottom:1px solid #ddd;vertical-align:top}th{font-size:9.5px;text-transform:uppercase;letter-spacing:.06em;color:#666}.mk-k{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.mk-k div{border:1px solid #ddd;border-radius:6px;padding:6px 8px}.mk-k span,.mk-k small{display:block;color:#666;font-size:9.5px}.mk-k b{font-size:16px}.mk-b.pass{color:#1a7a45}.mk-b.fail{color:#b03a2e}.mk-b.warn{color:#9a6400}details summary{display:none}@page{size:A4 landscape;margin:10mm}</style>'
      + '<div style="font:700 10px Helvetica;letter-spacing:.12em;text-transform:uppercase;color:#a9481f">' + esc(kit.name || kit.brand || 'Forecut') + '</div><h1>Marker and consumption</h1><p class="m">' + esc(titleOf(r)) + ' · ' + new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }) + '</p>' + kpis(r) + sv.s + tables(r, true).replace('<details class="mk-fx" open><summary>Formulas</summary>', '<h3 style="margin:10px 0 0;font-size:12px">Formulas</h3>').replace('</details>', '')
      + '<p style="color:#666;font-size:9.5px">Planning marker: confirm consumption on the cutting table before ordering bulk.</p><script>setTimeout(function(){print()},300)<\/script>');
    w.document.close();
  }
  M.act = function (a) {
    var st = S(); if (!st) return; var r = LAST;
    if (a === 'run') return run();
    if (!r || r.err) return st.toast('Make the marker first.', 1);
    if (a === 'view') return view();
    if (a === 'cost') return toCost();
    if (a === 'print') return printIt();
    if (a === 'svg') { var sv = svg(r, { title: titleOf(r), trueScale: true }); return st.dl(st.fname('marker.svg'), sv.s, 'image/svg+xml'); }
    if (a === 'dxf') { var X = root.PMX, sc = []; r.placed.forEach(function (pl) { pl.real.forEach(function (p) { sc.push({ k: 'poly', p: p.map(function (q) { return [q[0] + r.ends, q[1]]; }), c: 1, L: 'CUT' }); }); var b = bb(pl.real); sc.push({ k: 'text', x: (b[0] + b[2]) / 2 + r.ends, y: (b[1] + b[3]) / 2, s: 1.5, t: (pl.it.size ? pl.it.size + ' ' : '') + pl.it.name + (pl.it.mirror ? ' (R)' : ''), L: 'TEXT' }); });
      sc.push({ k: 'poly', p: [[0, 0], [r.total, 0], [r.total, r.width], [0, r.width]], c: 1, L: 'MARK' }); return st.dl(st.fname('marker.dxf'), X.dxf(sc, r.total, r.width, 'mm'), 'application/dxf'); }
    if (a === 'csv') { var rows = [['Size', 'Garments in marker', 'Piece area (m2)', 'Per garment (m)', 'Per garment with splice (m)', 'Garments in lay']]; Object.keys(r.perSize).forEach(function (k) { var s = r.perSize[k]; if (s.n) rows.push([k || 'One size', s.n, s.area.toFixed(4), s.m.toFixed(3), s.mSplice.toFixed(3), r.lay.bySize[k]]); });
      rows.push([], ['Marker length (m)', (r.total / 100).toFixed(3)], ['Fabric width (cm)', r.width.toFixed(1)], ['Usable width (cm)', r.usable.toFixed(1)], ['Efficiency (%)', (r.eff * 100).toFixed(1)], ['Plies', r.lay.plies], ['Fabric for the lay (m)', r.lay.fabric.toFixed(2)], ['Nap', r.cfg.nap], ['Shrinkage length / width (%)', r.cfg.shrL + ' / ' + r.cfg.shrW], ['Gap (cm)', r.cfg.gap]);
      return st.dl(st.fname('marker-consumption.csv'), csvOf(rows), 'text/csv'); }
  };
  var css = document.createElement('style'); css.textContent = '.mk-pane .ps-grp span{font-weight:400;letter-spacing:0;text-transform:none;opacity:.7;margin-left:4px}.mk-r small{opacity:.7}.mk-in{display:flex;align-items:center;gap:4px}.mk-in input{width:100%;min-width:0}.mk-in em{font-style:normal;opacity:.7;font-size:11px}.mk-u{width:auto!important;margin-left:4px}'
    + '.mk-ratio{display:grid;grid-template-columns:repeat(auto-fill,minmax(58px,1fr));gap:6px;margin:4px 0 8px}.mk-ratio label{display:flex;flex-direction:column;gap:2px;font-size:11px;opacity:.95}.mk-ratio input{width:100%}'
    + '.mk-res{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0}.mk-res div{border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:6px 8px}.mk-res span{display:block;font-size:10.5px;opacity:.7}.mk-res b{font:700 15px "DM Sans",sans-serif}.ps-check.warn{color:#e3a33b}'
    + '.mk-k{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0}.mk-k div{border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:8px 10px}.mk-k span,.mk-k small{display:block;font-size:11px;opacity:.7}.mk-k b{font:700 19px "DM Sans",sans-serif}'
    + '.mk-svg{background:#fff;border-radius:8px;padding:6px;max-height:44vh;overflow:auto}.mk-svg svg{width:100%;min-width:640px;height:auto;display:block}.mk-t{width:100%;border-collapse:collapse;font-size:12.5px;margin:10px 0}.mk-t th{text-align:left;font-size:11px;opacity:.7;padding:6px;border-bottom:1px solid rgba(255,255,255,.12)}.mk-t td{padding:6px;border-bottom:1px solid rgba(255,255,255,.07);vertical-align:top}.mk-tot td{font-weight:700}.mk-b{font:700 10.5px "DM Sans",sans-serif;text-transform:uppercase;padding:2px 6px;border-radius:5px;color:#111}.mk-b.pass{background:#4fbf7f}.mk-b.warn{background:#e3a33b}.mk-b.fail{background:#ef6b5b}.mk-fx summary{cursor:pointer;font-size:12px;opacity:.8}@media(max-width:700px){.mk-k{grid-template-columns:1fr 1fr}}';
  document.head.appendChild(css);
})(typeof self !== 'undefined' ? self : this);
