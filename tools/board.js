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
    clearTimeout(saveT); saveT = setTimeout(function () { try { localStorage.setItem(KEY, JSON.stringify(S)); status('Saved in this browser'); } catch (e) { status('Browser storage is full: export the board or remove some images.'); } }, 250);
  }
  function snapshot() { undo.push(JSON.stringify(B().items)); if (undo.length > 80) undo.shift(); redo = []; }
  function status(t) { var s = $('#bdStatus'); if (s) s.textContent = t; }

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
    '<div class="bd-top"><label class="bd-boardsel">Board<select id="bdSel"></select></label><button type="button" data-a="newboard">+ New board</button><button type="button" data-a="rename">Rename</button><button type="button" data-a="delboard">Delete</button>' +
    '<span class="bd-sp"></span><button type="button" data-a="full">Full screen</button><button type="button" data-a="png">Export PNG</button><button type="button" data-a="json">Save file</button><button type="button" data-a="load">Open file</button><input type="file" id="bdFile" accept=".json,application/json" hidden></div>' +
    '<div class="bd-stage"><div class="bd-tools" role="toolbar" aria-label="Board tools">' +
    tool('select', 'Select and move (V)', '<path d="M5 3l14 8-6 2-3 6z"/>') + tool('note', 'Sticky note (N)', '<path d="M4 4h16v11l-5 5H4z"/><path d="M15 20v-5h5"/>') +
    tool('text', 'Text (T)', '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>') + tool('image', 'Image (I)', '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-6-6-9 9"/>') +
    tool('swatch', 'Colour swatch (C)', '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 14h14"/>') + tool('frame', 'Frame / section (F)', '<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/>') +
    tool('rect', 'Shape (R)', '<rect x="4" y="6" width="16" height="12" rx="2"/>') + tool('arrow', 'Arrow: drag from one item to another (A)', '<path d="M4 20 20 4M11 4h9v9"/>') +
    '<span class="bd-tsep"></span>' + tool('undo', 'Undo (Ctrl+Z)', '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>') + tool('redo', 'Redo (Ctrl+Shift+Z)', '<path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>') +
    '</div><div class="bd-view" id="bdView" tabindex="0" aria-label="Board canvas"><div class="bd-world" id="bdWorld"><svg class="bd-links" id="bdLinks"><defs><marker id="bdArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#2b2622"/></marker></defs></svg></div><div class="bd-marquee" id="bdMq" hidden></div></div>' +
    '<div class="bd-zoom"><button type="button" data-a="zout" aria-label="Zoom out">−</button><span id="bdZ">60%</span><button type="button" data-a="zin" aria-label="Zoom in">+</button><button type="button" data-a="fit">Fit</button></div>' +
    '<div class="bd-props" id="bdProps" hidden></div><input type="file" id="bdImg" accept="image/*" multiple hidden></div>' +
    '<p class="bd-help"><span id="bdStatus">Saved in this browser</span> · Drag empty space to pan · Ctrl/⌘ + scroll or pinch to zoom · Double-click to edit text · Paste or drop images straight onto the board · Delete removes, Ctrl+D duplicates</p>';
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
    if (it.type === 'note') { d.style.background = it.color; d.innerHTML = '<div class="bd-txt">' + esc(it.text) + '</div>'; }
    else if (it.type === 'text') { d.innerHTML = '<div class="bd-txt" style="font-size:' + (it.size || 24) + 'px">' + esc(it.text) + '</div>'; }
    else if (it.type === 'frame') { d.style.background = it.color || '#fff'; d.innerHTML = '<div class="bd-ft">' + esc(it.text) + '</div>'; }
    else if (it.type === 'rect') { d.style.background = it.color || '#ece6dc'; d.style.borderRadius = it.round ? '50%' : '8px'; d.innerHTML = '<div class="bd-txt c">' + esc(it.text || '') + '</div>'; }
    else if (it.type === 'swatch') { d.innerHTML = '<div class="bd-chip" style="background:' + esc(it.hex) + '"></div><div class="bd-sl"><b>' + esc(it.text || '') + '</b><span>' + esc((it.hex || '').toUpperCase()) + '</span></div>'; }
    else if (it.type === 'image') { var im = document.createElement('img'); im.alt = it.text || 'Board image'; im.draggable = false; getImg(it.src).then(function (s) { im.src = s; }); d.appendChild(im); if (it.text) { var c = document.createElement('div'); c.className = 'bd-cap'; c.textContent = it.text; d.appendChild(c); } }
    if (sel.length === 1 && sel[0] === it.id && !it.locked) { var h = document.createElement('span'); h.className = 'bd-h'; h.dataset.h = '1'; d.appendChild(h); }
    els[it.id] = d; return d;
  }
  function find(id) { var a = B().items; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function drawLinks() {
    links.querySelectorAll('path.l').forEach(function (n) { n.remove(); });
    B().items.forEach(function (it) {
      if (it.type !== 'arrow') return; var a = find(it.from), b = find(it.to); if (!a || !b) return;
      var p = edge(a, b), q = edge(b, a), pa = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pa.setAttribute('class', 'l' + (sel.indexOf(it.id) > -1 ? ' sel' : '')); pa.dataset.id = it.id;
      pa.setAttribute('d', 'M' + p[0] + ' ' + p[1] + 'L' + q[0] + ' ' + q[1]); pa.setAttribute('marker-end', 'url(#bdArr)'); links.appendChild(pa);
    });
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
      if (it.type === 'note' || it.type === 'frame' || it.type === 'rect') h += '<div class="bd-cols">' + (it.type === 'frame' ? ['#ffffff', '#f4efe6', '#e8eee8', '#eef2f8', '#f8ece6'] : it.type === 'rect' ? ['#ece6dc', '#214538', '#c4643f', '#e9dcc4', '#2b2622'] : NOTE).map(function (c) { return '<button type="button" data-col="' + c + '" style="background:' + c + '" aria-label="Colour ' + c + '"></button>'; }).join('') + '</div>';
      if (it.type === 'swatch') h += '<label>Colour<input type="color" data-p="hex" value="' + esc(it.hex) + '"></label><label>Name<input data-p="text" value="' + esc(it.text || '') + '"></label>';
      if (it.type === 'text') h += '<label>Size<input type="number" min="10" max="160" data-p="size" value="' + (it.size || 24) + '"></label>';
      if (it.type === 'image') h += '<label>Caption<input data-p="text" value="' + esc(it.text || '') + '"></label>';
      if (it.type === 'rect') h += '<button type="button" data-a="round">' + (it.round ? 'Make square' : 'Make round') + '</button>';
    }
    h += '<div class="bd-row"><button type="button" data-a="front">To front</button><button type="button" data-a="back">To back</button><button type="button" data-a="dup">Duplicate</button><button type="button" data-a="lock">' + (it.locked ? 'Unlock' : 'Lock') + '</button><button type="button" data-a="del" class="bd-del">Delete</button></div>';
    if (sel.length === 1 && (it.type === 'note' || it.type === 'text')) h += '<button type="button" data-a="tobrief" class="bd-brief">Use as a style brief →</button>';
    props.innerHTML = h; props.hidden = false;
  }
  props.addEventListener('input', function (e) { var t = e.target; if (!t.dataset.p) return; sel.forEach(function (id) { var it = find(id); if (it) it[t.dataset.p] = t.type === 'number' ? +t.value : t.value; }); save(); var keep = document.activeElement === t; world.querySelectorAll('.bd-it').forEach(function (n) { n.remove(); }); B().items.forEach(function () {}); redrawItems(); if (keep) t.focus(); });
  function redrawItems() { world.querySelectorAll('.bd-it').forEach(function (n) { n.remove(); }); els = {}; B().items.slice().sort(function (a, b) { return (a.type === 'frame' ? -1 : 0) - (b.type === 'frame' ? -1 : 0) || (a.z || 0) - (b.z || 0); }).forEach(function (it) { if (it.type !== 'arrow') world.appendChild(make(it)); }); drawLinks(); }
  props.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.col) { snapshot(); sel.forEach(function (id) { var it = find(id); if (it) it.color = b.dataset.col; }); save(false); return draw(); }
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
  $('#bdSel').addEventListener('change', function (e) { S.cur = e.target.value; undo = []; redo = []; sel = []; save(false); draw(); });
  wrap.querySelector('.bd-top').addEventListener('click', function (e) { var b = e.target.closest('button[data-a]'); if (b) act(b.dataset.a); });
  wrap.querySelector('.bd-zoom').addEventListener('click', function (e) { var b = e.target.closest('button[data-a]'); if (b) act(b.dataset.a); });
  wrap.querySelector('.bd-tools').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-tool]'); if (!b) return; var t = b.dataset.tool;
    if (t === 'undo' || t === 'redo') return act(t);
    if (t === 'image') return $('#bdImg').click();
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
  var drag = null, pts = {};
  view.addEventListener('pointerdown', function (e) {
    if (e.target.closest('.bd-txt[contenteditable=true]')) return;
    pts[e.pointerId] = [e.clientX, e.clientY];
    if (Object.keys(pts).length === 2) { var p = Object.values(pts); drag = { pinch: Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]) }; return; }
    view.focus({ preventScroll: true });
    var w = toWorld(e.clientX, e.clientY), itEl = e.target.closest('.bd-it'), id = itEl && itEl.dataset.id, ln = e.target.closest('path.l');
    if (cur !== 'select' && cur !== 'arrow') { // create
      var c = { note: function () { return note(w[0] - 100, w[1] - 75, 'New note', NOTE[0]); }, text: function () { return text(w[0], w[1] - 20, 'Text', 28); }, frame: function () { return frame(w[0], w[1], 480, 360, 'Section'); }, rect: function () { return { id: uid(), type: 'rect', x: w[0] - 80, y: w[1] - 50, w: 160, h: 100, color: '#ece6dc', text: '' }; }, swatch: function () { return { id: uid(), type: 'swatch', x: w[0] - 55, y: w[1] - 70, w: 110, h: 140, hex: '#c4643f', text: 'Colour' }; } }[cur];
      if (c) { add(c()); setTool('select'); } return;
    }
    if (cur === 'arrow') { if (id) { drag = { arrow: id, sx: w[0], sy: w[1] }; } return; }
    if (ln) { sel = [ln.dataset.id]; draw(); return; }
    if (e.target.dataset.h && id) { var it = find(id); snapshot(); drag = { resize: it, sx: w[0], sy: w[1], w: it.w, h: it.h, ratio: it.type === 'image' ? it.h / it.w : 0 }; view.setPointerCapture(e.pointerId); return; }
    if (id) {
      if (e.shiftKey) { sel = sel.indexOf(id) > -1 ? sel.filter(function (s) { return s !== id; }) : sel.concat([id]); }
      else if (sel.indexOf(id) < 0) sel = [id];
      var movers = sel.map(find).filter(function (i) { return i && !i.locked; });
      movers.slice().forEach(function (m) { if (m.type === 'frame') B().items.forEach(function (o) { if (o !== m && o.type !== 'arrow' && o.type !== 'frame' && movers.indexOf(o) < 0 && !o.locked && o.x >= m.x && o.y >= m.y && o.x + o.w <= m.x + m.w && o.y + o.h <= m.y + m.h) movers.push(o); }); });
      snapshot(); drag = { move: movers.map(function (m) { return [m, m.x, m.y]; }), sx: w[0], sy: w[1], moved: false };
      view.setPointerCapture(e.pointerId); draw(); return;
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
    if (drag.arrow) { drag.ex = w[0]; drag.ey = w[1]; }
  });
  function end(e) {
    delete pts[e.pointerId];
    if (!drag) return;
    if (drag.pan) save(false);
    if (drag.move) { if (drag.moved) save(false); else undo.pop(); draw(); }
    if (drag.resize) { save(false); draw(); }
    if (drag.mq) { $('#bdMq').hidden = true; if (drag.ex != null) { var x0 = Math.min(drag.sx, drag.ex), x1 = Math.max(drag.sx, drag.ex), y0 = Math.min(drag.sy, drag.ey), y1 = Math.max(drag.sy, drag.ey); sel = B().items.filter(function (i) { return i.type !== 'arrow' && i.x >= x0 && i.y >= y0 && i.x + i.w <= x1 && i.y + i.h <= y1; }).map(function (i) { return i.id; }); draw(); } }
    if (drag.arrow) { var t = e.target.closest && document.elementFromPoint(e.clientX, e.clientY); t = t && t.closest('.bd-it'); if (t && t.dataset.id !== drag.arrow) { add({ id: uid(), type: 'arrow', from: drag.arrow, to: t.dataset.id }); } setTool('select'); }
    drag = null;
  }
  view.addEventListener('pointerup', end); view.addEventListener('pointercancel', end);
  view.addEventListener('dblclick', function (e) {
    var itEl = e.target.closest('.bd-it'); if (!itEl) { var w = toWorld(e.clientX, e.clientY); add(note(w[0] - 100, w[1] - 75, '', NOTE[0])); itEl = els[sel[0]]; }
    var it = find(itEl.dataset.id); if (!it || it.locked || it.type === 'image' || it.type === 'swatch') return;
    var tx = itEl.querySelector('.bd-txt, .bd-ft'); if (!tx) return;
    snapshot(); tx.contentEditable = 'true'; tx.focus(); var rg = document.createRange(); rg.selectNodeContents(tx); var s = getSelection(); s.removeAllRanges(); s.addRange(rg);
    tx.addEventListener('blur', function () { tx.contentEditable = 'false'; it.text = tx.innerText.replace(/\n$/, ''); save(false); }, { once: true });
  });
  // keyboard
  view.addEventListener('keydown', function (e) {
    if (e.target.isContentEditable) { if (e.key === 'Escape') e.target.blur(); return; }
    var k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (mod && k === 'z') { e.preventDefault(); act(e.shiftKey ? 'redo' : 'undo'); return; }
    if (mod && k === 'y') { e.preventDefault(); act('redo'); return; }
    if (mod && k === 'd') { e.preventDefault(); act('dup'); return; }
    if (mod && k === 'a') { e.preventDefault(); sel = B().items.map(function (i) { return i.id; }); draw(); return; }
    if ((k === 'delete' || k === 'backspace') && sel.length) { e.preventDefault(); act('del'); return; }
    if (!mod && ({ v: 'select', n: 'note', t: 'text', c: 'swatch', f: 'frame', r: 'rect', a: 'arrow' })[k]) { setTool(({ v: 'select', n: 'note', t: 'text', c: 'swatch', f: 'frame', r: 'rect', a: 'arrow' })[k]); return; }
    if (!mod && k === 'i') { $('#bdImg').click(); return; }
    if (k.indexOf('arrow') === 0 && sel.length) { e.preventDefault(); snapshot(); var st = e.shiftKey ? 10 : 1; sel.forEach(function (id) { var it = find(id); if (!it || it.locked) return; if (k === 'arrowleft') it.x -= st; if (k === 'arrowright') it.x += st; if (k === 'arrowup') it.y -= st; if (k === 'arrowdown') it.y += st; }); save(false); draw(); }
    if (k === 'escape') { sel = []; setTool('select'); draw(); }
  });
  // paste and drop images
  document.addEventListener('paste', function (e) { if (wrap.hidden || e.target.isContentEditable || /input|textarea/i.test(e.target.tagName)) return; var fs = []; Array.prototype.forEach.call(e.clipboardData.items || [], function (it) { if (it.kind === 'file') fs.push(it.getAsFile()); }); if (fs.length) { e.preventDefault(); var c = center(); addFiles(fs, c[0], c[1]); } else { var t = e.clipboardData.getData('text'); if (t) { var c2 = center(); add(note(c2[0] - 100, c2[1] - 75, t.slice(0, 600))); } } });
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
      function wrapText(t, x, y, w, size, color, bold, center) { g.fillStyle = color; g.font = (bold ? '600 ' : '') + size + 'px "DM Sans", sans-serif'; var lines = []; String(t || '').split('\n').forEach(function (par) { var ws = par.split(' '), ln = ''; ws.forEach(function (wd) { var tt = ln ? ln + ' ' + wd : wd; if (g.measureText(tt).width > w && ln) { lines.push(ln); ln = wd; } else ln = tt; }); lines.push(ln); }); lines.forEach(function (l, k) { var lx = center ? x + (w - g.measureText(l).width) / 2 : x; g.fillText(l, lx, y + size + k * size * 1.3); }); }
      function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
      order.forEach(function (i) {
        if (i.type === 'frame') { rr(i.x, i.y, i.w, i.h, 12); g.fillStyle = i.color || '#fff'; g.fill(); g.strokeStyle = '#d8cfc2'; g.stroke(); wrapText(i.text, i.x + 18, i.y + 6, i.w - 36, 18, '#6a6157', true); }
        if (i.type === 'note') { g.fillStyle = i.color; g.fillRect(i.x, i.y, i.w, i.h); wrapText(i.text, i.x + 14, i.y + 8, i.w - 28, 17, '#241e1a'); }
        if (i.type === 'text') wrapText(i.text, i.x, i.y, i.w, i.size || 24, '#241e1a', true);
        if (i.type === 'rect') { if (i.round) { g.beginPath(); g.ellipse(i.x + i.w / 2, i.y + i.h / 2, i.w / 2, i.h / 2, 0, 0, 7); } else rr(i.x, i.y, i.w, i.h, 8); g.fillStyle = i.color || '#ece6dc'; g.fill(); wrapText(i.text, i.x + 8, i.y + i.h / 2 - 22, i.w - 16, 16, '#241e1a', false, true); }
        if (i.type === 'swatch') { g.fillStyle = '#fff'; g.fillRect(i.x, i.y, i.w, i.h); g.fillStyle = i.hex; g.fillRect(i.x + 6, i.y + 6, i.w - 12, i.h - 52); wrapText(i.text, i.x + 8, i.y + i.h - 50, i.w - 16, 13, '#241e1a', true); wrapText((i.hex || '').toUpperCase(), i.x + 8, i.y + i.h - 32, i.w - 16, 11, '#6a6157'); }
        if (i.type === 'image' && IM[i.id]) { g.drawImage(IM[i.id], i.x, i.y, i.w, i.h); if (i.text) wrapText(i.text, i.x, i.y + i.h, i.w, 13, '#6a6157'); }
      });
      g.strokeStyle = '#2b2622'; g.lineWidth = 2; g.fillStyle = '#2b2622';
      B().items.forEach(function (it) { if (it.type !== 'arrow') return; var a1 = find(it.from), b1 = find(it.to); if (!a1 || !b1) return; var p = edge(a1, b1), q = edge(b1, a1), an = Math.atan2(q[1] - p[1], q[0] - p[0]); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[0] - 12 * Math.cos(an - .4), q[1] - 12 * Math.sin(an - .4)); g.lineTo(q[0] - 12 * Math.cos(an + .4), q[1] - 12 * Math.sin(an + .4)); g.fill(); });
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

  setTool('select'); renderBar(); setMode(S.mode || 'board'); setTimeout(function () { if (B().view.k === 0.6) fit(); }, 60);
})();
