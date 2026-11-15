/* Forecut report: when a tool page prints (Print / PDF button, a tool's own print button or Ctrl+P),
   build a clean document from what the person has entered and the results, instead of a picture of the screen.
   Fields become label/value tables, tables keep their values, results keep their figures, images stay. */
(function () {
  'use strict';
  var SKIP = '.palette-intro img,.pr-stage:not(.on),[role=tablist],.pal-tabs,.pr-tabs,.bd-modes,script,style,noscript,button,.no-print,.no-report,[data-report-skip],.fx-actions,.fx-jump,nav,#studioNav,.fx-side,.fx-head,.fx-foot,input[type=file],input[type=hidden],dialog,.toast2,.tcdoc,.tsel,.tbar,.tnav,summary .fx-ws';
  var BLOCK = /^(DIV|SECTION|ARTICLE|ASIDE|FIELDSET|FORM|MAIN|HEADER|FOOTER|UL|OL|LI|DL|DETAILS|FIGURE)$/;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function vis(el) { var cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return false; return el.getClientRects().length > 0 || cs.display === 'contents'; }
  function ctlValue(c) {
    var t = (c.type || '').toLowerCase();
    if (c.tagName === 'SELECT') { if (c.multiple) return [].slice.call(c.selectedOptions).map(function (o) { return o.text; }).join(', '); var o = c.options[c.selectedIndex]; return o ? o.text : ''; }
    if (t === 'checkbox') return c.checked ? 'Yes' : 'No';
    if (t === 'radio') return c.checked ? 'Selected' : '';
    if (t === 'color') return (c.value || '').toUpperCase();
    if (t === 'date' && c.value) { try { return new Date(c.value + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { } }
    return c.value || '';
  }
  function swatch(c) { return (c.type || '').toLowerCase() === 'color' ? '<i class="rp-sw" style="background:' + esc(c.value) + '"></i>' : ''; }
  function labelText(l) {
    var k = l.cloneNode(true);
    k.querySelectorAll('input,select,textarea,button,option,.no-print,svg').forEach(function (x) { x.remove(); });
    return k.textContent.replace(/\s+/g, ' ').trim();
  }
  function valHTML(c) { var v = ctlValue(c); if (c.tagName === 'TEXTAREA') return esc(v).replace(/\n/g, '<br>') || '<span class="rp-dim">—</span>'; return swatch(c) + (esc(v) || '<span class="rp-dim">—</span>'); }
  function field(label, html) { return '<div class="rp-f"><span>' + esc(label) + '</span><b>' + html + '</b></div>'; }
  function media(el) {
    if (el.tagName === 'IMG') { if (!el.src || !el.naturalWidth) return ''; return '<img class="rp-img" src="' + esc(el.currentSrc || el.src) + '" alt="' + esc(el.alt) + '">'; }
    if (el.tagName === 'CANVAS') { try { return '<img class="rp-img" src="' + el.toDataURL('image/png') + '" alt="">'; } catch (e) { return ''; } }
    if (el.tagName.toLowerCase() === 'svg') { var r = el.getBoundingClientRect(); if (r.width < 24 && r.height < 24) return ''; var k = el.cloneNode(true); if (!k.getAttribute('viewBox') && r.width) k.setAttribute('viewBox', '0 0 ' + r.width + ' ' + r.height); k.removeAttribute('width'); k.removeAttribute('height'); k.setAttribute('class', 'rp-svg'); k.setAttribute('style', 'max-width:' + Math.min(r.width, 680) + 'px'); return k.outerHTML; }
    return '';
  }
  function cellHTML(td) {
    var out = '';
    td.childNodes.forEach(function (n) {
      if (n.nodeType === 3) { out += esc(n.textContent); return; }
      if (n.nodeType !== 1 || n.matches(SKIP)) return;
      if (/^(INPUT|SELECT|TEXTAREA)$/.test(n.tagName)) { var t = (n.type || '').toLowerCase(); if (t === 'radio' && !n.checked) return; out += valHTML(n); return; }
      if (/^(IMG|CANVAS)$/.test(n.tagName) || n.tagName.toLowerCase() === 'svg') { out += media(n); return; }
      if (!vis(n)) return;
      if (n.tagName === 'I' && n.style && n.style.background) { out += '<i class="rp-sw" style="background:' + esc(n.style.background) + '"></i>'; return; }
      out += cellHTML(n);
    });
    return out.trim();
  }
  function tableHTML(t) {
    var rows = [].slice.call(t.rows).filter(function (r) { return vis(r); });
    if (!rows.length) return '';
    var h = '<table class="rp-t">';
    rows.forEach(function (r) {
      var cells = [].slice.call(r.cells), head = r.parentNode.tagName === 'THEAD' || cells.every(function (c) { return c.tagName === 'TH'; });
      var html = cells.map(function (c) { var v = cellHTML(c); return v; });
      if (!head && html.every(function (v) { return !v; })) return;
      h += '<tr>' + cells.map(function (c, i) { var tag = head || c.tagName === 'TH' ? 'th' : 'td'; return '<' + tag + (c.colSpan > 1 ? ' colspan="' + c.colSpan + '"' : '') + '>' + html[i] + '</' + tag + '>'; }).join('') + '</tr>';
    });
    return h + '</table>';
  }
  // walk an element and return report HTML
  function walk(el, depth) {
    var out = '';
    el.childNodes.forEach(function (n) {
      if (n.nodeType === 3) { var tx = n.textContent.replace(/\s+/g, ' '); if (tx.trim()) out += esc(tx); return; }
      if (n.nodeType !== 1) return;
      if (n.matches(SKIP)) return;
      var tag = n.tagName;
      if (tag === 'SUMMARY') { out += '<h4>' + esc(n.textContent.trim()) + '</h4>'; return; }
      if (!vis(n)) return;
      if (/(^|\s)(ir|frow)(\s|$)/.test(n.className || '') && n.querySelector('input,select,textarea')) {
        var ctls = [].slice.call(n.querySelectorAll('input,select,textarea')).filter(function (x) { return !x.matches(SKIP) && vis(x); });
        var lab0 = n.firstElementChild ? labelText(n.firstElementChild) : '';
        out += field(lab0, ctls.map(valHTML).join(' ')); return;
      }
      if (tag === 'LABEL') {
        var all = [].slice.call(n.querySelectorAll('input,select,textarea'));
        if (all.length && all.every(function (x) { return x.type === 'file'; })) return;
        if (all.length > 1 && all.every(function (x) { return x.type === 'checkbox'; })) { var on = all.filter(function (x) { return x.checked; }).map(function (x) { return (x.closest('label') && x.closest('label') !== n ? labelText(x.closest('label')) : x.getAttribute('aria-label') || '').trim(); }).filter(Boolean); var head = n.cloneNode(true); head.querySelectorAll('label,span').forEach(function (x) { x.remove(); }); out += field(head.textContent.replace(/\s+/g, ' ').trim(), esc(on.join(', ') || '—')); return; }
        var c = n.querySelector('input,select,textarea');
        if (c && !c.matches(SKIP)) { var t = (c.type || '').toLowerCase(); if (t === 'radio' && !c.checked) return; out += field(labelText(n) || c.getAttribute('aria-label') || '', valHTML(c)); return; }
      }
      if (/^(INPUT|SELECT|TEXTAREA)$/.test(tag)) {
        var t2 = (n.type || '').toLowerCase(); if (t2 === 'radio' && !n.checked) return; if (t2 === 'search' || t2 === 'range' && !n.getAttribute('aria-label')) return;
        var lab = n.getAttribute('aria-label') || n.placeholder || '';
        if (n.id) { var lb = document.querySelector('label[for="' + n.id + '"]'); if (lb) lab = labelText(lb); }
        if (!ctlValue(n)) return;
        out += lab ? field(lab, valHTML(n)) : '<span class="rp-v">' + valHTML(n) + '</span>';
        return;
      }
      if (tag === 'TABLE') { out += tableHTML(n); return; }
      if (tag === 'IMG' || tag === 'CANVAS' || tag.toLowerCase() === 'svg') { out += media(n); return; }
      if (/^H[1-6]$/.test(tag)) { var lvl = Math.min(4, Math.max(2, +tag[1])); out += '<h' + lvl + '>' + esc(labelText(n)) + '</h' + lvl + '>'; return; }
      if (tag === 'P') { var cls = n.className || ''; var inner = walk(n, depth + 1); if (inner.trim()) out += '<p class="' + (/note|hint|tnote/.test(cls) ? 'rp-note' : /notice|error/.test(cls) ? 'rp-notice' : '') + '">' + inner + '</p>'; return; }
      if (tag === 'BR') { out += '<br>'; return; }
      if (tag === 'A') { out += esc(n.textContent.replace(/\s+/g, ' ').trim()) + (n.href && /^https?:/.test(n.getAttribute('href') || '') ? ' <span class="rp-url">(' + esc(n.href) + ')</span>' : ''); return; }
      if (tag === 'B' || tag === 'STRONG') { out += '<b>' + walk(n, depth) + '</b>'; return; }
      // swatch-like elements: coloured boxes with no text
      var bg = n.style && (n.style.background || n.style.backgroundColor);
      if (bg && !n.textContent.trim() && !n.querySelector('img,svg,canvas,input')) { var r = n.getBoundingClientRect(); if (r.width >= 8 && r.height >= 8) { out += '<i class="rp-sw' + (r.width > 40 ? ' big' : '') + '" style="background:' + esc(bg) + '"></i>'; return; } }
      // small result tiles: label + figure
      if (/(^|\s)(rr|info-row)(\s|$)/.test(n.className || '')) { var kv = [].slice.call(n.children).filter(vis).map(function (x) { return x.textContent.replace(/\s+/g, ' ').trim(); }); if (kv.length >= 2) { out += field(kv[0], esc(kv.slice(1).join(' '))); return; } }
      if (/(^|\s)(metric|big|ans|stat|kpi)(\s|$)/.test(n.className || '')) {
        var parts = [].slice.call(n.children).filter(vis).map(function (x) { return x.textContent.replace(/\s+/g, ' ').trim(); }).filter(Boolean);
        if (parts.length >= 2) { out += '<div class="rp-m"><span>' + esc(parts[0]) + '</span><b>' + esc(parts[1]) + '</b>' + (parts[2] ? '<small>' + esc(parts.slice(2).join(' · ')) + '</small>' : '') + '</div>'; return; }
      }
      var inner2 = walk(n, depth + 1);
      if (!inner2.trim() || BLOCK.test(tag) && !inner2.replace(/<h[2-4]>[\s\S]*?<\/h[2-4]>/g, '').replace(/<[^>]+>/g, '').trim() && !/<(img|svg|table|i )/.test(inner2)) return;
      if (BLOCK.test(tag)) {
        var nf = (inner2.match(/class="rp-f"/g) || []).length, nm = (inner2.match(/class="rp-m"/g) || []).length;
        var allF = /^(\s*<div class="rp-f">[\s\S]*?<\/div>\s*)+$/.test(inner2), allM = /^(\s*<div class="rp-m">[\s\S]*?<\/div>\s*)+$/.test(inner2);
        var cls2 = allF && nf > 1 ? 'rp-grid' : allM && nm > 1 ? 'rp-mets' : n.matches('section,.panel,.card,.tp,fieldset') && depth < 3 ? 'rp-sec' : '';
        if (tag === 'LI') out += '<li>' + inner2 + '</li>';
        else if (tag === 'UL' || tag === 'OL') out += '<' + tag.toLowerCase() + '>' + inner2 + '</' + tag.toLowerCase() + '>';
        else out += '<div' + (cls2 ? ' class="' + cls2 + '"' : '') + '>' + inner2 + '</div>';
      } else out += inner2;
    });
    return out;
  }
  var CSS = '@page{size:A4;margin:14mm 12mm 16mm}@page{@bottom-left{content:"BRANDFOOT";font:8pt "DM Sans",Arial,sans-serif;color:#777}@bottom-right{content:"Page " counter(page) " of " counter(pages);font:8pt "DM Sans",Arial,sans-serif;color:#777}}'
    + '#fxReport{display:none}'
    + '@media print{html,body{background:#fff!important}body.fx-report-on>*:not(#fxReport){display:none!important}body.fx-report-on #fxReport{display:block!important}}'
    + '#fxReport{font:9.5pt/1.45 "DM Sans",Arial,sans-serif;color:#1b1d20;-webkit-print-color-adjust:exact;print-color-adjust:exact}'
    + '#fxReport .rp-head{display:grid;grid-template-columns:1fr auto;gap:6mm;align-items:end;border-bottom:2.2pt solid #214538;padding-bottom:4mm;margin-bottom:5mm}'
    + '#fxReport .rp-brand{font:700 15pt "DM Sans",Arial,sans-serif;letter-spacing:.01em;color:#214538}#fxReport .rp-brand i{color:#e08a5e;font-style:normal}'
    + '#fxReport .rp-kick{font:700 7.5pt "DM Sans",Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#a9481f;margin-top:3mm}'
    + '#fxReport h1{font:600 20pt/1.15 "Source Serif 4",Georgia,serif;margin:1mm 0 0}'
    + '#fxReport .rp-meta{border-collapse:collapse;font-size:8.5pt}#fxReport .rp-meta td{padding:1px 0 1px 8mm;text-align:right;white-space:nowrap}#fxReport .rp-meta td:first-child{color:#6b6b6b}'
    + '#fxReport h2{font:700 11.5pt "DM Sans",Arial,sans-serif;color:#214538;margin:6mm 0 2.5mm;padding:1.6mm 2.5mm;background:#eef3ef;border-left:2.2pt solid #214538;break-after:avoid}'
    + '#fxReport h3,#fxReport h4{font:700 10pt "DM Sans",Arial,sans-serif;margin:4mm 0 2mm;break-after:avoid}#fxReport h4{font-size:9pt;color:#444}'
    + '#fxReport .rp-sec{break-inside:auto;margin-bottom:2mm}'
    + '#fxReport .rp-grid{display:grid;grid-template-columns:1fr 1fr;border-top:.5pt solid #ccc;margin:1mm 0 3mm}'
    + '#fxReport .rp-f{display:grid;grid-template-columns:42% 1fr;gap:3mm;padding:1.4mm 2mm;border-bottom:.5pt solid #ddd;break-inside:avoid}#fxReport .rp-grid .rp-f:nth-child(odd){border-right:.5pt solid #ddd}'
    + '#fxReport .rp-f>span{color:#5d5d5d}#fxReport .rp-f>b{font-weight:600;word-break:break-word}'
    + '#fxReport .rp-mets{display:grid;grid-template-columns:repeat(3,1fr);gap:2.5mm;margin:2mm 0 3mm}'
    + '#fxReport .rp-m{border:.6pt solid #b9c9be;border-radius:2mm;padding:2.4mm 3mm;break-inside:avoid;background:#f7faf7}#fxReport .rp-m span{display:block;color:#5d5d5d;font-size:8pt}#fxReport .rp-m b{display:block;font:700 13pt "DM Sans",Arial,sans-serif;color:#214538;margin-top:.6mm}#fxReport .rp-m small{display:block;color:#666;font-size:7.5pt}'
    + '#fxReport .rp-t{width:100%;border-collapse:collapse;margin:1.5mm 0 3mm;font-size:8.5pt;break-inside:auto}#fxReport .rp-t th{background:#214538;color:#fff;text-align:left;font-weight:700;padding:1.6mm 2mm}#fxReport .rp-t td{padding:1.4mm 2mm;border-bottom:.5pt solid #d6d6d6;vertical-align:top}#fxReport .rp-t tr:nth-child(even) td{background:#f6f6f3}#fxReport .rp-t tr{break-inside:avoid}'
    + '#fxReport .rp-sw{display:inline-block;width:3.6mm;height:3.6mm;border-radius:.6mm;border:.4pt solid rgba(0,0,0,.25);vertical-align:-.6mm;margin-right:1.5mm}#fxReport .rp-sw.big{width:12mm;height:9mm}'
    + '#fxReport .rp-img{max-width:100%;max-height:105mm;object-fit:contain;display:block;margin:2mm 0;border:.5pt solid #ddd;break-inside:avoid}#fxReport .rp-svg{display:block;width:100%;height:auto;max-height:120mm;margin:2mm 0;break-inside:avoid}'
    + '#fxReport p{margin:1.2mm 0}#fxReport .rp-note{color:#666;font-size:8pt}#fxReport .rp-notice{border:.6pt solid #e2c3ad;background:#fbf3ec;padding:2mm 3mm;font-size:8.5pt}#fxReport .rp-url{color:#777;font-size:7.5pt;word-break:break-all}#fxReport .rp-dim{color:#aaa}'
    + '#fxReport .rp-sign{display:grid;grid-template-columns:repeat(3,1fr);gap:8mm;margin-top:10mm;break-inside:avoid}#fxReport .rp-sign div{border-top:.6pt solid #888;padding-top:1.5mm;font-size:8pt;color:#555}'
    + '#fxReport .rp-part.brk{break-before:page}#fxReport .rp-tabh{font:700 15pt "Source Serif 4",Georgia,serif;color:#1b1d20;margin:2mm 0 1mm;padding-bottom:1.5mm;border-bottom:.8pt solid #214538}'
    + '#fxReport .rp-foot{margin-top:6mm;border-top:.6pt solid #ccc;padding-top:2mm;font-size:7.5pt;color:#777}';
  function collectionName() { var c = document.getElementById('collectionName'); return c && c.value ? c.value : ''; }
  var TITLES = { rangeboard: 'Collection Plan', 'trend-to-style': 'Style Brief', swatchsmith: 'Colour Palette', 'textile-calculator': 'Textile Calculation', 'textile-processing-studio': 'Textile Processing', 'size-chart-builder': 'Size Chart', 'decoration-cost-estimator': 'Embroidery & Print Cost', 'tech-pack-builder': 'Tech Pack', pricefold: 'Price & Margin', evenpoint: 'Break-even', cutclock: 'Production Calendar', 'care-label-generator': 'Care Label', 'product-description-writer': 'Product Description', 'export-market-checker': 'Export Market Checklist' };
  function brandKit() { try { var k = JSON.parse(localStorage.getItem('fc-brand-kit') || 'null'); return k && typeof k === 'object' ? k : null; } catch (e) { return null; } }
  (function loadKitFonts() { var k = brandKit(); if (!k) return; [k.headFont, k.bodyFont].forEach(function (f) { if (!f || /^(DM Sans|Source Serif 4)$/.test(f)) return; var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(f).replace(/%20/g, '+') + ':wght@400;600;700&display=swap'; (document.head || document.documentElement).appendChild(l); }); })();
  function brandName() {
    var K = brandKit(); if (K && K.name) return String(K.name).trim();
    try { var b = localStorage.getItem('fc-report-brand'); if (b !== null) return b.trim(); } catch (e) { }
    try { var st = JSON.parse(localStorage.getItem('fc-production-studio-v1') || '{}'); var x = (st.pack && st.pack.brand) || (st.care && st.care.brand) || (st.copy && st.copy.brand) || ''; if (x && !/^your brand$/i.test(x)) return x.trim(); } catch (e) { }
    return '';
  }
  function addBrandField() {
    var pop = document.querySelector('.fx-ws:not(.fx-app-menu) .fx-ws-pop'); if (!pop || document.getElementById('reportBrand')) return;
    var l = document.createElement('label'); l.innerHTML = 'Brand name on reports<input id="reportBrand" maxlength="80" placeholder="Your brand">';
    pop.insertBefore(l, pop.children[1] || null);
    var i = l.querySelector('input'); i.value = brandName();
    i.addEventListener('input', function () { try { localStorage.setItem('fc-report-brand', i.value); var K = brandKit() || {}; K.name = i.value; localStorage.setItem('fc-brand-kit', JSON.stringify(K)); } catch (e) { } });
  }
  if (document.readyState !== 'loading') addBrandField(); else document.addEventListener('DOMContentLoaded', addBrandField);
  var oldTitle = null;
  function walkOne(el) { var host = { childNodes: [el] }; return walk(host, 0); }
  // tools with tabs: report every tab, not only the one on screen
  function fullWalk(app) {
    var q = function () { return [].slice.call(app.querySelectorAll('[role=tab]')).filter(vis); };
    var tabs = q();
    if (tabs.length < 2) return walk(app, 0);
    var seen = {}, cur = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true' || t.classList.contains('on'); }), out = '', n = tabs.length;
    for (var i = 0; i < n; i++) {
      var t = q()[i]; if (!t) break;
      var label = t.textContent.replace(/\s+/g, ' ').replace(/\(\d+\)$/, '').trim();
      try { t.click(); } catch (e) { }
      var part = '';
      [].slice.call(app.children).forEach(function (ch) { if (ch.matches(SKIP) || !vis(ch)) return; var w = document.createElement('div'); var h = walkOne(ch); var key = h.replace(/\s+/g, ' '); if (!h.trim() || seen[key]) return; seen[key] = 1; part += h; });
      if (part.trim()) out += '<div class="rp-part' + (out ? ' brk' : '') + '"><div class="rp-tabh">' + esc(label) + '</div>' + part + '</div>';
    }
    var back = q()[cur < 0 ? 0 : cur]; if (back) try { back.click(); } catch (e) { }
    return out;
  }
  var lastBuild = 0;
  function build() {
    if (Date.now() - lastBuild < 1500 && document.body.classList.contains('fx-report-on')) return;
    document.body.classList.remove('fx-report-on');
    var root = document.getElementById('fxReport');
    if (!root) { root = document.createElement('div'); root.id = 'fxReport'; root.setAttribute('aria-hidden', 'true'); document.body.appendChild(root); }
    var tool = document.body.getAttribute('data-tool') || '', name = TITLES[tool] || (document.body.getAttribute('data-tool-name') || document.title.split('|')[0].trim()).replace(/\s+(Calculator|Generator|Builder|Writer|Checker|Studio|Planner)$/, ''), brand = brandName();
    var kick = document.querySelector('.fx-kicker'), app = document.querySelector('[data-report-root]') || document.getElementById('app') || document.getElementById('tc-app') || document.querySelector('main');
    var d = new Date(), ref = (brand ? brand.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase() || 'REF' : 'REF') + '-' + (tool || 'tool').slice(0, 3).toUpperCase() + '-' + d.toISOString().slice(0, 10).replace(/-/g, '') + '-' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0');
    var meta = [['Collection', collectionName()], ['Report date', d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })], ['Reference', ref]];
    var extra = typeof window.FXReportMeta === 'function' ? window.FXReportMeta() || [] : [];
    var sty = window.ForecutStyle && window.ForecutStyle.active();
    if (sty) { meta.splice(1, 0, ['Style ID', sty.id], ['Style', sty.name + ' · Rev ' + (sty.rev || 1)], ['Season', window.ForecutStyle.seasonName(sty.season) + ' · ' + sty.status]); ref = sty.id + '-R' + (sty.rev || 1) + '-' + d.toISOString().slice(0, 10).replace(/-/g, ''); meta[meta.length - 1] = ['Reference', ref]; }
    meta = meta.concat(extra).filter(function (m) { return m[1]; });
    var body = '';
    try { body = typeof window.FXReportBody === 'function' ? window.FXReportBody(walk) : fullWalk(app); } catch (e) { body = '<p>' + esc(e.message) + '</p>'; }
    var K = brandKit() || {}, col = Array.isArray(K.colours) ? K.colours : [], hex = function (h, d) { return /^#[0-9a-f]{6}$/i.test(h || '') ? h : d; }, css = CSS.replace('BRANDFOOT', [brand, K.website].filter(Boolean).join(' · ').replace(/["\\]/g, '')).replace(/#214538/g, hex(col[0], '#214538')).replace(/#a9481f/g, hex(col[1], '#a9481f'));
    if (K.headFont) css = css.replace(/"Source Serif 4",Georgia/g, '"' + K.headFont.replace(/["<>]/g, '') + '",Georgia');
    if (K.bodyFont) css = css.replace(/"DM Sans",Arial/g, '"' + K.bodyFont.replace(/["<>]/g, '') + '",Arial');
    root.innerHTML = '<style>' + css + '</style><div class="rp-head"><div>' + (brand || K.logo ? '<div class="rp-brand">' + (/^data:image\//.test(K.logo || '') ? '<img src="' + K.logo + '" alt="" style="height:12mm;max-width:45mm;object-fit:contain;vertical-align:middle;margin-right:3mm">' : '') + esc(brand) + (K.tagline ? '<small style="display:block;font:500 8pt inherit;color:#777">' + esc(K.tagline) + '</small>' : '') + '</div>' : '') + '<h1>' + esc(name) + '</h1></div><table class="rp-meta">' + meta.map(function (m) { return '<tr><td>' + esc(m[0]) + '</td><td><b>' + esc(m[1]) + '</b></td></tr>'; }).join('') + '</table></div>'
      + body + (window.FXReportSign === false ? '' : '<div class="rp-sign"><div>Prepared by</div><div>Checked by</div><div>Approved by / date</div></div>')
      + '<div class="rp-foot">' + esc([brand, K.address, K.gstin ? 'GSTIN ' + K.gstin : '', K.email, K.phone].filter(Boolean).join(' · ')) + (brand ? '<br>' : '') + 'Figures are calculated from the values entered above; confirm specifications, rates and requirements with your supplier before production.</div>';
    if (oldTitle === null) oldTitle = document.title; document.title = (sty ? sty.id + ' R' + (sty.rev || 1) + ' · ' : '') + (brand ? brand + ' · ' : '') + name + ' · ' + d.toISOString().slice(0, 10);
    document.body.classList.add('fx-report-on'); lastBuild = Date.now();
  }
  function off() { document.body.classList.remove('fx-report-on'); if (oldTitle !== null) { document.title = oldTitle; oldTitle = null; } }
  window.FXReport = { build: build, walk: walk, field: field, esc: esc };
  window.addEventListener('beforeprint', function () { if (document.body.getAttribute('data-print-mode')) return; build(); });
  window.addEventListener('afterprint', off);
  // older print shortcuts on some pages call print in a way the event misses on some browsers: make sure the report exists first
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('#print,[data-action=print],#tc-print'); if (b && !document.body.getAttribute('data-print-mode')) build(); }, true);
  var st = document.createElement('style'); st.textContent = '#fxReport{display:none}@media print{body.fx-report-on>*:not(#fxReport){display:none!important}body.fx-report-on #fxReport{display:block!important}}'; (document.head || document.documentElement).appendChild(st);
})();
