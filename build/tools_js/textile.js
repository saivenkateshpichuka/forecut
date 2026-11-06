/* Forecut textile calculator */
(function () {
  var $ = FC.$, $$ = FC.$$, n = FC.num;
  FC.tabs($('#tc'));
  function bind(pane, fn) { $$('input,select', pane).forEach(function (e) { e.addEventListener('input', fn); e.addEventListener('change', fn); }); fn(); }

  /* 1. Fabric consumption: typical size-M estimates at 44"/112 cm and 58"/147 cm width */
  var G = window.FC_GARMENTS, SIZE = { XS: .9, S: .95, M: 1, L: 1.06, XL: 1.12, XXL: 1.2, '3XL': 1.28 };
  var gs = $('#c-g'); G.forEach(function (g, i) { var o = document.createElement('option'); o.value = i; o.textContent = g[0]; gs.appendChild(o); });
  function cons(g, wcm) {
    var a = g[1], b = g[2]; if (g[3]) return a;               // fixed-length piece (dupatta)
    if (wcm >= 147) return b * Math.pow(147 / wcm, .5);
    if (wcm >= 112) return a + (b - a) * (wcm - 112) / 35;    // between 44" and 58"
    return a * Math.pow(112 / wcm, .85);                       // narrower than 44"
  }
  bind($('[data-pane=cons]'), function () {
    var g = G[+gs.value], w = n($('#c-w')), sz = SIZE[$('#c-s').value], q = Math.max(1, n($('#c-q'))), sh = n($('#c-sh')) / 100, ws = n($('#c-wa')) / 100, pr = n($('#c-p'));
    var own = n($('#c-own')), base = own > 0 ? own : cons(g, w) * (g[3] ? 1 : sz);
    var per = base / (1 - Math.min(sh, .5)) * (1 + ws), tot = per * q;
    $('#c-note').textContent = g[4];
    $('#c-per').textContent = FC.fmt(per) + ' m'; $('#c-peryd').textContent = FC.fmt(per * 1.0936) + ' yd';
    $('#c-tot').textContent = FC.fmt(tot, 1) + ' m'; $('#c-totyd').textContent = FC.fmt(tot * 1.0936, 1) + ' yd';
    $('#c-base').textContent = FC.fmt(base) + ' m';
    $('#c-cost').textContent = pr > 0 ? FC.inr(per * pr) + ' a piece · ' + FC.inr(tot * pr) + ' in all' : 'Add a price per metre to see the fabric cost';
  });

  /* 2. GSM & weight */
  bind($('[data-pane=gsm]'), function () {
    var g = n($('#g-g')), sh = $('#g-shape').value, a = sh === 'circle' ? 100 : n($('#g-a')) * n($('#g-b'));
    var gsm = a > 0 ? g / (a / 10000) : 0; $('#g-out').textContent = gsm ? FC.fmt(gsm, 0) + ' GSM' : '–';
    $('#g-oz').textContent = gsm ? FC.fmt(gsm / 33.906) + ' oz/yd²' : '';
    $('#g-ab').hidden = sh === 'circle';
    var G2 = n($('#w-gsm')), W = n($('#w-w')) / 100, L = n($('#w-l')), pk = n($('#w-pk')), pm = n($('#w-pm'));
    var kgm = G2 * W / 1000;
    $('#w-kg').textContent = kgm ? FC.fmt(kgm * L, 2) + ' kg' : '–';
    $('#w-mpk').textContent = kgm ? FC.fmt(1 / kgm, 2) + ' m per kg' : '–';
    $('#w-conv').textContent = kgm ? (pk ? FC.inr(pk * kgm) + ' per metre (from ₹' + pk + '/kg)' : '') + (pk && pm ? ' · ' : '') + (pm ? FC.inr(pm / kgm) + ' per kg (from ₹' + pm + '/m)' : '') : '';
    var oz = n($('#o-oz')); $('#o-out').textContent = oz ? FC.fmt(oz * 33.906, 0) + ' GSM' : '–';
  });

  /* 3. Yarn count */
  var Y = ['ne', 'nm', 'tex', 'den', 'dtex'];
  function fromTex(t) { return { ne: 590.5 / t, nm: 1000 / t, tex: t, den: 9 * t, dtex: 10 * t }; }
  function toTex(k, v) { return { ne: 590.5 / v, nm: 1000 / v, tex: v, den: v / 9, dtex: v / 10 }[k]; }
  Y.forEach(function (k) {
    $('#y-' + k).addEventListener('input', function () {
      var v = n(this); if (!(v > 0)) return; var r = fromTex(toTex(k, v));
      Y.forEach(function (j) { if (j !== k) $('#y-' + j).value = +r[j].toFixed(j === 'ne' || j === 'nm' ? 1 : 2); });
    });
  });
  bind($('[data-pane=yarn] .woven'), function () {
    var epi = n($('#f-epi')), ppi = n($('#f-ppi')), wa = n($('#f-wa')), we = n($('#f-we')), cw = n($('#f-cw')) / 100, cf = n($('#f-cf')) / 100;
    if (!(wa > 0 && we > 0)) { $('#f-out').textContent = '–'; return; }
    var gw = epi * 39.37 * (590.5 / wa) / 1000 * (1 + cw), gf = ppi * 39.37 * (590.5 / we) / 1000 * (1 + cf);
    $('#f-out').textContent = FC.fmt(gw + gf, 0) + ' GSM'; $('#f-split').textContent = 'Warp ' + FC.fmt(gw, 0) + ' + weft ' + FC.fmt(gf, 0) + ' g/m², before finishing';
  });

  /* 4. Shrinkage */
  bind($('[data-pane=shrink]'), function () {
    var b = n($('#s-b')), a = n($('#s-a')), s = b > 0 ? (b - a) / b * 100 : 0;
    $('#s-out').textContent = b > 0 && a > 0 ? FC.fmt(s, 1) + '%' : '–';
    $('#s-verdict').textContent = b > 0 && a > 0 ? (s <= 3 ? 'Within the 3% most buyers accept for wovens.' : s <= 5 ? 'Typical for untreated cotton and knits; allow for it when cutting.' : 'High: consider pre-shrinking (sanforising or washing) before cutting.') : '';
    var f = n($('#s-f')), p = n($('#s-p')) / 100; $('#s-cut').textContent = f > 0 && p < 1 ? FC.fmt(f / (1 - p), 1) + ' cm to cut' : '–';
  });

  /* 5. Costing */
  bind($('[data-pane=cost]'), function () {
    var fab = n($('#k-c')) * n($('#k-p')), tr = n($('#k-t')), cmt = n($('#k-cmt')), pk = n($('#k-pk')), oh = n($('#k-oh')) / 100;
    var cost = (fab + tr + cmt + pk) * (1 + oh), ws = cost * (1 + n($('#k-m')) / 100), rt = ws * (1 + n($('#k-r')) / 100), gst = n($('#k-g')) / 100, mrp = rt * (1 + gst);
    $('#k-fab').textContent = FC.inr(fab); $('#k-cost').textContent = FC.inr(cost); $('#k-ws').textContent = FC.inr(ws); $('#k-rt').textContent = FC.inr(rt); $('#k-mrp').textContent = FC.inr(Math.ceil(mrp / 10) * 10 - 1);
    var tot = fab + tr + cmt + pk || 1, parts = [['Fabric', fab, '#1f3d33'], ['Trims', tr, '#a9481f'], ['CMT', cmt, '#d99a00'], ['Packing', pk, '#6d4fc2']];
    $('#k-bar').innerHTML = parts.map(function (p) { return '<i style="flex:' + Math.max(p[1], .0001) + ';background:' + p[2] + '" title="' + p[0] + '"></i>'; }).join('');
    $('#k-key').innerHTML = parts.map(function (p) { return '<span><i style="background:' + p[2] + '"></i>' + p[0] + ' ' + Math.round(p[1] / tot * 100) + '%</span>'; }).join('');
  });
  $('#k-from').addEventListener('click', function () {
    var t = $('#c-per').textContent.match(/[\d.,]+/), p = n($('#c-p'));
    if (t) $('#k-c').value = parseFloat(t[0].replace(/,/g, '')); if (p) $('#k-p').value = p; $('#k-c').dispatchEvent(new Event('input'));
  });
})();
