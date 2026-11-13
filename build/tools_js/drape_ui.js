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
const GROUPS = [['Tops and dresses', ['tshirt', 'top', 'tank', 'sweat', 'kurta', 'dress']], ['Skirts', ['aline', 'pencil', 'circle', 'gathered', 'kalis', 'lehenga']],
  ['Trousers and Indian bottoms', ['trousers', 'jeans', 'churidar', 'salwar', 'patiala', 'gharara']], ['Sets', ['kurtaset', 'kurtachuri']]];
const LEG = [['straight', 'Straight'], ['tapered', 'Tapered'], ['wide', 'Wide-leg'], ['palazzo', 'Palazzo'], ['barrel', 'Barrel'], ['jogger', 'Jogger'], ['shorts', 'Shorts']];
const PFIT = [['trouser', 'Trouser (hangs straight)'], ['slack', 'Slack (closer)'], ['jean', 'Jean (contoured)']];
const FULL = [['slim', 'Slim'], ['regular', 'Regular'], ['full', 'Full (Punjabi)']];
const CIRC = [['0.25', 'Quarter circle'], ['0.5', 'Half circle'], ['1', 'Full circle']];
const SLEN = [['cap', 'Cap'], ['short', 'Short'], ['elbow', 'Elbow'], ['3q', 'Three-quarter'], ['full', 'Full']];
const GENDER = { women: 'Female', men: 'Male', kids: 'Kids', unisex: 'Unisex' };
const TONES = [['form', '#d8d2c8', 'Grey form'], ['t1', '#efd3bd', 'Light'], ['t2', '#d9a988', 'Light medium'], ['t3', '#b98260', 'Medium'], ['t4', '#8a5a3c', 'Medium deep'], ['t5', '#5e3b27', 'Deep']];
const MEAS = [['height', 'Height'], ['bust', 'Bust / chest'], ['waist', 'Waist'], ['hip', 'Hip'], ['shoulder', 'Shoulder width'], ['nape', 'Back length (nape to waist)'], ['bicep', 'Upper arm']];
const SEAMC = ['#c4572f', '#2f6f8f', '#7a5c99', '#3d8a5a', '#b08a1e', '#a23b72', '#4a7d84', '#8c6d3f', '#5b6bbf', '#9c4f2f', '#3f7f3f', '#7f3f6f', '#2f8f7f', '#8f2f3f', '#6f6f2f', '#2f4f8f', '#b2672b', '#6a8f2f'];

let S = load();
try { const q = new URLSearchParams(location.search); if (D.STYLES[q.get('style')]) { S.style = q.get('style'); S.opts = {}; S.meas = {}; } if (GENDER[q.get('gender')]) S.gender = q.get('gender'); if (q.get('size')) S.size = q.get('size'); if (q.get('o')) { const o = JSON.parse(q.get('o')); S.opts = {}; ['len', 'ease', 'neck', 'sleeve', 'slen', 'flare', 'slit', 'slen2', 'leg', 'pfit', 'tlen', 'mohri', 'fullness', 'ruch', 'gfull', 'panels', 'hemc', 'circle'].forEach(k => { const v = o[k]; if (v === undefined) return; if (/^[\d.]+$/.test(String(v))) S.opts[k] = Math.min(700, +v); else if ((k === 'neck' && NECK.some(n => n[0] === v)) || (k === 'sleeve' && SLEEVE[v]) || (k === 'slen' && SLEN.some(n => n[0] === v)) || (k === 'leg' && LEG.some(n => n[0] === v)) || (k === 'pfit' && PFIT.some(n => n[0] === v)) || (k === 'fullness' && FULL.some(n => n[0] === v))) S.opts[k] = v; }); } if (q.get('m')) { const mm = JSON.parse(q.get('m')); S.meas = {}; MEAS.forEach(k => { if (+mm[k[0]] > 0) S.meas[k[0]] = +mm[k[0]]; }); } if (q.get('style')) history.replaceState(null, '', location.pathname); } catch (e) { }
function defaults() { return { style: 'tshirt', gender: 'women', size: 'M', fabric: 'jersey', colour: '#7c8ea3', opts: {}, meas: {}, fit: 'off', bodyOn: true, seamsOn: true, quality: 'std', tone: 'form', tool: 'pull', unit: 'cm', tab: 'garment', fabOv: {}, myFabrics: {}, cws: null, cw: 0, hideL: false, hideR: false }; }
function load() { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v && D.STYLES[v.style]) { const o = Object.assign(defaults(), v); if (!D.FABRICS[o.fabric] && !(o.myFabrics || {})[o.fabric]) o.fabric = 'jersey'; return o; } } catch (e) { } return defaults(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

/* ---------- layout ---------- */
const app = $('#app');
app.innerHTML = `<div class="dr" id="drRoot">
  <aside class="dr-ctl" aria-label="Garment, avatar, fabric and colourways">
    <div class="dr-tabs" role="tablist">
      <button type="button" role="tab" data-tab="garment">Garment</button><button type="button" role="tab" data-tab="avatar">Avatar</button><button type="button" role="tab" data-tab="fabric">Fabric</button><button type="button" role="tab" data-tab="colour">Colourways</button>
    </div>
    <div class="dr-pane" data-pane="garment">
      <label>Style<select id="drStyle"></select></label><div id="drOpts" class="dr-opts"></div>
      <div class="dr-acts"><button type="button" class="dr-p" id="drSew">Sew and drape again</button><button type="button" id="drPause">Pause</button>
        <label class="dr-q">Detail<select id="drQuality"><option value="fast">Fast</option><option value="std">Standard</option><option value="fine">Fine</option></select></label></div>
    </div>
    <div class="dr-pane" data-pane="avatar" hidden>
      <div class="dr-two"><label>Body<select id="drGender"></select></label><label>Size<select id="drSize"></select></label></div>
      <h3>Skin tone</h3><div class="dr-sw dr-tone" id="drTone" role="radiogroup" aria-label="Avatar skin tone"></div>
      <h3>Measurements</h3><div id="drMeas" class="dr-meas"></div><button type="button" class="dr-link" id="drMeasReset">Back to the size chart</button>
    </div>
    <div class="dr-pane" data-pane="fabric" hidden>
      <div class="dr-fabtop"><canvas id="drFabPrev" width="96" height="96" aria-hidden="true"></canvas><div><label>Fabric<select id="drFabric"></select></label><p class="dr-note" id="drFabNote"></p></div></div>
      <h3>Properties <span class="dr-edited" id="drEdited" hidden>edited</span></h3>
      <div id="drProps" class="dr-props"></div>
      <div class="dr-save"><input id="drFabName" maxlength="40" placeholder="Name for your fabric"><button type="button" id="drFabSave">Save as new fabric</button></div>
      <div class="dr-row"><button type="button" class="dr-link" id="drFabReset">Reset properties</button><button type="button" class="dr-link" id="drFabDel" hidden>Delete this fabric</button></div>
    </div>
    <div class="dr-pane" data-pane="colour" hidden>
      <div class="dr-cws" id="drCws"></div>
      <div class="dr-row"><button type="button" id="drCwAdd">Add colourway</button><button type="button" class="dr-link" id="drCwDel">Delete</button></div>
      <label>Name<input id="drCwName" maxlength="30"></label>
      <h3>Ground colour</h3><div class="dr-sw" id="drSw" role="radiogroup" aria-label="Ground colour"></div><label class="dr-cc">Own colour <input type="color" id="drColour"></label>
      <label>Print<select id="drPrint"></select></label>
      <div id="drPrintOpts"><label class="dr-cc">Second colour <input type="color" id="drColour2"></label>
        <label>Print size <output id="drScaleOut"></output><input type="range" id="drScale" min="0.5" max="12" step="0.5"></label></div>
    </div>
  </aside>
  <section class="dr-view" aria-label="3D view">
    <canvas id="drCanvas" aria-label="3D view of the garment on the avatar. Drag to turn, scroll to zoom."></canvas>
    <div class="dr-bar" role="toolbar" aria-label="View">
      <button type="button" class="dr-ic" id="drHideL" aria-pressed="false" title="Hide the left panel"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM9 4v16M15.5 9.5 13 12l2.5 2.5"/></svg></button>
      <div class="dr-seg" id="drViews"><button data-v="front" aria-pressed="true">Front</button><button data-v="q">¾</button><button data-v="side">Side</button><button data-v="back">Back</button></div>
      <details class="dr-menu" id="drShow"><summary>Show <span aria-hidden="true">▾</span></summary><div class="dr-pop">
        <div class="dr-seg dr-col" id="drFit"><button data-f="off">Fabric</button><button data-f="fit">Fit map</button><button data-f="strain">Stretch map</button></div>
        <label class="dr-chk"><input type="checkbox" id="drBody"> Avatar</label><label class="dr-chk"><input type="checkbox" id="drSeams"> Seam lines</label></div></details>
      <div class="dr-seg" id="drTool" aria-label="Mouse tool"><button data-t="pull" title="Drag the fabric to pull it, as you would on a real garment">Pull</button><button data-t="move" title="Click a piece, then move or rotate it with the gizmo">Move piece</button></div>
      <div class="dr-seg" id="drGz" hidden><button data-g="translate" aria-pressed="true" title="Move (W)">Move</button><button data-g="rotate" title="Rotate (E)">Rotate</button><button data-g="done" title="Finish (Esc)">Done</button></div>
      <span class="dr-sp"></span>
      <div class="dr-seg" id="drUnits" aria-label="Units"><button data-u="cm">cm</button><button data-u="mm">mm</button><button data-u="in">in</button></div>
      <button type="button" class="dr-ic" id="drFull" aria-pressed="false" title="Full window (F)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg></button>
      <button type="button" class="dr-ic" id="drHideR" aria-pressed="false" title="Hide the right panel"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM15 4v16M8.5 9.5 11 12l-2.5 2.5"/></svg></button>
    </div>
    <div class="dr-status" id="drStatus" role="status" aria-live="polite">Preparing…</div>
    <div class="dr-cwbar" id="drCwBar" aria-label="Colourways"></div>
    <div class="dr-legend" id="drLegend" hidden></div>
    <p class="dr-hint" id="drHint">Drag the fabric to pull it · Drag the background to turn · Scroll to zoom · Right-drag to pan</p>
  </section>
  <aside class="dr-2d" aria-label="Pattern pieces and measurements">
    <section><h2>Pattern pieces</h2><p class="dr-note">Matching colours are sewn together.</p><div id="drPieces"></div></section>
    <section><h2>Garment and body</h2><table class="dr-tab" id="drTab"></table></section>
    <section class="dr-pm"><a href="pattern-maker.html" target="_blank" rel="noopener" id="drPM">Open this pattern in Pattern Maker ↗</a>
      <p class="dr-note">The 3D view shows proportion, balance and where the garment touches the body. It is a preview, not a fit sample: always sew a toile before production.</p></section>
  </aside>
</div>`;

/* ---------- units ---------- */
const UNIT = { cm: [1, 1, 0.5], mm: [10, 0, 5], in: [1 / 2.54, 2, 0.25] }; // factor, decimals, input step
function toU(cm) { const u = UNIT[S.unit] || UNIT.cm; return +(cm * u[0]).toFixed(u[1] === 0 ? 0 : u[1]); }
function fromU(v) { return v / (UNIT[S.unit] || UNIT.cm)[0]; }
function L(cm) { return toU(cm) + (S.unit === 'in' ? '″' : ' ' + (S.unit || 'cm')); }

/* ---------- fabrics: library, user edits and saved fabrics ---------- */
const PROPS = [ // key, label, min, max, step, unit text, help
  ['gsm', 'Weight', 20, 900, 5, ' gsm', 'Heavier fabric pulls down more and swings less.'],
  ['sw', 'Stretch across (weft)', 0, 100, 1, '%', 'How far it stretches across the grain.'],
  ['sl', 'Stretch along (warp)', 0, 100, 1, '%', 'How far it stretches along the grain.'],
  ['sb', 'Give on the bias', 0, 20, .5, '%', 'Wovens stretch most on the bias; this softens bias-cut areas.'],
  ['stiff', 'Stiffness', 0, 100, 1, '', '0 is limp like chiffon, 100 is stiff like canvas.'],
  ['fric', 'Friction', 0, 1, .05, '', 'How much it grips the body instead of sliding.'],
  ['thick', 'Thickness', .05, 6, .05, ' mm', 'Thicker fabric sits further from the body and from other layers.'],
  ['sheen', 'Sheen', 0, 1, .05, '', 'Surface shine, from matt cotton to satin and velvet.'],
  ['op', 'Opacity', .3, 1, .02, '', 'Sheer fabrics such as chiffon, organza and net let light through.']];
const TEXN = { plain: 'Plain weave', poplin: 'Poplin', oxford: 'Oxford basket weave', chambray: 'Chambray', twill: 'Twill', denim: 'Denim twill', canvas: 'Canvas', linen: 'Linen slub', slub: 'Khadi slub', brushed: 'Brushed / flannel', cord: 'Corduroy', crepe: 'Crepe', chiffon: 'Chiffon', satin: 'Satin', velvet: 'Velvet pile', tweed: 'Tweed', brocade: 'Brocade (zari motifs)', knit: 'Jersey knit', rib: 'Rib knit', fleece: 'Fleece', net: 'Net / tulle', leather: 'Leather grain', smooth: 'Smooth (scuba)' };
function myFabs() { return S.myFabrics || (S.myFabrics = {}); }
function baseFab() { return D.FABRICS[S.fabric] || myFabs()[S.fabric] || D.FABRICS.jersey; }
function fab() { return Object.assign({}, baseFab(), S.fabOv || {}); }
function fabName() { return fab().n + (S.fabOv && Object.keys(S.fabOv).length ? ' (edited)' : ''); }

/* ---------- colourways ---------- */
const PRINTS = [['solid', 'Solid'], ['stripe', 'Stripes'], ['pin', 'Pinstripe'], ['band', 'Horizontal bands'], ['gingham', 'Gingham'], ['check', 'Check / tartan'], ['dots', 'Polka dots'], ['buti', 'Buti motifs'], ['chevron', 'Chevron'], ['ikat', 'Ikat']];
function cws() { if (!S.cws || !S.cws.length) S.cws = [{ name: 'Colourway 1', c1: S.colour || '#7c8ea3', c2: '#f3efe6', print: 'solid', scale: 2 }]; if (!(S.cw >= 0 && S.cw < S.cws.length)) S.cw = 0; return S.cws; }
function cw() { return cws()[S.cw]; }

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
const NOUNIT = { gfull: '×', panels: '' };
function outTxt(k, v) { return k in NOUNIT ? v + NOUNIT[k] : L(+v); }
function slider(k, label, lo, hi, step, val) { return `<label>${label} <output>${outTxt(k, val)}</output><input type="range" data-o="${k}" min="${lo}" max="${hi}" step="${step || 1}" value="${val}"></label>`; }

function renderControls() {
  $$('.dr-tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === S.tab)); $$('.dr-pane').forEach(p => { p.hidden = p.dataset.pane !== S.tab; });
  $('#drStyle').innerHTML = GROUPS.map(gr => `<optgroup label="${gr[0]}">${gr[1].filter(k => D.STYLES[k]).map(k => opt(k, D.STYLES[k].n, S.style)).join('')}</optgroup>`).join('');
  if (!genders().includes(S.gender)) S.gender = genders()[0];
  if (!sizes().includes(S.size)) S.size = sizes()[Math.min(2, sizes().length - 1)];
  $('#drGender').innerHTML = genders().map(g => opt(g, GENDER[g], S.gender)).join('');
  $('#drSize').innerHTML = sizes().map(s => opt(s, s, S.size)).join('');
  $('#drQuality').value = S.quality;
  const st = style(), G = gar(), h = [];
  if (st.kind === 'torso') {
    h.push(`<label>Neckline<select data-o="neck">${NECK.map(n => opt(n[0], n[1], optVal('neck'))).join('')}</select></label>`);
    const sl = SLEEVES[st.gid];
    if (sl) h.push(`<label>Sleeve<select data-o="sleeve">${sl.map(k => opt(k, SLEEVE[k], optVal('sleeve'))).join('')}</select></label>`);
    if (G.o.includes('slen') && optVal('sleeve') !== 'none') h.push(`<label>Sleeve length<select data-o="slen">${SLEN.map(n => opt(n[0], n[1], optVal('slen'))).join('')}</select></label>`);
    const lr = rng('len', .62, 1.3);
    h.push(slider('len', 'Length from shoulder', lr[0], lr[1], 1, optVal('len')));
    h.push(slider('ease', 'Ease at chest', 0, 30, 1, optVal('ease')));
    if (G.o.includes('flare')) h.push(slider('flare', 'Flare at hem, each side', 0, 20, 1, optVal('flare')));
    if (G.o.includes('slit')) h.push(slider('slit', 'Side slit', 0, 50, 1, optVal('slit')));
  } else if (st.kind === 'pants' || st.kind === 'salwar') {
    const sel = (k, l, list) => h.push(`<label>${l}<select data-o="${k}">${list.map(n => opt(n[0], n[1], optVal(k))).join('')}</select></label>`);
    if (G.o.includes('leg')) sel('leg', 'Leg shape', LEG);
    if (G.o.includes('pfit')) sel('pfit', 'Fit at crotch', PFIT);
    if (G.o.includes('fullness')) sel('fullness', 'Fullness', FULL);
    if (G.o.includes('mohri')) h.push(slider('mohri', 'Leg opening (mohri)', 24, 60, 1, optVal('mohri')));
    if (G.o.includes('ruch')) h.push(slider('ruch', 'Extra length to ruche', 0, 40, 1, optVal('ruch')));
    if (G.o.includes('gfull')) h.push(slider('gfull', 'Flare fullness (× knee)', 2, 5, .5, optVal('gfull')));
    if (G.o.includes('tlen')) { const full = Math.round(baseMeas().outseam - 2); h.push(slider('tlen', 'Length, waist to hem', Math.round(full * .35), full, 1, +optVal('tlen') || full)); }
  } else {
    const sr = rng('slen2', .6, 1.55);
    h.push(slider('slen2', 'Skirt length', sr[0], sr[1], 1, optVal('slen2')));
    if (S.style === 'aline') h.push(slider('flare', 'Flare at hem, each side', 2, 20, 1, optVal('flare')));
    if (S.style === 'circle') h.push(`<label>Circle<select data-o="circle">${CIRC.map(n => opt(n[0], n[1], String(optVal('circle')))).join('')}</select></label>`);
    if (S.style === 'kalis' || S.style === 'lehenga') h.push(slider('panels', 'Panels (kalis)', 4, 24, 2, optVal('panels')));
    if (S.style === 'lehenga') h.push(slider('hemc', 'Hem circumference', 200, 600, 10, optVal('hemc')));
  }
  $('#drOpts').innerHTML = h.join('');
  const m = baseMeas(); m.height = +(S.meas || {}).height || (lastBody ? Math.round(lastBody.height) : '');
  const us = (UNIT[S.unit] || UNIT.cm)[2];
  $('#drMeas').innerHTML = MEAS.filter(k => st.kind === 'torso' || ['height', 'waist', 'hip'].includes(k[0])).map(k => `<label>${k[1]}<span><input type="number" step="${us}" min="0" data-m="${k[0]}" value="${m[k[0]] === '' ? '' : toU(m[k[0]])}"> ${S.unit === 'in' ? 'in' : S.unit}</span></label>`).join('');
  $('#drTone').innerHTML = TONES.map(t => `<button type="button" role="radio" aria-checked="${t[0] === S.tone}" title="${t[2]}" aria-label="${t[2]}" data-tone="${t[0]}" style="background:${t[1]}"></button>`).join('');
  renderFabric(); renderColour();
  $$('#drTool button').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === S.tool));
  $$('#drViews button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === view));
  $$('#drFit button').forEach(b => b.setAttribute('aria-pressed', b.dataset.f === S.fit));
  $$('#drUnits button').forEach(b => b.setAttribute('aria-pressed', b.dataset.u === S.unit));
  $('#drBody').checked = S.bodyOn; $('#drSeams').checked = S.seamsOn;
  sides();
}
function renderFabric() {
  const groups = {}; Object.keys(D.FABRICS).forEach(k => { const g = D.FABRICS[k].g; (groups[g] = groups[g] || []).push(k); });
  const mine = Object.keys(myFabs());
  $('#drFabric').innerHTML = (mine.length ? `<optgroup label="My fabrics">${mine.map(k => opt(k, myFabs()[k].n, S.fabric)).join('')}</optgroup>` : '') +
    Object.keys(groups).map(g => `<optgroup label="${esc(g)}">${groups[g].map(k => opt(k, D.FABRICS[k].n, S.fabric)).join('')}</optgroup>`).join('');
  const f = fab(), ov = S.fabOv || {};
  $('#drFabNote').textContent = f.note || 'Your own fabric.';
  $('#drProps').innerHTML = PROPS.map(p => `<label title="${esc(p[6])}"${p[0] in ov ? ' class="ov"' : ''}>${p[1]} <output>${fmtP(p, f[p[0]])}</output><input type="range" data-p="${p[0]}" min="${p[2]}" max="${p[3]}" step="${p[4]}" value="${+f[p[0]] || 0}"></label>`).join('') +
    `<label>Surface<select data-p="tex">${Object.keys(TEXN).map(k => opt(k, TEXN[k], f.tex)).join('')}</select></label>`;
  $('#drEdited').hidden = !Object.keys(ov).length;
  $('#drFabDel').hidden = !myFabs()[S.fabric];
  drawFabPrev();
}
function fmtP(p, v) { v = +v || 0; return (p[4] < 1 ? (+v.toFixed(2)).toString() : Math.round(v)) + p[5]; }
function renderColour() {
  const c = cw();
  $('#drCws').innerHTML = cws().map((x, i) => `<button type="button" class="dr-cwc" aria-pressed="${i === S.cw}" data-cw="${i}" title="${esc(x.name)}"><i style="background:${esc(x.c1)}"></i><i style="background:${esc(x.print === 'solid' ? x.c1 : x.c2)}"></i><span>${esc(x.name)}</span></button>`).join('');
  $('#drCwBar').innerHTML = cws().length > 1 ? cws().map((x, i) => `<button type="button" aria-pressed="${i === S.cw}" data-cw="${i}" title="${esc(x.name)}" style="--a:${esc(x.c1)};--b:${esc(x.print === 'solid' ? x.c1 : x.c2)}"></button>`).join('') : '';
  $('#drCwName').value = c.name;
  $('#drSw').innerHTML = COLOURS.map(k => `<button type="button" role="radio" aria-checked="${k[0] === c.c1}" title="${k[1]}" aria-label="${k[1]}" data-c="${k[0]}" style="background:${k[0]}"></button>`).join('');
  $('#drColour').value = c.c1; $('#drColour2').value = c.c2;
  $('#drPrint').innerHTML = PRINTS.map(p => opt(p[0], p[1], c.print)).join('');
  $('#drPrintOpts').hidden = c.print === 'solid';
  $('#drScale').value = c.scale; $('#drScaleOut').textContent = L(c.scale);
  $('#drCwDel').hidden = cws().length < 2;
}
function $$(s, r) { return Array.from((r || document).querySelectorAll(s)); }

let tmr = 0;
function later(fn, ms) { clearTimeout(tmr); tmr = setTimeout(fn, ms || 350); }
function refab() { save(); applyMaterial(); if (worker && built) { worker.postMessage({ cmd: 'fabric', fab: D.phys(fab()), gen }); status('Draping in ' + fabName().toLowerCase() + '…', 'run'); } }
$('.dr-tabs').addEventListener('click', e => { const t = e.target.dataset.tab; if (!t) return; S.tab = t; save(); renderControls(); });
$('#drStyle').addEventListener('change', e => { S.style = e.target.value; S.opts = {}; save(); renderControls(); rebuild(); });
$('#drGender').addEventListener('change', e => { S.gender = e.target.value; S.meas = {}; S.opts = {}; save(); renderControls(); rebuild(); });
$('#drSize').addEventListener('change', e => { S.size = e.target.value; S.meas = {}; save(); renderControls(); rebuild(); });
$('#drFabric').addEventListener('change', e => { S.fabric = e.target.value; S.fabOv = {}; renderFabric(); refab(); });
$('#drProps').addEventListener('input', e => { const k = e.target.dataset.p; if (!k) return; S.fabOv = S.fabOv || {}; S.fabOv[k] = k === 'tex' ? e.target.value : +e.target.value; const p = PROPS.find(q => q[0] === k), o = e.target.parentNode.querySelector('output'); if (o && p) o.textContent = fmtP(p, +e.target.value); e.target.parentNode.classList.add('ov'); $('#drEdited').hidden = false; save(); applyMaterial(); drawFabPrev(); if (!['sheen', 'op', 'tex'].includes(k)) later(refab, 250); });
$('#drFabReset').addEventListener('click', () => { S.fabOv = {}; renderFabric(); refab(); });
$('#drFabSave').addEventListener('click', () => { const n = $('#drFabName').value.trim() || fab().n + ' (mine)', id = 'my' + Date.now().toString(36); myFabs()[id] = Object.assign(fab(), { n, g: 'My fabrics', note: 'Your own fabric, based on ' + baseFab().n.toLowerCase() + '.' }); S.fabric = id; S.fabOv = {}; $('#drFabName').value = ''; renderFabric(); refab(); status('Saved “' + n + '” to My fabrics', 'ok'); });
$('#drFabDel').addEventListener('click', () => { if (!myFabs()[S.fabric]) return; delete myFabs()[S.fabric]; S.fabric = 'jersey'; S.fabOv = {}; renderFabric(); refab(); });
$('#drQuality').addEventListener('change', e => { S.quality = e.target.value; save(); rebuild(); });
$('#drOpts').addEventListener('input', e => { const k = e.target.dataset.o; if (!k) return; const v = e.target.type === 'range' ? +e.target.value : e.target.value; S.opts[k] = v; const o = e.target.parentNode.querySelector('output'); if (o) o.textContent = outTxt(k, v); save(); if (e.target.tagName === 'SELECT') { renderControls(); rebuild(); } else later(rebuild); });
$('#drMeas').addEventListener('input', e => { const k = e.target.dataset.m; if (!k || !(+e.target.value > 0)) return; S.meas[k] = Math.round(fromU(+e.target.value) * 10) / 10; save(); later(rebuild, 600); });
$('#drMeasReset').addEventListener('click', () => { S.meas = {}; save(); renderControls(); rebuild(); });
function setCw(k, v) { cw()[k] = v; S.colour = cw().c1; save(); renderColour(); applyMaterial(); }
$('#drSw').addEventListener('click', e => { const c = e.target.dataset && e.target.dataset.c; if (c) setCw('c1', c); });
$('#drColour').addEventListener('input', e => setCw('c1', e.target.value));
$('#drColour2').addEventListener('input', e => setCw('c2', e.target.value));
$('#drPrint').addEventListener('change', e => setCw('print', e.target.value));
$('#drScale').addEventListener('input', e => setCw('scale', +e.target.value));
$('#drCwName').addEventListener('input', e => { cw().name = e.target.value.slice(0, 30) || 'Colourway'; save(); $$('#drCws [data-cw="' + S.cw + '"] span').forEach(x => { x.textContent = cw().name; }); });
function pickCw(e) { const b = e.target.closest('[data-cw]'); if (!b) return; S.cw = +b.dataset.cw; S.colour = cw().c1; save(); renderColour(); applyMaterial(); }
$('#drCws').addEventListener('click', pickCw); $('#drCwBar').addEventListener('click', pickCw);
$('#drCwAdd').addEventListener('click', () => { const c = Object.assign({}, cw(), { name: 'Colourway ' + (cws().length + 1) }); cws().push(c); S.cw = cws().length - 1; save(); renderColour(); applyMaterial(); });
$('#drCwDel').addEventListener('click', () => { if (cws().length < 2) return; cws().splice(S.cw, 1); S.cw = Math.max(0, S.cw - 1); S.colour = cw().c1; save(); renderColour(); applyMaterial(); });
$('#drUnits').addEventListener('click', e => { const u = e.target.dataset.u; if (!u) return; S.unit = u; save(); renderControls(); if (lastMesh) drawTable(lastMesh, baseMeas()); });
$('#drSew').addEventListener('click', () => rebuild());
$('#drTone').addEventListener('click', e => { const t = e.target.dataset && e.target.dataset.tone; if (!t) return; S.tone = t; save(); $$('#drTone button').forEach(b => b.setAttribute('aria-checked', b.dataset.tone === t)); tintBody(); });
$('#drTool').addEventListener('click', e => { const t = e.target.dataset.t; if (!t) return; S.tool = t; save(); $$('#drTool button').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === t)); if (t === 'pull') selectPanel(-1); $('#drHint').textContent = t === 'move' ? 'Click a piece to move or rotate it · Drag the background to turn' : 'Drag the fabric to pull it · Drag the background to turn · Scroll to zoom · Right-drag to pan'; });
$('#drGz').addEventListener('click', e => { const g = e.target.dataset.g; if (!g) return; if (g === 'done') { selectPanel(-1); return; } tc.setMode(g); $$('#drGz button').forEach(b => b.setAttribute('aria-pressed', b.dataset.g === g)); });
window.addEventListener('keydown', e => {
  if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  if ((e.key === 'f' || e.key === 'F') && !e.metaKey && !e.ctrlKey) { full(!document.body.classList.contains('dr-full')); return; }
  if (e.key === 'Escape' && document.body.classList.contains('dr-full') && selPanel < 0) { full(false); return; }
  if (selPanel < 0) return; if (e.key === 'w' || e.key === 'W') $('[data-g=translate]').click(); else if (e.key === 'e' || e.key === 'E') $('[data-g=rotate]').click(); else if (e.key === 'Escape') selectPanel(-1);
});
$('#drPause').addEventListener('click', e => { if (!worker) return; paused = !paused; worker.postMessage({ cmd: paused ? 'pause' : 'resume' }); e.target.textContent = paused ? 'Resume' : 'Pause'; if (!paused) worker.postMessage({ cmd: 'ack', gen }); });
$('#drViews').addEventListener('click', e => { const v = e.target.dataset.v; if (v) setView(v, true); });
$('#drFit').addEventListener('click', e => { const f = e.target.dataset.f; if (!f) return; S.fit = f; save(); $$('#drFit button').forEach(b => b.setAttribute('aria-pressed', b.dataset.f === f)); paintFit(); });
$('#drBody').addEventListener('change', e => { S.bodyOn = e.target.checked; save(); bodyGroup.visible = S.bodyOn; dirty = true; });
$('#drSeams').addEventListener('change', e => { S.seamsOn = e.target.checked; save(); if (seamMesh) seamMesh.visible = S.seamsOn; dirty = true; });
document.addEventListener('click', e => { const d = $('#drShow'); if (d.open && !d.contains(e.target)) d.open = false; });
function sides() { const r = $('#drRoot'); r.classList.toggle('nol', !!S.hideL); r.classList.toggle('nor', !!S.hideR); $('#drHideL').setAttribute('aria-pressed', !!S.hideL); $('#drHideR').setAttribute('aria-pressed', !!S.hideR); $('#drHideL').title = (S.hideL ? 'Show' : 'Hide') + ' the left panel'; $('#drHideR').title = (S.hideR ? 'Show' : 'Hide') + ' the right panel'; }
$('#drHideL').addEventListener('click', () => { S.hideL = !S.hideL; save(); sides(); });
$('#drHideR').addEventListener('click', () => { S.hideR = !S.hideR; save(); sides(); });
function full(on) { document.body.classList.toggle('dr-full', on); $('#drFull').setAttribute('aria-pressed', on); $('#drFull').title = on ? 'Leave full window (Esc)' : 'Full window (F)'; }
$('#drFull').addEventListener('click', () => full(!document.body.classList.contains('dr-full')));

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

/* ---------- fabric surfaces: weave / knit relief, colour detail, prints ---------- */
const TILE = { plain: .4, poplin: .3, oxford: .5, chambray: .4, twill: .6, denim: .6, canvas: .5, linen: 1.6, slub: 2, brushed: 1.5, cord: 1.2, crepe: .8, chiffon: .5, satin: 1, velvet: 1.5, tweed: 2, brocade: 6, knit: .9, rib: .8, fleece: 1.2, net: .6, leather: 3, smooth: 2 };
function rnd(seed) { let x = seed || 1; return () => { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; }; }
function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h || w; return c; }
function noise(g, W, n, a, r, seed, col) { const R = rnd(seed); for (let i = 0; i < n; i++) { g.globalAlpha = a * R(); g.fillStyle = col || (R() > .5 ? '#fff' : '#000'); const x = R() * W, y = R() * W, s = r * (.5 + R()); g.fillRect(x, y, s, s); } g.globalAlpha = 1; }
function bumpCanvas(k) { // grey relief: lighter is raised
  const W = 128, c = cv(W), g = c.getContext('2d'), R = rnd(7);
  g.fillStyle = '#808080'; g.fillRect(0, 0, W, W);
  const line = (x0, y0, x1, y1, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
  if (k === 'plain' || k === 'poplin' || k === 'chambray' || k === 'chiffon' || k === 'canvas') { const n = k === 'canvas' ? 8 : 16, s = W / n; for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) { const gr = g.createLinearGradient(x * s, y * s, (x + ((x + y) % 2 ? 1 : 0)) * s, (y + ((x + y) % 2 ? 0 : 1)) * s); gr.addColorStop(0, '#5a5a5a'); gr.addColorStop(.5, '#b4b4b4'); gr.addColorStop(1, '#5a5a5a'); g.fillStyle = gr; g.fillRect(x * s, y * s, s, s); } }
  else if (k === 'oxford') { const s = 16; for (let x = 0; x < 8; x++) for (let y = 0; y < 8; y++) { g.fillStyle = (x + y) % 2 ? '#a8a8a8' : '#626262'; g.fillRect(x * s, y * s, s, s); for (let k2 = 3; k2 < s; k2 += 6) { g.fillStyle = 'rgba(0,0,0,.25)'; (x + y) % 2 ? g.fillRect(x * s, y * s + k2, s, 1.5) : g.fillRect(x * s + k2, y * s, 1.5, s); } } }
  else if (k === 'twill' || k === 'denim' || k === 'tweed') { for (let d = -W; d < 2 * W; d += k === 'tweed' ? 12 : 10) { line(d, 0, d + W, W, k === 'tweed' ? 5 : 4.5, '#b8b8b8'); line(d + 5, 0, d + 5 + W, W, 2, '#585858'); } if (k === 'tweed') noise(g, W, 900, .5, 2.2, 3); }
  else if (k === 'linen' || k === 'slub') { for (let y = 0; y < W; y += 4) line(0, y, W, y, 2, '#9a9a9a'); for (let x = 0; x < W; x += 4) line(x, 0, x, W, 1.2, '#6c6c6c'); for (let i = 0; i < (k === 'slub' ? 26 : 16); i++) { const y = Math.floor(R() * 32) * 4, x = R() * W, l = 10 + R() * 40; line(x, y, x + l, y, 3.5, '#c4c4c4'); line(x - W, y, x + l - W, y, 3.5, '#c4c4c4'); } }
  else if (k === 'brushed' || k === 'fleece' || k === 'velvet') { noise(g, W, 3000, .35, 1.6, 11); g.filter = 'blur(1.2px)'; g.drawImage(c, 0, 0); g.filter = 'none'; }
  else if (k === 'cord') { for (let x = 0; x < W; x++) { const v = 128 + 70 * Math.sin(x / W * Math.PI * 2 * 8); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, 0, 1, W); } noise(g, W, 600, .2, 1.4, 5); }
  else if (k === 'crepe') { noise(g, W, 2600, .5, 1.8, 13); g.filter = 'blur(.6px)'; g.drawImage(c, 0, 0); g.filter = 'none'; }
  else if (k === 'satin') { for (let i = 0; i < 70; i++) { const y = R() * W, x = R() * W; line(x, y, x + 30 + R() * 50, y, .8, 'rgba(160,160,160,.6)'); } }
  else if (k === 'brocade') { for (let y = 0; y < W; y += 3) line(0, y, W, y, 1, '#8c8c8c'); motif(g, W, '#d8d8d8'); }
  else if (k === 'knit' || k === 'fleece') { for (let x = 0; x < W; x += 8) for (let y = 0; y < W; y += 10) { line(x, y, x + 4, y + 8, 3.2, '#b4b4b4'); line(x + 8, y, x + 4, y + 8, 3.2, '#b4b4b4'); } }
  else if (k === 'rib') { for (let x = 0; x < W; x += 16) { const gr = g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, '#404040'); gr.addColorStop(.3, '#c8c8c8'); gr.addColorStop(.6, '#c8c8c8'); gr.addColorStop(1, '#404040'); g.fillStyle = gr; g.fillRect(x, 0, 16, W); } for (let y = 0; y < W; y += 8) line(0, y, W, y, .8, 'rgba(0,0,0,.25)'); }
  else if (k === 'net') { g.fillStyle = '#c8c8c8'; g.fillRect(0, 0, W, W); g.fillStyle = '#303030'; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.beginPath(); const cx = x * 32 + (y % 2 ? 16 : 0) + 16, cy = y * 32 + 16; for (let a = 0; a < 6; a++) g.lineTo(cx + 12 * Math.cos(a * Math.PI / 3), cy + 12 * Math.sin(a * Math.PI / 3)); g.fill(); } }
  else if (k === 'leather') { for (let i = 0; i < 160; i++) { const x = R() * W, y = R() * W; g.strokeStyle = 'rgba(60,60,60,.5)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 3 + R() * 6, 0, 6.3); g.stroke(); } g.filter = 'blur(.7px)'; g.drawImage(c, 0, 0); g.filter = 'none'; }
  return c;
}
function motif(g, W, col) { g.fillStyle = col; for (const [cx, cy] of [[32, 32], [96, 96], [96, 32], [32, 96]]) { if ((cx + cy) % 128 === 0) { g.beginPath(); g.ellipse(cx, cy, 11, 17, .5, 0, 6.3); g.fill(); g.beginPath(); g.arc(cx + 9, cy - 13, 5, 0, 6.3); g.fill(); } else { for (let a = 0; a < 8; a++) { g.beginPath(); g.ellipse(cx + 9 * Math.cos(a * Math.PI / 4), cy + 9 * Math.sin(a * Math.PI / 4), 5, 2.4, a * Math.PI / 4, 0, 6.3); g.fill(); } g.beginPath(); g.arc(cx, cy, 4, 0, 6.3); g.fill(); } } }
function mixHex(a, b, t) { const A = new THREE.Color(a), B = new THREE.Color(b); return '#' + A.lerp(B, t).getHexString(); }
function colourCanvas(k, c1) { // colour detail that belongs to the weave itself; null when the colour is flat
  const W = 128, c = cv(W), g = c.getContext('2d'), R = rnd(19);
  if (k === 'denim') { g.fillStyle = c1; g.fillRect(0, 0, W, W); g.strokeStyle = mixHex(c1, '#ffffff', .2); g.lineWidth = 1.6; for (let d = -W; d < 2 * W; d += 10) { g.beginPath(); g.moveTo(d + 6, 0); g.lineTo(d + 6 + W, W); g.stroke(); } noise(g, W, 300, .25, 1.4, 21, '#ffffff'); return c; }
  if (k === 'chambray') { g.fillStyle = c1; g.fillRect(0, 0, W, W); noise(g, W, 1400, .45, 1.6, 23, '#ffffff'); return c; }
  if (k === 'tweed') { g.fillStyle = c1; g.fillRect(0, 0, W, W); noise(g, W, 900, .6, 2, 29, mixHex(c1, '#000000', .45)); noise(g, W, 500, .7, 2, 31, mixHex(c1, '#ffffff', .45)); noise(g, W, 70, .9, 2.2, 37, '#c4572f'); noise(g, W, 50, .9, 2.2, 41, '#3f72c9'); return c; }
  if (k === 'brocade') { g.fillStyle = c1; g.fillRect(0, 0, W, W); motif(g, W, '#d4a94a'); return c; }
  if (k === 'slub' || k === 'linen') { g.fillStyle = c1; g.fillRect(0, 0, W, W); for (let i = 0; i < 26; i++) { g.fillStyle = mixHex(c1, R() > .5 ? '#ffffff' : '#000000', .12); g.fillRect(R() * W, Math.floor(R() * 32) * 4, 12 + R() * 40, 3); } return c; }
  if (k === 'velvet' || k === 'fleece' || k === 'brushed') { g.fillStyle = c1; g.fillRect(0, 0, W, W); noise(g, W, 1600, .12, 2, 43, mixHex(c1, '#ffffff', .4)); return c; }
  return null;
}
function printCanvas(p) { // one repeat of the print, 2 × print size wide
  const W = 256, c = cv(W), g = c.getContext('2d'), a = p.c1, b = p.c2, R = rnd(53);
  g.fillStyle = a; g.fillRect(0, 0, W, W);
  if (p.print === 'stripe') { g.fillStyle = b; g.fillRect(0, 0, W / 2, W); }
  else if (p.print === 'pin') { g.fillStyle = b; g.fillRect(W / 2 - 3, 0, 6, W); g.fillRect(0, 0, 3, W); g.fillRect(W - 3, 0, 3, W); }
  else if (p.print === 'band') { g.fillStyle = b; g.fillRect(0, 0, W, W / 2); }
  else if (p.print === 'gingham') { g.fillStyle = b; g.globalAlpha = .55; g.fillRect(0, 0, W / 2, W); g.fillRect(0, 0, W, W / 2); g.globalAlpha = 1; }
  else if (p.print === 'check') { g.globalAlpha = .6; g.fillStyle = b; g.fillRect(0, 0, W * .3, W); g.fillRect(0, 0, W, W * .3); g.globalAlpha = .8; g.fillStyle = mixHex(b, '#ffffff', .5); g.fillRect(W * .62, 0, 8, W); g.fillRect(0, W * .62, W, 8); g.globalAlpha = 1; }
  else if (p.print === 'dots') { g.fillStyle = b; for (const [x, y] of [[64, 64], [192, 192], [192, 64], [64, 192]]) { if ((x + y) % 256) continue; g.beginPath(); g.arc(x, y, 26, 0, 6.3); g.fill(); } for (const [x, y] of [[192, 64], [64, 192]]) { g.beginPath(); g.arc(x, y, 26, 0, 6.3); g.fill(); } }
  else if (p.print === 'buti') { g.fillStyle = b; for (const [x, y, r] of [[64, 64, .4], [192, 192, .4], [192, 64, -.6], [64, 192, -.6]]) { g.save(); g.translate(x, y); g.rotate(r); g.beginPath(); g.moveTo(0, -30); g.bezierCurveTo(26, -18, 22, 22, 0, 26); g.bezierCurveTo(-22, 22, -20, -6, 0, -4); g.bezierCurveTo(8, -12, 4, -22, 0, -30); g.fill(); g.restore(); } }
  else if (p.print === 'chevron') { g.strokeStyle = b; g.lineWidth = 40; for (let y = -64; y < W + 64; y += 128) { g.beginPath(); g.moveTo(0, y); g.lineTo(W / 2, y + 64); g.lineTo(W, y); g.stroke(); } }
  else if (p.print === 'ikat') { g.fillStyle = b; for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) { const cx = x * 128 + 64, cy = y * 128 + 64; for (let i = 0; i < 26; i++) { const t = i / 25, w = 44 * Math.sin(t * Math.PI), yy = cy - 56 + t * 112; g.fillRect(cx - w / 2 + (R() - .5) * 10, yy, w + (R() - .5) * 8, 4.3); } } }
  return c;
}
const BUMP = {}, ALPHA = {};
function tex(c, tile, colour) { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / tile, 1 / tile); t.anisotropy = 4; if (colour) t.colorSpace = THREE.SRGBColorSpace; return t; }
function bumpTex(k) { return BUMP[k] || (BUMP[k] = tex(bumpCanvas(k), TILE[k] || .5)); }
function netAlpha() { if (ALPHA.net) return ALPHA.net; const c = cv(128), g = c.getContext('2d'); g.drawImage(bumpCanvas('net'), 0, 0); const d = g.getImageData(0, 0, 128, 128); for (let i = 0; i < d.data.length; i += 4) { const v = d.data[i] > 100 ? 255 : 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; } g.putImageData(d, 0, 0); return (ALPHA.net = tex(c, TILE.net)); }
const garMat = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .85, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
garMat.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\nif (!gl_FrontFacing) diffuseColor.rgb *= 0.78;'); };
let mapTex = null, mapKey = '';
function surfaceMap(f, p) { // the colour texture for the current fabric and colourway (rebuilt only when it changes)
  const key = [f.tex, p.c1, p.c2, p.print, p.scale].join('|'); if (key === mapKey) return mapTex;
  if (mapTex) mapTex.dispose(); mapKey = key; mapTex = null;
  if (p.print !== 'solid') mapTex = tex(printCanvas(p), 2 * p.scale, true);
  else { const c = colourCanvas(f.tex, p.c1); if (c) mapTex = tex(c, TILE[f.tex] || .5, true); }
  return mapTex;
}
function applyMaterial() {
  const f = fab(), p = cw(), plain = S.fit === 'off', m = garMat, k = f.tex || 'plain';
  const map = plain ? surfaceMap(f, p) : null;
  m.map = map; m.color.set(plain && !map ? p.c1 : '#ffffff');
  m.roughness = Math.max(.15, Math.min(1, +f.rough || .8)); m.bumpMap = bumpTex(k); m.bumpScale = { knit: .8, rib: 1.2, cord: 1.4, tweed: 1, canvas: .7, denim: .7, twill: .6, leather: .6, brocade: .9 }[k] || .45;
  const sh = +f.sheen || 0, pile = k === 'velvet' || k === 'fleece' || k === 'brushed';
  m.sheen = pile ? sh : 0; m.sheenRoughness = .4; m.sheenColor.set(mixHex(p.c1, '#ffffff', .3));
  m.clearcoat = k === 'leather' ? .35 : 0; m.clearcoatRoughness = .45;
  if (!pile) { m.roughness = Math.max(.18, m.roughness * (1 - .65 * sh)); m.specularIntensity = .5 + sh * .5; } else m.specularIntensity = .3;
  const op = Math.max(.3, Math.min(1, +f.op || 1)); m.alphaMap = k === 'net' && plain ? netAlpha() : null; m.alphaTest = m.alphaMap ? .5 : 0;
  m.transparent = op < .99 && plain; m.opacity = m.transparent ? op : 1; m.depthWrite = !m.transparent;
  m.vertexColors = !plain || selPanel >= 0; m.needsUpdate = true;
  if (seamMat) seamMat.color.set(new THREE.Color(p.c1).multiplyScalar(.55));
  drawFabPrev(); dirty = true;
}
function drawFabPrev() { // a small swatch of the fabric in the current colourway
  const c = $('#drFabPrev'); if (!c) return; const g = c.getContext('2d'), f = fab(), p = cw(), W = c.width, k = f.tex || 'plain';
  g.fillStyle = p.c1; g.fillRect(0, 0, W, W);
  const pc = p.print !== 'solid' ? printCanvas(p) : colourCanvas(k, p.c1); if (pc) { const n = p.print !== 'solid' ? Math.max(1, 4 / p.scale) : 3; for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) g.drawImage(pc, x * W / n, y * W / n, W / n + 1, W / n + 1); }
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = .7; const b = bumpCanvas(k); for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) g.drawImage(b, x * W / 3, y * W / 3, W / 3 + 1, W / 3 + 1);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  const gr = g.createLinearGradient(0, 0, W, W); gr.addColorStop(0, 'rgba(255,255,255,' + (.08 + (+f.sheen || 0) * .35) + ')'); gr.addColorStop(.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = gr; g.fillRect(0, 0, W, W);
}
let garMesh = null, seamMesh = null, seamMat = null, posAttr = null, colAttr = null, lastGap = null, lastStrain = null, panelOf = null, selPanel = -1, lastMesh = null;
function buildGarment(d) {
  if (garMesh) { scene.remove(garMesh); garMesh.geometry.dispose(); }
  if (seamMesh) { scene.remove(seamMesh); seamMesh.geometry.dispose(); }
  const g = new THREE.BufferGeometry(), n = d.x.length / 3;
  posAttr = new THREE.BufferAttribute(new Float32Array(d.x), 3); posAttr.setUsage(THREE.DynamicDrawUsage);
  g.setAttribute('position', posAttr);
  const uv = new Float32Array(n * 2); for (let i = 0; i < n * 2; i++) uv[i] = d.uv[i]; /* pattern cm: textures repeat at true size */ g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
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
  const P = d.panels.filter(p => !/^(SL|FL|BL|GFL|GBL|SWL|CF-1|KB|P[1-9]\d*|C[1-9])$/.test(p.name)), seamColour = {};
  d.seams.forEach((sm, i) => { const c = SEAMC[i % SEAMC.length]; seamColour[sm[0][0] + '|' + sm[0][1]] = c; seamColour[sm[1][0] + '|' + sm[1][1]] = c; });
  const names = { F: 'Front', B: 'Back', SR: 'Sleeve', FR: 'Front leg', BR: 'Back leg', GFR: 'Flare', GBR: 'Flare', SWR: 'Leg', KF: 'Kali', CF1: 'Ankle band', P0: 'Panel', C0: 'Circle piece' }, multi = { SR: 2, FR: 2, BR: 2, GFR: 2, GBR: 2, SWR: 2, KF: 2, CF1: 2 }, boxes = [];
  P.forEach(p => { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; p.segs.forEach(s => s.pts.forEach(q => { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); })); boxes.push({ x0, x1, y0, y1 }); });
  let ox = 0, maxH = 0; const place = boxes.map(b => { const o = ox - b.x0; ox += b.x1 - b.x0 + 8; maxH = Math.max(maxH, b.y1 - b.y0); return o; });
  const W = ox - 8, H = maxH + 12;
  let svg = `<svg viewBox="-2 -8 ${W + 4} ${H + 2}" role="img" aria-label="Flat pattern pieces with matching seams in the same colour">`;
  P.forEach((p, k) => {
    const pi = d.panels.indexOf(p), b = boxes[k], dx = place[k], dy = -b.y0;
    const all = []; p.segs.forEach((s, i) => s.pts.forEach((q, j) => { if (i && !j) return; all.push(q); }));
    svg += `<path data-pi="${pi}" class="dr-pc${pi === selPanel ? ' on' : ''}" d="M${all.map(q => (q[0] + dx).toFixed(1) + ' ' + (q[1] + dy).toFixed(1)).join('L')}Z"><title>Click to move or rotate this piece in 3D</title></path>`;
    p.segs.forEach(s => { const c = seamColour[pi + '|' + s.key]; svg += `<polyline points="${s.pts.map(q => (q[0] + dx).toFixed(1) + ',' + (q[1] + dy).toFixed(1)).join(' ')}" fill="none" stroke="${c || '#6a6157'}" stroke-width="${c ? 1.3 : .7}" stroke-linejoin="round"${c ? '' : ' stroke-dasharray="2 1.2"'}/>`; });
    svg += `<text x="${(b.x0 + b.x1) / 2 + dx}" y="${(b.y0 + b.y1) / 2 + dy}" text-anchor="middle" font-size="4.2" fill="#6a6157">${names[p.name] || p.name}${multi[p.name] ? ' ×' + multi[p.name] : p.name === 'P0' ? ' ×' + d.panels.filter(q => /^P\d+$/.test(q.name)).length : p.name === 'C0' ? ' ×' + d.panels.filter(q => /^C\d+$/.test(q.name)).length : ''}</text>`;
  });
  svg += '</svg>';
  $('#drPieces').innerHTML = svg + '<p class="dr-note">Front and back are shown opened out from the fold. Dashed edges are hems and necklines. Click a piece to move it in 3D.</p>';
}
function drawTable(d, m) {
  const r = [], info = d.info || {};
  const row = (a, b, c, e) => r.push(`<tr><th>${a}</th><td>${b}</td><td>${c}</td><td>${e}</td></tr>`);
  const f = v => toU(v).toString();
  if (info['Finished chest']) row('Chest', f(m.bust), f(info['Finished chest']), '+' + f(info['Finished chest'] - m.bust));
  if (info['Finished waist']) row('Waist', f(m.waist), f(info['Finished waist']), (info['Finished waist'] >= m.waist ? '+' : '') + f(info['Finished waist'] - m.waist));
  if (info['Finished hip']) row('Hip', f(m.hip), f(info['Finished hip']), '+' + f(info['Finished hip'] - m.hip));
  if (info['Armhole (front + back)']) row('Armhole', '', f(info['Armhole (front + back)']), '');
  if (info['Sleeve cap ease'] > .4) row('Sleeve cap ease', '', '', f(info['Sleeve cap ease']));
  $('#drTab').innerHTML = '<thead><tr><th></th><th>Body</th><th>Garment</th><th>Ease</th></tr></thead><tbody>' + r.join('') + '</tbody>' + '<caption>All in ' + (S.unit === 'in' ? 'inches' : S.unit) + '. ' + esc(d.label || '') + ', size ' + esc(S.size) + (Object.keys(S.meas || {}).length ? ' (your measurements)' : '') + '.</caption>';
}

/* ---------- worker ---------- */
let worker = null, gen = 0, built = false, paused = false, dirty = true, curBody = null, lastBody = null;
function status(t, k) { const s = $('#drStatus'); s.textContent = t; s.dataset.k = k || ''; }
function rebuild() {
  if (!worker) { worker = new Worker('tools/drape-worker.js?v=' + V); worker.onmessage = onMsg; worker.onerror = () => status('The 3D engine could not start in this browser.', 'err'); }
  gen++; built = false; paused = false; $('#drPause').textContent = 'Pause';
  const m = baseMeas(), opts = Object.assign(baseOpts(), S.opts);
  status(lastBody ? 'Cutting and sewing the pieces…' : 'Loading the avatar…', 'run');
  worker.postMessage({ cmd: 'build', gen, style: S.style, gender: S.gender, size: S.size, height: +(S.meas || {}).height || 0, m, opts, fabric: S.fabric, fab: D.phys(fab()), h: { fast: 3, std: 2.3, fine: 1.8 }[S.quality] || 2.3 });
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
    status(d.done ? 'Settled · ' + fabName() : pulling ? 'Pulling the fabric…' : moving ? 'Moving the piece…' : d.t < .7 ? 'Sewing the seams…' : 'Draping…', d.done ? 'ok' : 'run');
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

window.FCDrapeUI = { get S() { return S; }, mat: garMat, get mesh() { return garMesh; } };
function go() { renderControls(); size(); setView('front', false); loop(); rebuild(); }
if (document.body.classList.contains('fx-locked')) { const mo = new MutationObserver(() => { if (!document.body.classList.contains('fx-locked')) { mo.disconnect(); go(); } }); mo.observe(document.body, { attributes: true, attributeFilter: ['class'] }); } else go();
