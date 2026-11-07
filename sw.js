/* Dakkhota service worker
   - app files & chapter data: network-first (always newest when online, works offline from cache)
   - book page images & fonts: cache-first (fast, saved for offline reading)
   Bump VERSION whenever app.js / style.css / index.html change. */
const VERSION = 'dk-2026-11-07-24';
const DATA = Array.from({ length: 12 }, (_, i) => 'data/acc/ch' + String(i + 1).padStart(2, '0') + '.js').concat(['data/acc/mt.js', 'data/acc/mcq.js']);
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'data/books.js', 'manifest.webmanifest',
  'img/brand/icon-192.png', 'img/brand/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL).then(() =>
    // chapter text is small: save all chapters for offline reading (failures are ignored)
    Promise.all(DATA.map(u => c.add(u).catch(() => null))))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== 'dk-media').map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function networkFirst(req) {
  return fetch(req).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())));
}

function cacheFirst(req) {
  return caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open('dk-media').then(c => c.put(req, copy)); }
    return res;
  }));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.includes('fonts.g')) return e.respondWith(cacheFirst(req));
  if (url.origin !== location.origin) return;
  if (/\/img\//.test(url.pathname)) return e.respondWith(cacheFirst(req));
  e.respondWith(networkFirst(req));
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
