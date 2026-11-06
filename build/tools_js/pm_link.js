/* Forecut: adds "Make the pattern" to the detail viewer for details the pattern maker can draft (only included once pattern-maker.html is published). */
(function () {
  var M = window.FC_PM_LINKS || {}, nm = document.getElementById('vname'); if (!nm) return;
  function upd() {
    var key = (nm.textContent || '').trim(), act = document.querySelector('.vact'), a = document.getElementById('vpm');
    if (!act) return;
    if (!M[key]) { if (a) a.hidden = true; return; }
    if (!a) { a = document.createElement('a'); a.id = 'vpm'; a.className = 'vbtn'; a.style.cssText = 'background:#1f3d33;color:#f5f0e8;text-decoration:none;display:inline-flex;align-items:center;gap:6px'; act.insertBefore(a, act.firstChild); }
    a.hidden = false; a.href = 'pattern-maker.html?detail=' + encodeURIComponent(key); a.textContent = 'Make the pattern'; a.title = 'Open this detail in the Forecut pattern maker (' + M[key] + ')';
  }
  new MutationObserver(upd).observe(nm, { childList: true, characterData: true, subtree: true }); upd();
})();
