/* Forecut pattern maker: costing.
   PMC.items()  - cut list from the drafted pieces (quantities, fold pieces unfolded, pairs mirrored, material per piece)
   PMC.marker() - automatic marker on a fabric width (skyline nesting on a 0.5 cm grid, grain kept along the length)
   PMC.cost()   - fabric, trims, making, overheads, margins and MRP with the Indian GST band for garments */
(function () {
  var C = window.PMC = {}, PM = window.PM;
  var SMV = { anarkali: 40, angrakha: 30, sherwani: 60, bandhgala: 50, salwar: 14, patiala: 18, churidar: 14, gharara: 22, bodice: 10, kurta: 18, shirt: 22, tshirt: 9, hoodie: 16, blouse: 20, top: 12, dress: 20, jacket: 34, skirt: 12, lehenga: 32, trousers: 20, blazer: 75, coat: 85, bomber: 38, jeans: 26, jumpsuit: 32, shirtdress: 30, polo: 14, tank: 7 };
  C.SMV = SMV;
  function area(p) { var a = 0; for (var i = 0, n = p.length; i < n; i++) { var q = p[i], r = p[(i + 1) % n]; a += q[0] * r[1] - r[0] * q[1]; } return Math.abs(a) / 2; }
  function refl(p, a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1; return p.map(function (q) { var t = ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / l2, fx = a[0] + t * dx, fy = a[1] + t * dy; return [2 * fx - q[0], 2 * fy - q[1]]; }); }
  C.area = area;
  // what each piece is cut from, and how many
  C.items = function (r, S) {
    var out = [];
    r.pieces.forEach(function (p) {
      var st = S.pc[p.id] || {}; if (st.on === false) return;
      var sa = st.sa !== undefined ? st.sa : S.sa, ha = st.hem !== undefined ? st.hem : (p.defHem !== undefined ? p.defHem : S.hemA), cut = PM.cutline(p, sa, ha), c = p.cut || 'Cut 1';
      var n = +(c.match(/Cut (\d+)/) || [0, 1])[1], pair = /pair|left and right/i.test(c), mat = /in rib/i.test(c) ? 'rib' : 'main';
      var cutM = null; if (p.bias) { cutM = cut.map(function (q) { return [(q[0] + q[1]) * .7071, (q[1] - q[0]) * .7071]; }); cut = cut.map(function (q) { return [(q[0] - q[1]) * .7071, (q[0] + q[1]) * .7071]; }); } // bias pieces at 45°; mirrored copies turned the other way so all strips lie parallel
      var fold = p.edges.filter(function (e) { return e.t === 'fold'; })[0], polys = [cut];
      if (fold && /on fold/i.test(c)) { var a = fold.p[0], b = fold.p[fold.p.length - 1]; polys = [cut, refl(cut, a, b)]; }
      var one = { id: p.id, name: st.name || p.auto, comp: p.comp, polys: polys, area: polys.reduce(function (s, q) { return s + area(q); }, 0), mat: mat };
      for (var i = 0; i < n; i++) { var mir = pair && i % 2 === 1; out.push(Object.assign({}, one, { mirror: mir }, mir && cutM ? { polys: [cutM], id: p.id + '-b' } : {})); }
      var lin = (c.match(/\+ ?(\d+)? ?lining/i) || null), fus = (c.match(/\+ ?(\d+)? ?interfacing/i) || null);
      if (lin) for (var j = 0; j < (+lin[1] || n); j++) out.push(Object.assign({}, one, { mat: 'lining', mirror: j % 2 === 1 }));
      if (fus) for (var k = 0; k < (+fus[1] || 1); k++) out.push(Object.assign({}, one, { mat: 'fusing', mirror: k % 2 === 1 }));
      if (/outer and lining/i.test(c)) { out.pop(); out.push(Object.assign({}, one, { mat: 'lining' })); }
    });
    return out;
  };
  // rasterise a piece into per-row spans (rows across the width, cells along the length)
  var G = .5;
  function mask(polys, mirror, rot) {
    var pts = []; polys.forEach(function (p) { pts = pts.concat(p); });
    // marker coords: u along the fabric length = piece y (grain), v across the width = piece x
    function tr(q) { var u = q[1], v = mirror ? -q[0] : q[0]; return rot ? [-u, -v] : [u, v]; }
    var P = polys.map(function (p) { return p.map(tr); }), all = []; P.forEach(function (p) { all = all.concat(p); });
    var u0 = Math.min.apply(null, all.map(function (q) { return q[0]; })), v0 = Math.min.apply(null, all.map(function (q) { return q[1]; })), v1 = Math.max.apply(null, all.map(function (q) { return q[1]; }));
    var rows = Math.max(1, Math.ceil((v1 - v0) / G)), L = [], R = [];
    for (var r = 0; r < rows; r++) {
      var lo = 1e9, hi = -1e9;
      [r * G + .01, (r + .5) * G, (r + 1) * G - .01].forEach(function (vv) { var v = v0 + vv; P.forEach(function (p) { for (var i = 0, n = p.length; i < n; i++) { var a = p[i], b = p[(i + 1) % n]; if ((a[1] - v) * (b[1] - v) <= 0 && a[1] !== b[1]) { var u = a[0] + (b[0] - a[0]) * (v - a[1]) / (b[1] - a[1]); lo = Math.min(lo, u); hi = Math.max(hi, u); } } }); });
      if (lo > hi) { L.push(null); R.push(null); } else { L.push(Math.floor((lo - u0) / G)); R.push(Math.ceil((hi - u0) / G)); }
    }
    return { rows: rows, L: L, R: R, P: P, u0: u0, v0: v0 };
  }
  function marker1(items, widthCm, opt, order, tie) {
    // bottom-left fill on an occupancy map: each row across the width keeps its filled spans along the length,
    // so tapered pieces (kalis, sleeves, trouser legs) can interlock head-to-tail
    opt = opt || {}; var Wc = Math.floor((widthCm - 2 * (opt.selv || 1)) / G), occ = []; for (var i = 0; i < Wc; i++) occ.push([]);
    var list = items.slice().sort(order), placed = [], used = 0, tooWide = [], cache = {};
    function earliest(row, u, Lr, Rr) { var iv = occ[row]; for (var k = 0; k < iv.length; k++) { var a = iv[k][0], b2 = iv[k][1]; if (b2 <= u + Lr) continue; if (a >= u + Rr) break; u = b2 - Lr; } return u; }
    function fit(m, v) { var u = 0, again = true, guard = 0; while (again && guard++ < 400) { again = false; for (var r = 0; r < m.rows; r++) { if (m.L[r] === null) continue; var nu = earliest(v + r, u, m.L[r], m.R[r] + 1); if (nu > u) { u = nu; again = true; } } } return u; }
    function insert(row, a, b2) { var iv = occ[row]; iv.push([a, b2]); iv.sort(function (x, y) { return x[0] - y[0]; }); for (var k = iv.length - 1; k > 0; k--) if (iv[k][0] <= iv[k - 1][1]) { iv[k - 1][1] = Math.max(iv[k - 1][1], iv[k][1]); iv.splice(k, 1); } }
    list.forEach(function (it) {
      var best = null;
      [0, 1].forEach(function (rot) { if (rot && opt.oneWay) return; var key = it.id + (it.mirror ? 'm' : '') + rot + it.mat, m = cache[key] || (cache[key] = mask(it.polys, it.mirror, rot)); if (m.rows > Wc) return;
        var maxR = 0; for (var r0 = 0; r0 < m.rows; r0++) if (m.R[r0] !== null) maxR = Math.max(maxR, m.R[r0]);
        for (var v = 0; v + m.rows <= Wc; v++) { var u = fit(m, v), end = u + maxR;
          var better = !best || (tie ? (u < best.u || (u === best.u && end < best.end)) : (end < best.end - .5 || (Math.abs(end - best.end) <= .5 && (u < best.u || (u === best.u && v < best.v)))));
          if (better) best = { u: u, v: v, end: end, m: m, rot: rot }; } });
      if (!best) { tooWide.push(it.name); return; }
      var m = best.m; for (var r = 0; r < m.rows; r++) if (m.L[r] !== null) insert(best.v + r, best.u + m.L[r], best.u + m.R[r] + 1);
      var du = best.u * G - m.u0, dv = best.v * G - m.v0 + (opt.selv || 1);
      placed.push({ it: it, polys: m.P.map(function (p) { return p.map(function (q) { return [q[0] + du, q[1] + dv]; }); }), rot: best.rot });
      used += it.area;
    });
    var len = 0; occ.forEach(function (iv) { if (iv.length) len = Math.max(len, iv[iv.length - 1][1]); }); len *= G;
    return { placed: placed, length: len, width: widthCm, eff: len ? used / (len * widthCm) : 0, tooWide: tooWide, area: used };
  }
  function ext(it, k) { var a = [1e9, -1e9]; it.polys.forEach(function (p) { p.forEach(function (q) { a[0] = Math.min(a[0], q[k]); a[1] = Math.max(a[1], q[k]); }); }); return a[1] - a[0]; }
  C.marker = function (items, widthCm, opt) { // several placing orders and rules; keep the shortest marker
    var orders = [function (a, b) { return b.area - a.area; }, function (a, b) { return ext(b, 1) - ext(a, 1); }, function (a, b) { return ext(b, 0) - ext(a, 0); }], best = null;
    orders.forEach(function (o) { [0, 1].forEach(function (t) { var m = marker1(items, widthCm, opt, o, t); if (!best || (m.length < best.length && m.tooWide.length <= best.tooWide.length)) best = m; }); });
    return best;
  };
  // area-based estimate for secondary materials (lining, fusing, rib)
  function byArea(items, mat, width, eff) { var a = items.filter(function (i) { return i.mat === mat; }).reduce(function (s, i) { return s + i.area; }, 0); return a ? a / (width * eff) / 100 : 0; }
  C.gstRate = function (pricePerPiece, mode) { if (mode && mode !== 'auto') return +mode; return pricePerPiece <= 2500 ? 5 : 18; };
  C.cost = function (r, S, cfg, gid) {
    var items = C.items(r, S), N = Math.max(1, +cfg.per || 2), W = +cfg.width || 112, main = [];
    for (var g = 0; g < N; g++) items.forEach(function (it) { if (it.mat === 'main') main.push(it); });
    var mk = C.marker(main, W, { oneWay: !!cfg.oneWay, selv: 1 }), endLoss = (+cfg.endloss || 0) / 100;
    var fabM = mk.length / N / 100 * (1 + endLoss), fabCost = fabM * (+cfg.fp || 0);
    var lining = byArea(items, 'lining', +cfg.lw || 140, .78) * (1 + endLoss), fusing = byArea(items, 'fusing', 100, .8) * (1 + endLoss), rib = byArea(items, 'rib', 90, .75) * (1 + endLoss);
    // trims counted from the pattern
    var btn = 0; r.pieces.forEach(function (p) { var st = S.pc[p.id] || {}; if (st.on === false) return; var n = p.marks.filter(function (k) { return k.t === 'button'; }).length, q = +((p.cut || '').match(/Cut (\d+)/) || [0, 1])[1]; btn += p.id === 'front' ? n : n * q; });
    if (btn) btn += 1; // one spare
    var zip = (gid === 'skirt' && S.o.skirt !== 'gathered') || (gid === 'trousers' && S.o.wtype !== 'elastic') ? 1 : 0;
    var seam = 0;
    r.pieces.forEach(function (p) { var st = S.pc[p.id] || {}; if (st.on === false) return; var q = +((p.cut || '').match(/Cut (\d+)/) || [0, 1])[1], fold = /on fold/i.test(p.cut || '') ? 2 : 1;
      p.edges.forEach(function (e) { if (e.t !== 'fold') { var l = 0; for (var i = 1; i < e.p.length; i++) l += Math.hypot(e.p[i][0] - e.p[i - 1][0], e.p[i][1] - e.p[i - 1][1]); seam += l * q * fold; } }); });
    var threadM = seam / 2 / 100 * 5.5 * 1.12, cones = threadM / (+cfg.cone || 4000);
    var elastic = (gid === 'trousers' && S.o.wtype === 'elastic') || gid === 'churidar' || gid === 'gharara' ? (S.m.waist * .9 + 3) / 100 : 0;
    var smv = +cfg.smv || SMV[gid] || 15, cmt = smv * (+cfg.cpm || 0) / Math.max(.2, (+cfg.eff || 60) / 100);
    var lines = [
      ['Main fabric', fabM, 'm', +cfg.fp || 0, fabCost],
      ['Lining', lining, 'm', +cfg.lp || 0, lining * (+cfg.lp || 0)], ['Fusing / interfacing', fusing, 'm', +cfg.ip || 0, fusing * (+cfg.ip || 0)], ['Rib', rib, 'm', +cfg.rp || 0, rib * (+cfg.rp || 0)],
      ['Buttons', btn, 'pcs', +cfg.bp || 0, btn * (+cfg.bp || 0)], ['Zip', zip, 'pcs', +cfg.zp || 0, zip * (+cfg.zp || 0)], ['Elastic', elastic, 'm', +cfg.ep || 0, elastic * (+cfg.ep || 0)],
      ['Sewing thread', threadM, 'm', (+cfg.tp || 0) / (+cfg.cone || 4000), cones * (+cfg.tp || 0)], ['Labels, tags and trims', 1, 'set', +cfg.lab || 0, +cfg.lab || 0],
      ['Cutting, making, finishing', smv, 'SMV', cmt / smv, cmt], ['Washing / finishing', 1, 'pc', +cfg.wash || 0, +cfg.wash || 0], ['Packing', 1, 'pc', +cfg.pack || 0, +cfg.pack || 0]
    ].filter(function (l) { return l[1] > 0 && (l[4] > 0 || l[0] === 'Main fabric'); });
    var direct = lines.reduce(function (s, l) { return s + l[4]; }, 0), total = direct * (1 + (+cfg.oh || 0) / 100);
    var sell = total * (1 + (+cfg.mg || 0) / 100), retail = sell * (1 + (+cfg.rm || 0) / 100), gst = C.gstRate(retail, cfg.gst), mrp = Math.ceil(retail * (1 + gst / 100) / 10) * 10 - 1;
    var sellGst = C.gstRate(sell, cfg.gst), qty = Math.max(1, +cfg.qty || 1), wast = 1 + (+cfg.wastage || 0) / 100;
    return { marker: mk, perMarker: N, fabricPerGarment: fabM, lines: lines, direct: direct, overheads: total - direct, total: total, sell: sell, sellGst: sellGst, retail: retail, gst: gst, mrp: mrp,
      buttons: btn, zip: zip, threadM: threadM, smv: smv, cmt: cmt, qty: qty, order: { fabric: fabM * qty * wast, lining: lining * qty * wast, fusing: fusing * qty * wast, rib: rib * qty * wast, buttons: Math.ceil(btn * qty * wast), zips: Math.ceil(zip * qty * wast), thread: Math.ceil(cones * qty * wast), cost: total * qty, sales: sell * qty } };
  };
  // marker drawing (cm units, for the pattern stage)
  C.markerSvg = function (res, title) {
    var mk = res.marker, W = mk.width, L = Math.max(10, mk.length), pad = 4, g = '', cols = { main: '#fffcf7' };
    mk.placed.forEach(function (pl, i) { pl.polys.forEach(function (p, j) { g += '<path d="M' + p.map(function (q) { return q[0].toFixed(2) + ' ' + q[1].toFixed(2); }).join('L') + 'Z" fill="' + (j ? '#f6efe4' : '#fffcf7') + '" stroke="#1c1714" stroke-width=".08" data-l="CUT"/>'; });
      var pp = pl.polys[0], cx = 0, cy = 0; pp.forEach(function (q) { cx += q[0]; cy += q[1]; }); cx /= pp.length; cy /= pp.length;
      if (pl.polys.length > 1) { var q2 = pl.polys[1], c2 = [0, 0]; q2.forEach(function (q) { c2[0] += q[0]; c2[1] += q[1]; }); cx = (cx + c2[0] / q2.length) / 2; cy = (cy + c2[1] / q2.length) / 2; }
      g += '<text x="' + cx.toFixed(1) + '" y="' + cy.toFixed(1) + '" font-size="3.2" font-family="DM Sans,sans-serif" font-weight="700" fill="#6e6259" text-anchor="middle">' + pl.it.comp + (pl.it.mirror ? ' (R)' : '') + '</text>'; });
    var sel = '<path d="M0 1H' + L + 'M0 ' + (W - 1) + 'H' + L + '" stroke="#a9481f" stroke-width=".06" stroke-dasharray=".8 .5" data-l="MARK" fill="none"/>';
    var ticks = ''; for (var x = 0; x <= L; x += 10) ticks += '<path d="M' + x + ' ' + W + 'v' + (x % 50 ? 1.2 : 2.4) + '" stroke="#6e6259" stroke-width=".05" data-l="MARK"/>' + (x % 50 ? '' : '<text x="' + x + '" y="' + (W + 4.6) + '" font-size="1.7" font-family="DM Sans,sans-serif" fill="#6e6259" text-anchor="middle">' + x + '</text>');
    var info = '<text x="0" y="-2.2" font-size="2" font-family="DM Sans,sans-serif" font-weight="700" fill="#1c1714">' + title + '</text>';
    return { W: L + pad * 2, H: W + pad * 2 + 6, svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (-pad) + ' ' + (-pad - 2) + ' ' + (L + pad * 2) + ' ' + (W + pad * 2 + 6) + '"><rect x="0" y="0" width="' + L + '" height="' + W + '" fill="#efe8dc" stroke="#6e6259" stroke-width=".08" data-l="CUT"/>' + sel + g + ticks + info + '</svg>' };
  };
})();
