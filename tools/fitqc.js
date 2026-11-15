/* Forecut Fit & QC Studio (Stage 8).
   Fit sessions and inspections for the active style (fc-fitqc, saved with the style): sample size, material lot, fit model,
   photos, every point of measure against the graded spec and tolerance, issues with severity, action, owner and due date,
   approval, a before/after comparison of two sessions, open issues sent to the Tech Pack, and an ISO 2859-1 AQL plan. */
(function () {
  'use strict';
  var app = document.getElementById('app'); if (!app) return;
  var KEY = 'fc-fitqc';
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function day(d) { return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; }
  function f2(v) { return (Math.round(v * 100) / 100).toString(); }
  var TYPES = ['Proto sample', 'Fit sample', 'Salesman sample (SMS)', 'Size set', 'Pre-production (PP)', 'Top of production (TOP)', 'Inline inspection', 'Final inspection'];
  var SEV = ['Critical', 'Major', 'Minor'], IST = ['Open', 'Fixed', 'Verified'], DEC = ['', 'Approved', 'Approved with changes', 'Rejected', 'Resubmit'];
  var AREAS = ['Fit / balance', 'Measurement', 'Fabric / shade', 'Seam / stitching', 'Trims / labels', 'Print / embroidery', 'Pressing / finishing', 'Packing', 'Other'];
  function load() { try { var o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && Array.isArray(o.sessions)) return o; } catch (e) { } return { v: 1, sessions: [] }; }
  var S = load(), cur = S.sessions.length ? S.sessions[S.sessions.length - 1].id : null, cmpA = '', cmpB = '', aql = { lot: 1000, major: '2.5', minor: '4.0' };
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); var st = $('#status'); if (st) st.textContent = 'Saved in this browser · ' + new Date().toLocaleTimeString(); } catch (e) { alert('Browser storage is full: remove some photos or download a backup.'); } }
  function sess(id) { return S.sessions.filter(function (x) { return x.id === id; })[0]; }
  /* ---------- the graded spec from the Size Chart Builder for this style ---------- */
  function spec() {
    var st; try { st = JSON.parse(localStorage.getItem('fc-production-studio-v1') || 'null'); } catch (e) { st = null; }
    var z = st && st.size; if (!z || !Array.isArray(z.rows) || !z.rows.length) return null;
    var L = String(z.labels || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean), bi = L.indexOf(z.base);
    return { unit: z.unit || 'cm', labels: L, base: z.base, garment: z.garment, rows: z.rows.map(function (r, i) { var vals = {}; L.forEach(function (sz, j) { var v = j < bi ? r.base - (bi - j) * r.down : r.base + (j - bi) * r.up; if (r.vals && isFinite(r.vals[sz])) v = r.vals[sz]; vals[sz] = +(+v).toFixed(2); }); return { key: (r.code || '') + '|' + r.name, code: r.code || '', name: r.name, how: r.how || '', tol: +r.tolerance || 0, vals: vals }; }) };
  }
  function measRes(row, size, v) { if (v === '' || v == null || !isFinite(+v)) return null; var sp = row.vals[size]; if (sp == null) return null; var d = +v - sp; return { d: d, ok: Math.abs(d) <= row.tol + 1e-9 }; }
  function sumMeas(s, SP) { var n = 0, ok = 0; if (!SP) return { n: 0, ok: 0 }; SP.rows.forEach(function (r) { var m = measRes(r, s.size, s.meas[r.key]); if (m) { n++; if (m.ok) ok++; } }); return { n: n, ok: ok }; }
  function newSession(type) {
    var SP = spec(), prev = S.sessions[S.sessions.length - 1], id = 'S' + Date.now().toString(36);
    var s = { id: id, type: type || (prev ? 'Fit sample' : 'Proto sample'), round: S.sessions.filter(function (x) { return x.type === type; }).length + 1, date: today(), size: SP ? SP.base : (prev && prev.size) || 'M', lot: prev ? prev.lot : '', model: prev ? prev.model : '', fabric: prev ? prev.fabric : '', meas: {}, issues: [], photos: [], decision: '', by: '', decidedAt: '', notes: '' };
    if (prev) prev.issues.forEach(function (i) { if (i.status !== 'Verified') s.issues.push(Object.assign({}, i, { id: 'I' + Math.random().toString(36).slice(2, 8), from: prev.id, status: i.status === 'Fixed' ? 'Fixed' : 'Open' })); });
    S.sessions.push(s); cur = id; save(); render();
  }
  /* ---------- AQL, ISO 2859-1 general inspection level II, single sampling, normal inspection ---------- */
  var LOTS = [[8, 'A'], [15, 'B'], [25, 'C'], [50, 'D'], [90, 'E'], [150, 'F'], [280, 'G'], [500, 'H'], [1200, 'J'], [3200, 'K'], [10000, 'L'], [35000, 'M'], [150000, 'N'], [500000, 'P'], [1e12, 'Q']];
  var LET = 'ABCDEFGHJKLMNPQR', NS = [2, 3, 5, 8, 13, 20, 32, 50, 80, 125, 200, 315, 500, 800, 1250, 2000], ZERO = { '0.65': 5, '1.0': 4, '1.5': 3, '2.5': 2, '4.0': 1, '6.5': 0 }, ACS = [1, 2, 3, 5, 7, 10, 14, 21];
  function plan(lot, a) { var L = LOTS.filter(function (x) { return lot <= x[0]; })[0][1], i = LET.indexOf(L), z = ZERO[a];
    var use = i <= z ? z : i === z + 1 ? z : i === z + 2 ? z + 3 : i, k = use - z - 3; if (use > z && k >= ACS.length) { use = z + 3 + ACS.length - 1; k = ACS.length - 1; } var ac = use === z ? 0 : ACS[k];
    var n = NS[use]; return { letter: L, n: Math.min(n, lot), all: n >= lot, ac: n >= lot ? 0 : ac, re: n >= lot ? 1 : ac + 1, moved: use !== i }; }
  function aqlView() {
    var lot = Math.max(2, Math.round(+aql.lot || 2)), M = plan(lot, aql.major), m = plan(lot, aql.minor), opts = function (v) { return Object.keys(ZERO).sort(function (x, y) { return +x - +y; }).map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + o + '</option>'; }).join(''); };
    return '<section class="panel"><h2>Final inspection sample size (AQL)</h2><div class="fields"><label>Order / lot quantity<input type="number" min="2" step="1" id="aqLot" value="' + lot + '"></label><label>AQL, major defects<select id="aqMa">' + opts(aql.major) + '</select></label><label>AQL, minor defects<select id="aqMi">' + opts(aql.minor) + '</select></label></div>'
      + '<div class="metrics"><div class="metric"><span>Pieces to inspect</span><strong>' + Math.max(M.n, m.n) + '</strong><small>code letter ' + M.letter + (M.all || m.all ? ' · inspect every piece' : '') + '</small></div><div class="metric"><span>Major defects</span><strong>accept ≤ ' + M.ac + '</strong><small>reject at ' + M.re + (M.moved ? ' · sample of ' + M.n : '') + '</small></div><div class="metric"><span>Minor defects</span><strong>accept ≤ ' + m.ac + '</strong><small>reject at ' + m.re + (m.moved ? ' · sample of ' + m.n : '') + '</small></div></div>'
      + '<p class="note">ISO 2859-1, general inspection level II, single sampling, normal inspection. Critical defects are usually accepted at zero. Where the table points to another sample size, the plan above already uses it. Follow your buyer’s manual if it differs.</p></section>';
  }
  /* ---------- views ---------- */
  function photoResize(file, cb) { var r = new FileReader(); r.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, 900 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', .75)); }; im.src = r.result; }; r.readAsDataURL(file); }
  function sessView(s, SP) {
    var sm = sumMeas(s, SP), open = s.issues.filter(function (i) { return i.status === 'Open'; }).length;
    var h = '<section class="panel fq-s"><div class="panel-head"><h2>' + esc(s.type) + ' · ' + day(s.date) + '</h2><div class="actions"><button type="button" data-a="toPack"' + (open ? '' : ' disabled') + '>Send ' + open + ' open issue' + (open === 1 ? '' : 's') + ' to Tech Pack</button><button type="button" class="danger" data-a="delS">Delete session</button></div></div>'
      + '<div class="fields"><label>Session type<select data-sf="type">' + TYPES.map(function (t) { return '<option' + (t === s.type ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select></label><label>Date<input type="date" data-sf="date" value="' + esc(s.date) + '"></label><label>Sample size<select data-sf="size">' + (SP ? SP.labels : [s.size]).map(function (z) { return '<option' + (z === s.size ? ' selected' : '') + '>' + esc(z) + '</option>'; }).join('') + '</select></label><label>Material lot / dye lot<input data-sf="lot" value="' + esc(s.lot) + '" maxlength="80"></label><label>Fabric<input data-sf="fabric" value="' + esc(s.fabric) + '" maxlength="120" placeholder="e.g. F-0001 linen 150"></label><label>Fit model or avatar<input data-sf="model" value="' + esc(s.model) + '" maxlength="80" placeholder="Name, size and key measurements"></label></div>';
    // measurements
    h += '<h3>Measurements' + (sm.n ? ' <small>' + sm.ok + ' of ' + sm.n + ' within tolerance</small>' : '') + '</h3>';
    if (!SP) h += '<p class="notice">No size chart for this style yet. Build one in the <a href="size-chart-builder.html">Size Chart Builder</a> and the points of measure appear here with the spec for the sample size.</p>';
    else h += '<div class="table-scroll"><table class="fq-m"><thead><tr><th>Point of measure</th><th>Spec ' + esc(s.size) + '</th><th>Tol ±</th><th>Measured</th><th>Difference</th><th></th></tr></thead><tbody>' + SP.rows.map(function (r) { var v = s.meas[r.key], m = measRes(r, s.size, v); return '<tr class="' + (m ? (m.ok ? 'ok' : 'no') : '') + '"><td>' + (r.code ? '<b>' + esc(r.code) + '</b> ' : '') + esc(r.name) + '</td><td>' + (r.vals[s.size] != null ? f2(r.vals[s.size]) : '—') + '</td><td>' + f2(r.tol) + '</td><td><input type="number" step="any" min="0" data-m="' + esc(r.key) + '" value="' + esc(v == null ? '' : v) + '" aria-label="Measured ' + esc(r.name) + '"></td><td data-d="' + esc(r.key) + '">' + (m ? (m.d > 0 ? '+' : '') + f2(m.d) : '') + '</td><td data-r="' + esc(r.key) + '">' + (m ? (m.ok ? '✓' : 'Out') : '') + '</td></tr>'; }).join('') + '</tbody></table></div><p class="note">Spec values are the graded chart for the sample size, in ' + esc(SP.unit) + '.</p>';
    // issues
    h += '<h3>Issues</h3>' + (s.issues.length ? '<div class="table-scroll"><table class="fq-i"><thead><tr><th>Area</th><th>What is wrong</th><th>Severity</th><th>Corrective action</th><th>Owner</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>' + s.issues.map(function (i, n) { var sel = function (k, L) { return '<select data-if="' + n + '.' + k + '">' + L.map(function (o) { return '<option' + (o === i[k] ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select>'; }, inp = function (k, ph, t) { return '<input data-if="' + n + '.' + k + '" value="' + esc(i[k]) + '"' + (t ? ' type="' + t + '"' : ' maxlength="300"') + (ph ? ' placeholder="' + ph + '"' : '') + '>'; };
      return '<tr class="sev-' + i.sev.toLowerCase() + ' st-' + i.status.toLowerCase() + '"><td>' + sel('area', AREAS) + '</td><td>' + inp('desc', 'e.g. Neck gapes at CF') + (i.from ? '<small class="fq-from">carried over</small>' : '') + '</td><td>' + sel('sev', SEV) + '</td><td>' + inp('action', 'e.g. Take 0.5 cm off neck width') + '</td><td>' + inp('owner', 'Who') + '</td><td>' + inp('due', '', 'date') + '</td><td>' + sel('status', IST) + '</td><td><button type="button" class="small" data-rmi="' + n + '" aria-label="Remove issue">×</button></td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="note">No issues recorded.</p>') + '<div class="actions"><button type="button" data-a="addI">+ Add issue</button></div>';
    // photos
    h += '<h3>Photos</h3><div class="fq-ph">' + s.photos.map(function (p, n) { return '<figure><img src="' + p.img + '" alt="' + esc(p.cap || 'Sample photo') + '"><input data-pc="' + n + '" value="' + esc(p.cap) + '" placeholder="Caption, e.g. Front, side seam" maxlength="100"><button type="button" class="small" data-rmp="' + n + '">Remove</button></figure>'; }).join('') + (s.photos.length < 8 ? '<label class="fq-add">+ Add photos<input type="file" id="fqPh" accept="image/*" multiple hidden></label>' : '') + '</div>';
    // approval
    h += '<h3>Decision</h3><div class="fields"><label>Decision<select data-sf="decision">' + DEC.map(function (o) { return '<option value="' + o + '"' + (o === s.decision ? ' selected' : '') + '>' + (o || 'Not decided') + '</option>'; }).join('') + '</select></label><label>Decided by<input data-sf="by" value="' + esc(s.by) + '" maxlength="80"></label><label>Date<input type="date" data-sf="decidedAt" value="' + esc(s.decidedAt) + '"></label></div>'
      + (s.decision === 'Approved' && open ? '<p class="notice">Approved with ' + open + ' issue' + (open > 1 ? 's' : '') + ' still open. Close them or choose “Approved with changes”.</p>' : '') + '<label class="fq-notes">Notes<textarea data-sf="notes" rows="3" maxlength="3000">' + esc(s.notes) + '</textarea></label></section>';
    return h;
  }
  function compareView(SP) {
    if (S.sessions.length < 2) return '';
    var A = sess(cmpA) || S.sessions[S.sessions.length - 2], B = sess(cmpB) || S.sessions[S.sessions.length - 1], opt = function (x) { return S.sessions.map(function (s) { return '<option value="' + s.id + '"' + (s.id === x.id ? ' selected' : '') + '>' + esc(s.type + ' · ' + day(s.date)) + '</option>'; }).join(''); };
    var rows = SP ? SP.rows.map(function (r) { var a = measRes(r, A.size, A.meas[r.key]), b = measRes(r, B.size, B.meas[r.key]); if (!a && !b) return ''; var better = a && b ? Math.abs(b.d) < Math.abs(a.d) - 1e-9 : null, worse = a && b ? Math.abs(b.d) > Math.abs(a.d) + 1e-9 : null;
      return '<tr><td>' + esc(r.name) + '</td><td class="' + (a ? (a.ok ? 'ok' : 'no') : '') + '">' + (a ? (a.d > 0 ? '+' : '') + f2(a.d) : '—') + '</td><td class="' + (b ? (b.ok ? 'ok' : 'no') : '') + '">' + (b ? (b.d > 0 ? '+' : '') + f2(b.d) : '—') + '</td><td>' + (better ? 'Closer to spec' : worse ? 'Further from spec' : a && b ? 'Same' : '') + '</td></tr>'; }).join('') : '';
    var closed = A.issues.filter(function (i) { var j = B.issues.filter(function (x) { return x.desc === i.desc; })[0]; return !j || j.status !== 'Open'; }).length, opened = B.issues.filter(function (i) { return !i.from; }).length;
    var pa = A.photos[0], pb = B.photos[0];
    return '<section class="panel"><h2>Before and after</h2><div class="fields"><label>Before<select id="cA">' + opt(A) + '</select></label><label>After<select id="cB">' + opt(B) + '</select></label></div>'
      + (pa || pb ? '<div class="fq-ba"><figure>' + (pa ? '<img src="' + pa.img + '" alt="">' : '<span>No photo</span>') + '<figcaption>Before</figcaption></figure><figure>' + (pb ? '<img src="' + pb.img + '" alt="">' : '<span>No photo</span>') + '<figcaption>After</figcaption></figure></div>' : '')
      + (rows ? '<div class="table-scroll"><table class="fq-c"><thead><tr><th>Point of measure</th><th>Before (vs spec)</th><th>After (vs spec)</th><th>Change</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<p class="note">Record measurements in both sessions to compare them.</p>')
      + '<p class="note">Issues: ' + closed + ' of ' + A.issues.length + ' from before are fixed or closed; ' + opened + ' new issue' + (opened === 1 ? '' : 's') + ' after. In tolerance: before ' + sumMeas(A, SP).ok + '/' + sumMeas(A, SP).n + ', after ' + sumMeas(B, SP).ok + '/' + sumMeas(B, SP).n + '.</p></section>';
  }
  function render() {
    var SP = spec(), F = window.ForecutStyle, a = F && F.active ? F.active() : null, s = sess(cur);
    var list = '<section class="panel"><div class="panel-head"><h2>Sessions' + (a ? ' · ' + esc(a.id) : '') + '</h2><div class="actions"><select id="fqType" aria-label="Type of the new session">' + TYPES.map(function (t) { return '<option>' + t + '</option>'; }).join('') + '</select><button type="button" class="primary" data-a="newSess">+ New session</button></div></div>'
      + (a ? '' : '<p class="notice">No style is selected. Choose or create a style in the bar above so sessions are saved with it.</p>')
      + (S.sessions.length ? '<div class="fq-list">' + S.sessions.map(function (x) { var m = sumMeas(x, SP), o = x.issues.filter(function (i) { return i.status === 'Open'; }).length; return '<button type="button" data-s="' + x.id + '" class="' + (x.id === cur ? 'on' : '') + '"><b>' + esc(x.type) + '</b><small>' + day(x.date) + ' · size ' + esc(x.size) + '</small><span>' + (m.n ? m.ok + '/' + m.n + ' in tol · ' : '') + o + ' open' + (x.decision ? ' · ' + esc(x.decision) : '') + '</span></button>'; }).join('') + '</div>' : '<p class="empty">No sessions yet. Start with the proto or first fit sample. Open issues carry over to the next session automatically.</p>') + '</section>';
    app.innerHTML = list + (s ? sessView(s, SP) : '') + compareView(SP) + aqlView();
  }
  function upd() { var s = sess(cur); if (!s) return; var SP = spec(); if (!SP) return; SP.rows.forEach(function (r) { var m = measRes(r, s.size, s.meas[r.key]), d = app.querySelector('[data-d="' + CSS.escape(r.key) + '"]'), q = app.querySelector('[data-r="' + CSS.escape(r.key) + '"]'); if (!d) return; d.textContent = m ? (m.d > 0 ? '+' : '') + f2(m.d) : ''; q.textContent = m ? (m.ok ? '✓' : 'Out') : ''; d.parentNode.className = m ? (m.ok ? 'ok' : 'no') : ''; }); }
  app.addEventListener('input', function (e) { var t = e.target, s = sess(cur);
    if (t.id === 'aqLot') { aql.lot = t.value; return; }
    if (!s) return;
    if (t.dataset.m != null) { s.meas[t.dataset.m] = t.value === '' ? '' : +t.value; save(); upd(); return; }
    if (t.dataset.sf && t.tagName !== 'SELECT') { s[t.dataset.sf] = t.value; save(); return; }
    if (t.dataset.if && t.tagName !== 'SELECT') { var p = t.dataset.if.split('.'); s.issues[+p[0]][p[1]] = t.value; save(); return; }
    if (t.dataset.pc != null) { s.photos[+t.dataset.pc].cap = t.value; save(); }
  });
  app.addEventListener('change', function (e) { var t = e.target, s = sess(cur);
    if (t.id === 'aqLot' || t.id === 'aqMa' || t.id === 'aqMi') { if (t.id === 'aqMa') aql.major = t.value; if (t.id === 'aqMi') aql.minor = t.value; return render(); }
    if (t.id === 'cA') { cmpA = t.value; return render(); } if (t.id === 'cB') { cmpB = t.value; return render(); }
    if (t.id === 'fqPh' && s) { var files = [].slice.call(t.files, 0, 8 - s.photos.length), left = files.length; files.forEach(function (f) { photoResize(f, function (d) { s.photos.push({ img: d, cap: f.name.replace(/\.[^.]+$/, '') }); if (!--left) { save(); render(); } }); }); return; }
    if (!s) return;
    if (t.dataset.sf && t.tagName === 'SELECT') { s[t.dataset.sf] = t.value; if (t.dataset.sf === 'decision' && t.value && !s.decidedAt) s.decidedAt = today(); save(); return render(); }
    if (t.dataset.if && t.tagName === 'SELECT') { var p = t.dataset.if.split('.'); s.issues[+p[0]][p[1]] = t.value; save(); return render(); }
    if (t.dataset.sf === 'date') render();
  });
  app.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var s = sess(cur), a = b.dataset.a;
    if (b.dataset.s) { cur = b.dataset.s; return render(); }
    if (a === 'newSess') return newSession($('#fqType').value);
    if (!s) return;
    if (a === 'delS') { if (!confirm('Delete this session, its measurements and photos?')) return; S.sessions = S.sessions.filter(function (x) { return x !== s; }); cur = S.sessions.length ? S.sessions[S.sessions.length - 1].id : null; save(); return render(); }
    if (a === 'addI') { s.issues.push({ id: 'I' + Math.random().toString(36).slice(2, 8), area: 'Fit / balance', desc: '', sev: 'Major', action: '', owner: '', due: '', status: 'Open' }); save(); return render(); }
    if (b.dataset.rmi != null) { s.issues.splice(+b.dataset.rmi, 1); save(); return render(); }
    if (b.dataset.rmp != null) { s.photos.splice(+b.dataset.rmp, 1); save(); return render(); }
    if (a === 'toPack') {
      var K = 'fc-production-studio-v1', st; try { st = JSON.parse(localStorage.getItem(K) || 'null'); } catch (x) { st = null; }
      if (!st || !st.pack || !Array.isArray(st.pack.callouts)) { alert('Open the Tech Pack Builder once for this style, then send the issues again.'); return; }
      var R = window.ForecutRev, locked = R && R.locked && R.locked(), n = 0;
      s.issues.filter(function (i) { return i.status === 'Open' && i.desc; }).forEach(function (i) { var note = 'Fit/QC ' + s.type + ' ' + s.date + ' [' + i.sev + ']: ' + i.desc + (i.action ? ' → ' + i.action : '') + (i.owner ? ' (' + i.owner + (i.due ? ', due ' + i.due : '') + ')' : ''); if (st.pack.callouts.some(function (c) { return c.note === note; }) || st.pack.callouts.length >= 100) return; st.pack.callouts.push({ location: i.area, note: note }); n++; });
      if (locked) { alert('This style’s current revision is issued, so the Tech Pack is read-only. Start the next revision (Revisions & sign-off in the style bar), then send the issues again.'); return; }
      try { localStorage.setItem(K, JSON.stringify(st)); } catch (x) { alert('Storage is full.'); return; }
      var m = $('#status'); if (m) m.textContent = n ? n + ' open issue' + (n > 1 ? 's' : '') + ' added to the Tech Pack callouts.' : 'These issues are already in the Tech Pack.';
    }
  });
  var pb = $('#print'); if (pb) pb.addEventListener('click', function () { window.print(); });
  var bk = $('#backup'); if (bk) bk.addEventListener('click', function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ forecut: 'fit-qc', data: S }, null, 1)], { type: 'application/json' })); a.download = 'forecut-fit-qc.json'; a.click(); });
  var rs = $('#restore'), rf = $('#restoreFile'); if (rs && rf) { rs.addEventListener('click', function () { rf.click(); }); rf.addEventListener('change', function () { var f = rf.files[0]; if (!f) return; f.text().then(function (t) { var o = JSON.parse(t), d = o && o.data; if (!d || !Array.isArray(d.sessions)) throw Error(); if (!confirm('Replace the sessions for this style with this backup?')) return; S = d; cur = S.sessions.length ? S.sessions[S.sessions.length - 1].id : null; save(); render(); }).catch(function () { alert('This is not a Forecut Fit & QC backup.'); }); }); }
  var ex = $('#fxExample'); if (ex) ex.addEventListener('click', function () {
    var SP = spec(); newSession('Fit sample'); var s = sess(cur); s.model = 'Fit model, size M'; s.lot = 'Lot 24-118';
    if (SP) SP.rows.forEach(function (r, i) { var sp = r.vals[s.size]; if (sp != null) s.meas[r.key] = +(sp + (i % 3 === 0 ? r.tol * 1.6 : i % 3 === 1 ? -r.tol * .4 : 0)).toFixed(1); });
    s.issues.push({ id: 'I1', area: 'Fit / balance', desc: 'Front neck gapes at centre front', sev: 'Major', action: 'Reduce front neck width by 0.5 cm and re-check', owner: 'Pattern maker', due: '', status: 'Open' }, { id: 'I2', area: 'Seam / stitching', desc: 'Puckering on side seam', sev: 'Minor', action: 'Lower thread tension; check needle size', owner: 'Factory', due: '', status: 'Open' });
    save(); render(); var m = $('#status'); if (m) m.textContent = 'Example session added' + (SP ? ' with measurements from your size chart' : '') + '.'; });
  window.ForecutFitQC = { plan: plan };
  render();
})();
