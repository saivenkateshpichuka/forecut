// Stage 4 and 5: pattern check, export scale, grade-rule round trip, marker and yield.
const { test } = require('node:test'), assert = require('node:assert/strict');
global.window = {}; global.localStorage = { getItem: () => null, setItem: () => {} };
require('../tools/pm-engine.js'); require('../build/tools_js/pm_export.js'); require('../build/tools_js/pm_cost.js');
const C = require('../build/tools_js/pm_cad.js'), K = require('../build/tools_js/pm_check.js'), M = require('../build/tools_js/pm_marker.js'), X = window.PMX, PMC = window.PMC;
const near = (a, b, t = 1e-3) => assert.ok(Math.abs(a - b) <= t, a + ' vs ' + b);
function proj() { const P = C.newProject({ name: 'Test' }); C.normalize(P);
  const f = C.rect(0, 0, 25, 60, { name: 'Front', qty: 1 }), b = C.rect(30, 0, 25, 60, { name: 'Back', qty: 1 }), s = C.rect(60, 0, 20, 50, { name: 'Sleeve', qty: 2, pair: true });
  P.pieces.push(f, b, s); const G = C.gradeSet(P); G.list = ['S', 'M', 'L']; G.base = 'M';
  [f, b].forEach(pc => { C.setRule(pc, [pc.nodes[1].id, pc.nodes[2].id], 1, 0, G.list, 'M'); C.setRule(pc, [pc.nodes[2].id, pc.nodes[3].id], 0, 1, G.list, 'M'); });
  P.sewing.push({ id: 'sw1', A: { pc: f.id, seg: 1 }, B: { pc: b.id, seg: 3 }, ease: 0 }); return P; }
test('control square: 100 mm through SVG, DXF and PDF', async () => {
  const rows = await new Promise(r => K.scale(C, X, proj(), r));
  assert.ok(rows.length >= 9, 'rows ' + rows.length); rows.forEach(r => assert.equal(r.st, 'pass', r.item + ': ' + r.msg));
  assert.ok(rows.some(r => /PDF, full sheet/.test(r.item)) && rows.some(r => /PDF, tiled/.test(r.item)) && rows.some(r => /round trip/.test(r.item)));
});
test('pattern check: passes a clean pattern, catches a shrinking grade and a short seam', () => {
  const P = proj(); let r = K.run(C, P); assert.equal(r.sum.fail, 0, JSON.stringify(r.rows.filter(x => x.st === 'fail')));
  assert.ok(r.rows.some(x => x.cat === 'Grading' && x.st === 'pass' && x.item === 'Front'));
  assert.ok(r.rows.some(x => x.cat === 'Grading' && x.item === 'Sleeve' && x.st === 'warn')); // ungraded
  const f = P.pieces[0]; C.setRule(f, [f.nodes[1].id, f.nodes[2].id], -1.5, 0, ['S', 'M', 'L'], 'M');
  r = K.run(C, P); assert.ok(r.rows.some(x => x.cat === 'Grading' && x.item === 'Front' && x.st === 'fail'));
  const P2 = proj(); P2.pieces[1].nodes[3].y = 55; P2.pieces[1].nodes[0].y = 0; r = K.run(C, P2); // back side seam shorter
  assert.ok(r.rows.some(x => x.cat === 'Seams' && x.st === 'fail'));
});
test('sleeve cap ease is reported per size', () => {
  const P = C.newProject({}); C.normalize(P); const s = C.rect(0, 0, 20, 10, { name: 'Sleeve' }), f = C.rect(30, 0, 19, 10, { name: 'Front' }); P.pieces.push(s, f);
  P.sewing.push({ id: 'a', A: { pc: s.id, seg: 0 }, B: { pc: f.id, seg: 0 }, ease: 1 }); const r = K.run(C, P), e = r.rows.find(x => x.cat === 'Sleeve ease');
  assert.ok(e && /ease 1\.00 cm/.test(e.msg), e && e.msg);
});
test('grade rules export and import back', () => {
  const P = proj(), rows = K.rules(C, P, 'mm'); assert.ok(rows.length > 4); assert.match(rows[0][4], /mm/);
  const Q = proj(); Q.pieces.forEach(p => C.clearGrade(p)); const res = K.applyRules(C, Q, rows.slice(1), 'mm'); assert.equal(res.done, rows.length - 1);
  near(C.perimeter(C.gradedPiece(Q.pieces[0], 'L', 'M')), C.perimeter(C.gradedPiece(P.pieces[0], 'L', 'M')), 1e-6);
});
test('marker: ratio, efficiency, consumption per size, no overlaps', () => {
  const P = proj(); const r = M.plan(C, P, { width: 150, selv: 1, gap: .2, ends: 2, ratio: { S: 1, M: 2, L: 1 }, plies: 10, splice: 0 }, PMC.marker);
  assert.ok(!r.err, r.err); assert.equal(r.garments, 4); assert.equal(r.placed.length, 16);
  assert.ok(r.eff > .5 && r.eff <= 1, 'eff ' + r.eff); assert.deepEqual(M.overlaps(r.placed), []);
  near(r.perGarment, r.total / 4 / 100, 1e-9); const sumSize = Object.values(r.perSize).reduce((t, s) => t + s.m * s.n, 0); near(sumSize, r.total / 100, 1e-6);
  assert.ok(r.perSize.L.m > r.perSize.S.m); assert.equal(r.lay.garments, 40);
  const used = r.placed.reduce((t, p) => t + p.it.area, 0); near(r.eff, used / (r.length * 148), 1e-9);
  r.placed.forEach(pl => pl.real.forEach(p => p.forEach(q => assert.ok(q[1] >= 1 - 1e-6 && q[1] <= 149 + 1e-6, 'inside selvedges ' + q[1]))));
});
test('marker: shrinkage grows the lay, one-way never turns pieces, too-wide pieces fail', () => {
  const P = proj(), a = M.plan(C, P, { width: 150, ratio: { S: 0, M: 1, L: 0 }, gap: 0 }, PMC.marker), b = M.plan(C, P, { width: 150, ratio: { S: 0, M: 1, L: 0 }, gap: 0, shrL: 5, shrW: 3 }, PMC.marker);
  near(b.pieceArea, a.pieceArea / .95 / .97, 1e-6);
  const o = M.plan(C, P, { width: 150, ratio: { S: 1, M: 1, L: 1 }, nap: 'oneway' }, PMC.marker); assert.ok(o.placed.every(p => !p.rot));
  const w = M.plan(C, P, { width: 24, ratio: { M: 1, S: 0, L: 0 } }, PMC.marker); assert.ok(w.checks.some(c => c.st === 'fail' && c.item === 'Fabric width'));
});
