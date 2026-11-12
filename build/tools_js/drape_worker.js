/* Forecut 3D Drape Studio: runs the sewing and draping off the page's main thread. */
/* global importScripts, PM, FCDrape, Delaunator */
self.window = self;
importScripts('pm-engine.js?v=__V__', 'drape-sim.js?v=__V__', 'vendor/delaunator.min.js');
var sim = null, M = null, body = null, running = false, gen = 0, frames = 0;

var AV = null, AVP = null, bodyKey = '';
function avatars() {
  if (!AVP) AVP = Promise.all([fetch('avatar/avatars.bin?v=__V__').then(function (r) { return r.arrayBuffer(); }), fetch('avatar/avatars.json?v=__V__').then(function (r) { return r.json(); })])
    .then(function (x) { AV = FCDrape.loadAvatars(x[0], x[1]); return AV; });
  return AVP;
}
function build(q) {
  gen = q.gen; running = false;
  avatars().then(function () { if (q.gen !== gen) return; try { build2(q); } catch (err) { postMessage({ type: 'error', gen: q.gen, message: String(err && err.message || err) }); } });
}
function build2(q) {
  var key = JSON.stringify([q.m, q.gender, q.size, q.height]);
  if (key !== bodyKey) {
    body = FCDrape.body(q.m, q.gender, AV, q.size, q.height); bodyKey = key;
    postMessage({ type: 'body', gen: gen, pos: body.pos, tri: body.tri, mask: body.mask, under: body.under, y: body.y, height: body.height, head: body.head, m: body.m });
  } else postMessage({ type: 'body', gen: gen, same: true });
  var m = body.m;
  var G = FCDrape.assemble(PM, q.style, q.gender, m, q.opts, body);
  M = FCDrape.mesh(G, q.h || 2.3, Delaunator);
  sim = new FCDrape.Sim(M, body, FCDrape.FABRICS[q.fabric] || FCDrape.FABRICS.poplin);
  var panels = G.panels.map(function (P) { return { name: P.name, segs: P.segs.map(function (s) { return { key: s.key, pts: s.pts }; }) }; });
  var seamLines = [];
  G.seams.forEach(function (sm) { [sm[0], sm[1]].forEach(function (e) { seamLines.push(M.segIdx[e[0] + '|' + e[1]]); }); });
  postMessage({ type: 'mesh', gen: gen, x: M.x.slice(), uv: M.uv, tri: M.tri, panels: panels, seams: G.seams, seamLines: seamLines, info: G.info, label: G.label, opts: G.opts, verts: sim.n, panel: M.panel });
  running = true; frames = 0;
  tick();
}
function kick() { if (!running && sim) { running = true; tick(); } }
function tick() {
  if (!running || !sim) return;
  var t0 = Date.now(), steps = 0;
  do { sim.step(1 / 60); steps++; frames++; } while (!sim.settled && Date.now() - t0 < 6 && steps < 2);
  var done = sim.settled, msg = { type: 'frame', gen: gen, x: sim.x.slice(), t: sim.t, done: done };
  if (done || frames % 15 === 0) { msg.gap = sim.gap.slice(); msg.strain = sim.computeStrain().slice(); }
  postMessage(msg);
  if (done) running = false;
}
onmessage = function (e) {
  var q = e.data;
  try {
    if (q.cmd === 'build') build(q);
    else if (q.cmd === 'ack') { if (q.gen === gen) tick(); }
    else if (q.cmd === 'fabric' && sim) { // keep the current shape, re-settle in the new fabric
      sim = new FCDrape.Sim(M, body, FCDrape.FABRICS[q.fabric]); sim.t = 1.3; running = true; tick();
    } else if (q.cmd === 'grab' && sim) { sim.startGrab(q.i, q.r); kick(); }
    else if (q.cmd === 'drag' && sim) { sim.moveGrab(q.t); kick(); }
    else if (q.cmd === 'release' && sim) { sim.endGrab(); kick(); }
    else if (q.cmd === 'pstart' && sim) { sim.startPanel(q.panel); kick(); }
    else if (q.cmd === 'pmove' && sim) { sim.movePanel(q.e); kick(); }
    else if (q.cmd === 'pend' && sim) { sim.endPanel(); kick(); }
    else if (q.cmd === 'pause') running = false;
    else if (q.cmd === 'resume' && sim && !sim.settled) { running = true; tick(); }
  } catch (err) { postMessage({ type: 'error', gen: q.gen || gen, message: String(err && err.message || err) }); }
};
