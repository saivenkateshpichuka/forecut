/* Forecut saree layout designer: flat layout at true proportions (1 unit = 1 cm), pallu close-up, spec sheet with nearest Pantone TCX. */
(function () {
  var $ = FC.$, $$ = FC.$$, n = FC.num;
  var PRE = window.FC_SAREE_PRESETS, PAL = window.FC_SAREE_PALETTE;
  var F = $('#sd'), st = FC.load('saree');
  function set(o) { Object.keys(o).forEach(function (k) { var e = $('#s-' + k); if (e) { if (e.type === 'checkbox') e.checked = !!o[k]; else e.value = o[k]; } }); }
  set(PRE[0].v); if (st) set(st);
  /* palette chips on every colour field */
  $$('.sw').forEach(function (box) {
    var inp = $('#' + box.dataset.for);
    box.innerHTML = PAL.map(function (c) { return '<button type="button" title="' + c[1] + '" style="background:' + c[0] + '" data-c="' + c[0] + '"></button>'; }).join('');
    box.addEventListener('click', function (e) { var c = e.target.dataset && e.target.dataset.c; if (c) { inp.value = c; draw(); } });
  });
  var ps = $('#s-preset'); PRE.forEach(function (p, i) { var o = document.createElement('option'); o.value = i; o.textContent = p.n; ps.appendChild(o); });
  ps.addEventListener('change', function () { set(PRE[+this.value].v); draw(); });

  function v() { var o = {}; $$('input,select', F).forEach(function (e) { if (!e.id || e.id === 's-preset') return; o[e.id.slice(2)] = e.type === 'checkbox' ? e.checked : (e.type === 'number' || e.type === 'range') ? n(e) : (e.value !== '' && isFinite(+e.value) ? +e.value : e.value); }); return o; }
  function motif(kind, s, col) {
    var r = s / 2;
    if (kind === 'dot') return '<circle r="' + r * .45 + '" fill="' + col + '"/>';
    if (kind === 'diamond') return '<path d="M0 ' + (-r) + 'L' + r * .7 + ' 0L0 ' + r + 'L' + (-r * .7) + ' 0Z" fill="' + col + '"/>';
    if (kind === 'flower') { var p = ''; for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3; p += '<ellipse cx="' + (Math.cos(a) * r * .5).toFixed(2) + '" cy="' + (Math.sin(a) * r * .5).toFixed(2) + '" rx="' + r * .32 + '" ry="' + r * .2 + '" transform="rotate(' + (i * 60) + ' ' + (Math.cos(a) * r * .5).toFixed(2) + ' ' + (Math.sin(a) * r * .5).toFixed(2) + ')" fill="' + col + '"/>'; } return p + '<circle r="' + r * .2 + '" fill="' + col + '" opacity=".7"/>'; }
    /* paisley (mango) */
    return '<path transform="scale(' + (s / 10) + ')" d="M1.5 4.5C-2.5 5.5-4.6 1.6-2.8-1.6-1-4.8 3.2-5.4 4.4-3.2 2.4-3.6.4-2.6.6-.8.8 1 3 1.2 3.4 2.6 3.7 3.6 2.9 4.3 1.5 4.5Z" fill="' + col + '"/>';
  }
  function body(o, id) {
    var s = o.sp, m = o.ms, c = o.cm, d = '';
    if (o.bp === 'plain') return '';
    if (o.bp === 'butta') d = '<pattern id="' + id + '" width="' + s + '" height="' + s + '" patternUnits="userSpaceOnUse"><g transform="translate(' + s / 4 + ' ' + s / 4 + ')">' + motif(o.mk, m, c) + '</g><g transform="translate(' + s * .75 + ' ' + s * .75 + ')">' + motif(o.mk, m, c) + '</g></pattern>';
    if (o.bp === 'stripes') d = '<pattern id="' + id + '" width="' + s + '" height="' + s + '" patternUnits="userSpaceOnUse"><rect y="0" width="' + s + '" height="' + Math.max(.3, m * .25) + '" fill="' + c + '"/></pattern>';
    if (o.bp === 'checks') d = '<pattern id="' + id + '" width="' + s + '" height="' + s + '" patternUnits="userSpaceOnUse"><rect width="' + s + '" height="' + Math.max(.3, m * .2) + '" fill="' + c + '"/><rect width="' + Math.max(.3, m * .2) + '" height="' + s + '" fill="' + c + '"/></pattern>';
    if (o.bp === 'jaal') d = '<pattern id="' + id + '" width="' + s + '" height="' + s + '" patternUnits="userSpaceOnUse"><path d="M0 0L' + s + ' ' + s + 'M' + s + ' 0L0 ' + s + '" stroke="' + c + '" stroke-width="' + Math.max(.15, m * .06) + '"/><g transform="translate(' + s / 2 + ' ' + s / 2 + ')">' + motif(o.mk, m * .8, c) + '</g></pattern>';
    if (o.bp === 'zari') d = '<pattern id="' + id + '" width="' + s / 2 + '" height="' + s / 2 + '" patternUnits="userSpaceOnUse"><circle cx="' + s / 4 + '" cy="' + s / 4 + '" r="' + Math.max(.15, m * .08) + '" fill="' + c + '"/></pattern>';
    return d;
  }
  /* border band from x0..x1 at y (top band if top) */
  function border(o, x0, x1, y, h, top) {
    var g = '<rect x="' + x0 + '" y="' + y + '" width="' + (x1 - x0) + '" height="' + h + '" fill="' + o.cb + '"/>';
    if (o.bs === 'gj') g += '<rect x="' + x0 + '" y="' + (top ? y + h / 2 : y) + '" width="' + (x1 - x0) + '" height="' + h / 2 + '" fill="' + o.ca + '"/>';
    var inner = top ? y + h : y, dir = top ? 1 : -1, t = h * .45, w = Math.max(2, h * .5);
    if (o.bs === 'temple') { var p = ''; for (var x = x0; x < x1 - .1; x += w) p += 'M' + x.toFixed(2) + ' ' + inner + 'L' + (x + w / 2).toFixed(2) + ' ' + (inner + dir * t).toFixed(2) + 'L' + Math.min(x + w, x1).toFixed(2) + ' ' + inner + 'Z'; g += '<path d="' + p + '" fill="' + o.cb + '"/>'; }
    if (o.bs === 'zigzag') { var q = 'M' + x0 + ' ' + (y + h / 2); for (var xx = x0, k = 0; xx < x1; xx += w / 2, k++) q += 'L' + Math.min(xx + w / 2, x1).toFixed(2) + ' ' + (y + h / 2 + (k % 2 ? -1 : 1) * h * .25).toFixed(2); g += '<path d="' + q + '" fill="none" stroke="' + o.cm + '" stroke-width="' + Math.max(.2, h * .06) + '"/>'; }
    if (o.bs === 'stripes' || o.zl) { var lw = Math.max(.15, h * .04); [.2, .5, .8].forEach(function (f, i) { if (o.bs === 'stripes' || i !== 1) g += '<rect x="' + x0 + '" y="' + (y + h * f - lw / 2).toFixed(2) + '" width="' + (x1 - x0) + '" height="' + lw.toFixed(2) + '" fill="' + o.cm + '"/>'; }); }
    return g;
  }
  function pallu(o, x0, x1, H) {
    var w = x1 - x0, g = '<rect x="' + x0 + '" y="0" width="' + w + '" height="' + H + '" fill="' + o.cp + '"/>';
    if (o.ps === 'stripes') { var k = 7; for (var i = 0; i < k; i++) { var sw = w / (k * 2.2); g += '<rect x="' + (x0 + w * (i + .5) / k - sw / 2).toFixed(2) + '" y="0" width="' + sw.toFixed(2) + '" height="' + H + '" fill="' + (i % 2 ? o.cm : o.cb) + '"/>'; } }
    if (o.ps === 'motifs') { var rows = 3, cols = Math.max(2, Math.round(w / 25)); for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) g += '<g transform="translate(' + (x0 + w * (c + .5) / cols).toFixed(2) + ' ' + (o.bw + (H - 2 * o.bw) * (r + .5) / rows).toFixed(2) + ')">' + motif(o.mk, Math.min(w / cols, (H - 2 * o.bw) / rows) * .62, o.cm) + '</g>'; }
    if (o.ps === 'temple' || o.ps === 'motifs' || o.ps === 'stripes') { var tw = H / 9, p = ''; for (var y = 0; y < H - .1; y += tw) p += 'M' + x0 + ' ' + y.toFixed(2) + 'L' + (x0 - tw * .8).toFixed(2) + ' ' + (y + tw / 2).toFixed(2) + 'L' + x0 + ' ' + Math.min(y + tw, H).toFixed(2) + 'Z'; g += o.ps === 'temple' ? '<path d="' + p + '" fill="' + o.cp + '"/>' : ''; g += '<rect x="' + x0 + '" y="0" width="' + Math.max(.6, o.bw * .25).toFixed(2) + '" height="' + H + '" fill="' + o.cm + '"/>'; }
    if (o.fr) { var f2 = ''; for (var yy = 1; yy < H; yy += 1.6) f2 += 'M' + x1 + ' ' + yy.toFixed(1) + 'h2.2'; g += '<path d="' + f2 + '" stroke="' + o.cp + '" stroke-width=".5"/>'; }
    return g;
  }
  function build(o, view) {
    var L = o.len, H = o.wid, bl = o.bl, pl = Math.min(o.pl, L - bl - 50), bw = Math.min(o.bw, H / 3), xb = bl, xp = L - pl, pad = o.fr ? 3 : 0;
    var defs = body(o, 'bp'), g = '';
    if (bl > 0) g += '<rect x="0" y="0" width="' + bl + '" height="' + H + '" fill="' + o.cbl + '"/>' + (o.bob ? border(o, 0, bl, 0, bw * .6, true) + border(o, 0, bl, H - bw * .6, bw * .6, false) : '') + '<path d="M' + bl + ' 0V' + H + '" stroke="#1c1714" stroke-width=".25" stroke-dasharray="1.2 1"/>';
    g += '<rect x="' + xb + '" y="0" width="' + (xp - xb) + '" height="' + H + '" fill="' + o.cbd + '"/>';
    if (defs) g += '<rect x="' + xb + '" y="' + bw + '" width="' + (xp - xb) + '" height="' + (H - 2 * bw) + '" fill="url(#bp)"/>';
    g += pallu(o, xp, L, H);
    g += border(o, xb, L, 0, bw, true) + border(o, xb, L, H - bw, bw, false);
    var vb = view === 'pallu' ? [Math.max(0, xp - 40), -2, pl + 40 + pad + 4, H + 4] : [-2, -2, L + 4 + pad, H + 4];
    var lab = view === 'pallu' ? '' : '<g font-family="DM Sans,sans-serif" font-size="' + (H * .055).toFixed(1) + '" fill="#1c1714">' +
      (bl > 0 ? '<text x="' + bl / 2 + '" y="' + (H + 0) + '" dy="' + (H * .1).toFixed(1) + '" text-anchor="middle">Blouse ' + bl + ' cm</text>' : '') +
      '<text x="' + (xb + xp) / 2 + '" y="' + H + '" dy="' + (H * .1).toFixed(1) + '" text-anchor="middle">Body ' + Math.round(xp - xb) + ' cm</text>' +
      '<text x="' + (xp + L) / 2 + '" y="' + H + '" dy="' + (H * .1).toFixed(1) + '" text-anchor="middle">Pallu ' + Math.round(pl) + ' cm</text></g>';
    if (!lab) vb[3] = H + 4; else vb[3] = H + H * .16;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb.join(' ') + '" preserveAspectRatio="xMidYMid meet"><defs>' + defs + '</defs>' + g + lab + '</svg>';
  }
  var tcx = [];
  FC.tcx(function (l) { tcx = l; spec(v()); });
  function spec(o) {
    var L = o.len, pl = Math.min(o.pl, L - o.bl - 50), rows = [['Total length', L], ['Width', o.wid], ['Blouse piece', o.bl], ['Body', L - o.bl - pl], ['Pallu', pl], ['Border (each edge)', Math.min(o.bw, o.wid / 3)]];
    $('#s-dims').innerHTML = rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + FC.fmt(r[1], 0) + ' cm</td><td>' + FC.fmt(r[1] / 2.54, 1) + '"</td></tr>'; }).join('');
    var cs = [['Body', o.cbd], ['Border', o.cb], ['Pallu', o.cp], ['Motif / zari', o.cm], ['Accent', o.ca], ['Blouse', o.cbl]];
    $('#s-cols').innerHTML = cs.map(function (c) { var t = tcx.length ? FC.nearest(c[1], tcx) : null; return '<tr><td><i style="background:' + c[1] + '"></i>' + c[0] + '</td><td>' + c[1].toUpperCase() + '</td><td>' + (t ? t.code + ' · ' + t.name + (t.de > 6 ? ' (approx.)' : '') : '…') + '</td></tr>'; }).join('');
    var bpN = { plain: 'Plain body', butta: 'Butta (scattered motifs), half-drop repeat', stripes: 'Stripes along the length', checks: 'Checks', jaal: 'Jaal (diagonal lattice) with motif', zari: 'Zari dots' }[o.bp];
    $('#s-notes').textContent = bpN + (o.bp !== 'plain' ? ', repeat ' + o.sp + ' cm, motif ' + o.ms + ' cm (' + o.mk + ')' : '') + '. Border: ' + { plain: 'plain band', temple: 'temple (triangle) edge', zigzag: 'zigzag line', stripes: 'three zari lines', gj: 'two-colour (ganga-jamuna)' }[o.bs] + (o.zl ? ' with zari edge lines' : '') + '. Pallu: ' + { plain: 'plain', stripes: 'stripes', motifs: 'motif rows', temple: 'temple edge' }[o.ps] + (o.fr ? ', with tassels' : '') + '.';
  }
  function draw() {
    var o = v(); FC.save('saree', o);
    $('#s-out').innerHTML = build(o, 'full'); $('#s-zoom').innerHTML = build(o, 'pallu'); spec(o);
  }
  $$('input,select', F).forEach(function (e) { if (e.id !== 's-preset') { e.addEventListener('input', draw); e.addEventListener('change', draw); } });
  $('#s-svg').addEventListener('click', function () { FC.download('forecut-saree-layout.svg', build(v(), 'full'), 'image/svg+xml'); });
  $('#s-png').addEventListener('click', function () { var o = v(), s = new DOMParser().parseFromString(build(o, 'full'), 'image/svg+xml').documentElement, vb = s.getAttribute('viewBox').split(' ').map(Number); FC.svgToPng(s, 3600, Math.round(3600 * vb[3] / vb[2]), 'forecut-saree-layout.png', '#ffffff'); });
  $('#s-prt').addEventListener('click', function () { window.print(); });
  draw();
})();
