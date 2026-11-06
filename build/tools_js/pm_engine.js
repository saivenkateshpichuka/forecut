/* Forecut pattern maker: drafting engine. All geometry in centimetres, y down, origin at the high point of shoulder / waist.
   A piece = { id, comp, edges:[{t:'seam'|'fold'|'hem', p:[[x,y],...]}], marks:[...], grain:[[x,y],[x,y]], cut:'Cut 2', defSA, defHem }.
   Edges run in order around the piece; seam allowance is applied per edge (fold = 0, hem = hem allowance). */
(function () {
  var PM = window.PM = {};
  /* ---------- size charts (cm) ---------- */
  var K = ['bust', 'waist', 'hip', 'shoulder', 'nape', 'neck', 'bicep', 'wrist', 'sleeve', 'wh', 'rise', 'knee_l', 'outseam', 'thigh', 'knee', 'ankle', 'head'];
  PM.KEYS = K;
  PM.LABELS = { bust: 'Bust / chest', waist: 'Waist', hip: 'Hip / seat', shoulder: 'Shoulder width (tip to tip)', nape: 'Nape to waist (back length)', neck: 'Neck', bicep: 'Upper arm (bicep)', wrist: 'Wrist',
    sleeve: 'Sleeve length (shoulder to wrist)', wh: 'Waist to hip depth', rise: 'Body rise (seated waist to seat)', knee_l: 'Waist to knee', outseam: 'Waist to floor (outseam)', thigh: 'Thigh', knee: 'Knee', ankle: 'Ankle', head: 'Head' };
  function chart(sizes, cols) { var o = {}; sizes.forEach(function (s, i) { o[s] = {}; K.forEach(function (k, j) { o[s][k] = cols[j][i]; }); }); return o; }
  PM.CHARTS = {
    women: chart(['XS', 'S', 'M', 'L', 'XL', 'XXL'], [[81, 86, 91, 97, 102, 108], [65, 70, 75, 81, 86, 92], [89, 94, 99, 104, 109, 115], [35, 36, 37, 38, 39.5, 41], [39, 39.5, 40, 41, 41.5, 42], [34, 35, 36, 37, 38, 39], [26, 27, 28, 30, 32, 34], [15, 15.5, 16, 16.5, 17, 17.5],
      [57, 58, 58.5, 59, 59.5, 60], [20, 20, 20.5, 21, 21, 21.5], [26, 26.5, 27, 28, 28.5, 29], [57, 58, 58.5, 59, 59.5, 60], [100, 101, 102, 103, 103, 104], [51, 54, 57, 60, 63, 67], [35, 36, 37, 38.5, 40, 41.5], [22, 23, 23, 24, 25, 25], [55, 55.5, 56, 56.5, 57, 57.5]]),
    men: chart(['S', 'M', 'L', 'XL', 'XXL', '3XL'], [[92, 98, 104, 110, 116, 122], [78, 84, 90, 96, 102, 108], [94, 100, 106, 112, 118, 124], [43, 44.5, 46, 47.5, 49, 50.5], [43, 44, 45, 46, 46.5, 47], [37, 39, 41, 43, 45, 47], [30, 32, 34, 36, 38, 40], [17, 17.5, 18, 18.5, 19, 19.5],
      [62, 63, 64, 65, 65.5, 66], [20, 20.5, 21, 21.5, 22, 22], [27, 27.5, 28, 28.5, 29, 29.5], [59, 60, 61, 62, 62.5, 63], [104, 105, 106, 107, 107.5, 108], [56, 59, 62, 65, 68, 71], [39, 40, 41, 42.5, 44, 45.5], [24, 25, 25, 26, 26.5, 27], [56, 57, 58, 59, 59.5, 60]]),
    kids: chart(['2Y', '4Y', '6Y', '8Y', '10Y', '12Y'], [[53, 57, 61, 66, 71, 76], [51, 53, 55, 58, 61, 64], [55, 60, 65, 70, 76, 82], [24, 26, 28, 30, 32, 34], [23, 26, 28, 30, 32, 34], [26, 27, 28, 29, 30, 31], [17, 18, 19, 20.5, 22, 23.5], [12, 12.5, 13, 13.5, 14, 14.5],
      [30, 35, 39, 44, 48, 52], [10, 12, 13, 14, 15, 16], [16, 17, 18, 19, 20, 21], [26, 31, 35, 39, 43, 47], [50, 60, 68, 76, 84, 90], [31, 34, 37, 40, 44, 47], [23, 25, 27, 29, 31, 33], [17, 18, 19, 20, 21, 22], [49, 51, 52, 53, 54, 55]])
  };
  PM.CHARTS.unisex = PM.CHARTS.men;
  PM.GENDER = { women: 'Womenswear', men: 'Menswear', kids: 'Kidswear', unisex: 'Unisex' };

  /* ---------- geometry helpers ---------- */
  function L(a, b, n) { n = n || 1; var r = []; for (var i = 0; i <= n; i++) r.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]); return r; }
  function B(a, c1, c2, b, n) { n = n || 24; var r = []; for (var i = 0; i <= n; i++) { var t = i / n, u = 1 - t; r.push([u * u * u * a[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * b[0], u * u * u * a[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * b[1]]); } return r; }
  function cat() { var r = []; for (var i = 0; i < arguments.length; i++) { var s = arguments[i]; r = r.concat(r.length ? s.slice(1) : s); } return r; }
  function rev(p) { return p.slice().reverse(); }
  function plen(p) { var s = 0; for (var i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; }
  function arc(cx, cy, r, a0, a1, n) { n = n || 40; var o = []; for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n; o.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return o; }
  function mv(p, dx, dy) { return p.map(function (q) { return [q[0] + dx, q[1] + dy]; }); }
  function atY(p, y) { for (var i = 1; i < p.length; i++) { var a = p[i - 1], b = p[i]; if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) { var t = (y - a[1]) / (b[1] - a[1]); return { i: i, pt: [a[0] + (b[0] - a[0]) * t, y] }; } } return null; }
  PM.plen = plen;
  function E(t, p) { return { t: t, p: p }; }
  function piece(id, comp, edges, o) { o = o || {}; return { id: id, comp: comp, edges: edges, marks: o.marks || [], grain: o.grain, cut: o.cut || 'Cut 1', defHem: o.hem, notes: o.notes || '', fold: edges.some(function (e) { return e.t === 'fold'; }) }; }
  function rect(id, comp, w, h, o) { o = o || {}; var fold = o.fold; return piece(id, comp, [E(fold === 'left' ? 'fold' : 'seam', L([0, h], [0, 0])), E('seam', L([0, 0], [w, 0])), E(o.hemRight ? 'hem' : 'seam', L([w, 0], [w, h])), E(fold === 'bottom' ? 'fold' : 'seam', L([w, h], [0, h]))],
    { cut: o.cut, grain: o.grainV ? [[w / 2, h * .15], [w / 2, h * .85]] : [[w * .15, h / 2], [w * .85, h / 2]], marks: o.marks, notes: o.notes }); }

  /* ---------- torso (front & back) ---------- */
  PM.torso = function (m, o) {
    var g = o.gender, kid = g === 'kids', men = g === 'men' || g === 'unisex';
    var ease = o.ease, drop = o.drop || 0;
    var Ad = (o.ad || (kid ? m.bust / 10 + 8 : men ? m.bust / 10 + 13 : m.bust / 10 + 11.5)) + drop * .6;
    var Bq = (m.bust + ease) / 4, Wq = (m.waist + ease) / 4, Hq = (m.hip + Math.max(ease, 4)) / 4, hs = m.shoulder / 2, Wy = m.nape, Hy = m.nape + m.wh, Lh = o.len;
    var nwB = m.neck / 6 + .5, ndB = m.neck / 6 + 1.5, out = { pieces: [] };
    var NL = { crew: [0, 0], round: [.5, 1.5], deep: [1.5, 7], v: [.5, 11], boat: [4, -1.5], square: [2.5, 6], collar: [0, 0], ushape: [2, 10] }[o.neck || 'round'];
    var BK = { std: 0, deepU: 13, deepV: 15, low: 6 }[o.backNeck || 'std'];
    var cup = { A: 2.5, B: 3.5, C: 4.5, D: 5.5 }[o.cup || 'B'];
    var res = {};
    ['F', 'B'].forEach(function (SD) {
      var front = SD === 'F', slope = kid ? 3 : front ? 4.6 : 4, nw = nwB + NL[0], nd = front ? ndB + NL[1] : (kid ? 1.8 : 2.2) + BK;
      if (!front) nw = nwB + Math.min(NL[0], 2.5);
      var hp = [nw, 0], sp0 = [hs, slope], dir = [sp0[0] - hp[0], sp0[1] - hp[1]], dl = Math.hypot(dir[0], dir[1]);
      var sp = drop ? [sp0[0] + dir[0] / dl * drop, sp0[1] + dir[1] / dl * drop * .55] : sp0;
      if (o.sleeveless) sp = [hs - 1, slope + .1];
      var cx = (drop ? sp[0] - 1 : hs - (front ? 1.5 : .8)), ch = [cx, sp[1] + (Ad - sp[1]) * .62], ua = [Bq + (o.sleeveless ? -.5 : 0), Ad - (o.sleeveless ? 1 : 0)];
      var arm = cat(B(sp, [sp[0] - .3, sp[1] + (ch[1] - sp[1]) * .45], [cx, ch[1] - 3], ch), B(ch, [cx, ch[1] + 3], [cx + (ua[0] - cx) * .35, ua[1]], ua)); /* shoulder -> underarm */
      var fitted = o.fit === 'fitted', shaped = fitted || o.shape === 'shaped';
      var dartF = fitted ? Math.max(0, Math.min((Bq - Wq) * .55, 4.5)) : 0, wqx = shaped ? Wq + dartF : Math.max(Hq, Bq);
      var hipX = shaped ? Hq : Math.max(Hq, Bq), hemX = hipX + (o.flare || 0), side = [];
      if (Lh <= Wy + .01) { // cropped / to waist
        var wx = shaped ? Wq + dartF : Bq; side = B(ua, [ua[0], ua[1] + (Lh - ua[1]) * .4], [wx, Lh - (Lh - ua[1]) * .3], [wx, Lh]); hemX = wx;
      } else if (shaped) {
        side = cat(B(ua, [ua[0], ua[1] + (Wy - ua[1]) * .45], [wqx, Wy - 5], [wqx, Wy]), Lh > Hy ? cat(B([wqx, Wy], [wqx, Wy + 6], [hipX, Hy - 7], [hipX, Hy]), L([hipX, Hy], [hemX, Lh])) : B([wqx, Wy], [wqx, Wy + 4], [hipX, Lh - 4], [hipX, Lh]));
        if (Lh <= Hy) hemX = hipX;
      } else side = cat(L(ua, [hipX, Math.min(Hy, Lh)], 4), Lh > Hy ? L([hipX, Hy], [hemX, Lh], 4) : []);
      if (Lh <= Hy && !shaped && Lh > Wy) hemX = hipX;
      var ext = front && o.opening ? (o.ext || 1.5) : 0, curve = o.hemCurve || 0;
      var hem = curve ? B([hemX, Lh - curve], [hemX * .7, Lh - curve * .1], [hemX * .35, Lh], [-ext, Lh]) : L([hemX, Lh], [-ext, Lh], 2);
      if (curve) { side = side.filter(function (q) { return q[1] < Lh - curve - .05; }); side.push([hemX, Lh - curve]); }
      var neck = (front && o.neck === 'v') ? L(hp, [0, nd], 6) : (front && o.neck === 'square') ? cat(L(hp, [nw, nd], 2), L([nw, nd], [0, nd], 2)) : B(hp, [nw, nd * (front ? (o.neck === 'boat' ? .4 : .55) : .6)], [nw * (front ? .55 : .5), nd], [0, nd]);
      if (ext) neck = cat(neck, L([0, nd], [-ext, nd]));
      var cfp = L([-ext, nd], [-ext, Lh], 4);
      var edges = [E(ext || o.backOpen && !front ? 'seam' : 'fold', cfp), E('hem', rev(hem)), E('seam', rev(side)), E('seam', rev(arm)), E('seam', L(sp, hp)), E('seam', neck)];
      var marks = [];
      if (ext) marks.push({ t: 'line', p: L([0, nd], [0, Lh]), lab: 'centre front' });
      if (ext && o.buttons) { var n = o.buttons, y0 = nd + 1.5, y1 = Math.min(Lh - 12, Hy + 4); for (var i = 0; i < n; i++) { var yy = y0 + (y1 - y0) * i / (n - 1); marks.push({ t: 'button', c: [0, yy] }); } }
      if (fitted && front && g === 'women') { // bust dart from side seam + waist dart
        var bp = [Bq * .42, Ad + 5], s1 = atY(side, Ad + 4), dlen = cup;
        if (s1) { var p1 = s1.pt, p2 = [p1[0], p1[1] + dlen]; marks.push({ t: 'dart', p: [p1, [bp[0] + 2, bp[1]], p2], lab: 'bust dart ' + dlen.toFixed(1) }); }
        if (dartF > .3) { var wy = Math.min(Wy, Lh); marks.push({ t: 'dart', p: Lh > Wy + 8 ? [[bp[0], bp[1] + 3], [bp[0] - dartF / 2, wy], [bp[0], Math.min(Lh - 3, wy + 12)], [bp[0] + dartF / 2, wy], [bp[0], bp[1] + 3]] : [[bp[0] - dartF / 2, Lh], [bp[0], bp[1] + 3], [bp[0] + dartF / 2, Lh]], lab: 'waist dart' }); }
        marks.push({ t: 'dot', c: bp, lab: 'bust point' });
      }
      if (fitted && !front && dartF > .3 && g === 'women') { var bx = Bq * .45, wy2 = Math.min(Wy, Lh); marks.push({ t: 'dart', p: Lh > Wy + 8 ? [[bx, Ad + 2], [bx - dartF * .8 / 2, wy2], [bx, Math.min(Lh - 3, wy2 + 14)], [bx + dartF * .8 / 2, wy2], [bx, Ad + 2]] : [[bx - dartF * .4, Lh], [bx, Ad + 2], [bx + dartF * .4, Lh]], lab: 'waist dart' }); }
      if (Lh > Wy) marks.push({ t: 'line', p: L([ext ? 0 : 0, Wy], [shaped ? wqx : hipX, Wy]), lab: 'waist', dash: 1 });
      if (o.slit && Lh > Hy) marks.push({ t: 'notch', c: [hemX + (o.flare || 0) * 0, Lh - o.slit], lab: 'slit' });
      // armhole notches: front single, back double at ~1/3 from underarm
      var an = arm[Math.round(arm.length * .62)]; marks.push({ t: 'notch', c: an, n: front ? 1 : 2 });
      res[SD] = { edges: edges, marks: marks, arm: plen(arm), neck: plen(neck) - ext, side: plen(side), hemX: hemX, hipX: hipX, nd: nd, Lh: Lh, ua: ua, sp: sp, armPts: arm, neckPts: neck, wq: shaped ? wqx : hipX };
    });
    out.F = res.F; out.B = res.B; out.armhole = res.F.arm + res.B.arm; out.neckline = res.F.neck + res.B.neck; out.Ad = Ad; out.waistHalf = (res.F.wq + res.B.wq);
    return out;
  };

  /* ---------- sleeve ---------- */
  PM.sleeve = function (m, AH, o) {
    var bw = (m.bicep + (o.sease === undefined ? 5 : o.sease)) / 2, len = o.slen, style = o.style || 'plain', capEase = o.capEase === undefined ? 1 : o.capEase;
    if (style === 'puff') { bw *= 1.35; capEase = AH * .35; }
    var target = AH + capEase, lo = 1.5, hi = 30, CH = 10, fl = o.flat ? .6 : 1;
    function cap(ch, w) { w = w || bw; return cat(B([-w, ch], [-w * .55, ch * (.92 * fl)], [-w * .42, 0], [0, 0]), B([0, 0], [w * .42, 0], [w * .55, ch * .92 * fl], [w, ch])); }
    for (var i = 0; i < 40; i++) { CH = (lo + hi) / 2; if (plen(cap(CH)) < target) lo = CH; else hi = CH; }
    if (o.capMax && CH > o.capMax) { CH = o.capMax; var wl = bw, wh = bw * 2.5; for (var j = 0; j < 40; j++) { var wm = (wl + wh) / 2; if (plen(cap(CH, wm)) < target) wl = wm; else wh = wm; } bw = (wl + wh) / 2; }
    var cp = cap(CH), hw = (o.hem || (m.wrist + 8)) / 2;
    if (style === 'bell') hw = Math.max(hw, bw * 1.25); if (style === 'puff') hw = Math.max(hw, bw * .9);
    if (style === 'cap') { len = Math.max(len, 6); hw = bw * .95; }
    var y = CH + len, hem = style === 'cap' ? B([hw, y - 3], [hw * .5, y + 1], [-hw * .5, y + 1], [-hw, y - 3]) : L([hw, y], [-hw, y], 2);
    var edges = [E('seam', cp), E('seam', L([bw, CH], hem[0], 4)), E('hem', hem), E('seam', L(hem[hem.length - 1], [-bw, CH], 4))];
    var marks = [{ t: 'line', p: L([-bw, CH], [bw, CH]), lab: 'bicep line', dash: 1 }, { t: 'notch', c: [0, 0], n: 1 }, { t: 'notch', c: cp[Math.round(cp.length * .3)], n: 2 }, { t: 'notch', c: cp[Math.round(cp.length * .7)], n: 1 }];
    if (style === 'puff') marks.push({ t: 'text', c: [0, CH * .55], s: 'gather cap between notches' });
    if (o.placket) marks.push({ t: 'line', p: L([-hw * .5, y], [-hw * .5, y - 11]), lab: 'placket opening' });
    return { piece: piece('sleeve', 'Sleeve', edges, { cut: 'Cut 2 (pair)', grain: [[0, CH + 3], [0, y - 5]], marks: marks }), cap: plen(cp), CH: CH, hw: hw * 2 };
  };

  /* ---------- collars & small pieces ---------- */
  PM.band = function (nl, h, ext, id, comp) { // nl = half neckline (CB to CF)
    var w = nl + ext, b = B([0, h], [w * .5, h], [w * .85, h - .4], [w, h - 1.2]), top = B([w - 1.2, 0], [w * .7, -.15], [w * .4, 0], [0, 0]);
    var front = B([w, h - 1.2], [w + .5, h - 2], [w, .2], [w - 1.2, 0], 10);
    return piece(id || 'band', comp || 'Collar band', [E('fold', L([0, 0], [0, h])), E('seam', b), E('seam', front), E('seam', top)], { cut: 'Cut 2 + interfacing', grain: [[w * .2, h / 2], [w * .75, h / 2]], marks: [{ t: 'notch', c: [nl, h - .9], n: 1 }] });
  };
  PM.leaf = function (nl, id) {
    var nb = B([0, 0], [nl * .5, 0], [nl * .85, -.3], [nl, -.6]), pt = [nl + 2.2, 7.2], outer = B(pt, [nl * .7, 5.2], [nl * .3, 4.6], [0, 4.6]);
    return piece(id || 'collar', 'Collar', [E('fold', L([0, 4.6], [0, 0])), E('seam', nb), E('seam', L([nl, -.6], pt, 4)), E('seam', outer)], { cut: 'Cut 2 + interfacing', grain: [[nl * .2, 2.3], [nl * .8, 2.3]] });
  };
  PM.camp = function (nl) {
    var nb = B([0, 0], [nl * .5, 0], [nl * .9, -.2], [nl + 1, -.2]), pt = [nl + 6, 9];
    return piece('collar', 'Camp collar', [E('fold', L([0, 8], [0, 0])), E('seam', nb), E('seam', L([nl + 1, -.2], pt, 4)), E('seam', B(pt, [nl * .7, 8.4], [nl * .3, 8], [0, 8]))], { cut: 'Cut 2 + interfacing', grain: [[nl * .2, 4], [nl * .8, 4]] });
  };
  PM.peterpan = function (nl) {
    var th = 2.2, r = nl / th, R = r + 6.5, a0 = -Math.PI / 2, a1 = a0 + th, inner = arc(0, 0, r, a0, a1), outer = arc(0, 0, R, a1 + .05, a0, 40), end = B(inner[inner.length - 1], [Math.cos(a1) * (r + 2), Math.sin(a1) * (r + 2) + 1], [Math.cos(a1 + .05) * (R - 1.5), Math.sin(a1 + .05) * (R - 1.5) + 1.2], outer[0], 10);
    var ed = [E('fold', L(outer[outer.length - 1], inner[0])), E('seam', inner), E('seam', end), E('seam', outer)];
    return piece('collar', 'Peter Pan collar', ed, { cut: 'Cut 4 (2 pairs)', grain: [[1, -R + 2], [1, -r - 1]] });
  };
  PM.hood = function (nl, head) {
    var H = head * .58, D = Math.max(nl + 3, head * .46), nb = B([0, H], [nl * .4, H + .5], [nl * .8, H - .5], [nl, H - 1.5]);
    var back = B([nl, H - 1.5], [D + 1, H - 6], [D + 1.5, H * .35], [D * .82, 2.5]), top = B([D * .82, 2.5], [D * .55, -1], [D * .2, -.3], [0, 0]);
    return piece('hood', 'Hood', [E('seam', nb), E('seam', back), E('seam', top), E('hem', L([0, 0], [0, H], 4))], { cut: 'Cut 2 (pair) + 2 lining', grain: [[D * .45, H * .25], [D * .45, H * .8]] });
  };
  PM.pocket = function (w, h, shape, id, comp) {
    var bot = shape === 'point' ? cat(L([w, h - 1.5], [w / 2, h], 2), L([w / 2, h], [0, h - 1.5], 2)) : shape === 'round' ? B([w, h - 2.5], [w, h], [0, h], [0, h - 2.5]) : L([w, h], [0, h]);
    var y1 = shape === 'square' ? h : h - (shape === 'round' ? 2.5 : 1.5);
    return piece(id || 'pocket', comp || 'Patch pocket', [E('hem', L([0, 0], [w, 0])), E('seam', L([w, 0], [w, y1], 2)), E('seam', bot), E('seam', L([0, y1], [0, 0], 2))], { cut: 'Cut 1 per pocket', grain: [[w / 2, h * .2], [w / 2, h * .8]], hem: 3 });
  };
  PM.kangaroo = function (w, h) { var s = h * .45; return piece('pocket', 'Kangaroo pocket', [E('fold', L([0, h], [0, 0])), E('seam', L([0, 0], [w - s * .55, 0])), E('hem', B([w - s * .55, 0], [w - s * .3, s * .3], [w, s * .6], [w, s])), E('seam', L([w, s], [w, h], 2)), E('seam', L([w, h], [0, h]))], { cut: 'Cut 1 on fold', grain: [[w * .3, h * .2], [w * .3, h * .8]] }); };

  /* ---------- skirts ---------- */
  PM.skirt = function (m, o) {
    var W = m.waist, Hp = m.hip, D = m.wh, Lk = o.len, ty = o.type, out = [];
    if (ty === 'straight' || ty === 'aline') {
      var fl = ty === 'aline' ? (o.flare || 8) : 0;
      [['front', 1], ['back', -1]].forEach(function (s) {
        var f = s[1] > 0, hq = (Hp + 4) / 4 + s[1] * .5, wq = (W + 1) / 4 + s[1] * .5, ex = hq - wq, dart = Math.max(0, Math.min(ex * (f ? .4 : .55), f ? 3 : 4)), sideIn = ex - dart, y0 = f ? 0 : 1;
        var ws = [hq - sideIn + (fl ? 0 : 0), -1.2], hipS = [hq + fl * D / Lk, D], hem = [hq + fl, Lk - fl * .12], cb = [0, y0];
        var waist = B(cb, [hq * .4, y0], [hq * .8, -.6], ws), side = cat(B(ws, [hq - sideIn * .1, D * .3], [hipS[0], D * .6], hipS), L(hipS, hem, 4)), hemE = B(hem, [(hq + fl) * .8, Lk], [(hq + fl) * .4, Lk], [0, Lk]);
        var xd = (hq - sideIn) * .5, marks = [{ t: 'line', p: L([0, D], [hipS[0], D]), lab: 'hip line', dash: 1 }];
        if (dart > .2) marks.push({ t: 'dart', p: [[xd - dart / 2, y0 * .6], [xd, f ? 9 : 14], [xd + dart / 2, y0 * .6 - .2]], lab: 'dart ' + dart.toFixed(1) });
        if (!f) marks.push({ t: 'notch', c: [0, 20], lab: 'zip end' });
        out.push(piece('sk-' + s[0], f ? 'Skirt front' : 'Skirt back', [E(f ? 'fold' : 'seam', L([0, Lk], cb, 6)), E('seam', waist), E('seam', side), E('hem', hemE)], { cut: f ? 'Cut 1 on fold' : 'Cut 2', grain: [[hq * .4, D + 4], [hq * .4, Lk - 8]], marks: marks }));
      });
    } else if (ty === 'circle') {
      var frac = o.circle || 1, r = (W + 1) / (2 * Math.PI * frac), Rr = r + Lk, seg = frac >= 1 ? 4 : frac >= .5 ? 2 : 1, ang = Math.PI * 2 * frac / seg;
      var inner = arc(0, 0, r, 0, ang), outer = arc(0, 0, Rr, ang, 0, 60);
      out.push(piece('sk-panel', 'Circle skirt panel', [E('seam', L([Rr, 0], [r, 0], 4)), E('seam', inner), E('seam', L(inner[inner.length - 1], outer[0], 4)), E('hem', outer)], { cut: 'Cut ' + seg + (seg > 1 ? ' (or ' + seg / 2 + ' on fold)' : ''), grain: [[r + 3, 3], [Rr - 6, 3 + (Rr - r) * .6]], notes: 'Waist radius ' + r.toFixed(1) + ' cm' }));
    } else if (ty === 'gathered') {
      var gw = (Hp + 6) * (o.gather || 1.8) / 2; out.push(rect('sk-panel', 'Gathered skirt panel', gw / 1, Lk, { cut: 'Cut 2 (front and back)', grainV: true, hemRight: false, notes: 'Gather top edge to ' + ((W + 1) / 2).toFixed(1) + ' cm' }));
      out[0].edges[3].t = 'hem';
    } else if (ty === 'panels') {
      var n = o.panels || 8, top = (W + 2) / n, hemC = o.hemCirc || Math.max(Hp * 3, 300), bot = hemC / n, h = Lk, dy = h, ht = (bot - top) / 2;
      var hp2 = [top / 2 + (Hp + 6) / n / 2 - top / 2, D];
      out.push(piece('sk-panel', 'Kali panel', [E('seam', L([-top / 2, 0], [top / 2, 0])), E('seam', cat(B([top / 2, 0], [top / 2 + .3, D * .5], [(Hp + 6) / n / 2, D * .7], [(Hp + 6) / n / 2, D]), L([(Hp + 6) / n / 2, D], [bot / 2, h], 4))),
        E('hem', B([bot / 2, h], [bot * .2, h + bot * .06], [-bot * .2, h + bot * .06], [-bot / 2, h])), E('seam', cat(L([-bot / 2, h], [-(Hp + 6) / n / 2, D], 4), B([-(Hp + 6) / n / 2, D], [-(Hp + 6) / n / 2, D * .7], [-top / 2 - .3, D * .5], [-top / 2, 0])))],
        { cut: 'Cut ' + n, grain: [[0, 6], [0, h - 10]], notes: n + ' panels · hem ' + Math.round(hemC) + ' cm' }));
    }
    if (o.waistband !== false) out.push(rect('waistband', 'Waistband', W + 1 + 4, 8, { cut: 'Cut 1 + interfacing', notes: 'Fold lengthwise', marks: [{ t: 'line', p: L([0, 4], [W + 5, 4]), lab: 'fold', dash: 1 }] }));
    return out;
  };

  /* ---------- trousers ---------- */
  PM.trousers = function (m, o) {
    var hip = m.hip, waist = m.waist, rise = m.rise + (o.kid ? .5 : 1), D = m.wh, kn = m.knee_l, Lg = o.len || m.outseam - 2, el = o.waist === 'elastic', style = o.leg || 'straight';
    var ease = el ? 10 : 4, out = [], casing = el ? 3.5 : 0;
    var hemW = { straight: m.knee + 4, tapered: m.ankle + 8, wide: hip * .6, palazzo: hip * .75, barrel: m.ankle + 10, jogger: m.ankle + 4, shorts: m.thigh + 6 }[style] || m.knee + 4;
    var kneeW = { straight: m.knee + 6, tapered: m.knee + 4, wide: hip * .55, palazzo: hip * .72, barrel: m.knee + 16, jogger: m.knee + 4, shorts: m.thigh + 6 }[style] || m.knee + 6;
    if (style === 'shorts') Lg = Math.min(Lg, kn - 8);
    ['front', 'back'].forEach(function (sd) {
      var f = sd === 'front', hw = (hip + ease) / 4 + (f ? -1 : 1), cext = f ? hip / 16 : hip / 8, cy = rise + (f ? 0 : .5);
      var hemHalf = (hemW / 2 + (f ? -1 : 1)) / 2, kneeHalf = (kneeW / 2 + (f ? -1 : 1)) / 2, crease = (hw + cext) / 2 - (f ? 0 : 1), kneeY = Math.min(kn, Lg - 4);
      // x grows from side seam (0) to centre; centre line at x = hw
      var wW = el ? hw : (waist + 2) / 4 + (f ? -1 : 1) + (f ? 1.5 : 3), ctop = f ? [hw - 1, -casing] : [hw - 3, -2.5 - casing], stop = [ctop[0] - wW, -casing + (f ? 0 : -.5)];
      if (el) { ctop = [hw - (f ? 0 : 1.5), -casing - (f ? 0 : 2.5)]; stop = [0, -casing]; }
      var cpt = [hw + cext, cy], hipC = [hw, D];
      var crotch = f ? cat(L(ctop, [hw, D * .6], 3), B([hw, D * .6], [hw, cy - 3], [hw + cext * .35, cy], cpt)) : cat(L(ctop, [hw, D * .5], 3), B([hw, D * .5], [hw + .3, cy - 2.5], [hw + cext * .4, cy + .2], cpt));
      var inK = [crease + kneeHalf, kneeY], inH = [crease + hemHalf, Lg], outK = [crease - kneeHalf, kneeY], outH = [crease - hemHalf, Lg];
      if (style === 'palazzo' || style === 'wide') { outK = [Math.min(-1, crease - kneeHalf), kneeY]; outH = [Math.min(-2, crease - hemHalf), Lg]; }
      var inseam = style === 'barrel' ? B(cpt, [cpt[0] - cext * .4, cy + 12], [inK[0] - 1, kneeY - 10], inH, 30) : cat(B(cpt, [cpt[0] - cext * .55, cy + 6], [inK[0] + 1.5, kneeY - 14], inK), L(inK, inH, 4));
      var outseam = style === 'barrel' ? cat(B(stop, [-.6, D * .4], [-1, D * .8], [-.5, D]), B([-.5, D], [-3, kneeY - 10], [outK[0] - 3, kneeY], outH, 30))
        : cat(B(stop, [stop[0] - .6, D * .4], [0, D * .75], [0, D]), B([0, D], [0, D + 10], [outK[0], kneeY - 12], outK), L(outK, outH, 4));
      if (el) outseam = cat(L(stop, [0, D], 3), B([0, D], [0, D + 10], [outK[0], kneeY - 12], outK), L(outK, outH, 4));
      var hemE = L(inH, outH, 2), waistE = L(stop, ctop, 4);
      var marks = [{ t: 'line', p: L([crease, cy - 10], [crease, Lg - 2]), lab: 'crease / grain', dash: 1 }, { t: 'line', p: L([0, D], [hw, D]), lab: 'hip line', dash: 1 }, { t: 'line', p: L([outK[0], kneeY], [inK[0], kneeY]), lab: 'knee', dash: 1 }, { t: 'notch', c: [0, D], n: 1 }, { t: 'notch', c: inK, n: f ? 1 : 2 }];
      if (!el) { var dw = f ? 1.5 : 3, dx = f ? crease : stop[0] + wW * .5; marks.push({ t: 'dart', p: [[dx - dw / 2, -casing + (f ? .05 : -.2)], [dx, f ? 9 : 13], [dx + dw / 2, -casing + (f ? .05 : -.25)]], lab: f ? 'dart or pleat' : 'dart' }); }
      if (el) marks.push({ t: 'line', p: L([stop[0], 0], [ctop[0] + .2, 0]), lab: 'fold casing here', dash: 1 });
      out.push(piece('tr-' + sd, f ? 'Front' : 'Back', [E('seam', waistE), E('seam', crotch), E('seam', inseam), E('hem', hemE), E('seam', rev(outseam))],
        { cut: 'Cut 2 (pair)', grain: [[crease, cy + 2], [crease, Lg - 8]], marks: marks }));
      if (f) out.F = { crotch: plen(crotch), inseam: plen(inseam) }; else out.B = { crotch: plen(crotch), inseam: plen(inseam) };
    });
    var res = out.filter(function (p) { return p.id; });
    if (!el) res.push(rect('waistband', 'Waistband', waist + 2 + 4, 8, { cut: 'Cut 1 + interfacing', marks: [{ t: 'line', p: L([0, 4], [waist + 6, 4]), lab: 'fold', dash: 1 }] }));
    if (o.cargo) res.push(PM.pocket(17, 20, 'square', 'cargo', 'Cargo pocket'));
    if (style === 'jogger') res.push(rect('cuff', 'Rib ankle cuff', (m.ankle + 2) * .85, 16, { cut: 'Cut 2 in rib', marks: [{ t: 'line', p: L([0, 8], [(m.ankle + 2) * .85, 8]), lab: 'fold', dash: 1 }] }));
    res.info = { 'Front crotch': out.F.crotch, 'Back crotch': out.B.crotch, 'Inseam (front)': out.F.inseam };
    return res;
  };

  /* ---------- garments ---------- */
  var GAR = PM.GARMENTS = {
    bodice: { n: 'Fitted bodice block', g: ['women'], o: ['ease', 'len', 'neck', 'cup', 'sleeve', 'slen'], d: { ease: 6, len: 0, neck: 'crew', cup: 'B', sleeve: 'plain', slen: 'full', fit: 'fitted' } },
    kurta: { n: 'Kurta / tunic', g: ['women', 'men', 'kids'], o: ['ease', 'len', 'shape', 'neck', 'collar', 'sleeve', 'slen', 'flare', 'slit', 'pockets'], d: { ease: 8, len: 105, shape: 'straight', neck: 'round', collar: 'none', sleeve: 'plain', slen: '3q', flare: 2, slit: 30, pockets: 0 } },
    shirt: { n: 'Shirt', g: ['men', 'women', 'kids', 'unisex'], o: ['ease', 'len', 'shape', 'collar', 'sleeve', 'slen', 'pockets', 'hem', 'yoke', 'drop'], d: { ease: 14, len: 76, shape: 'straight', collar: 'shirt', sleeve: 'shirt', slen: 'full', pockets: 1, hem: 'curved', yoke: 1, drop: 0 } },
    tshirt: { n: 'T-shirt', g: ['unisex', 'men', 'women', 'kids'], o: ['ease', 'len', 'neck', 'sleeve', 'slen', 'drop'], d: { ease: 8, len: 70, neck: 'crew', sleeve: 'tee', slen: 'short', drop: 0 } },
    hoodie: { n: 'Hoodie / sweatshirt', g: ['unisex', 'kids', 'men', 'women'], o: ['ease', 'len', 'hood', 'slen', 'drop', 'pockets'], d: { ease: 16, len: 68, hood: 1, slen: 'full', drop: 6, pockets: 1 } },
    blouse: { n: 'Saree blouse', g: ['women'], o: ['ease', 'len', 'neck', 'back', 'cup', 'sleeve', 'slen', 'opening'], d: { ease: 4, len: 0, neck: 'deep', back: 'deepU', cup: 'B', sleeve: 'plain', slen: 'short', opening: 1, fit: 'fitted' } },
    top: { n: 'Top / peplum top', g: ['women', 'kids'], o: ['ease', 'len', 'shape', 'neck', 'collar', 'sleeve', 'slen', 'peplum'], d: { ease: 8, len: 60, shape: 'shaped', neck: 'round', collar: 'none', sleeve: 'plain', slen: 'short', peplum: 0 } },
    dress: { n: 'Dress / frock', g: ['women', 'kids'], o: ['ease', 'len', 'neck', 'collar', 'sleeve', 'slen', 'dress'], d: { ease: 8, len: 100, neck: 'round', collar: 'none', sleeve: 'puff', slen: 'short', dress: 'shift' } },
    jacket: { n: 'Nehru jacket / waistcoat', g: ['men', 'kids', 'women'], o: ['ease', 'len', 'collar', 'pockets'], d: { ease: 12, len: 72, collar: 'band', pockets: 2 } },
    skirt: { n: 'Skirt', g: ['women', 'kids'], o: ['skirt', 'slen2', 'flare', 'circle', 'panels'], d: { skirt: 'aline', slen2: 65, flare: 8, circle: 1, panels: 8 } },
    lehenga: { n: 'Lehenga (kalidar) skirt', g: ['women', 'kids'], o: ['slen2', 'panels', 'hemc'], d: { slen2: 100, panels: 12, hemc: 380 } },
    trousers: { n: 'Trousers / pants', g: ['men', 'women', 'unisex', 'kids'], o: ['leg', 'wtype', 'tlen', 'cargo'], d: { leg: 'straight', wtype: 'fitted', tlen: 0, cargo: 0 } }
  };
  var SLEN = { cap: 7, short: .3, elbow: .55, '3q': .75, full: 1 };
  PM.build = function (gid, gender, m, o) {
    var G = GAR[gid], kid = gender === 'kids', P = [], info = {}, lab = (gender === 'men' ? "Men's " : gender === 'women' ? "Women's " : gender === 'kids' ? "Kids' " : 'Unisex ') + G.n.toLowerCase().replace(' / ', ' or ');
    var sl = function (kind) { return kind === 'cap' ? 7 : (SLEN[kind] || 1) * m.sleeve - (kind === 'full' ? 0 : 0); };
    function torsoSet(t, opt) {
      var f = t.F, b = t.B, out = [];
      var fp = piece('front', 'Front', f.edges, { cut: opt.opening ? 'Cut 2 (left and right)' : 'Cut 1 on fold', grain: [[Math.max(4, f.hemX * .35), Math.max(f.nd + 4, 12)], [Math.max(4, f.hemX * .35), f.Lh - 6]], marks: f.marks });
      var bpc = piece('back', 'Back', b.edges, { cut: opt.backOpen ? 'Cut 2 (left and right)' : 'Cut 1 on fold', grain: [[Math.max(4, b.hemX * .35), 10], [Math.max(4, b.hemX * .35), b.Lh - 6]], marks: b.marks });
      out.push(fp, bpc); return out;
    }
    function addSleeve(t, style, slen, extra) {
      if (style === 'none') return;
      var sty = style === 'shirt' ? 'plain' : style === 'tee' ? 'plain' : style;
      var cuffD = style === 'shirt' ? 6 : 0, rib = extra && extra.rib ? 7 : 0, len = sl(slen) - cuffD - rib + (style === 'shirt' ? 2 : 0) - (t.drop || 0);
      var s = PM.sleeve(m, t.armhole, { style: sty, slen: Math.max(len, 5), sease: style === 'tee' ? 4 : style === 'shirt' ? 8 : 5, capEase: style === 'tee' || t.drop ? 0 : 1, flat: style === 'tee' || t.drop > 0, capMax: t.drop ? 9 : (style === 'tee' ? 13 : 0),
        hem: style === 'shirt' ? m.wrist + 10 : rib ? m.wrist + 12 : slen === 'full' ? m.wrist + 9 : slen === 'short' || slen === 'cap' ? undefined : m.bicep * .85, placket: style === 'shirt' && slen === 'full' });
      P.push(s.piece); info['Sleeve cap seam'] = s.cap; info['Sleeve cap height'] = s.CH;
      if (style === 'shirt' && slen === 'full') P.push(rect('cuff', 'Cuff', m.wrist + 7, 12, { cut: 'Cut 4 + 2 interfacing', marks: [{ t: 'line', p: L([0, 6], [m.wrist + 7, 6]), lab: 'fold', dash: 1 }, { t: 'button', c: [2, 3] }] }));
      if (rib) P.push(rect('cuff', 'Rib cuff', (m.wrist + 4) * .85, rib * 2, { cut: 'Cut 2 in rib', marks: [{ t: 'line', p: L([0, rib], [(m.wrist + 4) * .85, rib]), lab: 'fold', dash: 1 }] }));
    }
    var len = o.len || 0, ease = +o.ease;
    if (gid === 'skirt' || gid === 'lehenga') {
      P = PM.skirt(m, { type: gid === 'lehenga' ? 'panels' : o.skirt, len: +o.slen2, flare: +o.flare, circle: +o.circle, panels: +o.panels, hemCirc: +o.hemc });
      info['Finished waist'] = m.waist + 1; info['Finished hip'] = m.hip + 4; if (gid === 'lehenga') info['Hem circumference'] = +o.hemc;
    } else if (gid === 'trousers') {
      var el = o.wtype === 'elastic' || ['jogger', 'palazzo'].indexOf(o.leg) > -1 && o.wtype !== 'fitted';
      P = PM.trousers(m, { leg: o.leg, waist: o.wtype === 'elastic' ? 'elastic' : 'fitted', len: +o.tlen || 0, cargo: +o.cargo, kid: kid }); info = P.info || {};
    } else {
      var to = { gender: gender, ease: ease, len: len || m.nape + m.wh + 20, neck: o.neck, backNeck: o.back, cup: o.cup, fit: G.d.fit || (o.shape === 'fitted' ? 'fitted' : 'semi'), shape: o.shape, flare: +o.flare || 0, slit: +o.slit || 0, drop: +o.drop || 0, sleeveless: o.sleeve === 'none' };
      if (gid === 'bodice') to.len = m.nape;
      if (gid === 'blouse') { to.len = o.len || m.nape - 6; to.opening = +o.opening; to.ext = 1.5; to.buttons = +o.opening ? 5 : 0; }
      if (gid === 'shirt') { to.opening = true; to.ext = 1.75; to.buttons = kid ? 5 : 7; to.neck = 'collar'; to.hemCurve = o.hem === 'curved' ? (kid ? 4 : 7) : 0; }
      if (gid === 'jacket') { to.opening = true; to.ext = 2; to.buttons = 5; to.neck = (o.collar || 'band') === 'band' ? 'collar' : 'v'; to.sleeveless = true; to.shape = 'shaped'; }
      if (gid === 'kurta' && o.collar === 'band') to.neck = o.neck === 'v' ? 'v' : 'collar';
      if (gid === 'hoodie' || gid === 'tshirt') to.neck = gid === 'hoodie' ? 'round' : o.neck;
      if (gid === 'dress' && o.dress === 'frock') to.len = m.nape;
      if (gid === 'top' && +o.peplum) to.len = m.nape;
      var t = PM.torso(m, to); t.drop = to.drop;
      P = torsoSet(t, to);
      if (gid === 'shirt' && +o.yoke && gender !== 'kids') { // split back into yoke + back body
        var yd = gender === 'women' ? 7 : 8.5, bk = P[1], bks = t.B, arm = bks.armPts, hit = null;
        for (var i = 1; i < arm.length; i++) if ((arm[i - 1][1] - yd) * (arm[i][1] - yd) <= 0) { hit = i; break; }
        if (hit) {
          var yp = [arm[hit][0], yd], armTop = arm.slice(0, hit).concat([yp]), armLow = [yp].concat(arm.slice(hit));
          var neckB = bks.neckPts, sp = bks.sp, hpB = neckB[0], pl = 2, hemB = bks.edges[1].p, sideB = bks.edges[2].p;
          var yoke = piece('yoke', 'Back yoke', [E('fold', L([0, yd], [0, bks.nd])), E('seam', rev(neckB)), E('seam', L(hpB, sp)), E('seam', armTop), E('seam', L(yp, [0, yd], 3))], { cut: 'Cut 2 (outer and lining)', grain: [[yp[0] * .2, (yd + bks.nd) / 2], [yp[0] * .8, (yd + bks.nd) / 2]] });
          var body = piece('back', 'Back', [E('fold', L([0, yd], [0, bks.Lh], 4)), E('hem', [[0, bks.Lh]].concat(mv(hemB, pl, 0))), E('seam', mv(sideB, pl, 0)), E('seam', mv(rev(armLow), pl, 0)), E('seam', L([yp[0] + pl, yd], [0, yd], 3))],
            { cut: 'Cut 1 on fold', grain: [[bks.hemX * .5, yd + 6], [bks.hemX * .5, bks.Lh - 6]], marks: [{ t: 'line', p: L([pl, yd], [pl, yd + 12]), lab: 'box pleat', dash: 1 }] });
          P[1] = body; P.splice(2, 0, yoke);
        }
      }
      if (gid === 'dress' && o.dress === 'frock') { var wb = t.waistHalf * 2; P.push(rect('skirt', 'Gathered skirt', (wb + 2) * 1.8 / 2, (o.len || 70) - m.nape, { cut: 'Cut 2 (front and back)', grainV: true, notes: 'Gather to bodice waist ' + (wb / 2).toFixed(1) + ' cm each' })); P[P.length - 1].edges[3].t = 'hem'; }
      if (gid === 'top' && +o.peplum) { var pw = t.waistHalf * 2, r = pw / (2 * Math.PI * .75), inner = arc(0, 0, r, 0, Math.PI * .75), outer = arc(0, 0, r + 18, Math.PI * .75, 0, 50);
        P.push(piece('peplum', 'Peplum', [E('seam', L([r + 18, 0], [r, 0])), E('seam', inner), E('seam', L(inner[inner.length - 1], outer[0])), E('hem', outer)], { cut: 'Cut 2 (front and back halves on fold)', grain: [[r + 3, 3], [r + 14, 8]] })); }
      var sleeveStyle = gid === 'jacket' ? 'none' : gid === 'hoodie' ? 'plain' : o.sleeve || G.d.sleeve;
      addSleeve(t, sleeveStyle, o.slen || G.d.slen, { rib: gid === 'hoodie' });
      var nl = t.neckline;
      var col = o.collar || (gid === 'jacket' ? 'band' : 'none');
      if (gid === 'shirt' && col === 'shirt') { P.push(PM.band(nl, 3.4, 1.75, 'band', 'Collar band')); P.push(PM.leaf(nl, 'collar')); }
      else if (col === 'band' || (gid === 'shirt' && col === 'band')) P.push(PM.band(nl, gid === 'jacket' ? 3.8 : 3.4, to.opening ? to.ext : 0, 'band', 'Band collar'));
      else if (col === 'camp') P.push(PM.camp(nl));
      else if (col === 'peterpan') P.push(PM.peterpan(nl));
      if (gid === 'tshirt' || gid === 'hoodie' && !+o.hood) P.push(rect('neckrib', 'Neck rib', nl * 2 * .85, 5, { cut: 'Cut 1 in rib', marks: [{ t: 'line', p: L([0, 2.5], [nl * 1.7, 2.5]), lab: 'fold', dash: 1 }] }));
      if (gid === 'hoodie') { if (+o.hood) P.push(PM.hood(nl, m.head)); P.push(rect('hemband', 'Hem band', (t.F.hemX + t.B.hemX) * 2 * .9, 14, { cut: 'Cut 1 in rib', marks: [{ t: 'line', p: L([0, 7], [(t.F.hemX + t.B.hemX) * 1.8, 7]), lab: 'fold', dash: 1 }] }));
        if (+o.pockets) P.push(PM.kangaroo(t.F.hemX * .62, kid ? 15 : 20)); }
      if (gid === 'blouse' || gid === 'bodice') { /* no extras */ }
      var pk = +o.pockets || 0;
      if (pk && ['shirt', 'kurta', 'jacket'].indexOf(gid) > -1) { var pw2 = kid ? 9 : gender === 'women' ? 11.5 : 13, ph = kid ? 10 : gender === 'women' ? 12.5 : 14.5;
        var pc = gid === 'jacket' ? PM.pocket(pw2 + 1, 2.5 * 2, 'square', 'welt', 'Welt pocket (cut 2 per pocket)') : PM.pocket(pw2, ph, 'point', 'pocket', 'Patch pocket'); pc.cut = gid === 'jacket' ? 'Cut ' + (2 * pk) : 'Cut ' + pk; P.push(pc); }
      if (gid === 'jacket') { var F = t.F, nk = F.neckPts, hp0 = nk[0], ex = to.ext, sp0 = F.sp, k = 3.5 / Math.hypot(sp0[0] - hp0[0], sp0[1] - hp0[1]), sh = [hp0[0] + (sp0[0] - hp0[0]) * k, hp0[1] + (sp0[1] - hp0[1]) * k], fx = 7 - ex;
        P.push(piece('facing', 'Front facing', [E('seam', nk), E('seam', L([-ex, F.nd], [-ex, F.Lh], 4)), E('hem', L([-ex, F.Lh], [fx, F.Lh])), E('seam', cat(L([fx, F.Lh], [fx, F.nd + 6], 3), L([fx, F.nd + 6], sh, 4))), E('seam', L(sh, hp0))], { cut: 'Cut 2 (pair) + interfacing', grain: [[fx * .4, F.nd + 4], [fx * .4, F.Lh - 6]] })); }
      info['Armhole (front + back)'] = t.armhole; info['Neckline (half)'] = nl; info['Finished chest'] = m.bust + ease;
    }
    P = P.filter(function (p) { return p && p.edges; });
    P.forEach(function (p) { p.auto = lab.replace(/^\w/, function (c) { return c.toUpperCase(); }) + ' · ' + p.comp; });
    return { pieces: P, info: info, label: lab.replace(/^\w/, function (c) { return c.toUpperCase(); }) };
  };

  /* ---------- seam allowance offset ---------- */
  function area(p) { var a = 0; for (var i = 0; i < p.length; i++) { var q = p[i], r = p[(i + 1) % p.length]; a += q[0] * r[1] - r[0] * q[1]; } return a / 2; }
  function dedupe(p) { var o = [p[0]]; for (var i = 1; i < p.length; i++) if (Math.hypot(p[i][0] - o[o.length - 1][0], p[i][1] - o[o.length - 1][1]) > 1e-4) o.push(p[i]); return o; }
  function offEdge(p, d, s) { // offset polyline by d to the outward side (s = orientation sign)
    p = dedupe(p); if (d === 0 || p.length < 2) return p.map(function (q) { return q.slice(); });
    var n = []; for (var i = 0; i < p.length - 1; i++) { var dx = p[i + 1][0] - p[i][0], dy = p[i + 1][1] - p[i][1], l = Math.hypot(dx, dy) || 1; n.push([s * dy / l, -s * dx / l]); }
    var o = []; for (var j = 0; j < p.length; j++) {
      var a = n[Math.max(0, j - 1)], b = n[Math.min(n.length - 1, j)], mx = a[0] + b[0], my = a[1] + b[1], ml = Math.hypot(mx, my) || 1; mx /= ml; my /= ml;
      var cos = mx * b[0] + my * b[1], k = d / Math.max(cos, .5); o.push([p[j][0] + mx * k, p[j][1] + my * k]);
    } return o;
  }
  function inter(a1, a2, b1, b2) { var d = (a2[0] - a1[0]) * (b2[1] - b1[1]) - (a2[1] - a1[1]) * (b2[0] - b1[0]); if (Math.abs(d) < 1e-9) return null; var t = ((b1[0] - a1[0]) * (b2[1] - b1[1]) - (b1[1] - a1[1]) * (b2[0] - b1[0])) / d; return [a1[0] + (a2[0] - a1[0]) * t, a1[1] + (a2[1] - a1[1]) * t]; }
  PM.outline = function (pc) { var p = []; pc.edges.forEach(function (e) { p = p.concat(p.length ? e.p.slice(1) : e.p); }); return dedupe(p); };
  PM.cutline = function (pc, sa, hemA) {
    var all = PM.outline(pc), s = area(all) > 0 ? 1 : -1, offs = pc.edges.map(function (e) { var d = e.t === 'fold' ? 0 : e.t === 'hem' ? hemA : sa; return offEdge(e.p, d, s); }), res = [];
    for (var i = 0; i < offs.length; i++) {
      var A = offs[i], Bn = offs[(i + 1) % offs.length], corner = pc.edges[i].p[pc.edges[i].p.length - 1];
      var a1 = A[A.length - 2] || A[0], a2 = A[A.length - 1], b1 = Bn[0], b2 = Bn[1] || Bn[0];
      var x = inter(a1, a2, b1, b2), lim = 3 * Math.max(sa, hemA, .5);
      res = res.concat(A.slice(i === 0 ? 0 : 1, A.length - 1));
      var ux = a2[0] - a1[0], uy = a2[1] - a1[1], vx = b2[0] - b1[0], vy = b2[1] - b1[1], cosA = (ux * vx + uy * vy) / ((Math.hypot(ux, uy) * Math.hypot(vx, vy)) || 1);
      if (x && cosA > -.45 && Math.hypot(x[0] - corner[0], x[1] - corner[1]) < lim) res.push(x); else { res.push(a2); res.push(b1); }
    }
    return dedupe(res);
  };
})();
