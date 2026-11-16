// AQL plans (ISO 2859-1, level II, single, normal), POM diagram coverage, evidence track record.
const { test } = require('node:test'), assert = require('node:assert/strict');
const app = { addEventListener() {}, set innerHTML(v) {}, get innerHTML() { return ''; } };
global.window = {}; global.document = { getElementById: id => id === 'app' ? app : null, querySelector: () => null, querySelectorAll: () => [] };
global.localStorage = { getItem: () => null, setItem() {} };
require('../tools/fitqc.js'); require('../tools/pom-diagram.js');
const plan = window.ForecutFitQC.plan;
test('AQL code letters and sample sizes', () => {
  assert.deepEqual([plan(1000, '2.5').letter, plan(1000, '2.5').n], ['J', 80]);
  assert.deepEqual([plan(100, '2.5').letter, plan(100, '2.5').n], ['F', 20]);
  assert.equal(plan(5000, '4.0').letter, 'L'); assert.equal(plan(5000, '4.0').n, 200);
});
test('AQL accept and reject numbers, including arrows', () => {
  const ac = (lot, a) => { const p = plan(lot, a); return [p.n, p.ac, p.re]; };
  assert.deepEqual(ac(1000, '2.5'), [80, 5, 6]);   // J, 2.5
  assert.deepEqual(ac(1000, '4.0'), [80, 7, 8]);   // J, 4.0
  assert.deepEqual(ac(100, '2.5'), [20, 1, 2]);    // F, 2.5
  assert.deepEqual(ac(60, '2.5'), [20, 1, 2]);     // E, 2.5 is a down arrow to F
  assert.deepEqual(ac(40, '2.5'), [5, 0, 1]);      // D, 2.5 is an up arrow to C
  assert.deepEqual(ac(200000, '6.5'), [200, 21, 22]); // beyond Ac 21: up arrow
  assert.equal(plan(10, '1.0').all, true);         // sample larger than the lot: inspect all
});
test('POM diagram draws common points for tops and bottoms', () => {
  const top = window.ForecutPOM.svg('T-shirt', [{ name: 'Chest width' }, { name: 'Body length from HPS' }, { name: 'Sleeve length' }, { name: 'Armhole straight' }, { name: 'Mystery point' }]);
  assert.equal(top.kind, 'top'); assert.equal(top.drawn.length, 4); assert.deepEqual(top.missing, ['Mystery point']);
  const bot = window.ForecutPOM.svg('Trousers', [{ name: 'Waist' }, { name: 'Inseam' }, { name: 'Front rise' }, { name: 'Leg opening' }]);
  assert.equal(bot.kind, 'bottom'); assert.equal(bot.drawn.length, 4); assert.match(bot.svg, /<svg/);
});
test('3D fabric from lab tests: rigidity and stiffness scale match the library presets', () => {
  require('../tools/validate3d.js'); const T = window.Forecut3D;
  assert.equal(T.rigidity(150, 2), 120); // (150/10) × 2³
  const chiffon = T.fromTests({ gsm: 70, bendWarp: 1.2 }).stiff, poplin = T.fromTests({ gsm: 115, bendWarp: 2.5 }).stiff, denim = T.fromTests({ gsm: 270, bendWarp: 3.5 }).stiff;
  assert.ok(chiffon >= 5 && chiffon <= 20, 'chiffon ' + chiffon); assert.ok(poplin >= 50 && poplin <= 65, 'poplin ' + poplin); assert.ok(denim >= 78 && denim <= 92, 'denim ' + denim);
  assert.equal(T.fromTests({ gsm: 150, bendWarp: 2, bendWeft: 2, angle: 45 }).fric, 1);
  const r = { pts: T.POINTS.map((p, i) => ({ name: p[0], unit: p[1], tol: p[2], sim: 10, real: i < 9 ? 10.5 : 13 })) };
  const e = T.evalRec(r); assert.equal(e.n, 10); assert.equal(e.ok, 9); assert.equal(e.verdict, 'Close: calibrate'); // one point 3 out on a tolerance of 1
});
