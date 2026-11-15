/* Forecut Garment Studio: pattern check report (Stage 4).
   FCCheck.run(C, P)       - every piece, seam, notch and size checked; rows of {cat, item, size, st: pass|warn|fail|info, msg}
   FCCheck.scale(C, X, cb) - the 100 mm control square through SVG, PDF (sheet and tiles) and DXF (mm, cm, in), plus a DXF round trip of the pieces
   FCCheck.rules / applyRules - grade-rule table out to CSV and back in
   Works in the browser (window.FCCheck) and in Node for tests (module.exports). */
(function (root) {
  'use strict';
  var K = {};
  function f2(v) { return (Math.round(v * 100) / 100).toFixed(2); }
  function median(a) { var s = a.slice().sort(function (x, y) { return x - y; }), m = s.length >> 1; return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : 0; }
  K.TOL = { seam: .3, notch: .3, scaleMm: .1, roundTripMm: .5 };

  /* notches inside the sewn part of an edge, as distances from the start of that part */
  function notchesIn(C, pc, side) {
    var L = C.segLen(pc, side.seg), a = side.a == null ? 0 : side.a, b = side.b == null ? L : side.b, lo = Math.min(a, b), hi = Math.max(a, b);
    return (pc.notches || []).filter(function (nt) { return nt.seg === side.seg; }).map(function (nt) { return C.notchPos(pc, nt).s; }).filter(function (s) { return s >= lo - .05 && s <= hi + .05; }).map(function (s) { return b >= a ? s - lo : hi - s; }).sort(function (x, y) { return x - y; });
  }
  function graded(C, P, size, base) { return { pieces: P.pieces.map(function (p) { return size && size !== base ? C.gradedPiece(p, size, base) : p; }), sewing: P.sewing || [] }; }

  K.run = function (C, P) {
    var rows = [], add = function (cat, item, size, st, msg) { rows.push({ cat: cat, item: item, size: size || '', st: st, msg: msg }); };
    var G = C.gradeSet(P), list = G.list.length ? G.list.slice() : [''], base = G.base || list[0], multi = list.length > 1;
    var pcs = P.pieces.filter(function (p) { return !p.hidden; }), names = {};
    if (!pcs.length) { add('Pieces', 'Pattern', '', 'fail', 'There are no visible pieces to check.'); return K.sum(rows); }
    pcs.forEach(function (pc) { var n = (pc.name || '').trim().toLowerCase(); names[n] = (names[n] || 0) + 1; });
    /* ---- pieces ---- */
    pcs.forEach(function (pc) {
      var nm = pc.name || 'Unnamed piece', bad = 0;
      if (!(pc.name || '').trim()) { add('Pieces', nm, '', 'warn', 'The piece has no name. Name it so it can be found on the marker and in the tech pack.'); bad++; }
      else if (names[pc.name.trim().toLowerCase()] > 1) { add('Pieces', nm, '', 'warn', 'Another piece has the same name. Use different names (for example Front and Front facing).'); bad++; }
      C.validate(pc).forEach(function (i) { add('Pieces', nm, base, 'fail', i.msg); bad++; });
      C.cutLine(pc).warn.forEach(function (w) { add('Pieces', nm, base, 'warn', w); bad++; });
      if (!pc.grain) { add('Pieces', nm, '', 'warn', 'No grainline. The marker will assume the grain runs along the length of the piece.'); bad++; }
      var q = +pc.qty; if (!(q >= 1) || Math.round(q) !== q) { add('Pieces', nm, '', 'fail', 'Cut quantity must be a whole number of 1 or more.'); bad++; }
      else if (pc.pair && q % 2) { add('Pieces', nm, '', 'warn', 'Cut as a mirrored pair, but the quantity is odd (' + q + '). A pair is usually 2, 4…'); bad++; }
      if (multi) list.forEach(function (sz) { if (sz === base) return; C.validate(C.gradedPiece(pc, sz, base)).forEach(function (i) { add('Pieces', nm, sz, 'fail', 'In size ' + sz + ': ' + i.msg); bad++; }); });
      if (!bad) add('Pieces', nm, '', 'pass', 'Outline closed, no crossing edges, seam allowance clean, grainline set, cut ' + q + (pc.pair ? ' (mirrored pairs)' : '') + '.');
    });
    /* ---- grading ---- */
    if (multi) pcs.forEach(function (pc) {
      var nm = pc.name || 'Unnamed piece';
      if (!C.isGraded(pc)) { add('Grading', nm, '', 'warn', 'Not graded: every size is the same as ' + base + '. Grade it, or ignore this for pieces such as labels.'); return; }
      var per = list.map(function (sz) { return C.perimeter(C.gradedPiece(pc, sz, base)); }), ar = list.map(function (sz) { return C.area(C.gradedPiece(pc, sz, base)); });
      var st = [], sa = [], bad = 0; for (var i = 1; i < list.length; i++) { st.push(per[i] - per[i - 1]); sa.push(ar[i] - ar[i - 1]); }
      st.forEach(function (d, i) { if (d < -.05) { add('Grading', nm, list[i + 1], 'fail', 'The seamline gets shorter from ' + list[i] + ' to ' + list[i + 1] + ' (' + f2(d) + ' cm). Sizes listed smallest first should grow.'); bad++; } });
      sa.forEach(function (d, i) { if (d < -.5 && st[i] >= -.05) { add('Grading', nm, list[i + 1], 'fail', 'The piece gets smaller in area from ' + list[i] + ' to ' + list[i + 1] + '.'); bad++; } });
      var m = median(st); if (!bad && st.length > 1) st.forEach(function (d, i) { if (Math.abs(d - m) > Math.max(.5, Math.abs(m) * .5)) { add('Grading', nm, list[i + 1], 'warn', 'Uneven step ' + list[i] + ' → ' + list[i + 1] + ': seamline +' + f2(d) + ' cm, other steps about +' + f2(m) + ' cm. Fine for a jump (for example M to L in a split run); otherwise check the grade.'); bad++; } });
      if (!bad) add('Grading', nm, '', 'pass', 'Grows every size: seamline ' + list.map(function (sz, i) { return sz + ' ' + f2(per[i]); }).join(' · ') + ' cm.');
    });
    /* ---- seams, notches, sleeve cap ---- */
    var sew = P.sewing || [];
    if (!sew.length) add('Seams', 'Sewing', '', 'info', 'No seams are sewn yet, so seam lengths, notches and sleeve ease are not checked. Use Segment sewing to join the edges that are sewn together.');
    var cap = {};
    sew.forEach(function (sw) {
      var A0 = C.byId(P, sw.A.pc), B0 = C.byId(P, sw.B.pc); if (!A0 || !B0 || A0.hidden || B0.hidden) return;
      var lab = (A0.name || 'Piece') + ' ' + (sw.A.seg + 1) + ' ↔ ' + (B0.name || 'Piece') + ' ' + (sw.B.seg + 1), badS = [], plan = +sw.ease || 0;
      list.forEach(function (sz) { var T = graded(C, P, sz, base), r = C.seamLens(T, sw); if (!r) return; if (!r.ok) badS.push(sz); var A = C.byId(T, sw.A.pc), B = C.byId(T, sw.B.pc);
        if (!r.ok) add('Seams', lab, sz, 'fail', (sz ? 'Size ' + sz + ': ' : '') + f2(r.a) + ' cm against ' + f2(r.b) + ' cm, a difference of ' + f2(r.diff) + ' cm' + (plan ? ' where ' + f2(plan) + ' cm ease is planned' : '') + '. More than 3 mm out.');
        // sleeve cap ease, collected per sleeve and size
        var sa = /sleeve/i.test(A.name || ''), sb = /sleeve/i.test(B.name || ''), body = function (p) { return /front|back|bodice|body|yoke|armhole/i.test(p.name || ''); };
        if (sa !== sb && (sa ? body(B) : body(A))) { var sl = sa ? A : B, k = sl.id + '|' + sz, c = cap[k] || (cap[k] = { name: sl.name, size: sz, s: 0, b: 0 }); c.s += sa ? r.a : r.b; c.b += sa ? r.b : r.a; }
        if (sz === base || !sz) { var na = notchesIn(C, A, sw.A), nb = notchesIn(C, B, sw.B);
          if (na.length !== nb.length) add('Notches', lab, sz, 'warn', 'Notch count differs: ' + na.length + ' on ' + (A.name || 'the first edge') + ', ' + nb.length + ' on ' + (B.name || 'the second edge') + '. Matching notches help the sewer line up the seam.');
          else if (na.length) { var off = 0; na.forEach(function (s, i) { off = Math.max(off, Math.abs(s * (r.b / (r.a || 1)) - nb[i])); }); var off2 = 0, rb = nb.slice().reverse(); na.forEach(function (s, i) { off2 = Math.max(off2, Math.abs((r.a - s) * (r.b / (r.a || 1)) - rb[i])); });
            var o = Math.min(off, off2); add('Notches', lab, sz, o > K.TOL.notch + Math.abs(plan) ? 'warn' : 'pass', o > K.TOL.notch + Math.abs(plan) ? na.length + ' notch' + (na.length > 1 ? 'es' : '') + ' on each side, but they are up to ' + f2(o) + ' cm apart when the seam is walked. Move them so they meet.' : na.length + ' notch' + (na.length > 1 ? 'es' : '') + ' on each side, matching within 3 mm.'); }
        } });
      if (!badS.length) add('Seams', lab, '', 'pass', (multi ? 'Every size: ' : '') + 'lengths match' + (plan ? ' the planned ' + f2(plan) + ' cm ease' : '') + ' within 3 mm.');
    });
    Object.keys(cap).forEach(function (k) { var c = cap[k], e = c.s - c.b;
      var st = e < -.3 ? 'fail' : e > 5 ? 'warn' : 'info', msg = 'Sleeve cap ' + f2(c.s) + ' cm, armhole ' + f2(c.b) + ' cm: ease ' + f2(e) + ' cm.';
      add('Sleeve ease', c.name, c.size, st, msg + (e < -.3 ? ' The cap is shorter than the armhole, so the sleeve cannot be set in.' : e > 5 ? ' Over 5 cm is hard to ease in without puckers.' : ' Shirts usually take 0 to 1.5 cm, set-in sleeves in woven fabric 1.5 to 4 cm, knits about 0.'));
    });
    return K.sum(rows);
  };
  K.sum = function (rows) { var s = { pass: 0, warn: 0, fail: 0, info: 0 }; rows.forEach(function (r) { s[r.st]++; }); return { rows: rows, sum: s, at: new Date().toISOString() }; };

  /* ---------- scale and round trip ---------- */
  K.parseDXF = function (txt) { // POLYLINE/VERTEX, LWPOLYLINE and LINE in the ENTITIES section, with $INSUNITS
    var L = String(txt).split(/\r?\n/), ents = [], units = null, inEnt = false, cur = null, poly = null;
    for (var i = 0; i + 1 < L.length; i += 2) { var c = L[i].trim(), v = L[i + 1].trim();
      if (c === '9' && v === '$INSUNITS') units = +L[i + 3].trim();
      if (c === '2' && v === 'ENTITIES') { inEnt = true; continue; } if (c === '0' && v === 'ENDSEC') { inEnt = false; continue; } if (!inEnt) continue;
      if (c === '0') { if (v === 'POLYLINE') { poly = { layer: '0', pts: [], closed: false }; cur = poly; } else if (v === 'VERTEX' && poly) cur = { v: 1 }; else if (v === 'SEQEND') { if (poly) ents.push(poly); poly = cur = null; } else if (v === 'LWPOLYLINE') { cur = { layer: '0', pts: [], closed: false }; ents.push(cur); } else cur = null; continue; }
      if (!cur) continue;
      if (c === '8' && !cur.v) cur.layer = v; if (c === '70' && !cur.v) cur.closed = !!(+v & 1);
      var tgt = cur.v ? poly : cur; if (c === '10') tgt.pts.push([+v, 0]); if (c === '20' && tgt.pts.length) tgt.pts[tgt.pts.length - 1][1] = +v; }
    return { ents: ents, units: units };
  };
  var UNITMM = { 1: 25.4, 4: 1, 5: 10 };
  function side(pts) { var xs = pts.map(function (q) { return q[0]; }), ys = pts.map(function (q) { return q[1]; }); return [Math.max.apply(null, xs) - Math.min.apply(null, xs), Math.max.apply(null, ys) - Math.min.apply(null, ys)]; }
  function perim(p) { var s = 0; for (var i = 0; i < p.length; i++) { var a = p[i], b = p[(i + 1) % p.length]; s += Math.hypot(b[0] - a[0], b[1] - a[1]); } return s; }
  function pdfRects(txt) { // the first closed path drawn in each page stream: "x y m x y l ... h S"
    var out = [], re = /([-\d.]+) ([-\d.]+) m ((?:[-\d.]+ [-\d.]+ l ?)+) ?h S/g, m; while ((m = re.exec(txt))) { var pts = [[+m[1], +m[2]]], r2 = /([-\d.]+) ([-\d.]+) l/g, k; while ((k = r2.exec(m[3]))) pts.push([+k[1], +k[2]]); out.push(pts); } return out;
  }
  /* X = the exporter (window.PMX); P = the project (optional, for the round trip). Calls cb(rows) because PDF blobs are read asynchronously. */
  K.scale = function (C, X, P, cb) {
    var rows = [], add = function (item, st, msg) { rows.push({ cat: 'Scale', item: item, size: '', st: st, msg: msg }); }, T = K.TOL.scaleMm;
    var sq = [[2, 2], [12, 2], [12, 12], [2, 12]], sc = [{ k: 'poly', p: sq, c: 1, w: .05, L: 'CUT' }], W = 14, H = 14;
    var judge = function (item, mm, extra) { var e = Math.max(Math.abs(mm[0] - 100), Math.abs(mm[1] - 100)); add(item, e <= T ? 'pass' : 'fail', '100 mm control square measures ' + mm[0].toFixed(2) + ' × ' + mm[1].toFixed(2) + ' mm' + (extra || '') + (e <= T ? ' (within ' + T + ' mm).' : ': off by ' + e.toFixed(2) + ' mm.')); };
    try { // SVG: physical size from width/height attributes and the viewBox
      ['mm', 'cm', 'in'].forEach(function (u) { var s = X.svg(sc, W, H, u, {}), w = s.match(/ width="([\d.]+)(mm|cm|in)"/), vb = s.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/), pm = s.match(/<path d="M([^"]+)Z"/);
        var mmPerUnit = (+w[1] * { mm: 1, cm: 10, in: 25.4 }[w[2]]) / +vb[1], pts = pm[1].split('L').map(function (t) { var a = t.trim().split(/\s+/); return [+a[0], +a[1]]; }), sd = side(pts); judge('SVG (' + u + ')', [sd[0] * mmPerUnit, sd[1] * mmPerUnit]); });
    } catch (e) { add('SVG', 'fail', 'Could not be checked: ' + e.message); }
    try { // DXF in each unit, read back with $INSUNITS
      ['mm', 'in'].forEach(function (u) { var d = K.parseDXF(X.dxf(sc, W, H, u)), e = d.ents.filter(function (x) { return x.layer === 'CUT'; })[0], k = UNITMM[d.units]; if (!e || !k) throw Error('no CUT polyline or units in the file'); var sd = side(e.pts); judge('DXF (' + u + ', $INSUNITS ' + d.units + ')', [sd[0] * k, sd[1] * k]); });
      if (C.exportDXF) ['mm', 'cm', 'in'].forEach(function (u) { var pr = { pieces: [C.rect(0, 0, 10, 10, { name: 'Control' })], sewing: [] }; pr.pieces[0].sa.def = 0; pr.pieces[0].sa.hem = 0; var d = K.parseDXF(C.exportDXF(pr, { unit: u })), e = d.ents.filter(function (x) { return x.layer === 'CUT'; })[0], k = UNITMM[d.units]; var sd = side(e.pts); judge('Edited-pieces DXF (' + u + ')', [sd[0] * k, sd[1] * k]); });
    } catch (e) { add('DXF', 'fail', 'Could not be checked: ' + e.message); }
    // round trip: every piece's cutting line out to DXF (mm) and back
    if (P && P.pieces && P.pieces.filter(function (p) { return !p.hidden; }).length) try {
      var vis = P.pieces.filter(function (p) { return !p.hidden; }), sc2 = [], H2 = 0;
      vis.forEach(function (pc) { var cl = C.cutLine(pc).pts.map(function (q) { return [q[0] + (pc.x || 0), q[1] + (pc.y || 0)]; }); cl.forEach(function (q) { H2 = Math.max(H2, q[1]); }); sc2.push({ k: 'poly', p: cl, c: 1, L: 'CUT', id: pc.id }); });
      var d2 = K.parseDXF(X.dxf(sc2, 100, H2 + 2, 'mm')), back = d2.ents.filter(function (x) { return x.layer === 'CUT'; }), worst = 0, wn = '';
      sc2.forEach(function (o, i) { var a = perim(o.p) * 10, b = back[i] ? perim(back[i].pts) * UNITMM[d2.units] : 0, e = Math.abs(a - b); if (e > worst) { worst = e; wn = (vis[i].name || 'piece'); } });
      add('DXF round trip', back.length === sc2.length && worst <= K.TOL.roundTripMm ? 'pass' : 'fail', back.length + ' of ' + sc2.length + ' piece outlines read back from a millimetre DXF; largest difference in cutting-line length ' + worst.toFixed(2) + ' mm' + (wn && worst > .005 ? ' (' + wn + ')' : '') + '.');
    } catch (e) { add('DXF round trip', 'fail', 'Could not be checked: ' + e.message); }
    // PDF: read the content stream back (points → mm); sheet and tiled
    var modes = ['sheet', 'tiles'], left = modes.length;
    modes.forEach(function (md) {
      var r; try { r = X.pdf(sc, W, H, md, { title: 'Scale check' }); } catch (e) { add('PDF (' + md + ')', 'fail', 'Could not be checked: ' + e.message); if (!--left) cb(rows); return; }
      r.blob.text().then(function (t) { var rr = pdfRects(t)[0]; if (!rr) throw Error('no path found'); var sd = side(rr), k = 25.4 / 72; judge(md === 'sheet' ? 'PDF, full sheet' : 'PDF, tiled ' + (X.paper ? X.paper().n : ''), [sd[0] * k, sd[1] * k], ' at 72 points per inch'); })
        .catch(function (e) { add('PDF (' + md + ')', 'fail', 'Could not be checked: ' + e.message); }).then(function () { if (!--left) { var o = ['SVG', 'DXF', 'Edited', 'PDF']; rows.sort(function (a, b) { return o.findIndex(function (x) { return a.item.indexOf(x) === 0; }) - o.findIndex(function (x) { return b.item.indexOf(x) === 0; }); }); cb(rows); } });
    });
  };

  /* ---------- grade-rule table ---------- */
  K.rules = function (C, P, unit) {
    var G = C.gradeSet(P), f = (C.UNITS[unit] || C.UNITS.cm).f, out = [['Piece', 'Point', 'Point ID', 'Size', 'X (' + (unit || 'cm') + ')', 'Y (' + (unit || 'cm') + ')', 'Base size']];
    P.pieces.filter(function (p) { return !p.hidden; }).forEach(function (pc) { if (!C.isGraded(pc)) return; pc.nodes.forEach(function (nd, i) { var own = G.list.some(function (sz) { return pc.grade[sz] && pc.grade[sz][nd.id]; }); if (!own) return;
      G.list.forEach(function (sz) { if (sz === G.base) return; var d = (pc.grade[sz] || {})[nd.id] || [0, 0]; out.push([pc.name, i + 1, nd.id, sz, +(d[0] * f).toFixed(4), +(d[1] * f).toFixed(4), G.base]); }); }); });
    return out;
  };
  K.applyRules = function (C, P, rows, unit) { // rows without the header; match the piece by name and the point by ID, then by number
    var f = (C.UNITS[unit] || C.UNITS.cm).f, G = C.gradeSet(P), done = 0, miss = [], sizes = {};
    rows.forEach(function (r) { if (r.length < 6) return; var pc = P.pieces.filter(function (p) { return (p.name || '').trim().toLowerCase() === String(r[0]).trim().toLowerCase(); })[0]; if (!pc) { if (miss.indexOf(r[0]) < 0) miss.push(r[0]); return; }
      var nd = pc.nodes.filter(function (n) { return n.id === String(r[2]).trim(); })[0] || pc.nodes[(+r[1] || 0) - 1]; var sz = String(r[3]).trim(), x = +r[4], y = +r[5]; if (!nd || !sz || !isFinite(x) || !isFinite(y)) return;
      pc.grade = pc.grade || {}; pc.grade[sz] = pc.grade[sz] || {}; pc.grade[sz][nd.id] = [+(x / f).toFixed(4), +(y / f).toFixed(4)]; sizes[sz] = 1; done++; });
    var add = Object.keys(sizes).filter(function (s) { return G.list.indexOf(s) < 0; }); return { done: done, missing: miss, newSizes: add };
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = K; return; }
  root.FCCheck = K;

  /* ---------- Garment Studio wiring ---------- */
  var LAST = null;
  function S() { return root.FCStudio; }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var LBL = { pass: 'Pass', warn: 'Check', fail: 'Fail', info: 'Note' };
  function csv(rows) { return rows.map(function (r) { return r.map(function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\n'); }
  function splitCSV(t) { var out = [], row = [], cur = '', q = false; for (var i = 0; i < t.length; i++) { var ch = t[i]; if (q) { if (ch === '"' && t[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; } else if (ch === '"') q = true; else if (ch === ',' || ch === '\t' || ch === ';') { row.push(cur); cur = ''; } else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; row.push(cur); out.push(row); row = []; cur = ''; } else cur += ch; } if (cur || row.length) { row.push(cur); out.push(row); } return out.filter(function (r) { return r.some(function (v) { return String(v).trim(); }); }); }
  function stamp() { var F = root.ForecutStyle, s = F && F.active && F.active(); return s ? s.id + ' · ' + s.name + ' · Rev ' + (s.rev || 1) : ''; }
  function render(res, scale) {
    var all = res.rows.concat(scale || []), s = K.sum(all).sum, st = S(), P = st.P(), G = root.FCCad.gradeSet(P);
    var verdict = s.fail ? 'fail' : s.warn ? 'warn' : 'pass';
    var h = '<div class="pck"><div class="pck-h"><div><h4>Pattern check</h4><p class="ps-n">' + esc(P.name || 'Pattern') + (stamp() ? ' · ' + esc(stamp()) : '') + ' · ' + (G.list.length ? 'sizes ' + esc(G.list.join(', ')) + ', base ' + esc(G.base) : 'one size') + ' · ' + new Date(res.at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) + '</p></div><button type="button" class="ps-b" data-a="mclose" aria-label="Close">×</button></div>'
      + '<div class="pck-sum"><span class="pck-v ' + verdict + '">' + (s.fail ? s.fail + ' to fix' : s.warn ? 'Passes, ' + s.warn + ' to check' : 'All checks pass') + '</span><span class="pass">' + s.pass + ' pass</span><span class="warn">' + s.warn + ' check</span><span class="fail">' + s.fail + ' fail</span><span class="info">' + s.info + ' notes</span>'
      + '<label><input type="checkbox" id="pck-hide"' + (K.hidePass ? ' checked' : '') + '> Hide passes</label></div>'
      + '<div class="pck-t"><table><thead><tr><th>Result</th><th>Check</th><th>Item</th><th>Size</th><th>Detail</th></tr></thead><tbody>'
      + all.map(function (r) { return '<tr class="' + r.st + '"' + (K.hidePass && r.st === 'pass' ? ' hidden' : '') + '><td><b class="pck-b ' + r.st + '">' + LBL[r.st] + '</b></td><td>' + esc(r.cat) + '</td><td>' + esc(r.item) + '</td><td>' + esc(r.size) + '</td><td>' + esc(r.msg) + '</td></tr>'; }).join('') + '</tbody></table></div>'
      + (scale ? '' : '<p class="ps-n">Checking export scale…</p>')
      + '<p class="ps-n">Tolerances: seam lengths ±3 mm against the planned ease, notches ±3 mm, export scale ±' + K.TOL.scaleMm + ' mm on a 100 mm square, DXF round trip ±' + K.TOL.roundTripMm + ' mm on each cutting line. These checks are about the geometry of the file; fit still has to be confirmed on a sample.</p>'
      + '<div class="ps-bs"><button type="button" class="ps-b pri" data-a="x4:csv">Download report (CSV)</button><button type="button" class="ps-b" data-a="x4:print">Print / save PDF</button><button type="button" class="ps-b" data-a="x4:report">Run again</button></div></div>';
    st.modal(h, function () { var c = document.getElementById('pck-hide'); if (c) c.onchange = function () { K.hidePass = c.checked; document.querySelectorAll('.pck-t tr.pass').forEach(function (tr) { tr.hidden = c.checked; }); }; });
    var box = document.querySelector('#ps-modal .ps-mbox'); if (box) box.classList.add('pck-box');
  }
  function report() {
    var st = S(), C = root.FCCad, P = st.P(), res = K.run(C, P); LAST = { res: res, scale: null }; render(res, null);
    if (root.PMX) K.scale(C, root.PMX, P, function (rows) { LAST.scale = rows; if (document.querySelector('.pck')) render(res, rows); });
  }
  function rowsForExport() { var all = LAST.res.rows.concat(LAST.scale || []); return [['Result', 'Check', 'Item', 'Size', 'Detail']].concat(all.map(function (r) { return [LBL[r.st], r.cat, r.item, r.size, r.msg]; })); }
  function printReport() {
    var st = S(), P = st.P(), all = LAST.res.rows.concat(LAST.scale || []), s = K.sum(all).sum, kit = {}; try { kit = JSON.parse(localStorage.getItem('fc-brand-kit') || '{}'); } catch (e) { }
    var brand = kit.name || kit.brand || 'Forecut', w = window.open('', '_blank'); if (!w) return st.toast('Allow pop-ups to print the report.', 1);
    w.document.write('<!doctype html><meta charset="utf-8"><title>' + esc((stamp() ? stamp().split(' · ')[0] + ' ' : '') + 'Pattern check · ' + (P.name || 'Pattern')) + '</title><style>body{font:11px/1.45 Helvetica,Arial,sans-serif;color:#1b1d20;margin:16mm}h1{font:600 22px Georgia,serif;margin:0 0 2px}.m{color:#555;margin:0 0 10px}.s span{display:inline-block;margin-right:14px;font-weight:700}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{text-align:left;padding:5px 6px;border-bottom:1px solid #ddd;vertical-align:top}th{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#666}.pass b{color:#1a7a45}.warn b{color:#9a6400}.fail b{color:#b03a2e}.info b{color:#555}tr{break-inside:avoid}.f{margin-top:14px;color:#666;font-size:10px}@page{size:A4;margin:12mm}</style>'
      + '<div style="font:700 11px Helvetica;letter-spacing:.12em;text-transform:uppercase;color:#a9481f">' + esc(brand) + '</div><h1>Pattern check</h1><p class="m">' + esc(P.name || 'Pattern') + (stamp() ? ' · ' + esc(stamp()) : '') + ' · ' + new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }) + '</p>'
      + '<p class="s"><span style="color:#1a7a45">' + s.pass + ' pass</span><span style="color:#9a6400">' + s.warn + ' to check</span><span style="color:#b03a2e">' + s.fail + ' fail</span><span>' + s.info + ' notes</span></p>'
      + '<table><tr><th>Result</th><th>Check</th><th>Item</th><th>Size</th><th>Detail</th></tr>' + all.map(function (r) { return '<tr class="' + r.st + '"><td><b>' + LBL[r.st] + '</b></td><td>' + esc(r.cat) + '</td><td>' + esc(r.item) + '</td><td>' + esc(r.size) + '</td><td>' + esc(r.msg) + '</td></tr>'; }).join('') + '</table>'
      + '<p class="f">Seam lengths ±3 mm, notches ±3 mm, export scale ±' + K.TOL.scaleMm + ' mm on a 100 mm control square, DXF round trip ±' + K.TOL.roundTripMm + ' mm. Geometry checks only: confirm fit on a sample before production.</p><script>setTimeout(function(){print()},300)<\/script>');
    w.document.close();
  }
  K.act = function (a) {
    var st = S(); if (!st) return; var C = root.FCCad, P = st.P();
    if (a === 'report') return report();
    if (a === 'csv') { if (!LAST) report(); return st.dl(st.fname('pattern-check.csv'), csv(rowsForExport()), 'text/csv'); }
    if (a === 'print') { if (!LAST) report(); return printReport(); }
    if (a === 'rulecsv') { var r = K.rules(C, P, P.unit); if (r.length < 2) return st.toast('No graded points yet. Grade some points first.', 1); st.dl(st.fname('grade-rules.csv'), csv(r), 'text/csv'); return st.toast((r.length - 1) + ' grade rules downloaded (' + (P.unit || 'cm') + ', offsets from the base size).'); }
    if (a === 'ruleimp') { var inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.csv,.txt,text/csv'; inp.onchange = function () { var fl = inp.files[0]; if (!fl) return; fl.text().then(function (t) { var rows = splitCSV(t); if (rows.length && isNaN(+rows[0][4])) rows.shift(); var hd = (t.split(/\r?\n/)[0] || ''), u = /\(mm\)/.test(hd) ? 'mm' : /\(in\)/.test(hd) ? 'in' : /\(cm\)/.test(hd) ? 'cm' : P.unit; var res;
      st.act('Import grade rules', function () { res = K.applyRules(C, P, rows, u); if (!res.done) return false; var G = C.gradeSet(P); res.newSizes.forEach(function (s) { G.list.push(s); }); });
      if (!res || !res.done) return st.toast('No grade rules matched. The file needs Piece, Point, Point ID, Size, X and Y columns, with piece names as in this pattern.', 1);
      st.toast(res.done + ' grade rules imported in ' + u + '.' + (res.missing.length ? ' No piece called ' + res.missing.slice(0, 3).join(', ') + '.' : '') + (res.newSizes.length ? ' Added sizes ' + res.newSizes.join(', ') + ' at the end of the list: reorder them if needed.' : '')); }); }; inp.click(); return; }
  };
  var css = document.createElement('style'); css.textContent = '.ps-mbox.pck-box{max-width:min(1100px,96vw);width:96vw;max-height:92vh;overflow:auto}.pck-h{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.pck-h h4{margin:0}.pck-sum{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;margin:10px 0}.pck-sum span{font:700 12px "DM Sans",sans-serif}.pck-sum .pass{color:#4fbf7f}.pck-sum .warn{color:#e3a33b}.pck-sum .fail{color:#ef6b5b}.pck-sum .info{color:#9aa0a6}.pck-sum label{margin-left:auto;font-size:12px;display:flex;gap:6px;align-items:center}.pck-v{padding:5px 11px;border-radius:99px;color:#111!important}.pck-v.pass{background:#4fbf7f}.pck-v.warn{background:#e3a33b}.pck-v.fail{background:#ef6b5b}'
    + '.pck-t{max-height:56vh;overflow:auto;border:1px solid rgba(255,255,255,.1);border-radius:8px}.pck-t table{width:100%;border-collapse:collapse;font-size:12.5px}.pck-t th{position:sticky;top:0;background:#1d1f22;text-align:left;padding:7px 8px;font-size:11px;color:#9aa0a6}.pck-t td{padding:6px 8px;border-top:1px solid rgba(255,255,255,.07);vertical-align:top}.pck-b{font:700 10.5px "DM Sans",sans-serif;text-transform:uppercase;letter-spacing:.05em;padding:2px 7px;border-radius:5px;color:#111}.pck-b.pass{background:#4fbf7f}.pck-b.warn{background:#e3a33b}.pck-b.fail{background:#ef6b5b}.pck-b.info{background:#9aa0a6}';
  document.head.appendChild(css);
})(typeof self !== 'undefined' ? self : this);
