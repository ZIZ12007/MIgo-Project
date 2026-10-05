const CACHE_NAME = 'migo-offline-cache-v1';

// Core static assets to pre-cache immediately
const PRECACHE_URLS = [
  '/',
  '/index.html',
];

// Install Event: open cache and cache entrypoints
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[MIGO SW] Pre-caching core entrypoints');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event: clear legacy caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[MIGO SW] Cleaning old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[MIGO SW] Activated and controlling clients.');
      return self.clients.claim();
    })
  );
});

// Fetch Event: network first, caching the successful responses, with cache fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // We only intercept GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension, dev-server WebSockets, and non-http protocols
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Let local mock router handle API responses
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // If the request was successful, cache a clone of the response
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline or request failed: try to resolve from the cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Single Page App fallback: if navigating to a page, serve index.html
          if (request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }

          // Fallback response for missing assets
          return new Response('MIGO Offline: Resource not cached.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
      })
  );
});
