// Mission service worker. __PRECACHE__ and __VERSION__ are filled in by scripts/postbuild.mjs.
// Offline after first load: precache the built files, serve cache-first, navigations fall back to index.html.
const VERSION = '1407631bfb'
const PRECACHE = JSON.parse('["./","./apple-touch-icon.png","./assets/index-BxyCb9zv.js","./assets/index-CIb0idwz.css","./fighter.jpg","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./index.html","./manifest.webmanifest"]')
const CACHE = `mission-${VERSION}`
const scope = self.registration.scope
const abs = (p) => new URL(p, scope).href

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE.map((p) => new Request(abs(p), { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('mission-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || !req.url.startsWith(scope)) return
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit
      return fetch(req).catch(() =>
        req.mode === 'navigate' ? caches.match(abs('./index.html')) : Response.error(),
      )
    }),
  )
})
