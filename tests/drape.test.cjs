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
      const J = ['frock', 'anarkali', 'jumpsuit', 'peplum', 'hoodie'].includes(style), size = gender === 'kids' ? '8Y' : 'M', { S, body } = run(style, gender, size, 'poplin', kind === 'torso' && !D.STYLES[style].with && !J ? 150 : 360);
      for (let i = 0; i < S.x.length; i++) assert.ok(Number.isFinite(S.x[i]), 'position is a number');
      assert.ok(S.seamGap() < (J ? 5 : kind === 'torso' && !D.STYLES[style].with ? 1.5 : D.STYLES[style].with ? 4.5 : 3.5), 'seams closed: ' + S.seamGap().toFixed(2));
      let top = -1e9; for (let i = 1; i < S.x.length; i += 3) top = Math.max(top, S.x[i]);
      if (kind !== 'torso') assert.ok(top > body.y.hip && top < body.y.waist + 9, 'stays up at the waist: ' + top.toFixed(1) + ' (waist ' + body.y.waist + ')');
      else assert.ok(top > body.y.shoulder && top < body.y.hps + (style === 'hoodie' ? 16 : 6), 'garment hangs from the shoulders: ' + top.toFixed(1));
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
test('button-front garments: buttons and zips are made, collars sit at the neck, and opening the front drops the tacks', () => {
  for (const st of ['shirt', 'blazer', 'bandhgala', 'polo', 'bomber']) {
    const m = PM.CHARTS.men.M, body = bodies.menM || (bodies.menM = D.body(m, 'men', AV, 'M'));
    const G = D.assemble(PM, st, 'men', body.m, {}, body), M = D.mesh(G, 3, Del);
    if (st === 'bomber') assert.ok(G.zip && G.zip.closed, 'bomber has a closed zip'); else assert.ok(G.buttons.length >= 2, st + ' has buttons');
    if (st !== 'polo' && st !== 'bomber') assert.ok(M.tacks.length >= 4, st + ' buttons hold the fronts');
    const col = G.panels.findIndex(p => /^(BAND|COL|KC)$/.test(p.name)); assert.ok(col >= 0, st + ' has a collar or band');
    let lo = 1e9; for (let i = 0; i < M.panel.length; i++) if (M.panel[i] === col) lo = Math.min(lo, M.x[3 * i + 1]);
    assert.ok(lo > body.y.bust - 15 && lo < body.y.hps + 3, st + ' collar starts at the neckline: ' + lo.toFixed(1));
    const G2 = D.assemble(PM, st, 'men', body.m, { fasten: 'open' }, body); assert.ok(G2.buttons.filter(b => b.over !== b.under).every(b => !b.closed) && G2.tacks.length === G.tacks.length - G.buttons.filter(b => b.over !== b.under).length, 'unbuttoned: buttons open, no button tacks');
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
test('studio tools: pin holds a point, tack joins two, freeze holds a piece, interfacing stiffens, elastic gathers, puckering shortens seams', () => {
  const { S } = run('aline', 'women', 'M', 'rayon', 120), x = S.x;
  const i = 30, p0 = [x[3 * i], x[3 * i + 1], x[3 * i + 2]]; S.pin(i, true); for (let f = 0; f < 40; f++) S.step(1 / 60);
  assert.ok(Math.hypot(x[3 * i] - p0[0], x[3 * i + 1] - p0[1], x[3 * i + 2] - p0[2]) < .8, 'pinned point stays');
  S.pin(i, false); const a = 50, b = 400; S.tack(a, b); for (let f = 0; f < 120; f++) S.step(1 / 60);
  assert.ok(Math.hypot(x[3 * a] - x[3 * b], x[3 * a + 1] - x[3 * b + 1], x[3 * a + 2] - x[3 * b + 2]) < 2, 'tacked points meet'); assert.ok(S.seamGap() < 3.5, 'tack not counted as a seam');
  S.clearTacks(); const k = S.panel[0], ids = []; for (let q = 0; q < S.n; q++) if (S.panel[q] === k) ids.push(q);
  const y0 = ids.map(q => x[3 * q + 1]); S.freeze(k, true); for (let f = 0; f < 30; f++) S.step(1 / 60); assert.ok(ids.every((q, n) => Math.abs(x[3 * q + 1] - y0[n]) < .7), 'frozen piece holds');
  S.freeze(k, false); S.stiffen(k, 10); assert.ok(S.BA.some(v => v < S.fab.bend / 5), 'interfacing stiffens'); S.elastic(ids.slice(0, 20), .7); assert.equal(S.rings[S.rings.length - 1].user, 1); S.clearElastic(); assert.ok(!S.rings.some(r => r.user));
  S.pucker(.04); let short = 0; for (let j = 0; j < S.E.length; j += 3) if (S.E[j + 2] < S.E0[j + 2] - 1e-6) short++; assert.ok(short > 10, 'seam edges eased'); S.pucker(0);
});
