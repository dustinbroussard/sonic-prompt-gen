const CACHE_NAME = 'suno-prompt-engine-v3';

const BASE_URL = (() => {
  const { pathname } = self.location;
  return pathname.endsWith('sw.js')
    ? pathname.slice(0, -'sw.js'.length)
    : new URL('./', self.location).pathname;
})();

const PRECACHE = [
  BASE_URL,
  `${BASE_URL}index.html`,
  `${BASE_URL}manifest.webmanifest`,
  `${BASE_URL}pwa-192x192.png`,
  `${BASE_URL}pwa-512x512.png`,
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  const hasAuth = req.headers && req.headers.get('authorization');

  // Avoid caching cross-origin or auth requests
  if (!isSameOrigin || hasAuth) return;

  // Avoid intercepting dev-server module requests (e.g., /src/, /@vite/)
  if (url.pathname.startsWith('/src/') || url.pathname.startsWith('/@vite')) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(req);

    const networkFetch = fetch(req)
      .then((response) => {
        if (response && response.status === 200) {
          cache.put(req, response.clone());
        }
        return response;
      })
      .catch(() => null);

    if (cachedResponse) {
      event.waitUntil(networkFetch.then(() => undefined));
      return cachedResponse;
    }

    const networkResponse = await networkFetch;
    if (networkResponse) {
      return networkResponse;
    }

    if (req.mode === 'navigate') {
      const shell = await cache.match(new URL(BASE_URL, self.location.origin));
      if (shell) return shell;

      const shellHtml = await cache.match(new URL(`${BASE_URL}index.html`, self.location.origin));
      if (shellHtml) return shellHtml;
    }

    return new Response('', { status: 504, statusText: 'Gateway Timeout' });
  })());
});
