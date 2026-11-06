/* Forecut pattern blocks: kurta/tunic (front, back, sleeve) and straight/A-line skirt (front, back).
   All geometry in centimetres (1 SVG unit = 1 cm). Simplified drafting for first toiles: always test in calico. */
(function () {
  var $ = FC.$, $$ = FC.$$, n = FC.num, NS = 'http://www.w3.org/2000/svg';
  var SIZES = { S: [86, 70, 94, 36, 39], M: [91, 75, 99, 37, 40], L: [97, 81, 104, 38, 41], XL: [102, 86, 109, 39.5, 41.5], XXL: [108, 92, 115, 41, 42] };
  var st = FC.load('pattern') || {};
  $$('#pb input, #pb select').forEach(function (e) { if (st[e.id] !== undefined) { if (e.type === 'checkbox') e.checked = st[e.id]; else e.value = st[e.id]; } });

  function P(x, y) { return { x: x, y: y }; }
  function bz(a, b, c, d, t) { var u = 1 - t; return P(u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x, u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y); }
  function blen(a, b, c, d) { var L = 0, p = a; for (var i = 1; i <= 60; i++) { var q = bz(a, b, c, d, i / 60); L += Math.hypot(q.x - p.x, q.y - p.y); p = q; } return L; }
  function f(v) { return (Math.round(v * 100) / 100).toString(); }
  function M(p) { return 'M' + f(p.x) + ' ' + f(p.y); } function Lt(p) { return 'L' + f(p.x) + ' ' + f(p.y); }
  function C(b, c, d) { return 'C' + f(b.x) + ' ' + f(b.y) + ' ' + f(c.x) + ' ' + f(c.y) + ' ' + f(d.x) + ' ' + f(d.y); }

  /* ---------- kurta ---------- */
  function kurta(m) {
    var ease = m.ease, Bq = (m.bust + ease) / 4, Wq = (m.waist + ease) / 4, Hq = (m.hip + ease) / 4, hs = m.shoulder / 2;
    var Ad = m.ad, Wy = m.nw, Hy = m.nw + 20, L = m.len, NE = { round: [7.5, 9, 2.5], deep: [8, 13, 2.5], v: [7.5, 17, 2.5], boat: [11, 5, 2], band: [7, 8, 2.2] }[m.neck];
    var pieces = [], AH = 0;
    ['Front', 'Back'].forEach(function (nm, k) {
      var front = k === 0, slope = front ? 4.5 : 4, nd = front ? NE[1] : NE[2], nw = NE[0];
      var sh = P(hs, slope), hp = P(nw, 0), ua = P(Bq, Ad), cx = front ? hs - 1.5 : hs - .8, ch = P(cx, slope + (Ad - slope) * .62);
      var a1 = [sh, P(hs - .3, slope + (ch.y - slope) * .45), P(cx, ch.y - 3), ch], a2 = [ch, P(cx, ch.y + 3), P(cx + (Bq - cx) * .35, Ad), ua];
      AH += blen.apply(null, a1) + blen.apply(null, a2);
      var shaped = m.shape === 'shaped', hx = shaped ? Hq : Math.max(Hq, Bq), hem = P(hx + m.flare, L);
      var up = shaped ? Lt(P(Hq, Hy)) + C(P(Hq, Hy - 8), P(Wq, Wy + 7), P(Wq, Wy)) + C(P(Wq, Wy - 6), P(Bq, Ad + (Wy - Ad) * .5), ua)
                      : Lt(P(hx, Hy)) + Lt(P(hx, Ad + 2)) + Lt(ua);
      var kn = front ? (m.neck === 'boat' ? .4 : .55) : .6;
      var neck = (front && m.neck === 'v') ? Lt(P(0, nd)) : C(P(nw, nd * kn), P(nw * (front ? .55 : .5), nd), P(0, nd));
      var d = M(P(0, nd)) + Lt(P(0, L)) + Lt(hem) + up + C(a2[2], a2[1], ch) + C(a1[2], a1[1], sh) + Lt(hp) + neck + 'Z';
      var marks = [];
      if (m.slit > 0) marks.push({ t: 'notch', x: hem.x, y: L - m.slit, lab: 'slit' });
      marks.push({ t: 'line', d: 'M0 ' + f(Wy) + 'H' + f(shaped ? Wq : hx), lab: 'waist' }, { t: 'line', d: 'M0 ' + f(Hy) + 'H' + f(shaped ? Hq : hx), lab: 'hip' });
      pieces.push({ name: nm, cut: 'Cut 1 on fold', d: d, w: hem.x + 1, h: L, fold: true, ft: nd, grain: [P(hx * .5, 12), P(hx * .5, L - 12)], marks: marks });
    });
    // sleeve: solve cap height so the cap seam matches the armhole (+1 cm ease)
    var bw = (m.bicep + m.sease) / 2, SL = m.slen, hw = m.cuff / 2, target = AH + 1, lo = 2, hi = 30, CH = 12;
    function capLen(ch) { var a = P(-bw, ch), t = P(0, 0); return 2 * blen(a, P(-bw * .55, ch * .92), P(-bw * .42, 0), t); }
    for (var i = 0; i < 40; i++) { CH = (lo + hi) / 2; if (capLen(CH) < target) lo = CH; else hi = CH; }
    var ok = Math.abs(capLen(CH) - target) < 1;
    var sd = M(P(-bw, CH)) + C(P(-bw * .55, CH * .92), P(-bw * .42, 0), P(0, 0)) + C(P(bw * .42, 0), P(bw * .55, CH * .92), P(bw, CH)) + Lt(P(hw, CH + SL)) + Lt(P(-hw, CH + SL)) + 'Z';
    pieces.push({ name: 'Sleeve', cut: 'Cut 2 (pair)', d: sd, w: bw * 2 + 1, h: CH + SL, ox: bw, grain: [P(0, CH + 4), P(0, CH + SL - 6)], marks: [{ t: 'line', d: 'M' + f(-bw) + ' ' + f(CH) + 'H' + f(bw), lab: 'bicep' }] });
    return { pieces: pieces, info: [['Armhole (front + back)', FC.fmt(AH, 1) + ' cm'], ['Sleeve cap seam', FC.fmt(capLen(CH), 1) + ' cm (' + (ok ? '+1 cm ease' : 'check: adjust bicep ease') + ')'], ['Cap height', FC.fmt(CH, 1) + ' cm'], ['Finished bust', FC.fmt(m.bust + ease, 0) + ' cm'], ['Finished hip', FC.fmt(Math.max(m.hip + ease, m.shape === 'shaped' ? 0 : m.bust + ease), 0) + ' cm'], ['Hem width (front + back)', FC.fmt(4 * (Math.max(Hq, m.shape === 'shaped' ? Hq : Bq) + m.flare), 0) + ' cm']] };
  }

  /* ---------- skirt ---------- */
  function skirt(m) {
    var pieces = [], D = m.hd, L = m.slen2, fl = m.aline;
    ['Front', 'Back'].forEach(function (nm, k) {
      var front = k === 0, hq = (m.hip + 4) / 4 + (front ? .5 : -.5), wq = (m.waist + 1) / 4 + (front ? .5 : -.5), ex = hq - wq;
      var dart = Math.max(0, Math.min(ex * (front ? .4 : .55), front ? 3 : 4)), sideIn = ex - dart, dl = front ? 9 : 14, y0 = front ? 0 : 1;
      var ws = P(hq - sideIn, -1.25), hipS = P(hq, D), hem = P(hq + fl, L - fl * .15), xd = (hq - sideIn) * (front ? .5 : .5);
      var l1 = P(xd - dart / 2, y0 * .5), l2 = P(xd + dart / 2, y0 * .5 - .25), ap = P(xd, dl);
      var d = M(P(0, y0)) + Lt(P(0, L)) + C(P((hq + fl) * .5, L), P((hq + fl) * .8, L - fl * .05), hem) + Lt(hipS) +
        C(P(hq, D * .6), P(hq - sideIn * .1, D * .3), ws) + C(P((hq - sideIn) * .8, -1), P(l2.x + 2, l2.y), l2) + (dart > 0 ? Lt(ap) + Lt(l1) : '') + C(P(l1.x - 2, l1.y), P(2, y0), P(0, y0)) + 'Z';
      pieces.push({ name: nm, cut: front ? 'Cut 1 on fold' : 'Cut 2 (zip at centre back)', d: d, w: hq + fl + 1, h: L, fold: front, y0: -1.5,
        grain: [P(hq * .45, D + 4), P(hq * .45, L - 8)], marks: [{ t: 'line', d: 'M0 ' + f(D) + 'H' + f(hq), lab: 'hip' }].concat(dart > 0 ? [{ t: 'dart', x: xd, y: dl }] : []) });
    });
    return { pieces: pieces, info: [['Finished waist', FC.fmt(m.waist + 1, 0) + ' cm'], ['Finished hip', FC.fmt(m.hip + 4, 0) + ' cm'], ['Hem circumference', FC.fmt(4 * ((m.hip + 4) / 4 + fl), 0) + ' cm'], ['Front dart / back dart', 'up to 3 cm × 9 cm / 4 cm × 14 cm']] };
  }

  /* ---------- render ---------- */
  function read() {
    var m = {}; $$('#pb input, #pb select').forEach(function (e) { m[e.id.replace('p-', '')] = e.type === 'number' ? n(e) : e.type === 'checkbox' ? e.checked : (e.value !== '' && isFinite(+e.value) ? +e.value : e.value); st[e.id] = e.type === 'checkbox' ? e.checked : e.value; });
    m.grid = $('#p-grid').checked; FC.save('pattern', st); return m;
  }
  function draw() {
    var m = read(), blk = m.block === 'skirt' ? skirt(m) : kurta(m), sa = m.sa, gap = 6 + sa * 2, x = sa + 2, H = 0, body = '', defs = '', boxes = [[0, H, 7, 0]];
    $('#p-kurta').hidden = m.block === 'skirt'; $('#p-skirt').hidden = m.block !== 'skirt';
    blk.pieces.forEach(function (p, i) {
      var ox = x + (p.ox || 0), oy = (p.y0 ? -p.y0 : 0) + sa + 4, id = 'pc' + i;
      var g = '<g transform="translate(' + f(ox) + ' ' + f(oy) + ')"><path id="' + id + '" d="' + p.d + '" fill="none"/>';
      if (sa > 0) g += '<use href="#' + id + '" stroke="#1c1714" stroke-width="' + f(sa * 2 + .08) + '" stroke-linejoin="round"/><use href="#' + id + '" stroke="#f3e1d6" stroke-width="' + f(sa * 2 - .04) + '" stroke-linejoin="round"/>' +
        (p.fold ? '<rect x="' + f(-sa - .6) + '" y="' + f(-sa - 3) + '" width="' + f(sa + .6) + '" height="' + f(p.h + 2 * sa + 6) + '" fill="#fff"/>' : '');
      g += '<use href="#' + id + '" fill="#fffcf7" stroke="#1c1714" stroke-width=".12" stroke-linejoin="round"/>';
      if (p.fold) g += '<path d="M0 ' + f(p.ft || 0) + 'V' + f(p.h) + '" stroke="#a9481f" stroke-width=".18" stroke-dasharray="1 .6"/><text x=".6" y="' + f(p.h * .62) + '" transform="rotate(-90 .6 ' + f(p.h * .62) + ')" font-size="1.4" fill="#a9481f" font-family="DM Sans,sans-serif" text-anchor="middle" dy="1.2">PLACE ON FOLD</text>';
      p.marks.forEach(function (k) {
        if (k.t === 'line') g += '<path d="' + k.d + '" stroke="#6e6259" stroke-width=".06" stroke-dasharray=".6 .4"/>';
        if (k.t === 'notch') g += '<path d="M' + f(k.x - .8) + ' ' + f(k.y) + 'h1.6" stroke="#1c1714" stroke-width=".15"/><text x="' + f(k.x - 1.2) + '" y="' + f(k.y - .4) + '" font-size="1.1" text-anchor="end" font-family="DM Sans,sans-serif" fill="#6e6259">slit opens</text>';
        if (k.t === 'dart') g += '<circle cx="' + f(k.x) + '" cy="' + f(k.y) + '" r=".25" fill="#1c1714"/>';
      });
      var gr = p.grain; g += '<path d="M' + f(gr[0].x) + ' ' + f(gr[0].y) + 'L' + f(gr[1].x) + ' ' + f(gr[1].y) + '" stroke="#1f3d33" stroke-width=".12" marker-start="url(#ar)" marker-end="url(#ar)"/>';
      var tx = gr[0].x + 1, ty = (gr[0].y + gr[1].y) / 2;
      g += '<text x="' + f(tx) + '" y="' + f(ty) + '" font-family="DM Sans,sans-serif" fill="#1c1714"><tspan font-size="2.4" font-weight="700">' + p.name.toUpperCase() + '</tspan><tspan x="' + f(tx) + '" dy="2.4" font-size="1.4">' + p.cut + '</tspan><tspan x="' + f(tx) + '" dy="1.9" font-size="1.2" fill="#6e6259">' + (m.block === 'skirt' ? 'Skirt' : 'Kurta') + ' block · SA ' + sa + ' cm · forecut.in</tspan></text></g>';
      body += g; boxes.push([ox - (p.ox || 0) - sa - .5, oy - sa - (p.y0 ? 2 : .5) - 1.5, ox - (p.ox || 0) + p.w + sa, oy + p.h + sa + .5]); x += p.w + (p.ox || 0) + gap; H = Math.max(H, p.h + oy + sa + 3);
    });
    var W = x - gap + sa + 2;
    var grid = m.grid ? '<g stroke="#e3d9cc" stroke-width=".04">' + Array.from({ length: Math.ceil(W) + 1 }, function (_, i) { return '<path d="M' + i + ' 0V' + f(H) + '"' + (i % 5 ? '' : ' stroke="#cbbfae" stroke-width=".08"') + '/>'; }).join('') + Array.from({ length: Math.ceil(H) + 1 }, function (_, i) { return '<path d="M0 ' + i + 'H' + f(W) + '"' + (i % 5 ? '' : ' stroke="#cbbfae" stroke-width=".08"') + '/>'; }).join('') + '</g>' : '';
    var test = '<g transform="translate(1 ' + f(H - 6) + ')"><rect width="5" height="5" fill="none" stroke="#1c1714" stroke-width=".08"/><text x="2.5" y="2.9" font-size=".9" text-anchor="middle" font-family="DM Sans,sans-serif">5 cm</text></g>';
    var mk = '<marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#1f3d33"/></marker>';
    var svg = '<svg xmlns="' + NS + '" viewBox="0 0 ' + f(W) + ' ' + f(H) + '" width="' + f(W) + 'cm" height="' + f(H) + 'cm" font-family="DM Sans,sans-serif"><defs>' + mk + defs + '</defs><rect width="100%" height="100%" fill="#fff"/>' + grid + body + test + '</svg>';
    $('#p-svg').innerHTML = svg; var s = $('#p-svg svg'); s.removeAttribute('width'); s.removeAttribute('height');
    s.setAttribute('role', 'img'); s.setAttribute('aria-label', 'Pattern pieces: ' + blk.pieces.map(function (p) { return p.name; }).join(', '));
    $('#p-info').innerHTML = blk.info.map(function (r) { return '<div><span>' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join('') + '<div><span>Sheet size</span><b>' + FC.fmt(W, 0) + ' × ' + FC.fmt(H, 0) + ' cm</b></div>';
    boxes[0] = [0, H - 7, 7, H]; window.__pat = { svg: svg, W: W, H: H, name: m.block, boxes: boxes };
  }
  $$('#pb input, #pb select').forEach(function (e) { e.addEventListener('input', draw); e.addEventListener('change', draw); });
  $('#p-size').addEventListener('change', function () {
    var s = SIZES[this.value]; if (!s) return; ['bust', 'waist', 'hip', 'shoulder', 'nw'].forEach(function (k, i) { $('#p-' + k).value = s[i]; });
    $('#p-ad').value = Math.round((s[0] / 10 + 12) * 2) / 2; draw();
  });
  $('#p-dl').addEventListener('click', function () { FC.download('forecut-' + window.__pat.name + '-block.svg', window.__pat.svg, 'image/svg+xml'); });
  $('#p-print').addEventListener('click', function () {
    var p = window.__pat, tw = 19, th = 26, cols = Math.ceil(p.W / tw), rows = Math.ceil(p.H / th), out = '';
    var inner = p.svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var lab = String.fromCharCode(65 + r) + (c + 1);
      if (!p.boxes.some(function (b) { return b[0] < (c + 1) * tw && b[2] > c * tw && b[1] < (r + 1) * th && b[3] > r * th; })) continue;
      out += '<div class="tile"><svg xmlns="' + NS + '" width="19cm" height="26cm" viewBox="' + (c * tw) + ' ' + (r * th) + ' ' + tw + ' ' + th + '">' + inner +
        '<rect x="' + (c * tw) + '" y="' + (r * th) + '" width="' + tw + '" height="' + th + '" fill="none" stroke="#a9481f" stroke-width=".05" stroke-dasharray=".5 .5"/>' +
        '<text x="' + (c * tw + .6) + '" y="' + (r * th + 1.4) + '" font-size="1.2" font-weight="700" fill="#a9481f">' + lab + '</text></svg>' +
        '<p>Tile ' + lab + ' (rows A, B, C… top to bottom; columns 1, 2, 3… left to right; blank tiles are skipped). Print at 100% / actual size, check the 5 cm square, then tape tiles edge to edge.</p></div>';
    }
    $('#p-tiles').innerHTML = out; document.body.classList.add('pt'); window.print(); setTimeout(function () { document.body.classList.remove('pt'); }, 1000);
  });
  draw();
})();
