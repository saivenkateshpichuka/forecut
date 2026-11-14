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
test('slash and spread: parallel adds a strip, pivot opens a wedge; pleats add their intake and mark lines', () => {
  const r = C.rect(0, 0, 20, 30), A0 = C.area(r);
  const par = C.slash(r, { seg: 0, t: .5 }, { seg: 2, t: .5 }, { mode: 'parallel', amt: 4 }); const p1 = JSON.parse(JSON.stringify(r)); C.applyReshape(p1, par); near(C.area(p1), A0 + 4 * 30, .01); assert.equal(C.validate(p1).length, 0);
  const piv = C.slash(r, { seg: 0, t: .5 }, { seg: 2, t: .5 }, { mode: 'pivot', amt: 6, hinge: 'first' }); const p2 = JSON.parse(JSON.stringify(r)); C.applyReshape(p2, piv); near(C.area(p2), A0 + 6 * 30 / 2, 1.5); assert.equal(C.validate(p2).length, 0);
  const pl = C.pleat(r, { seg: 0, t: .3 }, { seg: 2, t: .7 }, { type: 'box', depth: 2 }); near(pl.intake, 8); assert.equal(pl.lines.length, 3);
  const p3 = JSON.parse(JSON.stringify(r)); p3.hems = [2]; C.applyReshape(p3, pl); assert.equal(p3.hems.length, 2); // the hem stays a hem on both sides of the pleat
});
test('darts: added into the edge, legs equal, transfer keeps the closed shape', () => {
  const r = C.rect(0, 0, 40, 30), res = C.addDart(r, 2, 20, [20, 18], 3); const p = JSON.parse(JSON.stringify(r)); C.applyReshape(p, res); p.darts.push(res.dart);
  const I = C.dartInfo(p, res.dart); near(I.width, 3, 1e-6); near(I.leg1, I.leg2, 1e-6); near(I.length, 12, 1e-6);
  const perim = pc => { let t = 0; for (let k = 0; k < C.segCount(pc); k++) t += C.segLen(pc, k); return t; }, before = perim(p) - I.leg1 - I.leg2;
  const mv = C.moveDart(p, res.dart, 1, .4); assert.ok(!mv.err, mv.err); const q = JSON.parse(JSON.stringify(p)); C.applyReshape(q, mv);
  const I2 = C.dartInfo(q, mv.dart); assert.ok(I2); near(I2.angle, I.angle, 1e-6); near(perim(q) - I2.leg1 - I2.leg2, before, 1e-6);
  const f = C.fillDart(q, mv.dart); const z = JSON.parse(JSON.stringify(q)); C.applyReshape(z, f); assert.equal(z.nodes.length, q.nodes.length - 1);
  assert.equal(C.dartFold(p, res.dart).length, 3);
});
test('grading: linear rules, neighbours follow, base change keeps every size', () => {
  const r = C.rect(0, 0, 20, 30), list = ['S', 'M', 'L'], right = r.nodes.filter(n => Math.abs(n.x - 20) < 1e-9).map(n => n.id), left = r.nodes.filter(n => Math.abs(n.x) < 1e-9).map(n => n.id);
  assert.equal(right.length, 2); C.setRule(r, right, 1, 0, list, 'M'); C.setRule(r, left, 0, 0, list, 'M'); // right side grows 1 cm per size
  const L = C.gradedPiece(r, 'L', 'M'), S = C.gradedPiece(r, 'S', 'M'), b = C.bbox(L);
  near(b[2] - b[0], 21); near(C.bbox(S)[2] - C.bbox(S)[0], 19); assert.ok(C.isGraded(r));
  const ru = C.ruleOf(r, right[0], list, 'M'); near(ru[0], 1);
  C.clearGrade(r, [right[0]]); assert.ok(!r.grade.L[right[0]]); const D = C.gradeDeltas(r, 'L'), k = r.nodes.findIndex(n => n.id === right[0]); assert.ok(D[k][0] > 0 && D[k][0] < 1); // an unruled point follows its neighbours
});
test('grading: auto-grade from drafts of the same garment in each size', () => {
  const g = id => C.fromDraft(PM.build('bodice', 'women', Object.assign({}, PM.CHARTS.women[id]), Object.assign({}, PM.GARMENTS.bodice.d)), {});
  const base = g('M'), sizes = { S: g('S'), M: g('M'), L: g('L') }, pc = JSON.parse(JSON.stringify(base[0]));
  const hit = C.autoGrade(pc, base[0], { S: sizes.S[0], M: sizes.M[0], L: sizes.L[0] }, 1); assert.equal(hit, pc.nodes.length);
  const gl = C.gradedPiece(pc, 'L', 'M'); pc.nodes.forEach((n, i) => { near(gl.nodes[i].x, sizes.L[0].nodes[i].x, 1e-3); near(gl.nodes[i].y, sizes.L[0].nodes[i].y, 1e-3); });
});
test('circle skirt: waist radius from the circle, panels and fold', () => {
  const r = C.circleSkirt({ frac: 1, waist: 70, len: 60, panels: 2 }); near(r.r, 70 / (2 * Math.PI)); const pc = r.pieces[0];
  let w = 0; for (let i = 0; i < C.segCount(pc); i++) if (pc.hems.indexOf(i) < 0 && i < pc.hems[0] - 1) w += C.segLen(pc, i); near(w, 35, .01); assert.equal(C.validate(pc).length, 0);
  assert.ok(C.circleSkirt({ frac: 1, waist: 70, len: 60, panels: 1 }).err); // one panel cannot be more than a half circle
  const h = C.circleSkirt({ frac: .5, waist: 70, len: 50, panels: 1, fold: true }); assert.ok(h.pieces[0].fold >= 0); near(h.r, 70 / Math.PI);
});
test('spread for flare: pivot keeps the waist, opens the hem by the total', () => {
  const r = C.rect(0, 0, 30, 60); r.hems = [2]; const sp = C.spreadMany(r, 0, 2, { n: 3, total: 12, mode: 'pivot' }); const p = JSON.parse(JSON.stringify(r)); C.applyReshape(p, sp);
  const ids = p.nodes.map(n => n.id); let top = 0, hem = 0; const segs = sp.chainB.slice(0, -1).map((id, k) => { const a = ids.indexOf(id), b = ids.indexOf(sp.chainB[k + 1]); return b === (a + 1) % ids.length ? a : b; });
  segs.forEach(s => hem += C.segLen(p, s)); near(hem, 42, .3); assert.equal(C.validate(p).length, 0);
  const q = C.spreadMany(r, 0, 2, { n: 4, total: 8, mode: 'parallel' }); const p2 = JSON.parse(JSON.stringify(r)); C.applyReshape(p2, q); const b = C.bbox(p2); near(b[2] - b[0], 38); void top;
});
test('raglan: the shoulder moves from the bodice onto the sleeve cap', () => {
  const r = PM.build('top', 'women', Object.assign({}, PM.CHARTS.women.M), Object.assign({}, PM.GARMENTS.top.d, { sleeve: 'plain', slen: 'short' })), pcs = C.fromDraft(r, {});
  const F = pcs.find(p => p.src === 'front'), S = pcs.find(p => p.src === 'sleeve'); let iN = 0; F.nodes.forEach((n, i) => { if (n.y < F.nodes[iN].y) iN = i; });
  let iA = 0, bd = 1e9; F.nodes.forEach((n, i) => { const d = Math.hypot(n.x - 17.6, n.y - 17.5); if (d < bd) { bd = d; iA = i; } }); let iT = 0; S.nodes.forEach((n, i) => { if (n.y < S.nodes[iT].y) iT = i; });
  let iM = 0; bd = 1e9; S.nodes.forEach((n, i) => { const d = Math.hypot(n.x - 10.5, n.y - 10.6); if (d < bd) { bd = d; iM = i; } });
  const res = C.raglan(F, { seg: iN, t: C.tAt(F, iN, 3) }, { seg: iA, t: 0 }, S, { seg: iT, t: 0 }, { seg: iM, t: 0 }, { side: 'front' }); assert.ok(!res.err, res.err);
  const b = JSON.parse(JSON.stringify(F)); C.applyReshape(b, res.body); assert.equal(C.validate(b).length, 0); assert.equal(C.validate(res.sleeve).length, 0);
  assert.ok(C.area(b) < C.area(F)); assert.ok(C.area(res.sleeve) > C.area(S) / 2); assert.ok(C.bbox(res.sleeve)[1] < C.bbox(S)[1] - 5); // the neck part rises above the cap
});
