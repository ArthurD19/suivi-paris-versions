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
    if (methode !== "GET") { await sauver(); synchroBientot(); }
    return new Response(contenu, { status: statut, headers: { "Content-Type": type, ...entetes } });
  }

  /* ------------------------------------------------------------------ synchronisation avec l'ordinateur
     Par le gist secret que l'ordinateur a créé (suivi_paris/synchro.py) : la base de chaque appareil y est compressée
     et chiffrée (AES-256-GCM) ; la clé vient du code de liaison et ne quitte pas les deux appareils. */
  const API = "https://api.github.com";
  const FICHIER_PC = "suivi-paris-pc.bin", FICHIER_IPHONE = "suivi-paris-iphone.bin";
  const lireCfg = () => { try { return JSON.parse(localStorage.getItem("synchro") || "{}"); } catch { return {}; } };
  const garderCfg = (m) => { const c = { ...lireCfg(), ...m }; try { localStorage.setItem("synchro", JSON.stringify(c)); } catch { /* plein */ } return c; };
  let erreurSynchro = null, synchroEnCours = null, minuteurSynchro = null;
  const enBase64 = (o) => { let b = ""; for (let i = 0; i < o.length; i += 0x8000) b += String.fromCharCode(...o.subarray(i, i + 0x8000)); return btoa(b); };
  const deBase64 = (t) => Uint8Array.from(atob(t), (c) => c.charCodeAt(0));
  const flux = async (octets, transformation) => new Uint8Array(await new Response(new Blob([octets]).stream().pipeThrough(transformation)).arrayBuffer());
  async function cle(cfg) { return crypto.subtle.importKey("raw", deBase64(cfg.k), "AES-GCM", false, ["encrypt", "decrypt"]); }
  async function chiffrer(cfg, octets) {
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    const c = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, await cle(cfg), await flux(octets, new CompressionStream("gzip"))));
    const tout = new Uint8Array(12 + c.length); tout.set(nonce); tout.set(c, 12);
    return enBase64(tout);
  }
  async function dechiffrer(cfg, texte) {
    const b = deBase64(texte.trim());
    let clair;
    try { clair = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b.subarray(0, 12) }, await cle(cfg), b.subarray(12)); }
    catch { throw new Error("données illisibles : relie à nouveau l'iPhone avec le code de l'ordinateur"); }
    return flux(new Uint8Array(clair), new DecompressionStream("gzip"));
  }
  async function github(cfg, methode, chemin, corps) {
    const r = await fetchReseau(API + chemin, { method: methode, headers: { Authorization: `Bearer ${cfg.t}`, Accept: "application/vnd.github+json",
      ...(corps ? { "Content-Type": "application/json" } : {}) }, body: corps ? JSON.stringify(corps) : undefined }).catch(() => null);
    if (!r) throw new Error("pas de connexion");
    if (r.status === 401 || r.status === 403) throw new Error("GitHub refuse le jeton : relie à nouveau l'iPhone");
    if (r.status === 404) throw new Error("le gist de synchronisation n'existe plus : relie à nouveau l'iPhone");
    if (!r.ok) throw new Error(`GitHub a répondu ${r.status}`);
    return r.json();
  }
  async function local(methode, chemin, corps) {
    const r = await servir(methode, new URL(chemin, location.href), corps === undefined ? null : JSON.stringify(corps));
    return r;
  }
  async function cycleSynchro() {
    let cfg = lireCfg();
    if (!cfg.g) return;
    const g = await github(cfg, "GET", `/gists/${cfg.g}`);
    const f = (g.files || {})[FICHIER_PC];
    if (f && f.content !== "vide" && f.raw_url !== cfg.pc) {
      const texte = f.truncated ? await (await fetchReseau(f.raw_url)).text() : f.content;
      const base = await dechiffrer(cfg, texte);
      const r = await local("POST", "/api/fusionner", { base: enBase64(base) });
      if (!r.ok) throw new Error((await r.json()).erreur || "fusion impossible");
      const bilan = await r.json();
      cfg = garderCfg({ pc: f.raw_url, recu_le: new Date().toISOString(), pc_vu_le: g.updated_at });
      if (bilan.paris_nouveaux || bilan.paris_mis_a_jour || bilan.comptes_nouveaux || bilan.mouvements_nouveaux) {
        window.dispatchEvent(new CustomEvent("suivi-paris-synchro", { detail: bilan }));
      }
    }
    await viderBoite(cfg, g);
    const base = new Uint8Array(await (await local("GET", "/api/sauvegarde.db")).arrayBuffer());
    const empreinte = enBase64(new Uint8Array(await crypto.subtle.digest("SHA-256", base)));
    if (empreinte !== cfg.empreinte) {
      await github(cfg, "PATCH", `/gists/${cfg.g}`, { files: { [FICHIER_IPHONE]: { content: await chiffrer(cfg, base) } } });
      garderCfg({ empreinte, envoye_le: new Date().toISOString() });
    }
  }
  /* La boîte : les pages que l'extension (Orion sur l'iPhone, ou Chrome sans l'appli de l'ordinateur) a déposées,
     chiffrées. Enregistrées ici comme si l'extension les envoyait, puis retirées (sauf compte à choisir). */
  const FICHIER_BOITE = "suivi-paris-boite.bin";
  const ROUTES_BOITE = { page: "/api/extension/importer", solde: "/api/extension/solde", mouvements: "/api/extension/mouvements" };
  async function lirePages(cfg, f) {
    if (!f || f.content === "vide") return [];
    const texte = f.truncated ? await (await fetchReseau(f.raw_url)).text() : f.content;
    return JSON.parse(new TextDecoder().decode(await dechiffrer(cfg, texte)));
  }
  async function viderBoite(cfg, g) {
    const pages = await lirePages(cfg, (g.files || {})[FICHIER_BOITE]);
    if (!pages.length) return;
    const traitees = new Set();
    let nouveaux = 0;
    for (const p of pages) {
      const corps = { texte: p.texte, bookmaker: p.bookmaker, capture_le: p.capture_le, url: p.url, compte_id: p.compte_id || null };
      let r = {};
      try { r = await (await local("POST", ROUTES_BOITE[p.type || "page"] || ROUTES_BOITE.page, corps)).json(); } catch { r = { statut: "erreur" }; }
      if (r.statut !== "choisir_compte" && r.statut !== "aucun_compte") traitees.add(p.id);
      nouveaux += r.nouveaux || 0;
    }
    if (!traitees.size) return;
    const g2 = await github(cfg, "GET", `/gists/${cfg.g}`);  // relue : l'extension a pu déposer entre-temps
    const reste = (await lirePages(cfg, (g2.files || {})[FICHIER_BOITE])).filter((p) => !traitees.has(p.id));
    const contenu = reste.length ? await chiffrer(cfg, new TextEncoder().encode(JSON.stringify(reste))) : "vide";
    await github(cfg, "PATCH", `/gists/${cfg.g}`, { files: { [FICHIER_BOITE]: { content: contenu } } });
    window.dispatchEvent(new CustomEvent("suivi-paris-synchro", { detail: { paris_nouveaux: nouveaux, paris_mis_a_jour: 0, boite: traitees.size } }));
  }
  function synchroniser() {
    if (!lireCfg().g || synchroEnCours) return synchroEnCours;
    synchroEnCours = cycleSynchro().then(() => { erreurSynchro = null; }, (e) => { erreurSynchro = String(e.message || e); })
      .finally(() => { synchroEnCours = null; });
    return synchroEnCours;
  }
  function synchroBientot() { clearTimeout(minuteurSynchro); minuteurSynchro = setTimeout(synchroniser, 5000); }
  pret.then(() => {
    synchroniser();
    setInterval(() => { if (document.visibilityState === "visible") synchroniser(); }, 90000);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") synchroniser(); });
  });
  // Les routes de la synchronisation, côté iPhone : servies ici (le Python n'en sait rien).
  function etatSynchro() {
    const c = lireCfg();
    return { actif: Boolean(c.g), mobile: true, envoye_le: c.envoye_le || null, recu_le: c.recu_le || null,
      pc_vu_le: c.pc_vu_le || null, erreur: erreurSynchro, possible: Boolean(window.crypto && crypto.subtle && window.CompressionStream) };
  }
  async function routeSynchro(methode, url, corps) {
    const json = (o, statut = 200) => new Response(JSON.stringify(o), { status: statut, headers: { "Content-Type": "application/json" } });
    if (methode === "GET") return json(etatSynchro());
    const c = corps ? JSON.parse(corps) : {};
    if (url.pathname.endsWith("/desactiver")) { try { localStorage.removeItem("synchro"); } catch { /* rien */ } return json(etatSynchro()); }
    if (!url.pathname.endsWith("/maintenant")) {
      const code = String(c.code || "").trim();
      let lien;
      try { lien = JSON.parse(atob(code.replace(/^SP1-/, "").replace(/-/g, "+").replace(/_/g, "/"))); } catch { lien = null; }
      if (!lien || !lien.g || !lien.t || !lien.k) return json({ erreur: "Code de liaison illisible : recopie-le depuis l'ordinateur (Mes données)." }, 400);
      try { localStorage.removeItem("synchro"); } catch { /* rien */ }
      garderCfg(lien);
    }
    await synchroniser();
    return erreurSynchro ? json({ erreur: `Synchronisation : ${erreurSynchro}` }, 400) : json(etatSynchro());
  }

  // Les appels de app.js à « /api/… » sont servis ici ; le reste (fichiers de l'appli) passe normalement.
  const fetchReseau = window.fetch.bind(window);
  window.fetch = async (entree, options = {}) => {
    const url = new URL(typeof entree === "string" ? entree : entree.url, location.href);
    if (!/\/api\//.test(url.pathname)) return fetchReseau(entree, options);
    if (/\/api\/synchro/.test(url.pathname)) return routeSynchro((options.method || "GET").toUpperCase(), url, options.body);
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
