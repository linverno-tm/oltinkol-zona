/* Oltinko'l zona — PWA: offline va tez qayta ochilish */
const V = "oltinkol-202610231641";
const CORE = ["/oltinkol-zona/", "/oltinkol-zona/assets/site.css?v=202610231641", "/oltinkol-zona/assets/site.js?v=202610231641"];
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(V).then(c => c.addAll(CORE).catch(() => {}))); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  if (req.mode === "navigate") return;                                 // sahifalar: to'g'ridan-to'g'ri (SW kechiktirmaydi, doim yangi)
  if (new URL(req.url).origin !== location.origin) return;             // tashqi (shrift, weserv) — brauzer o'zi
  e.respondWith(caches.match(req).then(m => m || fetch(req).then(r => { const cp = r.clone(); caches.open(V).then(c => c.put(req, cp)); return r; })));  // boyliklar: avval kesh
});
