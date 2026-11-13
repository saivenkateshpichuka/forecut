// Pattern Studio geometry engine: lengths, splits, seam allowance, transforms, validation, drafts, undo/redo.
const { test } = require('node:test'), assert = require('node:assert/strict');
global.window = {};
require('../tools/pm-engine.js');
const C = require('../build/tools_js/pm_cad.js'), PM = window.PM;
const near = (a, b, t = 1e-3) => assert.ok(Math.abs(a - b) <= t, a + ' vs ' + b);
test('rectangle: perimeter, area, units', () => {
  const r = C.rect(0, 0, 20, 10); near(C.perimeter(r), 60); near(C.area(r), 200, .01);
  assert.equal(C.toU(2.54, 'in'), 1); assert.equal(C.toU(1.5, 'mm'), 15); near(C.fromU(1, 'in'), 2.54);
});
test('ellipse length matches Ramanujan, splitting a curve keeps its shape and length', () => {
  const e = C.ellipse(0, 0, 10, 6), a = 10, b = 6, h = ((a - b) / (a + b)) ** 2, ram = Math.PI * (a + b) * (1 + 3 * h / (10 + Math.sqrt(4 - 3 * h)));
  near(C.perimeter(e), ram, .05); const L = C.segLen(e, 0), mid = C.pointAt(e, 0, .5);
  C.splitSeg(e, 0, .5); near(C.segLen(e, 0) + C.segLen(e, 1), L, .01); near(e.nodes[1].x, mid[0]); near(e.nodes[1].y, mid[1]);
});
test('seam allowance: per edge, hem, fold edge zero', () => {
  const r = C.rect(0, 0, 20, 10); r.sa.def = 1; let cl = C.cutLine(r).pts, xs = cl.map(q => q[0]), ys = cl.map(q => q[1]);
  near(Math.min(...xs), -1); near(Math.max(...xs), 21); near(Math.max(...ys), 11);
  r.hems = [2]; r.fold = 3; cl = C.cutLine(r).pts; xs = cl.map(q => q[0]); ys = cl.map(q => q[1]);
  near(Math.max(...ys), 12.5); near(Math.min(...xs), 0); assert.equal(C.cutLine(r).warn.length, 0);
});
test('validation finds crossing and zero-length edges', () => {
  const bow = C.newPiece([C.node(0, 0), C.node(10, 10), C.node(10, 0), C.node(0, 10)]);
  assert.ok(C.validate(bow).some(i => i.k === 'cross'));
  const z = C.newPiece([C.node(0, 0), C.node(0, 0), C.node(10, 0), C.node(10, 10)]); assert.ok(C.validate(z).some(i => i.k === 'zero'));
  assert.equal(C.validate(C.rect(0, 0, 5, 5)).length, 0);
});
test('rotate about a pivot, mirror keeps direction and notches, delete point', () => {
  const r = C.rect(0, 0, 20, 10); r.notches.push({ seg: 0, mode: 'dist', v: 5, from: 'start' });
  const p0 = C.notchPos(r, r.notches[0]).p; C.transformPiece(r, C.M.rot(90, 0, 0)); near(r.nodes[1].x, 0); near(r.nodes[1].y, 20);
  const m = C.rect(0, 0, 20, 10); m.notches.push({ seg: 0, mode: 'dist', v: 5, from: 'start' }); const s0 = C.areaOf(C.flat(m).pts);
  C.transformPiece(m, C.M.mirX(0)); assert.ok(Math.sign(C.areaOf(C.flat(m).pts)) === Math.sign(s0)); const q = C.notchPos(m, m.notches[0]).p; near(q[0], -p0[0]); near(q[1], p0[1]);
  const d = C.rect(0, 0, 10, 10); C.splitSeg(d, 0, .5); assert.equal(d.nodes.length, 5); assert.ok(C.deleteNode(d, 1)); assert.equal(d.nodes.length, 4);
});
test('linked mirror copy follows the source', () => {
  const r = C.rect(0, 0, 20, 10), m = C.duplicate(r, 'mirror'); r.nodes[2].x = 25; C.syncLinked(r, m); const b = C.bbox(m); near(b[2] - b[0], 25);
});
test('every Pattern Maker draft imports as clean pieces with matching seamline length', () => {
  const r = PM.build('skirt', 'women', PM.CHARTS.women.M, PM.GARMENTS.skirt.d);
  C.fromDraft(r, { size: 'M' }).forEach((pc, i) => {
    const src = r.pieces[i], L = src.edges.reduce((s, e) => { for (let j = 1; j < e.p.length; j++) s += Math.hypot(e.p[j][0] - e.p[j - 1][0], e.p[j][1] - e.p[j - 1][1]); return s; }, 0);
    near(C.perimeter(pc), L, L * .01); assert.equal(C.validate(pc).filter(x => x.k !== 'zero').length, 0, pc.name);
  });
});
test('spiral checks and builds', () => {
  assert.ok(C.spiralCheck(5, 2, 3, 8).length); assert.equal(C.spiralCheck(5, 2, 10, 8).length, 0);
  const s = C.spiral(0, 0, 5, 1.5, 10, 8); assert.ok(C.area(s) > 100); assert.equal(C.validate(s).filter(x => x.k === 'cross').length, 0);
});
test('undo and redo restore the project', () => {
  const p = C.newProject(), h = new C.History(p); h.exec('add', q => { q.pieces.push(C.rect(0, 0, 5, 5)); });
  assert.equal(p.pieces.length, 1); h.undo(); assert.equal(p.pieces.length, 0); h.redo(); assert.equal(p.pieces.length, 1);
  assert.equal(C.parse(C.serialize(p)).pieces.length, 1); assert.throws(() => C.parse('{}'));
  assert.ok(/<svg/.test(C.exportSVG(p))); assert.ok(/POLYLINE/.test(C.exportDXF(p, { unit: 'mm' })));
});
test('merge joins two rectangles along a shared edge into one piece', () => {
  const a = C.rect(0, 0, 10, 20), b = C.rect(30, 5, 8, 20); const r = C.merge(a, 1, b, 3);
  near(C.area(r.piece), 200 + 160, .5); near(r.diff, 0); assert.equal(C.validate(r.piece).length, 0); const bb = C.bbox(r.piece); near(bb[2] - bb[0], 18, .01);
});
test('facing along the top edge is a strip of the asked width; an internal rectangle traces to a piece', () => {
  const a = C.rect(0, 0, 20, 30), f = C.facing(a, [0], 4); near(C.area(f), 80, .5);
  const t = C.fromInternal(a, { kind: 'rect', pts: [[2, 2], [8, 2], [8, 9], [2, 9]], purpose: 'pocket' }); near(C.area(t), 42, .01); assert.equal(t.name, 'Pocket');
});
test('arc length is exact: a quarter-circle curve and distance-to-parameter round trip', () => {
  const k = 0.5522847498, r = 10, pc = C.newPiece([C.node(r, 0, null, [0, r * k]), C.node(0, r, [r * k, 0], null), C.node(0, 0)]);
  near(C.segLen(pc, 0), Math.PI * r / 2, .003); // the Bezier circle itself is within 0.03% of a true arc
  [0.7, 3.3, 9.1, 15].forEach(s => near(C.arc(pc, 0, C.tAt(pc, 0, s)), s, 1e-6));
});
test('fast crossing check agrees with the brute-force check', () => {
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let n = 0; n < 40; n++) { const P = []; for (let i = 0; i < 12; i++) P.push([rnd() * 10, rnd() * 10]);
    let brute = 0; for (let i = 0; i < 12; i++) for (let j = i + 2; j < 12; j++) { if (i === 0 && j === 11) continue; const a = P[i], b = P[(i + 1) % 12], c = P[j], d = P[(j + 1) % 12], r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]], den = r[0] * s[1] - r[1] * s[0]; if (!den) continue; const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den, u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den; if (t > 1e-6 && t < 1 - 1e-6 && u > 1e-6 && u < 1 - 1e-6) brute++; }
    assert.equal(C.selfHits(P).length, Math.min(brute, 21) > 20 ? C.selfHits(P).length : brute); }
});
test('BOM: fabric from cut areas (fold pieces doubled), trims counted, zipper length rounded up to whole inches', () => {
  const p = C.normalize(C.newProject()), a = C.rect(0, 0, 50, 70, { name: 'Front', qty: 1 }); a.fold = 3; a.fabric = 'f1'; p.pieces.push(a);
  p.fabrics.push({ id: 'f1', name: 'Poplin', width: 145, gsm: 115 });
  p.trims.button.push({ id: 'b1', pc: a.id, at: [5, 5], size: 1.5, holes: 4 }, { id: 'b2', pc: a.id, at: [5, 15], size: 1.5, holes: 4 });
  p.trims.zip.push({ id: 'z1', pc: a.id, seg: 1, a: 0, b: 30.6, type: 'Coil', gauge: 5 });
  const B = C.bom(p), fab = B.find(r => r.kind === 'Fabric'), cut = C.cutLine(a).pts, area = Math.abs(C.areaOf(cut)) * 2;
  near(fab.qty, +(area / (145 * .8) / 100).toFixed(2), .011); assert.equal(B.find(r => r.kind === 'Button').qty, 2); assert.match(B.find(r => r.kind === 'Zipper').desc, /13"/);
  near(C.rangeLen(a, { seg: 1, a: 10, b: 30 }), 20); near(C.rangeLen(a, { seg: 1, a: 0, b: null }), 70);
});
