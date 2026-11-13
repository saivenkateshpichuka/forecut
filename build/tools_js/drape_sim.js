/* Forecut 3D Drape Studio: body form, pattern-to-3D assembly and cloth solver.
   Units are centimetres and seconds; y is up (floor at 0), z points out of the front of the body, x to the form's left.
   The solver is extended position-based dynamics: stretch and bend constraints from the flat pattern, zero-length seam
   constraints that pull the panels together, and collision with a smooth body form. It is a preview, not a fit sample. */
(function (root) {
  'use strict';
  var D = {}, PI = Math.PI, TAU = 2 * PI;

  /* ---------------- avatar ---------------- */
  // Realistic avatars from the MakeHuman base mesh (CC0). One stored shape per size; here it is fitted exactly to the
  // measurements: heights (crotch, waist, neck) by a vertical remap, then bust, waist and hip girths by scaling each torso
  // level about its own centre. Collision uses a signed distance field built from the fitted mesh.
  D.loadAvatars = function (buf, meta) {
    var L = meta.layout;
    return { meta: meta, tri: new Uint16Array(buf, L.tri[0], L.tri[1] / 2), part: new Uint8Array(buf, L.part[0], L.part[1]),
      shape: function (key) { var sh = meta.shapes[key]; return sh ? new Int16Array(buf, L.shape0 + sh.i * L.shapeBytes, meta.n * 3) : null; } };
  };
  var LEN = ['outseam', 'nape', 'wh', 'rise', 'knee_l', 'sleeve', 'inseam', 'bust_depth'];
  D.body = function (m0, g, AV, size, targetH, pose) {
    var b = fitBody(m0, g, AV, size, pose);
    if (targetH > 60 && targetH < 230 && Math.abs(targetH - b.height) > .5) { // a taller or shorter body: scale every length, keep the girths
      var m = {}, k; for (k in m0) m[k] = m0[k]; var f = targetH / b.height; LEN.forEach(function (q) { if (m[q]) m[q] = Math.round(m[q] * f * 10) / 10; });
      b = fitBody(m, g, AV, size, pose);
    }
    buildSDF(b);
    return b;
  };
  function fitBody(m, g, AV, size, pose) {
    pose = pose || {}; var kid = /kids|boy|girl/.test(g), gk = g === 'unisex' ? 'men' : g, meta = AV.meta, key = gk + '|' + size;
    if (!meta.shapes[key]) { // custom size: the stored shape nearest in bust and hip
      var best = null, bd = 1e9; Object.keys(meta.shapes).forEach(function (k2) { if (k2.indexOf(gk + '|') !== 0) return; best = best || k2; }); key = best;
    }
    var n = meta.n, raw = AV.shape(key), tri = AV.tri, part = AV.part, P = new Float32Array(n * 3), i, j;
    for (i = 0; i < n * 3; i++) P[i] = raw[i] * meta.scale;
    var J = {}, js = meta.shapes[key].joints; for (var q in js) J[q] = js[q].slice();
    var tw = new Float32Array(n), aw = new Float32Array(n), lw = new Float32Array(n), hw = new Float32Array(n);
    for (i = 0; i < n; i++) { tw[i] = part[4 * i] / 255; aw[i] = part[4 * i + 1] / 255; lw[i] = part[4 * i + 2] / 255; hw[i] = part[4 * i + 3] / 255; }
    // torso-only triangles for girth slices
    var TT = []; for (i = 0; i < tri.length; i += 3) { var a = tri[i], b2 = tri[i + 1], c = tri[i + 2]; if (tw[a] + hw[a] > .5 && tw[b2] + hw[b2] > .5 && tw[c] + hw[c] > .5) TT.push(a, b2, c); }
    function girth(y) { // tape measure: perimeter of the convex outline of the torso cut at height y
      var pts = [];
      for (var t = 0; t < TT.length; t += 3) {
        var v = [TT[t], TT[t + 1], TT[t + 2]];
        for (var e = 0; e < 3; e++) { var A = 3 * v[e], B = 3 * v[(e + 1) % 3], ya = P[A + 1], yb = P[B + 1]; if ((ya - y) * (yb - y) < 0) { var u = (y - ya) / (yb - ya); pts.push([P[A] + (P[B] - P[A]) * u, P[A + 2] + (P[B + 2] - P[A + 2]) * u]); } }
      }
      if (pts.length < 3) return 0;
      return hullLen(pts);
    }
    function scan(y0, y1, max) { var by = y0, bg = max ? -1 : 1e9; for (var y = y0; y <= y1; y += .5) { var gg = girth(y); if (gg && (max ? gg > bg : gg < bg)) { bg = gg; by = y; } } return by; }
    function marks() {
      var cr = 1e9; for (i = 0; i < n; i++) if (Math.abs(P[3 * i]) < .8 && lw[i] < .5 && P[3 * i + 1] > 15 && P[3 * i + 1] < cr) cr = P[3 * i + 1];
      var hps = J.neck[1] + 1, sh = (J['l-shoulder'][1] + J['r-shoulder'][1]) / 2;
      var wa = scan(cr + .3 * (hps - cr), cr + .62 * (hps - cr), false), hp = scan(cr + 2, wa - 5, true), bu = scan(wa + 8, sh - 4, true);
      return { crotch: cr, hps: hps, waist: wa, hip: hp, bust: bu, shoulder: sh };
    }
    var M0 = marks();
    // 1. heights: crotch, waist and neck base land exactly where the size chart puts them
    var tc = m.outseam - m.rise, tw2 = m.outseam, th = m.outseam + m.nape, kt = (th - tw2) / (M0.hps - M0.waist), kh = (kt + 1) / 2;
    function remap(y) {
      if (y <= M0.crotch) return y * tc / M0.crotch;
      if (y <= M0.waist) return tc + (y - M0.crotch) * (tw2 - tc) / (M0.waist - M0.crotch);
      if (y <= M0.hps) return tw2 + (y - M0.waist) * kt;
      return th + (y - M0.hps) * kh;
    }
    for (i = 0; i < n; i++) P[3 * i + 1] = remap(P[3 * i + 1]);
    for (q in J) J[q][1] = remap(J[q][1]);
    var Y = { crotch: tc, waist: tw2, hps: th, hip: remap(M0.hip), bust: g === 'women' ? th - (m.bust_depth || m.bust / 12 + 16.5) : th - m.nape * (kid ? .42 : .45), shoulder: remap(M0.shoulder) }; // bust line where the pattern puts it
    // pose: raise both arms to the same A-pose (46 degrees from the body) so every size has room under the arm
    ['l', 'r'].forEach(function (sd) {
      var Sj = J[sd + '-shoulder'], E = J[sd + '-elbow'], sg = sd === 'l' ? 1 : -1, a0 = Math.atan2(Math.abs(E[0] - Sj[0]), Sj[1] - E[1]), da = ((+pose.arm || 46) * PI / 180 - a0) * sg;
      function rot(p, w) { var c = Math.cos(da * w), s2 = Math.sin(da * w), dx = p[0] - Sj[0], dy = p[1] - Sj[1]; return [Sj[0] + dx * c - dy * s2, Sj[1] + dx * s2 + dy * c]; }
      for (var t = 0; t < n; t++) { if (aw[t] <= 0 || (P[3 * t] > 0) !== (sg > 0)) continue; var r2 = rot([P[3 * t], P[3 * t + 1]], aw[t]); P[3 * t] = r2[0]; P[3 * t + 1] = r2[1]; }
      ['-elbow', '-hand'].forEach(function (jn) { var r3 = rot(J[sd + jn], 1); J[sd + jn][0] = r3[0]; J[sd + jn][1] = r3[1]; });
    });
    // elbows bend forward and legs open from the hips, when the pose asks for it
    if (+pose.elbow) ['l', 'r'].forEach(function (sd) {
      var Sj = J[sd + '-shoulder'], E = J[sd + '-elbow'], H = J[sd + '-hand'], sg = sd === 'l' ? 1 : -1, ax = [E[0] - Sj[0], E[1] - Sj[1], E[2] - Sj[2]], al = Math.hypot(ax[0], ax[1], ax[2]) || 1; ax = [ax[0] / al, ax[1] / al, ax[2] / al];
      var rotAx = [-ax[1], ax[0], 0], rl = Math.hypot(rotAx[0], rotAx[1]) || 1; rotAx = [rotAx[0] / rl * sg, rotAx[1] / rl * sg, 0];
      function rotP(p, ang) { var c = Math.cos(ang), s2 = Math.sin(ang), k = rotAx, v = [p[0] - E[0], p[1] - E[1], p[2] - E[2]], d = k[0] * v[0] + k[1] * v[1] + k[2] * v[2], cr = [k[1] * v[2] - k[2] * v[1], k[2] * v[0] - k[0] * v[2], k[0] * v[1] - k[1] * v[0]];
        return [E[0] + v[0] * c + cr[0] * s2 + k[0] * d * (1 - c), E[1] + v[1] * c + cr[1] * s2 + k[1] * d * (1 - c), E[2] + v[2] * c + cr[2] * s2 + k[2] * d * (1 - c)]; }
      var ang = -(+pose.elbow) * PI / 180;
      for (var t = 0; t < n; t++) { if (aw[t] <= .2 || (P[3 * t] > 0) !== (sg > 0)) continue; var along = (P[3 * t] - E[0]) * ax[0] + (P[3 * t + 1] - E[1]) * ax[1] + (P[3 * t + 2] - E[2]) * ax[2]; if (along < -2) continue;
        var wgt = Math.min(1, (along + 2) / 4) * aw[t], r2 = rotP([P[3 * t], P[3 * t + 1], P[3 * t + 2]], ang * wgt); P[3 * t] = r2[0]; P[3 * t + 1] = r2[1]; P[3 * t + 2] = r2[2]; }
      var h2 = rotP(H, ang); J[sd + '-hand'] = h2;
    });
    if (+pose.legs) ['l', 'r'].forEach(function (sd) {
      var Hj = J[sd + '-upper-leg'], sg = sd === 'l' ? 1 : -1, da2 = (+pose.legs) * PI / 180 * sg;
      function rot2(p, w) { var c = Math.cos(da2 * w), s2 = Math.sin(da2 * w), dx = p[0] - Hj[0], dy = p[1] - Hj[1]; return [Hj[0] + dx * c + dy * s2, Hj[1] - dx * s2 + dy * c]; }
      for (var t = 0; t < n; t++) { if (lw[t] <= 0 || (P[3 * t] > 0) !== (sg > 0) || P[3 * t + 1] > Hj[1] + 4) continue; var w2 = lw[t] * Math.min(1, (Hj[1] + 4 - P[3 * t + 1]) / 10), r3 = rot2([P[3 * t], P[3 * t + 1]], w2); P[3 * t] = r3[0]; P[3 * t + 1] = r3[1]; }
      ['-knee', '-ankle'].forEach(function (jn) { var r4 = rot2(J[sd + jn], 1); J[sd + jn][0] = r4[0]; J[sd + jn][1] = r4[1]; });
    });
    // 2. girths: bust, waist and hip, scaling each torso level about its own centre (twice, to settle the blend)
    var zc = {}; function zCentre(y) { var k2 = Math.round(y); if (zc[k2] !== undefined) return zc[k2]; var lo = 1e9, hi = -1e9; for (var t = 0; t < n; t++) if (tw[t] > .8 && Math.abs(P[3 * t + 1] - y) < 1) { lo = Math.min(lo, P[3 * t + 2]); hi = Math.max(hi, P[3 * t + 2]); } return (zc[k2] = lo < hi ? (lo + hi) / 2 : 0); }
    for (var it = 0; it < 3; it++) {
      zc = {};
      var fb = m.bust / girth(Y.bust), fw = m.waist / girth(Y.waist), fh = m.hip / girth(Y.hip);
      var K = [[Y.crotch - 8, 1 + (fh - 1) * .6], [Y.crotch, 1 + (fh - 1) * .85], [Y.hip, fh], [Y.waist, fw], [Y.bust, fb], [Y.shoulder, 1 + (fb - 1) * .5], [Y.hps, 1]];
      var fAt = function (y) { if (y <= K[0][0]) return K[0][1]; for (var k2 = 1; k2 < K.length; k2++) if (y <= K[k2][0]) { var u = (y - K[k2 - 1][0]) / ((K[k2][0] - K[k2 - 1][0]) || 1), e = u * u * (3 - 2 * u); return K[k2 - 1][1] + (K[k2][1] - K[k2 - 1][1]) * e; } return 1; };
      var shW = (Math.abs(J['l-shoulder'][0]) + Math.abs(J['r-shoulder'][0])) / 2, dArm = (fAt(Y.shoulder - 6) - 1) * shW * .8;
      var knee = J['l-knee'][1];
      for (i = 0; i < n; i++) {
        var X = P[3 * i], yy = P[3 * i + 1], Z = P[3 * i + 2], f = fAt(yy), w = tw[i];
        if (w > 0) { var cz = zCentre(yy), s2 = 1 + (f - 1) * w; X *= s2; Z = cz + (Z - cz) * s2; }
        if (aw[i] > 0) X += (X > 0 ? 1 : -1) * dArm * aw[i];
        if (lw[i] > 0 && yy > knee) { var side = X > 0 ? 'l' : 'r', H = J[side + '-upper-leg'], Kn = J[side + '-knee'], u2 = Math.min(1, (yy - knee) / ((Y.crotch - knee) || 1)), lx = Kn[0] + (H[0] - Kn[0]) * u2, lz = Kn[2] + (H[2] - Kn[2]) * u2, sl = 1 + (K[1][1] - 1) * u2 * lw[i];
          X = lx + (X - lx) * sl; Z = lz + (Z - lz) * sl; }
        P[3 * i] = X; P[3 * i + 2] = Z;
      }
      ['l', 'r'].forEach(function (sd) { ['-shoulder', '-elbow', '-hand'].forEach(function (jn) { J[sd + jn][0] += (sd === 'l' ? 1 : -1) * dArm; }); });
    }
    var top = 0; for (i = 0; i < n; i++) top = Math.max(top, P[3 * i + 1]);
    // sleeves hang from the shoulder joint along the upper arm
    var joints = [['l', 1], ['r', -1]].map(function (sd) {
      var Sj = J[sd[0] + '-shoulder'], E = J[sd[0] + '-elbow'], d = [E[0] - Sj[0], E[1] - Sj[1], E[2] - Sj[2]], dl = Math.hypot(d[0], d[1], d[2]); d = [d[0] / dl, d[1] / dl, d[2] / dl];
      var up = sd[1] > 0 ? [-d[1], d[0], 0] : [d[1], -d[0], 0], ul = Math.hypot(up[0], up[1]); up = [up[0] / ul, up[1] / ul, 0];
      var rs = 0, rc = 0; for (var t = 0; t < n; t++) { if (aw[t] < .8 || (P[3 * t] > 0) !== (sd[1] > 0)) continue; var px = P[3 * t] - Sj[0], py = P[3 * t + 1] - Sj[1], pz = P[3 * t + 2] - Sj[2], a2 = px * d[0] + py * d[1] + pz * d[2]; if (a2 < 5 || a2 > 10) continue; rs += Math.hypot(px - d[0] * a2, py - d[1] * a2, pz - d[2] * a2); rc++; }
      return { s: sd[1], J: Sj, d: d, up: up, rb: rc ? rs / rc : 5 };
    });
    // where underwear may be drawn (not arms or head); the page draws pants and a bra from the landmarks, per pixel
    var mask = new Uint8Array(n), hipHalf = 0; for (i = 0; i < n; i++) { if (tw[i] > .6 && Math.abs(P[3 * i + 1] - Y.hip) < 1) hipHalf = Math.max(hipHalf, Math.abs(P[3 * i])); mask[i] = aw[i] < .5 && hw[i] < .5 ? 255 : 0; }
    var men = g === 'men' || g === 'unisex' || /boy/.test(g), under = { pantsTop: Y.hip + (Y.waist - Y.hip) * (men ? .55 : .4), legCut: Y.crotch - (kid ? 3 : men ? 7 : 2), legRise: men ? 0 : kid ? 2 : 7, hipHalf: hipHalf,
      braLo: men ? 0 : Y.bust - (kid ? 6 : 8.5), braHi: men ? 0 : Y.bust + (kid ? 6 : 6.5) };
    function maxA(ya, yb) { var r = 0; for (var t = 0; t < n; t++) { if (aw[t] > .3 || hw[t] > .5) continue; var y = P[3 * t + 1]; if (y < ya || y > yb) continue; r = Math.max(r, Math.hypot(P[3 * t], P[3 * t + 2])); } return r; }
    var neckTop = Y.hps + (top - Y.hps) * .35;
    var legs = [['l', 1], ['r', -1]].map(function (sd) { return { s: sd[1], H: J[sd[0] + '-upper-leg'], K: J[sd[0] + '-knee'], A: J[sd[0] + '-ankle'] }; });
    return { m: m, g: g, key: key, pos: P, tri: tri, mask: mask, under: under, joints: joints, legs: legs, J: J, maxA: maxA, girth: girth, height: top,
      head: { c: [0, (neckTop + top) / 2, 0], r: [9, (top - neckTop) / 2, 10] },
      y: { waist: Y.waist, hps: Y.hps, hip: Y.hip, crotch: Y.crotch, bust: Y.bust, arm: Y.shoulder - 6, shoulder: Y.shoulder, neckTop: neckTop } };
  }
  function hullLen(P) {
    P.sort(function (p, q) { return p[0] - q[0] || p[1] - q[1]; });
    function cr(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lo = [], up = []; P.forEach(function (p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
    for (var k = P.length - 1; k >= 0; k--) { var p = P[k]; while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    var H = lo.slice(0, -1).concat(up.slice(0, -1)), s = 0; for (var i = 0; i < H.length; i++) { var u = H[i], v = H[(i + 1) % H.length]; s += Math.hypot(u[0] - v[0], u[1] - v[1]); } return s;
  }
  // signed distance field on a 1 cm grid: exact distances in a band round the skin, sign from inside/outside along z
  function buildSDF(b) {
    var P = b.pos, T = b.tri, n = P.length / 3, cs = 1, band = 3, i;
    var mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    for (i = 0; i < n; i++) for (var k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], P[3 * i + k]); mx[k] = Math.max(mx[k], P[3 * i + k]); }
    var o = [mn[0] - 4, mn[1] - 4, mn[2] - 4], nx = Math.ceil((mx[0] - o[0] + 4) / cs) + 1, ny = Math.ceil((mx[1] - o[1] + 4) / cs) + 1, nz = Math.ceil((mx[2] - o[2] + 4) / cs) + 1;
    var G = new Float32Array(nx * ny * nz).fill(band), cols = new Array(nx * ny);
    var cp = [0, 0, 0];
    for (var t = 0; t < T.length; t += 3) {
      var a = 3 * T[t], bb = 3 * T[t + 1], c = 3 * T[t + 2];
      var x0 = Math.max(0, Math.floor((Math.min(P[a], P[bb], P[c]) - band - o[0]) / cs)), x1 = Math.min(nx - 1, Math.ceil((Math.max(P[a], P[bb], P[c]) + band - o[0]) / cs));
      var y0 = Math.max(0, Math.floor((Math.min(P[a + 1], P[bb + 1], P[c + 1]) - band - o[1]) / cs)), y1 = Math.min(ny - 1, Math.ceil((Math.max(P[a + 1], P[bb + 1], P[c + 1]) + band - o[1]) / cs));
      var z0 = Math.max(0, Math.floor((Math.min(P[a + 2], P[bb + 2], P[c + 2]) - band - o[2]) / cs)), z1 = Math.min(nz - 1, Math.ceil((Math.max(P[a + 2], P[bb + 2], P[c + 2]) + band - o[2]) / cs));
      for (var ix = x0; ix <= x1; ix++) for (var iy = y0; iy <= y1; iy++) for (var iz = z0; iz <= z1; iz++) {
        var id = (iz * ny + iy) * nx + ix, d = triDist(o[0] + ix * cs, o[1] + iy * cs, o[2] + iz * cs, P, a, bb, c, cp); if (d < G[id]) G[id] = d;
      }
      // inside/outside: where the triangle crosses each grid column (x, y), record the z of the crossing
      var ax = P[a], ay = P[a + 1], bx = P[bb], by = P[bb + 1], cx = P[c], cy = P[c + 1], den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
      if (Math.abs(den) < 1e-12) continue;
      var cx0 = Math.ceil((Math.min(ax, bx, cx) - o[0]) / cs), cx1 = Math.floor((Math.max(ax, bx, cx) - o[0]) / cs), cy0 = Math.ceil((Math.min(ay, by, cy) - o[1]) / cs), cy1 = Math.floor((Math.max(ay, by, cy) - o[1]) / cs);
      for (ix = cx0; ix <= cx1; ix++) for (iy = cy0; iy <= cy1; iy++) {
        var px = o[0] + ix * cs + 1e-4, py = o[1] + iy * cs + 1e-4, l1 = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / den, l2 = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / den, l3 = 1 - l1 - l2;
        if (l1 < 0 || l2 < 0 || l3 < 0) continue;
        var ci = iy * nx + ix; (cols[ci] || (cols[ci] = [])).push(l1 * P[a + 2] + l2 * P[bb + 2] + l3 * P[c + 2]);
      }
    }
    for (var ci2 = 0; ci2 < cols.length; ci2++) {
      var zs = cols[ci2]; if (!zs || zs.length < 2) continue; zs.sort(function (p, q) { return p - q; });
      if (zs.length % 2) continue; // an open spot in the skin (eyes, mouth): leave it
      var ix2 = ci2 % nx, iy2 = (ci2 / nx) | 0;
      for (var k2 = 0; k2 < zs.length; k2 += 2) { var za = Math.ceil((zs[k2] - o[2]) / cs), zb = Math.floor((zs[k2 + 1] - o[2]) / cs); for (var iz2 = Math.max(0, za); iz2 <= Math.min(nz - 1, zb); iz2++) { var id2 = (iz2 * ny + iy2) * nx + ix2; G[id2] = -Math.abs(G[id2]); } }
    }
    function sample(x, y, z, n3) { // trilinear distance and its gradient
      var fx = (x - o[0]) / cs, fy = (y - o[1]) / cs, fz = (z - o[2]) / cs;
      if (fx < 0 || fy < 0 || fz < 0 || fx >= nx - 1 || fy >= ny - 1 || fz >= nz - 1) return band;
      var ix = fx | 0, iy = fy | 0, iz = fz | 0, u = fx - ix, v = fy - iy, w = fz - iz, i0 = (iz * ny + iy) * nx + ix, sy = nx, sz = nx * ny;
      var c000 = G[i0], c100 = G[i0 + 1], c010 = G[i0 + sy], c110 = G[i0 + sy + 1], c001 = G[i0 + sz], c101 = G[i0 + sz + 1], c011 = G[i0 + sz + sy], c111 = G[i0 + sz + sy + 1];
      var c00 = c000 + (c100 - c000) * u, c10 = c010 + (c110 - c010) * u, c01 = c001 + (c101 - c001) * u, c11 = c011 + (c111 - c011) * u, c0 = c00 + (c10 - c00) * v, c1 = c01 + (c11 - c01) * v;
      if (n3) {
        var gx = ((c100 - c000) * (1 - v) + (c110 - c010) * v) * (1 - w) + ((c101 - c001) * (1 - v) + (c111 - c011) * v) * w;
        var gy = (c10 - c00) * (1 - w) + (c11 - c01) * w, gz = c1 - c0, gl = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1;
        n3[0] = gx / gl; n3[1] = gy / gl; n3[2] = gz / gl;
      }
      return c0 + (c1 - c0) * w;
    }
    b.dist = function (x, y, z, n3) { return sample(x, y, z, n3); };
    b.push = function (x, k, th, n3) {
      var d = sample(x[k], x[k + 1], x[k + 2], n3); if (d >= th) return 0;
      if (d <= -band + .01) { var r = Math.hypot(x[k], x[k + 2]) || 1; n3[0] = x[k] / r; n3[1] = 0; n3[2] = x[k + 2] / r; } // deep inside: out from the centre line
      x[k] += n3[0] * (th - d); x[k + 1] += n3[1] * (th - d); x[k + 2] += n3[2] * (th - d); return 1;
    };
  }
  function triDist(px, py, pz, P, a, b, c, out) { // distance from a point to a triangle (closest-point regions)
    var ax = P[a], ay = P[a + 1], az = P[a + 2], abx = P[b] - ax, aby = P[b + 1] - ay, abz = P[b + 2] - az, acx = P[c] - ax, acy = P[c + 1] - ay, acz = P[c + 2] - az;
    var apx = px - ax, apy = py - ay, apz = pz - az, d1 = abx * apx + aby * apy + abz * apz, d2 = acx * apx + acy * apy + acz * apz, qx, qy, qz;
    if (d1 <= 0 && d2 <= 0) { qx = ax; qy = ay; qz = az; }
    else {
      var bpx = px - P[b], bpy = py - P[b + 1], bpz = pz - P[b + 2], d3 = abx * bpx + aby * bpy + abz * bpz, d4 = acx * bpx + acy * bpy + acz * bpz;
      if (d3 >= 0 && d4 <= d3) { qx = P[b]; qy = P[b + 1]; qz = P[b + 2]; }
      else {
        var vc = d1 * d4 - d3 * d2;
        if (vc <= 0 && d1 >= 0 && d3 <= 0) { var v = d1 / (d1 - d3); qx = ax + abx * v; qy = ay + aby * v; qz = az + abz * v; }
        else {
          var cpx = px - P[c], cpy = py - P[c + 1], cpz = pz - P[c + 2], d5 = abx * cpx + aby * cpy + abz * cpz, d6 = acx * cpx + acy * cpy + acz * cpz;
          if (d6 >= 0 && d5 <= d6) { qx = P[c]; qy = P[c + 1]; qz = P[c + 2]; }
          else {
            var vb = d5 * d2 - d1 * d6;
            if (vb <= 0 && d2 >= 0 && d6 <= 0) { var w = d2 / (d2 - d6); qx = ax + acx * w; qy = ay + acy * w; qz = az + acz * w; }
            else {
              var va = d3 * d6 - d5 * d4;
              if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) { var w2 = (d4 - d3) / ((d4 - d3) + (d5 - d6)); qx = P[b] + (P[c] - P[b]) * w2; qy = P[b + 1] + (P[c + 1] - P[b + 1]) * w2; qz = P[b + 2] + (P[c + 2] - P[b + 2]) * w2; }
              else { var den = 1 / (va + vb + vc), v2 = vb * den, w3 = vc * den; qx = ax + abx * v2 + acx * w3; qy = ay + aby * v2 + acy * w3; qz = az + abz * v2 + acz * w3; }
            }
          }
        }
      }
    }
    return Math.sqrt((px - qx) * (px - qx) + (py - qy) * (py - qy) + (pz - qz) * (pz - qz));
  }

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
    pencil: { n: 'Straight skirt', gid: 'skirt', kind: 'skirt', fix: { skirt: 'straight' } },
    circle: { n: 'Circle skirt', gid: 'skirt', kind: 'circle', fix: { skirt: 'circle' } },
    gathered: { n: 'Gathered skirt', gid: 'skirt', kind: 'panels', fix: { skirt: 'gathered' } },
    kalis: { n: 'Panelled (kali) skirt', gid: 'skirt', kind: 'panels', fix: { skirt: 'panels' } },
    lehenga: { n: 'Lehenga', gid: 'lehenga', kind: 'panels' },
    trousers: { n: 'Trousers', gid: 'trousers', kind: 'pants' },
    jeans: { n: 'Jeans', gid: 'jeans', kind: 'pants' },
    churidar: { n: 'Churidar', gid: 'churidar', kind: 'pants' },
    gharara: { n: 'Gharara', gid: 'gharara', kind: 'pants' },
    salwar: { n: 'Salwar', gid: 'salwar', kind: 'salwar' },
    patiala: { n: 'Patiala salwar', gid: 'patiala', kind: 'salwar' },
    kurtaset: { n: 'Kurta with salwar', gid: 'kurta', kind: 'torso', with: 'salwar' },
    kurtachuri: { n: 'Kurta with churidar', gid: 'kurta', kind: 'torso', with: 'churidar' },
    shirt: { n: 'Shirt', gid: 'shirt', kind: 'torso', open: 1 },
    shirtdress: { n: 'Shirt dress', gid: 'shirtdress', kind: 'torso', open: 1, fix: { pockets: 0 } },
    blouse: { n: 'Button-front blouse', gid: 'blouse', kind: 'torso', open: 1, fix: { opening: 1 } },
    polo: { n: 'Polo shirt', gid: 'polo', kind: 'torso' },
    jacket: { n: 'Nehru jacket / waistcoat', gid: 'jacket', kind: 'torso', open: 1, fix: { pockets: 0 } },
    bandhgala: { n: 'Bandhgala', gid: 'bandhgala', kind: 'torso', open: 1, fix: { pockets: 0 } },
    sherwani: { n: 'Sherwani', gid: 'sherwani', kind: 'torso', open: 1 },
    blazer: { n: 'Blazer', gid: 'blazer', kind: 'torso', open: 1, fix: { pockets: 0 } },
    coat: { n: 'Overcoat', gid: 'coat', kind: 'torso', open: 1, fix: { pockets: 0 } },
    bomber: { n: 'Bomber jacket', gid: 'bomber', kind: 'torso', open: 1, zip: 1 },
    bodice: { n: 'Fitted bodice (darts)', gid: 'bodice', kind: 'torso' },
    peplum: { n: 'Peplum top', gid: 'top', kind: 'torso', fix: { peplum: 1 } },
    hoodie: { n: 'Hoodie', gid: 'hoodie', kind: 'torso', fix: { hood: 1, pockets: 1 } },
    frock: { n: 'Frock (bodice + gathered skirt)', gid: 'dress', kind: 'torso', fix: { dress: 'frock' }, def: { sleeve: 'puff' } },
    anarkali: { n: 'Anarkali', gid: 'anarkali', kind: 'torso' },
    jumpsuit: { n: 'Jumpsuit', gid: 'jumpsuit', kind: 'torso' }
  };
  /* bottoms: trousers and Indian pants wrap from the hips down each leg; skirts are panels round the body */
  function loopPts(segs) { var a = []; segs.forEach(function (s, i) { s.pts.forEach(function (q, j) { if (i && !j) return; a.push(q); }); }); return a; }
  function rangeAt(poly) { // [min u, max u] across the piece at depth v, read from its steep (side) edges only
    var st = [], v0 = 1e9, v1 = -1e9, i;
    for (i = 0; i < poly.length; i++) { var a = poly[i], b = poly[(i + 1) % poly.length]; if (Math.abs(b[1] - a[1]) > .3 * Math.abs(b[0] - a[0]) && a[1] !== b[1]) { st.push([a, b]); v0 = Math.min(v0, a[1], b[1]); v1 = Math.max(v1, a[1], b[1]); } }
    var all = [1e9, -1e9]; poly.forEach(function (q) { all[0] = Math.min(all[0], q[0]); all[1] = Math.max(all[1], q[0]); });
    return function (v) {
      if (!st.length) return all;
      v = Math.max(v0 + 1e-3, Math.min(v1 - 1e-3, v));
      var lo = 1e9, hi = -1e9; for (var k = 0; k < st.length; k++) { var a = st[k][0], b = st[k][1]; if ((a[1] - v) * (b[1] - v) <= 0) { var x = a[0] + (b[0] - a[0]) * (v - a[1]) / (b[1] - a[1]); lo = Math.min(lo, x); hi = Math.max(hi, x); } }
      return lo < hi ? [lo, hi] : all;
    };
  }
  function edgesOf(pc, mir) {
    var segs = pc.edges.map(function (e, i) { return { key: 'e' + i, pts: e.p.map(function (q) { return [mir ? -q[0] : q[0], q[1]]; }) }; });
    if (mir) { segs.reverse(); segs.forEach(function (s) { s.pts.reverse(); }); }
    return segs;
  }
  function smooth(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  function bottoms(kind, r, o, m, body, panels, seams, rings, mods) {
    var by = body.y, top = by.waist + 1.5, id = {}, list = r.pieces || r; list.forEach(function (p) { (id[p.id] = id[p.id] || p); });
    var rTop = body.maxA(by.crotch - 4, by.waist + 2) + 3 + (kind === 'salwar' ? 1 : 0), rise = by.waist - by.crotch, nrm = [0, 0, 0], RB = {};
    function rb(y, phi) { // distance from the centre line to the skin, at height y in direction phi (0 = front)
      var k = Math.round(y * 2) + '|' + Math.round(phi * 20); if (RB[k] !== undefined) return RB[k];
      var sx = Math.sin(phi), cz = Math.cos(phi), r = 0; while (r < 45 && body.dist(sx * r, y, cz * r, nrm) < 0) r += .4;
      return (RB[k] = r);
    }
    function girthAt(y) { var c = 0, p0 = null; for (var i = 0; i <= 48; i++) { var ph = i / 48 * TAU, r = rb(y, ph), p = [r * Math.sin(ph), r * Math.cos(ph)]; if (p0) c += Math.hypot(p[0] - p0[0], p[1] - p0[1]); p0 = p; } return c; }
    var OL = {};
    function outline(y) { // the body's cross-section at height y as a closed curve, measured round its own centre
      y = Math.max(y, by.crotch + 2); var k = Math.round(y * 2); if (OL[k]) return OL[k];
      var cz = (rb(y, 0) - rb(y, PI)) / 2, pts = [], cum = [0], n = 96, i;
      for (i = 0; i < n; i++) { var ph = i / n * TAU, sx = Math.sin(ph), czz = Math.cos(ph), r = 0; while (r < 45 && body.dist(sx * r, y, cz + czz * r, nrm) < 0) r += .3; pts.push([sx * r, cz + czz * r]); }
      for (i = 1; i <= n; i++) cum.push(cum[i - 1] + Math.hypot(pts[i % n][0] - pts[i - 1][0], pts[i % n][1] - pts[i - 1][1]));
      return (OL[k] = { cz: cz, pts: pts, cum: cum, len: cum[n] });
    }
    // a point on the fabric laid round the body: F = fraction of the way round (0 front centre, .25 the +x side), L = fabric length round
    function ringPoint(y, F, L, gap, folds) {
      var o = outline(y), n = o.pts.length, sc = Math.max(1, Math.min(1.7, L / o.len)), want = ((F % 1) + 1) % 1 * o.len, i = 1;
      while (i < n && o.cum[i] < want) i++;
      var a = o.pts[i - 1], b = o.pts[i % n], t = (want - o.cum[i - 1]) / ((o.cum[i] - o.cum[i - 1]) || 1), px = a[0] + (b[0] - a[0]) * t, pz = a[1] + (b[1] - a[1]) * t;
      var dx = px, dz = pz - o.cz, dl = Math.hypot(dx, dz) || 1, C0 = o.len * sc, extra = 0;
      if (L > C0 * 1.02 && folds) { var A = Math.min(dl * sc * .35, C0 / (TAU * folds) * Math.sqrt((L / C0) * (L / C0) - 1)); extra = A * (1 + Math.sin(F * TAU * folds)); } // too much cloth to go round: start it folded, so the hands stay clear
      return [dx * sc + dx / dl * ((gap || 1) + extra), y, o.cz + dz * sc + dz / dl * ((gap || 1) + extra)];
    }
    function onBody(y, phi, fabricLen, gap) { var C = girthAt(y); return rb(y, phi) * Math.max(1, fabricLen / Math.max(C, 1)) + (gap || 1); } // fabric laid round the body at its own length
    function legAt(s, y) {
      var L = body.legs.filter(function (q) { return q.s === s; })[0], H = L.H, K = L.K, A = L.A, rH = m.thigh / TAU, rK = m.knee / TAU, rA = m.ankle / TAU;
      if (y >= H[1]) return { x: H[0], z: H[2], r: rH };
      if (y >= K[1]) { var t = (H[1] - y) / (H[1] - K[1]); return { x: H[0] + (K[0] - H[0]) * t, z: H[2] + (K[2] - H[2]) * t, r: rH + (rK - rH) * t }; }
      var t2 = Math.min(1, (K[1] - y) / (K[1] - A[1])); return { x: K[0] + (A[0] - K[0]) * t2, z: K[2] + (A[2] - K[2]) * t2, r: rK + ((m.calf || m.knee) / TAU - rK) * Math.sin(t2 * PI) * .8 + (rA - rK) * t2 };
    }
    // a leg piece: the outer edge stays on the outside of the leg, the inner edge goes to the crotch and inside leg
    function legPanel(name, segs, s, front, mir, topY, full, widthK, gather) {
      var lp = loopPts(segs), ur = rangeAt(lp), vmax = Math.max.apply(null, lp.map(function (q) { return q[1]; })), kv = vmax > topY - 2 ? (topY - 2) / vmax : 1; // longer than the leg (churidar): start it bunched up above the floor
      function frame(v) { var y = topY - v * kv, t = full ? 1 : smooth((v - rise * .35) / (rise * .75)), L = legAt(s, y); return { y: y, t: t, cx: L.x * t, cz: L.z * t, L: L }; }
      panels.push({ name: name, segs: segs, axis: function (p) { var f = frame((topY - p[1]) / kv); return [f.cx, p[1], f.cz]; }, place: function (u, v) {
        var rr = ur(v), w = Math.max(rr[1] - rr[0], .01), f = frame(v), frac = mir ? (rr[1] - u) / w : (u - rr[0]) / w;
        var span = PI / 2 + (PI * .92 - PI / 2) * f.t, phi = front ? s * (PI / 2 - frac * span) : s * (PI / 2 + frac * span);
        var r0 = f.t < 1 ? onBody(f.y, phi, w * 4, 1.2) : 0, rad = r0 * (1 - f.t) + Math.max(f.L.r + 2.6, w * (widthK || 2.1) / TAU * 1.1) * f.t;
        if (gather) { // start already gathered: a cone that opens downwards, folded like an accordion where it is too narrow
          rad = f.L.r + 3.5 + v * .3; var need = w / span, nf = 14, A = need > rad ? Math.min(rad - f.L.r - 1, Math.sqrt(2 * (need * need - rad * rad)) / nf) : 0; rad += A * Math.sin(frac * span * nf);
        }
        return [f.cx + rad * Math.sin(phi), f.y, f.cz + rad * Math.cos(phi)];
      } });
      return panels.length - 1;
    }
    function waistRing(len) { var ring = []; panels.forEach(function (P, pi) { if (P.bottom) P.segs.forEach(function (sg) { if (/^w/.test(sg.key)) ring.push([pi, sg.key]); }); }); rings.push(len ? { keys: ring, len: len } : ring); }
    function withDarts(pc, mir) { // waist edge e0 with its darts cut out and sewn
      var segs = edgesOf(pc, mir), w = segs.filter(function (q) { return q.key === 'e0'; })[0], k = segs.indexOf(w);
      var marks = (pc.marks || []).map(function (mk) { return mk.t === 'dart' && mk.p ? { t: 'dart', p: mk.p.map(function (q) { return [mir ? -q[0] : q[0], q[1]]; }) } : mk; });
      var parts = mods.cutDarts(w.pts, marks, 'w');
      segs.splice.apply(segs, [k, 1].concat(parts.map(function (q) { return { key: q.key, pts: q.pts }; })));
      return segs;
    }
    function dartSeams(pi) { panels[pi].segs.forEach(function (sg) { var mt = /^dA(\d+)$/.exec(sg.key); if (mt) seams.push([[pi, sg.key], [pi, 'dB' + mt[1]], 'auto']); }); }
    if (kind === 'pants') {
      var tf = id['tr-front'], tb = id['tr-back'], legP = {};
      [1, -1].forEach(function (s) {
        var mir = s < 0, F = legPanel('F' + (mir ? 'L' : 'R'), withDarts(tf, mir), s, true, mir, top, false), Bk = legPanel('B' + (mir ? 'L' : 'R'), withDarts(tb, mir), s, false, mir, top, false);
        panels[F].bottom = panels[Bk].bottom = 1; dartSeams(F); dartSeams(Bk); legP[s] = [F, Bk];
        seams.push([[F, 'e4'], [Bk, 'e4'], 'auto'], [[F, 'e2'], [Bk, 'e2'], 'auto']);
      });
      seams.push([[legP[1][0], 'e1'], [legP[-1][0], 'e1'], 'auto'], [[legP[1][1], 'e1'], [legP[-1][1], 'e1'], 'auto']);
      waistRing(m.waist + 3);
      if (r.label && /churidar/i.test(r.label)) [1, -1].forEach(function (s) { rings.push({ keys: [[legP[s][0], 'e3'], [legP[s][1], 'e3']], len: m.ankle + 6 }); });
      var fl = id.flare; // gharara: a gathered flare below the knee
      if (fl) {
        var kneeLen = tf.edges[3].p[0][1], fTop = top - kneeLen;
        [1, -1].forEach(function (s) {
          var mir = s < 0, FF = legPanel('GF' + (mir ? 'L' : 'R'), edgesOf(fl, mir), s, true, mir, fTop, true, 1.2, true), FB = legPanel('GB' + (mir ? 'L' : 'R'), edgesOf(fl, mir), s, false, mir, fTop, true, 1.2, true);
          seams.push([[legP[s][0], 'e3'], [FF, 'e1'], 'auto'], [[legP[s][1], 'e3'], [FB, 'e1'], 'auto'], [[FF, 'e0'], [FB, 'e0'], 'auto'], [[FF, 'e2'], [FB, 'e2'], 'auto']);
        });
      }
    } else if (kind === 'salwar') {
      var lg = id['salwar-leg'], kl = id.kali, Lk = kl.edges[1].p[kl.edges[1].p.length - 1][1], halfL = {};
      [1, -1].forEach(function (s) {
        var segs = mods.half(lg, ['w', 'ins', 'hem']), out = [];
        segs.forEach(function (sg) { // split the inside-leg seam where the kali ends
          if (!/^ins/.test(sg.key)) { out.push(sg); return; }
          var sp = splitAtY(sg.pts, Lk); if (!sp) { out.push(sg); return; }
          var down = sg.key === 'ins.R'; out.push({ key: (down ? 'insU' : 'insD') + sg.key.slice(3), pts: sp[0] }, { key: (down ? 'insD' : 'insU') + sg.key.slice(3), pts: sp[1] });
        });
        var ur = rangeAt(loopPts(out));
        panels.push({ name: s > 0 ? 'SWR' : 'SWL', segs: out, bottom: 1, axis: function (p) { var t = smooth((top - p[1] - rise * .35) / (rise * .75)), L = legAt(s, p[1]); return [L.x * t, p[1], L.z * t]; }, place: function (u, v) {
          var rr = ur(v), hw = Math.max(Math.abs(rr[0]), Math.abs(rr[1]), .01), y = top - v, t = smooth((v - rise * .35) / (rise * .75)), L = legAt(s, y);
          var span = PI * .5 + PI * .42 * t, phi = s * (PI / 2 - (u / hw) * span), rad = (t < 1 ? onBody(y, phi, hw * 4.4, 1.5) : 0) * (1 - t) + Math.max(L.r + 3, hw * 2 / TAU * 1.1) * t;
          return [L.x * t + rad * Math.sin(phi), y, L.z * t + rad * Math.cos(phi)];
        } });
        var pi = panels.length - 1; halfL[s] = pi;
        seams.push([[pi, 'insD.R'], [pi, 'insD.L'], 'auto']);
      });
      [1, -1].forEach(function (fs) { // kalis: one in front, one at the back, between the legs
        var kw = kl.edges[0].p[kl.edges[0].p.length - 1][0];
        panels.push({ name: fs > 0 ? 'KF' : 'KB', segs: edgesOf(kl, false), bottom: 1, axis: function (p) { return [0, p[1], 0]; }, place: function (u, v) { var q = Math.min(1, v / Lk); return [(u - kw / 2) * (1 - .5 * q), top - v * .75, fs * ((rTop + 1.5) * (1 - q) + 4 * q)]; } });
        var ki = panels.length - 1, side = fs > 0 ? '.R' : '.L';
        panels[ki].segs.forEach(function (sg) { if (sg.key === 'e0') sg.key = 'wk'; });
        seams.push([[ki, 'e1'], [halfL[1], 'insU' + side], 'auto'], [[ki, 'e2'], [halfL[-1], 'insU' + side], 'auto']);
      });
      waistRing(m.waist + .5); // drawstring
      if (id.cuff) [1, -1].forEach(function (s) { // patiala band at the ankle
        var c = id.cuff, W = c.edges[1].p[1][0], Hh = c.edges[0].p[0][1] / 2, segs = [{ key: 't1', pts: [[0, 0], [W / 2, 0]] }, { key: 't2', pts: [[W / 2, 0], [W, 0]] }, { key: 'r', pts: [[W, 0], [W, Hh]] }, { key: 'b', pts: [[W, Hh], [0, Hh]] }, { key: 'l', pts: [[0, Hh], [0, 0]] }];
        var hemY = top - lg.edges[0].p[0][1];
        panels.push({ name: 'CF' + s, segs: segs, axis: function (p) { var L = legAt(s, p[1]); return [L.x, p[1], L.z]; }, place: function (u, v) { var L = legAt(s, hemY - v), rad = Math.max(L.r + 2.5, W / TAU * 1.15), phi = s * (PI / 2 - u / W * TAU * .92); return [L.x + rad * Math.sin(phi), hemY - v - 1, L.z + rad * Math.cos(phi)]; } });
        var ci = panels.length - 1; seams.push([[ci, 't1'], [halfL[s], 'hem.R'], 'auto'], [[ci, 't2'], [halfL[s], 'hem.L'], 'auto'], [[ci, 'r'], [ci, 'l'], 'auto']);
      });
    } else if (kind === 'panels') { // N straight or flared panels round the body (kali skirt, lehenga, gathered skirt)
      var pc0 = id['sk-panel'], topMost = 0; pc0.edges.forEach(function (e, i) { var my = e.p.reduce(function (a, q) { return a + q[1]; }, 0) / e.p.length, mb = pc0.edges[topMost].p.reduce(function (a, q) { return a + q[1]; }, 0) / pc0.edges[topMost].p.length; if (my < mb) topMost = i; });
      var pc = pc0, N = Math.max(2, parseInt((/Cut (\d+)/.exec(pc.cut) || [0, 2])[1], 10)), ur2 = rangeAt(loopPts(edgesOf(pc, false))), wb = id.waistband;
      var R0 = body.maxA(by.crotch - 6, by.waist + 2) + 3, top2 = by.waist + 1.5;
      for (var k = 0; k < N; k++) (function (k) {
        var segs = edgesOf(pc, false), topEdge = topMost; // the waist is the edge that sits highest
        segs.forEach(function (sg, i) { sg.key = i === topEdge ? 'w0' : 'e' + i; });
        panels.push({ name: 'P' + k, segs: segs, bottom: 1, axis: function (p) { return [0, p[1], outline(p[1]).cz]; }, place: function (u, v) {
          var rr = ur2(v), w = Math.max(rr[1] - rr[0], .01), frac = (u - rr[0]) / w, p = ringPoint(top2 - v, (k + frac - .5) / N, N * w * (wb ? .9 : 1), 1 + v * .08, N * 3);
          return p;
        } });
      })(k);
      var first = panels.length - N, ne = pc.edges.length, sides = ['e' + (topMost + 1) % ne, 'e' + (topMost + ne - 1) % ne];
      for (k = 0; k < N; k++) seams.push([[first + k, sides[0]], [first + (k + 1) % N, sides[1]], 'auto']);
      waistRing(Math.min(wb ? wb.edges[1].p[1][0] : 1e9, m.waist + 1.5));
    } else if (kind === 'circle') { // quarter, half or full circle pieces round the waist, laid out as a cone
      var cp = id['sk-panel'], K = Math.max(1, parseInt((/Cut (\d+)/.exec(cp.cut) || [0, 1])[1], 10)), rW = cp.edges[1].p[0][0];
      for (var q = 0; q < K; q++) (function (q) {
        var segs = edgesOf(cp, false); segs[1].key = 'w0';
        panels.push({ name: 'C' + q, segs: segs, bottom: 1, axis: function (p) { return [0, p[1], outline(p[1]).cz]; }, place: function (u, v) {
          var rho = Math.hypot(u, v), al = Math.atan2(v, u), d = Math.max(0, rho - rW), w0 = ringPoint(top, (q + al / (PI / 2)) / K + .5, rW * PI / 2 * K, 1), o = outline(top);
          var dx = w0[0], dz = w0[2] - o.cz, dl = Math.hypot(dx, dz) || 1; // straight out and down from the waist: a steep cone, folded round
          return [w0[0] + dx / dl * d * .6, top - d * .8, w0[2] + dz / dl * d * .6];
        } });
      })(q);
      var c0 = panels.length - K;
      for (q = 0; q < K; q++) seams.push([[c0 + q, 'e2'], [c0 + (q + 1) % K, 'e0'], 'auto']);
      waistRing(m.waist + 1.5); rings[rings.length - 1].tilt = true;
    }
  }
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
    function mergeYoke(bk, yk) { // a shirt back and its yoke as one piece (the box pleat stays as a small step at the armhole)
      var e = bk.edges, ye = yk.edges, top = ye[0].p[ye[0].p.length - 1];
      return { id: 'back', edges: [{ t: 'fold', p: [top].concat(e[0].p) }, e[1], e[2], { t: 'seam', p: e[3].p.concat(ye[3].p.slice().reverse()) }, { t: 'seam', p: ye[2].p.slice().reverse() }, { t: 'seam', p: ye[1].p.slice().reverse() }], marks: bk.marks };
    }
    function splitLen0(pts, L) { var c = 0; for (var i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (c + d >= L) { var t = (L - c) / (d || 1), q = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]; return [pts.slice(0, i).concat([q]), [q].concat(pts.slice(i))]; } c += d; } return [pts, [pts[pts.length - 1], pts[pts.length - 1]]]; }
    function maxU(segs) { var u = 0; segs.forEach(function (s) { s.pts.forEach(function (q) { u = Math.max(u, Math.abs(q[0])); }); }); return u; }
    var mods = { cutDarts: cutDarts, half: half, maxU: maxU };
    if (ST.kind === 'pants' || ST.kind === 'salwar' || ST.kind === 'circle' || ST.kind === 'panels') { bottoms(ST.kind, r, o, m, body, panels, seams, rings, mods); }
    else if (ST.kind === 'skirt') {
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
      if (ST.with) { var rb = PM.build(ST.with, gender, m, Object.assign({}, PM.GARMENTS[ST.with].d, ST.with === 'churidar' ? {} : { fullness: 'regular' })); bottoms(ST.with === 'churidar' ? 'pants' : 'salwar', rb, PM.GARMENTS[ST.with].d, m, body, panels, seams, rings, mods); }
      var P0 = panels.length, lay = ST.with ? 2.6 : 0;
      var f = byId.front, b = byId.back, sl = byId.sleeve;
      if (f && b && byId.yoke && b.edges.length === 5) b = mergeYoke(b, byId.yoke);
      var open = !!(f && f.edges[0].t !== 'fold');
      if (!f || !b || b.edges[0].t !== 'fold' || (!open && f.edges[0].t !== 'fold') || f.edges.length !== 6) throw new Error('This style is not available in 3D yet.');
      var roles = ['hem', 'side', 'arm', 'sh', 'neck'];
      var slit = +o.slit || 0, Lh = f.edges[1].p[0][1];
      function rightSegs(pc, withCF) { // one side of a piece; waist darts on the hem and a bust dart on the side seam are cut out to be sewn
        var marks = pc.marks || [], out = [];
        pc.edges.forEach(function (e, i) {
          if (i === 0 && !withCF) return; var role = i ? roles[i - 1] : 'cf', pts = e.p.map(function (q) { return q.slice(); });
          if (role === 'hem') { var parts = cutDarts(pts, marks, 'hem'); if (parts.ndarts) { parts.forEach(function (q) { out.push({ key: q.key + '.R', pts: q.pts }); }); return; } }
          out.push({ key: role + '.R', pts: pts });
        });
        var si = -1; out.forEach(function (q, i) { if (q.key === 'side.R') si = i; });
        if (si >= 0) (marks || []).forEach(function (k) {
          if (k.t !== 'dart' || !k.p || k.p.length !== 3 || out[si].key !== 'side.R') return; var sp = out[si].pts;
          function near(q) { var bi = -1, bd = 1.6; for (var i = 0; i < sp.length; i++) { var d = Math.hypot(sp[i][0] - q[0], sp[i][1] - q[1]); if (d < bd) { bd = d; bi = i; } } if (bi < 0) { for (i = 1; i < sp.length; i++) { var dd = segDist(q[0], q[1], sp[i - 1], sp[i]); if (dd < 1.2) return i - .5; } } return bi; }
          var i1 = near(k.p[0]), i2 = near(k.p[2]); if (i1 < 0 || i2 < 0 || i1 === i2) return;
          var l1 = k.p[0], l2 = k.p[2]; if (i1 > i2) { var t = i1; i1 = i2; i2 = t; t = l1; l1 = l2; l2 = t; }
          var lower = sp.slice(0, Math.ceil(i1)).concat([l1]), upper = [l2].concat(sp.slice(Math.floor(i2) + 1));
          if (lower.length < 2 || upper.length < 2) return;
          out.splice(si, 1, { key: 'side.R', pts: lower }, { key: 'sdA.R', pts: [l1, k.p[1]] }, { key: 'sdB.R', pts: [k.p[1], l2] }, { key: 'sideU.R', pts: upper });
        });
        return out;
      }
      function leftOf(segs) { return segs.slice().reverse().map(function (sg) { return { key: sg.key.replace('.R', '.L'), pts: mirror(sg.pts) }; }); }
      var bR = rightSegs(b, false), segB = bR.concat(leftOf(bR)), fronts, fR = rightSegs(f, open);
      fronts = open ? [fR, leftOf(fR)] : [fR.concat(leftOf(fR))];
      var fSide = fR.filter(function (q) { return q.key === 'side.R'; })[0];
      if (fR.some(function (q) { return q.key === 'sideU.R'; })) [segB].forEach(function (segs) { // back side seam split where the front bust dart sits
        ['R', 'L'].forEach(function (sd) { for (var i = 0; i < segs.length; i++) { if (segs[i].key !== 'side.' + sd) continue; var pts = sd === 'R' ? segs[i].pts : segs[i].pts.slice().reverse(), cut = splitLen0(pts, plen(fSide.pts));
          var lo = { key: 'side.' + sd, pts: sd === 'R' ? cut[0] : cut[0].slice().reverse() }, up = { key: 'sideU.' + sd, pts: sd === 'R' ? cut[1] : cut[1].slice().reverse() };
          segs.splice(i, 1, sd === 'R' ? lo : up, sd === 'R' ? up : lo); break; } });
      });
      fronts.concat([segB]).forEach(function (segs) { // open the side seams below the slit
        if (!(slit > 0 && slit < Lh * .6)) return;
        for (var i = 0; i < segs.length; i++) {
          var s = segs[i]; if (s.key !== 'side.R' && s.key !== 'side.L') continue;
          var right = s.key === 'side.R', pts = right ? s.pts : s.pts.slice().reverse(), sp = splitAtY(pts, Lh - slit);
          if (!sp) continue;
          var lower = { key: 'slit.' + (right ? 'R' : 'L'), pts: right ? sp[0] : sp[0].slice().reverse() }, upper = { key: s.key, pts: right ? sp[1] : sp[1].slice().reverse() };
          segs.splice(i, 1, right ? lower : upper, right ? upper : lower); i++;
        }
      });
      var mu = maxU(segB); fronts.forEach(function (sg) { mu = Math.max(mu, maxU(sg)); });
      var len = Lh, R2 = Math.max(body.maxA(Math.max(0, by.hps - len - 4), by.hps) + 3.2 + lay, mu / 1.42), top2 = by.hps + 1.5;
      var iFR, iFL, iB, overR = gender !== 'women'; // men, kids and unisex lap left over right; women right over left
      if (open) {
        iFR = panels.length; panels.push({ name: 'FR', segs: fronts[0], axis: yAxis, place: function (u, v) { var r0 = R2 + (overR ? .9 : 0), th = u / R2; return [r0 * Math.sin(th), top2 - v, r0 * Math.cos(th) + .5]; } });
        iFL = panels.length; panels.push({ name: 'FL', segs: fronts[1], axis: yAxis, place: function (u, v) { var r0 = R2 + (overR ? 0 : .9), th = u / R2; return [r0 * Math.sin(th), top2 - v, r0 * Math.cos(th) + .5]; } });
      } else { iFR = iFL = panels.length; panels.push({ name: 'F', segs: fronts[0], axis: yAxis, place: function (u, v) { var th = u / R2; return [R2 * Math.sin(th), top2 - v, R2 * Math.cos(th) + .5]; } }); }
      iB = panels.length; panels.push({ name: 'B', segs: segB, axis: yAxis, place: function (u, v) { var th = u / R2; return [R2 * Math.sin(th), top2 - v, -R2 * Math.cos(th) - .5]; } });
      seams.push([[iFR, 'side.R'], [iB, 'side.R']], [[iFL, 'side.L'], [iB, 'side.L']], [[iFR, 'sh.R'], [iB, 'sh.R']], [[iFL, 'sh.L'], [iB, 'sh.L']]);
      if (fSide && fR.some(function (q) { return q.key === 'sideU.R'; })) seams.push([[iFR, 'sideU.R'], [iB, 'sideU.R']], [[iFL, 'sideU.L'], [iB, 'sideU.L']]);
      [iFR, iFL, iB].filter(function (v, i, a) { return a.indexOf(v) === i; }).forEach(function (pi) { panels[pi].segs.forEach(function (sg) { var mt = /^(s?)dA(\d*)\.(R|L)$/.exec(sg.key); if (mt) seams.push([[pi, sg.key], [pi, mt[1] + 'dB' + mt[2] + '.' + mt[3]], 'auto']); }); });
      function hemKeys(pi, sd) { return panels[pi].segs.filter(function (q) { return new RegExp('^hem\\d*\\.' + sd + '$').test(q.key); }).map(function (q) { return [pi, q.key]; }); }
      var allHem = hemKeys(iFR, 'R').concat(hemKeys(iFL, 'L'), hemKeys(iB, 'R'), hemKeys(iB, 'L'));
      var tacks = [], buttons = [], zip = null, closed = o.fasten !== 'open';
      if (open) {
        var iO = overR ? iFR : iFL, iU = overR ? iFL : iFR;
        if (ST.zip) { zip = { p: iFR, key: 'cf.R', q: iFL, qkey: 'cf.L', closed: closed }; if (closed) seams.push([[iFR, 'cf.R'], [iFL, 'cf.L'], 'auto']); }
        (f.marks || []).forEach(function (k) { if (k.t !== 'button') return; buttons.push({ over: iO, under: iU, c: [0, k.c[1]], closed: closed }); if (closed) tacks.push([[iO, [0, k.c[1]]], [iU, [0, k.c[1]]]]); });
      } else if (byId.placket) { var nd0 = f.edges[5].p[f.edges[5].p.length - 1][1]; [3, 9].forEach(function (dy) { buttons.push({ over: iFR, under: iFR, c: [0, nd0 + dy], closed: true, small: 1 }); }); }
      var tops = []; // topstitching: front edges and hems
      if (open && !ST.zip) tops.push([iFR, 'cf.R'], [iFL, 'cf.L']);
      var joins = [], lowerJoined = false;
      [].push.apply(tops, allHem);
      // collars and bands, laid along the real 3D neckline and sewn to it
      function edgeOf(pi, key) { var sg = panels[pi].segs.filter(function (q) { return q.key === key; })[0]; return sg ? sg.pts : null; }
      function path3(parts) { // [[panel, pts]] in pattern units, joined into one 3D polyline from centre back outwards on the +x side
        var P3 = [], cum = [0];
        parts.forEach(function (pp) { pp[1].forEach(function (q, k) { if (P3.length && k === 0) return; var x3 = panels[pp[0]].place(q[0], q[1]); if (P3.length) cum.push(cum[cum.length - 1] + Math.hypot(x3[0] - P3[P3.length - 1][0], x3[1] - P3[P3.length - 1][1], x3[2] - P3[P3.length - 1][2])); P3.push(x3); }); });
        var L = cum[cum.length - 1] || 1;
        return { L: L, at: function (s) { s = Math.max(0, Math.min(L, s)); var j = 1; while (j < cum.length - 1 && cum[j] < s) j++; var t = (s - cum[j - 1]) / ((cum[j] - cum[j - 1]) || 1), A = P3[j - 1], B2 = P3[j]; return [A[0] + (B2[0] - A[0]) * t, A[1] + (B2[1] - A[1]) * t, A[2] + (B2[2] - A[2]) * t]; } };
      }
      function rev(p) { return p.slice().reverse(); }
      var nB = edgeOf(iB, 'neck.R'), nF = edgeOf(iFR, 'neck.R');
      function ringPath(halfLen, yAt, clear) { // half a ring round the body from centre back (theta 0) to centre front (pi), kept just off the skin
        var rn = halfLen / PI, nP = 48, P3 = [], cum = [0], g3 = [0, 0, 0];
        for (var k = 0; k <= nP; k++) { var th = PI * k / nP, q = [rn * Math.sin(th), yAt(th), -rn * Math.cos(th) * 1.08];
          for (var it = 0; it < 12 && body.dist(q[0], q[1], q[2], g3) < clear; it++) { var dd = body.dist(q[0], q[1], q[2], g3); q[0] += g3[0] * (clear - dd + .05); q[2] += g3[2] * (clear - dd + .05); }
          if (k) cum.push(cum[k - 1] + Math.hypot(q[0] - P3[k - 1][0], q[1] - P3[k - 1][1], q[2] - P3[k - 1][2])); P3.push(q); }
        var L = cum[nP];
        return { L: L, at: function (s) { s = Math.max(0, Math.min(L, s)); var j = 1; while (j < nP && cum[j] < s) j++; var t = (s - cum[j - 1]) / ((cum[j] - cum[j - 1]) || 1), A = P3[j - 1], B2 = P3[j]; return [A[0] + (B2[0] - A[0]) * t, A[1] + (B2[1] - A[1]) * t, A[2] + (B2[2] - A[2]) * t]; } };
      }
      var bdep = Math.min(nB[0][1], nB[nB.length - 1][1]) === 0 ? Math.max(nB[0][1], nB[nB.length - 1][1]) : 2, fdep = Math.max(nF[0][1], nF[nF.length - 1][1]);
      var neckPath = ringPath(plen(nB) + plen(nF), function (th) { var u = (1 - Math.cos(th)) / 2; return top2 - .8 - (bdep + (fdep - bdep) * Math.pow(u, fdep > 12 ? 1.6 : 1)); }, .9);
      var backFrac = plen(nB) / (plen(nB) + plen(nF));
      function outDir(q) { var l = Math.hypot(q[0], q[2]) || 1; return [q[0] / l, 0, q[2] / l]; }
      function attach(path, pathLen, bottomLen, sgnOf, sOf, shape) { // a collar point (u, v): along the path by arc length, then up and over by shape(v)
        return function (u, v) { var sg = sgnOf(u), sP = Math.min(pathLen, sOf(u) * pathLen / bottomLen), q = path.at(sP), od = outDir(q), d = shape(v); return [sg * (q[0] + od[0] * d[0]), q[1] + d[1], q[2] + od[2] * d[0]]; };
      }
      function attachFall(path, bottomLen, sgnOf, sOf, standAt, out0) { // stand up to standAt(f), then fall away from the neckline (down at the back, sideways along a V front)
        return function (u, v) {
          var sg = sgnOf(u), sP = Math.min(path.L, sOf(u) * path.L / bottomLen), f = sP / path.L, q = path.at(sP), a = path.at(Math.max(0, sP - .6)), b2 = path.at(Math.min(path.L, sP + .6));
          var t = [b2[0] - a[0], b2[1] - a[1], b2[2] - a[2]], tl = Math.hypot(t[0], t[1], t[2]) || 1; t = [t[0] / tl, t[1] / tl, t[2] / tl];
          var n = outDir(q), l = [-(t[1] * n[2] - t[2] * n[1]), -(t[2] * n[0] - t[0] * n[2]), -(t[0] * n[1] - t[1] * n[0])], ll = Math.hypot(l[0], l[1], l[2]) || 1; l = [l[0] / ll, l[1] / ll, l[2] / ll];
          var st = standAt(f), r, y, x0, z0;
          if (v <= st) { r = out0; x0 = q[0] + n[0] * r; z0 = q[2] + n[2] * r; y = q[1] + v; }
          else { var w = v - st; r = out0 + .5 + w * .12; x0 = q[0] + n[0] * r + l[0] * w; z0 = q[2] + n[2] * r + l[2] * w; y = q[1] + st + l[1] * w; }
          return [sg * x0, y, z0];
        };
      }
      function splitLen(pts, L) { var c = 0; for (var i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (c + d >= L) { var t = (L - c) / (d || 1), q = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]; return [pts.slice(0, i).concat([q]), [q].concat(pts.slice(i))]; } c += d; } return [pts, [pts[pts.length - 1]]]; }
      function halfCollar(pc, ib, roles2, frac) { // a piece cut on the centre-back fold; its edge ib sews to the neckline (split into back and front parts)
        var right = [];
        for (var i = 1; i < pc.edges.length; i++) {
          var pts = pc.edges[i].p.map(function (q) { return q.slice(); });
          if (i !== ib) { right.push({ key: roles2[i - 1] + '.R', pts: pts }); continue; }
          var fromCB = Math.abs(pts[0][0]) < Math.abs(pts[pts.length - 1][0]), pp = fromCB ? pts : rev(pts), cut = splitLen(pp, plen(pp) * frac);
          if (fromCB) right.push({ key: 'nb.R', pts: cut[0] }, { key: 'nf.R', pts: cut[1] }); else right.push({ key: 'nf.R', pts: rev(cut[1]) }, { key: 'nb.R', pts: rev(cut[0]) });
        }
        var left = right.slice().reverse().map(function (sg) { return { key: sg.key.replace('.R', '.L'), pts: mirror(sg.pts) }; });
        return right.concat(left);
      }
      function rectCollar(Lr, H, frac) { // a full-length strip: bottom edge runs from the left front round the back to the right front
        var h2 = Lr / 2, a1 = h2 * (1 - frac);
        return [{ key: 'endL', pts: [[0, H], [0, 0]] }, { key: 'nf.L', pts: [[0, 0], [a1, 0]] }, { key: 'nb.L', pts: [[a1, 0], [h2, 0]] }, { key: 'nb.R', pts: [[h2, 0], [Lr - a1, 0]] }, { key: 'nf.R', pts: [[Lr - a1, 0], [Lr, 0]] }, { key: 'endR', pts: [[Lr, 0], [Lr, H]] }, { key: 'top', pts: [[Lr, H], [0, H]] }];
      }
      function sewNeck(pi) { seams.push([[pi, 'nb.R'], [iB, 'neck.R'], 'auto'], [[pi, 'nb.L'], [iB, 'neck.L'], 'auto'], [[pi, 'nf.R'], [iFR, 'neck.R'], 'auto'], [[pi, 'nf.L'], [iFL, 'neck.L'], 'auto']); }
      function bottomLen(segs) { var Lb = 0; segs.forEach(function (sg) { if (/^n[bf]\.R$/.test(sg.key)) Lb += plen(sg.pts); }); return Lb || 1; }
      var halfSgn = function (u) { return u < 0 ? -1 : 1; }, halfS = function (u) { return Math.abs(u); };
      var stand = function (h0) { return function (v) { return [.45, Math.max(0, v) + h0]; }; };
      var fall = function (st, out0) { return function (v) { return v <= st ? [out0 + .2 * v / st, v] : [out0 + .25 + (v - st) * .32, st - (v - st) * .92]; }; };
      var band = byId.band, col = byId.collar, bandTop = null;
      if (band) {
        var bs = halfCollar(band, 3, ['top', 'end'], backFrac), bi = panels.length, bL = bottomLen(bs);
        panels.push({ name: 'BAND', segs: bs, axis: yAxis, place: attach(neckPath, neckPath.L, bL, halfSgn, halfS, stand(0)) }); sewNeck(bi);
        var bH = plen(band.edges[0].p); bandTop = { pi: bi, h: bH, bL: bL }; tops.push([bi, 'top.R'], [bi, 'top.L']);
      }
      if (col && col.edges.length === 4) {
        if (bandTop) { // shirt collar on its band: bottom edge sews to the band's top edge
          var cs = halfCollar(col, 1, ['bot', 'end', 'out'], 1).map(function (sg) { return { key: sg.key.replace('nb.', 'bot.'), pts: sg.pts }; }).filter(function (sg) { return !/^nf\./.test(sg.key) || plen(sg.pts) > .01; });
          var ci = panels.length, cL = 0; cs.forEach(function (sg) { if (sg.key === 'bot.R') cL = plen(sg.pts); });
          var bT = bandTop.h, bandPath = { L: neckPath.L, at: function (sP) { var q = neckPath.at(sP); return [q[0], q[1] + bT, q[2]]; } };
          panels.push({ name: 'COL', segs: cs, axis: yAxis, crease: 1.4, place: attachFall(bandPath, cL, halfSgn, halfS, function () { return 1.4; }, .7) });
          seams.push([[ci, 'bot.R'], [bandTop.pi, 'top.R'], 'auto'], [[ci, 'bot.L'], [bandTop.pi, 'top.L'], 'auto']); tops.push([ci, 'out.R'], [ci, 'out.L']);
        } else { // tailored collar sewn straight to the neckline (blazer, coat)
          var ts = halfCollar(col, 1, ['bot', 'end', 'out'], backFrac), ti = panels.length, tL = bottomLen(ts);
          var bfr = backFrac; panels.push({ name: 'COL', segs: ts, axis: yAxis, crease: 2.6, place: attachFall(neckPath, tL, halfSgn, halfS, function (f) { var k = Math.max(0, Math.min(1, (f - bfr) / .3)); return 2.6 - 2.2 * k * k * (3 - 2 * k); }, .5) }); sewNeck(ti); tops.push([ti, 'out.R'], [ti, 'out.L']);
        }
      }
      var kc = byId.knitcollar || byId.collarrib;
      if (kc) { // polo knit collar (stands then falls) or bomber rib collar (folded double, so half its cut depth)
        var kx = 0, ky = 0; kc.edges.forEach(function (e) { e.p.forEach(function (q) { kx = Math.max(kx, q[0]); ky = Math.max(ky, q[1]); }); });
        var rib = !!byId.collarrib, kH = rib ? ky / 2 : ky, ks = rectCollar(kx, kH, backFrac), ki = panels.length;
        panels.push({ name: 'KC', segs: ks, axis: yAxis, crease: rib ? null : 2.8, place: attach(neckPath, neckPath.L, kx / 2, function (u) { return u < kx / 2 ? -1 : 1; }, function (u) { return Math.abs(u - kx / 2); }, rib ? stand(0) : fall(2.8, .5)) }); sewNeck(ki);
      }
      if (byId.hemband) { // rib hem band, folded double
        var hb = byId.hemband, hx = 0, hy = 0; hb.edges.forEach(function (e) { e.p.forEach(function (q) { hx = Math.max(hx, q[0]); hy = Math.max(hy, q[1]); }); });
        var hFr = edgeOf(iFR, 'hem.R'), hBk = edgeOf(iB, 'hem.R');
        var hemPath = ringPath(plen(hBk) + plen(hFr), function () { return top2 - Lh + .5; }, 1.2);
        var hFrac = plen(hBk) / (plen(hBk) + plen(hFr)), hs = rectCollar(hx, hy / 2, hFrac).map(function (sg) { return { key: sg.key.replace(/^n([bf])/, 'h$1'), pts: sg.pts.map(function (q) { return [q[0], -q[1]]; }) }; }), hi = panels.length;
        panels.push({ name: 'HB', segs: hs, axis: yAxis, place: attach(hemPath, hemPath.L, hx / 2, function (u) { return u < hx / 2 ? -1 : 1; }, function (u) { return Math.abs(u - hx / 2); }, function (v) { return [.3, v]; }) });
        seams.push([[hi, 'hb.R'], [iB, 'hem.R'], 'auto'], [[hi, 'hb.L'], [iB, 'hem.L'], 'auto'], [[hi, 'hf.R'], [iFR, 'hem.R'], 'auto'], [[hi, 'hf.L'], [iFL, 'hem.L'], 'auto']);
        rings.push({ keys: [[hi, 'top']], len: hx });
        tops = tops.filter(function (t) { return !/^hem/.test(t[1]); });
      }
      // skirt, kalis, peplum or trousers joined to the bodice at the waist (gathered where the lower part is fuller)
      var hemTot = 0; allHem.forEach(function (k) { hemTot += plen(edgeOf(k[0], k[1])); });
      function joinLower(kind, pcs) {
        var r0 = rings.length; bottoms(kind, { pieces: pcs, label: r.label }, o, m, body, panels, seams, rings, mods);
        var rg = rings[rings.length - 1]; if (rings.length === r0) return; var keys = Array.isArray(rg) ? rg : rg.keys;
        rings[rings.length - 1] = { keys: keys, len: hemTot * 1.02, tilt: !Array.isArray(rg) && rg.tilt };
        joins.push({ a: allHem, b: keys }); lowerJoined = true; tops = tops.filter(function (t) { return !/^hem/.test(t[1]); });
      }
      if (byId['sk-panel'] && gid === 'anarkali') joinLower('panels', [byId['sk-panel']]);
      if (byId.skirt && o.dress === 'frock') { var sk = byId.skirt; joinLower('panels', [{ id: 'sk-panel', cut: 'Cut 2', edges: sk.edges, marks: [] }]); }
      if (byId.peplum) { var pe = byId.peplum, pIn = plen(pe.edges[1].p) * 2, pOut = plen(pe.edges[3].p) * 2, pd = 18, tw = pIn / 4, bw = pOut / 4;
        joinLower('panels', [{ id: 'sk-panel', cut: 'Cut 4', edges: [{ t: 'seam', p: [[-tw / 2, 0], [tw / 2, 0]] }, { t: 'seam', p: [[tw / 2, 0], [bw / 2, pd]] }, { t: 'hem', p: [[bw / 2, pd], [-bw / 2, pd]] }, { t: 'seam', p: [[-bw / 2, pd], [-tw / 2, 0]] }], marks: [] }]); }
      if (byId['leg-tr-front'] && byId['leg-tr-back']) joinLower('pants', [Object.assign({}, byId['leg-tr-front'], { id: 'tr-front' }), Object.assign({}, byId['leg-tr-back'], { id: 'tr-back' })]);
      // pockets: placed on the front and tacked along their sewn edges
      function pocketOn(pc, fi, du, dv, mirrorIt) {
        var segs = pc.edges[0].t === 'fold' ? (function () { var rr = pc.edges.slice(1).map(function (e, i) { return { key: 'p' + i + '.R', pts: e.p.map(function (q) { return q.slice(); }), hem: e.t === 'hem' }; }); return rr.concat(rr.slice().reverse().map(function (q) { return { key: q.key.replace('.R', '.L'), pts: mirror(q.pts), hem: q.hem }; })); })()
          : pc.edges.map(function (e, i) { return { key: 'p' + i, pts: e.p.map(function (q) { return mirrorIt ? [-q[0], q[1]] : q.slice(); }), hem: e.t === 'hem' }; });
        if (mirrorIt) segs = segs.reverse().map(function (q) { return { key: q.key, pts: q.pts.slice().reverse(), hem: q.hem }; });
        var pi = panels.length, Fp = panels[fi];
        panels.push({ name: 'PK', segs: segs.map(function (q) { return { key: q.key, pts: q.pts }; }), axis: yAxis, place: function (u, v) { var a = Fp.place(u + du, v + dv), l = Math.hypot(a[0], a[2] - (a[2] > 0 ? .5 : -.5)) || 1; return [a[0] * (l + .7) / l, a[1], a[2] + (a[2] - .5) / l * .7]; } });
        segs.forEach(function (q) { if (q.hem) return; var L = plen(q.pts), n = Math.max(2, Math.round(L / 2)); for (var k = 0; k <= n; k++) { var t = k / n, pt = resample(q.pts, n)[k]; tacks.push([[pi, pt], [fi, [pt[0] + du, pt[1] + dv]]]); } });
      }
      if (byId.pocket && +o.pockets && /kangaroo|pouch/i.test(byId.pocket.comp || '') || (byId.pocket && gid === 'hoodie')) { var kp = byId.pocket, kh = 0; kp.edges.forEach(function (e) { e.p.forEach(function (q) { kh = Math.max(kh, q[1]); }); }); pocketOn(kp, iFR, 0, Lh - kh - (byId.hemband ? 0 : 3)); }
      else if (byId.pocket && +o.pockets && open && (gid === 'shirt' || gid === 'shirtdress')) { var sp0 = byId.pocket, sw = 0; sp0.edges.forEach(function (e) { e.p.forEach(function (q) { sw = Math.max(sw, q[0]); }); }); var pf = gender === 'women' ? iFL : iFR, mir = pf === iFL; pocketOn(sp0, pf, mir ? -sw - 5 : 5, 21, false); }
      // hood: two halves sewn up the centre back and to the neckline, lying down the back
      if (byId.hood && o.hood !== 0 && +o.hood !== 0) {
        var hd = byId.hood, hw = 0, hh = 0; hd.edges.forEach(function (e) { e.p.forEach(function (q) { hw = Math.max(hw, q[0]); hh = Math.max(hh, q[1]); }); });
        var hNeck = plen(hd.edges[0].p);
        [1, -1].forEach(function (sg) {
          var hnF = plen(nF) / (plen(nB) + plen(nF)), segs = [];
          hd.edges.forEach(function (e, i) { var pts = e.p.map(function (q) { return sg > 0 ? q.slice() : [-q[0], q[1]]; }), sd = sg > 0 ? '.R' : '.L';
            if (i === 0) { var cut = splitLen0(pts, plen(pts) * hnF); segs.push({ key: 'hnf' + sd, pts: cut[0] }, { key: 'hnb' + sd, pts: cut[1] }); }
            else segs.push({ key: ['hn', 'hb', 'ht', 'hf'][i] + sd, pts: pts }); });
          if (sg < 0) segs = segs.reverse().map(function (q) { return { key: q.key, pts: q.pts.slice().reverse() }; });
          panels.push({ name: sg > 0 ? 'HR' : 'HL', segs: segs, axis: yAxis, place: function (u, v) {
            var fu = Math.abs(u) / hw, sP = (1 - fu) * neckPath.L, q = neckPath.at(sP), up = hh - v, side = sg * Math.max(1.5, Math.abs(q[0]));
            return [side * (1 - up / hh * .3), q[1] + 1.5 - up * .5, Math.min(q[2], -3) - 2 - up * .55];
          } });
        });
        var hR = panels.length - 2, hL = panels.length - 1;
        seams.push([[hR, 'hb.R'], [hL, 'hb.L'], 'auto'], [[hR, 'ht.R'], [hL, 'ht.L'], 'auto']);
        seams.push([[hR, 'hnb.R'], [iB, 'neck.R'], 'auto'], [[hL, 'hnb.L'], [iB, 'neck.L'], 'auto'], [[hR, 'hnf.R'], [iFR, 'neck.R'], 'auto'], [[hL, 'hnf.L'], [iFL, 'neck.L'], 'auto']);
        void hNeck;
      }
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
          if (byId.cuff) { var cx = 0, cy = 0; byId.cuff.edges.forEach(function (e) { e.p.forEach(function (q) { cx = Math.max(cx, q[0]); cy = Math.max(cy, q[1]); }); }); rings.push({ keys: [[pi, 'hem']], len: Math.max(cx, cy) * (byId.cuff.edges.length && /rib/.test(byId.cuff.cut || '') ? 1 : .92), tilt: true }); }
          if (J.s > 0) seams.push([[iFR, 'arm.R'], [pi, 'capF', 1]], [[iB, 'arm.R'], [pi, 'capB']], [[pi, 'uF'], [pi, 'uB', 1]]);
          else seams.push([[iFL, 'arm.L'], [pi, 'capF']], [[iB, 'arm.L'], [pi, 'capB', 1]], [[pi, 'uF'], [pi, 'uB', 1]]);
        });
      }
      var extra = { tacks: tacks, buttons: buttons, zip: zip, tops: tops, joins: joins };
    }
    if (typeof extra === 'undefined') var extra = {};
    return { panels: panels, seams: seams, rings: rings, info: r.info, label: r.label, opts: o, tacks: extra.tacks || [], buttons: extra.buttons || [], zip: extra.zip || null, tops: extra.tops || [], joins: extra.joins || [] };
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
      var quad = G.meshType === 'quad', pts = B.slice(), dy = quad ? h : h * .866, row = 0;
      for (var y = miny + dy * .5; y < maxy; y += dy, row++) for (var x = minx + (!quad && row % 2 ? h * .5 : quad ? h * .5 : 0); x < maxx; x += h) {
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
      if (sm[2] === 'auto') { // pick the direction that joins the nearer ends, from where the pieces were placed
        var dd = function (i, j) { return Math.hypot(X[3 * i] - X[3 * j], X[3 * i + 1] - X[3 * j + 1], X[3 * i + 2] - X[3 * j + 2]); };
        if (dd(a[0], b[0]) + dd(a[a.length - 1], b[b.length - 1]) > dd(a[0], b[b.length - 1]) + dd(a[a.length - 1], b[0])) b.reverse();
      }
      for (var i = 0; i < a.length; i++) seamPairs.push(a[i], b[i]);
    });
    // joins: a waist seam between pieces with different edge counts (bodice to skirt, kalis or trousers); each point goes to the nearest one round the body, so a fuller side gathers
    (G.joins || []).forEach(function (J) {
      function ids(list) { var o = []; list.forEach(function (k) { (segIdx[keyOf(k[0], k[1])] || []).forEach(function (i) { if (o.indexOf(i) < 0) o.push(i); }); }); return o; }
      var A = ids(J.a), B = ids(J.b), ang = function (i) { return Math.atan2(X[3 * i], X[3 * i + 2]); };
      function near(i, L) { var a = ang(i), bi = -1, bd = 1e9; L.forEach(function (j) { var d = Math.abs(Math.atan2(Math.sin(ang(j) - a), Math.cos(ang(j) - a))); if (d < bd) { bd = d; bi = j; } }); return bi; }
      var small = (A.length <= B.length ? A : B).slice(), big = (small.length === A.length && A.length <= B.length ? B : A).slice(), byA = function (p, q) { return ang(p) - ang(q); };
      small.sort(byA); big.sort(byA); if (!small.length || !big.length) return;
      var j0 = big.indexOf(near(small[0], big)), r = big.length / small.length; // in order round the body, spread evenly
      small.forEach(function (i, k) { seamPairs.push(i, big[(j0 + Math.round(k * r)) % big.length]); });
    });
    // tacks: single points held together (buttons through their buttonholes)
    var tackOut = [];
    (G.tacks || []).forEach(function (tk) {
      var ids = tk.map(function (e) { var P = polys[e[0]], bi = -1, bd = 1e9; for (var i = 0; i < P.n; i++) { var k = P.base + i, d = Math.hypot(UV[2 * k] - e[1][0], UV[2 * k + 1] - e[1][1]); if (d < bd) { bd = d; bi = k; } } return bi; });
      if (ids[0] >= 0 && ids[1] >= 0) { seamPairs.push(ids[0], ids[1]); tackOut.push(ids[0], ids[1]); }
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
    var ringsOut = (G.rings || []).map(function (rg0) { var rg = Array.isArray(rg0) ? rg0 : rg0.keys, ids = [], L = 0; rg.forEach(function (k) { var a = segIdx[keyOf(k[0], k[1])]; for (var i = 0; i < a.length; i++) { if (ids.indexOf(a[i]) < 0) ids.push(a[i]); if (i) L += Math.hypot(UV[2 * a[i]] - UV[2 * a[i - 1]], UV[2 * a[i] + 1] - UV[2 * a[i - 1] + 1]); } }); return { ids: ids, len: rg0.len || L, tilt: !!rg0.tilt }; });
    return { rings: ringsOut, x: new Float32Array(X), uv: new Float32Array(UV), tri: new Uint32Array(T), panel: new Uint8Array(panelOf), seams: new Uint32Array(seamPairs), segIdx: segIdx, teth: new Float32Array(teth), polys: polys, tacks: tackOut, crease: G.panels.map(function (P) { return P.crease == null ? null : P.crease; }) };
  };

  /* ---------------- fabrics ---------------- */
  /* Fabric library. Every fabric is described the way a fabric spec sheet does:
     gsm weight; sw / sl = stretch across (weft) and along (warp, the grain) in %; sb = extra give on the bias in %;
     stiff = bending stiffness 0 (limp) to 100 (board-like); fric = friction on the body; thick = mm;
     rough / sheen / op = how it looks (surface roughness, sheen 0..1, opacity); tex = the surface texture. */
  function F(g, n, gsm, sw, sl, sb, stiff, fric, thick, rough, sheen, tex, note, op) { return { g: g, n: n, gsm: gsm, sw: sw, sl: sl, sb: sb, stiff: stiff, fric: fric, thick: thick, rough: rough, sheen: sheen, tex: tex, note: note, op: op || 1 }; }
  D.FABRICS = {
    poplin: F('Cotton and linen', 'Cotton poplin', 115, 0, 0, 1.5, 60, .45, .22, .78, 0, 'poplin', 'Crisp woven, holds its shape'),
    jersey: F('Knits', 'Cotton jersey', 170, 40, 25, 0, 39, .5, .55, .86, 0, 'knit', 'Soft knit with some stretch'),
    linen: F('Cotton and linen', 'Linen', 160, 0, 0, 3, 71, .5, .35, .9, 0, 'linen', 'Firm woven, stands away from the body'),
    rayon: F('Silk and fluid', 'Rayon challis', 125, 0, 0, 4, 29, .35, .25, .7, .1, 'plain', 'Fluid woven, drapes close'),
    crepe: F('Silk and fluid', 'Silk crepe', 95, 0, 0, 4, 22, .3, .2, .55, .25, 'crepe', 'Light and fluid'),
    georgette: F('Silk and fluid', 'Georgette / chiffon', 70, 0, 0, 5, 10, .3, .15, .6, .15, 'chiffon', 'Very light, soft folds', .82),
    denim: F('Denim and heavy', 'Light denim (8 oz)', 270, 0, 0, 1.5, 85, .55, .5, .92, 0, 'denim', 'Heavy, stiff woven'),
    fleece: F('Knits', 'Fleece-back knit', 300, 60, 30, 0, 63, .6, 2.5, .95, 0, 'fleece', 'Thick knit, rounded folds'),
    voile: F('Cotton and linen', 'Cotton voile / mulmul', 65, 0, 0, 4, 30, .4, .15, .8, 0, 'plain', 'Sheer and airy, soft gathers', .86),
    cambric: F('Cotton and linen', 'Cotton cambric', 100, 0, 0, 2, 52, .45, .2, .8, 0, 'poplin', 'Smooth, light shirting'),
    oxford: F('Cotton and linen', 'Oxford shirting', 140, 0, 0, 2, 62, .5, .3, .85, 0, 'oxford', 'Basket weave shirting, soft body'),
    chambray: F('Cotton and linen', 'Chambray', 125, 0, 0, 2, 56, .48, .25, .84, 0, 'chambray', 'Light denim-look plain weave'),
    flannel: F('Cotton and linen', 'Cotton flannel', 170, 0, 0, 3, 50, .6, .6, .96, 0, 'brushed', 'Brushed, soft and warm'),
    khadi: F('Cotton and linen', 'Khadi', 140, 0, 0, 3, 58, .55, .35, .92, 0, 'slub', 'Handspun, uneven slub texture'),
    twill: F('Denim and heavy', 'Cotton twill / chino', 230, 0, 0, 1.5, 78, .5, .45, .88, 0, 'twill', 'Firm diagonal weave for trousers'),
    canvas: F('Denim and heavy', 'Canvas / duck', 340, 0, 0, 1, 92, .55, .6, .93, 0, 'canvas', 'Very stiff, holds its shape'),
    denim12: F('Denim and heavy', 'Denim (12 oz)', 400, 0, 0, 1, 90, .55, .7, .93, 0, 'denim', 'Classic jeans weight'),
    sdenim: F('Denim and heavy', 'Stretch denim', 330, 22, 0, 1, 80, .55, .6, .92, 0, 'denim', 'Denim with elastane across the width'),
    cord: F('Denim and heavy', 'Corduroy', 280, 0, 0, 2, 74, .6, 1.2, .9, .2, 'cord', 'Raised wales, warm and soft'),
    satin: F('Silk and fluid', 'Satin / charmeuse', 90, 0, 0, 5, 20, .25, .2, .3, .6, 'satin', 'Smooth, high sheen, liquid drape'),
    organza: F('Silk and fluid', 'Organza', 45, 0, 0, 1.5, 62, .3, .1, .45, .3, 'plain', 'Sheer and crisp, stands out', .62),
    taffeta: F('Silk and fluid', 'Taffeta', 90, 0, 0, 1.5, 70, .3, .2, .4, .45, 'satin', 'Crisp, rustling, holds volume'),
    vcrepe: F('Silk and fluid', 'Viscose crepe', 140, 0, 0, 4, 30, .35, .3, .7, .1, 'crepe', 'Weighty and fluid'),
    pcrepe: F('Silk and fluid', 'Polyester crepe', 120, 0, 0, 3, 34, .32, .25, .65, .15, 'crepe', 'Easy-care crepe, smooth drape'),
    suiting: F('Wool', 'Wool suiting', 260, 0, 0, 2, 72, .5, .45, .85, .05, 'twill', 'Tailoring weight, clean lines'),
    wflannel: F('Wool', 'Wool flannel', 300, 0, 0, 2, 68, .6, .8, .97, 0, 'brushed', 'Soft brushed wool'),
    melton: F('Wool', 'Melton / coating', 520, 0, 0, 1, 90, .6, 2, .97, 0, 'brushed', 'Dense coat cloth'),
    tweed: F('Wool', 'Tweed', 420, 0, 0, 1.5, 84, .65, 1.6, .97, 0, 'tweed', 'Flecked, textured wool'),
    rib: F('Knits', 'Rib knit', 220, 80, 30, 0, 32, .55, .9, .88, 0, 'rib', 'Very stretchy across, hugs the body'),
    interlock: F('Knits', 'Interlock', 220, 45, 25, 0, 45, .5, .8, .85, 0, 'knit', 'Smooth both sides, firmer than jersey'),
    terry: F('Knits', 'French terry', 280, 45, 25, 0, 55, .6, 1.6, .92, 0, 'knit', 'Looped back, sweatshirt weight'),
    ponte: F('Knits', 'Ponte', 300, 35, 20, 0, 60, .5, 1.2, .8, .05, 'knit', 'Stable double knit, smooth face'),
    scuba: F('Knits', 'Scuba / neoprene', 330, 30, 25, 0, 82, .5, 2, .6, .1, 'smooth', 'Spongy and sculptural'),
    brocade: F('Indian and occasion', 'Brocade / Banarasi', 200, 0, 0, 1.5, 78, .4, .45, .45, .5, 'brocade', 'Woven motifs with zari, stiff'),
    chanderi: F('Indian and occasion', 'Chanderi', 70, 0, 0, 2, 45, .35, .15, .5, .35, 'plain', 'Sheer with a soft sheen', .8),
    velvet: F('Indian and occasion', 'Velvet', 300, 0, 0, 3, 48, .7, 1.5, .95, .9, 'velvet', 'Rich pile, deep colour'),
    net: F('Indian and occasion', 'Net / tulle', 40, 10, 10, 6, 40, .3, .1, .7, 0, 'net', 'Open mesh for layers and dupattas', .5),
    leather: F('Indian and occasion', 'Faux leather', 450, 3, 3, 1, 94, .6, 1, .55, .2, 'leather', 'Very stiff, smooth grain')
  };
  /* turn a fabric description into solver settings */
  D.phys = function (f) {
    f = f || D.FABRICS.poplin;
    var bend = f.bend != null ? f.bend : Math.pow(10, -2.6 - Math.max(0, Math.min(100, +f.stiff || 0)) / 100 * 2.7);
    return { gsm: Math.max(20, +f.gsm || 120), sw: Math.max(0, +f.sw || 0), sl: Math.max(0, +f.sl || 0), sb: Math.max(0, +f.sb || 0), bend: bend, fric: Math.max(0, Math.min(1, f.fric == null ? .45 : +f.fric)), thick: Math.max(.05, Math.min(6, +f.thick || .3)) };
  };

  /* ---------------- solver ---------------- */
  function Sim(M, body, fab, h) {
    var n = this.n = M.x.length / 3; this.M = M; this.body = body; fab = this.fab = D.phys(fab);
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
    var CR = M.crease || []; for (var k in edges) { var e = edges[k]; E.push(e[0], e[1], rest(e[0], e[1])); if (e[3] < 0) continue; var cr = CR[M.panel[e[2]]]; if (cr != null && (uv[2 * e[2] + 1] - cr) * (uv[2 * e[3] + 1] - cr) < 0) continue; /* a fold line (collar roll) bends freely */ Bn.push(e[2], e[3], rest(e[2], e[3])); }
    for (i = 0; i < n; i++) this.w[i] = mass[i] > 0 ? 1 / mass[i] : 0;
    // stretch compliance per edge from its direction on the pattern: the grain runs down the piece (pattern y)
    var EA = new Float32Array(E.length / 3);
    for (i = 0; i < EA.length; i++) { var ea = E[3 * i], eb = E[3 * i + 1], du = uv[2 * eb] - uv[2 * ea], dv = uv[2 * eb + 1] - uv[2 * ea + 1], LL = du * du + dv * dv || 1, cw = du * du / LL, cl = dv * dv / LL;
      EA[i] = (fab.sw * cw + fab.sl * cl + fab.sb * .4 * 4 * cw * cl) * 1e-7; }
    this.EA = EA;
    this.E = new Float32Array(E); this.E0 = new Float32Array(E); this.B = new Float32Array(Bn); this.BA = new Float64Array(Bn.length / 3).fill(fab.bend); this.userT = 0; this.S = M.seams; this.Tt = M.teth ? M.teth.slice() : new Float32Array(0);
    for (i = 0; i < this.Tt.length; i += 3) { var ta0 = 3 * this.Tt[i], tb0 = 3 * this.Tt[i + 1]; this.Tt[i + 2] = Math.max(this.Tt[i + 2], Math.hypot(M.x[ta0] - M.x[tb0], M.x[ta0 + 1] - M.x[tb0 + 1], M.x[ta0 + 2] - M.x[tb0 + 2])); } /* never pull tighter than where the piece starts */ this.rings = M.rings || [];
    var SO = (M.sim || {}); this.t = 0; this.sub = Math.max(4, Math.min(40, +SO.sub || 14)); this.th = SO.th > 0 ? SO.th : Math.min(.6, .27 + fab.thick * .03); this.selfOn = SO.self !== false; this.grav = SO.grav > 0 ? SO.grav : 981; this.airK = SO.air >= 0 && SO.air !== undefined ? SO.air : 1; this.settled = false; this.calm = 0; this.tWake = 0; this.grip = new Uint8Array(n); (M.rings || []).forEach(function (rg) { rg.ids.forEach(function (k) { this.grip[k] = 1; }, this); }, this);
    // self-collision: points sewn together (same group) or close on the same flat piece never push each other apart
    var grp = new Int32Array(n); for (i = 0; i < n; i++) grp[i] = i;
    function root(a) { while (grp[a] !== a) { grp[a] = grp[grp[a]]; a = grp[a]; } return a; }
    for (i = 0; i < M.seams.length; i += 2) { var ra = root(M.seams[i]), rb2 = root(M.seams[i + 1]); if (ra !== rb2) grp[ra] = rb2; }
    for (i = 0; i < n; i++) grp[i] = root(i);
    var onSeam = new Uint8Array(n); for (i = 0; i < M.seams.length; i++) onSeam[M.seams[i]] = 1;
    this.onSeam = onSeam; this.grp = grp; this.panel = M.panel; this.selfR = Math.min(1.1, .7 + fab.thick * .08); this.HS = 1 << 14; this.head = new Int32Array(this.HS); this.next = new Int32Array(n);
    this.nrm = new Float32Array(n * 3); this.grab = null; this.pinned = null; this.free = new Uint8Array(n);
    // per-vertex gap to the body, for the fit map
    this.gap = new Float32Array(n); this.strain = new Float32Array(n);
  }
  Sim.prototype.step = function (frameDt) {
    var n = this.n, x = this.x, p = this.p, v = this.v, w = this.w, sub = this.sub, dt = Math.min(frameDt, 1 / 30) / sub, fab = this.fab;
    var E = this.E, Bn = this.B, S = this.S, body = this.body, th = this.th, nrm = [0, 0, 0], nrm2 = [0, 0, 0];
    var EA = this.EA, idt2 = 1 / (dt * dt), aB = fab.bend * idt2, mu = fab.fric, i, j;
    this.normals();
    var nr = this.nrm, air = Math.exp(-260 * this.airK / fab.gsm * dt), G = this.grab;
    for (var s = 0; s < sub; s++) {
      var tt = this.t, gScale = tt < .7 ? 0 : Math.min(1, (tt - .7) / .5), g = -this.grav * gScale * dt, rest = Math.max(0, Math.min(1, (tt - this.tWake - (this.tWake ? 1.5 : 2.5)) / 3)), damp = tt < .7 ? .985 : this.grab || this.pinned ? .997 : .9985 - .0075 * rest; // settle: more damping as the drape comes to rest
      var sewMax = tt < .7 ? .25 : 1.5;
      for (i = 0; i < n; i++) { var i3 = 3 * i; p[i3] = x[i3]; p[i3 + 1] = x[i3 + 1]; p[i3 + 2] = x[i3 + 2]; if (!w[i]) continue;
        v[i3 + 1] += g; v[i3] *= damp; v[i3 + 1] *= damp; v[i3 + 2] *= damp;
        var vn = v[i3] * nr[i3] + v[i3 + 1] * nr[i3 + 1] + v[i3 + 2] * nr[i3 + 2], dv = vn * (1 - air); // air resists cloth moving face-on
        v[i3] -= dv * nr[i3]; v[i3 + 1] -= dv * nr[i3 + 1]; v[i3 + 2] -= dv * nr[i3 + 2];
        x[i3] += v[i3] * dt; x[i3 + 1] += v[i3 + 1] * dt; x[i3 + 2] += v[i3 + 2] * dt; }
      if (G) for (var gi = 0; gi < G.ids.length; gi++) { var gq = 3 * G.ids[gi], gw = G.wt[gi]; // the hand pulling the cloth
        x[gq] += (G.t[0] + G.off[3 * gi] - x[gq]) * gw; x[gq + 1] += (G.t[1] + G.off[3 * gi + 1] - x[gq + 1]) * gw; x[gq + 2] += (G.t[2] + G.off[3 * gi + 2] - x[gq + 2]) * gw; }
      // stretch
      for (j = 0; j < E.length; j += 3) {
        var a = E[j] * 3, b = E[j + 1] * 3, r = E[j + 2], wa = w[E[j]], wb = w[E[j + 1]], dx = x[b] - x[a], dy = x[b + 1] - x[a + 1], dz = x[b + 2] - x[a + 2], l = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (l < 1e-6 || wa + wb === 0) continue; var C = l - r, lam = C / (wa + wb + EA[j / 3] * idt2) / l;
        x[a] += wa * lam * dx; x[a + 1] += wa * lam * dy; x[a + 2] += wa * lam * dz; x[b] -= wb * lam * dx; x[b + 1] -= wb * lam * dy; x[b + 2] -= wb * lam * dz;
      }
      // tethers (only when stretched past the flat pattern)
      var Tt = this.Tt;
      for (j = 0; j < Tt.length; j += 3) {
        var ta = Tt[j] * 3, tb = Tt[j + 1] * 3, tr = Tt[j + 2], twa = w[Tt[j]], twb = w[Tt[j + 1]], gx = x[tb] - x[ta], gy = x[tb + 1] - x[ta + 1], gz = x[tb + 2] - x[ta + 2], tl = Math.sqrt(gx * gx + gy * gy + gz * gz);
        if (tl <= tr * 1.01 || twa + twb === 0) continue; var tk = (tl - tr * 1.01) / (twa + twb) / tl;
        x[ta] += twa * tk * gx; x[ta + 1] += twa * tk * gy; x[ta + 2] += twa * tk * gz; x[tb] -= twb * tk * gx; x[tb + 1] -= twb * tk * gy; x[tb + 2] -= twb * tk * gz;
      }
      // bending (distance across each shared edge; it only resists folding, not stretching)
      for (j = 0; j < Bn.length; j += 3) {
        var a2 = Bn[j] * 3, b2 = Bn[j + 1] * 3, r2 = Bn[j + 2], wa2 = w[Bn[j]], wb2 = w[Bn[j + 1]], ex = x[b2] - x[a2], ey = x[b2 + 1] - x[a2 + 1], ez = x[b2 + 2] - x[a2 + 2], l2 = Math.sqrt(ex * ex + ey * ey + ez * ez);
        if (l2 < 1e-6 || l2 > r2 || wa2 + wb2 === 0) continue; var lam2 = (l2 - r2) / (wa2 + wb2 + this.BA[j / 3] * idt2) / l2;
        x[a2] += wa2 * lam2 * ex; x[a2 + 1] += wa2 * lam2 * ey; x[a2 + 2] += wa2 * lam2 * ez; x[b2] -= wb2 * lam2 * ex; x[b2 + 1] -= wb2 * lam2 * ey; x[b2 + 2] -= wb2 * lam2 * ez;
      }
      // seams: pull the matching points together, a little at a time while sewing
      for (j = 0; j < S.length; j += 2) {
        var a3 = S[j] * 3, b3 = S[j + 1] * 3, fx = x[b3] - x[a3], fy = x[b3 + 1] - x[a3 + 1], fz = x[b3 + 2] - x[a3 + 2], l3 = Math.sqrt(fx * fx + fy * fy + fz * fz);
        if (l3 < 1e-6) continue; if (l3 > 2 && tt > .9 && tt < 3.5) { this.free[S[j]] = 1; this.free[S[j + 1]] = 1; } /* caught either side of the body: let the pair pass through to join */ var wa3 = w[S[j]], wb3 = w[S[j + 1]], ws = wa3 + wb3; if (!ws) continue; var mv = Math.min(l3, sewMax) / l3;
        x[a3] += fx * mv * wa3 / ws; x[a3 + 1] += fy * mv * wa3 / ws; x[a3 + 2] += fz * mv * wa3 / ws; x[b3] -= fx * mv * wb3 / ws; x[b3 + 1] -= fy * mv * wb3 / ws; x[b3 + 2] -= fz * mv * wb3 / ws;
      }
      // waistbands: shrink the ring back towards its own centre when it has been stretched
      for (var ri = 0; ri < this.rings.length; ri++) { // waistbands: when the waist edge (measured in 3D, so a tilted waist counts) is stretched, pull it in towards its centre
        var rg = this.rings[ri], ids = rg.ids, cx0 = 0, cy0 = 0, cz0 = 0, q;
        for (q = 0; q < ids.length; q++) { cx0 += x[3 * ids[q]]; cy0 += x[3 * ids[q] + 1]; cz0 += x[3 * ids[q] + 2]; } cx0 /= ids.length; cy0 /= ids.length; cz0 /= ids.length;
        var ord = (ids.slice().sort(function (a, b) { return Math.atan2(x[3 * a + 2] - cz0, x[3 * a] - cx0) - Math.atan2(x[3 * b + 2] - cz0, x[3 * b] - cx0); })), circ = 0;
        for (q = 0; q < ord.length; q++) { var qa = 3 * ord[q], qb = 3 * ord[(q + 1) % ord.length]; circ += Math.hypot(x[qa] - x[qb], rg.tilt ? x[qa + 1] - x[qb + 1] : 0, x[qa + 2] - x[qb + 2]); }
        if (circ > rg.len * 1.01) { var sc = circ > rg.len * 1.3 ? Math.max(.985, rg.len * 1.01 / circ) : rg.len * 1.01 / circ;
          for (q = 0; q < ids.length; q++) { var qi = 3 * ids[q]; if (!w[ids[q]]) continue; x[qi] = cx0 + (x[qi] - cx0) * sc; x[qi + 2] = cz0 + (x[qi + 2] - cz0) * sc; if (rg.tilt) x[qi + 1] = cy0 + (x[qi + 1] - cy0) * sc; } }
      }
      if (this.selfOn && s % 3 === 0 && tt > 1.1) this.selfCollide();
      // body
      for (i = 0; i < n; i++) {
        var k3 = 3 * i;
        var hitB = !w[i] ? false : this.free[i] ? (this.free[i] = 0, false) : body.push(x, k3, th, nrm);
        if (s === sub - 1) this.gap[i] = body.dist(x[k3], x[k3 + 1], x[k3 + 2], nrm2);
        if (hitB) {
          var mx = x[k3] - p[k3], my = x[k3 + 1] - p[k3 + 1], mz = x[k3 + 2] - p[k3 + 2], dn = mx * nrm[0] + my * nrm[1] + mz * nrm[2];
          var tx = mx - dn * nrm[0], ty = my - dn * nrm[1], tz = mz - dn * nrm[2];
          var mk = this.grip[i] ? .95 : mu; x[k3] -= tx * mk; x[k3 + 1] -= ty * mk; x[k3 + 2] -= tz * mk;
        }
        if (x[k3 + 1] < .3) x[k3 + 1] = .3; // floor
      }
      var ke = 0;
      for (i = 0; i < n * 3; i++) { v[i] = (x[i] - p[i]) / dt; }
      this.t += dt;
    }
    for (i = 0, ke = 0; i < n * 3; i++) ke += v[i] * v[i];
    var vrms = Math.sqrt(ke / n);
    var since = this.t - this.tWake;
    if (!G && !this.pinned && since > (this.tWake ? .8 : 2) && vrms < 1.5) this.calm += frameDt; else this.calm = 0;
    if (!G && !this.pinned && (this.calm > .5 || since > 10)) this.settled = true;
    return vrms;
  };
  Sim.prototype.wake = function () { this.settled = false; this.calm = 0; this.tWake = Math.max(this.t, 1.3); this.t = this.tWake; };
  Sim.prototype.normals = function () {
    var x = this.x, T = this.M.tri, nr = this.nrm, i;
    nr.fill(0);
    for (i = 0; i < T.length; i += 3) {
      var a = 3 * T[i], b = 3 * T[i + 1], c = 3 * T[i + 2], ux = x[b] - x[a], uy = x[b + 1] - x[a + 1], uz = x[b + 2] - x[a + 2], vx = x[c] - x[a], vy = x[c + 1] - x[a + 1], vz = x[c + 2] - x[a + 2];
      var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      nr[a] += nx; nr[a + 1] += ny; nr[a + 2] += nz; nr[b] += nx; nr[b + 1] += ny; nr[b + 2] += nz; nr[c] += nx; nr[c + 1] += ny; nr[c + 2] += nz;
    }
    for (i = 0; i < this.n; i++) { var k = 3 * i, l = Math.hypot(nr[k], nr[k + 1], nr[k + 2]) || 1; nr[k] /= l; nr[k + 1] /= l; nr[k + 2] /= l; }
  };
  // cloth against cloth: keep points of different layers at least selfR apart (spatial hash)
  Sim.prototype.selfCollide = function () {
    var sm = this.onSeam, gp = this.grip, x = this.x, n = this.n, R = this.selfR, R2 = R * R, inv = 1 / R, HS = this.HS, M1 = HS - 1, head = this.head, next = this.next, grp = this.grp, uv = this.M.uv, pan = this.panel, w = this.w, i;
    head.fill(-1);
    function h(ix, iy, iz) { return ((ix * 92837111) ^ (iy * 689287499) ^ (iz * 283923481)) & M1; }
    for (i = 0; i < n; i++) { var c = h(Math.floor(x[3 * i] * inv), Math.floor(x[3 * i + 1] * inv), Math.floor(x[3 * i + 2] * inv)); next[i] = head[c]; head[c] = i; }
    for (i = 0; i < n; i++) {
      var k = 3 * i, ix = Math.floor(x[k] * inv), iy = Math.floor(x[k + 1] * inv), iz = Math.floor(x[k + 2] * inv);
      for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) for (var c2 = -1; c2 <= 1; c2++) {
        for (var j = head[h(ix + a, iy + b, iz + c2)]; j >= 0; j = next[j]) {
          if (j <= i || grp[i] === grp[j] || (sm[i] && sm[j]) || gp[i] || gp[j]) continue; /* waistband edges hold gathers packed tight */
          var q = 3 * j, dx = x[q] - x[k], dy = x[q + 1] - x[k + 1], dz = x[q + 2] - x[k + 2], d2 = dx * dx + dy * dy + dz * dz;
          if (d2 >= R2 || d2 < 1e-10) continue;
          if (pan[i] === pan[j]) { var du = uv[2 * i] - uv[2 * j], dv = uv[2 * i + 1] - uv[2 * j + 1]; if (du * du + dv * dv < 9) continue; }
          var d = Math.sqrt(d2), ws = w[i] + w[j]; if (!ws) continue; var corr = (R - d) / d / ws;
          x[k] -= dx * corr * w[i]; x[k + 1] -= dy * corr * w[i]; x[k + 2] -= dz * corr * w[i];
          x[q] += dx * corr * w[j]; x[q + 1] += dy * corr * w[j]; x[q + 2] += dz * corr * w[j];
        }
      }
    }
  };
  // grab the cloth at point i: nearby points follow with a soft falloff
  Sim.prototype.startGrab = function (i, radius) {
    var x = this.x, uv = this.M.uv, pan = this.panel, ids = [], wt = [], off = [], r = radius || 4;
    for (var k = 0; k < this.n; k++) {
      if (pan[k] !== pan[i]) continue; var d = Math.hypot(uv[2 * k] - uv[2 * i], uv[2 * k + 1] - uv[2 * i + 1]); if (d > r) continue;
      ids.push(k); wt.push(.9 * (1 - d / r) + .1); off.push(x[3 * k] - x[3 * i], x[3 * k + 1] - x[3 * i + 1], x[3 * k + 2] - x[3 * i + 2]);
    }
    this.grab = { ids: ids, wt: wt, off: off, t: [x[3 * i], x[3 * i + 1], x[3 * i + 2]] }; this.wake();
  };
  Sim.prototype.moveGrab = function (t) { if (this.grab) { this.grab.t = t; this.wake(); } };
  Sim.prototype.endGrab = function () { this.grab = null; this.wake(); };
  // move a whole piece rigidly (the gizmo): matrix applied to where the piece was when the move began
  Sim.prototype.startPanel = function (pi) {
    var ids = [], snap = []; for (var k = 0; k < this.n; k++) if (this.panel[k] === pi) { ids.push(k); snap.push(this.x[3 * k], this.x[3 * k + 1], this.x[3 * k + 2]); }
    var wsave = ids.map(function (k) { return this.w[k]; }, this); ids.forEach(function (k) { this.w[k] = 0; this.v[3 * k] = this.v[3 * k + 1] = this.v[3 * k + 2] = 0; }, this);
    this.pinned = { ids: ids, snap: snap, wsave: wsave }; this.wake();
  };
  Sim.prototype.movePanel = function (e) { // e: 4x4 column-major
    var P = this.pinned; if (!P) return; var x = this.x;
    for (var q = 0; q < P.ids.length; q++) { var k = 3 * P.ids[q], a = P.snap[3 * q], b = P.snap[3 * q + 1], c = P.snap[3 * q + 2];
      x[k] = e[0] * a + e[4] * b + e[8] * c + e[12]; x[k + 1] = e[1] * a + e[5] * b + e[9] * c + e[13]; x[k + 2] = e[2] * a + e[6] * b + e[10] * c + e[14]; }
    this.wake();
  };
  Sim.prototype.endPanel = function () { var P = this.pinned; if (!P) return; P.ids.forEach(function (k, q) { this.w[k] = P.wsave[q]; this.v[3 * k] = this.v[3 * k + 1] = this.v[3 * k + 2] = 0; }, this); this.pinned = null; this.wake(); };
  Sim.prototype.seamGap = function () { var S = this.S, x = this.x, mx = 0, nS = S.length - ((this.M.tacks || []).length) - 2 * this.userT; for (var j = 0; j < nS; j += 2) { var a = S[j] * 3, b = S[j + 1] * 3; mx = Math.max(mx, Math.hypot(x[a] - x[b], x[a + 1] - x[b + 1], x[a + 2] - x[b + 2])); } return mx; };
  Sim.prototype.computeStrain = function () {
    var E = this.E, x = this.x, n = this.n, s = this.strain, c = new Float32Array(n), i;
    for (i = 0; i < n; i++) s[i] = 0;
    for (var j = 0; j < E.length; j += 3) { var a = E[j], b = E[j + 1], l = Math.hypot(x[3 * a] - x[3 * b], x[3 * a + 1] - x[3 * b + 1], x[3 * a + 2] - x[3 * b + 2]) / E[j + 2]; s[a] += l; s[b] += l; c[a]++; c[b]++; }
    for (i = 0; i < n; i++) s[i] = c[i] ? s[i] / c[i] : 1;
    return s;
  };
  /* studio tools: pin, tack, freeze, interfacing, elastic, puckering */
  Sim.prototype.w0 = null;
  Sim.prototype.keepW = function () { if (!this.w0) this.w0 = this.w.slice(); };
  Sim.prototype.pin = function (i, on) { this.keepW(); this.w[i] = on ? 0 : this.w0[i]; this.wake(); };
  Sim.prototype.freeze = function (pi, on) { this.keepW(); for (var i = 0; i < this.n; i++) if (this.panel[i] === pi) { this.w[i] = on ? 0 : this.w0[i]; this.v[3 * i] = this.v[3 * i + 1] = this.v[3 * i + 2] = 0; } this.wake(); };
  Sim.prototype.tack = function (a, b) { var S = new Uint32Array(this.S.length + 2); S.set(this.S); S[this.S.length] = a; S[this.S.length + 1] = b; this.S = S; this.userT++; this.onSeam[a] = this.onSeam[b] = 1; this.wake(); };
  Sim.prototype.untack = function (pairs) { var keep = [], S = this.S, base = S.length - 2 * this.userT, i, j, drop = {}; for (i = 0; i < pairs.length; i += 2) drop[pairs[i] + '_' + pairs[i + 1]] = 1;
    for (j = base; j < S.length; j += 2) if (!drop[S[j] + '_' + S[j + 1]]) keep.push(S[j], S[j + 1]); var N = new Uint32Array(base + keep.length); N.set(S.subarray(0, base)); N.set(keep, base); this.S = N; this.userT = keep.length / 2; this.wake(); };
  Sim.prototype.clearTacks = function () { if (!this.userT) return; this.S = this.S.slice(0, this.S.length - 2 * this.userT); this.userT = 0; this.wake(); };
  Sim.prototype.stiffen = function (pi, k) { var B = this.B, P = this.panel; for (var j = 0; j < B.length; j += 3) if (P[B[j]] === pi && P[B[j + 1]] === pi) this.BA[j / 3] = this.fab.bend / (k || 1); this.wake(); };
  Sim.prototype.elastic = function (ids, ratio) { var L = 0, x = this.x; for (var q = 1; q < ids.length; q++) { var a = 3 * ids[q - 1], b = 3 * ids[q]; L += Math.hypot(this.M.uv[2 * ids[q]] - this.M.uv[2 * ids[q - 1]], this.M.uv[2 * ids[q] + 1] - this.M.uv[2 * ids[q - 1] + 1]); } void x;
    this.rings = this.rings.concat([{ ids: ids.slice(), len: L * ratio, tilt: true, user: 1 }]); ids.forEach(function (k) { this.grip[k] = 1; }, this); this.wake(); };
  Sim.prototype.clearElastic = function () { this.rings = this.rings.filter(function (r) { return !r.user; }); this.wake(); };
  Sim.prototype.pucker = function (a) { var E = this.E, E0 = this.E0, sm = this.onSeam; for (var j = 0; j < E.length; j += 3) E[j + 2] = sm[E[j]] && sm[E[j + 1]] ? E0[j + 2] * (1 - a) : E0[j + 2]; this.wake(); };
  D.Sim = Sim;
  D.plen = plen;
  if (typeof module !== 'undefined' && module.exports) module.exports = D; else root.FCDrape = D;
})(typeof window !== 'undefined' ? window : this);
