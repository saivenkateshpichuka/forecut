/* Forecut point-of-measure diagram (Stage 7): an original schematic flat with a numbered line for every point of measure
   it recognises in the size chart. window.ForecutPOM.svg(garment, rows) -> { svg, drawn: [...], missing: [...] } */
(function () {
  'use strict';
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function kind(g) { g = String(g || '').toLowerCase(); if (/skirt|lehenga|ghagra/.test(g)) return 'skirt'; if (/trouser|pant|jean|short|legging|jogger|palazzo|salwar|churidar|chino|cargo|dhoti|pyjama|pajama/.test(g)) return 'bottom'; if (/dress|kurta|kurti|anarkali|tunic|gown|coat|kaftan|jumpsuit|abaya|shirt ?dress/.test(g)) return 'long'; return 'top'; }
  var OUT = {
    top: 'M170 58 Q200 74 230 58 L280 70 L338 150 L312 168 L272 120 L272 330 L128 330 L128 120 L88 168 L62 150 L120 70 Z',
    long: 'M170 58 Q200 74 230 58 L280 70 L338 150 L312 168 L272 120 L270 230 L300 420 L100 420 L130 230 L128 120 L88 168 L62 150 L120 70 Z',
    bottom: 'M130 40 L270 40 L282 110 L292 420 L215 420 L202 160 L198 160 L185 420 L108 420 L118 110 Z',
    skirt: 'M140 50 L260 50 L268 110 L300 380 L100 380 L132 110 Z'
  };
  // [regex, line by kind] ; a line is [x1, y1, x2, y2]
  var RULES = [
    [/across shoulder|shoulder width|^shoulder$|shoulder to shoulder|shoulder seam to/i, { top: [120, 70, 280, 70, 262, 58], long: [120, 70, 280, 70, 262, 58] }],
    [/neck (width|opening)|neck wide|collar width|neckline width/i, { top: [172, 50, 228, 50, 242, 44], long: [172, 50, 228, 50, 242, 44] }],
    [/neck drop|neck depth|front neck|neckline depth/i, { top: [200, 60, 200, 92, 214, 84], long: [200, 60, 200, 92, 214, 84] }],
    [/collar|neck band/i, { top: [176, 40, 224, 40, 160, 34], long: [176, 40, 224, 40, 160, 34] }],
    [/chest|bust|1\" below armhole|below armhole/i, { top: [128, 132, 272, 132], long: [128, 132, 272, 132] }],
    [/armhole|arm hole/i, { top: [128, 76, 128, 128, 142, 104], long: [128, 76, 128, 128, 142, 104] }],
    [/across (front|chest)|front width/i, { top: [134, 104, 266, 104], long: [134, 104, 266, 104] }],
    [/across back|back width/i, { top: [134, 96, 266, 96], long: [134, 96, 266, 96] }],
    [/bicep|biceps|upper arm|sleeve width|muscle/i, { top: [282, 96, 312, 76], long: [282, 96, 312, 76] }],
    [/cuff|sleeve (opening|hem|end)|wrist/i, { top: [314, 166, 338, 150], long: [314, 166, 338, 150] }],
    [/sleeve length|sleeve|overarm/i, { top: [282, 72, 334, 146], long: [282, 72, 334, 146] }],
    [/waist(?!band)/i, { top: [128, 220, 272, 220], long: [130, 220, 270, 220], bottom: [130, 46, 270, 46], skirt: [140, 56, 260, 56] }],
    [/waistband|band height|belt/i, { bottom: [282, 40, 282, 58], skirt: [270, 50, 270, 66] }],
    [/hip|seat/i, { top: [128, 290, 272, 290], long: [125, 300, 275, 300], bottom: [118, 110, 282, 110], skirt: [132, 110, 268, 110] }],
    [/front rise|rise/i, { bottom: [200, 46, 200, 158] }],
    [/thigh/i, { bottom: [116, 180, 198, 180] }],
    [/knee/i, { bottom: [112, 300, 192, 300] }],
    [/inseam|inside leg/i, { bottom: [206, 166, 214, 414] }],
    [/outseam|outside leg|side length/i, { bottom: [104, 40, 104, 420] }],
    [/leg opening|bottom opening|hem width|ankle/i, { bottom: [110, 414, 184, 414] }],
    [/sweep|hem|bottom width|bottom edge|flare/i, { top: [128, 324, 272, 324], long: [102, 412, 298, 412], skirt: [102, 374, 298, 374] }],
    [/length|hps|centre back|center back|cb |cf /i, { top: [345, 58, 345, 330], long: [345, 58, 345, 420], bottom: [320, 40, 320, 420], skirt: [320, 50, 320, 380] }]
  ];
  function svg(garment, rows) {
    var k = kind(garment), drawn = [], missing = [], used = {}, g = '';
    (rows || []).forEach(function (r, i) {
      var nm = String(r.name || ''), lab = (r.code && String(r.code).length <= 4 ? r.code : String.fromCharCode(65 + (i % 26))), line = null, key = '';
      for (var j = 0; j < RULES.length; j++) if (RULES[j][0].test(nm) && RULES[j][1][k]) { line = RULES[j][1][k]; key = j; break; }
      if (!line || used[key]) { missing.push(nm); return; } used[key] = 1; drawn.push({ label: lab, name: nm });
      var x1 = line[0], y1 = line[1], x2 = line[2], y2 = line[3], mx = (x1 + x2) / 2, my = (y1 + y2) / 2, ang = Math.atan2(y2 - y1, x2 - x1), ox = -Math.sin(ang) * 11, oy = Math.cos(ang) * 11; if (line.length > 4) { mx = line[4]; my = line[5]; ox = 0; oy = 0; }
      g += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#a9481f" stroke-width="1.6" marker-start="url(#pa)" marker-end="url(#pa)"/>'
        + '<circle cx="' + (mx + ox) + '" cy="' + (my + oy) + '" r="9" fill="#a9481f"/><text x="' + (mx + ox) + '" y="' + (my + oy + 3.6) + '" text-anchor="middle" font-family="DM Sans,Arial,sans-serif" font-size="10" font-weight="700" fill="#fff">' + esc(lab) + '</text>';
    });
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 20 330 420" role="img" aria-label="Points of measure on a ' + esc(garment || 'garment') + ' flat"><defs><marker id="pa" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#a9481f"/></marker></defs>'
      + '<path d="' + OUT[k] + '" fill="#f6f1e8" stroke="#1c1714" stroke-width="2" stroke-linejoin="round"/>' + (k === 'top' || k === 'long' ? '<path d="M200 66 L200 ' + (k === 'long' ? 418 : 328) + '" stroke="#1c1714" stroke-width=".8" stroke-dasharray="4 4"/>' : '') + g + '</svg>';
    return { svg: s, drawn: drawn, missing: missing, kind: k };
  }
  window.ForecutPOM = { svg: svg, kind: kind };
})();
