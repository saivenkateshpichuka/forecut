/* Forecut Garment Studio: the 3D mode. The 3D studio runs embedded beside Draft and Edit pieces and dresses the avatar
   in the garment, style, size and measurements chosen in Draft. Needs pm_edit.js (window.PM3DQuery). */
(function () {
  'use strict';
  var wrap = null, frame = null, msg = null, lastSrc = '', on = false;
  function $(s, r) { return (r || document).querySelector(s); }
  function desk() { return !window.matchMedia || matchMedia('(min-width: 1024px) and (pointer: fine)').matches; }
  function toast(t) { var u = window.PMUI; if (u && u.toast) u.toast(t); }
  function place() { if (!wrap) return; var m = $('.ps-modes'), r = m ? m.getBoundingClientRect() : null; wrap.style.top = Math.max(0, r && r.bottom > 0 ? r.bottom + 6 : 96) + 'px'; }
  function make() {
    wrap = document.createElement('section'); wrap.id = 'pm-3d'; wrap.hidden = true; wrap.setAttribute('aria-label', '3D fitting');
    wrap.innerHTML = '<div class="p3-bar"><b>3D fitting</b><span class="p3-what"></span><button type="button" class="p3-b" data-p3="sync" title="Dress the avatar in the garment as it is now in Draft">Update from the pattern</button><button type="button" class="p3-b" data-p3="back">Back to the pattern</button></div>'
      + '<p class="p3-msg" hidden></p><iframe title="3D fitting: the garment on the avatar" allow="fullscreen" loading="eager"></iframe>';
    document.body.appendChild(wrap); frame = $('iframe', wrap); msg = $('.p3-msg', wrap);
    wrap.addEventListener('click', function (e) { var b = e.target.closest('[data-p3]'); if (!b) return; if (b.dataset.p3 === 'back') close(); else load(true); });
    window.addEventListener('resize', place);
  }
  function load(force) {
    var r = window.PM3DQuery ? window.PM3DQuery() : { err: 'The 3D view needs the pattern to load first.' }, S = window.PMUI && window.PMUI.S ? window.PMUI.S() : {}, G = window.PM && window.PM.GARMENTS ? window.PM.GARMENTS[S.gid] : null;
    $('.p3-what', wrap).textContent = G ? G.n + (S.size ? ' · ' + (S.size === 'custom' ? 'your measurements' : 'size ' + S.size) : '') : '';
    var edited = false; try { edited = localStorage.getItem('pm-mode') === 'edit'; } catch (e) {}
    if (r.err) { msg.hidden = false; msg.textContent = r.err; frame.hidden = true; return; }
    msg.hidden = !edited; msg.textContent = edited ? 'The 3D view dresses the avatar in the drafted garment. Changes made in Edit pieces (moved points, darts, raglan, elastic) are not in 3D yet.' : '';
    frame.hidden = false; var src = '3d-drape-studio.html?embed=1&' + r.q;
    if (force || src !== lastSrc) { lastSrc = src; frame.src = src; }
  }
  function open() {
    if (!desk()) { toast('3D fitting needs a desktop or laptop with a mouse or trackpad.'); return; }
    if (!wrap) make(); load(false); wrap.hidden = false; on = true; place();
    document.querySelectorAll('[data-pmode]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.pmode === '3d'); });
    document.documentElement.classList.add('pm-3d-on');
  }
  function close() { if (wrap) wrap.hidden = true; on = false; document.documentElement.classList.remove('pm-3d-on'); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-pmode]'); if (!b) return;
    if (b.dataset.pmode === '3d') { e.preventDefault(); e.stopPropagation(); open(); } else if (on) close();
  }, true);
  function addButton() {
    var m = $('.ps-modes'); if (!m || $('[data-pmode="3d"]', m)) return !!m;
    var b = document.createElement('button'); b.type = 'button'; b.dataset.pmode = '3d'; b.title = '3D: sew the garment and drape it on an avatar in your size and pose'; b.textContent = '3D'; m.appendChild(b); return true;
  }
  var n = 0, t = setInterval(function () { n++; if (addButton() || n > 120) { clearInterval(t); if (/[?&]mode=3d/.test(location.search)) { var k = 0, t2 = setInterval(function () { k++; var app = document.getElementById('pm-app'); if ((app && !app.hidden && window.PM3DQuery) || k > 80) { clearInterval(t2); if (window.PM3DQuery) open(); } }, 250); } } }, 150);
  var css = document.createElement('style');
  css.textContent = '#pm-3d{position:fixed;left:0;right:0;bottom:0;top:96px;z-index:1400;display:flex;flex-direction:column;background:#f6f2ea}#pm-3d[hidden]{display:none}'
    + '#pm-3d .p3-bar{display:flex;align-items:center;gap:10px;padding:6px 12px;background:#1f2226;color:#e8e6e1;font:13px "DM Sans",sans-serif}#pm-3d .p3-bar b{font-weight:700;letter-spacing:.02em}#pm-3d .p3-what{color:#9da3aa;flex:1}#pm-3d .p3-b{background:#2b3035;color:#e8e6e1;border:1px solid #3a3f46;border-radius:5px;padding:5px 11px;font:600 12.5px "DM Sans",sans-serif;cursor:pointer}#pm-3d .p3-b:hover{border-color:#e08a5e;color:#fff}'
    + '#pm-3d .p3-msg{margin:0;padding:6px 12px;background:#fff4e5;color:#6b4a12;font:12.5px "DM Sans",sans-serif;border-bottom:1px solid #f0dfc3}#pm-3d iframe{flex:1;width:100%;border:0;background:#f6f2ea}';
  document.head.appendChild(css);
  window.PM3D = { open: open, close: close, load: load };
})();
