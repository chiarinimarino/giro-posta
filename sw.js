const VERSIONE = "giro-0e525b1393", CARATTERI = "giro-caratteri";
const FILE = ["./", "manifest.webmanifest", "icona-180.png", "icona-192.png", "icona-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSIONE)
    .then(c => c.addAll(FILE.map(u => new Request(u, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(n => n !== VERSIONE && n !== CARATTERI).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET") return;
  if (u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(CARATTERI).then(c => c.match(r).then(v => v || fetch(r).then(n => {
      if (n.ok || n.type === "opaque") c.put(r, n.clone());
      return n;
    }))));
    return;
  }
  if (u.origin !== location.origin) return;
  const chiave = r.mode === "navigate" ? "./" : r;
  e.respondWith(caches.open(VERSIONE).then(c => c.match(chiave, { ignoreSearch: true })).then(v => v || fetch(r)));
});
