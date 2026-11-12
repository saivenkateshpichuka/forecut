/* Forecut app install: "Install app" buttons ([data-fx-install]) install this tool as its own app, or Forecut Studio with every tool.
   Uses the browser's install prompt where available (Chrome, Edge, Android); otherwise explains Add to Home Screen / Install from the browser menu. */
(function () {
  'use strict';
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
  window.addEventListener('appinstalled', function () { deferred = null; note('Installed. Open it from your home screen or app list.'); });
  var standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
  function note(msg) {
    var d = document.getElementById('fxInstallNote');
    if (!d) { d = document.createElement('div'); d.id = 'fxInstallNote'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Install the app'); document.body.appendChild(d); }
    d.innerHTML = '<div class="fx-in-card"><p>' + msg + '</p><button type="button">OK</button></div>';
    d.hidden = false; d.querySelector('button').onclick = function () { d.hidden = true; };
  }
  function how(which) {
    var name = which === 'studio' ? 'Forecut Studio' : (document.body.getAttribute('data-tool-name') || 'this tool');
    if (isIOS()) return note('To install <b>' + name + '</b> on iPhone or iPad: tap the Share button in Safari, then <b>Add to Home Screen</b>.');
    return note('To install <b>' + name + '</b>: open your browser menu (⋮) and choose <b>Install app</b> or <b>Add to Home screen</b>. Works in Chrome, Edge and on Android; on a Mac use Chrome or Edge.');
  }
  function go(which) {
    var page = location.pathname.split('/').pop();
    if (which === 'studio' && page !== 'tools.html') { location.href = 'tools.html#install-studio'; return; }
    if (deferred) { deferred.prompt(); deferred.userChoice.finally(function () { deferred = null; }); return; }
    how(which);
  }
  function wire() {
    document.querySelectorAll('[data-fx-install]').forEach(function (b) {
      if (standalone) { b.hidden = true; return; }
      b.addEventListener('click', function (e) { e.preventDefault(); go(b.getAttribute('data-fx-install')); });
    });
    if (location.hash === '#install-studio') setTimeout(function () { if (deferred) note('Ready to install <b>Forecut Studio</b>. <button type="button" id="fxDoInstall" style="margin-left:6px">Install now</button>'); else how('studio'); var x = document.getElementById('fxDoInstall'); if (x) x.onclick = function () { deferred && deferred.prompt(); document.getElementById('fxInstallNote').hidden = true; }; }, 1200);
  }
  if (document.readyState !== 'loading') wire(); else document.addEventListener('DOMContentLoaded', wire);
})();
