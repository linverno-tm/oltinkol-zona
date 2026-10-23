/* Service worker o'chirildi — keshsiz, sayt doim yangi (23.10) */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) { try { await caches.delete(k); } catch (x) {} }
    try { await self.registration.unregister(); } catch (x) {}
    for (const c of await self.clients.matchAll()) { try { c.navigate(c.url); } catch (x) {} }
  })());
});
