/* Forecut 3D validation (Stage 13).
   1. fromTests(): turns simple fabric lab tests (cantilever bending length, strip stretch, incline friction, thickness, GSM)
      into the parameters the 3D Drape simulator uses. Flexural rigidity G = W × c³ (ASTM D1388), W in mg/cm² = GSM / 10,
      c = bending length in cm; G is placed on the simulator's 0–100 stiffness scale on a log scale from 5 mg·cm (chiffon) to
      3000 mg·cm (canvas), which matches the library presets.
   2. Validation records: the same garment, size and body/form measured on a real sample and in 3D. Error per point, share
      within tolerance and a verdict, plus calibration hints across records for each fabric. Kept in this browser
      (fc-3d-validation, account-wide). window.Forecut3D */
(function () {
  'use strict';
  var KEY = 'fc-3d-validation';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function J(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
  function f2(v) { return (Math.round(v * 100) / 100).toString(); }
  var G0 = 5, G1 = 3000;
  function rigidity(gsm, c) { return (+gsm / 10) * Math.pow(+c, 3); }
  function stiffOf(G) { if (!(G > 0)) return null; return Math.max(0, Math.min(100, Math.round(100 * (Math.log10(G) - Math.log10(G0)) / (Math.log10(G1) - Math.log10(G0))))); }
  function fromTests(t) {
    var gsm = +t.gsm || 0, cw = +t.bendWarp || 0, cf = +t.bendWeft || 0, c = cw && cf ? Math.sqrt(cw * cf) : cw || cf, G = c && gsm ? rigidity(gsm, c) : null;
    return { gsm: gsm, G: G, Gwarp: cw && gsm ? rigidity(gsm, cw) : null, Gweft: cf && gsm ? rigidity(gsm, cf) : null, stiff: G ? stiffOf(G) : null, sw: +t.stretchWeft || 0, sl: +t.stretchWarp || 0, sb: t.bias === '' || t.bias == null ? null : +t.bias,
      fric: t.angle ? +Math.tan((+t.angle) * Math.PI / 180).toFixed(2) : null, thick: +t.thick || null };
  }
  function saveTo3D(name, p, note) { // adds the fabric to the 3D Drape fabric list ("My fabrics") for the active style
    var K = 'fc-tool-drape', S = J(K, null); if (!S || !S.style) S = Object.assign({ style: 'tshirt' }, S || {});
    S.myFabrics = S.myFabrics || {}; var id = 'lab-' + String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    S.myFabrics[id] = { g: 'My fabrics', n: String(name).slice(0, 60), gsm: p.gsm || 150, sw: p.sw || 0, sl: p.sl || 0, sb: p.sb == null ? 2 : p.sb, stiff: p.stiff == null ? 50 : p.stiff, fric: p.fric == null ? .45 : Math.min(1, p.fric), thick: p.thick || .3, rough: .85, sheen: 0, tex: 'plain', note: note || 'From lab tests', op: 1 };
    try { localStorage.setItem(K, JSON.stringify(S)); } catch (e) { return null; } return id;
  }
  /* ---------- validation records ---------- */
  var POINTS = [['Hem height from floor, centre front', 'cm', 1], ['Hem height from floor, side', 'cm', 1], ['Hem height from floor, centre back', 'cm', 1], ['Chest ease (garment − body)', 'cm', 1], ['Waist ease (garment − body)', 'cm', 1], ['Centre back length on the body', 'cm', 1], ['Hem width / sweep laid on the form', 'cm', 1.5], ['Sleeve hang angle from the body', '°', 5], ['Drape coefficient (Cusick)', '%', 5], ['Number of folds (nodes) at the hem', 'count', 1]];
  function load() { var o = J(KEY, null); return o && Array.isArray(o.recs) ? o : { v: 1, recs: [] }; }
  var V = load(), cur = V.recs.length ? V.recs[V.recs.length - 1].id : null;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(V)); } catch (e) { alert('Storage is full: remove some photos.'); } }
  function evalRec(r) { var n = 0, ok = 0, abs = 0, worst = 0, wp = ''; r.pts.forEach(function (p) { if (p.sim === '' || p.real === '' || p.sim == null || p.real == null) return; var e = +p.sim - +p.real; n++; if (Math.abs(e) <= +p.tol) ok++; if (p.unit === 'cm') abs += Math.abs(e); if (Math.abs(e) / (+p.tol || 1) > worst) { worst = Math.abs(e) / (+p.tol || 1); wp = p.name; } });
    var cmN = r.pts.filter(function (p) { return p.unit === 'cm' && p.sim !== '' && p.real !== '' && p.sim != null && p.real != null; }).length;
    var verdict = n < 5 ? 'Not enough points' : ok / n >= .9 && worst <= 2 ? 'Validated' : ok / n >= .7 ? 'Close: calibrate' : 'Not validated';
    return { n: n, ok: ok, share: n ? ok / n : 0, mae: cmN ? abs / cmN : null, worst: worst, wp: wp, verdict: verdict }; }
  function hints() { // across records, per 3D fabric: average signed error per point
    var by = {}; V.recs.forEach(function (r) { var k = r.fabric || '—'; (by[k] = by[k] || []).push(r); });
    return Object.keys(by).map(function (k) { var L = by[k], avg = {}; POINTS.forEach(function (pt) { var es = []; L.forEach(function (r) { r.pts.forEach(function (p) { if (p.name === pt[0] && p.sim !== '' && p.real !== '' && p.sim != null && p.real != null) es.push(+p.sim - +p.real); }); }); if (es.length) avg[pt[0]] = es.reduce(function (a, b) { return a + b; }, 0) / es.length; });
      var tips = [], dc = avg['Drape coefficient (Cusick)'], hem = ['Hem height from floor, centre front', 'Hem height from floor, side', 'Hem height from floor, centre back'].map(function (x) { return avg[x]; }).filter(function (x) { return x != null; }), hm = hem.length ? hem.reduce(function (a, b) { return a + b; }, 0) / hem.length : null, folds = avg['Number of folds (nodes) at the hem'];
      if (dc != null && Math.abs(dc) > 5) tips.push(dc > 0 ? '3D drapes stiffer than the real fabric (drape coefficient ' + f2(dc) + ' points higher): lower Stiffness by about ' + Math.round(Math.abs(dc) * 1.2) + '.' : '3D drapes softer than the real fabric (' + f2(Math.abs(dc)) + ' points lower): raise Stiffness by about ' + Math.round(Math.abs(dc) * 1.2) + '.');
      if (folds != null && Math.abs(folds) >= 1) tips.push(folds > 0 ? 'More folds in 3D than in the sample: raise Stiffness a little or check the weight.' : 'Fewer folds in 3D than in the sample: lower Stiffness a little.');
      if (hm != null && Math.abs(hm) > 1) tips.push(hm > 0 ? 'The 3D hem sits ' + f2(hm) + ' cm higher than the sample: check Weight (heavier hangs lower) and Stretch along the grain.' : 'The 3D hem sits ' + f2(-hm) + ' cm lower than the sample: check Weight and Stretch along the grain, or the pattern length.');
      var ce = avg['Chest ease (garment − body)']; if (ce != null && Math.abs(ce) > 1) tips.push('Chest ease differs by ' + f2(ce) + ' cm on average: usually the pattern or the avatar measurements, not the fabric. Check both match the sample and the form.');
      return { fabric: k, n: L.length, ok: L.filter(function (r) { return evalRec(r).verdict === 'Validated'; }).length, tips: tips }; });
  }
  function photo(file, cb) { var fr = new FileReader(); fr.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, 800 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', .75)); }; im.src = fr.result; }; fr.readAsDataURL(file); }
  function myFabNames() { var S = J('fc-tool-drape', {}) || {}, o = []; Object.keys(S.myFabrics || {}).forEach(function (k) { o.push(S.myFabrics[k].n); }); return o; }
  function html() {
    var r = V.recs.filter(function (x) { return x.id === cur; })[0], H = hints();
    var h = '<section class="panel"><div class="panel-head"><h2>3D vs real sample</h2><div class="actions"><button type="button" class="primary" data-v="new">+ New comparison</button></div></div>'
      + '<p class="note">Check the 3D Drape against a real garment: same pattern, size and fabric, on a dress form or person with the same measurements as the 3D body. Measure each point on the sample and in 3D (the 3D tool’s measure and ruler tools), then enter both. A fabric counts as validated for that garment when at least 90% of points fall within tolerance and none is more than twice the tolerance out.</p>'
      + (V.recs.length ? '<div class="fq-list">' + V.recs.map(function (x) { var e = evalRec(x); return '<button type="button" data-vs="' + x.id + '" class="' + (x.id === cur ? 'on' : '') + '"><b>' + esc(x.garment || 'Garment') + '</b><small>' + esc((x.fabric || '—') + ' · size ' + (x.size || '—')) + '</small><span>' + esc(e.verdict) + (e.n ? ' · ' + e.ok + '/' + e.n + ' in tolerance' : '') + '</span></button>'; }).join('') + '</div>' : '<p class="empty">No comparisons yet. They need a real sample: start with a simple garment in a known fabric (a tee in jersey, a circle skirt in viscose).</p>') + '</section>';
    if (r) { var e = evalRec(r);
      h += '<section class="panel"><div class="panel-head"><h2>' + esc(r.garment || 'Comparison') + '</h2><div class="actions"><span class="v3-verdict ' + (e.verdict === 'Validated' ? 'ok' : e.verdict === 'Not validated' ? 'no' : '') + '">' + esc(e.verdict) + '</span><button type="button" class="danger" data-v="del">Delete</button></div></div>'
        + '<div class="fields"><label>Garment and pattern<input data-vf="garment" value="' + esc(r.garment) + '" maxlength="80" placeholder="e.g. FC-SS27-0001 tee, Garment Studio TEE"></label><label>3D fabric<input data-vf="fabric" list="v3fabs" value="' + esc(r.fabric) + '" maxlength="60"><datalist id="v3fabs">' + myFabNames().map(function (n) { return '<option value="' + esc(n) + '">'; }).join('') + '</datalist></label><label>Real fabric (lot)<input data-vf="real" value="' + esc(r.real) + '" maxlength="80"></label><label>Size<input data-vf="size" value="' + esc(r.size) + '" maxlength="12"></label><label>Body / form<input data-vf="form" value="' + esc(r.form) + '" maxlength="80" placeholder="e.g. Dress form size 10: B88 W70 H96"></label><label>Date<input type="date" data-vf="date" value="' + esc(r.date) + '"></label></div>'
        + '<div class="table-scroll"><table class="v3"><thead><tr><th>Point</th><th>Unit</th><th>3D</th><th>Real sample</th><th>Tolerance ±</th><th>Difference</th><th></th></tr></thead><tbody>' + r.pts.map(function (p, i) { var d = p.sim !== '' && p.real !== '' && p.sim != null && p.real != null ? +p.sim - +p.real : null, ok = d != null && Math.abs(d) <= +p.tol; return '<tr class="' + (d == null ? '' : ok ? 'ok' : 'no') + '"><td><input data-vp="' + i + '.name" value="' + esc(p.name) + '" maxlength="80"></td><td>' + esc(p.unit) + '</td><td><input type="number" step="any" data-vp="' + i + '.sim" value="' + esc(p.sim) + '"></td><td><input type="number" step="any" data-vp="' + i + '.real" value="' + esc(p.real) + '"></td><td><input type="number" step="any" min="0" data-vp="' + i + '.tol" value="' + esc(p.tol) + '"></td><td data-vd="' + i + '">' + (d == null ? '' : (d > 0 ? '+' : '') + f2(d)) + '</td><td data-vr="' + i + '">' + (d == null ? '' : ok ? '✓' : 'Out') + '</td></tr>'; }).join('') + '</tbody></table></div>'
        + '<p class="note" data-vsum>' + (e.n ? e.ok + ' of ' + e.n + ' points within tolerance' + (e.mae != null ? ' · average length error ' + f2(e.mae) + ' cm' : '') + (e.wp && e.worst > 1 ? ' · furthest out: ' + esc(e.wp) : '') : 'Enter both values for at least five points.') + '</p>'
        + '<h3>Photos</h3><div class="fq-ba">' + ['realImg', 'simImg'].map(function (k) { return '<figure>' + (r[k] ? '<img src="' + r[k] + '" alt="">' : '<span>No photo</span>') + '<figcaption>' + (k === 'realImg' ? 'Real sample' : '3D screenshot') + ' <label class="button small">Add<input type="file" accept="image/*" data-vimg="' + k + '" hidden></label></figcaption></figure>'; }).join('') + '</div>'
        + '<label class="fq-notes">Notes<textarea data-vf="notes" rows="2" maxlength="2000">' + esc(r.notes) + '</textarea></label></section>'; }
    if (H.length) h += '<section class="panel"><h2>Calibration by fabric</h2>' + H.map(function (x) { return '<div class="v3-h"><b>' + esc(x.fabric) + '</b> · ' + x.ok + ' of ' + x.n + ' comparison' + (x.n > 1 ? 's' : '') + ' validated' + (x.tips.length ? '<ul>' + x.tips.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '<p class="note">No consistent difference found yet.</p>') + '</div>'; }).join('') + '<p class="note">Hints compare the average 3D − real difference over every comparison with that fabric. Change the fabric in the 3D Drape tool (Fabric → edit), then measure again.</p></section>';
    return h;
  }
  function bind(app, rerender) {
    app.addEventListener('click', function (e) { var b = e.target.closest('[data-v],[data-vs]'); if (!b || !app.contains(b)) return;
      if (b.dataset.vs) { cur = b.dataset.vs; return rerender(); }
      if (b.dataset.v === 'new') { var r = { id: 'V' + Date.now().toString(36), garment: '', fabric: '', real: '', size: 'M', form: '', date: new Date().toISOString().slice(0, 10), notes: '', pts: POINTS.map(function (p) { return { name: p[0], unit: p[1], tol: p[2], sim: '', real: '' }; }) }; V.recs.push(r); cur = r.id; save(); return rerender(); }
      if (b.dataset.v === 'del') { if (!confirm('Delete this comparison?')) return; V.recs = V.recs.filter(function (x) { return x.id !== cur; }); cur = V.recs.length ? V.recs[V.recs.length - 1].id : null; save(); return rerender(); }
    });
    app.addEventListener('input', function (e) { var t = e.target, r = V.recs.filter(function (x) { return x.id === cur; })[0]; if (!r) return;
      if (t.dataset.vf) { r[t.dataset.vf] = t.value; save(); return; }
      if (t.dataset.vp) { var p = t.dataset.vp.split('.'), pt = r.pts[+p[0]]; pt[p[1]] = p[1] === 'name' ? t.value : t.value === '' ? '' : +t.value; save();
        var d = pt.sim !== '' && pt.real !== '' && pt.sim != null && pt.real != null ? +pt.sim - +pt.real : null, ok = d != null && Math.abs(d) <= +pt.tol, row = t.closest('tr');
        row.className = d == null ? '' : ok ? 'ok' : 'no'; row.querySelector('[data-vd]').textContent = d == null ? '' : (d > 0 ? '+' : '') + f2(d); row.querySelector('[data-vr]').textContent = d == null ? '' : ok ? '✓' : 'Out';
        var ev = evalRec(r), s = app.querySelector('[data-vsum]'); if (s) s.textContent = ev.n ? ev.ok + ' of ' + ev.n + ' points within tolerance' + (ev.mae != null ? ' · average length error ' + f2(ev.mae) + ' cm' : '') : 'Enter both values for at least five points.'; var vv = app.querySelector('.v3-verdict'); if (vv) { vv.textContent = ev.verdict; vv.className = 'v3-verdict ' + (ev.verdict === 'Validated' ? 'ok' : ev.verdict === 'Not validated' ? 'no' : ''); } }
    });
    app.addEventListener('change', function (e) { var t = e.target, r = V.recs.filter(function (x) { return x.id === cur; })[0]; if (!r || !t.dataset.vimg) return; var f = t.files[0]; if (!f) return; photo(f, function (d) { r[t.dataset.vimg] = d; save(); rerender(); }); });
  }
  window.Forecut3D = { fromTests: fromTests, rigidity: rigidity, stiffOf: stiffOf, saveTo3D: saveTo3D, html: html, bind: bind, evalRec: evalRec, POINTS: POINTS };
  if (typeof module !== 'undefined' && module.exports) module.exports = window.Forecut3D;
})();
