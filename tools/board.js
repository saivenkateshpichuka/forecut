/* Forecut style boards: a whiteboard for collection boards, mood boards and accessories boards.
   Pan, zoom, notes, text, images, colour swatches, frames, shapes, arrows, undo/redo, PNG export.
   Boards are saved in this browser (layout in localStorage, images in IndexedDB); nothing is uploaded. */
(function () {
  'use strict';
  var host = document.getElementById('app'); if (!host || document.body.getAttribute('data-tool') !== 'trend-to-style') return;
  var KEY = 'fc-tool-boards', DB = 'fc-board-images';
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function uid() { return Math.random().toString(36).slice(2, 10); }
  var NOTE = ['#fff3a8', '#ffd7c2', '#d6ecd2', '#d4e4f7', '#ead7f2', '#ffffff'];
  var FONTS = [['DM Sans', 'DM Sans'], ['Source Serif 4', 'Source Serif'], ['Playfair Display', 'Playfair Display'], ['Montserrat', 'Montserrat'], ['Poppins', 'Poppins'], ['Lora', 'Lora'], ['Oswald', 'Oswald'], ['Bebas Neue', 'Bebas Neue'], ['Caveat', 'Caveat (handwritten)'], ['Dancing Script', 'Dancing Script'], ['Georgia', 'Georgia'], ['Arial', 'Arial'], ['Courier New', 'Courier New']];
  (function () { if (document.getElementById('bdFonts')) return; var l = document.createElement('link'); l.id = 'bdFonts'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@400;700&family=Dancing+Script:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Oswald:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Poppins:ital,wght@0,400;0,700;1,400&display=swap'; document.head.appendChild(l); })();
  var SHAPES = [['rect', 'Rectangle'], ['round', 'Rounded rectangle'], ['ellipse', 'Circle / ellipse'], ['triangle', 'Triangle'], ['diamond', 'Diamond'], ['hexagon', 'Hexagon'], ['star', 'Star'], ['arrow', 'Block arrow'], ['speech', 'Speech bubble'], ['line', 'Line']];
  function shapeOf(it) { return it.shape || (it.round ? 'ellipse' : 'round'); }
  function shapePath(sh, w, h) {
    var r, f = function (n) { return Math.round(n * 10) / 10; };
    if (sh === 'rect') return 'M0 0H' + w + 'V' + h + 'H0Z';
    if (sh === 'round') { r = Math.min(14, w / 4, h / 4); return 'M' + r + ' 0H' + (w - r) + 'Q' + w + ' 0 ' + w + ' ' + r + 'V' + (h - r) + 'Q' + w + ' ' + h + ' ' + (w - r) + ' ' + h + 'H' + r + 'Q0 ' + h + ' 0 ' + (h - r) + 'V' + r + 'Q0 0 ' + r + ' 0Z'; }
    if (sh === 'ellipse') return 'M0 ' + f(h / 2) + 'A' + f(w / 2) + ' ' + f(h / 2) + ' 0 1 0 ' + w + ' ' + f(h / 2) + 'A' + f(w / 2) + ' ' + f(h / 2) + ' 0 1 0 0 ' + f(h / 2) + 'Z';
    if (sh === 'triangle') return 'M' + f(w / 2) + ' 0L' + w + ' ' + h + 'H0Z';
    if (sh === 'diamond') return 'M' + f(w / 2) + ' 0L' + w + ' ' + f(h / 2) + 'L' + f(w / 2) + ' ' + h + 'L0 ' + f(h / 2) + 'Z';
    if (sh === 'hexagon') return 'M' + f(w * .25) + ' 0H' + f(w * .75) + 'L' + w + ' ' + f(h / 2) + 'L' + f(w * .75) + ' ' + h + 'H' + f(w * .25) + 'L0 ' + f(h / 2) + 'Z';
    if (sh === 'star') { var d = '', i, a, rr; for (i = 0; i < 10; i++) { a = -Math.PI / 2 + i * Math.PI / 5; rr = i % 2 ? .4 : 1; d += (i ? 'L' : 'M') + f(w / 2 + Math.cos(a) * rr * w / 2) + ' ' + f(h * .53 + Math.sin(a) * rr * h * .53); } return d + 'Z'; }
    if (sh === 'arrow') return 'M0 ' + f(h * .3) + 'H' + f(w * .62) + 'V0L' + w + ' ' + f(h / 2) + 'L' + f(w * .62) + ' ' + h + 'V' + f(h * .7) + 'H0Z';
    if (sh === 'speech') { r = Math.min(12, w / 5, h / 5); var b = f(h * .76); return 'M' + r + ' 0H' + (w - r) + 'Q' + w + ' 0 ' + w + ' ' + r + 'V' + (b - r) + 'Q' + w + ' ' + b + ' ' + (w - r) + ' ' + b + 'H' + f(w * .42) + 'L' + f(w * .2) + ' ' + h + 'L' + f(w * .26) + ' ' + b + 'H' + r + 'Q0 ' + b + ' 0 ' + (b - r) + 'V' + r + 'Q0 0 ' + r + ' 0Z'; }
    if (sh === 'line') return 'M0 ' + f(h / 2) + 'H' + w;
    return 'M0 0H' + w + 'V' + h + 'H0Z';
  }
  function textCss(it, def) { // per-item type options for text, notes and shapes
    var c = '';
    if (it.font) c += 'font-family:"' + it.font + '",sans-serif;';
    if (it.size || def) c += 'font-size:' + (it.size || def) + 'px;';
    if (it.bold != null) c += 'font-weight:' + (it.bold ? 700 : 400) + ';';
    if (it.italic) c += 'font-style:italic;';
    if (it.under || it.strike) c += 'text-decoration:' + (it.under ? 'underline ' : '') + (it.strike ? 'line-through' : '') + ';';
    if (it.align) c += 'text-align:' + it.align + ';' + (it.type === 'rect' ? 'justify-items:' + ({ left: 'start', right: 'end' }[it.align] || 'center') + ';' : '');
    if (it.ink) c += 'color:' + it.ink + ';';
    if (it.lh) c += 'line-height:' + it.lh + ';';
    if (it.ls) c += 'letter-spacing:' + it.ls + 'px;';
    if (it.caps) c += 'text-transform:uppercase;';
    if (it.hl) c += 'background:' + it.hl + ';';
    return c;
  }
  var pendingShape = 'rect', clip = null;

  /* ---------- images in IndexedDB ---------- */
  var dbp = null;
  function db() { if (dbp) return dbp; dbp = new Promise(function (ok, no) { var r = indexedDB.open(DB, 1); r.onupgradeneeded = function () { r.result.createObjectStore('img'); }; r.onsuccess = function () { ok(r.result); }; r.onerror = function () { no(r.error); }; }); return dbp; }
  function putImg(id, data) { return db().then(function (d) { return new Promise(function (ok, no) { var t = d.transaction('img', 'readwrite'); t.objectStore('img').put(data, id); t.oncomplete = ok; t.onerror = function () { no(t.error); }; }); }); }
  var imgCache = {};
  function getImg(id) { if (imgCache[id]) return Promise.resolve(imgCache[id]); return db().then(function (d) { return new Promise(function (ok) { var q = d.transaction('img').objectStore('img').get(id); q.onsuccess = function () { imgCache[id] = q.result || ''; ok(q.result || ''); }; q.onerror = function () { ok(''); }; }); }); }
  function shrink(file) { // keep boards light: longest side 1400 px, JPEG (PNG kept for transparency)
    return new Promise(function (ok, no) {
      var fr = new FileReader(); fr.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, 1400 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); var png = /png|gif|webp/.test(file.type); ok({ src: c.toDataURL(png ? 'image/png' : 'image/jpeg', .86), w: c.width, h: c.height }); }; im.onerror = no; im.src = fr.result; }; fr.onerror = no; fr.readAsDataURL(file);
    });
  }

  /* ---------- templates ---------- */
  function frame(x, y, w, h, t, col) { return { id: uid(), type: 'frame', x: x, y: y, w: w, h: h, text: t, color: col || '#ffffff' }; }
  function note(x, y, t, c) { return { id: uid(), type: 'note', x: x, y: y, w: 200, h: 150, text: t, color: c || NOTE[0] }; }
  function text(x, y, t, size) { return { id: uid(), type: 'text', x: x, y: y, w: 520, h: 60, text: t, size: size || 34 }; }
  var TEMPLATES = {
    collection: { name: 'Collection board', items: function () { return [
      text(0, -110, 'SS27 collection: [your theme]', 40),
      frame(0, 0, 560, 420, 'Theme and story'), frame(600, 0, 400, 420, 'Colour palette'), frame(1040, 0, 400, 420, 'Fabrics and trims'),
      frame(0, 460, 1440, 460, 'Key styles: tops · bottoms · dresses · layers'), frame(0, 960, 700, 380, 'Accessories'), frame(740, 960, 700, 380, 'Price points and drops'),
      note(30, 60, 'Who is she or he? Where are they going?'), note(30, 470 + 40, 'Hero style'), note(260, 470 + 40, 'Best seller carry-over', NOTE[2]),
      { id: uid(), type: 'swatch', x: 630, y: 60, w: 110, h: 140, hex: '#214538', text: 'Forest' }, { id: uid(), type: 'swatch', x: 760, y: 60, w: 110, h: 140, hex: '#c4643f', text: 'Clay' }, { id: uid(), type: 'swatch', x: 630, y: 230, w: 110, h: 140, hex: '#e9dcc4', text: 'Sand' }] } },
    mood: { name: 'Mood board', items: function () { return [
      text(0, -110, 'Mood: [one-line feeling]', 40), frame(0, 0, 1200, 760, 'Drop images, colours and words here'),
      note(40, 60, 'Three words that describe the mood'), note(280, 60, 'Music, place or film it feels like', NOTE[3])] } },
    accessories: { name: 'Accessories board', items: function () { return [
      text(0, -110, 'Accessories: [season]', 40),
      frame(0, 0, 460, 380, 'Bags'), frame(500, 0, 460, 380, 'Footwear'), frame(1000, 0, 460, 380, 'Jewellery'),
      frame(0, 420, 460, 380, 'Belts and small leather goods'), frame(500, 420, 460, 380, 'Headwear and scarves'), frame(1000, 420, 460, 380, 'Trims, buttons and hardware')] } },
    lineup: { name: 'Line-up board', items: function () { return [
      text(0, -110, 'Range line-up', 40), frame(0, 0, 1600, 520, 'Look 1 → Look 8 (left to right in shop order)'),
      note(30, 60, 'Look 1'), note(250, 60, 'Look 2'), note(470, 60, 'Look 3'), note(690, 60, 'Look 4')] } },
    blank: { name: 'Blank board', items: function () { return []; } }
  };

  /* ---------- state ---------- */
  var S;
  try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { S = null; }
  if (!S || !S.boards || !S.boards.length) { var b0 = newBoard('collection'); S = { v: 1, cur: b0.id, boards: [b0], mode: 'board' }; }
  function newBoard(t) { var T = TEMPLATES[t] || TEMPLATES.blank; return { id: uid(), name: T.name, items: T.items(), view: { x: 80, y: 140, k: 0.6 } }; }
  function B() { for (var i = 0; i < S.boards.length; i++) if (S.boards[i].id === S.cur) return S.boards[i]; S.cur = S.boards[0].id; return S.boards[0]; }
  var saveT, undo = [], redo = [];
  function save(push) {
    if (push !== false) { undo.push(JSON.stringify(B().items)); if (undo.length > 80) undo.shift(); redo = []; }
    clearTimeout(saveT); saveT = setTimeout(function () { try { localStorage.setItem(KEY, JSON.stringify(S)); if (Date.now() - msgT > 6000) $('#bdStatus') && ($('#bdStatus').textContent = 'Saved in this browser'); } catch (e) { status('Browser storage is full: export the board or remove some images.'); } }, 250);
  }
  function snapshot() { undo.push(JSON.stringify(B().items)); if (undo.length > 80) undo.shift(); redo = []; }
  var msgT = 0;
  function status(t) { var s = $('#bdStatus'); if (s) s.textContent = t; msgT = Date.now(); }

  /* ---------- UI shell ---------- */
  var wrap = document.createElement('div'); wrap.className = 'bd-wrap';
  host.parentNode.insertBefore(wrap, host);
  var modeBar = document.createElement('div'); modeBar.className = 'bd-modes'; modeBar.setAttribute('role', 'tablist');
  wrap.before(modeBar);
  function setMode(m) {
    S.mode = m; save(false);
    modeBar.innerHTML = '<button type="button" role="tab" aria-selected="' + (m === 'board') + '" data-m="board">Boards</button><button type="button" role="tab" aria-selected="' + (m === 'brief') + '" data-m="brief">Style brief</button>';
    wrap.hidden = m !== 'board'; host.hidden = m === 'board';
    if (m === 'board') { renderBar(); draw(); }
  }
  modeBar.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setMode(b.dataset.m); });

  wrap.innerHTML =
    '<div class="bd-top"><label class="bd-boardsel">Board<select id="bdSel"></select></label><button type="button" data-a="newboard">+ New board</button><button type="button" data-a="rename">Rename</button><button type="button" data-a="delboard">Delete</button><button type="button" data-a="import" title="Add your Collection Planner styles, images and palette to this board">Import from Collection Planner</button>' +
    '<span class="bd-sp"></span><button type="button" data-a="full">Full screen</button><button type="button" data-a="png">Export PNG</button><button type="button" data-a="json">Save file</button><button type="button" data-a="load">Open file</button><input type="file" id="bdFile" accept=".json,application/json" hidden></div>' +
    '<div class="bd-stage"><div class="bd-tools" role="toolbar" aria-label="Board tools">' +
    tool('select', 'Select and move (V)', '<path d="M5 3l14 8-6 2-3 6z"/>') + tool('note', 'Sticky note (N)', '<path d="M4 4h16v11l-5 5H4z"/><path d="M15 20v-5h5"/>') +
    tool('text', 'Text (T)', '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>') + tool('image', 'Image (I)', '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-6-6-9 9"/>') +
    tool('swatch', 'Colour swatch (C)', '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 14h14"/>') + tool('frame', 'Frame / section (F)', '<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/>') +
    tool('rect', 'Shapes (R): rectangle, circle, triangle, star, arrow and more', '<rect x="3" y="9" width="10" height="10" rx="1.5"/><circle cx="16" cy="8" r="5"/>') + tool('arrow', 'Arrow: drag from one item to another (A)', '<path d="M4 20 20 4M11 4h9v9"/>') +
    '<span class="bd-tsep"></span>' + tool('undo', 'Undo (Ctrl+Z)', '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>') + tool('redo', 'Redo (Ctrl+Shift+Z)', '<path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>') +
    '</div><div class="bd-view" id="bdView" tabindex="0" aria-label="Board canvas"><div class="bd-world" id="bdWorld"><svg class="bd-links" id="bdLinks"><defs><marker id="bdArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#2b2622"/></marker></defs></svg></div><div class="bd-marquee" id="bdMq" hidden></div></div>' +
    '<div class="bd-zoom"><button type="button" data-a="zout" aria-label="Zoom out">−</button><span id="bdZ">60%</span><button type="button" data-a="zin" aria-label="Zoom in">+</button><button type="button" data-a="fit">Fit</button></div>' +
    '<div class="bd-props" id="bdProps" hidden></div><div class="bd-fly" id="bdFly" hidden></div><div class="bd-menu" id="bdMenu" role="menu" hidden></div><input type="file" id="bdRepl" accept="image/*" hidden><input type="file" id="bdImg" accept="image/*" multiple hidden></div>' +
    '<p class="bd-help"><span id="bdStatus">Saved in this browser</span> · Drag empty space to pan · Ctrl/⌘ + scroll or pinch to zoom · Double-click (or Enter) to edit text · Right-click for more · Paste or drop images straight onto the board · Delete removes, Ctrl+C / Ctrl+V copy and paste, Ctrl+D duplicates</p>';
  function tool(id, label, path) { return '<button type="button" class="bd-t" data-tool="' + id + '" title="' + label + '" aria-label="' + label + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + path + '</svg></button>'; }

  var view = $('#bdView'), world = $('#bdWorld'), links = $('#bdLinks'), props = $('#bdProps');
  var cur = 'select', sel = [], els = {};
  function setTool(t) { cur = t; wrap.querySelectorAll('.bd-t[data-tool]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.tool === t); }); view.style.cursor = t === 'select' ? '' : 'crosshair'; }

  function renderBar() {
    $('#bdSel').innerHTML = S.boards.map(function (b) { return '<option value="' + b.id + '"' + (b.id === S.cur ? ' selected' : '') + '>' + esc(b.name) + '</option>'; }).join('');
  }

  /* ---------- drawing ---------- */
  function applyView() { var v = B().view; world.style.transform = 'translate(' + v.x + 'px,' + v.y + 'px) scale(' + v.k + ')'; $('#bdZ').textContent = Math.round(v.k * 100) + '%'; view.style.backgroundSize = (24 * v.k) + 'px ' + (24 * v.k) + 'px'; view.style.backgroundPosition = v.x + 'px ' + v.y + 'px'; }
  function draw() {
    world.querySelectorAll('.bd-it').forEach(function (n) { n.remove(); }); els = {};
    var items = B().items.slice().sort(function (a, b) { return (a.type === 'frame' ? -1 : 0) - (b.type === 'frame' ? -1 : 0) || (a.z || 0) - (b.z || 0); });
    items.forEach(function (it) { if (it.type !== 'arrow') world.appendChild(make(it)); });
    drawLinks(); applyView(); showProps();
  }
  function make(it) {
    var d = document.createElement('div'); d.className = 'bd-it bd-' + it.type + (sel.indexOf(it.id) > -1 ? ' sel' : '') + (it.locked ? ' locked' : ''); d.dataset.id = it.id;
    d.style.cssText = 'left:' + it.x + 'px;top:' + it.y + 'px;width:' + it.w + 'px;height:' + it.h + 'px';
    if (it.opacity != null && it.opacity < 1) d.style.opacity = it.opacity;
    if (it.rot) d.style.transform = 'rotate(' + it.rot + 'deg)';
    if (it.type === 'note') { d.style.background = it.color; d.innerHTML = '<div class="bd-txt" style="' + textCss(it) + '">' + esc(it.text) + '</div>'; }
    else if (it.type === 'text') { d.innerHTML = '<div class="bd-txt" style="' + textCss(it, 24) + '">' + esc(it.text) + '</div>'; }
    else if (it.type === 'frame') { d.style.background = it.color || '#fff'; d.innerHTML = '<div class="bd-ft">' + esc(it.text) + '</div>'; }
    else if (it.type === 'rect') { var sh = shapeOf(it), fill = sh === 'line' ? 'none' : (it.color || '#ece6dc'), st = sh === 'line' ? (it.stroke || '#2b2622') : (it.stroke || 'none'), sw = it.sw != null ? it.sw : (sh === 'line' ? 3 : 2); d.innerHTML = '<svg class="bd-shp" viewBox="0 0 ' + it.w + ' ' + it.h + '" preserveAspectRatio="none" aria-hidden="true"><path d="' + shapePath(sh, it.w, it.h) + '" fill="' + esc(fill) + '" stroke="' + esc(st) + '" stroke-width="' + sw + '" vector-effect="non-scaling-stroke"' + (it.dash ? ' stroke-dasharray="8 6"' : '') + '/></svg><div class="bd-txt c" style="' + textCss(it) + '">' + esc(it.text || '') + '</div>'; }
    else if (it.type === 'swatch') { d.innerHTML = '<div class="bd-chip" style="background:' + esc(it.hex) + '"></div><div class="bd-sl"><b>' + esc(it.text || '') + '</b><span>' + esc((it.hex || '').toUpperCase()) + '</span>' + (it.code ? '<span class="bd-code">' + esc(it.code) + '</span>' : '') + '</div>'; }
    else if (it.type === 'image') { var im = document.createElement('img'); im.alt = it.text || 'Board image'; im.draggable = false; if (it.fit === 'contain') im.style.objectFit = 'contain'; if (it.radius) im.style.borderRadius = it.radius + 'px'; if (it.fx || it.fy) im.style.transform = 'scale(' + (it.fx ? -1 : 1) + ',' + (it.fy ? -1 : 1) + ')'; if (it.border) d.style.boxShadow = '0 0 0 ' + it.border + 'px ' + (it.bcol || '#ffffff') + ', 0 2px 8px rgba(0,0,0,.15)'; if (it.cut) d.classList.add('bd-cut'); getImg(it.src).then(function (s) { im.src = s; }); d.appendChild(im); if (it.text) { var c = document.createElement('div'); c.className = 'bd-cap'; c.textContent = it.text; d.appendChild(c); } }
    if (sel.length === 1 && sel[0] === it.id && !it.locked) { var h = document.createElement('span'); h.className = 'bd-h'; h.dataset.h = '1'; d.appendChild(h); }
    els[it.id] = d; return d;
  }
  function find(id) { var a = B().items; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function ends(it) { // arrow ends: an item's border, or a free point on the board
    var a = it.from ? find(it.from) : null, b = it.to ? find(it.to) : null;
    if ((it.from && !a) || (it.to && !b)) return null;
    var A = a || { x: it.fx, y: it.fy, w: 0, h: 0 }, Bx = b || { x: it.tx, y: it.ty, w: 0, h: 0 };
    if (A.x == null || Bx.x == null) return null;
    return [a ? edge(a, Bx) : [A.x, A.y], b ? edge(b, A) : [Bx.x, Bx.y]];
  }
  function markers() {
    var cols = {}; B().items.forEach(function (it) { if (it.type === 'arrow') cols[it.color || '#2b2622'] = 1; }); cols['#c4643f'] = 1; cols['#2b2622'] = 1;
    var defs = links.querySelector('defs'), h = '';
    Object.keys(cols).forEach(function (c) { var k = c.replace('#', ''); h += '<marker id="bdA' + k + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="' + c + '"/></marker>'; });
    defs.innerHTML = h;
  }
  function drawLinks() {
    links.querySelectorAll('path.l').forEach(function (n) { n.remove(); }); markers();
    B().items.forEach(function (it) {
      if (it.type !== 'arrow') return; var e = ends(it); if (!e) return;
      var p = e[0], q = e[1], pa = document.createElementNS('http://www.w3.org/2000/svg', 'path'), on = sel.indexOf(it.id) > -1, col = on ? '#c4643f' : (it.color || '#2b2622'), mk = 'url(#bdA' + col.replace('#', '') + ')';
      pa.setAttribute('class', 'l' + (on ? ' sel' : '')); pa.dataset.id = it.id;
      var d = 'M' + p[0] + ' ' + p[1] + 'L' + q[0] + ' ' + q[1];
      if (it.curve) { var mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, nx = -(q[1] - p[1]) * .25, ny = (q[0] - p[0]) * .25; d = 'M' + p[0] + ' ' + p[1] + 'Q' + (mx + nx) + ' ' + (my + ny) + ' ' + q[0] + ' ' + q[1]; }
      pa.setAttribute('d', d); pa.style.stroke = col; pa.style.strokeWidth = (it.sw || 2) + (on ? 1 : 0);
      if (it.dash) pa.style.strokeDasharray = '8 6';
      var hd = it.head || 'end'; if (hd === 'end' || hd === 'both') pa.setAttribute('marker-end', mk); if (hd === 'both') pa.setAttribute('marker-start', mk);
      links.appendChild(pa);
    });
    if (drag && drag.arrow && drag.ex != null) { var src = drag.arrow === '@' ? [drag.sx, drag.sy] : null, a0 = src ? null : find(drag.arrow), tgt = { x: drag.ex, y: drag.ey, w: 0, h: 0 }, p0 = src || edge(a0, tgt), pv = document.createElementNS('http://www.w3.org/2000/svg', 'path'); pv.setAttribute('class', 'l pv'); pv.setAttribute('d', 'M' + p0[0] + ' ' + p0[1] + 'L' + drag.ex + ' ' + drag.ey); pv.setAttribute('marker-end', 'url(#bdAc4643f)'); links.appendChild(pv); }
  }
  function edge(a, b) { // point on a's border towards b's centre
    var ax = a.x + a.w / 2, ay = a.y + a.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2, dx = bx - ax, dy = by - ay;
    var t = Math.min(Math.abs((a.w / 2) / (dx || 1e-9)), Math.abs((a.h / 2) / (dy || 1e-9))); return [ax + dx * t, ay + dy * t];
  }

  /* ---------- properties panel ---------- */
  function showProps() {
    if (!sel.length) { props.hidden = true; return; }
    var it = find(sel[0]); if (!it) { props.hidden = true; return; }
    var h = '<b>' + (sel.length > 1 ? sel.length + ' items' : ({ note: 'Note', text: 'Text', frame: 'Frame', rect: 'Shape', swatch: 'Swatch', image: 'Image', arrow: 'Arrow' })[it.type]) + '</b>';
    if (sel.length === 1) {
      var hasText = it.type === 'note' || it.type === 'text' || it.type === 'rect';
      if (it.type === 'rect') h += '<div class="bd-shapes">' + SHAPES.map(function (x) { return '<button type="button" data-shape="' + x[0] + '" title="' + x[1] + '" aria-label="' + x[1] + '" aria-pressed="' + (shapeOf(it) === x[0]) + '"><svg viewBox="0 0 30 22"><path d="' + shapePath(x[0], 30, 22) + '"/></svg></button>'; }).join('') + '</div>';
      if (it.type === 'note' || it.type === 'frame' || it.type === 'rect') h += '<div class="bd-cols">' + (it.type === 'frame' ? ['#ffffff', '#f4efe6', '#e8eee8', '#eef2f8', '#f8ece6'] : it.type === 'rect' ? ['#ece6dc', '#214538', '#c4643f', '#e9dcc4', '#2b2622', '#ffffff'] : NOTE).map(function (c) { return '<button type="button" data-col="' + c + '" style="background:' + c + '" aria-label="Colour ' + c + '"></button>'; }).join('') + '<label class="bd-any" title="Any colour"><input type="color" data-p="color" value="' + esc(/^#[0-9a-f]{6}$/i.test(it.color || '') ? it.color : '#ece6dc') + '" aria-label="Any colour"></label></div>';
      if (it.type === 'rect') h += '<div class="bd-2"><label>Border<input type="color" data-p="stroke" value="' + esc(/^#[0-9a-f]{6}$/i.test(it.stroke || '') ? it.stroke : '#2b2622') + '"></label><label>Width<input type="number" min="0" max="20" data-p="sw" value="' + (it.sw != null ? it.sw : (shapeOf(it) === 'line' ? 3 : (it.stroke ? 2 : 0))) + '"></label></div><div class="bd-row"><button type="button" data-tog="dash" aria-pressed="' + !!it.dash + '">Dashed border</button>' + (it.stroke ? '<button type="button" data-a="nostroke">No border</button>' : '') + '</div>';
      if (it.type === 'swatch') h += '<label>Colour<input type="color" data-p="hex" value="' + esc(it.hex) + '"></label><label>HEX code<input data-p="hexText" value="' + esc((it.hex || '').toUpperCase()) + '" maxlength="7" spellcheck="false" placeholder="#C4643F"></label><label>Name<input data-p="text" value="' + esc(it.text || '') + '"></label><label>Reference code (Pantone, lab dip…)<input data-p="code" value="' + esc(it.code || '') + '" maxlength="40" placeholder="e.g. 18-1750 TCX"></label>';
      if (hasText) {
        h += '<div class="bd-sec">Text</div><label>Font<select data-p="font">' + FONTS.map(function (f) { return '<option value="' + f[0] + '"' + ((it.font || (it.type === 'text' ? 'Source Serif 4' : 'DM Sans')) === f[0] ? ' selected' : '') + ' style="font-family:\'' + f[0] + '\'">' + f[1] + '</option>'; }).join('') + '</select></label>';
        h += '<div class="bd-2"><label>Size<input type="number" min="8" max="200" data-p="size" value="' + (it.size || (it.type === 'text' ? 24 : 17)) + '"></label><label>Colour<input type="color" data-p="ink" value="' + esc(it.ink || '#241e1a') + '"></label></div>';
        h += '<div class="bd-fmt" role="group" aria-label="Text style"><button type="button" data-tog="bold" aria-pressed="' + !!it.bold + '" title="Bold (Ctrl+B)"><b>B</b></button><button type="button" data-tog="italic" aria-pressed="' + !!it.italic + '" title="Italic (Ctrl+I)"><i>I</i></button><button type="button" data-tog="under" aria-pressed="' + !!it.under + '" title="Underline (Ctrl+U)"><u>U</u></button><button type="button" data-tog="strike" aria-pressed="' + !!it.strike + '" title="Strikethrough"><s>S</s></button><button type="button" data-tog="caps" aria-pressed="' + !!it.caps + '" title="All capitals">Aa</button>'
          + ['left', 'center', 'right'].map(function (a) { return '<button type="button" data-align="' + a + '" aria-pressed="' + ((it.align || (it.type === 'rect' ? 'center' : 'left')) === a) + '" title="Align ' + a + '"><svg viewBox="0 0 16 16"><path d="' + ({ left: 'M2 3h12M2 6.5h8M2 10h12M2 13.5h8', center: 'M2 3h12M4 6.5h8M2 10h12M4 13.5h8', right: 'M2 3h12M6 6.5h8M2 10h12M6 13.5h8' })[a] + '"/></svg></button>'; }).join('') + '</div>';
        h += '<div class="bd-2"><label>Line height<input type="number" min=".8" max="3" step=".05" data-p="lh" value="' + (it.lh || (it.type === 'text' ? 1.15 : 1.35)) + '"></label><label>Spacing<input type="number" min="-5" max="30" step=".5" data-p="ls" value="' + (it.ls || 0) + '"></label></div>';
        h += '<div class="bd-row"><button type="button" data-a="edit">Edit text</button>' + (it.type === 'text' ? '<label class="bd-inl">Highlight<input type="color" data-p="hl" value="' + esc(it.hl || '#fff3a8') + '"></label>' + (it.hl ? '<button type="button" data-a="nohl">No highlight</button>' : '') : '') + '</div>';
      }
      if (it.type === 'image') {
        h += '<label>Caption<input data-p="text" value="' + esc(it.text || '') + '"></label>';
        h += '<div class="bd-sec">Image</div><div class="bd-row"><button type="button" data-a="rmbg">' + (it.orig ? 'Remove more background' : 'Remove background') + '</button>' + (it.orig ? '<button type="button" data-a="restore">Restore original</button>' : '') + '</div>';
        h += '<label>Background tolerance <span class="bd-v">' + (it.tol || 28) + '</span><input type="range" min="5" max="90" data-p="tol" value="' + (it.tol || 28) + '"></label>';
        h += '<div class="bd-row"><button type="button" data-tog="fx" aria-pressed="' + !!it.fx + '">Flip ↔</button><button type="button" data-tog="fy" aria-pressed="' + !!it.fy + '">Flip ↕</button><button type="button" data-a="imgfit">' + (it.fit === 'contain' ? 'Fill frame' : 'Show whole image') + '</button><button type="button" data-a="replace">Replace</button><button type="button" data-a="dlimg">Download</button></div>';
        h += '<div class="bd-2"><label>Corners<input type="number" min="0" max="200" data-p="radius" value="' + (it.radius || 0) + '"></label><label>Border<input type="number" min="0" max="40" data-p="border" value="' + (it.border || 0) + '"></label></div>';
      }
      if (it.type === 'arrow') {
        h += '<div class="bd-2"><label>Colour<input type="color" data-p="color" value="' + esc(it.color || '#2b2622') + '"></label><label>Width<input type="number" min="1" max="12" data-p="sw" value="' + (it.sw || 2) + '"></label></div>';
        h += '<div class="bd-row">' + [['end', 'Arrow →'], ['both', 'Both ↔'], ['none', 'Line —']].map(function (x) { return '<button type="button" data-head="' + x[0] + '" aria-pressed="' + ((it.head || 'end') === x[0]) + '">' + x[1] + '</button>'; }).join('') + '<button type="button" data-tog="dash" aria-pressed="' + !!it.dash + '">Dashed</button><button type="button" data-tog="curve" aria-pressed="' + !!it.curve + '">Curved</button></div>';
      }
      if (it.type !== 'arrow') h += '<div class="bd-2"><label>Opacity<input type="number" min="10" max="100" step="5" data-p="opacityPct" value="' + Math.round((it.opacity != null ? it.opacity : 1) * 100) + '"></label><label>Rotate °<input type="number" min="-180" max="180" step="5" data-p="rot" value="' + (it.rot || 0) + '"></label></div>';
    }
    h += '<div class="bd-row"><button type="button" data-a="front">To front</button><button type="button" data-a="back">To back</button><button type="button" data-a="dup">Duplicate</button><button type="button" data-a="lock">' + (it.locked ? 'Unlock' : 'Lock') + '</button><button type="button" data-a="del" class="bd-del">Delete</button></div>';
    if (sel.length === 1 && (it.type === 'note' || it.type === 'text')) h += '<button type="button" data-a="tobrief" class="bd-brief">Use as a style brief →</button>';
    props.innerHTML = h; props.hidden = false;
  }
  var propSnap = 0;
  props.addEventListener('input', function (e) {
    var t = e.target, k = t.dataset.p; if (!k) return;
    if (Date.now() - propSnap > 900) snapshot(); propSnap = Date.now();
    var v = t.type === 'number' || t.type === 'range' ? +t.value : t.value;
    if (k === 'hexText') { var hx = String(t.value).trim(); if (hx[0] !== '#') hx = '#' + hx; if (!/^#[0-9a-f]{6}$/i.test(hx)) return; k = 'hex'; v = hx.toLowerCase(); }
    if (k === 'opacityPct') { k = 'opacity'; v = Math.max(.1, Math.min(1, v / 100)); }
    if (k === 'tol') { var sp = t.parentNode.querySelector('.bd-v'); if (sp) sp.textContent = v; }
    sel.forEach(function (id) { var it = find(id); if (it) it[k] = v; });
    if (k === 'hex') { var o = props.querySelector('[data-p=hex]'), o2 = props.querySelector('[data-p=hexText]'); if (o && o !== t) o.value = v; if (o2 && o2 !== t) o2.value = v.toUpperCase(); }
    save(false); redrawItems();
  });
  function redrawItems() { world.querySelectorAll('.bd-it').forEach(function (n) { n.remove(); }); els = {}; B().items.slice().sort(function (a, b) { return (a.type === 'frame' ? -1 : 0) - (b.type === 'frame' ? -1 : 0) || (a.z || 0) - (b.z || 0); }).forEach(function (it) { if (it.type !== 'arrow') world.appendChild(make(it)); }); drawLinks(); }
  props.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    function each(f) { snapshot(); sel.forEach(function (id) { var it = find(id); if (it) f(it); }); save(false); draw(); }
    if (b.dataset.col) return each(function (it) { it.color = b.dataset.col; });
    if (b.dataset.tog) return each(function (it) { it[b.dataset.tog] = !it[b.dataset.tog]; });
    if (b.dataset.align) return each(function (it) { it.align = b.dataset.align; });
    if (b.dataset.head) return each(function (it) { it.head = b.dataset.head; });
    if (b.dataset.shape) return each(function (it) { if (it.type === 'rect') { it.shape = b.dataset.shape; delete it.round; } });
    act(b.dataset.a);
  });

  /* ---------- actions ---------- */
  function maxZ() { return B().items.reduce(function (m, i) { return Math.max(m, i.z || 0); }, 0); }
  function center() { var v = B().view, r = view.getBoundingClientRect(); return [(r.width / 2 - v.x) / v.k, (r.height / 2 - v.y) / v.k]; }
  function add(it) { snapshot(); it.z = maxZ() + 1; B().items.push(it); sel = [it.id]; save(false); draw(); return it; }
  function act(a) {
    var bd = B(), items = bd.items;
    if (a === 'del') { snapshot(); bd.items = items.filter(function (i) { return sel.indexOf(i.id) < 0 && sel.indexOf(i.from) < 0 && sel.indexOf(i.to) < 0; }); sel = []; save(false); draw(); }
    if (a === 'dup') { snapshot(); var nu = []; sel.forEach(function (id) { var it = find(id); if (!it || it.type === 'arrow') return; var c = JSON.parse(JSON.stringify(it)); c.id = uid(); c.x += 24; c.y += 24; c.z = maxZ() + 1; items.push(c); nu.push(c.id); }); sel = nu; save(false); draw(); }
    if (a === 'front') { snapshot(); sel.forEach(function (id) { var it = find(id); if (it) it.z = maxZ() + 1; }); save(false); draw(); }
    if (a === 'back') { snapshot(); var mn = items.reduce(function (m, i) { return Math.min(m, i.z || 0); }, 0); sel.forEach(function (id) { var it = find(id); if (it) it.z = mn - 1; }); save(false); draw(); }
    if (a === 'lock') { snapshot(); var it0 = find(sel[0]), v = !(it0 && it0.locked); sel.forEach(function (id) { var it = find(id); if (it) it.locked = v; }); save(false); draw(); }
    if (a === 'round') { snapshot(); var r = find(sel[0]); r.round = !r.round; save(false); draw(); }
    var one = sel.length === 1 ? find(sel[0]) : null;
    if (a === 'edit' && one) editText(one.id);
    if (a === 'nostroke' && one) { snapshot(); one.stroke = ''; one.sw = 0; save(false); draw(); }
    if (a === 'nohl' && one) { snapshot(); delete one.hl; save(false); draw(); }
    if (a === 'imgfit' && one) { snapshot(); one.fit = one.fit === 'contain' ? '' : 'contain'; save(false); draw(); }
    if (a === 'rmbg' && one && one.type === 'image') removeBg(one);
    if (a === 'restore' && one && one.orig) { snapshot(); one.src = one.orig; delete one.orig; delete one.cut; save(false); draw(); status('Original image restored.'); }
    if (a === 'replace' && one && one.type === 'image') $('#bdRepl').click();
    if (a === 'dlimg' && one && one.type === 'image') getImg(one.src).then(function (src) { var l = document.createElement('a'); l.href = src; l.download = (one.text || 'board-image').replace(/[^\w-]+/g, '-').toLowerCase() + (/^data:image\/png/.test(src) ? '.png' : '.jpg'); l.click(); });
    if (a === 'copy') copySel();
    if (a === 'cut') { copySel(); act('del'); }
    if (a === 'paste') pasteClip();
    if (a === 'selall') { sel = B().items.map(function (i) { return i.id; }); draw(); }
    if (a === 'import') importPlanner();
    if (a === 'shapes') showFly();
    if (a === 'undo' && undo.length) { redo.push(JSON.stringify(bd.items)); bd.items = JSON.parse(undo.pop()); sel = []; save(false); draw(); }
    if (a === 'redo' && redo.length) { undo.push(JSON.stringify(bd.items)); bd.items = JSON.parse(redo.pop()); sel = []; save(false); draw(); }
    if (a === 'zin' || a === 'zout') zoomAt(a === 'zin' ? 1.2 : 1 / 1.2);
    if (a === 'fit') fit();
    if (a === 'newboard') pickTemplate();
    if (a === 'rename') { var n = prompt('Board name', bd.name); if (n) { bd.name = n.slice(0, 80); save(false); renderBar(); } }
    if (a === 'delboard') { if (S.boards.length < 2) return status('Keep at least one board.'); if (confirm('Delete "' + bd.name + '"? This cannot be undone.')) { S.boards = S.boards.filter(function (x) { return x.id !== bd.id; }); S.cur = S.boards[0].id; undo = []; redo = []; sel = []; save(false); renderBar(); draw(); } }
    if (a === 'full') { var on = wrap.classList.toggle('bd-full'); document.body.style.overflow = on ? 'hidden' : ''; var fb = wrap.querySelector('[data-a=full]'); if (fb) fb.textContent = on ? 'Exit full screen' : 'Full screen'; setTimeout(applyView, 30); }
    if (a === 'png') exportPNG();
    if (a === 'json') exportJSON();
    if (a === 'load') $('#bdFile').click();
    if (a === 'tobrief') { var t = find(sel[0]); S.mode = 'brief'; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} location.href = 'trend-to-style.html?detail=' + encodeURIComponent((t.text || '').split('\n')[0].slice(0, 120)); }
  }
  function pickTemplate() {
    var d = document.createElement('div'); d.className = 'bd-pick'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Choose a board');
    d.innerHTML = '<div class="bd-pick-card"><h3>Start a new board</h3><div class="bd-pick-grid">' + Object.keys(TEMPLATES).map(function (k) { return '<button type="button" data-t="' + k + '"><b>' + TEMPLATES[k].name + '</b><span>' + ({ collection: 'Theme, colour, fabrics, key styles, accessories and price points', mood: 'One big space for images, colour and words', accessories: 'Bags, footwear, jewellery, belts, headwear and trims', lineup: 'Looks in shop order, left to right', blank: 'An empty canvas' })[k] + '</span></button>'; }).join('') + '</div><button type="button" class="bd-pick-x" data-t="">Cancel</button></div>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; if (b.dataset.t) { var nb = newBoard(b.dataset.t); S.boards.push(nb); S.cur = nb.id; undo = []; redo = []; sel = []; save(false); renderBar(); draw(); setTimeout(fit, 30); } d.remove(); });
  }
  /* ---------- text editing ---------- */
  function editText(id) {
    var it = find(id), el = els[id]; if (!it || !el || it.locked || it.type === 'image' || it.type === 'swatch' || it.type === 'arrow') return;
    var tx = el.querySelector('.bd-txt, .bd-ft'); if (!tx) return;
    snapshot(); tx.contentEditable = 'true'; tx.focus(); var rg = document.createRange(); rg.selectNodeContents(tx); var s = getSelection(); s.removeAllRanges(); s.addRange(rg);
    tx.addEventListener('blur', function () { tx.contentEditable = 'false'; it.text = tx.innerText.replace(/\n$/, ''); save(false); }, { once: true });
  }
  /* ---------- copy / paste ---------- */
  var CLIPMARK = '[forecut board items]';
  function copySel() { var a = sel.map(find).filter(function (i) { return i && i.type !== 'arrow'; }); if (!a.length) return; clip = JSON.parse(JSON.stringify(a)); try { navigator.clipboard.writeText(CLIPMARK).catch(function () {}); } catch (e) {} status(a.length + (a.length > 1 ? ' items' : ' item') + ' copied.'); }
  function pasteClip(at) {
    if (!clip || !clip.length) return status('Nothing copied yet.');
    snapshot(); var x0 = Math.min.apply(null, clip.map(function (i) { return i.x; })), y0 = Math.min.apply(null, clip.map(function (i) { return i.y; })), c = at || [x0 + 30, y0 + 30], z = maxZ(), nu = [];
    clip.forEach(function (i) { var n = JSON.parse(JSON.stringify(i)); n.id = uid(); n.x = Math.round(c[0] + i.x - x0); n.y = Math.round(c[1] + i.y - y0); n.z = ++z; B().items.push(n); nu.push(n.id); });
    sel = nu; save(false); draw();
  }
  /* ---------- shapes flyout ---------- */
  var fly = $('#bdFly');
  function showFly() {
    var tb = wrap.querySelector('.bd-t[data-tool=rect]'), r = tb.getBoundingClientRect(), sr = wrap.querySelector('.bd-stage').getBoundingClientRect();
    fly.innerHTML = '<b>Shapes</b><div class="bd-shapes">' + SHAPES.map(function (x) { return '<button type="button" data-fshape="' + x[0] + '" title="' + x[1] + '" aria-label="' + x[1] + '" aria-pressed="' + (pendingShape === x[0]) + '"><svg viewBox="0 0 30 22"><path d="' + shapePath(x[0], 30, 22) + '"/></svg></button>'; }).join('') + '</div><small>Pick a shape, then click on the board.</small>';
    fly.style.left = (r.right - sr.left + 8) + 'px'; fly.style.top = Math.max(8, r.top - sr.top - 40) + 'px'; fly.hidden = false;
  }
  fly.addEventListener('click', function (e) { var b = e.target.closest('[data-fshape]'); if (!b) return; pendingShape = b.dataset.fshape; fly.hidden = true; setTool('rect'); });
  /* ---------- right-click menu ---------- */
  var menu = $('#bdMenu'), menuAt = null;
  function closeMenu() { menu.hidden = true; }
  view.addEventListener('contextmenu', function (e) {
    e.preventDefault(); var at = document.elementFromPoint(e.clientX, e.clientY), itEl = at && at.closest('.bd-it'), ln = at && at.closest('path.l'), id = itEl ? itEl.dataset.id : ln ? ln.dataset.id : null;
    menuAt = toWorld(e.clientX, e.clientY);
    if (id && sel.indexOf(id) < 0) { sel = [id]; draw(); }
    if (!id) { sel = []; draw(); }
    var it = id ? find(id) : null, rows = [];
    if (it) {
      if (/note|text|rect|frame/.test(it.type)) rows.push(['edit', 'Edit text', 'Enter']);
      if (it.type === 'image') { rows.push(['rmbg', it.orig ? 'Remove more background' : 'Remove background']); if (it.orig) rows.push(['restore', 'Restore original']); rows.push(['flipx', 'Flip horizontal'], ['replace', 'Replace image…'], ['dlimg', 'Download image']); }
      rows.push('-', ['cut', 'Cut', 'Ctrl+X'], ['copy', 'Copy', 'Ctrl+C'], ['paste', 'Paste', 'Ctrl+V'], ['dup', 'Duplicate', 'Ctrl+D'], '-', ['front', 'Bring to front'], ['back', 'Send to back'], ['lock', it.locked ? 'Unlock' : 'Lock'], '-');
      if (it.type === 'note' || it.type === 'text') rows.push(['tobrief', 'Use as a style brief →']);
      rows.push(['del', 'Delete', 'Del']);
    } else {
      rows.push(['paste', 'Paste here', 'Ctrl+V'], ['addnote', 'Add a sticky note here'], ['addtext', 'Add text here'], ['addimg', 'Add an image…'], '-', ['selall', 'Select all', 'Ctrl+A'], ['fit', 'Fit board to screen'], ['import', 'Import from Collection Planner']);
    }
    menu.innerHTML = rows.map(function (r) { return r === '-' ? '<hr>' : '<button type="button" role="menuitem" data-m="' + r[0] + '"' + (r[0] === 'del' ? ' class="bd-del"' : '') + (r[0] === 'paste' && !clip ? ' disabled' : '') + '><span>' + r[1] + '</span>' + (r[2] ? '<kbd>' + r[2] + '</kbd>' : '') + '</button>'; }).join('');
    var sr = wrap.querySelector('.bd-stage').getBoundingClientRect(); menu.hidden = false;
    var mw = menu.offsetWidth, mh = menu.offsetHeight; menu.style.left = Math.min(e.clientX - sr.left, sr.width - mw - 6) + 'px'; menu.style.top = Math.min(e.clientY - sr.top, sr.height - mh - 6) + 'px';
  });
  menu.addEventListener('click', function (e) {
    var b = e.target.closest('[data-m]'); if (!b) return; var m = b.dataset.m; closeMenu();
    if (m === 'flipx') { var one = find(sel[0]); if (one) { snapshot(); one.fx = !one.fx; save(false); draw(); } return; }
    if (m === 'paste') return pasteClip(sel.length ? null : menuAt);
    if (m === 'addnote') return add(note(menuAt[0] - 100, menuAt[1] - 75, 'New note', NOTE[0]));
    if (m === 'addtext') { add(text(menuAt[0], menuAt[1] - 20, 'Text', 28)); return editText(sel[0]); }
    if (m === 'addimg') return $('#bdImg').click();
    act(m);
  });
  document.addEventListener('pointerdown', function (e) { if (!menu.hidden && !e.target.closest('#bdMenu')) closeMenu(); if (!fly.hidden && !e.target.closest('#bdFly') && !e.target.closest('.bd-t[data-tool=rect]')) fly.hidden = true; }, true);
  /* ---------- images: remove a plain background ---------- */
  function removeBg(it) {
    status('Removing the background…');
    getImg(it.orig || it.src).then(function (src) {
      var im = new Image(); im.onload = function () {
        var w = im.naturalWidth, h = im.naturalHeight, c = document.createElement('canvas'); c.width = w; c.height = h; var g = c.getContext('2d'); g.drawImage(im, 0, 0);
        var D = g.getImageData(0, 0, w, h), px = D.data, tol = it.tol || 28, seen = new Uint8Array(w * h), q = new Int32Array(w * h), qn = 0, i, x, y;
        // background colour: the most common colour along the border
        var bins = {}, best = null, bestN = 0; function key(k) { return (px[k] >> 4) + ',' + (px[k + 1] >> 4) + ',' + (px[k + 2] >> 4); }
        for (x = 0; x < w; x++) { [x, x + (h - 1) * w].forEach(function (p) { var k = key(p * 4); bins[k] = (bins[k] || 0) + 1; }); }
        for (y = 0; y < h; y++) { [y * w, y * w + w - 1].forEach(function (p) { var k = key(p * 4); bins[k] = (bins[k] || 0) + 1; }); }
        Object.keys(bins).forEach(function (k) { if (bins[k] > bestN) { bestN = bins[k]; best = k; } });
        var br = 0, bg = 0, bb = 0, bn = 0; for (i = 0; i < w * h; i++) { if ((x = i % w) && x < w - 1 && (y = (i / w) | 0) && y < h - 1) continue; if (key(i * 4) === best) { br += px[i * 4]; bg += px[i * 4 + 1]; bb += px[i * 4 + 2]; bn++; } }
        br /= bn; bg /= bn; bb /= bn;
        function near(p) { var k = p * 4; if (px[k + 3] < 10) return true; var dr = px[k] - br, dg = px[k + 1] - bg, db = px[k + 2] - bb; return Math.sqrt(dr * dr + dg * dg + db * db) <= tol * 1.6; }
        for (x = 0; x < w; x++) { q[qn++] = x; q[qn++] = x + (h - 1) * w; } for (y = 0; y < h; y++) { q[qn++] = y * w; q[qn++] = y * w + w - 1; }
        var head = 0; while (head < qn) { var p = q[head++]; if (seen[p] || !near(p)) continue; seen[p] = 1; x = p % w; y = (p / w) | 0; if (x > 0) q[qn++] = p - 1; if (x < w - 1) q[qn++] = p + 1; if (y > 0) q[qn++] = p - w; if (y < h - 1) q[qn++] = p + w; if (qn > q.length - 8) { q.copyWithin(0, head, qn); qn -= head; head = 0; } }
        var removed = 0; for (i = 0; i < w * h; i++) if (seen[i]) { px[i * 4 + 3] = 0; removed++; }
        // soften the cut edge: half-transparent ring next to removed pixels
        for (i = 0; i < w * h; i++) if (!seen[i]) { x = i % w; y = (i / w) | 0; if ((x > 0 && seen[i - 1]) || (x < w - 1 && seen[i + 1]) || (y > 0 && seen[i - w]) || (y < h - 1 && seen[i + w])) px[i * 4 + 3] = Math.min(px[i * 4 + 3], 170); }
        if (removed < w * h * .02) { status('No plain background found. Try a higher tolerance, or use a photo on a plain backdrop.'); return; }
        g.putImageData(D, 0, 0); var out = c.toDataURL('image/png'), nid = uid();
        imgCache[nid] = out; putImg(nid, out).then(function () { snapshot(); if (!it.orig) it.orig = it.src; it.src = nid; it.cut = true; save(false); draw(); status('Background removed (' + Math.round(removed / (w * h) * 100) + '% of the image). Adjust the tolerance and run it again, or restore the original.'); });
      };
      im.onerror = function () { status('That image could not be read.'); }; im.src = src;
    });
  }
  $('#bdRepl').addEventListener('change', function (e) { var f = e.target.files[0], one = find(sel[0]); e.target.value = ''; if (!f || !one) return; shrink(f).then(function (r) { var id = uid(); imgCache[id] = r.src; return putImg(id, r.src).then(function () { snapshot(); one.src = id; delete one.orig; delete one.cut; one.h = Math.round(one.w * r.h / r.w); save(false); draw(); }); }); });
  /* ---------- import from Collection Planner ---------- */
  function importPlanner() {
    var C = null; try { C = JSON.parse(localStorage.getItem('fc-collection-workspace-v1') || 'null'); } catch (e) { C = null; }
    if (!C || ((!C.styles || !C.styles.length) && (!C.palette || !C.palette.length))) { status('Nothing to import yet: add styles in Collection Planner first.'); if (confirm('Your Collection Planner has no styles yet. Open Collection Planner now?')) location.href = 'rangeboard.html'; return; }
    var items = B().items.filter(function (i) { return i.type !== 'arrow'; }), x0 = items.length ? Math.max.apply(null, items.map(function (i) { return i.x + i.w; })) + 160 : 0, y0 = items.length ? Math.min.apply(null, items.map(function (i) { return i.y; })) : 0;
    var st = C.styles || [], pal = C.palette || [], cols = Math.min(5, Math.max(1, st.length)), cw = 250, chH = 420, rows = Math.ceil(st.length / cols), W = Math.max(cols * cw + 60, 900), out = [];
    snapshot();
    out.push(text(x0, y0 - 110, (C.name || 'Collection') + (C.range && C.range.season ? ' · ' + C.range.season : '') + (C.range && C.range.market ? ' · ' + C.range.market : ''), 40));
    if (st.length) out.push(frame(x0, y0, W, rows * chH + 70, 'Collection plan: ' + st.length + ' styles'));
    st.forEach(function (s, i) {
      var cx = x0 + 30 + (i % cols) * cw, cy = y0 + 54 + Math.floor(i / cols) * chH;
      if (s.img) out.push({ id: uid(), type: 'image', x: cx, y: cy, w: 210, h: 230, src: s.img, text: '', fit: 'contain' });
      else out.push({ id: uid(), type: 'rect', shape: 'round', x: cx, y: cy, w: 210, h: 230, color: '#ece6dc', text: 'Add an image in Collection Planner', size: 13, ink: '#6a6157' });
      var lines = [s.name || 'Style', [s.category, s.tier, s.stage].filter(Boolean).join(' · '), (s.colours || 1) + ' colours × ' + (s.sizes || 1) + ' sizes · ' + ((s.colours || 1) * (s.sizes || 1) * (s.perSku || 0)) + ' units', s.price ? 'MRP ₹' + Number(s.price).toLocaleString('en-IN') : '', s.drop ? 'Drop: ' + s.drop : '', s.ref ? 'Ref: ' + s.ref : ''].filter(Boolean);
      out.push({ id: uid(), type: 'note', x: cx, y: cy + 240, w: 210, h: 150, text: lines.join('\n'), color: '#ffffff', size: 13 });
    });
    if (pal.length) {
      var py = y0 + (st.length ? rows * chH + 120 : 0), pw = Math.max(W, Math.min(8, pal.length) * 130 + 60);
      out.push(frame(x0, py, pw, Math.ceil(pal.length / 8) * 170 + 60, 'Collection palette'));
      pal.forEach(function (c, i) { out.push({ id: uid(), type: 'swatch', x: x0 + 30 + (i % 8) * 130, y: py + 50 + Math.floor(i / 8) * 170, w: 110, h: 140, hex: c.hex, text: c.name, code: c.pantoneCode ? c.pantoneCode + ' ' + (c.pantoneSystem || 'TCX') : '' }); });
    }
    var z = maxZ(); out.forEach(function (o) { o.z = ++z; B().items.push(o); });
    sel = []; save(false); draw(); setTimeout(fit, 30); status('Imported ' + st.length + ' styles' + (pal.length ? ' and ' + pal.length + ' colours' : '') + ' from Collection Planner.');
  }
  $('#bdSel').addEventListener('change', function (e) { S.cur = e.target.value; undo = []; redo = []; sel = []; save(false); draw(); });
  wrap.querySelector('.bd-top').addEventListener('click', function (e) { var b = e.target.closest('button[data-a]'); if (b) act(b.dataset.a); });
  wrap.querySelector('.bd-zoom').addEventListener('click', function (e) { var b = e.target.closest('button[data-a]'); if (b) act(b.dataset.a); });
  wrap.querySelector('.bd-tools').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-tool]'); if (!b) return; var t = b.dataset.tool;
    if (t === 'undo' || t === 'redo') return act(t);
    if (t === 'image') return $('#bdImg').click();
    if (t === 'rect') { setTool('rect'); return showFly(); }
    setTool(t);
  });
  $('#bdImg').addEventListener('change', function (e) { var c = center(); addFiles(e.target.files, c[0], c[1]); e.target.value = ''; });
  function addFiles(files, x, y) {
    Array.prototype.forEach.call(files || [], function (f, i) {
      if (!/^image\//.test(f.type)) return;
      shrink(f).then(function (r) { var id = uid(); imgCache[id] = r.src; return putImg(id, r.src).then(function () { var w = Math.min(360, r.w), h = w * r.h / r.w; add({ id: uid(), type: 'image', x: x + i * 30 - w / 2, y: y + i * 30 - h / 2, w: w, h: h, src: id, text: '' }); }); }).catch(function () { status('That image could not be added.'); });
    });
  }

  /* ---------- pointer: pan, zoom, select, move, resize, create ---------- */
  function toWorld(cx, cy) { var r = view.getBoundingClientRect(), v = B().view; return [(cx - r.left - v.x) / v.k, (cy - r.top - v.y) / v.k]; }
  function zoomAt(f, cx, cy) { var v = B().view, r = view.getBoundingClientRect(); if (cx == null) { cx = r.left + r.width / 2; cy = r.top + r.height / 2; } var px = cx - r.left, py = cy - r.top, k = Math.max(0.1, Math.min(4, v.k * f)); v.x = px - (px - v.x) * k / v.k; v.y = py - (py - v.y) * k / v.k; v.k = k; applyView(); save(false); }
  function fit() { var a = B().items.filter(function (i) { return i.type !== 'arrow'; }); if (!a.length) return; var x0 = Math.min.apply(null, a.map(function (i) { return i.x; })), y0 = Math.min.apply(null, a.map(function (i) { return i.y; })), x1 = Math.max.apply(null, a.map(function (i) { return i.x + i.w; })), y1 = Math.max.apply(null, a.map(function (i) { return i.y + i.h; })); var r = view.getBoundingClientRect(), k = Math.min(2, Math.min((r.width - 60) / (x1 - x0), (r.height - 60) / (y1 - y0))), v = B().view; v.k = k; v.x = (r.width - (x1 - x0) * k) / 2 - x0 * k; v.y = (r.height - (y1 - y0) * k) / 2 - y0 * k; applyView(); save(false); }
  view.addEventListener('wheel', function (e) { e.preventDefault(); if (e.ctrlKey || e.metaKey) zoomAt(Math.exp(-e.deltaY * 0.0022), e.clientX, e.clientY); else { var v = B().view; v.x -= e.deltaX; v.y -= e.deltaY; applyView(); save(false); } }, { passive: false });
  var drag = null, pts = {}, lastDown = null;
  view.addEventListener('pointerdown', function (e) {
    if (e.target.closest('.bd-txt[contenteditable=true]')) return;
    if (e.button === 2) return; // right-click opens the menu instead
    pts[e.pointerId] = [e.clientX, e.clientY];
    if (Object.keys(pts).length === 2) { var p = Object.values(pts); drag = { pinch: Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]) }; return; }
    view.focus({ preventScroll: true });
    var w = toWorld(e.clientX, e.clientY), itEl = e.target.closest('.bd-it'), id = itEl && itEl.dataset.id, ln = e.target.closest('path.l');
    if (cur !== 'select' && cur !== 'arrow') { // create
      var c = { note: function () { return note(w[0] - 100, w[1] - 75, 'New note', NOTE[0]); }, text: function () { return text(w[0], w[1] - 20, 'Text', 28); }, frame: function () { return frame(w[0], w[1], 480, 360, 'Section'); }, rect: function () { var sq = /ellipse|star|hexagon|diamond|triangle/.test(pendingShape), ln = pendingShape === 'line'; return { id: uid(), type: 'rect', shape: pendingShape, x: w[0] - 80, y: w[1] - (ln ? 10 : sq ? 80 : 50), w: 160, h: ln ? 20 : sq ? 160 : 100, color: '#ece6dc', text: '' }; }, swatch: function () { return { id: uid(), type: 'swatch', x: w[0] - 55, y: w[1] - 70, w: 110, h: 140, hex: '#c4643f', text: 'Colour' }; } }[cur];
      if (c) { add(c()); setTool('select'); fly.hidden = true; if (find(sel[0]) && find(sel[0]).type === 'text') { var nid = sel[0]; setTimeout(function () { editText(nid); }, 30); } } return;
    }
    if (cur === 'arrow') { drag = { arrow: id || '@', sx: w[0], sy: w[1] }; view.setPointerCapture(e.pointerId); return; }
    if (ln) { sel = [ln.dataset.id]; draw(); return; }
    if (e.target.dataset.h && id) { var it = find(id); snapshot(); drag = { resize: it, sx: w[0], sy: w[1], w: it.w, h: it.h, ratio: it.type === 'image' ? it.h / it.w : 0 }; view.setPointerCapture(e.pointerId); return; }
    if (id) {
      // our own double-click: the browser's dblclick is lost when the board redraws under the pointer
      var nowT = Date.now(); if (lastDown && lastDown.id === id && nowT - lastDown.t < 450 && Math.hypot(e.clientX - lastDown.x, e.clientY - lastDown.y) < 6 && !e.shiftKey) { lastDown = null; setTimeout(function () { editText(id); }, 0); return; }
      lastDown = { id: id, t: nowT, x: e.clientX, y: e.clientY };
      var already = sel.length === 1 && sel[0] === id;
      if (e.shiftKey) { sel = sel.indexOf(id) > -1 ? sel.filter(function (s) { return s !== id; }) : sel.concat([id]); }
      else if (sel.indexOf(id) < 0) sel = [id];
      var movers = sel.map(find).filter(function (i) { return i && !i.locked; });
      movers.slice().forEach(function (m) { if (m.type === 'frame') B().items.forEach(function (o) { if (o !== m && o.type !== 'arrow' && o.type !== 'frame' && movers.indexOf(o) < 0 && !o.locked && o.x >= m.x && o.y >= m.y && o.x + o.w <= m.x + m.w && o.y + o.h <= m.y + m.h) movers.push(o); }); });
      snapshot(); drag = { move: movers.map(function (m) { return [m, m.x, m.y]; }), sx: w[0], sy: w[1], moved: false };
      view.setPointerCapture(e.pointerId); if (!already) draw(); return;
    }
    if (e.shiftKey || e.button === 0 && e.altKey) { drag = { mq: true, sx: w[0], sy: w[1], cx: e.clientX, cy: e.clientY }; return; }
    sel = []; draw(); var v = B().view; drag = { pan: true, sx: e.clientX, sy: e.clientY, vx: v.x, vy: v.y }; view.setPointerCapture(e.pointerId);
  });
  view.addEventListener('pointermove', function (e) {
    if (pts[e.pointerId]) pts[e.pointerId] = [e.clientX, e.clientY];
    if (!drag) return;
    if (drag.pinch) { var p = Object.values(pts); if (p.length === 2) { var d = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); zoomAt(d / drag.pinch, (p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2); drag.pinch = d; } return; }
    var w = toWorld(e.clientX, e.clientY);
    if (drag.pan) { var v = B().view; v.x = drag.vx + e.clientX - drag.sx; v.y = drag.vy + e.clientY - drag.sy; applyView(); return; }
    if (drag.move) { var dx = w[0] - drag.sx, dy = w[1] - drag.sy; if (Math.abs(dx) + Math.abs(dy) > 1) drag.moved = true; drag.move.forEach(function (m) { m[0].x = Math.round(m[1] + dx); m[0].y = Math.round(m[2] + dy); var el = els[m[0].id]; if (el) { el.style.left = m[0].x + 'px'; el.style.top = m[0].y + 'px'; } }); drawLinks(); return; }
    if (drag.resize) { var it = drag.resize; it.w = Math.max(40, Math.round(drag.w + w[0] - drag.sx)); it.h = drag.ratio ? Math.round(it.w * drag.ratio) : Math.max(30, Math.round(drag.h + w[1] - drag.sy)); var el2 = els[it.id]; if (el2) { el2.style.width = it.w + 'px'; el2.style.height = it.h + 'px'; } drawLinks(); return; }
    if (drag.mq) { var mq = $('#bdMq'), r = view.getBoundingClientRect(); mq.hidden = false; mq.style.cssText = 'left:' + (Math.min(drag.cx, e.clientX) - r.left) + 'px;top:' + (Math.min(drag.cy, e.clientY) - r.top) + 'px;width:' + Math.abs(e.clientX - drag.cx) + 'px;height:' + Math.abs(e.clientY - drag.cy) + 'px'; drag.ex = w[0]; drag.ey = w[1]; return; }
    if (drag.arrow) { drag.ex = w[0]; drag.ey = w[1]; drawLinks(); }
  });
  function end(e) {
    delete pts[e.pointerId];
    if (!drag) return;
    if (drag.pan) save(false);
    if (drag.move) { if (drag.moved) { save(false); draw(); } else undo.pop(); }
    if (drag.resize) { save(false); draw(); }
    if (drag.mq) { $('#bdMq').hidden = true; if (drag.ex != null) { var x0 = Math.min(drag.sx, drag.ex), x1 = Math.max(drag.sx, drag.ex), y0 = Math.min(drag.sy, drag.ey), y1 = Math.max(drag.sy, drag.ey); sel = B().items.filter(function (i) { return i.type !== 'arrow' && i.x >= x0 && i.y >= y0 && i.x + i.w <= x1 && i.y + i.h <= y1; }).map(function (i) { return i.id; }); draw(); } }
    if (drag.arrow) {
      var dg = drag; drag = null; var t = document.elementFromPoint(e.clientX, e.clientY); t = t && t.closest('.bd-it');
      var ew = toWorld(e.clientX, e.clientY), far = Math.hypot(ew[0] - dg.sx, ew[1] - dg.sy) > 12;
      if (t && t.dataset.id !== dg.arrow || (!t && far) || (t && t.dataset.id === dg.arrow && false)) {
        var ar = { id: uid(), type: 'arrow' };
        if (dg.arrow === '@') { ar.fx = Math.round(dg.sx); ar.fy = Math.round(dg.sy); } else ar.from = dg.arrow;
        if (t && t.dataset.id !== dg.arrow) ar.to = t.dataset.id; else { ar.tx = Math.round(ew[0]); ar.ty = Math.round(ew[1]); }
        if (ar.from || ar.to || far) add(ar);
      } else drawLinks();
      setTool('select'); return;
    }
    drag = null;
  }
  view.addEventListener('pointerup', end); view.addEventListener('pointercancel', end);
  view.addEventListener('dblclick', function (e) {
    // the first click redraws the board, so find the item under the pointer now rather than trusting e.target
    var at = document.elementFromPoint(e.clientX, e.clientY), itEl = at && at.closest('.bd-it');
    if (at && at.closest('.bd-txt[contenteditable=true]')) return;
    if (!itEl) { if (at && at.closest('.bd-tools, .bd-zoom, .bd-props, .bd-menu, .bd-fly')) return; var w = toWorld(e.clientX, e.clientY); add(note(w[0] - 100, w[1] - 75, '', NOTE[0])); var nn = sel[0]; return setTimeout(function () { editText(nn); }, 0); }
    if (els[itEl.dataset.id] && !els[itEl.dataset.id].querySelector('[contenteditable=true]')) { var eid = itEl.dataset.id; setTimeout(function () { editText(eid); }, 0); }
  });
  // keyboard
  view.addEventListener('keydown', function (e) {
    if (e.target.isContentEditable) { if (e.key === 'Escape') e.target.blur(); return; }
    var k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (mod && k === 'z') { e.preventDefault(); act(e.shiftKey ? 'redo' : 'undo'); return; }
    if (mod && k === 'y') { e.preventDefault(); act('redo'); return; }
    if (mod && k === 'd') { e.preventDefault(); act('dup'); return; }
    if (mod && k === 'c' && sel.length) { e.preventDefault(); copySel(); return; }
    if (mod && k === 'x' && sel.length) { e.preventDefault(); copySel(); act('del'); return; }
    if (mod && (k === 'b' || k === 'i' || k === 'u') && sel.length) { e.preventDefault(); var pr = { b: 'bold', i: 'italic', u: 'under' }[k]; snapshot(); sel.forEach(function (id) { var it = find(id); if (it && /note|text|rect/.test(it.type)) it[pr] = !it[pr]; }); save(false); draw(); return; }
    if (k === 'enter' && sel.length === 1) { e.preventDefault(); editText(sel[0]); return; }
    if (mod && k === 'a') { e.preventDefault(); sel = B().items.map(function (i) { return i.id; }); draw(); return; }
    if ((k === 'delete' || k === 'backspace') && sel.length) { e.preventDefault(); act('del'); return; }
    if (!mod && ({ v: 'select', n: 'note', t: 'text', c: 'swatch', f: 'frame', r: 'rect', a: 'arrow' })[k]) { setTool(({ v: 'select', n: 'note', t: 'text', c: 'swatch', f: 'frame', r: 'rect', a: 'arrow' })[k]); return; }
    if (!mod && k === 'i') { $('#bdImg').click(); return; }
    if (k.indexOf('arrow') === 0 && sel.length) { e.preventDefault(); snapshot(); var st = e.shiftKey ? 10 : 1; sel.forEach(function (id) { var it = find(id); if (!it || it.locked) return; if (k === 'arrowleft') it.x -= st; if (k === 'arrowright') it.x += st; if (k === 'arrowup') it.y -= st; if (k === 'arrowdown') it.y += st; }); save(false); draw(); }
    if (k === 'escape') { sel = []; setTool('select'); closeMenu(); fly.hidden = true; draw(); }
  });
  // paste and drop images
  document.addEventListener('paste', function (e) { if (wrap.hidden || e.target.isContentEditable || /input|textarea/i.test(e.target.tagName)) return; var fs = []; Array.prototype.forEach.call(e.clipboardData.items || [], function (it) { if (it.kind === 'file') fs.push(it.getAsFile()); }); if (fs.length) { e.preventDefault(); var c = center(); addFiles(fs, c[0], c[1]); } else { var t = e.clipboardData.getData('text'); if (clip && (!t || t === CLIPMARK)) { e.preventDefault(); pasteClip(); return; } if (t) { var c2 = center(); add(note(c2[0] - 100, c2[1] - 75, t.slice(0, 600))); } } });
  view.addEventListener('dragover', function (e) { e.preventDefault(); });
  view.addEventListener('drop', function (e) { e.preventDefault(); var w = toWorld(e.clientX, e.clientY); addFiles(e.dataTransfer.files, w[0], w[1]); });

  /* ---------- export ---------- */
  function exportPNG() {
    var a = B().items.filter(function (i) { return i.type !== 'arrow'; }); if (!a.length) return status('The board is empty.');
    var x0 = Math.min.apply(null, a.map(function (i) { return i.x; })) - 40, y0 = Math.min.apply(null, a.map(function (i) { return i.y; })) - 40, x1 = Math.max.apply(null, a.map(function (i) { return i.x + i.w; })) + 40, y1 = Math.max.apply(null, a.map(function (i) { return i.y + i.h; })) + 40;
    var sc = Math.min(2, 4000 / Math.max(x1 - x0, y1 - y0)), c = document.createElement('canvas'); c.width = Math.round((x1 - x0) * sc); c.height = Math.round((y1 - y0) * sc);
    var g = c.getContext('2d'); g.scale(sc, sc); g.translate(-x0, -y0); g.fillStyle = '#f7f4ee'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    var order = B().items.slice().sort(function (a, b) { return (a.type === 'frame' ? -1 : 0) - (b.type === 'frame' ? -1 : 0) || (a.z || 0) - (b.z || 0); });
    var jobs = order.filter(function (i) { return i.type === 'image'; }).map(function (i) { return getImg(i.src).then(function (s) { return new Promise(function (ok) { var im = new Image(); im.onload = function () { ok([i.id, im]); }; im.onerror = function () { ok([i.id, null]); }; im.src = s; }); }); });
    Promise.all(jobs).then(function (loaded) {
      var IM = {}; loaded.forEach(function (p) { IM[p[0]] = p[1]; });
      function wrapText(t, x, y, w, size, color, bold, center, it) { it = it || {}; if (it.caps) t = String(t || '').toUpperCase(); g.fillStyle = it.ink || color; g.font = (it.italic ? 'italic ' : '') + ((it.bold != null ? it.bold : bold) ? '700 ' : '400 ') + (it.size || size) + 'px "' + (it.font || 'DM Sans') + '", sans-serif'; size = it.size || size; if (it.align === 'center') center = true; var right = it.align === 'right'; var lines = []; String(t || '').split('\n').forEach(function (par) { var ws = par.split(' '), ln = ''; ws.forEach(function (wd) { var tt = ln ? ln + ' ' + wd : wd; if (g.measureText(tt).width > w && ln) { lines.push(ln); ln = wd; } else ln = tt; }); lines.push(ln); }); var lh = size * (it.lh || 1.3); lines.forEach(function (l, k) { var lw = g.measureText(l).width, lx = center ? x + (w - lw) / 2 : right ? x + w - lw : x, ly = y + size + k * lh; if (it.hl) { g.save(); g.fillStyle = it.hl; g.fillRect(lx - 2, ly - size, lw + 4, size * 1.25); g.restore(); } g.fillText(l, lx, ly); if (it.under || it.strike) { g.fillRect(lx, ly + (it.under ? size * .12 : -size * .3), lw, Math.max(1, size / 14)); } }); }
      function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
      order.forEach(function (i) {
        g.save(); g.globalAlpha = i.opacity != null ? i.opacity : 1; if (i.rot) { g.translate(i.x + i.w / 2, i.y + i.h / 2); g.rotate(i.rot * Math.PI / 180); g.translate(-i.x - i.w / 2, -i.y - i.h / 2); }
        if (i.type === 'frame') { rr(i.x, i.y, i.w, i.h, 12); g.fillStyle = i.color || '#fff'; g.fill(); g.strokeStyle = '#d8cfc2'; g.stroke(); wrapText(i.text, i.x + 18, i.y + 6, i.w - 36, 18, '#6a6157', true); }
        if (i.type === 'note') { g.fillStyle = i.color; g.fillRect(i.x, i.y, i.w, i.h); wrapText(i.text, i.x + 14, i.y + 8, i.w - 28, 17, '#241e1a', false, false, i); }
        if (i.type === 'text') wrapText(i.text, i.x, i.y, i.w, 24, '#241e1a', true, false, Object.assign({ font: 'Source Serif 4' }, i));
        if (i.type === 'rect') { var sh = shapeOf(i), P = new Path2D(shapePath(sh, i.w, i.h)); g.save(); g.translate(i.x, i.y); if (sh !== 'line') { g.fillStyle = i.color || '#ece6dc'; g.fill(P); } var sw = i.sw != null ? i.sw : (sh === 'line' ? 3 : (i.stroke ? 2 : 0)); if (sw && (i.stroke || sh === 'line')) { g.strokeStyle = i.stroke || '#2b2622'; g.lineWidth = sw; if (i.dash) g.setLineDash([8, 6]); g.stroke(P); } g.restore(); wrapText(i.text, i.x + 8, i.y + i.h / 2 - 12, i.w - 16, 16, '#241e1a', false, true, i); }
        if (i.type === 'swatch') { g.fillStyle = '#fff'; g.fillRect(i.x, i.y, i.w, i.h); g.fillStyle = i.hex; g.fillRect(i.x + 6, i.y + 6, i.w - 12, i.h - 52); wrapText(i.text, i.x + 8, i.y + i.h - 50, i.w - 16, 13, '#241e1a', true); wrapText((i.hex || '').toUpperCase() + (i.code ? '  ' + i.code : ''), i.x + 8, i.y + i.h - 32, i.w - 16, 11, '#6a6157'); }
        if (i.type === 'image' && IM[i.id]) {
          var im2 = IM[i.id], dx = i.x, dy = i.y, dw = i.w, dh = i.h, sx = 0, sy = 0, sw2 = im2.width, sh2 = im2.height, ra = sw2 / sh2, rb = i.w / i.h;
          if (i.fit === 'contain') { if (ra > rb) { dh = i.w / ra; dy = i.y + (i.h - dh) / 2; } else { dw = i.h * ra; dx = i.x + (i.w - dw) / 2; } } else { if (ra > rb) { sw2 = sh2 * rb; sx = (im2.width - sw2) / 2; } else { sh2 = sw2 / rb; sy = (im2.height - sh2) / 2; } }
          g.save(); if (i.border) { g.fillStyle = i.bcol || '#ffffff'; g.fillRect(i.x - i.border, i.y - i.border, i.w + 2 * i.border, i.h + 2 * i.border); } if (i.radius) { rr(i.x, i.y, i.w, i.h, Math.min(i.radius, i.w / 2, i.h / 2)); g.clip(); }
          g.translate(dx + dw / 2, dy + dh / 2); g.scale(i.fx ? -1 : 1, i.fy ? -1 : 1); g.drawImage(im2, sx, sy, sw2, sh2, -dw / 2, -dh / 2, dw, dh); g.restore();
          if (i.text) wrapText(i.text, i.x, i.y + i.h, i.w, 13, '#6a6157'); }
        g.restore();
      });
      g.strokeStyle = '#2b2622'; g.lineWidth = 2; g.fillStyle = '#2b2622';
      B().items.forEach(function (it) {
        if (it.type !== 'arrow') return; var e2 = ends(it); if (!e2) return; var p = e2[0], q = e2[1], col = it.color || '#2b2622', hd = it.head || 'end';
        g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = it.sw || 2; if (it.dash) g.setLineDash([8, 6]);
        var cx2 = null, cy2 = null; g.beginPath(); g.moveTo(p[0], p[1]); if (it.curve) { cx2 = (p[0] + q[0]) / 2 - (q[1] - p[1]) * .25; cy2 = (p[1] + q[1]) / 2 + (q[0] - p[0]) * .25; g.quadraticCurveTo(cx2, cy2, q[0], q[1]); } else g.lineTo(q[0], q[1]); g.stroke(); g.setLineDash([]);
        function head(tip, from) { var an = Math.atan2(tip[1] - from[1], tip[0] - from[0]), L = 10 + (it.sw || 2) * 2; g.beginPath(); g.moveTo(tip[0], tip[1]); g.lineTo(tip[0] - L * Math.cos(an - .4), tip[1] - L * Math.sin(an - .4)); g.lineTo(tip[0] - L * Math.cos(an + .4), tip[1] - L * Math.sin(an + .4)); g.fill(); }
        if (hd !== 'none') head(q, cx2 != null ? [cx2, cy2] : p); if (hd === 'both') head(p, cx2 != null ? [cx2, cy2] : q); g.restore();
      });
      c.toBlob(function (bl) { var a2 = document.createElement('a'); a2.href = URL.createObjectURL(bl); a2.download = (B().name || 'board').replace(/[^\w-]+/g, '-').toLowerCase() + '.png'; a2.click(); status('PNG downloaded.'); });
    });
  }
  function exportJSON() {
    var bd = JSON.parse(JSON.stringify(B())), ids = bd.items.filter(function (i) { return i.type === 'image'; }).map(function (i) { return i.src; });
    Promise.all(ids.map(function (id) { return getImg(id).then(function (s) { return [id, s]; }); })).then(function (pairs) {
      bd.images = {}; pairs.forEach(function (p) { bd.images[p[0]] = p[1]; });
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ forecutBoard: 1, board: bd })], { type: 'application/json' })); a.download = (bd.name || 'board').replace(/[^\w-]+/g, '-').toLowerCase() + '.forecut-board.json'; a.click(); status('Board file saved. Open it on any device with “Open file”.');
    });
  }
  $('#bdFile').addEventListener('change', function (e) {
    var f = e.target.files[0]; if (!f) return; f.text().then(function (t) {
      var x = JSON.parse(t); if (!x || !x.forecutBoard || !x.board) throw Error('not a board');
      var bd = x.board, imgs = bd.images || {}; delete bd.images; bd.id = uid();
      return Promise.all(Object.keys(imgs).map(function (k) { imgCache[k] = imgs[k]; return putImg(k, imgs[k]); })).then(function () { S.boards.push(bd); S.cur = bd.id; sel = []; save(false); renderBar(); draw(); status('Board opened.'); });
    }).catch(function () { status('That file is not a Forecut board.'); }); e.target.value = '';
  });

  var wantImport = /[?&]import=planner/.test(location.search);
  setTool('select'); renderBar(); setMode(wantImport ? 'board' : (S.mode || 'board')); setTimeout(function () { if (B().view.k === 0.6) fit(); }, 60);
  if (wantImport) { try { history.replaceState(null, '', location.pathname); } catch (e) {} setTimeout(function () { var nb = newBoard('blank'); nb.name = 'Collection plan'; S.boards.push(nb); S.cur = nb.id; undo = []; redo = []; sel = []; renderBar(); importPlanner(); }, 120); }
})();
