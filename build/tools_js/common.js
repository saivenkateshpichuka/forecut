/* Forecut tools: shared helpers (nearest Pantone TCX by CIEDE2000, formatting, downloads, saved state). */
var FC = window.FC || {};
FC.$ = function (s, r) { return (r || document).querySelector(s); };
FC.$$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
FC.num = function (el) { var v = parseFloat(String(el.value).replace(',', '.')); return isFinite(v) ? v : 0; };
FC.fmt = function (v, d) { if (!isFinite(v)) return '–'; return v.toLocaleString('en-IN', { minimumFractionDigits: d === undefined ? 2 : d, maximumFractionDigits: d === undefined ? 2 : d }); };
FC.inr = function (v) { return isFinite(v) ? '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '–'; };
FC.save = function (k, v) { try { localStorage.setItem('fc-tool-' + k, JSON.stringify(v)); } catch (e) { } };
FC.load = function (k) { try { return JSON.parse(localStorage.getItem('fc-tool-' + k) || 'null'); } catch (e) { return null; } };
FC.download = function (name, data, type) {
  var b = data instanceof Blob ? data : new Blob([data], { type: type || 'text/plain' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
};
FC.svgToPng = function (svg, w, h, name, bg) {
  var s = new XMLSerializer().serializeToString(svg);
  var img = new Image(); img.onload = function () {
    var c = document.createElement('canvas'); c.width = w; c.height = h; var x = c.getContext('2d');
    if (bg) { x.fillStyle = bg; x.fillRect(0, 0, w, h); } x.drawImage(img, 0, 0, w, h);
    c.toBlob(function (b) { FC.download(name, b); }, 'image/png');
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
};
/* tabs: buttons [data-tab] inside .tabs, panels [data-pane] */
FC.tabs = function (root) {
  var bs = FC.$$('[data-tab]', root), ps = FC.$$('[data-pane]', root);
  function show(id, push) {
    bs.forEach(function (b) { b.setAttribute('aria-selected', b.dataset.tab === id ? 'true' : 'false'); });
    ps.forEach(function (p) { p.hidden = p.dataset.pane !== id; });
    if (push) { try { history.replaceState(null, '', '#' + id); } catch (e) { } }
  }
  bs.forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.tab, true); }); });
  var h = location.hash.slice(1); show(bs.some(function (b) { return b.dataset.tab === h; }) ? h : bs[0].dataset.tab);
};
/* Pantone TCX nearest match (same method as the site's Python: CIEDE2000 against public screen approximations) */
FC._tcx = null;
FC.tcx = function (cb) {
  if (FC._tcx) return cb(FC._tcx);
  fetch('/tcx.json').then(function (r) { return r.json(); }).then(function (d) {
    FC._tcx = Object.keys(d).map(function (k) { return [k, d[k][0], FC.lab(d[k][1])]; }); cb(FC._tcx);
  }).catch(function () { cb([]); });
};
FC.lab = function (h) {
  h = h.replace('#', ''); var c = [0, 2, 4].map(function (i) { var v = parseInt(h.substr(i, 2), 16) / 255; return v > .04045 ? Math.pow((v + .055) / 1.055, 2.4) : v / 12.92; });
  var x = (c[0] * .4124 + c[1] * .3576 + c[2] * .1805) / .95047, y = c[0] * .2126 + c[1] * .7152 + c[2] * .0722, z = (c[0] * .0193 + c[1] * .1192 + c[2] * .9505) / 1.08883;
  function f(t) { return t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; }
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
};
FC.de = function (A, B) {
  var r = Math.PI / 180, L1 = A[0], a1 = A[1], b1 = A[2], L2 = B[0], a2 = B[1], b2 = B[2];
  var C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cb = (C1 + C2) / 2, G = .5 * (1 - Math.sqrt(Math.pow(Cb, 7) / (Math.pow(Cb, 7) + Math.pow(25, 7))));
  var a1p = (1 + G) * a1, a2p = (1 + G) * a2, C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  var h1p = (Math.atan2(b1, a1p) / r + 360) % 360, h2p = (Math.atan2(b2, a2p) / r + 360) % 360, dL = L2 - L1, dC = C2p - C1p, dh;
  if (C1p * C2p === 0) dh = 0; else { dh = h2p - h1p; if (dh > 180) dh -= 360; else if (dh < -180) dh += 360; }
  var dH = 2 * Math.sqrt(C1p * C2p) * Math.sin(dh * r / 2), Lp = (L1 + L2) / 2, Cp = (C1p + C2p) / 2, hp;
  if (C1p * C2p === 0) hp = h1p + h2p; else if (Math.abs(h1p - h2p) <= 180) hp = (h1p + h2p) / 2; else hp = (h1p + h2p < 360) ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2;
  var T = 1 - .17 * Math.cos((hp - 30) * r) + .24 * Math.cos(2 * hp * r) + .32 * Math.cos((3 * hp + 6) * r) - .2 * Math.cos((4 * hp - 63) * r);
  var SL = 1 + .015 * Math.pow(Lp - 50, 2) / Math.sqrt(20 + Math.pow(Lp - 50, 2)), SC = 1 + .045 * Cp, SH = 1 + .015 * Cp * T;
  var RT = -2 * Math.sqrt(Math.pow(Cp, 7) / (Math.pow(Cp, 7) + Math.pow(25, 7))) * Math.sin(60 * Math.exp(-Math.pow((hp - 275) / 25, 2)) * r);
  return Math.sqrt(Math.pow(dL / SL, 2) + Math.pow(dC / SC, 2) + Math.pow(dH / SH, 2) + RT * (dC / SC) * (dH / SH));
};
FC.nearest = function (hex, list) {
  var t = FC.lab(hex), best = null, bd = 1e9;
  list.forEach(function (e) { var d = FC.de(t, e[2]); if (d < bd) { bd = d; best = e; } });
  return best ? { code: best[0] + ' TCX', name: best[1].replace(/-/g, ' ').replace(/\b\w/g, function (m) { return m.toUpperCase(); }), de: Math.round(bd * 10) / 10 } : null;
};
window.FC = FC;
