/* Suivi Paris sur l'iPhone : tout est gardé dans le téléphone à la première ouverture (l'appli, Python, les
   statistiques), pour s'ouvrir ensuite sans réseau. Les données ne passent jamais par ici : elles sont dans IndexedDB.

   EMPREINTE (mise par outils/mobile.py) change dès qu'un fichier de l'appli change, même sans nouveau numéro de
   version : ce fichier change donc lui aussi, le téléphone installe la nouvelle version et jette l'ancienne. Python
   (Pyodide, ~30 Mo) a son propre cache, gardé tant que sa version ne change pas. */
const EMPREINTE = "1.5.0-667c0d3809c2";
const CACHE = `suivi-paris-${EMPREINTE}`;
const CACHE_PYTHON = "suivi-paris-pyodide-0.27.2";

self.addEventListener("install", () => { self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((cles) => Promise.all(cles.filter((c) => c !== CACHE && c !== CACHE_PYTHON).map((c) => caches.delete(c))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (/\.zip$|extension\.json$/.test(url.pathname)) return;  // l'extension à télécharger : toujours la dernière
  const nom = url.pathname.includes("/pyodide/") ? CACHE_PYTHON : CACHE;
  e.respondWith(caches.open(nom).then(async (cache) => {
    const garde = await cache.match(e.request, { ignoreSearch: true });
    if (garde) return garde;
    const r = await fetch(e.request, { cache: "no-cache" });
    if (r.ok) cache.put(e.request, r.clone());
    return r;
  }));
});
