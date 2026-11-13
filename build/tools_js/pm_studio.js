/* Forecut Pattern Maker, Edit pieces mode: draw, edit and prepare pattern pieces inside Pattern Maker.
   Needs pm_cad.js (FCCad) and pm_export.js (PMX). Geometry is in centimetres; the screen shows the chosen unit. */
(function () {
  'use strict';
  var C = window.FCCad, X = window.PMX; if (!C) return;
  var AUTO = 'fc-ps-auto', LIB = 'fc-ps-lib', NS = 'http://www.w3.org/2000/svg';
  var PREVIEW = /[?&]preview(=|&|$)/.test(location.search);
  function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function dl(name, data, type) { if (window.FC && FC.download) return FC.download(name, data, type); var b = data instanceof Blob ? data : new Blob([data], { type: type || 'application/octet-stream' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  function I(d) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>'; }

  /* ---------- tools ---------- */
  var TOOLS = [
    { g: 'Select', id: 'select', k: 'v', n: 'Select and transform', tip: 'Click a piece to select it, Shift-click to add more, drag to move. Drag on empty space to select with a box.', ic: 'M6 3.5v15l4.2-4 2.7 6 2.6-1.2-2.7-5.8 5.8-.3z' },
    { g: 'Select', id: 'edit', k: 'a', n: 'Edit pattern', tip: 'Select and drag points, edges and curve handles. Type exact coordinates in Properties. Double-click an edge to add a point.', ic: 'M5 18.5c1.5-7 6.5-12 14-13M3.5 17h3v3h-3zM17.5 4h3v3h-3zM5 18.5l3-8M6.6 10.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0' },
    { g: 'Select', id: 'pan', k: 'h', n: 'Pan', tip: 'Drag to move the view. You can also hold Space, or drag with the middle mouse button.', ic: 'M8 12V6a1.5 1.5 0 013 0v5M11 11V4.5a1.5 1.5 0 013 0V11M14 11V6a1.5 1.5 0 013 0v7c0 4-2.5 7-6 7-2.5 0-4-1-5.5-3L4 13.5a1.5 1.5 0 012.5-1.5L8 14' },
    { g: 'Draw', id: 'poly', k: 'p', n: 'Polygon', tip: 'Click to place points. Drag while placing a point to make a curve. Click the first point, double-click or press Enter to close. Backspace removes the last point, Esc cancels.', ic: 'M12 3.5l8.5 6.2-3.2 9.8H6.7L3.5 9.7zM10.6 2.1h2.8v2.8h-2.8z' },
    { g: 'Draw', id: 'rect', k: 'r', n: 'Rectangle', tip: 'Drag to draw, or type the exact width and height in the bar above the canvas and press Create.', ic: 'M4 6.5h16v11H4z' },
    { g: 'Draw', id: 'ellipse', k: 'e', n: 'Ellipse', tip: 'Drag to draw, or type the exact width and height above the canvas. Hold Shift for a circle.', ic: 'M3.5 12a8.5 6 0 1 0 17 0a8.5 6 0 1 0-17 0' },
    { g: 'Draw', id: 'spiral', n: 'Spiral', tip: 'A spiral strip for flounces and cascades. Set the inner radius, turns, spacing and strip width above the canvas, then click where its centre goes.', ic: 'M12 12.5a1 1 0 0 1 1-1 2 2 0 0 1 2 2 3 3 0 0 1-3 3 4 4 0 0 1-4-4 5 5 0 0 1 5-5 6 6 0 0 1 6 6 7 7 0 0 1-7 7' },
    { g: 'Edit', id: 'addpt', k: '+', n: 'Add point / split edge', tip: 'Click an edge to add a point there without changing the shape. In Properties you can also split an edge into equal parts or at an exact distance.', ic: 'M3 16h7M14 16h7M10.5 14.5h3v3h-3zM12 3.5v7M8.5 7h7' },
    { g: 'Edit', id: 'curv', k: 'c', n: 'Edit curvature', tip: 'Drag an edge sideways to bend it; the end points stay where they are. A straight edge becomes a curve.', ic: 'M4 18.5C7 8.5 17 8.5 20 18.5M12 12.5V4M9.5 6.5L12 4l2.5 2.5M2.5 17h3v3h-3zM18.5 17h3v3h-3z' },
    { g: 'Edit', id: 'smooth', n: 'Smooth curve', tip: 'Select points or edges with Edit pattern, then click Smooth in Properties, or click an edge here to smooth its two joins. Sharp corners stay sharp. The length change is reported.', ic: 'M3 15l4-7 4 6M13 14c2.5-7 5.5-7 8-2M11 14h2' },
    { g: 'Edit', id: 'cut', k: 'k', n: 'Cut and split', tip: 'Click two points on the outline of a piece to cut it into two pieces along the line between them.', ic: 'M4.0 6.5a2.5 2.5 0 1 0 5.0 0a2.5 2.5 0 1 0 -5.0 0M4.0 17.5a2.5 2.5 0 1 0 5.0 0a2.5 2.5 0 1 0 -5.0 0M8.7 8L20.5 17.5M8.7 16L20.5 6.5' },
    { g: 'Edit', id: 'merge', n: 'Merge pieces', tip: 'Click an edge of the first piece, then the matching edge of the second. The second piece turns to meet it and the two become one piece. The length difference is reported.', ic: 'M3 5h6v14H3zM15 5h6v14h-6zM10.5 9l2 3-2 3M13.5 9l-2 3 2 3' },
    { g: 'Edit', id: 'trace', k: 't', n: 'Trace', tip: 'Click an edge to trace a facing of the width set above the canvas, or click inside an internal rectangle, ellipse or closed shape to trace it as a new piece (a pocket from its placement, say).', ic: 'M4 4h16v16H4zM4 9h16M7.5 6.5h9' },
    { g: 'Internal', id: 'iline', k: 'l', n: 'Internal line', tip: 'Draw a line inside a piece: a fold line, guide, placement or stitch line. Click points, double-click or press Enter to finish.', ic: 'M3.5 3.5h17v17h-17zM7.5 16.5l9-9M6 15h3v3H6zM15 6h3v3h-3z' },
    { g: 'Internal', id: 'irect', n: 'Internal rectangle', tip: 'Drag inside a piece for a pocket placement, a cut-out or a guide.', ic: 'M3.5 3.5h17v17h-17zM7.5 8.5h9v7h-9z' },
    { g: 'Internal', id: 'iell', n: 'Internal circle or ellipse', tip: 'Drag inside a piece for a cut-out, button or placement marking.', ic: 'M3.5 3.5h17v17h-17zM7.8 12a4.2 4.2 0 1 0 8.4 0a4.2 4.2 0 1 0 -8.4 0' },
    { g: 'Marks', id: 'notch', k: 'n', n: 'Notch', tip: 'Click an edge to add a notch. Set its exact position, type and depth in Properties.', ic: 'M3 6h7.5L12 9.5 13.5 6H21v12H3z' },
    { g: 'Marks', id: 'grain', k: 'g', n: 'Grainline', tip: 'Drag across a piece to set its grainline. Set the exact angle and direction in Properties.', ic: 'M12 3v18M8.5 6.5L12 3l3.5 3.5M8.5 17.5L12 21l3.5-3.5' },
    { g: 'Measure', id: 'measure', k: 'm', n: 'Measure', tip: 'Click points to measure straight distances and angles; snapping uses points and the grid. Click an edge to read its length along the curve. Esc clears.', ic: 'M3.5 15.5l12-12 5 5-12 12zM7 12l2 2M9.5 9.5l1.5 1.5M12 7l2 2' },
    { g: 'Measure', id: 'walk', k: 'w', n: 'Seam walk', tip: 'Click the first edge, then the edge it is sewn to. The lengths, the difference and the planned ease are compared.', ic: 'M3 7.5c6-3.5 12-3.5 18 0M3 16.5c6 3.5 12 3.5 18 0M7 7v10M12 6v12M17 7v10' },
    { g: 'Seam allowance', id: 'sa', k: 's', n: 'Seam allowance', tip: 'Click an edge to set its own allowance, mark it as a hem or a fold, and choose the corner shape.', ic: 'M7.5 7.5h9v9h-9zM3.5 3.5h17v17h-17zM16.5 16.5l4 4' },
    { g: 'Sewing', id: 'sew', k: 'j', n: 'Segment sewing', tip: 'Click an edge, then the edge it is sewn to. Click each one near the ends that meet (for example both near the hem) so the seam is not twisted; Flip in Properties fixes it if it is. Matching colours show which edges are sewn and the lengths are compared.', ic: 'M4 3v18M20 3v18M7.5 7h9M7.5 12h9M7.5 17h9' },
    { g: 'Sewing', id: 'fsew', n: 'Free sewing', tip: 'Sew part of an edge to part of another: click where the seam starts and ends on the first edge, then where it starts and ends on the second. The click order sets the direction.', ic: 'M4 3v18M20 3v18M8 10h8M8 14h8M2.6 8.6h2.8v2.8H2.6zM18.6 12.6h2.8v2.8h-2.8z' },
    { g: 'Trims', id: 'button', k: 'b', n: 'Button', tip: 'Click on a piece to place a button. Set its size, holes, material and colour in Properties, and repeat it down a placket at an exact spacing.', ic: 'M4 12a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M8.8 9.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0M13.2 9.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0M8.8 14.2a1 1 0 1 0 2 0a1 1 0 1 0 -2 0M13.2 14.2a1 1 0 1 0 2 0a1 1 0 1 0 -2 0' },
    { g: 'Trims', id: 'hole', n: 'Buttonhole', tip: 'Click on a piece to place a buttonhole. Set its length, angle and type in Properties.', ic: 'M4.5 9.5h15v5h-15zM7 12h10' },
    { g: 'Trims', id: 'zip', k: 'z', n: 'Zipper', tip: 'Click the edge the zipper is sewn to. Set the type, gauge, open end and exact start and end in Properties; the closed length is worked out for you.', ic: 'M12 3v14M9 4.5h3M12 6.5h3M9 8.5h3M12 10.5h3M9 12.5h3M12 14.5h3M10 17h4v4.5h-4z' },
    { g: 'Trims', id: 'piping', n: 'Piping', tip: 'Click an edge to pipe it. Set the cord size and fabric in Properties.', ic: 'M3 9h18M3 15h18M3 9a3 3 0 0 0 0 6M21 9a3 3 0 0 1 0 6' },
    { g: 'Trims', id: 'binding', n: 'Binding', tip: 'Click an edge to bind it. Set the finished width, fold and fabric in Properties.', ic: 'M21 7H8a5 5 0 0 0 0 10h13M10 12h11' },
    { g: 'Trims', id: 'tstitch', k: 'u', n: 'Topstitch', tip: 'Click an edge to topstitch it with the chosen preset: stitches per inch, thread Tex, rows, row gap and distance from the edge.', ic: 'M3 6h18M3 11h3M8 11h3M13 11h3M18 11h3M3 15h3M8 15h3M13 15h3M18 15h3' },
    { g: 'Trims', id: 'pucker', n: 'Puckering', tip: 'Click an edge to add seam puckering. Visual puckering only changes the look; physical puckering also gathers the seam in 3D.', ic: 'M3 7h18M3 14c1.5-3 3-3 4.5 0s3 3 4.5 0 3-3 4.5 0 3 3 4.5 0' },
    { g: 'Trims', id: 'tape', n: 'Seam tape', tip: 'Click an edge to add stay tape, fusible tape, twill tape or clear elastic.', ic: 'M3 9h18v6H3zM6 12h2M11 12h2M16 12h2' },
    { g: 'Trims', id: 'graphic', n: 'Graphic', tip: 'Click on a piece, then choose an image (PNG, JPG or SVG) for a print, logo, label or embroidery. Set its size, rotation and method in Properties.', ic: 'M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M14.0 9a1.5 1.5 0 1 0 3.0 0a1.5 1.5 0 1 0 -3.0 0' }
  ];
  var TOOL = {}; TOOLS.forEach(function (t) { TOOL[t.id] = t; });

  /* ---------- state ---------- */
  var P = C.normalize(C.newProject()), H = new C.History(P, onChange);
  var ST = { tab: 'pieces', seam: null, trim: null, fab: null, pick: [], tool: 'select', sel: [], node: null, seg: null, z: 8, tx: 60, ty: 60, draft: null, meas: [], walk: [], hover: null, fileName: null, savedAt: 0, dirty: false, cut: [], gstep: 1 };
  var ON = false, started = false, app, pb, toolsEl, modesEl, barEl, centerEl, sideEl, modalEl, tipEl, parts = [];
  var svg, world, ptsG, rx, ry, statusEl, propsEl, objsEl, optsEl, toastEl, timer;

  /* ---------- build: the editor lives inside Pattern Maker (tools in the left panel, canvas in the middle, pieces and properties on the right) ---------- */
  var VIEWS = [['grid', 'Grid'], ['snap', 'Snap to points, edges and grid (Alt switches off)'], ['rulers', 'Rulers'], ['sa', 'Seam allowance (cutting line)'], ['seam', 'Seamline'], ['notches', 'Notches'], ['grain', 'Grainlines'], ['internals', 'Internal lines and shapes'], ['labels', 'Piece names'], ['points', 'Points on all pieces'], ['sewing', 'Sewing lines'], ['trims', 'Trims'], ['graphics', 'Graphics'], ['fill', 'Fabric colours on pieces']];
  var MENUS = [
    ['file', 'File', [['new', 'New blank project', 'Ctrl N'], ['open', 'Open saved project…', 'Ctrl O'], ['openfile', 'Open project file…'], '-', ['save', 'Save', 'Ctrl S'], ['saveas', 'Save as…'], ['savefile', 'Download project file'], '-', ['fromdraft', 'Bring in the current draft'], ['importdxf', 'Import DXF…'], '-', ['xsvg', 'Export SVG (true scale)'], ['xdxf', 'Export DXF'], ['xpdft', 'Export PDF, A4 tiles'], ['xpdf', 'Export PDF, full size'], ['xpng', 'Export PNG'], ['bomcsv', 'Export BOM (CSV)']]],
    ['edit', 'Edit', [['undo', 'Undo', 'Ctrl Z'], ['redo', 'Redo', 'Ctrl Shift Z'], '-', ['dup', 'Duplicate', 'Ctrl D'], ['linked', 'Linked copy'], ['mirrorcopy', 'Mirrored copy'], ['del', 'Delete', 'Del'], '-', ['selall', 'Select all pieces', 'Ctrl A'], ['selnone', 'Deselect', 'Esc']]],
    ['pattern', 'Pattern', ['tool:select', 'tool:edit', 'tool:pan', '-', 'tool:poly', 'tool:rect', 'tool:ellipse', 'tool:spiral', '-', 'tool:addpt', 'tool:curv', 'tool:smooth', 'tool:cut', 'tool:merge', 'tool:trace', '-', 'tool:iline', 'tool:irect', 'tool:iell', 'tool:notch', 'tool:grain', 'tool:sa', '-', 'tool:measure']],
    ['sewing', 'Sewing', ['tool:sew', 'tool:fsew', 'tool:walk', '-', ['tab:sewing', 'Sewing list and length check'], ['sewcheck', 'Check all seams'], ['sewclear', 'Delete all sewing']]],
    ['materials', 'Materials', [['tab:fabric', 'Fabric library'], ['fabnew', 'New fabric'], ['fabassign', 'Give the selected pieces a fabric'], '-', 'tool:graphic', ['tab:trims', 'Graphics and trims list']]],
    ['trims', 'Trims', ['tool:button', 'tool:hole', 'tool:zip', 'tool:piping', 'tool:binding', 'tool:tstitch', 'tool:pucker', 'tool:tape', '-', ['tab:trims', 'All trims'], ['presets', 'Topstitch presets']]],
    ['production', 'Production', [['tab:cw', 'Colourways'], ['tab:bom', 'Bill of materials (BOM)'], ['bomcsv', 'Export BOM (CSV)']]],
    ['view', 'View', VIEWS.map(function (v) { return 'v:' + v[0]; }).concat(['-', ['zin', 'Zoom in', '+'], ['zout', 'Zoom out', '−'], ['fit', 'Fit all pieces', '0'], ['z100', 'Actual size (100%)', '1']])],
    ['settings', 'Settings', [['settings', 'Project settings…']]]
  ];
  function menuHTML(m) {
    return '<div class="ps-menu"><button type="button" class="ib ps-mb" data-m="' + m[0] + '" aria-haspopup="menu">' + m[1] + '</button><div class="ps-dd" data-mm="' + m[0] + '" role="menu" hidden>' + m[2].map(function (it) {
      if (it === '-') return '<hr>';
      if (typeof it === 'string' && it.indexOf('tool:') === 0) { var t = TOOL[it.slice(5)]; return '<button type="button" role="menuitem" data-a="' + it + '">' + I(t.ic) + '<span>' + esc(t.n) + '</span>' + (t.k ? '<kbd>' + t.k.toUpperCase() + '</kbd>' : '') + '</button>'; }
      if (typeof it === 'string' && it.indexOf('v:') === 0) { var v = VIEWS.filter(function (x) { return x[0] === it.slice(2); })[0]; return '<label><input type="checkbox" data-v="' + v[0] + '"> ' + v[1] + '</label>'; }
      return '<button type="button" role="menuitem" data-a="' + it[0] + '"><i></i><span>' + esc(it[1]) + '</span>' + (it[2] ? '<kbd>' + it[2] + '</kbd>' : '') + '</button>';
    }).join('') + '</div></div>';
  }
  var TABS = [['pieces', 'Pieces', 'Pattern pieces'], ['sewing', 'Sewing', 'Seams and length checks'], ['fabric', 'Fabric', 'Fabrics and physical properties'], ['trims', 'Trims', 'Buttons, zippers, piping, binding, topstitch, puckering, seam tape, graphics'], ['cw', 'Colours', 'Colourway matrix'], ['bom', 'BOM', 'Bill of materials']];
  function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  function build() {
    if (toolsEl) return true;
    app = document.getElementById('pm-app'); pb = app && app.querySelector('.pbody'); if (!pb) return false;
    var pl = pb.querySelector('.pl'), pcol = pb.querySelector('.pc'), pr = pb.querySelector('.pr'), ctl = pcol.querySelector('.ctl'), hidel = document.getElementById('pm-hidel');
    var groups = []; TOOLS.forEach(function (t) { if (groups.indexOf(t.g) < 0) groups.push(t.g); });
    toolsEl = mk('nav', 'ps-tools', '<input type="search" id="ps-tsearch" placeholder="Find a tool" aria-label="Find a tool">'
      + groups.map(function (g) { return '<div class="ps-tg"><small>' + g + '</small>' + TOOLS.filter(function (t) { return t.g === g; }).map(function (t) { return '<button type="button" class="ps-tb" data-t="' + t.id + '" aria-label="' + esc(t.n) + '" data-tip="' + esc(t.n + (t.k ? ' (' + t.k.toUpperCase() + ')' : '') + '. ' + t.tip) + '">' + I(t.ic) + '<span>' + esc(t.n) + '</span>' + (t.k ? '<kbd>' + t.k.toUpperCase() + '</kbd>' : '') + '</button>'; }).join('') + '</div>'; }).join(''));
    toolsEl.setAttribute('aria-label', 'Editing tools'); pl.insertBefore(toolsEl, pl.firstChild);
    modesEl = mk('div', 'ps-modes', '<button type="button" data-pmode="draft" title="Draft: choose the garment, style, size and measurements">Draft</button><button type="button" data-pmode="edit" title="Edit pieces: move points, reshape curves, add notches, seam allowances and more">Edit pieces</button>');
    modesEl.setAttribute('role', 'group'); modesEl.setAttribute('aria-label', 'Mode'); ctl.insertBefore(modesEl, hidel ? hidel.nextSibling : ctl.firstChild);
    barEl = mk('div', 'ps-bar', MENUS.map(menuHTML).join('') + '<span class="sep"></span>'
      + '<button type="button" class="ib" data-a="undo" title="Undo (Ctrl Z)" aria-label="Undo">' + I('M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3') + '</button><button type="button" class="ib" data-a="redo" title="Redo (Ctrl Shift Z)" aria-label="Redo">' + I('M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3') + '</button><span class="sep"></span>'
      + '<button type="button" class="ib ps-zl" data-a="z100" title="Zoom: wheel or pinch to zoom; click for actual size (1)" id="ps-zl">100%</button><button type="button" class="ib" data-a="fit" title="Fit all pieces (0)" aria-label="Fit all pieces">' + I('M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5') + '</button><span class="sep"></span>'
      + '');
    ctl.insertBefore(barEl, modesEl.nextSibling);
    centerEl = mk('div', 'ps-center', '<div class="ps-banner" id="ps-banner" hidden></div><div class="ps-opts" id="ps-opts"></div><div class="ps-stage"><div class="ps-corner" id="ps-ucorner"></div><canvas class="ps-rx" id="ps-rx" aria-hidden="true"></canvas><canvas class="ps-ry" id="ps-ry" aria-hidden="true"></canvas>'
      + '<svg id="ps-svg" xmlns="' + NS + '" tabindex="0" aria-label="Pattern editing canvas"><g id="ps-grid"></g><g id="ps-world"></g><g id="ps-over"></g><g id="ps-pts"></g></svg><p class="ps-toast" id="ps-toast" role="status" hidden></p></div><div class="ps-foot"><input class="ps-name" id="ps-name" aria-label="Project name" maxlength="80" title="Project name"><span class="ps-saved" id="ps-saved"></span><div class="ps-status" id="ps-status"></div></div>');
    pcol.insertBefore(centerEl, ctl.nextSibling);
    sideEl = mk('div', 'ps-side', '<div class="ps-tabs" role="tablist" aria-label="Object browser">' + TABS.map(function (t) { return '<button type="button" role="tab" data-tab="' + t[0] + '" title="' + t[2] + '">' + t[1] + '</button>'; }).join('') + '</div><div class="ps-pane" id="ps-objs"></div>'
      + '<details class="ps-sec" open><summary>Properties</summary><div id="ps-props"></div></details>');
    pr.insertBefore(sideEl, pr.firstChild);
    modalEl = mk('div', 'ps-host', '<div class="ps-modal" id="ps-modal" hidden></div><div class="ps-tip" id="ps-tip" hidden></div><input type="file" id="ps-file" accept=".json,.fcpattern,application/json" hidden><input type="file" id="ps-dxf" accept=".dxf" hidden><input type="file" id="ps-gfx" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden>');
    document.body.appendChild(modalEl);
    parts = [toolsEl, modesEl, barEl, centerEl, sideEl, modalEl];
    svg = q('#ps-svg'); world = q('#ps-world'); ptsG = q('#ps-pts'); rx = q('#ps-rx'); ry = q('#ps-ry'); statusEl = q('#ps-status'); propsEl = q('#ps-props'); objsEl = q('#ps-objs'); optsEl = q('#ps-opts'); toastEl = q('#ps-toast'); tipEl = q('#ps-tip');
    wire();
    return true;
  }
  function q(s) { for (var i = 0; i < parts.length; i++) { var p = parts[i]; if (p.matches(s)) return p; var r = p.querySelector(s); if (r) return r; } return null; }
  function qa(s) { var o = []; parts.forEach(function (p) { o = o.concat(Array.prototype.slice.call(p.querySelectorAll(s))); }); return o; }

  /* ---------- units and view ---------- */
  function unitNow() { var S = window.PMUI && PMUI.S && PMUI.S(); return (S && S.unit) || P.unit || 'cm'; }
  function U(cm) { return C.toU(cm, P.unit); }
  function F(cm) { return C.fmt(cm, P.unit); }
  function CM(v) { return C.fromU(+v, P.unit); }
  function V() { return P.view; }
  function S2W(e) { var r = svg.getBoundingClientRect(); return [(e.clientX - r.left - ST.tx) / ST.z, (e.clientY - r.top - ST.ty) / ST.z]; }
  function W2S(p) { return [p[0] * ST.z + ST.tx, p[1] * ST.z + ST.ty]; }
  function pcById(id) { for (var i = 0; i < P.pieces.length; i++) if (P.pieces[i].id === id) return P.pieces[i]; return null; }
  function L2W(pc, p) { return [p[0] + (pc.x || 0), p[1] + (pc.y || 0)]; }
  function W2L(pc, p) { return [p[0] - (pc.x || 0), p[1] - (pc.y || 0)]; }
  /* grid steps that read well in each unit; the finest one at least 7 px apart is drawn and snapped to */
  var STEPS = { cm: [.1, .5, 1, 5, 10, 50, 100], mm: [.1, .5, 1, 5, 10, 50, 100], in: [2.54 / 16, 2.54 / 8, 2.54 / 4, 2.54, 2.54 * 4, 2.54 * 12, 2.54 * 36] };
  function gridSteps() { var L = STEPS[P.unit] || STEPS.cm; for (var i = 0; i < L.length - 1; i++) if (L[i] * ST.z >= 7) return [L[i], L[i + 1]]; return [L[L.length - 2], L[L.length - 1]]; }
  function gridStep() { return gridSteps()[0]; }
  function nudgeStep(big) { return P.unit === 'in' ? 2.54 / (big ? 4 : 16) : big ? 1 : .1; }

  /* ---------- cached geometry: each piece is flattened, offset and checked once per change, not on every frame ---------- */
  var GEO = {};
  function sigOf(pc) { return JSON.stringify([pc.nodes, pc.sa, pc.hems, pc.fold, pc.closed]); }
  function geo(pc, fast) {
    var sg = sigOf(pc), g = GEO[pc.id];
    if (!g || g.sig !== sg) {
      var keep = g && g.issues; g = GEO[pc.id] = { sig: sg, segs: [], flat: [] };
      for (var s = 0; s < C.segCount(pc); s++) { var p = C.segPts(pc, s, .15); g.segs.push(p); g.flat = g.flat.concat(s ? p.slice(1, p.length) : p.slice(0, p.length)); }
      if (pc.closed !== false && g.flat.length > 1) g.flat.pop();
      g.sign = C.areaOf(g.flat) > 0 ? -1 : 1; g.issues = keep || [];
    }
    if (!fast && !g.full) { g.cut = C.cutLine(pc); g.issues = C.validate(pc); g.full = true; }
    else if (fast && !g.cut) g.cut = C.cutLine(pc, true);
    return g;
  }
  function mids(pc) { var g = geo(pc, true); if (!g.mids) { g.mids = []; for (var s = 0; s < C.segCount(pc); s++) g.mids.push(C.pointAt(pc, s, C.tAt(pc, s, C.segLen(pc, s) / 2))); } return g.mids; }

  /* ---------- snapping: points, then midpoints, then the nearest edge, then the grid (only when close to it) ---------- */
  function snap(w, skip, e) {
    if (!V().snap || (e && e.altKey)) return { p: w, k: '' };
    var best = null, R = 9 / ST.z;
    P.pieces.forEach(function (pc) { if (pc.hidden) return; var same = skip && skip.pc === pc;
      pc.nodes.forEach(function (nd, i) { if (same && skip.idx.indexOf(i) >= 0) return; var p = L2W(pc, [nd.x, nd.y]), d = C.dist(p, w); if (d < R && (!best || d < best.d)) best = { d: d, p: p, k: 'point' }; });
      if (same) return; var M = mids(pc); for (var s = 0; s < M.length; s++) { var m = L2W(pc, M[s]), d2 = C.dist(m, w); if (d2 < R * .8 && (!best || d2 < best.d)) best = { d: d2, p: m, k: 'midpoint' }; } });
    if (best) return best;
    var ne = nearestEdge(w, null, skip && skip.pc, 7 / ST.z); if (ne) return { p: L2W(ne.pc, ne.p), k: 'edge', e: ne };
    var g = gridStep(), gx = Math.round(w[0] / g) * g, gy = Math.round(w[1] / g) * g, ax = Math.abs(gx - w[0]) < R * .6, ay = Math.abs(gy - w[1]) < R * .6;
    return { p: [ax ? gx : w[0], ay ? gy : w[1]], k: ax && ay ? 'grid' : ax || ay ? 'grid line' : '' };
  }
  /* nearest point on any edge, from the cached flattened edges */
  function nearestEdge(w, only, skipPc, rad) {
    var best = null;
    P.pieces.forEach(function (pc) { if (pc.hidden || (only && pc !== only) || pc === skipPc) return; var l = W2L(pc, w), G = geo(pc, true);
      for (var s = 0; s < G.segs.length; s++) { var pts = G.segs[s], acc = 0; for (var j = 1; j < pts.length; j++) { var a = pts[j - 1], b = pts[j], vx = b[0] - a[0], vy = b[1] - a[1], LL = vx * vx + vy * vy, L = Math.sqrt(LL), t = LL ? Math.max(0, Math.min(1, ((l[0] - a[0]) * vx + (l[1] - a[1]) * vy) / LL)) : 0, qx = a[0] + vx * t, qy = a[1] + vy * t, d = Math.hypot(qx - l[0], qy - l[1]); if (!best || d < best.d) best = { d: d, pc: pc, seg: s, j: j, f: t, p: [qx, qy] }; acc += L; } } });
    if (!best || best.d >= (rad || 10 / ST.z)) return null;
    // exact parameter and distance along the curve for the picked point
    var pts2 = geo(best.pc, true).segs[best.seg], t0 = (best.j - 1 + best.f) / (pts2.length - 1), k = C.ctrl(best.pc, best.seg);
    if (k.curved) { for (var it = 0; it < 6; it++) { var q2 = C.pointAt(best.pc, best.seg, t0), dd = C.tangentAt(best.pc, best.seg, t0), dv = [q2[0] - best.p[0], q2[1] - best.p[1]], sp = (function () { var a = C.pointAt(best.pc, best.seg, Math.min(1, t0 + 1e-4)), b = C.pointAt(best.pc, best.seg, Math.max(0, t0 - 1e-4)); return C.dist(a, b) / (Math.min(1, t0 + 1e-4) - Math.max(0, t0 - 1e-4)); })(); t0 = Math.max(0, Math.min(1, t0 - (dv[0] * dd[0] + dv[1] * dd[1]) / (sp || 1))); } best.p = C.pointAt(best.pc, best.seg, t0); }
    else { t0 = best.f !== undefined ? (best.j - 1 + best.f) : t0; }
    best.t = t0; best.L = C.segLen(best.pc, best.seg); best.s = C.arc(best.pc, best.seg, t0);
    return best;
  }
  function pieceAt(w) { for (var i = P.pieces.length - 1; i >= 0; i--) { var pc = P.pieces[i]; if (pc.hidden) continue; var g = geo(pc, true); if (inside(V().sa && g.cut ? g.cut.pts : g.flat, W2L(pc, w))) return pc; } return null; }
  function inside(poly, p) { var c = false; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { var a = poly[i], b = poly[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }

  /* ---------- drawing ----------
     Pieces are drawn in pattern units under one transform, so panning and zooming only change that transform.
     Points, handles and the snap marker are drawn in screen pixels on top, so they stay the same size at any zoom. */
  function pathD(pc, close) { var n = C.segCount(pc), N = pc.nodes; if (!N.length) return ''; var d = 'M' + N[0].x.toFixed(3) + ' ' + N[0].y.toFixed(3); for (var i = 0; i < n; i++) { var k = C.ctrl(pc, i); d += k.curved ? 'C' + k.p1.map(f3).join(' ') + ' ' + k.p2.map(f3).join(' ') + ' ' + k.p3.map(f3).join(' ') : 'L' + k.p3.map(f3).join(' '); } return d + (close !== false && pc.closed !== false ? 'Z' : ''); }
  function segD(pc, i) { var k = C.ctrl(pc, i); return 'M' + k.p0.map(f3).join(' ') + (k.curved ? 'C' + k.p1.map(f3).join(' ') + ' ' + k.p2.map(f3).join(' ') + ' ' + k.p3.map(f3).join(' ') : 'L' + k.p3.map(f3).join(' ')); }
  function f3(v) { return v.toFixed(3); }
  function f1(v) { return v.toFixed(1); }
  function polyD(P2) { return P2.length ? 'M' + P2.map(function (q) { return f3(q[0]) + ' ' + f3(q[1]); }).join('L') + 'Z' : ''; }
  var PICK = ['edit', 'addpt', 'curv', 'smooth', 'notch', 'measure', 'walk', 'sa', 'cut', 'merge', 'trace', 'sew', 'fsew', 'zip', 'piping', 'binding', 'tstitch', 'pucker', 'tape'];
  function pieceHTML(pc, fast) {
    var v = V(), sel = ST.sel.indexOf(pc.id) >= 0, G = geo(pc, fast), bad = G.issues.length > 0, cl = v.sa ? G.cut : null, h = '';
    h += '<g class="ps-pc' + (sel ? ' sel' : '') + (bad ? ' bad' : '') + (pc.locked ? ' lock' : '') + '" data-pc="' + pc.id + '" transform="translate(' + f3(pc.x || 0) + ' ' + f3(pc.y || 0) + ')">';
    var fc = v.fill !== false ? fabColour(pc.fabric) : '';
    if (cl) h += '<path class="ps-cut" d="' + polyD(cl.pts) + '"/>';
    else h += '<path class="ps-cut ps-paper" d="' + pathD(pc) + '"/>';
    if (fc) h += '<path class="ps-fab" d="' + (cl ? polyD(cl.pts) : pathD(pc)) + '" style="fill:' + fc + '"/>';
    h += '<path class="ps-seam' + (v.seam ? '' : ' nos') + (cl ? '' : ' solo') + '" d="' + pathD(pc) + '"/>';
    if (pc.fold >= 0 && pc.fold < C.segCount(pc)) h += '<path class="ps-fold" d="' + segD(pc, pc.fold) + '"/>';
    if (v.internals) pc.internals.forEach(function (it) { if (it.visible === false) return; var cls = 'ps-int ' + (it.style === 'dashed' ? 'dash ' : '') + (it.purpose || '') + (ST.it === it.id ? ' on' : ''); if (it.kind === 'point') h += '<circle class="' + cls + '" cx="' + f3(it.pts[0][0]) + '" cy="' + f3(it.pts[0][1]) + '" r=".25"/>'; else if (it.kind === 'ellipse') h += '<ellipse class="' + cls + '" cx="' + f3(it.c[0]) + '" cy="' + f3(it.c[1]) + '" rx="' + f3(it.r[0]) + '" ry="' + f3(it.r[1]) + '"/>'; else h += '<path class="' + cls + '" d="M' + it.pts.map(function (q2) { return f3(q2[0]) + ' ' + f3(q2[1]); }).join('L') + (it.kind === 'rect' ? 'Z' : '') + '"/>'; });
    pc.darts.forEach(function (d) { if (d.l1) h += '<path class="ps-int" d="M' + d.l1.map(f3).join(' ') + 'L' + d.apex.map(f3).join(' ') + 'L' + d.l2.map(f3).join(' ') + '"/>'; else if (d.pts) h += '<path class="ps-int" d="M' + d.pts.map(function (q2) { return q2.map(f3).join(' '); }).join('L') + 'Z"/>'; });
    if (v.notches) { var sg = G.sign; pc.notches.forEach(function (nt) { if (nt.seg >= C.segCount(pc)) return; var r = C.notchPos(pc, nt), nv = [-r.tan[1] * sg, r.tan[0] * sg], d0 = v.sa ? C.saOf(pc, nt.seg) : 0, dep = nt.depth || .6, mkn = function (off) { var b = [r.p[0] + r.tan[0] * off, r.p[1] + r.tan[1] * off], a = [b[0] + nv[0] * d0, b[1] + nv[1] * d0], e = [a[0] - nv[0] * dep, a[1] - nv[1] * dep]; return nt.type === 'v' ? 'M' + f3(a[0] + r.tan[0] * .25) + ' ' + f3(a[1] + r.tan[1] * .25) + 'L' + e.map(f3).join(' ') + 'L' + f3(a[0] - r.tan[0] * .25) + ' ' + f3(a[1] - r.tan[1] * .25) : 'M' + a.map(f3).join(' ') + 'L' + e.map(f3).join(' ') + (nt.type === 't' ? 'M' + f3(e[0] + r.tan[0] * .3) + ' ' + f3(e[1] + r.tan[1] * .3) + 'L' + f3(e[0] - r.tan[0] * .3) + ' ' + f3(e[1] - r.tan[1] * .3) : ''); };
      h += '<path class="ps-notch' + (ST.notch === nt.id ? ' on' : '') + '" data-nt="' + nt.id + '" d="' + mkn(0) + (nt.type === 'double' ? mkn(.35) : '') + '"/>'; }); }
    if (v.grain && pc.grain) { var a = pc.grain.a, b = pc.grain.b, gd = C.dist(a, b) || 1, u = [(b[0] - a[0]) / gd, (b[1] - a[1]) / gd], nn = [-u[1], u[0]], ar = function (p, s) { return 'M' + f3(p[0] - u[0] * s * .8 + nn[0] * .4) + ' ' + f3(p[1] - u[1] * s * .8 + nn[1] * .4) + 'L' + p.map(f3).join(' ') + 'L' + f3(p[0] - u[0] * s * .8 - nn[0] * .4) + ' ' + f3(p[1] - u[1] * s * .8 - nn[1] * .4); };
      h += '<path class="ps-grain" d="M' + a.map(f3).join(' ') + 'L' + b.map(f3).join(' ') + ar(b, 1) + (pc.grainDir === 'one' ? '' : ar(a, -1)) + '"/>'; }
    h += trimsHTML(pc, G);
    if (v.labels) { var bb = C.bbox(pc), fs = Math.max(.8, Math.min(2.2, (bb[2] - bb[0]) / 10)); h += '<text class="ps-lab" x="' + f3((bb[0] + bb[2]) / 2) + '" y="' + f3((bb[1] + bb[3]) / 2) + '" font-size="' + f3(fs) + '">' + esc(pc.name || 'Piece') + '</text><text class="ps-lab2" x="' + f3((bb[0] + bb[2]) / 2) + '" y="' + f3((bb[1] + bb[3]) / 2 + fs * 1.15) + '" font-size="' + f3(fs * .6) + '">' + esc((pc.size ? pc.size + ' · ' : '') + 'Cut ' + pc.qty + (pc.pair ? ' pair' : '') + (pc.fold >= 0 ? ' on fold' : '')) + '</text>';
      if (pc.link && pc.link.on) h += '<text class="ps-link" x="' + f3(bb[0]) + '" y="' + f3(bb[1] - .5) + '" font-size=".9">' + (pc.link.mode === 'mirror' ? '⇋ mirrored link' : '⇄ linked') + '</text>'; }
    if (PICK.indexOf(ST.tool) >= 0) for (var s = 0; s < C.segCount(pc); s++) { var on = ST.seg && ST.seg.pc === pc.id && ST.seg.i === s, wk = ST.walk.some(function (w) { return w.pc === pc.id && w.seg === s; }) || ST.pick.some(function (w) { return w.pc === pc.id && w.seg === s; }); h += '<path class="ps-eh" data-pc="' + pc.id + '" data-s="' + s + '" d="' + segD(pc, s) + '"/>'; if (on || wk) h += '<path class="ps-eon" d="' + segD(pc, s) + '"/>'; }
    return h + '</g>';
  }
  /* a part of an edge as a polyline, from the cached flattened edge (fast enough to redraw every frame) */
  function rangeFast(pc, seg, a, b, off) {
    var G = geo(pc, true), pts = G.segs[seg]; if (!pts) return [];
    var cum = [0]; for (var i = 1; i < pts.length; i++) cum.push(cum[i - 1] + C.dist(pts[i], pts[i - 1]));
    var L = cum[cum.length - 1], s0 = Math.max(0, Math.min(L, Math.min(a == null ? 0 : a, b == null ? L : b))), s1 = Math.max(0, Math.min(L, Math.max(a == null ? 0 : a, b == null ? L : b))), out = [];
    function at(sv) { for (var k = 1; k < cum.length; k++) if (cum[k] >= sv - 1e-9) { var f = (sv - cum[k - 1]) / ((cum[k] - cum[k - 1]) || 1), p0 = pts[k - 1], p1 = pts[k]; return { p: [p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f], t: [p1[0] - p0[0], p1[1] - p0[1]] }; } var n = pts.length; return { p: pts[n - 1], t: [pts[n - 1][0] - pts[n - 2][0], pts[n - 1][1] - pts[n - 2][1]] }; }
    var list = [s0]; for (i = 1; i < cum.length - 1; i++) if (cum[i] > s0 && cum[i] < s1) list.push(cum[i]); list.push(s1);
    list.forEach(function (sv) { var r = at(sv), l = Math.hypot(r.t[0], r.t[1]) || 1, tx = r.t[0] / l, ty = r.t[1] / l; out.push(off ? [r.p[0] + ty * G.sign * off, r.p[1] - tx * G.sign * off] : r.p); });
    return out;
  }
  function plD(P2) { return P2.length ? 'M' + P2.map(function (q) { return f3(q[0]) + ' ' + f3(q[1]); }).join('L') : ''; }
  var SEWC = ['#e0563b', '#2f8fd8', '#36a269', '#c94fc0', '#e2a320', '#1fb3b0', '#8a62e8', '#d6457a'];
  function cwNow() { return P.colourways.filter(function (c) { return c.id === P.cw; })[0] || P.colourways[0]; }
  function fabOf(id) { return P.fabrics.filter(function (f) { return f.id === id; })[0] || null; }
  function fabColour(id) { var f = fabOf(id); return f ? (cwNow().c[f.id] || f.colour || '') : ''; }
  function trimColour(k, r, def) { return cwNow().c[k + ':' + r.id] || r.colour || def; }
  function trimsHTML(pc, G) {
    var v = V(), h = '', T = P.trims, n = C.segCount(pc), mine = function (r) { return r.pc === pc.id; }, okSeg = function (r) { return r.seg != null && r.seg < n; }, tag = function (k, r) { return ' data-tr="' + k + '|' + r.id + '"' + (ST.trim && ST.trim.id === r.id ? ' data-on="1"' : ''); };
    if (v.sewing !== false) P.sewing.forEach(function (sw, si) { [sw.A, sw.B].forEach(function (r, side) { if (r.pc !== pc.id || r.seg >= n) return; var pts = rangeFast(pc, r.seg, r.a, r.b, .12); if (pts.length < 2) return; var c = SEWC[si % SEWC.length], st = (r.b == null ? C.segLen(pc, r.seg) : r.b) < (r.a || 0) ? pts[pts.length - 1] : pts[0];
      h += '<path class="ps-sw' + (ST.seam === sw.id ? ' on' : '') + '" data-sw="' + sw.id + '" style="stroke:' + c + '" d="' + plD(pts) + '"/><circle class="ps-swd" cx="' + f3(st[0]) + '" cy="' + f3(st[1]) + '" r=".35" style="fill:' + c + '"/>'; }); });
    if (v.trims !== false) {
      T.tape.filter(mine).filter(okSeg).forEach(function (r) { h += '<path class="ps-band ps-tape"' + tag('tape', r) + ' style="stroke:' + trimColour('tape', r, '#d9c27a') + ';stroke-width:' + f3(r.w || 1) + '" d="' + plD(rangeFast(pc, r.seg, r.a, r.b, (r.w || 1) / 2)) + '"/>'; });
      T.binding.filter(mine).filter(okSeg).forEach(function (r) { h += '<path class="ps-band ps-bind"' + tag('binding', r) + ' style="stroke:' + trimColour('binding', r, '#3a5a8c') + ';stroke-width:' + f3(r.w || 1) + '" d="' + plD(rangeFast(pc, r.seg, r.a, r.b, 0)) + '"/>'; });
      T.piping.filter(mine).filter(okSeg).forEach(function (r) { var w = (r.w || .4) + .2; h += '<path class="ps-band ps-pip"' + tag('piping', r) + ' style="stroke:' + trimColour('piping', r, '#7a2f2f') + ';stroke-width:' + f3(w) + '" d="' + plD(rangeFast(pc, r.seg, r.a, r.b, -w / 2)) + '"/>'; });
      T.pucker.filter(mine).filter(okSeg).forEach(function (r) { var pts = rangeFast(pc, r.seg, r.a, r.b, .5), out = [], amp = .12 + (+r.str || .5) * .3; for (var k = 1; k < pts.length; k++) { var a = pts[k - 1], b = pts[k], L = C.dist(a, b), m = Math.max(1, Math.round(L / .5)); for (var j = 0; j < m; j++) { var f = j / m, x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f, nx = -(b[1] - a[1]) / (L || 1), ny = (b[0] - a[0]) / (L || 1), sgn = (out.length % 2 ? 1 : -1) * amp; out.push([x + nx * sgn, y + ny * sgn]); } } h += '<path class="ps-puk"' + tag('pucker', r) + ' d="' + plD(out) + '"/>'; });
      T.tstitch.filter(mine).filter(okSeg).forEach(function (r) { var len = 2.54 / (+r.spi || 12), dw = Math.max(.05, C.threadDia(+r.tex || 30) / 10 * 1.4); for (var k = 0; k < (+r.rows || 1); k++) h += '<path class="ps-ts"' + tag('tstitch', r) + ' style="stroke:' + trimColour('tstitch', r, '#2b2b2b') + ';stroke-width:' + f3(dw) + ';stroke-dasharray:' + f3(len * .72) + ' ' + f3(len * .28) + '" d="' + plD(rangeFast(pc, r.seg, r.a, r.b, (+r.off || .15) + k * (+r.gap || .64))) + '"/>'; });
      T.zip.filter(mine).filter(okSeg).forEach(function (r) { var pts = rangeFast(pc, r.seg, r.a, r.b, .5), w = { 3: .45, 5: .6, 8: .8, 10: .95 }[r.gauge || 5] || .6; h += '<path class="ps-zipt"' + tag('zip', r) + ' style="stroke:' + trimColour('zip', r, '#2b2b2b') + ';stroke-width:1.6" d="' + plD(rangeFast(pc, r.seg, r.a, r.b, .8)) + '"/><path class="ps-zip"' + tag('zip', r) + ' style="stroke-width:' + f3(w) + ';stroke-dasharray:' + f3(w * .35) + ' ' + f3(w * .35) + '" d="' + plD(pts) + '"/>'; if (pts.length) h += '<rect class="ps-zpull" x="' + f3(pts[0][0] - .5) + '" y="' + f3(pts[0][1] - .5) + '" width="1" height="1.6" rx=".2"' + tag('zip', r) + '/>'; });
      T.hole.filter(mine).forEach(function (r) { var L = +r.len || 1.8, a = (+r.ang || 0) * Math.PI / 180, c = r.at, dx = Math.cos(a) * L / 2, dy = Math.sin(a) * L / 2; h += '<g' + tag('hole', r) + ' class="ps-hole"><path d="M' + f3(c[0] - dx) + ' ' + f3(c[1] - dy) + 'L' + f3(c[0] + dx) + ' ' + f3(c[1] + dy) + '" style="stroke-width:.3;stroke:' + trimColour('hole', r, '#5b4a3a') + '"/><path d="M' + f3(c[0] - dx) + ' ' + f3(c[1] - dy) + 'L' + f3(c[0] + dx) + ' ' + f3(c[1] + dy) + '" style="stroke-width:.06;stroke:#fbfaf7"/></g>'; });
      T.button.filter(mine).forEach(function (r) { var d = +r.size || 1.5, c = r.at, col = trimColour('button', r, '#e9e2d3'), hh = '<circle cx="' + f3(c[0]) + '" cy="' + f3(c[1]) + '" r="' + f3(d / 2) + '" style="fill:' + col + '"/>'; var nh = +r.holes || 4, o = d * .14; if (nh === 2) hh += '<circle class="ps-bh" cx="' + f3(c[0] - o) + '" cy="' + f3(c[1]) + '" r="' + f3(d * .06) + '"/><circle class="ps-bh" cx="' + f3(c[0] + o) + '" cy="' + f3(c[1]) + '" r="' + f3(d * .06) + '"/>'; else if (nh === 4) [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { hh += '<circle class="ps-bh" cx="' + f3(c[0] + q[0] * o) + '" cy="' + f3(c[1] + q[1] * o) + '" r="' + f3(d * .055) + '"/>'; }); h += '<g class="ps-btn"' + tag('button', r) + '>' + hh + '</g>'; });
    }
    if (v.graphics !== false) T.graphic.filter(mine).forEach(function (r) { var w = +r.w || 8, hh = +r.h || 8, x = r.at[0] - w / 2, y = r.at[1] - hh / 2; h += '<g class="ps-gfx"' + tag('graphic', r) + ' transform="rotate(' + (+r.rot || 0) + ' ' + f3(r.at[0]) + ' ' + f3(r.at[1]) + ')" style="opacity:' + (r.op == null ? 1 : r.op) + '">' + (r.src ? '<image href="' + r.src + '" x="' + f3(x) + '" y="' + f3(y) + '" width="' + f3(w) + '" height="' + f3(hh) + '" preserveAspectRatio="none"/>' : '<text x="' + f3(r.at[0]) + '" y="' + f3(r.at[1]) + '" font-size="' + f3(hh * .6) + '" text-anchor="middle" dominant-baseline="middle">' + esc(r.text || 'TEXT') + '</text>') + '<rect class="ps-gb" x="' + f3(x) + '" y="' + f3(y) + '" width="' + f3(w) + '" height="' + f3(hh) + '"/></g>'; });
    return h;
  }
  function addSeam(A, B) {
    act('Sew', function () { var sw = { id: C.uid('sw'), A: A, B: B, ease: 0, type: 'Plain seam' }; P.sewing.push(sw); ST.seam = sw.id; ST.trim = null; ST.tab = 'sewing'; });
    var sw2 = P.sewing[P.sewing.length - 1], r = C.seamLens(P, sw2); toast('Sewn: ' + F(r.a) + ' to ' + F(r.b) + (Math.abs(r.diff) > .3 ? '. The edges differ by ' + F(Math.abs(r.diff)) + ': set the planned ease or adjust the pattern.' : '. Lengths match.'), Math.abs(r.diff) > .3);
  }
  function tsPreset() { var L = P.presets.tstitch; return L.filter(function (x) { return x.id === ST.tsp; })[0] || L[0]; }
  function trimOf(t) { if (!t) return null; var L = P.trims[t.k]; if (!L) return null; for (var i = 0; i < L.length; i++) if (L[i].id === t.id) return L[i]; return null; }
  function draw() { if (!ON) return; world.innerHTML = P.pieces.filter(function (pc) { return !pc.hidden; }).map(function (pc) { return pieceHTML(pc); }).join(''); drawView(); status(); }
  function drawPiece(pc, fast) { var old = world.querySelector('g[data-pc="' + pc.id + '"]'), h = pc.hidden ? '' : pieceHTML(pc, fast); if (old) { if (h) old.insertAdjacentHTML('afterend', h); old.remove(); } else if (h) world.insertAdjacentHTML('beforeend', h); }
  function placeG(pc) { var g = world.querySelector('g[data-pc="' + pc.id + '"]'); if (g) g.setAttribute('transform', 'translate(' + f3(pc.x || 0) + ' ' + f3(pc.y || 0) + ')'); }
  function drawView() {
    if (!ON) return; var tr = 'translate(' + ST.tx.toFixed(2) + ' ' + ST.ty.toFixed(2) + ') scale(' + ST.z + ')';
    world.setAttribute('transform', tr); q('#ps-grid').setAttribute('transform', tr); q('#ps-over').setAttribute('transform', tr);
    drawGrid(); drawOver(); drawPts(); drawRulers(); var zl = q('#ps-zl'); if (zl) zl.textContent = Math.round(ST.z / pxPerCm() * 100) + '%';
  }
  function segTouches(pc, i) { if (!ST.seg || ST.seg.pc !== pc.id) return false; var n = pc.nodes.length; return ST.seg.i === i || (ST.seg.i + 1) % n === i; }
  function drawPts() {
    var h = '', v = V();
    P.pieces.forEach(function (pc) {
      if (pc.hidden) return; var sel = ST.sel.indexOf(pc.id) >= 0, show = ST.tool === 'edit' && (sel || ST.node && ST.node.pc === pc.id) || v.points || ST.tool === 'cut' || (ST.tool === 'edit' && ST.sel.length === 0);
      if (!show) return; var faint = ST.tool === 'edit' && !sel && !(ST.node && ST.node.pc === pc.id);
      pc.nodes.forEach(function (nd, i) { var isSel = ST.node && ST.node.pc === pc.id && ST.node.idx.indexOf(i) >= 0, s = W2S(L2W(pc, [nd.x, nd.y]));
        if (ST.tool === 'edit' && !faint && (isSel || segTouches(pc, i))) ['h1', 'h2'].forEach(function (k) { if (!nd[k]) return; var e = W2S(L2W(pc, [nd.x + nd[k][0], nd.y + nd[k][1]])); h += '<path class="ps-hl" d="M' + f1(s[0]) + ' ' + f1(s[1]) + 'L' + f1(e[0]) + ' ' + f1(e[1]) + '"/><circle class="ps-hd" data-pc="' + pc.id + '" data-n="' + i + '" data-h="' + k + '" cx="' + f1(e[0]) + '" cy="' + f1(e[1]) + '" r="4.5"/>'; });
        h += nd.smooth ? '<circle class="ps-pt' + (isSel ? ' on' : '') + (faint ? ' fa' : '') + '" data-pc="' + pc.id + '" data-n="' + i + '" cx="' + f1(s[0]) + '" cy="' + f1(s[1]) + '" r="' + (faint ? 3 : 4.5) + '"/>' : '<rect class="ps-pt' + (isSel ? ' on' : '') + (faint ? ' fa' : '') + '" data-pc="' + pc.id + '" data-n="' + i + '" x="' + f1(s[0] - (faint ? 3 : 4.5)) + '" y="' + f1(s[1] - (faint ? 3 : 4.5)) + '" width="' + (faint ? 6 : 9) + '" height="' + (faint ? 6 : 9) + '"/>'; });
    });
    h += hoverHTML() + xfHTML();
    if (ST.hover) { var s2 = W2S(ST.hover.p); h += '<circle class="ps-snap" cx="' + f1(s2[0]) + '" cy="' + f1(s2[1]) + '" r="6"/>' + (ST.hover.k ? '<text class="ps-sk" x="' + f1(s2[0] + 9) + '" y="' + f1(s2[1] - 8) + '">' + esc(ST.hover.k) + '</text>' : ''); }
    if (ST.live) { var L = ST.live, x = L.at[0] + 16, y = L.at[1] + 22, w = Math.max(60, L.t.length * 6.6 + 12); h += '<g class="ps-live"><rect x="' + f1(x) + '" y="' + f1(y - 14) + '" width="' + f1(w) + '" height="20" rx="4"/><text x="' + f1(x + 6) + '" y="' + f1(y) + '">' + esc(L.t) + '</text></g>'; }
    ptsG.innerHTML = h;
  }
  function edgeScreen(pc, seg) { var G = geo(pc, true), pts = G.segs[seg] || []; return pts.map(function (q2) { return W2S(L2W(pc, q2)); }); }
  function hoverHTML() {
    var h = '', lab = function (p, t) { var w = t.length * 6.4 + 12; return '<g class="ps-live ps-elab"><rect x="' + f1(p[0] + 12) + '" y="' + f1(p[1] - 30) + '" width="' + f1(w) + '" height="19" rx="4"/><text x="' + f1(p[0] + 18) + '" y="' + f1(p[1] - 16) + '">' + esc(t) + '</text></g>'; };
    if (ST.hovE && !drag) { var E = ST.hovE, P2 = edgeScreen(E.pc, E.seg); h += '<path class="ps-hov" d="M' + P2.map(function (q2) { return f1(q2[0]) + ' ' + f1(q2[1]); }).join('L') + '"/>' + lab(E.at, 'Edge ' + (E.seg + 1) + ' · ' + F(E.L) + (ST.tool === 'edit' ? '' : ' · at ' + F(E.s))); }
    if (ST.seg && pcById(ST.seg.pc) && !drag) { var pc = pcById(ST.seg.pc), s = ST.seg.i, L = C.segLen(pc, s), mp = W2S(L2W(pc, C.pointAt(pc, s, C.tAt(pc, s, L / 2)))); h += lab([mp[0] - 12, mp[1] + 40], F(L)); }
    return h;
  }
  function drawGrid() {
    var g = q('#ps-grid'); if (!V().grid) { g.innerHTML = ''; return; }
    var r = svg.getBoundingClientRect(), S = gridSteps(), st = S[0], maj = S[1], z = ST.z; ST.gstep = st;
    var x0 = Math.floor(-ST.tx / z / st) * st, x1 = (r.width - ST.tx) / z, y0 = Math.floor(-ST.ty / z / st) * st, y1 = (r.height - ST.ty) / z, h = '';
    if ((x1 - x0) / st > 800 || (y1 - y0) / st > 800) { g.innerHTML = ''; return; }
    var isM = function (v) { var k = v / maj; return Math.abs(k - Math.round(k)) < 1e-6; };
    for (var x = x0; x <= x1; x += st) h += '<path class="' + (isM(x) ? 'gM' : 'gm') + '" d="M' + f3(x) + ' ' + f3(y0) + 'V' + f3(y1) + '"/>';
    for (var y = y0; y <= y1; y += st) h += '<path class="' + (isM(y) ? 'gM' : 'gm') + '" d="M' + f3(x0) + ' ' + f3(y) + 'H' + f3(x1) + '"/>';
    h += '<path class="g0" d="M0 ' + f3(y0) + 'V' + f3(y1) + 'M' + f3(x0) + ' 0H' + f3(x1) + '"/>';
    g.innerHTML = h;
  }
  function drawOver() {
    var o = q('#ps-over'), h = '', px = 1 / ST.z, d = ST.draft;
    if (d && d.pts && d.pts.length) {
      var pp = d.pts.concat(d.cur && !(drag && drag.k === 'polyh') ? [{ p: d.cur, h: null }] : []), path = 'M' + pp[0].p.map(f3).join(' ');
      for (var pi = 1; pi < pp.length; pi++) { var A = pp[pi - 1], B = pp[pi]; if (A.h || B.h) { var c1 = A.h ? [A.p[0] + A.h[0], A.p[1] + A.h[1]] : A.p, c2 = B.h ? [B.p[0] - B.h[0], B.p[1] - B.h[1]] : B.p; path += 'C' + c1.map(f3).join(' ') + ' ' + c2.map(f3).join(' ') + ' ' + B.p.map(f3).join(' '); } else path += 'L' + B.p.map(f3).join(' '); }
      if (d.kind === 'poly' && d.pts.length > 2 && d.cur && C.dist(d.cur, d.pts[0].p) < 9 / ST.z) path += 'Z';
      h += '<path class="ps-dr" d="' + path + '"/>';
      d.pts.forEach(function (e, i) { if (e.h) h += '<path class="ps-dh" d="M' + f3(e.p[0] - e.h[0]) + ' ' + f3(e.p[1] - e.h[1]) + 'L' + f3(e.p[0] + e.h[0]) + ' ' + f3(e.p[1] + e.h[1]) + '"/><circle class="ps-dhc" cx="' + f3(e.p[0] + e.h[0]) + '" cy="' + f3(e.p[1] + e.h[1]) + '" r="' + f3(3 * px) + '"/><circle class="ps-dhc" cx="' + f3(e.p[0] - e.h[0]) + '" cy="' + f3(e.p[1] - e.h[1]) + '" r="' + f3(3 * px) + '"/>'; h += '<rect class="ps-dpt' + (i === 0 ? ' on' : '') + '" x="' + f3(e.p[0] - 4 * px) + '" y="' + f3(e.p[1] - 4 * px) + '" width="' + f3(8 * px) + '" height="' + f3(8 * px) + '"/>'; });
    }
    if (d && d.box) { var b = d.box; if (d.kind === 'ellipse' || d.kind === 'iell') h += '<ellipse class="ps-dr" cx="' + f3((b[0] + b[2]) / 2) + '" cy="' + f3((b[1] + b[3]) / 2) + '" rx="' + f3(Math.abs(b[2] - b[0]) / 2) + '" ry="' + f3(Math.abs(b[3] - b[1]) / 2) + '"/>'; else h += '<path class="ps-dr" d="M' + f3(b[0]) + ' ' + f3(b[1]) + 'H' + f3(b[2]) + 'V' + f3(b[3]) + 'H' + f3(b[0]) + 'Z"/>'; }
    if (d && d.line) h += '<path class="ps-dr" d="M' + d.line[0].map(f3).join(' ') + 'L' + d.line[1].map(f3).join(' ') + '"/>';
    if (ST.marq) { var m = ST.marq; h += '<path class="ps-marq" d="M' + f3(m[0]) + ' ' + f3(m[1]) + 'H' + f3(m[2]) + 'V' + f3(m[3]) + 'H' + f3(m[0]) + 'Z"/>'; }
    if (ST.meas.length) { var M = ST.meas.concat(ST.mcur ? [ST.mcur] : []); h += '<path class="ps-ms" d="M' + M.map(function (p) { return p.map(f3).join(' '); }).join('L') + '"/>'; M.forEach(function (p, i) { h += '<circle class="ps-msp" cx="' + f3(p[0]) + '" cy="' + f3(p[1]) + '" r="' + f3(3 * px) + '"/>'; if (i) { var a = M[i - 1]; h += '<text class="ps-mt" x="' + f3((a[0] + p[0]) / 2) + '" y="' + f3((a[1] + p[1]) / 2 - 6 * px) + '" font-size="' + f3(12 * px) + '">' + esc(F(C.dist(a, p))) + '</text>'; } }); }
    if (ST.cut.length) ST.cut.forEach(function (c) { var pc = pcById(c.pc), w = L2W(pc, c.p); h += '<circle class="ps-msp" cx="' + f3(w[0]) + '" cy="' + f3(w[1]) + '" r="' + f3(5 * px) + '"/>'; });
    o.innerHTML = h;
  }
  var CV = null;
  function drawRulers() {
    var on = V().rulers !== false; centerEl.classList.toggle('noru', !on); if (!on) return;
    if (!CV) { var cs = getComputedStyle(app); CV = { bg: cs.getPropertyValue('--p1').trim() || '#212428', tk: cs.getPropertyValue('--dim').trim() || '#6f757c', tx: cs.getPropertyValue('--mu').trim() || '#9da3aa', ac: cs.getPropertyValue('--ac').trim() || '#e08a5e' }; }
    var dpr = window.devicePixelRatio || 1, S = gridSteps(), st = S[0], maj = S[1], R = svg.getBoundingClientRect(), LS = STEPS[P.unit] || STEPS.cm, lab = LS[LS.length - 1]; for (var li = 0; li < LS.length; li++) if (LS[li] * ST.z >= (P.unit === 'mm' ? 56 : 44) && LS[li] >= maj - 1e-9) { lab = LS[li]; break; }
    [[rx, 'x'], [ry, 'y']].forEach(function (A) {
      var c = A[0], r = c.getBoundingClientRect(), W = r.width, Hh = r.height; if (!W || !Hh) return; c.width = Math.round(W * dpr); c.height = Math.round(Hh * dpr); var g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = CV.bg; g.fillRect(0, 0, W, Hh); g.strokeStyle = CV.tk; g.fillStyle = CV.tx; g.font = '10px ui-monospace,Menlo,monospace'; g.lineWidth = 1;
      var off = A[1] === 'x' ? ST.tx + (R.left - r.left) : ST.ty + (R.top - r.top), len = A[1] === 'x' ? W : Hh, v0 = Math.floor(-off / ST.z / st) * st;
      g.beginPath();
      for (var v = v0; v * ST.z + off < len; v += st) { var s = Math.round(v * ST.z + off) + .5, k = v / maj, big = Math.abs(k - Math.round(k)) < 1e-6; if (A[1] === 'x') { g.moveTo(s, Hh); g.lineTo(s, Hh - (big ? 9 : 4)); } else { g.moveTo(W, s); g.lineTo(W - (big ? 9 : 4), s); }
        var kl = v / lab; if (Math.abs(kl - Math.round(kl)) < 1e-6) { var t = String(+C.toU(v, P.unit).toFixed(P.unit === 'in' ? 2 : P.unit === 'mm' ? 0 : 1)); if (A[1] === 'x') g.fillText(t, s + 3, 10); else { g.save(); g.translate(10, s - 3); g.rotate(-Math.PI / 2); g.fillText(t, 0, 0); g.restore(); } } }
      g.stroke();
      if (ST.cursor) { var cpos = (A[1] === 'x' ? ST.cursor[0] : ST.cursor[1]) * ST.z + off; g.strokeStyle = CV.ac; g.beginPath(); if (A[1] === 'x') { g.moveTo(cpos, 0); g.lineTo(cpos, Hh); } else { g.moveTo(0, cpos); g.lineTo(W, cpos); } g.stroke(); }
    });
    q('#ps-ucorner').textContent = P.unit;
  }
  function status(msg) {
    if (!statusEl) return; var t = TOOL[ST.tool], sel = ST.sel.length, tot = P.pieces.length;
    statusEl.innerHTML = '<b>' + esc(t ? t.n : '') + '</b><span class="ps-hint">' + esc(msg || hint()) + '</span><span class="ps-sp"></span>' + (ST.cursor ? '<span class="xy">X ' + U(ST.cursor[0]) + '  Y ' + U(ST.cursor[1]) + ' ' + P.unit + '</span>' : '') + '<span>' + sel + ' / ' + tot + ' selected</span><span>Snap ' + (V().snap ? 'on' : 'off') + '</span>';
  }
  function hint() { var t = TOOL[ST.tool]; if (ST.tool === 'poly' && ST.draft) return ST.draft.pts.length + ' points. Click the first point or press Enter to close. Esc cancels.'; if (ST.tool === 'cut' && ST.cut.length) return 'Now click the second point on the same piece.'; if (ST.tool === 'merge' && ST.walk.length === 1) return 'Now click the matching edge on the other piece.'; if (ST.tool === 'walk' && ST.walk.length === 1) return 'Now click the edge it is sewn to.'; return t ? t.tip.split('. ')[0] + '.' : ''; }
  function pxPerCm() { return 96 / 2.54; }
  function toast(t, bad) { if (!toastEl) return; toastEl.textContent = t; toastEl.className = 'ps-toast' + (bad ? ' bad' : ''); toastEl.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.hidden = true; }, bad ? 6000 : 3200); }

  /* ---------- change handling ---------- */
  function refsOf() { var L = []; P.sewing.forEach(function (sw) { L.push(sw.A, sw.B); }); C.TRIMS.forEach(function (k) { if (k === 'button' || k === 'hole' || k === 'graphic') return; P.trims[k].forEach(function (r) { L.push(r); }); }); return L; }
  function fixRefs() {
    P.pieces.forEach(function (pc) { var sh = pc._sewShift; if (!sh) return; delete pc._sewShift;
      sh.forEach(function (op) { refsOf().forEach(function (r) { if (r.pc !== pc.id) return;
        if (op[0] === 'rev') { var S = op[1], L = C.segLen(pc, (S - 1 - r.seg + S) % S); r.seg = (S - 1 - r.seg + S) % S; var a = r.a == null ? 0 : r.a, b = r.b == null ? L : r.b; r.a = L - a; r.b = L - b; return; }
        var at = op[0], dl = op[1]; if (dl > 0) { if (r.seg > at) r.seg += dl; } else { if (r.seg === at || r.seg === at - 1 || (at === 0 && r.seg === pc.nodes.length)) r.dead = 1; else if (r.seg > at) r.seg += dl; } }); }); });
    var n0 = P.sewing.length; P.sewing = P.sewing.filter(function (sw) { return [sw.A, sw.B].every(function (r) { var pc = pcById(r.pc); return pc && !r.dead && r.seg < C.segCount(pc); }); });
    C.TRIMS.forEach(function (k) { P.trims[k] = P.trims[k].filter(function (r) { var pc = pcById(r.pc); return pc && !r.dead && (r.seg == null || r.seg < C.segCount(pc)); }); });
    return n0 - P.sewing.length;
  }
  function onChange() { var lost = fixRefs(); if (lost > 0) setTimeout(function () { toast(lost + ' seam' + (lost > 1 ? 's were' : ' was') + ' removed because the edge it used changed. Sew it again.', 1); }, 50); syncLinks(); ST.dirty = true; clearTimeout(timer); timer = setTimeout(autosave, 700); }
  function syncLinks() { P.pieces.forEach(function (pc) { if (pc.link && pc.link.on) { var src = pcById(pc.link.to); if (src) C.syncLinked(src, pc); else pc.link = null; } }); }
  function autosave() { ls(AUTO, { t: Date.now(), p: P, file: ST.fileName }); savedLabel(); }
  function savedLabel() { var el = q('#ps-saved'); if (!el) return; el.textContent = ST.dirty ? (ST.savedAt ? 'Autosaved · changes not saved to a project' : 'Autosaved') : (ST.savedAt ? 'Saved' : ''); }
  function act(label, fn) { var ok = H.exec(label, fn); if (ok !== false) refresh(); return ok; }
  function refresh() { C.normalize(P); C.defaults = { sa: P.settings.sa, hem: P.settings.hem }; draw(); objects(); props(); q('#ps-name').value = P.name; qa('[data-v]').forEach(function (c) { c.checked = V()[c.dataset.v] !== false; }); q('[data-a=undo]').disabled = !H.u.length; q('[data-a=redo]').disabled = !H.r.length; savedLabel(); }
  function selected() { return ST.sel.map(pcById).filter(Boolean); }

  /* ---------- objects panel ---------- */
  function piecesList() {
    if (!P.pieces.length) { return '<p class="ps-empty">No pieces yet. Draw one with the Draw tools, add a rectangle, or bring in the draft.</p>'; }
    return P.pieces.map(function (pc) { var on = ST.sel.indexOf(pc.id) >= 0, bad = geo(pc).issues.length;
      return '<div class="ps-ob' + (on ? ' on' : '') + '" data-pc="' + pc.id + '"><button type="button" class="ps-eye" data-a="vis" data-pc="' + pc.id + '" aria-pressed="' + !pc.hidden + '" title="' + (pc.hidden ? 'Show' : 'Hide') + '">' + (pc.hidden ? '◌' : '●') + '</button><span class="ps-on">' + esc(pc.name || 'Piece') + (bad ? ' <i title="Has problems: see Properties">!</i>' : '') + (pc.link && pc.link.on ? ' <i class="lk" title="Linked copy">⇄</i>' : '') + '</span><button type="button" class="ps-lk" data-a="lock" data-pc="' + pc.id + '" aria-pressed="' + !!pc.locked + '" title="' + (pc.locked ? 'Unlock' : 'Lock') + '">' + (pc.locked ? '🔒' : '·') + '</button></div>'
        + (on && pc.internals.length ? '<div class="ps-obs">' + pc.internals.map(function (it) { return '<div data-it="' + it.id + '" data-pc="' + pc.id + '" class="' + (ST.it === it.id ? 'on' : '') + '">' + esc((it.label || it.purpose || it.kind) + ' · ' + it.kind) + '</div>'; }).join('') + '</div>' : ''); }).join('');
  }

  /* ---------- object browser ---------- */
  var KN = { button: 'Buttons', hole: 'Buttonholes', zip: 'Zippers', piping: 'Piping', binding: 'Binding', tstitch: 'Topstitching', pucker: 'Puckering', tape: 'Seam tape', graphic: 'Graphics' };
  function trimLabel(k, r) { var pc = pcById(r.pc), on = pc ? pc.name : '?', L = pc && r.seg != null ? C.rangeLen(pc, r) : 0;
    return { button: (r.name || 'Button') + ' ' + Math.round((+r.size || 1.5) * 10) + ' mm', hole: 'Buttonhole ' + Math.round((+r.len || 1.8) * 10) + ' mm', zip: (r.type || 'Coil') + ' #' + (r.gauge || 5) + ', ' + F(L), piping: 'Piping ' + F(L), binding: (r.type || 'Binding') + ' ' + F(L), tstitch: (r.rows || 1) + ' row' + ((r.rows || 1) > 1 ? 's' : '') + ', ' + (r.spi || 12) + ' SPI, ' + F(L), pucker: (r.mode || 'Visual') + ' puckering ' + F(L), tape: (r.type || 'Tape') + ' ' + F(L), graphic: (r.name || 'Graphic') }[k] + ' · ' + on; }
  function objects() {
    qa('[data-tab]').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.tab === ST.tab); });
    var h = '', T = P.trims, cw = cwNow();
    if (ST.tab === 'pieces') h = piecesList() + '<div class="ps-objb">' + btn('rect10', '+ Rectangle') + btn('fromdraft', '+ Draft pieces') + '</div>';
    else if (ST.tab === 'sewing') {
      h = P.sewing.length ? P.sewing.map(function (sw, i) { var r = C.seamLens(P, sw), A = pcById(sw.A.pc), B = pcById(sw.B.pc); return '<div class="ps-ob' + (ST.seam === sw.id ? ' on' : '') + '" data-swl="' + sw.id + '"><i class="ps-dot" style="background:' + SEWC[i % SEWC.length] + '"></i><span class="ps-on">' + esc(A.name) + ' ' + (sw.A.seg + 1) + ' ↔ ' + esc(B.name) + ' ' + (sw.B.seg + 1) + '</span><em class="' + (r.ok ? 'ok' : 'no') + '">' + (r.diff >= 0 ? '+' : '−') + U(Math.abs(r.diff)) + '</em></div>'; }).join('') : '<p class="ps-empty">No sewing yet. Use Segment sewing (J) to sew whole edges, or Free sewing for parts of edges.</p>';
      h += '<div class="ps-objb">' + btn('tool:sew', 'Segment sewing') + btn('tool:fsew', 'Free sewing') + '</div>';
    } else if (ST.tab === 'fabric') {
      var un = P.pieces.filter(function (pc) { return !fabOf(pc.fabric); }).length;
      h = P.fabrics.length ? P.fabrics.map(function (f) { var n = P.pieces.filter(function (pc) { return pc.fabric === f.id; }).length; return '<div class="ps-ob' + (ST.fab === f.id ? ' on' : '') + '" data-fab="' + f.id + '"><i class="ps-sw2" style="background:' + (cw.c[f.id] || f.colour) + '"></i><span class="ps-on">' + esc(f.name) + '</span><em>' + n + ' pc</em></div>'; }).join('') : '<p class="ps-empty">No fabrics yet. Add one from the library or make a new one, then give it to pieces.</p>';
      if (un && P.pieces.length) h += '<p class="ps-n">' + un + ' piece' + (un > 1 ? 's have' : ' has') + ' no fabric.</p>';
      h += '<div class="ps-lib"><select id="ps-libsel" aria-label="Fabric library"><option value="">Add from the library…</option>' + libGroups() + '</select></div><div class="ps-objb">' + btn('fabnew', '+ New fabric') + btn('fabassign', 'Give to selected') + '</div>';
    } else if (ST.tab === 'trims') {
      var any = false; Object.keys(KN).forEach(function (k) { var L = T[k]; if (!L.length) return; any = true; h += '<div class="ps-grp">' + KN[k] + ' <span>' + L.length + '</span></div>' + L.map(function (r) { return '<div class="ps-ob' + (ST.trim && ST.trim.id === r.id ? ' on' : '') + '" data-trl="' + k + '|' + r.id + '"><span class="ps-on">' + esc(trimLabel(k, r)) + '</span></div>'; }).join(''); });
      if (!any) h += '<p class="ps-empty">No trims yet. Pick a trim tool on the left (Button, Zipper, Topstitch…) and click on a piece or edge.</p>';
      h += '<div class="ps-grp">Topstitch presets</div>' + P.presets.tstitch.map(function (x) { return '<div class="ps-ob' + (tsPreset().id === x.id ? ' on' : '') + '" data-tsp="' + x.id + '"><i class="ps-sw2" style="background:' + x.colour + '"></i><span class="ps-on">' + esc(x.name) + '</span><em>' + x.spi + ' SPI · Tex ' + x.tex + '</em></div>'; }).join('');
    } else if (ST.tab === 'cw') {
      var rowsM = P.fabrics.map(function (f) { return [f.id, f.name, f.colour || '#cccccc']; });
      ['button', 'zip', 'piping', 'binding', 'tstitch', 'tape', 'hole'].forEach(function (k) { P.trims[k].forEach(function (r) { rowsM.push([k + ':' + r.id, trimLabel(k, r), r.colour || '#cccccc']); }); });
      h = '<div class="ps-cwt"><table><tr><th></th>' + P.colourways.map(function (c) { return '<th><label class="ps-cwh"><input type="radio" name="ps-cw" data-cwsel="' + c.id + '"' + (c.id === P.cw ? ' checked' : '') + '><input type="text" data-cwn="' + c.id + '" value="' + esc(c.name) + '"></label></th>'; }).join('') + '</tr>'
        + (rowsM.length ? rowsM.map(function (r) { return '<tr><td title="' + esc(r[1]) + '">' + esc(r[1]) + '</td>' + P.colourways.map(function (c) { return '<td><input type="color" data-cwc="' + c.id + '|' + r[0] + '" value="' + (c.c[r[0]] || r[2]) + '"></td>'; }).join('') + '</tr>'; }).join('') : '<tr><td colspan="9" class="ps-n">Add fabrics and trims to colour them.</td></tr>') + '</table></div>'
        + '<div class="ps-objb">' + btn('cwadd', '+ Colourway') + (P.colourways.length > 1 ? btn('cwdel', 'Delete current', 'bad') : '') + '</div><p class="ps-n">The checked colourway colours the pieces and trims on the canvas and the BOM.</p>';
    } else if (ST.tab === 'bom') {
      var B = C.bom(P); h = B.length ? '<div class="ps-bom">' + B.map(function (r) { return '<div class="ps-bomr"><b>' + esc(r.kind) + '</b><span>' + esc(r.item) + (r.colour ? ' <i class="ps-sw2" style="background:' + r.colour + '"></i>' : '') + '<small>' + esc(r.desc) + '</small></span><em>' + r.qty + ' ' + r.unit + '</em></div>'; }).join('') + '</div>' : '<p class="ps-empty">Nothing to list yet.</p>';
      h += '<p class="ps-n">Colourway: ' + esc(cw.name) + '. Fabric is an estimate from piece areas at ' + P.settings.efficiency + '% marker efficiency; confirm it with a marker.</p><div class="ps-objb">' + btn('bomcsv', 'Export BOM (CSV)') + btn('settings', 'Settings') + '</div>';
    }
    objsEl.innerHTML = h;
  }
  function libGroups() { var L = window.FC_FABLIB || [], g = {}; L.forEach(function (f) { (g[f.g] = g[f.g] || []).push(f); }); return Object.keys(g).map(function (k) { return '<optgroup label="' + esc(k) + '">' + g[k].map(function (f) { return '<option value="' + f.key + '">' + esc(f.n) + ' · ' + f.gsm + ' gsm</option>'; }).join('') + '</optgroup>'; }).join(''); }
  var LIBCOL = { poplin: '#f2efe6', jersey: '#d9dde3', linen: '#e6dcc8', rayon: '#c9d6e6', crepe: '#d8c9d6', georgette: '#e8d6d6', denim: '#3e5878', fleece: '#a8a8b0', voile: '#f4f1ea', cambric: '#efece4', oxford: '#c8d6e8', chambray: '#9fb4cc', flannel: '#b98f84', khadi: '#e3d6bd', twill: '#c4b38f', canvas: '#cbbd9a', denim12: '#2f4560', sdenim: '#45607f', cord: '#8a6a4a', satin: '#d9c3c9', organza: '#efe8f0', taffeta: '#b8495a', vcrepe: '#5a4a6a', pcrepe: '#d6cfc4', suiting: '#4a4f5a', wflannel: '#8f8f95', melton: '#5a4436', tweed: '#8a7a62', rib: '#cfc9c2', interlock: '#e2e2e2', terry: '#d2c6b4', ponte: '#3a3a40', scuba: '#2f3d4a', brocade: '#b8913f', chanderi: '#e8d9b0', velvet: '#5a1f2f', net: '#f0ece8', leather: '#5e3a24' };
  function libFabric(key) { var f = (window.FC_FABLIB || []).filter(function (x) { return x.key === key; })[0]; if (!f) return null; var knit = /jersey|fleece|rib|interlock|terry|ponte|scuba/.test(key);
    return { id: C.uid('fb'), lib: key, name: f.n, type: knit ? 'Knit' : key === 'leather' ? 'Leather' : 'Woven', comp: '', gsm: f.gsm, width: knit ? 160 : 145, thick: f.thick, colour: LIBCOL[key] || '#dddddd', shrinkL: 0, shrinkW: 0, sw: f.sw, sl: f.sl, sb: f.sb, stiff: f.stiff, fric: f.fric, note: f.note, src: 'Forecut 3D library (typical values for this fabric type, not a lab test of your fabric)' }; }

  /* ---------- properties panel ---------- */
  function row(lab, inner, cls) { return '<label class="ps-r' + (cls ? ' ' + cls : '') + '"><span>' + lab + '</span>' + inner + '</label>'; }
  function num(k, v, step, extra) { return '<span class="ps-u"><input type="number" step="' + (step || 'any') + '" data-k="' + k + '" value="' + v + '"' + (extra || '') + '><i>' + P.unit + '</i></span>'; }
  function plain(k, v, step, unit, extra) { return '<span class="ps-u"><input type="number" step="' + (step || 'any') + '" data-k="' + k + '" value="' + v + '"' + (extra || '') + '><i>' + (unit || '') + '</i></span>'; }
  function btn(a, t, cls, title) { return '<button type="button" class="ps-b' + (cls ? ' ' + cls : '') + '" data-a="' + a + '"' + (title ? ' title="' + esc(title) + '"' : '') + '>' + t + '</button>'; }
  function selOpt(k, v, opts) { return '<select data-k="' + k + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === String(v) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'; }

  /* ---------- sewing, trims and fabric properties ---------- */
  var TF = {
    button: [['name', 'Name', 'text'], ['size', 'Diameter', 'len'], ['holes', 'Holes', 'sel', [[2, '2 holes'], [4, '4 holes'], [0, 'Shank']]], ['mat', 'Material', 'sel', [['Polyester', 'Polyester'], ['Corozo', 'Corozo'], ['Shell', 'Shell'], ['Metal', 'Metal'], ['Wood', 'Wood'], ['Coconut', 'Coconut'], ['Horn', 'Horn']]], ['colour', 'Colour', 'color']],
    hole: [['len', 'Length', 'len'], ['ang', 'Angle', 'deg'], ['type', 'Type', 'sel', [['Straight', 'Straight'], ['Keyhole', 'Keyhole'], ['Bound', 'Bound']]], ['colour', 'Thread colour', 'color']],
    zip: [['type', 'Type', 'sel', [['Coil', 'Coil (nylon)'], ['Metal', 'Metal'], ['Invisible', 'Invisible'], ['Moulded', 'Moulded plastic']]], ['gauge', 'Gauge', 'sel', [[3, '#3'], [5, '#5'], [8, '#8'], [10, '#10']]], ['sep', 'Open-end (separating)', 'chk'], ['colour', 'Colour', 'color']],
    piping: [['w', 'Cord diameter', 'len'], ['fab', 'Fabric', 'fab'], ['colour', 'Colour', 'color']],
    binding: [['w', 'Finished width', 'len'], ['type', 'Fold', 'sel', [['Single fold', 'Single fold'], ['Double fold', 'Double fold'], ['French', 'French (double layer)']]], ['fab', 'Fabric', 'fab'], ['colour', 'Colour', 'color']],
    tstitch: [['preset', 'Preset', 'preset'], ['spi', 'Stitches per inch', 'num'], ['tex', 'Thread (Tex)', 'num'], ['rows', 'Rows', 'num'], ['gap', 'Gap between rows', 'len'], ['off', 'Distance from the edge', 'len'], ['colour', 'Thread colour', 'color']],
    pucker: [['str', 'Strength', 'range'], ['mode', 'Mode', 'sel', [['Visual', 'Visual (look only)'], ['Physical', 'Physical (gathers in 3D)']]]],
    tape: [['type', 'Type', 'sel', [['Stay tape', 'Stay tape'], ['Fusible tape', 'Fusible tape'], ['Twill tape', 'Twill tape'], ['Clear elastic', 'Clear elastic']]], ['w', 'Width', 'len'], ['colour', 'Colour', 'color']],
    graphic: [['name', 'Name', 'text'], ['method', 'Method', 'sel', [['Print', 'Print'], ['Screen print', 'Screen print'], ['Digital print', 'Digital print'], ['Embroidery', 'Embroidery'], ['Heat transfer', 'Heat transfer'], ['Patch', 'Patch'], ['Woven label', 'Woven label']]], ['w', 'Width', 'len'], ['h', 'Height', 'len'], ['rot', 'Rotation', 'deg'], ['op', 'Opacity', 'range']]
  };
  function field(pre, f, v) {
    var k = pre + f[0], t = f[2];
    if (t === 'text') return row(f[1], '<input data-k="' + k + '" value="' + esc(v == null ? '' : v) + '">');
    if (t === 'len') return row(f[1], num(k, U(+v || 0), C.UNITS[P.unit].step, ' min="0"'));
    if (t === 'deg') return row(f[1], plain(k, +v || 0, 'any', '°'));
    if (t === 'num') return row(f[1], plain(k, v == null ? '' : v, 'any', ''));
    if (t === 'pct') return row(f[1], plain(k, v == null ? '' : v, 'any', '%'));
    if (t === 'sel') return row(f[1], selOpt(k, v, f[3]));
    if (t === 'chk') return row(f[1], '<input type="checkbox" data-k="' + k + '"' + (v ? ' checked' : '') + '>', 'chk');
    if (t === 'color') return row(f[1], '<input type="color" data-k="' + k + '" value="' + (v || '#888888') + '">');
    if (t === 'range') return row(f[1], '<input type="range" min="0" max="1" step=".05" data-k="' + k + '" value="' + (v == null ? .5 : v) + '">');
    if (t === 'fab') return row(f[1], selOpt(k, v || '', [['', 'Same as the piece']].concat(P.fabrics.map(function (x) { return [x.id, x.name]; }))));
    if (t === 'preset') return row(f[1], selOpt(k, v || '', [['', 'Custom']].concat(P.presets.tstitch.map(function (x) { return [x.id, x.name]; }))));
    return '';
  }
  function seamPanel(sw) {
    var r = C.seamLens(P, sw), A = pcById(sw.A.pc), B = pcById(sw.B.pc), LA = C.segLen(A, sw.A.seg), LB = C.segLen(B, sw.B.seg);
    var nIn = function (pc, rr) { var L = C.segLen(pc, rr.seg), a = Math.min(rr.a == null ? 0 : rr.a, rr.b == null ? L : rr.b), b = Math.max(rr.a == null ? 0 : rr.a, rr.b == null ? L : rr.b); return pc.notches.filter(function (nt) { if (nt.seg !== rr.seg) return false; var x = C.notchPos(pc, nt).s; return x >= a - .05 && x <= b + .05; }).length; }, na = nIn(A, sw.A), nb = nIn(B, sw.B);
    return '<h5>Seam</h5><dl class="ps-kv"><dt>' + esc(A.name) + ', edge ' + (sw.A.seg + 1) + '</dt><dd>' + F(r.a) + '</dd><dt>' + esc(B.name) + ', edge ' + (sw.B.seg + 1) + '</dt><dd>' + F(r.b) + '</dd><dt>Difference</dt><dd>' + (r.diff >= 0 ? '+' : '−') + F(Math.abs(r.diff)) + '</dd><dt>Notches</dt><dd>' + na + ' / ' + nb + '</dd></dl>'
      + row('Planned ease on the first side', num('sw_ease', U(+sw.ease || 0), C.UNITS[P.unit].step))
      + '<p class="ps-check ' + (r.ok ? 'ok' : 'no') + '">' + (r.ok ? 'The lengths match the planned ease (within 3 mm).' : 'Off by ' + F(Math.abs(r.diff - r.plan)) + ' from the planned ease.') + (na !== nb ? ' The notch counts differ.' : '') + '</p>'
      + row('Seam type', selOpt('sw_type', sw.type || 'Plain seam', [['Plain seam', 'Plain seam'], ['French seam', 'French seam'], ['Flat-felled', 'Flat-felled'], ['Overlocked', 'Overlocked'], ['Bound', 'Bound seam'], ['Turned and stitched', 'Turned and stitched']]))
      + '<h5>Parts sewn</h5>' + row('First: from', num('sw_Aa', U(sw.A.a == null ? 0 : sw.A.a))) + row('First: to', num('sw_Ab', U(sw.A.b == null ? LA : sw.A.b))) + row('Second: from', num('sw_Ba', U(sw.B.a == null ? 0 : sw.B.a))) + row('Second: to', num('sw_Bb', U(sw.B.b == null ? LB : sw.B.b)))
      + '<p class="ps-n">Distances along each edge from its start. Edge lengths: ' + F(LA) + ' and ' + F(LB) + '.</p>'
      + '<div class="ps-bs">' + btn('swflip', 'Flip (untwist)') + btn('swdel', 'Delete seam', 'bad') + '</div>';
  }
  function trimPanel(t) {
    var r = trimOf(t); if (!r) return ''; var pc = pcById(r.pc), h = '<h5>' + esc(KN[t.k].replace(/s$/, '')) + ' · ' + esc(pc.name) + '</h5>';
    TF[t.k].forEach(function (f) { h += field('tr_', f, r[f[0]]); });
    if (t.k === 'tstitch') h += '<p class="ps-n">Tex is the thread weight (grams per 1000 m), not its thickness. Drawn about ' + C.threadDia(+r.tex || 30).toFixed(2) + ' mm wide; stitch length ' + (25.4 / (+r.spi || 12)).toFixed(1) + ' mm.</p>';
    if (t.k === 'zip') { var Lz = C.rangeLen(pc, r); h += '<p class="ps-n">Closed length ' + F(Lz) + ' · order ' + Math.ceil(Lz / 2.54) + '" (' + Math.ceil(Lz) + ' cm).</p>'; }
    if (t.k === 'pucker') h += '<p class="ps-n">' + (r.mode === 'Physical' ? 'Physical puckering shortens the seam slightly in 3D so the fabric ripples.' : 'Visual puckering changes only how the seam looks; the fit is not affected.') + '</p>';
    if (r.seg != null) { var L = C.segLen(pc, r.seg); h += '<h5>Position on edge ' + (r.seg + 1) + '</h5>' + row('From', num('tr_a', U(r.a == null ? 0 : r.a), C.UNITS[P.unit].step, ' min="0"')) + row('To', num('tr_b', U(r.b == null ? L : r.b), C.UNITS[P.unit].step, ' min="0"')) + '<p class="ps-n">Distance along the edge from its start; the edge is ' + F(L) + ' long.</p>'; }
    else h += '<h5>Position</h5>' + row('X', num('tr_x', U(r.at[0] + pc.x))) + row('Y', num('tr_y', U(r.at[1] + pc.y))) + '<p class="ps-n">Drag it on the canvas with Select, or type the position.</p>';
    if (t.k === 'button') h += '<h5>Repeat down the placket</h5>' + row('Number of buttons', plain('rep_n', 5, 1, '', ' min="2" max="30"')) + row('Spacing', num('rep_d', U(9))) + row('Direction', selOpt('rep_dir', 'down', [['down', 'Down'], ['right', 'Across']])) + '<div class="ps-bs">' + btn('btnrep', 'Repeat') + btn('btnholes', 'Add matching buttonholes') + '</div>';
    if (t.k === 'tstitch') h += '<div class="ps-bs">' + btn('tssave', 'Save as preset') + '</div>';
    if (t.k === 'graphic') h += '<div class="ps-bs">' + btn('gfxrep', 'Replace image') + btn('gfxratio', 'Original proportions') + '</div>';
    return h + '<div class="ps-bs">' + btn('trdel', 'Delete', 'bad') + '</div>';
  }
  var FF = [['name', 'Name', 'text'], ['type', 'Type', 'sel', [['Woven', 'Woven'], ['Knit', 'Knit'], ['Non-woven', 'Non-woven'], ['Leather', 'Leather'], ['Lace or net', 'Lace or net']]], ['comp', 'Composition', 'text'], ['gsm', 'Weight (gsm)', 'num'], ['width', 'Width (cm)', 'num'], ['thick', 'Thickness (mm)', 'num'], ['colour', 'Colour', 'color'], ['shrinkL', 'Shrinkage, length', 'pct'], ['shrinkW', 'Shrinkage, width', 'pct']];
  var FP = [['sw', 'Stretch, weft', 'num'], ['sl', 'Stretch, warp', 'num'], ['sb', 'Stretch, bias', 'num'], ['stiff', 'Bending stiffness (0–100)', 'num'], ['fric', 'Friction', 'num']];
  function fabricPanel(f) {
    var h = '<h5>Fabric</h5>'; FF.forEach(function (x) { h += field('fb_', x, f[x[0]]); });
    h += '<h5>Physical properties (for 3D)</h5>'; FP.forEach(function (x) { h += field('fb_', x, f[x[0]]); });
    h += row('Source of these values', '<input data-k="fb_src" value="' + esc(f.src || '') + '">', 'wide') + '<p class="ps-n">Stretch is an index used by the Forecut 3D simulation (0 means it does not stretch). Replace the values with your own fabric test results when you have them, and note the source.</p>';
    return h + '<div class="ps-bs">' + btn('fabassign', 'Give to selected pieces') + btn('fabdup', 'Duplicate') + btn('fabdel', 'Delete', 'bad') + '</div>';
  }
  function presetPanel(x) { var h = '<h5>Topstitch preset</h5>' + field('ps_', ['name', 'Name', 'text'], x.name); TF.tstitch.slice(1).forEach(function (f) { h += field('ps_', f, x[f[0]]); }); return h + '<p class="ps-n">New topstitching uses this preset. Changing it does not change topstitching already placed.</p><div class="ps-bs">' + (P.presets.tstitch.length > 1 ? btn('psdel', 'Delete preset', 'bad') : '') + '</div>'; }
  function props() {
    var h = '', pcs = selected();
    if (ST.seam && P.sewing.some(function (x) { return x.id === ST.seam; })) h += seamPanel(P.sewing.filter(function (x) { return x.id === ST.seam; })[0]);
    else if (ST.trim && trimOf(ST.trim)) h += trimPanel(ST.trim);
    else if (ST.fab && fabOf(ST.fab)) h += fabricPanel(fabOf(ST.fab));
    else if (ST.psel && P.presets.tstitch.some(function (x) { return x.id === ST.psel; })) h += presetPanel(P.presets.tstitch.filter(function (x) { return x.id === ST.psel; })[0]);
    else if (ST.tool === 'walk' && ST.walk.length) h += walkPanel();
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
      + row('Fabric', selOpt('fabric', fabOf(pc.fabric) ? pc.fabric : '', [['', P.fabrics.length ? 'None' : 'Add a fabric in the Fabric tab']].concat(P.fabrics.map(function (x) { return [x.id, x.name]; })))) + row('Cut on the fold', selOpt('fold', pc.fold, [[-1, 'Not on fold']].concat(segs)))
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
    if (/^rep_/.test(k)) return;
    var conv = function (list, f, v) { var d = list.filter(function (x) { return x[0] === f; })[0], t = d ? d[2] : 'text'; if (t === 'len') return Math.max(0, CM(v)); if (t === 'num' || t === 'deg' || t === 'pct' || t === 'range') return v === '' ? '' : +v; if (t === 'sel' && d[3] && typeof d[3][0][0] === 'number') return +v; return v; };
    if (/^sw_/.test(k)) { var sw = P.sewing.filter(function (x) { return x.id === ST.seam; })[0]; if (!sw) return; var f = k.slice(3);
      return act('Edit seam', function () { if (f === 'ease') sw.ease = CM(val); else if (f === 'type') sw.type = val; else { var side = sw[f[0]], pcx = pcById(side.pc), Lx = C.segLen(pcx, side.seg); side[f[1]] = Math.max(0, Math.min(Lx, CM(val))); } }); }
    if (/^tr_/.test(k)) { var r = trimOf(ST.trim); if (!r) return; var f2 = k.slice(3), pcr = pcById(r.pc);
      return act('Edit ' + ST.trim.k, function () {
        if (f2 === 'a' || f2 === 'b') { var L = C.segLen(pcr, r.seg); r[f2] = Math.max(0, Math.min(L, CM(val))); return; }
        if (f2 === 'x' || f2 === 'y') { r.at[f2 === 'x' ? 0 : 1] = CM(val) - (f2 === 'x' ? pcr.x : pcr.y); return; }
        if (f2 === 'preset') { r.preset = val; var pr = P.presets.tstitch.filter(function (x) { return x.id === val; })[0]; if (pr) ['spi', 'tex', 'rows', 'gap', 'off', 'colour'].forEach(function (q2) { r[q2] = pr[q2]; }); return; }
        var v2 = conv(TF[ST.trim.k], f2, val); if (ST.trim.k === 'graphic' && (f2 === 'w' || f2 === 'h') && r.ratio && v2 > 0) { if (f2 === 'w') r.h = v2 * r.ratio; else r.w = v2 / r.ratio; }
        r[f2] = v2; if (ST.trim.k === 'tstitch' && ['spi', 'tex', 'rows', 'gap', 'off', 'colour'].indexOf(f2) >= 0) r.preset = '';
        if (ST.trim.k === 'button') ST.lastBtn = { size: r.size, holes: r.holes, mat: r.mat, colour: r.colour, name: r.name }; if (ST.trim.k === 'hole') ST.lastHole = { len: r.len, ang: r.ang, type: r.type, colour: r.colour }; }); }
    if (/^fb_/.test(k)) { var fb = fabOf(ST.fab); if (!fb) return; var f3k = k.slice(3); return act('Edit fabric', function () { fb[f3k] = conv(FF.concat(FP), f3k, val); }); }
    if (/^ps_/.test(k)) { var pz = P.presets.tstitch.filter(function (x) { return x.id === ST.psel; })[0]; if (!pz) return; var f4 = k.slice(3); return act('Edit preset', function () { pz[f4] = conv(TF.tstitch.concat([['name', 'Name', 'text']]), f4, val); }); }
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
  function xfSel(label, mk, ang) { var pcs = selected().filter(function (p) { return !p.locked; }); if (!pcs.length) return toast('Select an unlocked piece first.', 1); var pv = pivotOf(pcs); act(label, function () { pcs.forEach(function (pc) { var m = mk(pv[0] - pc.x, pv[1] - pc.y); xfAll(pc, m, ang); }); }); }
  function bboxW(pc) { var b = C.bbox(pc); return [b[0] + pc.x, b[1] + pc.y, b[2] + pc.x, b[3] + pc.y]; }

  /* ---------- actions ---------- */
  function doAct(a, el) {
    var pcs = selected(), pc = pcs[0];
    if (a.indexOf('tool:') === 0) return setTool(a.slice(5));
    if (a.indexOf('tab:') === 0) { ST.tab = a.slice(4); var hr0 = document.getElementById('pm-hider'); if (pb.classList.contains('nor') && hr0) hr0.click(); var sec = sideEl.querySelector('.ps-pane'); objects(); if (sec) sec.scrollTop = 0; return; }
    var swc = P.sewing.filter(function (x) { return x.id === ST.seam; })[0], trc = trimOf(ST.trim), fbc = fabOf(ST.fab);
    switch (a) {
      case 'selall': ST.sel = P.pieces.filter(function (p) { return !p.hidden; }).map(function (p) { return p.id; }); return refresh();
      case 'selnone': ST.sel = []; ST.node = ST.seg = ST.notch = ST.it = ST.seam = ST.trim = ST.fab = ST.psel = null; return refresh();
      case 'sewcheck': { ST.tab = 'sewing'; var bad = P.sewing.filter(function (x) { return !C.seamLens(P, x).ok; }); refresh(); return toast(P.sewing.length ? (bad.length ? bad.length + ' of ' + P.sewing.length + ' seams differ from their planned ease. They are marked in the Sewing tab.' : 'All ' + P.sewing.length + ' seams match their planned ease.') : 'Nothing is sewn yet.', bad.length > 0); }
      case 'sewclear': if (!P.sewing.length) return; return act('Delete all sewing', function () { P.sewing = []; ST.seam = null; });
      case 'swflip': return act('Flip seam', function () { var B = swc.B, t = B.a; B.a = B.b == null ? C.segLen(pcById(B.pc), B.seg) : B.b; B.b = t == null ? 0 : t; });
      case 'swdel': return act('Delete seam', function () { P.sewing = P.sewing.filter(function (x) { return x !== swc; }); ST.seam = null; });
      case 'trdel': return act('Delete ' + ST.trim.k, function () { P.trims[ST.trim.k] = P.trims[ST.trim.k].filter(function (x) { return x !== trc; }); ST.trim = null; });
      case 'btnrep': case 'btnholes': { var n = Math.round(+q('[data-k=rep_n]').value || 0), gap = CM(q('[data-k=rep_d]').value || 0), dir = q('[data-k=rep_dir]').value; if (a === 'btnrep' && !(n >= 2 && n <= 30 && gap > 0)) return toast('Enter 2 to 30 buttons and a spacing above zero.', 1);
        if (a === 'btnholes') return act('Add buttonholes', function () { var list = P.trims.button.filter(function (b) { return b.pc === trc.pc; }); list.forEach(function (b) { P.trims.hole.push({ id: C.uid('bh'), pc: b.pc, at: b.at.slice(), len: Math.round(((+b.size || 1.5) + .3) * 10) / 10, ang: dir === 'down' ? 0 : 90, type: 'Straight', colour: '#5b4a3a' }); }); toast(list.length + ' buttonholes added at the buttons on ' + pcById(trc.pc).name + ', each 3 mm longer than its button. Move them to the other front if the buttons sit there.'); });
        return act('Repeat buttons', function () { for (var i = 1; i < n; i++) { var c = C.clone(trc); c.id = C.uid('bt'); c.at = [trc.at[0] + (dir === 'right' ? gap * i : 0), trc.at[1] + (dir === 'down' ? gap * i : 0)]; P.trims.button.push(c); } }); }
      case 'tssave': return act('Save preset', function () { var x = { id: C.uid('ts'), name: (trc.rows || 1) + ' row' + ((trc.rows || 1) > 1 ? 's' : '') + ', ' + trc.spi + ' SPI, Tex ' + trc.tex, spi: trc.spi, tex: trc.tex, rows: trc.rows, gap: trc.gap, off: trc.off, colour: trc.colour }; P.presets.tstitch.push(x); trc.preset = x.id; ST.tsp = x.id; });
      case 'psdel': return act('Delete preset', function () { P.presets.tstitch = P.presets.tstitch.filter(function (x) { return x.id !== ST.psel; }); ST.psel = null; ST.tsp = P.presets.tstitch[0].id; });
      case 'presets': ST.tab = 'trims'; ST.psel = tsPreset().id; ST.seam = ST.trim = ST.fab = null; return refresh();
      case 'gfxrep': ST.gfxAt = { replace: trc.id }; return q('#ps-gfx').click();
      case 'gfxratio': if (!trc.ratio) return; return act('Graphic proportions', function () { trc.h = trc.w * trc.ratio; });
      case 'fabnew': return act('New fabric', function () { var f = { id: C.uid('fb'), name: 'Fabric ' + (P.fabrics.length + 1), type: 'Woven', comp: '', gsm: 150, width: 145, thick: .3, colour: '#d8d2c4', shrinkL: 0, shrinkW: 0, sw: 0, sl: 0, sb: 1.5, stiff: 50, fric: .5, src: 'Entered by you' }; P.fabrics.push(f); ST.fab = f.id; ST.tab = 'fabric'; ST.seam = ST.trim = ST.psel = null; });
      case 'fabassign': { var fid = ST.fab || (P.fabrics[0] && P.fabrics[0].id); if (!fid) { ST.tab = 'fabric'; refresh(); return toast('Add a fabric first: choose one from the library or make a new one.', 1); } if (!pcs.length) return toast('Select pieces first (Shift-click for more), then give them the fabric.', 1); return act('Give fabric', function () { pcs.forEach(function (p) { p.fabric = fid; }); toast(fabOf(fid).name + ' given to ' + pcs.length + ' piece' + (pcs.length > 1 ? 's' : '') + '.'); }); }
      case 'fabdup': return act('Duplicate fabric', function () { var f = C.clone(fbc); f.id = C.uid('fb'); f.name += ' copy'; P.fabrics.push(f); ST.fab = f.id; });
      case 'fabdel': return act('Delete fabric', function () { P.fabrics = P.fabrics.filter(function (x) { return x !== fbc; }); P.pieces.forEach(function (p) { if (p.fabric === fbc.id) p.fabric = ''; }); ST.fab = null; });
      case 'cwadd': return act('Add colourway', function () { var c = C.clone(cwNow()); c.id = C.uid('cw'); c.name = 'Colourway ' + (P.colourways.length + 1); P.colourways.push(c); P.cw = c.id; });
      case 'cwdel': return act('Delete colourway', function () { P.colourways = P.colourways.filter(function (c) { return c.id !== P.cw; }); P.cw = P.colourways[0].id; });
      case 'bomcsv': { var B = C.bom(P), csv = [['Type', 'Item', 'Description', 'Quantity', 'Unit', 'Colour', 'Colourway']].concat(B.map(function (r) { return [r.kind, r.item, r.desc, r.qty, r.unit, r.colour, cwNow().name]; })).map(function (r) { return r.map(function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\n'); dl(fname('bom.csv'), csv, 'text/csv'); return toast('BOM downloaded (' + B.length + ' lines).'); }
      case 'settings': return settingsModal();
      case 'polynext': return ST.draft && ST.draft.pts && ST.draft.pts.length ? polyNext() : null;
      case 'polyclose': return finishPoly();
    }
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
      case 'z100': zoomAt(pxPerCm()); return;
      case 'zin': zoomAt(ST.z * 1.25); return;
      case 'zout': zoomAt(ST.z / 1.25); return;
      case 'draftreplace': return bringDraft('replace');
      case 'draftadd': return bringDraft('add');
      case 'draftkeep': return act('Keep my edits', function () { P.draft = { sig: draftSig(), name: draftName() }; }), banner();
      case 'undo': if (H.undo()) { tidySel(); refresh(); toast('Undone.'); } return;
      case 'redo': if (H.redo()) { tidySel(); refresh(); toast('Redone.'); } return;
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
  function fit() { var b = [1e9, 1e9, -1e9, -1e9], any = false; P.pieces.forEach(function (pc) { if (pc.hidden) return; any = true; var cl = geo(pc).cut.pts; cl.forEach(function (q2) { b[0] = Math.min(b[0], q2[0] + pc.x); b[1] = Math.min(b[1], q2[1] + pc.y); b[2] = Math.max(b[2], q2[0] + pc.x); b[3] = Math.max(b[3], q2[1] + pc.y); }); }); if (!any) b = [0, 0, 60, 40]; var r = svg.getBoundingClientRect(), W = r.width || 800, Hh = r.height || 600; ST.z = Math.max(.5, Math.min(80, Math.min((W - 80) / (b[2] - b[0] || 1), (Hh - 80) / (b[3] - b[1] || 1)))); ST.tx = (W - (b[2] - b[0]) * ST.z) / 2 - b[0] * ST.z; ST.ty = (Hh - (b[3] - b[1]) * ST.z) / 2 - b[1] * ST.z; drawView(); }

  /* ---------- tool option bars (exact creation) ---------- */
  function opts() {
    var t = ST.tool, h = '', o = ST.o = ST.o || { w: 20, h: 30, ew: 20, eh: 20, r0: 5, turns: 1.5, grow: 12, sw: 10, dir: 'cw', fw: 4 };
    if (t === 'rect') h = '<b>Rectangle</b>' + optNum('w', o.w, 'Width') + optNum('h', o.h, 'Height') + btn('mkrect', 'Create', 'pri') + '<small>Click on the canvas to type the size there, or drag to draw it</small>';
    else if (t === 'ellipse') h = '<b>Ellipse</b>' + optNum('ew', o.ew, 'Width') + optNum('eh', o.eh, 'Height') + btn('mkell', 'Create', 'pri') + '<small>Click on the canvas to type the size there, or drag to draw it (Shift for a circle)</small>';
    else if (t === 'spiral') { var iss = C.spiralCheck(o.r0, o.turns, o.grow, o.sw); h = '<b>Spiral</b>' + optNum('r0', o.r0, 'Inner radius') + '<label>Turns <input type="number" step=".25" min=".25" max="6" data-o="turns" value="' + o.turns + '"></label>' + optNum('grow', o.grow, 'Spacing per turn') + optNum('sw', o.sw, 'Strip width') + '<label>Direction <select data-o="dir"><option value="cw"' + (o.dir === 'cw' ? ' selected' : '') + '>Clockwise</option><option value="ccw"' + (o.dir === 'ccw' ? ' selected' : '') + '>Anticlockwise</option></select></label>' + btn('mkspiral', 'Create', 'pri') + (iss.length ? '<em class="bad">' + esc(iss[0]) + '</em>' : '<small>Outer edge ' + F(spiralLen(o)) + '</small>'); }
    else if (t === 'trace') h = '<b>Trace</b>' + optNum('fw', o.fw || 4, 'Facing width') + '<small>Click an edge for a facing, or inside an internal shape to trace it as a piece.</small>';
    else if (t === 'poly') h = '<b>Polygon</b>' + (ST.draft && ST.draft.pts && ST.draft.pts.length ? btn('polynext', 'Next point by length and angle…') + btn('polyclose', 'Close shape') : '') + '<small>Click to place points; drag to curve. Enter or click the first point to close. Backspace undoes the last point.</small>';
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

  /* ---------- right-click menus, exact-value dialogs, copy and paste ---------- */
  var ctxEl = null;
  function ctxClose() { if (ctxEl) { ctxEl.remove(); ctxEl = null; } }
  function ctxMenu(x, y, title, items) {
    ctxClose(); ctxEl = mk('div', 'ps-ctx', (title ? '<div class="ps-ctxh">' + esc(title) + '</div>' : '') + items.map(function (it, i) { return it === '-' ? '<hr>' : '<button type="button" data-ci="' + i + '"' + (it[3] ? ' disabled' : '') + '><span>' + esc(it[0]) + '</span>' + (it[2] ? '<kbd>' + it[2] + '</kbd>' : '') + '</button>'; }).join(''));
    ctxEl.setAttribute('role', 'menu'); document.body.appendChild(ctxEl);
    var r = ctxEl.getBoundingClientRect(); ctxEl.style.left = Math.max(4, Math.min(x, innerWidth - r.width - 6)) + 'px'; ctxEl.style.top = Math.max(4, Math.min(y, innerHeight - r.height - 6)) + 'px';
    ctxEl.addEventListener('click', function (e) { var b = e.target.closest('[data-ci]'); if (!b || b.disabled) return; var it = items[+b.dataset.ci]; ctxClose(); it[1](); });
    ctxEl.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }
  document.addEventListener('pointerdown', function (e) { if (ctxEl && !ctxEl.contains(e.target)) ctxClose(); }, true);
  /* a small dialog of number fields; values are typed in the current unit unless a field says otherwise */
  function askNums(title, fields, ok, note) {
    modal('<h4>' + esc(title) + '</h4>' + fields.map(function (f) { return '<label class="ps-r"><span>' + esc(f.l) + '</span>' + (f.opts ? '<select data-q="' + f.k + '">' + f.opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === String(f.v) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>' : '<span class="ps-u"><input type="number" step="any" data-q="' + f.k + '" value="' + (f.u === 'raw' || f.u === 'deg' || f.u === 'pct' ? f.v : U(f.v)) + '"><i>' + (f.u === 'deg' ? '°' : f.u === 'pct' ? '%' : f.u === 'raw' ? (f.unit || '') : P.unit) + '</i></span>') + '</label>'; }).join('')
      + (note ? '<p class="ps-n">' + note + '</p>' : '') + '<div class="ps-bs"><button type="button" class="ps-b pri" id="ps-qok">OK</button><button type="button" class="ps-b" data-a="mclose">Cancel</button></div>', function (m) {
        var go = function () { var v = {}; fields.forEach(function (f) { var el = m.querySelector('[data-q=' + f.k + ']'); v[f.k] = f.opts ? el.value : f.u === 'raw' || f.u === 'deg' || f.u === 'pct' ? +el.value : CM(el.value); }); closeModal(); ok(v); };
        q('#ps-qok').onclick = go; m.querySelectorAll('input').forEach(function (el) { el.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } }); }); var f0 = m.querySelector('input'); if (f0) { f0.focus(); f0.select(); } });
  }
  /* transform a piece and everything placed on it by point (buttons, buttonholes, graphics) */
  function xfAll(pc, m, ang) {
    C.transformPiece(pc, m);
    ['button', 'hole', 'graphic'].forEach(function (k) { P.trims[k].forEach(function (r) { if (r.pc !== pc.id) return; r.at = C.apply(m, r.at); if (ang) { if (k === 'graphic') r.rot = ((+r.rot || 0) + ang) % 360; if (k === 'hole') r.ang = ((+r.ang || 0) + ang) % 360; } }); });
  }
  /* change the length of an edge by moving its end, its start, or both ends equally, keeping the line's direction */
  function changeLength(pc, seg, target, mode) {
    var N = pc.nodes, n = N.length, ia = seg, ib = (seg + 1) % n, A = N[ia], B = N[ib], dir = [B.x - A.x, B.y - A.y], dl = Math.hypot(dir[0], dir[1]) || 1; dir = [dir[0] / dl, dir[1] / dl];
    var a0 = [A.x, A.y], b0 = [B.x, B.y], f = function (d) { var da = mode === 'start' ? d : mode === 'both' ? d / 2 : 0, db = mode === 'end' ? d : mode === 'both' ? d / 2 : 0; A.x = a0[0] - dir[0] * da; A.y = a0[1] - dir[1] * da; B.x = b0[0] + dir[0] * db; B.y = b0[1] + dir[1] * db; return C.segLen(pc, seg) - target; };
    var d = target - C.segLen(pc, seg), e = f(d); for (var it = 0; it < 12 && Math.abs(e) > 1e-5; it++) { var e2 = f(d + 1e-3), g = (e2 - e) / 1e-3 || 1; d -= e / g; e = f(d); }
    return Math.abs(e) < .01;
  }
  function pieceCopy(src, dx, dy) { var c = C.clone(src); c.id = C.uid('pc'); c.nodes.forEach(function (nd) { nd.id = C.uid('p'); }); c.link = null; c.x = (c.x || 0) + dx; c.y = (c.y || 0) + dy; return c; }
  function copySel() { var pcs = selected(); if (!pcs.length) return toast('Select pieces to copy.', 1); ST.clip = { pcs: C.clone(pcs), trims: {} }; ['button', 'hole', 'graphic'].forEach(function (k) { ST.clip.trims[k] = C.clone(P.trims[k].filter(function (r) { return ST.sel.indexOf(r.pc) >= 0; })); }); toast(pcs.length + ' piece' + (pcs.length > 1 ? 's' : '') + ' copied. Ctrl V pastes.'); }
  function paste(at) {
    if (!ST.clip) return toast('Nothing copied yet.', 1); var cl = ST.clip, b = [1e9, 1e9]; cl.pcs.forEach(function (pc) { var bb = C.bbox(pc); b[0] = Math.min(b[0], bb[0] + pc.x); b[1] = Math.min(b[1], bb[1] + pc.y); });
    var dx = at ? at[0] - b[0] : 3, dy = at ? at[1] - b[1] : 3;
    act('Paste', function () { var map = {}; ST.sel = cl.pcs.map(function (pc) { var c = pieceCopy(pc, dx, dy); map[pc.id] = c.id; P.pieces.push(c); return c.id; }); Object.keys(cl.trims).forEach(function (k) { cl.trims[k].forEach(function (r) { var c = C.clone(r); c.id = C.uid(k.slice(0, 2)); c.pc = map[r.pc]; P.trims[k].push(c); }); }); });
  }
  function pointMenu(e, pc, i) {
    var nd = pc.nodes[i], n = pc.nodes.length;
    ST.node = { pc: pc.id, idx: [i] }; ST.seg = null; ST.sel = [pc.id]; refresh();
    ctxMenu(e.clientX, e.clientY, 'Point ' + (i + 1) + ' · ' + pc.name, [
      ['Move to (exact position)…', function () { askNums('Move point to', [{ k: 'x', l: 'X', v: nd.x + pc.x }, { k: 'y', l: 'Y', v: nd.y + pc.y }], function (v) { act('Move point', function () { nd.x = v.x - pc.x; nd.y = v.y - pc.y; }); }); }],
      ['Move by…', function () { askNums('Move point by', [{ k: 'dx', l: 'Across (X)', v: 0 }, { k: 'dy', l: 'Down (Y)', v: 0 }, { k: 'd', l: 'or a distance', v: 0 }, { k: 'a', l: 'at an angle', v: 0, u: 'deg' }], function (v) { var dx = v.dx, dy = v.dy; if (v.d) { dx = Math.cos(v.a * Math.PI / 180) * v.d; dy = -Math.sin(v.a * Math.PI / 180) * v.d; } act('Move point', function () { C.moveNodes(pc, [i], dx, dy); }); }, 'Angle 0° is to the right, 90° is up. A distance overrides X and Y.'); }],
      '-',
      [nd.smooth ? 'Make a corner point' : 'Make a smooth (curve) point', function () { act('Point type', function () { nd.smooth = !nd.smooth; if (nd.smooth) C.smooth(pc, [(i - 1 + n) % n, i], 1, 180); else { nd.h1 = nd.h2 = null; } }); }],
      ['Straighten both edges', function () { act('Straighten', function () { C.toLine(pc, (i - 1 + n) % n); C.toLine(pc, i); }); }],
      ['Add a notch here', function () { act('Add notch', function () { pc.notches.push({ id: C.uid('nt'), seg: i, mode: 'dist', v: 0, from: 'start', type: 'single', depth: P.settings.notchDepth || .6 }); }); }],
      '-',
      ['Delete point', function () { if (n <= 3) return toast('A piece needs at least three points.', 1); act('Delete point', function () { C.deleteNode(pc, i); ST.node = null; }); }, 'Del', n <= 3]
    ]);
  }
  function segMenu(e, pc, s, at) {
    var L = C.segLen(pc, s), k = C.ctrl(pc, s);
    ST.seg = { pc: pc.id, i: s }; ST.node = null; ST.sel = [pc.id]; refresh();
    var trimOn = function (kind, extra) { return function () { act('Add ' + kind, function () { var r = Object.assign({ id: C.uid(kind.slice(0, 2)), pc: pc.id, seg: s, a: 0, b: null }, extra); P.trims[kind].push(r); ST.trim = { k: kind, id: r.id }; ST.seg = null; ST.tab = 'trims'; }); }; };
    ctxMenu(e.clientX, e.clientY, 'Edge ' + (s + 1) + ' · ' + F(L) + ' · ' + pc.name, [
      ['Change length…', function () { askNums('Change length', [{ k: 'L', l: 'New length', v: L }, { k: 'm', l: 'Keep fixed', v: 'start', opts: [['start', 'The start: move the end'], ['end', 'The end: move the start'], ['both', 'The middle: move both ends']] }], function (v) { if (!(v.L > 0)) return toast('Enter a length above zero.', 1); var ok; act('Change length', function () { ok = changeLength(pc, s, v.L, v.m === 'start' ? 'end' : v.m === 'end' ? 'start' : 'both'); }); toast(ok ? 'Edge ' + (s + 1) + ' is now ' + F(C.segLen(pc, s)) + '. The edges next to it moved with it.' : 'That length could not be reached exactly; check the edge.', !ok); }, 'The line keeps its direction; the neighbouring edges follow the moved point.'); }],
      ['Split into two…', function () { askNums('Split into two', [{ k: 'a', l: 'First part', v: L / 2 }], function (v) { if (!(v.a > 0 && v.a < L)) return toast('Enter a length between 0 and ' + F(L) + '.', 1); act('Split edge', function () { C.splitAtDist(pc, s, v.a); }); }, 'The second part is the rest of the edge.'); }],
      ['Divide into equal parts…', function () { askNums('Divide into equal parts', [{ k: 'n', l: 'Parts', v: 2, u: 'raw' }], function (v) { var n2 = Math.round(v.n); if (!(n2 >= 2 && n2 <= 20)) return toast('Use 2 to 20 parts.', 1); act('Divide edge', function () { C.divideSeg(pc, s, n2); }); }); }],
      ['Add point here', function () { if (!at) return; act('Add point', function () { C.splitSeg(pc, s, at.t); }); }, '', !at],
      [k.curved ? 'Make straight' : 'Make a curve', function () { act(k.curved ? 'Make straight' : 'Make a curve', function () { if (k.curved) C.toLine(pc, s); else C.curvature(pc, s, Math.max(.3, L * .05)); }); }],
      ['Offset as internal line…', function () { askNums('Offset as internal line', [{ k: 'd', l: 'Distance inside the edge', v: 2 }], function (v) { act('Offset line', function () { var it = { id: C.uid('in'), kind: 'line', pts: C.rangePts(pc, s, 0, null, v.d), purpose: 'guide', style: 'dashed', label: 'Offset ' + F(v.d), visible: true }; pc.internals.push(it); ST.it = it.id; ST.seg = null; }); }, 'Use it for facings, hem fold lines or placement guides.'); }],
      '-',
      ['Add a notch here', function () { if (!at) return; act('Add notch', function () { var nt = { id: C.uid('nt'), seg: s, mode: 'dist', v: +at.s.toFixed(3), from: 'start', type: 'single', depth: P.settings.notchDepth || .6 }; pc.notches.push(nt); ST.notch = nt.id; ST.seg = null; }); }, '', !at],
      ['Notch at the middle', function () { act('Add notch', function () { pc.notches.push({ id: C.uid('nt'), seg: s, mode: 'mid', v: 0, from: 'start', type: 'single', depth: P.settings.notchDepth || .6 }); }); }],
      [s === pc.fold ? 'Not on the fold' : 'Cut on the fold', function () { act('Fold edge', function () { pc.fold = s === pc.fold ? -1 : s; }); }],
      [pc.hems.indexOf(s) >= 0 ? 'Not a hem' : 'Mark as a hem', function () { act('Hem edge', function () { var j = pc.hems.indexOf(s); if (j >= 0) pc.hems.splice(j, 1); else pc.hems.push(s); }); }],
      ['Seam allowance for this edge…', function () { askNums('Seam allowance for edge ' + (s + 1), [{ k: 'w', l: 'Allowance', v: C.saOf(pc, s) }], function (v) { act('Edge seam allowance', function () { pc.sa.edges[s] = Math.max(0, v.w); }); }); }],
      '-',
      ['Sew this edge to…', function () { setTool('sew'); ST.pick = [{ pc: pc.id, seg: s, s: at ? at.s : 0, t: at ? at.s / L : 0 }]; draw(); toast('Now click the edge it is sewn to, near the end that meets.'); }],
      ['Topstitch this edge', function () { var pr = tsPreset(); trimOn('tstitch', { preset: pr.id, spi: pr.spi, tex: pr.tex, rows: pr.rows, gap: pr.gap, off: pr.off, colour: pr.colour })(); }],
      ['Zipper on this edge', trimOn('zip', { type: 'Coil', gauge: 5, sep: false, colour: '#2b2b2b' })],
      ['Piping on this edge', trimOn('piping', { w: .4, colour: '#7a2f2f', fab: '' })],
      ['Binding on this edge', trimOn('binding', { w: 1, type: 'Double fold', colour: '#3a5a8c', fab: '' })],
      ['Seam tape on this edge', trimOn('tape', { w: 1, type: 'Stay tape', colour: '#d9c27a' })]
    ]);
  }
  function pieceMenu(e, pc, w) {
    if (ST.sel.indexOf(pc.id) < 0) ST.sel = [pc.id]; ST.node = ST.seg = ST.notch = ST.it = ST.seam = ST.trim = null; refresh();
    var pcs = selected(), many = pcs.length > 1, flip = function (h) { return function () { xfSel(h ? 'Flip horizontally' : 'Flip vertically', function (px, py) { return h ? C.M.mirX(px) : C.M.mirY(py); }); }; }, rot = function (a) { return function () { xfSel('Rotate ' + a + '°', function (px, py) { return C.M.rot(a, px, py); }, a); }; };
    ctxMenu(e.clientX, e.clientY, many ? pcs.length + ' pieces' : pc.name, [
      ['Copy', copySel, 'Ctrl C'], ['Paste', function () { paste(w); }, 'Ctrl V', !ST.clip], ['Duplicate', function () { doAct('dup'); }, 'Ctrl D'],
      ['Symmetric copy (linked, mirrored)', function () { doAct('mirrorcopy'); }, '', many], ['Linked copy', function () { doAct('linked'); }, '', many],
      '-', ['Flip horizontally', flip(true)], ['Flip vertically', flip(false)], ['Rotate 90° clockwise', rot(90)], ['Rotate 90° anticlockwise', rot(-90)], ['Rotate or scale exactly…', function () { askNums('Rotate and scale', [{ k: 'a', l: 'Rotate', v: 0, u: 'deg' }, { k: 'sx', l: 'Width', v: 100, u: 'pct' }, { k: 'sy', l: 'Height', v: 100, u: 'pct' }], function (v) { if (v.a) xfSel('Rotate', function (px, py) { return C.M.rot(v.a, px, py); }, v.a); if (v.sx !== 100 || v.sy !== 100) { if (!(v.sx > 0 && v.sy > 0)) return toast('Scale must be above 0%.', 1); xfSel('Scale', function (px, py) { return C.M.scale(v.sx / 100, v.sy / 100, px, py); }); } }, 'About the centre of the selection. Scaling changes the shape; it is not grading.'); }],
      ['Unfold (open the fold)', function () { doAct('unfold'); }, '', many || pc.fold < 0],
      '-', ['Give a fabric…', function () { ST.tab = 'fabric'; refresh(); toast(P.fabrics.length ? 'Pick a fabric in the Fabric tab, then click Give to selected.' : 'Add a fabric in the Fabric tab first.'); }],
      ['Bring to front', function () { act('Bring to front', function () { pcs.forEach(function (p) { P.pieces.splice(P.pieces.indexOf(p), 1); P.pieces.push(p); }); }); }], ['Send to back', function () { act('Send to back', function () { pcs.slice().reverse().forEach(function (p) { P.pieces.splice(P.pieces.indexOf(p), 1); P.pieces.unshift(p); }); }); }],
      [pc.locked ? 'Unlock' : 'Lock', function () { act('Lock', function () { pcs.forEach(function (p) { p.locked = !pc.locked; }); }); }], ['Hide', function () { act('Hide', function () { pcs.forEach(function (p) { p.hidden = true; }); ST.sel = []; }); }],
      '-', ['Delete', function () { doAct('del'); }, 'Del']
    ]);
  }
  function canvasMenu(e, w) {
    ctxMenu(e.clientX, e.clientY, '', [
      ['Paste here', function () { paste(w); }, 'Ctrl V', !ST.clip],
      ['New rectangle here…', function () { askNums('New rectangle', [{ k: 'w', l: 'Width', v: 20 }, { k: 'h', l: 'Height', v: 30 }], function (v) { if (!(v.w > 0 && v.h > 0)) return toast('Width and height must be above zero.', 1); act('New rectangle', function () { var r = C.rect(w[0], w[1], v.w, v.h, { name: 'Piece ' + (P.pieces.length + 1) }); P.pieces.push(r); ST.sel = [r.id]; }); }); }],
      ['New circle here…', function () { askNums('New circle or ellipse', [{ k: 'w', l: 'Width', v: 20 }, { k: 'h', l: 'Height', v: 20 }], function (v) { if (!(v.w > 0 && v.h > 0)) return toast('Width and height must be above zero.', 1); act('New ellipse', function () { var r = C.ellipse(w[0] + v.w / 2, w[1] + v.h / 2, v.w / 2, v.h / 2, 0, { name: 'Piece ' + (P.pieces.length + 1) }); P.pieces.push(r); ST.sel = [r.id]; }); }); }],
      '-', ['Select all', function () { doAct('selall'); }, 'Ctrl A'], ['Fit all pieces', fit, '0'], [(V().grid ? 'Hide' : 'Show') + ' grid', function () { act('View', function () { V().grid = !V().grid; }); }], ['Snap ' + (V().snap ? 'off' : 'on'), function () { act('View', function () { V().snap = !V().snap; }); }]
    ]);
  }
  function onCtx(e) {
    e.preventDefault(); if (!ON) return; var w = S2W(e), t = e.target, ds = t.dataset || {};
    if (drag && (drag.k === 'nodes' || drag.k === 'move')) { var d = drag; drag = null; ST.live = null; var hh = H.mark(); H.swap(JSON.parse(d.mark)); refresh(); void hh;
      return askNums(d.k === 'move' ? 'Move pieces by' : 'Move by', [{ k: 'dx', l: 'Across (X)', v: 0 }, { k: 'dy', l: 'Down (Y)', v: 0 }], function (v) { if (d.k === 'move') act('Move', function () { d.pcs.forEach(function (o) { var pc = pcById(o[0].id); pc.x += v.dx; pc.y += v.dy; }); }); else { var pc = pcById(d.pc.id), idx = d.idx || ST.node.idx; act('Move point', function () { C.moveNodes(pc, idx, v.dx, v.dy); }); } }); }
    if (ST.draft && ST.tool === 'poly' && ST.draft.pts.length) return polyNext();
    if (t.closest && t.closest('[data-tr]')) { var tp = t.closest('[data-tr]').getAttribute('data-tr').split('|'); ST.trim = { k: tp[0], id: tp[1] }; ST.tab = 'trims'; refresh(); return ctxMenu(e.clientX, e.clientY, trimLabel(tp[0], trimOf(ST.trim)), [['Delete', function () { doAct('trdel'); }, 'Del']]); }
    if (ds.sw) { ST.seam = ds.sw; ST.tab = 'sewing'; refresh(); return ctxMenu(e.clientX, e.clientY, 'Seam', [['Flip (untwist)', function () { doAct('swflip'); }], ['Delete seam', function () { doAct('swdel'); }]]); }
    if (ds.n != null && ds.pc) return pointMenu(e, pcById(ds.pc), +ds.n);
    var ne = nearestEdge(w); if (ne) return segMenu(e, ne.pc, ne.seg, ne);
    var pc = pieceAt(w); if (pc) return pieceMenu(e, pc, w);
    canvasMenu(e, w);
  }
  function sizeAt(kind, at) {
    var o = ST.o || {}, isR = kind === 'rect';
    askNums(isR ? 'Rectangle' : 'Circle or ellipse', [{ k: 'w', l: 'Width', v: isR ? (o.w || 20) : (o.ew || 20) }, { k: 'h', l: isR ? 'Length' : 'Height', v: isR ? (o.h || 30) : (o.eh || 20) }], function (v) {
      if (!(v.w > 0 && v.h > 0)) return toast('Width and length must be above zero.', 1);
      if (isR) { o.w = v.w; o.h = v.h; } else { o.ew = v.w; o.eh = v.h; }
      act(isR ? 'Draw rectangle' : 'Draw ellipse', function () { var r = isR ? C.rect(at[0], at[1], v.w, v.h, { name: 'Piece ' + (P.pieces.length + 1) }) : C.ellipse(at[0] + v.w / 2, at[1] + v.h / 2, v.w / 2, v.h / 2, 0, { name: 'Piece ' + (P.pieces.length + 1) }); if (!isR) r.sa.def = Math.min(r.sa.def, Math.min(v.w, v.h) / 6); P.pieces.push(r); ST.sel = [r.id]; }); opts();
    }, 'The top-left corner goes where you clicked. Drag on the canvas instead to draw it by eye.');
  }
  function polyNext() {
    var d = ST.draft, last = d.pts[d.pts.length - 1].p, prev = d.pts.length > 1 ? d.pts[d.pts.length - 2].p : null, a0 = prev ? Math.atan2(-(last[1] - prev[1]), last[0] - prev[0]) * 180 / Math.PI : 0;
    askNums('Next point', [{ k: 'L', l: 'Length', v: 10 }, { k: 'a', l: 'Angle', v: Math.round(a0), u: 'deg' }], function (v) { if (!(v.L > 0)) return toast('Enter a length above zero.', 1); var r = v.a * Math.PI / 180; d.pts.push({ p: [last[0] + Math.cos(r) * v.L, last[1] - Math.sin(r) * v.L], h: null }); ST.draft = d; drawOver(); opts(); status(); }, 'Angle 0° is to the right, 90° is up, 180° is to the left, 270° is down.');
  }
  /* the transform box: handles at the corners and sides scale, the round handle above rotates, the cross is the pivot */
  function xfBox() {
    if (ST.tool !== 'select') return null; var key = ST.sel.join(','); if (ST.pvFor !== key) { ST.pvFor = key; ST.pvW = null; } var pcs = selected().filter(function (p) { return !p.locked && !p.hidden; }); if (!pcs.length) return null;
    var b = [1e9, 1e9, -1e9, -1e9]; pcs.forEach(function (pc) { var bb = bboxW(pc); b[0] = Math.min(b[0], bb[0]); b[1] = Math.min(b[1], bb[1]); b[2] = Math.max(b[2], bb[2]); b[3] = Math.max(b[3], bb[3]); });
    return { b: b, pcs: pcs, pv: ST.pvW || [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2] };
  }
  function xfHTML() {
    var X = drag && drag.k === 'xf' ? drag.box : xfBox(); if (!X) return ''; var a = W2S([X.b[0], X.b[1]]), c = W2S([X.b[2], X.b[3]]), m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2], pv = W2S(X.pv), h = '';
    h += '<path class="ps-xfb" d="M' + f1(a[0]) + ' ' + f1(a[1]) + 'H' + f1(c[0]) + 'V' + f1(c[1]) + 'H' + f1(a[0]) + 'Z"/><path class="ps-xfl" d="M' + f1(m[0]) + ' ' + f1(a[1]) + 'V' + f1(a[1] - 24) + '"/>';
    [['nw', a[0], a[1]], ['n', m[0], a[1]], ['ne', c[0], a[1]], ['e', c[0], m[1]], ['se', c[0], c[1]], ['s', m[0], c[1]], ['sw', a[0], c[1]], ['w', a[0], m[1]]].forEach(function (k) { h += '<rect class="ps-xfh" data-xf="' + k[0] + '" x="' + f1(k[1] - 4.5) + '" y="' + f1(k[2] - 4.5) + '" width="9" height="9"/>'; });
    h += '<circle class="ps-xfr" data-xf="rot" cx="' + f1(m[0]) + '" cy="' + f1(a[1] - 26) + '" r="6"/><g class="ps-xfp" data-xf="pv"><circle cx="' + f1(pv[0]) + '" cy="' + f1(pv[1]) + '" r="7" data-xf="pv"/><path d="M' + f1(pv[0] - 10) + ' ' + f1(pv[1]) + 'H' + f1(pv[0] + 10) + 'M' + f1(pv[0]) + ' ' + f1(pv[1] - 10) + 'V' + f1(pv[1] + 10) + '"/></g>';
    return h;
  }
  function xfStart(e, h, w) {
    var X = xfBox(); if (!X) return false; var b = X.b, start = X.pcs.map(function (pc) { return C.clone(pc); }), tr = {}; ['button', 'hole', 'graphic'].forEach(function (k) { tr[k] = C.clone(P.trims[k]); });
    var hx = { nw: [b[0], b[1]], n: [(b[0] + b[2]) / 2, b[1]], ne: [b[2], b[1]], e: [b[2], (b[1] + b[3]) / 2], se: [b[2], b[3]], s: [(b[0] + b[2]) / 2, b[3]], sw: [b[0], b[3]], w: [b[0], (b[1] + b[3]) / 2] }, opp = { nw: 'se', n: 's', ne: 'sw', e: 'w', se: 'nw', s: 'n', sw: 'ne', w: 'e' };
    startDrag({ k: 'xf', h: h, a: w, box: X, start: start, tr: tr, mark: H.mark(), hp: hx[h], an: hx[opp[h]] }); return true;
  }
  function xfMove(e, w, sx) {
    var d = drag, X = d.box, m, ang = 0, lab = '';
    if (d.h === 'pv') { ST.pvW = w; d.box = Object.assign({}, X, { pv: w }); drawPts(); return; }
    if (d.h === 'rot') { var a0 = Math.atan2(d.a[1] - X.pv[1], d.a[0] - X.pv[0]), a1 = Math.atan2(w[1] - X.pv[1], w[0] - X.pv[0]); ang = (a1 - a0) * 180 / Math.PI; if (e.shiftKey) ang = Math.round(ang / 15) * 15; lab = ang.toFixed(1) + '°'; }
    else { var an = e.altKey ? X.pv : d.an, hp = d.hp, kx = /e|w/.test(d.h), ky = /n|s/.test(d.h), sxv = kx ? (w[0] - an[0]) / ((hp[0] - an[0]) || 1e-9) : 1, syv = ky ? (w[1] - an[1]) / ((hp[1] - an[1]) || 1e-9) : 1;
      if (kx && ky && !e.shiftKey) { var u = (Math.abs(sxv) + Math.abs(syv)) / 2; sxv = u * Math.sign(sxv || 1); syv = u * Math.sign(syv || 1); }
      d.sc = [sxv, syv, an]; lab = (kx ? Math.round(sxv * 1000) / 10 + '% wide' : '') + (kx && ky ? ' · ' : '') + (ky ? Math.round(syv * 1000) / 10 + '% high' : ''); }
    ['button', 'hole', 'graphic'].forEach(function (k) { P.trims[k] = C.clone(d.tr[k]); });
    X.pcs.forEach(function (pc, i) { var s0 = d.start[i]; Object.keys(s0).forEach(function (k) { pc[k] = C.clone(s0[k]); }); var px = pc.x || 0, py = pc.y || 0;
      m = d.h === 'rot' ? C.M.rot(ang, X.pv[0] - px, X.pv[1] - py) : C.M.scale(d.sc[0], d.sc[1], d.sc[2][0] - px, d.sc[2][1] - py); xfAll(pc, m, d.h === 'rot' ? ang : 0); drawPiece(pc, true); });
    d.moved = true; d.ang = ang; ST.live = { at: sx, t: lab + (d.h !== 'rot' ? ' · scale is not grading' : '') }; drawPts();
  }

  /* ---------- pointer handling ----------
     Moves are processed once per animation frame. While dragging, only the piece being changed is redrawn and checked quickly;
     the full checks (crossing outlines, overlapping allowances) run when the mouse is released. */
  var drag = null, space = false, pend = null, praf = 0;
  function startDrag(o) { drag = o; ST.live = null; }
  function down(e) {
    if (e.button === 1 || space || ST.tool === 'pan') { drag = { k: 'pan', x: e.clientX, y: e.clientY, tx: ST.tx, ty: ST.ty }; svg.setPointerCapture(e.pointerId); e.preventDefault(); return; }
    if (e.button !== 0) return;
    svg.focus({ preventScroll: true }); ctxClose(); var w = S2W(e), t = e.target, ds = t.dataset || {}, pc = ds.pc ? pcById(ds.pc) : null, sn = snap(w, null, e);
    svg.setPointerCapture(e.pointerId);
    if (ds.xf && ST.tool === 'select') { if (e.detail === 2 && ds.xf === 'pv') { ST.pvW = null; drawPts(); return; } if (xfStart(e, ds.xf, w)) return; }
    switch (ST.tool) {
      case 'select': {
        if (ds.nt) { ST.notch = ds.nt; ST.node = ST.seg = ST.it = null; refresh(); return; }
        var trEl = t.closest && t.closest('[data-tr]'); if (trEl) { var tp2 = trEl.getAttribute('data-tr').split('|'); ST.trim = { k: tp2[0], id: tp2[1] }; ST.seam = ST.node = ST.seg = ST.notch = ST.it = null; var tro = trimOf(ST.trim); if (tro && (tp2[0] === 'button' || tp2[0] === 'hole' || tp2[0] === 'graphic') && !pcById(tro.pc).locked) { startDrag({ k: 'trim', r: tro, pc: pcById(tro.pc), a: w, at0: tro.at.slice(), mark: H.mark() }); } ST.tab = 'trims'; refresh(); return; }
        if (ds.sw) { ST.seam = ds.sw; ST.trim = ST.node = ST.seg = ST.notch = ST.it = null; ST.tab = 'sewing'; refresh(); return; }
        var hit = (pc && !ds.n ? pc : null) || pieceAt(w);
        if (!hit) { if (!e.shiftKey) ST.sel = []; ST.notch = ST.it = ST.seam = ST.trim = ST.fab = ST.psel = null; startDrag({ k: 'marq', a: w }); refresh(); return; }
        if (e.shiftKey) { var i = ST.sel.indexOf(hit.id); if (i >= 0) ST.sel.splice(i, 1); else ST.sel.push(hit.id); } else if (ST.sel.indexOf(hit.id) < 0) ST.sel = [hit.id];
        ST.notch = ST.it = ST.node = ST.seg = ST.seam = ST.trim = ST.fab = ST.psel = null;
        var mv = selected().filter(function (p) { return !p.locked; }), b0 = mv.length ? bboxW(mv[0]) : [0, 0];
        startDrag({ k: 'move', a: w, mark: H.mark(), corner: [b0[0], b0[1]], pcs: mv.map(function (p) { return [p, p.x, p.y]; }) }); refresh(); return;
      }
      case 'edit': { ST.seam = ST.trim = ST.fab = ST.psel = null;
        if (ds.h && pc) { if (pc.locked) return toast('Unlock the piece first.', 1); startDrag({ k: 'handle', pc: pc, n: +ds.n, h: ds.h, mark: H.mark() }); return; }
        if (ds.n != null && pc) { var n = +ds.n; if (e.shiftKey && ST.node && ST.node.pc === pc.id) { var j = ST.node.idx.indexOf(n); if (j >= 0) ST.node.idx.splice(j, 1); else ST.node.idx.push(n); } else if (!ST.node || ST.node.pc !== pc.id || ST.node.idx.indexOf(n) < 0) ST.node = { pc: pc.id, idx: [n] };
          ST.seg = null; ST.sel = [pc.id]; if (pc.locked) { refresh(); return; } var lead = pc.nodes[n]; startDrag({ k: 'nodes', pc: pc, a: w, lead: n, off: [w[0] - (lead.x + pc.x), w[1] - (lead.y + pc.y)], mark: H.mark(), start: pc.nodes.map(function (nd) { return [nd.x, nd.y]; }) }); refresh(); return; }
        if (ds.s != null && pc) { ST.seg = { pc: pc.id, i: +ds.s }; ST.node = null; ST.sel = [pc.id]; if (!pc.locked) startDrag({ k: 'nodes', pc: pc, a: w, lead: +ds.s, off: [w[0] - (pc.nodes[+ds.s].x + pc.x), w[1] - (pc.nodes[+ds.s].y + pc.y)], mark: H.mark(), start: pc.nodes.map(function (nd) { return [nd.x, nd.y]; }), idx: [+ds.s, (+ds.s + 1) % pc.nodes.length], seg: +ds.s }); refresh(); return; }
        var hp = pieceAt(w); ST.node = ST.seg = null; ST.sel = hp ? [hp.id] : []; if (!hp) startDrag({ k: 'marqn', a: w }); refresh(); return;
      }
      case 'addpt': { var ne = nearestEdge(w); if (!ne) return; if (ne.pc.locked) return toast('Unlock the piece first.', 1); act('Add point', function () { var nd = C.splitSeg(ne.pc, ne.seg, ne.t); ST.node = { pc: ne.pc.id, idx: [ne.pc.nodes.indexOf(nd)] }; ST.sel = [ne.pc.id]; }); toast('Point added ' + F(ne.s) + ' from the start of the edge.'); return; }
      case 'curv': { var ce = nearestEdge(w); if (!ce || ce.pc.locked) return; var k0 = C.ctrl(ce.pc, ce.seg); startDrag({ k: 'curv', pc: ce.pc, seg: ce.seg, a: w, mark: H.mark(), h2: ce.pc.nodes[ce.seg].h2, h1: ce.pc.nodes[(ce.seg + 1) % ce.pc.nodes.length].h1, chord: [k0.p0, k0.p3], L0: C.segLen(ce.pc, ce.seg) }); ST.seg = { pc: ce.pc.id, i: ce.seg }; ST.sel = [ce.pc.id]; refresh(); return; }
      case 'smooth': { var se = nearestEdge(w); if (!se) return; act('Smooth curve', function () { var n2 = se.pc.nodes.length, r = C.smooth(se.pc, [(se.seg - 1 + n2) % n2, se.seg, (se.seg + 1) % n2], 1, 35); toast('Smoothed. Length change ' + (r.change >= 0 ? '+' : '−') + F(Math.abs(r.change)) + '. Sharp corners were kept.'); }); return; }
      case 'notch': { var nn = nearestEdge(w); if (!nn) return toast('Click on an edge of a piece.', 1); act('Add notch', function () { var nt = { id: C.uid('nt'), seg: nn.seg, mode: 'dist', v: +nn.s.toFixed(3), from: 'start', type: 'single', depth: .6 }; nn.pc.notches.push(nt); ST.notch = nt.id; ST.sel = [nn.pc.id]; ST.node = ST.seg = null; }); return; }
      case 'sa': case 'walk': { var ee = nearestEdge(w); if (!ee) return toast('Click on an edge of a piece.', 1); if (ST.tool === 'sa') { ST.seg = { pc: ee.pc.id, i: ee.seg }; ST.node = null; ST.sel = [ee.pc.id]; } else { if (ST.walk.length >= 2) ST.walk = []; ST.walk.push({ pc: ee.pc.id, seg: ee.seg }); } refresh(); return; }
      case 'measure': { if (!ST.meas.length && t.classList.contains('ps-eh') && sn.k !== 'point' && sn.k !== 'midpoint') { var me = nearestEdge(w); if (me) { ST.seg = { pc: me.pc.id, i: me.seg }; ST.node = null; toast(me.pc.name + ', edge ' + (me.seg + 1) + ': ' + F(me.L) + ' along the ' + (C.ctrl(me.pc, me.seg).curved ? 'curve' : 'line') + '.'); refresh(); return; } } ST.meas.push(sn.p); opts(); drawOver(); return; }
      case 'merge': { var mg = nearestEdge(w); if (!mg) return toast('Click on an edge of a piece.', 1); if (ST.walk.length === 1 && ST.walk[0].pc === mg.pc.id) return toast('Click an edge on a different piece.', 1); ST.walk.push({ pc: mg.pc.id, seg: mg.seg }); if (ST.walk.length === 2) doMerge(); else { draw(); status(); } return; }
      case 'trace': { var tr0 = nearestEdge(w); if (tr0 && t.classList.contains('ps-eh')) { var fw = ST.o.fw || 4; act('Trace facing', function () { var f = C.facing(tr0.pc, [tr0.seg], fw); f.x += 2; f.y += 2; P.pieces.push(f); ST.sel = [f.id]; }); toast('Facing traced, ' + F(fw) + ' wide. Move it off the piece and check it.'); return; } var tp = pieceAt(w); if (!tp) return toast('Click an edge, or inside an internal shape.', 1); var lw = W2L(tp, w), hit2 = tp.internals.filter(function (it) { if (it.kind === 'ellipse') return Math.pow((lw[0] - it.c[0]) / it.r[0], 2) + Math.pow((lw[1] - it.c[1]) / it.r[1], 2) <= 1; return it.pts.length > 2 && inside(it.pts, lw); })[0]; if (!hit2) return toast('No internal shape here. Draw one with the Internal tools first.', 1); return traceIt(tp, hit2); }
      case 'cut': { var ce2 = nearestEdge(w); if (!ce2) return toast('Click on the outline of a piece.', 1); if (ST.cut.length && ST.cut[0].pc !== ce2.pc.id) ST.cut = []; ST.cut.push({ pc: ce2.pc.id, seg: ce2.seg, t: ce2.t, p: ce2.p }); if (ST.cut.length === 2) doCut(); else drawOver(); status(); return; }
      case 'sew': case 'fsew': {
        var se2 = nearestEdge(w); if (!se2) return toast('Click on an edge of a piece.', 1);
        var L2 = se2.L, pk = { pc: se2.pc.id, seg: se2.seg, s: se2.s, t: se2.s / (L2 || 1) };
        if (ST.tool === 'sew') { ST.pick.push(pk); if (ST.pick.length < 2) { draw(); status(); return; }
          var A = ST.pick[0], B = ST.pick[1]; ST.pick = []; if (A.pc === B.pc && A.seg === B.seg) { draw(); return toast('Pick two different edges.', 1); }
          var pa = pcById(A.pc), pb = pcById(B.pc), LA = C.segLen(pa, A.seg), LB = C.segLen(pb, B.seg);
          addSeam({ pc: A.pc, seg: A.seg, a: A.t < .5 ? 0 : LA, b: A.t < .5 ? LA : 0 }, { pc: B.pc, seg: B.seg, a: B.t < .5 ? 0 : LB, b: B.t < .5 ? LB : 0 }); return; }
        if (ST.pick.length % 2 === 1 && (ST.pick[ST.pick.length - 1].pc !== pk.pc || ST.pick[ST.pick.length - 1].seg !== pk.seg)) return toast('Click the end of this part on the same edge.', 1);
        ST.pick.push(pk); if (ST.pick.length < 4) { draw(); status(); return; }
        var q0 = ST.pick; ST.pick = []; addSeam({ pc: q0[0].pc, seg: q0[0].seg, a: q0[0].s, b: q0[1].s }, { pc: q0[2].pc, seg: q0[2].seg, a: q0[2].s, b: q0[3].s }); return;
      }
      case 'button': case 'hole': case 'graphic': {
        var bp = pieceAt(w); if (!bp) return toast('Click on a piece.', 1); var lp0 = W2L(bp, sn.p);
        if (ST.tool === 'graphic') { ST.gfxAt = { pc: bp.id, at: lp0 }; q('#ps-gfx').click(); return; }
        var r0 = ST.tool === 'button' ? Object.assign({ id: C.uid('bt'), pc: bp.id, at: lp0 }, ST.lastBtn || { size: 1.5, holes: 4, mat: 'Polyester', colour: '#e9e2d3', name: 'Button' }) : Object.assign({ id: C.uid('bh'), pc: bp.id, at: lp0 }, ST.lastHole || { len: 1.8, ang: 0, type: 'Straight', colour: '#5b4a3a' });
        var kk = ST.tool; act('Add ' + (kk === 'button' ? 'button' : 'buttonhole'), function () { P.trims[kk].push(r0); ST.trim = { k: kk, id: r0.id }; ST.sel = [bp.id]; ST.tab = 'trims'; }); return;
      }
      case 'zip': case 'piping': case 'binding': case 'tstitch': case 'pucker': case 'tape': {
        var te = nearestEdge(w); if (!te) return toast('Click on an edge of a piece.', 1); var k2 = ST.tool, pre = ST.tool === 'tstitch' ? tsPreset() : null;
        var DEF = { zip: { type: 'Coil', gauge: 5, sep: false, colour: '#2b2b2b' }, piping: { w: .4, colour: '#7a2f2f', fab: '' }, binding: { w: 1, type: 'Double fold', colour: '#3a5a8c', fab: '' }, tstitch: pre ? { preset: pre.id, spi: pre.spi, tex: pre.tex, rows: pre.rows, gap: pre.gap, off: pre.off, colour: pre.colour } : { spi: 12, tex: 30, rows: 1, gap: .64, off: .15, colour: '#2b2b2b' }, pucker: { str: .5, mode: 'Visual' }, tape: { w: 1, type: 'Stay tape', colour: '#d9c27a' } }[k2];
        var r1 = Object.assign({ id: C.uid(k2.slice(0, 2)), pc: te.pc.id, seg: te.seg, a: 0, b: null }, DEF);
        act('Add ' + TOOL[k2].n.toLowerCase(), function () { P.trims[k2].push(r1); ST.trim = { k: k2, id: r1.id }; ST.sel = [te.pc.id]; ST.tab = 'trims'; }); return;
      }
      case 'poly': {
        var d = ST.draft || (ST.draft = { kind: 'poly', pts: [] });
        if (d.pts.length > 2 && C.dist(sn.p, d.pts[0].p) < 9 / ST.z) { finishPoly(); return; }
        d.pts.push({ p: sn.p, h: null }); startDrag({ k: 'polyh', e: d.pts[d.pts.length - 1] }); opts(); drawOver(); status(); return;
      }
      case 'rect': case 'ellipse': startDrag({ k: 'box', a: sn.p, kind: ST.tool }); ST.draft = { kind: ST.tool, box: [sn.p[0], sn.p[1], sn.p[0], sn.p[1]] }; return;
      case 'spiral': create('mkspiral', sn.p); return;
      case 'iline': case 'irect': case 'iell': {
        var host = ST.draft && ST.draft.host ? pcById(ST.draft.host) : pieceAt(w); if (!host) return toast('Start inside a piece.', 1);
        if (ST.tool === 'iline') { var dd = ST.draft || (ST.draft = { kind: 'iline', host: host.id, pts: [] }); dd.pts.push({ p: sn.p }); drawOver(); return; }
        startDrag({ k: 'box', a: sn.p, kind: ST.tool, host: host.id }); ST.draft = { kind: ST.tool, host: host.id, box: [sn.p[0], sn.p[1], sn.p[0], sn.p[1]] }; return;
      }
      case 'grain': { var gp = pieceAt(w); if (!gp) return toast('Drag across a piece.', 1); startDrag({ k: 'grain', pc: gp, a: sn.p }); ST.draft = { line: [sn.p, sn.p] }; return; }
    }
  }
  function moveQ(e) { pend = e; if (!praf) praf = requestAnimationFrame(function () { praf = 0; var ev = pend; pend = null; if (ev) move(ev); }); }
  function constrain(a, p) { var dx = p[0] - a[0], dy = p[1] - a[1], ang = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * Math.PI / 4, l = Math.hypot(dx, dy) * Math.cos(Math.atan2(dy, dx) - ang); return [a[0] + Math.cos(ang) * l, a[1] + Math.sin(ang) * l]; }
  function redrawLinked(pc) { P.pieces.forEach(function (o) { if (o.link && o.link.on && o.link.to === pc.id) drawPiece(o, true); }); }
  function move(e) {
    var w = S2W(e), sx = W2S(w); ST.cursor = w;
    if (!drag) {
      var wants = ['poly', 'rect', 'ellipse', 'measure', 'iline', 'irect', 'iell', 'grain', 'spiral', 'cut', 'notch', 'addpt'].indexOf(ST.tool) >= 0, hov = wants ? snap(w, null, e) : null;
      if (hov && (ST.tool === 'cut' || ST.tool === 'notch' || ST.tool === 'addpt')) { var ne = nearestEdge(w); hov = ne ? { p: L2W(ne.pc, ne.p), k: F(ne.s) + ' of ' + F(ne.L) } : null; }
      ST.hover = hov && hov.k ? hov : null;
      if (ST.draft && ST.draft.pts) ST.draft.cur = e.shiftKey && ST.draft.pts.length ? constrain(ST.draft.pts[ST.draft.pts.length - 1].p, hov ? hov.p : w) : hov ? hov.p : w;
      if (ST.tool === 'measure' && ST.meas.length) { ST.mcur = e.shiftKey ? constrain(ST.meas[ST.meas.length - 1], hov ? hov.p : w) : hov ? hov.p : w; var lm = ST.meas[ST.meas.length - 1]; ST.live = { at: sx, t: F(C.dist(lm, ST.mcur)) + ' · ' + (Math.atan2(-(ST.mcur[1] - lm[1]), ST.mcur[0] - lm[0]) * 180 / Math.PI).toFixed(1) + '°' }; }
      else if (ST.tool === 'poly' && ST.draft && ST.draft.pts.length) { var lp = ST.draft.pts[ST.draft.pts.length - 1].p, c = ST.draft.cur; ST.live = { at: sx, t: F(C.dist(lp, c)) + ' · ' + (Math.atan2(-(c[1] - lp[1]), c[0] - lp[0]) * 180 / Math.PI).toFixed(1) + '°' }; }
      else ST.live = null;
      ST.hovE = (ST.tool === 'edit' || PICK.indexOf(ST.tool) >= 0) && !(ST.draft) ? nearestEdge(w) : null; if (ST.hovE) ST.hovE.at = sx;
      status(); drawOver(); drawPts(); drawRulers(); return;
    }
    var d = drag;
    if (d.k === 'pan') { ST.tx = d.tx + e.clientX - d.x; ST.ty = d.ty + e.clientY - d.y; drawView(); return; }
    if (d.k === 'marq' || d.k === 'marqn') { ST.marq = [Math.min(d.a[0], w[0]), Math.min(d.a[1], w[1]), Math.max(d.a[0], w[0]), Math.max(d.a[1], w[1])]; drawOver(); return; }
    if (d.k === 'move') { var dx = w[0] - d.a[0], dy = w[1] - d.a[1];
      if (V().snap && !e.altKey) { var g = gridStep(), cx = d.corner[0] + dx, cy = d.corner[1] + dy; dx += Math.round(cx / g) * g - cx; dy += Math.round(cy / g) * g - cy; }
      if (e.shiftKey) { if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0; }
      d.pcs.forEach(function (o) { o[0].x = o[1] + dx; o[0].y = o[2] + dy; placeG(o[0]); }); d.moved = true; ST.live = { at: sx, t: 'Δ ' + F(dx) + ', ' + F(dy) }; drawPts(); status(); return; }
    if (d.k === 'xf') { xfMove(e, w, sx); return; }
    if (d.k === 'trim') { var sn4 = snap(w, null, e), lq = W2L(d.pc, sn4.p), dd0 = [lq[0] - (d.a[0] - d.pc.x), lq[1] - (d.a[1] - d.pc.y)]; d.r.at = [d.at0[0] + dd0[0], d.at0[1] + dd0[1]]; d.moved = true; ST.live = { at: sx, t: 'X ' + F(d.r.at[0]) + '  Y ' + F(d.r.at[1]) }; drawPiece(d.pc, true); drawPts(); return; }
    if (d.k === 'nodes') { var pc = d.pc, idx = d.idx || ST.node.idx, want = [w[0] - d.off[0], w[1] - d.off[1]], sn = snap(want, { pc: pc, idx: idx }, e), tgt = sn.p, st0 = d.start[d.lead];
      if (e.shiftKey) tgt = constrain(L2W(pc, st0), tgt);
      var tl = W2L(pc, tgt), ddx = tl[0] - st0[0], ddy = tl[1] - st0[1];
      idx.forEach(function (i) { pc.nodes[i].x = d.start[i][0] + ddx; pc.nodes[i].y = d.start[i][1] + ddy; }); d.moved = true; syncLinks();
      var n = pc.nodes.length, info;
      if (d.seg != null) info = 'Δ ' + F(ddx) + ', ' + F(ddy) + ' · edges ' + F(C.segLen(pc, (d.seg - 1 + n) % n)) + ' | ' + F(C.segLen(pc, (d.seg + 1) % n));
      else info = 'Δ ' + F(ddx) + ', ' + F(ddy) + ' · edges ' + F(C.segLen(pc, (d.lead - 1 + n) % n)) + ' | ' + F(C.segLen(pc, d.lead));
      ST.hover = sn.k ? { p: tgt, k: sn.k } : null; ST.live = { at: sx, t: info }; drawPiece(pc, true); redrawLinked(pc); drawPts(); status(); return; }
    if (d.k === 'handle') { var nd = d.pc.nodes[d.n], l = W2L(d.pc, w), v = [l[0] - nd.x, l[1] - nd.y]; if (e.shiftKey) { var hv = constrain([0, 0], v); v = hv; } nd[d.h] = v; var o = d.h === 'h1' ? 'h2' : 'h1'; if (nd.smooth && nd[o] && !e.altKey) { var ol = Math.hypot(nd[o][0], nd[o][1]), vl = Math.hypot(v[0], v[1]) || 1; nd[o] = [-v[0] / vl * ol, -v[1] / vl * ol]; } d.moved = true; syncLinks();
      var nn2 = d.pc.nodes.length, sgi = d.h === 'h2' ? d.n : (d.n - 1 + nn2) % nn2; ST.live = { at: sx, t: 'Edge ' + (sgi + 1) + ': ' + F(C.segLen(d.pc, sgi)) + (nd.smooth && !e.altKey ? ' · smooth' : '') }; drawPiece(d.pc, true); redrawLinked(d.pc); drawPts(); return; }
    if (d.k === 'curv') { var ch = d.chord, cd = [ch[1][0] - ch[0][0], ch[1][1] - ch[0][1]], cl = Math.hypot(cd[0], cd[1]) || 1, nx = -cd[1] / cl, ny = cd[0] / cl, lw = W2L(d.pc, w), la = W2L(d.pc, d.a), off = (lw[0] - la[0]) * nx + (lw[1] - la[1]) * ny, pc2 = d.pc, a2 = pc2.nodes[d.seg], b2 = pc2.nodes[(d.seg + 1) % pc2.nodes.length], k4 = off * 4 / 3, base2 = d.h2 || [cd[0] / 3, cd[1] / 3], base1 = d.h1 || [-cd[0] / 3, -cd[1] / 3]; a2.h2 = [base2[0] + nx * k4, base2[1] + ny * k4]; b2.h1 = [base1[0] + nx * k4, base1[1] + ny * k4]; d.moved = true; syncLinks();
      var Ln = C.segLen(pc2, d.seg); ST.live = { at: sx, t: 'Bend ' + F(off) + ' · edge ' + F(Ln) + ' (' + (Ln - d.L0 >= 0 ? '+' : '−') + F(Math.abs(Ln - d.L0)) + ')' }; drawPiece(pc2, true); redrawLinked(pc2); drawPts(); return; }
    if (d.k === 'polyh') { var e2 = d.e, hv2 = [w[0] - e2.p[0], w[1] - e2.p[1]]; if (e.shiftKey) hv2 = constrain([0, 0], hv2); e2.h = Math.hypot(hv2[0], hv2[1]) * ST.z > 4 ? hv2 : null; ST.live = e2.h ? { at: sx, t: 'Curve handle ' + F(Math.hypot(hv2[0], hv2[1])) } : null; drawOver(); drawPts(); return; }
    if (d.k === 'box') { var sn2 = snap(w, null, e), b = [d.a[0], d.a[1], sn2.p[0], sn2.p[1]]; if (e.shiftKey && (d.kind === 'ellipse' || d.kind === 'rect' || d.kind === 'iell' || d.kind === 'irect')) { var s = Math.max(Math.abs(b[2] - b[0]), Math.abs(b[3] - b[1])); b[2] = b[0] + s * Math.sign(b[2] - b[0] || 1); b[3] = b[1] + s * Math.sign(b[3] - b[1] || 1); } ST.draft.box = b; ST.hover = sn2.k ? sn2 : null; ST.live = { at: sx, t: F(Math.abs(b[2] - b[0])) + ' × ' + F(Math.abs(b[3] - b[1])) }; drawOver(); drawPts(); return; }
    if (d.k === 'grain') { var sn3 = snap(w, null, e), p = sn3.p; if (e.shiftKey) p = constrain(d.a, p); ST.draft.line = [d.a, p]; ST.live = { at: sx, t: F(C.dist(d.a, p)) + ' · ' + (Math.atan2(-(p[1] - d.a[1]), p[0] - d.a[0]) * 180 / Math.PI).toFixed(1) + '°' }; drawOver(); drawPts(); return; }
  }
  function up(e) {
    if (pend) { var ev = pend; pend = null; move(ev); }
    var d = drag; drag = null; ST.live = null; if (!d) return;
    if (d.k === 'pan') { drawPts(); return; }
    if (d.k === 'marq' || d.k === 'marqn') { var m = ST.marq; ST.marq = null; if (m && (m[2] - m[0]) * ST.z > 3) {
        if (d.k === 'marq') P.pieces.forEach(function (pc) { if (pc.hidden) return; var b = bboxW(pc); if (b[0] >= m[0] && b[2] <= m[2] && b[1] >= m[1] && b[3] <= m[3] && ST.sel.indexOf(pc.id) < 0) ST.sel.push(pc.id); });
        else { var hitN = null; P.pieces.forEach(function (pc) { if (pc.hidden || pc.locked) return; var ids = []; pc.nodes.forEach(function (nd, i) { var q2 = L2W(pc, [nd.x, nd.y]); if (q2[0] >= m[0] && q2[0] <= m[2] && q2[1] >= m[1] && q2[1] <= m[3]) ids.push(i); }); if (ids.length && !hitN) hitN = { pc: pc.id, idx: ids }; }); if (hitN) { ST.node = hitN; ST.sel = [hitN.pc]; } } }
      refresh(); return; }
    if (d.k === 'xf') { if (d.moved) H.commit(d.h === 'rot' ? 'Rotate ' + (d.ang || 0).toFixed(1) + '°' : d.h === 'pv' ? 'Pivot' : 'Scale', d.mark); refresh(); return; }
    if (d.k === 'trim') { if (d.moved) H.commit('Move ' + ST.trim.k, d.mark); refresh(); return; }
    if ((d.k === 'move' || d.k === 'nodes' || d.k === 'handle' || d.k === 'curv') && d.moved) { var label = { move: 'Move', nodes: 'Move point', handle: 'Reshape curve', curv: 'Edit curvature' }[d.k]; H.commit(label, d.mark); ST.hover = null; if (d.pc) { var iss = geo(d.pc).issues; if (iss.some(function (x) { return x.k === 'cross'; })) toast(iss.filter(function (x) { return x.k === 'cross'; })[0].msg + ' Undo with Ctrl Z.', 1); } refresh(); return; }
    if (d.k === 'move' || d.k === 'nodes' || d.k === 'handle' || d.k === 'curv') { drawPts(); return; }
    if (d.k === 'box') { var b = ST.draft.box, w = Math.abs(b[2] - b[0]), h = Math.abs(b[3] - b[1]), x0 = Math.min(b[0], b[2]), y0 = Math.min(b[1], b[3]); ST.draft = null; ST.hover = null; if (w * ST.z < 4 || h * ST.z < 4) { drawOver(); drawPts(); if (d.kind === 'rect' || d.kind === 'ellipse') sizeAt(d.kind, b.slice(0, 2)); return; }
      if (d.kind === 'rect') act('Draw rectangle', function () { var r = C.rect(x0, y0, w, h, { name: 'Piece ' + (P.pieces.length + 1) }); P.pieces.push(r); ST.sel = [r.id]; });
      else if (d.kind === 'ellipse') act('Draw ellipse', function () { var r = C.ellipse(x0 + w / 2, y0 + h / 2, w / 2, h / 2, 0, { name: 'Piece ' + (P.pieces.length + 1) }); r.sa.def = Math.min(1, Math.min(w, h) / 6); P.pieces.push(r); ST.sel = [r.id]; });
      else { var host = pcById(d.host), a = W2L(host, [x0, y0]); act('Add internal shape', function () { var it = d.kind === 'irect' ? { id: C.uid('in'), kind: 'rect', pts: [a, [a[0] + w, a[1]], [a[0] + w, a[1] + h], [a[0], a[1] + h]], purpose: 'placement', style: 'solid', label: '', visible: true } : { id: C.uid('in'), kind: 'ellipse', c: [a[0] + w / 2, a[1] + h / 2], r: [w / 2, h / 2], pts: [[a[0] + w / 2, a[1] + h / 2]], purpose: 'placement', style: 'solid', label: '', visible: true }; host.internals.push(it); ST.it = it.id; ST.sel = [host.id]; }); }
      return; }
    if (d.k === 'grain') { var ln = ST.draft.line; ST.draft = null; if (C.dist(ln[0], ln[1]) * ST.z < 6) { drawOver(); drawPts(); return; } act('Set grainline', function () { d.pc.grain = { a: W2L(d.pc, ln[0]), b: W2L(d.pc, ln[1]) }; ST.sel = [d.pc.id]; }); return; }
    drawPts();
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
  function wheel(e) { e.preventDefault(); var r = svg.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top; if (e.ctrlKey || e.metaKey || !e.shiftKey && Math.abs(e.deltaY) > 0 && !e.deltaX) { var f = Math.exp(-e.deltaY * .0015), z2 = Math.max(.5, Math.min(120, ST.z * f)); ST.tx = mx - (mx - ST.tx) * z2 / ST.z; ST.ty = my - (my - ST.ty) * z2 / ST.z; ST.z = z2; } else { ST.tx -= e.deltaX; ST.ty -= e.deltaY; } drawView(); }
  function zoomAt(z2, mx, my) { var r = svg.getBoundingClientRect(); if (mx == null) { mx = r.width / 2; my = r.height / 2; } z2 = Math.max(.5, Math.min(160, z2)); ST.tx = mx - (mx - ST.tx) * z2 / ST.z; ST.ty = my - (my - ST.ty) * z2 / ST.z; ST.z = z2; drawView(); }
  function key(e) {
    if (!ON) return; var tg = e.target, typing = /INPUT|TEXTAREA|SELECT/.test(tg.tagName) || tg.isContentEditable; var mod = e.ctrlKey || e.metaKey;
    if (q('#ps-modal').hidden === false && e.key !== 'Escape') return;
    if (!typing || mod) e.stopPropagation();
    if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); doAct(e.shiftKey ? 'redo' : 'undo'); return; }
    if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); doAct('redo'); return; }
    if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); doAct(e.shiftKey ? 'saveas' : 'save'); return; }
    if (mod && e.key.toLowerCase() === 'o') { e.preventDefault(); doAct('open'); return; }
    if (mod && e.key.toLowerCase() === 'n') { e.preventDefault(); doAct('new'); return; }
    if (typing) return;
    if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); if (ST.sel.length) doAct('dup'); return; }
    if (mod && e.key.toLowerCase() === 'c') { e.preventDefault(); copySel(); return; }
    if (mod && e.key.toLowerCase() === 'v') { e.preventDefault(); paste(ST.cursor); return; }
    if (mod && e.key.toLowerCase() === 'a') { e.preventDefault(); ST.sel = P.pieces.filter(function (p) { return !p.hidden; }).map(function (p) { return p.id; }); refresh(); return; }
    if (e.key === ' ') { space = true; svg.style.cursor = 'grab'; e.preventDefault(); return; }
    if (e.key === 'Escape') { if (ctxEl) { ctxClose(); return; } if (q('#ps-modal').hidden === false) { closeModal(); return; } ST.draft = null; ST.meas = []; ST.cut = []; ST.walk = []; ST.pick = []; ST.node = ST.seg = ST.notch = ST.it = ST.seam = ST.trim = ST.fab = ST.psel = null; opts(); refresh(); return; }
    if (e.key === 'Enter') { if (ST.tool === 'poly' && ST.draft) finishPoly(); else if (ST.tool === 'iline' && ST.draft) finishILine(); return; }
    if (e.key === 'Backspace' && ST.draft && ST.draft.pts) { ST.draft.pts.pop(); if (!ST.draft.pts.length) ST.draft = null; drawOver(); status(); e.preventDefault(); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); if (ST.node) doAct('ndel'); else if (ST.notch) doAct('ntdel'); else if (ST.it) doAct('itdel'); else if (ST.sel.length) doAct('del'); return; }
    if (/^Arrow/.test(e.key)) { e.preventDefault(); var st = nudgeStep(e.shiftKey), dx = e.key === 'ArrowLeft' ? -st : e.key === 'ArrowRight' ? st : 0, dy = e.key === 'ArrowUp' ? -st : e.key === 'ArrowDown' ? st : 0; if (ST.node) act('Nudge points', function () { C.moveNodes(pcById(ST.node.pc), ST.node.idx, dx, dy); }); else if (ST.sel.length) act('Nudge', function () { selected().forEach(function (p) { if (!p.locked) { p.x += dx; p.y += dy; } }); }); return; }
    if (e.key === '0') return fit(); if (e.key === '1') return doAct('z100'); if (e.key === '=') return zoomAt(ST.z * 1.25); if (e.key === '-') return zoomAt(ST.z / 1.25);
    var t = TOOLS.filter(function (x) { return x.k === e.key.toLowerCase(); })[0]; if (t) setTool(t.id);
  }
  function setTool(id) { ST.tool = id; ST.draft = null; ST.cut = []; ST.pick = []; if (id !== 'measure') ST.meas = []; if (id !== 'walk' && id !== 'merge') ST.walk = []; if (id === 'merge') ST.walk = []; qa('.ps-tb').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.t === id); }); svg.dataset.tool = id; opts(); refresh(); }

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
  function load(p) { if (!C.isProject(p)) return toast('That is not a Pattern Maker project.', 1); H.swap(C.clone(p)); H.u = []; H.r = []; ST.sel = []; ST.node = ST.seg = ST.notch = ST.it = null; ST.dirty = false; ST.savedAt = Date.now(); refresh(); fit(); }
  function confirmDiscard(fn) { if (!ST.dirty || !P.pieces.length) return fn(); modal('<h4>Unsaved changes</h4><p>This project has changes that are not saved to a project yet. They are kept in autosave until you start something else.</p><div class="ps-bs"><button type="button" class="ps-b pri" id="ps-dsave">Save first</button><button type="button" class="ps-b bad" id="ps-dgo">Discard and continue</button><button type="button" class="ps-b" data-a="mclose">Cancel</button></div>', function () { q('#ps-dsave').onclick = function () { closeModal(); save(false); }; q('#ps-dgo').onclick = function () { closeModal(); ST.dirty = false; fn(); }; }); }
  function modal(html, after) { var m = q('#ps-modal'); m.innerHTML = '<div class="ps-mbox" role="dialog" aria-modal="true">' + html + '</div>'; m.hidden = false; m.onclick = null; if (after) after(m); var f = m.querySelector('input,button'); if (f) f.focus(); }
  function closeModal() { var m = q('#ps-modal'); m.hidden = true; m.innerHTML = ''; }
  function fname(ext) { return (P.name || 'pattern').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.' + ext; }

  function settingsModal() {
    var st = P.settings;
    modal('<h4>Project settings</h4>' + '<label class="ps-r"><span>Default seam allowance</span>' + num('set_sa', U(P.settings.sa != null ? P.settings.sa : 1)) + '</label><label class="ps-r"><span>Default hem allowance</span>' + num('set_hem', U(P.settings.hem != null ? P.settings.hem : 2.5)) + '</label><label class="ps-r"><span>Notch depth</span>' + num('set_nd', U(st.notchDepth || .6)) + '</label>'
      + '<label class="ps-r"><span>Marker efficiency for the BOM</span>' + plain('set_eff', st.efficiency, 1, '%') + '</label><label class="ps-r"><span>Extra on piping, binding and tape</span>' + plain('set_waste', st.waste, 1, '%') + '</label><label class="ps-r"><span>Thread per cm of topstitch</span>' + plain('set_thr', st.threadRatio, .1, '× seam') + '</label>'
      + '<p class="ps-n">Units follow the cm / mm / in switch at the top of Pattern Maker. The default allowances apply to new pieces.</p><div class="ps-bs"><button type="button" class="ps-b pri" id="ps-setok">Save</button><button type="button" class="ps-b" data-a="mclose">Cancel</button></div>', function () {
        q('#ps-setok').onclick = function () { var g = function (k) { return q('#ps-modal [data-k=' + k + ']').value; }; act('Settings', function () { st.sa = CM(g('set_sa')); st.hem = CM(g('set_hem')); st.notchDepth = CM(g('set_nd')); st.efficiency = Math.max(30, Math.min(100, +g('set_eff') || 80)); st.waste = Math.max(0, +g('set_waste') || 0); st.threadRatio = Math.max(1, +g('set_thr') || 2.6); }); closeModal(); };
      });
  }
  function loadGraphic(file) {
    if (!file) return; if (file.size > 1.5e6) return toast('That image is over 1.5 MB. Use a smaller PNG, JPG or SVG so the project stays quick to save.', 1);
    var rd = new FileReader(); rd.onload = function () { var src = rd.result, img = new Image(); img.onload = function () { var ratio = (img.naturalHeight || 1) / (img.naturalWidth || 1), g = ST.gfxAt || {};
        if (g.replace) { var r = trimOf({ k: 'graphic', id: g.replace }); if (r) act('Replace graphic', function () { r.src = src; r.ratio = ratio; r.h = r.w * ratio; }); return; }
        var pc = pcById(g.pc); if (!pc) return; act('Add graphic', function () { var w = 8, r = { id: C.uid('gx'), pc: pc.id, at: g.at, src: src, ratio: ratio, w: w, h: w * ratio, rot: 0, op: 1, name: file.name.replace(/\.[^.]+$/, ''), method: 'Print' }; P.trims.graphic.push(r); ST.trim = { k: 'graphic', id: r.id }; ST.tab = 'trims'; ST.sel = [pc.id]; }); };
      img.onerror = function () { toast('That file could not be read as an image.', 1); }; img.src = src; }; rd.readAsDataURL(file);
  }
  /* ---------- bring in a draft ---------- */
  function fromDraft() {
    var UI = window.PMUI, last = UI && UI.last && UI.last(); if (!last || !last.r) return toast('Choose a garment in Draft first.', 1);
    if (!P.pieces.length) return bringDraft('new');
    modal('<h4>Bring in the draft</h4><p>' + esc(draftName()) + ': replace the pieces you have, or add the draft pieces beside them?</p><div class="ps-bs"><button type="button" class="ps-b pri" id="ps-fadd">Add beside</button><button type="button" class="ps-b" id="ps-frep">Replace my pieces</button><button type="button" class="ps-b" data-a="mclose">Cancel</button></div>', function () { q('#ps-fadd').onclick = function () { closeModal(); bringDraft('add'); }; q('#ps-frep').onclick = function () { closeModal(); bringDraft('replace'); }; });
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
    sc.push({ k: 'text', x: 7.5, y: Hh - 4.6, s: 1.1, t: P.name + ' · ' + pcs.length + ' pieces', b: 1, L: 'TEXT' }, { k: 'text', x: 7.5, y: Hh - 3, s: .7, t: 'Forecut Pattern Maker · ' + new Date().toISOString().slice(0, 10) + ' · print at 100% and check the 5 cm square', col: '#a9481f', L: 'BRAND' });
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

  /* ---------- wiring ---------- */
  function onClick(e) {
    var mb = e.target.closest('.ps-mb'); if (mb) { var dd = q('[data-mm=' + mb.dataset.m + ']'), was = dd.hidden; qa('.ps-dd').forEach(function (x) { x.hidden = true; }); dd.hidden = !was; if (!dd.hidden) { var br = mb.getBoundingClientRect(); dd.style.left = Math.min(br.left, innerWidth - 290) + 'px'; dd.style.top = (br.bottom + 3) + 'px'; dd.style.maxHeight = (innerHeight - br.bottom - 12) + 'px'; } e.stopPropagation(); return; }
    if (!e.target.closest('.ps-dd')) qa('.ps-dd').forEach(function (x) { x.hidden = true; });
    var pm = e.target.closest('[data-pmode]'); if (pm) return setEdit(pm.dataset.pmode === 'edit');
    var tb = e.target.closest('.ps-tb'); if (tb) return setTool(tb.dataset.t);
    var a = e.target.closest('[data-a]'); if (a) { qa('.ps-dd').forEach(function (x) { x.hidden = true; }); if (a.dataset.a === 'mclose') return closeModal(); if (a.dataset.a === 'mclear') { ST.meas = []; ST.mcur = null; opts(); return drawOver(); } return doAct(a.dataset.a, a); }
    var tb2 = e.target.closest('[data-tab]'); if (tb2) { ST.tab = tb2.dataset.tab; return objects(); }
    var sl = e.target.closest('[data-swl]'); if (sl) { ST.seam = sl.dataset.swl; ST.trim = ST.fab = ST.psel = ST.node = ST.seg = ST.notch = ST.it = null; return refresh(); }
    var fl = e.target.closest('[data-fab]'); if (fl) { ST.fab = fl.dataset.fab; ST.seam = ST.trim = ST.psel = ST.node = ST.seg = ST.notch = ST.it = null; return refresh(); }
    var tl = e.target.closest('[data-trl]'); if (tl) { var tq = tl.dataset.trl.split('|'); ST.trim = { k: tq[0], id: tq[1] }; ST.seam = ST.fab = ST.psel = ST.node = ST.seg = ST.notch = ST.it = null; var tr3 = trimOf(ST.trim); if (tr3) ST.sel = [tr3.pc]; return refresh(); }
    var tsl = e.target.closest('[data-tsp]'); if (tsl) { ST.tsp = ST.psel = tsl.dataset.tsp; ST.seam = ST.fab = ST.trim = ST.node = ST.seg = ST.notch = ST.it = null; return refresh(); }
    var ob = e.target.closest('.ps-ob'); if (ob) { var id = ob.dataset.pc; if (e.shiftKey) { var i = ST.sel.indexOf(id); if (i >= 0) ST.sel.splice(i, 1); else ST.sel.push(id); } else ST.sel = [id]; ST.node = ST.seg = ST.notch = ST.it = ST.seam = ST.trim = ST.fab = ST.psel = null; return refresh(); }
    var it = e.target.closest('[data-it]'); if (it) { ST.it = it.dataset.it; ST.sel = [it.dataset.pc]; ST.node = ST.seg = ST.notch = null; return refresh(); }
  }
  function wire() {
    parts.forEach(function (p) { p.addEventListener('click', onClick); });
    document.addEventListener('click', function (e) { if (!e.target.closest('.ps-menu')) qa('.ps-dd').forEach(function (x) { x.hidden = true; }); });
    q('#ps-name').addEventListener('change', function () { var v = this.value.trim() || 'Untitled pattern'; act('Rename project', function () { P.name = v; }); });
    propsEl.addEventListener('change', onProp);
    propsEl.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.matches('input[type=number],input:not([type])')) { e.target.blur(); } });
    optsEl.addEventListener('change', function (e) { var k = e.target.dataset.o; if (!k) return; ST.o[k] = k === 'dir' ? e.target.value : k === 'turns' ? +e.target.value : CM(e.target.value); opts(); });
    barEl.addEventListener('change', function (e) { var v = e.target.dataset.v; if (!v) return; act('View', function () { V()[v] = e.target.checked; }); });
    svg.addEventListener('pointerdown', down); svg.addEventListener('pointermove', moveQ); svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', function () { drag = null; ST.live = null; drawPts(); }); svg.addEventListener('dblclick', dbl); svg.addEventListener('contextmenu', onCtx); centerEl.addEventListener('contextmenu', function (e) { if (ON && !svg.contains(e.target)) e.preventDefault(); }); svg.addEventListener('wheel', wheel, { passive: false });
    svg.addEventListener('pointerleave', function () { if (drag) return; ST.cursor = null; ST.hover = null; ST.live = null; status(); drawPts(); drawRulers(); });
    window.addEventListener('keydown', key, true); window.addEventListener('keyup', function (e) { if (e.key === ' ' && ON) { space = false; svg.style.cursor = ''; } }, true);
    var ro = window.ResizeObserver ? new ResizeObserver(function () { if (ON) drawView(); }) : null; if (ro) ro.observe(svg); else window.addEventListener('resize', function () { if (ON) drawView(); });
    q('#ps-tsearch').addEventListener('input', function () { var s = this.value.trim().toLowerCase(); qa('.ps-tb').forEach(function (b) { var t = TOOL[b.dataset.t]; b.hidden = !!s && (t.n + ' ' + t.g + ' ' + t.tip).toLowerCase().indexOf(s) < 0; }); qa('.ps-tg').forEach(function (g) { g.hidden = !g.querySelector('.ps-tb:not([hidden])'); }); });
    q('#ps-tsearch').addEventListener('keydown', function (e) { if (e.key === 'Enter') { var b = qa('.ps-tb').filter(function (x) { return !x.hidden; })[0]; if (b) { setTool(b.dataset.t); this.blur(); } } });
    parts.forEach(function (p) { p.addEventListener('pointerover', function (e) { var b = e.target.closest('[data-tip]'); if (!b) { tipEl.hidden = true; return; } var r = b.getBoundingClientRect(); tipEl.textContent = b.dataset.tip; tipEl.hidden = false; var x = r.right + 8; if (x + 270 > innerWidth) x = Math.max(8, r.left - 278); tipEl.style.left = x + 'px'; tipEl.style.top = Math.min(innerHeight - 90, Math.max(4, r.top)) + 'px'; }); p.addEventListener('pointerout', function (e) { if (e.target.closest('[data-tip]')) tipEl.hidden = true; }); });
    q('#ps-file').addEventListener('change', function () { var f = this.files[0]; this.value = ''; if (!f) return; f.text().then(function (t) { try { var p = C.parse(t); confirmDiscard(function () { load(p); P.lib = null; ST.fileName = f.name; toast('Opened ' + f.name + '. Save it to keep it in this browser.'); }); } catch (err) { toast(err.message || 'Could not read that file.', 1); } }); });
    q('#ps-gfx').addEventListener('change', function () { var f = this.files[0]; this.value = ''; loadGraphic(f); });
    objsEl.addEventListener('change', function (e) { var t = e.target;
      if (t.id === 'ps-libsel') { var f = t.value ? libFabric(t.value) : null; t.value = ''; if (f) act('Add fabric', function () { P.fabrics.push(f); ST.fab = f.id; ST.seam = ST.trim = ST.psel = null; if (selected().length) { selected().forEach(function (p) { if (!fabOf(p.fabric)) p.fabric = f.id; }); } }); return; }
      if (t.dataset.cwc) { var pr = t.dataset.cwc.split('|'); act('Colour', function () { var c = P.colourways.filter(function (x) { return x.id === pr[0]; })[0]; if (c) c.c[pr.slice(1).join('|')] = t.value; }); return; }
      if (t.dataset.cwn) { act('Rename colourway', function () { var c = P.colourways.filter(function (x) { return x.id === t.dataset.cwn; })[0]; if (c) c.name = t.value || c.name; }); return; }
      if (t.dataset.cwsel) { act('Show colourway', function () { P.cw = t.dataset.cwsel; }); } });
    q('#ps-dxf').addEventListener('change', function () { var f = this.files[0]; this.value = ''; if (!f) return; f.text().then(function (t) { importDXF(t, f.name); }); });
    window.addEventListener('beforeunload', function () { if (ST.dirty) autosave(); });
    // in Edit pieces, Pattern Maker's Export menu exports the edited pieces
    var XMAP = { 'pm-dl-svg': 'xsvg', 'pm-dl-dxf': 'xdxf', 'pm-dl-pdf': 'xpdft', 'pm-dl-pdf2': 'xpdf', 'pm-dl-png': 'xpng' };
    document.addEventListener('click', function (e) { if (!ON) return; var b = e.target.closest('[id^=pm-dl-]'); if (!b) return; e.preventDefault(); e.stopImmediatePropagation(); var m = document.getElementById('pm-menu'); if (m) m.hidden = true; var eb = document.getElementById('pm-exp'); if (eb) eb.setAttribute('aria-expanded', 'false'); if (XMAP[b.id]) exportAs(XMAP[b.id]); else toast('This export is made from the draft. Switch to Draft to download it; the edited pieces export as SVG, DXF, PDF and PNG.', 1); }, true);
    // the units switch of Pattern Maker drives the editor too
    document.addEventListener('click', function (e) { if (e.target.closest('#pm-units [data-u]')) setTimeout(function () { P.unit = unitNow(); if (ON) { opts(); refresh(); } }, 0); });
    // collapsing the left panel in edit mode keeps the tools as an icon rail
    var hl = document.getElementById('pm-hidel'); if (hl) hl.addEventListener('click', function () { if (ON) setTimeout(drawView, 30); });
    var hr = document.getElementById('pm-hider'); if (hr) hr.addEventListener('click', function () { if (ON) setTimeout(drawView, 30); });
  }

  /* ---------- Draft and Edit modes ---------- */
  function draftSig() { var S = window.PMUI && PMUI.S && PMUI.S(); if (!S) return ''; return JSON.stringify([S.gid, S.gender, S.size, S.o, S.size === 'custom' ? S.m : 0, S.sa, S.hemA, S.pc, S.adj]); }
  function draftName() { var UI = window.PMUI, last = UI && UI.last && UI.last(), S = UI && UI.S && UI.S(); return ((last && last.r && last.r.label) || 'Draft') + (S ? ' · ' + (S.size === 'custom' ? 'custom' : S.size) : ''); }
  function banner() {
    var b = q('#ps-banner'); if (!b) return; var sig = draftSig(), changed = P.draft && sig && P.draft.sig !== sig && P.pieces.length;
    b.hidden = !changed; if (!changed) return;
    b.innerHTML = '<span>The draft has changed since these pieces were brought in (' + esc(P.draft.name) + ' → ' + esc(draftName()) + ').</span><button type="button" class="ps-b pri" data-a="draftreplace">Replace with the new draft</button><button type="button" class="ps-b" data-a="draftadd">Add it alongside</button><button type="button" class="ps-b" data-a="draftkeep">Keep my edits</button>';
  }
  function setEdit(on) {
    if (on && !build()) return;
    if (!toolsEl) return;
    if (on && document.getElementById('pm-editb') && document.getElementById('pm-editb').getAttribute('aria-pressed') === 'true') document.getElementById('pm-editb').click();
    ON = on; pb.classList.toggle('cad', on); qa('[data-pmode]').forEach(function (b) { b.setAttribute('aria-pressed', (b.dataset.pmode === 'edit') === on); });
    try { localStorage.setItem('pm-mode', on ? 'edit' : 'draft'); } catch (e) {}
    if (!on) { tipEl.hidden = true; if (ST.dirty) autosave(); var z = document.getElementById('pm-zfit'); if (z) setTimeout(function () { z.click(); }, 30); return; }
    P.unit = unitNow();
    if (!started) { started = true; var a = ls(AUTO);
      if (a && a.p && a.p.pieces && a.p.pieces.length) { H.swap(C.clone(a.p)); P.unit = unitNow(); ST.dirty = true; setTimeout(function () { toast('Your last edits were restored. File › Save keeps them as a project.'); }, 200); }
      else if (window.PMUI && PMUI.last && PMUI.last()) bringDraft('new', true);
      setTool(ST.tool); requestAnimationFrame(function () { fit(); banner(); }); return; }
    setTool(ST.tool); banner(); requestAnimationFrame(drawView);
  }
  function bringDraft(how, quiet) {
    var UI = window.PMUI, last = UI && UI.last && UI.last(); if (!last || !last.r) return toast('Choose a garment in Draft first.', 1);
    var s = UI.S(), pcs = C.fromDraft(last.r, { size: s.size === 'custom' ? 'Custom' : s.size, sa: s.sa, hem: s.hemA, dept: s.gender });
    var x = 0, keep = []; pcs.forEach(function (pc, i) { var st = (s.pc || {})[last.r.pieces[i].id] || {}; if (st.on === false) return; if (st.sa != null) pc.sa.def = st.sa; if (st.hem != null) pc.sa.hem = st.hem; if (st.name) pc.name = st.name; var b = C.bbox(pc); pc.x = x - b[0] + 2; pc.y = 2 - b[1]; x += b[2] - b[0] + 5; keep.push(pc); }); pcs = keep;
    var info = { sig: draftSig(), name: draftName() };
    var doIt = function () {
      if (how === 'add') { var bx = 0; P.pieces.forEach(function (p) { var b = bboxW(p); bx = Math.max(bx, b[3]); }); pcs.forEach(function (pc) { pc.y += bx + 6; }); }
      if (how === 'replace' || how === 'new') P.pieces = [];
      pcs.forEach(function (pc) { P.pieces.push(pc); }); P.draft = info; if (how !== 'add' && (P.name === 'Untitled pattern' || how === 'new')) P.name = info.name; ST.sel = []; ST.node = ST.seg = ST.notch = ST.it = null; };
    if (quiet) { doIt(); refresh(); return; }
    act(how === 'replace' ? 'Replace with the new draft' : 'Bring in the draft', doIt); fit(); banner();
    var bad = pcs.filter(function (p) { return C.validate(p).length; }); toast(pcs.length + ' pieces brought in' + (bad.length ? '. ' + bad.length + ' need a look: see the ! in Pieces.' : '.'));
  }
  function initMode() { var want = false; try { want = localStorage.getItem('pm-mode') === 'edit'; } catch (e) {} if (!want) return; var n = 0, t = setInterval(function () { n++; var a = document.getElementById('pm-app'); if (a && !a.hidden && window.PMUI && PMUI.last && PMUI.last()) { clearInterval(t); setEdit(true); } else if (n > 80) clearInterval(t); }, 250); }
  function addModes() { if (!build()) return; qa('[data-pmode]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.pmode === 'draft'); }); initMode(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(addModes, 60); }); else setTimeout(addModes, 60);

  /* ---------- styles (Pattern Maker's dark workspace; the canvas is a cutting table with paper pieces) ---------- */
  var css = document.createElement('style');
  css.textContent = [
    '.ps-tools,.ps-bar,.ps-center,.ps-side{display:none}',
    '.ps-modes{display:inline-flex;background:var(--bg);border:1px solid var(--ln);border-radius:4px;padding:1px;margin:0 4px}.ps-modes button{border:0;background:none;color:var(--mu);font:600 11.5px "DM Sans",sans-serif;padding:3px 9px;border-radius:3px;cursor:pointer;white-space:nowrap}.ps-modes button[aria-pressed=true]{background:var(--ac);color:#1b1d20}.ps-modes button:hover:not([aria-pressed=true]){color:var(--tx)}',
    '.pbody.cad{grid-template-columns:200px minmax(0,1fr) 320px}',
    '.pbody.cad .pl>:not(.ps-tools),.pbody.cad .pr>:not(.ps-side),.pbody.cad .pc>.stg,.pbody.cad .pc>.sbar,.pbody.cad #pm-edpanel{display:none!important}',
    '.pbody.cad .ctl>:not(.pside):not(.ps-modes):not(.ps-bar):not(#pm-3db){display:none!important}',
    '.pbody.cad .ps-tools{display:block;padding:6px 6px 20px}.pbody.cad .ps-bar{display:flex;align-items:center;gap:1px;flex:1;min-width:0;flex-wrap:nowrap;overflow:hidden}.ps-bar .ps-mb{padding:0 7px}.pbody.cad .ps-center{display:flex;flex-direction:column;flex:1;min-height:0;position:relative}.pbody.cad .ps-side{display:block}',
    '@media (min-width:981px){.pbody.cad.nol{grid-template-columns:48px minmax(0,1fr) 320px}.pbody.cad.nor{grid-template-columns:200px minmax(0,1fr)}.pbody.cad.nol.nor{grid-template-columns:48px minmax(0,1fr)}.pbody.cad.nol .pl{display:block}',
    ' .pbody.cad.nol .ps-tb span,.pbody.cad.nol .ps-tb kbd,.pbody.cad.nol .ps-tg small,.pbody.cad.nol #ps-tsearch{display:none}.pbody.cad.nol .ps-tb{justify-content:center;padding:0}.pbody.cad.nol .ps-tools{padding:4px 3px}}',
    '#ps-tsearch{width:100%;box-sizing:border-box;background:var(--bg);border:1px solid var(--ln);color:var(--tx);border-radius:4px;padding:5px 7px;font:12px "DM Sans",sans-serif;margin-bottom:4px}',
    '.ps-tg{padding:5px 0 3px;border-top:1px solid var(--ln)}.ps-tg:first-of-type{border-top:0}.ps-tg small{display:block;font:600 9.5px "DM Sans",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);padding:2px 6px 3px}',
    '.ps-tb{display:flex;align-items:center;gap:8px;width:100%;height:28px;padding:0 6px;border:1px solid transparent;border-radius:4px;background:none;color:var(--mu);font:12.5px "DM Sans",sans-serif;text-align:left;cursor:pointer}.ps-tb span{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ps-tb kbd{font:600 10px ui-monospace,Menlo,monospace;color:var(--dim)}',
    '.ps-tb:hover{background:var(--p2);color:var(--tx)}.ps-tb[aria-pressed=true]{background:var(--p3);border-color:var(--ln);color:var(--tx)}.ps-tb[aria-pressed=true] svg{stroke:var(--ac)}',
    '.ps-tb svg,.ps-bar svg,.ps-modes svg{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.ps-bar .ps-mb svg{width:12px;height:12px}',
    '.ps-menu{position:relative}.ps-dd{position:fixed;overflow:auto;min-width:260px;background:var(--p2);color:var(--tx);border:1px solid var(--ln);border-radius:6px;box-shadow:0 12px 30px rgba(0,0,0,.45);padding:5px;z-index:1500}',
    '.ps-dd button{display:flex;justify-content:space-between;gap:12px;width:100%;text-align:left;background:none;border:0;color:var(--tx);padding:6px 9px;border-radius:4px;cursor:pointer;font:12.5px "DM Sans",sans-serif}.ps-dd button:hover{background:var(--p3)}.ps-dd kbd{font:11px ui-monospace,Menlo,monospace;color:var(--dim)}.ps-dd hr{border:0;border-top:1px solid var(--ln);margin:4px 0}.ps-dd label{display:flex;gap:8px;align-items:center;padding:5px 9px;cursor:pointer;font:12.5px "DM Sans",sans-serif}',
    '.ps-zl{min-width:50px;font:600 12px ui-monospace,Menlo,monospace!important;color:var(--tx)!important}',
    '.ps-bar .ps-name{background:var(--bg);border:1px solid var(--ln);color:var(--tx);border-radius:4px;padding:3px 8px;flex:0 1 200px;width:200px;min-width:80px;height:24px;box-sizing:border-box;font:12.5px "DM Sans",sans-serif;margin:0 0 0 2px}',
    '.ps-saved{flex:0 1 auto;min-width:0;font:11px "DM Sans",sans-serif;color:var(--dim);white-space:nowrap;margin-left:6px;overflow:hidden;text-overflow:ellipsis}',
    '.ps-banner{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:6px 10px;background:#3a3226;border-bottom:1px solid #121315;color:#f0d9b8;font:12.5px "DM Sans",sans-serif}.ps-banner[hidden]{display:none}.ps-banner span{flex:1 1 280px}',
    '.ps-opts{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:5px 10px;background:var(--p1);border-bottom:1px solid #121315;min-height:32px;box-sizing:border-box;font:12px "DM Sans",sans-serif;color:var(--mu)}.ps-opts b{color:var(--tx);font-weight:600}.ps-opts small{color:var(--mu);font-size:12px}.ps-opts label{display:flex;align-items:center;gap:5px}.ps-opts em.bad{color:#ff8a7a;font-style:normal}',
    '.ps-stage{position:relative;flex:1;min-height:0;display:grid;grid-template-columns:22px minmax(0,1fr);grid-template-rows:22px minmax(0,1fr)}.ps-center.noru .ps-stage{grid-template-columns:0 minmax(0,1fr);grid-template-rows:0 minmax(0,1fr)}.ps-center.noru canvas,.ps-center.noru .ps-corner{display:none}',
    '.ps-rx{grid-column:2;grid-row:1;width:100%;height:22px;display:block;border-bottom:1px solid #121315}.ps-ry{grid-column:1;grid-row:2;width:22px;height:100%;display:block;border-right:1px solid #121315}.ps-corner{grid-column:1;grid-row:1;background:var(--p1);font:600 9px ui-monospace,Menlo,monospace;display:grid;place-items:center;color:var(--dim);border-right:1px solid #121315;border-bottom:1px solid #121315}',
    '#ps-svg{grid-column:2;grid-row:2;width:100%;height:100%;display:block;background:var(--stage);outline:0;touch-action:none;cursor:default;user-select:none;-webkit-user-select:none}',
    '#ps-svg[data-tool=poly],#ps-svg[data-tool=rect],#ps-svg[data-tool=ellipse],#ps-svg[data-tool=measure],#ps-svg[data-tool=iline],#ps-svg[data-tool=irect],#ps-svg[data-tool=iell],#ps-svg[data-tool=grain],#ps-svg[data-tool=spiral],#ps-svg[data-tool=cut],#ps-svg[data-tool=notch],#ps-svg[data-tool=addpt]{cursor:crosshair}#ps-svg[data-tool=pan]{cursor:grab}',
    '#ps-world *,#ps-grid *,#ps-over *{vector-effect:non-scaling-stroke}',
    '#ps-grid .gm{stroke:rgba(255,255,255,.045);stroke-width:1}#ps-grid .gM{stroke:rgba(255,255,255,.1);stroke-width:1}#ps-grid .g0{stroke:rgba(224,138,94,.35);stroke-width:1}',
    '.ps-fab{fill-opacity:.55;stroke:none;pointer-events:none}.ps-paper{stroke:none!important}.ps-cut{fill:var(--paper);stroke:#1c1f22;stroke-width:1.5}.ps-seam{fill:none;stroke:#6b7178;stroke-width:1;stroke-dasharray:5 3}.ps-seam.solo{fill:none;stroke:#1c1f22;stroke-dasharray:none;stroke-width:1.5}.ps-seam.nos{stroke:none}',
    '.ps-pc.sel .ps-cut{fill:#fff3ea;stroke:#c45f2f;stroke-width:2}.ps-pc.sel .ps-seam.solo{stroke:#c45f2f;stroke-width:2}.ps-pc.bad .ps-cut,.ps-pc.bad .ps-seam.solo{stroke:#d6452f;stroke-width:2}.ps-pc.lock{opacity:.8}',
    '.ps-fold{fill:none;stroke:#c45f2f;stroke-width:2;stroke-dasharray:10 3 2 3}',
    '.ps-int{fill:none;stroke:#2f6690;stroke-width:1.2}.ps-int.dash{stroke-dasharray:6 4}.ps-int.cutout{stroke:#d6452f}.ps-int.fold{stroke:#c45f2f}.ps-int.on{stroke-width:2.6}',
    '.ps-notch{fill:none;stroke:#1c1f22;stroke-width:1.6}.ps-notch.on{stroke:#c45f2f;stroke-width:3}',
    '.ps-grain{fill:none;stroke:#1c1f22;stroke-width:1.1}',
    '.ps-lab{fill:#1c1f22;text-anchor:middle;font-weight:600;font-family:"DM Sans",sans-serif;pointer-events:none}.ps-lab2{fill:#5b6168;text-anchor:middle;font-family:"DM Sans",sans-serif;pointer-events:none}.ps-link{fill:#e08a5e;font-family:"DM Sans",sans-serif;pointer-events:none}',
    '.ps-eh{fill:none;stroke:transparent;stroke-width:12;cursor:pointer;pointer-events:stroke}.ps-eh:hover{stroke:rgba(224,138,94,.35)}.ps-eon{fill:none;stroke:#e08a5e;stroke-width:3.2;pointer-events:none}',
    '#ps-pts .ps-pt{fill:#fff;stroke:#1c1f22;stroke-width:1.4;cursor:move}#ps-pts .ps-pt.on{fill:#e08a5e;stroke:#7a3412}#ps-pts .ps-pt.fa{fill:rgba(255,255,255,.75);stroke:#5b6168;stroke-width:1}#ps-pts .ps-pt:hover{stroke:#e08a5e;stroke-width:2}',
    '#ps-pts .ps-hl{stroke:#2f6690;stroke-width:1;pointer-events:none}#ps-pts .ps-hd{fill:#2f6690;stroke:#fff;stroke-width:1.2;cursor:pointer}#ps-pts .ps-hd:hover{fill:#e08a5e}',
    '.ps-dr{fill:rgba(224,138,94,.12);stroke:#e08a5e;stroke-width:1.5;stroke-dasharray:5 3}.ps-dpt{fill:#fff;stroke:#e08a5e;stroke-width:1.2}.ps-dpt.on{fill:#e08a5e}.ps-marq{fill:rgba(111,191,142,.08);stroke:#6fbf8e;stroke-width:1;stroke-dasharray:4 3}',
    '.ps-ms{fill:none;stroke:#6fbf8e;stroke-width:1.8}.ps-msp{fill:#6fbf8e}.ps-mt{fill:#1b1d20;font-weight:700;font-family:ui-monospace,Menlo,monospace;paint-order:stroke;stroke:#bfe8cf;stroke-width:4px;text-anchor:middle}',
    '#ps-pts .ps-snap{fill:none;stroke:#6fbf8e;stroke-width:2;pointer-events:none}#ps-pts .ps-sk{fill:#bfe8cf;font:600 10.5px "DM Sans",sans-serif;paint-order:stroke;stroke:#1b1d20;stroke-width:3px;pointer-events:none}',
    '#ps-pts .ps-live{pointer-events:none}#ps-pts .ps-live rect{fill:#1b1d20;stroke:#e08a5e;stroke-width:1;opacity:.94}#ps-pts .ps-live text{fill:#f3efe8;font:600 11.5px ui-monospace,Menlo,monospace}',
    '.ps-toast{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);background:#121315;color:#f3efe8;border:1px solid var(--ln);padding:8px 14px;border-radius:6px;max-width:min(560px,90%);box-shadow:0 8px 24px rgba(0,0,0,.45);z-index:20;margin:0;font:13px/1.45 "DM Sans",sans-serif;pointer-events:none}.ps-toast.bad{border-color:#d6452f;background:#3a1a16}',
    '.ps-foot{display:flex;align-items:center;gap:8px;padding:3px 8px;border-top:1px solid #121315;background:var(--bg);min-width:0}.ps-foot .ps-status{flex:1;min-width:0;border:0;padding:0}.ps-foot .ps-name{flex:0 0 170px;width:170px;height:22px;box-sizing:border-box;background:var(--p1);border:1px solid var(--ln);color:var(--tx);border-radius:4px;padding:2px 7px;font:12px "DM Sans",sans-serif}.ps-foot .ps-saved{flex:none;font:11px "DM Sans",sans-serif;color:var(--dim)}',
    '.ps-status{display:flex;gap:14px;align-items:center;padding:4px 10px;border-top:1px solid #121315;background:var(--bg);font:11px ui-monospace,Menlo,monospace;color:var(--mu);white-space:nowrap;overflow:hidden}.ps-status b{color:var(--tx);font-weight:600}.ps-status .ps-hint{overflow:hidden;text-overflow:ellipsis;font-family:"DM Sans",sans-serif;font-size:11.5px}.ps-status .xy{color:var(--ac2)}.ps-sp{flex:1}',
    '.ps-side{color:var(--tx);font:13px "DM Sans",sans-serif}.ps-sec{border-bottom:1px solid #121315}.ps-sec>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:6px;padding:9px 12px;font:600 10.5px "DM Sans",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--mu);background:var(--p1);position:sticky;top:0;z-index:2}.ps-sec>summary::-webkit-details-marker{display:none}.ps-sec>summary::after{content:"";margin-left:auto;width:7px;height:7px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(45deg);transition:transform .15s}.ps-sec:not([open])>summary::after{transform:rotate(-45deg)}.ps-sec>summary span{color:var(--dim);letter-spacing:0}',
    '#ps-objs{padding:4px 8px;max-height:34vh;overflow:auto}#ps-props{padding:4px 12px 24px}',
    '.ps-ob{display:flex;align-items:center;gap:4px;padding:3px 5px;border-radius:4px;cursor:pointer;color:var(--mu)}.ps-ob:hover{background:var(--p2);color:var(--tx)}.ps-ob.on{background:var(--p3);color:var(--tx);box-shadow:inset 2px 0 0 var(--ac)}.ps-on{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px}.ps-on i{font-style:normal;color:#ff8a7a;font-weight:700}.ps-on i.lk{color:var(--ac)}',
    '.ps-eye,.ps-lk{background:none;border:0;cursor:pointer;width:20px;padding:0;font-size:11px;color:var(--mu)}',
    '.ps-obs{margin:0 0 4px 24px;font-size:12px}.ps-obs div{padding:2px 6px;border-radius:3px;cursor:pointer;color:var(--mu)}.ps-obs div.on{background:var(--p3);color:var(--tx)}',
    '.ps-objb{display:flex;gap:5px;padding:4px 8px 10px}.ps-objb .ps-b{flex:1}',
    '.ps-empty{color:var(--mu);font-size:12px;margin:6px 0}',
    '#ps-props h5{margin:14px 0 6px;font:600 10px "DM Sans",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--ac)}#ps-props h5:first-child{margin-top:6px}',
    '.ps-r{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:5px 0}.ps-r>span:first-child{color:var(--mu);font-size:12px}.ps-r.wide{flex-direction:column;align-items:stretch}',
    '.ps-side input:not([type=checkbox]),.ps-side select,.ps-side textarea,.ps-opts input,.ps-opts select,.ps-mbox input,.ps-mbox select{font:12.5px "DM Sans",sans-serif;padding:4px 6px;border:1px solid var(--ln);border-radius:4px;background:var(--bg);color:var(--tx);max-width:150px;box-sizing:border-box}.ps-r.wide input,.ps-r.wide textarea{max-width:none;width:100%}',
    '.ps-side input:focus,.ps-side select:focus,.ps-opts input:focus{outline:0;border-color:var(--ac)}',
    '.ps-u{display:inline-flex;align-items:center;border:1px solid var(--ln);border-radius:4px;background:var(--bg)}.ps-u input{border:0!important;width:76px;padding:4px 6px;background:none!important;text-align:right;font-variant-numeric:tabular-nums}.ps-u i{font-style:normal;color:var(--dim);font-size:10.5px;padding-right:6px}',
    '.ps-bs{display:flex;flex-wrap:wrap;gap:5px;margin:7px 0}.ps-b{background:var(--p2);border:1px solid var(--ln);border-radius:4px;padding:4px 9px;cursor:pointer;font:12px "DM Sans",sans-serif;color:var(--tx)}.ps-b:hover{border-color:var(--mu)}.ps-b.pri{background:var(--ac);color:#1b1d20;border-color:var(--ac);font-weight:600}.ps-b.bad{color:#ff8a7a}',
    '.ps-tr{display:flex;gap:5px;align-items:center;margin:6px 0}',
    '.ps-n{color:var(--mu);font-size:12px;line-height:1.45;margin:6px 0}',
    '.ps-kv{display:grid;grid-template-columns:1fr auto;gap:4px 10px;margin:4px 0;font-size:12px}.ps-kv dt{color:var(--mu)}.ps-kv dd{margin:0;text-align:right;font:600 12px ui-monospace,Menlo,monospace;color:var(--tx)}',
    '.ps-kb{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;font-size:12px}.ps-kb dt{font:600 11px ui-monospace,Menlo,monospace;color:var(--tx)}.ps-kb dd{margin:0;color:var(--mu)}',
    '.ps-chips{display:flex;flex-wrap:wrap;gap:4px}.ps-chips label{display:flex;gap:3px;align-items:center;font-size:11px;border:1px solid var(--ln);border-radius:10px;padding:1px 7px;background:var(--bg);color:var(--mu)}',
    '.ps-warn{background:#3a1a16;border:1px solid #7a2c22;border-radius:5px;padding:4px 8px;margin:6px 0}.ps-warn p{margin:4px 0;color:#ffb4a8;font-size:12px}',
    '.ps-check{padding:6px 8px;border-radius:5px;font-size:12px}.ps-check.ok{background:#1d3a2a;color:#9fe0b8}.ps-check.no{background:#3a3020;color:#f0d29b}',
    '.ps-modal{position:fixed;inset:0;background:rgba(10,11,12,.6);display:grid;place-items:center;z-index:2000}.ps-modal[hidden]{display:none}.ps-mbox{background:var(--p1,#212428);color:var(--tx,#e8e6e1);border:1px solid var(--ln,#3a3f46);border-radius:8px;padding:16px 18px;width:min(540px,92vw);max-height:80vh;overflow:auto;box-shadow:0 20px 50px rgba(0,0,0,.55);font:13px/1.5 "DM Sans",sans-serif}.ps-mbox h4{margin:0 0 8px;font-size:15px}.ps-mbox p{margin:6px 0}',
    '.ps-host{--bg:#1b1d20;--p1:#212428;--p2:#2a2e33;--p3:#33383e;--ln:#3a3f46;--tx:#e8e6e1;--mu:#9da3aa;--dim:#6f757c;--ac:#e08a5e}',
    '.ps-list>div{display:flex;gap:6px;margin:5px 0}.ps-list .ps-b:first-child{flex:1;text-align:left;display:flex;flex-direction:column}.ps-list small{color:var(--mu)}',
    '.ps-tab{width:100%;border-collapse:collapse;font-size:12px;margin:8px 0}.ps-tab th,.ps-tab td{border-bottom:1px solid var(--ln);padding:4px;text-align:left}',
    '.ps-tabs{display:flex;flex-wrap:nowrap;gap:0;padding:4px 4px 0;background:var(--p1);border-bottom:1px solid #121315;position:sticky;top:0;z-index:3}.ps-tabs button{flex:1 1 0;min-width:0;border:0;background:none;color:var(--mu);font:600 11px "DM Sans",sans-serif;padding:7px 1px;overflow:hidden;text-overflow:ellipsis;border-bottom:2px solid transparent;cursor:pointer;white-space:nowrap}.ps-tabs button[aria-selected=true]{color:var(--tx);border-bottom-color:var(--ac)}.ps-tabs button:hover{color:var(--tx)}',
    '.ps-pane{padding:6px 8px;max-height:42vh;overflow:auto;border-bottom:1px solid #121315}',
    '.ps-dot{width:9px;height:9px;border-radius:50%;flex:none;margin:0 3px}.ps-sw2{display:inline-block;width:12px;height:12px;border-radius:3px;flex:none;border:1px solid rgba(255,255,255,.25);vertical-align:-2px;margin:0 3px}',
    '.ps-ob em{font:600 11px ui-monospace,Menlo,monospace;font-style:normal;color:var(--mu);white-space:nowrap}.ps-ob em.ok{color:#8fd6a8}.ps-ob em.no{color:#ffb07a}',
    '.ps-grp{font:600 10px "DM Sans",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);padding:8px 5px 3px}.ps-grp span{color:var(--ac);letter-spacing:0}',
    '.ps-lib{padding:4px 0}.ps-lib select{width:100%;max-width:none!important}',
    '.ps-cwt{overflow:auto}.ps-cwt table{border-collapse:collapse;font-size:12px;min-width:100%}.ps-cwt th,.ps-cwt td{padding:3px 4px;border-bottom:1px solid var(--ln);text-align:left}.ps-cwt td:first-child{max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--mu)}.ps-cwt input[type=color]{width:34px;height:22px;padding:0;border:1px solid var(--ln);background:none;border-radius:3px;cursor:pointer}.ps-cwh{display:flex;align-items:center;gap:4px}.ps-cwh input[type=text]{width:84px;max-width:84px!important;padding:2px 4px!important}',
    '.ps-bomr{display:grid;grid-template-columns:62px 1fr auto;gap:6px;padding:5px 2px;border-bottom:1px solid var(--ln);font-size:12px}.ps-bomr b{color:var(--ac);font:600 10px "DM Sans",sans-serif;text-transform:uppercase;letter-spacing:.06em;padding-top:2px}.ps-bomr small{display:block;color:var(--mu);font-size:11px;line-height:1.35}.ps-bomr em{font:600 12px ui-monospace,Menlo,monospace;font-style:normal;white-space:nowrap}',
    '.ps-dd button svg{width:15px;height:15px;flex:none;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.ps-dd button>i{width:15px;flex:none}.ps-dd button span{flex:1}.ps-dd button{justify-content:flex-start;align-items:center}',
    '#ps-world .ps-sw{fill:none;stroke-width:4;stroke-linecap:round;opacity:.85;cursor:pointer}#ps-world .ps-sw.on{stroke-width:7;opacity:1}',
    '#ps-world .ps-band,#ps-world .ps-ts,#ps-world .ps-zip,#ps-world .ps-bh,#ps-world .ps-hole path,#ps-world .ps-btn circle,#ps-world .ps-zpull{vector-effect:none}',
    '.ps-band{fill:none;stroke-linecap:butt;opacity:.7;cursor:pointer}.ps-tape{opacity:.55}.ps-ts{fill:none;stroke-linecap:butt;cursor:pointer}.ps-zip{fill:none;stroke:#9aa0a6}.ps-zipt{fill:none;opacity:.35}.ps-zpull{fill:#9aa0a6;stroke:#1c1f22;stroke-width:.05}',
    '.ps-puk{fill:none;stroke:#7a6a5a;stroke-width:1.2;cursor:pointer}.ps-btn{cursor:move}.ps-btn circle:first-child{stroke:#1c1f22;stroke-width:.05}.ps-bh{fill:#1c1f22;opacity:.6}.ps-hole{cursor:move}',
    '.ps-gfx{cursor:move}.ps-gfx .ps-gb{fill:none;stroke:transparent;stroke-width:1}.ps-gfx:hover .ps-gb,.ps-gfx[data-on] .ps-gb{stroke:#e08a5e;stroke-dasharray:4 3}',
    '[data-tr][data-on] {filter:drop-shadow(0 0 1.5px #e08a5e)}',
    '.ps-dh{stroke:#2f8fd8;stroke-width:1;fill:none}.ps-dhc{fill:#2f8fd8;stroke:#fff;stroke-width:1}',
    '.ps-ctx{position:fixed;z-index:2050;min-width:230px;max-width:320px;background:#2a2e33;color:#e8e6e1;border:1px solid #3a3f46;border-radius:6px;box-shadow:0 14px 34px rgba(0,0,0,.5);padding:4px;font:12.5px "DM Sans",sans-serif;max-height:80vh;overflow:auto}.ps-ctxh{padding:5px 9px 6px;color:#e08a5e;font:600 10.5px "DM Sans",sans-serif;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid #3a3f46;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ps-ctx button{display:flex;justify-content:space-between;gap:12px;width:100%;background:none;border:0;color:inherit;text-align:left;padding:5px 9px;border-radius:4px;cursor:pointer;font:inherit}.ps-ctx button:hover:not(:disabled){background:#33383e}.ps-ctx button:disabled{opacity:.4;cursor:default}.ps-ctx kbd{font:11px ui-monospace,Menlo,monospace;color:#6f757c}.ps-ctx hr{border:0;border-top:1px solid #3a3f46;margin:3px 0}',
    '#ps-pts .ps-hov{fill:none;stroke:#e08a5e;stroke-width:3;opacity:.75;pointer-events:none}#ps-pts .ps-elab rect{stroke:#6f757c}',
    '#ps-pts .ps-xfb{fill:none;stroke:#e3b341;stroke-width:1;stroke-dasharray:5 3;pointer-events:none}#ps-pts .ps-xfl{stroke:#e3b341;stroke-width:1;pointer-events:none}#ps-pts .ps-xfh{fill:#fff;stroke:#7a5a10;stroke-width:1.2;cursor:nwse-resize}#ps-pts .ps-xfh[data-xf=n],#ps-pts .ps-xfh[data-xf=s]{cursor:ns-resize}#ps-pts .ps-xfh[data-xf=e],#ps-pts .ps-xfh[data-xf=w]{cursor:ew-resize}#ps-pts .ps-xfh[data-xf=ne],#ps-pts .ps-xfh[data-xf=sw]{cursor:nesw-resize}#ps-pts .ps-xfr{fill:#e3b341;stroke:#7a5a10;stroke-width:1.2;cursor:grab}#ps-pts .ps-xfp circle{fill:rgba(227,179,65,.15);stroke:#e3b341;stroke-width:1.2;cursor:move}#ps-pts .ps-xfp path{stroke:#e3b341;stroke-width:1;pointer-events:none}',
    '.ps-tip{position:fixed;z-index:2100;max-width:260px;background:#121315;color:#e8e6e1;border:1px solid #3a3f46;padding:7px 9px;border-radius:5px;font:12px/1.45 "DM Sans",sans-serif;pointer-events:none;box-shadow:0 6px 18px rgba(0,0,0,.45)}',
    '@media (max-width:980px){.pbody.cad{grid-template-columns:1fr}.pbody.cad .pc{height:72vh;height:72svh}.pbody.cad .ps-tools{display:flex;flex-wrap:wrap;gap:2px}.pbody.cad .ps-tg{display:flex;flex-wrap:wrap;border:0;padding:0}.pbody.cad .ps-tg small,.pbody.cad #ps-tsearch,.pbody.cad .ps-tb span,.pbody.cad .ps-tb kbd{display:none}.pbody.cad .ps-tb{width:38px;height:38px;justify-content:center;padding:0}.ps-name,.ps-saved{display:none}}'
  ].join('\n');
  document.head.appendChild(css);

  window.PMEdit = window.FCStudio = { open: function () { setEdit(true); }, close: function () { setEdit(false); }, setEdit: setEdit, geo: geo, snap: snap, nearestEdge: nearestEdge, P: function () { return P; }, H: H, act: act, setTool: setTool, ST: ST, fit: fit, importDXF: importDXF, parseDXF: parseDXF, scene: scene, fromDraft: fromDraft };
})();
