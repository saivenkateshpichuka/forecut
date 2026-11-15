/* Forecut revisions and sign-off for a style (Stage 3).
   Each style has numbered revisions. A revision moves Draft → In review → Issued. Issuing freezes a copy of the style's
   work; an issued revision is read-only in the tools, and changes start the next revision. Sign-offs record role, name,
   decision and date. Any two revisions (or the current work) can be compared. window.ForecutRev */
(function () {
  'use strict';
  var F = window.ForecutStyle; if (!F) return;
  var SNAP = 'fc-style-rev-';
  var ROLES = ['Design', 'Technical / pattern', 'Merchandising / buyer', 'Production / factory', 'Quality'];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function J(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
  function now() { return new Date().toISOString(); }
  function day(t) { return t ? new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''; }
  function revs(s) { if (!Array.isArray(s.revs) || !s.revs.length) s.revs = [{ rev: s.rev || 1, status: 'Draft', created: s.created || now(), approvals: [] }]; var cur = s.revs.filter(function (r) { return r.rev === (s.rev || 1); })[0]; if (!cur) { cur = { rev: s.rev || 1, status: 'Draft', created: now(), approvals: [] }; s.revs.push(cur); } return s.revs; }
  function cur(s) { return revs(s).filter(function (r) { return r.rev === (s.rev || 1); })[0]; }
  function statusOf(s) { return s ? cur(s).status : ''; }
  function withStyle(fn) { var r = F.reg(), s = r.active ? F.byId(r, r.active) : null; if (!s) return null; revs(s); var out = fn(s, r); F.saveReg(r); return out; }
  function liveData() { var o = {}; F.KEYS.forEach(function (k) { var v = localStorage.getItem(k); if (v != null) o[k] = v; }); return o; }
  function freeze(s, rev) { try { localStorage.setItem(SNAP + s.id + '-' + rev, JSON.stringify({ at: now(), data: liveData() })); return true; } catch (e) { alert('Browser storage is full, so this revision could not be frozen. Download a backup from My account and remove large images, then try again.'); return false; } }
  function frozen(id, rev) { var o = J(SNAP + id + '-' + rev, null); return o && o.data ? o : null; }
  function signer() { try { return localStorage.getItem('fc-signer-name') || ''; } catch (e) { return ''; } }
  // ---------- actions ----------
  function submit() { withStyle(function (s) { var c = cur(s); c.status = 'In review'; c.submitted = now(); s.updated = now(); }); }
  function approve(role, name, decision, note) { withStyle(function (s) { var c = cur(s); c.approvals = (c.approvals || []).filter(function (a) { return a.role !== role; }); c.approvals.push({ role: role, name: name, decision: decision, note: note || '', at: now() }); if (c.status === 'Draft') c.status = 'In review'; s.updated = now(); }); try { localStorage.setItem('fc-signer-name', name); } catch (e) { } }
  function issue(by) { return withStyle(function (s) { var c = cur(s); if (!freeze(s, c.rev)) return false; c.status = 'Issued'; c.issued = now(); c.issuedBy = by || signer(); s.status = s.status === 'Concept' || s.status === 'In development' ? 'Sampling' : s.status; s.updated = now(); return true; }); }
  function startNext(reason) { return withStyle(function (s) { var c = cur(s); if (c.status !== 'Issued') { if (!freeze(s, c.rev)) return false; c.status = 'Superseded draft'; } var n = (s.rev || 1) + 1; s.rev = n; s.revs.push({ rev: n, status: 'Draft', created: now(), approvals: [], reason: reason || '', from: c.rev }); s.updated = now(); return n; }); }
  function locked() { var s = F.active(); return !!(s && statusOf(s) === 'Issued'); }
  // ---------- compare ----------
  function studioOf(data) { try { return JSON.parse((data || {})['fc-production-studio-v1'] || 'null') || {}; } catch (e) { return {}; } }
  function pmOf(data, k) { try { return JSON.parse((data || {})[k] || 'null'); } catch (e) { return null; } }
  function graded(size) { if (!size || !Array.isArray(size.rows)) return {}; var L = String(size.labels || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean), bi = L.indexOf(size.base), out = {}; size.rows.forEach(function (r) { var key = (r.code ? r.code + ' ' : '') + r.name; L.forEach(function (z, j) { var v = j < bi ? r.base - (bi - j) * r.down : r.base + (j - bi) * r.up; if (r.vals && isFinite(r.vals[z])) v = r.vals[z]; out[key + ' · ' + z] = +(+v).toFixed(2); }); out[key + ' · tolerance ±'] = r.tolerance; }); return out; }
  function flat(o, keys) { var r = {}; (keys || Object.keys(o || {})).forEach(function (k) { var v = (o || {})[k]; if (v == null || typeof v === 'object') return; r[k] = v; }); return r; }
  var LABELS = { code: 'Style ID', name: 'Style name', garment: 'Garment', trend: 'Trend', fabric: 'Fabric', colour: 'Colour', collar: 'Collar', sleeve: 'Sleeve', notes: 'Notes', version: 'Revision', status: 'Working status', supplier: 'Supplier', date: 'Issue date', construction: 'Construction notes', labels: 'Label placement', packing: 'Packing', sku: 'SKU', season: 'Season', brand: 'Brand', category: 'Category', gender: 'Gender', sizeRange: 'Size range', sampleSize: 'Sample size', composition: 'Composition', gsm: 'GSM', colourway: 'Colourways', trims: 'Key trims', targetCost: 'Target cost', mrp: 'MRP', orderQty: 'Order quantity', delivery: 'Delivery', hs: 'HS code', designer: 'Designer', merchandiser: 'Merchandiser', base: 'Base size', unit: 'Unit', mode: 'Measurement basis', market: 'Market', fit: 'Fit', fabricType: 'Fabric type', wash: 'Wash', bleach: 'Bleach', dry: 'Dry', iron: 'Iron', professional: 'Professional care', shell: 'Shell composition', lining: 'Lining', origin: 'Country of origin', width: 'Label width', height: 'Label height', fold: 'Label fold', quantity: 'Quantity' };
  function diff(a, b) {
    var A = studioOf(a), B = studioOf(b), rows = [];
    function cmp(sec, x, y, keys) { x = flat(x, keys); y = flat(y, keys); var all = {}; Object.keys(x).concat(Object.keys(y)).forEach(function (k) { all[k] = 1; }); Object.keys(all).forEach(function (k) { if (/^(srcFp|result|source|labels)$/.test(k) && sec !== 'Size chart') return; if ((x[k] == null || x[k] === '') && /^(season|category|brand|styleCode|sku)$/.test(k)) return; if (String(x[k] == null ? '' : x[k]) !== String(y[k] == null ? '' : y[k])) rows.push([sec, LABELS[k] || k, x[k], y[k]]); }); }
    cmp('Style brief', A.brief, B.brief);
    cmp('Tech pack', A.pack, B.pack);
    var bom = function (p) { var o = {}; ((p && p.bom) || []).forEach(function (r) { o[r.item] = r; }); return o; }, ba = bom(A.pack), bb = bom(B.pack);
    Object.keys(ba).concat(Object.keys(bb)).filter(function (k, i, arr) { return arr.indexOf(k) === i; }).forEach(function (k) { var x = ba[k], y = bb[k]; if (!x) rows.push(['Bill of materials', k, '—', 'Added: ' + y.quantity + ' ' + y.unit + ' × ₹' + y.price]); else if (!y) rows.push(['Bill of materials', k, x.quantity + ' ' + x.unit + ' × ₹' + x.price, 'Removed']); else ['quantity', 'unit', 'price', 'supplier', 'colour'].forEach(function (q) { if (String(x[q]) !== String(y[q])) rows.push(['Bill of materials', k + ' · ' + q, x[q], y[q]]); }); });
    var sa = A.size || {}, sb = B.size || {};
    cmp('Size chart', sa, sb, ['labels', 'base', 'unit', 'mode', 'fit', 'garment', 'sleeve', 'collar']);
    var ga = graded(sa), gb = graded(sb);
    Object.keys(ga).concat(Object.keys(gb)).filter(function (k, i, arr) { return arr.indexOf(k) === i; }).forEach(function (k) { if (ga[k] !== gb[k]) rows.push(['Size chart', k, ga[k] == null ? '—' : ga[k], gb[k] == null ? 'Removed' : gb[k]]); });
    var dec = function (d) { var o = {}; ((d && d.items) || []).forEach(function (x) { o[x.name] = x.method + ', ' + x.placement + ', ' + x.w + '×' + x.h + ' cm'; }); return o; }, da = dec(A.decoration), db = dec(B.decoration);
    Object.keys(da).concat(Object.keys(db)).filter(function (k, i, arr) { return arr.indexOf(k) === i; }).forEach(function (k) { if (da[k] !== db[k]) rows.push(['Decorations', k, da[k] || '—', db[k] || 'Removed']); });
    cmp('Care label', A.care, B.care, ['brand', 'size', 'origin', 'shell', 'lining', 'wash', 'bleach', 'dry', 'iron', 'professional', 'market', 'width', 'height', 'fold']);
    var ca = ((A.pack && A.pack.callouts) || []).map(function (c) { return c.location + ': ' + c.note; }).join(' | '), cb = ((B.pack && B.pack.callouts) || []).map(function (c) { return c.location + ': ' + c.note; }).join(' | ');
    if (ca !== cb) rows.push(['Callouts', 'Callouts', ca || '—', cb || '—']);
    var pa = pmOf(a, 'fc-pm-cost'), pb = pmOf(b, 'fc-pm-cost');
    if (pa || pb) { if ((pa && pa.code) !== (pb && pb.code)) rows.push(['Garment Studio', 'Pattern', pa ? pa.code + ' · ' + pa.garment : '—', pb ? pb.code + ' · ' + pb.garment : '—']); if ((pa && pa.fabricPerGarment) !== (pb && pb.fabricPerGarment)) rows.push(['Garment Studio', 'Fabric per garment (m)', pa ? pa.fabricPerGarment : '—', pb ? pb.fabricPerGarment : '—']); }
    var ia = Object.keys((A.pack && A.pack.images) || {}).length + ((A.pack && A.pack.gallery) || []).length, ib = Object.keys((B.pack && B.pack.images) || {}).length + ((B.pack && B.pack.gallery) || []).length;
    if (ia !== ib) rows.push(['Images', 'Sketches and detail images', ia, ib]);
    return rows;
  }
  function dataFor(s, v) { if (v === 'live') return liveData(); var f = frozen(s.id, +v); return f ? f.data : null; }
  // ---------- dialog ----------
  var CSS = '.fcr{position:fixed;inset:0;z-index:10004;background:rgba(20,17,15,.55);display:grid;place-items:start center;padding:24px 16px;overflow:auto}.fcr>div{background:#fffdf8;color:#1b1d20;width:100%;max-width:980px;border-radius:16px;padding:24px 26px;box-shadow:0 30px 80px rgba(0,0,0,.35);font:14.5px/1.5 "DM Sans",sans-serif;position:relative}'
    + '.fcr h3{margin:0 0 4px;font:600 26px "Source Serif 4",Georgia,serif}.fcr h4{margin:22px 0 8px;font:700 12px "DM Sans",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#a9481f}.fcr .x{all:unset;cursor:pointer;position:absolute;top:16px;right:18px;font-size:24px;color:#777}.fcr .sub{color:#5d5d58;margin:0 0 12px}'
    + '.fcr .cur{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 16px;border:1px solid #d9e3dc;border-radius:12px;background:#f4f8f5}.fcr .cur b.r{font:700 20px "DM Sans",sans-serif}.fcr .chip{font:700 11.5px "DM Sans",sans-serif;letter-spacing:.05em;text-transform:uppercase;padding:4px 10px;border-radius:99px;background:#e5e0d5;color:#333}.fcr .chip.Issued{background:#214538;color:#fff}.fcr .chip.In.review,.fcr .chip.review{background:#f3d9a8;color:#5a3d00}'
    + '.fcr button{cursor:pointer;font:700 13.5px "DM Sans",sans-serif;padding:8px 14px;border-radius:9px;border:1px solid #d8d0c3;background:#fff;color:#1b1d20}.fcr button.p{background:#214538;border-color:#214538;color:#fff}.fcr button:disabled{opacity:.45;cursor:not-allowed}'
    + '.fcr table{width:100%;border-collapse:collapse;font-size:13.5px}.fcr th{text-align:left;font-size:12px;color:#6b6b66;font-weight:600;padding:7px 8px;border-bottom:1px solid #e3ddd1}.fcr td{padding:7px 8px;border-bottom:1px solid #eee7da;vertical-align:top}.fcr input,.fcr select{font:14px "DM Sans",sans-serif;padding:7px 9px;border:1px solid #d8d0c3;border-radius:8px;background:#fff;color:#1b1d20;width:100%;box-sizing:border-box}'
    + '.fcr .ok{color:#1a7a45;font-weight:700}.fcr .no{color:#b03a2e;font-weight:700}.fcr .old{color:#8a3b2f;text-decoration:line-through;text-decoration-color:rgba(138,59,47,.4)}.fcr .new{color:#1a5e3a;font-weight:600}.fcr .cmp{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px}.fcr .cmp select{width:auto}'
    + '.fcs-lock{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 16px;padding:11px 14px;border-radius:12px;background:#214538;color:#fff;font:14px "DM Sans",sans-serif}.fcs-lock b{font-weight:700}.fcs-lock button{all:unset;cursor:pointer;background:#fff;color:#214538;font:700 13px "DM Sans",sans-serif;padding:7px 12px;border-radius:8px}.fcs-lock span{flex:1;min-width:240px}'
    + 'body.fcs-locked #app input:disabled,body.fcs-locked #app select:disabled,body.fcs-locked #app textarea:disabled{background:#f3f1ec;color:#444;cursor:not-allowed}';
  function chip(st) { return '<span class="chip ' + esc(st.split(' ')[0]) + (/review/.test(st) ? ' review' : '') + '">' + esc(st) + '</span>'; }
  function open(view) {
    var s = F.active(); if (!s) { alert('Choose or create a style first.'); return; }
    revs(s); var old = document.querySelector('.fcr'); if (old) old.remove();
    var c = cur(s), w = document.createElement('div'); w.className = 'fcr'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); w.setAttribute('aria-label', 'Revisions and sign-off');
    var appr = {}; (c.approvals || []).forEach(function (a) { appr[a.role] = a; });
    var changes = (c.approvals || []).filter(function (a) { return a.decision === 'Changes requested'; }).length;
    var revOpts = s.revs.slice().sort(function (a, b) { return b.rev - a.rev; }).filter(function (r) { return frozen(s.id, r.rev); }).map(function (r) { return '<option value="' + r.rev + '">Rev ' + r.rev + ' · ' + r.status + '</option>'; }).join('');
    w.innerHTML = '<div><button class="x" type="button" data-r="x" aria-label="Close">×</button><h3>Revisions &amp; sign-off</h3><p class="sub"><b style="font-family:ui-monospace,Menlo,monospace">' + esc(s.id) + '</b> · ' + esc(s.name) + '</p>'
      + '<div class="cur"><b class="r">Rev ' + c.rev + '</b>' + chip(c.status) + '<span style="color:#5d5d58">created ' + day(c.created) + (c.issued ? ' · issued ' + day(c.issued) + (c.issuedBy ? ' by ' + esc(c.issuedBy) : '') : '') + '</span><span style="flex:1"></span>'
      + (c.status === 'Draft' ? '<button type="button" data-r="submit">Send for review</button>' : '') + (c.status !== 'Issued' ? '<button type="button" class="p" data-r="issue">Issue Rev ' + c.rev + '</button>' : '') + '<button type="button" ' + (c.status === 'Issued' ? 'class="p" ' : '') + 'data-r="next">Start Rev ' + (c.rev + 1) + '</button></div>'
      + (c.status === 'Issued' ? '<p class="sub" style="margin-top:10px">Rev ' + c.rev + ' is issued and read-only in the tools. To make changes, start Rev ' + (c.rev + 1) + '; Rev ' + c.rev + ' stays exactly as issued.</p>' : '<p class="sub" style="margin-top:10px">Issuing freezes a copy of everything saved for this style (brief, tech pack, BOM, size chart, decorations, care label, Garment Studio pattern and costing) and makes it read-only.</p>')
      + '<h4>Sign-off for Rev ' + c.rev + '</h4><table><thead><tr><th style="width:22%">Role</th><th>Name</th><th style="width:20%">Decision</th><th>Note</th><th style="width:12%">Date</th><th></th></tr></thead><tbody>'
      + ROLES.map(function (role, i) { var a = appr[role]; return '<tr><td><b>' + esc(role) + '</b></td>' + (a ? '<td>' + esc(a.name) + '</td><td class="' + (a.decision === 'Approved' ? 'ok' : 'no') + '">' + esc(a.decision) + '</td><td>' + esc(a.note) + '</td><td>' + day(a.at) + '</td><td>' + (c.status === 'Issued' ? '' : '<button type="button" data-r="redo" data-role="' + esc(role) + '">Change</button>') + '</td>' : (c.status === 'Issued' ? '<td colspan="5" style="color:#999">Not signed</td>' : '<td><input data-n="' + i + '" value="' + esc(signer()) + '" maxlength="80" placeholder="Name"></td><td><select data-d="' + i + '"><option>Approved</option><option>Changes requested</option></select></td><td><input data-o="' + i + '" maxlength="200" placeholder="Optional note"></td><td>—</td><td><button type="button" data-r="sign" data-i="' + i + '">Sign</button></td>')) + '</tr>'; }).join('') + '</tbody></table>'
      + (changes ? '<p class="no" style="margin:8px 0 0">' + changes + ' sign-off' + (changes > 1 ? 's ask' : ' asks') + ' for changes before this revision is issued.</p>' : '')
      + '<h4>History</h4><table><thead><tr><th>Revision</th><th>Status</th><th>Created</th><th>Issued</th><th>Sign-offs</th><th>Reason</th><th></th></tr></thead><tbody>'
      + s.revs.slice().sort(function (a, b) { return b.rev - a.rev; }).map(function (r) { var fz = frozen(s.id, r.rev); return '<tr><td><b>Rev ' + r.rev + '</b>' + (r.rev === c.rev ? ' <small style="color:#1a7a45">current</small>' : '') + '</td><td>' + chip(r.status) + '</td><td>' + day(r.created) + '</td><td>' + (r.issued ? day(r.issued) + (r.issuedBy ? '<br><small>' + esc(r.issuedBy) + '</small>' : '') : '—') + '</td><td>' + ((r.approvals || []).map(function (a) { return '<span class="' + (a.decision === 'Approved' ? 'ok' : 'no') + '">' + (a.decision === 'Approved' ? '✓' : '✗') + '</span> ' + esc(a.role) + ' · ' + esc(a.name); }).join('<br>') || '—') + '</td><td>' + esc(r.reason || '') + '</td><td style="white-space:nowrap">' + (fz ? '<button type="button" data-r="dl" data-rev="' + r.rev + '">Download</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table>'
      + '<h4>Compare</h4>' + (revOpts ? '<div class="cmp"><select data-ca>' + revOpts + '</select><span>with</span><select data-cb><option value="live">Current work (Rev ' + c.rev + ')</option>' + revOpts + '</select><button type="button" data-r="cmp">Compare</button></div><div data-out></div>' : '<p class="sub">Issue a revision to compare it with later work.</p>')
      + '</div>';
    document.body.appendChild(w);
    var close = function () { w.remove(); };
    w.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    w.addEventListener('click', function (e) {
      if (e.target === w) return close();
      var b = e.target.closest('[data-r]'); if (!b) return; var a = b.dataset.r;
      if (a === 'x') return close();
      if (a === 'submit') { submit(); return reopen(); }
      if (a === 'sign') { var i = +b.dataset.i, n = w.querySelector('[data-n="' + i + '"]').value.trim(); if (!n) { w.querySelector('[data-n="' + i + '"]').focus(); return; } approve(ROLES[i], n, w.querySelector('[data-d="' + i + '"]').value, w.querySelector('[data-o="' + i + '"]').value.trim()); return reopen(); }
      if (a === 'redo') { withStyle(function (s2) { var c2 = cur(s2); c2.approvals = c2.approvals.filter(function (x) { return x.role !== b.dataset.role; }); }); return reopen(); }
      if (a === 'issue') { var ap = (c.approvals || []).filter(function (x) { return x.decision === 'Approved'; }).length; var msg = 'Issue Rev ' + c.rev + ' of ' + s.id + '?\n\nA copy of all its work is frozen and the tools become read-only for this revision.' + (changes ? '\n\nWarning: ' + changes + ' sign-off(s) ask for changes.' : ap ? '' : '\n\nNo one has signed it off yet.'); if (!confirm(msg)) return; var by = prompt('Issued by (your name)', signer()) || signer(); if (issue(by)) location.reload(); return; }
      if (a === 'next') { var why = prompt('Start Rev ' + (c.rev + 1) + '. What is changing? (optional, shown in the history)', '') ; if (why === null) return; if (startNext(why)) location.reload(); return; }
      if (a === 'dl') { var fz = frozen(s.id, +b.dataset.rev); var u = URL.createObjectURL(new Blob([JSON.stringify({ forecut: 'style-revision', style: s, rev: +b.dataset.rev, frozen: fz }, null, 2)], { type: 'application/json' })), l = document.createElement('a'); l.href = u; l.download = s.id + '_R' + b.dataset.rev + '_revision.json'; l.click(); setTimeout(function () { URL.revokeObjectURL(u); }, 2000); return; }
      if (a === 'cmp') { var va = w.querySelector('[data-ca]').value, vb = w.querySelector('[data-cb]').value, A = dataFor(s, va), B = dataFor(s, vb), out = w.querySelector('[data-out]'); if (!A || !B) { out.innerHTML = '<p class="no">That revision has no frozen copy.</p>'; return; } var rows = diff(A, B), la = 'Rev ' + va, lb = vb === 'live' ? 'Current work' : 'Rev ' + vb; out.innerHTML = rows.length ? '<p class="sub">' + rows.length + ' change' + (rows.length > 1 ? 's' : '') + ' from ' + la + ' to ' + lb + '.</p><table><thead><tr><th>Section</th><th>What</th><th>' + esc(la) + '</th><th>' + esc(lb) + '</th></tr></thead><tbody>' + rows.slice(0, 400).map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td class="old">' + esc(r[2] == null ? '—' : r[2]) + '</td><td class="new">' + esc(r[3] == null ? '—' : r[3]) + '</td></tr>'; }).join('') + '</tbody></table>' : '<p class="ok">No differences between ' + esc(la) + ' and ' + esc(lb) + '.</p>'; return; }
    });
    function reopen() { open(); }
    var first = w.querySelector('button.p,button'); if (first) first.focus();
  }
  // ---------- read-only tools for an issued revision ----------
  var ALLOW = /csv|export|print|download|xls|svg|txt|clip|bomCSV|sizeCSV|sizeXLS|copyCSV|copyShopify|labelSVG|labelTXT|marketCSV|decorationCSV|downloadSnapshot/i;
  function lockApp() {
    var app = document.getElementById('app'); if (!app) return;
    app.querySelectorAll('input,select,textarea').forEach(function (el) { if (!el.disabled) { el.disabled = true; el.dataset.fcsLocked = '1'; } });
    app.querySelectorAll('button[data-action],label.button,label:has(input[type=file])').forEach(function (el) { var a = el.dataset && el.dataset.action || ''; if (a && ALLOW.test(a)) return; if (el.tagName === 'BUTTON' && !el.disabled) { el.disabled = true; el.title = 'This revision is issued. Start a new revision to change it.'; } if (el.tagName === 'LABEL') el.style.pointerEvents = 'none'; });
  }
  function init() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var s = F.active(), tool = document.body.getAttribute('data-tool') || '';
    if (!s || !locked()) return;
    var c = cur(s), stu = /size-chart|decoration|tech-pack|care-label|product-description|export-market|trend-to-style|textile-processing/.test(tool), pm = !!document.getElementById('pm-ttl');
    if (!stu && !pm) return;
    var b = document.createElement('div'); b.className = 'fcs-lock no-print'; b.innerHTML = '<b>🔒 Rev ' + c.rev + ' issued ' + day(c.issued) + '</b><span>' + (pm ? 'This pattern belongs to an issued revision. Changes you make now are not part of Rev ' + c.rev + '; start Rev ' + (c.rev + 1) + ' to keep them.' : 'This style’s work is read-only. Export and print still work.') + '</span><button type="button">Start Rev ' + (c.rev + 1) + '</button>';
    b.querySelector('button').onclick = function () { var why = prompt('Start Rev ' + (c.rev + 1) + '. What is changing? (optional)', ''); if (why === null) return; if (startNext(why)) location.reload(); };
    var bar = document.querySelector('.fcs-bar');
    if (pm) { b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:14px;z-index:9000;max-width:760px;box-shadow:0 10px 30px rgba(0,0,0,.35)'; document.body.appendChild(b); return; }
    if (bar && bar.parentNode) bar.parentNode.insertBefore(b, bar.nextSibling);
    document.body.classList.add('fcs-locked'); lockApp();
    var app = document.getElementById('app'); if (app && window.MutationObserver) new MutationObserver(function () { lockApp(); }).observe(app, { childList: true, subtree: true });
  }
  window.ForecutRev = { open: open, statusOf: statusOf, locked: locked, current: function () { var s = F.active(); return s ? cur(s) : null; }, diff: diff, frozen: frozen, ROLES: ROLES };
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
