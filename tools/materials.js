/* Forecut Fabric & Trims Library (Stage 8).
   Reusable material records kept in this browser (fc-materials). Every specification value carries where it came from:
   entered by you, a supplier claim, or a lab test (with method, lab, date and report). Changes are logged; styles that use
   a material are flagged so the Tech Pack BOM, the Garment Studio marker and costing can be updated. */
(function () {
  'use strict';
  var app = document.getElementById('app'); if (!app) return;
  var KEY = 'fc-materials';
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function day(d) { return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; }
  function inr(v) { return '₹' + (+v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 }); }
  var SRC = { user: 'Entered by me', supplier: 'Supplier claim', lab: 'Lab tested' };
  var FAB_CATS = ['Woven', 'Knit', 'Denim', 'Non-woven', 'Lining', 'Interlining / fusing', 'Lace / embroidery', 'Leather / coated', 'Other'];
  var TRIM_CATS = ['Button', 'Zip', 'Snap / rivet', 'Label', 'Hangtag', 'Thread', 'Elastic', 'Tape / binding', 'Drawcord', 'Interlining', 'Packaging', 'Other'];
  // [key, label, unit, numeric, for Fabric, for Trim]
  var PROPS = [['fibre', 'Fibre content', '', 0, 1, 1], ['construction', 'Construction / weave / knit', '', 0, 1, 0], ['spec', 'Size / spec (ligne, gauge, tape width)', '', 0, 0, 1], ['gsm', 'Weight', 'GSM', 1, 1, 0], ['width', 'Cuttable width', 'cm', 1, 1, 0],
    ['shrL', 'Shrinkage, length', '%', 1, 1, 0], ['shrW', 'Shrinkage, width', '%', 1, 1, 0], ['stretch', 'Stretch', '%', 1, 1, 1], ['colourfast', 'Colour fastness (wash)', 'grade', 0, 1, 1], ['pilling', 'Pilling', 'grade', 0, 1, 0], ['tensile', 'Tear / tensile / pull strength', '', 0, 1, 1], ['finish', 'Finish', '', 0, 1, 1]];
  var TEST_METHODS = ['ISO 5077 / ISO 6330 (dimensional change)', 'AATCC 135 (dimensional change)', 'ISO 105-C06 (colour fastness to washing)', 'ISO 105-X12 (rubbing)', 'ISO 12945-2 (Martindale pilling)', 'ISO 13937 (tear)', 'ISO 13934-1 (tensile)', 'ASTM D3776 (mass per area)', 'ISO 3801 (mass per area)', 'Composition test (ISO 1833)', 'Snap / button pull test (ASTM D4846)', 'Other'];
  function load() { try { var o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && Array.isArray(o.items)) return o; } catch (e) { } return { v: 1, seq: 0, items: [] }; }
  var S = load(), sel = null, filter = { q: '', t: 'All' }, cmp = [];
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); var st = $('#status'); if (st) st.textContent = 'Saved in this browser · ' + new Date().toLocaleTimeString(); } catch (e) { alert('Browser storage is full. Download a backup and remove large records.'); } }
  function byId(id) { return S.items.filter(function (x) { return x.id === id; })[0]; }
  function blank(type) { S.seq = (S.seq || 0) + 1; return { id: (type === 'Trim' ? 'T-' : 'F-') + String(S.seq).padStart(4, '0'), type: type, name: type === 'Trim' ? 'New trim' : 'New fabric', code: '', cat: type === 'Trim' ? 'Button' : 'Woven', colour: '', vendor: '', vendorRef: '', price: 0, unit: type === 'Trim' ? 'pc' : 'm', moq: '', lead: '', certs: '', subs: [], notes: '', status: 'Developing', p: {}, src: {}, tests: [], history: [], usedBy: {}, created: new Date().toISOString(), updated: new Date().toISOString() }; }
  function setProp(m, k, v, src, why) { var old = m.p[k]; if (String(old == null ? '' : old) === String(v)) { if (src) m.src[k] = src; return; } m.history.unshift({ at: new Date().toISOString(), prop: k, from: old == null ? '' : old, to: v, src: src || m.src[k] || 'user', why: why || '' }); m.history = m.history.slice(0, 200); m.p[k] = v; if (src) m.src[k] = src; m.updated = new Date().toISOString(); if (Object.keys(m.usedBy || {}).length) m.dirty = (m.dirty || []).concat([k]).filter(function (x, i, a) { return a.indexOf(x) === i; }); }
  function label(k) { var p = PROPS.filter(function (x) { return x[0] === k; })[0]; return p ? p[1] : { price: 'Price', name: 'Name', vendor: 'Vendor' }[k] || k; }
  function unitOf(k) { var p = PROPS.filter(function (x) { return x[0] === k; })[0]; return p ? p[2] : ''; }
  function verified(m) { return Object.keys(m.src || {}).filter(function (k) { return m.src[k] === 'lab'; }).length; }
  function active() { var F = window.ForecutStyle; return F && F.active ? F.active() : null; }
  /* ---------- views ---------- */
  function listView() {
    var q = filter.q.toLowerCase(), L = S.items.filter(function (m) { return (filter.t === 'All' || m.type === filter.t) && (!q || (m.name + ' ' + m.code + ' ' + m.vendor + ' ' + (m.p.fibre || '') + ' ' + m.cat + ' ' + m.colour).toLowerCase().indexOf(q) > -1); });
    return '<section class="panel ml-list"><div class="ml-tb"><input id="mlQ" type="search" placeholder="Search name, fibre, vendor…" value="' + esc(filter.q) + '" aria-label="Search materials"><select id="mlT" aria-label="Show">' + ['All', 'Fabric', 'Trim'].map(function (t) { return '<option' + (t === filter.t ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select></div>'
      + '<div class="actions"><button class="primary" type="button" data-a="newF">+ Fabric</button><button type="button" data-a="newT">+ Trim</button><button type="button" data-a="import">Import CSV</button><button type="button" data-a="export"' + (S.items.length ? '' : ' disabled') + '>Export CSV</button>' + (cmp.length > 1 ? '<button type="button" data-a="compare">Compare ' + cmp.length + '</button>' : '') + '</div>'
      + (L.length ? '<ul class="ml-items">' + L.map(function (m) { var v = verified(m), dirty = (m.dirty || []).length; return '<li class="' + (sel === m.id ? 'on' : '') + '"><label class="ml-cb" title="Tick to compare"><input type="checkbox" data-cmp="' + m.id + '"' + (cmp.indexOf(m.id) > -1 ? ' checked' : '') + '></label><button type="button" data-sel="' + m.id + '"><span class="ml-sw" style="background:' + (/^#[0-9a-f]{6}$/i.test(m.colour) ? m.colour : '#e6dfd2') + '"></span><span class="ml-n"><b>' + esc(m.name) + '</b><small>' + esc([m.id, m.type === 'Fabric' ? [m.p.fibre, m.p.gsm ? m.p.gsm + ' GSM' : '', m.p.width ? m.p.width + ' cm' : ''].filter(Boolean).join(' · ') : [m.cat, m.p.spec].filter(Boolean).join(' · '), m.vendor].filter(Boolean).join(' · ')) + '</small></span><span class="ml-tags">' + (v ? '<i class="ok" title="Values confirmed by a lab test">' + v + ' tested</i>' : '') + (dirty ? '<i class="warn" title="Changed since styles started using it">changed</i>' : '') + '<i>' + esc(m.status) + '</i></span></button></li>'; }).join('') + '</ul>' : '<p class="empty">' + (S.items.length ? 'Nothing matches.' : 'No materials yet. Add a fabric or trim, or import a CSV from your supplier list.') + '</p>')
      + '<input type="file" id="mlFile" accept=".csv,.txt,text/csv" hidden></section>';
  }
  function field(lab, k, v, opt) { opt = opt || {}; return '<label>' + lab + (opt.sel ? '<select data-f="' + k + '">' + opt.sel.map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>' : opt.area ? '<textarea data-f="' + k + '" rows="2" maxlength="1000">' + esc(v) + '</textarea>' : '<input data-f="' + k + '" value="' + esc(v) + '"' + (opt.type ? ' type="' + opt.type + '" step="any" min="0"' : ' maxlength="200"') + (opt.ph ? ' placeholder="' + esc(opt.ph) + '"' : '') + '>') + '</label>'; }
  function detailView() {
    var m = byId(sel); if (!m) return '<section class="panel ml-det"><p class="empty">Choose a material, or add one. Each value can be marked as entered by you, a supplier claim, or lab tested.</p></section>';
    var props = PROPS.filter(function (p) { return m.type === 'Fabric' ? p[4] : p[5]; }), a = active(), used = Object.keys(m.usedBy || {}), dirty = m.dirty || [];
    var subs = S.items.filter(function (x) { return x.id !== m.id && x.type === m.type; });
    var h = '<section class="panel ml-det"><div class="ml-dh"><div><span class="ml-id">' + esc(m.id) + ' · ' + esc(m.type) + '</span><h2>' + esc(m.name) + '</h2></div><div class="actions"><button type="button" data-a="dup">Duplicate</button><button type="button" class="danger" data-a="del">Delete</button></div></div>'
      + (dirty.length && used.length ? '<div class="notice ml-imp"><b>Changed since it was used:</b> ' + dirty.map(label).join(', ') + '. Affected styles: ' + used.map(esc).join(', ') + '.<br>' + (dirty.some(function (k) { return /price|name|vendor/.test(k); }) ? 'The Tech Pack materials list for those styles will offer to update. ' : '') + (dirty.some(function (k) { return /shr|width/.test(k); }) ? 'Shrinkage or width changed: apply it to the Garment Studio marker and make the marker again, then send the new consumption to costing. ' : '') + '<div class="actions">' + (m.type === 'Fabric' && dirty.some(function (k) { return /shr|width/.test(k); }) ? '<button type="button" class="primary" data-a="toMarker">Apply to Garment Studio marker</button>' : '') + '<button type="button" data-a="ack">Mark as handled</button></div></div>' : '')
      + '<h3>Identity</h3><div class="fields">' + field('Name', 'name', m.name) + field('Your code', 'code', m.code, { ph: 'e.g. FAB-LIN-150' }) + field('Category', 'cat', m.cat, { sel: m.type === 'Fabric' ? FAB_CATS : TRIM_CATS }) + field('Colour (hex or name)', 'colour', m.colour, { ph: '#2b4c8c or Navy' }) + field('Status', 'status', m.status, { sel: ['Developing', 'Approved', 'Approved for bulk', 'On hold', 'Discontinued'] }) + '</div>'
      + '<h3>Specification</h3><p class="note">Pick where each value comes from. A lab test you add below sets the value and marks it lab tested.</p><div class="ml-props">' + props.map(function (p) { var k = p[0], s = m.src[k] || 'user'; return '<div class="ml-pr"><label>' + p[1] + (p[2] ? ' <small>' + p[2] + '</small>' : '') + '<input data-p="' + k + '" value="' + esc(m.p[k] == null ? '' : m.p[k]) + '"' + (p[3] ? ' type="number" step="any"' : ' maxlength="200"') + '></label><select data-s="' + k + '" class="ml-src ' + s + '" aria-label="Source of ' + esc(p[1]) + '">' + Object.keys(SRC).map(function (o) { return '<option value="' + o + '"' + (o === s ? ' selected' : '') + '>' + SRC[o] + '</option>'; }).join('') + '</select></div>'; }).join('') + '</div>'
      + '<h3>Commercial</h3><div class="fields">' + field('Vendor / mill', 'vendor', m.vendor) + field('Vendor reference', 'vendorRef', m.vendorRef) + field('Price (₹)', 'price', m.price, { type: 'number' }) + field('Per', 'unit', m.unit, { sel: ['m', 'kg', 'yd', 'pc', 'gross', 'set', 'cone', 'roll'] }) + field('Minimum order (MOQ)', 'moq', m.moq, { ph: 'e.g. 500 m per colour' }) + field('Lead time', 'lead', m.lead, { ph: 'e.g. 21 days greige, 35 dyed' }) + field('Certifications', 'certs', m.certs, { ph: 'GOTS, OEKO-TEX, GRS… with certificate numbers' }) + '</div><p class="note">Certifications are what the supplier states. Ask for the certificate and check its scope and expiry on the certifier’s database before claiming it on a label.</p>'
      + '<h3>Approved substitutes</h3>' + (subs.length ? '<div class="ml-subs">' + subs.map(function (x) { return '<label><input type="checkbox" data-sub="' + x.id + '"' + (m.subs.indexOf(x.id) > -1 ? ' checked' : '') + '> ' + esc(x.name) + ' <small>' + esc(x.id) + '</small></label>'; }).join('') + '</div>' : '<p class="note">Add another ' + m.type.toLowerCase() + ' to mark it as an approved substitute.</p>')
      + '<h3>Test results</h3>' + (m.tests.length ? '<div class="table-scroll"><table><thead><tr><th>Property</th><th>Result</th><th>Method</th><th>Lab</th><th>Date</th><th>Report</th><th></th></tr></thead><tbody>' + m.tests.map(function (t, i) { return '<tr><td>' + esc(label(t.prop)) + '</td><td><b>' + esc(t.value) + '</b> ' + esc(unitOf(t.prop)) + '</td><td>' + esc(t.method) + '</td><td>' + esc(t.lab) + '</td><td>' + day(t.date) + '</td><td>' + esc(t.report) + '</td><td><button type="button" class="small" data-rmtest="' + i + '">Remove</button></td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="note">No lab results yet.</p>')
      + '<div class="ml-test"><select id="tP" aria-label="Property tested">' + props.map(function (p) { return '<option value="' + p[0] + '">' + p[1] + '</option>'; }).join('') + '</select><input id="tV" placeholder="Result" aria-label="Result"><select id="tM" aria-label="Test method">' + TEST_METHODS.map(function (x) { return '<option>' + x + '</option>'; }).join('') + '</select><input id="tL" placeholder="Lab" aria-label="Lab"><input id="tD" type="date" value="' + today() + '" aria-label="Test date"><input id="tR" placeholder="Report no." aria-label="Report number"><button type="button" class="primary" data-a="addTest">Add result</button></div>'
      + '<h3>Used by styles</h3>' + (used.length ? '<ul class="ml-used">' + used.map(function (id) { var u = m.usedBy[id]; return '<li><b>' + esc(id) + '</b> ' + esc(u.name || '') + ' <small>since ' + day(u.at) + '</small></li>'; }).join('') + '</ul>' : '<p class="note">Not used by any style yet.</p>')
      + '<div class="actions">' + (a ? '<button type="button" class="primary" data-a="use">Add to ' + esc(a.id) + ' Tech Pack materials list</button>' : '<span class="note">Choose a style in the style bar to add this material to its tech pack.</span>') + '</div>'
      + field('Notes', 'notes', m.notes, { area: 1 })
      + '<details class="ml-hist"><summary>Change history (' + m.history.length + ')</summary>' + (m.history.length ? '<table><tbody>' + m.history.slice(0, 60).map(function (x) { return '<tr><td>' + day(x.at) + '</td><td>' + esc(label(x.prop)) + '</td><td>' + esc(x.from === '' ? '—' : x.from) + ' → <b>' + esc(x.to) + '</b></td><td>' + esc(SRC[x.src] || '') + (x.why ? ' · ' + esc(x.why) : '') + '</td></tr>'; }).join('') + '</tbody></table>' : '<p class="note">No changes yet.</p>') + '</details></section>';
    return h;
  }
  function compareView() {
    var L = cmp.map(byId).filter(Boolean); if (L.length < 2) return '';
    var rows = [['Type', function (m) { return m.type + ' · ' + m.cat; }], ['Vendor', function (m) { return m.vendor; }], ['Price', function (m) { return inr(m.price) + ' / ' + m.unit; }], ['MOQ', function (m) { return m.moq; }], ['Lead time', function (m) { return m.lead; }], ['Certifications', function (m) { return m.certs; }]].concat(PROPS.map(function (p) { return [p[1] + (p[2] ? ' (' + p[2] + ')' : ''), function (m) { var v = m.p[p[0]]; return v == null || v === '' ? '' : v + (m.src[p[0]] === 'lab' ? ' ✓ lab' : m.src[p[0]] === 'supplier' ? ' · supplier' : ''); }]; }));
    return '<section class="panel ml-cmp"><div class="panel-head"><h2>Compare</h2><button type="button" data-a="cmpClose">Close</button></div><div class="table-scroll"><table><thead><tr><th></th>' + L.map(function (m) { return '<th>' + esc(m.name) + '<br><small>' + esc(m.id) + '</small></th>'; }).join('') + '</tr></thead><tbody>' + rows.filter(function (r) { return L.some(function (m) { return r[1](m); }); }).map(function (r) { return '<tr><td>' + esc(r[0]) + '</td>' + L.map(function (m) { return '<td>' + esc(r[1](m) || '—') + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div><p class="note">✓ lab = confirmed by a lab test; supplier = the supplier’s claim; plain = entered by you.</p></section>';
  }
  var showCmp = false;
  function later() { setTimeout(render, 0); }
  function render() { app.innerHTML = (showCmp ? compareView() : '') + '<div class="ml-grid">' + listView() + detailView() + '</div>'; }
  /* ---------- actions ---------- */
  function use(m) {
    var a = active(); if (!a) return; var K = 'fc-production-studio-v1', st; try { st = JSON.parse(localStorage.getItem(K) || 'null'); } catch (e) { st = null; }
    if (!st || !st.pack || !Array.isArray(st.pack.bom)) { alert('Open the Tech Pack Builder once for this style, then add the material again.'); return; }
    if (st.pack.bom.some(function (r) { return r.src === 'lib:' + m.id; })) { alert(m.name + ' is already in this style’s materials list.'); return; }
    var qty = 1; if (m.type === 'Fabric') { try { var pc = JSON.parse(localStorage.getItem('fc-pm-cost') || 'null'); if (pc && pc.fabricPerGarment && (!pc.style || pc.style === a.id)) qty = +pc.fabricPerGarment; } catch (e) { } }
    if (st.pack.bom.length >= 100) { alert('The materials list is full (100 lines).'); return; }
    st.pack.bom.push({ item: m.name + (m.type === 'Fabric' && m.p.width ? ' · ' + m.p.width + ' cm wide' : ''), supplier: m.vendor, colour: m.colour, quantity: qty, unit: m.unit === 'pc' ? 'piece' : m.unit, price: +m.price || 0, src: 'lib:' + m.id, approval: m.status === 'Approved' || m.status === 'Approved for bulk' ? 'Approved' : 'Pending', approvalNote: 'From Materials Library ' + m.id });
    try { localStorage.setItem(K, JSON.stringify(st)); } catch (e) { alert('Storage is full.'); return; }
    m.usedBy[a.id] = { at: new Date().toISOString(), name: a.name }; save(); render(); var s2 = $('#status'); if (s2) s2.textContent = 'Added to the ' + a.id + ' Tech Pack materials list' + (m.type === 'Fabric' && qty !== 1 ? ' at ' + qty + ' ' + m.unit + ' per garment (from the marker)' : '') + '.';
  }
  function toMarker(m) {
    var K = 'fc-tool-pm2', P; try { P = JSON.parse(localStorage.getItem(K) || 'null'); } catch (e) { P = null; }
    if (!P || !Array.isArray(P.pieces)) { alert('No Garment Studio pattern is saved for the active style yet.'); return; }
    P.marker = Object.assign({}, P.marker || {}, { shrL: +m.p.shrL || 0, shrW: +m.p.shrW || 0 }); if (+m.p.width) { P.marker.width = +m.p.width; P.marker.wunit = P.marker.wunit || 'cm'; }
    try { localStorage.setItem(K, JSON.stringify(P)); } catch (e) { alert('Storage is full.'); return; }
    m.dirty = (m.dirty || []).filter(function (k) { return !/shr|width/.test(k); }); save(); render();
    var s2 = $('#status'); if (s2) s2.textContent = 'Garment Studio marker now uses ' + (+m.p.shrL || 0) + '% × ' + (+m.p.shrW || 0) + '% shrinkage' + (+m.p.width ? ' and ' + m.p.width + ' cm width' : '') + '. Open Garment Studio → Marker → Make marker, then Use in costing.';
  }
  function csvCell(v) { v = String(v == null ? '' : v); if (/^[=+@\-]/.test(v)) v = "'" + v; return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  var COLS = [['ID', 'id'], ['Type', 'type'], ['Name', 'name'], ['Code', 'code'], ['Category', 'cat'], ['Colour', 'colour'], ['Status', 'status'], ['Vendor', 'vendor'], ['Vendor ref', 'vendorRef'], ['Price', 'price'], ['Unit', 'unit'], ['MOQ', 'moq'], ['Lead time', 'lead'], ['Certifications', 'certs']];
  function exportCSV() { var head = COLS.map(function (c) { return c[0]; }).concat(PROPS.map(function (p) { return p[1] + (p[2] ? ' (' + p[2] + ')' : ''); }), PROPS.map(function (p) { return p[1] + ' source'; })), rows = S.items.map(function (m) { return COLS.map(function (c) { return m[c[1]]; }).concat(PROPS.map(function (p) { return m.p[p[0]]; }), PROPS.map(function (p) { return m.p[p[0]] != null && m.p[p[0]] !== '' ? SRC[m.src[p[0]] || 'user'] : ''; })); });
    var t = '﻿' + [head].concat(rows).map(function (r) { return r.map(csvCell).join(','); }).join('\r\n'), a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], { type: 'text/csv' })); a.download = 'materials-library.csv'; a.click(); }
  function splitCSV(t) { var out = [], row = [], c = '', q = false; t = t.replace(/^﻿/, ''); for (var i = 0; i < t.length; i++) { var ch = t[i]; if (q) { if (ch === '"' && t[i + 1] === '"') { c += '"'; i++; } else if (ch === '"') q = false; else c += ch; } else if (ch === '"') q = true; else if (ch === ',' || ch === '\t' || ch === ';') { row.push(c); c = ''; } else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; row.push(c); out.push(row); row = []; c = ''; } else c += ch; } if (c || row.length) { row.push(c); out.push(row); } return out.filter(function (r) { return r.some(function (x) { return String(x).trim(); }); }); }
  function importCSV(t) {
    var R = splitCSV(t); if (R.length < 2) throw Error('The file needs a header row and at least one material.');
    var H = R[0].map(function (h) { return String(h).trim().toLowerCase(); }), find = function (re) { return H.findIndex(function (h) { return re.test(h) && !/source/.test(h); }); };
    var map = { name: find(/^(name|material|description|item)/), type: find(/^type/), code: find(/code|article|ref$/), cat: find(/categ/), colour: find(/colou?r/), vendor: find(/vendor|mill|supplier/), price: find(/price|rate/), unit: find(/^unit|per$/), moq: find(/moq|minimum/), lead: find(/lead/), certs: find(/cert/),
      fibre: find(/fibre|fiber|composition|content/), construction: find(/construct|weave|knit/), gsm: find(/gsm|weight/), width: find(/width/), shrL: find(/shrink.*(len|warp)|length shrink/), shrW: find(/shrink.*(wid|weft)|width shrink/), stretch: find(/stretch/), finish: find(/finish/), spec: find(/spec|size|ligne/) };
    if (map.name < 0) throw Error('Add a column called Name (or Material).');
    var n = 0; R.slice(1).forEach(function (r) { var g = function (k) { return map[k] > -1 ? String(r[map[k]] || '').trim() : ''; }; if (!g('name')) return; var type = /trim|button|zip|label|thread|elastic|tape/i.test(g('type') + ' ' + g('cat')) ? 'Trim' : 'Fabric', m = blank(type);
      m.name = g('name').slice(0, 120); ['code', 'colour', 'vendor', 'moq', 'lead', 'certs'].forEach(function (k) { if (g(k)) m[k] = g(k).slice(0, 200); }); if (g('cat')) m.cat = g('cat').slice(0, 60); if (g('unit')) m.unit = g('unit').slice(0, 10); var pr = parseFloat(g('price').replace(/[₹,\s]/g, '')); if (isFinite(pr)) m.price = pr;
      PROPS.forEach(function (p) { var v = g(p[0]); if (v) { m.p[p[0]] = p[3] ? (parseFloat(v.replace(/[%,\s]/g, '')) || 0) : v.slice(0, 200); m.src[p[0]] = 'supplier'; } }); S.items.push(m); n++; });
    if (!n) throw Error('No rows with a name were found.'); save(); render(); var s2 = $('#status'); if (s2) s2.textContent = n + ' material' + (n > 1 ? 's' : '') + ' imported. Imported values are marked as supplier claims: change the source when you have confirmed them.';
  }
  app.addEventListener('input', function (e) { var t = e.target, m = byId(sel);
    if (t.id === 'mlQ') { filter.q = t.value; var pos = t.selectionStart; render(); var q2 = $('#mlQ'); q2.focus(); try { q2.setSelectionRange(pos, pos); } catch (x) { } return; }
    if (!m) return;
    if (t.dataset.f && t.tagName !== 'SELECT') { var k = t.dataset.f; m[k] = t.type === 'number' ? (+t.value || 0) : t.value; m.updated = new Date().toISOString(); save(); }
  });
  app.addEventListener('change', function (e) { var t = e.target, m = byId(sel);
    if (t.id === 'mlT') { filter.t = t.value; return later(); }
    if (t.dataset.cmp) { var i = cmp.indexOf(t.dataset.cmp); if (t.checked && i < 0) cmp.push(t.dataset.cmp); if (!t.checked && i > -1) cmp.splice(i, 1); cmp = cmp.slice(-4); return later(); }
    if (t.id === 'mlFile') { var f = t.files[0]; if (f) f.text().then(function (x) { try { importCSV(x); } catch (er) { alert(er.message); } }); return; }
    if (!m) return;
    if (t.dataset.f) { var k2 = t.dataset.f; if (t.tagName === 'SELECT') { m[k2] = t.value; m.updated = new Date().toISOString(); }
      else if (/^(price|name|vendor)$/.test(k2) && String(t.defaultValue) !== String(t.value)) { m.history.unshift({ at: new Date().toISOString(), prop: k2, from: t.defaultValue, to: m[k2], src: 'user' }); if (Object.keys(m.usedBy).length) m.dirty = (m.dirty || []).concat([k2]).filter(function (x, i, a) { return a.indexOf(x) === i; }); }
      save(); if (t.tagName === 'SELECT' || k2 === 'name' || (m.dirty || []).indexOf(k2) > -1) later(); return; }
    if (t.dataset.p) { var p = PROPS.filter(function (x) { return x[0] === t.dataset.p; })[0]; var hadDirty = (m.dirty || []).length; setProp(m, t.dataset.p, p[3] ? (t.value === '' ? '' : +t.value) : t.value); save(); if ((m.dirty || []).length !== hadDirty) later(); return; }
    if (t.dataset.s) { m.src[t.dataset.s] = t.value; m.history.unshift({ at: new Date().toISOString(), prop: t.dataset.s, from: m.p[t.dataset.s], to: m.p[t.dataset.s], src: t.value, why: 'source set to ' + SRC[t.value] }); save(); return later(); }
    if (t.dataset.sub) { var j = m.subs.indexOf(t.dataset.sub); if (t.checked && j < 0) m.subs.push(t.dataset.sub); if (!t.checked && j > -1) m.subs.splice(j, 1); save(); }
  });
  app.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var a = b.dataset.a, m = byId(sel);
    if (b.dataset.sel) { sel = b.dataset.sel; return render(); }
    if (a === 'newF' || a === 'newT') { var n = blank(a === 'newF' ? 'Fabric' : 'Trim'); S.items.unshift(n); sel = n.id; save(); return render(); }
    if (a === 'import') return $('#mlFile').click();
    if (a === 'export') return exportCSV();
    if (a === 'compare') { showCmp = true; render(); return window.scrollTo({ top: 0, behavior: 'smooth' }); }
    if (a === 'cmpClose') { showCmp = false; return render(); }
    if (!m) return;
    if (a === 'dup') { var c = JSON.parse(JSON.stringify(m)), nb = blank(m.type); c.id = nb.id; c.name = m.name + ' copy'; c.usedBy = {}; c.history = []; c.dirty = []; c.created = c.updated = new Date().toISOString(); S.items.unshift(c); sel = c.id; save(); return render(); }
    if (a === 'del') { if (!confirm('Delete ' + m.name + '? ' + (Object.keys(m.usedBy).length ? 'Styles that use it keep their BOM line.' : ''))) return; S.items = S.items.filter(function (x) { return x !== m; }); S.items.forEach(function (x) { x.subs = x.subs.filter(function (y) { return y !== m.id; }); }); sel = null; save(); return render(); }
    if (a === 'addTest') { var k = $('#tP').value, v = $('#tV').value.trim(); if (!v) { $('#tV').focus(); return; } var p = PROPS.filter(function (x) { return x[0] === k; })[0], val = p[3] ? (parseFloat(v.replace(/[%,\s]/g, '')) || 0) : v;
      m.tests.unshift({ prop: k, value: val, method: $('#tM').value, lab: $('#tL').value.trim(), date: $('#tD').value || today(), report: $('#tR').value.trim() }); setProp(m, k, val, 'lab', 'lab test ' + ($('#tR').value.trim() || '')); save(); return render(); }
    if (b.dataset.rmtest != null) { m.tests.splice(+b.dataset.rmtest, 1); save(); return render(); }
    if (a === 'use') return use(m);
    if (a === 'toMarker') return toMarker(m);
    if (a === 'ack') { m.dirty = []; save(); return render(); }
  });
  var pb = $('#print'); if (pb) pb.addEventListener('click', function () { window.print(); });
  var bk = $('#backup'); if (bk) bk.addEventListener('click', function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ forecut: 'materials-library', data: S }, null, 1)], { type: 'application/json' })); a.download = 'forecut-materials-library.json'; a.click(); });
  var rs = $('#restore'), rf = $('#restoreFile'); if (rs && rf) { rs.addEventListener('click', function () { rf.click(); }); rf.addEventListener('change', function () { var f = rf.files[0]; if (!f) return; f.text().then(function (t) { var o = JSON.parse(t), d = o && o.data; if (!d || !Array.isArray(d.items)) throw Error(); if (!confirm('Replace your library with this backup?')) return; S = d; sel = null; save(); render(); }).catch(function () { alert('This is not a Forecut materials library backup.'); }); }); }
  var ex = $('#fxExample'); if (ex) ex.addEventListener('click', function () {
    var f = blank('Fabric'); f.name = 'Linen plain weave 150'; f.code = 'FAB-LIN-150'; f.colour = '#c9c2ad'; f.vendor = 'Example mill'; f.price = 420; f.moq = '300 m per colour'; f.lead = '30 days'; f.certs = 'European Flax (supplier states)'; f.status = 'Approved';
    f.p = { fibre: '100% linen', construction: 'Plain weave, 40s × 40s', gsm: 150, width: 142, shrL: 3, shrW: 2, finish: 'Enzyme washed' }; f.src = { fibre: 'supplier', construction: 'supplier', gsm: 'supplier', width: 'user', shrL: 'supplier', shrW: 'supplier', finish: 'supplier' };
    f.tests = [{ prop: 'shrL', value: 4, method: 'ISO 5077 / ISO 6330 (dimensional change)', lab: 'Example lab', date: today(), report: 'EX-001' }]; f.p.shrL = 4; f.src.shrL = 'lab'; f.history = [{ at: new Date().toISOString(), prop: 'shrL', from: 3, to: 4, src: 'lab', why: 'lab test EX-001' }];
    var t = blank('Trim'); t.name = 'Coconut shell button 18L'; t.cat = 'Button'; t.colour = '#6b4a2f'; t.vendor = 'Example trims'; t.price = 3.5; t.unit = 'pc'; t.moq = '1 gross'; t.p = { spec: '18 ligne, 4 hole', finish: 'Natural' }; t.src = { spec: 'supplier', finish: 'user' };
    S.items.unshift(t, f); sel = f.id; save(); render(); var s2 = $('#status'); if (s2) s2.textContent = 'Example loaded: a linen fabric with a lab-tested shrinkage result and a button.'; });
  window.ForecutMaterials = { load: load, byId: function (id) { return load().items.filter(function (x) { return x.id === id; })[0]; } };
  render();
})();
