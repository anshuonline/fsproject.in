// FreeSong.in — PWA Service Worker
const CACHE_NAME = 'freesong-pwa-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/freesonglogowebp.webp'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event listener required by Chrome/Edge for PWA installability.
// IMPORTANT: only same-origin GET requests are managed. Cross-origin traffic
// (ad network scripts, CDN assets, media) MUST pass through untouched —
// intercepting them breaks ad units (opaque responses / network errors).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  let requestUrl;
  try {
    requestUrl = new URL(event.request.url);
  } catch {
    return;
  }

  // Cross-origin: never intercept (ads, ad CDNs, Google Fonts, Saavn CDN...)
  if (requestUrl.origin !== self.location.origin) return;

  // Same-origin API & dev-server paths: never intercept
  const p = requestUrl.pathname;
  if (
    p.startsWith('/api/') ||
    p.startsWith('/src/') ||
    p.startsWith('/@vite/') ||
    p.startsWith('/@react-refresh') ||
    p.startsWith('/@id/')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          // Never resolve with undefined — always a valid Response
          return new Response('', { status: 504, statusText: 'Offline' });
        });
      })
  );
});
