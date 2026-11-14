/* Forecut Pattern Maker extras: paper sizes, share links, client measurement requests, calculators, Beginner / Pro.
   Needs pm_engine.js (PM), pm_export.js (PMX), pm_views.js (PMV) and pm_ui.js (PMUI). */
(function () {
  'use strict';
  var PM = window.PM, X = window.PMX, V = window.PMV;
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function enc(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function dec(s) { try { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return JSON.parse(decodeURIComponent(escape(atob(s)))); } catch (e) { return null; } }
  function UI() { return window.PMUI; }
  function toast(t) { var u = UI(); if (u && u.toast) u.toast(t); }
  function base() { return location.href.split('#')[0]; }
  var UF = { cm: 1, mm: 10, in: 1 / 2.54 };

  /* ---------- modal ---------- */
  var box;
  function modal(title, html, after) {
    if (!box) { box = document.createElement('div'); box.className = 'pmx-modal'; box.hidden = true; document.body.appendChild(box); box.addEventListener('click', function (e) { if (e.target === box || e.target.closest('[data-x]')) close(); }); document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) close(); }); }
    box.innerHTML = '<div class="pmx-mbox" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="pmx-mh"><h3>' + esc(title) + '</h3><button type="button" class="pmx-x" data-x aria-label="Close">×</button></div>' + html + '</div>';
    box.hidden = false; if (after) after(box); var f = box.querySelector('input,select,button:not(.pmx-x)'); if (f) f.focus();
  }
  function close() { if (box) { box.hidden = true; box.innerHTML = ''; } }
  function copy(text, el) { (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () { if (el) { var o = el.textContent; el.textContent = 'Copied'; setTimeout(function () { el.textContent = o; }, 1400); } }, function () { var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); if (el) el.textContent = 'Copied'; }); }
  function linkBlock(url, msg) {
    return '<div class="pmx-link"><input type="text" readonly value="' + esc(url) + '" aria-label="Link"><button type="button" class="xbtn pri" data-copy>Copy link</button></div><div class="pmx-acts"><a class="xbtn" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent((msg ? msg + ' ' : '') + url) + '">Send on WhatsApp</a><a class="xbtn" href="mailto:?subject=' + encodeURIComponent(msg || 'Forecut pattern') + '&body=' + encodeURIComponent((msg ? msg + '\n\n' : '') + url) + '">Send by email</a></div>';
  }
  function wireCopy(b) { b.querySelectorAll('[data-copy]').forEach(function (el) { el.onclick = function () { copy(b.querySelector('.pmx-link input').value, el); }; }); }

  /* ---------- paper size for tiled PDFs ---------- */
  function paperUI() {
    var sel = $('#pm-paper'), land = $('#pm-land'); if (!sel || !X || !X.PAPERS) return;
    var cur = X.paper(); sel.innerHTML = Object.keys(X.PAPERS).map(function (k) { var d = X.PAPERS[k]; return '<option value="' + k + '"' + (k === cur.n ? ' selected' : '') + '>' + k + ' (' + d[0] + ' × ' + d[1] + ' cm)</option>'; }).join(''); land.checked = cur.land;
    var lab = function () { var p = X.paper(); var t = $('#pm-tilelab'); if (t) t.textContent = p.n + (p.land ? ' landscape' : '') + ' tiles for printing'; };
    var set = function () { X.paper({ n: sel.value, land: land.checked }); lab(); var u = UI(); if (u) u.draw(); };
    sel.onchange = set; land.onchange = set; [sel, land].forEach(function (el) { el.addEventListener('click', function (e) { e.stopPropagation(); }); }); lab();
  }

  /* ---------- share a pattern as a link ---------- */
  function shareState(withM) { var S = UI().S(); var o = { v: 1, gid: S.gid, gender: S.gender, size: S.size, unit: S.unit, o: S.o, sa: S.sa, hemA: S.hemA, adj: S.adj, pc: S.pc, detail: S.detail }; if (withM) o.m = S.m; return o; }
  function share() {
    var S = UI().S(), name = (PM.GARMENTS[S.gid] || {}).n || 'Pattern';
    var render = function (withM) { var url = base() + '#p=' + enc(shareState(withM)); return linkBlock(url, 'Forecut pattern: ' + name + (withM ? '' : ' (size ' + S.size + ')')); };
    modal('Share this pattern', '<p class="pmx-n">The link opens Pattern Maker with this garment, its style options and seam allowances. Nothing is uploaded: everything is in the link itself.</p><label class="pmx-chk"><input type="checkbox" id="pmx-wm"' + (S.size === 'custom' ? ' checked' : '') + '> Include the measurements (only share with people you trust)</label><div id="pmx-lk">' + render(S.size === 'custom') + '</div>'
      + '<div class="pmx-acts"><button type="button" class="xbtn" id="pmx-json">Download settings (JSON)</button></div>', function (b) {
        var go = function () { $('#pmx-lk', b).innerHTML = render($('#pmx-wm', b).checked); wireCopy(b); }; $('#pmx-wm', b).onchange = go; wireCopy(b);
        $('#pmx-json', b).onclick = function () { var d = JSON.stringify(Object.assign({ forecut: 'pattern-maker-settings' }, shareState($('#pmx-wm', b).checked)), null, 2); if (window.FC && FC.download) FC.download('forecut-' + S.gid + '-settings.json', d, 'application/json'); };
      });
  }
  function applyShared(o) {
    var S = UI().S(); if (!o || !PM.GARMENTS[o.gid]) return false;
    ['gid', 'gender', 'size', 'unit', 'sa', 'hemA', 'detail'].forEach(function (k) { if (o[k] != null) S[k] = o[k]; }); S.o = Object.assign({}, PM.GARMENTS[o.gid].d, o.o || {}); S.adj = o.adj || {}; S.pc = o.pc || {}; if (o.m) S.m = o.m;
    UI().ui(true); return true;
  }

  /* ---------- ask a client for measurements ---------- */
  function ask() {
    var S = UI().S(), keys = UI().keys ? UI().keys() : ['bust', 'waist', 'hip'], name = (PM.GARMENTS[S.gid] || {}).n || 'garment', from = '';
    try { from = localStorage.getItem('pm-from') || ''; } catch (e) {}
    var render = function (f) { var url = base() + '#ask=' + enc({ v: 1, from: f, gid: S.gid, gender: S.gender, unit: S.unit, k: keys }); return linkBlock(url, (f ? f + ': ' : '') + 'please send your measurements for a ' + name.toLowerCase()); };
    modal('Ask a client for measurements', '<p class="pmx-n">Send this link to your client. They fill in ' + keys.length + ' measurements for a ' + esc(name.toLowerCase()) + ' with how-to-measure help, then send you a link back. Open that link here and the client is saved in your client list. Nothing is stored online.</p>'
      + '<label class="pmx-f"><span>Your name or boutique</span><input id="pmx-from" value="' + esc(from) + '" maxlength="60" placeholder="e.g. Meera Boutique"></label><div id="pmx-lk">' + render(from) + '</div>', function (b) {
        $('#pmx-from', b).oninput = function () { try { localStorage.setItem('pm-from', this.value); } catch (e) {} $('#pmx-lk', b).innerHTML = render(this.value.trim()); wireCopy(b); }; wireCopy(b);
      });
  }
  /* the client's side: a simple form that needs no sign-in */
  function clientForm(o) {
    var unit = o.unit || 'cm', keys = (o.k || []).filter(function (k) { return PM.LABELS[k]; }), g = PM.GARMENTS[o.gid] || {};
    var wrap = document.createElement('div'); wrap.className = 'pmx-client';
    wrap.innerHTML = '<div class="pmx-cin"><div class="pmx-brand"><i></i>FORECUT</div><h1>Your measurements</h1><p>' + (o.from ? '<b>' + esc(o.from) + '</b> asked for' : 'Please send') + ' your measurements for a <b>' + esc((g.n || 'garment').toLowerCase()) + '</b>. Measure over light clothing, keep the tape snug but not tight, and stand naturally. Nothing you type is uploaded: it goes into the link you send back.</p>'
      + '<div class="pmx-cfig">' + (V && V.figure ? V.figure(keys, keys[0], 'front') : '') + '</div>'
      + '<label class="pmx-f"><span>Your name</span><input id="pmx-cn" maxlength="60" autocomplete="name"></label>'
      + '<div class="pmx-uni">Units: <b>' + (unit === 'in' ? 'inches' : unit) + '</b></div>'
      + keys.map(function (k) { return '<label class="pmx-f"><span>' + esc(PM.LABELS[k]) + '<small>' + esc((V && V.HOW && V.HOW[k]) || '') + '</small></span><input type="number" step="any" min="0" inputmode="decimal" data-k="' + k + '"></label>'; }).join('')
      + '<label class="pmx-f"><span>Notes for your tailor (optional)</span><textarea id="pmx-note" rows="2" maxlength="300"></textarea></label>'
      + '<button type="button" class="xbtn pri" id="pmx-done">Create my link</button><div id="pmx-out"></div><p class="pmx-n">Made with Forecut Pattern Maker · forecut.in</p></div>';
    document.body.appendChild(wrap); document.documentElement.classList.add('pmx-client-open');
    wrap.querySelectorAll('input[data-k]').forEach(function (el) { el.addEventListener('focus', function () { var f = $('.pmx-cfig', wrap); if (f && V && V.figure) f.innerHTML = V.figure(keys, el.dataset.k, (V.BACK || []).indexOf(el.dataset.k) >= 0 ? 'back' : 'front'); }); });
    $('#pmx-done', wrap).onclick = function () {
      var nm = $('#pmx-cn', wrap).value.trim(), m = {}, missing = [];
      if (!nm) { $('#pmx-cn', wrap).focus(); return; }
      wrap.querySelectorAll('input[data-k]').forEach(function (el) { var v = +el.value; if (v > 0) m[el.dataset.k] = Math.round(v / UF[unit] * 10) / 10; else missing.push(PM.LABELS[el.dataset.k]); });
      var url = base() + '#client=' + enc({ v: 1, name: nm, gender: o.gender, gid: o.gid, m: m, note: $('#pmx-note', wrap).value.trim(), t: new Date().toISOString().slice(0, 10) });
      $('#pmx-out', wrap).innerHTML = (missing.length ? '<p class="pmx-warn">Not filled: ' + esc(missing.join(', ')) + '. Your tailor will use standard values for these.</p>' : '') + '<p>Send this link back to ' + esc(o.from || 'your tailor') + ':</p>' + linkBlock(url, 'My measurements for Forecut, ' + nm);
      wireCopy(wrap);
    };
  }
  function importClient(o) {
    if (!o || !o.name || !o.m) return; var u = UI(), list = u.clients ? u.clients() : [], S = u.S();
    list = list.filter(function (x) { return x.name !== o.name; }); list.push({ name: o.name, gender: o.gender || S.gender, size: S.size, m: o.m, adj: {}, saved: o.t || new Date().toISOString().slice(0, 10), note: o.note || '' }); list.sort(function (a, b) { return a.name.localeCompare(b.name); });
    if (window.FC && FC.save) FC.save('pm-clients', list);
    S.client = o.name; if (o.gender && PM.GENDER && PM.GENDER[o.gender]) S.gender = o.gender; if (o.gid && PM.GARMENTS[o.gid]) S.gid = o.gid; S.size = 'custom'; S.m = Object.assign({}, S.m || {}, o.m);
    u.ui(true); toast('Saved ' + o.name + '\'s measurements as a client' + (o.note ? '. Note: ' + o.note : '.'));
  }

  /* ---------- calculators ---------- */
  function calcs() {
    var S = UI().S(), u = S.unit, f = function (cm) { return +(cm * UF[u]).toFixed(u === 'mm' ? 0 : u === 'in' ? 2 : 1) + ' ' + u; }, m = S.m || {}, A = PM.armhole ? PM.armhole(S.gender, Object.assign({}, PM.CHARTS[S.gender] && PM.CHARTS[S.gender].M, m)) : null;
    modal('Calculators', '<div class="pmx-calc"><h4>Armhole depth</h4><p class="pmx-n">From the bodice draft for ' + (S.size === 'custom' ? 'your measurements' : 'size ' + esc(S.size)) + ' (bust ' + f(m.bust || 0) + ').</p>'
      + (A ? '<dl class="pmx-kv"><dt>Armhole round (front + back)</dt><dd>' + f(A.round) + '</dd><dt>Armhole depth, shoulder tip to underarm (front)</dt><dd>' + f(A.depth) + '</dd><dt>Quick tailoring rule (bust ÷ 8 + 6.5 cm)</dt><dd>' + f(A.rule) + '</dd></dl><p class="pmx-n">The draft value includes the block\'s ease; the quick rule is a common starting point for blouses and kurtas. Check both against the client before cutting.</p>' : '')
      + '</div><div class="pmx-calc"><h4>Gown or lehenga from a saree</h4><p class="pmx-n">How many panels (kalis) fit in a saree, leaving a piece for the bodice and sleeves.</p>'
      + '<div class="pmx-grid"><label class="pmx-f"><span>Saree length (cm)</span><input type="number" id="pmx-sl" value="550"></label><label class="pmx-f"><span>Saree width (cm)</span><input type="number" id="pmx-sw" value="112"></label><label class="pmx-f"><span>Skirt length incl. hem (cm)</span><input type="number" id="pmx-gl" value="' + Math.round((m.outseam || 100) - 5) + '"></label><label class="pmx-f"><span>Keep for bodice and sleeves (cm)</span><input type="number" id="pmx-bk" value="130"></label></div><div id="pmx-sr" class="pmx-res"></div></div>'
      + '<div class="pmx-calc"><h4>More calculators</h4><p class="pmx-n">Fabric shrinkage, GSM to oz, unit conversion, marker efficiency and fabric consumption are in the <a href="textile-calculator.html" target="_blank" rel="noopener">Textile Calculator</a>.</p></div>', function (b) {
        var run = function () { var L = +$('#pmx-sl', b).value, W = +$('#pmx-sw', b).value, gl = +$('#pmx-gl', b).value, keep = +$('#pmx-bk', b).value, avail = L - keep, rows = Math.floor(avail / gl), per = 2, n = rows * per, top = (m.waist || 72) + 4, hemPer = W / per, hem = n * (W / per);
          $('#pmx-sr', b).innerHTML = avail <= 0 || gl <= 0 ? '<p class="pmx-warn">The saree is too short for that.</p>' : '<p><b>' + n + ' panels</b>: ' + rows + ' lengths of ' + gl + ' cm, each split into ' + per + ' panels across the ' + W + ' cm width. Hem up to about <b>' + Math.round(hem) + ' cm</b> (' + Math.round(hemPer) + ' cm per panel, cut as kalis narrowing to ' + Math.round(top / n * 10) / 10 + ' cm at the waist). Left over for the bodice: ' + keep + ' cm.</p><p class="pmx-n">Cut kalis head-to-tail to use the width fully; keep the pallu and borders for the hem or bodice.</p>'; };
        b.querySelectorAll('#pmx-sl,#pmx-sw,#pmx-gl,#pmx-bk').forEach(function (el) { el.oninput = run; }); run();
      });
  }

  /* ---------- toolbar buttons ---------- */
  function addButtons() {
    var anchor = document.getElementById('pm-qa'); if (!anchor || document.getElementById('pmx-share')) return;
    var mk = function (id, label, title, svg) { var b = document.createElement('button'); b.type = 'button'; b.className = 'xbtn pmx-tb'; b.id = id; b.title = title; b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + svg + '"/></svg><span>' + label + '</span>'; anchor.parentNode.insertBefore(b, anchor); return b; };
    mk('pmx-calcs', 'Calculators', 'Armhole depth, gown from a saree and more', 'M6 3h12v18H6zM9 7h6M9 11h2M13 11h2M9 15h2M13 15h2').onclick = calcs;
    mk('pmx-ask', 'Client link', 'Ask a client to send their measurements with a link', 'M4 6h16v12H4zM4 7l8 6 8-6').onclick = ask;
    mk('pmx-share', 'Share', 'Share this pattern as a link', 'M18 8a3 3 0 1 0-2.8-4M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4').onclick = share;
    paperUI();
  }

  /* ---------- links in the address ---------- */
  function handleHash() {
    var h = location.hash || '', m;
    if ((m = /^#ask=([\w-]+)/.exec(h))) { var o = dec(m[1]); if (o) { var app = document.getElementById('pm-app'), gate = document.getElementById('pm-gate'); if (gate) gate.hidden = true; if (app) app.hidden = true; clientForm(o); return 'ask'; } }
    var wait = function (fn) { var n = 0, t = setInterval(function () { n++; var app = document.getElementById('pm-app'); if (app && !app.hidden && UI() && UI().ui) { clearInterval(t); fn(); history.replaceState(null, '', location.pathname + location.search); } else if (n > 120) clearInterval(t); }, 250); };
    if ((m = /^#p=([\w-]+)/.exec(h))) { var p = dec(m[1]); if (p) wait(function () { if (applyShared(p)) toast('Opened a shared pattern: ' + (PM.GARMENTS[p.gid] || {}).n + (p.m ? ', with measurements' : ', size ' + p.size) + '.'); }); }
    if ((m = /^#client=([\w-]+)/.exec(h))) { var c = dec(m[1]); if (c) wait(function () { importClient(c); }); }
  }

  /* ---------- styles ---------- */
  var css = document.createElement('style');
  css.textContent = [
    '.pmx-tb{display:inline-flex;align-items:center;gap:5px}.pmx-tb svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}@media(max-width:1250px){.pmx-tb span{display:none}}',
    '.papr{display:flex;gap:10px;align-items:center;padding:6px 10px 8px;font:12px "DM Sans",sans-serif;color:var(--mu,#9da3aa);border-bottom:1px solid var(--ln,#3a3f46)}.papr select{background:var(--bg,#1b1d20);color:var(--tx,#e8e6e1);border:1px solid var(--ln,#3a3f46);border-radius:4px;padding:3px 5px;font:12px "DM Sans",sans-serif;max-width:170px}.papr label{display:flex;gap:5px;align-items:center}',
    '.pmx-modal{position:fixed;inset:0;z-index:2200;background:rgba(10,11,12,.6);display:grid;place-items:center;padding:16px}.pmx-modal[hidden]{display:none}',
    '.pmx-mbox{background:#212428;color:#e8e6e1;border:1px solid #3a3f46;border-radius:8px;width:min(620px,100%);max-height:88vh;overflow:auto;padding:16px 18px;font:13.5px/1.5 "DM Sans",sans-serif;box-shadow:0 20px 50px rgba(0,0,0,.55)}',
    '.pmx-mh{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}.pmx-mh h3{margin:0;font-size:16px}.pmx-x{background:none;border:0;color:#9da3aa;font-size:22px;cursor:pointer}',
    '.pmx-n{color:#9da3aa;font-size:12.5px;margin:6px 0}.pmx-warn{color:#ffb07a}.pmx-chk{display:flex;gap:7px;align-items:center;margin:8px 0}',
    '.pmx-link{display:flex;gap:6px;margin:10px 0}.pmx-link input{flex:1;min-width:0;background:#1b1d20;color:#e8e6e1;border:1px solid #3a3f46;border-radius:4px;padding:6px 8px;font:12px ui-monospace,Menlo,monospace}.pmx-acts{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.pmx-acts a,.pmx-acts button{text-decoration:none}',
    '.pmx-f{display:flex;flex-direction:column;gap:3px;margin:8px 0}.pmx-f span{font-size:12.5px;color:#cfd3d8}.pmx-f small{display:block;color:#9da3aa;font-size:11.5px;margin-top:2px}.pmx-f input,.pmx-f textarea{background:#1b1d20;color:#e8e6e1;border:1px solid #3a3f46;border-radius:4px;padding:6px 8px;font:14px "DM Sans",sans-serif}',
    '.pmx-calc{border-top:1px solid #3a3f46;padding-top:8px;margin-top:10px}.pmx-calc:first-child{border:0;margin-top:0}.pmx-calc h4{margin:0 0 4px;font-size:13px;color:#e08a5e;text-transform:uppercase;letter-spacing:.06em}.pmx-kv{display:grid;grid-template-columns:1fr auto;gap:4px 12px}.pmx-kv dt{color:#9da3aa}.pmx-kv dd{margin:0;font:600 13px ui-monospace,Menlo,monospace}.pmx-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 10px}.pmx-res{background:#1b1d20;border-radius:6px;padding:4px 10px;margin-top:6px}.pmx-mbox p,.pmx-res p{color:#e8e6e1}.pmx-mbox .pmx-n{color:#9da3aa}.pmx-mbox a{color:#e08a5e}',
    'html.pmx-client-open body>*:not(.pmx-client){display:none!important}.pmx-client{min-height:100vh;background:#f6f1ea;color:#1c1714;font:15px/1.55 "DM Sans",system-ui,sans-serif;padding:20px 16px 40px}.pmx-cin{max-width:560px;margin:0 auto}.pmx-cin h1{font:600 28px "Source Serif 4",Georgia,serif;margin:10px 0 6px}.pmx-brand{font:700 11px "DM Sans",sans-serif;letter-spacing:.14em;display:flex;gap:7px;align-items:center}.pmx-brand i{width:9px;height:9px;background:#a9481f;display:inline-block}',
    '.pmx-client .pmx-f span{color:#3d3530}.pmx-client .pmx-f small{color:#6b625a}.pmx-client .pmx-f input,.pmx-client .pmx-f textarea{background:#fff;color:#1c1714;border-color:#d8cfc3;font-size:16px}.pmx-client .pmx-n{color:#6b625a}.pmx-client .pmx-link input{background:#fff;color:#1c1714;border-color:#d8cfc3}.pmx-client .xbtn{background:#fff!important;color:#1c1714!important;border:1px solid #d8cfc3;border-radius:5px;padding:8px 12px;cursor:pointer;font:600 13px "DM Sans",sans-serif}.pmx-client .xbtn.pri{background:#1c1714!important;color:#fff!important;border-color:#1c1714}.pmx-client .pmx-acts a{display:inline-block}.pmx-cfig{max-width:240px;margin:8px auto}.pmx-cfig svg{width:100%;height:auto}.pmx-uni{font-size:13px;color:#6b625a;margin:6px 0}.pmx-client .pmx-warn{color:#8a4b0b}'
  ].join('\n');
  document.head.appendChild(css);

  var started = false;
  function start() { if (started) return; started = true; if (handleHash() === 'ask') return; var n = 0, t = setInterval(function () { n++; if (document.getElementById('pm-qa') && UI()) { clearInterval(t); addButtons(); } else if (n > 80) clearInterval(t); }, 150); }
  window.addEventListener('hashchange', function () { if (/^#(p|client|ask)=/.test(location.hash)) handleHash(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.PMMore = { share: share, ask: ask, calcs: calcs, enc: enc, dec: dec, applyShared: applyShared, importClient: importClient };
})();
