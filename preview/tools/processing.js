/* Forecut Textile Processing Studio: dye recipe and batch cost, fibre colour blend, processing route and cost. Runs in the browser; nothing is uploaded. */
(function () {
  'use strict';
  var D = window.ForecutProcessing, KEY = 'fc-tool-processing', app = document.getElementById('app');
  if (!D || !app) return;
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function num(v, d) { v = parseFloat(v); return isFinite(v) ? v : (d || 0); }
  function inr(v) { return '₹' + (Math.round(v * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function g(v) { return v >= 1000 ? (v / 1000).toLocaleString('en-IN', { maximumFractionDigits: 2 }) + ' kg' : (Math.round(v * 10) / 10).toLocaleString('en-IN') + ' g'; }

  // example chemical prices, INR per kg, shown as editable examples
  var CHEM_PRICE = { 'Salt': 8, 'Soda ash': 35, 'Sequestering': 150, 'Levelling': 200, 'Soaping': 180, 'Caustic': 60, 'hydrosulphite': 120, 'Hydrogen peroxide': 60, 'Acetic': 70, 'Dispersing': 180, 'Glauber': 12, 'Binder': 150, 'Fixer': 250, 'fixing agent': 250, 'Softener': 120, 'Alum': 60, 'Tannin': 120, 'Iron': 40, 'Retarder': 300, 'Reducing': 80, 'Oxidising': 90, 'Ammonia': 60 };
  function chemPrice(name) { for (var k in CHEM_PRICE) if (name.toLowerCase().indexOf(k.toLowerCase()) > -1) return CHEM_PRICE[k]; return 100; }

  function defaults() {
    return { v: 1, tab: 'recipe', name: 'My collection',
      recipe: { ref: '', fibre: 'Cotton', cls: 'Reactive', weight: 100, lr: 8, dyes: [{ name: 'C.I. Reactive Blue 222', pct: 1.5, price: 900 }, { name: 'C.I. Reactive Black 5', pct: 0.3, price: 450 }], aux: null,
        water: 60, energy: 2.5, effl: 80, mach: 600, extraH: 1.5, job: 0 },
      blend: { parts: [{ fibre: 'Cotton', pct: 40, hex: '#2b4c8c' }, { fibre: 'Polyester', pct: 60, hex: '#3a66b8' }] },
      route: { gsm: 180, width: 150, loss: 3, sel: { 'Desizing (enzyme)': 1, 'Scouring': 1, 'Bleaching (peroxide)': 1, 'Exhaust dyeing (jet / winch)': 1, 'Softener finish (stenter)': 1, 'Sanforising (compacting)': 1 }, rates: {} },
      custom: [] };
  }
  var S;
  try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { S = null; }
  if (!S || S.v !== 1) S = defaults();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); var st = $('#status'); if (st) st.textContent = 'Saved in this browser'; } catch (e) {} }

  /* ---------- colour maths: blending in linear light approximates how separate coloured fibres mix to the eye ---------- */
  function toLin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function toS(c) { c = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; return Math.max(0, Math.min(255, Math.round(c * 255))); }
  function rgb(hex) { hex = String(hex).replace('#', ''); if (hex.length === 3) hex = hex.replace(/./g, '$&$&'); var n = parseInt(hex, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function hex(r) { return '#' + r.map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
  function mix(list) { // [[hex, weight]]
    var t = 0, a = [0, 0, 0]; list.forEach(function (p) { var c = rgb(p[0]); t += p[1]; for (var i = 0; i < 3; i++) a[i] += toLin(c[i]) * p[1]; });
    if (!t) return '#ffffff'; return hex(a.map(function (x) { return toS(x / t); }));
  }
  // subtractive-style mix of dyes in one bath: multiply reflectances, weighted by share
  function dyeMix(list) {
    var t = list.reduce(function (s, p) { return s + p[1]; }, 0); if (!t) return '#ffffff';
    var a = [1, 1, 1]; list.forEach(function (p) { var c = rgb(p[0]), w = p[1] / t; for (var i = 0; i < 3; i++) a[i] *= Math.pow(Math.max(0.001, toLin(c[i])), w); });
    return hex(a.map(toS));
  }
  function depthShade(h, pct) { // paler for light shades, full hue near 2–3 %, deeper beyond
    var f = 1 - Math.exp(-pct / 0.6), c = rgb(h), out = c.map(function (x) { var l = toLin(x); return toS(1 + (l - 1) * f); });
    if (pct > 3) { var k = Math.max(0.55, 1 - (pct - 3) * 0.06); out = out.map(function (x) { return toS(toLin(x) * k); }); }
    return hex(out);
  }
  function lum(h) { var c = rgb(h).map(toLin); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  function inkOn(h) { return lum(h) > 0.35 ? '#1c1714' : '#ffffff'; }

  function allDyes() { return D.DYES.map(function (d) { return { name: d[0], cls: d[1], hue: d[2], hex: d[3] }; }).concat((S.custom || []).map(function (c) { return { name: c.name, cls: c.cls, hue: 'Your dye', hex: c.hex, own: 1 }; })); }
  function findDye(n) { var a = allDyes(); for (var i = 0; i < a.length; i++) if (a[i].name === n) return a[i]; return null; }

  /* ---------- tab 1: dye recipe ---------- */
  function band(pct) { return pct < 1 ? 0 : pct <= 3 ? 1 : 2; }
  function ensureAux() {
    var R = S.recipe, C = D.CLASSES[R.cls]; if (!C) return;
    var total = R.dyes.reduce(function (s, d) { return s + num(d.pct); }, 0), b = band(total);
    if (!R.aux || R.auxFor !== R.cls + '|' + b) { R.aux = C.aux.map(function (a) { return { name: a[0], unit: a[1], amt: a[2][b], price: chemPrice(a[0]) }; }); R.auxFor = R.cls + '|' + b; }
  }
  function recipeCalc() {
    var R = S.recipe, C = D.CLASSES[R.cls] || {}, kg = num(R.weight), lr = C.lr === 0 ? 0 : num(R.lr), L = kg * lr, rows = [], dyeCost = 0, chemCost = 0;
    R.dyes.forEach(function (d) { var gr = kg * 1000 * num(d.pct) / 100, c = gr / 1000 * num(d.price); dyeCost += c; rows.push({ n: d.name, q: gr, c: c }); });
    var chem = (R.aux || []).map(function (a) { var gr = a.unit === 'g/L' ? num(a.amt) * L : kg * 1000 * num(a.amt) / 100, c = gr / 1000 * num(a.price); chemCost += c; return { n: a.name, q: gr, c: c, unit: a.unit, amt: a.amt }; });
    var T = C.temp || 60, heatKWh = lr ? L * Math.max(0, T - 25) * 4.186 / 3600 / 0.6 : kg * 0.5, energy = heatKWh * num(R.energy);
    var water = L * 3 / 1000 * num(R.water), effl = L * 3 / 1000 * num(R.effl), hours = (C.time || 60) / 60 + num(R.extraH), mach = hours * num(R.mach);
    var total = dyeCost + chemCost + energy + water + effl + mach;
    var swatch = dyeMix(R.dyes.filter(function (d) { return findDye(d.name); }).map(function (d) { return [findDye(d.name).hex, num(d.pct)]; }));
    var depth = R.dyes.reduce(function (s, d) { return s + num(d.pct); }, 0);
    return { C: C, kg: kg, L: L, rows: rows, chem: chem, dyeCost: dyeCost, chemCost: chemCost, energy: energy, heat: heatKWh, water: water, effl: effl, mach: mach, hours: hours, total: total, perKg: kg ? total / kg : 0, swatch: depthShade(swatch, depth), depth: depth };
  }
  function recipeView() {
    var R = S.recipe; ensureAux();
    var classes = D.FIBRES[R.fibre] || Object.keys(D.CLASSES);
    if (classes.indexOf(R.cls) < 0) { R.cls = classes[0]; R.lr = D.CLASSES[R.cls].lr || 8; ensureAux(); }
    var C = D.CLASSES[R.cls];
    return '<section class="panel"><h2>1. Batch</h2><div class="fields">' +
      inp('recipe.ref', 'Batch or customer reference', R.ref, 'text', 'e.g. FC-001 navy') +
      sel('recipe.fibre', 'Fibre', R.fibre, Object.keys(D.FIBRES)) +
      sel('recipe.cls', 'Dye class', R.cls, classes) +
      inp('recipe.weight', 'Dry fabric weight (kg)', R.weight, 'number') +
      (C.lr === 0 ? '' : inp('recipe.lr', 'Liquor ratio (1 : x)', R.lr, 'number')) +
      '</div><p class="note">' + esc(R.cls) + ' dyes suit: ' + esc(C.fibres) + '. Typical conditions: ' + esc(C.tempNote) + ', pH ' + esc(C.ph) + '.</p></section>' +
      '<section class="panel"><div class="panel-head"><h2>2. Dyes</h2></div>' +
      '<div class="pr-dyes">' + R.dyes.map(function (d, i) {
        var f = findDye(d.name);
        return '<div class="pr-dye"><span class="pr-chip" style="background:' + (f ? f.hex : '#ddd') + '"></span><label>Dye<input data-k="recipe.dyes.' + i + '.name" value="' + esc(d.name) + '" list="pr-dyelist"></label>' +
          '<label>Shade % owf<input type="number" step="0.01" min="0" data-k="recipe.dyes.' + i + '.pct" value="' + esc(d.pct) + '"></label><label>Price ₹/kg<input type="number" min="0" data-k="recipe.dyes.' + i + '.price" value="' + esc(d.price) + '"></label>' +
          '<button type="button" class="pr-x" data-act="rmdye" data-i="' + i + '" aria-label="Remove dye">×</button></div>';
      }).join('') + '</div><datalist id="pr-dyelist">' + allDyes().filter(function (d) { return d.cls === R.cls || d.own; }).map(function (d) { return '<option value="' + esc(d.name) + '">' + esc(d.hue) + '</option>'; }).join('') + '</datalist>' +
      '<div class="actions"><button type="button" data-act="adddye">+ Add a dye</button><button type="button" data-act="lib">Search the dye library</button></div>' +
      '<p class="note">Shade % owf = grams of dye per 100 g of dry fabric. Dye prices are examples: enter your supplier’s.</p></section>' +
      '<section class="panel"><h2>3. Chemicals and auxiliaries</h2><p class="note">Filled in for ' + esc(R.cls) + ' dyeing at a ' + ['light', 'medium', 'dark'][band(R.dyes.reduce(function (s, d) { return s + num(d.pct); }, 0))] + ' shade. Change any amount to match your supplier’s recipe.</p>' +
      '<div class="table-scroll"><table class="pr-t"><thead><tr><th>Chemical</th><th>Amount</th><th>Unit</th><th>Price ₹/kg</th></tr></thead><tbody>' + R.aux.map(function (a, i) {
        return '<tr><td>' + esc(a.name) + '</td><td><input type="number" step="0.1" min="0" data-k="recipe.aux.' + i + '.amt" value="' + esc(a.amt) + '"></td><td>' + esc(a.unit) + '</td><td><input type="number" min="0" data-k="recipe.aux.' + i + '.price" value="' + esc(a.price) + '"></td></tr>';
      }).join('') + '</tbody></table></div></section>' +
      '<section class="panel"><h2>4. Running costs</h2><div class="fields">' +
      inp('recipe.water', 'Water ₹ per 1,000 L', R.water, 'number') + inp('recipe.effl', 'Effluent treatment ₹ per 1,000 L', R.effl, 'number') +
      inp('recipe.energy', 'Heat energy ₹ per kWh', R.energy, 'number') + inp('recipe.mach', 'Machine and labour ₹ per hour', R.mach, 'number') +
      inp('recipe.extraH', 'Loading, rinsing and unloading (hours)', R.extraH, 'number') + inp('recipe.job', 'Job-work quote ₹ per kg (optional, to compare)', R.job, 'number') +
      '</div><p class="note">Water and effluent are counted for three baths (dyeing plus rinses and soaping). Heat = litres × (dye temperature − 25 °C) × 4.186 kJ, at 60% boiler efficiency. All rates are examples: enter your own.</p></section>' +
      '<aside class="pr-rail" id="prOut"></aside>';
  }
  function recipeOut() {
    var r = recipeCalc(), R = S.recipe, el = $('#prOut'); if (!el) return;
    el.innerHTML = '<div class="panel pr-card"><div class="pr-sw" style="background:' + r.swatch + ';color:' + inkOn(r.swatch) + '"><span>Approximate shade preview</span><b>' + r.depth.toFixed(2) + '% owf</b></div>' +
      '<div class="metrics"><div class="metric"><span>Cost per kg of fabric</span><strong>' + inr(r.perKg) + '</strong><small>Batch total ' + inr(r.total) + '</small></div>' +
      '<div class="metric"><span>Dye bath</span><strong>' + (r.L ? Math.round(r.L).toLocaleString('en-IN') + ' L' : 'Pad / print') + '</strong><small>' + esc(r.C.tempNote) + '</small></div>' +
      '<div class="metric"><span>Process time</span><strong>' + r.hours.toFixed(1) + ' h</strong><small>pH ' + esc(r.C.ph) + '</small></div></div>' +
      (num(R.job) > 0 ? '<p class="note"><b>' + (r.perKg <= num(R.job) ? 'In-house is ' + inr(num(R.job) - r.perKg) + ' per kg cheaper' : 'Job-work is ' + inr(r.perKg - num(R.job)) + ' per kg cheaper') + '</b> than the job-work quote of ' + inr(num(R.job)) + ' per kg.</p>' : '') +
      '<h3>Recipe for ' + esc(R.weight) + ' kg ' + esc(R.fibre.toLowerCase()) + '</h3><table class="pr-t"><tbody>' +
      r.rows.map(function (x) { return '<tr><td>' + esc(x.n) + '</td><td class="n">' + g(x.q) + '</td></tr>'; }).join('') +
      r.chem.map(function (x) { return '<tr><td>' + esc(x.n) + ' <small>(' + esc(x.amt) + ' ' + esc(x.unit) + ')</small></td><td class="n">' + g(x.q) + '</td></tr>'; }).join('') +
      '</tbody></table><h3>Cost breakdown</h3><table class="pr-t"><tbody>' +
      [['Dyes', r.dyeCost], ['Chemicals', r.chemCost], ['Heat energy (' + Math.round(r.heat) + ' kWh)', r.energy], ['Water', r.water], ['Effluent treatment', r.effl], ['Machine and labour', r.mach]].map(function (x) { return '<tr><td>' + esc(x[0]) + '</td><td class="n">' + inr(x[1]) + '</td></tr>'; }).join('') +
      '<tr class="tot"><td>Total</td><td class="n">' + inr(r.total) + '</td></tr></tbody></table>' +
      '<h3>Method</h3><ol class="pr-steps">' + r.C.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
      '<p class="note">A calculated starting point, not an approved production recipe. Always run a lab dip, follow the dye supplier’s instructions and safety data sheets, and treat effluent to local rules.</p></div>';
  }

  /* ---------- dye library (search) ---------- */
  function libView() {
    var R = S.recipe;
    return '<div class="pr-lib" role="dialog" aria-label="Dye library"><div class="panel"><div class="panel-head"><h2>Dye library</h2><button type="button" data-act="closelib">Close</button></div>' +
      '<div class="fields"><label>Search by name, colour or class<input id="prQ" type="search" placeholder="e.g. navy, reactive red, turmeric" autocomplete="off"></label>' +
      '<label>Dye class<select id="prQc"><option value="">All classes</option>' + Object.keys(D.CLASSES).map(function (c) { return '<option' + (c === R.cls ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select></label></div>' +
      '<div id="prRes" class="pr-res"></div>' +
      '<details class="pr-own"><summary>Add your supplier’s dye</summary><div class="fields"><label>Dye name (as on the supplier’s label)<input id="prOn" maxlength="80"></label><label>Dye class<select id="prOc">' + Object.keys(D.CLASSES).map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '</select></label><label>Approximate colour<input id="prOh" type="color" value="#2b4c8c"></label></div><div class="actions"><button type="button" data-act="addown">Save to my library</button></div><p class="note">Your dyes stay in this browser.</p></details>' +
      '<p class="note">The library lists dyes by their generic Colour Index (C.I.) names and common natural dyes, grouped by class. Suppliers sell each under their own brand names; colours here are approximate previews.</p></div></div>';
  }
  function libResults() {
    var q = ($('#prQ') || {}).value || '', c = ($('#prQc') || {}).value || '', R = S.recipe, ok = D.FIBRES[R.fibre] || [];
    q = q.trim().toLowerCase();
    var list = allDyes().filter(function (d) { return (!c || d.cls === c) && (!q || (d.name + ' ' + d.cls + ' ' + d.hue).toLowerCase().indexOf(q) > -1); });
    $('#prRes').innerHTML = list.length ? list.map(function (d) {
      var fits = ok.indexOf(d.cls) > -1;
      return '<div class="pr-hit"><span class="pr-chip" style="background:' + d.hex + '"></span><div><b>' + esc(d.name) + '</b><small>' + esc(d.cls) + ' · ' + esc(d.hue) + (fits ? '' : ' · not for ' + esc(R.fibre.toLowerCase())) + '</small></div>' +
        '<button type="button" data-act="pick" data-n="' + esc(d.name) + '"' + (fits ? '' : ' disabled') + '>Add</button></div>';
    }).join('') : '<p class="note">No dye matches. Add your supplier’s dye below.</p>';
  }

  /* ---------- tab 2: colour blend ---------- */
  function blendCalc() {
    var P = S.blend.parts, tot = P.reduce(function (s, p) { return s + num(p.pct); }, 0);
    var mel = mix(P.map(function (p) { return [p.hex, num(p.pct)]; }));
    var fibres = P.map(function (p) { return p.fibre; }), routes = [];
    for (var i = 0; i < fibres.length; i++) for (var j = i + 1; j < fibres.length; j++) { var k = [fibres[i], fibres[j]].sort().join('|'); if (D.BLENDS[k] && routes.indexOf(D.BLENDS[k]) < 0) routes.push(D.BLENDS[k]); }
    return { tot: tot, mel: mel, routes: routes };
  }
  function blendView() {
    var P = S.blend.parts;
    return '<section class="panel"><h2>Fibres and their colours</h2><p class="note">Choose each fibre, its share of the blend and the colour it is dyed. The preview shows how the colours mix to the eye when separately dyed fibres are blended into one yarn (a mélange or heather).</p>' +
      P.map(function (p, i) {
        return '<div class="pr-part"><input type="color" aria-label="Colour of part ' + (i + 1) + '" data-k="blend.parts.' + i + '.hex" value="' + esc(p.hex) + '">' +
          sel('blend.parts.' + i + '.fibre', 'Fibre', p.fibre, Object.keys(D.FIBRES)) + inp('blend.parts.' + i + '.pct', 'Share %', p.pct, 'number') +
          '<label>Colour from a dye<select data-pickhex="' + i + '"><option value="">Choose…</option>' + allDyes().filter(function (d) { return (D.FIBRES[p.fibre] || []).indexOf(d.cls) > -1; }).map(function (d) { return '<option value="' + d.hex + '">' + esc(d.name) + '</option>'; }).join('') + '</select></label>' +
          (P.length > 2 ? '<button type="button" class="pr-x" data-act="rmpart" data-i="' + i + '" aria-label="Remove fibre">×</button>' : '') + '</div>';
      }).join('') +
      (P.length < 4 ? '<div class="actions"><button type="button" data-act="addpart">+ Add a fibre</button></div>' : '') + '</section>' +
      '<aside class="pr-rail" id="prOut"></aside>';
  }
  function blendOut() {
    var b = blendCalc(), P = S.blend.parts, el = $('#prOut'); if (!el) return;
    el.innerHTML = '<div class="panel pr-card">' + (Math.abs(b.tot - 100) > 0.01 ? '<p class="pr-warn">Shares add up to ' + b.tot + '%. Make them total 100%.</p>' : '') +
      '<canvas id="prCanvas" width="560" height="300" aria-label="Simulated mélange fabric"></canvas>' +
      '<div class="pr-pair"><div class="pr-sw sm" style="background:' + b.mel + ';color:' + inkOn(b.mel) + '"><span>Blended colour seen from a distance</span><b>' + b.mel.toUpperCase() + '</b></div></div>' +
      '<h3>Components</h3><table class="pr-t"><tbody>' + P.map(function (p) { var cls = (D.FIBRES[p.fibre] || ['–'])[0]; return '<tr><td><span class="pr-chip sm" style="background:' + p.hex + '"></span>' + esc(p.pct) + '% ' + esc(p.fibre.toLowerCase()) + '</td><td class="n">' + esc(cls) + ' dye</td></tr>'; }).join('') + '</tbody></table>' +
      '<h3>How to make it</h3><ul class="pr-steps"><li><b>Mélange (fibre-dyed):</b> dye each fibre separately to its colour, then blend before spinning. Gives the speckled look shown.</li><li><b>Piece-dyed blend:</b> to get one solid colour on a blended fabric, each fibre needs its own dye class; match both to the same shade.</li>' +
      b.routes.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>' +
      '<p class="note">The preview mixes colours in linear light, which is how fine coloured fibres combine to the eye. Real results depend on fibre lustre, yarn count and twist: approve a knitted or woven swatch.</p></div>';
    drawFibres(P);
  }
  function drawFibres(P) {
    var cv = $('#prCanvas'); if (!cv || !cv.getContext) return; var x = cv.getContext('2d'), W = cv.width, H = cv.height, seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    x.fillStyle = mix(P.map(function (p) { return [p.hex, num(p.pct)]; })); x.fillRect(0, 0, W, H);
    var tot = P.reduce(function (s, p) { return s + num(p.pct); }, 0) || 1;
    for (var n = 0; n < 5200; n++) {
      var r = rnd() * tot, acc = 0, c = P[0].hex; for (var i = 0; i < P.length; i++) { acc += num(P[i].pct); if (r <= acc) { c = P[i].hex; break; } }
      var y = rnd() * H, x0 = rnd() * W, len = 14 + rnd() * 40, ang = (rnd() - 0.5) * 0.35;
      x.strokeStyle = c; x.globalAlpha = 0.55 + rnd() * 0.45; x.lineWidth = 0.8 + rnd() * 1.6; x.beginPath(); x.moveTo(x0, y); x.lineTo(x0 + Math.cos(ang) * len, y + Math.sin(ang) * len); x.stroke();
    }
    x.globalAlpha = 1;
  }

  /* ---------- tab 3: processing route and cost ---------- */
  function routeCalc() {
    var Rt = S.route, total = 0, water = 0, lines = [], dye = recipeCalc();
    D.STAGES.forEach(function (s) {
      if (!Rt.sel[s[1]]) return;
      var rate = s[1] === 'Exhaust dyeing (jet / winch)' ? dye.perKg : num(Rt.rates[s[1]] != null ? Rt.rates[s[1]] : s[2]);
      total += rate; water += s[3] + (s[1] === 'Exhaust dyeing (jet / winch)' ? num(S.recipe.lr) * 3 : 0); lines.push([s[0], s[1], rate]);
    });
    var withLoss = total / (1 - Math.min(30, num(Rt.loss)) / 100), kgPerM = num(Rt.gsm) * num(Rt.width) / 100 / 1000;
    return { lines: lines, total: total, withLoss: withLoss, perM: withLoss * kgPerM, kgPerM: kgPerM, water: water };
  }
  function routeView() {
    var Rt = S.route, groups = {};
    D.STAGES.forEach(function (s) { (groups[s[0]] = groups[s[0]] || []).push(s); });
    return '<section class="panel"><h2>Fabric</h2><div class="fields">' + inp('route.gsm', 'Fabric weight (GSM)', Rt.gsm, 'number') + inp('route.width', 'Width (cm)', Rt.width, 'number') + inp('route.loss', 'Process loss %', Rt.loss, 'number') + '</div></section>' +
      Object.keys(groups).map(function (gname) {
        return '<section class="panel"><h2>' + esc(gname) + '</h2>' + groups[gname].map(function (s) {
          var on = !!Rt.sel[s[1]], dy = s[1] === 'Exhaust dyeing (jet / winch)';
          return '<div class="pr-stage' + (on ? ' on' : '') + '"><label class="pr-chk"><input type="checkbox" data-stage="' + esc(s[1]) + '"' + (on ? ' checked' : '') + '><span><b>' + esc(s[1]) + '</b><small>' + esc(s[4]) + '</small></span></label>' +
            (dy ? '<span class="pr-rate">from Dye recipe</span>' : '<label class="pr-rate">₹/kg<input type="number" min="0" step="0.5" data-rate="' + esc(s[1]) + '" value="' + esc(Rt.rates[s[1]] != null ? Rt.rates[s[1]] : s[2]) + '"></label>') + '</div>';
        }).join('') + '</section>';
      }).join('') + '<aside class="pr-rail" id="prOut"></aside>';
  }
  function routeOut() {
    var r = routeCalc(), el = $('#prOut'); if (!el) return;
    el.innerHTML = '<div class="panel pr-card"><div class="metrics"><div class="metric"><span>Processing cost per kg</span><strong>' + inr(r.withLoss) + '</strong><small>Including ' + esc(S.route.loss) + '% process loss</small></div>' +
      '<div class="metric"><span>Per metre</span><strong>' + inr(r.perM) + '</strong><small>' + (r.kgPerM * 1000).toFixed(0) + ' g per running metre</small></div>' +
      '<div class="metric"><span>Water</span><strong>' + Math.round(r.water) + ' L/kg</strong><small>Approximate</small></div></div>' +
      '<h3>Route</h3><ol class="pr-steps">' + r.lines.map(function (l) { return '<li><span>' + esc(l[1]) + '</span><span class="n">' + inr(l[2]) + '</span></li>'; }).join('') + '</ol>' +
      '<p class="note">Stage rates are examples to show the method. Replace them with your processor’s quotes; printing and digital work are often quoted per metre.</p></div>';
  }

  /* ---------- shared rendering ---------- */
  function inp(k, l, v, t, ph) { return '<label>' + esc(l) + '<input data-k="' + k + '" type="' + (t || 'text') + '"' + (t === 'number' ? ' step="any" min="0"' : '') + ' value="' + esc(v) + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + '></label>'; }
  function sel(k, l, v, opts) { return '<label>' + esc(l) + '<select data-k="' + k + '">' + opts.map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select></label>'; }
  var TABS = [['recipe', 'Dye recipe and batch cost'], ['blend', 'Colour blend'], ['route', 'Processing route and cost']];
  function render() {
    var v = S.tab === 'blend' ? blendView() : S.tab === 'route' ? routeView() : recipeView();
    app.innerHTML = '<div class="pr-tabs" role="tablist">' + TABS.map(function (t) { return '<button type="button" role="tab" aria-selected="' + (S.tab === t[0]) + '" data-tab="' + t[0] + '">' + esc(t[1]) + '</button>'; }).join('') + '</div><div class="pr-grid">' + v + '</div>';
    out();
  }
  function out() { if (S.tab === 'blend') blendOut(); else if (S.tab === 'route') routeOut(); else recipeOut(); }
  function setPath(path, val) { var p = path.split('.'), o = S; for (var i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = val; }

  app.addEventListener('input', function (e) {
    var t = e.target;
    if (t.id === 'prQ') return libResults();
    if (t.dataset.k) { setPath(t.dataset.k, t.type === 'number' ? t.value : t.value); if (/recipe\.dyes\.\d+\.pct/.test(t.dataset.k)) { var a = S.recipe.auxFor; ensureAux(); if (S.recipe.auxFor !== a) { save(); return render(); } } save(); out(); }
    if (t.dataset.rate) { S.route.rates[t.dataset.rate] = t.value; save(); out(); }
  });
  app.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'prQc') return libResults();
    if (t.dataset.stage) { if (t.checked) S.route.sel[t.dataset.stage] = 1; else delete S.route.sel[t.dataset.stage]; save(); return render(); }
    if (t.dataset.pickhex) { if (t.value) { S.blend.parts[+t.dataset.pickhex].hex = t.value; save(); render(); } return; }
    if (t.dataset.k === 'recipe.fibre' || t.dataset.k === 'recipe.cls') { var R = S.recipe, cl = D.FIBRES[R.fibre] || []; if (cl.indexOf(R.cls) < 0) R.cls = cl[0]; R.lr = (D.CLASSES[R.cls] || {}).lr || R.lr; R.auxFor = ''; R.aux = null; save(); return render(); }
    if (t.dataset.k && (/\.fibre$|\.name$/.test(t.dataset.k))) { save(); render(); }
  });
  app.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.tab) { S.tab = b.dataset.tab; save(); return render(); }
    var a = b.dataset.act, R = S.recipe;
    if (a === 'adddye') { R.dyes.push({ name: '', pct: 0.5, price: 600 }); save(); render(); }
    if (a === 'rmdye') { R.dyes.splice(+b.dataset.i, 1); save(); render(); }
    if (a === 'lib') { var d = document.createElement('div'); d.id = 'prLibWrap'; d.innerHTML = libView(); app.appendChild(d); libResults(); $('#prQ').focus(); }
    if (a === 'closelib') { var w = $('#prLibWrap'); if (w) w.remove(); }
    if (a === 'pick') { R.dyes.push({ name: b.dataset.n, pct: 1, price: 600 }); save(); var w2 = $('#prLibWrap'); if (w2) w2.remove(); render(); }
    if (a === 'addown') { var n = ($('#prOn').value || '').trim(); if (!n) return; S.custom.push({ name: n, cls: $('#prOc').value, hex: $('#prOh').value }); save(); $('#prOn').value = ''; libResults(); }
    if (a === 'addpart') { S.blend.parts.push({ fibre: 'Viscose / rayon', pct: 0, hex: '#888888' }); save(); render(); }
    if (a === 'rmpart') { S.blend.parts.splice(+b.dataset.i, 1); save(); render(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var w = $('#prLibWrap'); if (w) w.remove(); } });

  // title-row controls shared with the other tools
  var pb = $('#print'); if (pb) pb.addEventListener('click', function () { window.print(); });
  var cn = $('#collectionName'); if (cn) { cn.value = S.name || 'My collection'; cn.addEventListener('input', function () { S.name = cn.value; save(); }); }
  var bk = $('#backup'); if (bk) bk.addEventListener('click', function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' })); a.download = 'forecut-processing-backup.json'; a.click(); });
  var rs = $('#restore'), rf = $('#restoreFile');
  if (rs && rf) { rs.addEventListener('click', function () { rf.click(); }); rf.addEventListener('change', function () { var f = rf.files[0]; if (!f) return; f.text().then(function (t) { var x = JSON.parse(t); if (x && x.v === 1 && x.recipe && x.blend && x.route) { S = x; save(); render(); } else alert('This is not a Textile Processing Studio backup.'); }).catch(function () { alert('Could not read that file.'); }); rf.value = ''; }); }
  var ex = $('#fxExample'); if (ex) ex.addEventListener('click', function () { var keep = S.custom; S = defaults(); S.custom = keep; save(); render(); var st = $('#status'); if (st) st.textContent = 'Example loaded: a navy reactive batch on 100 kg cotton.'; });
  window.ForecutProcessingCalc = { mix: mix, dyeMix: dyeMix }; // for tests
  render();
})();
