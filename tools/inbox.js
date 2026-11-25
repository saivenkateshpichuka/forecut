/* Findings sent from Forecut forecast pages (Send to Board / Style Brief / Collection Planner).
   Each finding keeps its season, audience and report or theme title, so the team knows where the direction came from. */
(function () {
  var K = 'fc-forecast-inbox', tool = document.body && document.body.dataset.tool;
  if (tool !== 'trend-to-style' && tool !== 'rangeboard') return;
  var ST = { e: 'Emerging', r: 'Rising', p: 'Peaking', f: 'Fading' };
  function load() { try { return JSON.parse(localStorage.getItem(K) || '[]'); } catch (e) { return []; } }
  function store(L) { try { localStorage.setItem(K, JSON.stringify(L.slice(0, 200))); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function norm(o) { var x = {}; for (var k in o) x[k] = o[k]; x.st = ST[o.st] || o.st || ''; return x; }
  var mine = tool === 'rangeboard' ? ['plan'] : ['board', 'brief'];
  var css = document.createElement('style');
  css.textContent = '.fc-inbox{border:1px solid #d9d2c5;background:#fbf8f2;padding:16px 18px;margin:0 0 18px;border-radius:6px}.fc-inbox h2{font-size:16px;margin:0 0 4px}.fc-inbox p.fi-sub{margin:0 0 12px;color:#6b625b;font-size:13px}' +
    '.fc-inbox ul{list-style:none;margin:0;padding:0}.fc-inbox li{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;justify-content:space-between;padding:10px 0;border-top:1px solid #e6dfd2}' +
    '.fc-inbox li b{font-weight:600}.fc-inbox .fi-src{display:block;font-size:12px;color:#6b625b;margin-top:2px}.fc-inbox .fi-act{display:flex;gap:6px;flex-wrap:wrap}.fc-inbox button{font:inherit;font-size:13px;padding:6px 10px;border:1px solid #1f3d33;background:#fff;color:#1f3d33;border-radius:4px;cursor:pointer}' +
    '.fc-inbox button.pr{background:#1f3d33;color:#fff}.fc-inbox button.x{border-color:#d9d2c5;color:#6b625b}';
  document.head.appendChild(css);
  var box = document.createElement('section'); box.className = 'fc-inbox no-print'; box.setAttribute('aria-live', 'polite');
  function act(kind, list) {
    var ok = false;
    try {
      if (kind === 'board' && window.ForecutBoard) ok = ForecutBoard.add(list.map(norm));
      else if (kind === 'brief' && window.ForecutBrief) ok = ForecutBrief.use(norm(list[0]));
      else if (kind === 'plan' && window.ForecutPlanner) ok = ForecutPlanner.add(list.map(norm));
    } catch (e) { ok = false; }
    if (!ok) { alert('This tool is still loading. Try again in a moment.'); return false; }
    var ids = list.map(function (x) { return x.id; }), L = load();
    L.forEach(function (x) { if (ids.indexOf(x.id) >= 0) x.used = new Date().toISOString(); }); store(L); draw();
    return true;
  }
  function draw() {
    var L = load().filter(function (x) { return !x.used && mine.indexOf(x.to) >= 0; });
    if (!L.length) { box.hidden = true; return; }
    box.hidden = false;
    var h = '<h2>From Forecut forecasts</h2><p class="fi-sub">Findings you sent from the forecast pages. Each keeps its season, audience and report title.</p><ul>';
    L.slice(0, 30).forEach(function (x) {
      h += '<li data-id="' + esc(x.id) + '"><span><b>' + esc(x.n) + '</b>' + (x.st ? ' <span class="fi-src" style="display:inline">(' + esc(ST[x.st] || x.st) + ')</span>' : '') +
        '<span class="fi-src">' + esc(x.season + ' ' + x.aud) + ', <a href="' + esc(x.url) + '">' + esc(x.src) + '</a>' + (x.cv ? ' (version ' + esc(x.cv) + ')' : '') + '</span></span><span class="fi-act">' +
        (tool === 'rangeboard' ? '<button class="pr" data-fi="plan">Add as style</button>' : '<button class="pr" data-fi="board">Add to board</button><button data-fi="brief">Use in style brief</button>') +
        '<button class="x" data-fi="drop">Dismiss</button></span></li>';
    });
    h += '</ul>' + (L.length > 1 ? '<p style="margin:10px 0 0"><button data-fi="all">' + (tool === 'rangeboard' ? 'Add all as styles' : 'Add all to board') + '</button></p>' : '');
    box.innerHTML = h;
  }
  box.addEventListener('click', function (e) {
    var b = e.target.closest('[data-fi]'); if (!b) return;
    var k = b.dataset.fi, li = b.closest('li'), L = load(), open = L.filter(function (x) { return !x.used && mine.indexOf(x.to) >= 0; });
    if (k === 'all') { act(tool === 'rangeboard' ? 'plan' : 'board', open); return; }
    var it = L.filter(function (x) { return x.id === li.dataset.id; })[0]; if (!it) return;
    if (k === 'drop') { store(L.filter(function (x) { return x.id !== it.id; })); draw(); return; }
    act(k, [it]);
  });
  function mount() {
    var app = document.getElementById('app'); if (!app || !app.parentNode) return;
    app.parentNode.insertBefore(box, app); draw();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  window.addEventListener('storage', function (e) { if (e.key === K) draw(); });
})();
