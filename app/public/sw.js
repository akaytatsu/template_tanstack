// Minimal service worker for PWA installability.
// No caching — just registers to meet the installability criteria.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', () => {
  self.clients.claim()
})
