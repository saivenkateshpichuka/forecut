/* Forecut pattern maker: interface, state, scene building and downloads. Needs pm_engine.js and pm_export.js. */
(function () {
  var $ = FC.$, $$ = FC.$$, PM = window.PM, X = window.PMX, V = window.PMV, DET = window.PM_DETAILS || [];
  var GC = { anarkali: 'ANK', angrakha: 'ANG', sherwani: 'SHW', bandhgala: 'BDG', salwar: 'SAL', patiala: 'PAT', churidar: 'CHU', gharara: 'GHR', bodice: 'BOD', kurta: 'KUR', shirt: 'SHT', tshirt: 'TEE', hoodie: 'HOD', blouse: 'BLS', top: 'TOP', dress: 'DRS', jacket: 'JKT', skirt: 'SKT', lehenga: 'LEH', trousers: 'TRS', blazer: 'BLZ', coat: 'COT', bomber: 'BMB', jeans: 'JNS', jumpsuit: 'JMP', shirtdress: 'SHD', polo: 'POL', tank: 'TNK' }, VER = '1.3';
  function code() { return 'FC-' + { women: 'W', men: 'M', kids: 'K', unisex: 'U' }[S.gender] + '-' + GC[S.gid] + '-' + (S.size === 'custom' ? 'CUS' : S.size); }
  var UF = { cm: 1, mm: 10, in: 1 / 2.54 };
  var OPT = {
    ease: { l: 'Ease at chest', L: 1 }, len: { l: 'Length from shoulder (0 = standard)', L: 1 }, shape: { l: 'Side seam', o: [['straight', 'Straight'], ['shaped', 'Shaped at waist']] },
    neck: { l: 'Neckline', o: [['crew', 'Crew'], ['round', 'Round'], ['deep', 'Deep round'], ['ushape', 'U-neck'], ['v', 'V-neck'], ['boat', 'Boat'], ['square', 'Square']] },
    back: { l: 'Back neckline', o: [['std', 'Standard'], ['low', 'Low'], ['deepU', 'Deep U'], ['deepV', 'Deep V']] }, cup: { l: 'Bust dart (cup)', o: [['A', 'A'], ['B', 'B'], ['C', 'C'], ['D', 'D']] },
    dartpos: { l: 'Bust dart position', o: [['side', 'Side seam'], ['shoulder', 'Shoulder'], ['armhole', 'Armhole'], ['neck', 'Neckline'], ['waist', 'Into the waist dart']] }, princess: { l: 'Princess seams', o: [['0', 'No (darts)'], ['1', 'Yes, armhole princess']] },
    collar: { l: 'Collar', o: [['none', 'None'], ['band', 'Band / mandarin'], ['shirt', 'Shirt collar + band'], ['camp', 'Camp / revere'], ['peterpan', 'Peter Pan']] },
    sleeve: { l: 'Sleeve', o: [['none', 'Sleeveless'], ['plain', 'Set-in sleeve'], ['shirt', 'Shirt sleeve with cuff'], ['tee', 'T-shirt sleeve'], ['puff', 'Puff sleeve'], ['bell', 'Bell sleeve'], ['cap', 'Cap sleeve']] },
    slen: { l: 'Sleeve length', o: [['cap', 'Cap'], ['short', 'Short'], ['elbow', 'Elbow'], ['3q', 'Three-quarter'], ['full', 'Full']] },
    flare: { l: 'Flare at hem (each side)', L: 1 }, slit: { l: 'Side slit length', L: 1 }, pockets: { l: 'Pockets', o: [['0', 'None'], ['1', 'One'], ['2', 'Two']] }, hem: { l: 'Hem', o: [['straight', 'Straight'], ['curved', 'Curved shirt-tail']] },
    yoke: { l: 'Back yoke', o: [['1', 'Yoke with box pleat'], ['0', 'No yoke']] }, drop: { l: 'Dropped shoulder', L: 1 }, hood: { l: 'Hood', o: [['1', 'With hood'], ['0', 'Neck rib instead']] },
    opening: { l: 'Opening', o: [['1', 'Front opening (hooks)'], ['0', 'Back opening']] }, peplum: { l: 'Peplum', o: [['0', 'No'], ['1', 'Yes']] }, dress: { l: 'Dress style', o: [['shift', 'Shift (one piece)'], ['frock', 'Bodice + gathered skirt']] },
    skirt: { l: 'Skirt', o: [['straight', 'Straight / pencil'], ['aline', 'A-line'], ['circle', 'Circle'], ['gathered', 'Gathered'], ['panels', 'Panelled (kalis)']] }, slen2: { l: 'Skirt length', L: 1 },
    circle: { l: 'Circle', o: [['0.25', 'Quarter'], ['0.5', 'Half'], ['1', 'Full']] }, panels: { l: 'Panels', n: 1 }, hemc: { l: 'Hem circumference', L: 1 }, mohri: { l: 'Mohri (leg opening)', L: 1 }, fullness: { l: 'Fullness', o: [['slim', 'Slim'], ['regular', 'Regular'], ['full', 'Full (Punjabi)']] }, ruch: { l: 'Extra length for ruching', L: 1 }, gfull: { l: 'Flare fullness (× knee)', n: 1 },
    leg: { l: 'Leg', o: [['straight', 'Straight'], ['tapered', 'Tapered'], ['wide', 'Wide-leg'], ['palazzo', 'Palazzo'], ['barrel', 'Barrel'], ['jogger', 'Jogger'], ['shorts', 'Shorts']] },
    pfit: { l: 'Fit at crotch', o: [['trouser', 'Trouser (hangs straight)'], ['slack', 'Slack (closer, cups slightly)'], ['jean', 'Jean (contoured)']] },
    wtype: { l: 'Waist', o: [['fitted', 'Waistband with darts'], ['elastic', 'Elastic / drawstring casing']] }, tlen: { l: 'Length, waist to hem (0 = full length)', L: 1 }, cargo: { l: 'Cargo pocket', o: [['0', 'No'], ['1', 'Yes']] }
  };
  var ALLOW = { collar: { kurta: ['none', 'band'], shirt: ['shirt', 'band', 'camp'], top: ['none', 'band', 'peterpan'], dress: ['none', 'band', 'peterpan'], jacket: ['band', 'none'] },
    sleeve: { kurta: ['plain', 'bell', 'puff', 'cap', 'none'], shirt: ['shirt', 'plain'], tshirt: ['tee', 'none'], bodice: ['plain', 'none'], blouse: ['plain', 'puff', 'cap', 'none'], top: ['plain', 'puff', 'bell', 'cap', 'none'], dress: ['puff', 'plain', 'bell', 'cap', 'none'] } };
  var MEAS = { torso: ['bust', 'bust_span', 'bust_depth', 'waist', 'hip', 'wh', 'shoulder', 'across_back', 'across_front', 'nape', 'neck', 'bicep', 'elbow', 'wrist', 'sleeve'], skirt: ['waist', 'hip', 'wh'], trousers: ['waist', 'hip', 'wh', 'rise', 'inseam', 'knee_l', 'outseam', 'thigh', 'knee', 'calf', 'ankle'] };
  var MGROUP = [['Body', ['bust', 'bust_span', 'bust_depth', 'waist', 'hip', 'wh', 'shoulder', 'across_back', 'across_front', 'nape', 'neck', 'head']], ['Arms', ['bicep', 'elbow', 'wrist', 'sleeve']], ['Legs', ['rise', 'inseam', 'knee_l', 'outseam', 'thigh', 'knee', 'calf', 'ankle']]];
  var S = FC.load('pm2') || {};
  S = Object.assign({ gender: 'women', gid: 'kurta', size: 'M', unit: 'cm', m: null, o: {}, pc: {}, sa: 1, hemA: 2.5, detail: null }, S);
  S.adj = S.adj || {}; S.clients = null;
  function OO() { return Object.assign({}, S.o, { adj: S.adj }); }
  var ADJ = [ // [key, label, help, applies-to]
    ['fba', 'Full bust', 'Adds front width and bust dart intake. Use when the bust is fuller than the chart for the size.', 'top-w'],
    ['bb', 'Broad back', 'Adds width across the back and armhole.', 'top'],
    ['fsh', 'Forward shoulder', 'Moves the shoulder seam forward: raises the front shoulder, lowers the back.', 'top'],
    ['sway', 'Sway back', 'Takes out length at centre back waist, tapering to the side.', 'sway'],
    ['seat', 'Full seat', 'Adds back crotch length and back hip width.', 'bottom']];
  function adjFor() { var top = !(['skirt', 'lehenga', 'trousers', 'salwar', 'patiala', 'churidar', 'gharara'].indexOf(S.gid) > -1), bot = ['trousers', 'churidar', 'gharara'].indexOf(S.gid) > -1;
    return ADJ.filter(function (a) { return a[3] === 'top' ? top : a[3] === 'top-w' ? top && S.gender === 'women' : a[3] === 'bottom' ? bot : a[3] === 'sway' ? (S.gid === 'bodice' || S.gid === 'blouse' || S.gid === 'skirt' || S.gid === 'trousers') : false; }); }
  function adjForm() {
    var el = $('#pm-adj'), list = adjFor(), any = list.some(function (a) { return +S.adj[a[0]]; });
    if (!list.length) { el.innerHTML = '<p class="hint2">No fit adjustments for this garment.</p>'; return; }
    el.innerHTML = list.map(function (a) { return '<label class="row" title="' + a[2] + '"><span>' + a[1] + '<small class="ah">' + a[2] + '</small></span>' + uinp('data-a="' + a[0] + '" max="8"', U(+S.adj[a[0]] || 0)) + '</label>'; }).join('')
      + '<div class="acts"><button type="button" class="xbtn" id="pm-adjr"' + (any ? '' : ' disabled') + '>Clear adjustments</button></div><p class="hint2">Use what you found at the first fitting. Adjustments are saved with the client profile.</p>';
    $$('#pm-adj [data-a]').forEach(function (e) { e.oninput = function () { S.adj[e.dataset.a] = Math.max(0, Math.min(8, cm(parseFloat(e.value) || 0))); draw(); }; });
    $('#pm-adjr').onclick = function () { S.adj = {}; adjForm(); draw(); };
  }
  /* client profiles: saved on this device, exportable as a file */
  function clients() { var c = FC.load('pm-clients', []); return Array.isArray(c) ? c : []; }
  function clientForm() {
    var cs = clients(), el = $('#pm-clients'), cur = S.client || '';
    el.innerHTML = '<div class="clrow"><select id="pm-csel" aria-label="Client profile"><option value="">Size chart (no client)</option>' + cs.map(function (c) { return '<option' + (c.name === cur ? ' selected' : '') + '>' + c.name.replace(/</g, '') + '</option>'; }).join('') + '</select>'
      + '<button type="button" class="xbtn" id="pm-cdel"' + (cur ? '' : ' disabled') + '>Delete</button></div>'
      + '<div class="clrow"><input type="text" id="pm-cname" placeholder="Client or fit model name" value="' + (cur ? cur.replace(/"/g, '&quot;') : '') + '" maxlength="60"><button type="button" class="xbtn" id="pm-csave">' + (cur ? 'Update' : 'Save') + '</button></div>'
      + '<div class="clrow small"><button type="button" class="lnk" id="pm-cexp"' + (cs.length ? '' : ' disabled') + '>Export profiles</button><label class="lnk">Import<input type="file" id="pm-cimp" accept="application/json,.json" hidden></label><span>' + cs.length + ' saved on this device</span></div>';
    $('#pm-csel').onchange = function () { var c = clients().filter(function (x) { return x.name === this.value; }, this)[0]; if (!c) { S.client = null; clientForm(); return; }
      S.client = c.name; if (c.gender && PM.GENDER[c.gender]) S.gender = c.gender; if (PM.GARMENTS[S.gid].g.indexOf(S.gender) < 0) S.gid = Object.keys(PM.GARMENTS).filter(function (k) { return PM.GARMENTS[k].g.indexOf(S.gender) > -1; })[0];
      S.m = Object.assign({}, chart()[c.size] || chart()[Object.keys(chart())[2]], c.m); S.size = 'custom'; S.adj = Object.assign({}, c.adj || {}); ui(); toast('Loaded ' + c.name); };
    $('#pm-csave').onclick = function () { var n = $('#pm-cname').value.trim(); if (!n) { $('#pm-cname').focus(); return; } var cs2 = clients().filter(function (x) { return x.name !== n; });
      cs2.push({ name: n, gender: S.gender, size: baseSize(), m: Object.assign({}, S.m), adj: Object.assign({}, S.adj), saved: new Date().toISOString().slice(0, 10) }); cs2.sort(function (a, b) { return a.name.localeCompare(b.name); });
      FC.save('pm-clients', cs2); S.client = n; clientForm(); toast('Saved ' + n + ' on this device'); };
    $('#pm-cdel').onclick = function () { if (!S.client) return; FC.save('pm-clients', clients().filter(function (x) { return x.name !== S.client; })); toast('Deleted ' + S.client + '.'); S.client = null; clientForm(); };
    $('#pm-cexp').onclick = function () { FC.download('forecut-client-measurements.json', JSON.stringify({ forecut: 'pattern-maker-clients', v: 1, clients: clients() }, null, 1), 'application/json'); };
    $('#pm-cimp').onchange = function () { var f = this.files[0]; if (!f) return; var rd = new FileReader(); rd.onload = function () { try { var d = JSON.parse(rd.result), inc = (d.clients || []).filter(function (c) { return c && c.name && c.m; }), cs3 = clients();
        inc.forEach(function (c) { cs3 = cs3.filter(function (x) { return x.name !== c.name; }); cs3.push({ name: String(c.name).slice(0, 60), gender: c.gender, size: c.size, m: c.m, adj: c.adj || {}, saved: c.saved }); });
        FC.save('pm-clients', cs3); clientForm(); toast('Imported ' + inc.length + ' profile' + (inc.length === 1 ? '' : 's') + '.'); } catch (e) { toast('That file is not a Forecut profile export.'); } }; rd.readAsText(f); };
  }
  S.fab = Object.assign({ fw: 0, shl: 0, shw: 0, st: 0, oneWay: false }, S.fab || {});
  S.cost = Object.assign({ fp: 180, per: 2, endloss: 3, lp: 90, ip: 60, rp: 220, bp: 3, zp: 12, ep: 25, tp: 110, cone: 4000, lab: 15, smv: 0, cpm: 5, eff: 60, wash: 0, pack: 15, oh: 10, mg: 50, rm: 40, gst: 'auto', qty: 100, wastage: 3 }, S.cost || {});
  /* grading: every size = your base measurements + the chart's step from the base size to that size */
  function baseSize() { var c = chart(); if (S.size !== 'custom' && c[S.size]) return S.size; var best = null, bd = 1e9; Object.keys(c).forEach(function (k) { var d = Math.abs(c[k].bust - S.m.bust) + Math.abs(c[k].hip - S.m.hip); if (d < bd) { bd = d; best = k; } }); return best; }
  function gradeM(sz) { var c = chart(), b = c[baseSize()], t = c[sz], m = {}; Object.keys(S.m).forEach(function (k) { m[k] = S.m[k] + ((t[k] || 0) - (b[k] || 0)); }); return m; }
  var NEST = false, SZCOL = ['#3b6ea8', '#2f8f83', '#6f9a3c', '#b3862d', '#c0582b', '#a33a64', '#6a4aa0'];
  function knit() { return S.gid === 'tshirt' || S.gid === 'hoodie'; }
  function fabW() { return +S.fab.fw || (knit() ? 160 : 112); }
  function shrink(r0) { var sx = 1 / (1 - (+S.fab.shw || 0) / 100) * (knit() ? 1 - (+S.fab.st || 0) * .1 / 100 : 1), sy = 1 / (1 - (+S.fab.shl || 0) / 100); return PM.scale(PM.applyEdits(PM.manip(r0, OO()), editsFor()), sx, sy); }
  function editKey() { return S.gid + '|' + S.gender + '|' + JSON.stringify(S.o); }
  function editsFor() { S.edits = S.edits || {}; return S.edits[editKey()] || null; }
  function shrLab() { return (+S.fab.shl || +S.fab.shw) ? ' · incl. shrinkage L ' + (+S.fab.shl || 0) + '% W ' + (+S.fab.shw || 0) + '%' : ''; }
  var gate = $('#pm-gate'), app = $('#pm-app');

  function unlock() { gate.hidden = true; app.hidden = false; document.body.classList.add('pm-full'); window.dispatchEvent(new Event('resize')); }
  if (window.FC_PREVIEW) unlock();
  else document.addEventListener('fcauth-ready', function () { try { FCAuth.onChange(function (u) { if (u) unlock(); else { gate.hidden = false; app.hidden = true; } }); } catch (e) { } });
  if (window.FCAuth && FCAuth.onChange) FCAuth.onChange(function (u) { if (u) unlock(); });

  function U(v) { return +(v * UF[S.unit]).toFixed(S.unit === 'mm' ? 0 : S.unit === 'in' ? 2 : 1); }
  function cm(v) { return v / UF[S.unit]; }
  function measSet() { var k = S.gid === 'skirt' || S.gid === 'lehenga' ? MEAS.skirt : ['trousers', 'salwar', 'patiala', 'churidar', 'gharara'].indexOf(S.gid) > -1 ? MEAS.trousers : MEAS.torso.concat(S.gid === 'hoodie' ? ['head'] : []);
    k = k.filter(function (x) { return (S.gender === 'women' || !/^bust_/.test(x)) && (S.gid === 'tshirt' || S.gid === 'hoodie' || S.gid === 'jacket' || x !== 'elbow' || true); });
    k.forEach(function (x) { if (!(S.m[x] > 0)) { var c = chart()[S.size] || chart()[Object.keys(chart())[2]]; if (c[x]) S.m[x] = c[x]; } }); return k; }
  function chart() { return PM.CHARTS[S.gender]; }
  function resetMeas() { var c = chart(); if (!c[S.size]) S.size = Object.keys(c)[2]; S.m = Object.assign({}, c[S.size]); }
  function resetOpts() { S.o = Object.assign({}, PM.GARMENTS[S.gid].d); if (S.gender === 'kids') { if (S.o.len) S.o.len = Math.round(S.o.len * .62); if (S.o.slen2) S.o.slen2 = Math.round(S.o.slen2 * .6); if (S.o.ease) S.o.ease = Math.max(6, Math.round(S.o.ease * .75)); if (S.o.slit) S.o.slit = 12; if (S.o.hemc) S.o.hemc = 220; } if (S.gender === 'men' && S.gid === 'kurta') S.o.len = 102; if (S.gender === 'men' && S.gid === 'tshirt') S.o.len = 72; }
  if (!S.m) resetMeas(); if (!Object.keys(S.o).length) resetOpts();

  /* ---------- controls ---------- */
  function uinp(attr, val) { return '<span class="uin"><input type="number" step="any" min="0" inputmode="decimal" ' + attr + ' value="' + val + '"><i>' + S.unit + '</i></span>'; }
  function genderTabs() {
    var short = { women: 'Women', men: 'Men', kids: 'Kids', unisex: 'Unisex' };
    $('#pm-gtabs').innerHTML = Object.keys(PM.GENDER).map(function (g) { return '<button type="button" data-g="' + g + '" title="' + PM.GENDER[g] + '" aria-pressed="' + (g === S.gender) + '">' + short[g] + '</button>'; }).join('');
    $$('#pm-gtabs button').forEach(function (b) { b.onclick = function () { S.gender = b.dataset.g; if (PM.GARMENTS[S.gid].g.indexOf(S.gender) < 0) S.gid = Object.keys(PM.GARMENTS).filter(function (k) { return PM.GARMENTS[k].g.indexOf(S.gender) > -1; })[0]; S.detail = null; resetMeas(); resetOpts(); S.pc = {}; ui(true); }; });
    var gs = Object.keys(PM.GARMENTS).filter(function (k) { return PM.GARMENTS[k].g.indexOf(S.gender) > -1; });
    var gbtn = function (k) { return '<button type="button" data-k="' + k + '" aria-pressed="' + (k === S.gid) + '"><span>' + PM.GARMENTS[k].n + '</span><small>' + GC[k] + '</small></button>'; };
    var wg = gs.filter(function (k) { return !PM.GARMENTS[k].ind; }), ig = gs.filter(function (k) { return PM.GARMENTS[k].ind; });
    $('#pm-garments').innerHTML = (wg.length ? '<div class="ghead">Western</div>' + wg.map(gbtn).join('') : '') + (ig.length ? '<div class="ghead">Indian</div>' + ig.map(gbtn).join('') : '');
    $$('#pm-garments button').forEach(function (b) { b.onclick = function () { S.gid = b.dataset.k; S.detail = null; resetOpts(); S.pc = {}; ui(true); }; });
  }
  function measForm() {
    var c = chart(), h = '<label class="row"><span>Size chart</span><select id="pm-size">' + Object.keys(c).map(function (s) { return '<option' + (s === S.size ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '<option value="custom"' + (S.size === 'custom' ? ' selected' : '') + '>Custom</option></select></label>';
    var ks = measSet(); MGROUP.forEach(function (g) { var in_ = g[1].filter(function (k) { return ks.indexOf(k) > -1; }); if (!in_.length) return; h += '<h6 class="mg">' + g[0] + '</h6>';
      in_.forEach(function (k) { h += '<label class="row" title="' + PM.LABELS[k] + '"><span>' + PM.LABELS[k] + '</span>' + uinp('data-m="' + k + '"', U(S.m[k])) + '</label>'; }); });
    $('#pm-meas').innerHTML = h;
    var keys = measSet(); figure(keys, keys.indexOf(FK) > -1 ? FK : keys[0]);
    $$('#pm-meas [data-m]').forEach(function (e) { var row = e.closest('.row'), k = e.dataset.m; row.onmouseenter = function () { figure(keys, k); }; e.onfocus = function () { figure(keys, k); }; });
    $('#pm-size').onchange = function () { S.size = this.value; if (S.size !== 'custom') S.m = Object.assign({}, chart()[S.size]); ui(); };
    $$('#pm-meas [data-m]').forEach(function (e) { e.oninput = function () { var v = parseFloat(e.value); if (v > 0) { S.m[e.dataset.m] = cm(v); S.size = 'custom'; $('#pm-size').value = 'custom'; draw(); } }; });
  }
  var FK = null, FV = 'front';
  function figure(keys, k, view) {
    FK = k; FV = view || (V.BACK.indexOf(k) > -1 ? 'back' : 'front');
    var c = chart()[S.size], ref = S.size === 'custom' ? '' : '<dt>Size ' + S.size + ' chart</dt><dd>' + U(c[k]) + ' ' + S.unit + '</dd>';
    $('#pm-fig').innerHTML = '<div class="fv"><div class="vt" role="group" aria-label="Body view"><button type="button" data-v="front" aria-pressed="' + (FV === 'front') + '">Front</button><button type="button" data-v="back" aria-pressed="' + (FV === 'back') + '">Back</button></div>' + V.figure(keys, k, FV) + '</div>'
      + '<div class="fd"><small>How to measure</small><b>' + PM.LABELS[k] + '</b><p>' + (V.HOW[k] || '') + '</p>' + (V.TIP[k] ? '<p class="tip">' + V.TIP[k] + '</p>' : '') + '<dl><dt>Used for</dt><dd>' + (V.USE[k] || '') + '</dd>' + ref + '<dt>Your value</dt><dd>' + U(S.m[k]) + ' ' + S.unit + '</dd></dl></div>';
    $$('#pm-fig .vt button').forEach(function (b) { b.onclick = function () { var ks = keys.filter(function (x) { return (V.BACK.indexOf(x) > -1) === (b.dataset.v === 'back'); }); figure(keys, b.dataset.v === 'back' ? (V.BACK.indexOf(k) > -1 ? k : ks[0] || k) : (V.BACK.indexOf(k) < 0 ? k : ks[0] || k), b.dataset.v); }; });
    $$('#pm-meas .row').forEach(function (r) { var i = r.querySelector('[data-m]'); r.classList.toggle('on', !!i && i.dataset.m === k); });
    $$('#pm-fig g[data-k]').forEach(function (g) { g.onmouseenter = function () { figure(keys, g.dataset.k); }; g.onclick = function () { var i = $('#pm-meas [data-m="' + g.dataset.k + '"]'); if (i) { i.focus(); i.select(); } }; });
  }
  function optForm() {
    var G = PM.GARMENTS[S.gid], h = '';
    G.o.forEach(function (k) {
      var d = OPT[k], v = S.o[k];
      if (d.o) { var opts = d.o.filter(function (x) { return !ALLOW[k] || !ALLOW[k][S.gid] || ALLOW[k][S.gid].indexOf(x[0]) > -1; }); h += '<label class="row wide"><span>' + d.l + '</span><select data-o="' + k + '">' + opts.map(function (x) { return '<option value="' + x[0] + '"' + (String(x[0]) === String(v) ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select></label>'; }
      else h += '<label class="row"><span>' + d.l + '</span>' + (d.L ? uinp('data-o="' + k + '"', U(+v || 0)) : '<input type="number" step="1" min="0" data-o="' + k + '" value="' + (+v || 0) + '" style="text-align:right">') + '</label>';
    });
    $('#pm-opts').innerHTML = h;
    $$('#pm-opts [data-o]').forEach(function (e) { e.oninput = e.onchange = function () { var k = e.dataset.o, d = OPT[k]; S.o[k] = d.o ? e.value : d.L ? cm(parseFloat(e.value) || 0) : (parseFloat(e.value) || 0); draw(); }; });
  }
  function detailPicker() {
    var dl = $('#pm-dlist'); if (!dl.options.length) dl.innerHTML = DET.map(function (d) { return '<option value="' + d[0].replace(/"/g, '') + ' · ' + d[1] + '">'; }).join('');
    $('#pm-dsearch').onchange = function () { var v = this.value, d = DET.filter(function (x) { return x[0] + ' · ' + x[1] === v; })[0]; if (d) { applyDetail(d); this.value = ''; this.blur(); } };
    $('#pm-dnote').innerHTML = S.detail ? 'From Forecut detail <b>' + S.detail + '</b>' : '';
  }
  function applyDetail(d) { S.gender = d[2]; S.gid = d[3]; resetMeas(); resetOpts(); Object.keys(d[4]).forEach(function (k) { S.o[k] = d[4][k]; }); S.detail = d[0]; S.pc = {}; ui(true); }

  /* ---------- scene ---------- */
  var built = null;
  function drillAt(sc, c) { var pts = []; for (var i = 0; i <= 16; i++) pts.push([c[0] + .3 * Math.cos(i / 16 * 6.2832), c[1] + .3 * Math.sin(i / 16 * 6.2832)]); sc.push({ k: 'poly', p: pts, c: 1, w: .05, L: 'MARK' }); sc.push({ k: 'poly', p: [[c[0] - .45, c[1]], [c[0] + .45, c[1]]], w: .04, L: 'MARK' }); sc.push({ k: 'poly', p: [[c[0], c[1] - .45], [c[0], c[1] + .45]], w: .04, L: 'MARK' }); }
  function scene(forExport) { function drill(c) { drillAt(sc, c); }
    var adjOn = Object.keys(S.adj || {}).filter(function (k) { return +S.adj[k]; }), OFF = {}, PCS = [], r0 = PM.build(S.gid, S.gender, S.m, OO()), r = shrink(r0), sc = [], x = 2, y = 2, rowH = 0, maxW = 165, sizeLab = (S.size === 'custom' ? 'custom size' : 'size ' + S.size) + ' · ' + PM.GENDER[S.gender] + shrLab() + (adjOn.length ? ' · fit adj.' : '') + (S.client ? ' · ' + S.client : ''), title = r.label;
    built = r0;
    var onList = r.pieces.filter(function (p) { return (S.pc[p.id] || {}).on !== false; }), NP = onList.length, cd = code();
    r.pieces.forEach(function (p) {
      var st = S.pc[p.id] || (S.pc[p.id] = {}), on = st.on !== false; if (!on) return; var pn = onList.indexOf(p) + 1;
      var sa = st.sa !== undefined ? st.sa : S.sa, ha = st.hem !== undefined ? st.hem : (p.defHem !== undefined ? p.defHem : S.hemA), name = st.name || p.auto;
      var outl = PM.outline(p), cut = PM.cutline(p, sa, ha), bb = X.bbox([{ k: 'poly', p: cut }]), w = bb[2] - bb[0], h = bb[3] - bb[1];
      if (x + w > maxW && x > 2) { x = 2; y += rowH + 4; rowH = 0; }
      var dx = x - bb[0], dy = y - bb[1]; function T(q) { return [q[0] + dx, q[1] + dy]; } OFF[p.id] = [dx, dy, sa, ha]; var PCd = { id: p.id, name: name, cut: p.cut, comp: p.comp, poly: cut.map(T), seam: outl.map(T), notches: [], drills: [], lines: [], fold: null, grain: null, size: S.size }; PCS.push(PCd);
      sc.push({ k: 'poly', p: cut.map(T), c: 1, w: .07, col: '#1c1714', L: 'CUT', fill: forExport ? null : '#fffcf7' });
      if (sa > 0 || ha > 0) sc.push({ k: 'poly', p: outl.map(T), c: 1, w: .045, d: [.5, .3], col: '#6e6259', L: 'SEAM' });
      p.edges.forEach(function (e) { if (e.t === 'fold') { sc.push({ k: 'poly', p: e.p.map(T), w: .14, col: '#a9481f', d: [.8, .4], L: 'MARK' }); var mid = e.p[Math.floor(e.p.length / 2)], vert = Math.abs(e.p[0][0] - e.p[e.p.length - 1][0]) < Math.abs(e.p[0][1] - e.p[e.p.length - 1][1]); sc.push({ k: 'text', x: mid[0] + dx + (vert ? .9 : 0), y: mid[1] + dy + (vert ? 0 : -.6), s: .9, t: 'PLACE ON FOLD', col: '#a9481f', r: vert ? 90 : 0, a: 'middle', L: 'TEXT' }); } });
      p.marks.forEach(function (k) {
        if (k.t === 'line') { sc.push({ k: 'poly', p: k.p.map(T), w: .04, d: k.dash ? [.4, .3] : null, col: '#6e6259', L: 'MARK' }); if (k.lab) { var a = k.p[0], b = k.p[k.p.length - 1], hor = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]); sc.push({ k: 'text', x: (hor ? a[0] + 1 : a[0] + .4) + dx, y: (hor ? a[1] - .3 : (a[1] + b[1]) / 2) + dy, s: .75, t: k.lab, col: '#6e6259', L: 'TEXT', r: hor ? 0 : 90 }); } }
        if (k.t === 'dart') { PCd.lines.push(k.p.map(T));
          var dp = k.p, ap = dp.length === 3 ? [dp[1]] : [dp[0], dp[2]], base = dp.length === 3 ? [(dp[0][0] + dp[2][0]) / 2, (dp[0][1] + dp[2][1]) / 2] : null;
          if (dp.length === 3) { var ux = base[0] - dp[1][0], uy = base[1] - dp[1][1], ul = Math.hypot(ux, uy) || 1, dh = [dp[1][0] + ux / ul * 1, dp[1][1] + uy / ul * 1]; drill(T(dh)); PCd.drills.push(T(dh));
            [dp[0], dp[2]].forEach(function (leg) { { var lx = leg[0] - dp[1][0], ly = leg[1] - dp[1][1], ll = Math.hypot(lx, ly) || 1; sc.push({ k: 'poly', p: [T([leg[0] - lx / ll * .3, leg[1] - ly / ll * .3]), T([leg[0] + lx / ll * (sa + .2), leg[1] + ly / ll * (sa + .2)])], w: .07, L: 'MARK' }); PCd.notches.push(T([leg[0] + lx / ll * sa, leg[1] + ly / ll * sa])); } }); }
          else if (dp.length >= 5) { [[dp[0], dp[2]], [dp[2], dp[0]]].forEach(function (pr) { var vx2 = pr[1][0] - pr[0][0], vy2 = pr[1][1] - pr[0][1], vl = Math.hypot(vx2, vy2) || 1, dq = [pr[0][0] + vx2 / vl, pr[0][1] + vy2 / vl]; drill(T(dq)); PCd.drills.push(T(dq)); }); }
          sc.push({ k: 'poly', p: k.p.map(T), w: .06, col: '#1c1714', L: 'MARK' }); if (k.lab) sc.push({ k: 'text', x: k.p[1][0] + dx + .5, y: k.p[1][1] + dy, s: .7, t: k.lab, col: '#6e6259', L: 'TEXT' }); }
        if (k.t === 'dot') { var c = T(k.c), pts = []; for (var i = 0; i <= 16; i++) pts.push([c[0] + .35 * Math.cos(i / 16 * 6.2832), c[1] + .35 * Math.sin(i / 16 * 6.2832)]); sc.push({ k: 'poly', p: pts, c: 1, w: .06, L: 'MARK' }); if (k.lab) sc.push({ k: 'text', x: c[0] + .6, y: c[1] + .3, s: .7, t: k.lab, col: '#6e6259', L: 'TEXT' }); }
        if (k.t === 'button') { var c2 = T(k.c), bp = []; for (var j = 0; j <= 16; j++) bp.push([c2[0] + .55 * Math.cos(j / 16 * 6.2832), c2[1] + .55 * Math.sin(j / 16 * 6.2832)]); sc.push({ k: 'poly', p: bp, c: 1, w: .05, L: 'MARK' }); }
        if (k.t === 'notch') { var c3 = k.c, best = null, bd = 1e9; for (var q = 1; q < outl.length; q++) { var A = outl[q - 1], Bp = outl[q], vx = Bp[0] - A[0], vy = Bp[1] - A[1], t = Math.max(0, Math.min(1, ((c3[0] - A[0]) * vx + (c3[1] - A[1]) * vy) / (vx * vx + vy * vy || 1))), px = A[0] + vx * t, py = A[1] + vy * t, dd = Math.hypot(px - c3[0], py - c3[1]); if (dd < bd) { bd = dd; best = [px, py, vx, vy]; } }
          if (best) { var l = Math.hypot(best[2], best[3]) || 1, nx = best[3] / l, ny = -best[2] / l, inside = pip([best[0] + nx * .3, best[1] + ny * .3], outl); if (inside) { nx = -nx; ny = -ny; } var cnt = k.n || 1; for (var z = 0; z < cnt; z++) { var off = (z - (cnt - 1) / 2) * .5, ox = best[0] + best[2] / l * off, oy = best[1] + best[3] / l * off; sc.push({ k: 'poly', p: [T([ox - nx * .25, oy - ny * .25]), T([ox + nx * (Math.max(sa, .4) + .2), oy + ny * (Math.max(sa, .4) + .2)])], w: .07, L: 'MARK' }); PCd.notches.push(T([ox + nx * sa, oy + ny * sa])); } } }
        if (k.t === 'text') sc.push({ k: 'text', x: k.c[0] + dx, y: k.c[1] + dy, s: .8, t: k.s, a: 'middle', col: '#6e6259', L: 'TEXT' });
      });
      p.edges.forEach(function (e) { if (e.t === 'fold') PCd.fold = [T(e.p[0]), T(e.p[e.p.length - 1])]; });
      if (p.grain) PCd.grain = [T(p.grain[0]), T(p.grain[1])];
      // pocket placement on the left front (patch pockets), with drill holes 1 cm inside the top corners
      if (p.id === 'front') { var pk = r.pieces.filter(function (q) { return q.id === 'pocket' && /patch/i.test(q.comp) && (S.pc.pocket || {}).on !== false; })[0];
        if (pk) { var po = PM.outline(pk), pw = Math.max.apply(null, po.map(function (q) { return q[0]; })) - Math.min.apply(null, po.map(function (q) { return q[0]; })), ph = Math.max.apply(null, po.map(function (q) { return q[1]; })) - Math.min.apply(null, po.map(function (q) { return q[1]; })), ua2 = p.edges[3].p[0], px0 = Math.max(5.5, ua2[0] * .27), py0 = ua2[1] - 3;
          sc.push({ k: 'poly', p: [[px0, py0], [px0 + pw, py0], [px0 + pw, py0 + ph], [px0, py0 + ph]].map(T), c: 1, w: .04, d: [.4, .3], col: '#6e6259', L: 'MARK' }); sc.push({ k: 'text', x: px0 + dx + .5, y: py0 + dy - .5, s: .7, t: 'pocket placement (left front)', col: '#6e6259', L: 'TEXT' });
          [[px0 + 1, py0 + 1], [px0 + pw - 1, py0 + 1]].forEach(function (q) { drill(T(q)); PCd.drills.push(T(q)); }); PCd.lines.push([[px0, py0], [px0 + pw, py0], [px0 + pw, py0 + ph], [px0, py0 + ph], [px0, py0]].map(T)); } }
      if (p.grain) { var g0 = T(p.grain[0]), g1 = T(p.grain[1]), ang = Math.atan2(g1[1] - g0[1], g1[0] - g0[0]); sc.push({ k: 'poly', p: [g0, g1], w: .08, col: '#1f3d33', L: 'GRAIN' });
        var gl = Math.hypot(g1[0] - g0[0], g1[1] - g0[1]); if (gl > 9) { var gd = ang * 180 / Math.PI, gx = g0[0] + (g1[0] - g0[0]) * .22 - Math.sin(ang) * .45, gy = g0[1] + (g1[1] - g0[1]) * .22 + Math.cos(ang) * .45; sc.push({ k: 'text', x: gx, y: gy, s: .62, t: 'GRAINLINE', col: '#1f3d33', r: gd > 90 || gd < -90 ? gd + 180 : gd, L: 'TEXT' }); }
        [[g1, ang], [g0, ang + Math.PI]].forEach(function (z) { sc.push({ k: 'poly', p: [[z[0][0] - Math.cos(z[1] - .35) * 1, z[0][1] - Math.sin(z[1] - .35) * 1], z[0], [z[0][0] - Math.cos(z[1] + .35) * 1, z[0][1] - Math.sin(z[1] + .35) * 1]], w: .08, col: '#1f3d33', L: 'GRAIN' }); }); }
      var fs = Math.max(.45, Math.min(1.5, Math.min(w, h) / 14, (w - 2) / (Math.max(name.length, 18) * .58))), tw = Math.max(name.length, 26) * fs * .56, lx = Math.max(bb[0] + dx + 1, Math.min((p.grain ? (p.grain[0][0] + p.grain[1][0]) / 2 : (bb[0] + bb[2]) / 2) + dx + .6, bb[2] + dx - tw - .6)), ly = (p.grain ? (p.grain[0][1] + p.grain[1][1]) / 2 : (bb[1] + bb[3]) / 2) + dy - fs;
      [[name, fs, 1], ['Piece ' + pn + ' of ' + NP + ' · ' + p.cut + (p.notes ? ' · ' + p.notes : ''), fs * .62], [cd + ' · ' + sizeLab + ' · SA ' + U(sa) + ' ' + S.unit + (ha !== sa ? ', hem ' + U(ha) + ' ' + S.unit : ''), fs * .55], ['FORECUT · forecut.in', fs * .55, 1, '#a9481f']].forEach(function (t, i) { sc.push({ k: 'text', x: lx, y: ly + i * fs * 1.05, s: t[1], t: t[0], b: t[2], col: t[3] || '#1c1714', L: i === 3 ? 'BRAND' : 'TEXT' }); });
      sc.push({ k: 'text', x: (bb[0] + bb[2]) / 2 + dx, y: (bb[1] + bb[3]) / 2 + dy + fs * 3.6, s: Math.min(4, w / 6), t: 'FORECUT', b: 1, col: '#a9481f', op: .12, a: 'middle', r: -30, L: 'BRAND' });
      x += w + 4; rowH = Math.max(rowH, h);
    });
    var W = Math.max(30, Math.min(maxW + 4, sc.length ? X.bbox(sc.filter(function (o) { return o.L !== 'BRAND'; }))[2] + 2 : 30)), H = y + rowH + 9;
    sc.push({ k: 'poly', p: [[1, H - 6.5], [6, H - 6.5], [6, H - 1.5], [1, H - 1.5]], c: 1, w: .06, L: 'MARK' }, { k: 'text', x: 3.5, y: H - 3.7, s: .7, t: '5 cm square', a: 'middle', L: 'TEXT' });
    sc.push({ k: 'text', x: 7.5, y: H - 4.6, s: 1.2, t: title + ' · ' + sizeLab + ' · ' + cd + ' · ' + NP + ' pieces', b: 1, L: 'TEXT' }, { k: 'text', x: 7.5, y: H - 3, s: .75, t: 'Pattern by FORECUT · forecut.in · engine ' + VER + ' · ' + new Date().toISOString().slice(0, 10) + ' · print at 100%, check the 5 cm square · test in calico before cutting good fabric', col: '#a9481f', L: 'BRAND' });
    if (NEST || forExport === 'nest') { var bs = baseSize(), szs = Object.keys(chart()), leg = [];
      szs.forEach(function (sz, i) { if (sz === bs && S.size !== 'custom') { leg.push([sz, '#1c1714']); return; } var col = SZCOL[i % SZCOL.length], rs; try { rs = shrink(PM.build(S.gid, S.gender, gradeM(sz), OO())); } catch (e) { return; } leg.push([sz, col]);
        rs.pieces.forEach(function (p) { var o = OFF[p.id]; if (!o) return; sc.push({ k: 'poly', p: PM.cutline(p, o[2], o[3]).map(function (q) { return [q[0] + o[0], q[1] + o[1]]; }), c: 1, w: .035, col: col, L: 'SIZE_' + sz.replace(/[^A-Za-z0-9]/g, '') }); }); });
      if (S.size === 'custom') leg.unshift(['yours', '#1c1714']);
      leg.forEach(function (l, i) { var lx = W - 8 - (leg.length - i) * 6.5; sc.push({ k: 'poly', p: [[lx, H - 8], [lx + 4.5, H - 8]], w: .35, col: l[1], L: 'TEXT' }); sc.push({ k: 'text', x: lx, y: H - 5.4, s: 1.5, t: l[0], col: l[1], b: 1, L: 'TEXT' }); });
      title += ' · graded ' + szs[0] + '–' + szs[szs.length - 1] + ' from ' + (S.size === 'custom' ? 'your measurements' : 'size ' + bs); }
    return { sc: sc, W: W, H: H, title: title + ' - ' + sizeLab, r: r, r0: r0, pcs: PCS };
  }
  function pip(pt, poly) { var c = false; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { var a = poly[i], b = poly[j]; if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
  function grid(W, H) { var st = S.unit === 'in' ? 2.54 : 1, g = '<g stroke="#ece4d8" stroke-width=".03">'; for (var x = 0, i = 0; x <= W; x += st, i++) g += '<path d="M' + x.toFixed(2) + ' 0V' + H + '"' + (i % 5 ? '' : ' stroke="#d9cdbd" stroke-width=".06"') + '/>'; for (var y = 0, j = 0; y <= H; y += st, j++) g += '<path d="M0 ' + y.toFixed(2) + 'H' + W + '"' + (j % 5 ? '' : ' stroke="#d9cdbd" stroke-width=".06"') + '/>'; return g + '</g>'; }

  var OPEN = {}, PIC = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  function pieceTable() {
    var r = built; if (!r) return; var nOn = 0;
    $('#pm-pieces').innerHTML = '<div class="pchd"><span>' + r.pieces.length + ' pieces</span><button type="button" id="pm-pexp">' + (OPEN.all ? 'Collapse all' : 'Expand all') + '</button></div>';
    $('#pm-pieces').innerHTML += r.pieces.map(function (p) {
      var st = S.pc[p.id] || {}, on = st.on !== false, sa = st.sa !== undefined ? st.sa : S.sa, ha = st.hem !== undefined ? st.hem : (p.defHem !== undefined ? p.defHem : S.hemA), hasHem = p.edges.some(function (e) { return e.t === 'hem'; });
      var op = OPEN.all || OPEN[p.id];
      return '<div class="pcard' + (on ? '' : ' off') + (op ? ' open' : '') + '" data-pc="' + p.id + '"><button type="button" class="pexp" aria-expanded="' + !!op + '" aria-label="Edit ' + p.comp + '">' + PIC + '</button><div class="t"><input type="checkbox" data-p="' + p.id + '" data-f="on"' + (on ? ' checked' : '') + ' aria-label="Include ' + p.comp + '"><code>' + (on ? String(++nOn).padStart(2, '0') : '––') + '</code><b>' + p.comp + '</b><small>' + p.cut + '</small><em title="Seam / hem allowance">' + U(sa) + (hasHem ? ' / ' + U(ha) : '') + ' ' + S.unit + '</em></div>'
        + '<label class="nm"><span>Label on pattern</span><input type="text" data-p="' + p.id + '" data-f="name" value="' + (st.name || p.auto).replace(/"/g, '&quot;') + '"></label>'
        + '<div class="a"><label>Seam' + uinp('data-p="' + p.id + '" data-f="sa"', U(sa)) + '</label>' + (hasHem ? '<label>Hem' + uinp('data-p="' + p.id + '" data-f="hem"', U(ha)) + '</label>' : '<label>Hem<input disabled value="–"></label>') + '</div></div>';
    }).join('');
    $('#pm-pexp').onclick = function () { OPEN = OPEN.all ? {} : { all: 1 }; pieceTable(); };
    $$('#pm-pieces .pcard').forEach(function (cd) { var id = cd.dataset.pc, tg = function () { if (OPEN.all) { OPEN = {}; r.pieces.forEach(function (p) { OPEN[p.id] = 1; }); } OPEN[id] = !OPEN[id]; cd.classList.toggle('open', !!OPEN[id]); cd.querySelector('.pexp').setAttribute('aria-expanded', !!OPEN[id]); };
      cd.querySelector('.pexp').onclick = tg; cd.querySelector('.t').onclick = function (e) { if (e.target.tagName !== 'INPUT') tg(); }; });
    $$('#pm-pieces [data-p]').forEach(function (e) { e.oninput = e.onchange = function () { var st = S.pc[e.dataset.p] || (S.pc[e.dataset.p] = {}), f = e.dataset.f; if (f === 'on') { st.on = e.checked; draw(); return; } else if (f === 'name') st.name = e.value; else st[f] = cm(parseFloat(e.value) || 0); draw(true); }; });
  }
  /* ---------- view: zoom and pan ---------- */
  var view = $('#pm-view'), ZR = 1, last = null;
  function fitZ(W, H) { var w = Math.max(200, view.offsetWidth - 72), h = Math.max(200, view.offsetHeight - 72); return Math.min(w / W, h / H); }
  function applyZoom() { if (!last) return; var z = fitZ(last.W, last.H) * ZR, sv = $('#pm-svg svg'); if (!sv) return; sv.style.width = (last.W * z).toFixed(0) + 'px'; sv.style.height = (last.H * z).toFixed(0) + 'px'; $('#pm-zl').textContent = Math.round(ZR * 100) + '%'; if (typeof rulers === 'function') requestAnimationFrame(rulers); }
  function zoom(f, cx, cy) { var old = ZR; ZR = Math.max(.25, Math.min(8, ZR * f)); if (cx === undefined) { cx = view.clientWidth / 2; cy = view.clientHeight / 2; } var sx = (view.scrollLeft + cx) / (view.scrollWidth || 1), sy = (view.scrollTop + cy) / (view.scrollHeight || 1); applyZoom(); view.scrollLeft = sx * view.scrollWidth - cx; view.scrollTop = sy * view.scrollHeight - cy; }
  $('#pm-zin').onclick = function () { zoom(1.25); }; $('#pm-zout').onclick = function () { zoom(.8); }; $('#pm-zfit').onclick = function () { ZR = 1; applyZoom(); view.scrollTo(0, 0); };
  view.addEventListener('wheel', function (e) { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); var r = view.getBoundingClientRect(); zoom(e.deltaY < 0 ? 1.12 : .89, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  /* phones and tablets: pinch with two fingers to zoom the pattern; one finger scrolls it */
  var pinch = null; function tdist(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }
  view.addEventListener('touchstart', function (e) { if (e.touches.length === 2) { pinch = tdist(e.touches); e.preventDefault(); } }, { passive: false });
  view.addEventListener('touchmove', function (e) { if (!pinch || e.touches.length !== 2) return; e.preventDefault(); var d = tdist(e.touches), r = view.getBoundingClientRect(); if (Math.abs(d / pinch - 1) > .04) { zoom(d / pinch, (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left, (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top); pinch = d; } }, { passive: false });
  view.addEventListener('touchend', function (e) { if (e.touches.length < 2) pinch = null; });
  var pan = null;
  view.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.button !== 0) return; pan = [e.clientX, e.clientY, view.scrollLeft, view.scrollTop]; view.classList.add('drag'); });
  window.addEventListener('pointermove', function (e) { if (!pan) return; view.scrollLeft = pan[2] - (e.clientX - pan[0]); view.scrollTop = pan[3] - (e.clientY - pan[1]); });
  window.addEventListener('pointerup', function () { pan = null; view.classList.remove('drag'); });
  document.addEventListener('keydown', function (e) { if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName) || app.hidden) return; if (e.key === '+' || e.key === '=') zoom(1.25); else if (e.key === '-') zoom(.8); else if (e.key === '0') $('#pm-zfit').click(); });
  /* refit when the stage itself changes size; deferred a frame and ignoring scrollbar-only changes so it never loops */
  var vw = 0, vh = 0, raf = 0;
  function onResize() { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { var w = view.offsetWidth, h = view.offsetHeight; if (Math.abs(w - vw) < 2 && Math.abs(h - vh) < 2) return; vw = w; vh = h; applyZoom(); }); }
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(view); else window.addEventListener('resize', onResize);

  function crumb() {
    var sz = S.size === 'custom' ? 'Custom' : S.size;
    $('#pm-ttl').innerHTML = '<span>' + PM.GENDER[S.gender] + '</span><i>/</i><b>' + PM.GARMENTS[S.gid].n + '</b><i>/</i><span>' + sz + '</span><code title="Style code, printed on every piece">' + code() + '</code>' + (S.detail ? '<i>/</i><span title="Forecut detail">' + S.detail + '</span>' : '');
    $('#pm-gname').textContent = PM.GARMENTS[S.gid].n;
  }
  /* rulers and cursor read-out, in the current unit, from the sheet's top-left corner */
  var mouse = null;
  function rulers() {
    var sv = $('#pm-svg svg'); if (!sv || !last) return; var vr = $('#pm-rx').getBoundingClientRect(), hr = $('#pm-ry').getBoundingClientRect(), sr = sv.getBoundingClientRect(), ppc = sr.width / last.W;
    V.ruler($('#pm-rx'), true, sr.left - vr.left, ppc, S.unit, mouse ? mouse[0] - vr.left : null);
    V.ruler($('#pm-ry'), false, sr.top - hr.top, ppc, S.unit, mouse ? mouse[1] - hr.top : null);
    $('#pm-ru').textContent = S.unit;
    var xy = $('#pm-xy'); if (xy) xy.textContent = mouse ? 'X ' + U((mouse[0] - sr.left) / ppc) + '  Y ' + U((mouse[1] - sr.top) / ppc) + ' ' + S.unit : '';
  }
  view.addEventListener('scroll', function () { requestAnimationFrame(rulers); });
  view.addEventListener('mousemove', function (e) { mouse = [e.clientX, e.clientY]; requestAnimationFrame(rulers); });
  view.addEventListener('mouseleave', function () { mouse = null; requestAnimationFrame(rulers); });
  /* A4 page preview, drawn from the same tiling the PDF export uses */
  var TILES = false;
  function tilesSvg(sc, W, H) {
    var T = X.tiles(sc, W, H), g = '';
    T.list.forEach(function (t) { var x = t.x, y = t.y, w = T.cw, h = T.ch;
      g += '<path d="M' + x + ' ' + y + 'h' + w + 'v' + h + 'h-' + w + 'Z" fill="' + (t.blank ? '#1b1d20' : '#e08a5e') + '" fill-opacity="' + (t.blank ? .07 : .035) + '" stroke="' + (t.blank ? '#9da3aa' : '#a9481f') + '" stroke-width=".05" data-l="TILE"/>'
        + '<text x="' + (x + .6) + '" y="' + (y + 1.9) + '" font-size="1.5" font-weight="700" font-family="DM Sans,sans-serif" fill="' + (t.blank ? '#9da3aa' : '#a9481f') + '">' + t.id + '</text>' + (t.blank ? '<text x="' + (x + .6) + '" y="' + (y + 3.1) + '" font-size=".9" font-family="DM Sans,sans-serif" fill="#9da3aa">not printed</text>' : ''); });
    return { g: g, T: T };
  }
  function draw(keepTable) {
    var s = scene(false); last = s; var tl = null, svg = X.svg(s.sc, s.W, s.H, S.unit, { screen: 1, grid: $('#pm-grid').checked ? grid(s.W, s.H) : '' });
    if (TILES) { tl = tilesSvg(s.sc, s.W, s.H); svg = svg.replace('</svg>', tl.g + '</svg>'); }
    var cres = costing(s);
    if (MARK && cres) { var mv = PMC.markerSvg(cres, 'Marker · ' + s.r.label + ' · ' + (S.size === 'custom' ? 'custom' : S.size) + ' · ' + cres.perMarker + ' garment' + (cres.perMarker > 1 ? 's' : '') + ' · width ' + cres.marker.width + ' cm · length ' + (cres.marker.length / 100).toFixed(2) + ' m · efficiency ' + Math.round(cres.marker.eff * 100) + '%' + shrLab()); svg = mv.svg; last = { W: mv.W, H: mv.H, sc: s.sc }; }
    $('#pm-svg').innerHTML = svg;
    applyZoom();
    var T = tl ? tl.T : X.tiles(s.sc, s.W, s.H); $('#pm-tilecount').textContent = T.pages + ' A4 pages (' + T.rows + ' rows × ' + T.cols + ' columns, blanks skipped). Print at 100%.';
    var info = s.r.info, num = function (v) { return typeof v === 'number' ? U(v) + ' ' + S.unit : v; };
    $('#pm-info').innerHTML = Object.keys(info).map(function (k) { return '<div><span>' + k + '</span><b>' + num(info[k]) + '</b></div>'; }).join('') + '<div><span>Sheet</span><b>' + U(s.W) + ' × ' + U(s.H) + ' ' + S.unit + '</b></div>';
    var ck = V.checks(s.r0, S, U, S.gid), ok = ck.filter(function (c) { return c.ok; }).length;
    $('#pm-grade').innerHTML = gradeTable();
    $('#pm-checks').innerHTML = ck.map(function (c) { return '<div class="ckr ' + (c.ok ? 'ok' : 'w') + '">' + IC(c.ok ? 'check' : 'warn') + '<b>' + c.t + '</b><em>' + c.v + '</em><span>' + c.why + '</span></div>'; }).join('');
    var qa = $('#pm-qa'); qa.className = 'qa' + (ok === ck.length ? '' : ' w'); qa.innerHTML = IC(ok === ck.length ? 'check' : 'warn') + (ok === ck.length ? ck.length + '/' + ck.length + ' checks passed' : (ck.length - ok) + ' check' + (ck.length - ok > 1 ? 's' : '') + ' to review');
    var on = s.r.pieces.filter(function (p) { return (S.pc[p.id] || {}).on !== false; }).length;
    $('#pm-spec').innerHTML = [['Style code', code()], ['Garment', PM.GENDER[S.gender] + ' · ' + PM.GARMENTS[S.gid].n], ['Size', S.size === 'custom' ? 'Custom measurements' : S.size + ' (Forecut base chart)'], ['Pieces', on + ' of ' + s.r.pieces.length], ['Allowances', 'seam ' + U(S.sa) + ', hem ' + U(S.hemA) + ' ' + S.unit + (S.sa ? '' : ' (net pattern)')], ['Checks', ok + ' of ' + ck.length + ' passed'], ['Engine', 'Forecut pattern engine ' + VER]].map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
    var tt = TOILE[S.gid + '-' + S.gender]; $('#pm-toile').innerHTML = tt ? '<b>Toile-tested</b> ' + tt : 'This pattern has not yet been sewn and fit-tested by Forecut. Sew a toile in calico before you cut good fabric; when Forecut has tested a style, the date and fit model will show here.';
    $('#pm-status').innerHTML = '<span><b>' + on + '</b> pieces</span><span>Sheet <b>' + U(s.W) + ' × ' + U(s.H) + ' ' + S.unit + '</b></span><span><b>' + T.pages + '</b> A4 pages</span><span>SA <b>' + U(S.sa) + '</b> · Hem <b>' + U(S.hemA) + '</b></span><span class="xy" id="pm-xy"></span>';
    crumb();
    if (!keepTable) pieceTable();
    requestAnimationFrame(rulers);
    FC.save('pm2', S);
  }
  var ICONS = { check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', warn: '<path d="M12 4 2.5 20h19zM12 10v4.5M12 17.5v.01"/>' };
  function IC(k) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[k] + '</svg>'; }
  function units() { $$('#pm-units button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.u === S.unit); }); $$('.pl .u').forEach(function (i) { i.textContent = S.unit; }); }
  function ui(fit) { genderTabs(); detailPicker(); measForm(); optForm(); units(); fabForm(); adjForm(); clientForm(); $('#pm-sa').value = U(S.sa); $('#pm-hemall').value = U(S.hemA); if (fit) ZR = 1; draw(); }
  $$('#pm-units button').forEach(function (b) { b.onclick = function () { S.unit = b.dataset.u; ui(); }; });
  $('#pm-sa').oninput = function () { S.sa = cm(parseFloat(this.value) || 0); draw(); };
  $('#pm-hemall').oninput = function () { S.hemA = cm(parseFloat(this.value) || 0); draw(); };
  $('#pm-apply').onclick = function () { Object.keys(S.pc).forEach(function (k) { delete S.pc[k].sa; delete S.pc[k].hem; }); draw(); toast('Allowances applied to every piece.'); };
  $('#pm-nosa').onclick = function () { S.sa = 0; S.hemA = 0; Object.keys(S.pc).forEach(function (k) { delete S.pc[k].sa; delete S.pc[k].hem; }); ui(); toast('Net pattern: allowances removed.'); };
  $('#pm-resetnames').onclick = function () { Object.keys(S.pc).forEach(function (k) { delete S.pc[k].name; }); draw(); };
  $('#pm-gridb').onclick = function () { var c = $('#pm-grid'); c.checked = !c.checked; this.setAttribute('aria-pressed', c.checked); draw(true); };
  $('#pm-grid').onchange = function () { draw(true); };
  $('#pm-tilesb').onclick = function () { TILES = !TILES; this.setAttribute('aria-pressed', TILES); draw(true); if (TILES) toast($('#pm-tilecount').textContent); };
  $('#pm-qa').onclick = function () { $('.rt button[data-t=checks]').click(); };
  /* hide or show the side panels so the sheet can use the full width */
  (function () {
    var pb = $('.pbody'), st = {}; try { st = JSON.parse(localStorage.getItem('pm-sides') || '{}'); } catch (e) {}
    function set(k, v) {
      var b = $(k === 'l' ? '#pm-hidel' : '#pm-hider'), side = k === 'l' ? 'left' : 'right';
      pb.classList.toggle('no' + k, v); b.setAttribute('aria-pressed', v);
      b.title = (v ? 'Show the ' : 'Hide the ') + side + ' panel'; b.setAttribute('aria-label', b.title);
      st[k] = v; try { localStorage.setItem('pm-sides', JSON.stringify(st)); } catch (e) {}
    }
    if (!pb || !$('#pm-hidel')) return;
    set('l', !!st.l); set('r', !!st.r);
    $('#pm-hidel').onclick = function () { set('l', !pb.classList.contains('nol')); };
    $('#pm-hider').onclick = function () { set('r', !pb.classList.contains('nor')); };
  })();
  /* right panel tabs */
  $$('.rt button').forEach(function (b) { b.onclick = function () { $$('.rt button').forEach(function (x) { x.setAttribute('aria-selected', x === b); }); $$('.pr [data-tp]').forEach(function (p) { p.hidden = p.dataset.tp !== b.dataset.t; }); }; });
  /* export menu */
  var menu = $('#pm-menu'), eb = $('#pm-exp');
  function menuOpen(v) { menu.hidden = !v; eb.setAttribute('aria-expanded', v); if (v) menu.querySelector('button').focus(); }
  eb.onclick = function (e) { e.stopPropagation(); menuOpen(menu.hidden); };
  document.addEventListener('click', function (e) { if (!menu.hidden && !menu.contains(e.target)) menuOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { menuOpen(false); eb.focus(); } });
  var tt = null;
  function toast(t) { var m = $('#pm-msg'); m.textContent = t; m.hidden = false; clearTimeout(tt); tt = setTimeout(function () { m.hidden = true; }, 4500); }
  function fname(ext) { return 'forecut-' + (built ? built.label : 'pattern').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + String(S.size).toLowerCase() + '.' + ext; }
  function dl(f) { return function () { menuOpen(false); f(); }; }
  $('#pm-dl-svg').onclick = dl(function () { var s = scene(true); FC.download(fname('svg'), X.svg(s.sc, s.W, s.H, S.unit, { title: s.title }), 'image/svg+xml'); toast('SVG downloaded at true scale.'); });
  $('#pm-dl-dxf').onclick = dl(function () { var s = scene(true); FC.download(fname('dxf'), X.dxf(s.sc, s.W, s.H, S.unit === 'in' ? 'in' : 'mm'), 'application/dxf'); toast('DXF downloaded (' + (S.unit === 'in' ? 'inches' : 'millimetres') + ').'); });
  /* ---------- fabric, costing, marker ---------- */
  var MARK = false, COST = null, PMC = window.PMC;
  function money(v) { return '₹' + Math.round(v).toLocaleString('en-IN'); }
  function money2(v) { return '₹' + (Math.round(v * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function fabForm() {
    $('#pm-fw').value = String(+S.fab.fw || 0); $('#pm-shl').value = S.fab.shl; $('#pm-shw').value = S.fab.shw; $('#pm-st').value = S.fab.st; $('#pm-oneway').checked = !!S.fab.oneWay; $('#pm-strow').hidden = !knit();
  }
  $('#pm-fw').onchange = function () { S.fab.fw = +this.value; draw(true); };
  $('#pm-shl').oninput = function () { S.fab.shl = Math.max(0, Math.min(15, parseFloat(this.value) || 0)); draw(true); };
  $('#pm-shw').oninput = function () { S.fab.shw = Math.max(0, Math.min(15, parseFloat(this.value) || 0)); draw(true); };
  $('#pm-st').oninput = function () { S.fab.st = Math.max(0, Math.min(100, parseFloat(this.value) || 0)); draw(true); };
  $('#pm-oneway').onchange = function () { S.fab.oneWay = this.checked; draw(true); };
  $('#pm-nestb').onclick = function () { NEST = !NEST; this.setAttribute('aria-pressed', NEST); if (NEST && MARK) { MARK = false; $('#pm-markb').setAttribute('aria-pressed', false); } draw(true); if (NEST) toast('Size range: every size graded from ' + (S.size === 'custom' ? 'your measurements' : 'size ' + baseSize()) + ', stacked on each piece.'); };
  function gradeTable() {
    var szs = Object.keys(chart()), bs = baseSize(), rows = [], body = { bust: 'Bust / chest', waist: 'Waist', hip: 'Hip', shoulder: 'Shoulder', nape: 'Back length', sleeve: 'Sleeve length', neck: 'Neck', rise: 'Rise', outseam: 'Outseam' }, ms = measSet();
    var built2 = szs.map(function (sz) { try { return PM.build(S.gid, S.gender, gradeM(sz), OO()).info; } catch (e) { return {}; } });
    Object.keys(body).forEach(function (k) { if (ms.indexOf(k) > -1) rows.push([body[k] + ' (body)', szs.map(function (sz) { return gradeM(sz)[k]; })]); });
    Object.keys(built2[0] || {}).forEach(function (k) { if (typeof built2[0][k] === 'number' && !/minus|check|lowered|ease|extension/i.test(k)) rows.push([k, built2.map(function (i) { return i[k]; })]); });
    var bi = szs.indexOf(bs);
    return '<div class="gt"><table><tr><th></th>' + szs.map(function (z, i) { return '<th' + (i === bi ? ' class="b"' : '') + '>' + z + '</th>'; }).join('') + '<th>Step</th></tr>'
      + rows.map(function (r) { var v = r[1], st = v.length > 1 ? (v[v.length - 1] - v[0]) / (v.length - 1) : 0; return '<tr><td>' + r[0] + '</td>' + v.map(function (x, i) { return '<td' + (i === bi ? ' class="b"' : '') + '>' + (x === undefined ? '–' : U(x)) + '</td>'; }).join('') + '<td>' + (st >= 0 ? '+' : '') + U(st) + '</td></tr>'; }).join('') + '</table></div><p class="hint2">Graded from ' + (S.size === 'custom' ? 'your measurements (nearest chart size ' + bs + ')' : 'size ' + bs) + ' using the chart\'s steps between sizes. Values in ' + S.unit + '; Step is the average change per size.</p>';
  }
  $('#pm-dl-aama').onclick = dl(function () { var s = scene(true); FC.download(fname('aama.dxf'), X.aama(s.pcs, { style: code(), size: S.size === 'custom' ? 'CUSTOM' : S.size, unit: S.unit === 'in' ? 'in' : 'mm', H: s.H }), 'application/dxf'); toast('AAMA/ASTM DXF downloaded for pattern CAD import.'); });
  $('#pm-dl-gdxf').onclick = dl(function () { var s = scene('nest'); FC.download(fname('all-sizes.dxf'), X.dxf(s.sc, s.W, s.H, S.unit === 'in' ? 'in' : 'mm'), 'application/dxf'); toast('Graded DXF downloaded: one layer per size.'); });
  $('#pm-dl-gpdf').onclick = dl(function () { var s = scene('nest'), r = X.pdf(s.sc, s.W, s.H, 'sheet', { title: s.title }); FC.download(fname('all-sizes.pdf'), r.blob); toast('Graded full-size PDF downloaded.'); });
  $('#pm-markb').onclick = function () { MARK = !MARK; this.setAttribute('aria-pressed', MARK); if (MARK && TILES) { TILES = false; $('#pm-tilesb').setAttribute('aria-pressed', false); } if (MARK && NEST) { NEST = false; $('#pm-nestb').setAttribute('aria-pressed', false); } ZR = 1; draw(true); if (MARK && COST) toast('Marker: ' + (COST.marker.length / 100).toFixed(2) + ' m for ' + COST.perMarker + ' garment' + (COST.perMarker > 1 ? 's' : '') + ' on ' + COST.marker.width + ' cm fabric, ' + Math.round(COST.marker.eff * 100) + '% efficiency.'); };
  function costing(s) {
    var cfg = Object.assign({}, S.cost, { width: fabW(), oneWay: S.fab.oneWay, smv: +S.cost.smv || PMC.SMV[S.gid] });
    try { COST = PMC.cost(s.r, S, cfg, S.gid); } catch (e) { COST = null; }
    costForm(); return COST;
  }
  var CF = [ // [key, label, suffix, step, group, show-if]
    ['fp', 'Main fabric price', '₹/m', 1, 'Fabric'], ['per', 'Garments per marker', '', 1, 'Fabric'], ['endloss', 'End loss and splicing', '%', .5, 'Fabric'],
    ['lp', 'Lining price', '₹/m', 1, 'Fabric', 'lining'], ['ip', 'Fusing price', '₹/m', 1, 'Fabric', 'fusing'], ['rp', 'Rib price', '₹/m', 1, 'Fabric', 'rib'],
    ['bp', 'Button price, each', '₹', .1, 'Trims', 'buttons'], ['zp', 'Zip price', '₹', .5, 'Trims', 'zip'], ['ep', 'Elastic price', '₹/m', .5, 'Trims', 'elastic'], ['tp', 'Thread price per cone', '₹', 1, 'Trims'], ['cone', 'Metres per cone', 'm', 100, 'Trims'], ['lab', 'Labels, tags and other trims', '₹', 1, 'Trims'],
    ['smv', 'SMV (sewing minutes)', 'min', .5, 'Making'], ['cpm', 'Cost per minute', '₹', .1, 'Making'], ['eff', 'Line efficiency', '%', 1, 'Making'], ['wash', 'Washing / finishing', '₹', 1, 'Making'], ['pack', 'Packing', '₹', 1, 'Making'],
    ['oh', 'Overheads and rejects', '%', 1, 'Price'], ['mg', 'Your margin on cost', '%', 1, 'Price'], ['rm', 'Retailer / marketplace margin', '%', 1, 'Price'],
    ['qty', 'Order quantity', 'pcs', 1, 'Order'], ['wastage', 'Cutting wastage', '%', .5, 'Order']];
  var CO = { Fabric: 1, Trims: 0, Making: 0, Price: 0, Order: 0 };
  function costForm() {
    var c = COST, el = $('#pm-cost'); if (!el) return; if (!c) { el.innerHTML = '<p class="note">Costing is not available for this pattern.</p>'; return; }
    var has = { lining: c.lines.some(function (l) { return l[0] === 'Lining'; }), fusing: c.lines.some(function (l) { return /Fusing/.test(l[0]); }), rib: c.lines.some(function (l) { return l[0] === 'Rib'; }), buttons: c.buttons > 0, zip: c.zip > 0, elastic: c.lines.some(function (l) { return l[0] === 'Elastic'; }) };
    var act = document.activeElement && el.contains(document.activeElement) ? document.activeElement.dataset.c : null;
    var h = '<div class="cst"><div class="ctiles"><div class="ctile hi"><span>Cost per garment</span><b>' + money(c.total) + '</b><small>incl. ' + S.cost.oh + '% overheads</small></div><div class="ctile hi"><span>Suggested MRP</span><b>' + money(c.mrp) + '</b><small>incl. GST ' + c.gst + '%</small></div>'
      + '<div class="ctile"><span>Fabric per garment</span><b>' + (c.fabricPerGarment).toFixed(2) + ' m</b><small>' + c.marker.width + ' cm wide' + shrLab().replace(' · incl. ', ', ') + '</small></div><div class="ctile"><span>Marker efficiency</span><b>' + Math.round(c.marker.eff * 100) + '%</b><small>' + (c.marker.length / 100).toFixed(2) + ' m for ' + c.perMarker + ' garment' + (c.perMarker > 1 ? 's' : '') + '</small></div></div>';
    if (c.marker.tooWide.length) h += '<p class="note" style="color:var(--wa)">Too wide for this fabric: ' + c.marker.tooWide.join(', ') + '. Choose a wider fabric.</p>';
    var groups = {}; CF.forEach(function (f) { if (f[5] && !has[f[5]]) return; (groups[f[4]] = groups[f[4]] || []).push(f); });
    var sumTxt = { Fabric: money(c.lines.filter(function (l) { return /fabric|Lining|Fusing|Rib/i.test(l[0]); }).reduce(function (s, l) { return s + l[4]; }, 0)), Trims: money(c.lines.filter(function (l) { return /Button|Zip|Elastic|thread|Labels/i.test(l[0]); }).reduce(function (s, l) { return s + l[4]; }, 0)), Making: money(c.cmt + (+S.cost.wash || 0) + (+S.cost.pack || 0)), Price: money(c.sell) + ' ex GST', Order: S.cost.qty + ' pcs' };
    Object.keys(groups).forEach(function (g) { h += '<details data-g="' + g + '"' + (CO[g] ? ' open' : '') + '><summary>' + g + '<em>' + sumTxt[g] + '</em></summary><div>';
      groups[g].forEach(function (f) { var v = f[0] === 'smv' ? (+S.cost.smv || PMC.SMV[S.gid]) : S.cost[f[0]], extra = f[0] === 'bp' ? '<small>' + c.buttons + ' buttons from the pattern</small>' : f[0] === 'tp' ? '<small>' + Math.round(c.threadM) + ' m thread per garment</small>' : f[0] === 'smv' && !+S.cost.smv ? '<small>typical for this garment</small>' : '';
        if (f[0] === 'per') h += '<label class="row"><span>' + f[1] + '<small>more garments nest better</small></span><select data-c="per">' + [1, 2, 3, 4].map(function (n) { return '<option' + (n === +S.cost.per ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></label>';
        else h += '<label class="row"><span>' + f[1] + extra + '</span><span class="uin"><input type="number" min="0" step="' + f[3] + '" data-c="' + f[0] + '" value="' + v + '"><i>' + f[2] + '</i></span></label>'; });
      if (g === 'Price') h += '<label class="row"><span>GST<small>garments: 5% up to ₹2,500 a piece, 18% above</small></span><select data-c="gst">' + [['auto', 'Auto'], ['5', '5%'], ['18', '18%'], ['12', '12%'], ['0', '0%']].map(function (o) { return '<option value="' + o[0] + '"' + (String(S.cost.gst) === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label>';
      h += '</div></details>'; });
    var mx = Math.max.apply(null, c.lines.map(function (l) { return l[4]; })) || 1;
    h += '<details open data-g="bk"><summary>Cost breakdown per garment<em>' + money2(c.total) + '</em></summary><div><table class="bk">' + c.lines.map(function (l) { var q = l[2] === 'SMV' ? l[1].toFixed(1) + ' min × ' + money2(l[3]) : l[2] === 'set' || l[2] === 'pc' ? '' : (l[2] === 'pcs' ? l[1] : l[1].toFixed(2)) + ' ' + l[2] + ' × ' + money2(l[3]);
        return '<tr><td>' + l[0] + (q ? '<small>' + q + '</small>' : '') + '<div class="bar"><i style="width:' + Math.max(2, l[4] / mx * 100).toFixed(0) + '%"></i></div></td><td>' + money2(l[4]) + '</td></tr>'; }).join('')
      + '<tr class="t"><td>Direct cost</td><td>' + money2(c.direct) + '</td></tr><tr><td>Overheads and rejects ' + S.cost.oh + '%</td><td>' + money2(c.overheads) + '</td></tr><tr class="t"><td>Total cost</td><td>' + money2(c.total) + '</td></tr>'
      + '<tr><td>Your selling price (ex GST)<small>+' + S.cost.mg + '% margin · GST at this price ' + c.sellGst + '%</small></td><td>' + money2(c.sell) + '</td></tr><tr><td>Retail price (ex GST)<small>+' + S.cost.rm + '% retailer margin</small></td><td>' + money2(c.retail) + '</td></tr><tr class="g"><td>MRP incl. GST ' + c.gst + '%<small>rounded to a price point</small></td><td>' + money(c.mrp) + '</td></tr></table></div></details>';
    var o = c.order; h += '<details open data-g="ord"><summary>For ' + c.qty + ' pieces<em>' + money(o.cost) + '</em></summary><div><table class="bk"><tr><td>Main fabric to buy<small>incl. ' + S.cost.wastage + '% cutting wastage</small></td><td>' + o.fabric.toFixed(1) + ' m</td></tr>'
      + (o.lining ? '<tr><td>Lining</td><td>' + o.lining.toFixed(1) + ' m</td></tr>' : '') + (o.fusing ? '<tr><td>Fusing</td><td>' + o.fusing.toFixed(1) + ' m</td></tr>' : '') + (o.rib ? '<tr><td>Rib</td><td>' + o.rib.toFixed(1) + ' m</td></tr>' : '')
      + (o.buttons ? '<tr><td>Buttons</td><td>' + o.buttons + '</td></tr>' : '') + (o.zips ? '<tr><td>Zips</td><td>' + o.zips + '</td></tr>' : '') + '<tr><td>Thread cones</td><td>' + o.thread + '</td></tr>'
      + '<tr class="t"><td>Total cost</td><td>' + money(o.cost) + '</td></tr><tr><td>Sales value at your price</td><td>' + money(o.sales) + '</td></tr><tr class="g"><td>Gross margin</td><td>' + money(o.sales - o.cost) + '</td></tr></table></div></details>';
    h += '<div class="acts2"><button type="button" class="xbtn" id="pm-cview">' + (MARK ? 'Show pattern' : 'View marker') + '</button><button type="button" class="xbtn" id="pm-csheet">Cost sheet</button></div>'
      + '<p class="note">The marker is laid automatically with the grain along the fabric length and pieces turned end to end where allowed. A marker from a CAD system or an experienced marker maker is usually a few per cent shorter. Rates are examples: enter your own. GST rules change; confirm the current rate.</p></div>';
    el.innerHTML = h;
    $$('#pm-cost details[data-g]').forEach(function (d) { d.ontoggle = function () { CO[d.dataset.g] = d.open ? 1 : 0; }; });
    $$('#pm-cost [data-c]').forEach(function (e) { e.onchange = e.oninput = function () { var k = e.dataset.c; S.cost[k] = k === 'gst' ? e.value : (parseFloat(e.value) || 0); clearTimeout(costing.t); costing.t = setTimeout(function () { draw(true); var f = $('#pm-cost [data-c="' + k + '"]'); if (f && f.tagName === 'INPUT') { f.focus(); var v = f.value; f.value = ''; f.value = v; } }, e.tagName === 'SELECT' ? 0 : 350); }; });
    $('#pm-cview').onclick = function () { $('#pm-markb').click(); }; $('#pm-csheet').onclick = function () { $('#pm-dl-cost').click(); };
    if (act) { var f = $('#pm-cost [data-c="' + act + '"]'); if (f) f.focus(); }
  }
  function markerScene() { var sc = []; COST.marker.placed.forEach(function (pl) { pl.polys.forEach(function (p) { sc.push({ k: 'poly', p: p, c: 1, w: .07, col: '#1c1714', L: 'CUT' }); }); var q = pl.polys[0], cx = 0, cy = 0; q.forEach(function (z) { cx += z[0]; cy += z[1]; }); sc.push({ k: 'text', x: cx / q.length, y: cy / q.length, s: 1.4, t: pl.it.comp + (pl.it.mirror ? ' (R)' : ''), a: 'middle', L: 'TEXT' }); });
    sc.push({ k: 'poly', p: [[0, 0], [COST.marker.length, 0], [COST.marker.length, COST.marker.width], [0, COST.marker.width]], c: 1, w: .05, L: 'MARK' }); return sc; }
  /* ---------- tech pack / style pack ---------- */
  var TOL = [[/chest|bust/i, 1.5], [/waist/i, 1.5], [/hip|seat/i, 1.5], [/length|outseam|inseam/i, 1], [/shoulder/i, .5], [/sleeve/i, 1], [/armhole/i, 1], [/neck/i, .5], [/hem|mohri/i, 1.5], [/crotch/i, 1]];
  function tol(k) { for (var i = 0; i < TOL.length; i++) if (TOL[i][0].test(k)) return TOL[i][1]; return 1; }
  function construction(r) {
    var ids = r.pieces.filter(function (p) { return (S.pc[p.id] || {}).on !== false; }).map(function (p) { return p.id; }), has = function (i) { return ids.indexOf(i) > -1; }, st = [], g = S.gid;
    var darts = r.pieces.some(function (p) { return p.marks.some(function (k) { return k.t === 'dart'; }); });
    var fuse = r.pieces.some(function (p) { return /interfacing/i.test(p.cut || ''); }); st.push('Cut all pieces as listed, with notches and drill holes marked.' + (fuse ? ' Fuse the interfacing pieces before sewing.' : ''));
    if (['salwar', 'patiala'].indexOf(g) > -1) { st.push('Sew a kali to the inside edge of each leg panel, matching the notch at the kali point.'); if (g === 'patiala') st.push('Join the front and back leg halves at the outer side seams. Fold the pleats at the top towards the side and tack them.'); st.push('Join the two kalis at the centre to form the crotch, then sew the inside leg seams.'); st.push('Fold and stitch the 4 cm casing at the top; leave an opening for the drawstring.'); st.push(g === 'patiala' ? 'Gather or pleat the leg opening to the mohri band and attach the band.' : 'Hem the leg openings (mohri).'); }
    else if (['trousers', 'churidar', 'gharara'].indexOf(g) > -1) {
      if (g === 'churidar') st.push('Handle the bias-cut legs gently; stay-stitch the waist to stop it stretching.');
      if (darts) st.push('Sew the darts or fold the pleats; press darts towards the centre.');
      if (S.o.cargo) st.push('Make and attach the cargo pockets at the side of the legs.');
      if (S.o.wtype !== 'elastic' && g === 'trousers') st.push('Insert the fly zip at centre front.');
      st.push('Sew the inside leg seams, stretching the back slightly to match the front (the back is drafted 0.5 cm shorter).', 'Sew the crotch seam from centre back to centre front in one, then the outside leg seams.');
      if (g === 'gharara') st.push('Join the flare pieces into a tube for each leg, gather to the knee seam and attach; cover the seam with gota or a band if wanted.');
      st.push(S.o.wtype === 'elastic' || g !== 'trousers' ? 'Fold the waist casing and insert elastic or a drawstring.' : 'Attach the waistband, interfaced, and finish with a hook or button.');
      if (g === 'churidar') st.push('Finish the leg opening with a 10 cm slit and hooks or a tight hem; the extra length ruches at the ankle.'); else if (has('cuff')) st.push('Attach the rib ankle cuffs.'); else st.push('Hem the legs.');
    } else if (g === 'skirt' || g === 'lehenga') {
      if (darts) st.push('Sew the darts and press them towards the centre.');
      if (g === 'lehenga') st.push('Join the kalis, alternating their direction, into a ring; leave a side placket open.'); else st.push('Insert the zip at centre back to the notch, then sew the side seams.');
      st.push('Attach the waistband (or a drawstring casing for a lehenga).', 'Hem; for a lehenga add can-can or a facing at the hem if wanted.');
    } else {
      st.push('Stay-stitch the necklines and the armholes.');
      if (darts) st.push('Sew the darts: bust darts pressed down, waist and shoulder darts pressed towards the centre.');
      if (has('yoke')) st.push('Fold the back box pleat and attach the yoke (outer and lining) to the back; sandwich the fronts at the shoulder.'); else st.push('Join the shoulder seams.');
      if (g === 'angrakha') st.push('Face the wrap edges of the over and under fronts with 3 cm bias. Attach the ties at the tie points.');
      if (has('facing')) st.push('Attach the front facings, understitch and press.');
      if (has('pocket') || has('welt')) st.push(has('welt') ? 'Make the welt pockets on the fronts.' : 'Attach the patch pocket on the left front at the drill holes.');
      if (has('band') || has('collar')) st.push(has('collar') ? 'Make the collar and collar band, then attach to the neckline matching centre back and the shoulder notches.' : 'Make the band collar and attach to the neckline matching centre back and the shoulder notches.');
      else if (has('neckrib')) st.push('Join the neck rib into a ring, fold and attach to the neckline, stretching it evenly.'); else if (has('hood')) st.push('Join the hood halves and attach to the neckline.'); else st.push('Face or bind the neckline.');
      if (has('sleeve')) st.push((S.o.sleeve === 'puff' ? 'Gather the sleeve cap between the notches. ' : 'Ease the sleeve cap between the notches. ') + 'Set the sleeves into the armholes: single notch to the front, double notch to the back.');
      st.push('Sew the side seams and underarm seams in one' + (+S.o.slit ? ', stopping at the slit notch; finish the slits' : '') + (g === 'anarkali' ? ', leaving a side opening for a zip or hooks' : '') + '.');
      if (g === 'anarkali') st.push('Join the kalis, alternating their direction, and attach to the bodice waist, easing evenly.');
      if (has('skirt')) st.push('Gather the skirt to the bodice waist and attach.'); if (has('peplum')) st.push('Attach the peplum to the waist.');
      if (has('cuff')) st.push('Attach the cuffs' + (S.o.sleeve === 'shirt' ? ', with sleeve plackets' : '') + '.');
      if (has('hemband')) st.push('Attach the rib hem band.'); else st.push('Hem with a ' + U(S.hemA) + ' ' + S.unit + ' hem allowance.');
      if (r.pieces.some(function (p) { return p.marks.some(function (k) { return k.t === 'button'; }); })) st.push('Make the buttonholes and sew the buttons.');
    }
    st.push('Press, trim threads and attach the main label at centre back and the size and care label at the left side seam.');
    return st;
  }
  function gradeRows() { var szs = Object.keys(chart()), rows = [], b = szs.map(function (sz) { try { return PM.build(S.gid, S.gender, gradeM(sz), OO()).info; } catch (e) { return {}; } });
    Object.keys(b[0] || {}).forEach(function (k) { if (typeof b[0][k] === 'number' && !/minus|check|lowered|ease|extension|walk/i.test(k)) rows.push([k, b.map(function (i) { return i[k]; })]); });
    return { sizes: szs, rows: rows }; }
  $('#pm-dl-tech').onclick = dl(function () { var s = scene(true); if (!COST) costing(s); var c = COST, w = window.open('', '_blank'); if (!w) { toast('Allow pop-ups to open the tech pack.'); return; }
    var G = PM.GARMENTS[S.gid], gr = gradeRows(), bs = baseSize(), today = new Date().toISOString().slice(0, 10), onP = s.r.pieces.filter(function (p) { return (S.pc[p.id] || {}).on !== false; });
    var sheet = X.svg(s.sc, s.W, s.H, S.unit, { title: s.title }).replace(/ width="[^"]*" height="[^"]*"/, ''), mk = c ? PMC.markerSvg(c, '').svg : '';
    var pom = '<table><tr><th>Point of measure (finished)</th>' + gr.sizes.map(function (z) { return '<th' + (z === bs ? ' class="b"' : '') + '>' + z + '</th>'; }).join('') + '<th>Tol. ±</th></tr>' + gr.rows.map(function (r) { return '<tr><td>' + r[0] + '</td>' + r[1].map(function (v, i) { return '<td' + (gr.sizes[i] === bs ? ' class="b"' : '') + '>' + (v === undefined ? '–' : U(v)) + '</td>'; }).join('') + '<td>' + U(tol(r[0])) + '</td></tr>'; }).join('') + '</table>';
    var pcs = '<table><tr><th>#</th><th>Piece</th><th>Cut</th><th>Seam / hem allowance</th></tr>' + onP.map(function (p, i) { var st = S.pc[p.id] || {}, sa = st.sa !== undefined ? st.sa : S.sa, ha = st.hem !== undefined ? st.hem : (p.defHem !== undefined ? p.defHem : S.hemA); return '<tr><td>' + String(i + 1).padStart(2, '0') + '</td><td>' + (st.name || p.auto) + '</td><td>' + p.cut + (p.notes ? '<br><small>' + p.notes + '</small>' : '') + '</td><td>' + U(sa) + ' / ' + U(ha) + ' ' + S.unit + '</td></tr>'; }).join('') + '</table>';
    var bom = c ? '<table><tr><th>Material</th><th>Per garment</th><th>For ' + c.qty + ' pcs</th></tr><tr><td>Main fabric, ' + c.marker.width + ' cm wide' + (S.fab.oneWay ? ' (one-way)' : '') + '</td><td>' + c.fabricPerGarment.toFixed(2) + ' m</td><td>' + c.order.fabric.toFixed(1) + ' m</td></tr>'
      + c.lines.filter(function (l) { return !/Main fabric|Cutting|Washing|Packing/.test(l[0]); }).map(function (l) { return '<tr><td>' + l[0] + '</td><td>' + (l[2] === 'set' ? '1 set' : (l[2] === 'pcs' ? l[1] : l[1].toFixed(2)) + ' ' + l[2]) + '</td><td>' + (l[2] === 'pcs' ? Math.ceil(l[1] * c.qty * (1 + S.cost.wastage / 100)) : l[2] === 'set' ? c.qty + ' sets' : (l[1] * c.qty * (1 + S.cost.wastage / 100)).toFixed(1) + ' ' + l[2]) + '</td></tr>'; }).join('') + '</table>' : '';
    var steps = '<ol>' + construction(s.r).map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol>';
    var css = 'body{font:12.5px/1.5 Helvetica,Arial,sans-serif;color:#1c1714;margin:26px}h1{font-size:24px;margin:2px 0 6px}h2{font-size:15px;margin:22px 0 6px;border-bottom:2px solid #1c1714;padding-bottom:4px}.k{color:#a9481f;font-weight:700;letter-spacing:.1em;font-size:11px}table{width:100%;border-collapse:collapse;margin:6px 0}td,th{padding:5px 7px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top}th{background:#f4f1ea;font-size:11.5px}td.b,th.b{background:#fbeee6;font-weight:700}.meta{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0}.meta div{border:1px solid #ddd;border-radius:6px;padding:8px}.meta b{display:block;font-size:14px}.pg{page-break-before:always}.svg svg{width:100%;height:auto;border:1px solid #ddd}small{color:#666}ol li{margin:0 0 5px}.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px}.sign div{border-top:1px solid #1c1714;padding-top:5px;font-size:11px;color:#555}@media print{button{display:none}}';
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Tech pack ' + code() + '</title><style>' + css + '</style></head><body>'
      + '<div class="k">FORECUT · TECH PACK' + (S.detail ? ' · STYLE PACK' : '') + '</div><h1>' + s.r.label + '</h1><div>' + code() + ' · ' + PM.GENDER[S.gender] + ' · base size ' + (S.size === 'custom' ? 'custom (' + bs + ')' : bs) + ' · size range ' + gr.sizes[0] + '–' + gr.sizes[gr.sizes.length - 1] + ' · ' + today + '</div>'
      + (S.detail ? '<p>From the Forecut detail <b>' + S.detail + '</b>. See the detail on forecut.in for the trend context.</p>' : '')
      + '<div class="meta"><div>Pieces<b>' + onP.length + '</b></div><div>Fabric per garment<b>' + (c ? c.fabricPerGarment.toFixed(2) + ' m' : '–') + '</b><small>' + (c ? c.marker.width + ' cm wide' : '') + '</small></div><div>Cost per garment<b>' + (c ? money(c.total) : '–') + '</b></div><div>Suggested MRP<b>' + (c ? money(c.mrp) : '–') + '</b><small>' + (c ? 'incl. GST ' + c.gst + '%' : '') + '</small></div></div>'
      + '<h2>Fabric and finishing</h2><table><tr><td>Seam allowance</td><td>' + U(S.sa) + ' ' + S.unit + ' (hem ' + U(S.hemA) + ' ' + S.unit + ')</td></tr><tr><td>Shrinkage built into the pattern</td><td>length ' + (+S.fab.shl || 0) + '%, width ' + (+S.fab.shw || 0) + '%</td></tr>' + (Object.keys(S.adj).some(function (k) { return +S.adj[k]; }) ? '<tr><td>Fit adjustments</td><td>' + ADJ.filter(function (a) { return +S.adj[a[0]]; }).map(function (a) { return a[1] + ' ' + U(S.adj[a[0]]) + ' ' + S.unit; }).join(', ') + '</td></tr>' : '') + '<tr><td>Checks</td><td>' + $('#pm-qa').textContent + '</td></tr></table>'
      + '<h2>Points of measure, graded (' + S.unit + ')</h2>' + pom
      + '<h2>Pieces</h2>' + pcs + '<h2>Bill of materials</h2>' + bom
      + '<h2 class="pg">Construction sequence</h2>' + steps
      + '<h2>Pattern</h2><div class="svg">' + sheet + '</div>' + (mk ? '<h2>Marker</h2><div>' + (c.marker.length / 100).toFixed(2) + ' m for ' + c.perMarker + ' garment(s) on ' + c.marker.width + ' cm fabric · efficiency ' + Math.round(c.marker.eff * 100) + '%</div><div class="svg">' + mk + '</div>' : '')
      + '<h2>Approval</h2><div class="sign"><div>Designer · date</div><div>Pattern maker · date</div><div>Production · date</div></div>'
      + '<p><small>Generated with the Forecut pattern maker (forecut.in). Block patterns for sampling: sew a toile and approve the fit before production.</small></p><button onclick="print()">Print or save as PDF</button></body></html>');
    w.document.close(); toast('Tech pack opened in a new tab.'); });
  $('#pm-dl-mdxf').onclick = dl(function () { scene(true); if (!COST) return; FC.download(fname('marker.dxf'), X.dxf(markerScene(), COST.marker.length, COST.marker.width, S.unit === 'in' ? 'in' : 'mm'), 'application/dxf'); toast('Marker DXF downloaded.'); });
  $('#pm-dl-csv').onclick = dl(function () { if (!COST) return; var c = COST, rows = [['Forecut cost sheet', code(), PM.GARMENTS[S.gid].n, S.size], [], ['Item', 'Quantity', 'Unit', 'Rate (INR)', 'Amount (INR)']].concat(c.lines.map(function (l) { return [l[0], l[1].toFixed(3), l[2], l[3].toFixed(3), l[4].toFixed(2)]; }))
      .concat([[], ['Direct cost', '', '', '', c.direct.toFixed(2)], ['Overheads and rejects ' + S.cost.oh + '%', '', '', '', c.overheads.toFixed(2)], ['Total cost', '', '', '', c.total.toFixed(2)], ['Your selling price ex GST', '', '', '', c.sell.toFixed(2)], ['Retail price ex GST', '', '', '', c.retail.toFixed(2)], ['MRP incl GST ' + c.gst + '%', '', '', '', c.mrp], [],
        ['Fabric width (cm)', c.marker.width], ['Fabric per garment (m)', c.fabricPerGarment.toFixed(3)], ['Marker length (m)', (c.marker.length / 100).toFixed(3)], ['Garments per marker', c.perMarker], ['Marker efficiency %', (c.marker.eff * 100).toFixed(1)], ['Order quantity', c.qty], ['Fabric to buy (m)', c.order.fabric.toFixed(1)], ['Order cost (INR)', c.order.cost.toFixed(0)]]);
    FC.download(fname('cost.csv'), rows.map(function (r) { return r.map(function (v) { v = String(v === undefined ? '' : v); return /[",]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\n'), 'text/csv'); toast('Cost sheet CSV downloaded.'); });
  $('#pm-dl-cost').onclick = dl(function () { var s = scene(true); if (!COST) return; var c = COST, mv = PMC.markerSvg(c, ''), w = window.open('', '_blank'); if (!w) { toast('Allow pop-ups to open the cost sheet.'); return; }
    var rows = c.lines.map(function (l) { return '<tr><td>' + l[0] + '</td><td>' + (l[2] === 'set' || l[2] === 'pc' ? '' : (l[2] === 'pcs' ? l[1] : l[1].toFixed(2)) + ' ' + l[2]) + '</td><td>' + (l[2] === 'set' || l[2] === 'pc' ? '' : money2(l[3])) + '</td><td>' + money2(l[4]) + '</td></tr>'; }).join('');
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Cost sheet ' + code() + '</title><style>body{font:13px/1.45 Helvetica,Arial,sans-serif;color:#1c1714;margin:28px}h1{font-size:20px;margin:0 0 4px}.k{color:#a9481f;font-weight:700;letter-spacing:.08em;font-size:11px}table{width:100%;border-collapse:collapse;margin:10px 0}td,th{padding:6px 8px;border-bottom:1px solid #ddd;text-align:left}td:last-child,th:last-child{text-align:right}tr.t td{font-weight:700;border-top:2px solid #1c1714}.g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}.g div{border:1px solid #ddd;border-radius:6px;padding:8px}.g b{display:block;font-size:17px}.m svg{width:100%;height:auto;border:1px solid #ddd}small{color:#666}@media print{button{display:none}}</style></head><body>'
      + '<div class="k">FORECUT · COST SHEET</div><h1>' + s.r.label + '</h1><div>' + code() + ' · size ' + S.size + ' · ' + PM.GENDER[S.gender] + ' · ' + new Date().toISOString().slice(0, 10) + shrLab() + '</div>'
      + '<div class="g"><div>Cost per garment<b>' + money2(c.total) + '</b></div><div>Your price (ex GST)<b>' + money2(c.sell) + '</b></div><div>Suggested MRP<b>' + money(c.mrp) + '</b><small>incl. GST ' + c.gst + '%</small></div><div>Fabric per garment<b>' + c.fabricPerGarment.toFixed(2) + ' m</b><small>' + c.marker.width + ' cm wide</small></div></div>'
      + '<table><tr><th>Item</th><th>Quantity</th><th>Rate</th><th>Amount</th></tr>' + rows + '<tr class="t"><td>Direct cost</td><td></td><td></td><td>' + money2(c.direct) + '</td></tr><tr><td>Overheads and rejects ' + S.cost.oh + '%</td><td></td><td></td><td>' + money2(c.overheads) + '</td></tr><tr class="t"><td>Total cost</td><td></td><td></td><td>' + money2(c.total) + '</td></tr><tr><td>Your selling price (+' + S.cost.mg + '%)</td><td></td><td></td><td>' + money2(c.sell) + '</td></tr><tr><td>Retail price (+' + S.cost.rm + '%)</td><td></td><td></td><td>' + money2(c.retail) + '</td></tr><tr class="t"><td>MRP incl. GST ' + c.gst + '%</td><td></td><td></td><td>' + money(c.mrp) + '</td></tr></table>'
      + '<h3>Marker</h3><div>' + (c.marker.length / 100).toFixed(2) + ' m for ' + c.perMarker + ' garment(s) on ' + c.marker.width + ' cm fabric · efficiency ' + Math.round(c.marker.eff * 100) + '%</div><div class="m">' + mv.svg + '</div>'
      + '<h3>Order of ' + c.qty + ' pieces</h3><table><tr><td>Main fabric to buy (incl. ' + S.cost.wastage + '% wastage)</td><td>' + c.order.fabric.toFixed(1) + ' m</td></tr>' + (c.order.buttons ? '<tr><td>Buttons</td><td>' + c.order.buttons + '</td></tr>' : '') + (c.order.zips ? '<tr><td>Zips</td><td>' + c.order.zips + '</td></tr>' : '') + '<tr><td>Thread cones</td><td>' + c.order.thread + '</td></tr><tr class="t"><td>Order cost</td><td>' + money(c.order.cost) + '</td></tr></table>'
      + '<p><small>Estimated with the Forecut pattern maker (forecut.in). The marker is laid automatically; a CAD marker is usually a few per cent shorter. Rates are as entered. Confirm the current GST rate.</small></p><button onclick="print()">Print or save as PDF</button></body></html>');
    w.document.close(); toast('Cost sheet opened in a new tab.'); });
  $('#pm-dl-png').onclick = dl(function () { var s = scene(true); X.png(X.svg(s.sc, s.W, s.H, S.unit, { title: s.title }), s.W, s.H, function (b) { FC.download(fname('png'), b); }); toast('PNG downloaded.'); });
  $('#pm-dl-pdf').onclick = dl(function () { var s = scene(true), r = X.pdf(s.sc, s.W, s.H, 'tiles', { title: s.title }); FC.download(fname('pdf'), r.blob); toast('PDF ready: ' + r.pages + ' A4 pages. Print at 100% / actual size.'); });
  $('#pm-dl-pdf2').onclick = dl(function () { var s = scene(true), r = X.pdf(s.sc, s.W, s.H, 'sheet', { title: s.title }); FC.download(fname('sheet.pdf'), r.blob); toast('Full-size PDF ready (' + U(s.W) + ' × ' + U(s.H) + ' ' + S.unit + ') for a plotter or copy shop.'); });
  window.PM_UI = { scene: scene, state: function () { return S; }, applyDetail: applyDetail };
  /* deep link from a Forecut detail: pattern-maker.html?detail=<name> */

  /* Hindi interface: main labels only; measurements, codes and pattern text stay as they are */
  var HI = { 'Export': 'एक्सपोर्ट', 'Garment': 'परिधान', 'Women': 'महिला', 'Men': 'पुरुष', 'Kids': 'बच्चे', 'Unisex': 'यूनिसेक्स', 'Womenswear': 'महिला वस्त्र', 'Menswear': 'पुरुष वस्त्र', 'Kidswear': 'बाल वस्त्र',
    'Style': 'स्टाइल', 'Fit adjustments': 'फ़िट सुधार', 'Seam allowance': 'सिलाई छूट', 'Fabric': 'कपड़ा', 'Fit': 'फ़िट', 'Grid': 'ग्रिड', 'A4 pages': 'A4 पेज', 'Sizes': 'साइज़', 'Marker': 'मार्कर',
    'Cut': 'कटिंग', 'Sew': 'सिलाई', 'Fold': 'मोड़', 'Grain': 'ग्रेन', 'Measure': 'नाप', 'Pieces': 'टुकड़े', 'Costing': 'लागत', 'Checks': 'जाँच', 'About': 'जानकारी',
    'Front': 'आगे', 'Back': 'पीछे', 'How to measure': 'नाप कैसे लें', 'Used for': 'किसके लिए', 'Your value': 'आपका नाप', 'Size chart': 'साइज़ चार्ट', 'Size chart (no client)': 'साइज़ चार्ट (कोई ग्राहक नहीं)', 'Custom': 'अपना नाप',
    'Body': 'शरीर', 'Arms': 'बाँहें', 'Legs': 'टाँगें', 'Bust / chest': 'छाती / सीना', 'Waist': 'कमर', 'Hip / seat': 'कूल्हा / सीट', 'Neck': 'गला', 'Wrist': 'कलाई', 'Across back': 'पीठ की चौड़ाई', 'Across front': 'सामने की चौड़ाई',
    'Shoulder width (tip to tip)': 'कंधे की चौड़ाई (सिरे से सिरे)', 'Nape to waist (back length)': 'गर्दन से कमर (पीठ की लंबाई)', 'Upper arm (bicep)': 'बाँह (बाइसेप)', 'Sleeve length (shoulder to wrist)': 'आस्तीन लंबाई (कंधे से कलाई)',
    'Waist to hip depth': 'कमर से कूल्हे की गहराई', 'Bust span (apex to apex)': 'बस्ट स्पैन (पॉइंट से पॉइंट)', 'Bust point depth (shoulder to apex)': 'बस्ट पॉइंट गहराई (कंधे से)',
    'Ease at chest': 'छाती पर ढील', 'Length from shoulder (0 = standard)': 'कंधे से लंबाई (0 = मानक)', 'Side seam': 'साइड सिलाई', 'Neckline': 'गले का डिज़ाइन', 'Back neckline': 'पीछे का गला', 'Collar': 'कॉलर', 'Sleeve': 'आस्तीन', 'Sleeve length': 'आस्तीन की लंबाई',
    'Pockets': 'जेब', 'Opening': 'खुलाव', 'Bust dart (cup)': 'बस्ट डार्ट (कप)', 'Bust dart position': 'बस्ट डार्ट की जगह', 'Princess seams': 'प्रिंसेस कट', 'Flare at hem (each side)': 'नीचे घेर (हर तरफ़)', 'Side slit length': 'साइड चाक की लंबाई',
    'Panels': 'कलियाँ', 'Hem circumference': 'घेर', 'Mohri (leg opening)': 'मोहरी', 'Leg': 'पायंचा', 'Waist band': 'कमरबंद',
    'Straight': 'सीधा', 'None': 'कोई नहीं', 'Sleeveless': 'बिना आस्तीन', 'Short': 'छोटी', 'Full': 'पूरी', 'Elbow': 'कोहनी तक', 'Three-quarter': 'तीन-चौथाई', 'Cap': 'कैप',
    'Seams, all pieces': 'सिलाई, सभी टुकड़े', 'Hems, all pieces': 'तुरपाई, सभी टुकड़े', 'Apply to all pieces': 'सभी टुकड़ों पर लगाएँ', 'Net pattern': 'नेट पैटर्न (बिना छूट)',
    'Fabric width': 'कपड़े का अर्ज़', 'Shrinkage, length %': 'सिकुड़न, लंबाई %', 'Shrinkage, width %': 'सिकुड़न, चौड़ाई %', 'Knit stretch, width %': 'निट खिंचाव, चौड़ाई %',
    'Save': 'सेव', 'Delete': 'हटाएँ', 'Import': 'इम्पोर्ट', 'Expand all': 'सब खोलें', 'Seam': 'सिलाई', 'Hem': 'तुरपाई', 'Cut 1 on fold': 'मोड़ पर 1 काटें', 'Cut 2 (pair)': '2 काटें (जोड़ी)', 'Reset labels': 'लेबल रीसेट',
    'Cost per garment': 'प्रति पीस लागत', 'Suggested MRP': 'सुझाया MRP', 'Fabric per garment': 'प्रति पीस कपड़ा', 'Marker efficiency': 'मार्कर दक्षता', 'Main fabric price': 'मुख्य कपड़े का दाम', 'Trims': 'ट्रिम्स', 'Making': 'सिलाई ख़र्च', 'Price': 'क़ीमत', 'Order': 'ऑर्डर',
    'Order quantity': 'ऑर्डर मात्रा', 'Cost breakdown per garment': 'प्रति पीस लागत विवरण', 'Main fabric': 'मुख्य कपड़ा', 'Sewing thread': 'सिलाई धागा', 'Direct cost': 'सीधी लागत', 'Total cost': 'कुल लागत', 'View marker': 'मार्कर देखें', 'Main fabric to buy': 'ख़रीदने का कपड़ा',
    'Automatic pattern checks': 'स्वचालित पैटर्न जाँच', 'This pattern': 'यह पैटर्न', 'Style code': 'स्टाइल कोड', 'Size': 'साइज़', 'Allowances': 'छूट', 'Engine': 'इंजन', 'Drafting method': 'ड्राफ़्टिंग विधि', 'Size charts': 'साइज़ चार्ट', 'Accuracy': 'सटीकता',
    'Before production': 'प्रोडक्शन से पहले', "What's new": 'नया क्या है', 'Fit testing': 'फ़िट टेस्टिंग', 'Tech pack': 'टेक पैक', 'Cost sheet': 'लागत शीट' };
  function lang() { var hi = S.lang === 'hi', root = $('.pmx'); if (!root) return; var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) { if (n.parentNode.closest && n.parentNode.closest('svg')) continue; if (n.__en === undefined) { var t = n.nodeValue.trim(); if (!HI[t]) continue; n.__en = n.nodeValue; }
      var v = hi ? n.__en.replace(n.__en.trim(), HI[n.__en.trim()]) : n.__en; if (n.nodeValue !== v) n.nodeValue = v; }
    $$('#pm-lang button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.l === (S.lang || 'en')); }); document.querySelector('.pmx').setAttribute('lang', hi ? 'hi' : 'en'); }
  try { S.lang = localStorage.getItem('fc-tool-pm-lang') || 'en'; } catch (e) { S.lang = 'en'; }
  $$('#pm-lang button').forEach(function (b) { b.onclick = function () { S.lang = b.dataset.l; try { localStorage.setItem('fc-tool-pm-lang', S.lang); } catch (e) {} lang(); }; });
  var langT; if (window.MutationObserver) new MutationObserver(function () { if (S.lang !== 'hi') return; cancelAnimationFrame(langT); langT = requestAnimationFrame(lang); }).observe($('.pmx'), { childList: true, subtree: true });
  var TOILE = {}; // filled only from real sewn samples: 'kurta-women': 'size M, 12 Jan 2027, fit model …'
  var qs = new URLSearchParams(location.search), qd = qs.get('detail');
  if (qd) { var d = DET.filter(function (x) { return x[0].toLowerCase() === qd.toLowerCase(); })[0]; if (d) { S.gender = d[2]; S.gid = d[3]; resetMeas(); resetOpts(); Object.keys(d[4]).forEach(function (k) { S.o[k] = d[4][k]; }); S.detail = d[0]; S.pc = {}; } }
  window.PMUI = { S: function () { return S; }, draw: function () { draw(); }, last: function () { return last; }, U: U, key: editKey, toast: function (t) { try { toast(t); } catch (e) {} }, unit: function () { return S.unit; } };
  ui(true); lang();
  try { if (/[?&]pack=1/.test(location.search) && S.detail) { var bn = document.createElement('div'); bn.className = 'spk'; bn.innerHTML = '<b>Style pack for ' + S.detail + '</b><span>Pattern, costing and tech pack are ready.</span><button type="button" class="xbtn pri" id="pm-spk">Open tech pack</button><button type="button" class="xbtn" id="pm-spkx">Close</button>'; $('.pbar').after(bn); $('#pm-spk').onclick = function () { $('#pm-dl-tech').click(); }; $('#pm-spkx').onclick = function () { bn.remove(); }; } } catch (e) { }
})();
