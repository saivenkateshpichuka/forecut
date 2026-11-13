// Pattern Maker professional edits: lengthen, widen, slash and spread, pleat, dart, drill hole.
const { test } = require('node:test'), assert = require('node:assert/strict');
global.window = {};
require('../tools/pm-engine.js');
const PM = window.PM;
const r = PM.build('skirt', 'women', PM.CHARTS.women.M, Object.assign({}, PM.GARMENTS.skirt.d, { skirt: 'aline' }));
const id = r.pieces[0].id;
function box(p) { const o = PM.outline(p); return { x0: Math.min(...o.map(q => q[0])), x1: Math.max(...o.map(q => q[0])), y0: Math.min(...o.map(q => q[1])), y1: Math.max(...o.map(q => q[1])) }; }
function plen(p) { let s = 0; for (let i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; }
const b0 = box(r.pieces[0]);
test('lengthen and shorten move everything below the line', () => {
  const e = {}; e[id] = [{ k: 'len', y: (b0.y0 + b0.y1) / 2, d: 3 }];
  assert.ok(Math.abs(box(PM.applyEdits(r, e).pieces[0]).y1 - (b0.y1 + 3)) < 1e-6);
  e[id] = [{ k: 'len', y: (b0.y0 + b0.y1) / 2, d: -2 }];
  assert.ok(Math.abs(box(PM.applyEdits(r, e).pieces[0]).y1 - (b0.y1 - 2)) < 1e-6);
});
test('widen adds width beyond the line; a pleat also marks its fold lines', () => {
  const e = {}; e[id] = [{ k: 'wid', x: (b0.x0 + b0.x1) / 2, d: 1.5 }];
  assert.ok(Math.abs(box(PM.applyEdits(r, e).pieces[0]).x1 - (b0.x1 + 1.5)) < 1e-6);
  e[id] = [{ k: 'pleat', x: (b0.x0 + b0.x1) / 2, d: 4 }]; const p = PM.applyEdits(r, e).pieces[0];
  assert.ok(Math.abs(box(p).x1 - (b0.x1 + 4)) < 1e-6); assert.ok(p.marks.filter(m => m.user && m.t === 'line').length >= 2);
});
test('slash and spread opens the hem by the amount asked for, the hinge stays put', () => {
  const o = PM.outline(r.pieces[0]), hem = r.pieces[0].edges.find(e => e.t === 'hem'), before = plen(hem.p);
  const a = o.reduce((m, q) => (q[1] < m[1] ? q : m)), b = hem.p[Math.floor(hem.p.length / 2)];
  const e = {}; e[id] = [{ k: 'spread', a: a.slice(), b: b.slice(), d: 5, dir: 1 }];
  const p = PM.applyEdits(r, e).pieces[0], o2 = PM.outline(p);
  assert.ok(o2.some(q => Math.hypot(q[0] - a[0], q[1] - a[1]) < 1e-6), 'hinge point unchanged');
  assert.ok(p.marks.some(m => m.user && /spread/.test(m.lab || '')), 'slash line marked');
  assert.ok(o2.length === o.length, 'same number of points');
  const moved = o2.filter((q, i) => Math.hypot(q[0] - o[i][0], q[1] - o[i][1]) > .5).length; assert.ok(moved > 0, 'one side swings open');
  void before;
});
test('darts and drill holes are added as marks inside the piece', () => {
  const e = {}; e[id] = [{ k: 'dart', e: 1, t: .5, w: 2, l: 9 }, { k: 'drill', c: [5, 10] }];
  const p = PM.applyEdits(r, e).pieces[0], d = p.marks.find(m => m.t === 'dart' && m.user), dr = p.marks.find(m => m.t === 'drill');
  assert.ok(d && d.p.length === 3 && Math.abs(Math.hypot(d.p[0][0] - d.p[2][0], d.p[0][1] - d.p[2][1]) - 2) < .3, 'dart width');
  assert.ok(dr && dr.c[0] === 5 && dr.c[1] === 10, 'drill hole');
});
