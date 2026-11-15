/* Forecut importer: reads CSV, TSV, pasted spreadsheet cells, Excel (.xlsx), PDF text and JSON in the browser,
   then recognises a size chart (sizes, points of measure, tolerances, grade steps) and tech pack header fields.
   Nothing is uploaded. window.ForecutImport */
(function () {
  'use strict';
  // ---------- readers ----------
  function parseDelimited(text) {
    text = String(text || '').replace(/^﻿/, '');
    var first = text.split(/\r?\n/).slice(0, 5).join('\n'), d = (first.match(/\t/g) || []).length > (first.match(/,/g) || []).length ? '\t' : (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : ',';
    var rows = [], row = [], cell = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; continue; }
      if (ch === '"') { q = true; continue; }
      if (ch === d) { row.push(cell); cell = ''; continue; }
      if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; continue; }
      cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.map(function (r) { return r.map(function (c) { return c.trim(); }); }).filter(function (r) { return r.some(Boolean); });
  }
  function u8(buf) { return new Uint8Array(buf); }
  function unzip(buf) {
    var b = u8(buf), dv = new DataView(buf), files = {}, eocd = -1;
    for (var i = b.length - 22; i >= Math.max(0, b.length - 66000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw Error('This file is not a valid Excel workbook.');
    var n = dv.getUint16(eocd + 10, true), off = dv.getUint32(eocd + 16, true);
    for (var k = 0; k < n; k++) {
      var m = dv.getUint16(off + 10, true), csz = dv.getUint32(off + 20, true), nl = dv.getUint16(off + 28, true), el = dv.getUint16(off + 30, true), cl = dv.getUint16(off + 32, true), lo = dv.getUint32(off + 42, true);
      var name = new TextDecoder().decode(b.subarray(off + 46, off + 46 + nl));
      var lnl = dv.getUint16(lo + 26, true), lel = dv.getUint16(lo + 28, true), start = lo + 30 + lnl + lel;
      files[name] = { m: m, data: b.subarray(start, start + csz) };
      off += 46 + nl + el + cl;
    }
    return files;
  }
  function inflate(f) {
    if (f.m === 0) return Promise.resolve(new TextDecoder().decode(f.data));
    if (typeof DecompressionStream === 'undefined') return Promise.reject(Error('This browser cannot open Excel files. Save the sheet as CSV and import that.'));
    var ds = new DecompressionStream('deflate-raw'), s = new Blob([f.data]).stream().pipeThrough(ds);
    return new Response(s).text();
  }
  function colIdx(ref) { var m = /^([A-Z]+)(\d+)$/.exec(ref) || ['', 'A', '1'], c = 0; for (var i = 0; i < m[1].length; i++) c = c * 26 + m[1].charCodeAt(i) - 64; return [c - 1, +m[2] - 1]; }
  function readXlsx(buf) {
    var z = unzip(buf), names = Object.keys(z);
    var sheetName = names.filter(function (n) { return /^xl\/worksheets\/sheet\d+\.xml$/.test(n); }).sort()[0];
    if (!sheetName) throw Error('No worksheet found in this workbook.');
    return Promise.all([z['xl/sharedStrings.xml'] ? inflate(z['xl/sharedStrings.xml']) : Promise.resolve(''), inflate(z[sheetName])]).then(function (r) {
      var P = new DOMParser(), ss = [];
      if (r[0]) { var sd = P.parseFromString(r[0], 'application/xml'); [].forEach.call(sd.getElementsByTagName('si'), function (si) { ss.push([].map.call(si.getElementsByTagName('t'), function (t) { return t.textContent; }).join('')); }); }
      var doc = P.parseFromString(r[1], 'application/xml'), rows = [];
      [].forEach.call(doc.getElementsByTagName('c'), function (c) {
        var p = colIdx(c.getAttribute('r') || 'A1'), t = c.getAttribute('t'), v = c.getElementsByTagName('v')[0], val = '';
        if (t === 's' && v) val = ss[+v.textContent] || ''; else if (t === 'inlineStr') val = [].map.call(c.getElementsByTagName('t'), function (x) { return x.textContent; }).join(''); else if (v) { val = v.textContent; if (/^-?\d+\.\d{6,}$/.test(val)) val = String(+(+val).toFixed(4)); }
        (rows[p[1]] = rows[p[1]] || [])[p[0]] = String(val).trim();
      });
      return rows.filter(Boolean).map(function (r) { for (var i = 0; i < r.length; i++) if (r[i] == null) r[i] = ''; return r; }).filter(function (r) { return r.some(Boolean); });
    });
  }
  var pdfjs = null;
  function loadPdf() {
    if (pdfjs) return pdfjs;
    pdfjs = new Promise(function (ok, no) { if (window.pdfjsLib) return ok(window.pdfjsLib); var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'; s.onload = function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; ok(window.pdfjsLib); }; s.onerror = function () { pdfjs = null; no(Error('The PDF reader could not load. Check your connection, or export the tech pack as Excel or CSV.')); }; document.head.appendChild(s); });
    return pdfjs;
  }
  function readPdf(buf) {
    return loadPdf().then(function (lib) { return lib.getDocument({ data: buf }).promise; }).then(function (doc) {
      var all = [], pages = [];
      for (var p = 1; p <= Math.min(doc.numPages, 30); p++) pages.push(doc.getPage(p).then(function (pg) { return pg.getTextContent(); }));
      return Promise.all(pages).then(function (cs) {
        cs.forEach(function (tc) {
          var items = tc.items.filter(function (i) { return i.str && i.str.trim(); }).map(function (i) { return { x: i.transform[4], y: i.transform[5], w: i.width, s: i.str.trim() }; });
          items.sort(function (a, b) { return b.y - a.y || a.x - b.x; });
          var lines = [];
          items.forEach(function (it) { var L = lines.length && Math.abs(lines[lines.length - 1].y - it.y) < 3 ? lines[lines.length - 1] : null; if (!L) { L = { y: it.y, items: [] }; lines.push(L); } L.items.push(it); });
          lines.forEach(function (L) { L.items.sort(function (a, b) { return a.x - b.x; }); var row = [], last = null; L.items.forEach(function (it) { if (last && it.x - (last.x + last.w) < 4) row[row.length - 1] += ' ' + it.s; else row.push(it.s); last = it; }); all.push(row); });
        });
        return all;
      });
    });
  }
  function readFile(file) {
    var name = (file.name || '').toLowerCase();
    if (/\.xlsx$|\.xlsm$/.test(name)) return file.arrayBuffer().then(readXlsx).then(function (rows) { return { rows: rows, kind: 'Excel' }; });
    if (/\.xls$/.test(name)) return Promise.reject(Error('Old .xls files cannot be read here. Save the sheet as .xlsx or CSV and import that.'));
    if (/\.pdf$/.test(name)) return file.arrayBuffer().then(readPdf).then(function (rows) { return { rows: rows, kind: 'PDF' }; });
    return file.text().then(function (t) {
      if (/\.json$/.test(name) || /^\s*[{[]/.test(t)) { try { return { json: JSON.parse(t), kind: 'JSON' }; } catch (e) { } }
      return { rows: parseDelimited(t), kind: 'CSV' };
    });
  }
  // ---------- numbers ----------
  var FR = { '½': .5, '¼': .25, '¾': .75, '⅛': .125, '⅜': .375, '⅝': .625, '⅞': .875, '⅓': 1 / 3, '⅔': 2 / 3 };
  function num(v) {
    v = String(v == null ? '' : v).trim().replace(/[″"]|cm|in(ch(es)?)?$/gi, '').replace(/,(\d)/, '.$1').trim();
    if (!v) return null;
    var m = /^([+-]?\d+(?:\.\d+)?)?\s*([½¼¾⅛⅜⅝⅞⅓⅔])$/.exec(v); if (m) return (+(m[1] || 0)) + FR[m[2]];
    m = /^([+-]?\d+)\s+(\d+)\/(\d+)$/.exec(v); if (m) return +m[1] + (m[1][0] === '-' ? -1 : 1) * m[2] / m[3];
    m = /^([+-]?\d+)\/(\d+)$/.exec(v); if (m) return m[1] / m[2];
    m = /^[+-]?\d+(?:\.\d+)?$/.exec(v); if (m) return +v;
    return null;
  }
  function tolNum(v) { var s = String(v || '').replace(/^(±|\+\/?-|\+-)\s*/, '').replace(/^-\s*/, ''); var parts = s.split(/\s*\/\s*[-+]\s*|\s+[-+]\s*/); return num(parts[0]); }
  var SIZE_RE = /^(xxxs|xxs|xs|s|m|l|xl|xxl|xxxl|[2-7]xl|[2-7]x|os|one size|free size|\d{1,3}|\d{1,2}\s*-\s*\d{1,2}\s*(y|yrs|years|m|mths|months)?|\d{1,2}\s*(y|yrs|years|m|mths|months)|(xs|s|m|l|xl|xxl)\s*[\/-]\s*\d{1,3}|\d{2}[\/x]\d{2}|uk\s?\d{1,2}|us\s?\d{1,2}|eu\s?\d{2})$/i;
  function isSize(c) { return SIZE_RE.test(String(c || '').trim().replace(/\s*\*$/, '').replace(/\s*\((base|sample)\)$/i, '')); }
  function cleanSize(c) { return String(c).trim().replace(/\s*\*$/, '').replace(/\s*\((base|sample)\)$/i, '').toUpperCase().replace(/\s+/g, ''); }
  var TOLS = [[/chest|bust/i, 1.5], [/waist/i, 1.5], [/hip|seat/i, 1.5], [/sweep|hem|bottom/i, 1.5], [/length|outseam|inseam/i, 1], [/shoulder/i, .75], [/sleeve/i, 1], [/armhole|bicep/i, .75], [/neck|collar/i, .5], [/rise/i, .5], [/opening|cuff/i, .5]];
  function defTol(name, unit) { for (var i = 0; i < TOLS.length; i++) if (TOLS[i][0].test(name)) return unit === 'in' ? +(TOLS[i][1] / 2.54).toFixed(3) : TOLS[i][1]; return unit === 'in' ? .25 : .5; }
  // ---------- recognise a size chart in rows ----------
  function sizeChart(rows) {
    var best = null;
    rows.forEach(function (r, ri) {
      var idx = []; r.forEach(function (c, ci) { if (isSize(c)) idx.push(ci); });
      // numeric headers only count when the row has text in it too (avoids data rows)
      var nonNum = r.filter(function (c) { return c && num(c) === null; }).length;
      var alpha = idx.filter(function (ci) { return num(r[ci]) === null; }).length;
      var words = r.some(function (c) { return /\b(pom|point|measure|description|desc|size|tol|code|spec|location)\b/i.test(c || ''); });
      var score = alpha * 10 + idx.length + (words ? 6 : 0);
      if (idx.length >= 2 && (alpha >= 2 || nonNum >= 1) && (!best || score > best.score)) best = { ri: ri, idx: idx, score: score };
    });
    if (!best) throw Error('No size columns were found. The table needs a header row with sizes, for example: Point of measure, S, M, L, Tolerance.');
    var H = rows[best.ri].map(function (c) { return String(c || '').trim(); }), lower = H.map(function (h) { return h.toLowerCase(); });
    var sizes = best.idx.map(function (ci) { return cleanSize(H[ci]); });
    var find = function (re) { for (var i = 0; i < lower.length; i++) if (best.idx.indexOf(i) < 0 && re.test(lower[i])) return i; return -1; };
    var tolC = find(/tol|±|\+\/-|\+-/), codeC = find(/^(code|ref|pom ?(code|#|no)|#|no\.?|id)$/), howC = find(/how|method|instruction|note/), pomC = find(/pom|point|measure|description|desc|location|spec/);
    var gradeC = find(/grade|step|increment/);
    var data = [], need = Math.max(1, Math.ceil(best.idx.length / 2));
    for (var di0 = best.ri + 1; di0 < rows.length; di0++) { var rr = rows[di0], okR = best.idx.filter(function (ci) { return num(rr[ci]) !== null; }).length >= need; if (okR) data.push(rr); else if (data.length && !(rr.length === 1 && /^\s*$/.test(rr[0] || '')) && rr.some(function (c) { return String(c || '').trim(); })) break; }
    var shortCol = function (c) { return c > -1 && data.length && data.every(function (r) { return !r[c] || String(r[c]).length <= 4; }); };
    if (shortCol(pomC)) { if (codeC < 0) codeC = pomC; pomC = -1; for (var di = 0; di < lower.length; di++) if (di !== codeC && best.idx.indexOf(di) < 0 && /desc|description|point|measure|location|name/.test(lower[di])) { pomC = di; break; } }
    if (pomC < 0) { // first column that is mostly text in the data rows
      var cols = H.length; for (var c = 0; c < cols; c++) { if (best.idx.indexOf(c) > -1 || c === tolC || c === codeC) continue; var txt = data.filter(function (r) { return r[c] && num(r[c]) === null && r[c].length > 2; }).length; if (txt >= data.length / 2) { pomC = c; break; } }
    }
    if (codeC < 0 && pomC > 0) { var cc = pomC - 1; if (data.every(function (r) { return !r[cc] || String(r[cc]).length <= 4; })) codeC = cc; }
    var text = rows.map(function (r) { return r.join(' '); }).join(' ').toLowerCase();
    var unit = /\b(inch|inches)\b|"|″|\bin\.|\(in\)/.test(text) && !/\(cm\)|\bcm\b/.test(text) ? 'in' : 'cm';
    var baseI = H.findIndex(function (h, i) { return best.idx.indexOf(i) > -1 && /\*|\((base|sample)\)/i.test(h); });
    var base = baseI > -1 ? cleanSize(H[baseI]) : '';
    if (!base) { var bm = /\b(base|sample)\s*size\s*[:\-]?\s*([a-z0-9\-\/]{1,8})/i.exec(text); if (bm && sizes.indexOf(bm[2].toUpperCase()) > -1) base = bm[2].toUpperCase(); }
    if (!base) base = sizes.indexOf('M') > -1 ? 'M' : sizes[Math.floor((sizes.length - 1) / 2)];
    var bi = sizes.indexOf(base), letter = 0;
    var out = data.map(function (r) {
      var vals = best.idx.map(function (ci) { return num(r[ci]); }), name = (pomC > -1 ? r[pomC] : '') || ('Measurement ' + (++letter));
      var b = vals[bi]; if (b == null) b = vals.filter(function (v) { return v != null; })[0] || 0;
      var dn = [], up = [];
      for (var i = 1; i < vals.length; i++) if (vals[i] != null && vals[i - 1] != null) (i <= bi ? dn : up).push(vals[i] - vals[i - 1]);
      var avg = function (a) { return a.length ? +(a.reduce(function (s, x) { return s + x; }, 0) / a.length).toFixed(3) : 0; };
      var row = { code: codeC > -1 ? String(r[codeC] || '') : '', name: String(name).slice(0, 200), how: howC > -1 ? String(r[howC] || '').slice(0, 300) : '', base: b, down: Math.max(0, avg(dn)), up: Math.max(0, avg(up)), tolerance: tolC > -1 && tolNum(r[tolC]) != null ? Math.abs(tolNum(r[tolC])) : defTol(name, unit) };
      var even = true; vals.forEach(function (v, i) { if (v == null) return; var f = b + (i - bi) * (i < bi ? row.down : row.up); if (Math.abs(f - v) > .011) even = false; });
      if (!even || avg(dn) < 0 || avg(up) < 0) { row.vals = {}; sizes.forEach(function (s, i) { if (vals[i] != null) row.vals[s] = vals[i]; }); }
      return row;
    });
    if (!out.length) throw Error('Sizes were found, but no measurement rows with numbers under them.');
    return { sizes: sizes, base: base, unit: unit, rows: out, found: { tolerance: tolC > -1, codes: codeC > -1, how: howC > -1, base: baseI > -1 } };
  }
  // ---------- tech pack header fields ("Style no: FC-001" or "Style no | FC-001") ----------
  var FIELDS = [['styleCode', /^(style\s*(no|number|code|#)|article\s*(no|number)|sku|item\s*(no|code))$/i], ['styleName', /^(style\s*name|description|product\s*name|garment)$/i], ['season', /^(season|collection|drop)$/i], ['brand', /^(brand|buyer|customer|client)$/i],
    ['supplier', /^(supplier|vendor|factory|manufacturer|mill)$/i], ['fabric', /^(fabric|main\s*fabric|shell\s*fabric|material|body\s*fabric|composition)$/i], ['colour', /^(colou?r(way)?s?|shade)$/i], ['category', /^(category|department|division|gender)$/i], ['version', /^(rev(ision)?|version)$/i], ['date', /^(date|issue\s*date)$/i], ['designer', /^(designer|merchandiser|prepared\s*by)$/i], ['fit', /^(fit)$/i], ['gsm', /^(gsm|weight)$/i]];
  function headerFields(rows) {
    var f = {};
    rows.forEach(function (r) {
      var cells = []; r.forEach(function (c) { String(c || '').split(/\s{3,}/).forEach(function (x) { if (x.trim()) cells.push(x.trim()); }); });
      if (r.filter(function (c) { return isSize(c); }).length >= 2) return; // the size table header
      var few = cells.length <= 4;
      cells.forEach(function (c, i) {
        if (!few && !/:/.test(c)) return;
        var kv = /^([^:]{2,30}):\s*(.+)$/.exec(c), k = kv ? kv[1].trim() : c.replace(/:$/, ''), v = kv ? kv[2].trim() : (cells[i + 1] || '');
        FIELDS.forEach(function (F) { if (!f[F[0]] && F[1].test(k) && v && v.length < 160 && !FIELDS.some(function (G) { return G[1].test(v); })) f[F[0]] = v; });
      });
    });
    return f;
  }
  // BOM-like table: header with item/material and qty
  function bomTable(rows) {
    var hi = rows.findIndex(function (r) { var l = r.map(function (c) { return String(c).toLowerCase(); }); return l.some(function (c) { return /^(item|material|component|trim|description)$/.test(c); }) && l.some(function (c) { return /qty|quantity|consumption|usage/.test(c); }); });
    if (hi < 0) return [];
    var H = rows[hi].map(function (c) { return String(c).toLowerCase(); }), col = function (re) { return H.findIndex(function (h) { return re.test(h); }); };
    var it = col(/^(item|material|component|trim|description)$/), su = col(/supplier|vendor/), co = col(/colou?r|shade/), q = col(/qty|quantity|consumption|usage/), un = col(/^unit|uom/), pr = col(/price|rate|cost/);
    var out = [];
    for (var i = hi + 1; i < rows.length; i++) { var r = rows[i]; if (!r[it]) { if (out.length) break; continue; } if (q > -1 && num(r[q]) == null && out.length) break; out.push({ item: String(r[it]).slice(0, 200), supplier: su > -1 ? String(r[su] || '') : '', colour: co > -1 ? String(r[co] || '') : '', quantity: q > -1 ? Math.max(0, num(r[q]) || 0) : 1, unit: un > -1 ? String(r[un] || 'piece') : 'piece', price: pr > -1 ? Math.max(0, num(r[pr]) || 0) : 0 }); if (out.length >= 100) break; }
    return out;
  }
  window.ForecutImport = { readFile: readFile, parseDelimited: parseDelimited, sizeChart: sizeChart, headerFields: headerFields, bomTable: bomTable, num: num, isSize: isSize, defTol: defTol };
})();
