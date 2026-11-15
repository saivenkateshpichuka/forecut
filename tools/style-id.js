/* Forecut Style ID: one style record shared by every tool.
   - A registry of styles (ID, name, season, category, garment, status, revision) in this browser.
   - The active style's work in each tool is kept with that style: switching style swaps the tools' saved work.
   - A style bar on every tool page shows and switches the active style; reports, exports and file names carry the Style ID.
   window.ForecutStyle */
(function () {
  'use strict';
  var REG = 'fc-styles', DATA = 'fc-style-data-';
  // the saved work that belongs to one style (collection-wide data such as the collection plan and palette stays shared)
  var STYLE_KEYS = ['fc-production-studio-v1', 'fc-tool-processing', 'fc-tool-boards', 'fc-ps-auto', 'fc-pm-sizechart', 'fc-pm-snap', 'fc-tool-drape', 'fc-3d-custom', 'fc-tool-pm2', 'fc-pm-cost'];
  var SEASONS = [['AW26', 'AW26', 'Autumn/Winter 2026'], ['RS27', 'Resort 27', 'Resort 2027'], ['SS27', 'SS27', 'Spring/Summer 2027'], ['PF27', 'Pre-Fall 27', 'Pre-Fall 2027'], ['AW27', 'AW27', 'Autumn/Winter 2027'], ['SS28', 'SS28', 'Spring/Summer 2028'], ['AW28', 'AW28', 'Autumn/Winter 2028'], ['IF26', 'India Festive 26', 'India Festive 2026'], ['IS27', 'India Summer 27', 'India Summer 2027'], ['IF27', 'India Festive 27', 'India Festive 2027'], ['IS28', 'India Summer 28', 'India Summer 2028'], ['IF28', 'India Festive 28', 'India Festive 2028'], ['CORE', 'Core', 'Core / continuity']];
  var CATS = ['Womenswear', 'Menswear', 'Unisex', 'Kidswear', 'Infant / baby', 'Accessories', 'Home textiles'];
  var GARMENTS = ['Shirt', 'T-shirt', 'Polo shirt', 'Blouse', 'Top', 'Kurta', 'Kurti / tunic', 'Dress', 'Skirt', 'Trousers', 'Jeans', 'Shorts', 'Leggings', 'Joggers', 'Hoodie / sweatshirt', 'Sweater', 'Jacket / blazer', 'Coat', 'Waistcoat / Nehru jacket', 'Saree blouse', 'Salwar / churidar', 'Lehenga', 'Jumpsuit', 'Nightwear', 'Other'];
  var STATUS = ['Concept', 'In development', 'Sampling', 'Approved', 'In production', 'Dropped'];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function J(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); return true; } catch (e) { alert('Browser storage is full. Download a backup from My account and remove large images, then try again.'); return false; } }
  function reg() { var r = J(REG, null); if (!r || !Array.isArray(r.list)) r = { v: 1, seq: 0, prefix: '', active: '', list: [] }; return r; }
  function saveReg(r) { return put(REG, r); }
  function prefix(r) { if (r.prefix) return r.prefix; var k = J('fc-brand-kit', {}) || {}, n = String(k.name || '').replace(/[^A-Za-z ]/g, '').trim(); var p = n ? n.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 3).toUpperCase() : ''; return p.length >= 2 ? p : 'FC'; }
  function nextId(r, season) { r.seq = (r.seq || 0) + 1; var id; do { id = prefix(r) + '-' + (season || 'CORE') + '-' + String(r.seq).padStart(4, '0'); if (!byId(r, id)) break; r.seq++; } while (true); return id; }
  function byId(r, id) { for (var i = 0; i < r.list.length; i++) if (r.list[i].id === id) return r.list[i]; return null; }
  function seasonCode(text) { text = String(text || '').toLowerCase(); for (var i = 0; i < SEASONS.length; i++) { var s = SEASONS[i]; if (text.indexOf(s[0].toLowerCase()) > -1 || text.indexOf(s[1].toLowerCase()) > -1 || text.indexOf(s[2].toLowerCase()) > -1) return s[0]; } return 'CORE'; }
  function seasonName(code) { for (var i = 0; i < SEASONS.length; i++) if (SEASONS[i][0] === code) return SEASONS[i][1]; return code || ''; }
  function now() { return new Date().toISOString(); }
  // ---------- first run and collection sync ----------
  function sync() {
    var r = reg(), changed = false;
    if (!r.list.length) { // adopt the work already in the tools as the first style
      var st = J('fc-production-studio-v1', null);
      if (st && st.brief && (st.brief.name && st.brief.name !== 'New style' || (st.pack && st.pack.bom && st.pack.bom.length) || (st.size && st.size.rows && st.size.rows.length > 3))) {
        var sc = seasonCode((st.pack && st.pack.season) || (st.size && st.size.season) || '');
        var s = { id: nextId(r, sc), legacyCode: st.brief.code || '', name: st.brief.name || 'Style 1', season: sc, category: (st.size && st.size.category) || 'Womenswear', garment: st.brief.garment || (st.size && st.size.garment) || 'Other', status: 'In development', rev: 1, created: now(), updated: now(), notes: '' };
        r.list.push(s); r.active = s.id; changed = true;
      }
    }
    // every style planned in the Collection Planner gets a Style ID
    var col = J('fc-collection-workspace-v1', null);
    if (col && Array.isArray(col.styles)) col.styles.forEach(function (cs) {
      if (!cs || !cs.id) return;
      var hit = r.list.filter(function (x) { return x.colId === cs.id; })[0];
      if (!hit) { var sc2 = seasonCode(col.range && col.range.season); r.list.push({ id: nextId(r, sc2), colId: cs.id, name: cs.name || 'Style', season: sc2, category: 'Womenswear', garment: cs.category || 'Other', status: 'Concept', rev: 1, created: now(), updated: now(), notes: '' }); changed = true; }
      else if (cs.name && hit.name !== cs.name) { hit.name = cs.name; changed = true; }
    });
    if (r.active && !byId(r, r.active)) { r.active = ''; changed = true; }
    if (changed) saveReg(r);
    return r;
  }
  // ---------- keep each tool's copy of the style fields in line ----------
  function stamp(s) {
    if (!s) return;
    var st = J('fc-production-studio-v1', null);
    if (st && st.brief) {
      st.brief.code = s.id; if (s.name) st.brief.name = s.name; if (s.garment && s.garment !== 'Other') st.brief.garment = s.garment;
      if (st.size) { st.size.styleCode = s.id; st.size.styleName = s.name; st.size.season = seasonName(s.season); if (s.category) st.size.category = s.category; }
      if (st.pack) { st.pack.season = seasonName(s.season); if (s.category) st.pack.category = s.category; st.pack.version = String(s.rev || 1); }
      if (st.copy) st.copy.sku = s.id;
      put('fc-production-studio-v1', st);
    }
    var col = J('fc-collection-workspace-v1', null);
    if (col && s.colId && col.activeStyle !== s.colId) { col.activeStyle = s.colId; put('fc-collection-workspace-v1', col); }
  }
  // ---------- switching ----------
  function snapshot(id) { var o = {}; STYLE_KEYS.forEach(function (k) { var v = localStorage.getItem(k); if (v != null) o[k] = v; }); o.__at = now(); return put(DATA + id, JSON.stringify(o)); }
  function restore(id) { var o = J(DATA + id, {}) || {}; STYLE_KEYS.forEach(function (k) { localStorage.removeItem(k); if (typeof o[k] === 'string') put(k, o[k]); }); try { localStorage.removeItem(DATA + id); } catch (e) { } }
  function setActive(id, opts) {
    var r = reg(); if (id === r.active) return;
    var to = byId(r, id); if (id && !to) return;
    if (r.active && byId(r, r.active)) { if (!snapshot(r.active)) return; }
    if (id) restore(id); else STYLE_KEYS.forEach(function (k) { localStorage.removeItem(k); });
    r.active = id; saveReg(r); stamp(to);
    if (!opts || opts.reload !== false) location.reload();
  }
  function create(f, opts) {
    var r = reg(), s = { id: nextId(r, f.season || 'CORE'), name: f.name || 'New style', season: f.season || 'CORE', category: f.category || 'Womenswear', garment: f.garment || 'Other', status: f.status || 'Concept', rev: 1, created: now(), updated: now(), notes: f.notes || '' };
    if (f.prefix && !r.prefix) { r.prefix = f.prefix.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5); r.seq--; s.id = nextId(r, s.season); }
    r.list.unshift(s); saveReg(r);
    if (!opts || opts.activate !== false) {
      // a new style starts with empty tool work, carrying over shared settings only
      var keep = r.active; if (keep) snapshot(keep);
      STYLE_KEYS.forEach(function (k) { localStorage.removeItem(k); });
      var r2 = reg(); r2.active = s.id; saveReg(r2); stamp(s); location.reload();
    }
    return s;
  }
  function update(id, f) { var r = reg(), s = byId(r, id); if (!s) return; ['name', 'season', 'category', 'garment', 'status', 'notes'].forEach(function (k) { if (f[k] !== undefined) s[k] = f[k]; }); s.updated = now(); saveReg(r); if (r.active === id) stamp(s); var col = J('fc-collection-workspace-v1', null); if (col && s.colId && col.styles) { var cs = col.styles.filter(function (x) { return x.id === s.colId; })[0]; if (cs && f.name) { cs.name = f.name; put('fc-collection-workspace-v1', col); } } }
  function newRevision(id) { var r = reg(), s = byId(r, id); if (!s) return; s.rev = (s.rev || 1) + 1; s.updated = now(); saveReg(r); if (r.active === id) stamp(s); }
  function remove(id) { var r = reg(); if (r.active === id) { STYLE_KEYS.forEach(function (k) { localStorage.removeItem(k); }); r.active = ''; } r.list = r.list.filter(function (x) { return x.id !== id; }); try { localStorage.removeItem(DATA + id); } catch (e) { } saveReg(r); }
  function active() { var r = reg(); return r.active ? byId(r, r.active) : null; }
  function label(s) { return s ? s.id + ' · ' + s.name + ' · Rev ' + (s.rev || 1) : ''; }
  function fileTag() { var s = active(); return s ? s.id + '_R' + (s.rev || 1) + '_' : ''; }
  // ---------- style bar ----------
  var CSS = '.fcs-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 16px;padding:10px 14px;border:1px solid var(--fx-line,#ddd5c7);border-radius:14px;background:#fffdf8;font:14px "DM Sans",sans-serif;color:#1b1d20}'
    + '.fcs-bar .lb{font:700 11px "DM Sans",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#a9481f}.fcs-bar select{font:600 14px "DM Sans",sans-serif;padding:7px 10px;border:1px solid #d8d0c3;border-radius:9px;background:#fff;color:#1b1d20;max-width:min(440px,70vw)}'
    + '.fcs-bar .id{font:700 13px ui-monospace,Menlo,monospace;background:#214538;color:#fff;padding:5px 10px;border-radius:8px}.fcs-bar .mt{color:#6b6b66;font-size:13px}.fcs-bar .st{font:700 11px "DM Sans",sans-serif;padding:3px 9px;border-radius:99px;background:#eef3ef;color:#214538}'
    + '.fcs-bar button,.fcs-bar a.b{all:unset;cursor:pointer;font:600 13px "DM Sans",sans-serif;padding:7px 12px;border-radius:9px;border:1px solid #d8d0c3;background:#fff;color:#1b1d20;white-space:nowrap}.fcs-bar button.p{background:#214538;border-color:#214538;color:#fff}.fcs-bar button:hover,.fcs-bar a.b:hover{border-color:#214538}.fcs-bar .sp{flex:1}'
    + '.fcs-pm{display:inline-flex;align-items:center;gap:6px;margin-left:10px}.fcs-pm select{font:600 12px "DM Sans",sans-serif;padding:4px 6px;border-radius:6px;border:1px solid #3a3f46;background:#16181b;color:#e8e6e1;max-width:280px}.fcs-pm button{all:unset;cursor:pointer;font:600 12px "DM Sans",sans-serif;color:#e8e6e1;border:1px solid #3a3f46;border-radius:6px;padding:4px 8px}'
    + '.fcs-dlg{position:fixed;inset:0;z-index:10003;background:rgba(20,17,15,.55);display:grid;place-items:center;padding:16px}.fcs-dlg form{background:#fffdf8;color:#1b1d20;width:100%;max-width:560px;border-radius:16px;padding:24px;box-shadow:0 30px 80px rgba(0,0,0,.35);font:15px/1.5 "DM Sans",sans-serif;display:grid;grid-template-columns:1fr 1fr;gap:12px 14px}'
    + '.fcs-dlg h3{grid-column:1/-1;margin:0;font:600 24px "Source Serif 4",Georgia,serif}.fcs-dlg p{grid-column:1/-1;margin:0;color:#5d5d58;font-size:14px}.fcs-dlg label{display:grid;gap:5px;font:600 13px "DM Sans",sans-serif;color:#5d5d58}.fcs-dlg .full{grid-column:1/-1}.fcs-dlg input,.fcs-dlg select,.fcs-dlg textarea{font:15px "DM Sans",sans-serif;padding:9px 11px;border:1px solid #d8d0c3;border-radius:9px;background:#fff;color:#1b1d20}'
    + '.fcs-dlg .ac{grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px}.fcs-dlg .ac button{all:unset;cursor:pointer;font:700 14px "DM Sans",sans-serif;padding:10px 16px;border-radius:10px;border:1px solid #d8d0c3}.fcs-dlg .ac .p{background:#214538;color:#fff;border-color:#214538}.fcs-dlg .ac .bad{color:#b03a2e;margin-left:auto}.fcs-dlg code{font:700 14px ui-monospace,Menlo,monospace;background:#eef3ef;padding:3px 8px;border-radius:6px}'
    + '@media (max-width:600px){.fcs-dlg form{grid-template-columns:1fr}}';
  function opts(list, cur, val) { return list.map(function (x) { var v = Array.isArray(x) ? x[0] : x, t = Array.isArray(x) ? x[2] || x[1] : x; return '<option value="' + esc(v) + '"' + (v === cur ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join(''); }
  function dialog(s) {
    var r = reg(), isNew = !s, w = document.createElement('div'); w.className = 'fcs-dlg'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true');
    s = s || { name: '', season: 'SS27', category: 'Womenswear', garment: 'Shirt', status: 'Concept', notes: '' };
    w.innerHTML = '<form><h3>' + (isNew ? 'New style' : 'Style details') + '</h3><p>' + (isNew ? 'A Style ID is created automatically and follows this style through every tool, report and export.' : 'Style ID <code>' + esc(s.id) + '</code> · revision ' + (s.rev || 1) + ' · created ' + esc((s.created || '').slice(0, 10)) + '. The ID never changes.') + '</p>'
      + '<label class="full">Style name<input name="name" maxlength="120" required value="' + esc(s.name) + '" placeholder="e.g. Relaxed resort shirt"></label>'
      + '<label>Season<select name="season">' + opts(SEASONS, s.season) + '</select></label><label>Category<select name="category">' + opts(CATS, s.category) + '</select></label>'
      + '<label>Garment type<select name="garment">' + opts(GARMENTS, s.garment) + '</select></label><label>Status<select name="status">' + opts(STATUS, s.status) + '</select></label>'
      + (isNew && !r.prefix ? '<label>ID prefix (your brand initials)<input name="prefix" maxlength="5" value="' + esc(prefix(r)) + '"></label><label>Example ID<input disabled value="' + esc(prefix(r)) + '-SS27-' + String((r.seq || 0) + 1).padStart(4, '0') + '"></label>' : '')
      + '<label class="full">Notes<textarea name="notes" rows="2" maxlength="500">' + esc(s.notes || '') + '</textarea></label>'
      + '<div class="ac"><button type="submit" class="p">' + (isNew ? 'Create and open style' : 'Save') + '</button>' + (isNew ? '' : '<button type="button" data-a="rev">Start revision ' + ((s.rev || 1) + 1) + '</button>') + '<button type="button" data-a="x">Cancel</button>' + (isNew ? '' : '<button type="button" class="bad" data-a="del">Delete style</button>') + '</div></form>';
    document.body.appendChild(w);
    var f = w.querySelector('form'), close = function () { w.remove(); };
    w.addEventListener('click', function (e) { if (e.target === w) close(); var a = e.target.dataset && e.target.dataset.a; if (a === 'x') close(); if (a === 'rev') { if (confirm('Start revision ' + ((s.rev || 1) + 1) + ' of ' + s.id + '? Reports and exports will show the new revision.')) { newRevision(s.id); location.reload(); } } if (a === 'del') { if (confirm('Delete ' + s.id + ' and the tool work saved with it? Download a backup first if you may need it.')) { remove(s.id); location.reload(); } } });
    w.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    f.onsubmit = function (e) { e.preventDefault(); var d = { name: f.elements.name.value.trim() || 'New style', season: f.elements.season.value, category: f.elements.category.value, garment: f.elements.garment.value, status: f.elements.status.value, notes: f.elements.notes.value.trim() }; if (isNew) { if (f.elements.prefix) d.prefix = f.elements.prefix.value; create(d); } else { update(s.id, d); location.reload(); } };
    setTimeout(function () { f.elements.name.focus(); }, 40);
  }
  function options(r) { var html = '<option value="">' + (r.list.length ? 'No style selected (standalone)' : 'No styles yet') + '</option>'; var groups = {}; r.list.forEach(function (s) { (groups[s.season] = groups[s.season] || []).push(s); }); Object.keys(groups).forEach(function (g) { html += '<optgroup label="' + esc(seasonName(g)) + '">' + groups[g].map(function (s) { return '<option value="' + esc(s.id) + '"' + (s.id === r.active ? ' selected' : '') + '>' + esc(label(s)) + '</option>'; }).join('') + '</optgroup>'; }); return html; }
  function bar() {
    var r = reg(), s = active(), tool = document.body.getAttribute('data-tool') || '';
    var host = document.querySelector('.fx-title');
    var b = document.createElement('div'); b.className = 'fcs-bar no-print'; b.setAttribute('role', 'region'); b.setAttribute('aria-label', 'Active style');
    b.innerHTML = '<span class="lb">Style</span>' + (s ? '<span class="id">' + esc(s.id) + '</span>' : '') + '<select aria-label="Active style">' + options(r) + '</select>'
      + (s ? '<span class="mt">' + esc([seasonName(s.season), s.category, s.garment].filter(Boolean).join(' · ')) + '</span><span class="st">' + esc(s.status) + ' · Rev ' + (s.rev || 1) + '</span>' : '<span class="mt">Create or choose a style to link your work across every tool.</span>')
      + '<span class="sp"></span>' + (s ? '<button type="button" data-a="edit">Edit</button>' : '') + '<button type="button" class="p" data-a="new">+ New style</button><a class="b" href="account.html#styles">All styles</a>';
    if (host && host.parentNode) host.parentNode.insertBefore(b, host.nextSibling);
    else { var pm = document.getElementById('pm-ttl'); if (!pm) return; b.className = 'fcs-pm'; b.innerHTML = '<select aria-label="Active style">' + options(r) + '</select><button type="button" data-a="new">+ Style</button>'; pm.parentNode.insertBefore(b, pm.nextSibling); }
    b.querySelector('select').onchange = function (e) { var v = e.target.value; if (v === (r.active || '')) return; if (confirm(v ? 'Switch to ' + v + '? Your current work is kept with ' + (r.active || 'standalone work') + ' and the tools load ' + v + '.' : 'Work without a style? Your current work is kept with ' + r.active + '.')) setActive(v); else e.target.value = r.active || ''; };
    b.addEventListener('click', function (e) { var a = e.target.dataset && e.target.dataset.a; if (a === 'new') dialog(null); if (a === 'edit') dialog(active()); });
  }
  // the Style ID is set by the style bar, so the matching fields in the tools are read-only
  function lockFields() {
    var s = active(); if (!s) return;
    // fill in the ID and name when a tool has just created fresh, empty work for this style
    var fill = function (sel, v, onlyDefault) { document.querySelectorAll(sel).forEach(function (i) { if (i.value !== v && (!onlyDefault || !i.value || /^(New style|FC-001)$/.test(i.value))) { i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); } }); };
    fill('[data-group=brief][data-key=code],[data-group=size][data-key=styleCode],[data-group=copy][data-key=sku]', s.id);
    fill('[data-group=brief][data-key=name],[data-group=size][data-key=styleName]', s.name, true);
    document.querySelectorAll('[data-group=brief][data-key=code],[data-group=size][data-key=styleCode],[data-group=copy][data-key=sku]').forEach(function (i) { if (!i.readOnly) { i.readOnly = true; i.title = 'Set by the style bar at the top of the page'; i.style.background = '#eef3ef'; } });
  }
  function init() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var tool = document.body.getAttribute('data-tool') || (document.getElementById('pm-ttl') ? 'pattern-maker' : '');
    if (!tool || tool === 'textile-calculator') return;
    bar(); lockFields();
    var app = document.getElementById('app'); if (app && window.MutationObserver) new MutationObserver(lockFields).observe(app, { childList: true, subtree: true });
  }
  // runs before the tools read their saved work, so they open on the active style
  var R0 = sync(); if (R0.active) stamp(byId(R0, R0.active));
  window.ForecutStyle = { sync: sync, list: function () { return reg().list; }, active: active, setActive: setActive, create: create, update: update, newRevision: newRevision, remove: remove, label: label, fileTag: fileTag, seasonName: seasonName, dialog: dialog, SEASONS: SEASONS };
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
