/* Suivi Paris sur l'iPhone : l'appli entière tourne dans le navigateur du téléphone, sans serveur.

   Le code Python de l'appli (lecture des bookmakers, base, statistiques) est exécuté par Pyodide (Python compilé en
   WebAssembly). La base SQLite est gardée dans le téléphone (IndexedDB, via le système de fichiers IDBFS de
   Pyodide) et rien ne part sur Internet. Les appels « /api/… » de app.js, faits à un serveur sur l'ordinateur, sont
   ici servis par Application.repondre, le même code que le serveur. Chargé avant app.js. */
(() => {
  const DOSSIER = "/donnees";
  const ecran = document.createElement("div");
  ecran.className = "chargement-mobile";
  ecran.innerHTML = `<div><b>Suivi Paris</b><span id="chargement-texte">Préparation de l'appli…</span><div class="barre"><i></i></div>
    <p class="discret petit" style="margin-top:14px">La première fois, l'appli se télécharge (environ 30 Mo) ; ensuite elle s'ouvre même sans réseau.</p></div>`;
  const texte = (t) => { const e = document.getElementById("chargement-texte"); if (e) e.textContent = t; };
  document.addEventListener("DOMContentLoaded", () => document.body.append(ecran));

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  let py = null;
  const pret = (async () => {
    texte("Chargement de Python…");
    py = await loadPyodide({ indexURL: new URL("pyodide/", location.href).href });
    texte("Chargement des statistiques…");
    await py.loadPackage(["numpy", "pandas", "sqlite3", "python-dateutil", "pytz", "six"]);
    texte("Ouverture de tes paris…");
    py.FS.mkdirTree(DOSSIER);
    py.FS.mount(py.FS.filesystems.IDBFS, {}, DOSSIER);
    await new Promise((ok, ko) => py.FS.syncfs(true, (e) => (e ? ko(e) : ok())));
    const zip = await (await fetch("suivi_paris.zip")).arrayBuffer();
    py.unpackArchive(zip, "zip", { extractDir: "/app" });
    py.runPython(`
import os, sys, types
sys.modules.setdefault("segno", types.ModuleType("segno"))  # codes QR de l'accès réseau : sans objet ici
os.environ["SUIVI_PARIS_DONNEES"] = "${DOSSIER}"
sys.path.insert(0, "/app")
from suivi_paris import serveur
APPLI = serveur.Application("${DOSSIER}/paris.db", mobile=True)

def repondre(methode, chemin, requete, brut):
    octets = b"" if brut is None else (brut.to_bytes() if hasattr(brut, "to_bytes") else bytes(brut))
    statut, contenu, type_, entetes = APPLI.repondre(methode, chemin, requete, octets)
    return statut, contenu, type_, entetes or {}
`);
    await sauver();
    ecran.remove();
  })().catch((e) => { texte(`L'appli n'a pas pu démarrer : ${e.message || e}. Recharge la page.`); throw e; });

  // Après chaque écriture : la base est recopiée dans le stockage du téléphone.
  let enCours = Promise.resolve();
  const sauver = () => (enCours = enCours.then(() => new Promise((ok) => py.FS.syncfs(false, () => ok()))));

  async function servir(methode, url, corps) {
    await pret;
    const repondre = py.globals.get("repondre");
    const brut = corps == null ? null : typeof corps === "string" ? new TextEncoder().encode(corps) : new Uint8Array(corps);
    const r = repondre(methode, url.pathname.replace(/^.*?(\/api\/)/, "/api/"), url.search.replace(/^\?/, ""), brut);
    const [statut, contenu, type, entetes] = r.toJs({ dict_converter: Object.fromEntries });
    r.destroy();
    repondre.destroy();
    if (methode !== "GET") await sauver();
    return new Response(contenu, { status: statut, headers: { "Content-Type": type, ...entetes } });
  }

  // Les appels de app.js à « /api/… » sont servis ici ; le reste (fichiers de l'appli) passe normalement.
  const fetchReseau = window.fetch.bind(window);
  window.fetch = async (entree, options = {}) => {
    const url = new URL(typeof entree === "string" ? entree : entree.url, location.href);
    if (!/\/api\//.test(url.pathname)) return fetchReseau(entree, options);
    return servir((options.method || "GET").toUpperCase(), url, options.body);
  };

  // Les liens de téléchargement (sauvegarde, CSV, page publique) : le fichier passe par le menu de partage.
  document.addEventListener("click", async (e) => {
    const a = e.target.closest("a[href*='/api/']");
    if (!a) return;
    e.preventDefault();
    const r = await window.fetch(a.getAttribute("href"));
    const nom = (/filename="([^"]+)"/.exec(r.headers.get("Content-Disposition") || "") || [])[1] || "suivi-paris";
    const fichier = new File([await r.blob()], nom, { type: r.headers.get("Content-Type") || "application/octet-stream" });
    if (navigator.canShare && navigator.canShare({ files: [fichier] })) {
      try { await navigator.share({ files: [fichier], title: nom }); return; } catch (err) { if (err && err.name === "AbortError") return; }
    }
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(fichier);
    lien.download = nom;
    lien.click();
    setTimeout(() => URL.revokeObjectURL(lien.href), 10000);
  }, true);
})();
