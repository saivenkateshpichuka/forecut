// Forecut accounts (Firebase Authentication). Loaded on every page as a module.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const app = initializeApp({
  apiKey: "AIzaSyCPG9vO5NZobpaZga7JfBa13yCstTU9uRM",
  authDomain: "forcut-forecast.firebaseapp.com",
  projectId: "forcut-forecast",
  storageBucket: "forcut-forecast.firebasestorage.app",
  messagingSenderId: "795394157690",
  appId: "1:795394157690:web:982a632ee315c3d6061fc3"
});
const auth = getAuth(app);
const google = new GoogleAuthProvider();

const ERR = {
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/missing-password': 'Please enter your password.',
  'auth/weak-password': 'Use at least 6 characters for your password.',
  'auth/email-already-in-use': 'An account already exists with this email. Try signing in.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/user-not-found': 'No account found with this email. Try signing up.',
  'auth/too-many-requests': 'Too many attempts. Please wait a minute and try again.',
  'auth/popup-closed-by-user': 'Google sign-in was closed before finishing.',
  'auth/popup-blocked': 'Your browser blocked the Google pop-up. Allow pop-ups for forecut.in and try again.',
  'auth/unauthorized-domain': 'Sign-in is not enabled for this address yet.',
  'auth/network-request-failed': 'Network problem. Check your connection and try again.'
};
const msg = (e) => ERR[e && e.code] || 'Something went wrong. Please try again.';

window.FCAuth = {
  auth, msg,
  google: () => signInWithPopup(auth, google),
  signIn: (email, pw) => signInWithEmailAndPassword(auth, email, pw),
  signUp: async (name, email, pw) => {
    const c = await createUserWithEmailAndPassword(auth, email, pw);
    if (name) await updateProfile(c.user, { displayName: name });
    try { await sendEmailVerification(c.user); } catch (e) {}
    return c;
  },
  reset: (email) => sendPasswordResetEmail(auth, email),
  signOut: () => signOut(auth),
  onChange: (fn) => onAuthStateChanged(auth, fn)
};

// ---- nav widget ----
const css = document.createElement('style');
css.textContent = `.fca{position:relative;display:inline-flex;align-items:center;flex:none}@media (min-width:821px){.fcbar{order:3;margin-left:10px}}.bar .seasons{order:2}@media (max-width:820px){.fcbar{order:1}.bar .back{order:0}.fca{margin-left:auto!important;margin-right:8px}.fca a.fcin{padding:7px 11px;font-size:13.5px}}
.fca a.fcin{font:600 14px "DM Sans",system-ui,sans-serif;text-decoration:none;color:inherit;border:1px solid currentColor;border-radius:2px;padding:8px 14px;white-space:nowrap}
.fca button.fcav{all:unset;cursor:pointer;width:34px;height:34px;border-radius:50%;background:#1f3d33;color:#f5f0e8;display:grid;place-items:center;font:700 14px "DM Sans",sans-serif;overflow:hidden}
.fca button.fcav img{width:100%;height:100%;object-fit:cover}
.fcm{position:absolute;right:0;top:44px;min-width:230px;background:#fffcf7;color:#1c1714;border:1px solid #e3d9cc;border-radius:12px;box-shadow:0 14px 34px -14px rgba(0,0,0,.35);padding:12px;z-index:999;font:14px "DM Sans",sans-serif}
.fcm b{display:block;font-size:15px}.fcm small{display:block;color:#6e6259;margin:2px 0 10px;word-break:break-all}
.fcm .tg{display:inline-block;font:700 10.5px "DM Sans",sans-serif;letter-spacing:.06em;text-transform:uppercase;background:linear-gradient(135deg,#00a85a,#1fd17f);color:#fff;padding:3px 8px;border-radius:99px;margin-bottom:10px}
.fcm a,.fcm button{all:unset;cursor:pointer;display:block;padding:8px 6px;border-radius:6px}.fcm a:hover,.fcm button:hover{background:#f3ece0}
@media (prefers-color-scheme:dark){.fcm{background:#1e1a17;color:#f2ebe2;border-color:#352d27}.fcm small{color:#b3a698}.fcm a:hover,.fcm button:hover{background:#2a2420}.fca button.fcav{background:#e8dccb;color:#1c1714}}`;
document.head.appendChild(css);

function host() {
  const nl = document.getElementById('navlinks');
  if (nl) { const w = document.createElement('span'); w.className = 'fca'; w.style.marginLeft = '12px'; const mb = nl.parentNode.querySelector('.menu'); nl.parentNode.insertBefore(w, mb || nl.nextSibling); return w; }
  const bar = document.querySelector('.bar'); if (bar) { const w = document.createElement('span'); w.className = 'fca fcbar'; bar.appendChild(w); return w; }
  const l = document.querySelector('nav .links'); if (l) { const w = document.createElement('span'); w.className = 'fca'; l.appendChild(w); return w; }
  return null;
}
const here = location.pathname.replace(/^\//, '') || 'index.html';
const isAccount = /account(\.html)?$/.test(here);
const w = host();
let wasMember = null;
function unlock() {
  document.documentElement.classList.add('fc-member');
  document.querySelectorAll('.lockpanel').forEach((e) => e.hidden = true);
  document.querySelectorAll('.lockhide').forEach((e) => e.hidden = false);
  document.querySelectorAll('.seasons a.lockt').forEach((a) => { a.classList.remove('lockt'); const sm = a.querySelector('small'); if (sm) sm.textContent = a.getAttribute('data-stage') || ''; });
  document.querySelectorAll('.sseg button[data-lock]').forEach((b) => { b.removeAttribute('data-lock'); b.removeAttribute('aria-disabled'); const bb = b.querySelector('b'); if (bb) bb.textContent = bb.textContent.replace(' 🔒', ''); });
  document.querySelectorAll('.scard.locked .stag.lock').forEach((t) => { t.className = 'stag now'; t.textContent = 'Member access'; });
  const sn = document.querySelector('#seasons .hint'); if (sn) sn.textContent = 'You have member access to every season. Thanks for joining Forecut early.';
}
onAuthStateChanged(auth, (u) => {
  if (u) unlock(); else if (wasMember) { location.reload(); return; }
  wasMember = !!u;
  if (!w) return;
  if (!u) { w.innerHTML = isAccount ? '' : `<a class="fcin" href="/account.html?next=${encodeURIComponent(location.pathname + location.hash)}">Sign in</a>`; return; }
  const name = u.displayName || (u.email || '').split('@')[0];
  const ini = (name || '?').trim().charAt(0).toUpperCase();
  w.innerHTML = `<button class="fcav" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Account menu">${u.photoURL ? `<img src="${u.photoURL}" alt="" referrerpolicy="no-referrer">` : ini}</button>
  <div class="fcm" role="menu" hidden><b></b><small></small><span class="tg">Member · all seasons unlocked</span><a href="/account.html" role="menuitem">My account</a><button type="button" role="menuitem" class="fcout">Sign out</button></div>`;
  w.querySelector('.fcm b').textContent = name; w.querySelector('.fcm small').textContent = u.email || '';
  const b = w.querySelector('.fcav'), m = w.querySelector('.fcm');
  b.onclick = (e) => { e.stopPropagation(); m.hidden = !m.hidden; b.setAttribute('aria-expanded', String(!m.hidden)); };
  document.addEventListener('click', (e) => { if (!w.contains(e.target)) { m.hidden = true; b.setAttribute('aria-expanded', 'false'); } });
  w.querySelector('.fcout').onclick = () => signOut(auth);
});
// ---- install app button ----
(function () {
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone || !w) return;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  let deferred = null;
  const b = document.createElement('button'); b.type = 'button'; b.className = 'fcinst'; b.innerHTML = '<span class="fcl">Get the </span>app'; b.hidden = true;
  w.parentNode.insertBefore(b, w);
  const st = document.createElement('style'); st.textContent = '.fcinst{all:unset;cursor:pointer;font:600 13.5px "DM Sans",sans-serif;color:inherit;border-bottom:1.5px solid currentColor;margin:0 10px;white-space:nowrap}.fcip{position:fixed;left:12px;right:12px;bottom:14px;z-index:9999;background:#1f3d33;color:#f5f0e8;border-radius:14px;padding:14px 16px;font:15px/1.5 "DM Sans",sans-serif;box-shadow:0 12px 30px -10px rgba(0,0,0,.5)}.fcip b{display:block}.fcip button{all:unset;cursor:pointer;float:right;font-weight:700;margin-left:10px}@media (max-width:520px){.fcinst{margin:0 4px 0 auto;font-size:12.5px}.fcinst .fcl{display:none}.fca a.fcin{padding:6px 9px!important;font-size:12.5px!important}.fca{margin-right:6px!important;margin-left:8px!important}}';
  document.head.appendChild(st);
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; b.hidden = false; });
  if (ios) b.hidden = false;
  b.onclick = async () => {
    if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; b.hidden = true; return; }
    const p = document.createElement('div'); p.className = 'fcip';
    p.innerHTML = '<button type="button" aria-label="Close">✕</button><b>Install Forecut</b>Tap the Share button <span aria-hidden="true">⬆︎</span> in Safari, then <b style="display:inline">Add to Home Screen</b>.';
    document.body.appendChild(p); p.querySelector('button').onclick = () => p.remove();
  };
  addEventListener('appinstalled', () => { b.hidden = true; });
})();
// ---- free trial gate: the trial (full access until 1 January 2027) is for signed-in members ----
(function () {
  let member = false, known = false;
  onAuthStateChanged(auth, (u) => { member = !!u; known = true; });
  const LIMIT = 5, key = 'fc-views-' + new Date().toISOString().slice(0, 7);
  const css = document.createElement('style');
  css.textContent = '.fcg{position:fixed;inset:0;z-index:10000;background:rgba(28,23,20,.55);display:grid;place-items:center;padding:16px}.fcg>div{background:#f5f0e8;color:#1c1714;max-width:440px;width:100%;border-radius:6px;padding:26px 24px;font:15.5px/1.55 "DM Sans",system-ui,sans-serif}.fcg small{display:block;font:600 11px "DM Sans",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#a9481f;margin-bottom:6px}.fcg h3{font:500 26px/1.15 "Source Serif 4",Georgia,serif;margin:0 0 10px}.fcg p{margin:0 0 18px;color:#4a3f37}.fcg a{display:inline-block;background:#1c1714;color:#f5f0e8;text-decoration:none;font-weight:600;padding:12px 18px;border-radius:999px;margin-right:8px}.fcg button{all:unset;cursor:pointer;font-weight:600;padding:12px 6px;color:#6e6259}';
  document.head.appendChild(css);
  function gate(why) {
    if (document.querySelector('.fcg')) return;
    const g = document.createElement('div'); g.className = 'fcg'; g.setAttribute('role', 'dialog'); g.setAttribute('aria-modal', 'true');
    g.innerHTML = '<div><small>Free trial · until 1 January 2027</small><h3></h3><p>Sign in free to unlock every season, region, report and download during the trial. It takes one tap with Google.</p><a href="/account.html?next=' + encodeURIComponent(location.pathname + location.search + location.hash) + '#signup">Sign in free</a><button type="button">Not now</button></div>';
    g.querySelector('h3').textContent = why;
    g.addEventListener('click', (e) => { if (e.target === g || e.target.tagName === 'BUTTON') g.remove(); });
    document.body.appendChild(g); g.querySelector('a').focus();
    try { if (window.gtag) gtag('event', 'trial_gate', { reason: why }); } catch (e) {}
  }
  document.addEventListener('click', (e) => {
    if (member || !known) return;
    const t = e.target.closest && e.target.closest('#vdl,#vdlpdf,a.dlpdf,a[href$=".pdf"],a[download],.dlg button,.vact .vbtn:not(.ghost):not(.savb):not(.pinb)');
    if (t) { e.preventDefault(); e.stopImmediatePropagation(); gate('Downloads are part of the free trial.'); return; }
    const d = e.target.closest && e.target.closest('.d, .lbk, .mv');
    if (d && !e.target.closest('.scrim')) {
      let n = 0; try { n = +localStorage.getItem(key) || 0; } catch (x) {}
      if (n >= LIMIT) { e.preventDefault(); e.stopImmediatePropagation(); gate('You have explored ' + LIMIT + ' details this month.'); return; }
      try { localStorage.setItem(key, String(n + 1)); } catch (x) {}
    }
  }, true);
})();
document.dispatchEvent(new Event('fcauth-ready'));
