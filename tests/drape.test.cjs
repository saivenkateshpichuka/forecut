// 3D Drape Studio: every style cuts, sews and drapes without errors, for every body.
const { test } = require('node:test'), assert = require('node:assert/strict');
global.window = {};
require('../tools/pm-engine.js');
const PM = window.PM, D = require('../tools/drape-sim.js'), Del = require('../tools/vendor/delaunator.min.js'), fs = require('fs');
const buf = fs.readFileSync(__dirname + '/../tools/avatar/avatars.bin'), AV = D.loadAvatars(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length), JSON.parse(fs.readFileSync(__dirname + '/../tools/avatar/avatars.json')));
const bodies = {};

function run(style, gender, size, fabric, frames) {
  const m = PM.CHARTS[gender][size], body = bodies[gender + size] || (bodies[gender + size] = D.body(m, gender, AV, size));
  const o = {}, d = PM.GARMENTS[D.STYLES[style].gid].d; // kids start from scaled lengths, as in Pattern Maker
  if (gender === 'kids') { if (d.len) o.len = Math.round(d.len * .62); if (d.slen2) o.slen2 = Math.round(d.slen2 * .6); if (d.ease) o.ease = Math.max(6, Math.round(d.ease * .75)); if (d.slit) o.slit = 12; }
  const G = D.assemble(PM, style, gender, body.m, o, body), M = D.mesh(G, 3, Del), S = new D.Sim(M, body, D.FABRICS[fabric]);
  for (let f = 0; f < frames && !S.settled; f++) S.step(1 / 60);
  return { S, M, body };
}
for (const style of Object.keys(D.STYLES)) {
  const kind = D.STYLES[style].kind, gid = D.STYLES[style].gid;
  for (const gender of PM.GARMENTS[gid].g.filter(g => g !== 'unisex')) {
    test(`${style} sews and settles on ${gender}`, () => {
      const size = gender === 'kids' ? '8Y' : 'M', { S, body } = run(style, gender, size, 'poplin', kind === 'torso' && !D.STYLES[style].with ? 150 : 360);
      for (let i = 0; i < S.x.length; i++) assert.ok(Number.isFinite(S.x[i]), 'position is a number');
      assert.ok(S.seamGap() < (kind === 'torso' && !D.STYLES[style].with ? 1.5 : D.STYLES[style].with ? 4.5 : 3.5), 'seams closed: ' + S.seamGap().toFixed(2));
      let top = -1e9; for (let i = 1; i < S.x.length; i += 3) top = Math.max(top, S.x[i]);
      if (kind !== 'torso') assert.ok(top > body.y.hip && top < body.y.waist + 9, 'stays up at the waist: ' + top.toFixed(1) + ' (waist ' + body.y.waist + ')');
      else assert.ok(top > body.y.shoulder && top < body.y.hps + 6, 'garment hangs from the shoulders: ' + top.toFixed(1));
    });
  }
}
test('every fabric in the library drapes a dress and a gathered skirt', () => {
  for (const f of Object.keys(D.FABRICS)) for (const st of ['dress', 'gathered']) {
    const { S, body } = run(st, 'women', 'M', f, st === 'dress' ? 150 : 360);
    for (let i = 0; i < S.x.length; i++) assert.ok(Number.isFinite(S.x[i]), f + ' ' + st + ' position is a number');
    assert.ok(S.seamGap() < (st === 'dress' ? 1.5 : 3.5), f + ' ' + st + ' seams closed: ' + S.seamGap().toFixed(2));
  }
});
test('a custom fabric (any numbers a user types) drapes without blowing up', () => {
  const { S } = run('aline', 'women', 'M', 'poplin', 1); const M = S.M, body = S.body;
  for (const f of [{ gsm: 30, sw: 100, sl: 100, sb: 20, stiff: 0, fric: 0, thick: .05 }, { gsm: 900, sw: 0, sl: 0, sb: 0, stiff: 100, fric: 1, thick: 6 }]) {
    const s2 = new D.Sim(D.mesh(D.assemble(PM, 'aline', 'women', body.m, {}, body), 3, Del), body, f);
    for (let k = 0; k < 200 && !s2.settled; k++) s2.step(1 / 60);
    for (let i = 0; i < s2.x.length; i++) assert.ok(Number.isFinite(s2.x[i]), 'finite');
  }
});
test('a heavier, stiffer fabric hangs differently from a light one', () => {
  const a = run('dress', 'women', 'M', 'georgette', 200).S, b = run('dress', 'women', 'M', 'denim', 200).S;
  let d = 0; for (let i = 0; i < a.x.length; i++) d = Math.max(d, Math.abs(a.x[i] - b.x[i]));
  assert.ok(d > 1, 'shapes differ by ' + d.toFixed(2) + ' cm');
});
test('the page script parses', () => {
  const src = require('fs').readFileSync(__dirname + '/../tools/drape.js', 'utf8');
  require('child_process').execFileSync(process.execPath, ['--input-type=module', '--check'], { input: src });
});
test('avatar girths match the size chart for every body and size', () => {
  for (const g of ['women', 'men', 'kids']) for (const sz of Object.keys(PM.CHARTS[g])) {
    const m = PM.CHARTS[g][sz], b = D.body(m, g, AV, sz);
    for (const k of ['bust', 'waist', 'hip']) assert.ok(Math.abs(b.girth(b.y[k]) - m[k]) < 1, `${g} ${sz} ${k}: ${b.girth(b.y[k]).toFixed(1)} vs ${m[k]}`);
    assert.ok(b.height > (g === 'kids' ? 80 : 150) && b.height < 200, `${g} ${sz} height ${b.height.toFixed(0)}`);
  }
});
test('pulling the cloth moves it, letting go lets it settle again', () => {
  const { S } = run('tshirt', 'women', 'M', 'jersey', 200), i = 40, y0 = S.x[3 * i + 1];
  S.startGrab(i, 5); S.moveGrab([S.x[3 * i] + 6, y0 - 8, S.x[3 * i + 2] + 4]);
  for (let f = 0; f < 40; f++) S.step(1 / 60);
  assert.ok(Math.abs(S.x[3 * i + 1] - (y0 - 8)) < 2.5, 'follows the hand');
  S.endGrab(); for (let f = 0; f < 700 && !S.settled; f++) S.step(1 / 60);
  assert.ok(S.settled, 'settles after release');
});
test('the gizmo moves a whole piece', () => {
  const { S } = run('aline', 'women', 'M', 'linen', 100), ids = []; for (let k = 0; k < S.n; k++) if (S.panel[k] === 0) ids.push(k);
  const y0 = S.x[3 * ids[0] + 1]; S.startPanel(0); S.movePanel([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 5, 0, 1]);
  assert.ok(Math.abs(S.x[3 * ids[0] + 1] - y0 - 5) < 1e-3); S.endPanel(); assert.ok(!S.settled);
});
