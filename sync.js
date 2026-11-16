// Forecut cloud sync and teams (Stage 12). Loaded by auth.js once someone is signed in.
// Sync: every Forecut key in this browser is mirrored to users/{uid} in Firestore (a manifest plus chunked values), so work
// follows the person to their other devices. Last change wins; the replaced local version is kept as a conflict copy.
// Teams: teams/{id} with roles (owner, editor, viewer) and email invites; a style is shared as a package of its saved work.
const FS = "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
let F, db, U, started = false, timer = null, busy = false, status = { state: 'idle', at: null, msg: '' };
const CHUNK = 250000, MAXV = 4000000;
const SKIP = /^(fc-ai-key|fc-sync-meta|fc-device|fc-fb-|fc-brand-onb-|fc-conflict-|fc-last-backup$|fc-simple$|fc-alert-base$|fc-team-base$)/;
const META = 'fc-sync-meta';
const want = (k) => /^(fc-|pm-)/.test(k) && !SKIP.test(k);
const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36) + ':' + s.length; }
function dev() { let d = localStorage.getItem('fc-device'); if (!d) { d = Math.random().toString(36).slice(2, 10); try { localStorage.setItem('fc-device', d); } catch (e) { } } return d; }
const enc = (k) => encodeURIComponent(k).replace(/\./g, '%2E');
function setStatus(state, msg) { status = { state, at: new Date().toISOString(), msg: msg || '' }; window.dispatchEvent(new CustomEvent('fc-sync', { detail: status })); }
export function enabled() { return localStorage.getItem('fc-sync-off') !== '1'; }

// ---------- personal sync ----------
async function pull() {
  const man = await F.getDoc(F.doc(db, 'users', U.uid, 'meta', 'manifest'));
  const R = man.exists() ? (man.data().keys || {}) : {}, M = J(META, {}), changed = [];
  for (const k of Object.keys(R)) {
    if (!want(k)) continue;
    const r = R[k], m = M[k] || {}, cur = localStorage.getItem(k), lh = cur == null ? '' : hash(cur);
    if (r.h === lh) { M[k] = { h: lh, at: r.at }; continue; }
    if (m.at && r.at <= m.at) continue; // we already have this or newer locally; push will send ours
    if (r.del) { if (cur != null && lh === m.h) { localStorage.removeItem(k); changed.push(k); } M[k] = { h: '', at: r.at }; continue; }
    const parts = await Promise.all(Array.from({ length: r.n }, (_, i) => F.getDoc(F.doc(db, 'users', U.uid, 'kv', enc(k) + '~' + i))));
    const v = parts.map((p) => (p.exists() ? p.data().v : '')).join('');
    if (hash(v) !== r.h) continue; // a push from another device is still in progress
    if (cur != null && lh !== (m.h || '') && cur.length < 1000000) { // both changed: keep the replaced local copy
      const C = J('fc-conflict-index', []); const ck = 'fc-conflict-' + Date.now().toString(36); try { localStorage.setItem(ck, cur); C.unshift({ ck, key: k, at: new Date().toISOString() }); put('fc-conflict-index', C.slice(0, 8)); C.slice(8).forEach((x) => localStorage.removeItem(x.ck)); } catch (e) { }
    }
    try { NATIVE.call(localStorage, k, v); changed.push(k); M[k] = { h: r.h, at: r.at }; } catch (e) { setStatus('error', 'This browser is out of space for ' + k); }
  }
  put(META, M);
  return changed;
}
async function push() {
  const M = J(META, {}), up = {}, now = Date.now();
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i); if (!want(k)) continue;
    const v = localStorage.getItem(k), h = hash(v); if ((M[k] || {}).h === h) continue;
    if (v.length > MAXV) { setStatus('warn', k + ' is too large to sync (' + Math.round(v.length / 1e6) + ' MB). Download a backup instead.'); continue; }
    const n = Math.max(1, Math.ceil(v.length / CHUNK)), b = F.writeBatch(db);
    for (let j = 0; j < n; j++) b.set(F.doc(db, 'users', U.uid, 'kv', enc(k) + '~' + j), { k, i: j, n, v: v.slice(j * CHUNK, (j + 1) * CHUNK) });
    await b.commit(); up[k] = { h, at: now, n, dev: dev(), del: false }; M[k] = { h, at: now };
  }
  Object.keys(M).forEach((k) => { if (want(k) && M[k].h && localStorage.getItem(k) == null) { up[k] = { h: '', at: now, n: 0, del: true }; M[k] = { h: '', at: now }; } });
  if (Object.keys(up).length) { await F.setDoc(F.doc(db, 'users', U.uid, 'meta', 'manifest'), { keys: up, at: now }, { merge: true }); }
  put(META, M); return Object.keys(up).length;
}
export async function syncNow(first) {
  if (!U || !enabled() || busy) return; busy = true; setStatus('syncing');
  try {
    const ch = await pull(); const n = await push();
    setStatus('ok', (ch.length ? ch.length + ' updated from your other devices' : 'Up to date') + (n ? ' · ' + n + ' sent' : ''));
    if (ch.length && !first) notice(ch.length); else if (ch.length && first) notice(ch.length, true);
  } catch (e) { setStatus('error', e.code === 'permission-denied' ? 'Cloud sync is not allowed by the database rules yet.' : 'Could not reach the cloud: ' + (e.message || e)); }
  busy = false;
}
function notice(n, first) {
  if (document.querySelector('.fcsync-n')) return; const d = document.createElement('div'); d.className = 'fcsync-n'; d.setAttribute('role', 'status');
  d.innerHTML = '<span>' + (first ? 'Your latest work from another device was loaded.' : 'Newer work arrived from another device.') + ' Reload to see it.</span><button type="button">Reload</button><button type="button" aria-label="Dismiss">×</button>';
  const [a, b] = d.querySelectorAll('button'); a.onclick = () => location.reload(); b.onclick = () => d.remove();
  const st = document.createElement('style'); st.textContent = '.fcsync-n{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:10030;display:flex;gap:10px;align-items:center;background:#214538;color:#fff;border-radius:12px;padding:10px 12px 10px 16px;font:14px "DM Sans",sans-serif;box-shadow:0 12px 30px rgba(0,0,0,.3);max-width:calc(100% - 32px)}.fcsync-n button{border:0;border-radius:8px;padding:6px 10px;font:700 13px "DM Sans",sans-serif;cursor:pointer;background:#fff;color:#214538}.fcsync-n button+button{background:none;color:#fff;font-size:18px;padding:2px 6px}';
  document.head.appendChild(st); document.body.appendChild(d);
}
const NATIVE = Storage.prototype.setItem, NREM = Storage.prototype.removeItem;
function schedule() { if (!U || !enabled()) return; clearTimeout(timer); timer = setTimeout(() => syncNow(), 4000); }
export function setEnabled(on) { try { if (on) localStorage.removeItem('fc-sync-off'); else NATIVE.call(localStorage, 'fc-sync-off', '1'); } catch (e) { } if (on) syncNow(); setStatus(on ? 'ok' : 'off', on ? 'Sync turned on' : 'Sync is off on this device'); }
export function getStatus() { return status; }

// ---------- teams ----------
const lower = (e) => String(e || '').trim().toLowerCase();
export async function myTeams() {
  const q = await F.getDocs(F.query(F.collection(db, 'teams'), F.where('memberIds', 'array-contains', U.uid)));
  return q.docs.map((d) => Object.assign({ id: d.id }, d.data()));
}
export async function myInvites() {
  if (!U.email) return [];
  const q = await F.getDocs(F.query(F.collection(db, 'teams'), F.where('inviteEmails', 'array-contains', lower(U.email))));
  return q.docs.map((d) => Object.assign({ id: d.id }, d.data()));
}
export async function createTeam(name) {
  const d = { name: String(name).slice(0, 80), owner: U.uid, members: { [U.uid]: 'owner' }, memberIds: [U.uid], names: { [U.uid]: U.displayName || U.email || 'Owner' }, emails: { [U.uid]: lower(U.email) }, inviteEmails: [], invites: {}, created: Date.now() };
  return (await F.addDoc(F.collection(db, 'teams'), d)).id;
}
export async function invite(t, email, role) {
  email = lower(email); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Enter a valid email address.');
  await F.updateDoc(F.doc(db, 'teams', t), new F.FieldPath('invites', email), role, 'inviteEmails', F.arrayUnion(email));
}
export async function cancelInvite(t, email) { await F.updateDoc(F.doc(db, 'teams', t), new F.FieldPath('invites', email), F.deleteField(), 'inviteEmails', F.arrayRemove(email)); }
export async function accept(team) {
  const email = lower(U.email), role = team.invites[email] || 'viewer';
  await F.updateDoc(F.doc(db, 'teams', team.id), new F.FieldPath('members', U.uid), role, 'memberIds', F.arrayUnion(U.uid), new F.FieldPath('names', U.uid), U.displayName || email,
    new F.FieldPath('emails', U.uid), email, 'inviteEmails', F.arrayRemove(email), new F.FieldPath('invites', email), F.deleteField());
}
export async function setRole(t, uid, role) { await F.updateDoc(F.doc(db, 'teams', t), new F.FieldPath('members', uid), role); }
export async function removeMember(t, uid) { await F.updateDoc(F.doc(db, 'teams', t), new F.FieldPath('members', uid), F.deleteField(), 'memberIds', F.arrayRemove(uid)); }
export async function leave(t) { await removeMember(t, U.uid); }
export async function deleteTeam(t) { const s = await F.getDocs(F.collection(db, 'teams', t, 'styles')); for (const d of s.docs) { const p = await F.getDocs(F.collection(db, 'teams', t, 'styles', d.id, 'parts')); for (const x of p.docs) await F.deleteDoc(x.ref); await F.deleteDoc(d.ref); } await F.deleteDoc(F.doc(db, 'teams', t)); }
// a style package: its registry entry, every saved tool key for it, and its tracker record
function stylePackage(id) {
  const S = window.ForecutStyle, s = S.list().find((x) => x.id === id); if (!s) throw new Error('Style not found.');
  const a = S.active(); let data = {};
  if (a && a.id === id) (S.KEYS || []).forEach((k) => { const v = localStorage.getItem(k); if (v != null) data[k] = v; }); else data = J('fc-style-data-' + id, {});
  const plm = (J('fc-plm', { styles: {} }).styles || {})[id] || null;
  return { style: s, data, plm };
}
export async function listShared(t) { const q = await F.getDocs(F.collection(db, 'teams', t, 'styles')); return q.docs.map((d) => Object.assign({ id: d.id }, d.data())); }
export async function shareStyle(t, id, force) {
  const pkg = JSON.stringify(stylePackage(id)), h = hash(pkg), ref = F.doc(db, 'teams', t, 'styles', id), base = J('fc-team-base', {})[t + '/' + id];
  const cur = await F.getDoc(ref);
  if (cur.exists() && !force && cur.data().h !== (base && base.h) && cur.data().by !== U.uid) return { conflict: cur.data() };
  if (pkg.length > MAXV) throw new Error('This style’s saved work is too large to share (' + Math.round(pkg.length / 1e6) + ' MB), usually because of big images.');
  const n = Math.max(1, Math.ceil(pkg.length / CHUNK)), b = F.writeBatch(db);
  for (let j = 0; j < n; j++) b.set(F.doc(db, 'teams', t, 'styles', id, 'parts', String(j)), { v: pkg.slice(j * CHUNK, (j + 1) * CHUNK) });
  const st = stylePackage(id).style;
  b.set(ref, { name: st.name, season: st.season, rev: st.rev || 1, status: st.status, n, h, at: Date.now(), by: U.uid, byName: U.displayName || U.email || '' });
  await b.commit(); const B = J('fc-team-base', {}); B[t + '/' + id] = { h, at: Date.now() }; put('fc-team-base', B);
  return { ok: true };
}
export async function importStyle(t, id) {
  const ref = F.doc(db, 'teams', t, 'styles', id), m = await F.getDoc(ref); if (!m.exists()) throw new Error('That style is no longer shared.');
  const d = m.data(), parts = await Promise.all(Array.from({ length: d.n }, (_, i) => F.getDoc(F.doc(db, 'teams', t, 'styles', id, 'parts', String(i)))));
  const txt = parts.map((p) => p.data().v).join(''); if (hash(txt) !== d.h) throw new Error('The shared copy is being updated. Try again in a moment.');
  const pkg = JSON.parse(txt), S = window.ForecutStyle, reg = S.reg(), i = reg.list.findIndex((x) => x.id === id);
  if (i > -1) reg.list[i] = pkg.style; else reg.list.push(pkg.style); S.saveReg(reg);
  const a = S.active(); if (a && a.id === id) Object.keys(pkg.data).forEach((k) => localStorage.setItem(k, pkg.data[k])); else put('fc-style-data-' + id, pkg.data);
  if (pkg.plm) { const P = J('fc-plm', { v: 1, styles: {} }); P.styles = P.styles || {}; P.styles[id] = pkg.plm; put('fc-plm', P); }
  const B = J('fc-team-base', {}); B[t + '/' + id] = { h: d.h, at: d.at }; put('fc-team-base', B);
  return pkg.style;
}
export async function unshare(t, id) { const p = await F.getDocs(F.collection(db, 'teams', t, 'styles', id, 'parts')); for (const x of p.docs) await F.deleteDoc(x.ref); await F.deleteDoc(F.doc(db, 'teams', t, 'styles', id)); }
export function me() { return U; }

export async function start(app, auth, user) {
  if (started) return; started = true; U = user;
  F = await import(FS); db = F.getFirestore(app);
  Storage.prototype.setItem = function (k, v) { NATIVE.call(this, k, v); if (this === localStorage && want(k)) schedule(); };
  Storage.prototype.removeItem = function (k) { NREM.call(this, k); if (this === localStorage && want(k)) schedule(); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && timer) { clearTimeout(timer); syncNow(); } });
  window.FCSync = { syncNow, enabled, setEnabled, getStatus, myTeams, myInvites, createTeam, invite, cancelInvite, accept, setRole, removeMember, leave, deleteTeam, listShared, shareStyle, importStyle, unshare, me };
  window.dispatchEvent(new CustomEvent('fc-sync-ready'));
  if (enabled()) syncNow(true);
}
