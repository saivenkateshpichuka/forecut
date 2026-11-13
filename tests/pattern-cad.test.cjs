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
