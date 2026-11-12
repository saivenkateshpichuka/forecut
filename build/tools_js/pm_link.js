/* Forecut: adds "Make the pattern" (opens Seamdraft in its own window) and "Create a style brief" (Motiforge) to the detail viewer for details the pattern maker can draft (only included once pattern-maker.html is published). */
(function () {
  var M = window.FC_PM_LINKS || {}, nm = document.getElementById('vname'); if (!nm) return;
  function upd() {
    var key = (nm.textContent || '').trim(), act = document.querySelector('.vact'), a = document.getElementById('vpm');
    if (!act) return;
    var sb = document.getElementById('vsb');
    if (!sb) { sb = document.createElement('a'); sb.id = 'vsb'; sb.className = 'vbtn'; sb.style.cssText = 'text-decoration:none;display:inline-flex;align-items:center;gap:6px'; act.appendChild(sb); }
    sb.href = 'trend-to-style.html?detail=' + encodeURIComponent(key); sb.textContent = 'Create a style brief'; sb.title = 'Open this detail in Motiforge to turn it into a style brief, then a tech pack (members)';
    if (!M[key]) { if (a) a.hidden = true; var b0 = document.getElementById('vsp'); if (b0) b0.hidden = true; return; }
    if (!a) { a = document.createElement('a'); a.id = 'vpm'; a.className = 'vbtn'; a.style.cssText = 'background:#1f3d33;color:#f5f0e8;text-decoration:none;display:inline-flex;align-items:center;gap:6px'; act.insertBefore(a, act.firstChild); }
    a.hidden = false; a.target = '_blank'; a.rel = 'noopener'; a.href = 'pattern-maker.html?detail=' + encodeURIComponent(key); a.textContent = 'Make the pattern'; a.title = 'Open this detail in the Forecut pattern maker (' + M[key] + ')';
    var b = document.getElementById('vsp');
    if (!b) { b = document.createElement('a'); b.id = 'vsp'; b.className = 'vbtn'; b.style.cssText = 'text-decoration:none;display:inline-flex;align-items:center;gap:6px'; a.after(b); }
    b.hidden = false; b.target = '_blank'; b.rel = 'noopener'; b.href = 'pattern-maker.html?detail=' + encodeURIComponent(key) + '&pack=1'; b.textContent = 'Style pack'; b.title = 'Pattern, costing and tech pack for this detail (members)';
  }
  new MutationObserver(upd).observe(nm, { childList: true, characterData: true, subtree: true }); upd();
})();
