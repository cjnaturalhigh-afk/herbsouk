/* The Herb Souk™ - Service Worker v10.5 - CACHE BUSTED */
/* This version clears all old caches and serves fresh content */

const CACHE_VERSION = 'herbsouk-v10.5-fresh';

// On install - clear everything old
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

// On activate - delete ALL old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          console.log('Deleting cache:', key);
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// On fetch - ALWAYS go to network, never serve from cache
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});
