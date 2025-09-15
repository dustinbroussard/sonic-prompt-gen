const CACHE_NAME = 'suno-prompt-engine-v3';
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
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
    const cached = await caches.match(req);
    try {
      const response = await fetch(req);
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
      }
      return response;
    } catch (err) {
      if (cached) return cached;
      if (req.mode === 'navigate') {
        const shell = await caches.match('/');
        if (shell) return shell;
      }
      return new Response('', { status: 504, statusText: 'Gateway Timeout' });
    }
  })());
});
