/* Forecut Garment Studio: DXF export with options.
   ASTM D6673 / AAMA style: one block per piece, numbered layers (1 boundary, 2 turn points, 3 curve points, 4 notches, 6 mirror line,
   7 grain line, 8 internal lines, 11 cut-outs, 13 drill holes, 14 sew line, 15 annotation), piece information as layer-1 text, and grading
   as "# n" rule numbers on the grade points with a separate .RUL rule table (offsets from the sample size, in size-list order).
   Plain DXF: named layers for CAD, laser and plotters. Works from the edited pieces or straight from the draft (graded from the size chart). */
(function () {
  'use strict';
  var C = window.FCCad; if (!C) return;
  function S() { return window.FCStudio; }
  function toast(t, bad) { if (S() && S().toast && S().on()) return S().toast(t, bad); var u = window.PMUI; if (u && u.toast) u.toast(t); else if (t) console.log(t); }
  function n(v) { return (Math.round(v * 1000) / 1000).toFixed(3); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ascii(t) { return String(t == null ? '' : t).replace(/[^\x20-\x7e]/g, '-'); }

  /* ---------- the pieces to export, with their grade ---------- */
  function fromEdit(o) {
    var P = S().P(), sel = o.selected ? S().selected() : null, out = null;
    S().withShrink(function () { out = (sel && sel.length ? sel : P.pieces).filter(function (p) { return !p.hidden; }).map(function (p) { return C.clone(p); }); });
    var g = C.gradeSet(P); return { pcs: out, list: g.list.slice(), base: g.base, name: P.name || 'Pattern', fabrics: P.fabrics || [] };
  }
  function fromDraft() {
    var UI = window.PMUI, last = UI && UI.last && UI.last(); if (!last || !last.r) return null;
    var s = UI.S(), base = UI.baseSize(), pcs = C.fromDraft(last.r, { size: s.size === 'custom' ? 'Custom' : s.size, sa: s.sa, hem: s.hemA, dept: s.gender }), x = 0;
    pcs.forEach(function (pc, i) { var st = (s.pc || {})[last.r.pieces[i].id] || {}; if (st.sa != null) pc.sa.def = st.sa; if (st.hem != null) pc.sa.hem = st.hem; if (st.name) pc.name = st.name; pc._skip = st.on === false; var b = C.bbox(pc); pc.x = x - b[0] + 2; pc.y = 2 - b[1]; x += b[2] - b[0] + 6; });
    pcs = pcs.filter(function (pc) { return !pc._skip; });
    var list = [];
    if (s.size !== 'custom') { var szs = UI.sizes(), basePcs = UI.draftAt(base).pieces, per = {};
      szs.forEach(function (sz) { try { per[sz] = UI.draftAt(sz).pieces; list.push(sz); } catch (e) {} });
      pcs.forEach(function (pc) { var bp = basePcs.filter(function (q) { return q.id === pc.src; })[0]; if (!bp) return; var m = {}; list.forEach(function (sz) { var sp = per[sz].filter(function (q) { return q.id === pc.src; })[0]; if (sp) m[sz] = sp; }); C.autoGradeDraft(pc, bp, m, 1.5); }); }
    var nm = (window.PM && PM.GARMENTS && PM.GARMENTS[s.gid] ? PM.GARMENTS[s.gid].n : 'Pattern');
    return { pcs: pcs, list: list, base: s.size === 'custom' ? 'Custom' : base, name: nm, fabrics: [] };
  }

  /* fixed point sequences, so every size has the same number of points (needed for grade rules) */
  var CURVE_N = 12;
  function segFixed(pc, i) { var k = C.ctrl(pc, i); if (!k.curved) return [[k.p0, 1]]; var o = [[k.p0, 1]]; for (var j = 1; j < CURVE_N; j++) o.push([C.pointAt(pc, i, j / CURVE_N), 0]); return o; }
  function seamFixed(pc) { var o = [], nS = C.segCount(pc); for (var i = 0; i < nS; i++) o = o.concat(segFixed(pc, i).map(function (q) { return { p: q[0], turn: q[1] }; })); return o; }
  function nrm(v) { var l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }
  function lineX(p, d, q, e) { var den = d[0] * e[1] - d[1] * e[0]; if (Math.abs(den) < 1e-9) return null; var t = ((q[0] - p[0]) * e[1] - (q[1] - p[1]) * e[0]) / den; return [p[0] + d[0] * t, p[1] + d[1] * t]; }
  function areaOf(P) { var a = 0; for (var i = 0; i < P.length; i++) { var p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; }
  function cutFixed(pc) { // the cutting line with a fixed number of points, same rules as the editor (mitred, squared or stepped corners)
    var nS = C.segCount(pc), seam = seamFixed(pc).map(function (q) { return q.p; }), sgn = areaOf(seam) > 0 ? -1 : 1, offs = [], out = [], i;
    for (i = 0; i < nS; i++) { var d = C.saOf(pc, i), k = C.ctrl(pc, i), pts = segFixed(pc, i).map(function (q) { return q[0]; }).concat([k.p3]), o = [];
      for (var j = 0; j < pts.length; j++) { var a = pts[Math.max(0, j - 1)], b = pts[Math.min(pts.length - 1, j + 1)], t = nrm([b[0] - a[0], b[1] - a[1]]); o.push([pts[j][0] - t[1] * sgn * d, pts[j][1] + t[0] * sgn * d]); }
      offs.push({ o: o, d: d, t0: nrm([pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]]), t1: nrm([pts[pts.length - 1][0] - pts[pts.length - 2][0], pts[pts.length - 1][1] - pts[pts.length - 2][1]]) }); }
    for (i = 0; i < nS; i++) { var A = offs[i], B = offs[(i + 1) % nS], aEnd = A.o[A.o.length - 1], bStart = B.o[0], corner = pc.sa.corner[(i + 1) % nS] || 'miter';
      A.o.slice(0, -1).forEach(function (q, j) { out.push({ p: q, turn: j === 0 ? 1 : (C.ctrl(pc, i).curved ? 0 : 1) }); });
      if (A.d === 0 && B.d === 0) { out.push({ p: aEnd, turn: 1 }); continue; }
      var x = lineX(aEnd, A.t1, bStart, B.t0), node = C.ctrl(pc, (i + 1) % nS).p0, far = !x || Math.hypot(x[0] - node[0], x[1] - node[1]) > Math.max(A.d, B.d) * 3;
      if (corner === 'step') { out.push({ p: aEnd, turn: 1 }); out.push({ p: bStart, turn: 1 }); }
      else if (corner === 'square' || far) { out.push({ p: [aEnd[0] + A.t1[0] * A.d, aEnd[1] + A.t1[1] * A.d], turn: 1 }); out.push({ p: [bStart[0] - B.t0[0] * B.d, bStart[1] - B.t0[1] * B.d], turn: 1 }); }
      else out.push({ p: x, turn: 1 }); }
    // drop the duplicate start (each segment's first offset point repeats the previous join)
    var clean = []; out.forEach(function (q) { var l = clean[clean.length - 1]; if (!l || Math.hypot(l.p[0] - q.p[0], l.p[1] - q.p[1]) > 1e-4) clean.push(q); });
    if (clean.length > 1 && Math.hypot(clean[0].p[0] - clean[clean.length - 1].p[0], clean[0].p[1] - clean[clean.length - 1].p[1]) < 1e-4) clean.pop();
    return clean;
  }

  /* ---------- the export itself ---------- */
  function build(src, o) {
    var M = o.unit === 'in' ? 1 / 2.54 : o.unit === 'cm' ? 1 : 10, sc = (o.scale || 100) / 100, rot = (+o.rot || 0) * Math.PI / 180, cr = Math.cos(rot), sr = Math.sin(rot);
    var sizes = o.sizes === 'base' || src.list.length < 2 || o.noGrade ? [src.base] : src.list.slice(), graded = sizes.length > 1;
    var pcs = src.pcs; if (!pcs.length) return { err: 'There are no pieces to export.' };
    // world points of a piece in one size, before the global transform
    function shape(pc, sz) {
      var g = sz && sz !== src.base && C.isGraded(pc) ? C.gradedPiece(pc, sz, src.base) : pc, ox = pc.x || 0, oy = pc.y || 0, w = function (q) { return [q[0] + ox, q[1] + oy]; };
      var seam = seamFixed(g).map(function (q) { return { p: w(q.p), turn: q.turn }; }), hasSA = !o.noSA && C.cutLine(g, true).pts.length && (g.sa.def > 0 || g.sa.hem > 0 || Object.keys(g.sa.edges || {}).some(function (k) { return +g.sa.edges[k] > 0; }));
      var cut = hasSA ? cutFixed(g).map(function (q) { return { p: w(q.p), turn: q.turn }; }) : seam;
      var sgn = areaOf(seam.map(function (q) { return q.p; })) > 0 ? -1 : 1, notches = [];
      g.notches.forEach(function (nt) { if (nt.seg >= C.segCount(g)) return; var r = C.notchPos(g, nt), nv = [-r.tan[1] * sgn, r.tan[0] * sgn], d0 = hasSA ? C.saOf(g, nt.seg) : 0; notches.push({ on: w([r.p[0] + nv[0] * d0, r.p[1] + nv[1] * d0]), seam: w(r.p) }); });
      var grain = g.grain ? [w(g.grain.a), w(g.grain.b)] : null, fold = g.fold >= 0 && g.fold < C.segCount(g) ? [w(C.ctrl(g, g.fold).p0), w(C.ctrl(g, g.fold).p3)] : null;
      var lines = [], cuts = [], drills = [];
      g.internals.forEach(function (it) { if (it.visible === false) return; var pts = it.kind === 'ellipse' ? (function () { var r2 = []; for (var k = 0; k < 24; k++) { var a = k / 24 * Math.PI * 2; r2.push([it.c[0] + it.r[0] * Math.cos(a), it.c[1] + it.r[1] * Math.sin(a)]); } return r2; })() : it.pts; pts = pts.map(w);
        if (it.purpose === 'cutting' && pts.length === 1) drills.push(pts[0]); else if (it.purpose === 'cutout') cuts.push({ p: pts, c: true }); else lines.push({ p: pts, c: it.kind === 'rect' || it.kind === 'ellipse' || it.kind === 'dart' }); });
      g.darts.forEach(function (d) { if (d.kind !== 'outline') return; var I = C.dartInfo(g, d); if (!I) return; lines.push({ p: [w(I.mid), w(I.apex)], c: false }); var u = [I.mid[0] - I.apex[0], I.mid[1] - I.apex[1]], ul = Math.hypot(u[0], u[1]) || 1; if (d.drill !== false) drills.push(w([I.apex[0] + u[0] / ul, I.apex[1] + u[1] / ul])); });
      return { seam: seam, cut: cut, hasSA: hasSA, notches: notches, grain: grain, fold: fold, lines: lines, cuts: cuts, drills: drills };
    }
    var base = pcs.map(function (pc) { return shape(pc, src.base); });
    // global transform: rotate, scale, then move into the positive quadrant (DXF y points up)
    var all = []; base.forEach(function (b) { b.cut.forEach(function (q) { all.push(q.p); }); });
    if (graded) pcs.forEach(function (pc) { sizes.forEach(function (sz) { if (sz !== src.base) shape(pc, sz).cut.forEach(function (q) { all.push(q.p); }); }); });
    var R = function (q) { return [(q[0] * cr - q[1] * sr) * sc, (q[0] * sr + q[1] * cr) * sc]; }, rb = [1e9, 1e9, -1e9, -1e9]; all.forEach(function (q) { var r2 = R(q); rb[0] = Math.min(rb[0], r2[0]); rb[1] = Math.min(rb[1], r2[1]); rb[2] = Math.max(rb[2], r2[0]); rb[3] = Math.max(rb[3], r2[1]); });
    var T = function (q) { var r2 = R(q); return [(r2[0] - rb[0] + 1) * M, (rb[3] - r2[1] + 1) * M]; }, TV = function (v) { var r2 = [(v[0] * cr - v[1] * sr) * sc, (v[0] * sr + v[1] * cr) * sc]; return [r2[0] * M, -r2[1] * M]; };
    var L = []; function a() { for (var i = 0; i < arguments.length; i++) L.push(arguments[i]); }
    function txtE(ly, q, s, h) { a('0', 'TEXT', '8', ly, '10', n(q[0]), '20', n(q[1]), '40', n(h), '1', ascii(s)); }
    function polyE(ly, pts, closed) { a('0', 'POLYLINE', '8', ly, '66', '1', '70', closed ? '1' : '0', '10', '0.0', '20', '0.0'); pts.forEach(function (q) { a('0', 'VERTEX', '8', ly, '10', n(q[0]), '20', n(q[1])); }); a('0', 'SEQEND', '8', ly); }
    function ptE(ly, q) { a('0', 'POINT', '8', ly, '10', n(q[0]), '20', n(q[1])); }
    function lineE(ly, p1, p2) { a('0', 'LINE', '8', ly, '10', n(p1[0]), '20', n(p1[1]), '11', n(p2[0]), '21', n(p2[1])); }
    var units = o.unit === 'in' ? 'ENGLISH' : 'METRIC', ins = o.unit === 'in' ? 1 : o.unit === 'cm' ? 5 : 4, style = ascii(src.name).replace(/[^A-Za-z0-9 _-]/g, '').trim() || 'FORECUT';
    var th = o.unit === 'in' ? .25 : o.unit === 'cm' ? .6 : 6;
    a('0', 'SECTION', '2', 'HEADER', '9', '$ACADVER', '1', 'AC1009', '9', '$INSUNITS', '70', String(ins), '0', 'ENDSEC');

    if (o.format === 'plain') {
      var layers = ['CUT', 'SEAM', 'NOTCH', 'GRAIN', 'FOLD', 'INTERNAL', 'DRILL', 'TEXT'].concat(o.box ? ['BOX'] : []).concat(graded ? sizes.filter(function (sz) { return sz !== src.base; }).map(function (sz) { return 'SIZE_' + ascii(sz).replace(/[^A-Za-z0-9]/g, ''); }) : []);
      a('0', 'SECTION', '2', 'TABLES', '0', 'TABLE', '2', 'LAYER', '70', String(layers.length)); layers.forEach(function (l, i) { a('0', 'LAYER', '2', l, '70', '0', '62', String([7, 8, 1, 3, 30, 5, 6, 7, 2][i] || (i % 9) + 1), '6', 'CONTINUOUS'); }); a('0', 'ENDTAB', '0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES');
      pcs.forEach(function (pc, i) { var b = base[i];
        polyE('CUT', b.cut.map(function (q) { return T(q.p); }), true); if (b.hasSA) polyE('SEAM', b.seam.map(function (q) { return T(q.p); }), true);
        b.notches.forEach(function (nt) { var on = T(nt.on), sm = T(nt.seam); lineE('NOTCH', on, [on[0] + (sm[0] - on[0]) * .35 + (sm[0] === on[0] ? 0 : 0), on[1] + (sm[1] - on[1]) * .35]); if (o.dupNotch && b.hasSA) ptE('NOTCH', sm); });
        if (b.grain) lineE('GRAIN', T(b.grain[0]), T(b.grain[1])); if (b.fold) lineE('FOLD', T(b.fold[0]), T(b.fold[1]));
        b.lines.forEach(function (l) { polyE('INTERNAL', l.p.map(T), l.c); }); b.cuts.forEach(function (l) { polyE('CUT', l.p.map(T), true); }); b.drills.forEach(function (q) { ptE('DRILL', T(q)); });
        if (o.text) { var bb = C.bbox(pc), c = T([(bb[0] + bb[2]) / 2 + (pc.x || 0), (bb[1] + bb[3]) / 2 + (pc.y || 0)]); txtE('TEXT', c, pc.name || 'Piece', th); txtE('TEXT', [c[0], c[1] - th * 1.6], 'Size ' + src.base + ' - Cut ' + pc.qty + (pc.pair ? ' pair' : '') + (pc.fold >= 0 ? ' on fold' : ''), th * .7); }
        if (o.box) { var xs = b.cut.map(function (q) { return T(q.p); }), x0 = Math.min.apply(0, xs.map(function (q) { return q[0]; })), x1 = Math.max.apply(0, xs.map(function (q) { return q[0]; })), y0 = Math.min.apply(0, xs.map(function (q) { return q[1]; })), y1 = Math.max.apply(0, xs.map(function (q) { return q[1]; })); polyE('BOX', [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true); }
        if (graded) sizes.forEach(function (sz) { if (sz === src.base) return; polyE('SIZE_' + ascii(sz).replace(/[^A-Za-z0-9]/g, ''), shape(pc, sz).cut.map(function (q) { return T(q.p); }), true); }); });
      a('0', 'ENDSEC', '0', 'EOF'); return { dxf: L.join('\r\n') + '\r\n', sizes: sizes };
    }

    // ASTM / AAMA
    var rules = [], ruleKey = {}; function ruleFor(ds) { var k = ds.map(function (d) { return n(d[0]) + ',' + n(d[1]); }).join(' '); if (ruleKey[k]) return ruleKey[k]; rules.push(ds); ruleKey[k] = rules.length; return rules.length; }
    var each = o.sizes === 'each' && graded, blocks = [];
    var layerList = ['1', '2', '3', '4', '6', '7', '8', '11', '13', '14', '15'];
    a('0', 'SECTION', '2', 'TABLES', '0', 'TABLE', '2', 'LAYER', '70', String(layerList.length)); layerList.forEach(function (l) { a('0', 'LAYER', '2', l, '70', '0', '62', '7', '6', 'CONTINUOUS'); }); a('0', 'ENDTAB', '0', 'ENDSEC', '0', 'SECTION', '2', 'BLOCKS');
    function block(pc, i, b, szName, gradeOf) {
      var bn = ascii((pc.name || 'PIECE') + (szName ? '_' + szName : '')).replace(/[^A-Za-z0-9_-]+/g, '_').slice(0, 26) + '_' + (i + 1), boundary = b.cut.map(function (q) { return T(q.p); });
      blocks.push(bn); a('0', 'BLOCK', '8', '1', '2', bn, '70', '0', '10', '0.0', '20', '0.0');
      polyE('1', boundary, true);
      b.cut.forEach(function (q, k) { var t2 = T(q.p); ptE(q.turn ? '2' : '3', t2); if (gradeOf) { var r = gradeOf(k); if (r) txtE(q.turn ? '2' : '3', t2, '# ' + r, th * .5); } });
      if (b.hasSA) polyE('14', b.seam.map(function (q) { return T(q.p); }), true);
      b.notches.forEach(function (nt) { ptE('4', T(nt.on)); if (o.dupNotch && b.hasSA) ptE('4', T(nt.seam)); });
      if (b.fold) lineE('6', T(b.fold[0]), T(b.fold[1])); if (b.grain) lineE('7', T(b.grain[0]), T(b.grain[1]));
      b.lines.forEach(function (l) { polyE('8', l.p.map(T), l.c); }); b.cuts.forEach(function (l) { polyE('11', l.p.map(T), true); }); b.drills.forEach(function (q) { ptE('13', T(q)); });
      var c0 = boundary[0], gr = b.grain ? T(b.grain[0]) : c0, fab = (src.fabrics.filter(function (f) { return f.id === pc.fabric; })[0] || {}).name || 'SELF';
      ['Piece Name: ' + (pc.name || 'Piece ' + (i + 1)), szName ? 'Size Name: ' + szName : null, 'Quantity: ' + (pc.qty || 1) + (pc.pair ? ',' + (pc.qty || 1) : ''), 'Rotation: 0', 'Flip: ' + (pc.pair ? 'Y' : 'N'), 'Material: ' + fab, pc.fold >= 0 ? 'Fold: Y' : null, 'Category: ' + (pc.cat || pc.name || 'Piece')].filter(Boolean).forEach(function (t2, k) { txtE('1', [gr[0] + th, gr[1] - th * 1.5 * (k + 1)], t2, th * .6); });
      if (o.text) txtE('15', [gr[0] + th, gr[1] + th], (pc.name || 'Piece') + ' - ' + (szName || src.base), th);
      a('0', 'ENDBLK', '8', '1');
    }
    pcs.forEach(function (pc, i) {
      var b = base[i];
      if (each) { sizes.forEach(function (sz) { block(pc, i, sz === src.base ? b : shape(pc, sz), sz, null); }); return; }
      var grf = null;
      if (graded && C.isGraded(pc)) { var per = sizes.map(function (sz) { return sz === src.base ? b : shape(pc, sz); });
        grf = function (k) { var ok = per.every(function (s2) { return s2.cut.length === b.cut.length; }), ds;
          if (ok) ds = per.map(function (s2) { var d = TV([s2.cut[k].p[0] - b.cut[k].p[0], s2.cut[k].p[1] - b.cut[k].p[1]]); return d; });
          else { var bp = b.cut[k].p, best = 0, bd = 1e18; b.seam.forEach(function (sq, j) { var dd = (sq.p[0] - bp[0]) * (sq.p[0] - bp[0]) + (sq.p[1] - bp[1]) * (sq.p[1] - bp[1]); if (dd < bd) { bd = dd; best = j; } }); ds = per.map(function (s2) { return TV([s2.seam[best].p[0] - b.seam[best].p[0], s2.seam[best].p[1] - b.seam[best].p[1]]); }); }
          if (ds.every(function (d) { return Math.abs(d[0]) < 1e-4 && Math.abs(d[1]) < 1e-4; })) return ruleFor(ds);
          return ruleFor(ds); }; }
      block(pc, i, b, graded && !each ? null : (src.list.length > 1 ? src.base : null), grf);
    });
    a('0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES');
    var tableName = style.replace(/\s+/g, '_').slice(0, 20).toUpperCase() || 'FORECUT';
    ['Style Name: ' + style, 'Creation Date: ' + new Date().toISOString().slice(0, 10), 'Author: Forecut Garment Studio', 'Sample Size: ' + src.base, graded && !each ? 'Grade Rule Table: ' + tableName : null, 'Units: ' + units].filter(Boolean).forEach(function (t2, k) { txtE('1', [0, -th * 1.5 * (k + 1)], t2, th * .6); });
    blocks.forEach(function (bn) { a('0', 'INSERT', '8', '1', '2', bn, '10', '0.0', '20', '0.0'); });
    a('0', 'ENDSEC', '0', 'EOF');
    var res = { dxf: L.join('\r\n') + '\r\n', sizes: sizes, rules: rules.length };
    if (graded && !each) {
      var R2 = ['ASTM/D13Proposal 1 Version: D 6673-04', 'AUTHOR: Forecut Garment Studio', 'PRODUCT: ' + style, 'VERSION: 1', 'CREATION DATE: ' + new Date().toISOString().slice(0, 10), 'CREATION TIME: ' + new Date().toTimeString().slice(0, 5), 'NOTES: Offsets from the sample size, in size-list order', 'UNITS: ' + units, 'GRADE RULE TABLE: ' + tableName, 'NUMBER OF SIZES: ' + sizes.length, 'SIZE LIST: ' + sizes.map(function (sz) { return ascii(sz).replace(/\s+/g, '_'); }).join(' '), 'SAMPLE SIZE: ' + ascii(src.base).replace(/\s+/g, '_')];
      rules.forEach(function (ds, i) { R2.push('RULE: DELTA ' + (i + 1)); var line = ''; ds.forEach(function (d, k) { line += ('          ' + n(d[0])).slice(-10) + ',' + ('          ' + n(d[1])).slice(-10) + (k % 4 === 3 && k < ds.length - 1 ? '\r\n' : ' '); }); R2.push(line.replace(/ $/, '')); });
      R2.push('END'); res.rul = R2.join('\r\n') + '\r\n'; res.table = tableName;
    }
    return res;
  }

  /* ---------- a tiny ZIP writer (stored, no compression) for the DXF + RUL pair ---------- */
  var CRC = (function () { var t = []; for (var i = 0; i < 256; i++) { var c = i; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t.push(c >>> 0); } return t; })();
  function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(files) {
    var enc = new TextEncoder(), parts = [], cent = [], off = 0;
    function u16(v) { return [v & 255, (v >>> 8) & 255]; } function u32(v) { return [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]; }
    files.forEach(function (f) { var name = enc.encode(f.name), data = enc.encode(f.data), crc = crc32(data);
      var head = [].concat([0x50, 0x4b, 3, 4], u16(20), u16(0), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0));
      parts.push(new Uint8Array(head), name, data);
      cent.push(new Uint8Array([].concat([0x50, 0x4b, 1, 2], u16(20), u16(20), u16(0), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off))), name);
      off += head.length + name.length + data.length; });
    var csize = cent.reduce(function (s, p) { return s + p.length; }, 0), end = new Uint8Array([].concat([0x50, 0x4b, 5, 6], u16(0), u16(0), u16(files.length), u16(files.length), u32(csize), u32(off), u16(0)));
    return new Blob(parts.concat(cent, [end]), { type: 'application/zip' });
  }
  function download(name, data, type) { if (window.FC && FC.download) return FC.download(name, data, type); var b = data instanceof Blob ? data : new Blob([data], { type: type }), u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 1000); }
  function slug(t) { return String(t || 'pattern').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'pattern'; }

  /* ---------- the options dialog ---------- */
  var LAST = { format: 'astm', sizes: 'graded', unit: 'mm', scale: 100, rot: 0, noSA: false, dupNotch: false, text: false, box: false, selected: false };
  try { var sv = JSON.parse(localStorage.getItem('fc-dxf-opts') || 'null'); if (sv) LAST = Object.assign(LAST, sv); } catch (e) {}
  var dlg = null;
  function dialog(from, preset) {
    var src = from === 'edit' ? fromEdit({}) : fromDraft(); if (!src) return toast('Choose a garment in Draft first.', 1);
    var o = Object.assign({}, LAST); if (preset === 'graded') { o.format = 'astm'; o.sizes = 'graded'; }
    if (!o.unit) o.unit = 'mm';
    var canGrade = src.list.length > 1 && src.pcs.some(function (pc) { return C.isGraded(pc); }), selN = from === 'edit' && S().selected().length;
    if (!dlg) { dlg = document.createElement('div'); dlg.className = 'fx-dxf'; dlg.hidden = true; document.body.appendChild(dlg); dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('[data-dx=cancel]')) dlg.hidden = true; }); document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dlg && !dlg.hidden) dlg.hidden = true; }); }
    var sel = function (k, v, opts) { return '<select data-o="' + k + '">' + opts.map(function (p) { return '<option value="' + p[0] + '"' + (String(p[0]) === String(v) ? ' selected' : '') + (p[2] ? ' disabled' : '') + '>' + esc(p[1]) + '</option>'; }).join('') + '</select>'; };
    var chk = function (k, v, l, dis) { return '<label class="fx-dc"><input type="checkbox" data-o="' + k + '"' + (v ? ' checked' : '') + (dis ? ' disabled' : '') + '> ' + l + '</label>'; };
    dlg.innerHTML = '<div class="fx-dbox" role="dialog" aria-modal="true" aria-labelledby="fx-dxt"><h4 id="fx-dxt">Export DXF</h4><p class="fx-dsrc">' + esc(src.name) + ' · ' + src.pcs.length + ' piece' + (src.pcs.length > 1 ? 's' : '') + ' · ' + (from === 'edit' ? 'your edited pieces' : 'from the draft') + (src.list.length > 1 ? ' · sizes ' + esc(src.list[0]) + '–' + esc(src.list[src.list.length - 1]) + ', base ' + esc(src.base) : '') + '</p>'
      + '<div class="fx-dg"><b>Basic</b>'
      + '<label>Format' + sel('format', o.format, [['astm', 'ASTM / AAMA (CLO, Gerber, Optitex, Lectra, Tukatech)'], ['plain', 'Plain DXF (CAD, laser cutter, plotter)']]) + '</label>'
      + '<label>Sizes' + sel('sizes', canGrade ? o.sizes : 'base', [['graded', 'Graded: base size + grade rules (all sizes)', !canGrade], ['each', 'Every size as its own piece', !canGrade], ['base', 'Base size only (' + src.base + ')']]) + '</label>'
      + '<label>Units' + sel('unit', o.unit, [['mm', 'Millimetres'], ['cm', 'Centimetres (plain DXF)'], ['in', 'Inches']]) + '</label>'
      + '<label>Scale<span class="fx-du"><input type="number" data-o="scale" min="10" max="1000" step="any" value="' + o.scale + '"><i>%</i></span></label>'
      + '<label>Rotation' + sel('rot', o.rot, [[0, 'Do not rotate'], [90, '90° anticlockwise'], [180, '180°'], [270, '90° clockwise']]) + '</label></div>'
      + '<div class="fx-dg"><b>Options</b>' + chk('noSA', o.noSA, 'Export without seam allowance (seamline as the outline)') + chk('dupNotch', o.dupNotch, 'Notches on the seamline as well as the cutting line') + chk('text', o.text, 'Piece names as visible text') + chk('box', o.box, 'Bounding box around each piece (plain DXF)') + (from === 'edit' ? chk('selected', o.selected && selN, 'Selected pieces only' + (selN ? ' (' + selN + ')' : ''), !selN) : '') + '</div>'
      + (canGrade ? '' : '<p class="fx-dnote">' + (from === 'edit' ? 'These pieces are not graded yet, so one size exports. Use Grading › Auto-grade from the draft, or set grade rules on points, to export every size.' : 'Pick a size from the chart (not your own measurements) to export graded sizes.') + '</p>')
      + '<p class="fx-dnote">ASTM / AAMA files keep each piece as its own block with its name, quantity and grainline. Graded exports come as a ZIP with the DXF and its .RUL grade rule table: import both together (in CLO: File › Import › DXF (AAMA/ASTM), with the rule file in the same folder).</p>'
      + '<div class="fx-dbtns"><button type="button" class="fx-db" data-dx="reset">Reset</button><span></span><button type="button" class="fx-db pri" data-dx="ok">Export</button><button type="button" class="fx-db" data-dx="cancel">Cancel</button></div></div>';
    dlg.hidden = false;
    dlg.querySelector('[data-dx=reset]').onclick = function () { LAST = { format: 'astm', sizes: 'graded', unit: 'mm', scale: 100, rot: 0, noSA: false, dupNotch: false, text: false, box: false, selected: false }; try { localStorage.removeItem('fc-dxf-opts'); } catch (e) {} dialog(from, preset); };
    dlg.querySelector('[data-dx=ok]').onclick = function () {
      var v = {}; dlg.querySelectorAll('[data-o]').forEach(function (el) { v[el.dataset.o] = el.type === 'checkbox' ? el.checked : el.type === 'number' ? +el.value : el.value; });
      v.scale = Math.max(10, Math.min(1000, v.scale || 100)); v.rot = +v.rot || 0; if (v.format === 'astm' && v.unit === 'cm') v.unit = 'mm';
      LAST = Object.assign({}, v); try { localStorage.setItem('fc-dxf-opts', JSON.stringify(LAST)); } catch (e) {}
      var s2 = from === 'edit' ? fromEdit({ selected: v.selected }) : src; if (!s2.pcs.length) return toast('There are no pieces to export.', 1);
      if (v.sizes !== 'base' && !(s2.list.length > 1 && s2.pcs.some(function (pc) { return C.isGraded(pc); }))) v.sizes = 'base';
      var r = build(s2, v); if (r.err) return toast(r.err, 1);
      var base = slug(s2.name) + (v.format === 'astm' ? '-astm' : '');
      if (r.rul) { download(base + '.zip', zip([{ name: base + '.dxf', data: r.dxf }, { name: r.table.toLowerCase() + '.rul', data: r.rul }]), 'application/zip'); toast('Downloaded a ZIP with ' + base + '.dxf and its grade rule table (' + r.sizes.length + ' sizes, ' + r.rules + ' rules, base ' + s2.base + '). Import both together in your CAD.'); }
      else { download(base + '.dxf', r.dxf, 'application/dxf'); toast('DXF downloaded: ' + s2.pcs.length + ' pieces' + (r.sizes.length > 1 ? ', ' + r.sizes.length + ' sizes' : ', size ' + s2.base) + ', ' + ({ mm: 'millimetres', cm: 'centimetres', 'in': 'inches' })[v.unit] + '.'); }
      dlg.hidden = true;
    };
    var f0 = dlg.querySelector('select'); if (f0) f0.focus();
  }
  // Draft mode: the DXF downloads open the same dialog (Edit pieces routes its own Export menu)
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('#pm-dl-dxf,#pm-dl-aama,#pm-dl-gdxf'); if (!b) return; if (S() && S().on && S().on()) return; e.preventDefault(); e.stopImmediatePropagation(); var m = document.getElementById('pm-menu'); if (m) m.hidden = true; dialog('draft', b.id === 'pm-dl-gdxf' || b.id === 'pm-dl-aama' ? 'graded' : null); }, true);
  var st = document.createElement('style');
  st.textContent = '.fx-dxf{position:fixed;inset:0;z-index:2000;background:rgba(16,18,20,.55);display:grid;place-items:center;padding:16px}.fx-dxf[hidden]{display:none}.fx-dbox{width:min(560px,100%);max-height:92vh;overflow:auto;background:#24282c;color:#e8e6e1;border:1px solid #3a3f46;border-radius:10px;padding:16px 18px;font:13px "DM Sans",sans-serif;box-shadow:0 24px 60px rgba(0,0,0,.45)}'
    + '.fx-dbox h4{margin:0 0 4px;font-size:16px}.fx-dsrc{margin:0 0 12px;color:#9da3aa;font-size:12px}.fx-dg{display:grid;gap:8px;border:1px solid #3a3f46;border-radius:8px;padding:10px 12px;margin-bottom:10px}.fx-dg>b{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#e08a5e}'
    + '.fx-dg>label{display:grid;grid-template-columns:110px 1fr;align-items:center;gap:10px}.fx-dg select,.fx-dg input[type=number]{background:#1b1e21;color:#e8e6e1;border:1px solid #3a3f46;border-radius:5px;padding:6px 8px;font:13px "DM Sans",sans-serif;width:100%}.fx-du{display:flex;align-items:center;gap:6px}.fx-du i{font-style:normal;color:#9da3aa}'
    + '.fx-dg .fx-dc{display:flex;gap:8px;align-items:center;grid-template-columns:none}.fx-dnote{margin:0 0 8px;color:#9da3aa;font-size:12px;line-height:1.45}.fx-dbtns{display:flex;gap:8px;align-items:center;margin-top:12px}.fx-dbtns span{flex:1}.fx-db{border:1px solid #3a3f46;background:#2b3035;color:#e8e6e1;border-radius:6px;padding:8px 14px;font:600 13px "DM Sans",sans-serif;cursor:pointer}.fx-db.pri{background:#e08a5e;border-color:#e08a5e;color:#1c1f22}';
  document.head.appendChild(st);
  window.FCDXF = { dialog: dialog, build: build, fromEdit: fromEdit, fromDraft: fromDraft, zip: zip };
})();
