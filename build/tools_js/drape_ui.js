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
const SLEEVES = { tshirt: ['tee', 'none'], top: ['plain', 'puff', 'bell', 'cap', 'none'], kurta: ['plain', 'bell', 'puff', 'cap', 'none'], dress: ['plain', 'puff', 'bell', 'cap', 'none'], shirt: ['shirt', 'plain'], shirtdress: ['shirt', 'plain'], blouse: ['plain', 'puff', 'cap', 'none'], bodice: ['plain', 'none'] };
SLEEVE.shirt = 'Shirt sleeve';
const GROUPS = [['Tops and dresses', ['tshirt', 'top', 'peplum', 'tank', 'bodice', 'sweat', 'hoodie', 'kurta', 'dress', 'frock']], ['Dresses, Anarkali and jumpsuits', ['anarkali', 'jumpsuit']], ['Skirts', ['aline', 'pencil', 'circle', 'gathered', 'kalis', 'lehenga']],
  ['Shirts and jackets', ['shirt', 'shirtdress', 'blouse', 'polo', 'jacket', 'bandhgala', 'sherwani', 'blazer', 'coat', 'bomber']],
  ['Trousers and Indian bottoms', ['trousers', 'jeans', 'churidar', 'salwar', 'patiala', 'gharara']], ['Sets', ['kurtaset', 'kurtachuri']]];
const BTN = { horn: ['Horn', '#4a3426', .45], pearl: ['Pearl', '#efe9df', .25], metal: ['Metal', '#b8a067', .3], wood: ['Wood', '#8a5a34', .7], self: ['Covered in the fabric', '', .8], black: ['Black', '#1c1c1c', .35] };
const LEG = [['straight', 'Straight'], ['tapered', 'Tapered'], ['wide', 'Wide-leg'], ['palazzo', 'Palazzo'], ['barrel', 'Barrel'], ['jogger', 'Jogger'], ['shorts', 'Shorts']];
const PFIT = [['trouser', 'Trouser (hangs straight)'], ['slack', 'Slack (closer)'], ['jean', 'Jean (contoured)']];
const FULL = [['slim', 'Slim'], ['regular', 'Regular'], ['full', 'Full (Punjabi)']];
const CIRC = [['0.25', 'Quarter circle'], ['0.5', 'Half circle'], ['1', 'Full circle']];
const SLEN = [['cap', 'Cap'], ['short', 'Short'], ['elbow', 'Elbow'], ['3q', 'Three-quarter'], ['full', 'Full']];
const GENDER = { women: 'Female', men: 'Male', kids: 'Kids', unisex: 'Unisex' };
const BODIES = [['women', 'Adult female'], ['men', 'Adult male'], ['girl', 'Girl'], ['boy', 'Boy'], ['tgirl', 'Toddler girl'], ['tboy', 'Toddler boy']];
function chartOf(b) { b = b || S.body; return b === 'women' || b === 'men' ? b : /^t/.test(b) ? 'toddler' : 'kids'; }
function syncG() { S.gender = S.body === 'women' ? 'women' : S.body === 'men' ? 'men' : 'kids'; }
const TONES = [['form', '#cfcbc4', 'Mannequin grey'], ['white', '#efede8', 'Mannequin white'], ['black', '#34322f', 'Mannequin black'], ['t1', '#efd3bd', 'Light'], ['t2', '#d9a988', 'Light medium'], ['t3', '#b98260', 'Medium'], ['t4', '#8a5a3c', 'Medium deep'], ['t5', '#5e3b27', 'Deep']];
const MEAS = [['height', 'Height', 'Lengths'], ['nape', 'Back length (nape to waist)'], ['wh', 'Waist to hip'], ['rise', 'Crotch depth (rise)'], ['outseam', 'Waist to floor'], ['sleeve', 'Arm length (shoulder to wrist)'],
  ['bust', 'Bust / chest', 'Girths'], ['waist', 'Waist'], ['hip', 'Hip'], ['neck', 'Neck base'], ['bicep', 'Upper arm'], ['wrist', 'Wrist'], ['thigh', 'Thigh'], ['knee', 'Knee'], ['calf', 'Calf'], ['ankle', 'Ankle'],
  ['shoulder', 'Shoulder width', 'Widths']];
const BTYPES = [['', 'Standard'], ['athletic', 'Athletic'], ['mature', 'Mature (60+)'], ['maternity', 'Maternity']];
const SHAPES = [['', 'As the size chart'], ['hourglass', 'Hourglass'], ['pear', 'Pear (triangle)'], ['apple', 'Apple (round)'], ['rectangle', 'Rectangle'], ['invtri', 'Inverted triangle']];
const SHAPEADJ = { hourglass: { bust: 2, waist: -4, hip: 2 }, pear: { bust: -3, hip: 6, thigh: 3 }, apple: { bust: 3, waist: 9, hip: 1 }, rectangle: { bust: -1, waist: 5, hip: -3 }, invtri: { bust: 5, shoulder: 2, hip: -4, thigh: -2 } };
const STATURE = [['', 'Regular'], ['petite', 'Petite (shorter)'], ['tall', 'Tall']];
const HAIR = [['auto', 'Auto'], ['none', 'None'], ['short', 'Short'], ['bun', 'Bun']];
const SEAMC = ['#c4572f', '#2f6f8f', '#7a5c99', '#3d8a5a', '#b08a1e', '#a23b72', '#4a7d84', '#8c6d3f', '#5b6bbf', '#9c4f2f', '#3f7f3f', '#7f3f6f', '#2f8f7f', '#8f2f3f', '#6f6f2f', '#2f4f8f', '#b2672b', '#6a8f2f'];

let S = load();
try { const q = new URLSearchParams(location.search); if (D.STYLES[q.get('style')]) { S.style = q.get('style'); S.opts = {}; S.meas = {}; } if (GENDER[q.get('gender')]) { S.gender = q.get('gender'); S.body = S.gender === 'kids' ? 'girl' : S.gender === 'unisex' ? 'men' : S.gender; } if (q.get('size')) S.size = q.get('size'); if (q.get('o')) { const o = JSON.parse(q.get('o')); S.opts = {}; ['len', 'ease', 'neck', 'sleeve', 'slen', 'flare', 'slit', 'slen2', 'leg', 'pfit', 'tlen', 'mohri', 'fullness', 'ruch', 'gfull', 'panels', 'hemc', 'circle'].forEach(k => { const v = o[k]; if (v === undefined) return; if (/^[\d.]+$/.test(String(v))) S.opts[k] = Math.min(700, +v); else if ((k === 'neck' && NECK.some(n => n[0] === v)) || (k === 'sleeve' && SLEEVE[v]) || (k === 'slen' && SLEN.some(n => n[0] === v)) || (k === 'leg' && LEG.some(n => n[0] === v)) || (k === 'pfit' && PFIT.some(n => n[0] === v)) || (k === 'fullness' && FULL.some(n => n[0] === v))) S.opts[k] = v; }); } if (q.get('m')) { const mm = JSON.parse(q.get('m')); S.meas = {}; MEAS.forEach(k => { if (+mm[k[0]] > 0) S.meas[k[0]] = +mm[k[0]]; }); } if (q.get('style')) history.replaceState(null, '', location.pathname); } catch (e) { }
function defaults() { return { style: 'tshirt', gender: 'women', size: 'M', fabric: 'jersey', colour: '#7c8ea3', opts: {}, meas: {}, fit: 'off', bodyOn: true, seamsOn: true, quality: 'std', tone: 'form', tool: 'pull', unit: 'cm', body: 'women', pose: { arm: 46, elbow: 0, legs: 0 }, lines: { shoulder: 1, cf: 1, cb: 1, bust: 1, waist: 1, hip: 1, side: 1, neck: 1, knee: 0, armhole: 0 }, showLines: false, showPts: false, showJoints: false, tab: 'garment', fabOv: {}, myFabrics: {}, cws: null, cw: 0, hideL: false, hideR: false, trims: { btn: 'horn', zip: 'metal', top: true, thread: 'tone' } }; }
function load() { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v && D.STYLES[v.style]) { const o = Object.assign(defaults(), v); if (!o.body) o.body = o.gender === 'kids' ? 'boy' : o.gender === 'unisex' ? 'men' : o.gender; if (!D.FABRICS[o.fabric] && !(o.myFabrics || {})[o.fabric]) o.fabric = 'jersey'; return o; } } catch (e) { } return defaults(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

/* ---------- layout ---------- */
const app = $('#app');
app.innerHTML = `<div class="dr" id="drRoot">
  <aside class="dr-ctl" aria-label="Garment, avatar, fabric and colourways">
    <div class="dr-tabs" role="tablist">
      <button type="button" role="tab" data-tab="garment">Garment</button><button type="button" role="tab" data-tab="avatar">Avatar</button><button type="button" role="tab" data-tab="fabric">Fabric</button><button type="button" role="tab" data-tab="colour">Colour</button><button type="button" role="tab" data-tab="graphic">Graphics</button><button type="button" role="tab" data-tab="trim">Trims</button>
    </div>
    <div class="dr-pane" data-pane="garment">
      <label>Style<select id="drStyle"></select></label><div id="drOpts" class="dr-opts"></div>
      <label class="dr-elr" title="Used by the Elastic tool above the 3D view">Elastic length (Elastic tool) <output id="drElrO">85%</output><input type="range" id="drElr" min="60" max="99" step="1" value="85"></label>
      <div class="dr-acts"><button type="button" class="dr-p" id="drSew">Sew and drape again</button><button type="button" id="drPause">Pause</button>
        <label class="dr-q">Accuracy<select id="drQuality"><option value="fast">Fast</option><option value="std">Balanced</option><option value="fine">Accurate</option><option value="custom">Custom</option></select></label></div>
      <details class="dr-sim" id="drSimBox"><summary>Mesh and simulation</summary><div id="drSim" class="dr-props"></div></details>
    </div>
    <div class="dr-pane" data-pane="avatar" hidden>
      <div class="dr-two"><label>Body<select id="drGender"></select></label><label>Size<select id="drSize"></select></label></div>
      <div class="dr-two" id="drAdult"><label>Body type<select id="drBType"></select></label><label>Shape<select id="drShape"></select></label></div>
      <div class="dr-two"><label>Height<select id="drStature"></select></label><label>Hair<select id="drHair"></select></label></div>
      <label>Pose<select id="drPreset"></select></label>
      <div class="dr-two dr-poseb"><button type="button" class="dr-btn" id="drPoseEdit" aria-pressed="false">Edit pose</button><button type="button" class="dr-btn" id="drPoseReset">Reset pose</button></div>
      <p class="dr-note" id="drPoseNote" hidden>Click an orange joint on the avatar, then turn it with the rings. The cloth follows when you let go.</p>
      <h3>Skin tone</h3><div class="dr-sw dr-tone" id="drTone" role="radiogroup" aria-label="Avatar skin tone"></div>
      <h3>Measurements</h3><div id="drMeas" class="dr-meas"></div><button type="button" class="dr-link" id="drMeasReset">Back to the size chart</button>
      <h3>Pose (joints)</h3><div id="drPose" class="dr-props"></div>
      <h3>Reference lines</h3><div id="drLines" class="dr-lines"></div>
    </div>
    <div class="dr-pane" data-pane="fabric" hidden>
      <div class="dr-fabtop"><canvas id="drFabPrev" width="96" height="96" aria-hidden="true"></canvas><div><label>Fabric<select id="drFabric"></select></label><p class="dr-note" id="drFabNote"></p></div></div>
      <h3>Properties <span class="dr-edited" id="drEdited" hidden>edited</span></h3>
      <div id="drProps" class="dr-props"></div>
      <div class="dr-save"><input id="drFabName" maxlength="40" placeholder="Name for your fabric"><button type="button" id="drFabSave">Save as new fabric</button></div>
      <div class="dr-row"><button type="button" class="dr-link" id="drFabReset">Reset properties</button><button type="button" class="dr-link" id="drFabDel" hidden>Delete this fabric</button></div>
      <h3>Texture maps</h3><div id="drMaps" class="dr-maps"></div><input type="file" id="drMapFile" accept="image/*" hidden>
    </div>
    <div class="dr-pane" data-pane="graphic" hidden>
      <p class="dr-note">Add a logo, print or text to any piece. Click the cloth to place it, then size and turn it here.</p>
      <div class="dr-row"><button type="button" id="drGAdd">Add image</button><button type="button" id="drGText">Add text</button><input type="file" id="drGFile" accept="image/*" hidden></div>
      <div id="drGList" class="dr-cws"></div><div id="drGEdit" class="dr-props"></div>
    </div>
    <div class="dr-pane" data-pane="trim" hidden><div id="drTrimPane"></div></div>
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
        <label class="dr-chk"><input type="checkbox" id="drBody"> Avatar</label><label class="dr-chk"><input type="checkbox" id="drSeams"> Seam lines</label><label class="dr-chk"><input type="checkbox" id="drWire"> Mesh wireframe</label><label class="dr-chk"><input type="checkbox" id="drShowLines"> Avatar reference lines</label><label class="dr-chk"><input type="checkbox" id="drShowPts"> Arrangement points</label><label class="dr-chk"><input type="checkbox" id="drShowJoints"> Joints</label><hr><button type="button" class="dr-mi" id="drHD">Save HD image</button><button type="button" class="dr-mi" id="drTurn">Record turntable video</button><button type="button" class="dr-mi" id="drClear">Remove pins, tacks and elastic</button></div></details>
      <div class="dr-seg" id="drTool" aria-label="Mouse tool"><button data-t="pull" title="Drag the fabric to pull it, as you would on a real garment">Pull</button><button data-t="pin" title="Click the cloth to pin it where it is; click a pin to remove it">Pin</button><button data-t="tack" title="Click two points of the cloth to tack them together">Tack</button><button data-t="elastic" title="Click near an edge of the garment (waist, cuff, hem, neckline) to sew elastic into it">Elastic</button><button data-t="move" title="Click a piece to move, rotate, freeze or stiffen it">Piece</button></div>
      <div class="dr-seg" id="drGz" hidden><button data-g="translate" aria-pressed="true" title="Move (W)">Move</button><button data-g="rotate" title="Rotate (E)">Rotate</button><button data-g="freeze" title="Hold this piece still while the rest drapes">Freeze</button><button data-g="stiff" title="Interfacing: make this piece stiffer, like a fused collar or facing">Interfacing</button><button data-g="elastic" title="Gather the hem of this piece with elastic">Elastic hem</button><button data-g="done" title="Finish (Esc)">Done</button></div>
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
    <section class="dr-pm"><a href="pattern-maker.html" target="_blank" rel="noopener" id="drPM">Open this pattern in Garment Studio ↗</a>
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
const PRESET = { fast: { h: 3, sub: 8 }, std: { h: 2.3, sub: 14 }, fine: { h: 1.6, sub: 22 } };
const SIMP = [['h', 'Particle distance (mesh density)', 1.2, 5, .1, ' cm', 'Smaller means a finer mesh: more detail in folds, slower'], ['sub', 'Solver steps per frame', 4, 30, 1, '', 'More steps: stiffer, more exact cloth, slower'], ['th', 'Collision thickness', 1, 8, .5, ' mm', 'Gap kept between the cloth and the avatar'], ['grav', 'Gravity', 50, 150, 5, '%', 'Lower lets light fabrics float; higher settles faster'], ['air', 'Air resistance', 0, 2, .1, '×', 'How much the air slows the cloth']];
function simset() { const q = S.quality in PRESET ? PRESET[S.quality] : {}; return Object.assign({ h: 2.3, sub: 14, th: 3, grav: 100, air: 1, self: true, mesh: 'tri' }, S.simset || {}, S.quality in PRESET ? q : {}); }
function simMsg() { const z = simset(); return { sub: z.sub, th: S.quality === 'custom' ? z.th / 10 : 0, self: !!z.self, grav: 981 * z.grav / 100, air: z.air }; }
const MAPS = [['map', 'Base colour'], ['normalMap', 'Normal'], ['roughnessMap', 'Roughness'], ['alphaMap', 'Opacity'], ['displacementMap', 'Displacement']];
function maps() { return S.maps || (S.maps = {}); }
function readImg(file, max, png) { return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.width * k)); c.height = Math.max(1, Math.round(im.height * k)); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL(png ? 'image/png' : 'image/jpeg', .9)); }; im.onerror = rej; im.src = fr.result; }; fr.onerror = rej; fr.readAsDataURL(file); }); }
function trims() { return S.trims || (S.trims = { btn: 'horn', zip: 'metal', top: true, thread: 'tone' }); }

/* ---------- controls ---------- */
function opt(v, l, cur) { return `<option value="${esc(v)}"${String(v) === String(cur) ? ' selected' : ''}>${esc(l)}</option>`; }
function style() { return D.STYLES[S.style]; }
function gar() { return PM.GARMENTS[style().gid]; }
function genders() { return gar().g.filter(g => g !== 'unisex' || !gar().g.includes('men')); }
function sizes() { const c = chartOf(); return Object.keys(PM.CHARTS[c]).filter(k => !(c === 'kids' && k === '2Y')); }
function baseMeas() {
  const m = Object.assign({}, PM.CHARTS[chartOf()][S.size]), adult = S.body === 'women' || S.body === 'men', adj = adult && SHAPEADJ[S.shape];
  if (adj) Object.keys(adj).forEach(k => { if (m[k]) m[k] = Math.round((m[k] + adj[k]) * 10) / 10; });
  if (adult && S.btype === 'maternity' && S.body === 'women') { m.waist = Math.round(m.waist + 24); m.bust += 6; m.hip += 4; }
  Object.keys(S.meas || {}).forEach(k => { if (k !== 'height' && +S.meas[k] > 0) m[k] = +S.meas[k]; });
  if (S.meas && +S.meas.bust > 0 && S.gender === 'women') m.bust_depth = Math.round((m.bust / 12 + 16.5) * 2) / 2;
  return m;
}
function baseOpts() { // the same starting values as Pattern Maker
  const o = Object.assign({}, gar().d, style().def || {}), gid = style().gid;
  const kf = /^t/.test(S.body) ? .45 : .62; if (S.gender === 'kids') { if (o.len) o.len = Math.round(o.len * kf); if (o.slen2) o.slen2 = Math.round(o.slen2 * kf * .97); if (o.ease) o.ease = Math.max(6, Math.round(o.ease * .75)); if (o.slit) o.slit = 12; }
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
  const okB = BODIES.filter(b => genders().includes(b[0] === 'women' || b[0] === 'men' ? b[0] : 'kids') || (b[0] !== 'women' && b[0] !== 'men' ? false : gar().g.includes('unisex')));
  if (!okB.some(b => b[0] === S.body)) S.body = okB[0][0]; syncG();
  if (!sizes().includes(S.size)) S.size = sizes()[Math.min(2, sizes().length - 1)];
  $('#drGender').innerHTML = okB.map(b => opt(b[0], b[1], S.body)).join('');
  $('#drSize').innerHTML = sizes().map(s => opt(s, s, S.size)).join('');
  const adult = S.body === 'women' || S.body === 'men', bt = BTYPES.filter(b => b[0] !== 'maternity' || S.body === 'women'); if (!adult || !bt.some(b => b[0] === (S.btype || ''))) S.btype = adult && bt.some(b => b[0] === S.btype) ? S.btype : '';
  $('#drAdult').hidden = !adult; $('#drBType').innerHTML = bt.map(b => opt(b[0], b[1], S.btype || '')).join(''); $('#drShape').innerHTML = SHAPES.map(b => opt(b[0], b[1], S.shape || '')).join('');
  $('#drElr').value = S.elasticR || 85; $('#drElrO').textContent = (S.elasticR || 85) + '%'; $('#drStature').innerHTML = STATURE.map(b => opt(b[0], b[1], S.stature || '')).join(''); $('#drPreset').innerHTML = Object.keys(D.POSES).map(k => opt(k, D.POSES[k].n, S.poseMap ? '' : S.preset || 'a')).join('') + (S.poseMap ? '<option value="" selected>Custom pose</option>' : ''); $('#drPoseEdit').setAttribute('aria-pressed', !!poseEdit); $('#drPoseNote').hidden = !poseEdit; $('#drHair').innerHTML = HAIR.map(b => opt(b[0], b[1], S.hair || 'auto')).join('');
  $('#drQuality').value = S.quality;
  const st = style(), G = gar(), h = [];
  if (st.kind === 'torso') {
    if (G.o.includes('neck')) h.push(`<label>Neckline<select data-o="neck">${NECK.map(n => opt(n[0], n[1], optVal('neck'))).join('')}</select></label>`);
    if (st.open) h.push(`<label>${st.zip ? 'Zip' : 'Front'}<select data-o="fasten">${opt('closed', st.zip ? 'Zipped up' : 'Buttoned', optVal('fasten') || 'closed')}${opt('open', st.zip ? 'Unzipped' : 'Unbuttoned', optVal('fasten'))}</select></label>`);
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
  const T = trims(), hasBtn = st.kind === 'torso' && (st.open || st.gid === 'polo') && !st.zip;
  if (st.kind === 'torso' && (st.open || st.gid === 'polo')) h.push(`<h3>Trims</h3>` + (hasBtn ? `<label>Buttons<select data-t="btn">${Object.keys(BTN).map(k => opt(k, BTN[k][0], T.btn)).join('')}</select></label>` : '') + (st.zip ? `<label>Zip<select data-t="zip">${opt('metal', 'Metal teeth', T.zip)}${opt('plastic', 'Moulded plastic', T.zip)}${opt('brass', 'Antique brass', T.zip)}</select></label>` : '') +
    `<label class="dr-chk"><input type="checkbox" data-t="top"${T.top ? ' checked' : ''}> Topstitching</label><label>Thread<select data-t="thread">${opt('tone', 'Tone on tone', T.thread)}${opt('contrast', 'Contrast (second colour)', T.thread)}</select></label>`);
  h.push(`<label>Seam puckering <output>${(+S.pucker || 0)}%</output><input type="range" data-x="pucker" min="0" max="6" step="0.5" value="${+S.pucker || 0}"></label>`);
  $('#drOpts').innerHTML = h.join('');
  const m = baseMeas(); m.height = +(S.meas || {}).height || (lastBody ? Math.round(lastBody.height) : '');
  const us = (UNIT[S.unit] || UNIT.cm)[2];
  $('#drMeas').innerHTML = MEAS.filter(k => k[0] === 'height' || m[k[0]] !== undefined).map(k => (k[2] ? `<h4>${k[2]}</h4>` : '') + `<label>${k[1]}<span><input type="number" step="${us}" min="0" data-m="${k[0]}" value="${m[k[0]] === '' ? '' : toU(m[k[0]])}"> ${S.unit === 'in' ? 'in' : S.unit}</span></label>`).join('');
  $('#drTone').innerHTML = TONES.map(t => `<button type="button" role="radio" aria-checked="${t[0] === S.tone}" title="${t[2]}" aria-label="${t[2]}" data-tone="${t[0]}" style="background:${t[1]}"></button>`).join('');
  const PO = S.pose || (S.pose = { arm: 46, elbow: 0, legs: 0 });
  $('#drPose').innerHTML = [['arm', 'Arms out from the body (shoulders)', 20, 80, 1, '°'], ['elbow', 'Elbow bend', 0, 60, 1, '°'], ['legs', 'Legs apart (hips)', 0, 15, 1, '°']].map(p => `<label>${p[1]} <output>${+PO[p[0]] || (p[0] === 'arm' ? 46 : 0)}${p[5]}</output><input type="range" data-pose="${p[0]}" min="${p[2]}" max="${p[3]}" step="${p[4]}" value="${+PO[p[0]] || (p[0] === 'arm' ? 46 : 0)}"></label>`).join('');
  $('#drLines').innerHTML = LINES.map(l => `<label class="dr-chk"><input type="checkbox" data-line="${l[0]}"${(S.lines || {})[l[0]] ? ' checked' : ''}><i style="background:${l[2]}"></i>${l[1]}</label>`).join('');
  $('#drShowLines').checked = !!S.showLines; $('#drShowPts').checked = !!S.showPts; $('#drShowJoints').checked = !!S.showJoints;
  const Z = simset();
  $('#drSim').innerHTML = `<label>Mesh<select data-sim="mesh">${opt('tri', 'Triangles', Z.mesh)}${opt('quad', 'Quads', Z.mesh)}</select></label>` + SIMP.map(p => `<label title="${p[6]}">${p[1]} <output>${(+Z[p[0]]).toString()}${p[5]}</output><input type="range" data-sim="${p[0]}" min="${p[2]}" max="${p[3]}" step="${p[4]}" value="${Z[p[0]]}"></label>`).join('') + `<label class="dr-chk"><input type="checkbox" data-sim="self"${Z.self ? ' checked' : ''}> Cloth collides with itself</label><p class="dr-note">${(lastMesh ? lastMesh.verts : 0) ? lastMesh.verts.toLocaleString() + ' particles in this garment. ' : ''}Accuracy presets set the mesh density and steps; change any value for Custom.</p>`;
  renderFabric(); renderColour(); renderMaps(); renderGraphics(); if (typeof renderTrimPane === 'function') renderTrimPane();
  $$('#drTool button').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === S.tool));
  $$('#drViews button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === view));
  $$('#drFit button').forEach(b => b.setAttribute('aria-pressed', b.dataset.f === S.fit));
  $$('#drUnits button').forEach(b => b.setAttribute('aria-pressed', b.dataset.u === S.unit));
  $('#drBody').checked = S.bodyOn; $('#drSeams').checked = S.seamsOn; $('#drWire').checked = !!S.wire;
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
function renderMaps() {
  const M = maps(); $('#drMaps').innerHTML = MAPS.map(([k, l]) => { const m = M[k]; return `<div class="dr-map"><span class="dr-mthumb"${m ? ` style="background-image:url(${m.src})"` : ''}></span><div><b>${l}</b>${m ? `<label>Tile <output>${L(m.tile)}</output><input type="range" data-mk="${k}" data-mp="tile" min="1" max="60" step="0.5" value="${m.tile}"></label><label>Turn <output>${m.rot}°</output><input type="range" data-mk="${k}" data-mp="rot" min="0" max="180" step="5" value="${m.rot}"></label><label>Strength <output>${m.str}</output><input type="range" data-mk="${k}" data-mp="str" min="0" max="${k === 'displacementMap' ? 1 : 2}" step="0.05" value="${m.str}"></label><button type="button" class="dr-link" data-mdel="${k}">Remove</button>` : `<button type="button" class="dr-link" data-madd="${k}">Add map…</button>`}</div></div>`; }).join('') + '<p class="dr-note">Maps repeat at the tile size you set, in real cm on the pattern. A base colour map replaces the colourway colour; normal, roughness, opacity and displacement change the surface.</p>';
}
let mapAdd = null;
$('#drMaps').addEventListener('click', e => { const a = e.target.dataset.madd, d = e.target.dataset.mdel; if (a) { mapAdd = a; $('#drMapFile').click(); } if (d) { delete maps()[d]; save(); renderMaps(); applyMaterial(); } });
$('#drMapFile').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; if (!f || !mapAdd) return; readImg(f, 1024, /normal|alpha/.test(mapAdd)).then(src => { maps()[mapAdd] = { src, tile: 10, rot: 0, str: mapAdd === 'displacementMap' ? .2 : 1 }; try { save(); } catch (er) {} renderMaps(); applyMaterial(); }).catch(() => status('Could not read that image', 'err')); });
$('#drMaps').addEventListener('input', e => { const k = e.target.dataset.mk, q = e.target.dataset.mp; if (!k) return; maps()[k][q] = +e.target.value; e.target.parentNode.querySelector('output').textContent = q === 'tile' ? L(+e.target.value) : q === 'rot' ? e.target.value + '°' : e.target.value; save(); applyMaterial(); });
const userTex = {};
function userMap(k) { const m = maps()[k]; if (!m) return null; let u = userTex[k]; if (!u || u.src !== m.src) { if (u) u.t.dispose(); const t = new THREE.TextureLoader().load(m.src, () => { dirty = true; }); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (k === 'map') t.colorSpace = THREE.SRGBColorSpace; u = userTex[k] = { src: m.src, t }; } u.t.repeat.set(1 / m.tile, 1 / m.tile); u.t.rotation = m.rot * Math.PI / 180; u.t.center.set(.5, .5); return u.t; }
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
function refab() { save(); applyMaterial(); if (worker && built) { worker.postMessage({ cmd: 'fabric', fab: D.phys(fab()), sim: simMsg(), gen }); status('Draping in ' + fabName().toLowerCase() + '…', 'run'); } }
$('.dr-tabs').addEventListener('click', e => { const t = e.target.dataset.tab; if (!t) return; S.tab = t; save(); renderControls(); });
$('#drStyle').addEventListener('change', e => { S.style = e.target.value; S.opts = {}; save(); renderControls(); rebuild(); });
$('#drGender').addEventListener('change', e => { S.body = e.target.value; syncG(); S.meas = {}; S.opts = {}; save(); renderControls(); rebuild(); });
$('#drSize').addEventListener('change', e => { S.size = e.target.value; S.meas = {}; save(); renderControls(); rebuild(); });
['BType:btype', 'Shape:shape', 'Stature:stature'].forEach(x => { const [id, k] = x.split(':'); $('#dr' + id).addEventListener('change', e => { S[k] = e.target.value; save(); renderControls(); rebuild(); }); });
$('#drPreset').addEventListener('change', e => { if (!e.target.value) return; S.preset = e.target.value; S.poseMap = null; save(); if (worker && built) { worker.postMessage({ cmd: 'pose', preset: S.preset, gen }); status('Moving to ' + D.POSES[S.preset].n.toLowerCase() + '…', 'run'); } else rebuild(); });
$('#drElr').addEventListener('input', e => { S.elasticR = +e.target.value; $('#drElrO').textContent = S.elasticR + '%'; save(); });
$('#drHair').addEventListener('change', e => { S.hair = e.target.value; save(); if (curBody) buildBody(curBody); dirty = true; });
$('#drFabric').addEventListener('change', e => { S.fabric = e.target.value; S.fabOv = {}; renderFabric(); refab(); });
$('#drProps').addEventListener('input', e => { const k = e.target.dataset.p; if (!k) return; S.fabOv = S.fabOv || {}; S.fabOv[k] = k === 'tex' ? e.target.value : +e.target.value; const p = PROPS.find(q => q[0] === k), o = e.target.parentNode.querySelector('output'); if (o && p) o.textContent = fmtP(p, +e.target.value); e.target.parentNode.classList.add('ov'); $('#drEdited').hidden = false; save(); applyMaterial(); drawFabPrev(); if (!['sheen', 'op', 'tex'].includes(k)) later(refab, 250); });
$('#drFabReset').addEventListener('click', () => { S.fabOv = {}; renderFabric(); refab(); });
$('#drFabSave').addEventListener('click', () => { const n = $('#drFabName').value.trim() || fab().n + ' (mine)', id = 'my' + Date.now().toString(36); myFabs()[id] = Object.assign(fab(), { n, g: 'My fabrics', note: 'Your own fabric, based on ' + baseFab().n.toLowerCase() + '.' }); S.fabric = id; S.fabOv = {}; $('#drFabName').value = ''; renderFabric(); refab(); status('Saved “' + n + '” to My fabrics', 'ok'); });
$('#drFabDel').addEventListener('click', () => { if (!myFabs()[S.fabric]) return; delete myFabs()[S.fabric]; S.fabric = 'jersey'; S.fabOv = {}; renderFabric(); refab(); });
$('#drQuality').addEventListener('change', e => { if (e.target.value === 'custom') { S.simset = simset(); S.quality = 'custom'; save(); renderControls(); return; } S.quality = e.target.value; S.simset = Object.assign({}, S.simset || {}, PRESET[S.quality]); save(); renderControls(); rebuild(); });
$('#drSim').addEventListener('input', e => { const k = e.target.dataset.sim; if (!k) return; S.simset = simset(); S.quality = 'custom'; $('#drQuality').value = 'custom'; S.simset[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.tagName === 'SELECT' ? e.target.value : +e.target.value; const p = SIMP.find(q => q[0] === k), o = e.target.parentNode.querySelector('output'); if (o && p) o.textContent = e.target.value + p[5]; save();
  if (k === 'h' || k === 'mesh') later(rebuild, 500); else if (worker && built) { worker.postMessage({ cmd: 'fabric', fab: D.phys(fab()), sim: simMsg(), gen }); status('Re-draping with the new settings…', 'run'); } });
$('#drOpts').addEventListener('input', e => { if (e.target.dataset.x === 'pucker') { S.pucker = +e.target.value; e.target.parentNode.querySelector('output').textContent = S.pucker + '%'; save(); if (worker && built) worker.postMessage({ cmd: 'pucker', a: S.pucker / 100, gen }); return; } const tk = e.target.dataset.t; if (tk) { trims()[tk] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; save(); trimLook(); return; } const k = e.target.dataset.o; if (!k) return; const v = e.target.type === 'range' ? +e.target.value : e.target.value; S.opts[k] = v; const o = e.target.parentNode.querySelector('output'); if (o) o.textContent = outTxt(k, v); save(); if (e.target.tagName === 'SELECT') { renderControls(); rebuild(); } else later(rebuild); });
$('#drMeas').addEventListener('input', e => { const k = e.target.dataset.m; if (!k || !(+e.target.value > 0)) return; S.meas[k] = Math.round(fromU(+e.target.value) * 10) / 10; save(); later(rebuild, 600); });
$('#drPose').addEventListener('input', e => { const k = e.target.dataset.pose; if (!k) return; S.pose = S.pose || {}; S.pose[k] = +e.target.value; e.target.parentNode.querySelector('output').textContent = e.target.value + '°'; save(); later(rebuild, 700); });
$('#drLines').addEventListener('change', e => { const k = e.target.dataset.line; if (!k) return; S.lines = S.lines || {}; S.lines[k] = e.target.checked ? 1 : 0; if (e.target.checked) S.showLines = true; save(); $('#drShowLines').checked = !!S.showLines; showOverlays(); });
['Lines', 'Pts', 'Joints'].forEach(k => $('#drShow' + k).addEventListener('change', e => { S['show' + k] = e.target.checked; save(); showOverlays(); }));
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
$('#drTone').addEventListener('click', e => { const t = e.target.dataset && e.target.dataset.tone; if (!t) return; const was = /^t/.test(S.tone || ''); S.tone = t; save(); if (was !== /^t/.test(t) && (S.hair || 'auto') === 'auto' && curBody) buildBody(curBody); $$('#drTone button').forEach(b => b.setAttribute('aria-checked', b.dataset.tone === t)); tintBody(); });
$('#drTool').addEventListener('click', e => { const t = e.target.dataset.t; if (!t) return; S.tool = t; save(); $$('#drTool button').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === t)); if (t === 'pull') selectPanel(-1); tackA = null; $('#drHint').textContent = { move: 'Click a piece to move, rotate, freeze or stiffen it · Drag the background to turn', pin: 'Click the cloth to pin it · Click a pin to remove it', tack: 'Click a point, then a second point, to tack them together' }[t] || 'Drag the fabric to pull it · Drag the background to turn · Scroll to zoom · Right-drag to pan'; });
$('#drGz').addEventListener('click', e => { const g = e.target.dataset.g; if (!g) return; if (g === 'done') { selectPanel(-1); return; }
  if (g === 'freeze' || g === 'stiff' || g === 'elastic') { const k = selPanel, on = !(PS[g] && PS[g][k]); (PS[g] = PS[g] || {})[k] = on; e.target.setAttribute('aria-pressed', on);
    if (g === 'freeze') worker.postMessage({ cmd: 'freeze', panel: k, on, gen });
    if (g === 'stiff') worker.postMessage({ cmd: 'stiff', panel: k, k: on ? 10 : 1, gen });
    if (g === 'elastic') { if (on) { const keys = (lastMesh.panels[k].segs || []).map(q => q.key).filter(q => /hem/.test(q)); if (!keys.length) { status('This piece has no hem for elastic', 'err'); PS.elastic[k] = false; e.target.setAttribute('aria-pressed', false); return; } worker.postMessage({ cmd: 'elastic', panel: k, keys, ratio: .78, gen }); } else worker.postMessage({ cmd: 'unelastic', gen }); }
    paused = false; status({ freeze: on ? 'Piece frozen' : 'Piece free again', stiff: on ? 'Interfacing added to this piece' : 'Interfacing removed', elastic: on ? 'Elastic in the hem' : 'Elastic removed' }[g], 'run'); return; } tc.setMode(g); $$('#drGz button').forEach(b => b.setAttribute('aria-pressed', b.dataset.g === g)); });
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
$('#drWire').addEventListener('change', e => { S.wire = e.target.checked; save(); if (wireMesh) wireMesh.visible = S.wire; dirty = true; });
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
{ // a soft studio for reflections (buttons, zips, satin, leather)
  const env = new THREE.Scene(), box = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: '#8d877d', side: THREE.BackSide })); env.add(box);
  [[0, 4.9, 0, 6, 6, '#ffffff'], [4.9, 1, 2, 3, 5, '#f4efe6'], [-4.9, 1.5, -1, 2.5, 4, '#dfe6f2']].forEach(([x, y, z, w, h, c]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); });
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(env, .04).texture; scene.environmentIntensity = .45;
}
const key = new THREE.DirectionalLight(0xffffff, 2.1); key.position.set(120, 260, 220); key.castShadow = true;
key.shadow.mapSize.set(4096, 4096); Object.assign(key.shadow.camera, { left: -110, right: 110, top: 200, bottom: -20, near: 50, far: 700 }); key.shadow.bias = -.0008; key.shadow.normalBias = 1.4;
scene.add(key);
const fill = new THREE.DirectionalLight(0xdfe8ff, .55); fill.position.set(-220, 120, -60); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 1.1); rim.position.set(-80, 220, -260); scene.add(rim);
const floor = new THREE.Mesh(new THREE.CircleGeometry(160, 64), new THREE.MeshStandardMaterial({ color: '#e3ddd2', roughness: 1 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const bodyGroup = new THREE.Group(); scene.add(bodyGroup);
const bodyMat = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .5, metalness: 0, sheen: 0, sheenRoughness: .7, sheenColor: new THREE.Color('#ffd9c7') });
const LOGO = (() => { const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.font = '700 150px "DM Sans", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; if ('letterSpacing' in g) g.letterSpacing = '28px'; g.fillText('FORECUT', 512, 134);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; if (document.fonts) document.fonts.ready.then(() => { g.clearRect(0, 0, 1024, 256); g.fillText('FORECUT', 512, 134); t.needsUpdate = true; dirty = true; }); return t; })();

const UNDER = { form: '#cfcbc4', white: '#efede8', black: '#34322f', t1: '#3b3f46', t2: '#3b3f46', t3: '#2f3237', t4: '#e9e4dc', t5: '#e9e4dc' };
const bodyU = { logoMap: { value: LOGO }, logoC: { value: 0 }, logoW: { value: 14 }, logoCol: { value: new THREE.Color('#6a645b') }, skin: { value: new THREE.Color() }, cloth: { value: new THREE.Color() }, pt: { value: 0 }, lc: { value: 0 }, lr: { value: 0 }, hh: { value: 1 }, bl: { value: 0 }, bh: { value: 0 } };
bodyMat.onBeforeCompile = sh => { // underwear drawn per pixel from heights, so its edges are clean
  Object.assign(sh.uniforms, bodyU);
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float elig; varying float vEl; varying vec3 vW;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvEl = elig; vW = (modelMatrix * vec4(position, 1.0)).xyz;');
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 skin; uniform vec3 cloth; uniform float pt, lc, lr, hh, bl, bh, logoC, logoW; uniform vec3 logoCol; uniform sampler2D logoMap; varying float vEl; varying vec3 vW;')
    .replace('#include <color_fragment>', `#include <color_fragment>
      float ax = abs(vW.x), cut = lc + lr * smoothstep(.25, .95, ax / hh);
      float pants = step(.5, vEl) * step(vW.y, pt) * step(cut, vW.y);
      float bra = step(.5, vEl) * step(bl, vW.y) * step(vW.y, bh) * step(.01, bh - bl);
      float u = max(pants, bra); diffuseColor.rgb = mix(skin, cloth, u);
      if (vW.z > 1.0) { vec2 lu = vec2(.5 - vW.x / logoW, (logoC - vW.y) / (logoW * .25) + .5); if (lu.x > 0. && lu.x < 1. && lu.y > 0. && lu.y < 1.) diffuseColor.rgb = mix(diffuseColor.rgb, logoCol, texture2D(logoMap, lu).a * .9); }`);
};
/* Loop subdivision for the display skin: one level turns the 26 000 triangle body into a smooth 105 000 triangle surface */
function loopSub(P, T, A, X) {
  const n = P.length / 3, E = new Map(), eo = [], key = (a, b) => a < b ? a * n + b : b * n + a;
  for (let t = 0; t < T.length; t += 3) for (let e = 0; e < 3; e++) { const a = T[t + e], b = T[t + (e + 1) % 3], c = T[t + (e + 2) % 3], k = key(a, b); let id = E.get(k); if (id === undefined) { id = eo.length; E.set(k, id); eo.push([a, b, c, -1]); } else eo[id][3] = c; }
  const m = eo.length, NP = new Float32Array((n + m) * 3), NA = new Float32Array(n + m), NX = new Float32Array(n + m), nb = Array.from({ length: n }, () => []), bd = new Uint8Array(n);
  eo.forEach(([a, b, c, d], i) => { nb[a].push(b); nb[b].push(a); const o = 3 * (n + i);
    if (d < 0) { bd[a] = bd[b] = 1; for (let k = 0; k < 3; k++) NP[o + k] = (P[3 * a + k] + P[3 * b + k]) / 2; }
    else for (let k = 0; k < 3; k++) NP[o + k] = .375 * (P[3 * a + k] + P[3 * b + k]) + .125 * (P[3 * c + k] + P[3 * d + k]);
    NA[n + i] = (A[a] + A[b]) / 2; NX[n + i] = (X[a] + X[b]) / 2; });
  for (let v = 0; v < n; v++) { const N = nb[v], k = N.length; NA[v] = A[v]; NX[v] = X[v];
    if (bd[v]) { const B = N.filter(u => eo[E.get(key(u, v))][3] < 0); if (B.length === 2) { for (let q = 0; q < 3; q++) NP[3 * v + q] = .75 * P[3 * v + q] + .125 * (P[3 * B[0] + q] + P[3 * B[1] + q]); continue; } for (let q = 0; q < 3; q++) NP[3 * v + q] = P[3 * v + q]; continue; }
    const be = k > 3 ? 3 / (8 * k) : 3 / 16; for (let q = 0; q < 3; q++) { let sm = 0; for (const u of N) sm += P[3 * u + q]; NP[3 * v + q] = (1 - k * be) * P[3 * v + q] + be * sm; } }
  const NT = new Uint32Array(T.length * 4);
  for (let t = 0, o = 0; t < T.length; t += 3) { const a = T[t], b = T[t + 1], c = T[t + 2], ab = n + E.get(key(a, b)), bc = n + E.get(key(b, c)), ca = n + E.get(key(c, a)); NT.set([a, ab, ca, b, bc, ab, c, ca, bc, ab, bc, ca], o); o += 12; }
  return { P: NP, T: NT, A: NA, X: NX };
}
const hairMat = new THREE.MeshStandardMaterial({ color: '#2a1c14', roughness: .72, metalness: 0 });
hairMat.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float hl; varying float vHl;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvHl = hl;');
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vHl;').replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (vHl < 0.0) discard;'); };
const eyeMat = new THREE.MeshStandardMaterial({ color: '#f1ede6', roughness: .25 }), irisMat = new THREE.MeshStandardMaterial({ color: '#3a2618', roughness: .3 }), pupilMat = new THREE.MeshStandardMaterial({ color: '#0d0907', roughness: .2 });
function buildBody(body) {
  bodyGroup.clear();
  const n0 = body.pos.length / 3, el0 = new Float32Array(n0); for (let i = 0; i < n0; i++) el0[i] = body.mask[i] / 255;
  // hands and feet: no inset (it thinned fingers and toes to splinters) and a light smoothing of the toes and fingertips
  const J = body.J || {}, ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }, X0 = new Float32Array(n0), P0 = new Float32Array(body.pos);
  const ank = Math.max((J['l-ankle'] || [0, 7])[1], (J['r-ankle'] || [0, 7])[1]), hl = J['l-hand'], hr = J['r-hand'];
  for (let i = 0; i < n0; i++) { const x = P0[3 * i], y = P0[3 * i + 1], z = P0[3 * i + 2], fw = 1 - ss(ank - 1, ank + 4, y), H = x > 0 ? hl : hr, hw = H ? 1 - ss(5, 11, Math.hypot(x - H[0], y - H[1], z - H[2])) : 0; X0[i] = Math.max(fw, hw); }
  { const nb0 = Array.from({ length: n0 }, () => new Set()); for (let t = 0; t < body.tri.length; t += 3) { const a = body.tri[t], b = body.tri[t + 1], c = body.tri[t + 2]; nb0[a].add(b).add(c); nb0[b].add(a).add(c); nb0[c].add(a).add(b); }
    const idx = []; for (let i = 0; i < n0; i++) if (X0[i] > .05) idx.push(i); const tmp = new Float32Array(P0.length);
    for (let it = 0; it < 6; it++) { tmp.set(P0); for (const i of idx) { let sx = 0, sy = 0, sz = 0, c = 0; for (const j of nb0[i]) { sx += tmp[3 * j]; sy += tmp[3 * j + 1]; sz += tmp[3 * j + 2]; c++; } if (!c) continue; const w = .5 * X0[i] * (it % 2 ? -.53 / .5 : 1); P0[3 * i] += w * (sx / c - tmp[3 * i]); P0[3 * i + 1] += w * (sy / c - tmp[3 * i + 1]); P0[3 * i + 2] += w * (sz / c - tmp[3 * i + 2]); } } }
  const sub = loopSub(P0, body.tri, el0, X0), n = sub.P.length / 3, g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(sub.P, 3)); g.setIndex(new THREE.BufferAttribute(sub.T, 1)); g.setAttribute('elig', new THREE.BufferAttribute(sub.A, 1));
  g.computeVertexNormals();
  // draw the skin a little inside the collision surface so it never shows through the cloth
  const p = g.attributes.position, nr = g.attributes.normal; for (let i = 0; i < n; i++) { const k = .4 * (1 - sub.X[i]); p.setXYZ(i, p.getX(i) - nr.getX(i) * k, p.getY(i) - nr.getY(i) * k, p.getZ(i) - nr.getZ(i) * k); }
  const u = body.under; bodyU.pt.value = u.pantsTop; bodyU.lc.value = u.legCut; bodyU.lr.value = u.legRise; bodyU.hh.value = u.hipHalf; bodyU.bl.value = u.braLo; bodyU.bh.value = u.braHi;
  bodyMesh = new THREE.Mesh(g, bodyMat); bodyMesh.castShadow = bodyMesh.receiveShadow = true; bodyGroup.add(bodyMesh);
  const by = body.y; bodyU.logoC.value = by.bust + (by.hps - by.bust) * .45; bodyU.logoW.value = Math.max(5, body.m.bust * .15);
  // hair: a sculpted cap that follows the scalp, with a bun for the female forms; mannequin finishes keep a moulded bun
  const P = sub.P, fem = /women|girl/.test(body.cat || S.body), tone = TONES.find(x => x[0] === S.tone) || TONES[0], skin = /^t/.test(tone[0]);
  let hair = S.hair || 'auto'; if (hair === 'auto') hair = skin ? (fem ? 'bun' : 'short') : (fem ? 'mbun' : 'none');
  let x0 = 1e9, x1 = -1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < n; i++) { const y = P[3 * i + 1]; if (y < by.neckTop) continue; x0 = Math.min(x0, P[3 * i]); x1 = Math.max(x1, P[3 * i]); y1 = Math.max(y1, y); z0 = Math.min(z0, P[3 * i + 2]); z1 = Math.max(z1, P[3 * i + 2]); }
  const hw = x1 - x0, hh2 = y1 - by.neckTop, cz = (z0 + z1) / 2;
  if (hair === 'short' || hair === 'bun') { // the whole head shell, cut per pixel along a smooth hairline so its edge is clean
    const th = (fem ? 1.1 : .6) * Math.max(.6, hh2 / 24), line = i => { const x = P[3 * i], z = P[3 * i + 2] - cz, c = Math.cos(Math.atan2(x, z)), t = (P[3 * i + 1] - by.neckTop) / hh2; return t - (c > 0 ? .64 + .12 * Math.pow(c, .7) : .64 + (fem ? .48 : .38) * c); };
    const keep = new Int32Array(n).fill(-1), HP = [], HL = [], HT = []; let cnt = 0; const sm = e => e <= 0 ? 0 : e >= 1 ? 1 : e * e * (3 - 2 * e);
    for (let t = 0; t < sub.T.length; t += 3) { const a = sub.T[t], b = sub.T[t + 1], c = sub.T[t + 2]; if (P[3 * a + 1] < by.neckTop || Math.max(line(a), line(b), line(c)) < -.01) continue;
      [a, b, c].forEach(v => { if (keep[v] < 0) { const l = line(v), tv = (P[3 * v + 1] - by.neckTop) / hh2, off = th * (.55 + .45 * tv) * sm(l / .06) + .42; keep[v] = cnt++; HL.push(l); HP.push(P[3 * v] + nr.getX(v) * off, P[3 * v + 1] + nr.getY(v) * off, P[3 * v + 2] + nr.getZ(v) * off); } }); HT.push(keep[a], keep[b], keep[c]); }
    if (HT.length) { const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(HP), 3)); hg.setAttribute('hl', new THREE.BufferAttribute(new Float32Array(HL), 1)); hg.setIndex(HT); hg.computeVertexNormals(); const hm = new THREE.Mesh(hg, hairMat); hm.castShadow = true; bodyGroup.add(hm); }
  }
  // eyes for the realistic skin tones: sclera, iris and pupil set into the sockets
  if (skin && body.J && body.J['l-eye'] && body.J['r-eye']) ['l-eye', 'r-eye'].forEach(k => { const e = body.J[k], r = Math.max(.7, Math.min(1.25, hh2 / 22)), ball = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), eyeMat); ball.position.set(e[0], e[1], e[2] - .25); bodyGroup.add(ball);
    const iris = new THREE.Mesh(new THREE.CircleGeometry(r * .5, 24), irisMat); iris.position.set(e[0], e[1], e[2] - .25 + r * .985); bodyGroup.add(iris); const pup = new THREE.Mesh(new THREE.CircleGeometry(r * .22, 20), pupilMat); pup.position.set(e[0], e[1], e[2] - .25 + r * .99); bodyGroup.add(pup); });
  if (hair === 'bun' || hair === 'mbun') { const rB = hw * .26, mat = hair === 'bun' ? hairMat : bodyMat2, bun = new THREE.Mesh(new THREE.SphereGeometry(rB, 32, 20), mat); bun.scale.set(1, .85, .9); bun.position.set(0, y1 - hh2 * .3, z0 + rB * .35); bun.castShadow = true; bodyGroup.add(bun);
    const knot = new THREE.Mesh(new THREE.TorusGeometry(rB * .78, rB * .16, 12, 32), mat); knot.position.set(0, y1 - hh2 * .3, z0 + rB * .75); knot.scale.set(1, .85, 1); bodyGroup.add(knot); }
  tintBody(); bodyGroup.visible = S.bodyOn; buildOverlays(body);
}
const bodyMat2 = new THREE.MeshStandardMaterial({ color: '#cfcbc4', roughness: .45 });
/* ---------- avatar overlays: reference lines, arrangement points, joints ---------- */
const LINES = [['shoulder', 'Shoulder lines', '#c4572f'], ['cf', 'Centre front', '#2f6f8f'], ['cb', 'Centre back', '#2f6f8f'], ['neck', 'Neckline', '#7a5c99'], ['bust', 'Bust / chest', '#b08a1e'], ['waist', 'Waist', '#3d8a5a'], ['hip', 'Hip', '#a23b72'], ['side', 'Side seams', '#4a7d84'], ['armhole', 'Armholes', '#9c4f2f'], ['knee', 'Knee', '#5b6bbf']];
const overlay = { lines: new THREE.Group(), pts: new THREE.Group(), joints: new THREE.Group() }; Object.values(overlay).forEach(g => scene.add(g));
let arrPts = [];
function slicePlane(body, nx, ny, nz, d, keep, off) { // where the plane n.x = d cuts the skin: little segments, lifted off the skin
  const P = body.pos, T = body.tri, M = body.mask, out = [];
  for (let t = 0; t < T.length; t += 3) {
    const ids = [T[t], T[t + 1], T[t + 2]]; if (M && ids.some(i => !M[i])) continue;
    const dist = ids.map(i => P[3 * i] * nx + P[3 * i + 1] * ny + P[3 * i + 2] * nz - d), pts = [];
    for (let e = 0; e < 3; e++) { const a = e, b = (e + 1) % 3; if ((dist[a] > 0) !== (dist[b] > 0)) { const u = dist[a] / (dist[a] - dist[b]), A = ids[a], B = ids[b]; pts.push([P[3 * A] + (P[3 * B] - P[3 * A]) * u, P[3 * A + 1] + (P[3 * B + 1] - P[3 * A + 1]) * u, P[3 * A + 2] + (P[3 * B + 2] - P[3 * A + 2]) * u]); } }
    if (pts.length !== 2) continue; const mid = [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2, (pts[0][2] + pts[1][2]) / 2]; if (!keep(mid)) continue;
    const A = ids.map(i => [P[3 * i], P[3 * i + 1], P[3 * i + 2]]), ux = A[1][0] - A[0][0], uy = A[1][1] - A[0][1], uz = A[1][2] - A[0][2], vx = A[2][0] - A[0][0], vy = A[2][1] - A[0][1], vz = A[2][2] - A[0][2];
    let cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx; const cl = Math.hypot(cx, cy, cz) || 1; cx /= cl; cy /= cl; cz /= cl; if (cx * mid[0] + cz * mid[2] < 0 && Math.abs(cy) < .9) { cx = -cx; cy = -cy; cz = -cz; }
    pts.forEach(q => out.push(q[0] + cx * off, q[1] + cy * off, q[2] + cz * off));
  }
  return out;
}
function buildOverlays(body) {
  Object.values(overlay).forEach(g => g.clear()); arrPts = [];
  const y = body.y, J = body.J || {}, off = .25, add = (key, arr, col) => { if (!arr.length) return; const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arr), 3)); const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: col, depthTest: true })); l.userData.key = key; overlay.lines.add(l); };
  const col = k => (LINES.find(q => q[0] === k) || [0, 0, '#333'])[2], torso = q => q[1] > y.crotch - 2 && q[1] < y.hps + 2;
  const shL = J['l-shoulder'] || [15, y.shoulder, 0], shR = J['r-shoulder'] || [-15, y.shoulder, 0];
  add('cf', slicePlane(body, 1, 0, 0, 0, q => q[2] > 0 && q[1] > y.crotch && q[1] < y.hps, off), col('cf'));
  add('cb', slicePlane(body, 1, 0, 0, 0, q => q[2] < 0 && q[1] > y.crotch && q[1] < y.hps + 1, off), col('cb'));
  ['bust', 'waist', 'hip'].forEach(k => add(k, slicePlane(body, 0, 1, 0, y[k], torso, off), col(k)));
  add('neck', slicePlane(body, 0, 1, 0, y.hps - .5, q => Math.abs(q[0]) < Math.abs(shL[0]) * .55, off), col('neck'));
  if (J['l-knee']) add('knee', slicePlane(body, 0, 1, 0, J['l-knee'][1], () => true, off), col('knee'));
  const zs = (shL[2] + shR[2]) / 2; add('shoulder', slicePlane(body, 0, 0, 1, zs, q => q[1] > y.shoulder - 1 && Math.abs(q[0]) > 3 && Math.abs(q[0]) < Math.abs(shL[0]) + 2.5, off), col('shoulder'));
  add('side', slicePlane(body, 0, 0, 1, zs, q => q[1] < y.shoulder - 5 && Math.abs(q[0]) > 4, off), col('side'));
  [[shL, J['l-elbow']], [shR, J['r-elbow']]].forEach(([Sj, E]) => { if (!E) return; const d = [E[0] - Sj[0], E[1] - Sj[1], E[2] - Sj[2]], l = Math.hypot(d[0], d[1], d[2]) || 1, nrm = [d[0] / l, d[1] / l, d[2] / l], p0 = [Sj[0] + nrm[0] * 1.5, Sj[1] + nrm[1] * 1.5, Sj[2] + nrm[2] * 1.5];
    add('armhole', slicePlane({ pos: body.pos, tri: body.tri }, nrm[0], nrm[1], nrm[2], nrm[0] * p0[0] + nrm[1] * p0[1] + nrm[2] * p0[2], q => Math.hypot(q[0] - Sj[0], q[1] - Sj[1], q[2] - Sj[2]) < 14, off), col('armhole')); });
  // arrangement points round the body
  const ring = (yy, rx, rz, cz) => [[0, yy, cz + rz], [0, yy, cz - rz], [rx, yy, cz], [-rx, yy, cz], [rx * .72, yy, cz + rz * .72], [-rx * .72, yy, cz + rz * .72], [rx * .72, yy, cz - rz * .72], [-rx * .72, yy, cz - rz * .72]];
  const R0 = body.m.bust / 6.28 + 6; [[y.bust, 1], [y.waist, .9], [y.hip, 1.02]].forEach(([yy, k]) => ring(yy, R0 * k * 1.15, R0 * k, 0).forEach(p => arrPts.push(p)));
  ['l', 'r'].forEach(sd => { const A = J[sd + '-shoulder'], H = J[sd + '-hand'], Hp = J[sd + '-upper-leg'], K = J[sd + '-knee'], An = J[sd + '-ankle'];
    if (A && H) [.3, .7].forEach(t => { const p = [A[0] + (H[0] - A[0]) * t, A[1] + (H[1] - A[1]) * t, A[2] + (H[2] - A[2]) * t]; arrPts.push([p[0], p[1], p[2] + 7], [p[0], p[1], p[2] - 7]); });
    if (Hp && K && An) [[Hp, K, .5], [K, An, .5]].forEach(([a, b, t]) => { const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; arrPts.push([p[0], p[1], p[2] + 9], [p[0], p[1], p[2] - 9]); }); });
  const pg = new THREE.OctahedronGeometry(1.1), pm = new THREE.MeshBasicMaterial({ color: '#3f72c9' });
  arrPts.forEach((p, i) => { const m = new THREE.Mesh(pg, pm); m.position.set(p[0], p[1], p[2]); m.userData.ap = i; overlay.pts.add(m); });
  const jg = new THREE.SphereGeometry(1.3, 16, 12), jm = new THREE.MeshBasicMaterial({ color: '#d9a441', depthTest: false });
  Object.keys(J).forEach(k => { if (k === 'head') return; const m = new THREE.Mesh(jg, jm); m.position.set(J[k][0], J[k][1], J[k][2]); m.renderOrder = 8; m.userData.joint = k; overlay.joints.add(m); });
  showOverlays();
}
function showOverlays() { overlay.lines.visible = !!S.showLines; overlay.lines.children.forEach(l => { l.visible = !!(S.lines || {})[l.userData.key]; }); overlay.pts.visible = !!S.showPts; overlay.joints.visible = !!S.showJoints; dirty = true; }
let bodyMesh = null;
function tintBody() { const t = TONES.find(x => x[0] === S.tone) || TONES[0]; bodyU.skin.value.set(t[1]); bodyU.cloth.value.set(UNDER[t[0]]); bodyMat2.color.set(t[1]); bodyMat2.color.multiplyScalar(/^t/.test(t[0]) ? .35 : .93); bodyU.logoCol.value.set(t[0] === 'black' || t[0] === 't5' || t[0] === 't4' ? '#d8d3ca' : '#5f5a52'); bodyMat.roughness = /^t/.test(t[0]) ? .58 : .42; bodyMat.sheen = /^t/.test(t[0]) ? .35 : 0; dirty = true; }

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
  if (plain) { const M = maps(), bm = userMap('map'); if (bm) { m.map = bm; m.color.set('#ffffff'); }
    const nm = userMap('normalMap'); m.normalMap = nm; if (nm) m.normalScale.set(M.normalMap.str, M.normalMap.str);
    const rm = userMap('roughnessMap'); m.roughnessMap = rm; if (rm) m.roughness = Math.min(1, M.roughnessMap.str);
    const am = userMap('alphaMap'); if (am) { m.alphaMap = am; m.transparent = true; m.opacity = Math.min(1, M.alphaMap.str); m.depthWrite = false; m.alphaTest = 0; }
    const dm = userMap('displacementMap'); m.displacementMap = dm; m.displacementScale = dm ? M.displacementMap.str : 0; m.displacementBias = dm ? -M.displacementMap.str / 2 : 0;
  } else { m.normalMap = m.roughnessMap = m.displacementMap = null; }
  m.vertexColors = !plain || selPanel >= 0; m.needsUpdate = true;
  if (seamMat) seamMat.color.set(new THREE.Color(p.c1).multiplyScalar(.55));
  drawFabPrev(); if (typeof trimLook === 'function' && TR) trimLook(); dirty = true;
}
function drawFabPrev() { // a small swatch of the fabric in the current colourway
  const c = $('#drFabPrev'); if (!c) return; const g = c.getContext('2d'), f = fab(), p = cw(), W = c.width, k = f.tex || 'plain';
  g.fillStyle = p.c1; g.fillRect(0, 0, W, W);
  const pc = p.print !== 'solid' ? printCanvas(p) : colourCanvas(k, p.c1); if (pc) { const n = p.print !== 'solid' ? Math.max(1, 4 / p.scale) : 3; for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) g.drawImage(pc, x * W / n, y * W / n, W / n + 1, W / n + 1); }
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = .7; const b = bumpCanvas(k); for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) g.drawImage(b, x * W / 3, y * W / 3, W / 3 + 1, W / 3 + 1);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  const gr = g.createLinearGradient(0, 0, W, W); gr.addColorStop(0, 'rgba(255,255,255,' + (.08 + (+f.sheen || 0) * .35) + ')'); gr.addColorStop(.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = gr; g.fillRect(0, 0, W, W);
}
let wireMesh = null, PS = {}, pins = [], tackA = null, tackLines = [];
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
  if (wireMesh) { scene.remove(wireMesh); wireMesh.geometry.dispose(); }
  { const seen = new Set(), li = [], quad = simset().mesh === 'quad', T = d.tri, U = d.uv; for (let t = 0; t < T.length; t += 3) for (let e = 0; e < 3; e++) { const a = T[t + e], b = T[t + (e + 1) % 3], k = a < b ? a * 1e6 + b : b * 1e6 + a; if (seen.has(k)) continue; seen.add(k); if (quad && Math.abs(U[2 * a] - U[2 * b]) > .25 && Math.abs(U[2 * a + 1] - U[2 * b + 1]) > .25) continue; li.push(a, b); }
    const wg = new THREE.BufferGeometry(); wg.setAttribute('position', posAttr); wg.setIndex(li); wireMesh = new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: '#1f2a44', transparent: true, opacity: .45 })); wireMesh.visible = !!S.wire; wireMesh.frustumCulled = false; scene.add(wireMesh); }
  lastGap = lastStrain = null; applyMaterial(); buildTrims(d); drawMarks(); buildGraphics(); renderGraphics();
}
/* ---------- graphics on the cloth: a decal mesh sharing the garment's moving points ---------- */
const SURF = { print: 'Print (matte)', rubber: 'Rubber / puff print', foil: 'Foil', emb: 'Embroidery', flock: 'Flock', patch: 'Woven patch' };
const gGroup = new THREE.Group(); scene.add(gGroup); let gSel = -1, gPlace = false;
function gList() { return S.graphics || (S.graphics = []); }
function gTexture(g) { if (g.kind === 'text') { const c = document.createElement('canvas'), x = c.getContext('2d'), fs = 160; x.font = `${g.bold ? 700 : 500} ${fs}px ${g.font || 'DM Sans'}, sans-serif`; const w = Math.max(10, x.measureText(g.text || 'Text').width); c.width = Math.ceil(w + 60); c.height = fs + 60; x.font = `${g.bold ? 700 : 500} ${fs}px ${g.font || 'DM Sans'}, sans-serif`; x.fillStyle = '#fff'; x.textBaseline = 'middle'; x.textAlign = 'center'; x.fillText(g.text || 'Text', c.width / 2, c.height / 2 + 6); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData = { aspect: c.height / c.width }; return t; }
  const t = new THREE.TextureLoader().load(g.src, tx => { tx.userData = { aspect: tx.image.height / tx.image.width }; buildGraphics(); }); t.colorSpace = THREE.SRGBColorSpace; return t; }
const gTex = {};
function buildGraphics() {
  gGroup.children.forEach(m => { m.geometry.dispose(); m.material.dispose(); }); gGroup.clear(); if (!lastMesh || !posAttr) return;
  const d = lastMesh;
  gList().forEach((g, gi) => {
    if (g.panel == null || g.panel >= d.panels.length || d.panels[g.panel].name !== g.pname) return;
    const key = g.kind === 'text' ? 'T' + gi + (g.text || '') + (g.font || '') + (g.bold ? 1 : 0) : g.src; if (!gTex[gi] || gTex[gi].key !== key) { if (gTex[gi]) gTex[gi].t.dispose(); gTex[gi] = { key, t: gTexture(g) }; }
    const t = gTex[gi].t, asp = (t.userData && t.userData.aspect) || 1, w = g.w, h = w * asp, a = -g.rot * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), n = d.uv.length / 2;
    const uv = new Float32Array(n * 2), idx = []; for (let i = 0; i < n; i++) { if (d.panel[i] !== g.panel) continue; const du = d.uv[2 * i] - g.u, dv = d.uv[2 * i + 1] - g.v, x = (du * ca - dv * sa) / w + .5, y = 1 - ((du * sa + dv * ca) / h + .5); uv[2 * i] = x; uv[2 * i + 1] = y; }
    for (let k = 0; k < d.tri.length; k += 3) { const A = d.tri[k], B = d.tri[k + 1], C = d.tri[k + 2]; if (d.panel[A] !== g.panel) continue; const xs = [uv[2 * A], uv[2 * B], uv[2 * C]], ys = [uv[2 * A + 1], uv[2 * B + 1], uv[2 * C + 1]]; if (Math.max(...xs) < 0 || Math.min(...xs) > 1 || Math.max(...ys) < 0 || Math.min(...ys) > 1) continue; idx.push(A, B, C); }
    if (!idx.length) return;
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', posAttr); geo.setAttribute('normal', garMesh.geometry.attributes.normal); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx);
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    const sf = g.surf || 'print', mat = new THREE.MeshPhysicalMaterial({ map: t, color: g.col || '#ffffff', transparent: true, opacity: g.op == null ? 1 : g.op, alphaTest: .04, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
      roughness: { print: .85, rubber: .45, foil: .22, emb: .9, flock: 1, patch: .8 }[sf], metalness: sf === 'foil' ? .95 : 0, sheen: sf === 'flock' ? 1 : sf === 'emb' ? .4 : 0, sheenColor: new THREE.Color(g.col || '#fff'), clearcoat: sf === 'rubber' ? .5 : 0 });
    if (sf === 'rubber' || sf === 'emb' || sf === 'patch') { mat.bumpMap = sf === 'emb' ? bumpTex('satin') : t; mat.bumpScale = sf === 'rubber' ? 3 : 1.2; }
    const ms = new THREE.Mesh(geo, mat); ms.frustumCulled = false; ms.renderOrder = 2; ms.castShadow = false; gGroup.add(ms);
  });
  dirty = true;
}
function renderGraphics() {
  const L2 = gList(), names = lastMesh ? lastMesh.panels.map((p, i) => [i, p.name]) : [];
  $('#drGList').innerHTML = L2.map((g, i) => `<button type="button" class="dr-cwc" aria-pressed="${i === gSel}" data-gi="${i}"><i style="background:${g.kind === 'text' ? g.col : '#ddd'} ${g.kind === 'image' ? `url(${g.src}) center/cover` : ''}"></i><span>${esc(g.kind === 'text' ? '“' + (g.text || '') + '”' : g.name || 'Image')}</span></button>`).join('') || '<p class="dr-note">No graphics yet.</p>';
  const g = L2[gSel]; if (!g) { $('#drGEdit').innerHTML = ''; return; }
  const sl = (k, l, lo, hi, st, v, u) => `<label>${l} <output>${u === 'cm' ? L(v) : v + (u || '')}</output><input type="range" data-gk="${k}" min="${lo}" max="${hi}" step="${st}" value="${v}"></label>`;
  $('#drGEdit').innerHTML = (g.kind === 'text' ? `<label>Text<input data-gk="text" value="${esc(g.text || '')}" maxlength="40"></label><label>Font<select data-gk="font">${['DM Sans', 'Georgia', 'Courier New', 'Impact', 'Brush Script MT', 'Arial'].map(f => opt(f, f, g.font || 'DM Sans')).join('')}</select></label><label class="dr-chk"><input type="checkbox" data-gk="bold"${g.bold ? ' checked' : ''}> Bold</label>` : '') +
    `<label>Piece<select data-gk="panel">${names.map(n => opt(n[0], (n[1].replace(/^F$/, 'Front').replace(/^FR$/, 'Front (right)').replace(/^FL$/, 'Front (left)').replace(/^B$/, 'Back').replace(/^SR$/, 'Sleeve (left)').replace(/^SL$/, 'Sleeve (right)')), g.panel)).join('')}</select></label>` +
    `<button type="button" class="dr-link" id="drGPlace">${gPlace ? 'Click the cloth to place it…' : 'Place by clicking the cloth'}</button>` +
    sl('w', 'Size (width)', 1, 60, .5, g.w, 'cm') + sl('rot', 'Rotation', -180, 180, 1, g.rot, '°') + sl('op', 'Opacity', .1, 1, .05, g.op == null ? 1 : g.op) +
    `<label class="dr-cc">Colour <input type="color" data-gk="col" value="${g.col || '#ffffff'}"></label><label>Surface<select data-gk="surf">${Object.keys(SURF).map(k => opt(k, SURF[k], g.surf || 'print')).join('')}</select></label>` +
    `<div class="dr-row"><button type="button" class="dr-link" id="drGDup">Duplicate</button><button type="button" class="dr-link" id="drGDel">Delete</button></div>`;
}
function newG(o) { const L2 = gList(), pi = lastMesh ? Math.max(0, lastMesh.panels.findIndex(p => /^(F|FR|FL)$/.test(p.name))) : 0, P = lastMesh ? lastMesh.panels[pi] : null; let cu = 0, cv = 20;
  if (P) { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; P.segs.forEach(sg => sg.pts.forEach(q => { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); })); cu = P.name === 'FR' ? Math.max(4, (x0 + x1) / 2) : P.name === 'FL' ? Math.min(-4, (x0 + x1) / 2) : 0; cv = y0 + (y1 - y0) * .3; }
  L2.push(Object.assign({ panel: pi, pname: P ? P.name : 'F', u: cu, v: cv, w: 12, rot: 0, op: 1, col: '#ffffff', surf: 'print' }, o)); gSel = L2.length - 1; try { save(); } catch (e) { status('That image is too large to keep in this browser', 'err'); } renderGraphics(); buildGraphics(); }
$('#drGAdd').addEventListener('click', () => $('#drGFile').click());
$('#drGFile').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; readImg(f, 1024, true).then(src => newG({ kind: 'image', src, name: f.name.replace(/\.[^.]+$/, '').slice(0, 30) })).catch(() => status('Could not read that image', 'err')); });
$('#drGText').addEventListener('click', () => newG({ kind: 'text', text: 'FORECUT', font: 'DM Sans', bold: true, col: '#1f2a44', w: 14 }));
$('#drGList').addEventListener('click', e => { const b = e.target.closest('[data-gi]'); if (!b) return; gSel = +b.dataset.gi; renderGraphics(); });
$('#drGEdit').addEventListener('input', e => { const k = e.target.dataset.gk, g = gList()[gSel]; if (!k || !g) return; let v = e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'range' || k === 'panel' ? +e.target.value : e.target.value;
  if (k === 'panel') { g.pname = lastMesh.panels[v].name; } g[k] = v; const o = e.target.parentNode.querySelector('output'); if (o) o.textContent = k === 'w' ? L(v) : k === 'rot' ? v + '°' : v; save(); buildGraphics(); if (k === 'text') renderGraphics(); });
$('#drGEdit').addEventListener('click', e => { const g = gList()[gSel]; if (!g) return; if (e.target.id === 'drGPlace') { gPlace = !gPlace; renderGraphics(); status(gPlace ? 'Click the cloth where the graphic should go' : '', gPlace ? 'run' : ''); }
  if (e.target.id === 'drGDel') { gList().splice(gSel, 1); delete gTex[gSel]; gSel = -1; save(); renderGraphics(); buildGraphics(); }
  if (e.target.id === 'drGDup') { const c = JSON.parse(JSON.stringify(g)); c.u += 3; c.v += 3; gList().push(c); gSel = gList().length - 1; save(); renderGraphics(); buildGraphics(); } });
/* ---------- trims: buttons, buttonholes, zip teeth and topstitching, riding on the cloth ---------- */
const trimGroup = new THREE.Group(); scene.add(trimGroup);
let TR = null; // { btn:[{loc, hole, closed}], holes, teeth:[loc...], tops:[[locA, locB]...] }
function panelTris(d, pi) { const out = []; for (let t = 0; t < d.tri.length; t += 3) if (d.panel[d.tri[t]] === pi) out.push(t); return out; }
function locate(d, tris, u, v) { // barycentric spot on the flat pattern, so it follows the cloth exactly
  let best = null, bd = 1e9;
  for (const t of tris) {
    const a = d.tri[t], b = d.tri[t + 1], c = d.tri[t + 2], ax = d.uv[2 * a], ay = d.uv[2 * a + 1], bx = d.uv[2 * b], by = d.uv[2 * b + 1], cx = d.uv[2 * c], cy = d.uv[2 * c + 1];
    const den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy); if (Math.abs(den) < 1e-9) continue;
    let l1 = ((by - cy) * (u - cx) + (cx - bx) * (v - cy)) / den, l2 = ((cy - ay) * (u - cx) + (ax - cx) * (v - cy)) / den, l3 = 1 - l1 - l2;
    const out = Math.max(0, -l1) + Math.max(0, -l2) + Math.max(0, -l3);
    if (out < bd) { bd = out; l1 = Math.max(0, l1); l2 = Math.max(0, l2); l3 = Math.max(0, l3); const sm = l1 + l2 + l3; best = [a, b, c, l1 / sm, l2 / sm, l3 / sm]; if (out === 0) break; }
  }
  return best;
}
const _p = new THREE.Vector3(), _n = new THREE.Vector3(), _up = new THREE.Vector3(), _t = new THREE.Vector3(), _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(1, 1, 1);
function at(L, off) { const x = posAttr.array, nr = garMesh.geometry.attributes.normal.array; _p.set(0, 0, 0); _n.set(0, 0, 0);
  for (let k = 0; k < 3; k++) { const i = L[k], w = L[3 + k]; _p.x += x[3 * i] * w; _p.y += x[3 * i + 1] * w; _p.z += x[3 * i + 2] * w; _n.x += nr[3 * i] * w; _n.y += nr[3 * i + 1] * w; _n.z += nr[3 * i + 2] * w; }
  _n.normalize(); _p.addScaledVector(_n, off || 0); return _p; }
function frameAt(L, off, vertical) { // a matrix sitting on the cloth: y along the surface normal, x across (vertical holes: x up the body)
  at(L, off); _up.set(0, 1, 0).addScaledVector(_n, -_n.y).normalize(); if (!vertical) _up.cross(_n).normalize();
  _t.crossVectors(_up, _n).normalize(); _m.makeBasis(_up, _n, _t); _m.setPosition(_p); return _m; }
const btnGeo = (() => { const pts = [[0, .16], [.38, .2], [.52, .26], [.62, .16], [.64, 0], [.56, -.06], [0, -.06]].map(q => new THREE.Vector2(q[0], q[1])); return new THREE.LatheGeometry(pts, 24); })();
const holeGeo = new THREE.BoxGeometry(1.7, .06, .28), toothGeo = new THREE.BoxGeometry(.62, .22, .3), pullGeo = new THREE.BoxGeometry(.9, .25, 2.4);
const btnMat = new THREE.MeshPhysicalMaterial({ color: '#4a3426', roughness: .45, clearcoat: .6, clearcoatRoughness: .3 }), holeMat = new THREE.MeshStandardMaterial({ color: '#1b1b1b', roughness: .9 });
const zipMat = new THREE.MeshStandardMaterial({ color: '#b9b9b9', metalness: .85, roughness: .32 }), topMat = new THREE.LineBasicMaterial({ color: '#333' });
function buildTrims(d) {
  trimGroup.clear(); TR = null; const st = style();
  if (!d.buttons && !(S.tUser || {}).lines) return;
  const triCache = {}, tris = pi => triCache[pi] || (triCache[pi] = panelTris(d, pi));
  TR = { btn: [], teeth: [], tops: [], vertical: st.gid === 'shirt' || st.gid === 'shirtdress' || st.gid === 'blouse' || st.gid === 'polo' };
  (d.buttons || []).forEach(b => { TR.btn.push({ on: locate(d, tris(b.closed ? b.over : b.under), b.c[0], b.c[1]), hole: b.over !== b.under ? locate(d, tris(b.over), b.c[0], b.c[1]) : null, small: b.small, closed: b.closed }); });
  if (TR.btn.length) {
    TR.bMesh = new THREE.InstancedMesh(btnGeo, btnMat, TR.btn.length); TR.bMesh.castShadow = true; trimGroup.add(TR.bMesh);
    TR.hMesh = new THREE.InstancedMesh(holeGeo, holeMat, TR.btn.length); trimGroup.add(TR.hMesh);
  }
  const P = d.panels;
  function edgePts(pi, key) { const sg = P[pi] && P[pi].segs.find(q => q.key === key); return sg ? sg.pts : null; }
  function resampleE(pts, step) { const out = [pts[0]]; let acc = 0; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]); let t = step - acc; while (t <= L) { out.push([a[0] + (b[0] - a[0]) * t / L, a[1] + (b[1] - a[1]) * t / L]); t += step; } acc = (acc + L) % step; } return out; }
  if (d.zip) [[d.zip.p, d.zip.key, 1], [d.zip.q, d.zip.qkey, d.zip.closed ? 0 : 1]].forEach(z => { if (!z[2]) return; const e = edgePts(z[0], z[1]); if (!e) return; resampleE(e, .62).forEach(q => TR.teeth.push(locate(d, tris(z[0]), q[0], q[1]))); });
  if (TR.teeth.length) { TR.zMesh = new THREE.InstancedMesh(toothGeo, zipMat, TR.teeth.length); trimGroup.add(TR.zMesh); const e = edgePts(d.zip.p, d.zip.key); const top = e[0][1] < e[e.length - 1][1] ? e[0] : e[e.length - 1]; TR.pull = locate(d, tris(d.zip.p), top[0], top[1] + 1.2); TR.pMesh = new THREE.Mesh(pullGeo, zipMat); trimGroup.add(TR.pMesh); }
  TR.d = d; TR.tris = tris; TR.edgePts = edgePts; TR.resampleE = resampleE; buildStitches(); buildUserTrims(); buildBinds();
  trimLook(); updateTrims();
}
const markGroup = new THREE.Group(); scene.add(markGroup); markGroup.renderOrder = 9;
const pinMat = new THREE.MeshBasicMaterial({ color: '#c4572f', depthTest: false }), pinGeo = new THREE.SphereGeometry(.8, 14, 10), tackMat = new THREE.MeshBasicMaterial({ color: '#2f6f8f', depthTest: false });
function drawMarks() { markGroup.clear(); pins.forEach(i => { const m = new THREE.Mesh(pinGeo, pinMat); m.userData.i = i; m.renderOrder = 9; markGroup.add(m); }); tackLines.forEach(t => t.forEach(i => { const m = new THREE.Mesh(pinGeo, tackMat); m.scale.setScalar(.7); m.userData.i = i; m.renderOrder = 9; markGroup.add(m); })); if (tackA != null) { const m = new THREE.Mesh(pinGeo, tackMat); m.userData.i = tackA; markGroup.add(m); } updateMarks(); }
function updateMarks() { if (!posAttr) return; const a = posAttr.array; markGroup.children.forEach(m => { const i = m.userData.i; m.position.set(a[3 * i], a[3 * i + 1], a[3 * i + 2]); }); dirty = true; }
function updateTrims() { updateMarks();
  if (!TR || !garMesh || !garMesh.geometry.attributes.normal) return;
  TR.btn.forEach((b, i) => { if (b.on) { frameAt(b.on, .12, TR.vertical); const bs = (trims().bsize || 12) / 12 * (b.small ? .8 : 1) * (b.size ? b.size / 12 : 1); _m.scale(_s.set(bs, bs, bs)); TR.bMesh.setMatrixAt(i, _m); } if (b.hole && !b.closed) { frameAt(b.hole, .05, b.vert != null ? b.vert : TR.vertical); const hs = (trims().bsize || 12) / 12; _m.scale(_s.set(hs, 1, 1)); TR.hMesh.setMatrixAt(i, _m); } else { _m.makeScale(0, 0, 0); TR.hMesh.setMatrixAt(i, _m); } });
  if (TR.bMesh) { TR.bMesh.instanceMatrix.needsUpdate = true; TR.hMesh.instanceMatrix.needsUpdate = true; TR.bMesh.computeBoundingSphere(); TR.hMesh.computeBoundingSphere(); }
  if (TR.zMesh) { TR.teeth.forEach((L, i) => { frameAt(L, .12, false); TR.zMesh.setMatrixAt(i, _m); }); TR.zMesh.instanceMatrix.needsUpdate = true; TR.zMesh.computeBoundingSphere(); if (TR.pull) { frameAt(TR.pull, .35, false); TR.pMesh.matrixAutoUpdate = false; TR.pMesh.matrix.copy(_m); } }
  updateStitches(); updateBinds();
  if (TR.tMesh) { const a = TR.tMesh.geometry.attributes.position.array; TR.tops.forEach((pr, i) => { at(pr[0], .07); a[6 * i] = _p.x; a[6 * i + 1] = _p.y; a[6 * i + 2] = _p.z; at(pr[1], .07); a[6 * i + 3] = _p.x; a[6 * i + 4] = _p.y; a[6 * i + 5] = _p.z; }); TR.tMesh.geometry.attributes.position.needsUpdate = true; TR.tMesh.geometry.computeBoundingSphere(); }
}
function trimLook() {
  const T = trims(), b = BTN[T.btn] || BTN.horn, p = cw();
  btnMat.color.set(T.btn === 'self' ? p.c1 : b[1]); btnMat.roughness = b[2]; btnMat.metalness = T.btn === 'metal' ? .8 : 0; btnMat.clearcoat = T.btn === 'self' || T.btn === 'wood' ? 0 : .6; btnMat.needsUpdate = true;
  zipMat.color.set({ metal: '#bdbdbd', plastic: mixHex(p.c1, '#000000', .25), brass: '#9c7a3c' }[T.zip] || '#bdbdbd'); zipMat.metalness = T.zip === 'plastic' ? 0 : .85; zipMat.roughness = T.zip === 'plastic' ? .5 : .32; zipMat.needsUpdate = true;
  if (TR) buildStitches();
  dirty = true;
}
/* ---------- trims workshop: topstitching, buttons, buttonholes, zips, binding, piping ---------- */
const ST_T = { single: 'Single', double: 'Double needle', triple: 'Triple needle', zigzag: 'Zigzag', chain: 'Chain stitch', cover: 'Cover stitch' };
const TH_T = { matte: 'Matte cotton', shiny: 'Shiny polyester', metal: 'Metallic' };
function tUser() { const t = S.tUser || (S.tUser = {}); ['lines', 'btns', 'holes', 'zips', 'binds'].forEach(k => { t[k] = t[k] || []; }); return t; }
function topDef() { const T = trims(); return Object.assign({ type: 'single', len: 3, dist: 6, gap: 6, th: .35, col: '', tex: 'matte' }, T.topDef || {}); }
const stitchGeo = new THREE.CylinderGeometry(.5, .5, 1, 6, 1), stitchMats = { matte: new THREE.MeshStandardMaterial({ roughness: .85 }), shiny: new THREE.MeshPhysicalMaterial({ roughness: .3, clearcoat: .6 }), metal: new THREE.MeshStandardMaterial({ roughness: .25, metalness: .9 }) };
function lineSpecs() { // every topstitch line: the garment's own (when topstitching is on) plus the ones added here
  const d = TR && TR.d; if (!d) return []; const out = [], def = topDef(), p = cw();
  if (trims().top) (d.tops || []).forEach(([pi, key]) => out.push(Object.assign({}, def, { pi, key, auto: 1 })));
  tUser().lines.forEach(l => { if (d.panels[l.pi] && d.panels[l.pi].name === l.pname) out.push(l); });
  out.forEach(l => { l.colour = l.col || (trims().thread === 'contrast' ? p.c2 : mixHex(p.c1, '#000000', .35)); }); return out;
}
function buildStitches() {
  if (!TR || !TR.d) return; (TR.stMeshes || []).forEach(m => { trimGroup.remove(m); m.dispose && m.dispose(); }); TR.stMeshes = []; TR.st = { matte: [], shiny: [], metal: [] };
  const d = TR.d;
  lineSpecs().forEach(l => {
    const e = TR.edgePts(l.pi, l.key); if (!e) return; const outline = []; d.panels[l.pi].segs.forEach((sg, i) => sg.pts.forEach((q, j) => { if (i && !j) return; outline.push(q); }));
    const ins = (x, y) => { let c = false; for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) { const a = outline[i], b = outline[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
    const len = Math.max(.1, l.len / 10), rows = { single: [0], double: [0, 1], triple: [0, 1, 2], zigzag: [0], chain: [0], cover: [0, 1] }[l.type] || [0], pts = TR.resampleE(e, len), list = TR.st[l.tex] || TR.st.matte, colr = new THREE.Color(l.colour);
    rows.forEach(r => { for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L0 = Math.hypot(dx, dy) || 1, nx = -dy / L0, ny = dx / L0, dd = (l.dist + r * l.gap) / 10, sg = ins((a[0] + b[0]) / 2 + nx * dd, (a[1] + b[1]) / 2 + ny * dd) ? 1 : -1;
      let A = [a[0] + nx * dd * sg, a[1] + ny * dd * sg], B = [a[0] + dx * (l.type === 'chain' ? .92 : .72) + nx * dd * sg, a[1] + dy * (l.type === 'chain' ? .92 : .72) + ny * dd * sg];
      if (l.type === 'zigzag') { const z = (l.gap / 20) * (i % 2 ? 1 : -1); A = [A[0] - nx * z * sg, A[1] - ny * z * sg]; B = [a[0] + dx + nx * (dd + z) * sg, a[1] + dy + ny * (dd + z) * sg]; }
      if (!ins(A[0], A[1]) || !ins(B[0], B[1])) continue;
      list.push({ A: locate(d, TR.tris(l.pi), A[0], A[1]), B: locate(d, TR.tris(l.pi), B[0], B[1]), th: (l.th || .35) / 10 * (l.type === 'chain' ? 1.4 : 1), c: colr });
    } });
  });
  Object.keys(TR.st).forEach(k => { const L2 = TR.st[k]; if (!L2.length) return; const m = new THREE.InstancedMesh(stitchGeo, stitchMats[k], L2.length); L2.forEach((q, i) => m.setColorAt(i, q.c)); m.frustumCulled = false; m.userData.k = k; trimGroup.add(m); TR.stMeshes.push(m); });
  updateStitches(); dirty = true;
}
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _y = new THREE.Vector3(0, 1, 0);
function updateStitches() {
  if (!TR || !TR.stMeshes || !posAttr) return;
  TR.stMeshes.forEach(m => { const L2 = TR.st[m.userData.k]; L2.forEach((q, i) => { if (!q.A || !q.B) return; _a.copy(at(q.A, .05 + q.th / 2)); _b.copy(at(q.B, .05 + q.th / 2)); const dir = _b.clone().sub(_a), ln = dir.length() || .01; _q.setFromUnitVectors(_y, dir.multiplyScalar(1 / ln)); _m.compose(_a.add(_b).multiplyScalar(.5), _q, _s.set(q.th, ln, q.th)); m.setMatrixAt(i, _m); }); m.instanceMatrix.needsUpdate = true; });
}
function nearestVert(pi, u, v) { const d = lastMesh; let bi = -1, bd = 1e9; for (let i = 0; i < d.panel.length; i++) { if (d.panel[i] !== pi) continue; const q = Math.hypot(d.uv[2 * i] - u, d.uv[2 * i + 1] - v); if (q < bd) { bd = q; bi = i; } } return bi; }
function buildUserTrims() { // buttons and buttonholes placed by hand
  const d = TR.d, U = tUser(); if (!U.btns.length && !U.holes.length) return;
  const ok = x => d.panels[x.pi] && d.panels[x.pi].name === x.pname;
  U.btns.filter(ok).forEach(b => { const h = b.hole != null && U.holes[b.hole] && ok(U.holes[b.hole]) ? U.holes[b.hole] : null; TR.btn.push({ on: h ? locate(d, TR.tris(h.pi), h.u, h.v) : locate(d, TR.tris(b.pi), b.u, b.v), hole: null, size: b.size || 12, closed: !!h }); });
  U.holes.filter(ok).forEach(h => { const used = U.btns.some(b => b.hole === U.holes.indexOf(h)); TR.btn.push({ on: null, hole: locate(d, TR.tris(h.pi), h.u, h.v), closed: used, vert: h.dir === 'v' }); });
  if (TR.bMesh) { trimGroup.remove(TR.bMesh); trimGroup.remove(TR.hMesh); }
  TR.bMesh = new THREE.InstancedMesh(btnGeo, btnMat, TR.btn.length); TR.bMesh.castShadow = true; trimGroup.add(TR.bMesh); TR.hMesh = new THREE.InstancedMesh(holeGeo, holeMat, TR.btn.length); trimGroup.add(TR.hMesh);
  TR.btn.forEach((b, i) => { if (!b.on) { _m.makeScale(0, 0, 0); TR.bMesh.setMatrixAt(i, _m); } });
}
const ZIPS = { metal: ['Metal teeth', '#bdbdbd', .85], coil: ['Nylon coil', '#2a2a2a', 0], plastic: ['Moulded plastic', '', 0], brass: ['Antique brass', '#9c7a3c', .85] };
function buildZipsUser() { // teeth along each user zip, both edges
  const d = TR.d; TR.uz = []; tUser().zips.forEach(z => { if (!d.panels[z.a[0]] || d.panels[z.a[0]].name !== z.an || !d.panels[z.b[0]] || d.panels[z.b[0]].name !== z.bn) return; const L2 = [];
    [z.a, z.b].forEach(ed => { const e = TR.edgePts(ed[0], ed[1]); if (e) TR.resampleE(e, .55).forEach(q => L2.push(locate(d, TR.tris(ed[0]), q[0], q[1]))); });
    const m = new THREE.InstancedMesh(toothGeo, new THREE.MeshStandardMaterial({ color: z.teeth === 'plastic' ? z.tape : ZIPS[z.teeth][1], metalness: ZIPS[z.teeth][2], roughness: .35 }), L2.length); m.frustumCulled = false; trimGroup.add(m); TR.uz.push({ m, L: L2 }); });
}
/* binding and piping: tubes that follow an edge as the cloth moves */
function buildBinds() {
  (TR.bd || []).forEach(o => { trimGroup.remove(o.mesh); o.mesh.geometry.dispose(); }); TR.bd = []; buildZipsUser(); const d = TR.d;
  tUser().binds.forEach(bd => {
    if (!d.panels[bd.pi] || d.panels[bd.pi].name !== bd.pname) return; const e = TR.edgePts(bd.pi, bd.key); if (!e) return;
    const outline = []; d.panels[bd.pi].segs.forEach((sg, i) => sg.pts.forEach((q, j) => { if (i && !j) return; outline.push(q); }));
    const ins = (x, y) => { let c = false; for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) { const a = outline[i], b = outline[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
    const pts = TR.resampleE(e, .5), smp = []; for (let i = 0; i < pts.length; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L0 = Math.hypot(dx, dy) || 1; let nx = -dy / L0, ny = dx / L0; if (!ins(pts[i][0] + nx * .4, pts[i][1] + ny * .4)) { nx = -nx; ny = -ny; }
      const pe = [pts[i][0] + nx * .05, pts[i][1] + ny * .05]; smp.push({ e: locate(d, TR.tris(bd.pi), pe[0], pe[1]), i: locate(d, TR.tris(bd.pi), pts[i][0] + nx * .8, pts[i][1] + ny * .8) }); }
    const M2 = 12, N = smp.length, pos = new Float32Array(N * M2 * 3), idx = []; for (let i = 0; i + 1 < N; i++) for (let k = 0; k < M2; k++) { const a = i * M2 + k, b = i * M2 + (k + 1) % M2, c = a + M2, dd = b + M2; idx.push(a, c, b, b, c, dd); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
    const tk = bd.tex || 'plain', mat = new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide, color: bd.col || cw().c2, roughness: tk === 'satin' ? .3 : tk === 'leather' ? .5 : .85, bumpMap: bumpTex(tk), bumpScale: .4, sheen: tk === 'velvet' ? 1 : 0, sheenColor: new THREE.Color(bd.col || '#fff'), clearcoat: tk === 'leather' ? .3 : 0 });
    const mesh = new THREE.Mesh(g, mat); mesh.castShadow = true; mesh.frustumCulled = false; trimGroup.add(mesh); TR.bd.push({ mesh, smp, bd, M2 });
  });
  updateBinds();
}
const _e = new THREE.Vector3(), _in = new THREE.Vector3(), _nn = new THREE.Vector3();
function updateBinds() {
  if (!TR || !posAttr) return;
  (TR.uz || []).forEach(z => { z.L.forEach((Lc, i) => { frameAt(Lc, .12, false); z.m.setMatrixAt(i, _m); }); z.m.instanceMatrix.needsUpdate = true; });
  (TR.bd || []).forEach(o => { const P = o.mesh.geometry.attributes.position.array, bd = o.bd, w = (bd.w || 12) / 10, th = (bd.th || 1.2) / 10, pip = bd.kind === 'piping', M2 = o.M2;
    o.smp.forEach((sp, i) => { if (!sp.e || !sp.i) return; _e.copy(at(sp.e, 0)); _nn.copy(_n); _in.copy(at(sp.i, 0)).sub(_e).normalize(); const c = _e.clone();
      if (pip) c.addScaledVector(_in, -(w / 2) + (bd.off || 0) / 10); else c.addScaledVector(_in, w / 2 - th);
      for (let k = 0; k < M2; k++) { const t = k / M2 * Math.PI * 2, ca = Math.cos(t), sa = Math.sin(t), ra = pip ? w / 2 : w / 2, rb = pip ? w / 2 : th + .12, q = 3 * (i * M2 + k); P[q] = c.x + _in.x * ca * ra + _nn.x * sa * rb; P[q + 1] = c.y + _in.y * ca * ra + _nn.y * sa * rb; P[q + 2] = c.z + _in.z * ca * ra + _nn.z * sa * rb; } });
    o.mesh.geometry.attributes.position.needsUpdate = true; o.mesh.geometry.computeVertexNormals(); });
}
/* the Trims tab */
let pickEdge = null, tSel = null, trimClick = null;
function edgeName(pi, key) { const n = lastMesh && lastMesh.panels[pi] ? lastMesh.panels[pi].name : ''; const P = { F: 'Front', FR: 'Right front', FL: 'Left front', B: 'Back', SR: 'Left sleeve', SL: 'Right sleeve', BAND: 'Band', COL: 'Collar', KC: 'Collar', HB: 'Hem band', PK: 'Pocket' }[n] || n; const E = key.replace(/\.(R|L)$/, ' ($1)').replace(/^cf/, 'front edge').replace(/^hem\d*/, 'hem').replace(/^neck/, 'neckline').replace(/^arm/, 'armhole').replace(/^side/, 'side seam').replace(/^sh/, 'shoulder').replace(/^top/, 'top edge').replace(/^out/, 'outer edge'); return P + ' · ' + E; }
function renderTrimPane() {
  const el = $('#drTrimPane'); if (!el) return; const U = tUser(), def = topDef(), T = trims(), sel = tSel;
  const sl = (g, k, l, lo, hi, st, v, u) => `<label>${l} <output>${v}${u}</output><input type="range" data-tg="${g}" data-tk="${k}" min="${lo}" max="${hi}" step="${st}" value="${v}"></label>`;
  const stEd = (g, l) => `<label>Stitch<select data-tg="${g}" data-tk="type">${Object.keys(ST_T).map(k => opt(k, ST_T[k], l.type)).join('')}</select></label>` + sl(g, 'len', 'Stitch length', 1, 8, .5, l.len, ' mm') + sl(g, 'dist', 'Distance from edge', 1, 30, .5, l.dist, ' mm') + sl(g, 'gap', 'Gap between rows', 2, 12, .5, l.gap, ' mm') + sl(g, 'th', 'Thread thickness', .15, 1.2, .05, l.th, ' mm') + `<label class="dr-cc">Thread colour <input type="color" data-tg="${g}" data-tk="col" value="${l.col || '#333333'}"></label><label>Thread<select data-tg="${g}" data-tk="tex">${Object.keys(TH_T).map(k => opt(k, TH_T[k], l.tex)).join('')}</select></label>`;
  let h = `<h3>Topstitching</h3><label class="dr-chk"><input type="checkbox" data-tg="auto" data-tk="on"${T.top ? ' checked' : ''}> Garment topstitching (front edges, hems, collars)</label>` + (T.top ? `<details${sel === 'def' ? ' open' : ''}><summary>Edit the garment topstitching</summary>${stEd('def', def)}</details>` : '') +
    `<div class="dr-row"><button type="button" data-ta="addline"${pickEdge === 'line' ? ' aria-pressed="true"' : ''}>${pickEdge === 'line' ? 'Click an edge in Pattern pieces…' : 'Add topstitch to an edge'}</button></div>` +
    U.lines.map((l, i) => `<div class="dr-ti${sel === 'line' + i ? ' on' : ''}"><button type="button" class="dr-link" data-ta="selline" data-i="${i}">${esc(edgeName(l.pi, l.key))} · ${ST_T[l.type]}</button><button type="button" class="dr-x" data-ta="delline" data-i="${i}" aria-label="Remove">×</button>${sel === 'line' + i ? stEd('line' + i, l) : ''}</div>`).join('');
  h += `<h3>Buttons and buttonholes</h3>` + sl('btn', 'bsize', 'Button size', 8, 30, 1, T.bsize || 12, ' mm') + `<label>Style<select data-tg="btn" data-tk="btn">${Object.keys(BTN).map(k => opt(k, BTN[k][0], T.btn)).join('')}</select></label>` +
    `<div class="dr-row"><button type="button" data-ta="addbtn"${trimClick === 'btn' ? ' aria-pressed="true"' : ''}>${trimClick === 'btn' ? 'Click the cloth…' : 'Place a button'}</button><button type="button" data-ta="addhole"${trimClick === 'hole' ? ' aria-pressed="true"' : ''}>${trimClick === 'hole' ? 'Click the cloth…' : 'Place a buttonhole'}</button></div>` +
    U.btns.map((b, i) => `<div class="dr-ti"><span>Button ${i + 1}${b.hole != null ? ' · fastened' : ''}</span><button type="button" class="dr-link" data-ta="${b.hole != null ? 'unfasten' : 'fasten'}" data-i="${i}">${b.hole != null ? 'Unfasten' : 'Fasten to nearest buttonhole'}</button><button type="button" class="dr-x" data-ta="delbtn" data-i="${i}">×</button></div>`).join('') +
    U.holes.map((o, i) => `<div class="dr-ti"><span>Buttonhole ${i + 1}</span><button type="button" class="dr-link" data-ta="holedir" data-i="${i}">${o.dir === 'v' ? 'Vertical' : 'Horizontal'}</button><button type="button" class="dr-x" data-ta="delhole" data-i="${i}">×</button></div>`).join('');
  h += `<h3>Zippers</h3><div class="dr-row"><button type="button" data-ta="addzip"${pickEdge === 'zipA' || pickEdge === 'zipB' ? ' aria-pressed="true"' : ''}>${pickEdge === 'zipA' ? 'Click the first edge…' : pickEdge === 'zipB' ? 'Click the second edge…' : 'Add a zipper between two edges'}</button></div>` +
    U.zips.map((z, i) => `<div class="dr-ti"><span>${esc(edgeName(z.a[0], z.a[1]))} ↔ ${esc(edgeName(z.b[0], z.b[1]))}</span><label>Teeth<select data-tg="zip${i}" data-tk="teeth">${Object.keys(ZIPS).map(k => opt(k, ZIPS[k][0], z.teeth)).join('')}</select></label><label class="dr-cc">Tape colour <input type="color" data-tg="zip${i}" data-tk="tape" value="${z.tape || '#222222'}"></label><button type="button" class="dr-link" data-ta="${z.closed ? 'unzip' : 'dozip'}" data-i="${i}">${z.closed ? 'Open the zip' : 'Close the zip'}</button><button type="button" class="dr-x" data-ta="delzip" data-i="${i}">×</button></div>`).join('');
  h += `<h3>Binding and piping</h3><div class="dr-row"><button type="button" data-ta="addbind"${pickEdge === 'binding' ? ' aria-pressed="true"' : ''}>${pickEdge === 'binding' ? 'Click an edge…' : 'Add binding'}</button><button type="button" data-ta="addpipe"${pickEdge === 'piping' ? ' aria-pressed="true"' : ''}>${pickEdge === 'piping' ? 'Click an edge…' : 'Add piping'}</button></div>` +
    U.binds.map((bd, i) => `<div class="dr-ti${sel === 'bind' + i ? ' on' : ''}"><button type="button" class="dr-link" data-ta="selbind" data-i="${i}">${bd.kind === 'piping' ? 'Piping' : 'Binding'} · ${esc(edgeName(bd.pi, bd.key))}</button><button type="button" class="dr-x" data-ta="delbind" data-i="${i}">×</button>${sel === 'bind' + i ? sl('bind' + i, 'w', bd.kind === 'piping' ? 'Cord diameter' : 'Width (each side)', 2, 40, .5, bd.w, ' mm') + (bd.kind === 'piping' ? sl('bind' + i, 'off', 'Shift into the seam', -5, 5, .5, bd.off || 0, ' mm') : sl('bind' + i, 'th', 'Thickness', .4, 4, .1, bd.th, ' mm')) + `<label class="dr-cc">Colour <input type="color" data-tg="bind${i}" data-tk="col" value="${bd.col || '#222222'}"></label><label>Texture<select data-tg="bind${i}" data-tk="tex">${['plain', 'satin', 'velvet', 'leather', 'knit', 'twill'].map(k => opt(k, TEXN[k], bd.tex || 'plain')).join('')}</select></label>` : ''}</div>`).join('');
  el.innerHTML = h + '<p class="dr-note">Edges are picked in the Pattern pieces panel on the right. Buttons and buttonholes are placed by clicking the cloth.</p>';
}
function trimChanged(rebuildTrims) { save(); renderTrimPane(); if (rebuildTrims && TR && TR.d) { buildStitches(); buildBinds(); } dirty = true; }
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-ta]'); if (!b || !$('#drTrimPane').contains(b)) return; const a = b.dataset.ta, i = +b.dataset.i, U = tUser();
  if (a === 'addline') { pickEdge = pickEdge === 'line' ? null : 'line'; S.hideR = false; sides(); }
  if (a === 'addzip') { pickEdge = pickEdge ? null : 'zipA'; S.hideR = false; sides(); }
  if (a === 'addbind') { pickEdge = pickEdge === 'binding' ? null : 'binding'; S.hideR = false; sides(); }
  if (a === 'addpipe') { pickEdge = pickEdge === 'piping' ? null : 'piping'; S.hideR = false; sides(); }
  if (a === 'selline') tSel = tSel === 'line' + i ? null : 'line' + i; if (a === 'selbind') tSel = tSel === 'bind' + i ? null : 'bind' + i;
  if (a === 'delline') { U.lines.splice(i, 1); tSel = null; return trimChanged(true); }
  if (a === 'delbind') { U.binds.splice(i, 1); tSel = null; return trimChanged(true); }
  if (a === 'addbtn') trimClick = trimClick === 'btn' ? null : 'btn'; if (a === 'addhole') trimClick = trimClick === 'hole' ? null : 'hole';
  if (a === 'delbtn') { if (U.btns[i].pair && worker) worker.postMessage({ cmd: 'untackPairs', pairs: U.btns[i].pair, gen }); U.btns.splice(i, 1); save(); return rebuildTrimsOnly(); }
  if (a === 'delhole') { U.btns.forEach(bt => { if (bt.hole === i) bt.hole = null; else if (bt.hole > i) bt.hole--; }); U.holes.splice(i, 1); save(); return rebuildTrimsOnly(); }
  if (a === 'holedir') { U.holes[i].dir = U.holes[i].dir === 'v' ? 'h' : 'v'; save(); return rebuildTrimsOnly(); }
  if (a === 'fasten') { const bt = U.btns[i], X = posAttr.array, bi = nearestVert(bt.pi, bt.u, bt.v); let best = -1, bd = 1e9; U.holes.forEach((o, k) => { if (U.btns.some(z => z.hole === k)) return; const hi = nearestVert(o.pi, o.u, o.v); if (hi < 0) return; const dd = Math.hypot(X[3 * bi] - X[3 * hi], X[3 * bi + 1] - X[3 * hi + 1], X[3 * bi + 2] - X[3 * hi + 2]); if (dd < bd) { bd = dd; best = k; } });
    if (best < 0) { status('Place a buttonhole first', 'err'); return; } const hi = nearestVert(U.holes[best].pi, U.holes[best].u, U.holes[best].v); bt.hole = best; bt.pair = [bi, hi]; worker.postMessage({ cmd: 'tack', a: bi, b: hi, gen }); paused = false; save(); return rebuildTrimsOnly(); }
  if (a === 'unfasten') { const bt = U.btns[i]; if (bt.pair) worker.postMessage({ cmd: 'untackPairs', pairs: bt.pair, gen }); bt.hole = null; bt.pair = null; paused = false; save(); return rebuildTrimsOnly(); }
  if (a === 'dozip') { const z = U.zips[i]; worker.postMessage({ cmd: 'zip', a: z.a, b: z.b, id: i, gen }); z.closed = true; paused = false; }
  if (a === 'unzip') { const z = U.zips[i]; if (z.pairs) worker.postMessage({ cmd: 'untackPairs', pairs: z.pairs, gen }); z.closed = false; z.pairs = null; paused = false; }
  if (a === 'delzip') { const z = U.zips[i]; if (z.pairs) worker.postMessage({ cmd: 'untackPairs', pairs: z.pairs, gen }); U.zips.splice(i, 1); save(); renderTrimPane(); return rebuildTrimsOnly(); }
  save(); renderTrimPane(); drawPieces(lastMesh);
});
function rebuildTrimsOnly() { renderTrimPane(); if (lastMesh) { buildTrims(lastMesh); } dirty = true; }
document.addEventListener('input', e => {
  const g = e.target.dataset && e.target.dataset.tg, k = e.target.dataset && e.target.dataset.tk; if (!g || !$('#drTrimPane').contains(e.target)) return;
  const v = e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'range' ? +e.target.value : e.target.value, U = tUser(), T = trims();
  if (g === 'auto') { T.top = v; return trimChanged(true); }
  if (g === 'def') { T.topDef = Object.assign(topDef(), { [k]: v }); tSel = 'def'; }
  else if (g === 'btn') { T[k] = v; save(); trimLook(); const o = e.target.parentNode.querySelector('output'); if (o) o.textContent = v + ' mm'; updateTrims(); dirty = true; return; }
  else if (/^line/.test(g)) U.lines[+g.slice(4)][k] = v;
  else if (/^bind/.test(g)) U.binds[+g.slice(4)][k] = v;
  else if (/^zip/.test(g)) U.zips[+g.slice(3)][k] = v;
  const o = e.target.parentNode.querySelector('output'); if (o) o.textContent = v + (e.target.parentNode.textContent.includes('mm') ? ' mm' : '');
  save(); if (TR && TR.d) { if (/^bind|^zip/.test(g)) buildBinds(); else buildStitches(); } if (e.target.tagName === 'SELECT' || e.target.type === 'color') renderTrimPane(); dirty = true;
});
function onEdgePick(pi, key) {
  const U = tUser(), name = lastMesh.panels[pi].name;
  if (pickEdge === 'line') { const d0 = topDef(); U.lines.push({ pi, pname: name, key, type: d0.type, len: d0.len, dist: d0.dist, gap: d0.gap, th: d0.th, col: '', tex: d0.tex }); tSel = 'line' + (U.lines.length - 1); pickEdge = null; }
  else if (pickEdge === 'binding' || pickEdge === 'piping') { U.binds.push({ pi, pname: name, key, kind: pickEdge, w: pickEdge === 'piping' ? 4 : 10, th: 1.2, col: cw().c2, tex: pickEdge === 'piping' ? 'satin' : 'plain' }); tSel = 'bind' + (U.binds.length - 1); pickEdge = null; }
  else if (pickEdge === 'zipA') { U._za = [pi, key, name]; pickEdge = 'zipB'; status('Now click the second edge', 'run'); renderTrimPane(); return; }
  else if (pickEdge === 'zipB' && U._za) { const z = { a: [U._za[0], U._za[1]], an: U._za[2], b: [pi, key], bn: name, teeth: 'metal', tape: '#222222', closed: true }; delete U._za; U.zips.push(z); pickEdge = null; worker.postMessage({ cmd: 'zip', a: z.a, b: z.b, id: U.zips.length - 1, gen }); paused = false; }
  trimChanged(true); drawPieces(lastMesh);
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
    if (pickEdge) p.segs.forEach(sg => { svg += `<polyline class="dr-edge" data-epi="${pi}" data-ekey="${sg.key}" points="${sg.pts.map(q => (q[0] + dx).toFixed(1) + ',' + (q[1] + dy).toFixed(1)).join(' ')}"><title>${esc(edgeName(pi, sg.key))}</title></polyline>`; });
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
  worker.postMessage({ cmd: 'build', gen, style: S.style, gender: S.gender, body: S.body, pose: Object.assign({}, S.pose || {}, { type: (S.body === 'women' || S.body === 'men') ? S.btype || '' : '', stature: { petite: .94, tall: 1.05 }[S.stature] || 1 }), size: S.size, height: +(S.meas || {}).height || 0, m, opts, fabric: S.fabric, fab: D.phys(fab()), sim: simMsg(), meshType: simset().mesh, h: simset().h, preset: S.preset || 'a', poseMap: S.poseMap || null });
}
function onMsg(e) {
  const d = e.data; if (d.gen !== gen) return;
  if (d.type === 'error') { status(d.message, 'err'); return; }
  if (d.type === 'zipped') { const z = tUser().zips[d.id]; if (z) { z.pairs = d.pairs; save(); } return; }
  if (d.type === 'body') {
    if (d.same && curBody !== lastBody && lastBody) { curBody = lastBody; buildBody(lastBody); }
    if (!d.same) { lastBody = d; curBody = d; buildBody(d); const hi = $('#drMeas [data-m=height]'); if (hi && !(+(S.meas || {}).height)) hi.value = Math.round(d.height); }
    status('Cutting and sewing the pieces…', 'run'); return;
  }
  if (d.type === 'joints') { drawPoseJoints(d.joints); return; }
  if (d.type === 'elasticOn') { if (!d.key) { status('Click closer to an edge (waist, cuff, hem or neckline) for elastic', 'err'); return; } elastics.push(d.ids); drawElastics(); status('Elastic sewn in at ' + Math.round(d.ratio * 100) + '% · Clear marks removes it', 'ok'); return; }
  if (d.type === 'bodypos') { if (!lastBody) return; curBody = Object.assign({}, lastBody, { pos: d.pos, J: Object.assign({}, lastBody.J, d.eyes || {}) }); buildBody(curBody); dirty = true; if (d.done && d.joints) { drawPoseJoints(d.joints); if (d.poseMap && poseTurned) { S.poseMap = d.poseMap; save(); poseTurned = false; const ps = $('#drPreset'); if (ps && ps.value) { ps.insertAdjacentHTML('beforeend', '<option value="">Custom pose</option>'); ps.value = ''; } } } if (d.done) status('Posed: ' + ((D.POSES[S.preset] || {}).n || 'A-pose') + '. Settling the cloth…', 'run'); return; }
  if (d.type === 'mesh') { elastics = []; elG.clear();
    built = true; panelOf = d.panel; lastMesh = d; selPanel = -1; PS = {}; pins = []; tackA = null; tackLines = []; setTimeout(() => { const U = tUser(); U.zips.forEach((z, i) => { z.pairs = null; if (z.closed && d.panels[z.a[0]] && d.panels[z.a[0]].name === z.an) worker.postMessage({ cmd: 'zip', a: z.a, b: z.b, id: i, gen }); }); U.btns.forEach(bt => { bt.pair = null; if (bt.hole != null && U.holes[bt.hole]) { const h = U.holes[bt.hole], bi = nearestVert(bt.pi, bt.u, bt.v), hi = nearestVert(h.pi, h.u, h.v); if (bi >= 0 && hi >= 0) { bt.pair = [bi, hi]; worker.postMessage({ cmd: 'tack', a: bi, b: hi, gen }); } } }); }, 0); if (+S.pucker) worker.postMessage({ cmd: 'pucker', a: S.pucker / 100, gen }); tc.detach(); $('#drGz').hidden = true; buildGarment(d); drawPieces(d); drawTable(d, baseMeas()); fitTarget(curBody, d); setView(view, false);
    $('#drPM').href = 'pattern-maker.html'; return;
  }
  if (d.type === 'frame') {
    posAttr.array.set(d.x); posAttr.needsUpdate = true; garMesh.geometry.computeVertexNormals(); garMesh.geometry.computeBoundingSphere(); updateTrims(); dirty = true; if (elastics.length && (d.done || d.gap)) drawElastics();
    if (d.gap) { lastGap = d.gap; lastStrain = d.strain; if (S.fit !== 'off') paintFit(); }
    status(d.done ? 'Settled · ' + fabName() + (d.tackGap > 1.5 ? ' · the front pulls open by ' + L(d.tackGap) + ' at a button: add ease at the chest or bust shaping' : '') : pulling ? 'Pulling the fabric…' : moving ? 'Moving the piece…' : d.t < .7 ? 'Sewing the seams…' : 'Draping…', d.done ? 'ok' : 'run');
    if (!d.done && !paused) requestAnimationFrame(() => worker.postMessage({ cmd: 'ack', gen }));
  }
}

/* ---------- loop, resize, save image, backup ---------- */
function size() { const r = canvas.parentNode.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); dirty = true; }
new ResizeObserver(size).observe(canvas.parentNode);
function loop() { requestAnimationFrame(loop); if (controls.update()) dirty = true; if (dirty) { draw(); dirty = false; } }
function hdImage() { // supersampled still for presentations
  const r = canvas.getBoundingClientRect(), pr = renderer.getPixelRatio(), k = Math.min(4, 3840 / r.width); renderer.setPixelRatio(k); renderer.setSize(r.width, r.height, false); key.shadow.mapSize.set(4096, 4096);
  markGroup.visible = false; draw(true); const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = 'forecut-3d-hd-' + S.style + '-' + (cw().name || '').replace(/\W+/g, '-').toLowerCase() + '.png'; a.click();
  renderer.setPixelRatio(pr); size(); markGroup.visible = true; status('HD image saved', 'ok');
}
function turntable() { // 8 seconds, one full turn, saved as a WebM video
  if (!canvas.captureStream || !window.MediaRecorder) { status('This browser cannot record video', 'err'); return; }
  const st = canvas.captureStream(30), mime = ['video/webm;codecs=vp9', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t)) || '', rec = new MediaRecorder(st, mime ? { mimeType: mime, videoBitsPerSecond: 8e6 } : {}), chunks = [];
  rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); }; rec.onstop = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' })); a.download = 'forecut-turntable-' + S.style + '.webm'; a.click(); markGroup.visible = true; status('Turntable video saved', 'ok'); };
  const d0 = camera.position.clone().sub(controls.target), rad = Math.hypot(d0.x, d0.z), y0 = d0.y, a0 = Math.atan2(d0.x, d0.z), t0 = performance.now(), T = 8000; markGroup.visible = false; rec.start(); status('Recording the turntable…', 'run');
  (function spin() { const t = Math.min(1, (performance.now() - t0) / T), a = a0 + t * Math.PI * 2; camera.position.set(controls.target.x + rad * Math.sin(a), controls.target.y + y0, controls.target.z + rad * Math.cos(a)); camera.lookAt(controls.target); dirty = true; if (t < 1) requestAnimationFrame(spin); else setTimeout(() => rec.stop(), 150); })();
}
$('#drHD').addEventListener('click', () => { $('#drShow').open = false; hdImage(); });
$('#drTurn').addEventListener('click', () => { $('#drShow').open = false; turntable(); });
$('#drClear').addEventListener('click', () => { if (elastics.length) { elastics = []; drawElastics(); if (worker) worker.postMessage({ cmd: 'unelastic', gen }); } $('#drShow').open = false; if (!worker || !built) return; pins.forEach(i => worker.postMessage({ cmd: 'pin', i, on: false, gen })); pins = []; tackLines = []; tackA = null; worker.postMessage({ cmd: 'untack', gen }); worker.postMessage({ cmd: 'unelastic', gen }); PS.elastic = {}; drawMarks(); status('Pins, tacks and elastic removed', 'run'); });
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
    pivot.position.copy(c.multiplyScalar(1 / Math.max(1, k))); pivot.rotation.set(0, 0, 0); pivot.updateMatrixWorld(); tc.attach(pivot); $('#drGz').hidden = false; ['freeze', 'stiff', 'elastic'].forEach(g => $('[data-g=' + g + ']').setAttribute('aria-pressed', !!(PS[g] && PS[g][pi])));
    if (S.tool !== 'move') { S.tool = 'move'; $$('#drTool button').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === 'move')); }
  }
  $$('#drPieces .dr-pc').forEach(p => p.classList.toggle('on', +p.dataset.pi === pi || (pi >= 0 && lastMesh && lastMesh.panels[pi] && lastMesh.panels[pi].name === 'SL' && lastMesh.panels[+p.dataset.pi].name === 'SR')));
  paintFit(); dirty = true;
}
$('#drPieces').addEventListener('click', e => { const ed = e.target.closest('[data-epi]'); if (ed && pickEdge) { onEdgePick(+ed.dataset.epi, ed.dataset.ekey); return; } const p = e.target.closest('[data-pi]'); if (p) selectPanel(+p.dataset.pi); });

/* ---------- elastic sewn into an edge: shown as a blue line on the cloth ---------- */
let elastics = []; const elG = new THREE.Group(); scene.add(elG); const elMat = new THREE.LineBasicMaterial({ color: '#2f7dd1', depthTest: false, transparent: true, opacity: .9 });
function drawElastics() { elG.clear(); if (!posAttr) return; const a = posAttr.array; elastics.forEach(ids => { const pts = ids.map(i => new THREE.Vector3(a[3 * i], a[3 * i + 1], a[3 * i + 2])); const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), elMat); l.renderOrder = 9; elG.add(l); }); dirty = true; }
/* ---------- pose editing: turn the avatar's joints with a rotation gizmo, like a fitting room ---------- */
let poseEdit = false, poseTurned = false, poseBone = null; const poseG = new THREE.Group(); scene.add(poseG);
const ptc = new TransformControls(camera, canvas); ptc.setMode('rotate'); ptc.setSpace('world'); ptc.setSize(.9); scene.add(ptc.getHelper());
const pjoint = new THREE.Object3D(); scene.add(pjoint); const pq0 = new THREE.Quaternion();
const pjMat = new THREE.MeshBasicMaterial({ color: '#e0773c', depthTest: false, transparent: true, opacity: .9 }), pjOn = new THREE.MeshBasicMaterial({ color: '#2f6f8f', depthTest: false });
ptc.addEventListener('change', () => { dirty = true; });
ptc.addEventListener('dragging-changed', e => { controls.enabled = !e.value; });
ptc.addEventListener('mouseDown', () => { pq0.copy(pjoint.quaternion); });
ptc.addEventListener('mouseUp', () => { if (!poseBone || !worker) return; const dq = pjoint.quaternion.clone().multiply(pq0.clone().invert()), m = new THREE.Matrix4().makeRotationFromQuaternion(dq).elements;
  if (Math.abs(dq.w) > .99995) return; poseTurned = true; worker.postMessage({ cmd: 'turn', bone: poseBone, m: [m[0], m[4], m[8], m[1], m[5], m[9], m[2], m[6], m[10]], gen }); paused = false; status('Turning the ' + poseBone.replace(/_0?\d?/g, ' ').replace(/ l$/, ' (left)').replace(/ r$/, ' (right)').trim() + '…', 'run'); pjoint.quaternion.identity(); });
function drawPoseJoints(J) { poseG.clear(); if (!J) return; const g = new THREE.SphereGeometry(1.3, 16, 12); Object.keys(J).forEach(k => { const m = new THREE.Mesh(g, k === poseBone ? pjOn : pjMat); m.position.set(J[k][0], J[k][1], J[k][2]); m.renderOrder = 12; m.userData.bone = k; poseG.add(m); }); poseG.visible = poseEdit; if (poseBone && J[poseBone]) { pjoint.position.set(...J[poseBone]); pjoint.quaternion.identity(); } dirty = true; }
function setPoseEdit(on) { poseEdit = on; poseG.visible = on; if (!on) { ptc.detach(); poseBone = null; } else if (worker) worker.postMessage({ cmd: 'joints', gen }); $('#drPoseEdit').setAttribute('aria-pressed', on); $('#drPoseNote').hidden = !on; dirty = true; }
$('#drPoseEdit').addEventListener('click', () => setPoseEdit(!poseEdit));
if (location.hash === '#drdebug') window.__dr = { get poseG() { return poseG; }, ptc, pjoint, camera, get poseBone() { return poseBone; } };
$('#drPoseReset').addEventListener('click', () => { S.poseMap = null; S.preset = 'a'; save(); renderControls(); if (worker && built) { worker.postMessage({ cmd: 'pose', preset: 'a', gen }); paused = false; status('Back to the A-pose…', 'run'); } });

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
  if (ptc.object && ptc.axis) return; // the pose gizmo handles this one
  if (poseEdit) { setNDC(e); ray.setFromCamera(ndc, camera); const hp2 = ray.intersectObjects(poseG.children, false)[0]; if (hp2) { e.stopPropagation(); poseBone = hp2.object.userData.bone; poseG.children.forEach(m => { m.material = m.userData.bone === poseBone ? pjOn : pjMat; }); pjoint.position.copy(hp2.object.position); pjoint.quaternion.identity(); ptc.attach(pjoint); status('Joint: ' + poseBone.replace(/_0?\d?/g, ' ').replace(/ l$/, ' (left)').replace(/ r$/, ' (right)').trim() + ' · drag a ring to turn it', 'ok'); dirty = true; return; } }
  if (overlay.pts.visible || overlay.joints.visible) { setNDC(e); ray.setFromCamera(ndc, camera);
    const hp = overlay.pts.visible && selPanel >= 0 ? ray.intersectObjects(overlay.pts.children, false)[0] : null;
    if (hp && worker) { e.stopPropagation(); const p = arrPts[hp.object.userData.ap], a = posAttr.array, c = [0, 0, 0]; let k = 0; for (let i = 0; i < panelOf.length; i++) if (panelOf[i] === selPanel) { c[0] += a[3 * i]; c[1] += a[3 * i + 1]; c[2] += a[3 * i + 2]; k++; }
      const m = new THREE.Matrix4().makeTranslation(p[0] - c[0] / k, p[1] - c[1] / k, p[2] - c[2] / k); worker.postMessage({ cmd: 'pstart', panel: selPanel, gen }); worker.postMessage({ cmd: 'pmove', e: Array.from(m.elements), gen }); worker.postMessage({ cmd: 'pend', gen }); paused = false; status('Piece moved to the arrangement point', 'run'); selectPanel(selPanel); return; }
    const hj = overlay.joints.visible ? ray.intersectObjects(overlay.joints.children, false)[0] : null;
    if (hj) { e.stopPropagation(); S.tab = 'avatar'; S.hideL = false; save(); renderControls(); const el = $('#drPose'); if (el) el.scrollIntoView({ block: 'center' }); status('Joint: ' + hj.object.userData.joint.replace(/-/g, ' ') + ' · use the pose sliders', 'ok'); return; } }
  if (!built || !worker) return;
  const pk = pickVertex(e); if (!pk) return;
  if (trimClick) { e.stopPropagation(); const U = tUser(), i = pk.i, pi = panelOf[i], o = { pi, pname: lastMesh.panels[pi].name, u: lastMesh.uv[2 * i], v: lastMesh.uv[2 * i + 1] }; if (trimClick === 'btn') U.btns.push(Object.assign(o, { size: trims().bsize || 12 })); else U.holes.push(Object.assign(o, { dir: TR && TR.vertical ? 'v' : 'h' })); trimClick = null; save(); rebuildTrimsOnly(); status('Placed', 'ok'); return; }
  if (gPlace && gList()[gSel]) { e.stopPropagation(); const g = gList()[gSel], i = pk.i; g.panel = panelOf[i]; g.pname = lastMesh.panels[g.panel].name; g.u = lastMesh.uv[2 * i]; g.v = lastMesh.uv[2 * i + 1]; gPlace = false; save(); renderGraphics(); buildGraphics(); status('Graphic placed', 'ok'); return; }
  if (S.tool === 'move') { e.stopPropagation(); selectPanel(panelOf[pk.i]); return; }
  if (S.tool === 'pin') { e.stopPropagation(); const at2 = pins.findIndex(q => q === pk.i || Math.hypot(posAttr.array[3 * q] - pk.point.x, posAttr.array[3 * q + 1] - pk.point.y, posAttr.array[3 * q + 2] - pk.point.z) < 1.5); if (at2 >= 0) { worker.postMessage({ cmd: 'pin', i: pins[at2], on: false, gen }); pins.splice(at2, 1); } else { pins.push(pk.i); worker.postMessage({ cmd: 'pin', i: pk.i, on: true, gen }); } paused = false; drawMarks(); return; }
  if (S.tool === 'elastic') { e.stopPropagation(); const r = Math.max(40, Math.min(99, +(S.elasticR || 85))); worker.postMessage({ cmd: 'elasticAt', i: pk.i, ratio: r / 100, gen }); paused = false; status('Sewing elastic at ' + r + '% into the nearest edge…', 'run'); return; }
  if (S.tool === 'tack') { e.stopPropagation(); if (tackA == null) { tackA = pk.i; status('First point chosen · click the second point', 'run'); drawMarks(); return; } if (pk.i !== tackA) { tackLines.push([tackA, pk.i]); worker.postMessage({ cmd: 'tack', a: tackA, b: pk.i, gen }); paused = false; } tackA = null; drawMarks(); return; }
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
