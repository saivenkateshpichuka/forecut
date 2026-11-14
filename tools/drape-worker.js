/* Forecut. Built from build/tools_js; edit there. */
/* Forecut 3D Drape Studio: runs the sewing and draping off the page's main thread. */
/* global importScripts, PM, FCDrape, Delaunator */
self.window = self;
importScripts('pm-engine.js?v=fx-20261114a', 'drape-sim.js?v=fx-20261114a', 'vendor/delaunator.min.js');
var sim = null, M = null, body = null, running = false, gen = 0, frames = 0, morph = null, poseMap = {}, wantMap = null, pending = false;
function presetMap(k) { var r = (FCDrape.POSES[k] || FCDrape.POSES.a).r, o = {}; Object.keys(r).forEach(function (b) { o[b] = r[b]; }); return o; }

var AV = null, AVP = null, bodyKey = '';
function avatars(fresh) {
  if (!AVP) {
    var opt = fresh ? { cache: 'reload' } : {}, get = function (u, k) { return fetch(u + (fresh ? '&r=' + Date.now() : ''), opt).then(function (r) { if (!r.ok) throw new Error('The avatar file could not be downloaded (' + r.status + ').'); return r[k](); }); };
    AVP = Promise.all([get('avatar/avatars.bin?v=fx-20261114a', 'arrayBuffer'), get('avatar/avatars.json?v=fx-20261114a', 'json')])
      .then(function (x) { var L = x[1].layout || {}, need = (L.local0 || L.shape0 || 0); if (x[0].byteLength < need) throw new Error('The avatar files do not match.'); AV = FCDrape.loadAvatars(x[0], x[1]); return AV; })
      .catch(function (err) { AVP = null; if (!fresh) return avatars(true); throw err; }); // a stale or broken copy: fetch both files again from the server once
  }
  return AVP;
}
function build(q) {
  gen = q.gen; running = false;
  avatars().then(function () { if (q.gen !== gen) return; try { build2(q); } catch (err) { postMessage({ type: 'error', gen: q.gen, message: String(err && err.message || err) }); } }, function (err) { postMessage({ type: 'error', gen: q.gen, message: (err && err.message || 'The avatar could not load.') + ' Check your connection and press Sew and drape again.' }); });
}
function build2(q) {
  var key = JSON.stringify([q.m, q.body || q.gender, q.size, q.height, q.pose]);
  poseMap = {}; morph = null; wantMap = q.poseMap || presetMap(q.preset || 'a'); pending = Object.keys(wantMap).length > 0;
  if (key !== bodyKey) {
    body = FCDrape.body(q.m, q.body || q.gender, AV, q.size, q.height, q.pose); bodyKey = key;
    postMessage({ type: 'body', gen: gen, pos: body.pos, tri: body.tri, mask: body.mask, under: body.under, y: body.y, height: body.height, head: body.head, m: body.m, J: body.J, cat: q.body || q.gender });
  } else { if (body.rest) FCDrape.setBodyPos(body, body.rest); postMessage({ type: 'body', gen: gen, same: true }); }
  var m = body.m;
  var G = FCDrape.assemble(PM, q.style, q.gender, m, q.opts, body);
  G.meshType = q.meshType; M = FCDrape.mesh(G, q.h || 2.3, Delaunator); M.sim = q.sim || {};
  sim = new FCDrape.Sim(M, body, q.fab || FCDrape.FABRICS[q.fabric] || FCDrape.FABRICS.poplin);
  var panels = G.panels.map(function (P) { return { name: P.name, segs: P.segs.map(function (s) { return { key: s.key, pts: s.pts }; }) }; });
  var seamLines = [];
  G.seams.forEach(function (sm) { [sm[0], sm[1]].forEach(function (e) { seamLines.push(M.segIdx[e[0] + '|' + e[1]]); }); });
  postMessage({ type: 'mesh', gen: gen, x: M.x.slice(), uv: M.uv, tri: M.tri, panels: panels, seams: G.seams, seamLines: seamLines, info: G.info, label: G.label, opts: G.opts, verts: sim.n, panel: M.panel, buttons: G.buttons, zip: G.zip, tops: G.tops });
  running = true; frames = 0;
  tick();
}
// poses: the body moves from the A-pose to the chosen pose in small steps and the cloth follows it
function startMorph(map, steps) {
  pending = false; var from = new Float32Array(body.pos), to = Object.keys(map).length ? FCDrape.poseBody(body, AV, map) : (body.rest ? new Float32Array(body.rest) : from);
  if (!to) return; morph = { from: from, to: to, k: 0, n: steps || 9, f: frames, map: map };
}
function stepMorph() {
  morph.k++; var u = morph.k / morph.n, e = u * u * (3 - 2 * u), P = new Float32Array(morph.from.length); for (var i = 0; i < P.length; i++) P[i] = morph.from[i] + (morph.to[i] - morph.from[i]) * e;
  FCDrape.setBodyPos(body, P); sim.wake(); morph.f = frames;
  var fin = morph.k >= morph.n, eyes = {}, R = body.rest; ['l-eye', 'r-eye', 'l-hand', 'r-hand', 'l-ankle', 'r-ankle'].forEach(function (k) { var a = FCDrape.stencilAt(AV, R, k), b = FCDrape.stencilAt(AV, P, k), j = body.J && body.J[k]; if (a && b && j) eyes[k] = [j[0] + b[0] - a[0], j[1] + b[1] - a[1], j[2] + b[2] - a[2]]; });
  if (fin) { poseMap = morph.map; morph = null; }
  postMessage({ type: 'bodypos', gen: gen, pos: P, eyes: eyes, done: fin, joints: fin ? FCDrape.jointsPosed(body, AV, poseMap) : null, poseMap: fin ? poseMap : null });
}
function kick() { if (!running && sim) { running = true; tick(); } }
function tick() {
  if (!running || !sim) return;
  var t0 = Date.now(), steps = 0;
  if (!morph && sim.settled && pending) startMorph(wantMap, 9);
  if (morph && (morph.k === 0 || frames - morph.f >= 14)) stepMorph();
  do { sim.step(1 / 60); steps++; frames++; } while (!sim.settled && Date.now() - t0 < 6 && steps < 2);
  var done = sim.settled && !morph && !pending, msg = { type: 'frame', gen: gen, x: sim.x.slice(), t: sim.t, done: done };
  if (done || frames % 15 === 0) { msg.gap = sim.gap.slice(); msg.strain = sim.computeStrain().slice(); }
  if (done && M.tacks && M.tacks.length) { var tg = 0, X = sim.x; for (var j = 0; j < M.tacks.length; j += 2) { var a = 3 * M.tacks[j], b = 3 * M.tacks[j + 1]; tg = Math.max(tg, Math.hypot(X[a] - X[b], X[a + 1] - X[b + 1], X[a + 2] - X[b + 2])); } msg.tackGap = tg; }
  postMessage(msg);
  if (done) running = false;
}
onmessage = function (e) {
  var q = e.data;
  try {
    if (q.cmd === 'build') build(q);
    else if (q.cmd === 'ack') { if (q.gen === gen) tick(); }
    else if (q.cmd === 'fabric' && sim) { // keep the current shape, re-settle in the new fabric
      if (q.sim) M.sim = q.sim; var keep = sim.x; sim = new FCDrape.Sim(M, body, q.fab || FCDrape.FABRICS[q.fabric]); sim.x.set(keep); sim.t = 1.3; running = true; tick();
    } else if (q.cmd === 'grab' && sim) { sim.startGrab(q.i, q.r); kick(); }
    else if (q.cmd === 'drag' && sim) { sim.moveGrab(q.t); kick(); }
    else if (q.cmd === 'release' && sim) { sim.endGrab(); kick(); }
    else if (q.cmd === 'pstart' && sim) { sim.startPanel(q.panel); kick(); }
    else if (q.cmd === 'pmove' && sim) { sim.movePanel(q.e); kick(); }
    else if (q.cmd === 'pend' && sim) { sim.endPanel(); kick(); }
    else if (q.cmd === 'pin' && sim) { sim.pin(q.i, q.on); kick(); }
    else if (q.cmd === 'freeze' && sim) { sim.freeze(q.panel, q.on); kick(); }
    else if (q.cmd === 'tack' && sim) { sim.tack(q.a, q.b); kick(); }
    else if (q.cmd === 'untack' && sim) { sim.clearTacks(); kick(); }
    else if (q.cmd === 'untackPairs' && sim) { sim.untack(q.pairs); kick(); }
    else if (q.cmd === 'zip' && sim) { var A = (M.segIdx[q.a[0] + '|' + q.a[1]] || []).slice(), B = (M.segIdx[q.b[0] + '|' + q.b[1]] || []).slice(), X = sim.x, pr = [];
      if (A.length && B.length) { var dd = function (i, j) { return Math.hypot(X[3 * i] - X[3 * j], X[3 * i + 1] - X[3 * j + 1], X[3 * i + 2] - X[3 * j + 2]); }; if (dd(A[0], B[0]) + dd(A[A.length - 1], B[B.length - 1]) > dd(A[0], B[B.length - 1]) + dd(A[A.length - 1], B[0])) B.reverse();
        var n = Math.max(A.length, B.length); for (var k = 0; k < n; k++) { var ia = A[Math.round(k * (A.length - 1) / Math.max(1, n - 1))], ib = B[Math.round(k * (B.length - 1) / Math.max(1, n - 1))]; sim.tack(ia, ib); pr.push(ia, ib); } }
      postMessage({ type: 'zipped', gen: gen, id: q.id, pairs: pr }); kick(); }
    else if (q.cmd === 'stiff' && sim) { sim.stiffen(q.panel, q.k); kick(); }
    else if (q.cmd === 'elastic' && sim) { var ids = []; (q.keys || []).forEach(function (k) { (M.segIdx[q.panel + '|' + k] || []).forEach(function (i) { if (ids.indexOf(i) < 0) ids.push(i); }); }); if (ids.length > 2) { sim.elastic(ids, q.ratio); kick(); } }
    else if (q.cmd === 'elasticAt' && sim) { // the edge of the piece nearest the clicked point gets elastic at the given length
      var pn = M.panel[q.i], best = null, bd = 1e9, X2 = sim.x; Object.keys(M.segIdx).forEach(function (k) { var parts = k.split('|'); if (+parts[0] !== pn) return; var L = M.segIdx[k]; for (var j = 0; j < L.length; j++) { var d = Math.hypot(X2[3 * L[j]] - X2[3 * q.i], X2[3 * L[j] + 1] - X2[3 * q.i + 1], X2[3 * L[j] + 2] - X2[3 * q.i + 2]); if (d < bd) { bd = d; best = k; } } });
      if (best && bd < 6) { sim.elastic(M.segIdx[best].slice(), q.ratio); postMessage({ type: 'elasticOn', gen: gen, key: best, ids: M.segIdx[best].slice(), ratio: q.ratio }); kick(); } else postMessage({ type: 'elasticOn', gen: gen, key: null }); }
    else if (q.cmd === 'unelastic' && sim) { sim.clearElastic(); kick(); }
    else if (q.cmd === 'pucker' && sim) { sim.pucker(q.a); kick(); }
    else if (q.cmd === 'pose' && sim) { if (!morph) startMorph(q.poseMap || presetMap(q.preset), 9); else { wantMap = q.poseMap || presetMap(q.preset); pending = true; } kick(); }
    else if (q.cmd === 'turn' && sim && !morph) { startMorph(FCDrape.turnBone(body, AV, poseMap, q.bone, q.m), 4); kick(); }
    else if (q.cmd === 'joints' && body) postMessage({ type: 'joints', gen: gen, joints: FCDrape.jointsPosed(body, AV, poseMap) });
    else if (q.cmd === 'pause') running = false;
    else if (q.cmd === 'resume' && sim && !sim.settled) { running = true; tick(); }
  } catch (err) { postMessage({ type: 'error', gen: q.gen || gen, message: String(err && err.message || err) }); }
};
