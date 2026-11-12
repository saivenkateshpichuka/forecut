/* Forecut 3D Drape Studio: body form, pattern-to-3D assembly and cloth solver.
   Units are centimetres and seconds; y is up (floor at 0), z points out of the front of the body, x to the form's left.
   The solver is extended position-based dynamics: stretch and bend constraints from the flat pattern, zero-length seam
   constraints that pull the panels together, and collision with a smooth body form. It is a preview, not a fit sample. */
(function (root) {
  'use strict';
  var D = {}, PI = Math.PI, TAU = 2 * PI;

  /* ---------------- body form ---------------- */
  D.body = function (m, g) {
    var kid = g === 'kids', men = g === 'men' || g === 'unisex', wom = !kid && !men;
    var waistY = m.outseam, hps = waistY + m.nape, hipY = waistY - m.wh, crotchY = waistY - m.rise;
    var bustY = hps - (wom ? (m.bust_depth || m.bust / 12 + 16.5) : m.nape * (kid ? .42 : .45));
    var armY = hps - m.nape * (kid ? .42 : .48), shY = hps - (kid ? 2.5 : men ? 5 : 4.5);
    if (wom) armY = Math.max(armY, bustY + 3);
    function ab(C, k) { var f = PI * (3 * (1 + k) - Math.sqrt((3 + k) * (1 + 3 * k))); var a = C / f; return [a, a * k]; }
    var kB = kid ? .8 : men ? .72 : .76, kW = kid ? .82 : men ? .74 : .7, kH = kid ? .8 : men ? .68 : .7;
    var K = [];
    function addC(y, C, k, zc) { var e = ab(C, k); K.push([y, e[0], e[1], zc]); }
    addC(crotchY - 8, m.hip * .22, kH, -1);
    addC(crotchY - 6, m.hip * .58, kH, -1);
    addC(crotchY - 2, m.hip * .86, kH, -1);
    addC(hipY, m.hip, kH, wom ? -1.2 : -.8);
    addC((hipY + waistY) / 2, (m.hip + m.waist) / 2 + (wom ? 1 : 0), (kH + kW) / 2, -.5);
    addC(waistY, m.waist, kW, 0);
    if (wom) addC(bustY - 8, Math.max(m.waist + 2, m.bust - 14), .72, .5);
    else addC((waistY + bustY) / 2, (m.waist + m.bust) / 2, (kW + kB) / 2, 0);
    addC(bustY, m.bust, kB, wom ? 1.5 : .5);
    if (armY > bustY + 1.5) addC(armY, m.bust * (wom ? .97 : 1), .72, wom ? .8 : .3);
    var sa = m.shoulder / 2, nr = m.neck / TAU, neckTop = hps + (kid ? 6 : 9);
    K.push([shY - 3.5, sa - 1.2, kid ? 6.5 : 9, -.5]);
    K.push([shY, sa - 2.2, kid ? 5.5 : 7.5, -.8]);
    K.push([hps, nr + 1.8, nr + .6, -1.5]);
    K.push([hps + 2, nr * 1.04, nr * .96, -1.5]);
    K.push([neckTop, nr * 1.04, nr * .96, -1.2]);
    K.sort(function (p, q) { return p[0] - q[0]; });
    var step = .5, y0 = K[0][0], y1 = K[K.length - 1][0], N = Math.ceil((y1 - y0) / step) + 1;
    var A = new Float32Array(N), Bt = new Float32Array(N), C = new Float32Array(N), j = 0;
    for (var i = 0; i < N; i++) {
      var y = y0 + i * step; while (j < K.length - 2 && K[j + 1][0] < y) j++;
      var k0 = K[j], k1 = K[j + 1], t = Math.max(0, Math.min(1, (y - k0[0]) / ((k1[0] - k0[0]) || 1)));
      A[i] = k0[1] + (k1[1] - k0[1]) * t; Bt[i] = k0[2] + (k1[2] - k0[2]) * t; C[i] = k0[3] + (k1[3] - k0[3]) * t;
    }
    function blur(a, s) { var o = new Float32Array(a.length), r = Math.ceil(s * 3), w = []; for (var q = -r; q <= r; q++) w.push(Math.exp(-q * q / (2 * s * s)));
      for (var i = 0; i < a.length; i++) { var acc = 0, ws = 0; for (var q = -r; q <= r; q++) { var k = Math.min(a.length - 1, Math.max(0, i + q)); acc += a[k] * w[q + r]; ws += w[q + r]; } o[i] = acc / ws; } return o; }
    A = blur(A, 3); Bt = blur(Bt, 3); C = blur(C, 3);

    var segs = [], al = (kid ? 40 : 44) * PI / 180, sx = Math.sin(al), cy = Math.cos(al);
    var Lu = m.sleeve * .56 - 3, Lf = m.sleeve * .44, hipA = ab(m.hip, kH)[0];
    var rb = (m.bicep / TAU) * 1.12, re = (m.elbow || m.bicep * .86) / TAU, rw = m.wrist / TAU;
    var joints = [];
    [1, -1].forEach(function (s) {
      var J = [s * (sa - 3.2), shY - 3.2, -.5], d = [s * sx, -cy, 0];
      var E = [J[0] + d[0] * Lu, J[1] + d[1] * Lu, J[2] + 1], W = [E[0] + d[0] * Lf, E[1] + d[1] * Lf, E[2] + 2.5], Hn = [W[0] + d[0] * (kid ? 6 : 8), W[1] + d[1] * (kid ? 6 : 8), W[2] + 1];
      segs.push({ a: J, b: E, ra: rb, rb: re, k: 'arm' }, { a: E, b: W, ra: re, rb: rw, k: 'arm' }, { a: W, b: Hn, ra: rw * 1.15, rb: kid ? 2.2 : 2.9, k: 'hand' });
      var hj = [s * hipA * .42, crotchY + 6, -1], kn = [s * (hipA * .42 + 1.2), waistY - m.knee_l, -.5], an = [s * (hipA * .42 + 2.2), kid ? 5 : 8, -1.5];
      segs.push({ a: hj, b: kn, ra: m.thigh / TAU, rb: m.knee / TAU, k: 'leg' }, { a: kn, b: an, ra: (m.calf || m.knee) / TAU, rb: m.ankle / TAU, k: 'leg' },
        { a: [an[0], kid ? 3 : 4, an[2] - 2], b: [an[0] + s * 1.5, kid ? 2 : 3, an[2] + (kid ? 10 : 14)], ra: kid ? 3 : 4, rb: kid ? 2.4 : 3.2, k: 'foot' });
      joints.push({ s: s, J: J, d: d, up: [s * cy, sx, 0], rb: rb });
    });
    segs.forEach(function (q) { var v = [q.b[0] - q.a[0], q.b[1] - q.a[1], q.b[2] - q.a[2]]; q.v = v; q.l2 = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
      q.min = [Math.min(q.a[0], q.b[0]) - q.ra - 3, Math.min(q.a[1], q.b[1]) - q.ra - 3, Math.min(q.a[2], q.b[2]) - q.ra - 3];
      q.max = [Math.max(q.a[0], q.b[0]) + q.ra + 3, Math.max(q.a[1], q.b[1]) + q.ra + 3, Math.max(q.a[2], q.b[2]) + q.ra + 3]; });
    var hr = m.head / TAU, head = { c: [0, neckTop + hr * 1.05, -.5], r: [hr * .86, hr * 1.16, hr] };

    function torsoF(x, y, z) {
      var t = (y - y0) / step; if (t < 0) t = 0; if (t > N - 1.001) t = N - 1.001;
      var i = t | 0, f = t - i, a = A[i] + (A[i + 1] - A[i]) * f, b = Bt[i] + (Bt[i + 1] - Bt[i]) * f, c = C[i] + (C[i + 1] - C[i]) * f;
      var dz = z - c, r = Math.sqrt(x * x + dz * dz) + 1e-9, ct = x / r, st = dz / r;
      var d = r - a * b / Math.sqrt(b * b * ct * ct + a * a * st * st);
      var top = y - y1, bot = y0 - y; if (top > d) d = top; if (bot > d) d = bot;
      return d;
    }
    // signed distance (approx.) to the form; writes the outward normal into n
    function dist(x, y, z, n) {
      var best = 1e9;
      // torso
      if (y > y0 - 4 && y < y1 + 4 && Math.abs(x) < 40) {
        var f = torsoF(x, y, z);
        if (f < 6) {
          var e = .3, gx = (torsoF(x + e, y, z) - torsoF(x - e, y, z)) / (2 * e), gy = (torsoF(x, y + e, z) - torsoF(x, y - e, z)) / (2 * e), gz = (torsoF(x, y, z + e) - torsoF(x, y, z - e)) / (2 * e);
          var gl = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1;
          best = f / gl; n[0] = gx / gl; n[1] = gy / gl; n[2] = gz / gl;
        } else best = f;
      }
      for (var s = 0; s < segs.length; s++) {
        var q = segs[s];
        if (x < q.min[0] || y < q.min[1] || z < q.min[2] || x > q.max[0] || y > q.max[1] || z > q.max[2]) continue;
        var px = x - q.a[0], py = y - q.a[1], pz = z - q.a[2], t = (px * q.v[0] + py * q.v[1] + pz * q.v[2]) / q.l2;
        if (t < 0) t = 0; else if (t > 1) t = 1;
        var cx = px - q.v[0] * t, cyy = py - q.v[1] * t, cz = pz - q.v[2] * t, l = Math.sqrt(cx * cx + cyy * cyy + cz * cz) + 1e-9, dd = l - (q.ra + (q.rb - q.ra) * t);
        if (dd < best) { best = dd; n[0] = cx / l; n[1] = cyy / l; n[2] = cz / l; }
      }
      var hx = (x - head.c[0]) / head.r[0], hy = (y - head.c[1]) / head.r[1], hz = (z - head.c[2]) / head.r[2], hq = Math.sqrt(hx * hx + hy * hy + hz * hz);
      if (hq < 1.6) { var hd = (hq - 1) * head.r[0]; if (hd < best) { best = hd; var ux = hx / head.r[0], uy = hy / head.r[1], uz = hz / head.r[2], ul = Math.sqrt(ux * ux + uy * uy + uz * uz) || 1; n[0] = ux / ul; n[1] = uy / ul; n[2] = uz / ul; } }
      return best;
    }
    // push a point out of every part of the form it has entered (torso, limbs, head in turn); returns 1 on contact, normal in n
    function push(x, k, th, n) {
      var hit = 0, ax = 0, ay = 0, az = 0, X = x[k], Y = x[k + 1], Z = x[k + 2];
      if (Y > y0 - 4 && Y < y1 + 4 && Math.abs(X) < 40) {
        var f = torsoF(X, Y, Z);
        if (f < th + 1) {
          var e = .3, gx = (torsoF(X + e, Y, Z) - torsoF(X - e, Y, Z)) / (2 * e), gy = (torsoF(X, Y + e, Z) - torsoF(X, Y - e, Z)) / (2 * e), gz = (torsoF(X, Y, Z + e) - torsoF(X, Y, Z - e)) / (2 * e);
          var gl = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1, d = f / gl;
          if (d < th) { gx /= gl; gy /= gl; gz /= gl; X += gx * (th - d); Y += gy * (th - d); Z += gz * (th - d); ax += gx; ay += gy; az += gz; hit = 1; }
        }
      }
      for (var s = 0; s < segs.length; s++) {
        var q = segs[s];
        if (X < q.min[0] || Y < q.min[1] || Z < q.min[2] || X > q.max[0] || Y > q.max[1] || Z > q.max[2]) continue;
        var px = X - q.a[0], py = Y - q.a[1], pz = Z - q.a[2], t = (px * q.v[0] + py * q.v[1] + pz * q.v[2]) / q.l2;
        if (t < 0) t = 0; else if (t > 1) t = 1;
        var cx = px - q.v[0] * t, cyy = py - q.v[1] * t, cz = pz - q.v[2] * t, l = Math.sqrt(cx * cx + cyy * cyy + cz * cz) + 1e-9, dd = l - (q.ra + (q.rb - q.ra) * t);
        if (dd < th) { cx /= l; cyy /= l; cz /= l; X += cx * (th - dd); Y += cyy * (th - dd); Z += cz * (th - dd); ax += cx; ay += cyy; az += cz; hit = 1; }
      }
      var hx = (X - head.c[0]) / head.r[0], hy = (Y - head.c[1]) / head.r[1], hz = (Z - head.c[2]) / head.r[2], hq = Math.sqrt(hx * hx + hy * hy + hz * hz);
      if (hq < 1 + th / head.r[0]) { var sc = (1 + th / head.r[0]) / (hq || 1); X = head.c[0] + (X - head.c[0]) * sc; Y = head.c[1] + (Y - head.c[1]) * sc; Z = head.c[2] + (Z - head.c[2]) * sc; ax += hx; ay += hy; az += hz; hit = 1; }
      if (hit) { var al2 = Math.sqrt(ax * ax + ay * ay + az * az) || 1; n[0] = ax / al2; n[1] = ay / al2; n[2] = az / al2; x[k] = X; x[k + 1] = Y; x[k + 2] = Z; }
      return hit;
    }
    // clearance radius of a horizontal cylinder around the torso between two heights
    function maxA(ya, yb) { var r = 0; for (var i = 0; i < N; i++) { var y = y0 + i * step; if (y >= ya && y <= yb) r = Math.max(r, A[i], Bt[i] + Math.abs(C[i])); } return r; }
    return { m: m, g: g, dist: dist, push: push, torso: { A: A, B: Bt, C: C, y0: y0, step: step, N: N }, segs: segs, head: head, joints: joints, maxA: maxA,
      y: { waist: waistY, hps: hps, hip: hipY, crotch: crotchY, bust: bustY, arm: armY, shoulder: shY, neckTop: neckTop } };
  };

  /* ---------------- 2D helpers ---------------- */
  function plen(p) { var s = 0; for (var i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; }
  function resample(p, n) { // n segments, n+1 points evenly spaced by arc length
    var c = [0]; for (var i = 1; i < p.length; i++) c.push(c[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
    var L = c[c.length - 1] || 1, out = [], j = 1;
    for (var k = 0; k <= n; k++) { var want = L * k / n; while (j < p.length - 1 && c[j] < want) j++; var u = (want - c[j - 1]) / ((c[j] - c[j - 1]) || 1); u = Math.max(0, Math.min(1, u));
      out.push([p[j - 1][0] + (p[j][0] - p[j - 1][0]) * u, p[j - 1][1] + (p[j][1] - p[j - 1][1]) * u]); }
    return out;
  }
  function inPoly(x, y, P) { var c = false; for (var i = 0, j = P.length - 1; i < P.length; j = i++) { var a = P[i], b = P[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
  function segDist(x, y, a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy, t = l ? ((x - a[0]) * dx + (y - a[1]) * dy) / l : 0; t = Math.max(0, Math.min(1, t)); var ex = a[0] + dx * t - x, ey = a[1] + dy * t - y; return Math.sqrt(ex * ex + ey * ey); }
  function mirror(p) { return p.map(function (q) { return [-q[0], q[1]]; }).reverse(); }
  function splitAtY(p, y) { // p runs upward (y decreasing); returns [part below y, part above y]
    for (var i = 1; i < p.length; i++) { var a = p[i - 1], b = p[i]; if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) { var t = (y - a[1]) / (b[1] - a[1]), q = [a[0] + (b[0] - a[0]) * t, y]; return [p.slice(0, i).concat([q]), [q].concat(p.slice(i))]; } }
    return null;
  }

  /* ---------------- garment assembly ---------------- */
  // A panel: { name, segs:[{key, pts}], place(u,v)->[x,y,z] }. Seams: [[panel, key, rev], [panel, key, rev]].
  D.STYLES = {
    tshirt: { n: 'T-shirt', gid: 'tshirt', kind: 'torso' },
    top: { n: 'Top', gid: 'top', kind: 'torso' },
    tank: { n: 'Tank top', gid: 'tank', kind: 'torso' },
    sweat: { n: 'Sweatshirt', gid: 'hoodie', kind: 'torso', fix: { hood: 0, pockets: 0 } },
    kurta: { n: 'Kurta / tunic', gid: 'kurta', kind: 'torso' },
    dress: { n: 'Shift dress', gid: 'dress', kind: 'torso', fix: { dress: 'shift' }, def: { sleeve: 'plain' } },
    aline: { n: 'A-line skirt', gid: 'skirt', kind: 'skirt', fix: { skirt: 'aline' } },
    pencil: { n: 'Straight skirt', gid: 'skirt', kind: 'skirt', fix: { skirt: 'straight' } }
  };
  D.assemble = function (PM, sid, gender, m, opts, body) {
    var ST = D.STYLES[sid], gid = ST.gid, G = PM.GARMENTS[gid], o = {}, k;
    for (k in G.d) o[k] = G.d[k]; for (k in (ST.def || {})) o[k] = ST.def[k]; for (k in (opts || {})) o[k] = opts[k]; for (k in (ST.fix || {})) o[k] = ST.fix[k];
    var r = PM.build(gid, gender, m, o), byId = {};
    r.pieces.forEach(function (p) { if (!byId[p.id]) byId[p.id] = p; });
    var panels = [], seams = [], rings = [], by = body.y, yAxis = function (p) { return [0, p[1], 0]; };
    function half(pc, roles, darts) { // edges[0] is the centre fold; the rest run round the piece
      var right = [], left = [];
      for (var i = 1; i < pc.edges.length; i++) {
        var pts = pc.edges[i].p.map(function (q) { return q.slice(); });
        if (darts && i === 1) { cutDarts(pts, pc.marks, roles[0]).forEach(function (s) { right.push({ key: s.key + '.R', pts: s.pts }); }); continue; }
        right.push({ key: roles[i - 1] + '.R', pts: pts });
      }
      for (i = right.length - 1; i >= 0; i--) left.push({ key: right[i].key.replace('.R', '.L'), pts: mirror(right[i].pts) });
      return right.concat(left);
    }
    // V darts whose legs sit on an edge (skirt waist): cut the wedge out and sew the two legs together
    function cutDarts(pts, marks, role) {
      var ds = (marks || []).filter(function (k) { return k.t === 'dart' && k.p.length === 3; }).map(function (k) { return k.p[0][0] < k.p[2][0] ? k.p : [k.p[2], k.p[1], k.p[0]]; }).sort(function (a, b) { return a[0][0] - b[0][0]; });
      var out = [], cur = [pts[0]], j = 1, n = 0;
      function near(q) { var bi = 0, bd = 1e9; for (var i = 0; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - q[0], pts[i][1] - q[1]); if (d < bd) { bd = d; bi = i; } } return bd < 1.5 ? bi : -1; }
      ds.forEach(function (d) {
        var i1 = near(d[0]), i2 = near(d[2]); if (i1 < j || i2 <= i1) return;
        for (; j < i1; j++) cur.push(pts[j]); cur.push(d[0]); out.push({ key: role + n, pts: cur });
        out.push({ key: 'dA' + n, pts: [d[0], d[1]] }, { key: 'dB' + n, pts: [d[1], d[2]] });
        cur = [d[2]]; j = i2 + 1; n++;
      });
      for (; j < pts.length; j++) cur.push(pts[j]); out.push({ key: role + n, pts: cur });
      out.ndarts = n; return out;
    }
    function maxU(segs) { var u = 0; segs.forEach(function (s) { s.pts.forEach(function (q) { u = Math.max(u, Math.abs(q[0])); }); }); return u; }
    if (ST.kind === 'skirt') {
      var sf = byId['sk-front'], sb = byId['sk-back'];
      if (!sf || !sb) throw new Error('This skirt style is not available in 3D yet.');
      var R = Math.max(body.maxA(by.crotch - 10, by.waist + 2) + 3, Math.max(maxU(half(sf, ['waist', 'side', 'hem'])), maxU(half(sb, ['waist', 'side', 'hem']))) / 1.5);
      [['F', sf, 1], ['B', sb, -1]].forEach(function (P, pi) {
        var segs = half(P[1], ['waist', 'side', 'hem'], true), sgn = P[2], top = by.waist + 2.5;
        panels.push({ name: P[0], segs: segs, axis: yAxis, place: function (u, v) { var th = u / R; return [R * Math.sin(th), top - v, sgn * R * Math.cos(th) - (sgn < 0 ? 1 : 0)]; } });
        segs.forEach(function (s) { var mt = /^dA(\d+)\.(R|L)$/.exec(s.key); if (mt) seams.push(mt[2] === 'R' ? [[pi, s.key], [pi, 'dB' + mt[1] + '.R', 1]] : [[pi, s.key, 1], [pi, 'dB' + mt[1] + '.L']]); });
      });
      seams.push([[0, 'side.R'], [1, 'side.R']], [[0, 'side.L'], [1, 'side.L']]);
      var ring = []; panels.forEach(function (P, pi) { P.segs.forEach(function (s) { if (/^waist/.test(s.key)) ring.push([pi, s.key]); }); });
      rings.push(ring); // the waistband: the waist edge cannot get longer than it was cut
    } else {
      var f = byId.front, b = byId.back, sl = byId.sleeve;
      if (!f || !b || f.edges[0].t !== 'fold') throw new Error('This style is not available in 3D yet.');
      var roles = ['hem', 'side', 'arm', 'sh', 'neck'];
      var slit = +o.slit || 0, Lh = f.edges[1].p[0][1];
      var segF = half(f, roles), segB = half(b, roles);
      [segF, segB].forEach(function (segs) { // open the side seams below the slit
        if (!(slit > 0 && slit < Lh * .6)) return;
        for (var i = 0; i < segs.length; i++) {
          var s = segs[i]; if (s.key !== 'side.R' && s.key !== 'side.L') continue;
          var right = s.key === 'side.R', pts = right ? s.pts : s.pts.slice().reverse(), sp = splitAtY(pts, Lh - slit);
          if (!sp) continue;
          var lower = { key: 'slit.' + (right ? 'R' : 'L'), pts: right ? sp[0] : sp[0].slice().reverse() }, upper = { key: s.key, pts: right ? sp[1] : sp[1].slice().reverse() };
          segs.splice(i, 1, right ? lower : upper, right ? upper : lower); i++;
        }
      });
      var len = Lh, R2 = Math.max(body.maxA(Math.max(0, by.hps - len - 4), by.hps) + 3.2, Math.max(maxU(segF), maxU(segB)) / 1.42), top2 = by.hps + 1.5;
      panels.push({ name: 'F', segs: segF, axis: yAxis, place: function (u, v) { var th = u / R2; return [R2 * Math.sin(th), top2 - v, R2 * Math.cos(th) + .5]; } });
      panels.push({ name: 'B', segs: segB, axis: yAxis, place: function (u, v) { var th = u / R2; return [R2 * Math.sin(th), top2 - v, -R2 * Math.cos(th) - .5]; } });
      seams.push([[0, 'side.R'], [1, 'side.R']], [[0, 'side.L'], [1, 'side.L']], [[0, 'sh.R'], [1, 'sh.R']], [[0, 'sh.L'], [1, 'sh.L']]);
      if (sl && o.sleeve !== 'none') {
        var cap = sl.edges[0].p, mid = 0; for (var i = 0; i < cap.length; i++) if (cap[i][1] < cap[mid][1]) mid = i;
        var capB = cap.slice(0, mid + 1), capF = cap.slice(mid), bw = Math.abs(cap[0][0]);
        body.joints.forEach(function (J) {
          var segs = [{ key: 'capB', pts: capB }, { key: 'capF', pts: capF }, { key: 'uF', pts: sl.edges[1].p }, { key: 'hem', pts: sl.edges[2].p }, { key: 'uB', pts: sl.edges[3].p }];
          var CH = cap[0][1], uf = sl.edges[1].p;
          var hwAt = function (v) { if (v <= CH) return bw; for (var i = 1; i < uf.length; i++) if (uf[i][1] >= v) { var t = (v - uf[i - 1][1]) / ((uf[i][1] - uf[i - 1][1]) || 1); return uf[i - 1][0] + (uf[i][0] - uf[i - 1][0]) * t; } return uf[uf.length - 1][0]; };
          var rAt = function (v) { return Math.max(J.rb + 2.8 - Math.max(0, v - CH) * .03, 2 * hwAt(v) / TAU * 1.3); };
          panels.push({ name: J.s > 0 ? 'SR' : 'SL', segs: segs, axis: function (p) { var px = p[0] - J.J[0], py = p[1] - J.J[1], pz = p[2] - J.J[2], t = px * J.d[0] + py * J.d[1] + pz * J.d[2]; return [J.J[0] + J.d[0] * t, J.J[1] + J.d[1] * t, J.J[2] + J.d[2] * t]; }, place: function (u, v) {
            var rS = rAt(v), ph = u / hwAt(v) * PI / 1.3, s = v - CH * .25 + 2.5, c = Math.cos(ph) * rS, sn = Math.sin(ph) * rS;
            return [J.J[0] + J.d[0] * s + J.up[0] * c, J.J[1] + J.d[1] * s + J.up[1] * c, J.J[2] + J.d[2] * s + J.up[2] * c + sn + .5];
          } });
          var pi = panels.length - 1;
          if (J.s > 0) seams.push([[0, 'arm.R'], [pi, 'capF', 1]], [[1, 'arm.R'], [pi, 'capB']], [[pi, 'uF'], [pi, 'uB', 1]]);
          else seams.push([[0, 'arm.L'], [pi, 'capF']], [[1, 'arm.L'], [pi, 'capB', 1]], [[pi, 'uF'], [pi, 'uB', 1]]);
        });
      }
    }
    return { panels: panels, seams: seams, rings: rings, info: r.info, label: r.label, opts: o };
  };

  /* ---------------- meshing ---------------- */
  D.mesh = function (G, h, Delaunator) {
    var segCount = {}, keyOf = function (pi, key) { return pi + '|' + key; };
    G.panels.forEach(function (P, pi) { P.segs.forEach(function (s) { segCount[keyOf(pi, s.key)] = Math.max(1, Math.round(plen(s.pts) / h)); }); });
    G.seams.forEach(function (sm) { // both sides of a seam get the same number of points
      var a = keyOf(sm[0][0], sm[0][1]), b = keyOf(sm[1][0], sm[1][1]), sa = G.panels[sm[0][0]].segs.filter(function (s) { return s.key === sm[0][1]; })[0], sb = G.panels[sm[1][0]].segs.filter(function (s) { return s.key === sm[1][1]; })[0];
      var n = Math.max(2, Math.round(Math.max(plen(sa.pts), plen(sb.pts)) / h)); segCount[a] = segCount[b] = n;
    });
    var X = [], UV = [], T = [], panelOf = [], segIdx = {}, boundary = [], polys = [];
    G.panels.forEach(function (P, pi) {
      var base = X.length / 3, B = [], bIdx = {};
      P.segs.forEach(function (s, si) {
        var pts = resample(s.pts, segCount[keyOf(pi, s.key)]), ids = [];
        pts.forEach(function (q, k) {
          if (k === 0 && B.length) { ids.push(B.length - 1); return; }
          if (si === P.segs.length - 1 && k === pts.length - 1) { ids.push(0); return; }
          B.push(q); ids.push(B.length - 1);
        });
        bIdx[s.key] = ids;
      });
      // interior points on a triangular grid
      var minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9; B.forEach(function (q) { minx = Math.min(minx, q[0]); maxx = Math.max(maxx, q[0]); miny = Math.min(miny, q[1]); maxy = Math.max(maxy, q[1]); });
      var pts = B.slice(), dy = h * .866, row = 0;
      for (var y = miny + dy * .5; y < maxy; y += dy, row++) for (var x = minx + (row % 2 ? h * .5 : 0); x < maxx; x += h) {
        if (!inPoly(x, y, B)) continue;
        var md = 1e9; for (var i = 0; i < B.length; i++) { var dd = segDist(x, y, B[i], B[(i + 1) % B.length]); if (dd < md) md = dd; if (md < h * .55) break; }
        if (md >= h * .55) pts.push([x, y]);
      }
      var flat = new Float64Array(pts.length * 2); pts.forEach(function (q, i) { flat[2 * i] = q[0]; flat[2 * i + 1] = q[1]; });
      var del = new Delaunator(flat), tri = del.triangles, t0 = T.length;
      for (var t = 0; t < tri.length; t += 3) {
        var a = pts[tri[t]], b = pts[tri[t + 1]], c = pts[tri[t + 2]], cx = (a[0] + b[0] + c[0]) / 3, cy = (a[1] + b[1] + c[1]) / 3;
        if (!inPoly(cx, cy, B)) continue;
        var ar = Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2; if (ar < h * h * .02) continue;
        T.push(base + tri[t], base + tri[t + 1], base + tri[t + 2]);
      }
      pts.forEach(function (q) { var p = P.place(q[0], q[1]); X.push(p[0], p[1], p[2]); UV.push(q[0], q[1]); panelOf.push(pi); });
      // make every panel face outwards (mirrored placements reverse the winding)
      var out = 0; for (t = t0; t < T.length; t += 3) {
        var ia = 3 * T[t], ib = 3 * T[t + 1], ic = 3 * T[t + 2], ux = X[ib] - X[ia], uy = X[ib + 1] - X[ia + 1], uz = X[ib + 2] - X[ia + 2], vx = X[ic] - X[ia], vy = X[ic + 1] - X[ia + 1], vz = X[ic + 2] - X[ia + 2];
        var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, ce = [(X[ia] + X[ib] + X[ic]) / 3, (X[ia + 1] + X[ib + 1] + X[ic + 1]) / 3, (X[ia + 2] + X[ib + 2] + X[ic + 2]) / 3], ax = P.axis(ce);
        out += nx * (ce[0] - ax[0]) + ny * (ce[1] - ax[1]) + nz * (ce[2] - ax[2]);
      }
      if (out < 0) for (t = t0; t < T.length; t += 3) { var sw = T[t + 1]; T[t + 1] = T[t + 2]; T[t + 2] = sw; }
      for (var key in bIdx) segIdx[keyOf(pi, key)] = bIdx[key].map(function (i) { return base + i; });
      for (i = 0; i < B.length; i++) boundary.push(base + i);
      polys.push({ B: B, base: base, n: pts.length });
    });
    var seamPairs = [];
    G.seams.forEach(function (sm) {
      var a = segIdx[keyOf(sm[0][0], sm[0][1])].slice(), b = segIdx[keyOf(sm[1][0], sm[1][1])].slice();
      if (sm[0][2]) a.reverse(); if (sm[1][2]) b.reverse();
      for (var i = 0; i < a.length; i++) seamPairs.push(a[i], b[i]);
    });
    // long-range tethers: a flat panel can bend but never get longer than its pattern, so cap far-apart pairs at their flat distance
    var teth = [], seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    polys.forEach(function (P) {
      for (var i = 0; i < P.n; i++) {
        var a = P.base + i, ax = UV[2 * a], ay = UV[2 * a + 1], got = 0;
        for (var tries = 0; tries < 24 && got < 3; tries++) {
          var b = P.base + ((rnd() * P.n) | 0), bx = UV[2 * b], by = UV[2 * b + 1], d = Math.hypot(bx - ax, by - ay);
          if (d < h * 4 || d > 90) continue;
          var ok = true; for (var k = 1; k < 6 && ok; k++) ok = inPoly(ax + (bx - ax) * k / 6, ay + (by - ay) * k / 6, P.B);
          if (ok) { teth.push(a, b, d); got++; }
        }
      }
      // edges hold their shape best: tie boundary points to others further round the same edge
      var nb = P.B.length;
      for (i = 0; i < nb; i++) [3, 6, 12, 24].forEach(function (off) {
        if (off >= nb / 2) return; var j2 = (i + off) % nb, A = P.B[i], Bq = P.B[j2], d2 = Math.hypot(Bq[0] - A[0], Bq[1] - A[1]);
        if (d2 < h * 2) return; var ok2 = true; for (var k = 1; k < 6 && ok2; k++) ok2 = inPoly(A[0] + (Bq[0] - A[0]) * k / 6, A[1] + (Bq[1] - A[1]) * k / 6, P.B);
        if (ok2) teth.push(P.base + i, P.base + j2, d2);
      });
    });
    var ringsOut = (G.rings || []).map(function (rg) { var ids = [], L = 0; rg.forEach(function (k) { var a = segIdx[keyOf(k[0], k[1])]; for (var i = 0; i < a.length; i++) { if (ids.indexOf(a[i]) < 0) ids.push(a[i]); if (i) L += Math.hypot(UV[2 * a[i]] - UV[2 * a[i - 1]], UV[2 * a[i] + 1] - UV[2 * a[i - 1] + 1]); } }); return { ids: ids, len: L }; });
    return { rings: ringsOut, x: new Float32Array(X), uv: new Float32Array(UV), tri: new Uint32Array(T), panel: new Uint8Array(panelOf), seams: new Uint32Array(seamPairs), segIdx: segIdx, teth: new Float32Array(teth), polys: polys };
  };

  /* ---------------- fabrics ---------------- */
  D.FABRICS = {
    poplin: { n: 'Cotton poplin', gsm: 115, stretch: 0, bend: 6e-5, fric: .45, rough: .78, note: 'Crisp woven, holds its shape' },
    jersey: { n: 'Cotton jersey', gsm: 170, stretch: 4e-6, bend: 2.2e-4, fric: .5, rough: .86, note: 'Soft knit with some stretch' },
    linen: { n: 'Linen', gsm: 160, stretch: 0, bend: 3e-5, fric: .5, rough: .9, note: 'Firm woven, stands away from the body' },
    rayon: { n: 'Rayon challis', gsm: 125, stretch: 0, bend: 4e-4, fric: .35, rough: .7, note: 'Fluid woven, drapes close' },
    crepe: { n: 'Silk crepe', gsm: 95, stretch: 0, bend: 6e-4, fric: .3, rough: .55, note: 'Light and fluid' },
    georgette: { n: 'Georgette / chiffon', gsm: 70, stretch: 0, bend: 1.4e-3, fric: .3, rough: .6, note: 'Very light, soft folds' },
    denim: { n: 'Light denim (8 oz)', gsm: 270, stretch: 0, bend: 1.2e-5, fric: .55, rough: .92, note: 'Heavy, stiff woven' },
    fleece: { n: 'Fleece-back knit', gsm: 300, stretch: 6e-6, bend: 5e-5, fric: .6, rough: .95, note: 'Thick knit, rounded folds' }
  };

  /* ---------------- solver ---------------- */
  function Sim(M, body, fab, h) {
    var n = this.n = M.x.length / 3; this.M = M; this.body = body; this.fab = fab;
    this.x = M.x; this.p = new Float32Array(n * 3); this.v = new Float32Array(n * 3); this.w = new Float32Array(n);
    var mass = new Float32Array(n), dens = fab.gsm / 10000, tri = M.tri, uv = M.uv, i;
    var edges = {}, E = [], Bn = [];
    function key(a, b) { return a < b ? a + '_' + b : b + '_' + a; }
    for (i = 0; i < tri.length; i += 3) {
      var a = tri[i], b = tri[i + 1], c = tri[i + 2], ar = Math.abs((uv[2 * b] - uv[2 * a]) * (uv[2 * c + 1] - uv[2 * a + 1]) - (uv[2 * c] - uv[2 * a]) * (uv[2 * b + 1] - uv[2 * a + 1])) / 2;
      mass[a] += ar * dens / 3; mass[b] += ar * dens / 3; mass[c] += ar * dens / 3;
      [[a, b, c], [b, c, a], [c, a, b]].forEach(function (e) { var k = key(e[0], e[1]); if (edges[k] === undefined) { edges[k] = [e[0], e[1], e[2], -1]; } else edges[k][3] = e[2]; });
    }
    function rest(a, b) { return Math.hypot(uv[2 * a] - uv[2 * b], uv[2 * a + 1] - uv[2 * b + 1]); }
    for (var k in edges) { var e = edges[k]; E.push(e[0], e[1], rest(e[0], e[1])); if (e[3] >= 0) Bn.push(e[2], e[3], rest(e[2], e[3])); }
    for (i = 0; i < n; i++) this.w[i] = mass[i] > 0 ? 1 / mass[i] : 0;
    this.E = new Float32Array(E); this.B = new Float32Array(Bn); this.S = M.seams; this.Tt = M.teth || new Float32Array(0); this.rings = M.rings || [];
    this.t = 0; this.sub = 14; this.th = .32; this.settled = false; this.calm = 0;
    // per-vertex gap to the body, for the fit map
    this.gap = new Float32Array(n); this.strain = new Float32Array(n);
  }
  Sim.prototype.step = function (frameDt) {
    var n = this.n, x = this.x, p = this.p, v = this.v, w = this.w, sub = this.sub, dt = Math.min(frameDt, 1 / 30) / sub, fab = this.fab;
    var E = this.E, Bn = this.B, S = this.S, body = this.body, th = this.th, nrm = [0, 0, 0], nrm2 = [0, 0, 0];
    var aS = fab.stretch / (dt * dt), aB = fab.bend / (dt * dt), mu = fab.fric, i, j;
    for (var s = 0; s < sub; s++) {
      var tt = this.t, gScale = tt < .7 ? 0 : Math.min(1, (tt - .7) / .5), g = -981 * gScale * dt, damp = tt < .7 ? .985 : .9985;
      var sewMax = tt < .7 ? .25 : 1.5;
      for (i = 0; i < n; i++) { if (!w[i]) continue; var i3 = 3 * i; v[i3 + 1] += g; v[i3] *= damp; v[i3 + 1] *= damp; v[i3 + 2] *= damp;
        p[i3] = x[i3]; p[i3 + 1] = x[i3 + 1]; p[i3 + 2] = x[i3 + 2]; x[i3] += v[i3] * dt; x[i3 + 1] += v[i3 + 1] * dt; x[i3 + 2] += v[i3 + 2] * dt; }
      // stretch
      for (j = 0; j < E.length; j += 3) {
        var a = E[j] * 3, b = E[j + 1] * 3, r = E[j + 2], wa = w[E[j]], wb = w[E[j + 1]], dx = x[b] - x[a], dy = x[b + 1] - x[a + 1], dz = x[b + 2] - x[a + 2], l = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (l < 1e-6) continue; var C = l - r, lam = C / (wa + wb + aS) / l;
        x[a] += wa * lam * dx; x[a + 1] += wa * lam * dy; x[a + 2] += wa * lam * dz; x[b] -= wb * lam * dx; x[b + 1] -= wb * lam * dy; x[b + 2] -= wb * lam * dz;
      }
      // tethers (only when stretched past the flat pattern)
      var Tt = this.Tt;
      for (j = 0; j < Tt.length; j += 3) {
        var ta = Tt[j] * 3, tb = Tt[j + 1] * 3, tr = Tt[j + 2], twa = w[Tt[j]], twb = w[Tt[j + 1]], gx = x[tb] - x[ta], gy = x[tb + 1] - x[ta + 1], gz = x[tb + 2] - x[ta + 2], tl = Math.sqrt(gx * gx + gy * gy + gz * gz);
        if (tl <= tr * 1.01) continue; var tk = (tl - tr * 1.01) / (twa + twb) / tl;
        x[ta] += twa * tk * gx; x[ta + 1] += twa * tk * gy; x[ta + 2] += twa * tk * gz; x[tb] -= twb * tk * gx; x[tb + 1] -= twb * tk * gy; x[tb + 2] -= twb * tk * gz;
      }
      // bending (distance across each shared edge; it only resists folding, not stretching)
      for (j = 0; j < Bn.length; j += 3) {
        var a2 = Bn[j] * 3, b2 = Bn[j + 1] * 3, r2 = Bn[j + 2], wa2 = w[Bn[j]], wb2 = w[Bn[j + 1]], ex = x[b2] - x[a2], ey = x[b2 + 1] - x[a2 + 1], ez = x[b2 + 2] - x[a2 + 2], l2 = Math.sqrt(ex * ex + ey * ey + ez * ez);
        if (l2 < 1e-6 || l2 > r2) continue; var lam2 = (l2 - r2) / (wa2 + wb2 + aB) / l2;
        x[a2] += wa2 * lam2 * ex; x[a2 + 1] += wa2 * lam2 * ey; x[a2 + 2] += wa2 * lam2 * ez; x[b2] -= wb2 * lam2 * ex; x[b2 + 1] -= wb2 * lam2 * ey; x[b2 + 2] -= wb2 * lam2 * ez;
      }
      // seams: pull the matching points together, a little at a time while sewing
      for (j = 0; j < S.length; j += 2) {
        var a3 = S[j] * 3, b3 = S[j + 1] * 3, fx = x[b3] - x[a3], fy = x[b3 + 1] - x[a3 + 1], fz = x[b3 + 2] - x[a3 + 2], l3 = Math.sqrt(fx * fx + fy * fy + fz * fz);
        if (l3 < 1e-6) continue; var wa3 = w[S[j]], wb3 = w[S[j + 1]], ws = wa3 + wb3, mv = Math.min(l3, sewMax) / l3;
        x[a3] += fx * mv * wa3 / ws; x[a3 + 1] += fy * mv * wa3 / ws; x[a3 + 2] += fz * mv * wa3 / ws; x[b3] -= fx * mv * wb3 / ws; x[b3 + 1] -= fy * mv * wb3 / ws; x[b3 + 2] -= fz * mv * wb3 / ws;
      }
      // waistbands: shrink the ring back towards its own centre when it has been stretched
      for (var ri = 0; ri < this.rings.length; ri++) {
        var rg = this.rings[ri], ids = rg.ids, cx0 = 0, cz0 = 0, q;
        for (q = 0; q < ids.length; q++) { cx0 += x[3 * ids[q]]; cz0 += x[3 * ids[q] + 2]; } cx0 /= ids.length; cz0 /= ids.length;
        var ord = ids.slice().sort(function (a, b) { return Math.atan2(x[3 * a + 2] - cz0, x[3 * a] - cx0) - Math.atan2(x[3 * b + 2] - cz0, x[3 * b] - cx0); }), circ = 0;
        for (q = 0; q < ord.length; q++) { var qa = 3 * ord[q], qb = 3 * ord[(q + 1) % ord.length]; circ += Math.hypot(x[qa] - x[qb], x[qa + 2] - x[qb + 2]); }
        if (circ > rg.len * 1.01) { var sc = rg.len * 1.01 / circ; for (q = 0; q < ids.length; q++) { var qi = 3 * ids[q]; x[qi] = cx0 + (x[qi] - cx0) * sc; x[qi + 2] = cz0 + (x[qi + 2] - cz0) * sc; } }
      }
      // body
      for (i = 0; i < n; i++) {
        var k3 = 3 * i;
        var hitB = body.push(x, k3, th, nrm);
        if (s === sub - 1) this.gap[i] = body.dist(x[k3], x[k3 + 1], x[k3 + 2], nrm2);
        if (hitB) {
          var mx = x[k3] - p[k3], my = x[k3 + 1] - p[k3 + 1], mz = x[k3 + 2] - p[k3 + 2], dn = mx * nrm[0] + my * nrm[1] + mz * nrm[2];
          var tx = mx - dn * nrm[0], ty = my - dn * nrm[1], tz = mz - dn * nrm[2];
          x[k3] -= tx * mu; x[k3 + 1] -= ty * mu; x[k3 + 2] -= tz * mu;
        }
        if (x[k3 + 1] < .3) x[k3 + 1] = .3; // floor
      }
      var ke = 0;
      for (i = 0; i < n * 3; i++) { v[i] = (x[i] - p[i]) / dt; }
      this.t += dt;
    }
    for (i = 0, ke = 0; i < n * 3; i++) ke += v[i] * v[i];
    var vrms = Math.sqrt(ke / n);
    if (this.t > 2 && vrms < 1.2) this.calm += frameDt; else this.calm = 0;
    if (this.calm > .6 || this.t > 14) this.settled = true;
    return vrms;
  };
  Sim.prototype.seamGap = function () { var S = this.S, x = this.x, mx = 0; for (var j = 0; j < S.length; j += 2) { var a = S[j] * 3, b = S[j + 1] * 3; mx = Math.max(mx, Math.hypot(x[a] - x[b], x[a + 1] - x[b + 1], x[a + 2] - x[b + 2])); } return mx; };
  Sim.prototype.computeStrain = function () {
    var E = this.E, x = this.x, n = this.n, s = this.strain, c = new Float32Array(n), i;
    for (i = 0; i < n; i++) s[i] = 0;
    for (var j = 0; j < E.length; j += 3) { var a = E[j], b = E[j + 1], l = Math.hypot(x[3 * a] - x[3 * b], x[3 * a + 1] - x[3 * b + 1], x[3 * a + 2] - x[3 * b + 2]) / E[j + 2]; s[a] += l; s[b] += l; c[a]++; c[b]++; }
    for (i = 0; i < n; i++) s[i] = c[i] ? s[i] / c[i] : 1;
    return s;
  };
  D.Sim = Sim;
  D.plen = plen;
  if (typeof module !== 'undefined' && module.exports) module.exports = D; else root.FCDrape = D;
})(typeof window !== 'undefined' ? window : this);
