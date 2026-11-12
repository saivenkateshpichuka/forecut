/* Forecut tools are for signed-in members. Hides the tool (the element marked data-fx-gate) until Firebase reports a signed-in user.
   This is a convenience gate on a static site, not a security boundary: nothing private is stored in the tool files. */
(function () {
  'use strict';
  var body = document.body, target = document.querySelector('[data-fx-gate]');
  if (!target) return;
  body.classList.add('fx-locked');
  var page = location.pathname.split('/').pop() || 'tools.html';
  var name = body.getAttribute('data-tool-name') || 'this tool';
  var card = document.createElement('section');
  card.className = 'fx-gate';
  card.setAttribute('aria-live', 'polite');
  card.innerHTML = '<p class="fx-gate-wait">Checking your Forecut account…</p>';
  target.parentNode.insertBefore(card, target);
  function locked() {
    var slug = page.replace(/\.html$/, '');
    card.innerHTML = '<img class="fx-gate-cover" src="tools/covers/' + slug + '-640.webp" alt="" width="640" height="360" onerror="this.remove()"><span class="fx-kicker">Members tool</span><h2>Sign in to use ' + name.replace(/[<>&]/g, '') + '</h2>' +
      '<p>Forecut tools are free for registered members. Sign in, or create a free account in under a minute. Your work stays in your own browser.</p>' +
      '<div class="fx-gate-btns"><a class="fx-gate-p" href="account.html?next=' + encodeURIComponent(page) + '#signin">Sign in</a>' +
      '<a href="account.html?next=' + encodeURIComponent(page) + '#signup">Create a free account</a></div>';
    body.classList.add('fx-locked');
  }
  function open() { card.remove(); body.classList.remove('fx-locked'); window.dispatchEvent(new Event('resize')); }
  var tries = 0;
  (function wait() {
    if (window.FCAuth && window.FCAuth.onChange) {
      window.FCAuth.onChange(function (u) { if (u) open(); else { if (!card.isConnected) target.parentNode.insertBefore(card, target); locked(); } });
      return;
    }
    if (++tries > 60) return locked(); // auth could not load (offline or blocked)
    setTimeout(wait, 150);
  })();
})();
