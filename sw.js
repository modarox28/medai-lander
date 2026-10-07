// La landing ya no usa service worker. Este archivo reemplaza al anterior
// (que guardaba la página en caché sin actualizarla) y se elimina solo.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) await caches.delete(k);
    await self.registration.unregister();
    for (const c of await self.clients.matchAll({type: 'window'})) c.navigate(c.url);
  })());
});
