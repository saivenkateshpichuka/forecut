/* Forecut 3D Drape Studio: page, controls, 3D view and 2D pattern view. Desktop only. */
import * as THREE from './vendor/three.module.min.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { TransformControls } from './vendor/TransformControls.js';

const PM = window.PM, D = window.FCDrape, V = '__V__';
const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const KEY = 'fc-tool-drape';
const COLOURS = [['#f3efe6', 'Ecru'], ['#1f2a44', 'Navy'], ['#b5462f', 'Brick'], ['#2f5d50', 'Bottle green'], ['#d9a441', 'Turmeric'], ['#c9a7b6', 'Dusty rose'], ['#7c8ea3', 'Chambray'], ['#242424', 'Black']];
const NECK = [['round', 'Round'], ['crew', 'Crew'], ['deep', 'Deep round'], ['ushape', 'U-neck'], ['v', 'V-neck'], ['boat', 'Boat'], ['square', 'Square']];
const SLEEVE = { plain: 'Set-in sleeve', tee: 'T-shirt sleeve', puff: 'Puff sleeve', bell: 'Bell sleeve', cap: 'Cap sleeve', none: 'Sleeveless' };
const SLEEVES = { tshirt: ['tee', 'none'], top: ['plain', 'puff', 'bell', 'cap', 'none'], kurta: ['plain', 'bell', 'puff', 'cap', 'none'], dress: ['plain', 'puff', 'bell', 'cap', 'none'] };
const SLEN = [['cap', 'Cap'], ['short', 'Short'], ['elbow', 'Elbow'], ['3q', 'Three-quarter'], ['full', 'Full']];
const GENDER = { women: 'Female', men: 'Male', kids: 'Kids', unisex: 'Unisex' };
const TONES = [['form', '#d8d2c8', 'Grey form'], ['t1', '#efd3bd', 'Light'], ['t2', '#d9a988', 'Light medium'], ['t3', '#b98260', 'Medium'], ['t4', '#8a5a3c', 'Medium deep'], ['t5', '#5e3b27', 'Deep']];
const MEAS = [['height', 'Height'], ['bust', 'Bust / chest'], ['waist', 'Waist'], ['hip', 'Hip'], ['shoulder', 'Shoulder width'], ['nape', 'Back length (nape to waist)'], ['bicep', 'Upper arm']];
const SEAMC = ['#c4572f', '#2f6f8f', '#7a5c99', '#3d8a5a', '#b08a1e', '#a23b72', '#4a7d84', '#8c6d3f', '#5b6bbf', '#9c4f2f', '#3f7f3f', '#7f3f6f', '#2f8f7f', '#8f2f3f', '#6f6f2f', '#2f4f8f', '#b2672b', '#6a8f2f'];

let S = load();
try { const q = new URLSearchParams(location.search); if (D.STYLES[q.get('style')]) { S.style = q.get('style'); S.opts = {}; S.meas = {}; } if (GENDER[q.get('gender')]) S.gender = q.get('gender'); if (q.get('size')) S.size = q.get('size'); if (q.get('o')) { const o = JSON.parse(q.get('o')); S.opts = {}; ['len', 'ease', 'neck', 'sleeve', 'slen', 'flare', 'slit', 'slen2'].forEach(k => { const v = o[k]; if (v === undefined) return; if (/^[\d.]+$/.test(String(v))) S.opts[k] = Math.min(200, +v); else if ((k === 'neck' && NECK.some(n => n[0] === v)) || (k === 'sleeve' && SLEEVE[v]) || (k === 'slen' && SLEN.some(n => n[0] === v))) S.opts[k] = v; }); } if (q.get('m')) { const mm = JSON.parse(q.get('m')); S.meas = {}; MEAS.forEach(k => { if (+mm[k[0]] > 0) S.meas[k[0]] = +mm[k[0]]; }); } if (q.get('style')) history.replaceState(null, '', location.pathname); } catch (e) { }
function defaults() { return { style: 'tshirt', gender: 'women', size: 'M', fabric: 'jersey', colour: '#7c8ea3', opts: {}, meas: {}, fit: 'off', bodyOn: true, seamsOn: true, quality: 'std', tone: 'form', tool: 'pull' }; }
function load() { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v && D.STYLES[v.style]) return Object.assign(defaults(), v); } catch (e) { } return defaults(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

/* ---------- layout ---------- */
const app = $('#app');
app.innerHTML = `<div class="dr">
  <aside class="dr-ctl" aria-label="Garment, body and fabric">
    <section><h2>Garment</h2><label>Style<select id="drStyle"></select></label><div id="drOpts" class="dr-opts"></div></section>
    <section><h2>Avatar</h2><div class="dr-two"><label>Body<select id="drGender"></select></label><label>Size<select id="drSize"></select></label></div>
      <div class="dr-sw dr-tone" id="drTone" role="radiogroup" aria-label="Avatar skin tone"></div>
      <details id="drMeasBox"><summary>Adjust measurements</summary><div id="drMeas" class="dr-meas"></div><button type="button" class="dr-link" id="drMeasReset">Back to the size chart</button></details></section>
    <section><h2>Fabric</h2><label>Fabric<select id="drFabric"></select></label><p class="dr-note" id="drFabNote"></p>
      <div class="dr-sw" id="drSw" role="radiogroup" aria-label="Colour"></div><label class="dr-cc">Own colour <input type="color" id="drColour"></label></section>
    <section class="dr-acts"><button type="button" class="dr-p" id="drSew">Sew and drape again</button><button type="button" id="drPause">Pause</button>
      <label class="dr-q">Detail<select id="drQuality"><option value="fast">Fast</option><option value="std">Standard</option><option value="fine">Fine</option></select></label></section>
  </aside>
  <section class="dr-view" aria-label="3D view">
    <canvas id="drCanvas" aria-label="3D view of the garment on the body form. Drag to turn, scroll to zoom."></canvas>
    <div class="dr-bar" role="toolbar" aria-label="View">
      <div class="dr-seg" id="drViews"><button data-v="front" aria-pressed="true">Front</button><button data-v="q">¾</button><button data-v="side">Side</button><button data-v="back">Back</button></div>
      <div class="dr-seg" id="drFit"><button data-f="off">Fabric</button><button data-f="fit">Fit map</button><button data-f="strain">Stretch map</button></div>
      <div class="dr-seg"><button id="drBody" aria-pressed="true">Avatar</button><button id="drSeams" aria-pressed="true">Seams</button></div>
      <div class="dr-seg" id="drTool" aria-label="Mouse tool"><button data-t="pull" title="Drag the fabric to pull it, as you would on a real garment">Pull fabric</button><button data-t="move" title="Click a piece, then move or rotate it with the gizmo">Move piece</button></div>
      <div class="dr-seg" id="drGz" hidden><button data-g="translate" aria-pressed="true" title="Move (W)">Move</button><button data-g="rotate" title="Rotate (E)">Rotate</button><button data-g="done" title="Finish (Esc)">Done</button></div>
    </div>
    <div class="dr-status" id="drStatus" role="status" aria-live="polite">Preparing…</div>
    <div class="dr-legend" id="drLegend" hidden></div>
    <p class="dr-hint" id="drHint">Drag the fabric to pull it · Drag the background to turn · Scroll to zoom · Right-drag to pan · Click an axis to snap the view</p>
  </section>
  <aside class="dr-2d" aria-label="Pattern pieces and measurements">
    <section><h2>Pattern pieces</h2><p class="dr-note">Matching colours are sewn together.</p><div id="drPieces"></div></section>
    <section><h2>Garment and body</h2><table class="dr-tab" id="drTab"></table></section>
    <section class="dr-pm"><a href="pattern-maker.html" target="_blank" rel="noopener" id="drPM">Open this pattern in Pattern Maker ↗</a>
      <p class="dr-note">The 3D view shows proportion, balance and where the garment touches the body. It is a preview, not a fit sample: always sew a toile before production.</p></section>
  </aside>
</div>`;

/* ---------- controls ---------- */
function opt(v, l, cur) { return `<option value="${esc(v)}"${String(v) === String(cur) ? ' selected' : ''}>${esc(l)}</option>`; }
function style() { return D.STYLES[S.style]; }
function gar() { return PM.GARMENTS[style().gid]; }
function genders() { return gar().g.filter(g => g !== 'unisex' || !gar().g.includes('men')); }
function sizes() { return Object.keys(PM.CHARTS[S.gender]); }
function baseMeas() {
  const m = Object.assign({}, PM.CHARTS[S.gender][S.size]); Object.keys(S.meas || {}).forEach(k => { if (k !== 'height' && +S.meas[k] > 0) m[k] = +S.meas[k]; });
  if (S.meas && +S.meas.bust > 0 && S.gender === 'women') m.bust_depth = Math.round((m.bust / 12 + 16.5) * 2) / 2;
  return m;
}
function baseOpts() { // the same starting values as Pattern Maker
  const o = Object.assign({}, gar().d, style().def || {}), gid = style().gid;
  if (S.gender === 'kids') { if (o.len) o.len = Math.round(o.len * .62); if (o.slen2) o.slen2 = Math.round(o.slen2 * .6); if (o.ease) o.ease = Math.max(6, Math.round(o.ease * .75)); if (o.slit) o.slit = 12; }
  if (S.gender === 'men' && gid === 'kurta') o.len = 102; if (S.gender === 'men' && gid === 'tshirt') o.len = 72;
  return o;
}
function optVal(k) { return Object.assign(baseOpts(), S.opts)[k]; }
function rng(k, lo, hi) { const b = baseOpts()[k]; return [Math.round(b * lo), Math.round(b * hi)]; }

function renderControls() {
  $('#drStyle').innerHTML = Object.keys(D.STYLES).map(k => opt(k, D.STYLES[k].n, S.style)).join('');
  if (!genders().includes(S.gender)) S.gender = genders()[0];
  if (!sizes().includes(S.size)) S.size = sizes()[Math.min(2, sizes().length - 1)];
  $('#drGender').innerHTML = genders().map(g => opt(g, GENDER[g], S.gender)).join('');
  $('#drSize').innerHTML = sizes().map(s => opt(s, s, S.size)).join('');
  $('#drFabric').innerHTML = Object.keys(D.FABRICS).map(k => opt(k, D.FABRICS[k].n + ' · ' + D.FABRICS[k].gsm + ' gsm', S.fabric)).join('');
  $('#drFabNote').textContent = D.FABRICS[S.fabric].note;
  $('#drSw').innerHTML = COLOURS.map(c => `<button type="button" role="radio" aria-checked="${c[0] === S.colour}" title="${c[1]}" aria-label="${c[1]}" data-c="${c[0]}" style="background:${c[0]}"></button>`).join('');
  $('#drColour').value = S.colour;
  $('#drQuality').value = S.quality;
  const st = style(), G = gar(), h = [];
  if (st.kind === 'torso') {
    h.push(`<label>Neckline<select data-o="neck">${NECK.map(n => opt(n[0], n[1], optVal('neck'))).join('')}</select></label>`);
    const sl = SLEEVES[st.gid];
    if (sl) h.push(`<label>Sleeve<select data-o="sleeve">${sl.map(k => opt(k, SLEEVE[k], optVal('sleeve'))).join('')}</select></label>`);
    if (G.o.includes('slen') && optVal('sleeve') !== 'none') h.push(`<label>Sleeve length<select data-o="slen">${SLEN.map(n => opt(n[0], n[1], optVal('slen'))).join('')}</select></label>`);
    const lr = rng('len', .62, 1.3);
    h.push(`<label>Length from shoulder <output>${optVal('len')} cm</output><input type="range" data-o="len" min="${lr[0]}" max="${lr[1]}" step="1" value="${optVal('len')}"></label>`);
    h.push(`<label>Ease at chest <output>${optVal('ease')} cm</output><input type="range" data-o="ease" min="0" max="30" step="1" value="${optVal('ease')}"></label>`);
    if (G.o.includes('flare')) h.push(`<label>Flare at hem, each side <output>${optVal('flare')} cm</output><input type="range" data-o="flare" min="0" max="20" step="1" value="${optVal('flare')}"></label>`);
    if (G.o.includes('slit')) h.push(`<label>Side slit <output>${optVal('slit')} cm</output><input type="range" data-o="slit" min="0" max="50" step="1" value="${optVal('slit')}"></label>`);
  } else {
    const sr = rng('slen2', .6, 1.55);
    h.push(`<label>Skirt length <output>${optVal('slen2')} cm</output><input type="range" data-o="slen2" min="${sr[0]}" max="${sr[1]}" step="1" value="${optVal('slen2')}"></label>`);
    if (S.style === 'aline') h.push(`<label>Flare at hem, each side <output>${optVal('flare')} cm</output><input type="range" data-o="flare" min="2" max="20" step="1" value="${optVal('flare')}"></label>`);
  }
  $('#drOpts').innerHTML = h.join('');
  const m = baseMeas(); m.height = +(S.meas || {}).height || (lastBody ? Math.round(lastBody.height) : '');
  $('#drMeas').innerHTML = MEAS.filter(k => st.kind === 'torso' || ['height', 'waist', 'hip'].includes(k[0])).map(k => `<label>${k[1]}<span><input type="number" step="0.5" min="20" max="230" data-m="${k[0]}" value="${m[k[0]]}"> cm</span></label>`).join('');
  $('#drTone').innerHTML = TONES.map(t => `<button type="button" role="radio" aria-checked="${t[0] === S.tone}" title="${t[2]}" aria-label="${t[2]}" data-tone="${t[0]}" style="background:${t[1]}"></button>`).join('');
  $$('#drTool button').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === S.tool));
  $$('#drViews button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === view));
  $$('#drFit button').forEach(b => b.setAttribute('aria-pressed', b.dataset.f === S.fit));
  $('#drBody').setAttribute('aria-pressed', S.bodyOn); $('#drSeams').setAttribute('aria-pressed', S.seamsOn);
}
function $$(s, r) { return Array.from((r || document).querySelectorAll(s)); }

let tmr = 0;
function later(fn, ms) { clearTimeout(tmr); tmr = setTimeout(fn, ms || 350); }
$('#drStyle').addEventListener('change', e => { S.style = e.target.value; S.opts = {}; save(); renderControls(); rebuild(); });
$('#drGender').addEventListener('change', e => { S.gender = e.target.value; S.meas = {}; S.opts = {}; save(); renderControls(); rebuild(); });
$('#drSize').addEventListener('change', e => { S.size = e.target.value; S.meas = {}; save(); renderControls(); rebuild(); });
$('#drFabric').addEventListener('change', e => { S.fabric = e.target.value; save(); $('#drFabNote').textContent = D.FABRICS[S.fabric].note; applyMaterial(); if (worker && built) { worker.postMessage({ cmd: 'fabric', fabric: S.fabric }); status('Draping in ' + D.FABRICS[S.fabric].n.toLowerCase() + '…', 'run'); } });
$('#drQuality').addEventListener('change', e => { S.quality = e.target.value; save(); rebuild(); });
$('#drOpts').addEventListener('input', e => { const k = e.target.dataset.o; if (!k) return; const v = e.target.type === 'range' ? +e.target.value : e.target.value; S.opts[k] = v; const o = e.target.parentNode.querySelector('output'); if (o) o.textContent = v + ' cm'; save(); if (e.target.tagName === 'SELECT') { renderControls(); rebuild(); } else later(rebuild); });
$('#drMeas').addEventListener('input', e => { const k = e.target.dataset.m; if (!k) return; S.meas[k] = +e.target.value; save(); later(rebuild, 600); });
$('#drMeasReset').addEventListener('click', () => { S.meas = {}; save(); renderControls(); rebuild(); });
$('#drSw').addEventListener('click', e => { const c = e.target.dataset && e.target.dataset.c; if (!c) return; S.colour = c; save(); $$('#drSw button').forEach(b => b.setAttribute('aria-checked', b.dataset.c === c)); $('#drColour').value = c; applyMaterial(); });
$('#drColour').addEventListener('input', e => { S.colour = e.target.value; save(); $$('#drSw button').forEach(b => b.setAttribute('aria-checked', b.dataset.c === S.colour)); applyMaterial(); });
$('#drSew').addEventListener('click', () => rebuild());
$('#drTone').addEventListener('click', e => { const t = e.target.dataset && e.target.dataset.tone; if (!t) return; S.tone = t; save(); $$('#drTone button').forEach(b => b.setAttribute('aria-checked', b.dataset.tone === t)); tintBody(); });
$('#drTool').addEventListener('click', e => { const t = e.target.dataset.t; if (!t) return; S.tool = t; save(); $$('#drTool button').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === t)); if (t === 'pull') selectPanel(-1); $('#drHint').textContent = t === 'move' ? 'Click a piece to move or rotate it · Drag the background to turn' : 'Drag the fabric to pull it · Drag the background to turn · Scroll to zoom · Right-drag to pan · Click an axis to snap the view'; });
$('#drGz').addEventListener('click', e => { const g = e.target.dataset.g; if (!g) return; if (g === 'done') { selectPanel(-1); return; } tc.setMode(g); $$('#drGz button').forEach(b => b.setAttribute('aria-pressed', b.dataset.g === g)); });
window.addEventListener('keydown', e => { if (selPanel < 0 || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return; if (e.key === 'w' || e.key === 'W') $('[data-g=translate]').click(); else if (e.key === 'e' || e.key === 'E') $('[data-g=rotate]').click(); else if (e.key === 'Escape') selectPanel(-1); });
$('#drPause').addEventListener('click', e => { if (!worker) return; paused = !paused; worker.postMessage({ cmd: paused ? 'pause' : 'resume' }); e.target.textContent = paused ? 'Resume' : 'Pause'; if (!paused) worker.postMessage({ cmd: 'ack', gen }); });
$('#drViews').addEventListener('click', e => { const v = e.target.dataset.v; if (v) setView(v, true); });
$('#drFit').addEventListener('click', e => { const f = e.target.dataset.f; if (!f) return; S.fit = f; save(); $$('#drFit button').forEach(b => b.setAttribute('aria-pressed', b.dataset.f === f)); paintFit(); });
$('#drBody').addEventListener('click', e => { S.bodyOn = !S.bodyOn; save(); e.target.setAttribute('aria-pressed', S.bodyOn); bodyGroup.visible = S.bodyOn; dirty = true; });
$('#drSeams').addEventListener('click', e => { S.seamsOn = !S.seamsOn; save(); e.target.setAttribute('aria-pressed', S.seamsOn); if (seamMesh) seamMesh.visible = S.seamsOn; dirty = true; });

/* ---------- 3D scene ---------- */
const canvas = $('#drCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#ece7de');
const camera = new THREE.PerspectiveCamera(28, 1, 5, 3000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = .09; controls.minDistance = 60; controls.maxDistance = 900; controls.maxPolarAngle = Math.PI * .92;
controls.addEventListener('change', () => { dirty = true; });
scene.add(new THREE.HemisphereLight(0xfffaf2, 0xb9ad9c, 1.45));
const key = new THREE.DirectionalLight(0xffffff, 2.1); key.position.set(120, 260, 220); key.castShadow = true;
key.shadow.mapSize.set(4096, 4096); Object.assign(key.shadow.camera, { left: -110, right: 110, top: 200, bottom: -20, near: 50, far: 700 }); key.shadow.bias = -.0008; key.shadow.normalBias = 1.4;
scene.add(key);
const fill = new THREE.DirectionalLight(0xdfe8ff, .55); fill.position.set(-220, 120, -60); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 1.1); rim.position.set(-80, 220, -260); scene.add(rim);
const floor = new THREE.Mesh(new THREE.CircleGeometry(160, 64), new THREE.MeshStandardMaterial({ color: '#e3ddd2', roughness: 1 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const bodyGroup = new THREE.Group(); scene.add(bodyGroup);
const bodyMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .62, metalness: 0 });

const UNDER = { form: '#a9a39a', t1: '#3b3f46', t2: '#3b3f46', t3: '#2f3237', t4: '#e9e4dc', t5: '#e9e4dc' };
const bodyU = { skin: { value: new THREE.Color() }, cloth: { value: new THREE.Color() }, pt: { value: 0 }, lc: { value: 0 }, lr: { value: 0 }, hh: { value: 1 }, bl: { value: 0 }, bh: { value: 0 } };
bodyMat.onBeforeCompile = sh => { // underwear drawn per pixel from heights, so its edges are clean
  Object.assign(sh.uniforms, bodyU);
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float elig; varying float vEl; varying vec3 vW;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvEl = elig; vW = (modelMatrix * vec4(position, 1.0)).xyz;');
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 skin; uniform vec3 cloth; uniform float pt, lc, lr, hh, bl, bh; varying float vEl; varying vec3 vW;')
    .replace('#include <color_fragment>', `#include <color_fragment>
      float ax = abs(vW.x), cut = lc + lr * smoothstep(.25, .95, ax / hh);
      float pants = step(.5, vEl) * step(vW.y, pt) * step(cut, vW.y);
      float bra = step(.5, vEl) * step(bl, vW.y) * step(vW.y, bh) * step(.01, bh - bl);
      float u = max(pants, bra); diffuseColor.rgb = mix(skin, cloth, u);`);
};
function buildBody(body) {
  bodyGroup.clear();
  const g = new THREE.BufferGeometry(), n = body.pos.length / 3;
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(body.pos), 3));
  g.setIndex(new THREE.BufferAttribute(new Uint16Array(body.tri), 1));
  const el = new Float32Array(n); for (let i = 0; i < n; i++) el[i] = body.mask[i] / 255; g.setAttribute('elig', new THREE.BufferAttribute(el, 1));
  g.computeVertexNormals();
  // draw the skin a little inside the collision surface so it never shows through the cloth
  const p = g.attributes.position, nr = g.attributes.normal; for (let i = 0; i < n; i++) p.setXYZ(i, p.getX(i) - nr.getX(i) * .55, p.getY(i) - nr.getY(i) * .55, p.getZ(i) - nr.getZ(i) * .55);
  const u = body.under; bodyU.pt.value = u.pantsTop; bodyU.lc.value = u.legCut; bodyU.lr.value = u.legRise; bodyU.hh.value = u.hipHalf; bodyU.bl.value = u.braLo; bodyU.bh.value = u.braHi;
  bodyMesh = new THREE.Mesh(g, bodyMat); bodyMesh.castShadow = bodyMesh.receiveShadow = true; bodyGroup.add(bodyMesh);
  tintBody(); bodyGroup.visible = S.bodyOn;
}
let bodyMesh = null;
function tintBody() { const t = TONES.find(x => x[0] === S.tone) || TONES[0]; bodyU.skin.value.set(t[1]); bodyU.cloth.value.set(UNDER[t[0]]); dirty = true; }

/* fabric surface: a fine weave or knit bump so the cloth reads as cloth up close */
function weaveTex(kind) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#808080'; g.fillRect(0, 0, 128, 128);
  if (kind === 'knit') { g.strokeStyle = '#b0b0b0'; g.lineWidth = 3; for (let x = 0; x < 128; x += 8) for (let y = 0; y < 128; y += 10) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 4, y + 7); g.lineTo(x + 8, y); g.stroke(); } }
  else if (kind === 'twill') { g.strokeStyle = '#a8a8a8'; g.lineWidth = 3; for (let k = -128; k < 256; k += 6) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 128, 128); g.stroke(); } }
  else { for (let x = 0; x < 128; x += 4) for (let y = 0; y < 128; y += 4) { g.fillStyle = ((x + y) / 4) % 2 ? '#9a9a9a' : '#6a6a6a'; g.fillRect(x, y, 4, 4); } }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const TEX = { knit: weaveTex('knit'), twill: weaveTex('twill'), plain: weaveTex('plain') };
const garMat = new THREE.MeshStandardMaterial({ color: S.colour, roughness: .85, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
garMat.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\nif (!gl_FrontFacing) diffuseColor.rgb *= 0.78;'); };
function applyMaterial() {
  const f = D.FABRICS[S.fabric], kind = /jersey|fleece/.test(S.fabric) ? 'knit' : S.fabric === 'denim' ? 'twill' : 'plain';
  garMat.color.set(S.fit === 'off' ? S.colour : '#ffffff'); garMat.roughness = f.rough; garMat.bumpMap = TEX[kind]; garMat.bumpScale = kind === 'plain' ? .25 : .45;
  garMat.vertexColors = S.fit !== 'off' || selPanel >= 0; garMat.needsUpdate = true;
  if (seamMat) seamMat.color.set(new THREE.Color(S.colour).multiplyScalar(.55));
  dirty = true;
}
let garMesh = null, seamMesh = null, seamMat = null, posAttr = null, colAttr = null, lastGap = null, lastStrain = null, panelOf = null, selPanel = -1, lastMesh = null;
function buildGarment(d) {
  if (garMesh) { scene.remove(garMesh); garMesh.geometry.dispose(); }
  if (seamMesh) { scene.remove(seamMesh); seamMesh.geometry.dispose(); }
  const g = new THREE.BufferGeometry(), n = d.x.length / 3;
  posAttr = new THREE.BufferAttribute(new Float32Array(d.x), 3); posAttr.setUsage(THREE.DynamicDrawUsage);
  g.setAttribute('position', posAttr);
  const uv = new Float32Array(n * 2); for (let i = 0; i < n * 2; i++) uv[i] = d.uv[i] / 1.2; g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  colAttr = new THREE.BufferAttribute(new Float32Array(n * 3).fill(1), 3); g.setAttribute('color', colAttr);
  g.setIndex(new THREE.BufferAttribute(d.tri, 1)); g.computeVertexNormals();
  garMesh = new THREE.Mesh(g, garMat); garMesh.castShadow = garMesh.receiveShadow = true; scene.add(garMesh);
  const li = []; d.seamLines.forEach(ids => { for (let i = 1; i < ids.length; i++) li.push(ids[i - 1], ids[i]); });
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', posAttr); sg.setIndex(li);
  seamMat = seamMat || new THREE.LineBasicMaterial({ color: '#333' });
  seamMesh = new THREE.LineSegments(sg, seamMat); seamMesh.visible = S.seamsOn; scene.add(seamMesh);
  lastGap = lastStrain = null; applyMaterial();
}
function ramp(stops, v) { for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) { const a = stops[i - 1], b = stops[i], t = Math.max(0, (v - a[0]) / (b[0] - a[0])); return [0, 1, 2].map(k => a[1][k] + (b[1][k] - a[1][k]) * t); } return stops[stops.length - 1][1]; }
const FITR = [[-1, [.82, .18, .16]], [.45, [.85, .25, .18]], [1.2, [.96, .62, .2]], [2.5, [.96, .9, .45]], [4.5, [.45, .76, .52]], [8, [.3, .55, .8]], [99, [.3, .55, .8]]];
const STRR = [[.9, [.3, .5, .85]], [.985, [.6, .78, .92]], [1.0, [.86, .9, .86]], [1.02, [.96, .86, .4]], [1.06, [.94, .5, .2]], [1.15, [.82, .16, .16]], [9, [.82, .16, .16]]];
function paintFit() {
  const lg = $('#drLegend');
  if (S.fit === 'fit') lg.innerHTML = '<b>Fit map</b><span><i style="background:#d33"></i>Touching, holds the garment</span><span><i style="background:#f4a03a"></i>Close, under 1.5 cm</span><span><i style="background:#f5e277"></i>1.5 to 3 cm</span><span><i style="background:#6fbf85"></i>3 to 6 cm</span><span><i style="background:#4d8ccc"></i>Hangs away, over 6 cm</span>';
  else if (S.fit === 'strain') lg.innerHTML = '<b>Stretch map</b><span><i style="background:#9cc6ea"></i>Compressed, folds</span><span><i style="background:#dce6dc"></i>Relaxed</span><span><i style="background:#f5d566"></i>Stretched 2 to 6%</span><span><i style="background:#d33"></i>Strained, over 10%</span>';
  lg.hidden = S.fit === 'off';
  if (colAttr) {
    const src = S.fit === 'fit' ? lastGap : S.fit === 'strain' ? lastStrain : null, c = colAttr.array;
    if (src) for (let i = 0; i < src.length; i++) { const v = ramp(S.fit === 'fit' ? FITR : STRR, src[i]); c[3 * i] = v[0]; c[3 * i + 1] = v[1]; c[3 * i + 2] = v[2]; }
    else c.fill(1);
    if (selPanel >= 0 && panelOf) for (let i = 0; i < panelOf.length; i++) if (panelOf[i] === selPanel) { c[3 * i] *= .7; c[3 * i + 1] *= .86; c[3 * i + 2] = Math.min(1, c[3 * i + 2] * 1.1 + .1); }
    colAttr.needsUpdate = true;
  }
  applyMaterial();
}

/* ---------- camera ---------- */
let view = 'front';
const tgt = new THREE.Vector3(0, 100, 0);
function setView(v, anim) {
  view = v; $$('#drViews button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v));
  const d = camDist, a = { front: 0, q: Math.PI / 4.2, side: Math.PI / 2, back: Math.PI }[v];
  const to = new THREE.Vector3(tgt.x + d * Math.sin(a), tgt.y + 10, tgt.z + d * Math.cos(a));
  if (!anim) { camera.position.copy(to); controls.target.copy(tgt); controls.update(); dirty = true; return; }
  const from = camera.position.clone(), ft = controls.target.clone(), t0 = performance.now();
  (function go() { const t = Math.min(1, (performance.now() - t0) / 450), e = t * t * (3 - 2 * t); camera.position.lerpVectors(from, to, e); controls.target.lerpVectors(ft, tgt, e); controls.update(); dirty = true; if (t < 1) requestAnimationFrame(go); })();
}
function fitTarget(body, d) {
  let lo = 1e9, hi = -1e9; for (let i = 1; i < d.x.length; i += 3) { lo = Math.min(lo, d.x[i]); hi = Math.max(hi, d.x[i]); }
  const top = body.height, bot = Math.max(0, Math.min(lo, body.y.waist) - 12);
  tgt.set(0, (top + bot) / 2, 0);
  const asp = Math.max(.6, camera.aspect || 1), half = (top - bot) / 2 * 1.12, wide = 70 / asp;
  camDist = Math.max(half, wide) / Math.tan(camera.fov * Math.PI / 360);
}
let camDist = 330;

/* ---------- 2D pattern view ---------- */
function drawPieces(d) {
  const P = d.panels.filter(p => p.name !== 'SL'), seamColour = {};
  d.seams.forEach((sm, i) => { const c = SEAMC[i % SEAMC.length]; seamColour[sm[0][0] + '|' + sm[0][1]] = c; seamColour[sm[1][0] + '|' + sm[1][1]] = c; });
  const names = { F: 'Front', B: 'Back', SR: 'Sleeve' }, boxes = [];
  P.forEach(p => { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; p.segs.forEach(s => s.pts.forEach(q => { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); })); boxes.push({ x0, x1, y0, y1 }); });
  let ox = 0, maxH = 0; const place = boxes.map(b => { const o = ox - b.x0; ox += b.x1 - b.x0 + 8; maxH = Math.max(maxH, b.y1 - b.y0); return o; });
  const W = ox - 8, H = maxH + 12;
  let svg = `<svg viewBox="-2 -8 ${W + 4} ${H + 2}" role="img" aria-label="Flat pattern pieces with matching seams in the same colour">`;
  P.forEach((p, k) => {
    const pi = d.panels.indexOf(p), b = boxes[k], dx = place[k], dy = -b.y0;
    const all = []; p.segs.forEach((s, i) => s.pts.forEach((q, j) => { if (i && !j) return; all.push(q); }));
    svg += `<path data-pi="${pi}" class="dr-pc${pi === selPanel ? ' on' : ''}" d="M${all.map(q => (q[0] + dx).toFixed(1) + ' ' + (q[1] + dy).toFixed(1)).join('L')}Z"><title>Click to move or rotate this piece in 3D</title></path>`;
    p.segs.forEach(s => { const c = seamColour[pi + '|' + s.key]; svg += `<polyline points="${s.pts.map(q => (q[0] + dx).toFixed(1) + ',' + (q[1] + dy).toFixed(1)).join(' ')}" fill="none" stroke="${c || '#6a6157'}" stroke-width="${c ? 1.3 : .7}" stroke-linejoin="round"${c ? '' : ' stroke-dasharray="2 1.2"'}/>`; });
    svg += `<text x="${(b.x0 + b.x1) / 2 + dx}" y="${(b.y0 + b.y1) / 2 + dy}" text-anchor="middle" font-size="4.2" fill="#6a6157">${names[p.name] || p.name}${p.name === 'SR' ? ' ×2' : ''}</text>`;
  });
  svg += '</svg>';
  $('#drPieces').innerHTML = svg + '<p class="dr-note">Front and back are shown opened out from the fold. Dashed edges are hems and necklines. Click a piece to move it in 3D.</p>';
}
function drawTable(d, m) {
  const r = [], info = d.info || {};
  const row = (a, b, c, e) => r.push(`<tr><th>${a}</th><td>${b}</td><td>${c}</td><td>${e}</td></tr>`);
  const f = v => (Math.round(v * 2) / 2).toString().replace(/\.0$/, '');
  if (info['Finished chest']) row('Chest', f(m.bust), f(info['Finished chest']), '+' + f(info['Finished chest'] - m.bust));
  if (info['Finished waist']) row('Waist', f(m.waist), f(info['Finished waist']), (info['Finished waist'] >= m.waist ? '+' : '') + f(info['Finished waist'] - m.waist));
  if (info['Finished hip']) row('Hip', f(m.hip), f(info['Finished hip']), '+' + f(info['Finished hip'] - m.hip));
  if (info['Armhole (front + back)']) row('Armhole', '', f(info['Armhole (front + back)']), '');
  if (info['Sleeve cap ease'] > .4) row('Sleeve cap ease', '', '', f(info['Sleeve cap ease']));
  $('#drTab').innerHTML = '<thead><tr><th></th><th>Body</th><th>Garment</th><th>Ease</th></tr></thead><tbody>' + r.join('') + '</tbody>' + '<caption>All in cm. ' + esc(d.label || '') + ', size ' + esc(S.size) + (Object.keys(S.meas || {}).length ? ' (your measurements)' : '') + '.</caption>';
}

/* ---------- worker ---------- */
let worker = null, gen = 0, built = false, paused = false, dirty = true, curBody = null, lastBody = null;
function status(t, k) { const s = $('#drStatus'); s.textContent = t; s.dataset.k = k || ''; }
function rebuild() {
  if (!worker) { worker = new Worker('tools/drape-worker.js?v=' + V); worker.onmessage = onMsg; worker.onerror = () => status('The 3D engine could not start in this browser.', 'err'); }
  gen++; built = false; paused = false; $('#drPause').textContent = 'Pause';
  const m = baseMeas(), opts = Object.assign(baseOpts(), S.opts);
  status(lastBody ? 'Cutting and sewing the pieces…' : 'Loading the avatar…', 'run');
  worker.postMessage({ cmd: 'build', gen, style: S.style, gender: S.gender, size: S.size, height: +(S.meas || {}).height || 0, m, opts, fabric: S.fabric, h: { fast: 3, std: 2.3, fine: 1.8 }[S.quality] || 2.3 });
}
function onMsg(e) {
  const d = e.data; if (d.gen !== gen) return;
  if (d.type === 'error') { status(d.message, 'err'); return; }
  if (d.type === 'body') {
    if (!d.same) { lastBody = d; curBody = d; buildBody(d); const hi = $('#drMeas [data-m=height]'); if (hi && !(+(S.meas || {}).height)) hi.value = Math.round(d.height); }
    status('Cutting and sewing the pieces…', 'run'); return;
  }
  if (d.type === 'mesh') {
    built = true; panelOf = d.panel; lastMesh = d; selPanel = -1; tc.detach(); $('#drGz').hidden = true; buildGarment(d); drawPieces(d); drawTable(d, baseMeas()); fitTarget(curBody, d); setView(view, false);
    $('#drPM').href = 'pattern-maker.html'; return;
  }
  if (d.type === 'frame') {
    posAttr.array.set(d.x); posAttr.needsUpdate = true; garMesh.geometry.computeVertexNormals(); garMesh.geometry.computeBoundingSphere(); dirty = true;
    if (d.gap) { lastGap = d.gap; lastStrain = d.strain; if (S.fit !== 'off') paintFit(); }
    status(d.done ? 'Settled · ' + D.FABRICS[S.fabric].n : pulling ? 'Pulling the fabric…' : moving ? 'Moving the piece…' : d.t < .7 ? 'Sewing the seams…' : 'Draping…', d.done ? 'ok' : 'run');
    if (!d.done && !paused) requestAnimationFrame(() => worker.postMessage({ cmd: 'ack', gen }));
  }
}

/* ---------- loop, resize, save image, backup ---------- */
function size() { const r = canvas.parentNode.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); dirty = true; }
new ResizeObserver(size).observe(canvas.parentNode);
function loop() { requestAnimationFrame(loop); if (controls.update()) dirty = true; if (dirty) { draw(); dirty = false; } }
const pb = $('#print'); if (pb) pb.addEventListener('click', () => { draw(true); const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = 'forecut-3d-' + S.style + '-' + S.gender + '-' + S.size + '.png'; a.click(); });
const bk = $('#backup'); if (bk) bk.addEventListener('click', () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(Object.assign({ v: 1, tool: 'drape' }, S), null, 1)], { type: 'application/json' })); a.download = 'forecut-3d-drape-backup.json'; a.click(); });
const rs = $('#restore'), rf = $('#restoreFile');
if (rs && rf) { rs.addEventListener('click', () => rf.click()); rf.addEventListener('change', () => { const f = rf.files[0]; if (!f) return; f.text().then(t => { const x = JSON.parse(t); if (x && x.tool === 'drape' && D.STYLES[x.style]) { S = Object.assign(defaults(), x); save(); renderControls(); rebuild(); } else alert('This is not a 3D Drape Studio backup.'); }).catch(() => alert('Could not read that file.')); rf.value = ''; }); }
const ex = $('#fxExample'); if (ex) ex.addEventListener('click', () => { S = Object.assign(defaults(), { style: 'kurta', gender: 'women', size: 'M', fabric: 'rayon', colour: '#d9a441', opts: { sleeve: 'plain', slen: '3q' } }); save(); renderControls(); rebuild(); });

/* ---------- view gizmo (corner axes: click one to look along it) ---------- */
const gzScene = new THREE.Scene(), gzCam = new THREE.OrthographicCamera(-1.7, 1.7, 1.7, -1.7, .1, 10), gzRoot = new THREE.Group(), gzPick = [], GZ = 104;
gzCam.position.set(0, 0, 5); gzScene.add(gzRoot); gzScene.add(new THREE.AmbientLight(0xffffff, 3));
function label(t, col) { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.fillStyle = col; g.beginPath(); g.arc(32, 32, 30, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '700 34px DM Sans, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, 32, 35); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false })); s.scale.set(.56, .56, 1); return s; }
[[new THREE.Vector3(1, 0, 0), '#d64b47', 'X'], [new THREE.Vector3(0, 1, 0), '#4f9d55', 'Y'], [new THREE.Vector3(0, 0, 1), '#3f72c9', 'Z']].forEach(([d, col, t]) => {
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, 1, 8), new THREE.MeshBasicMaterial({ color: col })); bar.position.copy(d).multiplyScalar(.5); bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); gzRoot.add(bar);
  const pos = label(t, col); pos.position.copy(d); pos.userData.dir = d.clone(); gzRoot.add(pos); gzPick.push(pos);
  const neg = new THREE.Mesh(new THREE.SphereGeometry(.15, 16, 12), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .55 })); neg.position.copy(d).multiplyScalar(-1); neg.userData.dir = d.clone().multiplyScalar(-1); gzRoot.add(neg); gzPick.push(neg);
});
const gzDisc = new THREE.Mesh(new THREE.CircleGeometry(1.55, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55, depthTest: false })); gzDisc.renderOrder = -1; gzScene.add(gzDisc);
function gzRect() { const r = canvas.getBoundingClientRect(); return { x: r.width - GZ - 12, y: 56, w: GZ, h: GZ, W: r.width, H: r.height }; }
function draw(full) {
  renderer.autoClear = false; renderer.clear(); renderer.render(scene, camera);
  if (full) return;
  const g = gzRect(); gzRoot.quaternion.copy(camera.quaternion).invert();
  renderer.clearDepth(); renderer.setScissorTest(true); renderer.setScissor(g.x, g.H - g.y - g.h, g.w, g.h); renderer.setViewport(g.x, g.H - g.y - g.h, g.w, g.h);
  renderer.render(gzScene, gzCam); renderer.setScissorTest(false); renderer.setViewport(0, 0, g.W, g.H);
}
function gzHit(e) {
  const r = canvas.getBoundingClientRect(), g = gzRect(), x = e.clientX - r.left - g.x, y = e.clientY - r.top - g.y;
  if (x < 0 || y < 0 || x > g.w || y > g.h) return null;
  const rc = new THREE.Raycaster(); rc.setFromCamera(new THREE.Vector2(x / g.w * 2 - 1, -(y / g.h) * 2 + 1), gzCam);
  const h = rc.intersectObjects(gzPick, false)[0]; return h ? h.object.userData.dir : 'pad';
}
function lookAlong(dir) {
  const d = dir.clone(); if (Math.abs(d.y) > .99) d.z += .002; d.normalize();
  const to = tgt.clone().add(d.multiplyScalar(camDist)), from = camera.position.clone(), ft = controls.target.clone(), t0 = performance.now();
  view = ''; $$('#drViews button').forEach(b => b.setAttribute('aria-pressed', false));
  (function go() { const t = Math.min(1, (performance.now() - t0) / 450), e = t * t * (3 - 2 * t); camera.position.lerpVectors(from, to, e); controls.target.lerpVectors(ft, tgt, e); controls.update(); dirty = true; if (t < 1) requestAnimationFrame(go); })();
}

/* ---------- move gizmo (a whole pattern piece) ---------- */
const tc = new TransformControls(camera, canvas); tc.setSize(.85); scene.add(tc.getHelper());
const pivot = new THREE.Object3D(); scene.add(pivot);
let baseInv = new THREE.Matrix4(), moving = false;
tc.addEventListener('change', () => { dirty = true; });
tc.addEventListener('dragging-changed', e => { controls.enabled = !e.value; });
tc.addEventListener('mouseDown', () => { if (!worker || selPanel < 0) return; pivot.updateMatrixWorld(); baseInv.copy(pivot.matrixWorld).invert(); moving = true; paused = false; worker.postMessage({ cmd: 'pstart', panel: selPanel, gen }); });
tc.addEventListener('objectChange', () => { if (!moving) return; pivot.updateMatrixWorld(); const m = new THREE.Matrix4().multiplyMatrices(pivot.matrixWorld, baseInv); worker.postMessage({ cmd: 'pmove', e: Array.from(m.elements), gen }); });
tc.addEventListener('mouseUp', () => { if (!moving) return; moving = false; worker.postMessage({ cmd: 'pend', gen }); });
function selectPanel(pi) {
  selPanel = pi;
  if (pi < 0 || !posAttr) { tc.detach(); $('#drGz').hidden = true; }
  else {
    const a = posAttr.array, c = new THREE.Vector3(); let k = 0; for (let i = 0; i < panelOf.length; i++) if (panelOf[i] === pi) { c.x += a[3 * i]; c.y += a[3 * i + 1]; c.z += a[3 * i + 2]; k++; }
    pivot.position.copy(c.multiplyScalar(1 / Math.max(1, k))); pivot.rotation.set(0, 0, 0); pivot.updateMatrixWorld(); tc.attach(pivot); $('#drGz').hidden = false;
    if (S.tool !== 'move') { S.tool = 'move'; $$('#drTool button').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === 'move')); }
  }
  $$('#drPieces .dr-pc').forEach(p => p.classList.toggle('on', +p.dataset.pi === pi || (pi >= 0 && lastMesh && lastMesh.panels[pi] && lastMesh.panels[pi].name === 'SL' && lastMesh.panels[+p.dataset.pi].name === 'SR')));
  paintFit(); dirty = true;
}
$('#drPieces').addEventListener('click', e => { const p = e.target.closest('[data-pi]'); if (p) selectPanel(+p.dataset.pi); });

/* ---------- pull the fabric with the mouse ---------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), view3d = $('.dr-view');
let pulling = null;
function setNDC(e) { const r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); }
function pickVertex(e) {
  if (!garMesh) return null; setNDC(e); ray.setFromCamera(ndc, camera);
  const h = ray.intersectObject(garMesh, false)[0]; if (!h) return null;
  const a = posAttr.array; let best = -1, bd = 1e9;
  [h.face.a, h.face.b, h.face.c].forEach(i => { const d = (a[3 * i] - h.point.x) ** 2 + (a[3 * i + 1] - h.point.y) ** 2 + (a[3 * i + 2] - h.point.z) ** 2; if (d < bd) { bd = d; best = i; } });
  return { i: best, point: h.point.clone() };
}
const marker = new THREE.Mesh(new THREE.SphereGeometry(.9, 16, 12), new THREE.MeshBasicMaterial({ color: '#c4572f', depthTest: false })); marker.renderOrder = 10; marker.visible = false; scene.add(marker);
view3d.addEventListener('pointerdown', e => {
  if (e.target !== canvas || e.button !== 0) return;
  const gz = gzHit(e); if (gz) { e.stopPropagation(); if (gz !== 'pad') lookAlong(gz); return; }
  if (tc.object && tc.axis) return; // the move gizmo handles this one
  if (!built || !worker) return;
  const pk = pickVertex(e); if (!pk) return;
  if (S.tool === 'move') { e.stopPropagation(); selectPanel(panelOf[pk.i]); return; }
  e.stopPropagation(); canvas.setPointerCapture(e.pointerId); view3d.classList.add('pulling');
  const n = new THREE.Vector3(); camera.getWorldDirection(n);
  pulling = { plane: new THREE.Plane().setFromNormalAndCoplanarPoint(n, pk.point), off: new THREE.Vector3(posAttr.array[3 * pk.i], posAttr.array[3 * pk.i + 1], posAttr.array[3 * pk.i + 2]).sub(pk.point) };
  marker.position.copy(pk.point); marker.visible = true; dirty = true; paused = false; $('#drPause').textContent = 'Pause';
  worker.postMessage({ cmd: 'grab', i: pk.i, r: 5, gen });
}, true);
canvas.addEventListener('pointermove', e => {
  if (pulling) { setNDC(e); ray.setFromCamera(ndc, camera); const p = new THREE.Vector3(); if (ray.ray.intersectPlane(pulling.plane, p)) { marker.position.copy(p); dirty = true; const t = p.add(pulling.off); worker.postMessage({ cmd: 'drag', t: [t.x, t.y, t.z], gen }); } return; }
  if (e.buttons || !garMesh) return;
  const over = gzHit(e) ? 'pointer' : pickVertex(e) ? (S.tool === 'move' ? 'pointer' : 'grab') : '';
  canvas.style.cursor = over;
});
function endPull() { if (!pulling) return; pulling = null; marker.visible = false; view3d.classList.remove('pulling'); dirty = true; worker.postMessage({ cmd: 'release', gen }); }
canvas.addEventListener('pointerup', endPull); canvas.addEventListener('pointercancel', endPull);

function go() { renderControls(); size(); setView('front', false); loop(); rebuild(); }
if (document.body.classList.contains('fx-locked')) { const mo = new MutationObserver(() => { if (!document.body.classList.contains('fx-locked')) { mo.disconnect(); go(); } }); mo.observe(document.body, { attributes: true, attributeFilter: ['class'] }); } else go();
