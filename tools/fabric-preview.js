/* Forecut fabric preview: paints a colour onto a drawn fabric texture (weave, knit, pile, sheer) with soft drape shading.
   Everything is drawn in the browser; no photos are used. window.ForecutFabricPreview.draw(canvas, hex, type) */
(function () {
  'use strict';
  var TYPES = [
    ['poplin', 'Cotton poplin (plain weave)', 'Poplin'], ['oxford', 'Oxford / basket weave', 'Oxford'], ['twill', 'Cotton twill / chino', 'Twill'], ['denim', 'Denim', 'Denim'], ['linen', 'Linen', 'Linen'], ['khadi', 'Khadi / handloom', 'Khadi'],
    ['canvas', 'Canvas / duck', 'Canvas'], ['satin', 'Satin', 'Satin'], ['silk', 'Silk (habotai / crepe de chine)', 'Silk'], ['chiffon', 'Chiffon / georgette', 'Chiffon'], ['organza', 'Organza / net', 'Organza'], ['velvet', 'Velvet', 'Velvet'],
    ['corduroy', 'Corduroy', 'Corduroy'], ['jersey', 'Single jersey knit', 'Jersey'], ['rib', 'Rib knit', 'Rib'], ['pique', 'Piqué knit', 'Piqué'], ['fleece', 'Fleece / French terry', 'Fleece'], ['wool', 'Wool suiting / tweed', 'Wool'], ['jacquard', 'Jacquard / brocade', 'Jacquard']];
  function rgb(hex) { hex = String(hex || '#888').replace('#', ''); if (hex.length === 3) hex = hex.replace(/./g, '$&$&'); var n = parseInt(hex, 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function css(c, a) { return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + (a == null ? 1 : a) + ')'; }
  function mix(c, k) { return k >= 0 ? c.map(function (v) { return v + (255 - v) * k; }) : c.map(function (v) { return v * (1 + k); }); }
  function rnd(seed) { var s = seed || 1; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function draw(cv, hex, type) {
    var W = cv.width, H = cv.height, g = cv.getContext('2d'), c = rgb(hex), r = rnd(7), i, x, y;
    var light = mix(c, .22), dark = mix(c, -.28), dark2 = mix(c, -.45);
    g.clearRect(0, 0, W, H);
    var sheer = type === 'chiffon' || type === 'organza';
    if (sheer) { g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, W, H); g.fillStyle = css(c, type === 'organza' ? .62 : .78); g.fillRect(0, 0, W, H); }
    else { g.fillStyle = css(c); g.fillRect(0, 0, W, H); }
    switch (type) {
      case 'poplin': case 'silk':
        for (y = 0; y < H; y += 2) for (x = 0; x < W; x += 2) { if ((x + y) / 2 % 2) { g.fillStyle = css(light, type === 'silk' ? .1 : .16); g.fillRect(x, y, 2, 2); } else if (r() < .3) { g.fillStyle = css(dark, .12); g.fillRect(x, y, 2, 2); } }
        break;
      case 'oxford': case 'canvas':
        var s = type === 'canvas' ? 6 : 4;
        for (y = 0; y < H; y += s) for (x = 0; x < W; x += s) { var on = ((x / s | 0) + (y / s | 0)) % 2; g.fillStyle = css(on ? light : dark, on ? .22 : .2); g.fillRect(x, y, s, s); g.fillStyle = css(dark2, .12); g.fillRect(x, y + s - 1, s, 1); }
        if (type === 'oxford') for (y = 0; y < H; y += 4) { g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, y, W, 1); }
        break;
      case 'twill': case 'denim': case 'wool':
        g.lineWidth = type === 'denim' ? 2.2 : 1.6;
        for (i = -H; i < W + H; i += type === 'wool' ? 4 : 5) { g.strokeStyle = css(type === 'denim' ? mix(c, .5) : light, type === 'denim' ? .35 : .25); g.beginPath(); g.moveTo(i, H); g.lineTo(i + H * .9, 0); g.stroke(); g.strokeStyle = css(dark2, .18); g.beginPath(); g.moveTo(i + 2, H); g.lineTo(i + 2 + H * .9, 0); g.stroke(); }
        if (type === 'denim') for (i = 0; i < 900; i++) { g.fillStyle = 'rgba(255,255,255,' + (r() * .22) + ')'; g.fillRect(r() * W, r() * H, 1 + r() * 3, 1); }
        if (type === 'wool') for (i = 0; i < 1600; i++) { g.fillStyle = css(r() < .5 ? light : dark2, .25); g.fillRect(r() * W, r() * H, 1, 1 + r() * 2); }
        break;
      case 'linen': case 'khadi':
        for (y = 0; y < H; y += 2) { var a = r(); g.fillStyle = css(a < .5 ? light : dark, .1 + r() * (type === 'khadi' ? .3 : .2)); g.fillRect(0, y, W, r() < .15 ? 2 : 1); }
        for (x = 0; x < W; x += 2) { g.fillStyle = css(r() < .5 ? light : dark, .08 + r() * .18); g.fillRect(x, 0, r() < .12 ? 2 : 1, H); }
        for (i = 0; i < (type === 'khadi' ? 90 : 45); i++) { g.fillStyle = css(r() < .5 ? light : dark2, .35); g.fillRect(r() * W, r() * H, 6 + r() * 26, 1.5); }
        break;
      case 'satin':
        for (x = 0; x < W; x++) { var k = Math.sin(x / W * Math.PI * 2.2 + .6); g.fillStyle = 'rgba(255,255,255,' + Math.max(0, k) * .32 + ')'; g.fillRect(x, 0, 1, H); }
        for (y = 0; y < H; y += 3) { g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(0, y, W, 1); }
        break;
      case 'chiffon': case 'organza':
        for (i = 0; i < 2600; i++) { g.fillStyle = css(r() < .5 ? dark : light, .2); g.fillRect(r() * W, r() * H, 1, 1); }
        if (type === 'organza') { for (x = 0; x < W; x += 3) { g.fillStyle = css(dark, .12); g.fillRect(x, 0, 1, H); } for (y = 0; y < H; y += 3) { g.fillStyle = css(dark, .12); g.fillRect(0, y, W, 1); } }
        break;
      case 'velvet':
        var gr = g.createRadialGradient(W * .35, H * .3, 10, W * .35, H * .3, W * .8); gr.addColorStop(0, css(light, .55)); gr.addColorStop(.5, css(c, 0)); gr.addColorStop(1, css(dark2, .55)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        for (i = 0; i < 5000; i++) { g.fillStyle = css(r() < .5 ? light : dark, .18); g.fillRect(r() * W, r() * H, 1, 1); }
        break;
      case 'corduroy':
        for (x = 0; x < W; x += 7) { var lg = g.createLinearGradient(x, 0, x + 7, 0); lg.addColorStop(0, css(dark2, .45)); lg.addColorStop(.45, css(light, .35)); lg.addColorStop(1, css(dark2, .45)); g.fillStyle = lg; g.fillRect(x, 0, 7, H); }
        break;
      case 'jersey': case 'pique':
        var sw = type === 'pique' ? 7 : 5, sh = type === 'pique' ? 7 : 6;
        for (y = 0; y < H; y += sh) for (x = 0; x < W; x += sw) { g.strokeStyle = css(light, .35); g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + sw / 2, y + sh); g.lineTo(x + sw, y); g.stroke(); g.strokeStyle = css(dark2, .2); g.beginPath(); g.moveTo(x + sw / 2, y + sh); g.lineTo(x + sw / 2, y + sh - 1); g.stroke(); if (type === 'pique' && ((x / sw + y / sh) | 0) % 2) { g.fillStyle = css(dark, .18); g.fillRect(x + 1, y + 1, sw - 2, sh - 2); } }
        break;
      case 'rib':
        for (x = 0; x < W; x += 8) { var rg = g.createLinearGradient(x, 0, x + 8, 0); rg.addColorStop(0, css(dark2, .4)); rg.addColorStop(.5, css(light, .3)); rg.addColorStop(1, css(dark2, .4)); g.fillStyle = rg; g.fillRect(x, 0, 8, H); for (y = 0; y < H; y += 5) { g.strokeStyle = css(dark2, .18); g.beginPath(); g.moveTo(x + 1, y); g.lineTo(x + 4, y + 4); g.lineTo(x + 7, y); g.stroke(); } }
        break;
      case 'fleece':
        for (i = 0; i < 7000; i++) { g.fillStyle = css(r() < .55 ? light : dark, .16 + r() * .2); var d = 1 + r() * 2; g.beginPath(); g.arc(r() * W, r() * H, d, 0, 6.3); g.fill(); }
        break;
      case 'jacquard':
        for (y = 0; y < H; y += 2) for (x = 0; x < W; x += 2) { var m = Math.sin(x / 14) * Math.cos(y / 14) + Math.sin((x + y) / 22); if (m > .55) { g.fillStyle = css(light, .38); g.fillRect(x, y, 2, 2); } else if (m < -.7) { g.fillStyle = css(dark2, .3); g.fillRect(x, y, 2, 2); } }
        break;
    }
    // drape: soft folds
    if (type !== 'velvet') for (x = 0; x < W; x++) { var f = Math.sin(x / W * Math.PI * 3.1 + 1.3) * .6 + Math.sin(x / W * Math.PI * 7.3) * .25; g.fillStyle = f > 0 ? 'rgba(255,255,255,' + f * (type === 'satin' || type === 'silk' ? .2 : .1) + ')' : 'rgba(0,0,0,' + (-f) * .18 + ')'; g.fillRect(x, 0, 1, H); }
    var vg = g.createLinearGradient(0, 0, 0, H); vg.addColorStop(0, 'rgba(255,255,255,.06)'); vg.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  }
  window.ForecutFabricPreview = { types: TYPES, draw: draw };
})();
