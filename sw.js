/* Suivi Paris sur l'iPhone : tout est gardé dans le téléphone à la première ouverture (l'appli, Python, les
   statistiques), pour s'ouvrir ensuite sans réseau. Une nouvelle version (VERSION, mise par outils/mobile.py)
   remplace l'ancienne. Les données ne passent jamais par ici : elles sont dans IndexedDB. */
const VERSION = "1.4.1";
const CACHE = `suivi-paris-${VERSION}`;

self.addEventListener("install", (e) => { self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((cles) => Promise.all(cles.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const garde = await cache.match(e.request, { ignoreSearch: true });
    if (garde) return garde;
    const r = await fetch(e.request);
    if (r.ok) cache.put(e.request, r.clone());
    return r;
  }));
});
