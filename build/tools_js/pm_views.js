/* Forecut pattern maker: supporting views.
   - V.figure(): how-to-measure body diagram (original drawing), one overlay per measurement
   - V.flat(): front/back garment drawing assembled from the drafted pattern pieces
   - V.checks(): automatic pass/warn checks on the drafted pattern
   - V.ruler(): canvas rulers for the pattern stage */
(function () {
  var V = window.PMV = {}, PM = window.PM;
  function f2(v) { return (Math.round(v * 100) / 100).toString(); }
  function P(pts, close) { return 'M' + pts.map(function (q) { return f2(q[0]) + ' ' + f2(q[1]); }).join('L') + (close ? 'Z' : ''); }
  function plen(p) { var s = 0; for (var i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; }

  /* ---------- body diagram ---------- */
  V.HOW = {
    bust: 'Around the fullest part of the bust or chest, tape level under the arms and across the shoulder blades.',
    waist: 'Around the natural waist, the narrowest part of the torso. Snug, not tight.',
    hip: 'Around the fullest part of the hips and seat, feet together.',
    shoulder: 'Across the back, from one shoulder tip (the bone at the edge of the shoulder) to the other.',
    nape: 'At the back: from the neck bone at the base of the neck straight down to the natural waist.',
    neck: 'Around the base of the neck, over the neck bone at the back and just above the collarbone at the front.',
    bicep: 'Around the fullest part of the upper arm, arm relaxed.',
    wrist: 'Around the wrist, over the wrist bone.',
    sleeve: 'From the shoulder tip, over a slightly bent elbow, down to the wrist bone.',
    wh: 'At the side, from the natural waist down to the fullest part of the hip.',
    rise: 'Sit on a firm, flat chair. At the side, measure from the natural waist down to the chair seat.',
    knee_l: 'At the side, from the natural waist to the middle of the knee.',
    outseam: 'At the side, from the natural waist to the floor, without shoes.',
    thigh: 'Around the fullest part of the upper thigh, just below the crotch.',
    knee: 'Around the knee, leg straight.',
    ankle: 'Around the ankle, over the ankle bone.',
    head: 'Around the head, across the forehead and the fullest part of the back of the head.'
  };
  var HALF = [[74, 33], [73, 43], [62, 47], [52, 52], [47, 62], [44, 88], [42, 112], [39, 140], [37, 152], [35, 163], [39, 170], [44, 161], [45, 151], [48, 124], [51, 98], [57, 73], [57, 86], [61, 104], [62, 113], [57, 128], [54, 142], [55, 160], [58, 190], [61, 222], [61, 250], [65, 280], [62, 292], [77, 293], [73, 280], [74, 250], [75, 222], [77, 190], [80, 167]];
  function smooth(pts) { // closed Catmull-Rom -> cubic Bezier
    var n = pts.length, d = 'M' + pts[0].join(' ');
    for (var i = 0; i < n; i++) { var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += 'C' + f2(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f2(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f2(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f2(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + p2.join(' '); }
    return d + 'Z';
  }
  var BODY = smooth(HALF.concat(HALF.slice(0, -1).reverse().map(function (q) { return [160 - q[0], q[1]]; })));
  var M = { // overlay path, guide lines, vertical?
    head: ['M68 21 Q80 29 92 21'], neck: ['M73 40 Q80 45 87 40'], shoulder: ['M52 49 Q80 43 108 49'], bust: ['M57 86 Q80 93 103 86'], waist: ['M62 113 Q80 118 98 113'], hip: ['M54 142 Q80 148 106 142'],
    nape: ['M80 41 L80 113', '', 1], bicep: ['M45 80 L56 82'], wrist: ['M38 150 L45 151'], sleeve: ['M52 52 L43 112 L38 151', '', 1],
    wh: ['M134 113 L134 142', 'M100 113 H136 M107 142 H136', 1], rise: ['M140 113 L140 167', 'M100 113 H142 M81 167 H142', 1], knee_l: ['M146 113 L146 222', 'M100 113 H148 M100 222 H148', 1],
    outseam: ['M152 113 L152 293', 'M100 113 H154 M99 293 H154', 1], thigh: ['M56 172 Q67 176 79 172'], knee: ['M61 222 L75 222'], ankle: ['M65 279 L73 279']
  };
  V.figure = function (keys, on) {
    var g = '';
    keys.forEach(function (k) { var m = M[k]; if (!m) return; var a = m[0].match(/-?[\d.]+/g).map(Number), e = a.slice(-2);
      g += '<g data-k="' + k + '"' + (k === on ? ' class="on"' : '') + '>' + (m[1] ? '<path class="gd" d="' + m[1] + '"/>' : '') + '<path class="mv' + (m[2] ? ' v' : '') + '" d="' + m[0] + '"/><circle cx="' + a[0] + '" cy="' + a[1] + '" r="1.6"/><circle cx="' + e[0] + '" cy="' + e[1] + '" r="1.6"/><path class="ms" d="' + m[0] + '"><title>' + PM.LABELS[k] + '</title></path></g>'; });
    return '<svg viewBox="28 6 132 292" role="img" aria-label="Where to take each measurement"><ellipse class="bd0" cx="80" cy="21" rx="10.5" ry="13"/><path class="bd0" d="' + BODY + '"/>' + g + '</svg>';
  };

  /* ---------- garment drawing from the pattern ---------- */
  function by(r, id) { return r.pieces.filter(function (p) { return p.id === id; })[0]; }
  function mir(p) { return p.map(function (q) { return [-q[0], q[1]]; }); }
  function mv(p, dx, dy) { return p.map(function (q) { return [q[0] + dx, q[1] + dy]; }); }
  function bez(a, c, b, n) { n = n || 12; var o = []; for (var i = 0; i <= n; i++) { var t = i / n, u = 1 - t; o.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]); } return o; }
  function Dr() { this.it = []; this.pts = []; } // painter's order: later items cover earlier ones
  Dr.prototype.fill = function (p) { if (p.length) { this.it.push('<path class="fl" d="' + P(p, 1) + '"/>'); this.pts = this.pts.concat(p); } return this; };
  Dr.prototype.line = function (p, cls) { if (p.length > 1) { this.it.push('<path class="' + ('st ' + (cls || '')).trim() + '" d="' + P(p) + '"/>'); this.pts = this.pts.concat(p); } return this; };
  Dr.prototype.shape = function (p, cls) { this.fill(p); this.it.push('<path class="' + ('st ' + (cls || '')).trim() + '" d="' + P(p, 1) + '"/>'); return this; };
  Dr.prototype.dot = function (c, r) { this.it.push('<circle cx="' + f2(c[0]) + '" cy="' + f2(c[1]) + '" r="' + r + '"/>'); };
  Dr.prototype.svg = function () { return this.it.join(''); };
  // a pattern half placed at CF x=0: fill both halves, stroke everything except a centre fold
  function half(D, pc, opts) {
    opts = opts || {}; var out = PM.outline(pc), dx = opts.dx || 0, dy = opts.dy || 0, H = mv(out, dx, dy), Mi = mir(H), open = pc.edges[0].t !== 'fold';
    D.fill(Mi); pc.edges.forEach(function (e, i) { if (i === 0 && !open) return; D.line(mir(mv(e.p, dx, dy))); });
    D.fill(H); pc.edges.forEach(function (e, i) { if (i === 0 && !open) return; D.line(mv(e.p, dx, dy)); });
    pc.marks.forEach(function (k) { if (k.t === 'dart') { var q = mv(k.p, dx, dy); D.line(q, 'th'); D.line(mir(q), 'th'); } if (k.t === 'button') D.dot([k.c[0] + dx, k.c[1] + dy], .55); });
  }
  function sleeves(D, pc, sl, r, o, back) {
    if (!sl) return; var arm = pc.edges[3].p, ua = arm[0], sp = arm[arm.length - 1], bbx = PM.outline(sl), ys = bbx.map(function (q) { return q[1]; }), Ls = Math.max.apply(null, ys) - Math.min.apply(null, ys);
    var hemW = plen(sl.edges[2].p) / 2, CH = r.info['Sleeve cap height'] || 10, Lv = Math.max(4, Ls - CH * .3), th = (+o.drop || r.pieces.some(function (p) { return p.comp === 'Rib cuff'; }) ? 40 : o.sleeve === 'tee' ? 42 : o.sleeve === 'shirt' ? 27 : Ls < 25 ? 38 : 24) * Math.PI / 180, d = [Math.sin(th), Math.cos(th)], n = [-Math.cos(th), Math.sin(th)];
    var cuff = r.pieces.filter(function (p) { return p.id === 'cuff'; })[0], cH = cuff ? Math.min(7, PM.outline(cuff).reduce(function (a, q) { return Math.max(a, q[1]); }, 0) / 2) : 0;
    var ob = [sp[0] + d[0] * Lv, sp[1] + d[1] * Lv], ib = [ob[0] + n[0] * hemW, ob[1] + n[1] * hemW];
    var puff = o.sleeve === 'puff', outer = puff ? bez(sp, [sp[0] + d[0] * Lv * .5 + 3.5 * Math.cos(th), sp[1] + d[1] * Lv * .5 - 3.5 * Math.sin(th)], ob) : [sp, ob], inner = puff ? bez(ib, [ua[0] + (ib[0] - ua[0]) * .5 - 2, ua[1] + (ib[1] - ua[1]) * .5 + 1], ua) : [ib, ua];
    [1, -1].forEach(function (sg) { function S(p) { return sg > 0 ? p : mir(p); }
      D.shape(S(outer.concat([ib]).concat(inner.slice(1))));
      if (cH) { var o2 = [ob[0] - d[0] * cH, ob[1] - d[1] * cH], i2 = [ib[0] - d[0] * cH, ib[1] - d[1] * cH]; D.shape(S([o2, ob, ib, i2])); if (cuff && cuff.comp === 'Cuff' && !back) D.dot(S([[ob[0] + (ib[0] - ob[0]) * .2 - d[0] * cH / 2, ob[1] + (ib[1] - ob[1]) * .2 - d[1] * cH / 2]])[0], .45); }
      if (puff) for (var g = 1; g <= 3; g++) { var t = g / 4, a = [sp[0] + (ua[0] - sp[0]) * t, sp[1] + (ua[1] - sp[1]) * t]; D.line(S([a, [a[0] + d[0] * 2.2, a[1] + d[1] * 2.2]]), 'th'); }
    });
  }
  function neckline(D, pc, r, o, back, yoke) {
    var nk = yoke ? yoke.edges[1].p.slice().reverse() : pc.edges[5] ? pc.edges[5].p : null; if (!nk) return; var hp = nk[0], cf = nk[nk.length - 1], has = function (id) { return !!by(r, id); }, band = by(r, 'band'), col = by(r, 'collar');
    var sym = function (p, cls) { D.shape(mir(p), cls); D.shape(p, cls); };
    if (band) { var h = col ? 3.2 : 3.6, up = nk.map(function (q, i) { var t = i / (nk.length - 1); return [q[0], q[1] - h * (1 - t * .15)]; }); sym(nk.concat(up.reverse())); }
    if (col && col.comp === 'Collar') { if (!back) sym([[hp[0] + .2, hp[1] - 3.2], [hp[0] + 2.6, 2], [Math.max(3, cf[0] + 3.5), cf[1] + 3.8], [Math.max(.3, cf[0] + .4), cf[1] - 1.2]]); else D.shape([[-hp[0] - .4, -3.4], [hp[0] + .4, -3.4], [hp[0] + 1.2, 2.4], [-hp[0] - 1.2, 2.4]]); }
    if (col && col.comp === 'Camp collar') { if (!back) sym([[hp[0] - .2, hp[1] - 1.2], [hp[0] + 3.2, 3.2], [4, cf[1] + 5.5], [.3, cf[1] + 1]]); else D.shape([[-hp[0] - .5, -1.4], [hp[0] + .5, -1.4], [hp[0] + 2.5, 5.5], [-hp[0] - 2.5, 5.5]]); }
    if (col && col.comp === 'Peter Pan collar') { var c = [0, cf[1] * .35], out = nk.map(function (q) { var v = [q[0] - c[0], q[1] - c[1]], l = Math.hypot(v[0], v[1]) || 1; return [q[0] + v[0] / l * 6, q[1] + v[1] / l * 6]; }); if (!back) sym(nk.concat(out.reverse())); else D.shape(mir(nk).reverse().concat(nk).concat(out.slice().reverse()).concat(mir(out))); }
    if (has('neckrib')) { var rib = nk.map(function (q) { return [q[0] * .97, q[1] + 1.8]; }); sym(nk.concat(rib.reverse())); }
    if (has('hood')) { var hx = hp[0]; if (back) D.shape([[-hx - .5, 0]].concat(bez([-hx - .5, 0], [-hx - 6, -26], [0, -30])).concat(bez([0, -30], [hx + 6, -26], [hx + .5, 0]).slice(1)));
      else sym(bez([hx + .8, 1], [hx + 4.5, -14], [0, -27]).concat(bez([0, -23], [hx - 1, -12], [hx - 2, 0.6]))); }
  }
  function torsoView(D, r, o, gid, back) {
    var pc = by(r, back ? 'back' : 'front'); if (!pc) return; var yoke = back ? by(r, 'yoke') : null, sl = by(r, 'sleeve');
    sleeves(D, yoke ? { edges: [0, 0, 0, { p: [pc.edges[3].p[0], yoke.edges[3].p[0]] }] } : pc, sl, r, o, back);
    var out = PM.outline(pc), side = pc.edges[2].p, hemPt = side[0], Lh = Math.max.apply(null, out.map(function (q) { return q[1]; })), wx = Math.abs(hemPt[0]);
    if (gid === 'dress' && by(r, 'skirt')) { var sk = by(r, 'skirt'), Hs = Math.max.apply(null, PM.outline(sk).map(function (q) { return q[1]; })), y0 = Lh;
      [1, -1].forEach(function (sg) { var p = [[0, y0], [wx, y0], [wx * 1.75, y0 + Hs - 1.5]].concat(bez([wx * 1.75, y0 + Hs - 1.5], [wx * .9, y0 + Hs + .8], [0, y0 + Hs])); D.shape(sg > 0 ? p : mir(p)); for (var g = 1; g < 5; g++) { var x = wx * g / 5; D.line(sg > 0 ? [[x, y0], [x * 1.75, y0 + Hs * .9]] : mir([[x, y0], [x * 1.75, y0 + Hs * .9]]), 'th'); } }); }
    if (gid === 'top' && by(r, 'peplum')) [1, -1].forEach(function (sg) { var p = [[0, Lh], [wx, Lh], [wx * 1.5, Lh + 17]].concat(bez([wx * 1.5, Lh + 17], [wx * .8, Lh + 18.5], [0, Lh + 18])); D.shape(sg > 0 ? p : mir(p)); D.line(sg > 0 ? [[wx * .5, Lh], [wx * .78, Lh + 17]] : mir([[wx * .5, Lh], [wx * .78, Lh + 17]]), 'th'); });
    if (yoke) { half(D, pc); half(D, yoke); } else half(D, pc);
    var hb = by(r, 'hemband'); if (hb) [1, -1].forEach(function (sg) { var p = [[0, Lh], [wx, Lh], [wx * .93, Lh + 6.5], [0, Lh + 6.5]]; D.shape(sg > 0 ? p : mir(p)); });
    neckline(D, pc, r, o, back, yoke);
    if (!back) {
      var pk = by(r, 'pocket'), n = +o.pockets || (pk ? 1 : 0), ua = pc.edges[3].p[0];
      if (pk && pk.comp === 'Kangaroo pocket') { var ko = PM.outline(pk), kh = Math.max.apply(null, ko.map(function (q) { return q[1]; })), ky = Lh - kh - 1.5; D.shape(mv(ko, 0, ky)); D.shape(mir(mv(ko, 0, ky))); }
      else if (pk) { var po = PM.outline(pk), pw = Math.max.apply(null, po.map(function (q) { return q[0]; })); [1, -1].slice(0, Math.min(2, n)).forEach(function (sg) { var q = mv(po, wx * .3, ua[1] - 2); D.shape(sg > 0 ? q : mir(q)); }); }
      var welt = by(r, 'welt'); if (welt) [1, -1].slice(0, Math.min(2, n || 2)).forEach(function (sg) { var y = Lh * .72; D.line(sg > 0 ? [[wx * .3, y], [wx * .3 + 12, y - 1.2]] : mir([[wx * .3, y], [wx * .3 + 12, y - 1.2]])); });
    }
  }
  function skirtView(D, r, o, m, back) {
    var pc = by(r, back ? 'sk-back' : 'sk-front'), wb = by(r, 'waistband'), ws;
    if (pc) { half(D, pc); ws = Math.abs(pc.edges[1].p[pc.edges[1].p.length - 1][0]); }
    else { var wq = (m.waist + 2.5) / 4, L = +o.slen2 || 65, ty = o.skirt || 'panels', fr = +o.circle || 1, hw = ty === 'circle' ? wq + L * (fr >= 1 ? 1 : fr >= .5 ? .62 : .36) : ty === 'gathered' ? wq * 2.1 : wq + L * .7; ws = wq;
      [1, -1].forEach(function (sg) { var p = [[0, 0], [wq, 0], [hw, L - 2]].concat(bez([hw, L - 2], [hw * .5, L + 1.5], [0, L])); D.shape(sg > 0 ? p : mir(p)); var k = ty === 'panels' ? Math.min(4, Math.round((+o.panels || 8) / 3)) : 3;
        for (var g = 1; g <= k; g++) { var t = g / (k + 1), a = [[wq * t, 0], [hw * t, L - .5]]; if (ty !== 'panels' || g < k + 1) D.line(sg > 0 ? a : mir(a), ty === 'panels' ? '' : 'th'); } if (ty === 'gathered') for (var z = 1; z < 7; z++) D.line(sg > 0 ? [[wq * z / 7, 0], [wq * z / 7 * 1.1, 3]] : mir([[wq * z / 7, 0], [wq * z / 7 * 1.1, 3]]), 'th'); }); }
    if (wb) D.shape([[-ws, -4], [ws, -4], [ws, 0], [-ws, 0]]);
  }
  function trouserView(D, r, o, back) {
    var pc = by(r, back ? 'tr-back' : 'tr-front'); if (!pc) return; var E = pc.edges, ctop = E[0].p[E[0].p.length - 1], stop = E[0].p[0], hw = E[1].p[3][0], cpt = E[1].p[E[1].p.length - 1], cy = cpt[1], cext = cpt[0] - hw, crease = pc.grain[0][0], k = hw / (hw + cext);
    function m1(q) { return [hw - q[0], q[1]]; } function m2(q) { return [hw / 2 - (q[0] - crease) * k, q[1]]; }
    var leg = [m1(stop), [0, ctop[1]], [0, cy]].concat(E[2].p.map(m2)).concat(E[3].p.map(m2)).concat(E[4].p.map(function (q) { return q[1] > cy ? m2(q) : m1(q); }));
    D.shape(mir(leg)); D.shape(leg);
    pc.marks.forEach(function (mk) { if (mk.t === 'dart') { var q = mk.p.map(m1); D.line(q, 'th'); D.line(mir(q), 'th'); } });
    var top = ctop[1], ws = hw - stop[0];
    if (o.wtype !== 'elastic' && by(r, 'waistband')) D.shape([[-ws, top - 4], [ws, top - 4], [ws, top], [-ws, top]]);
    else for (var g = -5; g <= 5; g++) D.line([[g * ws / 6, top], [g * ws / 6 + .3, top + 2.6]], 'th');
    if (!back && o.wtype !== 'elastic') D.line([[0, top + 1]].concat(bez([3.4, top + 1], [3.4, cy * .72], [0, cy * .86]).slice(0)), 'th');
    if (back && o.wtype !== 'elastic') [1, -1].forEach(function (sg) { var a = [[hw * .3, top + 7], [hw * .3 + 11, top + 7]]; D.line(sg > 0 ? a : mir(a)); });
    if (+o.cargo) { var x1 = hw - 1.5, y1 = cy + 9; D.shape([[x1 - 13, y1], [x1, y1], [x1, y1 + 15], [x1 - 13, y1 + 15]]); D.line([[x1 - 13, y1 + 4], [x1, y1 + 4]], 'th'); }
    var cf = by(r, 'cuff'); if (cf) { var lo = Math.max.apply(null, leg.map(function (q) { return q[1]; })), a = m2(E[3].p[0]), b = m2(E[3].p[E[3].p.length - 1]); [1, -1].forEach(function (sg) { var p = [[a[0], lo], [b[0], lo], [b[0] - .4, lo + 7], [a[0] + .4, lo + 7]]; D.shape(sg > 0 ? p : mir(p)); }); }
  }
  V.flat = function (r, o, gid, m) {
    var F = new Dr(), Bk = new Dr();
    if (gid === 'trousers') { trouserView(F, r, o, false); trouserView(Bk, r, o, true); }
    else if (gid === 'skirt' || gid === 'lehenga') { skirtView(F, r, o, m, false); skirtView(Bk, r, o, m, true); }
    else { torsoView(F, r, o, gid, false); torsoView(Bk, r, o, gid, true); }
    function bb(p) { var a = [1e9, 1e9, -1e9, -1e9]; p.forEach(function (q) { a[0] = Math.min(a[0], q[0]); a[1] = Math.min(a[1], q[1]); a[2] = Math.max(a[2], q[0]); a[3] = Math.max(a[3], q[1]); }); return a; }
    var bf = bb(F.pts), bk = bb(Bk.pts), gap = Math.max(6, (bf[2] - bf[0]) * .16), dx = bf[2] - bk[0] + gap, H = Math.max(bf[3], bk[3]) - Math.min(bf[1], bk[1]), W = bf[2] - bf[0] + gap + (bk[2] - bk[0]), pad = Math.max(W, H) * .07, y0 = Math.min(bf[1], bk[1]);
    var lab = H * .065;
    return '<svg viewBox="' + f2(bf[0] - pad) + ' ' + f2(y0 - pad) + ' ' + f2(W + pad * 2) + ' ' + f2(H + pad * 2 + lab * 1.8) + '" role="img" aria-label="Garment preview, front and back">'
      + '<g>' + F.svg() + '</g><g transform="translate(' + f2(dx) + ' 0)">' + Bk.svg() + '</g>'
      + '<text x="' + f2((bf[0] + bf[2]) / 2) + '" y="' + f2(y0 + H + pad * .6 + lab) + '" text-anchor="middle" font-size="' + f2(lab) + '">FRONT</text><text x="' + f2(dx + (bk[0] + bk[2]) / 2) + '" y="' + f2(y0 + H + pad * .6 + lab) + '" text-anchor="middle" font-size="' + f2(lab) + '">BACK</text></svg>';
  };

  /* ---------- automatic checks ---------- */
  V.checks = function (r, S, U, gid) {
    var I = r.info, u = ' ' + S.unit, c = [], G = PM.GARMENTS[gid], o = S.o;
    function add(ok, t, v, why) { c.push({ ok: ok, t: t, v: v, why: why }); }
    var gap = 0; r.pieces.forEach(function (p) { for (var i = 0; i < p.edges.length; i++) { var a = p.edges[i].p, b = p.edges[(i + 1) % p.edges.length].p; gap = Math.max(gap, Math.hypot(a[a.length - 1][0] - b[0][0], a[a.length - 1][1] - b[0][1])); } });
    add(gap < .05, 'All piece outlines are closed', r.pieces.length + ' pieces', 'Every cutting line joins up, so the pieces cut and plot cleanly.');
    if (I['Side seams, front minus back (darts closed)'] !== undefined) { var sd = I['Side seams, front minus back (darts closed)']; add(Math.abs(sd) <= .5, 'Front and back side seams match', (sd >= 0 ? '+' : '') + U(sd) + u, 'With darts closed, the side seams must be the same length (within 0.5 cm).'); }
    if (I['Sleeve cap ease'] !== undefined) { var ce = I['Sleeve cap ease'], sty = o.sleeve || G.d.sleeve, rg = sty === 'tee' || +o.drop || gid === 'hoodie' ? [-.6, .6] : sty === 'shirt' ? [.8, 2.2] : sty === 'puff' ? [3, 99] : G.d.fit === 'fitted' ? [2.4, 4.2] : [1.4, 3.5];
      add(ce >= rg[0] && ce <= rg[1], 'Sleeve cap fits the armhole', U(ce) + u + ' ease', sty === 'puff' ? 'Extra cap length is gathered between the notches.' : 'Target ' + U(rg[0]) + ' to ' + U(rg[1]) + u + ' of ease for this sleeve type, eased in between the notches.'); }
    if (I['Crotch-level width, front + back (thigh + fit ease)'] !== undefined) { var need = S.m.thigh + ({ trouser: 9, slack: 5.7, jean: 3.2 }[o.pfit] || 9) * (S.gender === 'kids' ? .6 : 1) - .05, have = I['Crotch-level width, front + back (thigh + fit ease)'];
      add(have >= need, 'Room through the thigh', U(have - S.m.thigh) + u + ' over thigh', 'Width at crotch level must exceed the thigh by the minimum for a ' + (o.pfit || 'trouser') + ' fit.'); }
    if (I['Inseam back minus front'] !== undefined) { var iv = I['Inseam back minus front']; add(iv <= .05 && iv >= -1.2, 'Inseams walked', U(iv) + u, 'The back inseam is a little shorter than the front and is stretched to fit in sewing.'); }
    if (gid === 'skirt' && (o.skirt === 'straight' || o.skirt === 'aline')) { var tot = 0, dar = 0; r.pieces.forEach(function (p) { if (!/^sk-/.test(p.id)) return; tot += PM.plen(p.edges[1].p) * 2; p.marks.forEach(function (k) { if (k.t === 'dart') dar += Math.hypot(k.p[2][0] - k.p[0][0], k.p[2][1] - k.p[0][1]) * 2; }); });
      var fin = tot - dar, want = S.m.waist + 2.5; add(Math.abs(fin - want) <= 1.5, 'Skirt waist fits the waistband', U(fin) + u, 'Waist seam with darts closed should equal waist + ease (' + U(want) + u + ').'); }
    return c;
  };

  /* ---------- rulers ---------- */
  V.ruler = function (cv, horiz, o0, ppc, unit, mark) { // o0: screen px of sheet origin along the axis, ppc: px per cm
    var dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    var x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h); x.fillStyle = '#212428'; x.fillRect(0, 0, w, h);
    var uc = unit === 'in' ? 2.54 : unit === 'mm' ? .1 : 1, ppu = ppc * uc, steps = unit === 'in' ? [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2, 6, 12, 24] : [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000].map(function (s) { return unit === 'mm' ? s : s / 10; });
    var minor = steps.filter(function (s) { return s * ppu >= 6; })[0] || steps[steps.length - 1], major = steps.filter(function (s) { return s * ppu >= 54 && s >= minor; })[0] || steps[steps.length - 1];
    var L = horiz ? w : h, v0 = Math.floor((0 - o0) / ppu / minor) * minor, v1 = (L - o0) / ppu;
    x.strokeStyle = '#596069'; x.fillStyle = '#9da3aa'; x.font = '9px ui-monospace,Menlo,monospace'; x.lineWidth = 1; x.beginPath();
    for (var v = v0; v <= v1; v += minor) { var p = Math.round(o0 + v * ppu) + .5, isM = Math.abs(v / major - Math.round(v / major)) < 1e-6, half = !isM && Math.abs(v / (major / 2) - Math.round(v / (major / 2))) < 1e-6, len = isM ? 12 : half ? 7 : 4;
      if (horiz) { x.moveTo(p, h); x.lineTo(p, h - len); } else { x.moveTo(w, p); x.lineTo(w - len, p); }
      if (isM) { var t = String(+v.toFixed(3)); if (horiz) x.fillText(t, p + 3, 9); else { x.save(); x.translate(9, p + 3); x.rotate(-Math.PI / 2); x.textAlign = 'right'; x.fillText(t, 0, 0); x.restore(); } } }
    x.stroke();
    if (mark !== null && mark !== undefined) { x.strokeStyle = '#e08a5e'; x.beginPath(); if (horiz) { x.moveTo(mark + .5, 0); x.lineTo(mark + .5, h); } else { x.moveTo(0, mark + .5); x.lineTo(w, mark + .5); } x.stroke(); }
  };
})();
