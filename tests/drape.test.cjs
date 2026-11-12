// 3D Drape Studio: every style cuts, sews and drapes without errors, for every body.
const { test } = require('node:test'), assert = require('node:assert/strict');
global.window = {};
require('../tools/pm-engine.js');
const PM = window.PM, D = require('../tools/drape-sim.js'), Del = require('../tools/vendor/delaunator.min.js');

function run(style, gender, size, fabric, frames) {
  const m = PM.CHARTS[gender][size], body = D.body(m, gender);
  const G = D.assemble(PM, style, gender, m, {}, body), M = D.mesh(G, 3, Del), S = new D.Sim(M, body, D.FABRICS[fabric]);
  for (let f = 0; f < frames && !S.settled; f++) S.step(1 / 60);
  return { S, M, body };
}
for (const style of Object.keys(D.STYLES)) {
  const kind = D.STYLES[style].kind, gid = D.STYLES[style].gid;
  for (const gender of PM.GARMENTS[gid].g.filter(g => g !== 'unisex')) {
    test(`${style} sews and settles on ${gender}`, () => {
      const size = gender === 'kids' ? '8Y' : 'M', { S, body } = run(style, gender, size, 'poplin', 150);
      for (let i = 0; i < S.x.length; i++) assert.ok(Number.isFinite(S.x[i]), 'position is a number');
      assert.ok(S.seamGap() < 1.5, 'seams closed: ' + S.seamGap().toFixed(2));
      let top = -1e9; for (let i = 1; i < S.x.length; i += 3) top = Math.max(top, S.x[i]);
      if (kind === 'skirt') assert.ok(top > body.y.hip && top < body.y.waist + 4, 'skirt stays at the waist: ' + top.toFixed(1));
      else assert.ok(top > body.y.shoulder && top < body.y.hps + 6, 'garment hangs from the shoulders: ' + top.toFixed(1));
    });
  }
}
test('a heavier, stiffer fabric hangs differently from a light one', () => {
  const a = run('dress', 'women', 'M', 'georgette', 200).S, b = run('dress', 'women', 'M', 'denim', 200).S;
  let d = 0; for (let i = 0; i < a.x.length; i++) d = Math.max(d, Math.abs(a.x[i] - b.x[i]));
  assert.ok(d > 1, 'shapes differ by ' + d.toFixed(2) + ' cm');
});
test('the page script parses', () => {
  const src = require('fs').readFileSync(__dirname + '/../tools/drape.js', 'utf8');
  require('child_process').execFileSync(process.execPath, ['--input-type=module', '--check'], { input: src });
});
