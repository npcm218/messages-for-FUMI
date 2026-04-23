const CACHE_NAME = 'message-app-v4';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// messages.js はキャッシュしない（更新がすぐ反映されるように）
const NO_CACHE = ['messages.js'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // messages.js は常にネットワークから取得
  if (NO_CACHE.some(f => event.request.url.includes(f))) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request);
      })
      .catch(() => caches.match('./index.html'))
  );
});

self.addEventListener('activate', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});
