/* Forecut Pattern Studio: a full-window workspace for drawing, editing and preparing pattern pieces.
   Needs pm_cad.js (FCCad) and pm_export.js (PMX). Geometry is in centimetres; the screen shows the chosen unit. */
(function () {
  'use strict';
  var C = window.FCCad, X = window.PMX; if (!C) return;
  var AUTO = 'fc-ps-auto', LIB = 'fc-ps-lib', PREF = 'fc-ps-pref', NS = 'http://www.w3.org/2000/svg';
  var PREVIEW = /[?&]preview(=|&|$)/.test(location.search);
  function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function dl(name, data, type) { if (window.FC && FC.download) return FC.download(name, data, type); var b = data instanceof Blob ? data : new Blob([data], { type: type || 'application/octet-stream' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  function I(d) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>'; }

  /* ---------- tools ---------- */
  var TOOLS = [
    { g: 'Select', id: 'select', k: 'v', n: 'Select and transform', tip: 'Click a piece to select it, Shift-click to add more, drag to move. Drag on empty space to select with a box.', ic: 'M5 3l13 8-6 1.5L9 19z' },
    { g: 'Select', id: 'edit', k: 'a', n: 'Edit pattern', tip: 'Select and drag points, edges and curve handles. Type exact coordinates in Properties. Double-click an edge to add a point.', ic: 'M5 5h3v3H5zM16 16h3v3h-3zM6.5 8C8 14 12 17 16 17.5' },
    { g: 'Select', id: 'pan', k: 'h', n: 'Pan', tip: 'Drag to move the view. You can also hold Space, or drag with the middle mouse button.', ic: 'M8 12V6a1.5 1.5 0 013 0v5M11 11V4.5a1.5 1.5 0 013 0V11M14 11V6a1.5 1.5 0 013 0v7c0 4-2.5 7-6 7-2.5 0-4-1-5.5-3L4 13.5a1.5 1.5 0 012.5-1.5L8 14' },
    { g: 'Draw', id: 'poly', k: 'p', n: 'Polygon', tip: 'Click to place points. Drag while placing a point to make a curve. Click the first point, double-click or press Enter to close. Backspace removes the last point, Esc cancels.', ic: 'M4 18L7 5l10 2 3 9-8 4z' },
    { g: 'Draw', id: 'rect', k: 'r', n: 'Rectangle', tip: 'Drag to draw, or type the exact width and height in the bar above the canvas and press Create.', ic: 'M4 6h16v12H4z' },
    { g: 'Draw', id: 'ellipse', k: 'e', n: 'Ellipse', tip: 'Drag to draw, or type the exact width and height above the canvas. Hold Shift for a circle.', ic: 'M12 5c5 0 8.5 3 8.5 7s-3.5 7-8.5 7-8.5-3-8.5-7S7 5 12 5z' },
    { g: 'Draw', id: 'spiral', n: 'Spiral', tip: 'A spiral strip for flounces and cascades. Set the inner radius, turns, spacing and strip width above the canvas, then click where its centre goes.', ic: 'M12 12a1.5 1.5 0 113 0 3 3 0 01-6 0 4.5 4.5 0 019 0 6 6 0 01-12 0 7.5 7.5 0 0115 0' },
    { g: 'Edit', id: 'addpt', k: '+', n: 'Add point / split edge', tip: 'Click an edge to add a point there without changing the shape. In Properties you can also split an edge into equal parts or at an exact distance.', ic: 'M4 18L20 6M12 8v8M8 12h8' },
    { g: 'Edit', id: 'curv', k: 'c', n: 'Edit curvature', tip: 'Drag an edge sideways to bend it; the end points stay where they are. A straight edge becomes a curve.', ic: 'M4 18C8 6 16 6 20 18M12 4v5' },
    { g: 'Edit', id: 'smooth', n: 'Smooth curve', tip: 'Select points or edges with Edit pattern, then click Smooth in Properties, or click an edge here to smooth its two joins. Sharp corners stay sharp. The length change is reported.', ic: 'M3 16c3-8 5-8 7-4s4 4 7-4 4 0 4 0' },
    { g: 'Edit', id: 'cut', k: 'k', n: 'Cut and split', tip: 'Click two points on the outline of a piece to cut it into two pieces along the line between them.', ic: 'M6 4l12 16M4 8c2-2 4-2 6 0M14 16c2 2 4 2 6 0' },
    { g: 'Edit', id: 'merge', n: 'Merge pieces', tip: 'Click an edge of the first piece, then the matching edge of the second. The second piece turns to meet it and the two become one piece. The length difference is reported.', ic: 'M4 6h7v12H4zM13 6h7v12h-7M11 12h2' },
    { g: 'Edit', id: 'trace', k: 't', n: 'Trace', tip: 'Click an edge to trace a facing of the width set above the canvas, or click inside an internal rectangle, ellipse or closed shape to trace it as a new piece (a pocket from its placement, say).', ic: 'M4 4h16v16H4zM4 9h16M8 4v5' },
    { g: 'Internal', id: 'iline', k: 'l', n: 'Internal line', tip: 'Draw a line inside a piece: a fold line, guide, placement or stitch line. Click points, double-click or press Enter to finish.', ic: 'M5 5h14v14H5zM8 15l8-6' },
    { g: 'Internal', id: 'irect', n: 'Internal rectangle', tip: 'Drag inside a piece for a pocket placement, a cut-out or a guide.', ic: 'M4 4h16v16H4zM8 9h8v6H8z' },
    { g: 'Internal', id: 'iell', n: 'Internal circle or ellipse', tip: 'Drag inside a piece for a cut-out, button or placement marking.', ic: 'M4 4h16v16H4zM12 8.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7z' },
    { g: 'Marks', id: 'notch', k: 'n', n: 'Notch', tip: 'Click an edge to add a notch. Set its exact position, type and depth in Properties.', ic: 'M4 18h16M12 18v-6M10 12l2 3 2-3' },
    { g: 'Marks', id: 'grain', k: 'g', n: 'Grainline', tip: 'Drag across a piece to set its grainline. Set the exact angle and direction in Properties.', ic: 'M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4' },
    { g: 'Measure', id: 'measure', k: 'm', n: 'Measure', tip: 'Click points to measure straight distances and angles; snapping uses points and the grid. Click an edge to read its length along the curve. Esc clears.', ic: 'M3 15l12-12 6 6-12 12zM7 11l2 2M10 8l2 2M13 5l2 2' },
    { g: 'Measure', id: 'walk', k: 'w', n: 'Seam walk', tip: 'Click the first edge, then the edge it is sewn to. The lengths, the difference and the planned ease are compared.', ic: 'M4 7h16M4 17h16M8 7l-2 10M16 7l2 10' },
    { g: 'Seam allowance', id: 'sa', k: 's', n: 'Seam allowance', tip: 'Click an edge to set its own allowance, mark it as a hem or a fold, and choose the corner shape.', ic: 'M6 6h12v12H6zM3 3h18v18H3z' }
  ];
  var TOOL = {}; TOOLS.forEach(function (t) { TOOL[t.id] = t; });

  /* ---------- state ---------- */
  var P = C.newProject(), H = new C.History(P, onChange), pref = ls(PREF) || {};
  if (pref.unit) P.unit = pref.unit;
  var ST = { tool: 'select', sel: [], node: null, seg: null, z: 8, tx: 60, ty: 60, draft: null, meas: [], walk: [], hover: null, mode: '2d', fileName: null, savedAt: 0, dirty: false, cut: [] };
  var root, svg, world, rx, ry, statusEl, propsEl, objsEl, optsEl, toastEl, timer;

  /* ---------- build the window ---------- */
  function build() {
    if (root) return;
    root = document.createElement('div'); root.id = 'ps'; root.hidden = true; root.setAttribute('role', 'application'); root.setAttribute('aria-label', 'Forecut Pattern Studio');
    var groups = []; TOOLS.forEach(function (t) { if (groups.indexOf(t.g) < 0) groups.push(t.g); });
    root.innerHTML =
      '<div class="ps-top"><span class="ps-brand"><i></i>FORECUT PATTERN STUDIO</span>'
      + '<div class="ps-menu"><button type="button" class="ps-mb" data-m="file">File</button><div class="ps-dd" data-mm="file" hidden>'
      + '<button type="button" data-a="new">New project<kbd>Ctrl N</kbd></button><button type="button" data-a="open">Open saved project…<kbd>Ctrl O</kbd></button><button type="button" data-a="openfile">Open project file…</button><hr>'
      + '<button type="button" data-a="save">Save<kbd>Ctrl S</kbd></button><button type="button" data-a="saveas">Save as…</button><button type="button" data-a="savefile">Download project file</button><hr>'
      + '<button type="button" data-a="fromdraft">Bring in the Pattern Maker draft</button><button type="button" data-a="importdxf">Import DXF…</button><hr>'
      + '<button type="button" data-a="xsvg">Export SVG (true scale)</button><button type="button" data-a="xdxf">Export DXF</button><button type="button" data-a="xpdft">Export PDF, A4 tiles</button><button type="button" data-a="xpdf">Export PDF, full size</button><button type="button" data-a="xpng">Export PNG</button></div></div>'
      + '<div class="ps-menu"><button type="button" class="ps-mb" data-m="view">View</button><div class="ps-dd" data-mm="view" hidden>'
      + [['grid', 'Grid'], ['snap', 'Snap to grid and points'], ['rulers', 'Rulers'], ['sa', 'Seam allowance (cutting line)'], ['seam', 'Seamline'], ['notches', 'Notches'], ['grain', 'Grainlines'], ['internals', 'Internal lines and shapes'], ['labels', 'Piece names'], ['points', 'Points on all pieces']].map(function (v) { return '<label><input type="checkbox" data-v="' + v[0] + '"> ' + v[1] + '</label>'; }).join('')
      + '<hr><button type="button" data-a="fit">Fit all pieces<kbd>0</kbd></button><button type="button" data-a="z100">Actual size (100%)<kbd>1</kbd></button></div></div>'
      + '<input class="ps-name" id="ps-name" aria-label="Project name" maxlength="80">'
      + '<span class="ps-saved" id="ps-saved"></span>'
      + '<button type="button" class="ps-ib" data-a="undo" title="Undo (Ctrl Z)" aria-label="Undo">' + I('M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3') + '</button><button type="button" class="ps-ib" data-a="redo" title="Redo (Ctrl Shift Z)" aria-label="Redo">' + I('M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3') + '</button>'
      + '<span class="ps-sp"></span>'
      + '<div class="ps-seg" id="ps-mode" role="group" aria-label="Workspace mode"><button type="button" data-mode="2d">2D Pattern</button><button type="button" data-mode="3d">3D Garment</button><button type="button" data-mode="split">Split view</button></div>'
      + '<div class="ps-seg" id="ps-units" role="group" aria-label="Units"><button type="button" data-u="mm">mm</button><button type="button" data-u="cm">cm</button><button type="button" data-u="in">in</button></div>'
      + '<button type="button" class="ps-close" data-a="close" title="Back to Pattern Maker">Close</button></div>'
      + '<div class="ps-body"><nav class="ps-tools" aria-label="Tools"><input type="search" id="ps-tsearch" placeholder="Find a tool" aria-label="Find a tool">'
      + groups.map(function (g) { return '<div class="ps-tg"><small>' + g + '</small>' + TOOLS.filter(function (t) { return t.g === g; }).map(function (t) { return '<button type="button" class="ps-tb" data-t="' + t.id + '" aria-label="' + esc(t.n) + '" data-tip="' + esc(t.n + (t.k ? ' (' + t.k.toUpperCase() + ')' : '') + '. ' + t.tip) + '">' + I(t.ic) + '<span>' + esc(t.n) + '</span></button>'; }).join('') + '</div>'; }).join('')
      + '</nav><aside class="ps-objs" aria-label="Objects"><h6>Pieces</h6><div id="ps-objs"></div><div class="ps-objb"><button type="button" data-a="rect10">+ Rectangle</button><button type="button" data-a="fromdraft">+ From draft</button></div></aside>'
      + '<main class="ps-main"><div class="ps-opts" id="ps-opts"></div><div class="ps-stage"><canvas class="ps-rx" id="ps-rx"></canvas><canvas class="ps-ry" id="ps-ry"></canvas><div class="ps-corner" id="ps-ucorner"></div>'
      + '<svg id="ps-svg" xmlns="' + NS + '" tabindex="0" aria-label="Pattern canvas"><g id="ps-grid"></g><g id="ps-world"></g><g id="ps-over"></g></svg>'
      + '<div class="ps-3d" id="ps-3d" hidden><div><b>3D Garment view is coming soon</b><p>Your pieces, seam allowances and notches are kept in this project, so they will open in 3D when it launches. Keep working in 2D for now.</p></div></div>'
      + '<div class="ps-tip" id="ps-tip" hidden></div></div></main>'
      + '<aside class="ps-props" id="ps-props" aria-label="Properties"></aside></div>'
      + '<div class="ps-status" id="ps-status"></div><p class="ps-toast" id="ps-toast" role="status" hidden></p><div class="ps-modal" id="ps-modal" hidden></div>'
      + '<input type="file" id="ps-file" accept=".json,.fcpattern,application/json" hidden><input type="file" id="ps-dxf" accept=".dxf" hidden>';
    document.body.appendChild(root);
    svg = q('#ps-svg'); world = q('#ps-world'); rx = q('#ps-rx'); ry = q('#ps-ry'); statusEl = q('#ps-status'); propsEl = q('#ps-props'); objsEl = q('#ps-objs'); optsEl = q('#ps-opts'); toastEl = q('#ps-toast');
    wire();
  }
  function q(s) { return root.querySelector(s); }
  function qa(s) { return Array.prototype.slice.call(root.querySelectorAll(s)); }

  /* ---------- units and view ---------- */
  function U(cm) { return C.toU(cm, P.unit); }
  function F(cm) { return C.fmt(cm, P.unit); }
  function CM(v) { return C.fromU(+v, P.unit); }
  function V() { return P.view; }
  function S2W(e) { var r = svg.getBoundingClientRect(); return [(e.clientX - r.left - ST.tx) / ST.z, (e.clientY - r.top - ST.ty) / ST.z]; }
  function W2S(p) { return [p[0] * ST.z + ST.tx, p[1] * ST.z + ST.ty]; }
  function pcById(id) { for (var i = 0; i < P.pieces.length; i++) if (P.pieces[i].id === id) return P.pieces[i]; return null; }
  function L2W(pc, p) { return [p[0] + (pc.x || 0), p[1] + (pc.y || 0)]; }
  function W2L(pc, p) { return [p[0] - (pc.x || 0), p[1] - (pc.y || 0)]; }
  function gridStep() { return P.unit === 'in' ? 2.54 / 4 : P.unit === 'mm' ? .5 : 1; }

  /* ---------- snapping ---------- */
  function snap(w, skip) {
    if (!V().snap) return { p: w };
    var best = null, R = 9 / ST.z;
    P.pieces.forEach(function (pc) { if (pc.hidden) return; pc.nodes.forEach(function (nd, i) { if (skip && skip.pc === pc && skip.idx.indexOf(i) >= 0) return; var p = L2W(pc, [nd.x, nd.y]), d = C.dist(p, w); if (d < R && (!best || d < best.d)) best = { d: d, p: p, k: 'point' }; });
      for (var s = 0; s < C.segCount(pc); s++) { if (skip && skip.pc === pc) continue; var m = L2W(pc, C.pointAt(pc, s, C.tAt(pc, s, C.segLen(pc, s) / 2))), d2 = C.dist(m, w); if (d2 < R && (!best || d2 < best.d)) best = { d: d2, p: m, k: 'midpoint' }; } });
    if (best) return best;
    var g = gridStep(); return { p: [Math.round(w[0] / g) * g, Math.round(w[1] / g) * g], k: 'grid' };
  }
  /* nearest point on any edge */
  function nearestEdge(w, only) {
    var best = null;
    P.pieces.forEach(function (pc) { if (pc.hidden || (only && pc !== only)) return; var l = W2L(pc, w);
      for (var s = 0; s < C.segCount(pc); s++) { var pts = C.segPts(pc, s, .1), acc = 0; for (var j = 1; j < pts.length; j++) { var a = pts[j - 1], b = pts[j], L = C.dist(a, b), vx = b[0] - a[0], vy = b[1] - a[1], t = Math.max(0, Math.min(1, ((l[0] - a[0]) * vx + (l[1] - a[1]) * vy) / (L * L || 1))), qx = a[0] + vx * t, qy = a[1] + vy * t, d = Math.hypot(qx - l[0], qy - l[1]); if (!best || d < best.d) best = { d: d, pc: pc, seg: s, s: acc + L * t, p: [qx, qy] }; acc += L; } } });
    if (best) { best.t = C.tAt(best.pc, best.seg, best.s); best.L = C.segLen(best.pc, best.seg); }
    return best && best.d < 10 / ST.z ? best : null;
  }
  function pieceAt(w) { for (var i = P.pieces.length - 1; i >= 0; i--) { var pc = P.pieces[i]; if (pc.hidden) continue; if (inside(V().sa ? C.cutLine(pc).pts : C.flat(pc, .5).pts, W2L(pc, w))) return pc; } return null; }
  function inside(poly, p) { var c = false; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { var a = poly[i], b = poly[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }

  /* ---------- drawing ---------- */
  function pathD(pc, close) { var n = C.segCount(pc), N = pc.nodes; if (!N.length) return ''; var d = 'M' + N[0].x.toFixed(3) + ' ' + N[0].y.toFixed(3); for (var i = 0; i < n; i++) { var k = C.ctrl(pc, i); d += k.curved ? 'C' + k.p1.map(f3).join(' ') + ' ' + k.p2.map(f3).join(' ') + ' ' + k.p3.map(f3).join(' ') : 'L' + k.p3.map(f3).join(' '); } return d + (close !== false && pc.closed !== false ? 'Z' : ''); }
  function segD(pc, i) { var k = C.ctrl(pc, i); return 'M' + k.p0.map(f3).join(' ') + (k.curved ? 'C' + k.p1.map(f3).join(' ') + ' ' + k.p2.map(f3).join(' ') + ' ' + k.p3.map(f3).join(' ') : 'L' + k.p3.map(f3).join(' ')); }
  function f3(v) { return v.toFixed(3); }
  function polyD(P2) { return P2.length ? 'M' + P2.map(function (q) { return f3(q[0]) + ' ' + f3(q[1]); }).join('L') + 'Z' : ''; }
  function draw() {
    if (!root || root.hidden) return;
    var v = V(), z = ST.z, h = '', px = 1 / z;
    world.setAttribute('transform', 'translate(' + ST.tx + ' ' + ST.ty + ') scale(' + z + ')');
    q('#ps-grid').setAttribute('transform', world.getAttribute('transform')); q('#ps-over').setAttribute('transform', world.getAttribute('transform'));
    drawGrid();
    P.pieces.forEach(function (pc) {
      if (pc.hidden) return;
      var sel = ST.sel.indexOf(pc.id) >= 0, issues = C.validate(pc), bad = issues.length > 0, cl = v.sa ? C.cutLine(pc) : null;
      h += '<g class="ps-pc' + (sel ? ' sel' : '') + (bad ? ' bad' : '') + (pc.locked ? ' lock' : '') + '" data-pc="' + pc.id + '" transform="translate(' + f3(pc.x || 0) + ' ' + f3(pc.y || 0) + ')">';
      if (cl) h += '<path class="ps-cut" d="' + polyD(cl.pts) + '"/>';
      h += '<path class="ps-seam' + (v.seam ? '' : ' nos') + (cl ? '' : ' solo') + '" d="' + pathD(pc) + '"/>';
      if (pc.fold >= 0 && pc.fold < C.segCount(pc)) h += '<path class="ps-fold" d="' + segD(pc, pc.fold) + '"/>';
      if (v.internals) pc.internals.forEach(function (it) { if (it.visible === false) return; var cls = 'ps-int ' + (it.style === 'dashed' ? 'dash ' : '') + (it.purpose || ''); if (it.kind === 'point') h += '<circle class="' + cls + '" cx="' + f3(it.pts[0][0]) + '" cy="' + f3(it.pts[0][1]) + '" r="' + (.25) + '"/>'; else if (it.kind === 'ellipse') h += '<ellipse class="' + cls + '" cx="' + f3(it.c[0]) + '" cy="' + f3(it.c[1]) + '" rx="' + f3(it.r[0]) + '" ry="' + f3(it.r[1]) + '"/>'; else h += '<path class="' + cls + '" d="M' + it.pts.map(function (q2) { return f3(q2[0]) + ' ' + f3(q2[1]); }).join('L') + (it.kind === 'rect' ? 'Z' : '') + '"/>'; });
      pc.darts.forEach(function (d) { if (d.l1) h += '<path class="ps-int" d="M' + d.l1.map(f3).join(' ') + 'L' + d.apex.map(f3).join(' ') + 'L' + d.l2.map(f3).join(' ') + '"/>'; else if (d.pts) h += '<path class="ps-int" d="M' + d.pts.map(function (q2) { return q2.map(f3).join(' '); }).join('L') + 'Z"/>'; });
      if (v.notches) { var sg = C.areaOf(C.flat(pc, .5).pts) > 0 ? -1 : 1; pc.notches.forEach(function (nt) { if (nt.seg >= C.segCount(pc)) return; var r = C.notchPos(pc, nt), nv = [-r.tan[1] * sg, r.tan[0] * sg], d0 = v.sa ? C.saOf(pc, nt.seg) : 0, dep = nt.depth || .6, mk = function (off) { var b = [r.p[0] + r.tan[0] * off, r.p[1] + r.tan[1] * off], a = [b[0] + nv[0] * d0, b[1] + nv[1] * d0], e = [a[0] - nv[0] * dep, a[1] - nv[1] * dep]; return nt.type === 'v' ? 'M' + (a[0] + r.tan[0] * .25).toFixed(3) + ' ' + (a[1] + r.tan[1] * .25).toFixed(3) + 'L' + e.map(f3).join(' ') + 'L' + (a[0] - r.tan[0] * .25).toFixed(3) + ' ' + (a[1] - r.tan[1] * .25).toFixed(3) : 'M' + a.map(f3).join(' ') + 'L' + e.map(f3).join(' ') + (nt.type === 't' ? 'M' + (e[0] + r.tan[0] * .3).toFixed(3) + ' ' + (e[1] + r.tan[1] * .3).toFixed(3) + 'L' + (e[0] - r.tan[0] * .3).toFixed(3) + ' ' + (e[1] - r.tan[1] * .3).toFixed(3) : ''); };
        h += '<path class="ps-notch' + (ST.notch === nt.id ? ' on' : '') + '" data-nt="' + nt.id + '" d="' + mk(0) + (nt.type === 'double' ? mk(.35) : '') + '"/>'; }); }
      if (v.grain && pc.grain) { var a = pc.grain.a, b = pc.grain.b, gd = C.dist(a, b) || 1, u = [(b[0] - a[0]) / gd, (b[1] - a[1]) / gd], nn = [-u[1], u[0]], ar = function (p, s) { return 'M' + (p[0] - u[0] * s * .8 + nn[0] * .4).toFixed(3) + ' ' + (p[1] - u[1] * s * .8 + nn[1] * .4).toFixed(3) + 'L' + p.map(f3).join(' ') + 'L' + (p[0] - u[0] * s * .8 - nn[0] * .4).toFixed(3) + ' ' + (p[1] - u[1] * s * .8 - nn[1] * .4).toFixed(3); };
        h += '<path class="ps-grain" d="M' + a.map(f3).join(' ') + 'L' + b.map(f3).join(' ') + ar(b, 1) + (pc.grainDir === 'one' ? '' : ar(a, -1)) + '"/>'; }
      if (v.labels) { var bb = C.bbox(pc); h += '<text class="ps-lab" x="' + f3((bb[0] + bb[2]) / 2) + '" y="' + f3((bb[1] + bb[3]) / 2) + '" font-size="' + f3(Math.max(.8, Math.min(2.2, (bb[2] - bb[0]) / 10))) + '">' + esc(pc.name || 'Piece') + '</text>'; if (pc.size || pc.qty) h += '<text class="ps-lab2" x="' + f3((bb[0] + bb[2]) / 2) + '" y="' + f3((bb[1] + bb[3]) / 2 + Math.max(1, Math.min(2.4, (bb[2] - bb[0]) / 9))) + '" font-size="' + f3(Math.max(.55, Math.min(1.3, (bb[2] - bb[0]) / 16))) + '">' + esc((pc.size ? pc.size + ' · ' : '') + 'Cut ' + pc.qty + (pc.pair ? ' pair' : '') + (pc.fold >= 0 ? ' on fold' : '')) + '</text>'; }
      if (pc.link && pc.link.on) h += '<text class="ps-link" x="' + f3(C.bbox(pc)[0]) + '" y="' + f3(C.bbox(pc)[1] - .5) + '" font-size=".9">' + (pc.link.mode === 'mirror' ? '⇋ mirrored link' : '⇄ linked') + '</text>';
      // edges for picking
      var pick = ['edit', 'addpt', 'curv', 'smooth', 'notch', 'measure', 'walk', 'sa', 'cut', 'merge', 'trace'].indexOf(ST.tool) >= 0;
      if (pick) for (var s = 0; s < C.segCount(pc); s++) { var on = ST.seg && ST.seg.pc === pc.id && ST.seg.i === s, wk = ST.walk.some(function (w) { return w.pc === pc.id && w.seg === s; }); h += '<path class="ps-eh' + (on || wk ? ' on' : '') + '" data-pc="' + pc.id + '" data-s="' + s + '" d="' + segD(pc, s) + '" stroke-width="' + f3(10 * px) + '"/>'; if (on || wk) h += '<path class="ps-eon" d="' + segD(pc, s) + '"/>'; }
      // points and handles
      var showPts = ST.tool === 'edit' && (sel || ST.node && ST.node.pc === pc.id) || v.points || ST.tool === 'cut';
      if (showPts) pc.nodes.forEach(function (nd, i) { var isSel = ST.node && ST.node.pc === pc.id && ST.node.idx.indexOf(i) >= 0, r = 4 * px;
        if (ST.tool === 'edit' && (isSel || segTouches(pc, i))) ['h1', 'h2'].forEach(function (k) { if (!nd[k]) return; var hx = nd.x + nd[k][0], hy = nd.y + nd[k][1]; h += '<path class="ps-hl" d="M' + f3(nd.x) + ' ' + f3(nd.y) + 'L' + f3(hx) + ' ' + f3(hy) + '"/><circle class="ps-hd" data-pc="' + pc.id + '" data-n="' + i + '" data-h="' + k + '" cx="' + f3(hx) + '" cy="' + f3(hy) + '" r="' + f3(3.5 * px) + '"/>'; });
        h += '<rect class="ps-pt' + (isSel ? ' on' : '') + (nd.smooth ? ' sm' : '') + '" data-pc="' + pc.id + '" data-n="' + i + '" x="' + f3(nd.x - r) + '" y="' + f3(nd.y - r) + '" width="' + f3(2 * r) + '" height="' + f3(2 * r) + '"/>'; });
      h += '</g>';
    });
    world.innerHTML = h; drawOver(); drawRulers(); status();
  }
  function segTouches(pc, i) { if (!ST.seg || ST.seg.pc !== pc.id) return false; var n = pc.nodes.length; return ST.seg.i === i || (ST.seg.i + 1) % n === i; }
  function drawGrid() {
    var g = q('#ps-grid'); if (!V().grid) { g.innerHTML = ''; return; }
    var r = svg.getBoundingClientRect(), st = gridStep(), z = ST.z; while (st * z < 6) st *= P.unit === 'in' ? 2 : 5;
    var x0 = Math.floor(-ST.tx / z / st) * st, x1 = (r.width - ST.tx) / z, y0 = Math.floor(-ST.ty / z / st) * st, y1 = (r.height - ST.ty) / z, maj = P.unit === 'in' ? 2.54 : P.unit === 'mm' ? 1 : 5, h = '';
    if ((x1 - x0) / st > 600) { g.innerHTML = ''; return; }
    for (var x = x0; x <= x1; x += st) h += '<path class="' + (Math.abs(x / maj - Math.round(x / maj)) < 1e-6 ? 'gM' : 'gm') + '" d="M' + f3(x) + ' ' + f3(y0) + 'V' + f3(y1) + '"/>';
    for (var y = y0; y <= y1; y += st) h += '<path class="' + (Math.abs(y / maj - Math.round(y / maj)) < 1e-6 ? 'gM' : 'gm') + '" d="M' + f3(x0) + ' ' + f3(y) + 'H' + f3(x1) + '"/>';
    g.innerHTML = h;
  }
  function drawOver() {
    var o = q('#ps-over'), h = '', px = 1 / ST.z, d = ST.draft;
    if (d && d.pts && d.pts.length) { var pp = d.pts.concat(d.cur ? [{ p: d.cur }] : []); h += '<path class="ps-dr" d="M' + pp.map(function (e) { return e.p.map(f3).join(' '); }).join('L') + '"/>'; d.pts.forEach(function (e, i) { h += '<rect class="ps-pt' + (i === 0 ? ' on' : '') + '" x="' + f3(e.p[0] - 4 * px) + '" y="' + f3(e.p[1] - 4 * px) + '" width="' + f3(8 * px) + '" height="' + f3(8 * px) + '"/>'; }); }
    if (d && d.box) { var b = d.box; if (d.kind === 'ellipse' || d.kind === 'iell') h += '<ellipse class="ps-dr" cx="' + f3((b[0] + b[2]) / 2) + '" cy="' + f3((b[1] + b[3]) / 2) + '" rx="' + f3(Math.abs(b[2] - b[0]) / 2) + '" ry="' + f3(Math.abs(b[3] - b[1]) / 2) + '"/>'; else h += '<path class="ps-dr" d="M' + f3(b[0]) + ' ' + f3(b[1]) + 'H' + f3(b[2]) + 'V' + f3(b[3]) + 'H' + f3(b[0]) + 'Z"/>'; }
    if (d && d.line) h += '<path class="ps-dr" d="M' + d.line[0].map(f3).join(' ') + 'L' + d.line[1].map(f3).join(' ') + '"/>';
    if (ST.marq) { var m = ST.marq; h += '<path class="ps-marq" d="M' + f3(m[0]) + ' ' + f3(m[1]) + 'H' + f3(m[2]) + 'V' + f3(m[3]) + 'H' + f3(m[0]) + 'Z"/>'; }
    if (ST.meas.length) { h += '<path class="ps-ms" d="M' + ST.meas.map(function (p) { return p.map(f3).join(' '); }).join('L') + '"/>'; ST.meas.forEach(function (p, i) { h += '<circle class="ps-msp" cx="' + f3(p[0]) + '" cy="' + f3(p[1]) + '" r="' + f3(3 * px) + '"/>'; if (i) { var a = ST.meas[i - 1]; h += '<text class="ps-mt" x="' + f3((a[0] + p[0]) / 2) + '" y="' + f3((a[1] + p[1]) / 2 - 6 * px) + '" font-size="' + f3(12 * px) + '">' + esc(F(C.dist(a, p))) + '</text>'; } }); }
    if (ST.cut.length) ST.cut.forEach(function (c) { var pc = pcById(c.pc), w = L2W(pc, c.p); h += '<circle class="ps-msp" cx="' + f3(w[0]) + '" cy="' + f3(w[1]) + '" r="' + f3(5 * px) + '"/>'; });
    if (ST.hover) h += '<circle class="ps-snap" cx="' + f3(ST.hover[0]) + '" cy="' + f3(ST.hover[1]) + '" r="' + f3(5 * px) + '"/>';
    o.innerHTML = h;
  }
  function drawRulers() {
    var on = V().rulers !== false; rx.hidden = ry.hidden = q('#ps-ucorner').hidden = !on; root.classList.toggle('noru', !on); if (!on) return;
    var dpr = window.devicePixelRatio || 1;
    [[rx, 'x'], [ry, 'y']].forEach(function (A) {
      var c = A[0], r = c.getBoundingClientRect(), W = r.width, Hh = r.height; c.width = W * dpr; c.height = Hh * dpr; var g = c.getContext('2d'); g.scale(dpr, dpr); g.fillStyle = '#f6f1ea'; g.fillRect(0, 0, W, Hh); g.strokeStyle = '#8a7f74'; g.fillStyle = '#5b5148'; g.font = '10px system-ui'; g.lineWidth = 1;
      var unit = P.unit === 'in' ? 2.54 : P.unit === 'mm' ? .1 : 1, step = unit; while (step * ST.z < 8) step *= (P.unit === 'in' ? 2 : step / unit < 1 ? 10 : (String(Math.round(step / unit))[0] === '1' ? 5 : 2)); var lab = step * 5;
      var off = A[1] === 'x' ? ST.tx - 24 : ST.ty - 24, len = A[1] === 'x' ? W : Hh, a0 = Math.floor(-off / ST.z / step) * step;
      for (var v = a0; v * ST.z + off < len; v += step) { var s = Math.round(v * ST.z + off) + .5, k = Math.round(v / step), big = k % 5 === 0; g.beginPath(); if (A[1] === 'x') { g.moveTo(s, Hh); g.lineTo(s, Hh - (big ? 10 : 5)); } else { g.moveTo(W, s); g.lineTo(W - (big ? 10 : 5), s); } g.stroke();
        if (big) { var t = String(+(C.toU(v, P.unit)).toFixed(P.unit === 'in' ? 2 : P.unit === 'mm' ? 0 : 1)); if (A[1] === 'x') g.fillText(t, s + 2, 10); else { g.save(); g.translate(10, s - 2); g.rotate(-Math.PI / 2); g.fillText(t, 0, 0); g.restore(); } } }
      void lab;
    });
    q('#ps-ucorner').textContent = P.unit;
  }
  function status(msg) {
    var t = TOOL[ST.tool], sel = ST.sel.length, tot = P.pieces.length, z = Math.round(ST.z / pxPerCm() * 100);
    statusEl.innerHTML = '<b>' + esc(t ? t.n : '') + '</b><span>' + esc(msg || ST.msg || hint()) + '</span><span class="ps-sp"></span>' + (ST.cursor ? '<span>X ' + U(ST.cursor[0]) + ' · Y ' + U(ST.cursor[1]) + ' ' + P.unit + '</span>' : '') + '<span>' + sel + ' of ' + tot + ' selected</span><span>' + z + '%</span><span>Snap ' + (V().snap ? 'on' : 'off') + '</span>';
  }
  function hint() { var t = TOOL[ST.tool]; if (ST.tool === 'poly' && ST.draft) return ST.draft.pts.length + ' points. Click the first point or press Enter to close. Esc cancels.'; if (ST.tool === 'cut' && ST.cut.length) return 'Now click the second point on the same piece.'; if (ST.tool === 'merge' && ST.walk.length === 1) return 'Now click the matching edge on the other piece.'; if (ST.tool === 'walk' && ST.walk.length === 1) return 'Now click the edge it is sewn to.'; return t ? t.tip.split('. ')[0] + '.' : ''; }
  function pxPerCm() { return 96 / 2.54; }
  function toast(t, bad) { toastEl.textContent = t; toastEl.className = 'ps-toast' + (bad ? ' bad' : ''); toastEl.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.hidden = true; }, bad ? 6000 : 3000); }

  /* ---------- change handling ---------- */
  function onChange() { syncLinks(); ST.dirty = true; clearTimeout(timer); timer = setTimeout(autosave, 700); }
  function syncLinks() { P.pieces.forEach(function (pc) { if (pc.link && pc.link.on) { var src = pcById(pc.link.to); if (src) C.syncLinked(src, pc); else pc.link = null; } }); }
  function autosave() { ls(AUTO, { t: Date.now(), p: P, file: ST.fileName }); savedLabel(); }
  function savedLabel() { var el = q('#ps-saved'); if (!el) return; el.textContent = ST.dirty ? (ST.savedAt ? 'Autosaved · changes not saved to a project' : 'Autosaved') : (ST.savedAt ? 'Saved' : ''); }
  function act(label, fn) { var ok = H.exec(label, fn); if (ok !== false) refresh(); return ok; }
  function refresh() { draw(); objects(); props(); q('#ps-name').value = P.name; qa('#ps-units button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.u === P.unit); }); qa('[data-v]').forEach(function (c) { c.checked = V()[c.dataset.v] !== false; }); q('[data-a=undo]').disabled = !H.u.length; q('[data-a=redo]').disabled = !H.r.length; savedLabel(); }
  function selected() { return ST.sel.map(pcById).filter(Boolean); }

  /* ---------- objects panel ---------- */
  function objects() {
    if (!P.pieces.length) { objsEl.innerHTML = '<p class="ps-empty">No pieces yet. Draw one with the Draw tools, add a rectangle, or bring in the Pattern Maker draft.</p>'; return; }
    objsEl.innerHTML = P.pieces.map(function (pc) { var on = ST.sel.indexOf(pc.id) >= 0, bad = C.validate(pc).length;
      return '<div class="ps-ob' + (on ? ' on' : '') + '" data-pc="' + pc.id + '"><button type="button" class="ps-eye" data-a="vis" data-pc="' + pc.id + '" aria-pressed="' + !pc.hidden + '" title="' + (pc.hidden ? 'Show' : 'Hide') + '">' + (pc.hidden ? '◌' : '●') + '</button><span class="ps-on">' + esc(pc.name || 'Piece') + (bad ? ' <i title="Has problems: see Properties">!</i>' : '') + (pc.link && pc.link.on ? ' <i class="lk" title="Linked copy">⇄</i>' : '') + '</span><button type="button" class="ps-lk" data-a="lock" data-pc="' + pc.id + '" aria-pressed="' + !!pc.locked + '" title="' + (pc.locked ? 'Unlock' : 'Lock') + '">' + (pc.locked ? '🔒' : '·') + '</button></div>'
        + (on && pc.internals.length ? '<div class="ps-obs">' + pc.internals.map(function (it) { return '<div data-it="' + it.id + '" data-pc="' + pc.id + '" class="' + (ST.it === it.id ? 'on' : '') + '">' + esc((it.label || it.purpose || it.kind) + ' · ' + it.kind) + '</div>'; }).join('') + '</div>' : ''); }).join('');
  }

  /* ---------- properties panel ---------- */
  function row(lab, inner, cls) { return '<label class="ps-r' + (cls ? ' ' + cls : '') + '"><span>' + lab + '</span>' + inner + '</label>'; }
  function num(k, v, step, extra) { return '<span class="ps-u"><input type="number" step="' + (step || 'any') + '" data-k="' + k + '" value="' + v + '"' + (extra || '') + '><i>' + P.unit + '</i></span>'; }
  function plain(k, v, step, unit, extra) { return '<span class="ps-u"><input type="number" step="' + (step || 'any') + '" data-k="' + k + '" value="' + v + '"' + (extra || '') + '><i>' + (unit || '') + '</i></span>'; }
  function btn(a, t, cls, title) { return '<button type="button" class="ps-b' + (cls ? ' ' + cls : '') + '" data-a="' + a + '"' + (title ? ' title="' + esc(title) + '"' : '') + '>' + t + '</button>'; }
  function selOpt(k, v, opts) { return '<select data-k="' + k + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === String(v) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'; }
  function props() {
    var h = '', pcs = selected();
    if (ST.tool === 'walk' && ST.walk.length) h += walkPanel();
    else if (ST.node && pcById(ST.node.pc)) h += nodePanel(pcById(ST.node.pc));
    else if (ST.seg && pcById(ST.seg.pc)) h += segPanel(pcById(ST.seg.pc), ST.seg.i);
    else if (ST.notch && notchOf(ST.notch)) h += notchPanel(notchOf(ST.notch));
    else if (ST.it && itOf(ST.it)) h += itPanel(itOf(ST.it));
    else if (pcs.length === 1) h += piecePanel(pcs[0]);
    else if (pcs.length > 1) h += multiPanel(pcs);
    else h += '<h5>Project</h5>' + row('Name', '<input data-k="pname" value="' + esc(P.name) + '">') + '<p class="ps-n">Select a piece to see its information, seam allowance and transforms. Select a point or edge with Edit pattern to type exact values.</p>'
      + '<h5>Shortcuts</h5><dl class="ps-kb"><dt>V A H</dt><dd>Select, Edit pattern, Pan</dd><dt>P R E</dt><dd>Polygon, Rectangle, Ellipse</dd><dt>N G M W S</dt><dd>Notch, Grainline, Measure, Seam walk, Seam allowance</dd><dt>Ctrl Z / Ctrl Shift Z</dt><dd>Undo, redo</dd><dt>Ctrl D</dt><dd>Duplicate</dd><dt>Delete</dt><dd>Delete the selection</dd><dt>Arrows</dt><dd>Nudge 1 grid step (Shift: 10)</dd><dt>0 / 1</dt><dd>Fit all, actual size</dd></dl>';
    propsEl.innerHTML = h;
  }
  function issuesHtml(pc) { var is = C.validate(pc), cl = C.cutLine(pc); var all = is.map(function (i) { return i.msg; }).concat(cl.warn); return all.length ? '<div class="ps-warn">' + all.map(function (m) { return '<p>' + esc(m) + '</p>'; }).join('') + '</div>' : ''; }
  function piecePanel(pc) {
    var bb = C.bbox(pc), cl = C.cutLine(pc).pts, cb = [Math.min.apply(0, cl.map(function (q2) { return q2[0]; })), Math.min.apply(0, cl.map(function (q2) { return q2[1]; })), Math.max.apply(0, cl.map(function (q2) { return q2[0]; })), Math.max.apply(0, cl.map(function (q2) { return q2[1]; }))];
    var segs = []; for (var i = 0; i < C.segCount(pc); i++) segs.push([i, 'Edge ' + (i + 1) + ' (' + F(C.segLen(pc, i)) + ')']);
    return '<h5>Piece</h5>' + issuesHtml(pc)
      + row('Name', '<input data-k="name" value="' + esc(pc.name) + '">') + row('Category', selOpt('cat', pc.cat, [['', '—'], ['body', 'Body'], ['sleeve', 'Sleeve'], ['collar', 'Collar'], ['cuff', 'Cuff'], ['facing', 'Facing'], ['pocket', 'Pocket'], ['waistband', 'Waistband'], ['yoke', 'Yoke'], ['lining', 'Lining'], ['interlining', 'Interfacing'], ['trim', 'Trim'], ['other', 'Other']]))
      + row('Size', '<input data-k="size" value="' + esc(pc.size) + '">') + row('Cut quantity', plain('qty', pc.qty, 1, 'pcs', ' min="1"')) + row('Cut as a mirrored pair', '<input type="checkbox" data-k="pair"' + (pc.pair ? ' checked' : '') + '>', 'chk')
      + row('Fabric', '<input data-k="fabric" value="' + esc(pc.fabric) + '" placeholder="Main, lining, contrast…">') + row('Cut on the fold', selOpt('fold', pc.fold, [[-1, 'Not on fold']].concat(segs)))
      + row('Notes', '<textarea data-k="notes" rows="2">' + esc(pc.notes) + '</textarea>', 'wide')
      + '<h5>Measurements</h5><dl class="ps-kv"><dt>Seamline width × height</dt><dd>' + F(bb[2] - bb[0]) + ' × ' + F(bb[3] - bb[1]) + '</dd><dt>Cutting size</dt><dd>' + F(cb[2] - cb[0]) + ' × ' + F(cb[3] - cb[1]) + '</dd><dt>Seamline length</dt><dd>' + F(C.perimeter(pc)) + '</dd><dt>Area, net</dt><dd>' + (P.unit === 'in' ? (C.area(pc) / 6.4516).toFixed(1) + ' sq in' : (C.area(pc)).toFixed(1) + ' cm²') + '</dd><dt>Points · edges</dt><dd>' + pc.nodes.length + ' · ' + C.segCount(pc) + '</dd></dl>'
      + '<h5>Seam allowance</h5>' + row('Seams', num('sadef', U(pc.sa.def), C.UNITS[P.unit].step, ' min="0"')) + row('Hems', num('sahem', U(pc.sa.hem), C.UNITS[P.unit].step, ' min="0"'))
      + row('Hem edges', '<span class="ps-chips">' + segs.map(function (s) { return '<label><input type="checkbox" data-hem="' + s[0] + '"' + (pc.hems.indexOf(s[0]) >= 0 ? ' checked' : '') + '>' + (s[0] + 1) + '</label>'; }).join('') + '</span>', 'wide')
      + row('Show seamline', '<input type="checkbox" data-k="showSeam"' + (V().seam ? ' checked' : '') + '>', 'chk') + row('Show cutting line', '<input type="checkbox" data-k="showCut"' + (V().sa ? ' checked' : '') + '>', 'chk')
      + '<p class="ps-n">Click an edge with the Seam allowance tool to give it its own width or corner. Fold edges always have none.</p>'
      + transformPanel(pc)
      + '<h5>Copies</h5><div class="ps-bs">' + btn('dup', 'Duplicate') + btn('linked', 'Linked copy', '', 'A copy that changes shape with this piece') + btn('mirrorcopy', 'Mirrored copy', '', 'A reflected copy that changes with this piece') + (pc.fold >= 0 ? btn('unfold', 'Unfold on the fold edge') : '') + (pc.link ? btn('unlink', pc.link.on ? 'Break the link' : 'Linked: off') : '') + btn('reverse', 'Reverse direction', '', 'Swap the order of the points; does not change the shape') + '</div>'
      + '<div class="ps-bs">' + btn('lock1', pc.locked ? 'Unlock' : 'Lock') + btn('hide1', 'Hide') + btn('del', 'Delete piece', 'bad') + '</div>';
  }
  function transformPanel(pc) {
    var bb = pc ? C.bbox(pc) : null;
    return '<h5>Transform</h5>' + (pc ? row('Position X', num('px', U(bb[0] + (pc.x || 0)), C.UNITS[P.unit].step)) + row('Position Y', num('py', U(bb[1] + (pc.y || 0)), C.UNITS[P.unit].step)) : '')
      + row('Pivot', selOpt('pivot', ST.pivot || 'c', [['c', 'Centre'], ['tl', 'Top left'], ['tr', 'Top right'], ['bl', 'Bottom left'], ['br', 'Bottom right'], ['xy', 'Exact point…']]))
      + (ST.pivot === 'xy' ? row('Pivot X', num('pvx', U(ST.pv ? ST.pv[0] : 0))) + row('Pivot Y', num('pvy', U(ST.pv ? ST.pv[1] : 0))) : '')
      + '<div class="ps-tr">' + plain('rot', ST.rotV || 90, 'any', '°') + btn('rot', 'Rotate') + btn('rotm', '−') + '</div>'
      + '<div class="ps-tr">' + plain('scx', ST.scx || 100, 'any', '% W') + plain('scy', ST.scy || 100, 'any', '% H') + btn('scale', 'Scale') + '</div><p class="ps-n">Scaling changes the shape. It is not grading: use grading to make sizes.</p>'
      + '<div class="ps-bs">' + btn('mirh', 'Mirror ↔') + btn('mirv', 'Mirror ↕') + '</div>';
  }
  function multiPanel(pcs) {
    return '<h5>' + pcs.length + ' pieces selected</h5><h5>Align</h5><div class="ps-bs ic">' + [['al', 'Left'], ['ac', 'Centres'], ['ar', 'Right'], ['at', 'Top'], ['am', 'Middles'], ['ab', 'Bottom']].map(function (a) { return btn('align-' + a[0], a[1]); }).join('') + '</div>'
      + '<h5>Distribute</h5><div class="ps-bs">' + btn('dist-h', 'Horizontally') + btn('dist-v', 'Vertically') + '</div>' + row('Gap', num('gap', U(ST.gap == null ? 3 : ST.gap))) + '<div class="ps-bs">' + btn('gap-h', 'Space in a row') + btn('gap-v', 'Space in a column') + '</div>'
      + transformPanel(null) + '<div class="ps-bs">' + btn('dup', 'Duplicate all') + btn('del', 'Delete all', 'bad') + '</div>';
  }
  function nodePanel(pc) {
    var idx = ST.node.idx, nd = pc.nodes[idx[0]], n = pc.nodes.length;
    if (idx.length > 1) return '<h5>' + idx.length + ' points on ' + esc(pc.name) + '</h5><p class="ps-n">Drag any of them to move them together, or move them by an exact amount.</p>' + row('Move X by', num('ndx', 0)) + row('Move Y by', num('ndy', 0)) + '<div class="ps-bs">' + btn('nmove', 'Move') + btn('nsmooth', 'Smooth') + btn('ndel', 'Delete points', 'bad') + '</div><h5>Transform these points</h5><div class="ps-tr">' + plain('nrotv', 5, 'any', '°') + btn('nrot', 'Rotate') + '</div><div class="ps-tr">' + plain('nscv', 100, 'any', '%') + btn('nscale', 'Scale') + '</div><p class="ps-n">About the centre of the selected points. The rest of the piece stays where it is.</p>';
    var ang = C.angleAtNode(pc, idx[0]), prevL = C.segLen(pc, (idx[0] - 1 + n) % n), nextL = C.segLen(pc, idx[0]);
    return '<h5>Point ' + (idx[0] + 1) + ' of ' + n + ' · ' + esc(pc.name) + '</h5>'
      + row('X', num('nx', U(nd.x + (pc.x || 0)), C.UNITS[P.unit].step)) + row('Y', num('ny', U(nd.y + (pc.y || 0)), C.UNITS[P.unit].step))
      + row('Move by X', num('ndx', 0)) + row('Move by Y', num('ndy', 0)) + '<div class="ps-bs">' + btn('nmove', 'Move by') + '</div>'
      + row('Type', selOpt('ntype', nd.smooth ? 'smooth' : 'corner', [['corner', 'Corner'], ['smooth', 'Smooth']]))
      + '<dl class="ps-kv"><dt>Angle here</dt><dd>' + ang.toFixed(1) + '°</dd><dt>Edge before</dt><dd>' + F(prevL) + '</dd><dt>Edge after</dt><dd>' + F(nextL) + '</dd></dl>'
      + '<div class="ps-bs">' + btn('nline', 'Straighten both edges') + btn('ncurve', 'Curve both edges') + btn('ndel', 'Delete point', 'bad') + '</div>';
  }
  function segPanel(pc, i) {
    var k = C.ctrl(pc, i), L = C.segLen(pc, i), sa = pc.sa.edges[i];
    return '<h5>Edge ' + (i + 1) + ' of ' + C.segCount(pc) + ' · ' + esc(pc.name) + '</h5>'
      + '<dl class="ps-kv"><dt>Length along the ' + (k.curved ? 'curve' : 'line') + '</dt><dd>' + F(L) + '</dd><dt>Straight distance</dt><dd>' + F(C.dist(k.p0, k.p3)) + '</dd><dt>Type</dt><dd>' + (k.curved ? 'Curve' : 'Straight') + (i === pc.fold ? ' · fold' : pc.hems.indexOf(i) >= 0 ? ' · hem' : '') + '</dd></dl>'
      + '<div class="ps-bs">' + (k.curved ? btn('sline', 'Make straight') : btn('scurve', 'Make a curve')) + btn('ssmooth', 'Smooth joins') + '</div>'
      + row('Bend by', num('sbend', U(.5))) + '<div class="ps-bs">' + btn('sbend', 'Bend out') + btn('sbendin', 'Bend in') + '</div>'
      + '<h5>Add points</h5>' + row('Split at distance', num('sdist', U(L / 2))) + '<div class="ps-tr">' + selOpt('sfrom', 'start', [['start', 'from the start'], ['end', 'from the end']]) + btn('ssplit', 'Add point') + '</div>'
      + '<div class="ps-tr">' + plain('sparts', 2, 1, 'parts', ' min="2" max="20"') + btn('sdivide', 'Divide equally') + '</div>'
      + '<h5>Seam allowance for this edge</h5>' + row('Allowance', num('esa', U(C.saOf(pc, i)), C.UNITS[P.unit].step, ' min="0"' + (i === pc.fold ? ' disabled' : ''))) + (sa != null ? '<p class="ps-n">This edge has its own allowance. ' + btn('esareset', 'Use the piece default') + '</p>' : '')
      + row('This edge is', selOpt('ekind', i === pc.fold ? 'fold' : pc.hems.indexOf(i) >= 0 ? 'hem' : 'seam', [['seam', 'A seam'], ['hem', 'A hem'], ['fold', 'On the fold (no allowance)']]))
      + row('Corner at its end', selOpt('ecorner', pc.sa.corner[(i + 1) % pc.nodes.length] || 'miter', [['miter', 'Meet (mitred)'], ['square', 'Squared off'], ['step', 'Stepped (each allowance square to its edge)']]))
      + '<h5>Notches</h5><div class="ps-bs">' + btn('enotchmid', 'Notch at the middle') + '</div><h5>Facing</h5>' + row('Width', num('efw', U(ST.o && ST.o.fw || 4), C.UNITS[P.unit].step, ' min="0"')) + '<div class="ps-bs">' + btn('efacing', 'Trace a facing along this edge') + '</div>';
  }
  function notchOf(id) { for (var i = 0; i < P.pieces.length; i++) for (var j = 0; j < P.pieces[i].notches.length; j++) if (P.pieces[i].notches[j].id === id) return { pc: P.pieces[i], nt: P.pieces[i].notches[j] }; return null; }
  function itOf(id) { for (var i = 0; i < P.pieces.length; i++) for (var j = 0; j < P.pieces[i].internals.length; j++) if (P.pieces[i].internals[j].id === id) return { pc: P.pieces[i], it: P.pieces[i].internals[j] }; return null; }
  function notchPanel(o) {
    var nt = o.nt, r = C.notchPos(o.pc, nt);
    return '<h5>Notch on edge ' + (nt.seg + 1) + ' · ' + esc(o.pc.name) + '</h5>' + row('Position by', selOpt('ntmode', nt.mode === 'pct' ? 'pct' : nt.mode === 'mid' ? 'mid' : nt.from === 'end' ? 'end' : 'start', [['start', 'Distance from the start'], ['end', 'Distance from the end'], ['pct', 'Percent of the edge'], ['mid', 'Middle of the edge']]))
      + (nt.mode === 'pct' ? row('Percent', plain('ntv', +nt.v.toFixed(1), 'any', '%')) : nt.mode === 'mid' ? '' : row('Distance', num('ntv', U(nt.v), C.UNITS[P.unit].step, ' min="0"')))
      + '<dl class="ps-kv"><dt>Edge length</dt><dd>' + F(r.L) + '</dd><dt>From start</dt><dd>' + F(r.s) + '</dd></dl>'
      + row('Type', selOpt('nttype', nt.type || 'single', [['single', 'Single'], ['double', 'Double (back)'], ['t', 'T-notch'], ['v', 'V-notch']])) + row('Depth', num('ntdepth', U(nt.depth || .6), C.UNITS[P.unit].step, ' min="0"'))
      + '<div class="ps-bs">' + btn('ntdel', 'Delete notch', 'bad') + '</div>';
  }
  function itPanel(o) {
    var it = o.it;
    return '<h5>Internal ' + esc(it.kind) + ' · ' + esc(o.pc.name) + '</h5>' + row('Label', '<input data-k="itlabel" value="' + esc(it.label || '') + '">')
      + row('Purpose', selOpt('itpurpose', it.purpose || 'guide', [['guide', 'Guide line'], ['fold', 'Fold line'], ['placement', 'Placement mark'], ['stitch', 'Stitch line'], ['cutout', 'Cut-out (cut away)'], ['pocket', 'Pocket position'], ['cutting', 'Drill hole or cutting mark']]))
      + row('Line', selOpt('itstyle', it.style || 'solid', [['solid', 'Solid'], ['dashed', 'Dashed']])) + row('Show', '<input type="checkbox" data-k="itvis"' + (it.visible !== false ? ' checked' : '') + '>', 'chk')
      + (it.kind === 'line' ? '<dl class="ps-kv"><dt>Length</dt><dd>' + F(C.measure.poly(it.pts)) + '</dd></dl>' : '') + (it.kind === 'ellipse' ? row('Width', num('itrx', U(it.r[0] * 2))) + row('Height', num('itry', U(it.r[1] * 2))) : '')
      + '<p class="ps-n">' + ({ fold: 'Fold lines are folded, not cut: they export on the INTERNAL layer.', cutout: 'Cut-outs are cut away from the piece when it is cut.', placement: 'Placement marks show where a pocket, label or trim goes.', stitch: 'Stitch lines are sewn but not cut.', pocket: 'Pocket position for the pocket bag or patch.', cutting: 'Drill holes are punched through the lay to mark the position.' }[it.purpose] || 'Guide lines help drafting and are not cut.') + '</p>'
      + '<div class="ps-bs">' + (it.kind !== 'line' && it.kind !== 'point' ? btn('ittrace', 'Trace to a piece') : '') + btn('itdel', 'Delete', 'bad') + '</div>';
  }
  function walkPanel() {
    var w = ST.walk, a = w[0], b = w[1], pa = pcById(a.pc), la = C.segLen(pa, a.seg);
    var h = '<h5>Seam walk</h5><dl class="ps-kv"><dt>First edge</dt><dd>' + esc(pa.name) + ', edge ' + (a.seg + 1) + ': ' + F(la) + '</dd>';
    if (!b) return h + '</dl><p class="ps-n">Now click the edge it is sewn to.</p>';
    var pb = pcById(b.pc), lb = C.segLen(pb, b.seg), r = C.walk({ len: la }, { len: lb }, CM(ST.ease == null ? 0 : U(ST.ease)));
    return h + '<dt>Second edge</dt><dd>' + esc(pb.name) + ', edge ' + (b.seg + 1) + ': ' + F(lb) + '</dd><dt>Difference</dt><dd>' + (r.diff >= 0 ? '+' : '−') + F(Math.abs(r.diff)) + '</dd></dl>'
      + row('Planned ease on the first edge', num('ease', U(ST.ease || 0), C.UNITS[P.unit].step))
      + '<p class="ps-check ' + (r.ok ? 'ok' : 'no') + '">' + (r.ok ? 'Matches the planned ease (within 3 mm).' : 'Off by ' + F(Math.abs(r.off)) + ' from the planned ease. ' + (r.off > 0 ? 'The first edge is longer than planned.' : 'The first edge is shorter than planned.')) + '</p>'
      + '<div class="ps-bs">' + btn('walkclear', 'Start again') + '</div>';
  }

  /* ---------- property edits ---------- */
  function onProp(e) {
    var el = e.target, k = el.dataset.k; if (!k && el.dataset.hem == null) return;
    var val = el.type === 'checkbox' ? el.checked : el.value, pc = selected()[0];
    if (el.dataset.hem != null) return act('Set hem edges', function () { var p = selected()[0], s = +el.dataset.hem; p.hems = p.hems.filter(function (j) { return j !== s; }); if (el.checked) p.hems.push(s); });
    if (k === 'pname') return act('Rename project', function () { P.name = val || 'Untitled pattern'; });
    if (['rot', 'scx', 'scy', 'gap', 'pvx', 'pvy', 'ease', 'ndx', 'ndy', 'sbend', 'sdist', 'sparts', 'sfrom', 'efw', 'nrotv', 'nscv'].indexOf(k) >= 0) { if (k === 'rot') ST.rotV = +val; if (k === 'scx') ST.scx = +val; if (k === 'scy') ST.scy = +val; if (k === 'gap') ST.gap = CM(val); if (k === 'pvx' || k === 'pvy') { ST.pv = ST.pv || [0, 0]; ST.pv[k === 'pvx' ? 0 : 1] = CM(val); } if (k === 'ease') { ST.ease = CM(val); props(); } return; }
    if (k === 'pivot') { ST.pivot = val; props(); return; }
    if (k === 'showSeam' || k === 'showCut') return act('Visibility', function () { V()[k === 'showSeam' ? 'seam' : 'sa'] = val; });
    if (ST.node && k && /^n/.test(k) && k !== 'name' && k !== 'notes') { var np = pcById(ST.node.pc), i = ST.node.idx[0];
      if (k === 'nx' || k === 'ny') return act('Move point', function () { var nd = np.nodes[i]; if (k === 'nx') nd.x = CM(val) - (np.x || 0); else nd.y = CM(val) - (np.y || 0); });
      if (k === 'ntype') return act('Point type', function () { var nd = np.nodes[i]; nd.smooth = val === 'smooth'; if (nd.smooth) C.smooth(np, [(i - 1 + np.nodes.length) % np.nodes.length, i], 1, 180); }); }
    if (ST.seg && /^e/.test(k)) { var sp = pcById(ST.seg.pc), si = ST.seg.i;
      if (k === 'esa') return act('Edge seam allowance', function () { sp.sa.edges[si] = Math.max(0, CM(val)); });
      if (k === 'ekind') return act('Edge type', function () { sp.hems = sp.hems.filter(function (j) { return j !== si; }); if (sp.fold === si) sp.fold = -1; if (val === 'hem') sp.hems.push(si); if (val === 'fold') { sp.fold = si; delete sp.sa.edges[si]; } });
      if (k === 'ecorner') return act('Corner shape', function () { sp.sa.corner[(si + 1) % sp.nodes.length] = val; }); }
    if (ST.notch && /^nt/.test(k)) { var o = notchOf(ST.notch);
      return act('Edit notch', function () { var nt = o.nt, r = C.notchPos(o.pc, nt);
        if (k === 'ntmode') { if (val === 'pct') { nt.mode = 'pct'; nt.v = r.s / r.L * 100; } else if (val === 'mid') nt.mode = 'mid'; else { nt.mode = 'dist'; nt.from = val; nt.v = val === 'end' ? r.L - r.s : r.s; } }
        if (k === 'ntv') nt.v = nt.mode === 'pct' ? Math.max(0, Math.min(100, +val)) : Math.max(0, Math.min(r.L, CM(val)));
        if (k === 'nttype') nt.type = val; if (k === 'ntdepth') nt.depth = Math.max(.1, CM(val)); }); }
    if (ST.it && /^it/.test(k)) { var io = itOf(ST.it);
      return act('Edit internal', function () { var it = io.it; if (k === 'itlabel') it.label = val; if (k === 'itpurpose') { it.purpose = val; if (val === 'fold' || val === 'stitch') it.style = 'dashed'; } if (k === 'itstyle') it.style = val; if (k === 'itvis') it.visible = val; if (k === 'itrx') it.r[0] = Math.max(.1, CM(val) / 2); if (k === 'itry') it.r[1] = Math.max(.1, CM(val) / 2); }); }
    if (!pc) return;
    return act('Edit piece', function () { var p = selected()[0];
      if (k === 'name') { p.name = val; p.auto = false; } else if (k === 'qty') p.qty = Math.max(1, Math.round(+val || 1)); else if (k === 'fold') { p.fold = +val; if (p.fold >= 0) delete p.sa.edges[p.fold]; }
      else if (k === 'sadef') p.sa.def = Math.max(0, CM(val)); else if (k === 'sahem') p.sa.hem = Math.max(0, CM(val));
      else if (k === 'px' || k === 'py') { var bb = C.bbox(p); if (k === 'px') p.x = CM(val) - bb[0]; else p.y = CM(val) - bb[1]; }
      else if (['cat', 'size', 'fabric', 'notes', 'pair'].indexOf(k) >= 0) p[k] = val; });
  }
  function pivotOf(pcs) { var b = [1e9, 1e9, -1e9, -1e9]; pcs.forEach(function (pc) { var bb = C.bbox(pc); b[0] = Math.min(b[0], bb[0] + pc.x); b[1] = Math.min(b[1], bb[1] + pc.y); b[2] = Math.max(b[2], bb[2] + pc.x); b[3] = Math.max(b[3], bb[3] + pc.y); }); var p = ST.pivot || 'c'; return p === 'xy' && ST.pv ? ST.pv : p === 'tl' ? [b[0], b[1]] : p === 'tr' ? [b[2], b[1]] : p === 'bl' ? [b[0], b[3]] : p === 'br' ? [b[2], b[3]] : [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]; }
  function xfSel(label, mk) { var pcs = selected().filter(function (p) { return !p.locked; }); if (!pcs.length) return toast('Select an unlocked piece first.', 1); var pv = pivotOf(pcs); act(label, function () { pcs.forEach(function (pc) { var m = mk(pv[0] - pc.x, pv[1] - pc.y); C.transformPiece(pc, m); }); }); }
  function bboxW(pc) { var b = C.bbox(pc); return [b[0] + pc.x, b[1] + pc.y, b[2] + pc.x, b[3] + pc.y]; }

  /* ---------- actions ---------- */
  function doAct(a, el) {
    var pcs = selected(), pc = pcs[0];
    switch (a) {
      case 'new': return confirmDiscard(function () { newProject(); });
      case 'open': return openLib();
      case 'openfile': return q('#ps-file').click();
      case 'save': return save(false);
      case 'saveas': return save(true);
      case 'savefile': dl(fname('fcpattern.json'), C.serialize(P), 'application/json'); return toast('Project file downloaded. Open it later with File › Open project file.');
      case 'fromdraft': return fromDraft();
      case 'importdxf': return q('#ps-dxf').click();
      case 'xsvg': case 'xdxf': case 'xpdf': case 'xpdft': case 'xpng': return exportAs(a);
      case 'fit': return fit();
      case 'z100': ST.z = pxPerCm(); return draw();
      case 'undo': if (H.undo()) { tidySel(); refresh(); toast('Undone.'); } return;
      case 'redo': if (H.redo()) { tidySel(); refresh(); toast('Redone.'); } return;
      case 'close': return close();
      case 'rect10': return act('Add rectangle', function () { var c = viewCentre(), r = C.rect(c[0] - 10, c[1] - 15, 20, 30, { name: 'Piece ' + (P.pieces.length + 1) }); P.pieces.push(r); ST.sel = [r.id]; });
      case 'vis': return act('Show or hide', function () { var p = pcById(el.dataset.pc); p.hidden = !p.hidden; if (p.hidden) ST.sel = ST.sel.filter(function (i) { return i !== p.id; }); });
      case 'lock': return act('Lock', function () { var p = pcById(el.dataset.pc); p.locked = !p.locked; });
      case 'lock1': return act('Lock', function () { pc.locked = !pc.locked; });
      case 'hide1': return act('Hide', function () { pc.hidden = true; ST.sel = []; });
      case 'del': if (pcs.some(function (p) { return p.locked; })) return toast('Unlock the piece first.', 1); return act('Delete', function () { P.pieces = P.pieces.filter(function (p) { return ST.sel.indexOf(p.id) < 0; }); P.pieces.forEach(function (p) { if (p.link && ST.sel.indexOf(p.link.to) >= 0) p.link = null; }); ST.sel = []; });
      case 'dup': case 'linked': case 'mirrorcopy': return act(a === 'dup' ? 'Duplicate' : a === 'linked' ? 'Linked copy' : 'Mirrored copy', function () { var made = pcs.map(function (p) { var c = C.duplicate(p, a === 'dup' ? 'copy' : a === 'linked' ? 'linked' : 'mirror'); c.x = p.x; c.y = p.y; P.pieces.push(c); return c.id; }); ST.sel = made; });
      case 'unlink': return act('Break link', function () { pc.link = null; });
      case 'unfold': return act('Unfold', function () { var f = C.unfold(pc, pc.fold); f.x = pc.x; f.y = pc.y; f.id = pc.id; f.qty = pc.qty; f.size = pc.size; f.sa.def = pc.sa.def; f.sa.hem = pc.sa.hem; P.pieces[P.pieces.indexOf(pc)] = f; });
      case 'reverse': return act('Reverse direction', function () { C.reverse(pc); });
      case 'rot': case 'rotm': var ang = +(ST.rotV || 90) * (a === 'rotm' ? -1 : 1); return xfSel('Rotate ' + ang + '°', function (px, py) { return C.M.rot(ang, px, py); });
      case 'scale': var sx = (ST.scx || 100) / 100, sy = (ST.scy || 100) / 100; if (!(sx > 0 && sy > 0)) return toast('Scale must be more than 0%.', 1); return xfSel('Scale', function (px, py) { return C.M.scale(sx, sy, px, py); });
      case 'mirh': return xfSel('Mirror', function (px) { return C.M.mirX(px); });
      case 'mirv': return xfSel('Mirror', function (px, py) { return C.M.mirY(py); });
      case 'dist-h': case 'dist-v': case 'gap-h': case 'gap-v': return arrange(a);
      case 'nmove': var dx = CM(q('[data-k=ndx]').value || 0), dy = CM(q('[data-k=ndy]').value || 0); return act('Move points', function () { C.moveNodes(pcById(ST.node.pc), ST.node.idx, dx, dy); });
      case 'nsmooth': return act('Smooth', function () { var p = pcById(ST.node.pc), n = p.nodes.length, segs = []; ST.node.idx.forEach(function (i) { segs.push((i - 1 + n) % n, i); }); var r = C.smooth(p, segs, 1, 180); toast('Smoothed. Length change ' + (r.change >= 0 ? '+' : '−') + F(Math.abs(r.change)) + '.'); });
      case 'ndel': var np = pcById(ST.node.pc); if (np.nodes.length - ST.node.idx.length < 3) return toast('A piece needs at least three points.', 1); return act('Delete point', function () { ST.node.idx.slice().sort(function (x, y) { return y - x; }).forEach(function (i) { C.deleteNode(np, i); }); ST.node = null; });
      case 'nline': case 'ncurve': return act(a === 'nline' ? 'Straighten' : 'Curve', function () { var p = pcById(ST.node.pc), i = ST.node.idx[0], n = p.nodes.length; [(i - 1 + n) % n, i].forEach(function (s) { if (a === 'nline') C.toLine(p, s); else C.toCurve(p, s); }); });
      case 'sline': case 'scurve': return act(a === 'sline' ? 'Make straight' : 'Make a curve', function () { var p = pcById(ST.seg.pc); if (a === 'sline') C.toLine(p, ST.seg.i); else C.curvature(p, ST.seg.i, Math.max(.3, C.segLen(p, ST.seg.i) * .05)); });
      case 'ssmooth': return act('Smooth curve', function () { var p = pcById(ST.seg.pc), n = p.nodes.length, i = ST.seg.i, r = C.smooth(p, [(i - 1 + n) % n, i, (i + 1) % n], 1, 35); toast('Smoothed. Length change ' + (r.change >= 0 ? '+' : '−') + F(Math.abs(r.change)) + '. Sharp corners were kept.'); });
      case 'sbend': case 'sbendin': var amt = CM(q('[data-k=sbend]').value || .5) * (a === 'sbendin' ? -1 : 1); return act('Bend edge', function () { C.curvature(pcById(ST.seg.pc), ST.seg.i, amt); });
      case 'ssplit': var sp = pcById(ST.seg.pc), L = C.segLen(sp, ST.seg.i), d = CM(q('[data-k=sdist]').value), fromEnd = q('[data-k=sfrom]').value === 'end'; if (!(d > 0 && d < L)) return toast('Enter a distance between 0 and ' + F(L) + '.', 1); return act('Add point', function () { C.splitAtDist(sp, ST.seg.i, fromEnd ? L - d : d); ST.node = { pc: sp.id, idx: [ST.seg.i + 1] }; ST.seg = null; });
      case 'sdivide': var parts = Math.round(+q('[data-k=sparts]').value); if (!(parts >= 2 && parts <= 20)) return toast('Divide into 2 to 20 parts.', 1); return act('Divide edge', function () { C.divideSeg(pcById(ST.seg.pc), ST.seg.i, parts); ST.seg = null; });
      case 'esareset': return act('Edge seam allowance', function () { delete pcById(ST.seg.pc).sa.edges[ST.seg.i]; });
      case 'enotchmid': return act('Add notch', function () { var p = pcById(ST.seg.pc), nt = { id: C.uid('nt'), seg: ST.seg.i, mode: 'mid', v: 0, from: 'start', type: 'single', depth: .6 }; p.notches.push(nt); });
      case 'ntdel': return act('Delete notch', function () { var o = notchOf(ST.notch); o.pc.notches = o.pc.notches.filter(function (n) { return n.id !== ST.notch; }); ST.notch = null; });
      case 'ittrace': var ti = itOf(ST.it); return traceIt(ti.pc, ti.it);
      case 'efacing': var fp = pcById(ST.seg.pc), fw = CM(q('[data-k=efw]').value || 4); if (!(fw > 0)) return toast('Enter a width.', 1); ST.o.fw = fw; return act('Trace facing', function () { var f = C.facing(fp, [ST.seg.i], fw); f.x += 2; f.y += 2; P.pieces.push(f); ST.sel = [f.id]; ST.seg = null; });
      case 'nrot': case 'nscale': var tp2 = pcById(ST.node.pc), ids = ST.node.idx, cx = 0, cy = 0; ids.forEach(function (i) { cx += tp2.nodes[i].x; cy += tp2.nodes[i].y; }); cx /= ids.length; cy /= ids.length; var mm = a === 'nrot' ? C.M.rot(+q('[data-k=nrotv]').value || 0, cx, cy) : C.M.scale((+q('[data-k=nscv]').value || 100) / 100, (+q('[data-k=nscv]').value || 100) / 100, cx, cy); return act(a === 'nrot' ? 'Rotate points' : 'Scale points', function () { C.transformNodes(tp2, ids, mm); });
      case 'itdel': return act('Delete internal', function () { var o = itOf(ST.it); o.pc.internals = o.pc.internals.filter(function (n) { return n.id !== ST.it; }); ST.it = null; });
      case 'walkclear': ST.walk = []; draw(); return props();
      case 'mkrect': case 'mkell': case 'mkspiral': return create(a);
    }
    if (/^align-/.test(a)) return arrange(a);
  }
  function arrange(a) {
    var pcs = selected().filter(function (p) { return !p.locked; }); if (pcs.length < 2) return toast('Select two or more unlocked pieces.', 1);
    var B = pcs.map(bboxW), all = [Math.min.apply(0, B.map(function (b) { return b[0]; })), Math.min.apply(0, B.map(function (b) { return b[1]; })), Math.max.apply(0, B.map(function (b) { return b[2]; })), Math.max.apply(0, B.map(function (b) { return b[3]; }))];
    act('Arrange', function () {
      var k = a.split('-')[1];
      if (/^align/.test(a)) pcs.forEach(function (pc, i) { var b = B[i]; if (k === 'al') pc.x += all[0] - b[0]; if (k === 'ar') pc.x += all[2] - b[2]; if (k === 'ac') pc.x += (all[0] + all[2]) / 2 - (b[0] + b[2]) / 2; if (k === 'at') pc.y += all[1] - b[1]; if (k === 'ab') pc.y += all[3] - b[3]; if (k === 'am') pc.y += (all[1] + all[3]) / 2 - (b[1] + b[3]) / 2; });
      else { var h = k === 'h', ord = pcs.map(function (pc, i) { return [pc, B[i]]; }).sort(function (x, y) { return h ? x[1][0] - y[1][0] : x[1][1] - y[1][1]; });
        if (/^dist/.test(a)) { if (ord.length < 3) return; var first = ord[0][1], last = ord[ord.length - 1][1], span = h ? (first[0] + first[2]) / 2 : (first[1] + first[3]) / 2, end = h ? (last[0] + last[2]) / 2 : (last[1] + last[3]) / 2; ord.forEach(function (o, i) { var c = span + (end - span) * i / (ord.length - 1), b = o[1], now = h ? (b[0] + b[2]) / 2 : (b[1] + b[3]) / 2; if (h) o[0].x += c - now; else o[0].y += c - now; }); }
        else { var g = ST.gap == null ? 3 : ST.gap, at = h ? ord[0][1][2] + g : ord[0][1][3] + g; ord.slice(1).forEach(function (o) { var b = o[1]; if (h) { o[0].x += at - b[0]; at += b[2] - b[0] + g; } else { o[0].y += at - b[1]; at += b[3] - b[1] + g; } }); } }
    });
  }
  function tidySel() { ST.sel = ST.sel.filter(pcById); if (ST.node && !pcById(ST.node.pc)) ST.node = null; if (ST.seg && !pcById(ST.seg.pc)) ST.seg = null; if (ST.node) { var p = pcById(ST.node.pc); ST.node.idx = ST.node.idx.filter(function (i) { return i < p.nodes.length; }); if (!ST.node.idx.length) ST.node = null; } if (ST.seg && ST.seg.i >= C.segCount(pcById(ST.seg.pc))) ST.seg = null; if (ST.notch && !notchOf(ST.notch)) ST.notch = null; if (ST.it && !itOf(ST.it)) ST.it = null; }
  function viewCentre() { var r = svg.getBoundingClientRect(); return [(r.width / 2 - ST.tx) / ST.z, (r.height / 2 - ST.ty) / ST.z]; }
  function fit() { var b = [1e9, 1e9, -1e9, -1e9], any = false; P.pieces.forEach(function (pc) { if (pc.hidden) return; any = true; var cl = C.cutLine(pc).pts; cl.forEach(function (q2) { b[0] = Math.min(b[0], q2[0] + pc.x); b[1] = Math.min(b[1], q2[1] + pc.y); b[2] = Math.max(b[2], q2[0] + pc.x); b[3] = Math.max(b[3], q2[1] + pc.y); }); }); if (!any) b = [0, 0, 60, 40]; var r = svg.getBoundingClientRect(), W = r.width || 800, Hh = r.height || 600; ST.z = Math.max(.5, Math.min(80, Math.min((W - 80) / (b[2] - b[0] || 1), (Hh - 80) / (b[3] - b[1] || 1)))); ST.tx = (W - (b[2] - b[0]) * ST.z) / 2 - b[0] * ST.z; ST.ty = (Hh - (b[3] - b[1]) * ST.z) / 2 - b[1] * ST.z; draw(); }

  /* ---------- tool option bars (exact creation) ---------- */
  function opts() {
    var t = ST.tool, h = '', o = ST.o = ST.o || { w: 20, h: 30, ew: 20, eh: 20, r0: 5, turns: 1.5, grow: 12, sw: 10, dir: 'cw', fw: 4 };
    if (t === 'rect') h = '<b>Rectangle</b>' + optNum('w', o.w, 'Width') + optNum('h', o.h, 'Height') + btn('mkrect', 'Create', 'pri') + '<small>or drag on the canvas</small>';
    else if (t === 'ellipse') h = '<b>Ellipse</b>' + optNum('ew', o.ew, 'Width') + optNum('eh', o.eh, 'Height') + btn('mkell', 'Create', 'pri') + '<small>or drag on the canvas; Shift for a circle</small>';
    else if (t === 'spiral') { var iss = C.spiralCheck(o.r0, o.turns, o.grow, o.sw); h = '<b>Spiral</b>' + optNum('r0', o.r0, 'Inner radius') + '<label>Turns <input type="number" step=".25" min=".25" max="6" data-o="turns" value="' + o.turns + '"></label>' + optNum('grow', o.grow, 'Spacing per turn') + optNum('sw', o.sw, 'Strip width') + '<label>Direction <select data-o="dir"><option value="cw"' + (o.dir === 'cw' ? ' selected' : '') + '>Clockwise</option><option value="ccw"' + (o.dir === 'ccw' ? ' selected' : '') + '>Anticlockwise</option></select></label>' + btn('mkspiral', 'Create', 'pri') + (iss.length ? '<em class="bad">' + esc(iss[0]) + '</em>' : '<small>Outer edge ' + F(spiralLen(o)) + '</small>'); }
    else if (t === 'trace') h = '<b>Trace</b>' + optNum('fw', o.fw || 4, 'Facing width') + '<small>Click an edge for a facing, or inside an internal shape to trace it as a piece.</small>';
    else if (t === 'poly') h = '<b>Polygon</b><small>Click to place points; drag to curve. Enter or click the first point to close. Backspace undoes the last point.</small>';
    else if (t === 'measure') h = '<b>Measure</b><small>' + (ST.meas.length > 1 ? 'Total ' + F(C.measure.poly(ST.meas)) + (ST.meas.length > 2 ? ' · angle at the last bend ' + C.measure.angle(ST.meas[ST.meas.length - 3], ST.meas[ST.meas.length - 2], ST.meas[ST.meas.length - 1]).toFixed(1) + '°' : '') : 'Click points to measure. Click an edge to read its length along the curve.') + '</small>' + (ST.meas.length ? btn('mclear', 'Clear') : '');
    else if (t) h = '<b>' + esc(TOOL[t].n) + '</b><small>' + esc(TOOL[t].tip) + '</small>';
    optsEl.innerHTML = h;
  }
  function optNum(k, v, lab) { return '<label>' + lab + ' <span class="ps-u"><input type="number" step="any" min="0" data-o="' + k + '" value="' + U(v) + '"><i>' + P.unit + '</i></span></label>'; }
  function spiralLen(o) { var s = C.spiral(0, 0, o.r0, o.turns, o.grow, o.sw, o.dir); return C.perimeter(s); }
  function create(a, at) {
    var o = ST.o, c = at || viewCentre(), pc;
    if (a === 'mkrect') { if (!(o.w > 0 && o.h > 0)) return toast('Width and height must be more than zero.', 1); pc = C.rect(c[0] - o.w / 2, c[1] - o.h / 2, o.w, o.h); }
    if (a === 'mkell') { if (!(o.ew > 0 && o.eh > 0)) return toast('Width and height must be more than zero.', 1); pc = C.ellipse(c[0], c[1], o.ew / 2, o.eh / 2); pc.sa.def = Math.min(pc.sa.def, Math.min(o.ew, o.eh) / 6); }
    if (a === 'mkspiral') { var iss = C.spiralCheck(o.r0, o.turns, o.grow, o.sw); if (iss.length) return toast(iss[0], 1); pc = C.spiral(c[0], c[1], o.r0, o.turns, o.grow, o.sw, o.dir); pc.name = 'Spiral flounce'; pc.sa.def = .6; }
    pc.name = pc.name || 'Piece ' + (P.pieces.length + 1);
    var v = C.validate(pc); if (v.length) return toast(v[0].msg, 1);
    act('Create ' + pc.name, function () { P.pieces.push(pc); ST.sel = [pc.id]; });
  }

  /* ---------- pointer handling ---------- */
  var drag = null, space = false;
  function down(e) {
    if (e.button === 1 || space || ST.tool === 'pan') { drag = { k: 'pan', x: e.clientX, y: e.clientY, tx: ST.tx, ty: ST.ty }; svg.setPointerCapture(e.pointerId); e.preventDefault(); return; }
    if (e.button !== 0) return;
    svg.focus(); var w = S2W(e), t = e.target, ds = t.dataset || {}, pc = ds.pc ? pcById(ds.pc) : null, sn = snap(w);
    svg.setPointerCapture(e.pointerId);
    switch (ST.tool) {
      case 'select': {
        var hit = pc || pieceAt(w);
        if (ds.nt) { ST.notch = ds.nt; ST.node = ST.seg = ST.it = null; refresh(); return; }
        if (!hit) { if (!e.shiftKey) ST.sel = []; ST.notch = ST.it = null; drag = { k: 'marq', a: w }; refresh(); return; }
        if (e.shiftKey) { var i = ST.sel.indexOf(hit.id); if (i >= 0) ST.sel.splice(i, 1); else ST.sel.push(hit.id); } else if (ST.sel.indexOf(hit.id) < 0) ST.sel = [hit.id];
        ST.notch = ST.it = ST.node = ST.seg = null;
        var mv = selected().filter(function (p) { return !p.locked; }); drag = { k: 'move', a: w, mark: H.mark(), pcs: mv.map(function (p) { return [p, p.x, p.y]; }) }; refresh(); return;
      }
      case 'edit': {
        if (ds.h && pc) { drag = { k: 'handle', pc: pc, n: +ds.n, h: ds.h, mark: H.mark() }; return; }
        if (ds.n != null && pc) { var n = +ds.n; if (e.shiftKey && ST.node && ST.node.pc === pc.id) { var j = ST.node.idx.indexOf(n); if (j >= 0) ST.node.idx.splice(j, 1); else ST.node.idx.push(n); } else if (!ST.node || ST.node.pc !== pc.id || ST.node.idx.indexOf(n) < 0) ST.node = { pc: pc.id, idx: [n] }; ST.seg = null; ST.sel = [pc.id]; if (pc.locked) { refresh(); return; } drag = { k: 'nodes', pc: pc, a: w, mark: H.mark(), start: pc.nodes.map(function (nd) { return [nd.x, nd.y]; }) }; refresh(); return; }
        if (ds.s != null && pc) { ST.seg = { pc: pc.id, i: +ds.s }; ST.node = null; ST.sel = [pc.id]; if (!pc.locked) drag = { k: 'nodes', pc: pc, a: w, mark: H.mark(), start: pc.nodes.map(function (nd) { return [nd.x, nd.y]; }), idx: [+ds.s, (+ds.s + 1) % pc.nodes.length] }; refresh(); return; }
        var hp = pieceAt(w); ST.node = ST.seg = null; ST.sel = hp ? [hp.id] : []; refresh(); return;
      }
      case 'addpt': { var ne = nearestEdge(w); if (!ne) return; if (ne.pc.locked) return toast('Unlock the piece first.', 1); act('Add point', function () { var nd = C.splitSeg(ne.pc, ne.seg, ne.t); ST.node = { pc: ne.pc.id, idx: [ne.pc.nodes.indexOf(nd)] }; ST.sel = [ne.pc.id]; }); return; }
      case 'curv': { var ce = nearestEdge(w); if (!ce || ce.pc.locked) return; var k0 = C.ctrl(ce.pc, ce.seg); drag = { k: 'curv', pc: ce.pc, seg: ce.seg, a: w, mark: H.mark(), h2: ce.pc.nodes[ce.seg].h2, h1: ce.pc.nodes[(ce.seg + 1) % ce.pc.nodes.length].h1, k: 'curv', chord: [k0.p0, k0.p3] }; ST.seg = { pc: ce.pc.id, i: ce.seg }; ST.sel = [ce.pc.id]; refresh(); return; }
      case 'smooth': { var se = nearestEdge(w); if (!se) return; act('Smooth curve', function () { var n2 = se.pc.nodes.length, r = C.smooth(se.pc, [(se.seg - 1 + n2) % n2, se.seg, (se.seg + 1) % n2], 1, 35); toast('Smoothed. Length change ' + (r.change >= 0 ? '+' : '−') + F(Math.abs(r.change)) + '. Sharp corners were kept.'); }); return; }
      case 'notch': { var nn = nearestEdge(w); if (!nn) return toast('Click on an edge of a piece.', 1); act('Add notch', function () { var nt = { id: C.uid('nt'), seg: nn.seg, mode: 'dist', v: +nn.s.toFixed(2), from: 'start', type: 'single', depth: .6 }; nn.pc.notches.push(nt); ST.notch = nt.id; ST.sel = [nn.pc.id]; ST.node = ST.seg = null; }); return; }
      case 'sa': case 'walk': { var ee = nearestEdge(w); if (!ee) return toast('Click on an edge of a piece.', 1); if (ST.tool === 'sa') { ST.seg = { pc: ee.pc.id, i: ee.seg }; ST.node = null; ST.sel = [ee.pc.id]; } else { if (ST.walk.length >= 2) ST.walk = []; ST.walk.push({ pc: ee.pc.id, seg: ee.seg }); } refresh(); return; }
      case 'measure': { var me = ST.meas.length === 0 && sn.k !== 'point' && sn.k !== 'midpoint' ? nearestEdge(w) : null; if (me && t.classList.contains('ps-eh')) { ST.seg = { pc: me.pc.id, i: me.seg }; ST.node = null; toast(me.pc.name + ', edge ' + (me.seg + 1) + ': ' + F(me.L) + ' along the ' + (C.ctrl(me.pc, me.seg).curved ? 'curve' : 'line') + '.'); refresh(); return; } ST.meas.push(sn.p); opts(); drawOver(); return; }
      case 'merge': { var mg = nearestEdge(w); if (!mg) return toast('Click on an edge of a piece.', 1); if (ST.walk.length === 1 && ST.walk[0].pc === mg.pc.id) return toast('Click an edge on a different piece.', 1); ST.walk.push({ pc: mg.pc.id, seg: mg.seg }); if (ST.walk.length === 2) doMerge(); else { draw(); status(); } return; }
      case 'trace': { var tr0 = nearestEdge(w); if (tr0 && t.classList.contains('ps-eh')) { var fw = ST.o.fw || 4; act('Trace facing', function () { var f = C.facing(tr0.pc, [tr0.seg], fw); f.x += 2; f.y += 2; P.pieces.push(f); ST.sel = [f.id]; }); toast('Facing traced, ' + F(fw) + ' wide. Move it off the piece and check it.'); return; } var tp = pieceAt(w); if (!tp) return toast('Click an edge, or inside an internal shape.', 1); var lw = W2L(tp, w), hit = tp.internals.filter(function (it) { if (it.kind === 'ellipse') return Math.pow((lw[0] - it.c[0]) / it.r[0], 2) + Math.pow((lw[1] - it.c[1]) / it.r[1], 2) <= 1; return it.pts.length > 2 && inside(it.pts, lw); })[0]; if (!hit) return toast('No internal shape here. Draw one with the Internal tools first.', 1); return traceIt(tp, hit); }
      case 'cut': { var ce2 = nearestEdge(w); if (!ce2) return toast('Click on the outline of a piece.', 1); if (ST.cut.length && ST.cut[0].pc !== ce2.pc.id) ST.cut = []; ST.cut.push({ pc: ce2.pc.id, seg: ce2.seg, t: ce2.t, p: ce2.p }); if (ST.cut.length === 2) doCut(); else drawOver(); status(); return; }
      case 'poly': {
        var d = ST.draft || (ST.draft = { kind: 'poly', pts: [] });
        if (d.pts.length > 2 && C.dist(sn.p, d.pts[0].p) < 8 / ST.z) { finishPoly(); return; }
        d.pts.push({ p: sn.p, h: null }); drag = { k: 'polyh', e: d.pts[d.pts.length - 1] }; opts(); drawOver(); status(); return;
      }
      case 'rect': case 'ellipse': drag = { k: 'box', a: sn.p, kind: ST.tool }; ST.draft = { kind: ST.tool, box: [sn.p[0], sn.p[1], sn.p[0], sn.p[1]] }; return;
      case 'spiral': create('mkspiral', sn.p); return;
      case 'iline': case 'irect': case 'iell': {
        var host = ST.draft && ST.draft.host ? pcById(ST.draft.host) : pieceAt(w); if (!host) return toast('Start inside a piece.', 1);
        if (ST.tool === 'iline') { var dd = ST.draft || (ST.draft = { kind: 'iline', host: host.id, pts: [] }); dd.pts.push({ p: sn.p }); drawOver(); return; }
        drag = { k: 'box', a: sn.p, kind: ST.tool, host: host.id }; ST.draft = { kind: ST.tool, host: host.id, box: [sn.p[0], sn.p[1], sn.p[0], sn.p[1]] }; return;
      }
      case 'grain': { var gp = pieceAt(w); if (!gp) return toast('Drag across a piece.', 1); drag = { k: 'grain', pc: gp, a: sn.p }; ST.draft = { line: [sn.p, sn.p] }; return; }
    }
  }
  function move(e) {
    var w = S2W(e); ST.cursor = w;
    if (!drag) { var hov = ['poly', 'rect', 'ellipse', 'measure', 'iline', 'irect', 'iell', 'grain', 'spiral'].indexOf(ST.tool) >= 0 ? snap(w) : null; ST.hover = hov && hov.k !== 'grid' ? hov.p : null; if (ST.draft && ST.draft.pts) ST.draft.cur = hov ? hov.p : w; if (ST.tool === 'poly' && ST.draft && ST.draft.pts.length) { var lp = ST.draft.pts[ST.draft.pts.length - 1].p, c = ST.draft.cur; status('Length ' + F(C.dist(lp, c)) + ' · angle ' + (Math.atan2(-(c[1] - lp[1]), c[0] - lp[0]) * 180 / Math.PI).toFixed(1) + '°'); } else status(); drawOver(); return; }
    var d = drag;
    if (d.k === 'pan') { ST.tx = d.tx + e.clientX - d.x; ST.ty = d.ty + e.clientY - d.y; draw(); return; }
    if (d.k === 'marq') { ST.marq = [Math.min(d.a[0], w[0]), Math.min(d.a[1], w[1]), Math.max(d.a[0], w[0]), Math.max(d.a[1], w[1])]; drawOver(); return; }
    if (d.k === 'move') { var dx = w[0] - d.a[0], dy = w[1] - d.a[1]; if (V().snap && d.pcs.length) { var g = gridStep(); dx = Math.round(dx / g) * g; dy = Math.round(dy / g) * g; } d.pcs.forEach(function (o) { o[0].x = o[1] + dx; o[0].y = o[2] + dy; }); d.moved = true; draw(); status('Moved ' + F(dx) + ', ' + F(dy)); return; }
    if (d.k === 'nodes') { var pc = d.pc, idx = d.idx || ST.node.idx, sn = snap(w, { pc: pc, idx: idx }), lead = d.idx ? d.start[idx[0]] : d.start[ST.node.idx[0]], a = d.idx ? d.a : null, ddx, ddy;
      if (d.idx) { ddx = w[0] - a[0]; ddy = w[1] - a[1]; } else { var tgt = W2L(pc, sn.p); ddx = tgt[0] - lead[0]; ddy = tgt[1] - lead[1]; if (e.shiftKey) { if (Math.abs(ddx) > Math.abs(ddy)) ddy = 0; else ddx = 0; } }
      idx.forEach(function (i) { pc.nodes[i].x = d.start[i][0] + ddx; pc.nodes[i].y = d.start[i][1] + ddy; }); d.moved = true; syncLinks(); draw(); status('Moved ' + F(ddx) + ', ' + F(ddy)); return; }
    if (d.k === 'handle') { var nd = d.pc.nodes[d.n], l = W2L(d.pc, w), v = [l[0] - nd.x, l[1] - nd.y]; nd[d.h] = v; var o = d.h === 'h1' ? 'h2' : 'h1'; if (nd.smooth && nd[o] && !e.altKey) { var ol = Math.hypot(nd[o][0], nd[o][1]), vl = Math.hypot(v[0], v[1]) || 1; nd[o] = [-v[0] / vl * ol, -v[1] / vl * ol]; } d.moved = true; syncLinks(); draw(); return; }
    if (d.k === 'curv') { var ch = d.chord, cd = [ch[1][0] - ch[0][0], ch[1][1] - ch[0][1]], cl = Math.hypot(cd[0], cd[1]) || 1, nx = -cd[1] / cl, ny = cd[0] / cl, lw = W2L(d.pc, w), la = W2L(d.pc, d.a), off = (lw[0] - la[0]) * nx + (lw[1] - la[1]) * ny, pc2 = d.pc, a2 = pc2.nodes[d.seg], b2 = pc2.nodes[(d.seg + 1) % pc2.nodes.length], k4 = off * 4 / 3, base2 = d.h2 || [cd[0] / 3, cd[1] / 3], base1 = d.h1 || [-cd[0] / 3, -cd[1] / 3]; a2.h2 = [base2[0] + nx * k4, base2[1] + ny * k4]; b2.h1 = [base1[0] + nx * k4, base1[1] + ny * k4]; d.moved = true; syncLinks(); draw(); status('Bend ' + F(off) + ' · edge ' + F(C.segLen(pc2, d.seg))); return; }
    if (d.k === 'polyh') { var e2 = d.e, hv = [w[0] - e2.p[0], w[1] - e2.p[1]]; if (Math.hypot(hv[0], hv[1]) * ST.z > 4) e2.h = hv; return; }
    if (d.k === 'box') { var sn2 = snap(w), b = [d.a[0], d.a[1], sn2.p[0], sn2.p[1]]; if (e.shiftKey && (d.kind === 'ellipse' || d.kind === 'rect')) { var s = Math.max(Math.abs(b[2] - b[0]), Math.abs(b[3] - b[1])); b[2] = b[0] + s * Math.sign(b[2] - b[0] || 1); b[3] = b[1] + s * Math.sign(b[3] - b[1] || 1); } ST.draft.box = b; status(F(Math.abs(b[2] - b[0])) + ' × ' + F(Math.abs(b[3] - b[1]))); drawOver(); return; }
    if (d.k === 'grain') { var sn3 = snap(w), p = sn3.p; if (e.shiftKey) { var gx = p[0] - d.a[0], gy = p[1] - d.a[1], ang = Math.round(Math.atan2(gy, gx) / (Math.PI / 4)) * Math.PI / 4, gl = Math.hypot(gx, gy); p = [d.a[0] + Math.cos(ang) * gl, d.a[1] + Math.sin(ang) * gl]; } ST.draft.line = [d.a, p]; drawOver(); return; }
  }
  function up(e) {
    var d = drag; drag = null; if (!d) return;
    if (d.k === 'marq') { var m = ST.marq; ST.marq = null; if (m && (m[2] - m[0]) * ST.z > 3) { P.pieces.forEach(function (pc) { if (pc.hidden) return; var b = bboxW(pc); if (b[0] >= m[0] && b[2] <= m[2] && b[1] >= m[1] && b[3] <= m[3] && ST.sel.indexOf(pc.id) < 0) ST.sel.push(pc.id); }); } refresh(); return; }
    if ((d.k === 'move' || d.k === 'nodes' || d.k === 'handle' || d.k === 'curv') && d.moved) { var label = { move: 'Move', nodes: 'Move point', handle: 'Reshape curve', curv: 'Edit curvature' }[d.k]; H.commit(label, d.mark); if (d.pc) { var iss = C.validate(d.pc); if (iss.some(function (x) { return x.k === 'cross'; })) toast(iss.filter(function (x) { return x.k === 'cross'; })[0].msg + ' Undo with Ctrl Z.', 1); } refresh(); return; }
    if (d.k === 'box') { var b = ST.draft.box, w = Math.abs(b[2] - b[0]), h = Math.abs(b[3] - b[1]), x0 = Math.min(b[0], b[2]), y0 = Math.min(b[1], b[3]); ST.draft = null; if (w * ST.z < 4 || h * ST.z < 4) { drawOver(); if (d.kind === 'rect' || d.kind === 'ellipse') create(d.kind === 'rect' ? 'mkrect' : 'mkell', b.slice(0, 2)); return; }
      if (d.kind === 'rect') act('Draw rectangle', function () { var r = C.rect(x0, y0, w, h, { name: 'Piece ' + (P.pieces.length + 1) }); P.pieces.push(r); ST.sel = [r.id]; });
      else if (d.kind === 'ellipse') act('Draw ellipse', function () { var r = C.ellipse(x0 + w / 2, y0 + h / 2, w / 2, h / 2, 0, { name: 'Piece ' + (P.pieces.length + 1) }); r.sa.def = Math.min(1, Math.min(w, h) / 6); P.pieces.push(r); ST.sel = [r.id]; });
      else { var host = pcById(d.host), a = W2L(host, [x0, y0]); act('Add internal shape', function () { var it = d.kind === 'irect' ? { id: C.uid('in'), kind: 'rect', pts: [a, [a[0] + w, a[1]], [a[0] + w, a[1] + h], [a[0], a[1] + h]], purpose: 'placement', style: 'solid', label: '', visible: true } : { id: C.uid('in'), kind: 'ellipse', c: [a[0] + w / 2, a[1] + h / 2], r: [w / 2, h / 2], pts: [[a[0] + w / 2, a[1] + h / 2]], purpose: 'placement', style: 'solid', label: '', visible: true }; host.internals.push(it); ST.it = it.id; ST.sel = [host.id]; }); }
      return; }
    if (d.k === 'grain') { var ln = ST.draft.line; ST.draft = null; if (C.dist(ln[0], ln[1]) * ST.z < 6) { drawOver(); return; } act('Set grainline', function () { d.pc.grain = { a: W2L(d.pc, ln[0]), b: W2L(d.pc, ln[1]) }; ST.sel = [d.pc.id]; }); return; }
  }
  function dbl(e) {
    if (ST.tool === 'poly' && ST.draft) { ST.draft.pts.pop(); finishPoly(); return; }
    if (ST.tool === 'iline' && ST.draft) { finishILine(); return; }
    if (ST.tool === 'edit') { var ne = nearestEdge(S2W(e)); if (ne && !ne.pc.locked) act('Add point', function () { var nd = C.splitSeg(ne.pc, ne.seg, ne.t); ST.node = { pc: ne.pc.id, idx: [ne.pc.nodes.indexOf(nd)] }; ST.seg = null; }); }
    if (ST.tool === 'select') { var hp = pieceAt(S2W(e)); if (hp) { setTool('edit'); ST.sel = [hp.id]; refresh(); } }
  }
  function finishPoly() {
    var d = ST.draft; ST.draft = null; if (!d || d.pts.length < 3) { toast('A piece needs at least three points.', 1); opts(); drawOver(); return; }
    var nodes = d.pts.map(function (e) { return C.node(e.p[0], e.p[1], e.h ? [-e.h[0], -e.h[1]] : null, e.h ? e.h.slice() : null); }); nodes.forEach(function (n) { if (n.h1) n.smooth = true; });
    var pc = C.newPiece(nodes, { name: 'Piece ' + (P.pieces.length + 1) }), v = C.validate(pc);
    if (v.length) { toast(v[0].msg + ' The piece was not made.', 1); drawOver(); return; }
    act('Draw polygon', function () { P.pieces.push(pc); ST.sel = [pc.id]; }); opts();
  }
  function finishILine() { var d = ST.draft; ST.draft = null; if (!d || d.pts.length < 2) { drawOver(); return; } var host = pcById(d.host); act('Add internal line', function () { var it = { id: C.uid('in'), kind: 'line', pts: d.pts.map(function (e) { return W2L(host, e.p); }), purpose: 'guide', style: 'solid', label: '', visible: true }; host.internals.push(it); ST.it = it.id; ST.sel = [host.id]; }); }
  function doCut() {
    var a = ST.cut[0], b = ST.cut[1], pc = pcById(a.pc); ST.cut = [];
    if (C.dist(a.p, b.p) < .2) { toast('Pick two different points.', 1); return draw(); }
    act('Cut piece', function () {
      // add both cut points as nodes, then make two outlines that share the cut line
      var first = a.seg > b.seg || (a.seg === b.seg && a.t > b.t) ? b : a, second = first === a ? b : a;
      var n2 = C.splitSeg(pc, second.seg, second.t), n1 = C.splitSeg(pc, first.seg, first.seg === second.seg ? first.t / second.t : first.t);
      var N = pc.nodes, i1 = N.indexOf(n1), i2 = N.indexOf(n2), A = [], B = [], i;
      for (i = i1; ; i = (i + 1) % N.length) { A.push(C.clone(N[i])); if (i === i2) break; } for (i = i2; ; i = (i + 1) % N.length) { B.push(C.clone(N[i])); if (i === i1) break; }
      A[A.length - 1].h2 = null; A[0].h1 = null; B[B.length - 1].h2 = null; B[0].h1 = null;
      var pa = C.newPiece(A, { name: pc.name + ' A', qty: pc.qty, size: pc.size, fabric: pc.fabric }), pb = C.newPiece(B, { name: pc.name + ' B', qty: pc.qty, size: pc.size, fabric: pc.fabric });
      [pa, pb].forEach(function (p) { p.x = pc.x; p.y = pc.y; p.sa.def = pc.sa.def; p.sa.hem = pc.sa.hem; p.grain = C.clone(pc.grain); });
      pb.x += 2; var at = P.pieces.indexOf(pc); P.pieces.splice(at, 1, pa, pb); ST.sel = [pa.id, pb.id];
    });
    toast('Cut into two pieces. Each gets the default seam allowance on the new edge; notches on the old outline were not kept.');
  }
  function doMerge() {
    var a = ST.walk[0], b = ST.walk[1], A = pcById(a.pc), B = pcById(b.pc); ST.walk = [];
    if (A.locked || B.locked) { draw(); return toast('Unlock both pieces first.', 1); }
    var r = C.merge(A, a.seg, B, b.seg), v = C.validate(r.piece);
    if (v.some(function (x) { return x.k === 'cross'; })) { draw(); return toast('Those edges cannot be merged: the joined outline would cross itself.', 1); }
    act('Merge pieces', function () { var at = P.pieces.indexOf(A); P.pieces.splice(at, 1, r.piece); P.pieces = P.pieces.filter(function (p) { return p !== B; }); ST.sel = [r.piece.id]; });
    toast('Merged. The edges differed by ' + F(Math.abs(r.diff)) + (Math.abs(r.diff) > .3 ? ': check the new seam line' : '') + '.' + (r.dropped ? ' Notches on the second piece were not kept.' : ''));
  }
  function traceIt(pc, it) { var f = C.fromInternal(pc, it); if (!f) return toast('Only closed shapes can be traced to a piece.', 1); act('Trace to a piece', function () { var b = C.bbox(pc); f.x = pc.x + (b[2] - b[0]) + 6; P.pieces.push(f); ST.sel = [f.id]; ST.it = null; }); toast('Traced "' + f.name + '" as a new piece beside ' + pc.name + '.'); }
  function wheel(e) { e.preventDefault(); var r = svg.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top; if (e.ctrlKey || e.metaKey || !e.shiftKey && Math.abs(e.deltaY) > 0 && !e.deltaX) { var f = Math.exp(-e.deltaY * .0015), z2 = Math.max(.5, Math.min(120, ST.z * f)); ST.tx = mx - (mx - ST.tx) * z2 / ST.z; ST.ty = my - (my - ST.ty) * z2 / ST.z; ST.z = z2; } else { ST.tx -= e.deltaX; ST.ty -= e.deltaY; } draw(); }
  function key(e) {
    if (!root || root.hidden) return; var tg = e.target, typing = /INPUT|TEXTAREA|SELECT/.test(tg.tagName); var mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); doAct(e.shiftKey ? 'redo' : 'undo'); return; }
    if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); doAct('redo'); return; }
    if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); doAct(e.shiftKey ? 'saveas' : 'save'); return; }
    if (mod && e.key.toLowerCase() === 'o') { e.preventDefault(); doAct('open'); return; }
    if (mod && e.key.toLowerCase() === 'n') { e.preventDefault(); doAct('new'); return; }
    if (typing) return;
    if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); if (ST.sel.length) doAct('dup'); return; }
    if (mod && e.key.toLowerCase() === 'a') { e.preventDefault(); ST.sel = P.pieces.filter(function (p) { return !p.hidden; }).map(function (p) { return p.id; }); refresh(); return; }
    if (e.key === ' ') { space = true; svg.style.cursor = 'grab'; e.preventDefault(); return; }
    if (e.key === 'Escape') { if (q('#ps-modal').hidden === false) { closeModal(); return; } ST.draft = null; ST.meas = []; ST.cut = []; ST.walk = []; ST.node = ST.seg = ST.notch = ST.it = null; opts(); refresh(); return; }
    if (e.key === 'Enter') { if (ST.tool === 'poly' && ST.draft) finishPoly(); else if (ST.tool === 'iline' && ST.draft) finishILine(); return; }
    if (e.key === 'Backspace' && ST.draft && ST.draft.pts) { ST.draft.pts.pop(); if (!ST.draft.pts.length) ST.draft = null; drawOver(); status(); e.preventDefault(); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); if (ST.node) doAct('ndel'); else if (ST.notch) doAct('ntdel'); else if (ST.it) doAct('itdel'); else if (ST.sel.length) doAct('del'); return; }
    if (/^Arrow/.test(e.key)) { e.preventDefault(); var st = gridStep() * (e.shiftKey ? 10 : 1), dx = e.key === 'ArrowLeft' ? -st : e.key === 'ArrowRight' ? st : 0, dy = e.key === 'ArrowUp' ? -st : e.key === 'ArrowDown' ? st : 0; if (ST.node) act('Nudge points', function () { C.moveNodes(pcById(ST.node.pc), ST.node.idx, dx, dy); }); else if (ST.sel.length) act('Nudge', function () { selected().forEach(function (p) { if (!p.locked) { p.x += dx; p.y += dy; } }); }); return; }
    if (e.key === '0') return fit(); if (e.key === '1') return doAct('z100');
    var t = TOOLS.filter(function (x) { return x.k === e.key.toLowerCase(); })[0]; if (t) setTool(t.id);
  }
  function setTool(id) { ST.tool = id; ST.draft = null; ST.cut = []; if (id !== 'measure') ST.meas = []; if (id !== 'walk' && id !== 'merge') ST.walk = []; if (id === 'merge') ST.walk = []; qa('.ps-tb').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.t === id); }); svg.dataset.tool = id; opts(); refresh(); }

  /* ---------- project files ---------- */
  function newProject(o) { var np = C.newProject(o); np.unit = P.unit; H.swap(np); H.u = []; H.r = []; ST.sel = []; ST.node = ST.seg = ST.notch = ST.it = null; ST.fileName = null; ST.savedAt = 0; ST.dirty = false; ls(AUTO, null); refresh(); fit(); }
  function lib() { return ls(LIB) || {}; }
  function save(as) {
    if (as || !P.lib) { modal('<h4>Save project</h4><label class="ps-r wide"><span>Name</span><input id="ps-sname" value="' + esc(P.name) + '" maxlength="80"></label><p class="ps-n">Projects are saved in this browser. Download the project file as well if you want to keep a copy or move it to another computer.</p><div class="ps-bs"><button type="button" class="ps-b pri" id="ps-sok">Save</button><button type="button" class="ps-b" data-a="mclose">Cancel</button></div>', function () { q('#ps-sname').select(); q('#ps-sok').onclick = function () { var nm = q('#ps-sname').value.trim() || 'Untitled pattern'; P.name = nm; if (as || !P.lib) P.lib = C.uid('prj'); write(); closeModal(); }; }); return; }
    write();
    function write() { var L = lib(); P.saved = new Date().toISOString(); L[P.lib] = { name: P.name, t: Date.now(), p: P }; try { localStorage.setItem(LIB, JSON.stringify(L)); } catch (e) { toast('This browser has no room left to save. Download the project file instead.', 1); return; } ST.savedAt = Date.now(); ST.dirty = false; ls(AUTO, null); refresh(); toast('Saved "' + P.name + '".'); }
  }
  function openLib() {
    var L = lib(), ks = Object.keys(L).sort(function (a, b) { return L[b].t - L[a].t; });
    modal('<h4>Open a saved project</h4>' + (ks.length ? '<div class="ps-list">' + ks.map(function (k) { return '<div><button type="button" class="ps-b" data-open="' + k + '"><b>' + esc(L[k].name) + '</b><small>' + new Date(L[k].t).toLocaleString() + ' · ' + (L[k].p.pieces || []).length + ' pieces</small></button><button type="button" class="ps-b bad" data-rm="' + k + '" title="Delete this saved project">Delete</button></div>'; }).join('') + '</div>' : '<p class="ps-n">No saved projects in this browser yet.</p>') + '<div class="ps-bs"><button type="button" class="ps-b" data-a="openfile">Open a project file…</button><button type="button" class="ps-b" data-a="mclose">Cancel</button></div>', function (m) {
      m.onclick = function (e) { var o = e.target.closest('[data-open]'), r = e.target.closest('[data-rm]'); if (o) confirmDiscard(function () { load(L[o.dataset.open].p); closeModal(); toast('Opened "' + L[o.dataset.open].name + '".'); }); if (r) { var L2 = lib(); delete L2[r.dataset.rm]; ls(LIB, L2); closeModal(); openLib(); } };
    });
  }
  function load(p) { if (!p || p.app !== 'forecut-pattern-studio') return toast('That is not a Pattern Studio project.', 1); H.swap(C.clone(p)); H.u = []; H.r = []; ST.sel = []; ST.node = ST.seg = ST.notch = ST.it = null; ST.dirty = false; ST.savedAt = Date.now(); refresh(); fit(); }
  function confirmDiscard(fn) { if (!ST.dirty || !P.pieces.length) return fn(); modal('<h4>Unsaved changes</h4><p>This project has changes that are not saved to a project yet. They are kept in autosave until you start something else.</p><div class="ps-bs"><button type="button" class="ps-b pri" id="ps-dsave">Save first</button><button type="button" class="ps-b bad" id="ps-dgo">Discard and continue</button><button type="button" class="ps-b" data-a="mclose">Cancel</button></div>', function () { q('#ps-dsave').onclick = function () { closeModal(); save(false); }; q('#ps-dgo').onclick = function () { closeModal(); ST.dirty = false; fn(); }; }); }
  function modal(html, after) { var m = q('#ps-modal'); m.innerHTML = '<div class="ps-mbox" role="dialog" aria-modal="true">' + html + '</div>'; m.hidden = false; m.onclick = null; if (after) after(m); var f = m.querySelector('input,button'); if (f) f.focus(); }
  function closeModal() { var m = q('#ps-modal'); m.hidden = true; m.innerHTML = ''; }
  function fname(ext) { return (P.name || 'pattern').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.' + ext; }

  /* ---------- bring in a draft ---------- */
  function fromDraft() {
    var UI = window.PMUI, last = UI && UI.last && UI.last(); if (!last || !last.r) return toast('Draft a garment in Pattern Maker first.', 1);
    var s = UI.S(), pcs = C.fromDraft(last.r, { size: s.size === 'custom' ? 'Custom' : s.size, sa: s.sa, hem: s.hemA, dept: s.gender });
    var x = 0; pcs.forEach(function (pc, i) { var st = (s.pc || {})[last.r.pieces[i].id] || {}; if (st.on === false) { pc._skip = 1; return; } if (st.sa != null) pc.sa.def = st.sa; if (st.hem != null) pc.sa.hem = st.hem; if (st.name) pc.name = st.name; var b = C.bbox(pc); pc.x = x - b[0] + 2; pc.y = 2 - b[1]; x += b[2] - b[0] + 5; });
    pcs = pcs.filter(function (pc) { return !pc._skip; });
    var add = function () { act('Bring in draft', function () { pcs.forEach(function (pc) { P.pieces.push(pc); }); if (!P.pieces.length || P.name === 'Untitled pattern') P.name = (last.r.label || 'Pattern') + ' · ' + (s.size === 'custom' ? 'custom' : s.size); ST.sel = pcs.map(function (p) { return p.id; }); }); fit(); var bad = pcs.filter(function (p) { return C.validate(p).length; }); toast(pcs.length + ' pieces brought in as editable outlines' + (bad.length ? '. ' + bad.length + ' need a look: see the ! in Pieces.' : '.')); };
    if (P.pieces.length) modal('<h4>Bring in the draft</h4><p>Add the ' + pcs.length + ' pieces of ' + esc(last.r.label || 'the draft') + ' to this project, or start a new project with them?</p><div class="ps-bs"><button type="button" class="ps-b pri" id="ps-fadd">Add to this project</button><button type="button" class="ps-b" id="ps-fnew">New project</button><button type="button" class="ps-b" data-a="mclose">Cancel</button></div>', function () { q('#ps-fadd').onclick = function () { closeModal(); add(); }; q('#ps-fnew').onclick = function () { closeModal(); confirmDiscard(function () { newProject(); add(); }); }; });
    else add();
  }

  /* ---------- DXF import ---------- */
  function parseDXF(txt) {
    var L = txt.split(/\r?\n/), pairs = [], i; for (i = 0; i + 1 < L.length; i += 2) pairs.push([L[i].trim(), L[i + 1].trim()]);
    var ents = [], cur = null, units = null, inEnt = false, inPoly = null;
    for (i = 0; i < pairs.length; i++) { var c = pairs[i][0], v = pairs[i][1];
      if (c === '9' && v === '$INSUNITS') { units = +pairs[i + 1][1]; }
      if (c === '2' && v === 'ENTITIES') inEnt = true; if (c === '0' && v === 'ENDSEC') inEnt = false; if (!inEnt) continue;
      if (c === '0') {
        if (cur && (cur.t === 'lw' || cur.t === 'line')) { ents.push(cur); cur = null; }
        if (v === 'POLYLINE') { inPoly = { t: 'poly', layer: '0', pts: [], closed: false }; cur = inPoly; continue; }
        if (v === 'VERTEX' && inPoly) { cur = { t: 'v', parent: inPoly }; continue; }
        if (v === 'SEQEND') { if (inPoly) ents.push(inPoly); inPoly = null; cur = null; continue; }
        cur = v === 'LWPOLYLINE' ? { t: 'lw', layer: '0', pts: [], closed: false } : v === 'LINE' ? { t: 'line', layer: '0', pts: [[0, 0], [0, 0]] } : null; continue; }
      if (!cur) continue; var n = +v;
      if (c === '8') { if (cur.t === 'v') { if (!cur.parent.layerSet) { cur.parent.layer = v; } } else { cur.layer = v; cur.layerSet = 1; } }
      if (c === '70' && (cur.t === 'poly' || cur.t === 'lw')) cur.closed = !!(n & 1);
      if (cur.t === 'v') { if (c === '10') cur.parent.pts.push([n, 0]); if (c === '20') cur.parent.pts[cur.parent.pts.length - 1][1] = n; }
      if (cur.t === 'lw') { if (c === '10') cur.pts.push([n, 0]); if (c === '20') cur.pts[cur.pts.length - 1][1] = n; }
      if (cur.t === 'line') { if (c === '10') cur.pts[0][0] = n; if (c === '20') cur.pts[0][1] = n; if (c === '11') cur.pts[1][0] = n; if (c === '21') cur.pts[1][1] = n; }
    }
    if (cur && (cur.t === 'lw' || cur.t === 'line')) ents.push(cur);
    ents.forEach(function (e) { if (!e.closed && e.pts.length > 2 && Math.hypot(e.pts[0][0] - e.pts[e.pts.length - 1][0], e.pts[0][1] - e.pts[e.pts.length - 1][1]) < 1e-6) { e.closed = true; e.pts.pop(); } });
    return { ents: ents, units: units };
  }
  function importDXF(txt, name) {
    var r = parseDXF(txt); if (!r.ents.length) return toast('No lines or polylines found in that DXF.', 1);
    var layers = {}; r.ents.forEach(function (e) { var l = layers[e.layer] || (layers[e.layer] = { n: 0, closed: 0 }); l.n++; if (e.closed) l.closed++; });
    var uGuess = r.units === 4 ? 'mm' : r.units === 1 ? 'in' : r.units === 5 ? 'cm' : 'mm', guess = function (l) { return /cut/i.test(l) ? 'cut' : /seam|sew|stitch/i.test(l) ? 'seam' : /notch|grain|int|mark|drill|line/i.test(l) ? 'internal' : /text|brand|title|grid/i.test(l) ? 'ignore' : layers[l].closed ? 'seam' : 'internal'; };
    modal('<h4>Import DXF</h4><p class="ps-n">' + esc(name) + ': ' + r.ents.length + ' shapes on ' + Object.keys(layers).length + ' layers.' + (r.units ? '' : ' The file does not say its units.') + '</p>'
      + '<label class="ps-r"><span>Units in the file</span><select id="ps-du"><option value="mm"' + (uGuess === 'mm' ? ' selected' : '') + '>Millimetres</option><option value="cm"' + (uGuess === 'cm' ? ' selected' : '') + '>Centimetres</option><option value="in"' + (uGuess === 'in' ? ' selected' : '') + '>Inches</option></select></label>'
      + '<table class="ps-tab"><tr><th>Layer</th><th>Shapes</th><th>Use as</th></tr>' + Object.keys(layers).map(function (l) { var gs = guess(l); return '<tr><td>' + esc(l) + '</td><td>' + layers[l].n + ' (' + layers[l].closed + ' closed)</td><td><select data-layer="' + esc(l) + '">' + [['seam', 'Seamline (pieces)'], ['cut', 'Cutting line (pieces, no allowance added)'], ['internal', 'Internal lines'], ['ignore', 'Ignore']].map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === gs ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></td></tr>'; }).join('') + '</table>'
      + '<p class="ps-n">Closed shapes on a piece layer become pieces. Internal lines go into the piece they sit inside. If a file has both a seamline and a cutting line for each piece, import the seamline only.</p><div class="ps-bs"><button type="button" class="ps-b pri" id="ps-dok">Import</button><button type="button" class="ps-b" data-a="mclose">Cancel</button></div>', function () {
        q('#ps-dok').onclick = function () {
          var f = { mm: .1, cm: 1, in: 2.54 }[q('#ps-du').value], map = {}; qa('[data-layer]').forEach(function (s) { map[s.dataset.layer] = s.value; });
          var made = [], skipped = 0, ints = [];
          r.ents.forEach(function (e) { var role = map[e.layer], pts = e.pts.map(function (p) { return [p[0] * f, -p[1] * f]; });
            if ((role === 'seam' || role === 'cut') && e.closed && pts.length > 2) { var pc = C.newPiece(C.fitNodes(pts, .03, true), { name: 'Piece ' + (P.pieces.length + made.length + 1) }); if (role === 'cut') { pc.sa.def = 0; pc.sa.hem = 0; } if (C.validate(pc).some(function (x) { return x.k === 'cross' || x.k === 'flat'; })) skipped++; else made.push(pc); }
            else if (role === 'internal' || (role === 'seam' || role === 'cut') && !e.closed) ints.push(pts); });
          ints.forEach(function (pts) { var host = null; made.forEach(function (pc) { if (!host && inside(C.flat(pc, .5).pts, pts[0])) host = pc; }); if (host) host.internals.push({ id: C.uid('in'), kind: pts.length === 1 ? 'point' : 'line', pts: pts, purpose: 'guide', style: 'solid', label: '', visible: true }); });
          if (!made.length) { toast('No closed outlines on the layers you chose.' + (skipped ? ' ' + skipped + ' crossed themselves.' : ''), 1); return; }
          var minx = Math.min.apply(0, made.map(function (p) { return C.bbox(p)[0]; })), miny = Math.min.apply(0, made.map(function (p) { return C.bbox(p)[1]; })); made.forEach(function (p) { p.x = -minx + 2; p.y = -miny + 2; });
          closeModal(); act('Import DXF', function () { made.forEach(function (p) { P.pieces.push(p); }); ST.sel = made.map(function (p) { return p.id; }); }); fit(); toast(made.length + ' pieces imported' + (skipped ? ', ' + skipped + ' skipped because their outline crosses itself' : '') + '. Check one measurement against the source before you use it.');
        };
      });
  }

  /* ---------- export ---------- */
  function scene() {
    var pcs = P.pieces.filter(function (p) { return !p.hidden; }); if (!pcs.length) return null;
    var b = [1e9, 1e9, -1e9, -1e9], sc = [], M = 2;
    pcs.forEach(function (pc) { C.cutLine(pc).pts.forEach(function (q2) { b[0] = Math.min(b[0], q2[0] + pc.x); b[1] = Math.min(b[1], q2[1] + pc.y); b[2] = Math.max(b[2], q2[0] + pc.x); b[3] = Math.max(b[3], q2[1] + pc.y); }); });
    var ox = M - b[0], oy = M - b[1], W = b[2] - b[0] + 2 * M, Hh = b[3] - b[1] + 2 * M + 8, T = function (pc, q2) { return [q2[0] + pc.x + ox, q2[1] + pc.y + oy]; };
    pcs.forEach(function (pc) {
      var tr = function (q2) { return T(pc, q2); }, v = V();
      if (v.sa) sc.push({ k: 'poly', p: C.cutLine(pc).pts.map(tr), c: 1, w: .06, L: 'CUT' });
      sc.push({ k: 'poly', p: C.flat(pc, .15).pts.map(tr), c: 1, w: .035, d: v.sa ? [.4, .25] : null, col: v.sa ? '#6b625a' : '#1c1714', L: v.sa ? 'SEAM' : 'CUT' });
      if (pc.fold >= 0) sc.push({ k: 'poly', p: C.segPts(pc, pc.fold, .15).map(tr), w: .05, d: [1, .3, .2, .3], col: '#a9481f', L: 'MARK' });
      var sg = C.areaOf(C.flat(pc, .5).pts) > 0 ? -1 : 1;
      pc.notches.forEach(function (nt) { var r = C.notchPos(pc, nt), nv = [-r.tan[1] * sg, r.tan[0] * sg], d0 = v.sa ? C.saOf(pc, nt.seg) : 0, dep = nt.depth || .6, a = [r.p[0] + nv[0] * d0, r.p[1] + nv[1] * d0]; sc.push({ k: 'poly', p: [a, [a[0] - nv[0] * dep, a[1] - nv[1] * dep]].map(tr), w: .05, L: 'MARK' }); if (nt.type === 'double') sc.push({ k: 'poly', p: [[a[0] + r.tan[0] * .35, a[1] + r.tan[1] * .35], [a[0] + r.tan[0] * .35 - nv[0] * dep, a[1] + r.tan[1] * .35 - nv[1] * dep]].map(tr), w: .05, L: 'MARK' }); });
      if (pc.grain) { var ga = pc.grain.a, gb = pc.grain.b, gl = C.dist(ga, gb) || 1, u = [(gb[0] - ga[0]) / gl, (gb[1] - ga[1]) / gl], nn = [-u[1], u[0]]; sc.push({ k: 'poly', p: [ga, gb].map(tr), w: .04, L: 'GRAIN' }, { k: 'poly', p: [[gb[0] - u[0] * .8 + nn[0] * .4, gb[1] - u[1] * .8 + nn[1] * .4], gb, [gb[0] - u[0] * .8 - nn[0] * .4, gb[1] - u[1] * .8 - nn[1] * .4]].map(tr), w: .04, L: 'GRAIN' }); if (pc.grainDir !== 'one') sc.push({ k: 'poly', p: [[ga[0] + u[0] * .8 + nn[0] * .4, ga[1] + u[1] * .8 + nn[1] * .4], ga, [ga[0] + u[0] * .8 - nn[0] * .4, ga[1] + u[1] * .8 - nn[1] * .4]].map(tr), w: .04, L: 'GRAIN' }); }
      pc.internals.forEach(function (it) { if (it.visible === false) return; var pts = it.kind === 'ellipse' ? (function () { var o = []; for (var k = 0; k < 48; k++) { var a = k / 48 * Math.PI * 2; o.push([it.c[0] + it.r[0] * Math.cos(a), it.c[1] + it.r[1] * Math.sin(a)]); } return o; })() : it.kind === 'point' ? (function () { var c = it.pts[0]; return [[c[0] - .25, c[1]], [c[0] + .25, c[1]], [c[0], c[1]], [c[0], c[1] - .25], [c[0], c[1] + .25]]; })() : it.pts; sc.push({ k: 'poly', p: pts.map(tr), c: it.kind === 'rect' || it.kind === 'ellipse' ? 1 : 0, w: .04, d: it.style === 'dashed' ? [.4, .25] : null, L: 'MARK' }); });
      pc.darts.forEach(function (d) { var pts = d.l1 ? [d.l1, d.apex, d.l2] : d.pts; if (pts) sc.push({ k: 'poly', p: pts.map(tr), c: d.pts ? 1 : 0, w: .04, L: 'MARK' }); });
      var bb = C.bbox(pc), c = tr([(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2]), fs = Math.max(.6, Math.min(1.6, (bb[2] - bb[0]) / 12));
      sc.push({ k: 'text', x: c[0], y: c[1], s: fs, t: pc.name || 'Piece', b: 1, a: 'middle', L: 'TEXT' }, { k: 'text', x: c[0], y: c[1] + fs * 1.2, s: fs * .6, t: (pc.size ? 'Size ' + pc.size + ' · ' : '') + 'Cut ' + pc.qty + (pc.pair ? ' (mirrored pair)' : '') + (pc.fold >= 0 ? ' · on fold' : '') + (pc.fabric ? ' · ' + pc.fabric : ''), a: 'middle', L: 'TEXT' }, { k: 'text', x: c[0], y: c[1] + fs * 2, s: fs * .5, t: 'SA ' + C.fmt(pc.sa.def, P.unit) + (pc.hems.length ? ', hem ' + C.fmt(pc.sa.hem, P.unit) : ''), a: 'middle', L: 'TEXT' });
    });
    sc.push({ k: 'poly', p: [[1, Hh - 6.5], [6, Hh - 6.5], [6, Hh - 1.5], [1, Hh - 1.5]], c: 1, w: .06, L: 'MARK' }, { k: 'text', x: 3.5, y: Hh - 3.7, s: .7, t: '5 cm square', a: 'middle', L: 'TEXT' });
    sc.push({ k: 'text', x: 7.5, y: Hh - 4.6, s: 1.1, t: P.name + ' · ' + pcs.length + ' pieces', b: 1, L: 'TEXT' }, { k: 'text', x: 7.5, y: Hh - 3, s: .7, t: 'Forecut Pattern Studio · ' + new Date().toISOString().slice(0, 10) + ' · print at 100% and check the 5 cm square', col: '#a9481f', L: 'BRAND' });
    return { sc: sc, W: Math.max(W, 40), H: Hh };
  }
  function exportAs(a) {
    var s = scene(); if (!s) return toast('There are no visible pieces to export.', 1); if (!X) return toast('Export is not available on this page.', 1);
    var bad = P.pieces.filter(function (p) { return !p.hidden && C.validate(p).length; }); if (bad.length) toast(bad.length + ' piece' + (bad.length > 1 ? 's have' : ' has') + ' problems (marked !). Exported anyway: check before cutting.', 1);
    if (a === 'xsvg') { dl(fname('svg'), X.svg(s.sc, s.W, s.H, P.unit, { title: P.name }), 'image/svg+xml'); toast('SVG downloaded at true scale.'); }
    if (a === 'xdxf') { var u = P.unit === 'in' ? 'in' : 'mm'; dl(fname('dxf'), X.dxf(s.sc, s.W, s.H, u), 'application/dxf'); toast('DXF downloaded in ' + (u === 'in' ? 'inches' : 'millimetres') + ', layers CUT, SEAM, MARK, GRAIN, TEXT.'); }
    if (a === 'xpdf') { var r = X.pdf(s.sc, s.W, s.H, 'sheet', { title: P.name }); dl(fname('pdf'), r.blob); toast('Full-size PDF downloaded. Print at 100% and check the 5 cm square.'); }
    if (a === 'xpdft') { var r2 = X.pdf(s.sc, s.W, s.H, 'tiles', { title: P.name }); dl(fname('tiles.pdf'), r2.blob); toast('PDF ready: ' + r2.pages + ' A4 pages. Print at 100% / actual size, check the 5 cm square, then tape the tiles in order.'); }
    if (a === 'xpng') X.png(X.svg(s.sc, s.W, s.H, P.unit, { title: P.name }), s.W, s.H, function (b) { dl(fname('png'), b); toast('PNG downloaded.'); });
  }

  /* ---------- modes ---------- */
  function setMode(m) { ST.mode = m; qa('#ps-mode button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.mode === m); }); var three = q('#ps-3d'); three.hidden = m === '2d'; root.classList.toggle('m3d', m === '3d'); root.classList.toggle('msplit', m === 'split'); setTimeout(draw, 30); }

  /* ---------- wiring ---------- */
  function wire() {
    root.addEventListener('click', function (e) {
      var mb = e.target.closest('.ps-mb'); if (mb) { var dd = q('[data-mm=' + mb.dataset.m + ']'), was = dd.hidden; qa('.ps-dd').forEach(function (x) { x.hidden = true; }); dd.hidden = !was; e.stopPropagation(); return; }
      if (!e.target.closest('.ps-dd')) qa('.ps-dd').forEach(function (x) { x.hidden = true; });
      var tb = e.target.closest('.ps-tb'); if (tb) return setTool(tb.dataset.t);
      var a = e.target.closest('[data-a]'); if (a) { qa('.ps-dd').forEach(function (x) { x.hidden = true; }); if (a.dataset.a === 'mclose') return closeModal(); if (a.dataset.a === 'mclear') { ST.meas = []; opts(); return drawOver(); } return doAct(a.dataset.a, a); }
      var u = e.target.closest('[data-u]'); if (u && u.closest('#ps-units')) { P.unit = u.dataset.u; pref.unit = P.unit; ls(PREF, pref); opts(); return refresh(); }
      var md = e.target.closest('[data-mode]'); if (md) return setMode(md.dataset.mode);
      var ob = e.target.closest('.ps-ob'); if (ob) { var id = ob.dataset.pc; if (e.shiftKey) { var i = ST.sel.indexOf(id); if (i >= 0) ST.sel.splice(i, 1); else ST.sel.push(id); } else ST.sel = [id]; ST.node = ST.seg = ST.notch = ST.it = null; return refresh(); }
      var it = e.target.closest('[data-it]'); if (it) { ST.it = it.dataset.it; ST.sel = [it.dataset.pc]; ST.node = ST.seg = ST.notch = null; return refresh(); }
    });
    q('#ps-name').addEventListener('change', function () { var v = this.value.trim() || 'Untitled pattern'; act('Rename project', function () { P.name = v; }); });
    propsEl.addEventListener('change', onProp);
    optsEl.addEventListener('change', function (e) { var k = e.target.dataset.o; if (!k) return; ST.o[k] = k === 'dir' ? e.target.value : k === 'turns' ? +e.target.value : CM(e.target.value); opts(); });
    root.addEventListener('change', function (e) { var v = e.target.dataset.v; if (!v) return; act('View', function () { V()[v] = e.target.checked; }); });
    svg.addEventListener('pointerdown', down); svg.addEventListener('pointermove', move); svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', function () { drag = null; }); svg.addEventListener('dblclick', dbl); svg.addEventListener('wheel', wheel, { passive: false });
    svg.addEventListener('pointerleave', function () { ST.cursor = null; ST.hover = null; status(); drawOver(); });
    document.addEventListener('keydown', key); document.addEventListener('keyup', function (e) { if (e.key === ' ') { space = false; svg.style.cursor = ''; } });
    window.addEventListener('resize', function () { if (!root.hidden) draw(); });
    q('#ps-tsearch').addEventListener('input', function () { var s = this.value.trim().toLowerCase(); qa('.ps-tb').forEach(function (b) { var t = TOOL[b.dataset.t]; b.hidden = s && (t.n + ' ' + t.g + ' ' + t.tip).toLowerCase().indexOf(s) < 0; }); qa('.ps-tg').forEach(function (g) { g.hidden = !g.querySelector('.ps-tb:not([hidden])'); }); });
    var tip = q('#ps-tip'); root.addEventListener('pointerover', function (e) { var b = e.target.closest('[data-tip]'); if (!b) { tip.hidden = true; return; } var r = b.getBoundingClientRect(), R = root.getBoundingClientRect(); tip.textContent = b.dataset.tip; tip.hidden = false; tip.style.left = (r.right - R.left + 8) + 'px'; tip.style.top = Math.max(4, r.top - R.top) + 'px'; });
    root.addEventListener('pointerout', function (e) { if (e.target.closest('[data-tip]')) tip.hidden = true; });
    q('#ps-file').addEventListener('change', function () { var f = this.files[0]; this.value = ''; if (!f) return; f.text().then(function (t) { try { var p = C.parse(t); confirmDiscard(function () { load(p); P.lib = null; ST.fileName = f.name; toast('Opened ' + f.name + '. Save it to keep it in this browser.'); }); } catch (err) { toast(err.message || 'Could not read that file.', 1); } }); });
    q('#ps-dxf').addEventListener('change', function () { var f = this.files[0]; this.value = ''; if (!f) return; f.text().then(function (t) { importDXF(t, f.name); }); });
    window.addEventListener('beforeunload', function () { if (!root.hidden && ST.dirty) autosave(); });
  }

  /* ---------- open and close ---------- */
  function open(opt) {
    build(); root.hidden = false; document.documentElement.classList.add('ps-open'); setTool(ST.tool || 'select'); setMode('2d');
    var a = ls(AUTO), canDraft = !!(window.PMUI && PMUI.last && PMUI.last());
    if (a && a.p && a.p.pieces && a.p.pieces.length && !P.pieces.length) { modal('<h4>Recover your work?</h4><p>Pattern Studio found unsaved work from ' + new Date(a.t).toLocaleString() + ': "' + esc(a.p.name) + '", ' + a.p.pieces.length + ' pieces.</p><div class="ps-bs"><button type="button" class="ps-b pri" id="ps-rec">Recover</button>' + (opt && opt.draft && canDraft ? '<button type="button" class="ps-b" id="ps-dr">Start from the current draft</button>' : '') + '<button type="button" class="ps-b bad" id="ps-disc">Discard</button></div>', function () { q('#ps-rec').onclick = function () { closeModal(); load(a.p); ST.dirty = true; toast('Recovered. Save it to keep it.'); }; var dr = q('#ps-dr'); if (dr) dr.onclick = function () { closeModal(); ls(AUTO, null); fromDraft(); }; q('#ps-disc').onclick = function () { closeModal(); ls(AUTO, null); }; }); }
    else if (opt && opt.draft && canDraft) fromDraft();
    refresh(); setTimeout(fit, 30);
  }
  function close() { if (ST.dirty) autosave(); root.hidden = true; document.documentElement.classList.remove('ps-open'); }

  /* entry button in Pattern Maker */
  function addEntry() {
    var anchor = document.getElementById('pm-zfit'); if (!anchor || document.getElementById('pm-studiob')) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'ib'; b.id = 'pm-studiob'; b.title = 'Open Pattern Studio: draw and edit pieces freely, starting from this draft';
    b.innerHTML = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3zM7 15l3-6 3 4 2-2 3 4"/></svg><span>Studio</span>';
    var ed = document.getElementById('pm-3db') || document.getElementById('pm-editb') || anchor; ed.after(b);
    b.addEventListener('click', function () { build(); open({ draft: P.pieces.length === 0 }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(addEntry, 50); }); else setTimeout(addEntry, 50);
  if (/[#&]studio\b/.test(location.hash)) setTimeout(function () { var app = document.getElementById('pm-app'); if (app && !app.hidden) open(); }, 600);

  /* ---------- styles ---------- */
  var css = document.createElement('style');
  css.textContent = [
    'html.ps-open,html.ps-open body{overflow:hidden}',
    '#ps{position:fixed;inset:0;z-index:1000;display:grid;grid-template-rows:44px 1fr 26px;background:#efe9e1;color:#1c1714;font:13px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif;--ac:#a9481f;--ln:#d8cfc3;--pn:#fbf8f4}',
    '#ps[hidden]{display:none}',
    '#ps button{font:inherit;color:inherit}',
    '.ps-top{display:flex;align-items:center;gap:6px;padding:0 10px;background:#1c1714;color:#f4eee6}',
    '.ps-brand{display:flex;align-items:center;gap:7px;font-weight:700;letter-spacing:.08em;font-size:11px;margin-right:6px;white-space:nowrap}.ps-brand i{width:9px;height:9px;background:var(--ac);display:inline-block}',
    '.ps-menu{position:relative}.ps-mb{background:none;border:0;padding:6px 9px;border-radius:4px;cursor:pointer;color:#f4eee6!important}.ps-mb:hover{background:#3a312b}',
    '.ps-dd{position:absolute;top:34px;left:0;min-width:250px;background:#fff;color:#1c1714;border:1px solid var(--ln);border-radius:6px;box-shadow:0 10px 30px #0003;padding:5px;z-index:5}',
    '.ps-dd button{display:flex;justify-content:space-between;width:100%;text-align:left;background:none;border:0;padding:6px 9px;border-radius:4px;cursor:pointer}.ps-dd button:hover{background:#f3ece4}.ps-dd kbd{font:11px system-ui;color:#8a7f74}.ps-dd hr{border:0;border-top:1px solid var(--ln);margin:4px 0}.ps-dd label{display:flex;gap:7px;padding:5px 9px;cursor:pointer}',
    '.ps-name{background:#2c2520;border:1px solid #3a312b;color:#f4eee6;border-radius:4px;padding:4px 8px;min-width:120px;width:220px;font:inherit}',
    '.ps-saved{font-size:11px;color:#b9ada0;white-space:nowrap}',
    '.ps-ib{background:none;border:0;width:30px;height:30px;border-radius:4px;cursor:pointer;display:grid;place-items:center;color:#f4eee6!important}.ps-ib:hover{background:#3a312b}.ps-ib:disabled{opacity:.35;cursor:default}.ps-ib svg,.ps-tb svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}',
    '.ps-sp{flex:1}',
    '.ps-seg{display:flex;background:#2c2520;border-radius:5px;padding:2px}.ps-seg button{background:none;border:0;padding:4px 9px;border-radius:4px;cursor:pointer;color:#cfc4b8!important;font-size:12px}.ps-seg button[aria-pressed=true]{background:#f4eee6;color:#1c1714!important}',
    '.ps-close{background:var(--ac);border:0;border-radius:4px;padding:6px 12px;cursor:pointer;color:#fff!important;font-weight:600}',
    '.ps-body{display:grid;grid-template-columns:64px 200px 1fr 290px;min-height:0}',
    '.ps-tools{background:var(--pn);border-right:1px solid var(--ln);overflow:auto;padding:6px 4px;scrollbar-width:thin}',
    '.ps-tools input{width:100%;box-sizing:border-box;font:11px system-ui;padding:4px;border:1px solid var(--ln);border-radius:4px;margin-bottom:4px}',
    '.ps-tg{border-top:1px solid var(--ln);padding:4px 0}.ps-tg small{display:block;font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:#8a7f74;text-align:center;margin-bottom:2px}',
    '.ps-tb{display:grid;place-items:center;width:100%;height:36px;background:none;border:0;border-radius:5px;cursor:pointer}.ps-tb span{position:absolute;left:-9999px}.ps-tb:hover{background:#efe6db}.ps-tb[aria-pressed=true]{background:#1c1714;color:#fff!important}',
    '.ps-objs{background:var(--pn);border-right:1px solid var(--ln);overflow:auto;padding:8px}.ps-objs h6{margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#6b625a}',
    '.ps-ob{display:flex;align-items:center;gap:4px;padding:4px 5px;border-radius:4px;cursor:pointer}.ps-ob:hover{background:#f1e9df}.ps-ob.on{background:#1c1714;color:#fff}.ps-on{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ps-on i{font-style:normal;color:#d6452f;font-weight:700}.ps-on i.lk{color:var(--ac)}',
    '.ps-eye,.ps-lk{background:none;border:0;cursor:pointer;width:20px;padding:0;font-size:11px}',
    '.ps-obs{margin:0 0 4px 22px;font-size:12px}.ps-obs div{padding:2px 5px;border-radius:3px;cursor:pointer;color:#5b5148}.ps-obs div.on{background:#efe0d2}',
    '.ps-objb{display:flex;gap:4px;margin-top:8px}.ps-objb button{flex:1;font-size:11px!important;background:#fff;border:1px solid var(--ln);border-radius:4px;padding:4px;cursor:pointer}',
    '.ps-empty{color:#6b625a;font-size:12px}',
    '.ps-main{display:grid;grid-template-rows:auto 1fr;min-width:0;min-height:0}',
    '.ps-opts{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:5px 10px;background:#fff;border-bottom:1px solid var(--ln);min-height:34px;box-sizing:border-box;font-size:12px}.ps-opts b{font-size:12px}.ps-opts small{color:#6b625a}.ps-opts label{display:flex;align-items:center;gap:4px}.ps-opts em.bad{color:#b3261e;font-style:normal}',
    '.ps-stage{position:relative;min-height:0;overflow:hidden;display:grid;grid-template-columns:24px 1fr;grid-template-rows:24px 1fr}',
    '#ps.noru .ps-stage{grid-template-columns:0 1fr;grid-template-rows:0 1fr}',
    '.ps-rx{grid-column:2;grid-row:1;width:100%;height:24px}.ps-ry{grid-column:1;grid-row:2;width:24px;height:100%}.ps-corner{grid-column:1;grid-row:1;background:#f6f1ea;font-size:9px;display:grid;place-items:center;color:#6b625a;border-right:1px solid var(--ln);border-bottom:1px solid var(--ln)}',
    '#ps-svg{grid-column:2;grid-row:2;width:100%;height:100%;background:#fdfbf8;outline:0;touch-action:none;cursor:default}',
    '#ps-svg[data-tool=poly],#ps-svg[data-tool=rect],#ps-svg[data-tool=ellipse],#ps-svg[data-tool=measure],#ps-svg[data-tool=iline],#ps-svg[data-tool=irect],#ps-svg[data-tool=iell],#ps-svg[data-tool=grain],#ps-svg[data-tool=spiral],#ps-svg[data-tool=cut]{cursor:crosshair}#ps-svg[data-tool=pan]{cursor:grab}',
    '#ps-svg *{vector-effect:non-scaling-stroke}',
    '#ps-grid .gm{stroke:#eee6dc;stroke-width:1}#ps-grid .gM{stroke:#ddd1c3;stroke-width:1}',
    '.ps-cut{fill:#fffdf9;stroke:#1c1714;stroke-width:1.4}.ps-seam{fill:none;stroke:#6b625a;stroke-width:1;stroke-dasharray:5 3}.ps-seam.solo{fill:#fffdf9;stroke:#1c1714;stroke-dasharray:none;stroke-width:1.4}.ps-seam.nos{stroke:none}',
    '.ps-pc.sel .ps-cut,.ps-pc.sel .ps-seam.solo{fill:#fbefe5;stroke:var(--ac);stroke-width:2}.ps-pc.bad .ps-cut,.ps-pc.bad .ps-seam.solo{stroke:#d6452f}.ps-pc.lock{opacity:.85}',
    '.ps-fold{fill:none;stroke:var(--ac);stroke-width:2;stroke-dasharray:10 3 2 3}',
    '.ps-int{fill:none;stroke:#3d6b8c;stroke-width:1.1}.ps-int.dash{stroke-dasharray:6 4}.ps-int.cutout{stroke:#d6452f}.ps-int.fold{stroke:var(--ac)}',
    '.ps-notch{fill:none;stroke:#1c1714;stroke-width:1.6}.ps-notch.on{stroke:var(--ac);stroke-width:3}',
    '.ps-grain{fill:none;stroke:#1c1714;stroke-width:1.1}',
    '.ps-lab{fill:#1c1714;text-anchor:middle;font-weight:600;pointer-events:none}.ps-lab2{fill:#6b625a;text-anchor:middle;pointer-events:none}.ps-link{fill:var(--ac);pointer-events:none}',
    '.ps-eh{fill:none;stroke:transparent;cursor:pointer}.ps-eh:hover{stroke:#a9481f33}.ps-eon{fill:none;stroke:var(--ac);stroke-width:3;pointer-events:none}',
    '.ps-pt{fill:#fff;stroke:#1c1714;stroke-width:1.2;cursor:move}.ps-pt.sm{rx:50%}.ps-pt.on{fill:var(--ac);stroke:var(--ac)}',
    '.ps-hl{stroke:#3d6b8c;stroke-width:1;pointer-events:none}.ps-hd{fill:#3d6b8c;stroke:#fff;stroke-width:1;cursor:pointer}',
    '.ps-dr{fill:#a9481f14;stroke:var(--ac);stroke-width:1.4;stroke-dasharray:4 3}.ps-marq{fill:#3d6b8c14;stroke:#3d6b8c;stroke-width:1;stroke-dasharray:3 3}',
    '.ps-ms{fill:none;stroke:#0b7a52;stroke-width:1.6}.ps-msp{fill:#0b7a52}.ps-mt{fill:#0b7a52;font-weight:700;paint-order:stroke;stroke:#fff;stroke-width:3;text-anchor:middle}.ps-snap{fill:none;stroke:#0b7a52;stroke-width:1.6}',
    '.ps-3d{position:absolute;inset:0;display:grid;place-items:center;background:#f6f1ea;z-index:2;text-align:center;padding:20px}.ps-3d b{font-size:16px}.ps-3d p{max-width:380px;color:#5b5148}',
    '#ps.msplit .ps-3d{left:50%;border-left:1px solid var(--ln)}',
    '.ps-tip{position:absolute;z-index:9;max-width:260px;background:#1c1714;color:#f4eee6;padding:7px 9px;border-radius:5px;font-size:12px;pointer-events:none;box-shadow:0 6px 18px #0004}',
    '.ps-props{background:var(--pn);border-left:1px solid var(--ln);overflow:auto;padding:10px 12px 30px}',
    '.ps-props h5{margin:14px 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#6b625a}.ps-props h5:first-child{margin-top:0}',
    '.ps-r{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:4px 0}.ps-r>span:first-child{color:#3d3530;font-size:12px}.ps-r.wide{flex-direction:column;align-items:stretch}.ps-r input:not([type=checkbox]),.ps-r select,.ps-r textarea{font:inherit;padding:4px 6px;border:1px solid var(--ln);border-radius:4px;background:#fff;max-width:150px;box-sizing:border-box}.ps-r.wide input,.ps-r.wide textarea{max-width:none;width:100%}',
    '.ps-u{display:inline-flex;align-items:center;border:1px solid var(--ln);border-radius:4px;background:#fff}.ps-u input{border:0!important;width:72px;padding:4px 6px;font:inherit;background:none}.ps-u i{font-style:normal;color:#8a7f74;font-size:11px;padding-right:6px}',
    '.ps-bs{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}.ps-b{background:#fff;border:1px solid var(--ln);border-radius:4px;padding:5px 9px;cursor:pointer;font-size:12px!important}.ps-b:hover{border-color:#1c1714}.ps-b.pri{background:#1c1714;color:#fff!important;border-color:#1c1714}.ps-b.bad{color:#b3261e!important}',
    '.ps-tr{display:flex;gap:5px;align-items:center;margin:5px 0}',
    '.ps-n{color:#6b625a;font-size:12px;margin:6px 0}',
    '.ps-kv{display:grid;grid-template-columns:1fr auto;gap:3px 10px;margin:4px 0;font-size:12px}.ps-kv dt{color:#6b625a}.ps-kv dd{margin:0;text-align:right;font-variant-numeric:tabular-nums}',
    '.ps-kb{display:grid;grid-template-columns:auto 1fr;gap:3px 10px;font-size:12px}.ps-kb dt{font-weight:600}.ps-kb dd{margin:0;color:#5b5148}',
    '.ps-chips{display:flex;flex-wrap:wrap;gap:4px}.ps-chips label{display:flex;gap:3px;align-items:center;font-size:11px;border:1px solid var(--ln);border-radius:10px;padding:1px 7px;background:#fff}',
    '.ps-warn{background:#fdecea;border:1px solid #f1b9b1;border-radius:5px;padding:4px 8px;margin:6px 0}.ps-warn p{margin:4px 0;color:#8c1d13;font-size:12px}',
    '.ps-check{padding:6px 8px;border-radius:5px;font-size:12px}.ps-check.ok{background:#e6f4ec;color:#0b5d3b}.ps-check.no{background:#fdf0e3;color:#8a4b0b}',
    '.ps-status{display:flex;align-items:center;gap:14px;padding:0 10px;background:#fff;border-top:1px solid var(--ln);font-size:12px;color:#5b5148;white-space:nowrap;overflow:hidden}.ps-status b{color:#1c1714}',
    '.ps-toast{position:absolute;left:50%;bottom:40px;transform:translateX(-50%);background:#1c1714;color:#fff;padding:9px 14px;border-radius:6px;max-width:520px;box-shadow:0 8px 24px #0004;z-index:20;margin:0}.ps-toast.bad{background:#8c1d13}',
    '.ps-modal{position:absolute;inset:0;background:#1c171466;display:grid;place-items:center;z-index:30}.ps-modal[hidden]{display:none}.ps-mbox{background:#fff;border-radius:8px;padding:16px 18px;width:min(520px,92vw);max-height:80vh;overflow:auto;box-shadow:0 20px 50px #0005}.ps-mbox h4{margin:0 0 8px;font-size:15px}',
    '.ps-list>div{display:flex;gap:6px;margin:5px 0}.ps-list .ps-b:first-child{flex:1;text-align:left;display:flex;flex-direction:column}.ps-list small{color:#6b625a}',
    '.ps-tab{width:100%;border-collapse:collapse;font-size:12px;margin:8px 0}.ps-tab th,.ps-tab td{border-bottom:1px solid var(--ln);padding:4px;text-align:left}',
    '@media (max-width:1100px){.ps-body{grid-template-columns:56px 0 1fr 260px}.ps-objs{display:none}.ps-name{width:130px}.ps-saved{display:none}}',
    '@media (max-width:760px){.ps-body{grid-template-columns:52px 1fr}.ps-props{position:absolute;right:0;top:44px;bottom:26px;width:min(300px,80vw);z-index:4;box-shadow:-6px 0 20px #0002}.ps-brand{display:none}.ps-seg#ps-mode{display:none}}'
  ].join('\n');
  document.head.appendChild(css);

  window.FCStudio = { open: open, close: close, P: function () { return P; }, H: H, act: act, setTool: setTool, ST: ST, fit: fit, importDXF: importDXF, parseDXF: parseDXF, scene: scene, fromDraft: fromDraft };
})();
