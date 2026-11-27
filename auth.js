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
const FS = "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// ---- where a visitor first came from (kept in this browser; saved to the profile only for new sign-ups) ----
(function () {
  try {
    const q = new URLSearchParams(location.search), code = q.get('code');
    if (code) localStorage.setItem('fc-code', code.trim().toUpperCase());
    if (localStorage.getItem('fc-src')) return;
    let s = (q.get('utm_source') || q.get('source') || q.get('ref') || '').toLowerCase().trim();
    if (!s && document.referrer) { try { const h = new URL(document.referrer).hostname.replace(/^www\./, ''); if (!/forecut\.in$/.test(h)) s = h; } catch (e) {} }
    const map = [[/linkedin|lnkd/, 'linkedin'], [/instagram|^ig$/, 'instagram'], [/whatsapp|wa\.me/, 'whatsapp'], [/scribd/, 'scribd'], [/facebook|fb\.|^fb$/, 'facebook'], [/youtube|youtu\.be/, 'youtube'], [/google\./, 'google'], [/bing\./, 'bing'], [/chatgpt|openai/, 'chatgpt'], [/t\.co$|twitter|^x$/, 'x'], [/pinterest/, 'pinterest'], [/^app$/, 'app'], [/mail|zoho|gmail|outlook/, 'email']];
    if (s) { const m = map.find(([r]) => r.test(s)); s = m ? m[1] : s.slice(0, 40); } else s = 'direct';
    localStorage.setItem('fc-src', JSON.stringify({ source: s, landing: location.pathname.slice(0, 80) }));
  } catch (e) {}
})();
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
  auth, msg, app,
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
  onChange: (fn) => onAuthStateChanged(auth, fn),
  // access granted by Forecut (student, alumni, partner…): { plan, until, note } or null
  myAccess: async () => {
    const u = auth.currentUser; if (!u) return null;
    try {
      const F = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
      const d = await F.getDoc(F.doc(F.getFirestore(app), 'access', u.uid));
      return d.exists() ? d.data() : null;
    } catch (e) { return null; }
  },
  // access code (e.g. NIFT2026): checks codes/{CODE} and, if valid and better than what the member has, writes their access
  redeem: async (raw) => {
    const u = auth.currentUser; if (!u) throw Error('Please sign in first.');
    const code = String(raw || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, ''); if (!code) throw Error('Please enter a code.');
    const F = await import(FS), db = F.getFirestore(app);
    let c; try { c = await F.getDoc(F.doc(db, 'codes', code)); } catch (e) { throw Error('That code could not be checked. Please try again.'); }
    if (!c.exists() || !c.data().active) throw Error('That code is not valid. Check the spelling, or ask the person who shared it.');
    const d = c.data(); if (d.closesMs && Date.now() > d.closesMs) throw Error('That code has closed.');
    const cur = await F.getDoc(F.doc(db, 'access', u.uid)), a = cur.exists() ? cur.data() : null;
    if (a && a.plan && a.plan !== 'free' && (!a.until || (d.until && a.until >= d.until))) return { plan: a.plan, until: a.until || '', already: true };
    const rec = { plan: d.plan, until: d.until || '', note: 'Code ' + code, by: u.uid, at: new Date().toISOString(), code };
    await F.setDoc(F.doc(db, 'access', u.uid), rec);
    return { plan: rec.plan, until: rec.until };
  },
  // access request (student, alumni, faculty…): one per member, reviewed on the admin page
  requestAccess: async (d) => {
    const u = auth.currentUser; if (!u) throw Error('Please sign in first.');
    const F = await import(FS), cut = (v, n) => String(v || '').trim().slice(0, n);
    const rec = { uid: u.uid, email: (u.email || '').toLowerCase(), name: u.displayName || '', role: cut(d.role, 40), college: cut(d.college, 120), course: cut(d.course, 80), year: cut(d.year, 20), message: cut(d.message, 600), at: new Date().toISOString(), status: 'new' };
    await F.setDoc(F.doc(F.getFirestore(app), 'requests', u.uid), rec);
    return rec;
  },
  myRequest: async () => {
    const u = auth.currentUser; if (!u) return null;
    try { const F = await import(FS); const r = await F.getDoc(F.doc(F.getFirestore(app), 'requests', u.uid)); return r.exists() ? r.data() : null; } catch (e) { return null; }
  },
  // feedback goes to the Firestore "feedback" collection; if that is not available, it opens an email instead
  sendFeedback: async (d) => {
    const u = auth.currentUser, doc = Object.assign({}, d, { uid: u ? u.uid : '', email: u ? u.email || '' : '', name: u ? u.displayName || '' : '', page: location.pathname, at: new Date().toISOString(), ua: navigator.userAgent.slice(0, 200) });
    try {
      const F = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
      await F.addDoc(F.collection(F.getFirestore(app), 'feedback'), doc);
      return 'saved';
    } catch (e) {
      const body = 'Rating: ' + (doc.rating || '-') + '/5\nRole: ' + (doc.role || '-') + '\nUses: ' + (doc.uses || []).join(', ') + '\n\nWhat to improve:\n' + (doc.improve || '') + '\n\nFeature wished for:\n' + (doc.wish || '') + '\n\nAccount: ' + doc.email;
      location.href = 'mailto:hello@forecut.in?subject=' + encodeURIComponent('Forecut feedback (1 year free access)') + '&body=' + encodeURIComponent(body);
      return 'mail';
    }
  }
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
  const slot = document.getElementById('fc-account-slot');
  if (slot) { slot.classList.add('fca'); return slot; }
  const nl = document.getElementById('navlinks');
  if (nl) { nl.querySelectorAll('a[href*="account.html"]').forEach(a => { a.style.display = 'none'; }); const w = document.createElement('span'); w.className = 'fca'; w.style.marginLeft = '12px'; const mb = nl.parentNode.querySelector('.menu'); nl.parentNode.insertBefore(w, mb || nl.nextSibling); return w; }
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
// cloud sync and teams load only for signed-in people
onAuthStateChanged(auth, (u) => { if (u) import('/sync.js').then((m) => m.start(app, auth, u)).catch(() => {}); });
// ---- member profile for the admin page: name, email, sign-up date and last visit (written at most once a day) ----
onAuthStateChanged(auth, async (u) => {
  if (!u) return;
  const day = new Date().toISOString().slice(0, 10), k = 'fcp-seen-' + u.uid;
  try { if (localStorage.getItem(k) === day) return; } catch (e) {}
  try {
    const F = await import(FS);
    await F.setDoc(F.doc(F.getFirestore(app), 'profiles', u.uid), {
      uid: u.uid, email: (u.email || '').toLowerCase(), name: u.displayName || '',
      provider: ((u.providerData || [])[0] || {}).providerId || 'password', verified: !!u.emailVerified,
      created: u.metadata && u.metadata.creationTime ? new Date(u.metadata.creationTime).toISOString() : '',
      lastSeen: new Date().toISOString(), lastPage: location.pathname,
      ...(() => { try { const c = u.metadata && u.metadata.creationTime ? new Date(u.metadata.creationTime).getTime() : 0, src = JSON.parse(localStorage.getItem('fc-src') || 'null');
        return src && c && Date.now() - c < 3 * 864e5 ? { source: src.source, landing: src.landing } : {}; } catch (e) { return {}; } })()
    }, { merge: true });
    try { localStorage.setItem(k, day); } catch (e) {}
  } catch (e) {}
});
onAuthStateChanged(auth, (u) => {
  if (u) { unlock(); const cta = document.querySelector('header.hero#top .cta a[href*="account"]'); if (cta) { cta.textContent = 'My saved details'; cta.href = '/account.html#saved'; } } else if (wasMember) { location.reload(); return; }
  wasMember = !!u;
  if (!w) return;
  if (!u) { w.innerHTML = isAccount ? '' : `<a class="fcin" href="/account.html?next=${encodeURIComponent(location.pathname + location.hash)}">Sign in</a>`; return; }
  const name = u.displayName || (u.email || '').split('@')[0];
  const ini = (name || '?').trim().charAt(0).toUpperCase();
  w.innerHTML = `<button class="fcav" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Account menu">${w.id === 'fc-account-slot' ? `<span class="fc-avatar">${u.photoURL ? `<img src="${u.photoURL}" alt="" referrerpolicy="no-referrer">` : ini}</span><span class="fc-account-label">My account</span>` : (u.photoURL ? `<img src="${u.photoURL}" alt="" referrerpolicy="no-referrer">` : ini)}</button>
  <div class="fcm" role="menu" hidden><b></b><small></small><span class="tg">Member · all seasons unlocked</span><a href="/account.html#overview" role="menuitem">Dashboard</a><a href="/account.html#projects" role="menuitem">Projects &amp; files</a><a href="/account.html#brand" role="menuitem">Brand kit</a><a href="/account.html#account" role="menuitem">Account settings</a><button type="button" role="menuitem" class="fcout">Sign out</button></div>`;
  w.querySelector('.fcm b').textContent = name; w.querySelector('.fcm small').textContent = u.email || '';
  const b = w.querySelector('.fcav'), m = w.querySelector('.fcm');
  b.onclick = (e) => { e.stopPropagation(); m.hidden = !m.hidden; b.setAttribute('aria-expanded', String(!m.hidden)); };
  document.addEventListener('click', (e) => { if (!w.contains(e.target)) { m.hidden = true; b.setAttribute('aria-expanded', 'false'); } });
  w.addEventListener('keydown', (e) => { if (e.key === 'Escape') { m.hidden = true; b.setAttribute('aria-expanded', 'false'); b.focus(); } });
  w.querySelector('.fcout').onclick = () => signOut(auth);
});
// ---- feedback button in the header ----
(function () {
  const fxNav = document.querySelector('.fx-head nav');
  if ((!w && !fxNav) || document.querySelector('.fcfbb')) return;
  const b = document.createElement('button'); b.type = 'button'; b.className = 'fcfbb';
  b.innerHTML = '<span aria-hidden="true">★</span> Feedback<span class="fcfbx"> · 1 year free</span>';
  b.title = 'Give feedback and get 1 year of full Forecut access free';
  b.onclick = () => window.FCFeedback ? window.FCFeedback.open() : (location.href = '/account.html#signin');
  const slot = document.getElementById('fc-install-slot');
  if (slot && slot.parentNode) slot.parentNode.insertBefore(b, slot); else if (w) w.parentNode.insertBefore(b, w); else fxNav.insertBefore(b, fxNav.querySelector('.fx-signin'));
  const st = document.createElement('style');
  st.textContent = '.fcfbb{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:5px;font:700 13px "DM Sans",sans-serif;white-space:nowrap;padding:7px 13px;border-radius:999px;background:linear-gradient(135deg,#00a85a,#1fd17f);color:#fff;margin:0 8px;box-shadow:0 2px 10px rgba(0,168,90,.25)}.fcfbb:hover{filter:brightness(1.05)}.fcfbb:focus-visible{outline:2px solid #1c1714;outline-offset:2px}@media (max-width:820px){.fcfbx{display:none}.fcfbb{padding:6px 10px;margin:0 4px}}';
  document.head.appendChild(st);
})();
// ---- install app button ----
(function () {
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone || !w) return;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  let deferred = null;
  const b = document.createElement('button'); b.type = 'button'; b.className = 'fcinst'; b.innerHTML = '<span class="fcl">Get the </span>app'; b.hidden = true;
  const installSlot = document.getElementById('fc-install-slot');
  if (installSlot) { installSlot.appendChild(b); b.innerHTML = 'Install Forecut app ↗'; } else w.parentNode.insertBefore(b, w);
  const showInstall = () => { b.hidden = false; if (installSlot) installSlot.hidden = false; };
  const hideInstall = () => { b.hidden = true; if (installSlot) installSlot.hidden = true; };
  const st = document.createElement('style'); st.textContent = '.fcinst{all:unset;cursor:pointer;font:600 13.5px "DM Sans",sans-serif;color:inherit;border-bottom:1.5px solid currentColor;margin:0 10px;white-space:nowrap}.fcip{position:fixed;left:12px;right:12px;bottom:14px;z-index:9999;background:#1f3d33;color:#f5f0e8;border-radius:14px;padding:14px 16px;font:15px/1.5 "DM Sans",sans-serif;box-shadow:0 12px 30px -10px rgba(0,0,0,.5)}.fcip b{display:block}.fcip button{all:unset;cursor:pointer;float:right;font-weight:700;margin-left:10px}@media (max-width:520px){.fcinst{margin:0 4px 0 auto;font-size:12.5px}.fcinst .fcl{display:none}.fca a.fcin{padding:6px 9px!important;font-size:12.5px!important}.fca{margin-right:6px!important;margin-left:8px!important}}';
  document.head.appendChild(st);
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; showInstall(); });
  if (ios) showInstall();
  b.onclick = async () => {
    if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; hideInstall(); return; }
    const p = document.createElement('div'); p.className = 'fcip';
    p.innerHTML = '<button type="button" aria-label="Close">✕</button><b>Install Forecut</b>Tap the Share button <span aria-hidden="true">⬆︎</span> in Safari, then <b style="display:inline">Add to Home Screen</b>.';
    document.body.appendChild(p); p.querySelector('button').onclick = () => p.remove();
  };
  addEventListener('appinstalled', hideInstall);
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
      if (n >= LIMIT) { e.preventDefault(); e.stopImmediatePropagation(); gate('You have reached this month\'s free detail views.'); return; }
      try { localStorage.setItem(key, String(n + 1)); } catch (x) {}
    }
  }, true);
})();
// ---- feedback offer: shown once after sign-in (again 3 days after "Later"); 1 year of full access for feedback ----
(function () {
  const css2 = document.createElement('style');
  css2.textContent = '.fcfb{position:fixed;inset:0;z-index:10001;background:rgba(20,17,15,.6);display:grid;place-items:center;padding:16px;overflow:auto}.fcfb>form{background:#fffdf8;color:#1c1714;max-width:540px;width:100%;border-radius:18px;padding:26px 26px 22px;font:15px/1.5 "DM Sans",system-ui,sans-serif;box-shadow:0 30px 80px rgba(0,0,0,.35);position:relative}'
   + '.fcfb .bd{display:inline-block;font:700 11px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;background:linear-gradient(135deg,#00a85a,#1fd17f);color:#fff;padding:5px 11px;border-radius:99px}.fcfb h3{font:600 27px/1.15 "Source Serif 4",Georgia,serif;margin:10px 0 6px}.fcfb p{margin:0 0 14px;color:#4a3f37}.fcfb label{display:block;font:600 13px "DM Sans",sans-serif;color:#4a3f37;margin:12px 0 6px}'
   + '.fcfb textarea,.fcfb select{box-sizing:border-box;width:100%;font:15px "DM Sans",sans-serif;padding:10px 12px;border:1px solid #d8d0c3;border-radius:10px;background:#fff;color:#1c1714}.fcfb textarea{min-height:92px;resize:vertical}.fcfb .st{display:flex;gap:4px}.fcfb .st button{all:unset;cursor:pointer;font-size:30px;line-height:1;color:#d8d0c3}.fcfb .st button.on{color:#e0a21b}'
   + '.fcfb .ch{display:flex;flex-wrap:wrap;gap:6px}.fcfb .ch label{all:unset;cursor:pointer;font:600 13px "DM Sans",sans-serif;border:1px solid #d8d0c3;border-radius:99px;padding:6px 12px}.fcfb .ch input{display:none}.fcfb .ch label:has(input:checked){background:#214538;color:#fff;border-color:#214538}'
   + '.fcfb .ac{display:flex;gap:10px;align-items:center;margin-top:18px;flex-wrap:wrap}.fcfb .go2{all:unset;cursor:pointer;background:#214538;color:#fff;font-weight:700;padding:12px 20px;border-radius:12px}.fcfb .lt{all:unset;cursor:pointer;color:#6e6259;font-weight:600;padding:12px 8px}.fcfb .x{all:unset;cursor:pointer;position:absolute;top:14px;right:16px;font-size:22px;color:#8a7f76}.fcfb .er{color:#c0392b;font-size:13.5px;min-height:18px;margin:8px 0 0}.fcfb small.f{display:block;color:#8a7f76;font-size:12px;margin-top:12px}';
  document.head.appendChild(css2);
  const K = (u) => 'fc-fb-' + u.uid;
  function state(u) { try { return JSON.parse(localStorage.getItem(K(u)) || 'null'); } catch (e) { return null; } }
  function setState(u, v) { try { localStorage.setItem(K(u), JSON.stringify(v)); } catch (e) {} }
  function open(u, force) {
    if (document.querySelector('.fcfb')) return;
    const w = document.createElement('div'); w.className = 'fcfb'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); w.setAttribute('aria-label', 'Give feedback');
    w.innerHTML = '<form novalidate><button type="button" class="x" aria-label="Close">×</button><span class="bd">Get 1 year free</span><h3>Help us shape Forecut</h3><p>Tell us what works, what is missing and what we should improve. Send your feedback and get <b>1 year of full Forecut access, free</b>.</p>'
      + '<label>How useful is Forecut for you so far?</label><div class="st">' + [1, 2, 3, 4, 5].map((n) => '<button type="button" data-r="' + n + '" aria-label="' + n + ' of 5">★</button>').join('') + '</div>'
      + '<label>What do you use?</label><div class="ch">' + ['Forecasts', 'India seasons', 'Garment Studio', 'Tech pack & size charts', 'Colour & fabric tools', 'Costing tools', 'Reports & PDFs'].map((x) => '<label><input type="checkbox" value="' + x + '">' + x + '</label>').join('') + '</div>'
      + '<label for="fbr">You are a</label><select id="fbr"><option value="">Choose…</option><option>Fashion designer</option><option>Brand owner / founder</option><option>Merchandiser / buyer</option><option>Pattern maker / technician</option><option>Manufacturer / exporter</option><option>Student / educator</option><option>Other</option></select>'
      + '<label for="fbi">What should we improve or add?</label><textarea id="fbi" maxlength="3000" placeholder="Be as specific as you like: a tool, a page, a feature, a problem you hit…"></textarea>'
      + '<label for="fbw">One feature you would pay for</label><textarea id="fbw" maxlength="1000" style="min-height:60px" placeholder="Optional"></textarea>'
      + '<p class="er" role="alert"></p><div class="ac"><button type="submit" class="go2">Send feedback</button><button type="button" class="lt">Remind me later</button></div><small class="f">Signed in as ' + (u.email || '').replace(/[<>&]/g, '') + '. Your free year is added to this account after we review your feedback.</small></form>';
    document.body.appendChild(w);
    let rating = 0; const f = w.querySelector('form');
    w.querySelectorAll('[data-r]').forEach((b) => b.onclick = () => { rating = +b.dataset.r; w.querySelectorAll('[data-r]').forEach((x) => x.classList.toggle('on', +x.dataset.r <= rating)); });
    const later = () => { if (!force) setState(u, { s: 'later', at: Date.now() }); w.remove(); };
    w.querySelector('.lt').onclick = later; w.querySelector('.x').onclick = later;
    w.addEventListener('keydown', (e) => { if (e.key === 'Escape') later(); });
    f.onsubmit = async (e) => {
      e.preventDefault(); const imp = f.querySelector('#fbi').value.trim(), wish0 = f.querySelector('#fbw').value.trim();
      if ((imp + wish0).replace(/\s+/g, '').length < 8) { f.querySelector('.er').textContent = 'Please write a short note in either box so we know what to improve.'; f.querySelector('#fbi').focus(); return; }
      f.querySelector('.er').textContent = '';
      const btn = f.querySelector('.go2'); btn.textContent = 'Sending…'; btn.disabled = true;
      const r = await window.FCAuth.sendFeedback({ rating, role: f.querySelector('#fbr').value, uses: [...f.querySelectorAll('.ch input:checked')].map((x) => x.value), improve: imp, wish: f.querySelector('#fbw').value.trim(), offer: '1-year-free' });
      setState(u, { s: 'sent', at: Date.now(), via: r });
      f.innerHTML = '<span class="bd">Thank you</span><h3>Your feedback is in</h3><p>' + (r === 'mail' ? 'Your email app opened with your feedback: press send to deliver it. ' : '') + 'We read every message. Your 1 year of full Forecut access will be added to <b>' + (u.email || 'your account').replace(/[<>&]/g, '') + '</b>.</p><div class="ac"><button type="button" class="go2">Close</button></div>';
      f.querySelector('.go2').onclick = () => w.remove();
    };
    setTimeout(() => { const s1 = w.querySelector('[data-r]'); if (s1) s1.focus(); }, 50);
  }
  window.FCFeedback = { open: () => { const u = auth.currentUser; if (u) open(u, true); else location.href = '/account.html#signin'; } };
  // the automatic pop-up is switched off (owner's request, 17 Nov 2026); the header Feedback button still opens the form.
  // Set AUTO_FEEDBACK = true to show it again once after sign-in.
  const AUTO_FEEDBACK = false;
  onAuthStateChanged(auth, (u) => {
    if (!AUTO_FEEDBACK || !u || /pattern-maker|3d-drape/.test(location.pathname)) return;
    const st = state(u);
    if (st && (st.s === 'sent' || st.s === 'later' && Date.now() - st.at < 3 * 86400000)) return;
    // on the dashboard the brand set-up comes first; feedback follows when it closes
    setTimeout(() => { if (document.querySelector('.fcbrand')) document.addEventListener('fcbrand-closed', () => setTimeout(() => open(u), 600), { once: true }); else open(u); }, 2500);
  });
})();
document.dispatchEvent(new Event('fcauth-ready'));

// ---- a code from a shared link (?code=…) switches access on as soon as the person is signed in ----
onAuthStateChanged(auth, async (u) => {
  let code = ''; try { code = localStorage.getItem('fc-code') || ''; } catch (e) {}
  if (!u || !code) return;
  try { localStorage.removeItem('fc-code'); } catch (e) {}
  let t;
  try { const r = await window.FCAuth.redeem(code); const until = r.until ? new Date(r.until + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    t = r.already ? 'You already have Forecut access' + (until ? ' until ' + until : '') + '.' : 'Code ' + code + ' applied. Your ' + r.plan + ' access is on' + (until ? ' until ' + until : '') + '.'; }
  catch (e) { t = 'Code ' + code + ': ' + e.message; }
  if (!document.getElementById('fcip-css')) { const st = document.createElement('style'); st.id = 'fcip-css'; st.textContent = '.fcip{position:fixed;left:12px;right:12px;bottom:14px;z-index:9999;background:#1f3d33;color:#f5f0e8;border-radius:14px;padding:14px 16px;font:15px/1.5 "DM Sans",sans-serif;box-shadow:0 12px 30px -10px rgba(0,0,0,.5);max-width:520px;margin:0 auto}.fcip button{all:unset;cursor:pointer;float:right;font-weight:700;margin-left:10px}'; document.head.appendChild(st); }
  const p = document.createElement('div'); p.className = 'fcip'; p.setAttribute('role', 'status');
  p.innerHTML = '<button type="button" aria-label="Close">✕</button>'; p.appendChild(document.createTextNode(t)); document.body.appendChild(p);
  p.querySelector('button').onclick = () => p.remove(); setTimeout(() => p.remove(), 12000);
  window.dispatchEvent(new Event('fc-access-changed'));
});
// ---- site announcement banner, set on the admin page (config/site); read with one small request, cached for 10 minutes ----
(async function () {
  if (/^\/admin/.test(location.pathname)) return;
  let c = null;
  try { const k = JSON.parse(sessionStorage.getItem('fc-banner') || 'null'); if (k && Date.now() - k.t < 6e5) c = k.c; } catch (e) {}
  if (!c) {
    try {
      const r = await fetch('https://firestore.googleapis.com/v1/projects/forcut-forecast/databases/(default)/documents/config/site?key=AIzaSyCPG9vO5NZobpaZga7JfBa13yCstTU9uRM');
      const j = r.ok ? await r.json() : {}, f = j.fields || {}, v = (x) => x ? (x.stringValue != null ? x.stringValue : x.booleanValue) : '';
      c = { on: !!v(f.on), text: v(f.text) || '', link: v(f.link) || '', label: v(f.label) || '', tone: v(f.tone) || 'green', ends: v(f.ends) || '', off: v(f.off) || '', offMsg: v(f.offMsg) || '' };
      try { sessionStorage.setItem('fc-banner', JSON.stringify({ t: Date.now(), c })); } catch (e) {}
    } catch (e) { return; }
  }
  // tool paused from the admin page: show a short notice in place of the tool (a convenience switch, not a security control)
  try {
    const slug = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
    if (c.off && slug && c.off.split(',').includes(slug) && !document.getElementById('fc-paused')) {
      const box = document.createElement('div'); box.id = 'fc-paused'; box.setAttribute('role', 'alert');
      box.style.cssText = 'position:fixed;inset:0;z-index:99990;display:grid;place-items:center;padding:24px;background:rgba(244,240,232,.97);font:500 16px/1.5 "DM Sans",system-ui,sans-serif;color:#1e1b18;text-align:center';
      const inner = document.createElement('div'); inner.style.cssText = 'max-width:440px';
      const h = document.createElement('h2'); h.textContent = 'This tool is paused for now'; h.style.cssText = 'font:700 24px/1.2 "DM Sans",system-ui,sans-serif;margin:0 0 10px';
      const p = document.createElement('p'); p.textContent = c.offMsg || 'We are updating it and it will be back shortly.'; p.style.margin = '0 0 18px';
      const a = document.createElement('a'); a.href = '/tools'; a.textContent = 'See all tools'; a.style.cssText = 'display:inline-block;padding:11px 20px;border-radius:99px;background:#214538;color:#fff;font-weight:700;text-decoration:none';
      inner.append(h, p, a); box.appendChild(inner); document.body.appendChild(box);
    }
  } catch (e) {}
  if (!c.on || !c.text || (c.ends && c.ends < new Date().toISOString().slice(0, 10))) return;
  const key = 'fc-banner-x-' + c.text.length + '-' + c.text.slice(0, 24);
  try { if (localStorage.getItem(key)) return; } catch (e) {}
  const safe = /^(https:\/\/|\/)/.test(c.link) ? c.link : '';
  const b = document.createElement('div'); b.className = 'fcban fcban-' + (c.tone === 'clay' ? 'clay' : 'green'); b.setAttribute('role', 'region'); b.setAttribute('aria-label', 'Announcement');
  const sp = document.createElement('span'); sp.textContent = c.text; b.appendChild(sp);
  if (safe) { const a = document.createElement('a'); a.href = safe; a.textContent = c.label || 'Find out more'; b.appendChild(a); }
  const x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'Close announcement'); x.textContent = '✕'; b.appendChild(x);
  x.onclick = () => { b.remove(); try { localStorage.setItem(key, '1'); } catch (e) {} };
  const st = document.createElement('style');
  st.textContent = '.fcban{display:flex;gap:10px 14px;align-items:center;justify-content:center;flex-wrap:wrap;padding:9px 44px 9px 16px;font:600 14px/1.4 "DM Sans",system-ui,sans-serif;text-align:center;position:relative;z-index:50}.fcban-green{background:#1f3d33;color:#f5f0e8}.fcban-clay{background:#a9481f;color:#fff}.fcban a{color:inherit;text-decoration:underline;text-underline-offset:3px;white-space:nowrap}.fcban button{all:unset;cursor:pointer;position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:15px;padding:4px 6px}.fcban button:focus-visible,.fcban a:focus-visible{outline:2px solid currentColor;outline-offset:2px}';
  document.head.appendChild(st); document.body.prepend(b);
})();
