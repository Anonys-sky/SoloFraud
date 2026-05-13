/**
 * ScamShield Service Worker (v2)
 */

const CACHE_NAME = 'scamshield-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/offline',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k))))
  );
  self.clients.claim();
});

function offlineNavigateFallback() {
  const html =
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline</title></head><body><p>You are offline. <a href="/">Home</a></p></body></html>';
  return new Response(html, {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Filter out non-http schemes and API calls
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.pathname.startsWith('/api/')) return;
  // Next.js dev server + HMR: never intercept (avoids broken chunks / Turbopack)
  if (url.pathname.startsWith('/_next/')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/offline').then((r) => r || offlineNavigateFallback());
        }
        return new Response('Network error occurred', {
          status: 408,
          statusText: 'Network Error',
        });
      });
    })
  );
});
