// Forecut service worker: app shell offline, fresh pages when online.
const V = 'forecut-v1';
const CORE = ['/', '/india.html', '/aw26.html', '/reports.html', '/journal.html', '/offline.html', '/fonts/dm-sans.woff', '/fonts/source-serif-4.woff', '/favicon-192.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (r.mode === 'navigate' || u.pathname.endsWith('.html') || u.pathname === '/') {
    e.respondWith(fetch(r).then((res) => { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); return res; })
      .catch(() => caches.match(r).then((m) => m || caches.match('/offline.html'))));
    return;
  }
  if (/\/(img|fonts)\//.test(u.pathname) || /\.(png|webp|svg|woff)$/.test(u.pathname)) {
    e.respondWith(caches.match(r).then((m) => m || fetch(r).then((res) => { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); return res; })));
  }
});
