// service-worker.js

const CACHE_NAME = 'intersolar-cache-v2';
const URLS_TO_CACHE = [
  '/',                    // pour navigation racine
  '/index.html',
  '/offline.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/db.js',
  '/js/ui.js',
  '/data/exposants.json',
  '/img/logo.png'
];

// Install : mise en cache des assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

// Activate : purge des anciens caches et prise de contrôle rapide
self.addEventListener('activate', event => {
  clients.claim();
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

// Fetch : stratégie cache-first + fallback offline.html
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(networkRes => {
          // Cache des ressources du même domaine
          if (networkRes && networkRes.status === 200 && event.request.url.startsWith(self.location.origin)) {
            const respClone = networkRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
          }
          return networkRes;
        })
        .catch(() => {
          // Si navigation HTML échoue => offline page
          if (event.request.mode === 'navigate' ||
              (event.request.headers.get('accept') || '').includes('text/html')) {
            return caches.match('/offline.html');
          }
        });
    })
  );
});
