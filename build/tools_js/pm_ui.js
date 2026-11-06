/* Forecut pattern maker: interface, state, scene building and downloads. Needs pm_engine.js and pm_export.js. */
(function () {
  var $ = FC.$, $$ = FC.$$, PM = window.PM, X = window.PMX, V = window.PMV, DET = window.PM_DETAILS || [];
  var GC = { bodice: 'BOD', kurta: 'KUR', shirt: 'SHT', tshirt: 'TEE', hoodie: 'HOD', blouse: 'BLS', top: 'TOP', dress: 'DRS', jacket: 'JKT', skirt: 'SKT', lehenga: 'LEH', trousers: 'TRS' }, VER = '1.2';
  function code() { return 'FC-' + { women: 'W', men: 'M', kids: 'K', unisex: 'U' }[S.gender] + '-' + GC[S.gid] + '-' + (S.size === 'custom' ? 'CUS' : S.size); }
  var UF = { cm: 1, mm: 10, in: 1 / 2.54 };
  var OPT = {
    ease: { l: 'Ease at chest', L: 1 }, len: { l: 'Length from shoulder (0 = standard)', L: 1 }, shape: { l: 'Side seam', o: [['straight', 'Straight'], ['shaped', 'Shaped at waist']] },
    neck: { l: 'Neckline', o: [['crew', 'Crew'], ['round', 'Round'], ['deep', 'Deep round'], ['ushape', 'U-neck'], ['v', 'V-neck'], ['boat', 'Boat'], ['square', 'Square']] },
    back: { l: 'Back neckline', o: [['std', 'Standard'], ['low', 'Low'], ['deepU', 'Deep U'], ['deepV', 'Deep V']] }, cup: { l: 'Bust dart (cup)', o: [['A', 'A'], ['B', 'B'], ['C', 'C'], ['D', 'D']] },
    collar: { l: 'Collar', o: [['none', 'None'], ['band', 'Band / mandarin'], ['shirt', 'Shirt collar + band'], ['camp', 'Camp / revere'], ['peterpan', 'Peter Pan']] },
    sleeve: { l: 'Sleeve', o: [['none', 'Sleeveless'], ['plain', 'Set-in sleeve'], ['shirt', 'Shirt sleeve with cuff'], ['tee', 'T-shirt sleeve'], ['puff', 'Puff sleeve'], ['bell', 'Bell sleeve'], ['cap', 'Cap sleeve']] },
    slen: { l: 'Sleeve length', o: [['cap', 'Cap'], ['short', 'Short'], ['elbow', 'Elbow'], ['3q', 'Three-quarter'], ['full', 'Full']] },
    flare: { l: 'Flare at hem (each side)', L: 1 }, slit: { l: 'Side slit length', L: 1 }, pockets: { l: 'Pockets', o: [['0', 'None'], ['1', 'One'], ['2', 'Two']] }, hem: { l: 'Hem', o: [['straight', 'Straight'], ['curved', 'Curved shirt-tail']] },
    yoke: { l: 'Back yoke', o: [['1', 'Yoke with box pleat'], ['0', 'No yoke']] }, drop: { l: 'Dropped shoulder', L: 1 }, hood: { l: 'Hood', o: [['1', 'With hood'], ['0', 'Neck rib instead']] },
    opening: { l: 'Opening', o: [['1', 'Front opening (hooks)'], ['0', 'Back opening']] }, peplum: { l: 'Peplum', o: [['0', 'No'], ['1', 'Yes']] }, dress: { l: 'Dress style', o: [['shift', 'Shift (one piece)'], ['frock', 'Bodice + gathered skirt']] },
    skirt: { l: 'Skirt', o: [['straight', 'Straight / pencil'], ['aline', 'A-line'], ['circle', 'Circle'], ['gathered', 'Gathered'], ['panels', 'Panelled (kalis)']] }, slen2: { l: 'Skirt length', L: 1 },
    circle: { l: 'Circle', o: [['0.25', 'Quarter'], ['0.5', 'Half'], ['1', 'Full']] }, panels: { l: 'Panels', n: 1 }, hemc: { l: 'Hem circumference', L: 1 },
    leg: { l: 'Leg', o: [['straight', 'Straight'], ['tapered', 'Tapered'], ['wide', 'Wide-leg'], ['palazzo', 'Palazzo'], ['barrel', 'Barrel'], ['jogger', 'Jogger'], ['shorts', 'Shorts']] },
    pfit: { l: 'Fit at crotch', o: [['trouser', 'Trouser (hangs straight)'], ['slack', 'Slack (closer, cups slightly)'], ['jean', 'Jean (contoured)']] },
    wtype: { l: 'Waist', o: [['fitted', 'Waistband with darts'], ['elastic', 'Elastic / drawstring casing']] }, tlen: { l: 'Length, waist to hem (0 = full length)', L: 1 }, cargo: { l: 'Cargo pocket', o: [['0', 'No'], ['1', 'Yes']] }
  };
  var ALLOW = { collar: { kurta: ['none', 'band'], shirt: ['shirt', 'band', 'camp'], top: ['none', 'band', 'peterpan'], dress: ['none', 'band', 'peterpan'], jacket: ['band', 'none'] },
    sleeve: { kurta: ['plain', 'bell', 'puff', 'cap', 'none'], shirt: ['shirt', 'plain'], tshirt: ['tee', 'none'], bodice: ['plain', 'none'], blouse: ['plain', 'puff', 'cap', 'none'], top: ['plain', 'puff', 'bell', 'cap', 'none'], dress: ['puff', 'plain', 'bell', 'cap', 'none'] } };
  var MEAS = { torso: ['bust', 'waist', 'hip', 'shoulder', 'nape', 'neck', 'bicep', 'wrist', 'sleeve', 'wh'], skirt: ['waist', 'hip', 'wh'], trousers: ['waist', 'hip', 'wh', 'rise', 'knee_l', 'outseam', 'thigh', 'knee', 'ankle'] };
  var S = FC.load('pm2') || {};
  S = Object.assign({ gender: 'women', gid: 'kurta', size: 'M', unit: 'cm', m: null, o: {}, pc: {}, sa: 1, hemA: 2.5, detail: null }, S);
  var gate = $('#pm-gate'), app = $('#pm-app');

  function unlock() { gate.hidden = true; app.hidden = false; }
  if (window.FC_PREVIEW) unlock();
  else document.addEventListener('fcauth-ready', function () { try { FCAuth.onChange(function (u) { if (u) unlock(); else { gate.hidden = false; app.hidden = true; } }); } catch (e) { } });
  if (window.FCAuth && FCAuth.onChange) FCAuth.onChange(function (u) { if (u) unlock(); });

  function U(v) { return +(v * UF[S.unit]).toFixed(S.unit === 'mm' ? 0 : S.unit === 'in' ? 2 : 1); }
  function cm(v) { return v / UF[S.unit]; }
  function measSet() { return S.gid === 'skirt' || S.gid === 'lehenga' ? MEAS.skirt : S.gid === 'trousers' ? MEAS.trousers : MEAS.torso.concat(S.gid === 'hoodie' ? ['head'] : []); }
  function chart() { return PM.CHARTS[S.gender]; }
  function resetMeas() { var c = chart(); if (!c[S.size]) S.size = Object.keys(c)[2]; S.m = Object.assign({}, c[S.size]); }
  function resetOpts() { S.o = Object.assign({}, PM.GARMENTS[S.gid].d); if (S.gender === 'kids') { if (S.o.len) S.o.len = Math.round(S.o.len * .62); if (S.o.slen2) S.o.slen2 = Math.round(S.o.slen2 * .6); if (S.o.ease) S.o.ease = Math.max(6, Math.round(S.o.ease * .75)); if (S.o.slit) S.o.slit = 12; if (S.o.hemc) S.o.hemc = 220; } if (S.gender === 'men' && S.gid === 'kurta') S.o.len = 102; if (S.gender === 'men' && S.gid === 'tshirt') S.o.len = 72; }
  if (!S.m) resetMeas(); if (!Object.keys(S.o).length) resetOpts();

  /* ---------- controls ---------- */
  function uinp(attr, val) { return '<span class="uin"><input type="number" step="any" min="0" inputmode="decimal" ' + attr + ' value="' + val + '"><i>' + S.unit + '</i></span>'; }
  function genderTabs() {
    var short = { women: 'Women', men: 'Men', kids: 'Kids', unisex: 'Unisex' };
    $('#pm-gtabs').innerHTML = Object.keys(PM.GENDER).map(function (g) { return '<button type="button" data-g="' + g + '" title="' + PM.GENDER[g] + '" aria-pressed="' + (g === S.gender) + '">' + short[g] + '</button>'; }).join('');
    $$('#pm-gtabs button').forEach(function (b) { b.onclick = function () { S.gender = b.dataset.g; if (PM.GARMENTS[S.gid].g.indexOf(S.gender) < 0) S.gid = Object.keys(PM.GARMENTS).filter(function (k) { return PM.GARMENTS[k].g.indexOf(S.gender) > -1; })[0]; S.detail = null; resetMeas(); resetOpts(); S.pc = {}; ui(true); }; });
    var gs = Object.keys(PM.GARMENTS).filter(function (k) { return PM.GARMENTS[k].g.indexOf(S.gender) > -1; });
    $('#pm-garments').innerHTML = gs.map(function (k) { return '<button type="button" data-k="' + k + '" aria-pressed="' + (k === S.gid) + '"><span>' + PM.GARMENTS[k].n + '</span><small>' + GC[k] + '</small></button>'; }).join('');
    $$('#pm-garments button').forEach(function (b) { b.onclick = function () { S.gid = b.dataset.k; S.detail = null; resetOpts(); S.pc = {}; ui(true); }; });
  }
  function measForm() {
    var c = chart(), h = '<label class="row"><span>Size chart</span><select id="pm-size">' + Object.keys(c).map(function (s) { return '<option' + (s === S.size ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '<option value="custom"' + (S.size === 'custom' ? ' selected' : '') + '>Custom</option></select></label>';
    measSet().forEach(function (k) { h += '<label class="row" title="' + PM.LABELS[k] + '"><span>' + PM.LABELS[k] + '</span>' + uinp('data-m="' + k + '"', U(S.m[k])) + '</label>'; });
    $('#pm-meas').innerHTML = h;
    var keys = measSet(); figure(keys, keys.indexOf(FK) > -1 ? FK : keys[0]);
    $$('#pm-meas [data-m]').forEach(function (e) { var row = e.closest('.row'), k = e.dataset.m; row.onmouseenter = function () { figure(keys, k); }; e.onfocus = function () { figure(keys, k); }; });
    $('#pm-size').onchange = function () { S.size = this.value; if (S.size !== 'custom') S.m = Object.assign({}, chart()[S.size]); ui(); };
    $$('#pm-meas [data-m]').forEach(function (e) { e.oninput = function () { var v = parseFloat(e.value); if (v > 0) { S.m[e.dataset.m] = cm(v); S.size = 'custom'; $('#pm-size').value = 'custom'; draw(); } }; });
  }
  var FK = null;
  function figure(keys, k) {
    FK = k; $('#pm-fig').innerHTML = V.figure(keys, k) + '<p><b>' + PM.LABELS[k] + '</b>' + (V.HOW[k] || '') + '</p>';
    $$('#pm-meas .row').forEach(function (r) { var i = r.querySelector('[data-m]'); r.classList.toggle('on', !!i && i.dataset.m === k); });
    $$('#pm-fig g[data-k]').forEach(function (g) { g.onmouseenter = function () { figure(keys, g.dataset.k); }; g.onclick = function () { var i = $('#pm-meas [data-m="' + g.dataset.k + '"]'); if (i) { i.focus(); i.select(); } }; });
  }
  function optForm() {
    var G = PM.GARMENTS[S.gid], h = '';
    G.o.forEach(function (k) {
      var d = OPT[k], v = S.o[k];
      if (d.o) { var opts = d.o.filter(function (x) { return !ALLOW[k] || !ALLOW[k][S.gid] || ALLOW[k][S.gid].indexOf(x[0]) > -1; }); h += '<label class="row wide"><span>' + d.l + '</span><select data-o="' + k + '">' + opts.map(function (x) { return '<option value="' + x[0] + '"' + (String(x[0]) === String(v) ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select></label>'; }
      else h += '<label class="row"><span>' + d.l + '</span>' + (d.L ? uinp('data-o="' + k + '"', U(+v || 0)) : '<input type="number" step="1" min="0" data-o="' + k + '" value="' + (+v || 0) + '" style="text-align:right">') + '</label>';
    });
    $('#pm-opts').innerHTML = h;
    $$('#pm-opts [data-o]').forEach(function (e) { e.oninput = e.onchange = function () { var k = e.dataset.o, d = OPT[k]; S.o[k] = d.o ? e.value : d.L ? cm(parseFloat(e.value) || 0) : (parseFloat(e.value) || 0); draw(); }; });
  }
  function detailPicker() {
    var dl = $('#pm-dlist'); if (!dl.options.length) dl.innerHTML = DET.map(function (d) { return '<option value="' + d[0].replace(/"/g, '') + ' · ' + d[1] + '">'; }).join('');
    $('#pm-dcount').textContent = DET.length;
    $('#pm-dsearch').onchange = function () { var v = this.value, d = DET.filter(function (x) { return x[0] + ' · ' + x[1] === v; })[0]; if (d) { applyDetail(d); this.value = ''; this.blur(); } };
    $('#pm-dnote').innerHTML = S.detail ? 'From Forecut detail <b>' + S.detail + '</b>' : '';
  }
  function applyDetail(d) { S.gender = d[2]; S.gid = d[3]; resetMeas(); resetOpts(); Object.keys(d[4]).forEach(function (k) { S.o[k] = d[4][k]; }); S.detail = d[0]; S.pc = {}; ui(true); }

  /* ---------- scene ---------- */
  var built = null;
  function scene(forExport) {
    var r = PM.build(S.gid, S.gender, S.m, S.o), sc = [], x = 2, y = 2, rowH = 0, maxW = 165, sizeLab = (S.size === 'custom' ? 'custom size' : 'size ' + S.size) + ' · ' + PM.GENDER[S.gender], title = r.label;
    built = r;
    var onList = r.pieces.filter(function (p) { return (S.pc[p.id] || {}).on !== false; }), NP = onList.length, cd = code();
    r.pieces.forEach(function (p) {
      var st = S.pc[p.id] || (S.pc[p.id] = {}), on = st.on !== false; if (!on) return; var pn = onList.indexOf(p) + 1;
      var sa = st.sa !== undefined ? st.sa : S.sa, ha = st.hem !== undefined ? st.hem : (p.defHem !== undefined ? p.defHem : S.hemA), name = st.name || p.auto;
      var outl = PM.outline(p), cut = PM.cutline(p, sa, ha), bb = X.bbox([{ k: 'poly', p: cut }]), w = bb[2] - bb[0], h = bb[3] - bb[1];
      if (x + w > maxW && x > 2) { x = 2; y += rowH + 4; rowH = 0; }
      var dx = x - bb[0], dy = y - bb[1]; function T(q) { return [q[0] + dx, q[1] + dy]; }
      sc.push({ k: 'poly', p: cut.map(T), c: 1, w: .07, col: '#1c1714', L: 'CUT', fill: forExport ? null : '#fffcf7' });
      if (sa > 0 || ha > 0) sc.push({ k: 'poly', p: outl.map(T), c: 1, w: .045, d: [.5, .3], col: '#6e6259', L: 'SEAM' });
      p.edges.forEach(function (e) { if (e.t === 'fold') { sc.push({ k: 'poly', p: e.p.map(T), w: .14, col: '#a9481f', d: [.8, .4], L: 'MARK' }); var mid = e.p[Math.floor(e.p.length / 2)], vert = Math.abs(e.p[0][0] - e.p[e.p.length - 1][0]) < Math.abs(e.p[0][1] - e.p[e.p.length - 1][1]); sc.push({ k: 'text', x: mid[0] + dx + (vert ? .9 : 0), y: mid[1] + dy + (vert ? 0 : -.6), s: .9, t: 'PLACE ON FOLD', col: '#a9481f', r: vert ? 90 : 0, a: 'middle', L: 'TEXT' }); } });
      p.marks.forEach(function (k) {
        if (k.t === 'line') { sc.push({ k: 'poly', p: k.p.map(T), w: .04, d: k.dash ? [.4, .3] : null, col: '#6e6259', L: 'MARK' }); if (k.lab) { var a = k.p[0], b = k.p[k.p.length - 1], hor = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]); sc.push({ k: 'text', x: (hor ? a[0] + 1 : a[0] + .4) + dx, y: (hor ? a[1] - .3 : (a[1] + b[1]) / 2) + dy, s: .75, t: k.lab, col: '#6e6259', L: 'TEXT', r: hor ? 0 : 90 }); } }
        if (k.t === 'dart') { sc.push({ k: 'poly', p: k.p.map(T), w: .06, col: '#1c1714', L: 'MARK' }); if (k.lab) sc.push({ k: 'text', x: k.p[1][0] + dx + .5, y: k.p[1][1] + dy, s: .7, t: k.lab, col: '#6e6259', L: 'TEXT' }); }
        if (k.t === 'dot') { var c = T(k.c), pts = []; for (var i = 0; i <= 16; i++) pts.push([c[0] + .35 * Math.cos(i / 16 * 6.2832), c[1] + .35 * Math.sin(i / 16 * 6.2832)]); sc.push({ k: 'poly', p: pts, c: 1, w: .06, L: 'MARK' }); if (k.lab) sc.push({ k: 'text', x: c[0] + .6, y: c[1] + .3, s: .7, t: k.lab, col: '#6e6259', L: 'TEXT' }); }
        if (k.t === 'button') { var c2 = T(k.c), bp = []; for (var j = 0; j <= 16; j++) bp.push([c2[0] + .55 * Math.cos(j / 16 * 6.2832), c2[1] + .55 * Math.sin(j / 16 * 6.2832)]); sc.push({ k: 'poly', p: bp, c: 1, w: .05, L: 'MARK' }); }
        if (k.t === 'notch') { var c3 = k.c, best = null, bd = 1e9; for (var q = 1; q < outl.length; q++) { var A = outl[q - 1], Bp = outl[q], vx = Bp[0] - A[0], vy = Bp[1] - A[1], t = Math.max(0, Math.min(1, ((c3[0] - A[0]) * vx + (c3[1] - A[1]) * vy) / (vx * vx + vy * vy || 1))), px = A[0] + vx * t, py = A[1] + vy * t, dd = Math.hypot(px - c3[0], py - c3[1]); if (dd < bd) { bd = dd; best = [px, py, vx, vy]; } }
          if (best) { var l = Math.hypot(best[2], best[3]) || 1, nx = best[3] / l, ny = -best[2] / l, inside = pip([best[0] + nx * .3, best[1] + ny * .3], outl); if (inside) { nx = -nx; ny = -ny; } var cnt = k.n || 1; for (var z = 0; z < cnt; z++) { var off = (z - (cnt - 1) / 2) * .5, ox = best[0] + best[2] / l * off, oy = best[1] + best[3] / l * off; sc.push({ k: 'poly', p: [T([ox - nx * .25, oy - ny * .25]), T([ox + nx * (Math.max(sa, .4) + .2), oy + ny * (Math.max(sa, .4) + .2)])], w: .07, L: 'MARK' }); } } }
        if (k.t === 'text') sc.push({ k: 'text', x: k.c[0] + dx, y: k.c[1] + dy, s: .8, t: k.s, a: 'middle', col: '#6e6259', L: 'TEXT' });
      });
      if (p.grain) { var g0 = T(p.grain[0]), g1 = T(p.grain[1]), ang = Math.atan2(g1[1] - g0[1], g1[0] - g0[0]); sc.push({ k: 'poly', p: [g0, g1], w: .08, col: '#1f3d33', L: 'GRAIN' });
        var gl = Math.hypot(g1[0] - g0[0], g1[1] - g0[1]); if (gl > 9) { var gd = ang * 180 / Math.PI, gx = g0[0] + (g1[0] - g0[0]) * .22 - Math.sin(ang) * .45, gy = g0[1] + (g1[1] - g0[1]) * .22 + Math.cos(ang) * .45; sc.push({ k: 'text', x: gx, y: gy, s: .62, t: 'GRAINLINE', col: '#1f3d33', r: gd > 90 || gd < -90 ? gd + 180 : gd, L: 'TEXT' }); }
        [[g1, ang], [g0, ang + Math.PI]].forEach(function (z) { sc.push({ k: 'poly', p: [[z[0][0] - Math.cos(z[1] - .35) * 1, z[0][1] - Math.sin(z[1] - .35) * 1], z[0], [z[0][0] - Math.cos(z[1] + .35) * 1, z[0][1] - Math.sin(z[1] + .35) * 1]], w: .08, col: '#1f3d33', L: 'GRAIN' }); }); }
      var fs = Math.max(.45, Math.min(1.5, Math.min(w, h) / 14, (w - 2) / (Math.max(name.length, 18) * .58))), tw = Math.max(name.length, 26) * fs * .56, lx = Math.max(bb[0] + dx + 1, Math.min((p.grain ? (p.grain[0][0] + p.grain[1][0]) / 2 : (bb[0] + bb[2]) / 2) + dx + .6, bb[2] + dx - tw - .6)), ly = (p.grain ? (p.grain[0][1] + p.grain[1][1]) / 2 : (bb[1] + bb[3]) / 2) + dy - fs;
      [[name, fs, 1], ['Piece ' + pn + ' of ' + NP + ' · ' + p.cut + (p.notes ? ' · ' + p.notes : ''), fs * .62], [cd + ' · ' + sizeLab + ' · SA ' + U(sa) + ' ' + S.unit + (ha !== sa ? ', hem ' + U(ha) + ' ' + S.unit : ''), fs * .55], ['FORECUT · forecut.in', fs * .55, 1, '#a9481f']].forEach(function (t, i) { sc.push({ k: 'text', x: lx, y: ly + i * fs * 1.05, s: t[1], t: t[0], b: t[2], col: t[3] || '#1c1714', L: i === 3 ? 'BRAND' : 'TEXT' }); });
      sc.push({ k: 'text', x: (bb[0] + bb[2]) / 2 + dx, y: (bb[1] + bb[3]) / 2 + dy + fs * 3.6, s: Math.min(4, w / 6), t: 'FORECUT', b: 1, col: '#a9481f', op: .12, a: 'middle', r: -30, L: 'BRAND' });
      x += w + 4; rowH = Math.max(rowH, h);
    });
    var W = Math.max(30, Math.min(maxW + 4, sc.length ? X.bbox(sc.filter(function (o) { return o.L !== 'BRAND'; }))[2] + 2 : 30)), H = y + rowH + 9;
    sc.push({ k: 'poly', p: [[1, H - 6.5], [6, H - 6.5], [6, H - 1.5], [1, H - 1.5]], c: 1, w: .06, L: 'MARK' }, { k: 'text', x: 3.5, y: H - 3.7, s: .7, t: '5 cm square', a: 'middle', L: 'TEXT' });
    sc.push({ k: 'text', x: 7.5, y: H - 4.6, s: 1.2, t: title + ' · ' + sizeLab + ' · ' + cd + ' · ' + NP + ' pieces', b: 1, L: 'TEXT' }, { k: 'text', x: 7.5, y: H - 3, s: .75, t: 'Pattern by FORECUT · forecut.in · engine ' + VER + ' · ' + new Date().toISOString().slice(0, 10) + ' · print at 100%, check the 5 cm square · test in calico before cutting good fabric', col: '#a9481f', L: 'BRAND' });
    return { sc: sc, W: W, H: H, title: title + ' - ' + sizeLab, r: r };
  }
  function pip(pt, poly) { var c = false; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { var a = poly[i], b = poly[j]; if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
  function grid(W, H) { var st = S.unit === 'in' ? 2.54 : 1, g = '<g stroke="#ece4d8" stroke-width=".03">'; for (var x = 0, i = 0; x <= W; x += st, i++) g += '<path d="M' + x.toFixed(2) + ' 0V' + H + '"' + (i % 5 ? '' : ' stroke="#d9cdbd" stroke-width=".06"') + '/>'; for (var y = 0, j = 0; y <= H; y += st, j++) g += '<path d="M0 ' + y.toFixed(2) + 'H' + W + '"' + (j % 5 ? '' : ' stroke="#d9cdbd" stroke-width=".06"') + '/>'; return g + '</g>'; }

  function pieceTable() {
    var r = built; if (!r) return; var nOn = 0;
    $('#pm-pieces').innerHTML = r.pieces.map(function (p) {
      var st = S.pc[p.id] || {}, on = st.on !== false, sa = st.sa !== undefined ? st.sa : S.sa, ha = st.hem !== undefined ? st.hem : (p.defHem !== undefined ? p.defHem : S.hemA), hasHem = p.edges.some(function (e) { return e.t === 'hem'; });
      return '<div class="pcard' + (on ? '' : ' off') + '"><label class="t"><input type="checkbox" data-p="' + p.id + '" data-f="on"' + (on ? ' checked' : '') + ' aria-label="Include ' + p.comp + '"><code>' + (on ? String(++nOn).padStart(2, '0') : '––') + '</code><b>' + p.comp + '</b><small>' + p.cut + '</small></label>'
        + '<label class="nm"><span>Label on pattern</span><input type="text" data-p="' + p.id + '" data-f="name" value="' + (st.name || p.auto).replace(/"/g, '&quot;') + '"></label>'
        + '<div class="a"><label>Seam' + uinp('data-p="' + p.id + '" data-f="sa"', U(sa)) + '</label>' + (hasHem ? '<label>Hem' + uinp('data-p="' + p.id + '" data-f="hem"', U(ha)) + '</label>' : '<label>Hem<input disabled value="–"></label>') + '</div></div>';
    }).join('');
    $$('#pm-pieces [data-p]').forEach(function (e) { e.oninput = e.onchange = function () { var st = S.pc[e.dataset.p] || (S.pc[e.dataset.p] = {}), f = e.dataset.f; if (f === 'on') { st.on = e.checked; draw(); return; } else if (f === 'name') st.name = e.value; else st[f] = cm(parseFloat(e.value) || 0); draw(true); }; });
  }
  /* ---------- view: zoom and pan ---------- */
  var view = $('#pm-view'), ZR = 1, last = null;
  function fitZ(W, H) { var w = Math.max(200, view.offsetWidth - 72), h = Math.max(200, view.offsetHeight - 72); return Math.min(w / W, h / H); }
  function applyZoom() { if (!last) return; var z = fitZ(last.W, last.H) * ZR, sv = $('#pm-svg svg'); if (!sv) return; sv.style.width = (last.W * z).toFixed(0) + 'px'; sv.style.height = (last.H * z).toFixed(0) + 'px'; $('#pm-zl').textContent = Math.round(ZR * 100) + '%'; if (typeof rulers === 'function') requestAnimationFrame(rulers); }
  function zoom(f, cx, cy) { var old = ZR; ZR = Math.max(.25, Math.min(8, ZR * f)); if (cx === undefined) { cx = view.clientWidth / 2; cy = view.clientHeight / 2; } var sx = (view.scrollLeft + cx) / (view.scrollWidth || 1), sy = (view.scrollTop + cy) / (view.scrollHeight || 1); applyZoom(); view.scrollLeft = sx * view.scrollWidth - cx; view.scrollTop = sy * view.scrollHeight - cy; }
  $('#pm-zin').onclick = function () { zoom(1.25); }; $('#pm-zout').onclick = function () { zoom(.8); }; $('#pm-zfit').onclick = function () { ZR = 1; applyZoom(); view.scrollTo(0, 0); };
  view.addEventListener('wheel', function (e) { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); var r = view.getBoundingClientRect(); zoom(e.deltaY < 0 ? 1.12 : .89, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  var pan = null;
  view.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.button !== 0) return; pan = [e.clientX, e.clientY, view.scrollLeft, view.scrollTop]; view.classList.add('drag'); });
  window.addEventListener('pointermove', function (e) { if (!pan) return; view.scrollLeft = pan[2] - (e.clientX - pan[0]); view.scrollTop = pan[3] - (e.clientY - pan[1]); });
  window.addEventListener('pointerup', function () { pan = null; view.classList.remove('drag'); });
  document.addEventListener('keydown', function (e) { if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName) || app.hidden) return; if (e.key === '+' || e.key === '=') zoom(1.25); else if (e.key === '-') zoom(.8); else if (e.key === '0') $('#pm-zfit').click(); });
  /* refit when the stage itself changes size; deferred a frame and ignoring scrollbar-only changes so it never loops */
  var vw = 0, vh = 0, raf = 0;
  function onResize() { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { var w = view.offsetWidth, h = view.offsetHeight; if (Math.abs(w - vw) < 2 && Math.abs(h - vh) < 2) return; vw = w; vh = h; applyZoom(); }); }
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(view); else window.addEventListener('resize', onResize);

  function crumb() {
    var sz = S.size === 'custom' ? 'Custom' : S.size;
    $('#pm-ttl').innerHTML = '<span>' + PM.GENDER[S.gender] + '</span><i>/</i><b>' + PM.GARMENTS[S.gid].n + '</b><i>/</i><span>' + sz + '</span><code title="Style code, printed on every piece">' + code() + '</code>' + (S.detail ? '<i>/</i><span title="Forecut detail">' + S.detail + '</span>' : '');
    $('#pm-gname').textContent = PM.GARMENTS[S.gid].n;
  }
  /* rulers and cursor read-out, in the current unit, from the sheet's top-left corner */
  var mouse = null;
  function rulers() {
    var sv = $('#pm-svg svg'); if (!sv || !last) return; var vr = $('#pm-rx').getBoundingClientRect(), hr = $('#pm-ry').getBoundingClientRect(), sr = sv.getBoundingClientRect(), ppc = sr.width / last.W;
    V.ruler($('#pm-rx'), true, sr.left - vr.left, ppc, S.unit, mouse ? mouse[0] - vr.left : null);
    V.ruler($('#pm-ry'), false, sr.top - hr.top, ppc, S.unit, mouse ? mouse[1] - hr.top : null);
    $('#pm-ru').textContent = S.unit;
    var xy = $('#pm-xy'); if (xy) xy.textContent = mouse ? 'X ' + U((mouse[0] - sr.left) / ppc) + '  Y ' + U((mouse[1] - sr.top) / ppc) + ' ' + S.unit : '';
  }
  view.addEventListener('scroll', function () { requestAnimationFrame(rulers); });
  view.addEventListener('mousemove', function (e) { mouse = [e.clientX, e.clientY]; requestAnimationFrame(rulers); });
  view.addEventListener('mouseleave', function () { mouse = null; requestAnimationFrame(rulers); });
  /* A4 page preview, drawn from the same tiling the PDF export uses */
  var TILES = false;
  function tilesSvg(sc, W, H) {
    var T = X.tiles(sc, W, H), g = '';
    T.list.forEach(function (t) { var x = t.x, y = t.y, w = T.cw, h = T.ch;
      g += '<path d="M' + x + ' ' + y + 'h' + w + 'v' + h + 'h-' + w + 'Z" fill="' + (t.blank ? '#1b1d20' : '#e08a5e') + '" fill-opacity="' + (t.blank ? .07 : .035) + '" stroke="' + (t.blank ? '#9da3aa' : '#a9481f') + '" stroke-width=".05" data-l="TILE"/>'
        + '<text x="' + (x + .6) + '" y="' + (y + 1.9) + '" font-size="1.5" font-weight="700" font-family="DM Sans,sans-serif" fill="' + (t.blank ? '#9da3aa' : '#a9481f') + '">' + t.id + '</text>' + (t.blank ? '<text x="' + (x + .6) + '" y="' + (y + 3.1) + '" font-size=".9" font-family="DM Sans,sans-serif" fill="#9da3aa">not printed</text>' : ''); });
    return { g: g, T: T };
  }
  function draw(keepTable) {
    var s = scene(false); last = s; var tl = null, svg = X.svg(s.sc, s.W, s.H, S.unit, { screen: 1, grid: $('#pm-grid').checked ? grid(s.W, s.H) : '' });
    if (TILES) { tl = tilesSvg(s.sc, s.W, s.H); svg = svg.replace('</svg>', tl.g + '</svg>'); }
    $('#pm-svg').innerHTML = svg;
    applyZoom();
    var T = tl ? tl.T : X.tiles(s.sc, s.W, s.H); $('#pm-tilecount').textContent = T.pages + ' A4 pages (' + T.rows + ' rows × ' + T.cols + ' columns, blanks skipped). Print at 100%.';
    var info = s.r.info, num = function (v) { return typeof v === 'number' ? U(v) + ' ' + S.unit : v; };
    $('#pm-info').innerHTML = Object.keys(info).map(function (k) { return '<div><span>' + k + '</span><b>' + num(info[k]) + '</b></div>'; }).join('') + '<div><span>Sheet</span><b>' + U(s.W) + ' × ' + U(s.H) + ' ' + S.unit + '</b></div>';
    var ck = V.checks(s.r, S, U, S.gid), ok = ck.filter(function (c) { return c.ok; }).length;
    $('#pm-checks').innerHTML = ck.map(function (c) { return '<div class="ckr ' + (c.ok ? 'ok' : 'w') + '">' + IC(c.ok ? 'check' : 'warn') + '<b>' + c.t + '</b><em>' + c.v + '</em><span>' + c.why + '</span></div>'; }).join('');
    var qa = $('#pm-qa'); qa.className = 'qa' + (ok === ck.length ? '' : ' w'); qa.innerHTML = IC(ok === ck.length ? 'check' : 'warn') + (ok === ck.length ? ck.length + '/' + ck.length + ' checks passed' : (ck.length - ok) + ' check' + (ck.length - ok > 1 ? 's' : '') + ' to review');
    var on = s.r.pieces.filter(function (p) { return (S.pc[p.id] || {}).on !== false; }).length;
    $('#pm-spec').innerHTML = [['Style code', code()], ['Garment', PM.GENDER[S.gender] + ' · ' + PM.GARMENTS[S.gid].n], ['Size', S.size === 'custom' ? 'Custom measurements' : S.size + ' (Forecut base chart)'], ['Pieces', on + ' of ' + s.r.pieces.length], ['Allowances', 'seam ' + U(S.sa) + ', hem ' + U(S.hemA) + ' ' + S.unit + (S.sa ? '' : ' (net pattern)')], ['Checks', ok + ' of ' + ck.length + ' passed'], ['Engine', 'Forecut pattern engine ' + VER]].map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
    try { $('#pm-flat').innerHTML = V.flat(s.r, S.o, S.gid, S.m); } catch (e) { $('#pm-flat').innerHTML = ''; }
    $('#pm-status').innerHTML = '<span><b>' + on + '</b> pieces</span><span>Sheet <b>' + U(s.W) + ' × ' + U(s.H) + ' ' + S.unit + '</b></span><span><b>' + T.pages + '</b> A4 pages</span><span>SA <b>' + U(S.sa) + '</b> · Hem <b>' + U(S.hemA) + '</b></span><span class="xy" id="pm-xy"></span>';
    crumb();
    if (!keepTable) pieceTable();
    requestAnimationFrame(rulers);
    FC.save('pm2', S);
  }
  var ICONS = { check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', warn: '<path d="M12 4 2.5 20h19zM12 10v4.5M12 17.5v.01"/>' };
  function IC(k) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[k] + '</svg>'; }
  function units() { $$('#pm-units button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.u === S.unit); }); $$('.pl .u').forEach(function (i) { i.textContent = S.unit; }); }
  function ui(fit) { genderTabs(); detailPicker(); measForm(); optForm(); units(); $('#pm-sa').value = U(S.sa); $('#pm-hemall').value = U(S.hemA); if (fit) ZR = 1; draw(); }
  $$('#pm-units button').forEach(function (b) { b.onclick = function () { S.unit = b.dataset.u; ui(); }; });
  $('#pm-sa').oninput = function () { S.sa = cm(parseFloat(this.value) || 0); draw(); };
  $('#pm-hemall').oninput = function () { S.hemA = cm(parseFloat(this.value) || 0); draw(); };
  $('#pm-apply').onclick = function () { Object.keys(S.pc).forEach(function (k) { delete S.pc[k].sa; delete S.pc[k].hem; }); draw(); toast('Allowances applied to every piece.'); };
  $('#pm-nosa').onclick = function () { S.sa = 0; S.hemA = 0; Object.keys(S.pc).forEach(function (k) { delete S.pc[k].sa; delete S.pc[k].hem; }); ui(); toast('Net pattern: allowances removed.'); };
  $('#pm-resetnames').onclick = function () { Object.keys(S.pc).forEach(function (k) { delete S.pc[k].name; }); draw(); };
  $('#pm-gridb').onclick = function () { var c = $('#pm-grid'); c.checked = !c.checked; this.setAttribute('aria-pressed', c.checked); draw(true); };
  $('#pm-grid').onchange = function () { draw(true); };
  $('#pm-tilesb').onclick = function () { TILES = !TILES; this.setAttribute('aria-pressed', TILES); draw(true); if (TILES) toast($('#pm-tilecount').textContent); };
  $('#pm-qa').onclick = function () { $('.rt button[data-t=checks]').click(); };
  /* right panel tabs */
  $$('.rt button').forEach(function (b) { b.onclick = function () { $$('.rt button').forEach(function (x) { x.setAttribute('aria-selected', x === b); }); $$('.pr [data-tp]').forEach(function (p) { p.hidden = p.dataset.tp !== b.dataset.t; }); }; });
  /* export menu */
  var menu = $('#pm-menu'), eb = $('#pm-exp');
  function menuOpen(v) { menu.hidden = !v; eb.setAttribute('aria-expanded', v); if (v) menu.querySelector('button').focus(); }
  eb.onclick = function (e) { e.stopPropagation(); menuOpen(menu.hidden); };
  document.addEventListener('click', function (e) { if (!menu.hidden && !menu.contains(e.target)) menuOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { menuOpen(false); eb.focus(); } });
  var tt = null;
  function toast(t) { var m = $('#pm-msg'); m.textContent = t; m.hidden = false; clearTimeout(tt); tt = setTimeout(function () { m.hidden = true; }, 4500); }
  function fname(ext) { return 'forecut-' + (built ? built.label : 'pattern').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + String(S.size).toLowerCase() + '.' + ext; }
  function dl(f) { return function () { menuOpen(false); f(); }; }
  $('#pm-dl-svg').onclick = dl(function () { var s = scene(true); FC.download(fname('svg'), X.svg(s.sc, s.W, s.H, S.unit, { title: s.title }), 'image/svg+xml'); toast('SVG downloaded at true scale.'); });
  $('#pm-dl-dxf').onclick = dl(function () { var s = scene(true); FC.download(fname('dxf'), X.dxf(s.sc, s.W, s.H, S.unit === 'in' ? 'in' : 'mm'), 'application/dxf'); toast('DXF downloaded (' + (S.unit === 'in' ? 'inches' : 'millimetres') + ').'); });
  $('#pm-dl-png').onclick = dl(function () { var s = scene(true); X.png(X.svg(s.sc, s.W, s.H, S.unit, { title: s.title }), s.W, s.H, function (b) { FC.download(fname('png'), b); }); toast('PNG downloaded.'); });
  $('#pm-dl-pdf').onclick = dl(function () { var s = scene(true), r = X.pdf(s.sc, s.W, s.H, 'tiles', { title: s.title }); FC.download(fname('pdf'), r.blob); toast('PDF ready: ' + r.pages + ' A4 pages. Print at 100% / actual size.'); });
  $('#pm-dl-pdf2').onclick = dl(function () { var s = scene(true), r = X.pdf(s.sc, s.W, s.H, 'sheet', { title: s.title }); FC.download(fname('sheet.pdf'), r.blob); toast('Full-size PDF ready (' + U(s.W) + ' × ' + U(s.H) + ' ' + S.unit + ') for a plotter or copy shop.'); });
  window.PM_UI = { scene: scene, state: function () { return S; }, applyDetail: applyDetail };
  /* deep link from a Forecut detail: pattern-maker.html?detail=<name> */
  var qs = new URLSearchParams(location.search), qd = qs.get('detail');
  if (qd) { var d = DET.filter(function (x) { return x[0].toLowerCase() === qd.toLowerCase(); })[0]; if (d) { S.gender = d[2]; S.gid = d[3]; resetMeas(); resetOpts(); Object.keys(d[4]).forEach(function (k) { S.o[k] = d[4][k]; }); S.detail = d[0]; S.pc = {}; } }
  ui(true);
})();
