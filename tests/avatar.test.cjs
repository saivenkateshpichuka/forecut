// Avatar fitting and poses: node tests/avatar.test.cjs
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path');
global.window = global;
require('../tools/pm-engine.js');
const D = require('../build/tools_js/drape_sim.js'), PM = global.PM;
const buf = fs.readFileSync(path.join(__dirname, '../tools/avatar/avatars.bin'));
const AV = D.loadAvatars(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length), JSON.parse(fs.readFileSync(path.join(__dirname, '../tools/avatar/avatars.json'))));
const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a.toFixed(1)} vs ${b} (±${tol})`);

for (const [g, chart, size, type] of [['women', 'women', 'M', ''], ['women', 'women', 'XXL', ''], ['women', 'women', 'M', 'mature'], ['men', 'men', 'L', ''], ['men', 'men', 'M', 'athletic'], ['girl', 'kids', '8Y', ''], ['tboy', 'toddler', '2Y', '']]) {
  test(`fits ${g} ${size} ${type || 'standard'} to the size chart`, () => {
    const m = Object.assign({}, PM.CHARTS[chart][size]), b = D.body(m, g, AV, size, 0, { type });
    if (type) assert.ok(b.key.includes('~' + type), b.key);
    for (const k of ['bust', 'waist', 'hip']) near(b.fit[k], m[k], 1.5, k);
    for (const k of ['neck', 'wrist', 'calf', 'ankle']) near(b.fit[k], m[k], 1.5, k);
    for (const k of ['bicep', 'sleeve']) near(b.fit[k], m[k], 2, k);
    near(b.fit.shoulder, m.shoulder, 4, 'shoulder');
  });
}
test('maternity form carries the bump', () => {
  const m = Object.assign({}, PM.CHARTS.women.M); m.waist += 24;
  const b = D.body(m, 'women', AV, 'M', 0, { type: 'maternity' }); assert.ok(b.key.startsWith('women~maternity')); near(b.fit.waist, m.waist, 1.5, 'waist');
});
test('petite and tall change height, not girths', () => {
  const m = Object.assign({}, PM.CHARTS.women.M), a = D.body(Object.assign({}, m), 'women', AV, 'M', 0, {}), p = D.body(Object.assign({}, m), 'women', AV, 'M', 0, { stature: .94 });
  assert.ok(p.height < a.height - 6); near(p.fit.bust, m.bust, 1.5, 'bust');
});
test('poses move the limbs and keep the feet on the floor', () => {
  const b = D.body(Object.assign({}, PM.CHARTS.women.M), 'women', AV, 'M', 0, {}), R = b.pos;
  const T = D.poseBody(b, AV, 't'), W = D.poseBody(b, AV, 'walk'); let hi = 0, hiT = 0, lo = 1e9; for (let i = 0; i < R.length / 3; i++) { if (R[3 * i] > 30) hi = Math.max(hi, R[3 * i + 1]); if (T[3 * i] > 30) hiT = Math.max(hiT, T[3 * i + 1]); lo = Math.min(lo, W[3 * i + 1]); }
  assert.ok(hiT > hi + 10, 'T-pose raises the arms'); near(lo, 0, .5, 'floor');
});
test('edited pieces from Garment Studio sew and drape on the avatar', () => {
  const C = require('../build/tools_js/pm_cad.js'), Dl = require('../tools/vendor/delaunator.min.js');
  for (const g of ['tshirt', 'skirt']) {
    const m = Object.assign({}, PM.CHARTS.women.M), b = D.body(Object.assign({}, m), 'women', AV, 'M', 0, {});
    const r = PM.build(g, 'women', m, Object.assign({}, PM.GARMENTS[g].d)), P = { pieces: C.fromDraft(r, {}), sewing: [] }; C.normalize(P);
    P.pieces.forEach(pc => { if (/front|back/i.test(pc.name)) { const mx = Math.max(...pc.nodes.map(n => n.y)); pc.nodes.forEach(n => { if (n.y > mx - .5) n.y += 5; }); } });
    const spec = C.to3D(JSON.parse(JSON.stringify(P))); assert.ok(spec.seams.length >= 2, g + ' seams');
    const G = D.assembleCustom(spec, b, b.m), M = D.mesh(G, 2.6, Dl), sim = new D.Sim(M, b, D.FABRICS.poplin); let k = 0; while (!sim.settled && k < 900) { sim.step(1 / 60); k++; }
    let gap = 0, hi = -1e9; const X = sim.x; for (let i = 0; i < M.seams.length; i += 2) { const a = 3 * M.seams[i], c = 3 * M.seams[i + 1]; gap = Math.max(gap, Math.hypot(X[a] - X[c], X[a + 1] - X[c + 1], X[a + 2] - X[c + 2])); } for (let i = 1; i < X.length; i += 3) hi = Math.max(hi, X[i]);
    assert.ok(gap < 1.5, g + ' seam gap ' + gap.toFixed(2)); assert.ok(hi > (g === 'skirt' ? b.y.waist : b.y.hps) - 8, g + ' stays up on the body ' + hi.toFixed(0));
  }
});
