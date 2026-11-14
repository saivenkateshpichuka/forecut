/* Forecut Pattern Maker geometry engine (Edit pieces mode).
   Units are centimetres everywhere inside; the page converts to mm or inches only for display and typing.
   A piece is a closed outline of nodes. Each segment runs from node i to node i+1 and is a straight line, or a cubic
   Bezier when either end carries a handle (h2 on the start node, h1 on the end node, both relative to their node).
   The seamline is the construction geometry; cutting lines are generated from it with per-edge seam allowances. */
(function (root) {
  'use strict';
  var C = {}, EPS = 1e-9;
  var uid = (function () { var n = 0; return function (p) { n++; return (p || 'n') + Date.now().toString(36).slice(-4) + n.toString(36); }; })();
  C.uid = uid;

  /* ---------- units ---------- */
  C.UNITS = { mm: { f: 10, d: 1, step: 1, label: 'mm' }, cm: { f: 1, d: 2, step: .1, label: 'cm' }, in: { f: 1 / 2.54, d: 3, step: 1 / 16, label: 'in' } };
  C.toU = function (cm, u) { var U = C.UNITS[u] || C.UNITS.cm; return +(cm * U.f).toFixed(U.d); };
  C.fromU = function (v, u) { return v / (C.UNITS[u] || C.UNITS.cm).f; };
  C.fmt = function (cm, u) { return C.toU(cm, u) + ' ' + (C.UNITS[u] || C.UNITS.cm).label; };

  /* ---------- Bezier basics ---------- */
  function bez(p0, p1, p2, p3, t) { var u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; }
  function bezD(p0, p1, p2, p3, t) { var u = 1 - t; return [3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]), 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1])]; }
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  C.dist = dist;
  /* the four control points of segment i (a straight segment gets handles on the chord, so the maths is shared) */
  C.ctrl = function (pc, i) {
    var N = pc.nodes, a = N[i], b = N[(i + 1) % N.length], p0 = [a.x, a.y], p3 = [b.x, b.y];
    var curved = !!(a.h2 || b.h1);
    var p1 = a.h2 ? [a.x + a.h2[0], a.y + a.h2[1]] : [p0[0] + (p3[0] - p0[0]) / 3, p0[1] + (p3[1] - p0[1]) / 3];
    var p2 = b.h1 ? [b.x + b.h1[0], b.y + b.h1[1]] : [p0[0] + (p3[0] - p0[0]) * 2 / 3, p0[1] + (p3[1] - p0[1]) * 2 / 3];
    return { p0: p0, p1: p1, p2: p2, p3: p3, curved: curved };
  };
  C.segCount = function (pc) { return pc.closed === false ? pc.nodes.length - 1 : pc.nodes.length; };
  /* flattened points of a segment, about every 'step' cm along a curve (lines give just their two ends) */
  C.segPts = function (pc, i, step) {
    var k = C.ctrl(pc, i); if (!k.curved) return [k.p0, k.p3];
    var L = dist(k.p0, k.p1) + dist(k.p1, k.p2) + dist(k.p2, k.p3), n = Math.max(4, Math.min(200, Math.ceil(L / (step || .25)))), out = [];
    for (var j = 0; j <= n; j++) out.push(bez(k.p0, k.p1, k.p2, k.p3, j / n));
    return out;
  };
  /* arc-length table of a segment: [[t, s]...] */
  function lut(k, n) { var out = [[0, 0]], prev = k.p0, s = 0; for (var j = 1; j <= n; j++) { var t = j / n, q = bez(k.p0, k.p1, k.p2, k.p3, t); s += dist(prev, q); out.push([t, s]); prev = q; } return out; }
  /* exact arc length: 8-point Gauss-Legendre on 8 sub-intervals (error far below 0.001 mm on pattern curves) */
  var GX = [-.9602898564975363, -.7966664774136267, -.5255324099163290, -.1834346424956498, .1834346424956498, .5255324099163290, .7966664774136267, .9602898564975363],
    GW = [.1012285362903763, .2223810344533745, .3137066458778873, .3626837833783620, .3626837833783620, .3137066458778873, .2223810344533745, .1012285362903763];
  function glen(k, t0, t1) { var h = (t1 - t0) / 2, m = (t1 + t0) / 2, s = 0; for (var i = 0; i < 8; i++) { var d = bezD(k.p0, k.p1, k.p2, k.p3, m + h * GX[i]); s += GW[i] * Math.hypot(d[0], d[1]); } return s * h; }
  function arcTo(k, t) { var n = Math.max(1, Math.ceil(t * 8)), s = 0; for (var i = 0; i < n; i++) s += glen(k, t * i / n, t * (i + 1) / n); return s; }
  C.arc = function (pc, i, t) { var k = C.ctrl(pc, i); return k.curved ? arcTo(k, t) : dist(k.p0, k.p3) * t; };
  C.segLen = function (pc, i) { var k = C.ctrl(pc, i); if (!k.curved) return dist(k.p0, k.p3); return arcTo(k, 1); };
  /* parameter t at a distance along the segment */
  C.tAt = function (pc, i, s) { var k = C.ctrl(pc, i); if (!k.curved) { var L = dist(k.p0, k.p3); return L ? Math.max(0, Math.min(1, s / L)) : 0; }
    var L2 = arcTo(k, 1); if (s <= 0) return 0; if (s >= L2) return 1; var lo = 0, hi = 1, t = s / L2;
    for (var it = 0; it < 30; it++) { var f = arcTo(k, t) - s; if (Math.abs(f) < 1e-7) break; if (f > 0) hi = t; else lo = t; var d = bezD(k.p0, k.p1, k.p2, k.p3, t), sp = Math.hypot(d[0], d[1]), tn = sp > 1e-9 ? t - f / sp : -1; t = tn > lo && tn < hi ? tn : (lo + hi) / 2; }
    return t; };
  C.pointAt = function (pc, i, t) { var k = C.ctrl(pc, i); return bez(k.p0, k.p1, k.p2, k.p3, t); };
  C.tangentAt = function (pc, i, t) { var k = C.ctrl(pc, i), d = bezD(k.p0, k.p1, k.p2, k.p3, t), l = Math.hypot(d[0], d[1]) || 1; return [d[0] / l, d[1] / l]; };
  /* the whole outline as one flat polygon, remembering which segment each point belongs to */
  C.flat = function (pc, step) {
    var pts = [], seg = [], n = C.segCount(pc);
    for (var i = 0; i < n; i++) { var p = C.segPts(pc, i, step); for (var j = 0; j < p.length - 1; j++) { pts.push(p[j]); seg.push(i); } if (pc.closed === false && i === n - 1) { pts.push(p[p.length - 1]); seg.push(i); } }
    return { pts: pts, seg: seg };
  };
  C.perimeter = function (pc) { var s = 0, n = C.segCount(pc); for (var i = 0; i < n; i++) s += C.segLen(pc, i); return s; };
  function areaOf(P) { var a = 0; for (var i = 0; i < P.length; i++) { var p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; }
  C.areaOf = areaOf;
  C.area = function (pc) { return Math.abs(areaOf(C.flat(pc).pts)); };
  C.bbox = function (pc) { var P = C.flat(pc).pts, b = [1e9, 1e9, -1e9, -1e9]; P.forEach(function (q) { b[0] = Math.min(b[0], q[0]); b[1] = Math.min(b[1], q[1]); b[2] = Math.max(b[2], q[0]); b[3] = Math.max(b[3], q[1]); }); return b; };
  C.angleAtNode = function (pc, i) { var n = pc.nodes.length, a = C.tangentAt(pc, (i - 1 + n) % n, 1), b = C.tangentAt(pc, i, 0); return Math.acos(Math.max(-1, Math.min(1, -(a[0] * b[0] + a[1] * b[1])))) * 180 / Math.PI; };

  /* ---------- validation ---------- */
  function segX(a, b, c, d) { var r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]], den = r[0] * s[1] - r[1] * s[0]; if (Math.abs(den) < EPS) return null; var t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den, u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den; return t > 1e-6 && t < 1 - 1e-6 && u > 1e-6 && u < 1 - 1e-6 ? [a[0] + r[0] * t, a[1] + r[1] * t] : null; }
  C.selfHits = function (P, closed) { // sweep over x: only segments whose x ranges overlap are tested
    var n = P.length, m = closed === false ? n - 1 : n, S = [], hits = [], act = [], i;
    for (i = 0; i < m; i++) { var a = P[i], b = P[(i + 1) % n]; S.push([Math.min(a[0], b[0]), Math.max(a[0], b[0]), i, Math.min(a[1], b[1]), Math.max(a[1], b[1])]); }
    S.sort(function (u, v) { return u[0] - v[0]; });
    for (var k = 0; k < S.length; k++) { var s = S[k]; act = act.filter(function (t) { return t[1] >= s[0]; });
      for (var j = 0; j < act.length; j++) { var t = act[j], a1 = s[2], b1 = t[2], df = Math.abs(a1 - b1); if (df === 1 || (closed !== false && df === n - 1)) continue; if (t[4] < s[3] || t[3] > s[4]) continue;
        var x = segX(P[a1], P[(a1 + 1) % n], P[b1], P[(b1 + 1) % n]); if (x) { hits.push(x); if (hits.length > 20) return hits; } }
      act.push(s); }
    return hits; };
  C.validate = function (pc, fast) {
    var issues = [], n = C.segCount(pc);
    if (pc.nodes.length < 3 && pc.closed !== false) issues.push({ k: 'few', msg: 'A piece needs at least three points.' });
    for (var i = 0; i < n; i++) if (C.segLen(pc, i) < .05) issues.push({ k: 'zero', seg: i, msg: 'Edge ' + (i + 1) + ' has no length: two points sit on top of each other.' });
    var f = C.flat(pc, .4).pts; if (!fast && C.selfHits(f).length) issues.push({ k: 'cross', msg: 'The outline crosses itself. Move the points so the edges do not cross.' });
    if (pc.closed !== false && Math.abs(areaOf(f)) < .5) issues.push({ k: 'flat', msg: 'The outline has no area.' });
    return issues;
  };

  /* ---------- pieces ---------- */
  C.node = function (x, y, h1, h2) { return { id: uid('p'), x: x, y: y, h1: h1 || null, h2: h2 || null }; };
  C.newPiece = function (nodes, o) {
    o = o || {};
    var pc = { id: uid('pc'), name: o.name || '', auto: !o.name, nodes: nodes, closed: true, x: 0, y: 0, cat: o.cat || '', dept: o.dept || '', size: o.size || '', qty: o.qty || 1, pair: !!o.pair, fabric: o.fabric || '', fold: o.fold == null ? -1 : o.fold, hems: o.hems || [], notes: o.notes || '',
      sa: { def: o.sa == null ? (C.defaults && C.defaults.sa != null ? C.defaults.sa : 1) : o.sa, hem: o.hemSA == null ? (C.defaults && C.defaults.hem != null ? C.defaults.hem : 2.5) : o.hemSA, edges: {}, corner: {}, showSeam: true, showCut: true }, notches: [], internals: [], darts: [], pleats: [], grain: null, link: null, grade: {}, hidden: false, locked: false };
    if (!pc.grain) { var b = C.bbox(pc), cx = (b[0] + b[2]) / 2; pc.grain = { a: [cx, b[1] + (b[3] - b[1]) * .2], b: [cx, b[1] + (b[3] - b[1]) * .8] }; }
    return pc;
  };
  C.rect = function (x, y, w, h, o) { return C.newPiece([C.node(x, y), C.node(x + w, y), C.node(x + w, y + h), C.node(x, y + h)], o); };
  C.ellipse = function (cx, cy, rx, ry, rot, o) { // four Bezier arcs (kappa), closed
    var k = .5522847498, r = (rot || 0) * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r), R = function (x, y) { return [cx + x * cs - y * sn, cy + x * sn + y * cs]; }, V = function (x, y) { return [x * cs - y * sn, x * sn + y * cs]; };
    var P = [[rx, 0], [0, ry], [-rx, 0], [0, -ry]], H = [[0, ry * k], [-rx * k, 0], [0, -ry * k], [rx * k, 0]];
    var nodes = P.map(function (p, i) { var q = R(p[0], p[1]), h = H[i]; return C.node(q[0], q[1], V(-h[0], -h[1]), V(h[0], h[1])); });
    return C.newPiece(nodes, o);
  };
  /* a spiral strip for flounces: the inner edge spirals out from 'r0' for 'turns', growing by 'grow' cm per turn; the strip is 'width' wide */
  C.spiral = function (cx, cy, r0, turns, grow, width, dir, o) {
    var inner = [], outer = [], n = Math.max(12, Math.round(turns * 48)), sg = dir === 'ccw' ? -1 : 1;
    for (var j = 0; j <= n; j++) { var a = j / n * turns * 2 * Math.PI, r = r0 + grow * a / (2 * Math.PI); inner.push([cx + r * Math.cos(sg * a), cy + r * Math.sin(sg * a)]); outer.push([cx + (r + width) * Math.cos(sg * a), cy + (r + width) * Math.sin(sg * a)]); }
    var poly = inner.concat(outer.reverse()), nodes = C.fitNodes(poly, .05, true);
    return C.newPiece(nodes, o);
  };
  C.spiralCheck = function (r0, turns, grow, width) { var out = []; if (!(r0 > 0)) out.push('The inner radius must be more than zero.'); if (!(turns > 0) || turns > 6) out.push('Use between a part turn and 6 turns.'); if (!(width > 0)) out.push('The strip width must be more than zero.'); if (turns > 1 && grow < width + .5) out.push('The strip is wider than the spacing between turns, so the turns would overlap. Increase the spacing to at least ' + (width + .5).toFixed(1) + ' cm or reduce the strip width.'); return out; };

  /* ---------- curve fitting (a dense polyline to a few smooth Bezier nodes) ---------- */
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function nrm(a) { var l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; }
  function fitOne(P, t1, t2) { // Schneider least squares for one cubic with fixed end tangents
    var n = P.length, u = [0], i; for (i = 1; i < n; i++) u.push(u[i - 1] + dist(P[i], P[i - 1])); var L = u[n - 1] || 1; for (i = 0; i < n; i++) u[i] /= L;
    var c00 = 0, c01 = 0, c11 = 0, x0 = 0, x1 = 0, p0 = P[0], p3 = P[n - 1];
    for (i = 0; i < n; i++) { var t = u[i], b0 = (1 - t) * (1 - t) * (1 - t), b1 = 3 * t * (1 - t) * (1 - t), b2 = 3 * t * t * (1 - t), b3 = t * t * t, A1 = [t1[0] * b1, t1[1] * b1], A2 = [t2[0] * b2, t2[1] * b2];
      c00 += A1[0] * A1[0] + A1[1] * A1[1]; c01 += A1[0] * A2[0] + A1[1] * A2[1]; c11 += A2[0] * A2[0] + A2[1] * A2[1];
      var tmp = [P[i][0] - (p0[0] * (b0 + b1) + p3[0] * (b2 + b3)), P[i][1] - (p0[1] * (b0 + b1) + p3[1] * (b2 + b3))]; x0 += A1[0] * tmp[0] + A1[1] * tmp[1]; x1 += A2[0] * tmp[0] + A2[1] * tmp[1]; }
    var det = c00 * c11 - c01 * c01, a1 = det ? (x0 * c11 - x1 * c01) / det : L / 3, a2 = det ? (c00 * x1 - c01 * x0) / det : L / 3;
    if (!(a1 > L * 1e-3) || !(a2 > L * 1e-3) || a1 > L || a2 > L) { a1 = a2 = L / 3; }
    var p1 = [p0[0] + t1[0] * a1, p0[1] + t1[1] * a1], p2 = [p3[0] + t2[0] * a2, p3[1] + t2[1] * a2], err = 0, at = 0;
    for (i = 0; i < n; i++) { var q = bez(p0, p1, p2, p3, u[i]), e = dist(q, P[i]); if (e > err) { err = e; at = i; } }
    return { p1: p1, p2: p2, err: err, at: at };
  }
  /* fit an open run of points: returns nodes (first..last) with handles; tol in cm */
  function fitRun(P, tol, depth) {
    if (P.length <= 2) return [[P[0], null, null], [P[P.length - 1], null, null]];
    // a straight run stays straight
    var a = P[0], b = P[P.length - 1], straight = true; for (var i = 1; i < P.length - 1 && straight; i++) { var d = Math.abs((b[0] - a[0]) * (a[1] - P[i][1]) - (a[0] - P[i][0]) * (b[1] - a[1])) / (dist(a, b) || 1); if (d > tol) straight = false; }
    if (straight) return [[a, null, null], [b, null, null]];
    var t1 = nrm(sub(P[Math.min(2, P.length - 1)], P[0])), t2 = nrm(sub(P[Math.max(P.length - 3, 0)], P[P.length - 1])), f = fitOne(P, t1, t2);
    if (f.err <= tol || depth > 6 || P.length < 6) return [[a, null, sub(f.p1, a)], [b, sub(f.p2, b), null]];
    var k = Math.max(2, Math.min(P.length - 3, f.at)), L = fitRun(P.slice(0, k + 1), tol, depth + 1), R = fitRun(P.slice(k), tol, depth + 1);
    var mid = L[L.length - 1], tm = nrm(sub(P[k + 1], P[k - 1])); // keep the join smooth: both handles on one line
    var hl = mid[1] ? Math.hypot(mid[1][0], mid[1][1]) : dist(P[k], P[k - 1]) / 3, hr = R[0][2] ? Math.hypot(R[0][2][0], R[0][2][1]) : dist(P[k], P[k + 1]) / 3;
    mid[1] = [-tm[0] * hl, -tm[1] * hl]; mid[2] = [tm[0] * hr, tm[1] * hr]; mid.smooth = true;
    return L.concat(R.slice(1));
  }
  /* closed polygon (or one run) to nodes; corners are kept where the direction turns sharply */
  C.fitNodes = function (poly, tol, closed) {
    var n = poly.length, corners = [];
    for (var i = 0; i < n; i++) { var p = poly[(i - 1 + n) % n], q = poly[i], r = poly[(i + 1) % n], a = nrm(sub(q, p)), b = nrm(sub(r, q)); if (!closed && (i === 0 || i === n - 1)) { corners.push(i); continue; } if (a[0] * b[0] + a[1] * b[1] < .82) corners.push(i); }
    if (!corners.length) corners = [0, Math.floor(n / 3), Math.floor(2 * n / 3)];
    var nodes = [];
    for (var c = 0; c < corners.length; c++) {
      var s = corners[c], e = closed ? corners[(c + 1) % corners.length] : corners[c + 1]; if (e === undefined) break;
      var run = []; for (var j = s; ; j = (j + 1) % n) { run.push(poly[j]); if (j === e && run.length > 1) break; if (run.length > n + 1) break; }
      var fit = fitRun(run, tol || .06, 0);
      fit.forEach(function (f, k) { if (k === fit.length - 1) return; var nd = C.node(f[0][0], f[0][1], f[1], f[2]); if (k === 0 && nodes.length) { var prev = nodes[nodes.length - 1]; } if (k === 0 && nodes.length && nodes[0] && false) prev = null; nodes.push(nd); });
      // carry the incoming handle of the run's end onto the next run's first node
      var last = fit[fit.length - 1]; nodes.pendingH1 = last[1];
      if (!closed && c === corners.length - 2) nodes.push(C.node(last[0][0], last[0][1], last[1], null));
      else if (nodes.pendingH1 && c < corners.length - 1) { /* applied below */ }
      nodes._ends = nodes._ends || []; nodes._ends.push(last[1]);
    }
    if (closed) nodes._ends.forEach(function (h1, k) { var idx = [], cnt = 0; void idx; void cnt; });
    // second pass: put each run's incoming end handle on the node where the next run starts
    if (closed) { var starts = [], acc = 0; for (c = 0; c < corners.length; c++) { starts.push(acc); var s2 = corners[c], e2 = corners[(c + 1) % corners.length], len = (e2 - s2 + n) % n || n; void len; acc = -1; } }
    delete nodes.pendingH1;
    return C._fixEnds(nodes, poly, tol, closed);
  };
  /* simpler, exact rebuild: fit each corner-to-corner run and stitch handles onto shared corner nodes */
  C._fixEnds = function (_nodes, poly, tol, closed) {
    var n = poly.length, corners = [];
    for (var i = 0; i < n; i++) { var p = poly[(i - 1 + n) % n], q = poly[i], r = poly[(i + 1) % n], a = nrm(sub(q, p)), b = nrm(sub(r, q)); if (!closed && (i === 0 || i === n - 1)) { corners.push(i); continue; } if (a[0] * b[0] + a[1] * b[1] < .82) corners.push(i); }
    if (!corners.length) corners = [0, Math.floor(n / 3), Math.floor(2 * n / 3)];
    var out = [], runs = closed ? corners.length : corners.length - 1;
    for (var c = 0; c < runs; c++) {
      var s = corners[c], e = corners[(c + 1) % corners.length], run = [];
      for (var j = s; ; j = (j + 1) % n) { run.push(poly[j]); if (j === e && run.length > 1) break; if (run.length > n + 1) break; }
      var fit = fitRun(run, tol || .06, 0);
      for (var k = 0; k < fit.length - 1; k++) { var f = fit[k]; if (k === 0 && out.length) { out[out.length - 1].h2 = f[2]; continue; } out.push(C.node(f[0][0], f[0][1], f[1], f[2])); }
      var last = fit[fit.length - 1]; out.push(C.node(last[0][0], last[0][1], last[1], null));
    }
    if (closed && out.length > 1) { var first = out[0], end = out.pop(); first.h1 = end.h1; }
    return out;
  };

  /* ---------- editing ---------- */
  C.splitSeg = function (pc, i, t) { // add a point without changing the shape (de Casteljau)
    var k = C.ctrl(pc, i), N = pc.nodes, a = N[i], b = N[(i + 1) % N.length];
    function L(p, q) { return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; }
    var nd;
    if (!k.curved) { var q = L(k.p0, k.p3); nd = C.node(q[0], q[1]); }
    else { var a1 = L(k.p0, k.p1), b1 = L(k.p1, k.p2), c1 = L(k.p2, k.p3), a2 = L(a1, b1), b2 = L(b1, c1), m = L(a2, b2);
      a.h2 = sub(a1, k.p0); b.h1 = sub(c1, k.p3); nd = C.node(m[0], m[1], sub(a2, m), sub(b2, m)); nd.smooth = true; }
    N.splice(i + 1, 0, nd); C.shiftRefs(pc, i, 1, t); return nd;
  };
  C.splitAtDist = function (pc, i, s) { return C.splitSeg(pc, i, C.tAt(pc, i, s)); };
  C.divideSeg = function (pc, i, parts) { var L = C.segLen(pc, i), made = []; for (var k = parts - 1; k >= 1; k--) made.push(C.splitAtDist(pc, i, L * k / parts)); return made; };
  /* notches, seam allowance overrides and sewing refer to segment numbers: keep them pointing at the same edge */
  C.shiftRefs = function (pc, at, delta, t) {
    pc.notches.forEach(function (nt) { if (nt.seg > at) nt.seg += delta; else if (nt.seg === at && delta > 0 && t != null) { /* the notch keeps its distance: if it now falls on the new part, move it */ var Lfirst = C.segLen(pc, at), d = nt.mode === 'pct' ? null : nt.v; if (d != null && nt.from !== 'end' && d > Lfirst) { nt.seg = at + 1; nt.v = d - Lfirst; } } });
    var e = {}, cn = {}; Object.keys(pc.sa.edges).forEach(function (k) { var j = +k; e[j > at ? j + delta : j] = pc.sa.edges[k]; if (j === at && delta > 0) e[j + 1] = pc.sa.edges[k]; }); pc.sa.edges = e;
    Object.keys(pc.sa.corner).forEach(function (k) { var j = +k; cn[j > at ? j + delta : j] = pc.sa.corner[k]; }); pc.sa.corner = cn;
    pc.hems = pc.hems.reduce(function (o, j) { if (j > at) o.push(j + delta); else { o.push(j); if (j === at && delta > 0) o.push(j + 1); } return o; }, []);
    if (pc.fold > at) pc.fold += delta;
    (pc._sewShift = pc._sewShift || []).push([at, delta]);
  };
  C.deleteNode = function (pc, i) { // the neighbours keep their outer handles, so the outline changes as little as possible
    var N = pc.nodes; if (N.length <= 3) return false; var n = N.length, prev = N[(i - 1 + n) % n], next = N[(i + 1) % n], gone = N[i];
    if (gone.h1 && !prev.h2) prev.h2 = [ (gone.x - prev.x) / 3, (gone.y - prev.y) / 3 ]; if (gone.h2 && !next.h1) next.h1 = [(gone.x - next.x) / 3, (gone.y - next.y) / 3];
    N.splice(i, 1);
    pc.notches = pc.notches.filter(function (nt) { return nt.seg !== i && nt.seg !== (i - 1 + n) % n; }); pc.notches.forEach(function (nt) { if (nt.seg > i) nt.seg--; });
    var e = {}; Object.keys(pc.sa.edges).forEach(function (k) { var j = +k; if (j === i) return; e[j > i ? j - 1 : j] = pc.sa.edges[k]; }); pc.sa.edges = e;
    pc.hems = pc.hems.filter(function (j) { return j !== i; }).map(function (j) { return j > i ? j - 1 : j; });
    if (pc.fold === i || pc.fold === (i - 1 + n) % n) pc.fold = -1; else if (pc.fold > i) pc.fold--;
    (pc._sewShift = pc._sewShift || []).push([i, -1]);
    return true;
  };
  C.toCurve = function (pc, i) { var N = pc.nodes, a = N[i], b = N[(i + 1) % N.length], d = [b.x - a.x, b.y - a.y]; if (!a.h2) a.h2 = [d[0] / 3, d[1] / 3]; if (!b.h1) b.h1 = [-d[0] / 3, -d[1] / 3]; };
  C.toLine = function (pc, i) { var N = pc.nodes; N[i].h2 = null; N[(i + 1) % N.length].h1 = null; };
  C.curvature = function (pc, i, amt) { // push the middle of the curve out (+) or in (-) by about 'amt' cm, ends fixed
    C.toCurve(pc, i); var N = pc.nodes, a = N[i], b = N[(i + 1) % N.length], d = [b.x - a.x, b.y - a.y], l = Math.hypot(d[0], d[1]) || 1, nx = -d[1] / l, ny = d[0] / l, k = amt * 4 / 3;
    a.h2 = [a.h2[0] + nx * k, a.h2[1] + ny * k]; b.h1 = [b.h1[0] + nx * k, b.h1[1] + ny * k];
  };
  /* smooth the joins inside a run of segments: handles are lined up and evened out; joins sharper than 'keep' degrees stay as corners */
  C.smooth = function (pc, segs, amt, keep) {
    var N = pc.nodes, n = N.length, before = segs.reduce(function (s, i) { return s + C.segLen(pc, i); }, 0), set = {}; segs.forEach(function (i) { set[i] = 1; });
    segs.forEach(function (i) { if (!set[(i + 1) % n] || pc.closed === false && i === n - 1) return; var j = (i + 1) % n, nd = N[j], p = N[i], q = N[(j + 1) % n];
      if (!nd.h1 && !nd.h2 && C.angleAtNode(pc, j) < 180 - (keep || 35)) return; // an intentional corner
      var t = nrm([q.x - p.x, q.y - p.y]), l1 = Math.hypot(nd.x - p.x, nd.y - p.y) / 3, l2 = Math.hypot(q.x - nd.x, q.y - nd.y) / 3;
      var h1 = [-t[0] * l1, -t[1] * l1], h2 = [t[0] * l2, t[1] * l2], m = Math.max(0, Math.min(1, amt == null ? 1 : amt));
      nd.h1 = nd.h1 ? [nd.h1[0] + (h1[0] - nd.h1[0]) * m, nd.h1[1] + (h1[1] - nd.h1[1]) * m] : [h1[0] * m, h1[1] * m]; nd.h2 = nd.h2 ? [nd.h2[0] + (h2[0] - nd.h2[0]) * m, nd.h2[1] + (h2[1] - nd.h2[1]) * m] : [h2[0] * m, h2[1] * m]; nd.smooth = true;
      if (!p.h2) p.h2 = [(nd.x - p.x) / 3, (nd.y - p.y) / 3]; if (!q.h1) q.h1 = [(nd.x - q.x) / 3, (nd.y - q.y) / 3]; });
    var after = segs.reduce(function (s, i) { return s + C.segLen(pc, i); }, 0); return { before: before, after: after, change: after - before };
  };
  C.moveNodes = function (pc, idx, dx, dy) { idx.forEach(function (i) { var nd = pc.nodes[i]; nd.x += dx; nd.y += dy; }); };
  C.moveSeg = function (pc, i, dx, dy) { C.moveNodes(pc, [i, (i + 1) % pc.nodes.length], dx, dy); };
  /* transforms: a 2x3 matrix [a, b, c, d, e, f] maps (x, y) to (a x + c y + e, b x + d y + f) */
  C.M = { tr: function (dx, dy) { return [1, 0, 0, 1, dx, dy]; }, rot: function (deg, px, py) { var r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [c, s, -s, c, px - c * px + s * py, py - s * px - c * py]; }, scale: function (sx, sy, px, py) { return [sx, 0, 0, sy, px - sx * px, py - sy * py]; }, mirX: function (x0) { return [-1, 0, 0, 1, 2 * x0, 0]; }, mirY: function (y0) { return [1, 0, 0, -1, 0, 2 * y0]; } };
  function ap(m, p) { return [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]]; }
  function av(m, v) { return v ? [m[0] * v[0] + m[2] * v[1], m[1] * v[0] + m[3] * v[1]] : null; }
  C.apply = ap;
  C.transformNodes = function (pc, idx, m) { idx.forEach(function (i) { var nd = pc.nodes[i], q = ap(m, [nd.x, nd.y]); nd.x = q[0]; nd.y = q[1]; nd.h1 = av(m, nd.h1); nd.h2 = av(m, nd.h2); }); };
  C.transformPiece = function (pc, m) {
    C.transformNodes(pc, pc.nodes.map(function (_, i) { return i; }), m);
    pc.internals.forEach(function (it) { it.pts = it.pts.map(function (q) { return ap(m, q); }); });
    pc.darts.forEach(function (d) { ['apex', 'l1', 'l2'].forEach(function (k) { if (d[k]) d[k] = ap(m, d[k]); }); });
    if (pc.grain) { pc.grain.a = ap(m, pc.grain.a); pc.grain.b = ap(m, pc.grain.b); }
    if (m[0] * m[3] - m[1] * m[2] < 0) C.reverse(pc); // a mirror flips the outline's direction: put it back
  };
  C.reverse = function (pc) { // same outline, opposite direction (segment numbers change, so notches and edge settings follow)
    var N = pc.nodes, n = N.length, S = C.segCount(pc);
    var R = [N[0]].concat(N.slice(1).reverse()); R.forEach(function (nd) { var t = nd.h1; nd.h1 = nd.h2; nd.h2 = t; }); pc.nodes = R;
    var map = function (i) { return (S - 1 - i + S) % S; }; // segment i (node i -> i+1) becomes segment n-1-i
    pc.notches.forEach(function (nt) { nt.seg = map(nt.seg); if (nt.mode === 'pct') nt.v = 100 - nt.v; else nt.from = nt.from === 'end' ? 'start' : 'end'; });
    var e = {}; Object.keys(pc.sa.edges).forEach(function (k) { e[map(+k)] = pc.sa.edges[k]; }); pc.sa.edges = e;
    pc.hems = pc.hems.map(map); if (pc.fold >= 0) pc.fold = map(pc.fold);
    pc._reversed = !pc._reversed; (pc._sewShift = pc._sewShift || []).push(['rev', S]);
  };
  C.clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  C.duplicate = function (pc, mode) { // 'copy' independent, 'linked' moves together in shape, 'mirror' a linked reflected copy
    var c = C.clone(pc); c.id = uid('pc'); c.nodes.forEach(function (nd) { nd.id = uid('p'); }); c.name = pc.name + (mode === 'mirror' ? ' (mirror)' : ' copy');
    var b = C.bbox(pc);
    if (mode === 'mirror') C.transformPiece(c, C.M.mirX(b[2] + 3));
    else C.transformPiece(c, C.M.tr(b[2] - b[0] + 6, 0));
    c.link = mode === 'copy' ? null : { to: pc.id, mode: mode, on: true }; return c;
  };
  /* re-apply a linked edit: the copy takes the source's shape (mirrored for a mirror link) and keeps its own position */
  C.syncLinked = function (src, dst) {
    if (!dst.link || !dst.link.on || dst.link.to !== src.id) return false;
    var b0 = C.bbox(dst), c = C.clone(src); if (dst.link.mode === 'mirror') { var bs = C.bbox(c); C.transformPiece(c, C.M.mirX((bs[0] + bs[2]) / 2)); }
    var b1 = C.bbox(c); C.transformPiece(c, C.M.tr(b0[0] - b1[0], b0[1] - b1[1]));
    ['nodes', 'internals', 'darts', 'grain', 'notches', 'sa', 'hems', 'fold'].forEach(function (k) { dst[k] = c[k]; }); dst.nodes.forEach(function (nd) { nd.id = uid('p'); }); return true;
  };
  C.unfold = function (pc, seg) { // a full piece from a half: mirror across the fold edge and join
    var k = C.ctrl(pc, seg), a = k.p0, b = k.p3, d = nrm(sub(b, a)), refl = function (p) { var v = sub(p, a), t = v[0] * d[0] + v[1] * d[1], q = [a[0] + d[0] * t, a[1] + d[1] * t]; return [2 * q[0] - p[0], 2 * q[1] - p[1]]; };
    var N = pc.nodes, n = N.length, out = [], i;
    for (i = 1; i <= n; i++) { var nd = N[(seg + i) % n]; out.push(C.node(nd.x, nd.y, nd.h1, nd.h2)); } // from the fold end round to the fold start
    var mir = []; for (i = n - 2; i >= 1; i--) { var o = out[i], q = refl([o.x, o.y]), r = function (h) { if (!h) return null; var e = refl([o.x + h[0], o.y + h[1]]); return [e[0] - q[0], e[1] - q[1]]; }; mir.push(C.node(q[0], q[1], r(o.h2), r(o.h1))); }
    var nodes = out.concat(mir); nodes[0].h1 = null; nodes[n - 1].h2 = null;
    // the fold points are now ordinary points on a straight line through the piece; keep them only if they are corners
    var full = C.newPiece(nodes, { name: pc.name, cat: pc.cat, dept: pc.dept, qty: pc.qty, fabric: pc.fabric }); full.sa = C.clone(pc.sa); full.sa.edges = {}; full.grain = pc.grain; full.notes = pc.notes; return full;
  };


  /* merge B onto A along edge i of A and edge j of B: B is turned and moved so the edges meet, then the outlines join and the edge disappears.
     Both pieces are placed in the same coordinates first (their x, y offsets are applied). Returns { piece, diff } */
  C.merge = function (A, i, B, j) {
    var a = C.clone(A), b = C.clone(B), off = function (pc) { var dx = pc.x || 0, dy = pc.y || 0; if (dx || dy) C.transformPiece(pc, C.M.tr(dx, dy)); pc.x = pc.y = 0; };
    off(a); off(b);
    var sgA = areaOf(C.flat(a, .5).pts) > 0, sgB = areaOf(C.flat(b, .5).pts) > 0;
    if (sgA !== sgB) { var nb = b.nodes.length; C.reverse(b); j = (nb - 1 - j + nb) % nb; }
    var na = a.nodes.length, nb2 = b.nodes.length, A0 = a.nodes[i], A1 = a.nodes[(i + 1) % na], B0 = b.nodes[j], B1 = b.nodes[(j + 1) % nb2];
    var diff = C.segLen(a, i) - C.segLen(b, j);
    var va = [A1.x - A0.x, A1.y - A0.y], vb = [B0.x - B1.x, B0.y - B1.y], ang = (Math.atan2(va[1], va[0]) - Math.atan2(vb[1], vb[0])) * 180 / Math.PI;
    C.transformPiece(b, C.M.rot(ang, B1.x, B1.y)); C.transformPiece(b, C.M.tr(A0.x - B1.x, A0.y - B1.y));
    var out = [], k;
    for (k = 1; k <= na; k++) out.push(C.clone(a.nodes[(i + k) % na])); // A[i+1] ... A[i]
    var aEnd = out[out.length - 1]; aEnd.h2 = B1.h2 ? B1.h2.slice() : null; aEnd.smooth = false;
    for (k = 2; k < nb2; k++) out.push(C.clone(b.nodes[(j + k) % nb2])); // B[j+2] ... B[j-1]
    out[0].h1 = B0.h1 ? B0.h1.slice() : null; out[0].smooth = false;
    out.forEach(function (nd) { nd.id = uid('p'); });
    var m = C.newPiece(out, { name: a.name, cat: a.cat, dept: a.dept, size: a.size, qty: a.qty, pair: a.pair, fabric: a.fabric });
    m.sa.def = a.sa.def; m.sa.hem = a.sa.hem; m.grain = a.grain; m.notes = a.notes; m.internals = a.internals.concat(b.internals); m.darts = a.darts.concat(b.darts);
    a.notches.forEach(function (nt) { if (nt.seg === i) return; var s2 = (nt.seg - (i + 1) + na) % na; m.notches.push(Object.assign({}, nt, { seg: s2 })); });
    a.hems.forEach(function (h) { if (h !== i) m.hems.push((h - (i + 1) + na) % na); });
    b.hems.forEach(function (h) { if (h !== j) m.hems.push(na - 1 + (h - (j + 1) + nb2) % nb2); });
    return { piece: m, diff: diff, dropped: b.notches.length };
  };
  /* a facing (or any traced strip) along one or more consecutive edges, 'w' wide on the inside */
  C.facing = function (pc, segs, w) {
    var line = []; segs.forEach(function (s, k) { var p = C.segPts(pc, s, .2); line = line.concat(k ? p.slice(1) : p); });
    var sg = areaOf(C.flat(pc, .5).pts) > 0 ? -1 : 1, inner = line.map(function (q, k) { var a = line[Math.max(0, k - 1)], b = line[Math.min(line.length - 1, k + 1)], t = nrm(sub(b, a)); return [q[0] + t[1] * sg * w, q[1] - t[0] * sg * w]; });
    // keep the inner line inside the piece: points that leave it are pulled back by the same distance along the bisector (simple, adequate for necklines and hems)
    var poly = line.concat(inner.reverse()), nodes = C.fitNodes(poly, .04, true), f = C.newPiece(nodes, { name: (pc.name || 'Piece') + ' facing', cat: 'facing', size: pc.size, qty: pc.qty, pair: pc.pair, fabric: pc.fabric });
    f.sa.def = pc.sa.def; f.x = pc.x; f.y = pc.y; if (pc.grain) f.grain = C.clone(pc.grain); return f;
  };
  C.fromInternal = function (pc, it) {
    var pts = it.kind === 'ellipse' ? null : it.pts, f;
    if (it.kind === 'ellipse') f = C.ellipse(it.c[0], it.c[1], it.r[0], it.r[1], 0, {}); else if (pts && pts.length > 2) f = C.newPiece(pts.map(function (q) { return C.node(q[0], q[1]); }), {}); else return null;
    f.name = it.label || (it.purpose === 'pocket' ? 'Pocket' : 'Traced piece'); f.size = pc.size; f.fabric = pc.fabric; f.sa.def = pc.sa.def; f.x = pc.x; f.y = pc.y; return f;
  };


  /* ---------- production data: sewing, fabrics, colourways, trims ---------- */
  C.TRIMS = ['button', 'hole', 'zip', 'piping', 'binding', 'tstitch', 'pucker', 'tape', 'graphic'];
  C.normalize = function (p) {
    p.sewing = p.sewing || []; p.fabrics = p.fabrics || []; p.trims = p.trims || {}; C.TRIMS.forEach(function (k) { p.trims[k] = p.trims[k] || []; });
    if (!p.colourways || !p.colourways.length) p.colourways = [{ id: 'cw1', name: 'Colourway 1', c: {} }]; p.cw = p.cw || p.colourways[0].id;
    p.presets = p.presets || {}; p.presets.tstitch = p.presets.tstitch || [
      { id: 'ts1', name: 'Single needle, 12 SPI', spi: 12, tex: 30, rows: 1, gap: .64, off: .15, colour: '#2b2b2b' },
      { id: 'ts2', name: 'Twin needle, 10 SPI', spi: 10, tex: 40, rows: 2, gap: .64, off: .2, colour: '#2b2b2b' },
      { id: 'ts3', name: 'Denim, heavy thread, 8 SPI', spi: 8, tex: 80, rows: 2, gap: .64, off: .2, colour: '#c8892a' },
      { id: 'ts4', name: 'Edge stitch, 14 SPI', spi: 14, tex: 30, rows: 1, gap: 0, off: .1, colour: '#2b2b2b' }];
    p.settings = p.settings || { notchDepth: .6, waste: 5, efficiency: 80, threadRatio: 2.6 };
    p.view = p.view || {}; ['sewing', 'trims', 'graphics'].forEach(function (k) { if (p.view[k] == null) p.view[k] = true; }); ['pages', 'nest'].forEach(function (k) { if (p.view[k] == null) p.view[k] = false; });
    p.app = C.APP; return p;
  };
  /* a part of an edge from distance a to b (cm along the edge, either order), offset inside the piece by 'off' (cm, negative = outside) */
  C.rangePts = function (pc, seg, a, b, off) {
    var L = C.segLen(pc, seg), s0 = Math.max(0, Math.min(L, Math.min(a, b == null ? L : b))), s1 = Math.max(0, Math.min(L, Math.max(a, b == null ? L : b))), n = Math.max(2, Math.ceil((s1 - s0) / .3) + 1), out = [], sg = areaOf(C.flat(pc, .5).pts) > 0 ? -1 : 1;
    for (var i = 0; i < n; i++) { var s = s0 + (s1 - s0) * i / (n - 1), t = C.tAt(pc, seg, s), q = C.pointAt(pc, seg, t), tg = C.tangentAt(pc, seg, t); out.push(off ? [q[0] + tg[1] * sg * off, q[1] - tg[0] * sg * off] : q); }
    return out;
  };
  C.rangeLen = function (pc, r) { var L = C.segLen(pc, r.seg), a = r.a == null ? 0 : r.a, b = r.b == null ? L : r.b; return Math.abs(Math.min(L, b) - Math.min(L, a)); };
  /* a seam joins part of one edge to part of another; each side runs from 'a' to 'b' (b < a means against the edge's direction) */
  C.seamLens = function (p, sw) { var A = byId(p, sw.A.pc), B = byId(p, sw.B.pc); if (!A || !B) return null; var la = C.rangeLen(A, sw.A), lb = C.rangeLen(B, sw.B); return { a: la, b: lb, diff: la - lb, plan: +sw.ease || 0, ok: Math.abs(la - lb - (+sw.ease || 0)) <= .3 }; };
  function byId(p, id) { for (var i = 0; i < p.pieces.length; i++) if (p.pieces[i].id === id) return p.pieces[i]; return null; }
  C.byId = byId;
  /* thread from Tex: for display only; Tex is a weight (g per 1000 m), so the visual width is an estimate from a typical density */
  C.threadDia = function (tex) { return Math.sqrt(tex / 1000 / 1.38 / Math.PI) * 2 * 10; }; // mm, polyester density 1.38 g/cm3, solid-fibre estimate
  /* bill of materials */
  C.bom = function (p) {
    C.normalize(p); var rows = [], st = p.settings, cw = p.colourways.filter(function (c) { return c.id === p.cw; })[0] || p.colourways[0];
    var byFab = {};
    p.pieces.forEach(function (pc) { if (pc.hidden) return; var cut = C.cutLine(pc, true).pts, area = Math.abs(areaOf(cut)), n = (pc.qty || 1) * (pc.fold >= 0 ? 2 : 1), key = pc.fabric || 'Unassigned'; (byFab[key] = byFab[key] || { area: 0, pcs: 0, names: [] }); byFab[key].area += area * n; byFab[key].pcs += (pc.qty || 1); byFab[key].names.push(pc.name); });
    Object.keys(byFab).forEach(function (k) { var f = p.fabrics.filter(function (x) { return x.id === k; })[0], w = f && +f.width || 150, eff = (+st.efficiency || 80) / 100, m = byFab[k].area / (w * eff) / 100;
      rows.push({ kind: 'Fabric', item: f ? f.name : k, desc: (f ? (f.comp || f.type || '') + (f.gsm ? ' · ' + f.gsm + ' gsm' : '') + ' · ' + w + ' cm wide · ' : '') + byFab[k].pcs + ' pieces: ' + byFab[k].names.join(', '), qty: +m.toFixed(2), unit: 'm', colour: f ? (cw.c[f.id] || f.colour || '') : '', note: 'Estimate at ' + (+st.efficiency || 80) + '% marker efficiency; confirm with a marker' }); });
    var T = p.trims, waste = 1 + (+st.waste || 0) / 100, len = function (list) { return list.reduce(function (s, r) { var pc = byId(p, r.pc); return s + (pc ? C.rangeLen(pc, r) * ((pc.qty || 1)) : 0); }, 0); };
    var grp = function (list, key) { var g = {}; list.forEach(function (r) { var k = key(r); (g[k] = g[k] || []).push(r); }); return g; };
    var btn = grp(T.button, function (r) { return (r.size || 1.5) + '|' + (r.holes || 4) + '|' + (r.mat || 'Polyester'); }); Object.keys(btn).forEach(function (k) { var r = btn[k][0], q = btn[k].reduce(function (s, b) { var pc = byId(p, b.pc); return s + (pc ? pc.qty || 1 : 1); }, 0); rows.push({ kind: 'Button', item: (r.name || 'Button') + ' ' + Math.round((r.size || 1.5) * 10) + ' mm', desc: (r.holes || 4) + ' holes · ' + (r.mat || 'Polyester') + ' · ' + Math.round((r.size || 1.5) * 10 / .635) + 'L', qty: q, unit: 'pcs', colour: cw.c['button:' + r.id] || r.colour || '' }); });
    if (T.hole.length) rows.push({ kind: 'Buttonhole', item: 'Buttonholes', desc: T.hole.map(function (h) { return Math.round((h.len || 1.8) * 10) + ' mm'; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(', ') + ' · machine sewn', qty: T.hole.reduce(function (s, h) { var pc = byId(p, h.pc); return s + (pc ? pc.qty || 1 : 1); }, 0), unit: 'pcs', colour: '' });
    T.zip.forEach(function (z) { var pc = byId(p, z.pc), L = pc ? C.rangeLen(pc, z) : 0, inch = Math.ceil(L / 2.54); rows.push({ kind: 'Zipper', item: (z.type || 'Coil') + ' zipper #' + (z.gauge || 5), desc: 'Closed length ' + inch + '" (' + L.toFixed(1) + ' cm) on ' + (pc ? pc.name : '?') + (z.sep ? ' · open-end' : ''), qty: pc ? pc.qty || 1 : 1, unit: 'pcs', colour: cw.c['zip:' + z.id] || z.colour || '' }); });
    [['piping', 'Piping'], ['binding', 'Binding'], ['tape', 'Seam tape']].forEach(function (kk) { var list = T[kk[0]]; if (!list.length) return; var g = grp(list, function (r) { return (r.w || 1) + '|' + (r.type || '') + '|' + (r.fab || ''); }); Object.keys(g).forEach(function (k) { var r = g[k][0], L = len(g[k]) * waste; rows.push({ kind: kk[1], item: kk[1] + ' ' + Math.round((r.w || 1) * 10) + ' mm' + (r.type ? ' · ' + r.type : ''), desc: g[k].length + ' runs, ' + (+st.waste || 0) + '% added for joins', qty: +(L / 100).toFixed(2), unit: 'm', colour: cw.c[kk[0] + ':' + r.id] || r.colour || '' }); }); });
    if (T.tstitch.length) { var g2 = grp(T.tstitch, function (r) { return (r.tex || 30) + '|' + (r.colour || ''); }); Object.keys(g2).forEach(function (k) { var r = g2[k][0], L = g2[k].reduce(function (s, x) { var pc = byId(p, x.pc); return s + (pc ? C.rangeLen(pc, x) * (pc.qty || 1) * (x.rows || 1) : 0); }, 0) * (+st.threadRatio || 2.6); rows.push({ kind: 'Thread', item: 'Topstitch thread Tex ' + (r.tex || 30), desc: 'Topstitching only, at ' + (+st.threadRatio || 2.6) + ' × seam length (lockstitch, needle and bobbin)', qty: +(L / 100).toFixed(1), unit: 'm', colour: cw.c['tstitch:' + r.id] || r.colour || '' }); }); }
    var gx = p.trims.graphic || []; gx.forEach(function (g) { var pc = byId(p, g.pc); rows.push({ kind: 'Artwork', item: g.name || 'Graphic', desc: (g.method || 'Print') + ' · ' + (+g.w || 0).toFixed(1) + ' × ' + (+g.h || 0).toFixed(1) + ' cm on ' + (pc ? pc.name : '?'), qty: pc ? pc.qty || 1 : 1, unit: 'pcs', colour: '' }); });
    return rows;
  };

  /* ---------- reshaping operations that rebuild the outline: darts, dart transfer, slash and spread, pleats ----------
     Edge settings (seam allowance overrides, hems, fold) and notches are remembered as points before the change and
     put back on whichever new edge they land on, so they survive the rebuild. */
  C.nearestSeg = function (pc, p) { var best = null; for (var s = 0; s < C.segCount(pc); s++) { var pts = C.segPts(pc, s, .1), acc = 0; for (var j = 1; j < pts.length; j++) { var a = pts[j - 1], b = pts[j], vx = b[0] - a[0], vy = b[1] - a[1], LL = vx * vx + vy * vy, L = Math.sqrt(LL), t = LL ? Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / LL)) : 0, d = Math.hypot(a[0] + vx * t - p[0], a[1] + vy * t - p[1]); if (!best || d < best.d) best = { seg: s, d: d, s: acc + L * t }; acc += L; } } return best; };
  C.anchors = function (pc) {
    var A = { segs: [], notches: [] };
    for (var k = 0; k < C.segCount(pc); k++) { var L = C.segLen(pc, k); [.1, .5, .9].forEach(function (f) { A.segs.push({ k: k, s: L * f, mid: C.pointAt(pc, k, C.tAt(pc, k, L * f)), sa: pc.sa.edges[k], hem: pc.hems.indexOf(k) >= 0, fold: pc.fold === k && f === .5 }); }); }
    pc.notches.forEach(function (nt) { if (nt.seg >= C.segCount(pc)) return; var r = C.notchPos(pc, nt); A.notches.push({ nt: nt, p: r.p, k: nt.seg, s: r.s }); });
    return A;
  };
  C.reattach = function (pc, A, map) {
    var e = {}, hems = [], fold = -1;
    A.segs.forEach(function (a) { var p = map(a.mid, a.k, a.s), ne = C.nearestSeg(pc, p); if (!ne || ne.d > .3) return; if (a.sa != null) e[ne.seg] = a.sa; if (a.hem && hems.indexOf(ne.seg) < 0) hems.push(ne.seg); if (a.fold) fold = ne.seg; });
    pc.sa.edges = e; pc.hems = hems; pc.fold = fold;
    pc.notches = A.notches.map(function (n) { var p = map(n.p, n.k, n.s), ne = C.nearestSeg(pc, p); if (!ne || ne.d > .3) return null; var nt = JSON.parse(JSON.stringify(n.nt)); nt.seg = ne.seg; nt.mode = 'dist'; nt.from = 'start'; nt.v = +ne.s.toFixed(3); return nt; }).filter(Boolean);
  };
  /* index of a node at (seg, t): an existing node when within 0.5 mm, otherwise a new one made by splitting */
  function nodeAt(pc, seg, t) { var n = pc.nodes.length, L = C.segLen(pc, seg), s = C.arc(pc, seg, t); if (s < .05) return { i: seg, split: false }; if (L - s < .05) return { i: (seg + 1) % n, split: false }; C.splitSeg(pc, seg, t); return { i: seg + 1, split: true }; }
  /* split a (cloned) outline at two outline points; A runs n1 -> n2 forward, B runs n2 -> n1 forward */
  function splitOutline(w, a, b) {
    var first = a.seg > b.seg || (a.seg === b.seg && a.t > b.t) ? b : a, second = first === a ? b : a;
    var r2 = nodeAt(w, second.seg, second.t), n2 = w.nodes[r2.i], t1 = first.seg === second.seg && r2.split ? first.t / second.t : first.t, r1 = nodeAt(w, first.seg, t1), n1 = w.nodes[r1.i];
    if (first !== a) { var tmp = n1; n1 = n2; n2 = tmp; }
    var N = w.nodes, i1 = N.indexOf(n1), i2 = N.indexOf(n2), A = [], B = [], i; if (i1 === i2) return null;
    for (i = i1; ; i = (i + 1) % N.length) { A.push(N[i]); if (i === i2) break; } for (i = i2; ; i = (i + 1) % N.length) { B.push(N[i]); if (i === i1) break; }
    return { A: A, B: B, n1: n1, n2: n2 };
  }
  function cpNode(nd, m, fresh) { var c = JSON.parse(JSON.stringify(nd)); if (fresh) c.id = uid('p'); if (m) { var q = ap(m, [c.x, c.y]); c.x = q[0]; c.y = q[1]; c.h1 = av(m, c.h1); c.h2 = av(m, c.h2); } return c; }
  function centroid(nodes) { var x = 0, y = 0; nodes.forEach(function (n) { x += n.x; y += n.y; }); return [x / nodes.length, y / nodes.length]; }
  /* slash along the line between two outline points and spread: 'parallel' moves the far side straight out, 'pivot' turns it about one end */
  C.slash = function (pc, a, b, o) {
    var w = JSON.parse(JSON.stringify(pc)), r = splitOutline(w, a, b); if (!r) return { err: 'Pick two different points on the outline.' };
    var P1 = [r.n1.x, r.n1.y], P2 = [r.n2.x, r.n2.y], dir = nrm(sub(P2, P1)), nor = [-dir[1], dir[0]], cb = centroid(r.B.slice(1, -1).length ? r.B.slice(1, -1) : r.B), sg = Math.sign((cb[0] - P1[0]) * nor[0] + (cb[1] - P1[1]) * nor[1]) || 1; nor = [nor[0] * sg, nor[1] * sg];
    var amt = +o.amt || 0, m, hingeFirst = o.hinge !== 'second';
    if (o.mode === 'pivot') { var hg = hingeFirst ? P1 : P2, ot = hingeFirst ? P2 : P1, R = dist(hg, ot); if (amt >= 2 * R) return { err: 'The spread is wider than the slash line is long.' }; var ang = 2 * Math.asin(amt / (2 * R)) * 180 / Math.PI; m = C.M.rot(ang, hg[0], hg[1]); var qq = ap(m, ot); if ((qq[0] - ot[0]) * nor[0] + (qq[1] - ot[1]) * nor[1] < 0) m = C.M.rot(-ang, hg[0], hg[1]); }
    else m = C.M.tr(nor[0] * amt, nor[1] * amt);
    var A2 = r.A.map(function (n) { return cpNode(n); }), B2 = r.B.map(function (n, i) { return cpNode(n, m, i === 0 || i === r.B.length - 1); });
    A2[0].h1 = null; A2[A2.length - 1].h2 = null; B2[0].h1 = null; B2[B2.length - 1].h2 = null; A2[0].smooth = A2[A2.length - 1].smooth = B2[0].smooth = B2[B2.length - 1].smooth = false;
    if (o.mode === 'pivot') { if (hingeFirst) { A2[0].h1 = r.B[r.B.length - 1].h1 ? av(m, r.B[r.B.length - 1].h1) : null; B2.pop(); } else { A2[A2.length - 1].h2 = B2[0].h2; B2.shift(); } }
    var side = function (p) { return (p[0] - P1[0]) * nor[0] + (p[1] - P1[1]) * nor[1] > 1e-6; };
    return { nodes: A2.concat(B2), map: function (p) { return side(p) ? ap(m, p) : p; }, P1: P1, P2: P2, nor: nor, m: m };
  };
  C.applyReshape = function (pc, res) { var A = C.anchors(pc); pc.nodes = res.nodes; C.reattach(pc, A, res.map);
    pc.internals.forEach(function (it) { if (it.pts) it.pts = it.pts.map(function (p) { return res.map(p, -1); }); if (it.c) it.c = res.map(it.c, -1); });
    if (pc.grain && res.moveGrain) { pc.grain.a = res.map(pc.grain.a, -1); pc.grain.b = res.map(pc.grain.b, -1); } };
  /* pleats: spread parallel by the pleat intake and mark the fold and placement lines */
  C.pleat = function (pc, a, b, o) {
    var d = +o.depth || 0, type = o.type || 'knife', intake = type === 'knife' ? 2 * d : 4 * d, res = C.slash(pc, a, b, { mode: 'parallel', amt: intake }); if (res.err) return res;
    var L = function (k) { return [[res.P1[0] + res.nor[0] * k, res.P1[1] + res.nor[1] * k], [res.P2[0] + res.nor[0] * k, res.P2[1] + res.nor[1] * k]]; }, lines = [], mk = function (k, purpose, label) { lines.push({ id: uid('in'), kind: 'line', pts: L(k), purpose: purpose, style: purpose === 'fold' ? 'solid' : 'dashed', label: label, visible: true, pleat: 1 }); };
    if (type === 'knife') { var fl = o.flip ? 0 : intake, pl = o.flip ? intake : 0; mk(fl, 'fold', 'Pleat fold'); mk(pl, 'placement', 'Pleat placement'); mk(d, 'guide', 'Pleat inside fold (' + (o.flip ? 'fold towards the other side' : 'fold towards the placement line') + ')'); }
    else { mk(0, 'fold', type === 'box' ? 'Box pleat fold' : 'Inverted pleat fold'); mk(intake, 'fold', type === 'box' ? 'Box pleat fold' : 'Inverted pleat fold'); mk(2 * d, 'placement', 'Pleat centre: bring both folds here'); }
    res.lines = lines; res.intake = intake; return res;
  };
  /* darts cut into the outline: a V from the edge to the apex, with the legs as two new edges */
  C.addDart = function (pc, seg, s, apex, width) {
    var w = JSON.parse(JSON.stringify(pc)), L = C.segLen(w, seg); if (!(width > 0) || width > L - .4) return { err: 'The dart is wider than the edge.' };
    var s0 = Math.max(.2, s - width / 2), s1 = Math.min(L - .2, s0 + width); s0 = s1 - width;
    var t0 = C.tAt(w, seg, s0), t1 = C.tAt(w, seg, s1), r1 = nodeAt(w, seg, t1), nb = w.nodes[r1.i], r0 = nodeAt(w, seg, r1.split ? t0 / t1 : t0), na = w.nodes[r0.i];
    var ap2 = node(apex[0], apex[1]); na.h2 = null; nb.h1 = null; na.smooth = nb.smooth = false;
    w.nodes.splice(w.nodes.indexOf(na) + 1, 0, ap2);
    var nodes = w.nodes.map(function (n) { return n; });
    return { nodes: nodes, map: function (p) { return p; }, dart: { id: uid('dt'), kind: 'outline', l1: na.id, apex: ap2.id, l2: nb.id, drill: true } };
  };
  function node(x, y) { return C.node(x, y); }
  C.dartInfo = function (pc, d) { if (d.kind !== 'outline') return null; var N = pc.nodes, ids = N.map(function (n) { return n.id; }), i1 = ids.indexOf(d.l1), ia = ids.indexOf(d.apex), i2 = ids.indexOf(d.l2); if (i1 < 0 || ia < 0 || i2 < 0) return null; var n = N.length; if ((i1 + 1) % n !== ia || (ia + 1) % n !== i2) return null;
    var A = N[ia], P1 = N[i1], P2 = N[i2], l1 = dist([P1.x, P1.y], [A.x, A.y]), l2 = dist([P2.x, P2.y], [A.x, A.y]), mid = [(P1.x + P2.x) / 2, (P1.y + P2.y) / 2], ang = Math.acos(Math.max(-1, Math.min(1, ((P1.x - A.x) * (P2.x - A.x) + (P1.y - A.y) * (P2.y - A.y)) / (l1 * l2 || 1)))) * 180 / Math.PI;
    return { i1: i1, ia: ia, i2: i2, apex: [A.x, A.y], p1: [P1.x, P1.y], p2: [P2.x, P2.y], leg1: l1, leg2: l2, width: dist([P1.x, P1.y], [P2.x, P2.y]), length: dist(mid, [A.x, A.y]), mid: mid, angle: ang }; };
  /* folding preview: the edge after the dart turned about the apex, so the seamline can be trued across the closed dart */
  C.dartFold = function (pc, d) { var I = C.dartInfo(pc, d); if (!I) return null; var N = pc.nodes, n = N.length, a1 = Math.atan2(I.p1[1] - I.apex[1], I.p1[0] - I.apex[0]), a2 = Math.atan2(I.p2[1] - I.apex[1], I.p2[0] - I.apex[0]), m = C.M.rot((a1 - a2) * 180 / Math.PI, I.apex[0], I.apex[1]), prev = N[(I.i1 - 1 + n) % n], next = N[(I.i2 + 1) % n];
    return [[prev.x, prev.y], I.p1, ap(m, [next.x, next.y])]; };
  /* move (transfer) a dart to another point on the outline: the part between the old and new positions turns about the apex */
  C.moveDart = function (pc, d, seg, t) {
    var I = C.dartInfo(pc, d); if (!I) return { err: 'This dart was changed and can no longer be moved. Remove it and add it again.' };
    var w = JSON.parse(JSON.stringify(pc)), A0 = C.anchors(pc), segN = seg, sN = C.arc(pc, seg, t);
    if (seg === I.i1 || seg === I.ia) return { err: 'Pick a point on the outline away from the dart.' };
    var r = nodeAt(w, seg, t), Nn = w.nodes[r.i], N = w.nodes, ids = N.map(function (n) { return n.id; }), i1 = ids.indexOf(d.l1), ia = ids.indexOf(d.apex), i2 = ids.indexOf(d.l2), iN = N.indexOf(Nn), n = N.length;
    if (iN === i1 || iN === ia || iN === i2) return { err: 'Pick a point on the outline away from the dart.' };
    var a1 = Math.atan2(I.p1[1] - I.apex[1], I.p1[0] - I.apex[0]), a2 = Math.atan2(I.p2[1] - I.apex[1], I.p2[0] - I.apex[0]), m = C.M.rot((a1 - a2) * 180 / Math.PI, I.apex[0], I.apex[1]), out = [], k, i;
    var first = cpNode(N[i1]); first.h2 = N[i2].h2 ? av(m, N[i2].h2) : null; out.push(first);                // the old legs meet at leg 1
    for (k = 1; ; k++) { i = (i2 + k) % n; if (i === iN) break; out.push(cpNode(N[i], m)); }                 // the turned part
    var nr = cpNode(N[iN], m, true); nr.h2 = null; nr.smooth = false; out.push(nr);                              // new leg 1 (turned copy of the new point)
    var apx = node(I.apex[0], I.apex[1]); out.push(apx);
    var nn = cpNode(N[iN]); nn.h1 = null; nn.smooth = false; out.push(nn);                                 // new leg 2 (the point where it was)
    for (k = 1; ; k++) { i = (iN + k) % n; if (i === i1) break; out.push(cpNode(N[i])); }
    var rot = function (k2, s2) { var x = k2; if (x < 0) return false; var span = (segN - I.i2 + n0) % n0; var off = (x - I.i2 + n0) % n0; return off < span || (off === span && s2 < sN); }, n0 = pc.nodes.length;
    return { nodes: out, map: function (p, k2, s2) { return rot(k2, s2) ? ap(m, p) : p; }, dart: { id: uid('dt'), kind: 'outline', l1: nr.id, apex: apx.id, l2: nn.id, drill: d.drill !== false }, anchors: A0 };
  };
  /* fill a dart in: the apex point goes and the legs' ends are joined straight */
  C.fillDart = function (pc, d) { var I = C.dartInfo(pc, d); if (!I) return { err: 'This dart was changed; delete its apex point with Edit pattern instead.' }; var nodes = pc.nodes.filter(function (n, i) { return i !== I.ia; }).map(function (n) { return JSON.parse(JSON.stringify(n)); }); return { nodes: nodes, map: function (p) { return p; } }; };


  /* ---------- seam allowance: the cutting line from the seamline ---------- */
  C.saOf = function (pc, i) { if (i === pc.fold) return 0; if (pc.sa.edges[i] != null) return +pc.sa.edges[i]; return pc.hems.indexOf(i) >= 0 ? +pc.sa.hem : +pc.sa.def; };
  function lineX(p, d, q, e) { var den = d[0] * e[1] - d[1] * e[0]; if (Math.abs(den) < 1e-9) return null; var t = ((q[0] - p[0]) * e[1] - (q[1] - p[1]) * e[0]) / den; return [p[0] + d[0] * t, p[1] + d[1] * t]; }
  C.cutLine = function (pc, fast) {
    var n = C.segCount(pc), F = C.flat(pc, .2), P = F.pts, sgn = areaOf(P) > 0 ? -1 : 1, out = [], warn = [];
    var offs = [];
    for (var i = 0; i < n; i++) { var d = C.saOf(pc, i), pts = C.segPts(pc, i, .2), o = [];
      for (var j = 0; j < pts.length; j++) { var a = pts[Math.max(0, j - 1)], b = pts[Math.min(pts.length - 1, j + 1)], t = nrm(sub(b, a)), nx = -t[1] * sgn, ny = t[0] * sgn; o.push([pts[j][0] + nx * d, pts[j][1] + ny * d]); }
      offs.push({ o: o, d: d, t0: nrm(sub(pts[1], pts[0])), t1: nrm(sub(pts[pts.length - 1], pts[pts.length - 2])) }); }
    for (i = 0; i < n; i++) {
      var A = offs[i], B = offs[(i + 1) % n], aEnd = A.o[A.o.length - 1], bStart = B.o[0], corner = pc.sa.corner[(i + 1) % n] || 'miter';
      out = out.concat(A.o.slice(0, -1));
      if (A.d === 0 && B.d === 0) { out.push(aEnd); continue; }
      var x = lineX(aEnd, A.t1, bStart, B.t0), node = C.ctrl(pc, (i + 1) % n).p0, far = x && dist(x, node) > Math.max(A.d, B.d) * 3;
      if (corner === 'miter' && x && !far) out.push(x);
      else if (corner === 'square' || far || !x) { out.push([aEnd[0] + A.t1[0] * A.d, aEnd[1] + A.t1[1] * A.d]); out.push([bStart[0] - B.t0[0] * B.d, bStart[1] - B.t0[1] * B.d]); }
      else if (corner === 'step') { out.push(aEnd); out.push(bStart); }
      else out.push(x);
    }
    if (!fast && C.selfHits(out).length) warn.push('The seam allowance overlaps itself, usually round a tight curve or a sharp corner. Reduce the allowance there or change the corner treatment.');
    return { pts: out, warn: warn };
  };

  /* ---------- notches, measurements ---------- */
  C.notchPos = function (pc, nt) { var L = C.segLen(pc, nt.seg), s = nt.mode === 'pct' ? L * nt.v / 100 : nt.mode === 'mid' ? L / 2 : nt.from === 'end' ? L - nt.v : nt.v, t = C.tAt(pc, nt.seg, s); return { p: C.pointAt(pc, nt.seg, t), tan: C.tangentAt(pc, nt.seg, t), s: s, L: L }; };
  C.measure = { line: function (a, b) { return dist(a, b); }, angle: function (a, o, b) { var u = nrm(sub(a, o)), v = nrm(sub(b, o)); return Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1]))) * 180 / Math.PI; }, poly: function (P) { var s = 0; for (var i = 1; i < P.length; i++) s += dist(P[i], P[i - 1]); return s; } };
  /* seam walking: two edges (or parts of them) that will be sewn; ease is the planned extra on the first */
  C.walk = function (A, B, ease) { var la = A.len, lb = B.len, diff = la - lb, plan = +ease || 0; return { a: la, b: lb, diff: diff, plan: plan, off: diff - plan, ok: Math.abs(diff - plan) <= .3 }; };

  /* ---------- from a Pattern Maker draft ---------- */
  C.fromDraft = function (r, o) {
    o = o || {}; var out = [];
    r.pieces.forEach(function (p, pi) {
      var poly = [], kinds = [], i;
      p.edges.forEach(function (e, ei) { for (var j = 0; j < e.p.length - 1; j++) { poly.push(e.p[j].slice()); kinds.push(ei); } });
      // dedupe
      var P = [], K = []; poly.forEach(function (q, k) { if (P.length && dist(P[P.length - 1], q) < 1e-4) return; P.push(q); K.push(kinds[k]); }); if (P.length > 2 && dist(P[0], P[P.length - 1]) < 1e-4) { P.pop(); K.pop(); }
      // fit edge by edge so every draft edge starts at a node
      var nodes = [], edgeOfSeg = [];
      p.edges.forEach(function (e, ei) { var pts = e.p.map(function (q) { return q.slice(); }), fit = fitRun(pts, .05, 0);
        for (var k = 0; k < fit.length - 1; k++) { var f = fit[k]; if (k === 0 && nodes.length) { nodes[nodes.length - 1].h2 = f[2]; edgeOfSeg[nodes.length - 1] = ei; continue; } nodes.push(C.node(f[0][0], f[0][1], f[1], f[2])); edgeOfSeg[nodes.length - 1] = ei; }
        var last = fit[fit.length - 1]; nodes.push(C.node(last[0][0], last[0][1], last[1], null)); edgeOfSeg[nodes.length - 1] = ei + 1; });
      if (nodes.length > 1 && dist([nodes[0].x, nodes[0].y], [nodes[nodes.length - 1].x, nodes[nodes.length - 1].y]) < 1e-3) { var end = nodes.pop(); nodes[0].h1 = end.h1; }
      for (i = 0; i < nodes.length; i++) if (edgeOfSeg[i] == null || edgeOfSeg[i] >= p.edges.length) edgeOfSeg[i] = Math.min(p.edges.length - 1, edgeOfSeg[i] || 0);
      var cutN = /Cut (\d+)/i.exec(p.cut || '') || [0, 1], pc = C.newPiece(nodes, { name: p.comp || p.name || p.id, cat: o.cat || '', dept: o.dept || '', size: o.size || '', qty: +cutN[1] || 1, pair: /pair|left and right/i.test(p.cut || ''), sa: o.sa, hemSA: o.hem });
      pc.auto = false; pc.src = p.id;
      for (i = 0; i < nodes.length; i++) { var et = p.edges[edgeOfSeg[i]] && p.edges[edgeOfSeg[i]].t; if (et === 'fold') pc.fold = i; if (et === 'hem') pc.hems.push(i); }
      pc.notes = [p.cut, p.notes].filter(Boolean).join(' · ');
      if (p.grain) pc.grain = { a: p.grain[0].slice(), b: p.grain[1].slice() };
      (p.marks || []).forEach(function (m) {
        if (m.t === 'notch' && m.c) { var best = null; for (var s = 0; s < C.segCount(pc); s++) { var pts = C.segPts(pc, s, .2), acc = 0; for (var q = 1; q < pts.length; q++) { var a = pts[q - 1], b = pts[q], L = dist(a, b), vx = b[0] - a[0], vy = b[1] - a[1], tt = Math.max(0, Math.min(1, ((m.c[0] - a[0]) * vx + (m.c[1] - a[1]) * vy) / (L * L || 1))), dd = Math.hypot(a[0] + vx * tt - m.c[0], a[1] + vy * tt - m.c[1]); if (!best || dd < best.d) best = { d: dd, seg: s, s: acc + L * tt }; acc += L; } } if (best && best.d < 1.5) pc.notches.push({ id: uid('nt'), seg: best.seg, mode: 'dist', v: +best.s.toFixed(2), from: 'start', type: (m.n || 1) > 1 ? 'double' : 'single', depth: .6, width: .2 }); }
        else if (m.t === 'dart' && m.p && m.p.length === 3) pc.darts.push({ id: uid('dt'), kind: 'edge', l1: m.p[0].slice(), apex: m.p[1].slice(), l2: m.p[2].slice() });
        else if (m.t === 'dart' && m.p && m.p.length >= 4) pc.darts.push({ id: uid('dt'), kind: 'double', pts: m.p.map(function (q) { return q.slice(); }) });
        else if (m.t === 'line' && m.p) pc.internals.push({ id: uid('in'), kind: 'line', pts: m.p.map(function (q) { return q.slice(); }), purpose: /fold/i.test(m.lab || '') ? 'fold' : /pleat/i.test(m.lab || '') ? 'fold' : 'guide', style: m.dash ? 'dashed' : 'solid', label: m.lab || '', visible: true });
        else if ((m.t === 'button' || m.t === 'drill' || m.t === 'dot') && m.c) pc.internals.push({ id: uid('in'), kind: 'point', pts: [m.c.slice()], purpose: m.t === 'button' ? 'placement' : 'cutting', label: m.t === 'button' ? 'button' : 'drill hole', style: 'solid', visible: true });
      });
      out.push(pc);
    });
    return out;
  };

  /* ---------- grading: each piece keeps, per size, how far each point moves from the base size ---------- */
  C.gradeSet = function (proj) { var g = proj.sizes && proj.sizes.groups && proj.sizes.groups[0]; if (!g) { proj.sizes = { groups: [{ id: 'g1', name: 'Size group 1', base: '', list: [] }] }; g = proj.sizes.groups[0]; } g.list = (g.list || []).filter(Boolean); if (g.list.length && g.list.indexOf(g.base) < 0) g.base = g.list[Math.floor(g.list.length / 2)]; return g; };
  /* the move of every point for one size; points without a rule follow their neighbours, weighted by distance along the outline */
  C.gradeDeltas = function (pc, size) {
    var n = pc.nodes.length, G = (pc.grade || {})[size] || {}, out = [], known = [], i;
    for (i = 0; i < n; i++) { var d = G[pc.nodes[i].id]; out.push(d ? d.slice() : null); if (d) known.push(i); }
    if (!known.length) return out.map(function () { return [0, 0]; });
    if (known.length === n) return out;
    var cum = [0], sc = C.segCount(pc); for (i = 0; i < n; i++) cum.push(cum[i] + (i < sc ? C.segLen(pc, i) : 0));
    var per = cum[n] || 1;
    for (i = 0; i < n; i++) { if (out[i]) continue; var a = null, b = null, k;
      for (k = 1; k <= n; k++) { var j = (i - k + n) % n; if (known.indexOf(j) >= 0) { a = j; break; } }
      for (k = 1; k <= n; k++) { var j2 = (i + k) % n; if (known.indexOf(j2) >= 0) { b = j2; break; } }
      var da = ((cum[i] - cum[a]) % per + per) % per, db = ((cum[b] - cum[i]) % per + per) % per, t = da + db > 0 ? da / (da + db) : .5, A = G[pc.nodes[a].id], B = G[pc.nodes[b].id];
      out[i] = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t]; }
    return out;
  };
  C.isGraded = function (pc) { return !!pc.grade && Object.keys(pc.grade).some(function (s) { return Object.keys(pc.grade[s] || {}).length; }); };
  /* a copy of the piece in another size: points move by their grade, internal marks and the grainline follow the nearest points */
  C.gradedPiece = function (pc, size, base) {
    var g = C.clone(pc); g.size = size; if (size === base || !pc.grade) return g;
    var D = C.gradeDeltas(pc, size); g.nodes.forEach(function (nd, i) { nd.x += D[i][0]; nd.y += D[i][1]; });
    var near = function (q) { var best = 0, bd = 1e18; pc.nodes.forEach(function (nd, i) { var d = (nd.x - q[0]) * (nd.x - q[0]) + (nd.y - q[1]) * (nd.y - q[1]); if (d < bd) { bd = d; best = i; } }); return D[best]; };
    var mv = function (q) { var d = near(q); return [q[0] + d[0], q[1] + d[1]]; };
    var avg = D.reduce(function (a, d) { return [a[0] + d[0] / D.length, a[1] + d[1] / D.length]; }, [0, 0]);
    g.internals.forEach(function (it) { it.pts = it.pts.map(mv); });
    g.darts.forEach(function (d) { ['l1', 'apex', 'l2'].forEach(function (k) { if (d[k]) d[k] = mv(d[k]); }); if (d.pts) d.pts = d.pts.map(mv); });
    if (g.grain) { g.grain.a = [g.grain.a[0] + avg[0], g.grain.a[1] + avg[1]]; g.grain.b = [g.grain.b[0] + avg[0], g.grain.b[1] + avg[1]]; }
    delete g.grade; return g;
  };
  /* a linear rule: the points move by (dx, dy) for every size step away from the base */
  C.setRule = function (pc, ids, dx, dy, list, base) {
    var bi = list.indexOf(base); if (bi < 0) return; pc.grade = pc.grade || {};
    list.forEach(function (sz, k) { var st = k - bi; pc.grade[sz] = pc.grade[sz] || {}; ids.forEach(function (id) { if (st === 0) delete pc.grade[sz][id]; else pc.grade[sz][id] = [+(dx * st).toFixed(4), +(dy * st).toFixed(4)]; }); });
  };
  C.ruleOf = function (pc, id, list, base) { var bi = list.indexOf(base), nx = list[bi + 1], pv = list[bi - 1], G = pc.grade || {}; if (nx && G[nx] && G[nx][id]) return G[nx][id].slice(); if (pv && G[pv] && G[pv][id]) return [-G[pv][id][0], -G[pv][id][1]]; return [0, 0]; };
  C.clearGrade = function (pc, ids) { if (!pc.grade) return; Object.keys(pc.grade).forEach(function (s) { if (!ids) delete pc.grade[s]; else ids.forEach(function (id) { delete pc.grade[s][id]; }); }); if (!ids) delete pc.grade; };
  /* grade a piece from drafts of the same garment in each size: base = the draft piece in the base size, sizes = {size: draft piece}; points of the edited piece take the move of the nearest draft point */
  C.autoGrade = function (pc, basePc, sizes, tol) {
    tol = tol || 1; var map = pc.nodes.map(function (nd) { var best = -1, bd = tol * tol; basePc.nodes.forEach(function (bn, i) { var d = (bn.x - nd.x) * (bn.x - nd.x) + (bn.y - nd.y) * (bn.y - nd.y); if (d < bd) { bd = d; best = i; } }); return best; });
    var hit = map.filter(function (i) { return i >= 0; }).length; if (!hit) return 0;
    pc.grade = {}; Object.keys(sizes).forEach(function (sz) { var sp = sizes[sz]; if (!sp || sp.nodes.length !== basePc.nodes.length) return; var G = pc.grade[sz] = {}; pc.nodes.forEach(function (nd, i) { var j = map[i]; if (j < 0) return; G[nd.id] = [+(sp.nodes[j].x - basePc.nodes[j].x).toFixed(4), +(sp.nodes[j].y - basePc.nodes[j].y).toFixed(4)]; }); });
    return hit;
  };

  /* ---------- project and history ---------- */
  C.newProject = function (o) { o = o || {}; return { app: 'forecut-pattern-maker', v: 1, name: o.name || 'Untitled pattern', unit: o.unit || 'cm', pieces: [], sewing: [], sizes: { groups: [{ id: 'g1', name: 'Size group 1', base: '', list: [] }] }, fabrics: [], colourways: [], stitches: [], view: { grid: true, snap: true, rulers: true, sa: true, seam: true, notches: true, grain: true, labels: true, internals: true, points: false, sewing: true }, created: new Date().toISOString() }; };
  C.History = function (proj, onChange) { this.p = proj; this.u = []; this.r = []; this.on = onChange || function () {}; };
  C.History.prototype.exec = function (label, fn) { var before = JSON.stringify(this.p); var res = fn(this.p); if (res === false) return false; this.u.push({ l: label, s: before }); if (this.u.length > 200) this.u.shift(); this.r = []; this.on(label); return true; };
  C.History.prototype.undo = function () { var e = this.u.pop(); if (!e) return null; this.r.push({ l: e.l, s: JSON.stringify(this.p) }); this.swap(JSON.parse(e.s)); this.on('Undo ' + e.l); return e.l; };
  C.History.prototype.redo = function () { var e = this.r.pop(); if (!e) return null; this.u.push({ l: e.l, s: JSON.stringify(this.p) }); this.swap(JSON.parse(e.s)); this.on('Redo ' + e.l); return e.l; };
  C.History.prototype.mark = function () { return JSON.stringify(this.p); };
  C.History.prototype.commit = function (label, before) { if (before === JSON.stringify(this.p)) return false; this.u.push({ l: label, s: before }); if (this.u.length > 200) this.u.shift(); this.r = []; this.on(label); return true; };
  C.History.prototype.swap = function (np) { var p = this.p; Object.keys(p).forEach(function (k) { delete p[k]; }); Object.assign(p, np); };
  C.serialize = function (proj) { return JSON.stringify(proj); };
  C.APP = 'forecut-pattern-maker';
  C.isProject = function (p) { return !!p && (p.app === C.APP || p.app === 'forecut-pattern-studio'); };
  C.parse = function (txt) { var p = JSON.parse(txt); if (!C.isProject(p)) throw new Error('This is not a Forecut Pattern Maker project file.'); p.app = C.APP; return p; };

  /* ---------- export ---------- */
  function placed(pc, q) { return [q[0] + (pc.x || 0), q[1] + (pc.y || 0)]; }
  C.exportSVG = function (proj, o) {
    o = o || {}; var pcs = proj.pieces.filter(function (pc) { return !pc.hidden && (!o.ids || o.ids.indexOf(pc.id) >= 0); }), b = [1e9, 1e9, -1e9, -1e9], M = 2;
    var paths = pcs.map(function (pc) { var cut = C.cutLine(pc).pts.map(function (q) { return placed(pc, q); }), seam = C.flat(pc, .15).pts.map(function (q) { return placed(pc, q); }); cut.concat(seam).forEach(function (q) { b[0] = Math.min(b[0], q[0]); b[1] = Math.min(b[1], q[1]); b[2] = Math.max(b[2], q[0]); b[3] = Math.max(b[3], q[1]); }); return { pc: pc, cut: cut, seam: seam }; });
    if (!pcs.length) b = [0, 0, 10, 10];
    var W = b[2] - b[0] + 2 * M, H = b[3] - b[1] + 2 * M, ox = M - b[0], oy = M - b[1], f = function (q) { return (q[0] + ox).toFixed(3) + ',' + (q[1] + oy).toFixed(3); };
    var s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W.toFixed(2) + 'cm" height="' + H.toFixed(2) + 'cm" viewBox="0 0 ' + W.toFixed(3) + ' ' + H.toFixed(3) + '"><g fill="none" stroke-linejoin="round">';
    paths.forEach(function (x) { var pc = x.pc;
      if (o.cut !== false) s += '<polygon points="' + x.cut.map(f).join(' ') + '" stroke="#111" stroke-width=".05"/>';
      if (o.seam !== false) s += '<polygon points="' + x.seam.map(f).join(' ') + '" stroke="#555" stroke-width=".03" stroke-dasharray=".3 .2"/>';
      if (o.notches !== false) pc.notches.forEach(function (nt) { var r = C.notchPos(pc, nt), p = placed(pc, r.p), nv = [-r.tan[1], r.tan[0]], sg = areaOf(C.flat(pc).pts) > 0 ? -1 : 1, d = C.saOf(pc, nt.seg) + .05, q = [p[0] + nv[0] * sg * (d + .01), p[1] + nv[1] * sg * (d + .01)], e = [q[0] - nv[0] * sg * (nt.depth || .6), q[1] - nv[1] * sg * (nt.depth || .6)]; s += '<polyline points="' + f(q) + ' ' + f(e) + '" stroke="#111" stroke-width=".05"/>'; });
      if (o.grain !== false && pc.grain) s += '<polyline points="' + f(placed(pc, pc.grain.a)) + ' ' + f(placed(pc, pc.grain.b)) + '" stroke="#111" stroke-width=".04"/>';
      if (o.internals !== false) pc.internals.forEach(function (it) { if (it.visible === false) return; s += '<polyline points="' + it.pts.map(function (q) { return f(placed(pc, q)); }).join(' ') + '" stroke="#333" stroke-width=".03"' + (it.style === 'dashed' ? ' stroke-dasharray=".4 .25"' : '') + '/>'; });
      if (o.labels !== false) { var bb = C.bbox(pc), c = placed(pc, [(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2]); s += '<text x="' + (c[0] + ox).toFixed(2) + '" y="' + (c[1] + oy).toFixed(2) + '" font-size="1" fill="#111" stroke="none" text-anchor="middle" font-family="Arial">' + esc(pc.name || 'Piece') + '</text><text x="' + (c[0] + ox).toFixed(2) + '" y="' + (c[1] + oy + 1.3).toFixed(2) + '" font-size=".6" fill="#555" stroke="none" text-anchor="middle" font-family="Arial">' + esc((pc.size ? 'Size ' + pc.size + ' · ' : '') + 'Cut ' + pc.qty + (pc.pair ? ' (pair)' : '') + (pc.fold >= 0 ? ' · on fold' : '')) + '</text>'; }
    });
    if (o.brand !== false) s += '<text x="' + (W - .6).toFixed(2) + '" y="' + (H - .6).toFixed(2) + '" font-size=".5" fill="#a9481f" stroke="none" text-anchor="end" font-family="Arial">Forecut Pattern Maker</text>';
    if (o.square !== false) s += '<rect x=".6" y="' + (H - 5.6).toFixed(2) + '" width="5" height="5" stroke="#111" stroke-width=".03"/><text x="3.1" y="' + (H - 2.9).toFixed(2) + '" font-size=".45" text-anchor="middle" stroke="none" fill="#111" font-family="Arial">5 cm</text>';
    return s + '</g></svg>';
  };
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  C.exportDXF = function (proj, o) { // R12 polylines on named layers, in the chosen units
    o = o || {}; var u = o.unit === 'mm' ? 10 : o.unit === 'in' ? 1 / 2.54 : 1, lines = ['0', 'SECTION', '2', 'HEADER', '9', '$INSUNITS', '70', o.unit === 'mm' ? '4' : o.unit === 'in' ? '1' : '5', '0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES'];
    function pl(P, layer, closed) { lines.push('0', 'POLYLINE', '8', layer, '66', '1', '70', closed ? '1' : '0'); P.forEach(function (q) { lines.push('0', 'VERTEX', '8', layer, '10', (q[0] * u).toFixed(4), '20', (-q[1] * u).toFixed(4)); }); lines.push('0', 'SEQEND'); }
    proj.pieces.forEach(function (pc) { if (pc.hidden || (o.ids && o.ids.indexOf(pc.id) < 0)) return; var tr = function (q) { return placed(pc, q); };
      pl(C.cutLine(pc).pts.map(tr), 'CUT', true); pl(C.flat(pc, .15).pts.map(tr), 'SEAM', true);
      pc.notches.forEach(function (nt) { var r = C.notchPos(pc, nt), nv = [-r.tan[1], r.tan[0]], sg = areaOf(C.flat(pc).pts) > 0 ? -1 : 1, d = C.saOf(pc, nt.seg); pl([[r.p[0] + nv[0] * sg * d, r.p[1] + nv[1] * sg * d], [r.p[0] + nv[0] * sg * (d - (nt.depth || .6)), r.p[1] + nv[1] * sg * (d - (nt.depth || .6))]].map(tr), 'NOTCH', false); });
      if (pc.grain) pl([pc.grain.a, pc.grain.b].map(tr), 'GRAIN', false);
      pc.internals.forEach(function (it) { if (it.pts.length > 1) pl(it.pts.map(tr), 'INTERNAL', it.kind === 'rect' || it.kind === 'ellipse'); });
      var bb = C.bbox(pc), c = tr([(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2]); lines.push('0', 'TEXT', '8', 'TEXT', '10', (c[0] * u).toFixed(3), '20', (-c[1] * u).toFixed(3), '40', (1 * u).toFixed(3), '1', (pc.name || 'Piece') + ' - Cut ' + pc.qty);
    });
    lines.push('0', 'ENDSEC', '0', 'EOF'); return lines.join('\n');
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = C; else root.FCCad = C;
})(typeof self !== 'undefined' ? self : this);
