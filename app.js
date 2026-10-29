"use strict";

/* ===================================================================== outils */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const fmtEuros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtEurosRond = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const fmtNombre = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const fmtPct2 = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
const fmtDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });
const fmtDateCourte = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
const fmtDateHeure = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

function euros(x, { signe = false, rond = false } = {}) {
  if (x === null || x === undefined || Number.isNaN(x)) return "—";
  const texte = (rond ? fmtEurosRond : fmtEuros).format(Math.abs(x));
  if (!signe) return x < 0 ? "−" + texte : texte;
  return (x > 0 ? "+" : x < 0 ? "−" : "") + texte;
}
function pct(ratio, { signe = true } = {}) {
  if (ratio === null || ratio === undefined) return "—";
  const v = ratio * 100;
  const t = fmtNombre.format(Math.abs(v)) + " %";
  if (!signe) return t;
  return (v > 0 ? "+" : v < 0 ? "−" : "") + t;
}
/* La date de l'événement (quand le site la donne : le jour où le pari compte), sinon celle du pari. */
function dateEvenement(l) {
  if (!l.date_evenement) return null;
  const d = new Date(l.date_evenement);
  return l.evenement_heure === false ? fmtDate.format(d) : fmtDateHeure.format(d);
}
function celluleDate(l) {
  const evt = dateEvenement(l);
  const pris = fmtDateHeure.format(new Date(l.date_pari));
  return evt ? `<b title="Date de l'événement">${esc(evt)}</b><div class="discret">pris le ${esc(pris)}</div>`
    : `<span title="Date du pari : le site n'affiche pas celle de l'événement">${esc(pris)}</span>`;
}
const pctPoints = (v, o) => (v === null || v === undefined ? "—" : pct(v / 100, o));
const classeSigne = (x) => (x > 0 ? "gain" : x < 0 ? "perte" : "");
const dateFr = (iso) => (iso ? fmtDate.format(new Date(iso)) : "—");
const initiale = (nom) => (nom || "?").trim().charAt(0).toUpperCase();

const SPORTS = {
  Cyclisme: ["🚴", "#F5B700"], Tennis: ["🎾", "#E2663B"], "Tennis de table": ["🏓", "#C2410C"], Football: ["⚽", "#2F80ED"], Basketball: ["🏀", "#1FB5A8"],
  Moto: ["🏍️", "#EB4D7C"], Ski: ["⛷️", "#3BA3D9"], "Sports d'hiver": ["⛸️", "#6CB4E8"], Golf: ["⛳", "#2E9E5B"], MMA: ["🥊", "#B23A48"], "Formule 1": ["🏎️", "#3D3D5C"], "Athlétisme": ["🏃", "#00A3E0"],
  "Hockey sur glace": ["🏒", "#7A8CA8"], Rugby: ["🏉", "#8B5E3C"], Handball: ["🤾", "#A35BE0"], Judo: ["🥋", "#6B7280"], Rallye: ["🚗", "#B7791F"],
  "Volley-ball": ["🏐", "#F2994A"], "Football américain": ["🏈", "#9C6644"], Boxe: ["🥊", "#D64545"],
  Biathlon: ["🎯", "#2D9CDB"], "Ski alpin": ["⛷️", "#3BA3D9"], "Ski de fond": ["🎿", "#56CCF2"],
  Combiné: ["🧩", "#5B3DF5"], "Multi-sports": ["🧩", "#5B3DF5"], Autre: ["🎯", "#A7A3BF"], Inconnu: ["🎯", "#A7A3BF"],
};
const sportEmoji = (s) => (SPORTS[s] || SPORTS.Autre)[0];
const sportCouleur = (s) => (SPORTS[s] || SPORTS.Autre)[1];
/* Pastilles des bookmakers : une initiale sur une couleur. Une image déposée dans le dossier « logos » des données
   (betclic.png…) la remplace. */
const BOOKMAKERS_STYLE = { betclic: ["B", "#E4002B"], winamax: ["W", "#16141F"], unibet: ["U", "#147B45"], ps3838: ["PS", "#0B2D5B"], pmu: ["P", "#00843D"], bet365: ["365", "#126E51"], piwi247: ["PW", "#14305E"], olybet: ["O", "#D98E04"], bwin: ["bw", "#1E1E1E"], sportaza: ["SZ", "#5B2BE0"], netbet: ["NB", "#C8102E"], orbitx: ["OX", "#7BB51E"] };
const FAMILLES_EMOJI = {
  Cyclisme: "🚴", "Sports collectifs": "⚽", Raquettes: "🎾", "Sports mécaniques": "🏎️", "Sports d'hiver": "⛷️",
  Combat: "🥊", Combinés: "🧩", "Autres sports": "🎯",
};
const FAMILLES_COULEUR = {
  Cyclisme: "#F5B700", "Sports collectifs": "#2F80ED", Raquettes: "#E2663B", "Sports mécaniques": "#EB4D7C", "Sports d'hiver": "#3BA3D9",
  Combat: "#B23A48", Combinés: "#5B3DF5", "Autres sports": "#A7A3BF",
};
/* Monnaie d'un compte : les montants du bookmaker restent dans sa monnaie (ceux que l'on tape aussi), les chiffres de
   l'appli sont en euros, au taux fixé dans Comptes. */
const DEVISES = { EUR: "€", CHF: "CHF", GBP: "£", USD: "$" };
const symboleDevise = (d) => DEVISES[d || "EUR"] || d;
const COULEURS = ["#5B3DF5", "#FF8A3D", "#16A6B6", "#E85D9E", "#F5B700", "#2F80ED", "#A35BE0", "#7A8CA8"];
const LIBELLES_ETATS = { gagne: "Gagné", perdu: "Perdu", en_cours: "En cours", annule: "Annulé", cashout: "Cash-out", inconnu: "Inconnu" };

/* Une couleur en transparence : un fond d'emblème qui va au thème clair comme au sombre. */
function teinte(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
function eclaircir(hex, t) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * t));
  return `rgb(${c.join(",")})`;
}
/* Où en est l'enregistrement d'un compte : depuis quand, et le dernier pari enregistré (le plus récent). */
function nbParisDepuis(c) {
  return `${c.n_paris} pari${c.n_paris > 1 ? "s" : ""}${c.premier_pari ? ` depuis le ${dateFr(c.premier_pari)}` : ""}`;
}
function dernierPari(c) {
  const d = c.dernier;
  if (!d) return "";
  return `<small class="repere" title="${esc(`${d.resume} (réf. ${d.reference})`)}">Dernier : <b>${fmtDateHeure.format(new Date(d.date_pari))}</b> · ${esc(d.resume)}</small>`;
}

function avatar(compte, mini = false) {
  return `<span class="avatar${mini ? " mini" : ""}" style="background:${esc(compte.couleur)}" aria-hidden="true">${esc(initiale(compte.nom))}</span>`;
}

/* Le navigateur ne dit que « Failed to fetch » quand le serveur ne répond plus : la fenêtre de l'appli a été
   fermée (le serveur s'arrête avec elle) ou l'ordinateur est en veille. */
const HORS_LIGNE = "L'application ne répond plus : elle a sans doute été fermée. Relance-la depuis le raccourci du bureau, puis recharge cette page.";

async function api(chemin, { methode = "GET", corps } = {}) {
  const options = { method: methode, headers: { "X-Suivi-Paris": "1" } };
  if (corps !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(corps);
  }
  const reponse = await fetch(chemin, options).catch(() => {
    throw new Error(HORS_LIGNE);
  });
  const donnees = await reponse.json().catch(() => ({}));
  if (reponse.status === 401) { location.href = "/connexion.html"; throw new Error(donnees.erreur || "Session expirée"); }
  if (!reponse.ok) throw new Error(donnees.erreur || `Erreur ${reponse.status}`);
  return donnees;
}

function toast(message, erreur = false) {
  const el = document.createElement("div");
  el.className = "toast" + (erreur ? " erreur" : "");
  el.textContent = message;
  $("#toasts").append(el);
  setTimeout(() => el.remove(), erreur ? 7000 : 4000);
}

/* ===================================================================== état global */
const etat = {
  app: null,
  graphes: [],
  dejaAnime: false,
  filtres: { periode: "tout", debut: "", fin: "", comptes: new Set(), sports: new Set() },
  vueCourbe: "total",
  vueSports: "familles",
  menuOuvert: null,
  onglet: "type",
  import: { compte_id: null, texte: "", analyse: null, minuteur: null },
  paris: { recherche: "", page: 1, comptes: new Set(), etats: new Set(), sports: new Set(), partages: false },
};
const compteParId = (id) => etat.app.comptes.find((c) => c.id === id);

function logoBk(nom, taille = "") {
  const b = (etat.app.bookmakers || []).find((x) => x.nom === nom);
  if (b && b.logo) return `<img class="logo-bk ${taille}" src="/api/logo/${encodeURIComponent(nom)}" alt="" aria-hidden="true">`;
  const [lettre, couleur] = BOOKMAKERS_STYLE[nom] || [((b && b.libelle) || nom || "?").charAt(0).toUpperCase(), "#6E6890"];
  return `<span class="logo-bk ${taille}" style="--bk:${couleur}" aria-hidden="true">${esc(lettre)}</span>`;
}

/* ----------------------------------------------------- menus à deux niveaux (bookmaker → comptes, famille → sports)
   `selection` est un Set des valeurs choisies ; vide, tout est affiché. */
function groupesComptes() {
  return etat.app.bookmakers.map((b) => ({
    libelle: b.libelle, icone: logoBk(b.nom),
    enfants: etat.app.comptes.filter((c) => c.bookmaker === b.nom && c.n_paris)
      .map((c) => ({ valeur: c.id, libelle: `${avatar(c, true)}${esc(c.nom)}` })),
  })).filter((g) => g.enfants.length);
}

/* Les paris sans sport attribué (« Autre », « Inconnu ») : à corriger à la main, ils ont leur propre groupe. */
const SANS_SPORT = ["Autre", "Inconnu"];
const sansSportPresents = () => (etat.app.familles || []).flatMap((f) => f.sports).filter((s) => SANS_SPORT.includes(s));

function groupesSports() {
  const sans = sansSportPresents();
  const groupes = (etat.app.familles || []).map((f) => ({
    libelle: f.nom, icone: `<span class="emoji-famille" style="background:${teinte(FAMILLES_COULEUR[f.nom] || "#A7A3BF", 0.22)}">${FAMILLES_EMOJI[f.nom] || "🎯"}</span>`,
    enfants: f.sports.filter((sp) => !SANS_SPORT.includes(sp)).map((sp) => ({ valeur: sp, libelle: `${sportEmoji(sp)} ${esc(sp)}` })),
  })).filter((g) => g.enfants.length);
  if (sans.length) groupes.unshift({ libelle: "Sans sport", icone: `<span class="emoji-famille">❓</span>`,
    enfants: sans.map((sp) => ({ valeur: sp, libelle: `❓ ${esc(sp)}` })) });
  return groupes;
}

function menuArbre({ id, etiquette, tous, unite, groupes, selection }) {
  const choisis = groupes.flatMap((g) => g.enfants).filter((e) => selection.has(e.valeur));
  let resume = tous;
  if (choisis.length) {
    const complets = groupes.filter((g) => g.enfants.every((e) => selection.has(e.valeur)));
    const partiels = groupes.filter((g) => g.enfants.some((e) => selection.has(e.valeur)) && !complets.includes(g));
    resume = !partiels.length && complets.length <= 2 ? complets.map((g) => g.libelle).join(", ")
      : choisis.length === 1 ? choisis[0].libelle.replace(/<[^>]*>/g, "").trim() : `${choisis.length} ${unite}`;
  }
  const ouvert = etat.menuOuvert === id;
  return `<div class="menu-arbre" data-menu="${id}">
    <button type="button" class="puce menu-bouton" aria-expanded="${ouvert}" aria-controls="menu-${id}" aria-pressed="${choisis.length > 0}">
      <span class="discret">${etiquette}</span> <b>${esc(resume)}</b><span class="chevron" aria-hidden="true">▾</span>
    </button>
    <div class="menu-panneau" id="menu-${id}" ${ouvert ? "" : "hidden"}>
      ${groupes.map((g) => {
        const n = g.enfants.filter((e) => selection.has(e.valeur)).length;
        return `<div class="menu-groupe">
          <button type="button" class="menu-parent" data-valeurs="${esc(JSON.stringify(g.enfants.map((e) => e.valeur)))}"
            aria-pressed="${n === g.enfants.length}" data-partiel="${n > 0 && n < g.enfants.length}">
            <span class="case" aria-hidden="true"></span>${g.icone}<span class="menu-nom">${esc(g.libelle)}</span>
            ${g.enfants.length > 1 ? `<small>${g.enfants.length} ${unite}</small>` : String(g.enfants[0].valeur) === g.libelle ? "" : `<small>${g.enfants[0].libelle}</small>`}
          </button>
          ${g.enfants.length > 1 ? `<div class="menu-enfants">${g.enfants.map((e) =>
            `<button type="button" class="puce mini" data-valeur="${esc(JSON.stringify(e.valeur))}" aria-pressed="${selection.has(e.valeur)}">${e.libelle}</button>`).join("")}</div>` : ""}
        </div>`;
      }).join("")}
      <div class="menu-pied">
        <button type="button" class="bouton fantome" data-menu-raz ${choisis.length ? "" : "disabled"}>Tout afficher</button>
        <button type="button" class="bouton" data-menu-fermer>OK</button>
      </div>
    </div>
  </div>`;
}

// Le panneau s'ouvre sous le bouton, vers la droite, ou vers la gauche s'il dépasserait de l'écran.
function placerMenu(panneau) {
  panneau.classList.remove("a-gauche");
  if (getComputedStyle(panneau).position === "fixed") return;
  if (panneau.getBoundingClientRect().right > document.documentElement.clientWidth - 12) panneau.classList.add("a-gauche");
}

function brancherMenu(racine, id, selection, relancer) {
  const menu = $(`[data-menu="${id}"]`, racine);
  if (!menu) return;
  const panneau = $(".menu-panneau", menu), bouton = $(".menu-bouton", menu);
  const basculer = (ouvrir) => {
    etat.menuOuvert = ouvrir ? id : null;
    $$(".menu-arbre", racine).forEach((m) => {
      const lui = m === menu && ouvrir;
      $(".menu-panneau", m).hidden = !lui;
      $(".menu-bouton", m).setAttribute("aria-expanded", lui);
    });
    if (ouvrir) placerMenu(panneau);
  };
  bouton.addEventListener("click", () => basculer(panneau.hidden));
  $$(".menu-parent", menu).forEach((b) => b.addEventListener("click", () => {
    const valeurs = JSON.parse(b.dataset.valeurs);
    const tout = valeurs.every((v) => selection.has(v));
    valeurs.forEach((v) => (tout ? selection.delete(v) : selection.add(v)));
    relancer();
  }));
  $$("[data-valeur]", menu).forEach((b) => b.addEventListener("click", () => {
    const v = JSON.parse(b.dataset.valeur);
    selection.has(v) ? selection.delete(v) : selection.add(v);
    relancer();
  }));
  $("[data-menu-raz]", menu).addEventListener("click", () => { selection.clear(); relancer(); });
  $("[data-menu-fermer]", menu).addEventListener("click", () => { basculer(false); bouton.focus(); });
  if (!panneau.hidden) placerMenu(panneau);
}

// Un clic ailleurs ou Échap referme le menu ouvert.
document.addEventListener("click", (e) => {
  if (etat.menuOuvert && !e.target.closest(".menu-arbre")) {
    etat.menuOuvert = null;
    $$(".menu-arbre").forEach((m) => { $(".menu-panneau", m).hidden = true; $(".menu-bouton", m).setAttribute("aria-expanded", false); });
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && etat.menuOuvert) {
    const bouton = $(`[data-menu="${etat.menuOuvert}"] .menu-bouton`);
    etat.menuOuvert = null;
    $$(".menu-arbre").forEach((m) => { $(".menu-panneau", m).hidden = true; $(".menu-bouton", m).setAttribute("aria-expanded", false); });
    if (bouton) bouton.focus();
  }
});
const libelleBookmaker = (nom) => (etat.app.bookmakers.find((b) => b.nom === nom) || { libelle: nom }).libelle;

async function chargerEtat() {
  etat.app = await api("/api/etat");
  document.body.classList.toggle("mobile-app", Boolean(etat.app.mobile));
}

function nouveauGraphe(el) {
  const g = echarts.init(el, null, { renderer: "svg" });
  etat.graphes.push(g);
  return g;
}
function viderGraphes() {
  etat.graphes.forEach((g) => g.dispose());
  etat.graphes = [];
}
window.addEventListener("resize", () => etat.graphes.forEach((g) => g.resize()));

/* ===================================================================== thème clair / sombre */
/* Les couleurs du thème affiché, pour les graphiques (ECharts ne lit pas les variables CSS). */
function couleursTheme() {
  const s = getComputedStyle(document.documentElement);
  const v = (nom) => s.getPropertyValue(nom).trim();
  return { encre: v("--encre"), brume: v("--brume"), ligne: v("--ligne"), trait: v("--trait"), carte: v("--carte"),
    fond: v("--fond"), peloton: v("--peloton"), gain: v("--gain"), perte: v("--perte") };
}
/* Du rouge au vert, en transparence sur le fond : la même échelle dans les deux thèmes. */
function couleursCalendrier() {
  const c = couleursTheme();
  const perte = teinte("#E0304B", 1), vert = "#0B9A5E";
  return [perte, teinte("#E0304B", 0.55), teinte("#E0304B", 0.22), c.trait, teinte(vert, 0.25), teinte(vert, 0.6), themeEffectif() === "sombre" ? "#2FD38A" : vert];
}

const THEMES = { auto: "Auto", clair: "Clair", sombre: "Sombre" };
function themeChoisi() {
  try { const t = localStorage.getItem("theme"); return t === "clair" || t === "sombre" ? t : "auto"; } catch { return "auto"; }
}
const systemeSombre = window.matchMedia("(prefers-color-scheme: dark)");
function themeEffectif() {
  const c = themeChoisi();
  return c === "auto" ? (systemeSombre.matches ? "sombre" : "clair") : c;
}
function choisirTheme(choix) {
  try { if (choix === "auto") localStorage.removeItem("theme"); else localStorage.setItem("theme", choix); } catch { /* stockage indisponible */ }
  if (choix === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = choix;
  majBoutonTheme();
  router();  // les graphiques prennent les couleurs du nouveau thème
}
const ICONES_THEME = {
  auto: `<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16z" fill="currentColor"/>`,
  clair: `<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>`,
  sombre: `<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>`,
};
function majBoutonTheme() {
  const b = $("#theme");
  if (!b) return;
  const c = themeChoisi();
  b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONES_THEME[c]}</svg><span>${THEMES[c]}</span>`;
  b.title = c === "auto" ? "Thème : celui du système (cliquer pour changer)" : `Thème ${THEMES[c].toLowerCase()} (cliquer pour changer)`;
}
systemeSombre.addEventListener("change", () => { if (themeChoisi() === "auto") router(); });

/* ===================================================================== chiffres qui défilent */
/* Les gros chiffres montent de zéro à leur valeur quand ils s'affichent, et leur unité (€, %) prend la couleur
   d'accent. Rien ne bouge si le système demande moins d'animations. */
const SELECTEUR_CHIFFRES = [".heros .resultat", ".heros .stat b", ".chiffre b", ".carte-compte .profit", ".classement .montant",
  ".bk-stats b", ".heros-bk-chiffres b", ".mini-chiffres b", ".resume-argent b", ".bilan-import b", ".ticket-pied b"].join(",");
const NOMBRE = /^([+\u2212-]?)\s*(\d[\d\s\u202f\u00a0]*(?:,\d+)?)\s*(€|%)?$/;
function animerChiffres(racine) {
  for (const el of racine.querySelectorAll(SELECTEUR_CHIFFRES)) {
    if (el.dataset.anime) continue;
    el.dataset.anime = "1";
    const noeud = [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    const m = noeud && noeud.textContent.trim().match(NOMBRE);
    if (!m) continue;
    const [, signe, brut, unite] = m;
    const decimales = (brut.split(",")[1] || "").length;
    const cible = parseFloat(brut.replace(/[\s\u202f\u00a0]/g, "").replace(",", "."));
    const fmt = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
    const compteur = document.createElement("span");
    compteur.className = "compteur";
    compteur.textContent = `${signe}${fmt.format(cible)}`;
    const frag = document.createDocumentFragment();
    frag.append(compteur);
    if (unite) {
      const u = document.createElement("span");
      u.className = "unite";
      u.textContent = unite === "€" ? "\u00a0€" : "\u00a0%";
      frag.append(u);
    }
    noeud.replaceWith(frag);
    if (mouvementReduit || !cible) continue;
    const debut = performance.now();
    const duree = 700 + Math.min(500, Math.log10(Math.abs(cible) + 1) * 120);
    const pas = (t) => {
      const p = Math.min(1, (t - debut) / duree);
      const v = cible * (1 - Math.pow(1 - p, 4));
      compteur.textContent = `${signe}${fmt.format(v)}`;
      if (p < 1 && compteur.isConnected) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }
}
/* Toute page (ou partie de page) qui s'affiche anime ses chiffres. */
const observateurChiffres = new MutationObserver(() => {
  cancelAnimationFrame(observateurChiffres.prochain);
  observateurChiffres.prochain = requestAnimationFrame(() => animerChiffres($("#page")));
});
observateurChiffres.observe($("#page"), { childList: true, subtree: true });

/* ===================================================================== routeur */
const PAGES = { tableau: pageTableau, importer: pageImporter, paris: pageParis, soldes: pageArgent, comptes: pageComptes, donnees: pageDonnees };

async function router() {
  let [nom, argument] = (location.hash.replace("#/", "") || "").split("?")[0].split("/");
  if (nom === "argent") nom = "soldes"; // ancienne adresse de la page
  if (nom === "bk" && argument) {
    $$(".menu a").forEach((a) => a.removeAttribute("aria-current"));
    viderGraphes();
    const main = $("#page");
    try { await pageBookmaker(main, argument); } catch (e) { main.innerHTML = `<div class="alerte-boite erreur">${esc(e.message)}</div>`; }
    majBooks(argument);
    return;
  }
  let page = PAGES[nom] ? nom : etat.app && etat.app.n_paris ? "tableau" : "importer";
  if (etat.app && etat.app.distant && page === "donnees") page = "tableau";
  $$(".menu a").forEach((a) => (a.dataset.page === page ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  viderGraphes();
  const main = $("#page");
  try {
    await PAGES[page](main);
  } catch (e) {
    main.innerHTML = `<div class="alerte-boite erreur">${esc(e.message)}</div>`;
  }
  majBooks(page === "tableau" ? null : undefined);
}

/* Les bookmakers où il y a des paris, dans la barre du haut (toujours visible) : un clic ouvre leur page. */
function majBooks(actif) {
  const el = $("#menu-books");
  if (!el || !etat.app) return;
  const avecParis = etat.app.bookmakers.filter((b) => etat.app.comptes.some((c) => c.bookmaker === b.nom && c.n_paris));
  el.hidden = !avecParis.length;
  el.innerHTML = `<a href="#/tableau" class="lien-bk tous" ${actif === null ? 'aria-current="page"' : ""}><span class="logo-bk tous" aria-hidden="true">∑</span><span>Tous</span></a>${avecParis.map((b) =>
    `<a href="#/bk/${esc(b.nom)}" class="lien-bk" style="--bk:${themeBk(b.nom).fond}" ${b.nom === actif ? 'aria-current="page"' : ""}>${logoBk(b.nom)}<span>${esc(b.libelle)}</span></a>`).join("")}`;
}
window.addEventListener("hashchange", () => { router(); $("#page").focus({ preventScroll: true }); window.scrollTo(0, 0); });

function bandeauDemo() {
  return etat.app.demo ? `<span class="bandeau-demo">Démonstration : paris inventés</span>` : "";
}

/* ===================================================================== tableau de bord */
function paramsTableau() {
  const f = etat.filtres;
  const p = new URLSearchParams();
  if (f.debut) p.set("debut", f.debut);
  if (f.fin) p.set("fin", f.fin);
  if (f.comptes.size) p.set("comptes", [...f.comptes].join(","));
  if (f.sports.size) p.set("sports", [...f.sports].join(","));
  return p.toString();
}

/* Les périodes comptent à partir d'aujourd'hui (« Cette année » : depuis le 1er janvier), pas du dernier pari. */
function appliquerPeriode(code) {
  const f = etat.filtres;
  f.periode = code;
  if (code === "tout") { f.debut = ""; f.fin = ""; return; }
  const d = new Date();
  if (code === "7") d.setDate(d.getDate() - 6);
  if (code === "30") d.setDate(d.getDate() - 29);
  if (code === "90") d.setDate(d.getDate() - 89);
  if (code === "annee") { d.setMonth(0); d.setDate(1); }
  const deux = (n) => String(n).padStart(2, "0");
  f.debut = `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())}`;
  f.fin = "";
}

/* Le curseur de dates : deux poignées sur tout l'historique, avec le relief des paris semaine par semaine. Les dates
   suivent la poignée en direct ; le tableau se recalcule quand on la lâche. */
const JOUR_MS = 864e5;
const isoJour = (ms) => new Date(ms).toISOString().slice(0, 10);
function curseurDates(o, f) {
  if (!o.debut || !o.fin || o.debut === o.fin) return "";
  const d0 = Date.parse(o.debut), n = Math.round((Date.parse(o.fin) - d0) / JOUR_MS);
  const val = (iso, defaut) => (iso ? Math.min(n, Math.max(0, Math.round((Date.parse(iso) - d0) / JOUR_MS))) : defaut);
  const a = val(f.debut, 0), b = val(f.fin, n);
  const act = o.activite || [];
  const max = Math.max(1, ...act.map((x) => x[1]));
  const barres = act.map(([j, k]) => {
    const x = ((Date.parse(j) - d0) / JOUR_MS / n) * 100;
    return `<i style="left:${Math.max(0, Math.min(99, x)).toFixed(2)}%;height:${Math.max(8, (k / max) * 100).toFixed(0)}%" title="Semaine du ${esc(dateFr(j))} : ${k} paris"></i>`;
  }).join("");
  return `<div class="curseur-dates" style="--a:${(a / n) * 100}%;--b:${(b / n) * 100}%">
    <div class="curseur-relief" aria-hidden="true">${barres}</div>
    <div class="curseur-pistes">
      <input type="range" min="0" max="${n}" value="${a}" data-borne="debut" aria-label="Début de la période">
      <input type="range" min="0" max="${n}" value="${b}" data-borne="fin" aria-label="Fin de la période">
    </div>
    <div class="curseur-legende"><b data-lib="debut">${esc(dateFr(isoJour(d0 + a * JOUR_MS)))}</b><span>${b - a + 1} jours</span><b data-lib="fin">${esc(dateFr(isoJour(d0 + b * JOUR_MS)))}</b></div>
  </div>`;
}
function brancherCurseurDates(main, o, f, relancer) {
  const boite = $(".curseur-dates", main);
  if (!boite) return;
  const d0 = Date.parse(o.debut);
  const [ra, rb] = $$("input[type=range]", boite);
  const n = Number(ra.max);
  const maj = (source) => {
    let a = Number(ra.value), b = Number(rb.value);
    // Deux poignées l'une sur l'autre : celle qu'on tire pousse l'autre, au lieu de se bloquer contre elle.
    if (a > b) { if (source === ra) rb.value = b = a; else ra.value = a = b; }
    boite.style.setProperty("--a", `${(a / n) * 100}%`);
    boite.style.setProperty("--b", `${(b / n) * 100}%`);
    $("[data-lib=debut]", boite).textContent = dateFr(isoJour(d0 + a * JOUR_MS));
    $("[data-lib=fin]", boite).textContent = dateFr(isoJour(d0 + b * JOUR_MS));
    $(".curseur-legende span", boite).textContent = `${b - a + 1} jours`;
    return [a, b];
  };
  for (const r of [ra, rb]) {
    r.addEventListener("input", () => maj(r));
    r.addEventListener("change", () => {
      const [a, b] = maj(r);
      f.debut = a === 0 ? "" : isoJour(d0 + a * JOUR_MS);
      f.fin = b === n ? "" : isoJour(d0 + b * JOUR_MS);
      f.periode = f.debut || f.fin ? "perso" : "tout";
      relancer();
    });
  }
}

/* Les n derniers tickets de la période choisie (10 par défaut, 100 au plus) : régler le curseur sur un jour, et voir
   tous ses tickets d'un coup. */
const MAX_TICKETS = 100;
async function derniersTicketsTableau(main) {
  let n = 10, regles = false;
  try {
    n = Math.min(MAX_TICKETS, Math.max(1, Number(localStorage.getItem("n-tickets")) || 10));
    regles = localStorage.getItem("tickets-regles") === "1";
  } catch { /* stockage indisponible */ }
  const boite = document.createElement("section");
  boite.className = "derniers-tableau";
  main.append(boite);
  const dessiner = async () => {
    const r = await api(`/api/paris?${paramsTableau()}&par_page=${n}${regles ? "&etats=gagne,perdu,annule,cashout" : ""}`);
    boite.innerHTML = `<header class="entete-section"><h2 class="titre-section">Derniers tickets <small class="discret">${Math.min(n, r.total)} sur ${r.total}</small></h2>
      <div class="choix-n" role="group" aria-label="Tickets affichés">
        <button type="button" class="puce" data-regles aria-pressed="${regles}">Sans les en cours</button>
        ${[10, 25, 50, MAX_TICKETS].map((k) => `<button type="button" class="puce" data-n="${k}" aria-pressed="${k === n}">${k}</button>`).join("")}</div></header>
      <div class="grille-tickets">${r.lignes.map((l) => ticketHTML(l)).join("") || `<p class="discret">Aucun pari sur cette période.</p>`}</div>`;
    brancherTickets(boite, r.lignes, dessiner);
    $("[data-regles]", boite).addEventListener("click", () => {
      regles = !regles;
      try { localStorage.setItem("tickets-regles", regles ? "1" : "0"); } catch { /* stockage indisponible */ }
      dessiner();
    });
    $$("[data-n]", boite).forEach((b) => b.addEventListener("click", () => {
      n = Number(b.dataset.n);
      try { localStorage.setItem("n-tickets", String(n)); } catch { /* stockage indisponible */ }
      dessiner();
    }));
  };
  await dessiner();
}

async function pageTableau(main) {
  await chargerEtat();
  const t = await api("/api/tableau?" + paramsTableau());
  if (t.vide) {
    main.innerHTML = `
      <div class="entete"><div><h1>Ta saison</h1></div>${bandeauDemo()}</div>
      <section class="panneau vide">
        <strong>Aucun pari pour l'instant</strong>
        <p>Colle la page d'historique de ton bookmaker : le tableau de bord se remplit tout seul.</p>
        <a class="bouton" href="#/importer">Importer mes paris</a>
      </section>`;
    return;
  }
  const k = t.indicateurs;
  const o = t.options;
  const f = etat.filtres;
  const comptesVisibles = etat.app.comptes;

  const puce = (attr, valeur, actif, contenu) =>
    `<button type="button" class="puce" ${attr}="${esc(valeur)}" aria-pressed="${actif}">${contenu}</button>`;

  main.innerHTML = `
    <div class="entete">
      <div>
        <h1>Ta saison</h1>
        <p>${k.n} paris réglés, du ${dateFr(f.debut || o.debut)} au ${dateFr(f.fin || o.fin)}</p>
      </div>
      <div class="actions" style="margin:0">${bandeauDemo()}</div>
    </div>

    <div class="filtres" role="group" aria-label="Filtres">
      <div class="groupe">
        <span class="etiquette">Période</span>
        ${[["7", "7 jours"], ["30", "30 jours"], ["90", "3 mois"], ["annee", "Cette année"], ["tout", "Tout"]]
          .map(([c, l]) => puce("data-periode", c, f.periode === c, l)).join("")}
        <span class="dates">
          <input type="date" id="f-debut" aria-label="Du" value="${esc(f.debut)}" min="${o.debut}" max="${o.fin}">
          <input type="date" id="f-fin" aria-label="Au" value="${esc(f.fin)}" min="${o.debut}" max="${o.fin}">
        </span>
      </div>
      ${curseurDates(o, f)}
      <div class="groupe menus">
        ${comptesVisibles.filter((c) => c.n_paris).length > 1 ? menuArbre({ id: "comptes", etiquette: "Comptes", tous: "Tous", unite: "comptes", groupes: groupesComptes(), selection: f.comptes }) : ""}
        ${o.sports.length > 1 ? menuArbre({ id: "sports", etiquette: "Sports", tous: "Tous", unite: "sports", groupes: groupesSports(), selection: f.sports }) : ""}
        ${f.comptes.size || f.sports.size || f.periode !== "tout" ? `<button type="button" class="bouton fantome" id="f-raz">Tout effacer</button>` : ""}
      </div>
    </div>

    <section class="heros" aria-label="Résultat de la saison">
      <div class="heros-haut">
        <div>
          <div class="resultat" id="resultat">${euros(k.profit, { signe: true, rond: Math.abs(k.profit) >= 1000 })}</div>
          <div class="resultat-legende">de profit sur ${euros(k.mise, { rond: true })} misés${k.n_freebets && Math.round(k.profit_freebets) ? `, dont ${euros(k.profit_freebets, { signe: true, rond: true })} de ${k.n_freebets} freebet${k.n_freebets > 1 ? "s" : ""}` : ""}${etat.app.bankroll ? `, soit <b>${k.profit > 0 ? "+" : ""}${miseEnPct(k.profit, { seul: true })}</b> de ta bankroll (${euros(etat.app.bankroll, { rond: true })})` : ""}</div>
        </div>
        <div class="stats">
          <div class="stat"><b>${pct(k.roi)}</b><span>ROI</span></div>
          <div class="stat"><b>${k.n}</b><span>paris réglés</span></div>
          <div class="stat"><b>${pct(k.reussite, { signe: false })}</b><span>de réussite</span></div>
          ${k.n_en_cours ? `<button type="button" class="stat lien-stat" data-voir-en-cours title="Voir ces paris dans Mes paris"><b>${k.n_en_cours}</b><span>en cours, ${euros(k.engage, { rond: true })} engagés ›</span></button>`
            : `<div class="stat"><b>0</b><span>en cours</span></div>`}
        </div>
      </div>
      <div class="ligne-outils">
        <p class="lecture">${k.ic ? `Intervalle de confiance du ROI : de ${pct(k.ic[0])} à ${pct(k.ic[1])}. ` : ""}${esc(k.lecture_ic)}</p>
        ${t.courbe.comptes.length > 1 ? `<div class="commutateur" role="group" aria-label="Affichage de la courbe">
          <button type="button" data-vue="total" aria-pressed="${etat.vueCourbe === "total"}">Total</button>
          <button type="button" data-vue="comptes" aria-pressed="${etat.vueCourbe === "comptes"}">Par compte</button>
        </div>` : ""}
      </div>
      <div class="graphe" id="courbe" role="img" aria-label="Profit cumulé au fil de la saison"></div>
    </section>

    ${t.comptes.filter((c) => c.n || c.en_cours).length ? `
    <section aria-label="Tes comptes" style="margin-top:22px">
      <div class="rangee-comptes">
        ${t.comptes.filter((c) => c.n || c.en_cours).map((c) => `
          <button type="button" class="carte-compte" data-compte="${c.id}" aria-pressed="${f.comptes.has(c.id)}" style="--compte:${esc(c.couleur)}">
            <span class="qui">${avatar(c)}<span><b>${esc(c.nom)}</b><small>${logoBk(c.bookmaker, "mini")} ${esc(libelleBookmaker(c.bookmaker))}</small></span></span>
            <span class="chiffres">
              <span class="profit ${classeSigne(c.profit)}">${euros(c.profit, { signe: true, rond: true })}</span>
              <span class="roi ${classeSigne(c.roi)}">ROI ${pct(c.roi)}</span>
            </span>
            <span class="spark" data-spark="${c.id}"></span>
            <span class="pied">${c.n} paris réglés${c.en_cours ? `, ${c.en_cours} en cours` : ""}</span>
          </button>`).join("")}
      </div>
    </section>` : ""}

    <section class="chiffres" aria-label="Tes chiffres">
      ${t.forme ? `<div class="chiffre large"><small>Forme, ${t.forme.jours} derniers jours</small><b class="${classeSigne(t.forme.profit)}">${euros(t.forme.profit, { signe: true, rond: true })}</b><span>ROI ${pct(t.forme.roi)} sur ${t.forme.n} paris${k.roi !== null ? `, contre ${pct(k.roi)} au total` : ""}</span></div>` : ""}
      <div class="chiffre"><small>Jours gagnants</small><b>${k.jours_gagnants !== null ? pct(k.jours_gagnants, { signe: false }) : "—"}</b><span>${k.jours_joues ? `${Math.round(k.jours_gagnants * k.jours_joues)} jours sur ${k.jours_joues} en positif` : ""}</span></div>
      <div class="chiffre"><small>Meilleur jour</small><b class="gain">${k.meilleur_jour ? euros(k.meilleur_jour.profit, { signe: true, rond: true }) : "—"}</b><span>${k.meilleur_jour ? dateFr(k.meilleur_jour.date) : ""}</span></div>
      <div class="chiffre"><small>Meilleure série</small><b>${k.meilleure_serie ?? "—"}</b><span>paris gagnés d'affilée</span></div>
      <div class="chiffre"><small>Plus gros gain</small><b class="gain">${k.meilleur_gain ? euros(k.meilleur_gain, { signe: true, rond: true }) : "—"}</b><span>sur un pari</span></div>
      <div class="chiffre"><small>Gain moyen</small><b class="gain">${k.gain_moyen !== null ? euros(k.gain_moyen, { signe: true }) : "—"}</b><span>par pari gagné</span></div>
      <div class="chiffre"><small>Perte moyenne</small><b class="perte">${k.perte_moyenne !== null ? euros(-k.perte_moyenne, { signe: true }) : "—"}</b><span>par pari perdu</span></div>
      <div class="chiffre"><small>Mise moyenne</small><b>${euros(k.mise_moyenne)}</b><span>${etat.app.bankroll ? `${miseEnPct(k.mise_moyenne, { seul: true })} de bankroll, par pari` : "par pari réglé"}</span></div>
      <div class="chiffre"><small>Cote moyenne</small><b>${k.cote_moyenne_gagnee ? fmtCote(k.cote_moyenne_gagnee) : "—"}</b><span>des paris gagnés</span></div>
      <div class="chiffre"><small>Remboursés</small><b>${k.n_annules}</b><span>paris annulés ou remboursés</span></div>
      <div class="chiffre"><small>Jours joués</small><b>${k.jours_joues ?? "—"}</b><span>avec au moins un pari réglé</span></div>
    </section>

    ${t.calendrier.length > 1 ? `<section class="panneau" style="margin-bottom:20px">
      <header><h2>Ton calendrier</h2>
        <span class="legende-calendrier discret petit">Perte ${couleursCalendrier().map((c) => `<i style="background:${c}"></i>`).join("")} Gain</span>
      </header>
      <div id="calendrier" class="graphe-calendrier" role="img" aria-label="Profit jour par jour"></div>
    </section>` : ""}

    <div class="grille-2">
      <div class="pile">
        <section class="panneau">
          <header><h2>Par sport</h2>
            ${t.par_famille.length > 1 && t.par_famille.length < t.par_sport.length ? `<div class="commutateur clair" role="group" aria-label="Regrouper">
              <button type="button" data-vue-sports="familles" aria-pressed="${etat.vueSports === "familles"}">Familles</button>
              <button type="button" data-vue-sports="sports" aria-pressed="${etat.vueSports === "sports"}">Sports</button>
            </div>` : `<span class="discret petit">Clique pour filtrer</span>`}
          </header>
          <ul class="classement">${t.par_famille.length > 1 && t.par_famille.length < t.par_sport.length && etat.vueSports === "familles"
            ? classementFamilles(t.par_famille) : classementSports(t.par_sport)}</ul>
        </section>
      </div>
      <section class="panneau">
        <header>
          <h2>Ton jeu à la loupe</h2>
          <div id="onglets-analyse"></div>
        </header>
        <div id="analyse"></div>
      </section>
    </div>

    <section class="panneau" style="margin-top:20px">
      <header><h2>Plus beaux gains</h2></header>
      ${tableRecords(t.records.meilleurs)}
    </section>`;

  dessinerCourbe(t);
  t.comptes.forEach((c) => {
    const el = $(`[data-spark="${c.id}"]`);
    if (el && c.sparkline.length > 1) dessinerSparkline(el, c.sparkline, c.couleur);
  });
  dessinerOnglets(t);
  dessinerAnalyse(t);
  dessinerCalendrier(t);

  // Interactions : chaque filtre relance le calcul côté serveur.
  const relancer = () => pageTableauRafraichir();
  $$("[data-periode]", main).forEach((b) => b.addEventListener("click", () => { appliquerPeriode(b.dataset.periode, o); relancer(); }));
  $("#f-debut").addEventListener("change", (e) => { f.debut = e.target.value; f.periode = "perso"; relancer(); });
  brancherCurseurDates(main, o, f, relancer);
  derniersTicketsTableau(main);
  $("#f-fin").addEventListener("change", (e) => { f.fin = e.target.value; f.periode = "perso"; relancer(); });
  brancherMenu(main, "comptes", f.comptes, relancer);
  brancherMenu(main, "sports", f.sports, relancer);
  $$("[data-compte]", main).forEach((b) => b.addEventListener("click", () => {
    const id = Number(b.dataset.compte);
    f.comptes.has(id) ? f.comptes.delete(id) : f.comptes.add(id);
    relancer();
  }));
  $$("[data-sport]", main).forEach((b) => b.addEventListener("click", () => {
    const s = b.dataset.sport;
    f.sports.has(s) ? f.sports.delete(s) : f.sports.add(s);
    relancer();
  }));
  $$("[data-famille]", main).forEach((b) => b.addEventListener("click", () => {
    const sports = JSON.parse(b.dataset.famille);
    const tout = sports.every((x) => f.sports.has(x));
    sports.forEach((x) => (tout ? f.sports.delete(x) : f.sports.add(x)));
    relancer();
  }));
  $$("[data-vue-sports]", main).forEach((b) => b.addEventListener("click", () => { etat.vueSports = b.dataset.vueSports; relancer(); }));
  const raz = $("#f-raz");
  if (raz) raz.addEventListener("click", () => { Object.assign(f, { periode: "tout", debut: "", fin: "" }); f.comptes.clear(); f.sports.clear(); relancer(); });
  $$("[data-vue]", main).forEach((b) => b.addEventListener("click", () => { etat.vueCourbe = b.dataset.vue; relancer(); }));
  brancherLignesTicket(main, relancer);
  const enCours = $("[data-voir-en-cours]", main);
  if (enCours) enCours.addEventListener("click", () => voirEnCours([...etat.filtres.comptes]));
}

async function pageTableauRafraichir() {
  const y = window.scrollY;
  viderGraphes();
  await pageTableau($("#page"));
  window.scrollTo(0, y);
}


function classementSports(lignes) {
  if (!lignes.length) return `<li class="discret">Aucun pari réglé sur cette sélection.</li>`;
  const max = Math.max(...lignes.map((l) => Math.abs(l.profit))) || 1;
  return [...lignes].sort((a, b) => b.profit - a.profit).map((l) => {
    const largeur = (Math.abs(l.profit) / max) * 100;
    const actif = etat.filtres.sports.has(l.cle);
    return `<li><button type="button" data-sport="${esc(l.cle)}" aria-pressed="${actif}">
      <span class="embleme" style="background:${teinte(sportCouleur(l.cle), 0.2)}">${sportEmoji(l.cle)}</span>
      <span>
        <span class="nom">${esc(l.cle)} <small>${l.paris} paris, ${pctPoints(l.reussite, { signe: false })} gagnés</small></span>
        <span class="jauge"><i style="left:0;width:${largeur}%;background:${l.profit >= 0 ? "var(--gain)" : "var(--perte)"}"></i></span>
      </span>
      <span class="montant ${classeSigne(l.profit)}">${euros(l.profit, { signe: true, rond: true })}<small>ROI ${pctPoints(l.roi)}</small></span>
    </button></li>`;
  }).join("");
}

function classementFamilles(lignes) {
  const max = Math.max(...lignes.map((l) => Math.abs(l.profit))) || 1;
  return [...lignes].sort((a, b) => b.profit - a.profit).map((l) => {
    const largeur = (Math.abs(l.profit) / max) * 100;
    const actif = l.sports.length && l.sports.every((x) => etat.filtres.sports.has(x));
    const detail = l.sports.length > 1 ? l.sports.slice(0, 3).join(", ") + (l.sports.length > 3 ? "…" : "") : "";
    return `<li><button type="button" data-famille="${esc(JSON.stringify(l.sports))}" aria-pressed="${actif}">
      <span class="embleme" style="background:${teinte(FAMILLES_COULEUR[l.cle] || "#A7A3BF", 0.2)}">${FAMILLES_EMOJI[l.cle] || "🎯"}</span>
      <span>
        <span class="nom">${esc(l.cle)} <small>${l.paris} paris, ${pctPoints(l.reussite, { signe: false })} gagnés</small></span>
        ${detail ? `<span class="sous-sports">${esc(detail)}</span>` : ""}
        <span class="jauge"><i style="left:0;width:${largeur}%;background:${l.profit >= 0 ? "var(--gain)" : "var(--perte)"}"></i></span>
      </span>
      <span class="montant ${classeSigne(l.profit)}">${euros(l.profit, { signe: true, rond: true })}<small>ROI ${pctPoints(l.roi)}</small></span>
    </button></li>`;
  }).join("");
}

/* ----------------------------------------------------- calendrier : le profit jour par jour */
function dessinerCalendrier(t) {
  const el = $("#calendrier");
  if (!el) return;
  const jours = t.calendrier;
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const fin = new Date(jours[jours.length - 1][0] + "T12:00:00");
  const semaines = Math.max(8, Math.min(53, Math.floor((el.clientWidth - 40) / 17)));
  const debut = new Date(fin);
  debut.setDate(debut.getDate() - semaines * 7 + 1);
  const premier = new Date(jours[0][0] + "T12:00:00");
  const m = Math.max(10, t.indicateurs.mise_moyenne || 10);
  const ct = couleursTheme();
  const cal = couleursCalendrier();
  const g = nouveauGraphe(el);
  g.setOption({
    animation: false,
    tooltip: {
      backgroundColor: "#0B1020", borderWidth: 0, textStyle: { color: "#fff", fontFamily: "Manrope" },
      formatter: (p) => `<b>${dateFr(p.value[0])}</b><br>${p.value[2]} pari${p.value[2] > 1 ? "s" : ""} réglé${p.value[2] > 1 ? "s" : ""}<br>Profit : <b>${euros(p.value[1], { signe: true })}</b><br><span style="opacity:.7">Clique pour voir les tickets</span>`,
    },
    visualMap: {
      show: false, type: "piecewise", dimension: 1,
      pieces: [
        { lt: -3 * m, color: cal[0] }, { gte: -3 * m, lt: -m, color: cal[1] }, { gte: -m, lt: 0, color: cal[2] },
        { value: 0, color: cal[3] },
        { gt: 0, lte: m, color: cal[4] }, { gt: m, lte: 3 * m, color: cal[5] }, { gt: 3 * m, color: cal[6] },
      ],
    },
    calendar: {
      range: [iso(premier > debut ? premier : debut), iso(fin)],
      top: 26, left: 30, right: 6, bottom: 4, cellSize: ["auto", 17],
      splitLine: { show: false }, yearLabel: { show: false },
      itemStyle: { color: ct.fond, borderColor: ct.carte, borderWidth: 3 },
      dayLabel: { firstDay: 1, nameMap: ["D", "L", "M", "M", "J", "V", "S"], color: ct.brume, fontFamily: "Manrope", fontSize: 11 },
      monthLabel: { nameMap: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
        color: ct.brume, fontFamily: "Manrope", fontWeight: 600, fontSize: 11 },
    },
    series: [{ type: "heatmap", coordinateSystem: "calendar", data: jours, cursor: "pointer" }],
  });
  g.on("click", (p) => { if (p.value) ouvrirJour(p.value[0], paramsTableau()); });
}

function tableRecords(lignes) {
  if (!lignes.length) return `<p class="discret">—</p>`;
  return `<div class="table-defile"><table><tbody>${lignes.map((r) => `
    <tr class="ligne-ticket" tabindex="0" role="button" aria-label="Voir le ticket" data-bookmaker="${esc(r.bookmaker)}" data-reference="${esc(r.reference)}">
      <td><div class="pari-titre">${sportEmoji(r.sport)} ${esc(r.resume)}</div>
          <div class="pari-sous">${dateFr(r.date_ref)}, ${esc(r.compte_nom)} (${esc(r.bookmaker_libelle)}), ${r.freebet ? "freebet de" : "mise"} ${euros(miseJouee(r))}</div></td>
      <td class="nombre ${classeSigne(r.profit)}"><b>${euros(r.profit, { signe: true })}</b></td>
      <td class="voir-ticket" aria-hidden="true">Ticket ›</td>
    </tr>`).join("")}</tbody></table></div>`;
}

/* Un clic (ou Entrée) sur une ligne de pari ouvre son ticket. */
function brancherLignesTicket(racine, apres = () => router()) {
  $$(".ligne-ticket", racine).forEach((tr) => {
    const ouvrir = () => ouvrirTicket(tr.dataset.bookmaker, tr.dataset.reference, apres);
    tr.addEventListener("click", ouvrir);
    tr.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ouvrir(); } });
  });
}

/* Le ticket d'un pari, dans une fenêtre : on peut le modifier ou le partager comme ailleurs. */
async function ouvrirTicket(bookmaker, reference, apres = () => router()) {
  let r;
  try {
    r = await api(`/api/paris?bookmakers=${encodeURIComponent(bookmaker)}&reference=${encodeURIComponent(reference)}&par_page=1`);
  } catch (err) { toast(err.message, true); return; }
  const l = r.lignes[0];
  if (!l) { toast("Pari introuvable.", true); return; }
  const d = dialogue(`
    <header><h2>Le ticket</h2><button type="button" class="fermer" aria-label="Fermer" data-fermer>×</button></header>
    ${ticketHTML(l)}`, "ticket-seul");
  $("[data-fermer]", d).addEventListener("click", () => d.close());
  brancherTickets(d, [l], () => { d.close(); apres(); });
}

/* « N en cours » : un clic ouvre Mes paris, filtrés sur les paris en cours (de ces comptes, s'il y en a). */
function voirEnCours(comptes = []) {
  const p = etat.paris;
  Object.assign(p, { recherche: "", page: 1, partages: false });
  p.etats = new Set(["en_cours"]);
  p.sports = new Set();
  p.comptes = new Set(comptes);
  if (location.hash === "#/paris") router(); else location.hash = "#/paris";
}

/* ----------------------------------------------------- la courbe façon profil d'étape */
function dessinerCourbe(t) {
  const el = $("#courbe");
  const g = nouveauGraphe(el);
  const r = t.courbe.reperes;
  const blanc = (a) => `rgba(255,255,255,${a})`;
  const axeTemps = {
    type: "time", boundaryGap: false,
    axisLine: { lineStyle: { color: blanc(0.3) } }, axisTick: { show: false },
    axisLabel: { color: blanc(0.75), fontFamily: "Manrope", fontWeight: 600, hideOverlap: true, formatter: (v) => fmtDateCourte.format(new Date(v)) },
    splitNumber: 6, splitLine: { show: false },
  };
  const axeValeur = {
    type: "value", scale: false,
    axisLabel: { color: blanc(0.75), fontFamily: "Manrope", fontWeight: 600, formatter: (v) => euros(v, { rond: true }) },
    splitLine: { lineStyle: { color: blanc(0.12) } },
  };
  const tooltip = {
    trigger: "axis", backgroundColor: "#0B1020", borderWidth: 0, textStyle: { color: "#fff", fontFamily: "Manrope" },
    axisPointer: { type: "line", lineStyle: { color: blanc(0.6) } },
    formatter: (pts) => `<b>${dateFr(pts[0].value[0])}</b><br>` + pts.map((p) =>
      `${p.marker} ${esc(p.seriesName)} : <b>${euros(p.value[1], { signe: true })}</b>`).join("<br>"),
  };
  let series;
  if (etat.vueCourbe === "comptes" && t.courbe.comptes.length > 1) {
    series = t.courbe.comptes.map((c) => ({
      name: `${c.nom} (${libelleBookmaker(c.bookmaker)})`, type: "line", smooth: 0.3, showSymbol: false,
      data: c.points, lineStyle: { width: 3, color: eclaircir(c.couleur, 0.45) }, itemStyle: { color: eclaircir(c.couleur, 0.45) },
    }));
  } else {
    series = [{
      name: "Profit cumulé", type: "line", smooth: 0.3, showSymbol: false, data: t.courbe.total,
      lineStyle: { width: 3.5, color: "#fff", shadowColor: "rgba(9,13,28,.35)", shadowBlur: 12, shadowOffsetY: 6 },
      itemStyle: { color: "#fff" },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: blanc(0.42) }, { offset: 1, color: blanc(0.02) }]) },
      markLine: { silent: true, symbol: "none", label: { show: false }, lineStyle: { color: blanc(0.45), type: "dashed" }, data: [{ yAxis: 0 }] },
      markPoint: r.sommet ? {
        symbol: "pin", symbolSize: 46, itemStyle: { color: "#FFC53D" },
        label: { show: true, formatter: "▲", color: "#1B1340", fontSize: 13 },
        data: [{ name: "Sommet", coord: [r.sommet.date, r.sommet.valeur] }],
        tooltip: { formatter: () => `Sommet : <b>${euros(r.sommet.valeur, { signe: true })}</b><br>${dateFr(r.sommet.date)}` },
      } : undefined,
    }];
  }
  g.setOption({
    animationDuration: mouvementReduit ? 0 : 1200, animationEasing: "cubicOut",
    grid: { left: 64, right: 24, top: series.length > 1 ? 40 : 24, bottom: 34 },
    legend: series.length > 1 ? { top: 0, textStyle: { color: "#fff", fontFamily: "Manrope", fontWeight: 600 }, icon: "roundRect" } : undefined,
    tooltip, xAxis: axeTemps, yAxis: axeValeur, series,
    dataZoom: [{ type: "inside", filterMode: "none" }],
  });
}

function dessinerSparkline(el, valeurs, couleur) {
  const g = nouveauGraphe(el);
  g.setOption({
    animation: false, grid: { left: 0, right: 0, top: 4, bottom: 4 },
    xAxis: { type: "category", show: false, data: valeurs.map((_, i) => i) },
    yAxis: { type: "value", show: false, scale: true },
    series: [{ type: "line", data: valeurs, smooth: 0.4, showSymbol: false, lineStyle: { width: 2.5, color: couleur },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: teinte(couleur, 0.35) }, { offset: 1, color: teinte(couleur, 0) }]) } }],
  });
}

/* ----------------------------------------------------- onglets d'analyse */
const ONGLETS = {
  type: { cle: "par_type", note: "Les libellés des bookmakers sont regroupés : « Vainqueur de l'étape » et « Vainqueur » comptent ensemble, de même pour les face-à-face, les podiums et les tops." },
  evenement: { cle: "par_evenement", note: "Les courses et matchs sur lesquels tu as le plus misé (au moins 2 paris)." },
  mise: { cle: "par_mise", note: "Tes résultats selon le montant misé.", ordre: true },
  cote: { cle: "par_cote_gagnes", note: "Betclic et Winamax n'affichent pas les cotes : seule celle des paris gagnés est connue (gains ÷ mise). Ce graphique montre à quelles cotes tu gagnes, pas un ROI par cote.", ordre: true },
  cote_connue: { cle: "par_cote", note: "Résultats par tranche de cote, sur les paris dont la cote est connue (Unibet, PMU et ps3838 l'affichent, y compris pour les paris perdus).", ordre: true },
  anticipation: { cle: "par_anticipation", note: "Combien de temps avant le départ tu prends tes paris (connu pour Betclic uniquement).", ordre: true },
  mois: { cle: "par_mois", note: "Profit mois par mois.", ordre: true, vertical: true },
  type_pari: { cle: "par_type_pari", note: "Paris simples, combinés et combinés sur un même match." },
  boost: { cle: "par_boost", note: "Les cotes boostées des bookmakers (« CB », « Flash »…) face à tes paris à cote normale." },
  bookmaker: { cle: "par_bookmaker", note: "Tes résultats chez chaque bookmaker, tous comptes confondus." },
  jour: { cle: "par_jour", note: "Le jour de la semaine où tu as pris le pari.", ordre: true, vertical: true },
  heure: { cle: "par_heure", note: "L'heure à laquelle tu as pris le pari.", ordre: true },
};

/* Les onglets d'analyse, rangés en trois grandes catégories. */
const CATEGORIES_ANALYSE = [
  ["quoi", "Quoi", [["type", "Marchés"], ["type_pari", "Simple ou combiné"], ["boost", "Cotes boostées"], ["evenement", "Courses et matchs"]]],
  ["ou", "Où et combien", [["bookmaker", "Bookmakers"], ["mise", "Mises"], ["cote", "Cotes"]]],
  ["quand", "Quand", [["mois", "Mois"], ["jour", "Jours"], ["heure", "Heures"], ["anticipation", "Anticipation"]]],
];

function logoParLibelle(libelle) {
  const b = etat.app.bookmakers.find((x) => x.libelle === libelle);
  return b ? logoBk(b.nom, "mini") : "";
}

function dessinerOnglets(t) {
  const zone = $("#onglets-analyse");
  const categorie = CATEGORIES_ANALYSE.find(([, , sous]) => sous.some(([c]) => c === etat.onglet)) || CATEGORIES_ANALYSE[0];
  zone.innerHTML = `
    <div class="commutateur clair" role="group" aria-label="Catégorie">${CATEGORIES_ANALYSE.map(([c, l]) =>
      `<button type="button" data-categorie="${c}" aria-pressed="${c === categorie[0]}">${l}</button>`).join("")}</div>
    <div class="onglets" role="tablist">${categorie[2].map(([c, l]) =>
      `<button type="button" role="tab" data-onglet="${c}" aria-selected="${etat.onglet === c}">${l}</button>`).join("")}</div>`;
  $$("[data-categorie]", zone).forEach((b) => b.addEventListener("click", () => {
    etat.onglet = CATEGORIES_ANALYSE.find(([c]) => c === b.dataset.categorie)[2][0][0];
    dessinerOnglets(t);
    dessinerAnalyse(t);
  }));
  $$("[data-onglet]", zone).forEach((b) => b.addEventListener("click", () => {
    etat.onglet = b.dataset.onglet;
    $$("[data-onglet]", zone).forEach((x) => x.setAttribute("aria-selected", x === b));
    dessinerAnalyse(t);
  }));
}

function dessinerAnalyse(t) {
  const onglet = etat.onglet === "cote" && (t.par_cote || []).length ? "cote_connue" : etat.onglet;
  const conf = ONGLETS[onglet];
  const lignes = t[conf.cle] || [];
  const zone = $("#analyse");
  etat.graphes = etat.graphes.filter((g) => {
    if (g.getDom().id === "graphe-analyse") { g.dispose(); return false; }
    return true;
  });
  if (!lignes.length) {
    zone.innerHTML = `<p class="note">${esc(conf.note)}</p><p class="discret">Pas de données sur cette sélection.</p>`;
    return;
  }
  const estCote = onglet === "cote";
  zone.innerHTML = `<p class="note">${esc(conf.note)}</p>
    <div class="analyse-graphe" id="graphe-analyse" style="height:${conf.vertical ? 280 : Math.max(200, lignes.length * 34 + 40)}px"></div>
    ${estCote ? "" : `<div class="table-defile" style="margin-top:8px"><table>
      <thead><tr><th></th><th class="nombre">Paris</th><th class="nombre">Réussite</th><th class="nombre">Misé</th><th class="nombre">Profit</th><th class="nombre">ROI</th></tr></thead>
      <tbody>${(conf.ordre ? lignes : [...lignes].sort((a, b) => b.profit - a.profit)).map((l) => `<tr>
        <td>${onglet === "bookmaker" ? logoParLibelle(l.cle) + " " : ""}${esc(l.cle)}</td><td class="nombre">${l.paris}</td><td class="nombre">${pctPoints(l.reussite, { signe: false })}</td>
        <td class="nombre">${euros(l.mise, { rond: true })}</td><td class="nombre ${classeSigne(l.profit)}"><b>${euros(l.profit, { signe: true })}</b></td>
        <td class="nombre ${classeSigne(l.roi)}">${pctPoints(l.roi)}</td></tr>`).join("")}</tbody></table></div>`}`;

  const donnees = conf.ordre ? lignes : [...lignes].sort((a, b) => a.profit - b.profit);
  const ct = couleursTheme();
  const g = nouveauGraphe($("#graphe-analyse"));
  const valeurs = donnees.map((l) => ({
    value: estCote ? l.paris : l.profit,
    itemStyle: { color: estCote ? ct.peloton : l.profit >= 0 ? ct.gain : ct.perte, borderRadius: conf.vertical ? [6, 6, 0, 0] : [0, 6, 6, 0] },
    ligne: l,
  }));
  const categorie = { type: "category", data: donnees.map((l) => l.cle), axisTick: { show: false }, axisLine: { show: false },
    axisLabel: { color: ct.encre, fontFamily: "Manrope", fontWeight: 600, width: 150, overflow: "truncate" } };
  const valeur = { type: "value", splitLine: { lineStyle: { color: ct.ligne } },
    axisLabel: { color: ct.brume, fontFamily: "Manrope", formatter: (v) => (estCote ? v : euros(v, { rond: true })) } };
  g.setOption({
    grid: { left: conf.vertical ? 56 : 160, right: 24, top: 10, bottom: 28, containLabel: false },
    tooltip: {
      backgroundColor: "#0B1020", borderWidth: 0, textStyle: { color: "#fff", fontFamily: "Manrope" },
      formatter: (p) => {
        const l = p.data.ligne;
        if (estCote) return `<b>Cote ${esc(l.cle)}</b><br>${l.paris} paris gagnés<br>Profit : ${euros(l.profit, { signe: true })}`;
        return `<b>${esc(l.cle)}</b><br>${l.paris} paris, ${pctPoints(l.reussite, { signe: false })} gagnés<br>Misé : ${euros(l.mise)}<br>Profit : <b>${euros(l.profit, { signe: true })}</b><br>ROI : ${pctPoints(l.roi)}`;
      },
    },
    xAxis: conf.vertical ? categorie : valeur,
    yAxis: conf.vertical ? valeur : categorie,
    series: [{ type: "bar", data: valeurs, barMaxWidth: 26 }],
  });
}

/* ===================================================================== import */
async function pageImporter(main) {
  await chargerEtat();
  const im = etat.import;
  if (im.compte_id && !compteParId(im.compte_id)) im.compte_id = null;
  const bk = etat.app.bookmakers.filter((b) => !b.manuel);  // les sites ajoutés à la main ne se collent pas

  main.innerHTML = `
    <div class="entete"><div><h1>Importer tes paris</h1><p>Deux façons de faire, après avoir créé tes comptes. Aucune ne crée de doublon : un pari déjà connu est seulement mis à jour.</p></div>${bandeauDemo()}</div>
    ${methodesImport()}
    <h2 class="titre-section" id="a-la-main" style="margin:26px 0 12px">Copier-coller une page</h2>
    <div class="etapes">
      <section class="panneau">
        <div class="etape-titre"><span class="num">1</span><h2>Choisis le compte</h2></div>
        <div class="choix-bookmaker">
          ${bk.map((b) => {
            const comptes = etat.app.comptes.filter((c) => c.bookmaker === b.nom);
            return `<fieldset>
              <legend>${logoBk(b.nom)} ${esc(b.libelle)}</legend>
              ${comptes.map((c) => `
                <label class="option-compte">
                  <input type="radio" name="compte" value="${c.id}" ${im.compte_id === c.id ? "checked" : ""}>
                  ${avatar(c)}
                  <span><b>${esc(c.nom)}</b><small>${nbParisDepuis(c)}${c.identifiant ? `, pseudo ${esc(c.identifiant)}` : ""}</small>${dernierPari(c)}</span>
                </label>`).join("")}
              <form class="ajout-rapide" data-bookmaker="${esc(b.nom)}">
                <input class="saisie" name="nom" placeholder="${comptes.length ? "Autre compte" : "Nom du compte"}, ex. ${b.nom === "betclic" ? "Elsa" : "Thomas"}" aria-label="Nouveau compte ${esc(b.libelle)}" autocomplete="off">
                <button class="bouton secondaire" type="submit">Ajouter</button>
              </form>
            </fieldset>`;
          }).join("")}
        </div>
      </section>
      <div class="pile">
        <section class="panneau">
          <div class="etape-titre"><span class="num">2</span><h2>Colle ta page d'historique</h2></div>
          <div class="zone-collage">
            <textarea id="texte" spellcheck="false" aria-label="Texte de la page d'historique">${esc(im.texte)}</textarea>
            <div class="invite" id="invite" ${im.texte ? "hidden" : ""}><div><b>Colle ici</b>${etat.app.mobile ? "La page copiée avec l'extension (Copier le texte de la page) : touche longuement ici, puis <b>Coller</b>.<br>"
              : "Sur la page du bookmaker : <kbd>Ctrl</kbd> + <kbd>A</kbd>, puis <kbd>Ctrl</kbd> + <kbd>C</kbd>.<br>Puis ici : <kbd>Ctrl</kbd> + <kbd>V</kbd> (<kbd>⌘</kbd> sur Mac).<br>"}<small>Ou tes messages de pronos Discord (« Meeus @6.5 (0.25%) ») : ils sont reliés à tes paris.</small></div></div>
          </div>
          <p class="consigne" id="consigne">${bk.map((b) => `<b>${esc(b.libelle)}</b> : ${esc(b.consigne.split(". ")[0].replace(/^Sur [^:]+: /, ""))}.`).join("<br>")}</p>
          <div class="actions">
            <label class="bouton secondaire" for="fichier">Choisir un fichier .txt</label>
            <input type="file" id="fichier" accept=".txt,text/plain" hidden>
            <span class="discret petit">ou dépose le fichier sur la zone ci-dessus</span>
          </div>
        </section>
        <section class="panneau" id="verif" ${im.analyse ? "" : "hidden"}></section>
      </div>
    </div>`;

  $$("input[name=compte]", main).forEach((r) => r.addEventListener("change", () => {
    im.compte_id = Number(r.value);
    if (im.texte.trim()) analyser();
  }));
  $$(".ajout-rapide", main).forEach((form) => form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nom = form.nom.value.trim();
    if (!nom) { form.nom.focus(); return; }
    try {
      const c = await api("/api/comptes", { methode: "POST", corps: { bookmaker: form.dataset.bookmaker, nom } });
      im.compte_id = c.id;
      toast(`Compte « ${c.nom} » créé sur ${libelleBookmaker(c.bookmaker)}`);
      await pageImporter(main);
      if (im.texte.trim()) analyser();
    } catch (err) { toast(err.message, true); }
  }));
  const zone = $("#texte");
  const chargerFichier = async (fichier) => {
    if (!fichier) return;
    const texte = await fichier.text();
    zone.value = texte;
    zone.dispatchEvent(new Event("input"));
    toast(`Fichier « ${fichier.name} » chargé`);
  };
  $("#fichier").addEventListener("change", (e) => chargerFichier(e.target.files[0]));
  const cadreCollage = $(".zone-collage");
  cadreCollage.addEventListener("dragover", (e) => { e.preventDefault(); cadreCollage.classList.add("survol"); });
  cadreCollage.addEventListener("dragleave", () => cadreCollage.classList.remove("survol"));
  cadreCollage.addEventListener("drop", (e) => {
    e.preventDefault();
    cadreCollage.classList.remove("survol");
    if (e.dataTransfer.files.length) chargerFichier(e.dataTransfer.files[0]);
  });
  const allerMain = $("[data-aller-main]", main);
  if (allerMain) allerMain.addEventListener("click", (e) => { e.preventDefault(); $("#texte").focus(); $("#a-la-main").scrollIntoView({ behavior: mouvementReduit ? "auto" : "smooth" }); });
  brancherGuide(main);
  brancherIphone(main);
  brancherMontrer(main);
  brancherOuvrirExtensions(main);
  zone.addEventListener("input", () => {
    im.texte = zone.value;
    $("#invite").hidden = Boolean(zone.value);
    clearTimeout(im.minuteur);
    im.minuteur = setTimeout(analyser, 350);
  });
  if (im.analyse) afficherVerification();
  if (!im.texte) zone.focus();
}

const GESTIONNAIRE_FICHIERS = /Mac/i.test(navigator.platform || navigator.userAgent) ? "le Finder" : "l'Explorateur de fichiers";

/* « Montrer dans le Finder » : l'appli ouvre le dossier sur l'ordinateur, sans jamais afficher son chemin. */
function brancherMontrer(racine) {
  $$("[data-montrer]", racine).forEach((b) => b.addEventListener("click", async () => {
    try { await api("/api/montrer", { methode: "POST", corps: { quoi: b.dataset.montrer } }); }
    catch (err) { toast(err.message, true); }
  }));
}

/* L'extension qui écrit à l'appli est plus ancienne que celle du dossier de l'appli (rechargement raté). */
function extensionEnRetard() {
  const vue = etat.app.version_extension_vue, fournie = etat.app.version_extension;
  if (!vue || !fournie) return false;
  const a = vue.split(".").map(Number), b = fournie.split(".").map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) < (b[i] || 0);
  return false;
}

/* « Ouvrir la page des extensions » : chrome://extensions ne s'ouvre pas depuis un lien, l'appli lance le navigateur. */
function brancherOuvrirExtensions(racine) {
  $$("[data-ouvrir-extensions]", racine).forEach((b) => b.addEventListener("click", async () => {
    try {
      await api("/api/ouvrir-extensions", { methode: "POST", corps: {} });
      toast("Page des extensions ouverte dans ton navigateur (sinon, tape chrome://extensions dans sa barre d'adresse).");
    } catch (err) { toast(err.message, true); }
  }));
}

/* Où aller sur chaque site, pour les paris, le solde, les dépôts et retraits : la même fiche pour tous les bookmakers.
   `auto` : l'extension le relève seule ; `main` : pas encore lu, à saisir dans Soldes ; `ac` : par AsianConnect. */
const AC = { mode: "ac", ou: "Par <b>AsianConnect</b> (ac0188.com) : <i>Historique des transactions</i>, chaque transaction dépliée." };
const PAS_LU = { mode: "main", ou: "Pas encore lus : ajoute-les dans la carte du compte (<a href=\"#/soldes\">Soldes</a>)." };
const GUIDE = {
  betclic: { paris: "<i>Mes paris</i> → <b>En cours</b> et <b>Terminés</b>", solde: "À chaque visite", mvts: { ou: "<i>Mon compte</i> → historique des <b>dépôts</b>, puis des <b>retraits</b>" } },
  winamax: { paris: "<i>Mes paris</i>, ou <i>Mon compte</i> → <b>Historique de compte</b>", solde: "À chaque visite (reconnu au pseudo)", mvts: { ou: "<i>Historique de compte</i> → <b>Dépôts</b>, puis <b>Retraits</b>" } },
  unibet: { paris: "<i>Mes paris</i> → <b>Terminés</b>", solde: "À chaque visite", mvts: { ou: "<i>Mon compte</i> → <b>Transactions</b>, onglets <i>Compte</i> et <i>Archivé</i>" } },
  pmu: { paris: "<i>Sport</i> → <i>Mes paris</i> → <b>Tous</b>", solde: "Sur les pages de pmu.fr hors Sport", mvts: { ou: "<b>Mon historique de mouvements</b> → <i>Appro / Retrait</i>" } },
  bet365: { paris: "<i>Mon activité</i> → <b>Historique</b> → <i>Paris terminés</i>", solde: "À chaque visite", mvts: { ou: "<i>Historique</i> → <b>Dépôts</b>, puis <b>Retraits</b>" } },
  ps3838: { paris: "<i>Mon compte</i> → <b>Mes paris</b>, statut <i>Réglé</i>", solde: "À chaque visite", mvts: AC },
  piwi247: { paris: "<b>Mes paris</b>, statut <i>Réglé</i> (comme ps3838)", solde: "À chaque visite", mvts: AC },
  orbitx: { paris: "<i>Account</i> → <i>My Bets</i> → <b>Settled</b>", solde: "À chaque visite (« Balance »)", mvts: AC },
  olybet: { paris: "<b>Historique des paris</b>, puis clique sur chaque pari", solde: "À chaque visite", mvts: PAS_LU },
  bwin: { paris: "<i>Mes paris</i> → <b>Ouvert</b>, <b>Évalué</b> (l'extension lit 90 jours par 90 jours)", solde: "À chaque visite", mvts: PAS_LU },
  sportaza: { paris: "<i>Mes paris</i> → <b>Calculé</b>, <b>Ouvrir</b> (l'extension ouvre chaque pari)", solde: "À chaque visite (« Solde réel »)", mvts: { ou: "<b>Historique des transactions</b>, filtres <i>Dépôt</i> et <i>Retraits</i>" } },
  netbet: { paris: "<i>Mes paris</i> → <b>Paris terminés</b>, page après page", solde: "À chaque visite (« Réel »)", mvts: PAS_LU },
};
const MODES = { auto: ["Automatique", "ok"], main: ["À la main", "main"], ac: ["Par AsianConnect", "ac"] };
const ICONES_GUIDE = {
  paris: '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  solde: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18M16 14.5h2"/></svg>',
  mvts: '<svg viewBox="0 0 24 24"><path d="M7 7h11l-3-3M17 17H6l3 3"/></svg>',
};
function guideBookmakers(focus = "paris") {
  let choisi = "";
  try { choisi = localStorage.getItem("guide-bk") || ""; } catch { /* stockage indisponible */ }
  const noms = Object.keys(GUIDE);
  const avecCompte = noms.filter((n) => etat.app.comptes.some((c) => c.bookmaker === n));
  if (!GUIDE[choisi]) choisi = avecCompte[0] || "betclic";
  return `<section class="panneau guide-bk" data-focus="${esc(focus)}">
    <div class="guide-tete"><h2>Où aller sur chaque site</h2><span class="discret petit">Connecte-toi, ouvre la page : l'extension fait le reste.</span></div>
    <div class="guide-choix" role="tablist" aria-label="Bookmaker">${noms.map((n) =>
      `<button type="button" role="tab" data-guide="${esc(n)}" aria-selected="${n === choisi}" style="--bk:${themeBk(n).fond}">${logoBk(n, "mini")}${esc(libelleBookmaker(n))}</button>`).join("")}</div>
    <div class="guide-fiche">${ficheGuide(choisi, focus)}</div>
  </section>`;
}
function ficheGuide(nom, focus) {
  const g = GUIDE[nom];
  const tuile = (cle, titre, ou, mode) => {
    const [lib, cls] = MODES[mode];
    return `<div class="tuile-guide${cle === focus ? " focus" : ""}"><span class="tuile-icone" aria-hidden="true">${ICONES_GUIDE[cle]}</span>
      <div><h3>${titre} <span class="mode-guide ${cls}">${lib}</span></h3><p>${ou}</p></div></div>`;
  };
  return tuile("paris", "Paris", g.paris, "auto")
    + tuile("solde", "Solde", g.solde, "auto")
    + tuile("mvts", "Dépôts et retraits", g.mvts.ou, g.mvts.mode || "auto");
}
function brancherGuide(racine) {
  const boite = $(".guide-bk", racine);
  if (!boite) return;
  boite.addEventListener("click", (e) => {
    const b = e.target.closest("[data-guide]");
    if (!b) return;
    $$("[data-guide]", boite).forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    $(".guide-fiche", boite).innerHTML = ficheGuide(b.dataset.guide, boite.dataset.focus);
    try { localStorage.setItem("guide-bk", b.dataset.guide); } catch { /* stockage indisponible */ }
  });
}

/* Sur l'iPhone : l'extension Suivi Paris dans Orion lit tes pages de paris, tu envoies quand tu veux, et la
   synchronisation les amène ici (extension/, suivi_paris/synchro.py). Coller une page reste possible, en secours. */
function methodesIphone() {
  return `<div class="methodes">
    <section class="panneau methode principale">
      <div class="methode-tete"><span class="methode-num">1</span><div><h2>Lis tes paris avec l'extension</h2><span class="badge nouveau">Automatique</span></div></div>
      <p>Dans <b>Orion</b>, avec l'extension Suivi Paris liée à ta synchronisation, ouvre <b>Mes paris</b> sur le site du bookmaker (et l'accueil, pour le solde). La page est lue toute seule en quelques secondes.</p>
      <p class="discret petit">Ce qui est lu reste dans l'extension, rangé dans <b>Prêt à envoyer</b> (••• → Suivi Paris), avec le détail des paris.</p>
    </section>
    <section class="panneau methode">
      <div class="methode-tete"><span class="methode-num">2</span><h2>Envoie vers l'appli</h2></div>
      <p>Quand tout est prêt, touche <b>Envoyer vers l'appli</b> : sur le site, dans la fenêtre Suivi Paris, ou dans celle de l'extension. Tout part en une fois, chiffré.</p>
    </section>
    <section class="panneau methode">
      <div class="methode-tete"><span class="methode-num">3</span><h2>Ouvre l'appli</h2></div>
      <p>À l'ouverture, la synchronisation récupère ce qui a été envoyé et l'enregistre. Pas besoin d'attendre :</p>
      <button type="button" class="bouton" data-recuperer>Récupérer maintenant</button>
    </section>
  </div>`;
}
function brancherIphone(main) {
  const recuperer = $("[data-recuperer]", main);
  if (recuperer) recuperer.addEventListener("click", async () => {
    recuperer.disabled = true;
    try {
      await api("/api/synchro/maintenant", { methode: "POST", corps: {} });
      toast("Synchronisation faite : les paris envoyés sont enregistrés");
    } catch (err) { toast(err.message, true); }
    setTimeout(() => { recuperer.disabled = false; }, 4000);
  });
}

/* Les trois façons d'importer, en tête de la page Importer : courtes, la fiche par site dit où aller. */
function methodesImport() {
  const vue = etat.app.extension_vue_le;
  // L'extension se signale à l'appli à chaque démarrage de Chrome, et à chaque envoi.
  const etatExtension = vue
    ? `<span class="statut-extension ok">● Connectée · ${esc(fmtDateHeure.format(new Date(vue)))}</span>`
    : `<span class="statut-extension">○ Pas encore détectée</span>`;
  const n = etat.app.comptes.length;
  const bks = new Set(etat.app.comptes.map((c) => c.bookmaker)).size;
  // Avant tout : les comptes. Sans compte pour un site, rien de ce site n'est enregistré.
  const avant = `<section class="panneau etape-zero${n ? " faite" : ""}">
    <span class="methode-num">${n ? "✓" : "0"}</span>
    <div><h2>${n ? `${n} compte${n > 1 ? "s" : ""} créé${n > 1 ? "s" : ""}, sur ${bks} site${bks > 1 ? "s" : ""}` : "D'abord : crée tes comptes"}</h2>
      <p>Un compte dans l'appli pour chaque compte de bookmaker que tu veux suivre (deux comptes Betclic : deux comptes). Tant qu'un site n'a pas de compte ici, rien de ce site n'est enregistré : ni paris, ni solde.</p></div>
    <a class="bouton ${n ? "secondaire" : ""}" href="#/comptes">${n ? "Gérer mes comptes" : "Créer mes comptes"}</a>
  </section>`;
  if (etat.app.mobile) return `${avant}${methodesIphone()}${guideBookmakers("paris")}`;
  return `${avant}<div class="methodes">
    <section class="panneau methode principale">
      <div class="methode-tete"><span class="methode-num">1</span><div><h2>L'extension Chrome</h2><span class="badge nouveau">Recommandé</span></div></div>
      ${etatExtension}
      <p>Connecte-toi à ton bookmaker comme d'habitude : ce qui s'affiche arrive ici tout seul.</p>
      <div class="pastilles-methode"><span>${ICONES_GUIDE.paris} Paris</span><span>${ICONES_GUIDE.solde} Solde</span><span>${ICONES_GUIDE.mvts} Dépôts et retraits</span></div>
      <p class="note">Appli fermée ? L'extension garde tout et l'envoie à la prochaine ouverture. Elle n'envoie rien ailleurs.</p>
      ${extensionEnRetard() ? `<div class="alerte-boite" style="margin:0 0 12px">L'extension installée (version ${esc(etat.app.version_extension_vue)}) est plus ancienne que celle de l'appli (${esc(etat.app.version_extension)}) et ne s'est pas rechargée seule : dans <code>chrome://extensions</code>, clique sur la flèche circulaire de Suivi Paris. Si rien ne change, elle a été chargée depuis un autre dossier : retire-la et recharge-la avec les étapes ci-dessous.</div>` : ""}
      <details class="installer"${vue ? "" : " open"}><summary>L'installer (une fois, 1 minute)</summary>
        ${etat.app.extension_fournie ? `<div class="actions" style="margin:4px 0 10px"><button type="button" class="bouton" data-ouvrir-extensions>Ouvrir la page des extensions</button></div>` : ""}
        <ol>
          <li>Sur la page des extensions de Chrome (ou Edge, Brave), active le <b>Mode développeur</b>, en haut à droite.</li>
          <li><b>Glisse le dossier extension</b> sur cette page${etat.app.extension_fournie ? ` (<button type="button" class="lien-bouton" data-montrer="extension">le montrer dans ${GESTIONNAIRE_FICHIERS}</button>)` : ""}, ou clique sur <b>Charger l'extension non empaquetée</b> et choisis-le.</li>
          <li>Épingle l'icône Suivi Paris (pièce de puzzle, puis épingle).</li>
        </ol>
        <p class="note" style="margin:0">Garde le dossier Suivi Paris là où il est : l'extension se met à jour avec l'appli.</p>
      </details>
    </section>
    <section class="panneau methode">
      <div class="methode-tete"><span class="methode-num">2</span><h2>À la main</h2></div>
      <p><kbd>Ctrl</kbd> <kbd>A</kbd> puis <kbd>Ctrl</kbd> <kbd>C</kbd> sur la page du site, et colle ci-dessous. Marche aussi pour tes messages Discord.</p>
      <a class="bouton secondaire" href="#/importer" data-aller-main>Coller une page</a>
      <p class="note" style="margin:12px 0 0">Des mois de retard ? Dans l'icône de l'extension : <b>Récupérer tout mon historique</b>.</p>
    </section>
  </div>
  ${guideBookmakers("paris")}`;
}

/* Message de pronos Discord : chaque prono relié à un vrai pari, à marquer « partagé ». */
function afficherDiscord(el, a) {
  const im = etat.import;
  const tous = a.pronos.flatMap((p) => p.paris);
  const aMarquer = tous.filter((x) => !(x.deja_partage && (x.source || "").startsWith("Discord")));
  const quand = (iso) => (iso ? fmtDateHeure.format(new Date(iso)) : "date non copiée");
  const RESULTATS = { gagne: "✅", perdu: "❌", annule: "⚪️" };
  let titre = null;
  el.innerHTML = `
    <div class="etape-titre"><span class="num">3</span><h2>Pronos Discord</h2></div>
    <p>${a.n} prono${a.n > 1 ? "s" : ""} lu${a.n > 1 ? "s" : ""} ; <b>${a.retrouves}</b> retrouvé${a.retrouves > 1 ? "s" : ""} parmi tes paris (${a.paris} pari${a.paris > 1 ? "s" : ""}). Ils seront marqués <b>partagés sur Discord</b>, à la date du message.</p>
    ${a.sans_date ? `<div class="alerte-boite" style="margin-top:8px">${a.sans_date} prono${a.sans_date > 1 ? "s" : ""} sans date : la ligne « auteur — date » de leur message n'a pas été copiée. Ils seront marqués partagés, sans heure de partage prouvée.</div>` : ""}
    <div class="table-defile" style="margin-top:12px"><table class="table-discord">
      <thead><tr><th>Prono</th><th class="nombre">Cote</th><th class="nombre">Conseillé</th><th>Bookmakers</th><th>Ton pari</th></tr></thead>
      <tbody>${a.pronos.map((p) => {
        const entete = `${p.titre}|${p.date}|${p.auteur}`;
        const ligneTitre = entete !== titre ? `<tr class="groupe-discord"><td colspan="5"><b>${esc(p.titre || "Message")}</b> · ${esc(p.auteur || "auteur non copié")} · ${esc(quand(p.date))}</td></tr>` : "";
        titre = entete;
        const paris = p.paris.length ? p.paris.map((x) => `<div class="pari-discord">${logoBk(x.bookmaker, "mini")} ${esc(x.choix || "")} · ${esc(x.marche || "")} · @${fmtCote(x.cote)} · ${euros(x.mise)}${miseEnPct(x.mise)}
            <span class="badge ${esc(x.etat)}">${esc(LIBELLES_ETATS[x.etat] || x.etat)}</span>
            ${x.deja_partage ? `<span class="marque-ticket partage">déjà partagé</span>` : ""}
            ${x.alertes.map((t) => `<div class="alerte-discord">${esc(t)}</div>`).join("")}</div>`).join("")
          : `<span class="discret">Aucun pari correspondant${p.bookmakers.length ? ` sur ${p.bookmakers.map(libelleBookmaker).join(", ")}` : ""} (pas encore importé ?)</span>`;
        return `${ligneTitre}<tr class="${p.paris.length ? "" : "sans-pari"}">
          <td><b>${esc(p.nom)}</b> <span class="discret">${esc(p.marche)}${p.adversaire ? ` devant ${esc(p.adversaire)}` : ""}</span> ${RESULTATS[p.resultat] || ""}</td>
          <td class="nombre">${fmtCote(p.cote)}</td>
          <td class="nombre">${fmtPct2.format(p.pct)} %</td>
          <td class="bks-discord">${p.bookmakers.map((b) => logoBk(b, "mini")).join("")}${p.autres_bookmakers.map((b) => `<span class="discret petit">${esc(b)}</span>`).join(" ")}</td>
          <td>${paris}</td>
        </tr>`;
      }).join("")}</tbody></table></div>
    <div class="actions">
      <button class="bouton" id="relier" ${aMarquer.length ? "" : "disabled"}>Marquer ${aMarquer.length} pari${aMarquer.length > 1 ? "s" : ""} partagé${aMarquer.length > 1 ? "s" : ""} sur Discord</button>
      <button class="bouton fantome" id="vider-discord">Vider</button>
    </div>`;
  $("#relier", el).addEventListener("click", async () => {
    try {
      const r = await api("/api/discord/relier", { methode: "POST", corps: { texte: im.texte } });
      toast(`${r.paris} pari${r.paris > 1 ? "s" : ""} marqué${r.paris > 1 ? "s" : ""} partagé${r.paris > 1 ? "s" : ""} sur Discord`);
      etat.dejaAnime = false;
      analyser();
    } catch (err) { toast(err.message, true); }
  });
  $("#vider-discord", el).addEventListener("click", () => {
    im.texte = ""; im.analyse = null;
    const zone = $("#texte"); if (zone) { zone.value = ""; zone.dispatchEvent(new Event("input")); }
    el.hidden = true;
  });
}

/* La mise affichée d'un pari : un freebet garde sa mise offerte, même si elle n'a rien coûté (`mise` vaut alors 0). */
const miseJouee = (l) => l.mise_jouee ?? l.mise;
const marqueFreebet = (l) => l.freebet
  ? `<span class="marque-ticket freebet" title="Freebet : la mise était offerte. Elle ne coûte rien si le pari perd, et les gains ne la rendent pas.">FB</span>`
  : "";

/* La cote d'un pari : celle du bookmaker, sinon gains ÷ mise pour un pari gagné (+ 1 pour un freebet, dont les gains
   ne rendent pas la mise). */
function coteAffichee(l) {
  if (l.cote) return fmtCote(l.cote);
  const mise = miseJouee(l);
  if (l.etat === "gagne" && l.gains && mise) return `<span title="Déduite : gains ÷ mise">${fmtCote(l.gains / mise + (l.freebet ? 1 : 0))}</span>`;
  return "—";
}

/* « · 0,5 % » : une mise en % de la bankroll, si elle est définie. */
function miseEnPct(mise, { seul = false } = {}) {
  const bk = etat.app && etat.app.bankroll;
  if (!bk || mise === null || mise === undefined) return "";
  const t = `${fmtPct2.format((mise / bk) * 100)} %`;
  return seul ? t : ` <span class="pct-bk">· ${t}</span>`;
}

async function analyser() {
  const im = etat.import;
  if (!im.texte.trim()) { im.analyse = null; $("#verif").hidden = true; return; }
  try {
    im.analyse = await api("/api/analyser", { methode: "POST", corps: { texte: im.texte, compte_id: im.compte_id } });
    im.analyse.erreur = null;
    if (im.analyse.type === "discord") { afficherVerification(); return; }
    const a = im.analyse;
    const choisi = im.compte_id && compteParId(im.compte_id);
    if (a.compte_id && a.compte_id !== im.compte_id) {
      im.compte_id = a.compte_id; // compte reconnu grâce au pseudo
      const radio = $(`input[name=compte][value="${a.compte_id}"]`);
      if (radio) radio.checked = true;
    } else if (!choisi || choisi.bookmaker !== a.bookmaker) {
      const candidats = etat.app.comptes.filter((c) => c.bookmaker === a.bookmaker);
      if (candidats.length === 1) {
        im.compte_id = candidats[0].id;
        const radio = $(`input[name=compte][value="${im.compte_id}"]`);
        if (radio) radio.checked = true;
        im.analyse = await api("/api/analyser", { methode: "POST", corps: { texte: im.texte, compte_id: im.compte_id } });
      }
    }
  } catch (e) {
    im.analyse = { erreur: e.message };
  }
  afficherVerification();
}

function afficherVerification() {
  const im = etat.import;
  const a = im.analyse;
  const el = $("#verif");
  if (!el || !a) return;
  el.hidden = false;
  if (a.erreur) {
    el.innerHTML = `<div class="etape-titre"><span class="num">3</span><h2>Vérifie</h2></div><div class="alerte-boite erreur">${esc(a.erreur)}</div>`;
    return;
  }
  if (a.type === "discord") { afficherDiscord(el, a); return; }
  const compte = im.compte_id && compteParId(im.compte_id);
  const compteOk = compte && compte.bookmaker === a.bookmaker;
  const aEnregistrer = a.bilan["nouveau"] + a.bilan["mis à jour"];
  const statutBadge = (l) => {
    if (l.autre_compte) return `<span class="badge alerte" title="Déjà rattaché au compte ${esc(l.autre_compte)}">Compte ${esc(l.autre_compte)}</span>`;
    return { "nouveau": `<span class="badge nouveau">Nouveau</span>`, "mis à jour": `<span class="badge maj">Mis à jour</span>`, "déjà connu": `<span class="badge connu">Déjà connu</span>` }[l.statut];
  };
  if (!compteOk) {
    const champ = $(`form[data-bookmaker="${a.bookmaker}"] input`);
    if (champ && !champ.value && a.identifiant && !etat.app.comptes.some((c) => c.bookmaker === a.bookmaker)) champ.value = a.identifiant;
  }
  el.innerHTML = `
    <div class="etape-titre"><span class="num">3</span><h2>Vérifie et enregistre</h2></div>
    <p>${a.paris.length} paris reconnus sur <b>${esc(a.libelle)}</b>${a.identifiant ? `, compte <b>${esc(a.identifiant)}</b>` : ""}.</p>
    ${!compteOk ? `<div class="alerte-boite">Cette page vient de ${esc(a.libelle)} : choisis ou crée un compte ${esc(a.libelle)} à gauche pour l'enregistrer.</div>` : ""}
    ${a.avertissements.map((w) => `<div class="alerte-boite" style="margin-top:8px">${esc(w)}</div>`).join("")}
    ${a.autre_compte ? `<div class="alerte-boite" style="margin-top:8px">${a.autre_compte} pari(s) sont déjà rattachés à un autre compte : ils y restent (leur résultat sera mis à jour). Pour les déplacer, passe par « Mes paris ».</div>` : ""}
    <div class="bilan-import">
      <div><b class="gain">${a.bilan["nouveau"]}</b><span>nouveaux</span></div>
      <div><b>${a.bilan["mis à jour"]}</b><span>à mettre à jour</span></div>
      <div><b class="discret">${a.bilan["déjà connu"]}</b><span>déjà connus</span></div>
    </div>
    <div class="actions">
      <button class="bouton" id="enregistrer" ${compteOk && aEnregistrer ? "" : "disabled"}>${aEnregistrer ? `Enregistrer ${aEnregistrer} pari${aEnregistrer > 1 ? "s" : ""}${compteOk ? ` sur ${esc(compte.nom)}` : ""}` : "Rien de nouveau à enregistrer"}</button>
      <button class="bouton fantome" id="annuler">Vider</button>
    </div>
    ${a.bookmaker === "betclic" ? `<p class="note" style="margin-top:12px">Betclic n'affiche pas le sport : il est deviné. Tu peux le corriger ensuite dans « Mes paris ».</p>` : ""}
    <div class="table-defile"><table>
      <thead><tr><th>Import</th><th>Date</th><th>Pari</th><th>État</th><th class="nombre">Mise</th><th class="nombre">Gains</th></tr></thead>
      <tbody>${a.paris.slice(0, 300).map((l) => `<tr>
        <td>${statutBadge(l)}</td>
        <td class="petit">${fmtDateHeure.format(new Date(l.date))}</td>
        <td><div class="pari-titre">${sportEmoji(l.sport)} ${esc(l.resume)}</div><div class="pari-sous">${esc(l.sport)}</div></td>
        <td><span class="badge ${esc(l.etat)}">${esc(LIBELLES_ETATS[l.etat] || l.etat_brut)}</span></td>
        <td class="nombre">${euros(l.mise)}${marqueFreebet(l)}</td><td class="nombre">${l.gains === null ? "—" : euros(l.gains)}</td>
      </tr>`).join("")}</tbody></table></div>
    ${a.paris.length > 300 ? `<p class="note" style="margin-top:10px">Aperçu limité aux 300 premiers paris ; les ${a.paris.length} seront enregistrés.</p>` : ""}`;

  $("#annuler").addEventListener("click", () => {
    Object.assign(im, { texte: "", analyse: null });
    pageImporter($("#page"));
  });
  $("#enregistrer").addEventListener("click", async (e) => {
    e.target.disabled = true;
    try {
      const b = await api("/api/enregistrer", { methode: "POST", corps: { texte: im.texte, compte_id: im.compte_id } });
      toast(`${b.nouveaux} nouveau${b.nouveaux > 1 ? "x" : ""}, ${b.mis_a_jour} mis à jour sur ${compte.nom} (${libelleBookmaker(compte.bookmaker)})`);
      if (b.resume) toast("Résumé iPhone mis à jour");
      if (b.resume_erreur) toast(`Résumé iPhone non mis à jour : ${b.resume_erreur}`, true);
      Object.assign(im, { texte: "", analyse: null });
      etat.dejaAnime = false;
      await pageImporter($("#page"));
    } catch (err) {
      toast(err.message, true);
      e.target.disabled = false;
    }
  });
}

/* ===================================================================== mes paris */
async function pageParis(main) {
  await chargerEtat();
  const p = etat.paris;
  const q = new URLSearchParams({ page: p.page, par_page: 50 });
  if (p.recherche) q.set("recherche", p.recherche);
  if (p.comptes.size) q.set("comptes", [...p.comptes].join(","));
  if (p.etats.size) q.set("etats", [...p.etats].join(","));
  if (p.sports.size) q.set("sports", [...p.sports].join(","));
  if (p.partages) q.set("partages", "1");
  const qEnCours = new URLSearchParams({ etats: "en_cours", par_page: 1 });
  if (p.comptes.size) qEnCours.set("comptes", [...p.comptes].join(","));
  const [r, enCours] = await Promise.all([api("/api/paris?" + q), api("/api/paris?" + qEnCours)]);
  const partages = p.partages ? await api("/api/tableau?partages=1") : null;
  const pages = Math.max(1, Math.ceil(r.total / r.par_page));
  const sports = etat.app.sports;

  main.innerHTML = `
    <div class="entete"><div><h1>Mes paris</h1><p>${r.total} paris${r.total ? `, ${euros(r.mise, { rond: true })} misés, profit <b class="${classeSigne(r.profit)}">${euros(r.profit, { signe: true })}</b>` : ""}</p></div><div class="actions">${bandeauDemo()}<button class="bouton" type="button" id="ajouter-pari">＋ Ajouter un pari</button></div></div>
    ${partages && !partages.vide ? `<section class="bandeau-partages">
      <div><b>Suivi public</b><span>${partages.indicateurs.n} bets partagés réglés · profit <b class="${classeSigne(partages.indicateurs.profit)}">${euros(partages.indicateurs.profit, { signe: true })}</b> · ROI ${pct(partages.indicateurs.roi)} · réussite ${pct(partages.indicateurs.reussite, { signe: false })}${partages.indicateurs.n_en_cours ? ` · ${partages.indicateurs.n_en_cours} en cours` : ""}</span></div>
      <a class="bouton" href="/api/partages.html" download="Suivi public.html">Télécharger la page publique</a>
    </section>` : ""}
    <div class="filtres">
      <input class="saisie" id="recherche" type="search" placeholder="Rechercher un coureur, une course, un marché…" value="${esc(p.recherche)}" style="min-width:280px;flex:1">
      <div class="groupe">${["en_cours", "gagne", "perdu", "annule"].map((e) =>
        `<button type="button" class="puce${e === "en_cours" ? " puce-en-cours" : ""}" data-etat="${e}" aria-pressed="${p.etats.has(e)}">${e === "en_cours"
          ? `⏳ En cours <span class="compte-puce">${enCours.total}</span>` : LIBELLES_ETATS[e]}</button>`).join("")}
        <button type="button" class="puce" id="f-partages" aria-pressed="${p.partages}">🔗 Partagés</button>
        ${sansSportPresents().length ? `<button type="button" class="puce" id="f-sans-sport" title="Les paris dont le sport n'a pas été reconnu, à corriger dans la colonne Sport" aria-pressed="${p.sports.size > 0 && [...p.sports].every((s) => SANS_SPORT.includes(s))}">❓ Sans sport</button>` : ""}</div>
      <div class="groupe menus">
        ${etat.app.comptes.filter((c) => c.n_paris).length > 1 ? menuArbre({ id: "p-comptes", etiquette: "Comptes", tous: "Tous", unite: "comptes", groupes: groupesComptes(), selection: p.comptes }) : ""}
        ${(etat.app.familles || []).flatMap((x) => x.sports).length > 1 ? menuArbre({ id: "p-sports", etiquette: "Sports", tous: "Tous", unite: "sports", groupes: groupesSports(), selection: p.sports }) : ""}
      </div>
    </div>
    <section class="panneau">
      ${r.lignes.length ? `<div class="table-defile"><table>
        <thead><tr><th title="Date de l'événement quand le site l'affiche (le jour où le pari compte), sinon date du pari">Date</th><th>Pari</th><th>Compte</th><th>Sport</th><th>État</th><th class="nombre">Mise</th><th class="nombre">Cote</th><th class="nombre">Gains</th><th class="nombre">Profit</th><th><span class="visuellement-cache">Actions</span></th></tr></thead>
        <tbody>${r.lignes.map((l) => {
          const memes = etat.app.comptes.filter((c) => c.bookmaker === l.bookmaker);
          return `<tr data-bookmaker="${esc(l.bookmaker)}" data-reference="${esc(l.reference)}">
            <td class="petit cellule-date">${celluleDate(l)}</td>
            <td class="cellule-pari"><div class="pari-titre" data-ouvrir title="Modifier ce pari">${sportEmoji(l.sport)} ${esc(l.resume)}</div><div class="pari-sous">${esc(l.categorie_marche)}</div></td>
            <td class="cellule-compte"><select data-champ="compte" aria-label="Compte">${memes.map((c) =>
              `<option value="${c.id}" ${c.id === l.compte_id ? "selected" : ""}>${esc(c.nom)} (${esc(libelleBookmaker(c.bookmaker))})</option>`).join("")}</select></td>
            <td class="cellule-sport"><select data-champ="sport" aria-label="Sport">${[...new Set([l.sport, ...sports])].map((s) =>
              `<option ${s === l.sport ? "selected" : ""}>${esc(s)}</option>`).join("")}</select></td>
            <td class="cellule-etat"><span class="badge ${esc(l.etat)}">${esc(LIBELLES_ETATS[l.etat] || l.etat)}</span>${l.modifie_main || l.champs_corriges ? ` <span class="marque-ticket modifie" title="Modifié à la main">✎</span>` : ""}${l.manuel ? ` <span class="marque-ticket manuel" title="Ajouté à la main">main</span>` : ""}</td>
            <td class="nombre" data-libelle="Mise">${euros(miseJouee(l))}${marqueFreebet(l)}${etat.app.bankroll ? `<div class="pct-bk">${miseEnPct(miseJouee(l), { seul: true })}</div>` : ""}</td>
            <td class="nombre" data-libelle="Cote">${coteAffichee(l)}</td>
            <td class="nombre" data-libelle="Gains">${l.gains === null ? "—" : euros(l.gains)}</td>
            <td class="nombre ${classeSigne(l.profit)}" data-libelle="Profit"><b>${l.profit === null ? "—" : euros(l.profit, { signe: true })}</b></td>
            <td class="actions-ligne">
              <button type="button" class="bascule-public" data-public aria-pressed="${Boolean(l.partage)}" title="${l.partage ? `Partagé le ${esc(fmtDateHeure.format(new Date(l.partage_le)))}${l.partage_source ? ` (${esc(l.partage_source)})` : ""} : clique pour le retirer du suivi public` : "Ajouter au suivi public"}">${l.partage_source && l.partage_source.startsWith("Discord") ? "💬 Discord" : "🔗 Public"}</button>
              <button type="button" class="bouton fantome petit" data-modifier>Modifier</button>
              <button type="button" class="bouton fantome petit danger" data-supprimer-ligne title="Supprimer ce pari">Supprimer</button>
            </td>
          </tr>`;
        }).join("")}</tbody></table></div>
        <div class="pagination">
          <span class="discret petit">Page ${r.page} sur ${pages}</span>
          <div class="actions" style="margin:0">
            <button class="bouton secondaire" id="prec" ${r.page <= 1 ? "disabled" : ""}>Page précédente</button>
            <button class="bouton secondaire" id="suiv" ${r.page >= pages ? "disabled" : ""}>Page suivante</button>
          </div>
        </div>` : `<div class="vide"><strong>Aucun pari trouvé</strong><p>Change la recherche ou les filtres${etat.app.n_paris ? "" : ", ou importe ton premier historique"}.</p></div>`}
    </section>`;

  const relancer = () => pageParis(main);
  let minuteur;
  $("#recherche").addEventListener("input", (e) => {
    clearTimeout(minuteur);
    minuteur = setTimeout(async () => {
      p.recherche = e.target.value; p.page = 1;
      await relancer();
      const champ = $("#recherche"); champ.focus(); champ.setSelectionRange(champ.value.length, champ.value.length);
    }, 300);
  });
  $$("[data-etat]", main).forEach((b) => b.addEventListener("click", () => { const v = b.dataset.etat; p.etats.has(v) ? p.etats.delete(v) : p.etats.add(v); p.page = 1; relancer(); }));
  $("#f-partages").addEventListener("click", () => { p.partages = !p.partages; p.page = 1; relancer(); });
  const sansSport = $("#f-sans-sport");
  if (sansSport) sansSport.addEventListener("click", () => {
    const actif = sansSport.getAttribute("aria-pressed") === "true";
    p.sports = actif ? new Set() : new Set(sansSportPresents());
    p.page = 1;
    relancer();
  });
  const parCle = new Map(r.lignes.map((l) => [`${l.bookmaker}|${l.reference}`, l]));
  $$("[data-public]", main).forEach((b) => b.addEventListener("click", async () => {
    const tr = b.closest("tr");
    const l = parCle.get(`${tr.dataset.bookmaker}|${tr.dataset.reference}`);
    const partage = !l.partage;
    b.disabled = true;
    try {
      await api("/api/paris/partage", { methode: "POST", corps: { bookmaker: l.bookmaker, reference: l.reference, partage } });
      l.partage = partage ? 1 : 0;
      b.setAttribute("aria-pressed", String(partage));
      b.title = partage ? "Partagé à l'instant : clique pour le retirer du suivi public" : "Ajouter au suivi public";
      toast(partage ? "Ajouté au suivi public" : "Retiré du suivi public");
      etat.dejaAnime = false;
      if (p.partages) relancer(); // dans la vue « Partagés », la liste et ses stats changent
    } catch (err) { toast(err.message, true); }
    b.disabled = false;
  }));
  $$("[data-modifier]", main).forEach((b) => b.addEventListener("click", () => {
    const tr = b.closest("tr");
    ouvrirModification(parCle.get(`${tr.dataset.bookmaker}|${tr.dataset.reference}`), relancer);
  }));
  $$("[data-ouvrir]", main).forEach((b) => b.addEventListener("click", () => {
    const tr = b.closest("tr");
    ouvrirModification(parCle.get(`${tr.dataset.bookmaker}|${tr.dataset.reference}`), relancer);
  }));
  $$("[data-supprimer-ligne]", main).forEach((b) => b.addEventListener("click", () => {
    const tr = b.closest("tr");
    supprimerPari(parCle.get(`${tr.dataset.bookmaker}|${tr.dataset.reference}`), relancer);
  }));
  $("#ajouter-pari").addEventListener("click", () => formulairePari(null, relancer));
  const relancerPage1 = () => { p.page = 1; relancer(); };
  brancherMenu(main, "p-comptes", p.comptes, relancerPage1);
  brancherMenu(main, "p-sports", p.sports, relancerPage1);
  const prec = $("#prec"), suiv = $("#suiv");
  if (prec) prec.addEventListener("click", () => { p.page -= 1; relancer(); window.scrollTo(0, 0); });
  if (suiv) suiv.addEventListener("click", () => { p.page += 1; relancer(); window.scrollTo(0, 0); });
  $$("select[data-champ]", main).forEach((s) => s.addEventListener("change", async () => {
    const tr = s.closest("tr");
    const base = { bookmaker: tr.dataset.bookmaker };
    try {
      if (s.dataset.champ === "sport") {
        await api("/api/paris/sport", { methode: "POST", corps: { ...base, reference: tr.dataset.reference, sport: s.value } });
        toast(`Sport corrigé : ${s.value}`);
      } else {
        await api("/api/paris/compte", { methode: "POST", corps: { ...base, references: [tr.dataset.reference], compte_id: Number(s.value) } });
        toast(`Pari déplacé sur ${compteParId(Number(s.value)).nom}`);
      }
      etat.dejaAnime = false;
    } catch (err) { toast(err.message, true); relancer(); }
  }));
}

/* ===================================================================== comptes */
async function pageComptes(main) {
  await chargerEtat();
  const bk = etat.app.bookmakers;
  main.innerHTML = `
    <div class="entete"><div><h1>Comptes</h1></div><div class="actions">${bandeauDemo()}<button class="bouton" type="button" id="bouton-ajout" aria-expanded="false" aria-controls="ajout-compte">＋ Ajouter un compte</button></div></div>
    <section class="panneau" id="ajout-compte" hidden>
        <h2 style="margin-bottom:14px">Ajouter un compte</h2>
        <form class="formulaire-compte" id="nouveau-compte">
          <div class="champ"><label for="nc-bk">Site</label>
            <select class="saisie" id="nc-bk">${bk.map((b) => `<option value="${esc(b.nom)}">${esc(b.libelle)}</option>`).join("")}
              <option value="" data-autre>＋ Un autre site…</option></select></div>
          <div class="champ" id="nc-site-champ" hidden><label for="nc-site">Nom du site</label><input class="saisie" id="nc-site" placeholder="ex. Parions Sport, Zebet…" autocomplete="off"></div>
          <div class="champ"><label for="nc-nom">Nom</label><input class="saisie" id="nc-nom" placeholder="ex. Elsa, Stéphane…" autocomplete="off"></div>
          <button class="bouton" type="submit">Ajouter le compte</button>
        </form>
        <p class="note" id="nc-note-autre" hidden style="margin:12px 0 0">Un site que l'appli ne lit pas encore : tu y ajoutes tes paris à la main (<i>Mes paris</i> → <b>＋ Ajouter un pari</b>), et ton solde, tes dépôts et tes retraits dans <i>Soldes</i>.</p>
    </section>
    <section class="panneau bankroll">
      <div>
        <h2>Ta bankroll</h2>
        <p class="note" style="margin:4px 0 0">La somme de référence de tes paris : chaque mise s'affiche aussi en % de cette somme (10 000 € de bankroll : un pari de 100 € = 1 %), comme les pronos partagés sur Discord.</p>
      </div>
      <form id="form-bankroll" class="champ-bankroll">
        <input class="saisie" name="bankroll" inputmode="decimal" placeholder="ex. 10 000" value="${etat.app.bankroll ? fmtPct2.format(etat.app.bankroll) : ""}" aria-label="Bankroll en euros"> €
        <button class="bouton" type="submit">Enregistrer</button>
      </form>
    </section>
    <div class="liste-comptes">
      ${bk.map((b) => {
        const comptes = etat.app.comptes.filter((c) => c.bookmaker === b.nom);
        return `<section class="panneau groupe-bookmaker">
          <h2 class="titre-bk">${logoBk(b.nom, "grand")} ${esc(b.libelle)}${b.manuel ? ` <span class="marque-ticket manuel" title="Site que l'appli ne lit pas : paris et soldes à la main">à la main</span>` : ""}
            ${b.manuel && !comptes.length && !etat.app.distant ? `<button class="bouton fantome petit" type="button" data-supprimer-site="${esc(b.nom)}" style="margin-left:auto">Supprimer ce site</button>` : ""}</h2>
          ${b.manuel && bk.some((r) => !r.manuel && r.libelle.toLowerCase() === b.libelle.toLowerCase()) ? `<p class="note">${esc(b.libelle)} est maintenant lu par l'appli : crée le compte dans « ${esc(bk.find((r) => !r.manuel && r.libelle.toLowerCase() === b.libelle.toLowerCase()).libelle)} » (ci-dessus). Les paris ajoutés à la main se déplacent un par un (Mes paris → Modifier → Compte) ; vide, ce site peut être supprimé.</p>` : ""}
          ${comptes.length ? comptes.map((c) => `
            <div class="ligne-compte" data-id="${c.id}">
              ${avatar(c)}
              <div class="pile" style="gap:8px">
                <input class="saisie" data-champ="nom" value="${esc(c.nom)}" aria-label="Nom du compte" style="max-width:320px;font-weight:700">
                <div class="nuancier" role="group" aria-label="Couleur">${COULEURS.map((col) =>
                  `<button type="button" data-couleur="${col}" style="background:${col}" aria-pressed="${col.toLowerCase() === c.couleur.toLowerCase()}" aria-label="Couleur ${col}"></button>`).join("")}</div>
                <div class="devise-compte">
                  <label>Monnaie <select class="saisie" data-devise aria-label="Monnaie du compte ${esc(c.nom)}">${Object.keys(DEVISES).map((d) =>
                    `<option value="${d}" ${d === (c.devise || "EUR") ? "selected" : ""}>${d === "EUR" ? "Euro (€)" : d}</option>`).join("")}</select></label>
                  <label data-champ-taux ${(c.devise || "EUR") === "EUR" ? "hidden" : ""}>1 <span data-symbole>${esc(c.devise || "")}</span> =
                    <input class="saisie" data-taux inputmode="decimal" value="${c.taux ? String(c.taux).replace(".", ",") : ""}" placeholder="1,07" aria-label="Valeur en euros"> €</label>
                </div>
                <span class="discret petit">${nbParisDepuis(c)}${c.identifiant ? `, compte reconnu : ${esc(c.identifiant)}` : ""}</span>
                ${dernierPari(c)}
              </div>
              <button class="bouton fantome" data-supprimer ${c.n_paris ? `disabled title="Déplace d'abord ses paris vers un autre compte"` : ""}>Supprimer</button>
            </div>`).join("") : `<p class="discret">Aucun compte ${esc(b.libelle)} pour l'instant.</p>`}
        </section>`;
      }).join("")}
    </div>`;

  $$(".ligne-compte", main).forEach((ligne) => {
    const id = Number(ligne.dataset.id);
    const champ = $("[data-champ=nom]", ligne);
    const renommer = async () => {
      const c = compteParId(id);
      if (champ.value.trim() === c.nom) return;
      try { await api(`/api/comptes/${id}`, { methode: "PATCH", corps: { nom: champ.value } }); toast("Compte renommé"); await chargerEtat(); }
      catch (err) { toast(err.message, true); champ.value = c.nom; }
    };
    champ.addEventListener("change", renommer);
    champ.addEventListener("keydown", (e) => { if (e.key === "Enter") champ.blur(); });
    const devise = $("[data-devise]", ligne), taux = $("[data-taux]", ligne), champTaux = $("[data-champ-taux]", ligne);
    const changerDevise = async () => {
      champTaux.hidden = devise.value === "EUR";
      $("[data-symbole]", ligne).textContent = devise.value;
      if (devise.value !== "EUR" && !taux.value.trim()) { taux.focus(); return; }  // le taux d'abord
      try {
        await api(`/api/comptes/${id}`, { methode: "PATCH", corps: { devise: devise.value, taux: devise.value === "EUR" ? null : taux.value } });
        toast(devise.value === "EUR" ? "Compte en euros" : `Compte en ${devise.value} : 1 ${devise.value} = ${taux.value} €`);
        await chargerEtat();
      } catch (err) { toast(err.message, true); }
    };
    devise.addEventListener("change", changerDevise);
    taux.addEventListener("change", changerDevise);
    $$("[data-couleur]", ligne).forEach((b) => b.addEventListener("click", async () => {
      try { await api(`/api/comptes/${id}`, { methode: "PATCH", corps: { couleur: b.dataset.couleur } }); pageComptes(main); }
      catch (err) { toast(err.message, true); }
    }));
    $("[data-supprimer]", ligne).addEventListener("click", async () => {
      if (!confirm(`Supprimer le compte « ${compteParId(id).nom} » ?`)) return;
      try { await api(`/api/comptes/${id}`, { methode: "DELETE" }); toast("Compte supprimé"); pageComptes(main); }
      catch (err) { toast(err.message, true); }
    });
  });
  $$("[data-supprimer-site]", main).forEach((b) => b.addEventListener("click", async () => {
    const site = (etat.app.bookmakers.find((x) => x.nom === b.dataset.supprimerSite) || {}).libelle || "ce site";
    if (!confirm(`Supprimer le site « ${site} » ?`)) return;
    try { await api("/api/sites/supprimer", { methode: "POST", corps: { nom: b.dataset.supprimerSite } }); toast("Site supprimé"); await chargerEtat(); pageComptes(main); }
    catch (err) { toast(err.message, true); }
  }));
  $("#bouton-ajout").addEventListener("click", (e) => {
    const panneau = $("#ajout-compte");
    panneau.hidden = !panneau.hidden;
    e.currentTarget.setAttribute("aria-expanded", String(!panneau.hidden));
    if (!panneau.hidden) $("#nc-nom").focus();
  });
  $("#form-bankroll").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const r = await api("/api/bankroll", { methode: "POST", corps: { bankroll: e.target.bankroll.value } });
      toast(r.bankroll ? `Bankroll : ${euros(r.bankroll, { rond: true })}` : "Bankroll effacée");
      etat.dejaAnime = false;
      pageComptes(main);
    } catch (err) { toast(err.message, true); }
  });
  const majAutre = () => {
    const autre = !$("#nc-bk").value;
    $("#nc-site-champ").hidden = !autre;
    $("#nc-note-autre").hidden = !autre;
    if (autre) $("#nc-site").focus();
  };
  $("#nc-bk").addEventListener("change", majAutre);
  $("#nouveau-compte").addEventListener("submit", async (e) => {
    e.preventDefault();
    const autre = !$("#nc-bk").value;
    if (autre && !$("#nc-site").value.trim()) { toast("Écris le nom du site.", true); $("#nc-site").focus(); return; }
    try {
      const c = await api("/api/comptes", { methode: "POST", corps: autre
        ? { site: $("#nc-site").value, nom: $("#nc-nom").value } : { bookmaker: $("#nc-bk").value, nom: $("#nc-nom").value } });
      toast(`Compte « ${c.nom} » ajouté`);
      pageComptes(main);
    } catch (err) { toast(err.message, true); }
  });
}

/* ===================================================================== tickets
   Un pari affiché comme un ticket d'appli de paris : bandeau aux couleurs du bookmaker, sélections, mise, cote,
   gains. Utilisé par les pages bookmaker, les paris d'un jour et la modification. */
const THEMES_BK = {
  betclic: { fond: "#E4002B", fonce: "#9E001E", accent: "#FFFFFF" },
  winamax: { fond: "#1C1A26", fonce: "#000000", accent: "#E2001A" },
  unibet: { fond: "#147B45", fonce: "#0A4F2B", accent: "#FFE14D" },
  pmu: { fond: "#00843D", fonce: "#00522A", accent: "#FF4A3D" },
  ps3838: { fond: "#0B2D5B", fonce: "#051733", accent: "#F5B700" },
  bet365: { fond: "#126E51", fonce: "#0A3D2D", accent: "#FFDF1B" },
  piwi247: { fond: "#14305E", fonce: "#0A1A36", accent: "#3FC1F0" },
  olybet: { fond: "#D98E04", fonce: "#6B4500", accent: "#FFFFFF" },
  bwin: { fond: "#2A2A2A", fonce: "#000000", accent: "#FFCC00" },
  sportaza: { fond: "#5B2BE0", fonce: "#2A1170", accent: "#FFD23F" },
  netbet: { fond: "#C8102E", fonce: "#5E0715", accent: "#FFFFFF" },
  orbitx: { fond: "#3E4A12", fonce: "#1C2208", accent: "#B6E33A" },
};
const themeBk = (nom) => THEMES_BK[nom] || { fond: (BOOKMAKERS_STYLE[nom] || [, "#5B3DF5"])[1], fonce: "#1B1340", accent: "#FFFFFF" };
const LIBELLES_ETATS_TICKET = { gagne: "Gagné", perdu: "Perdu", en_cours: "En cours", annule: "Remboursé", cashout: "Cash-out", inconnu: "?" };
const fmtCoteNb = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const fmtCote = (c) => (c ? fmtCoteNb.format(c) : "—");

function libelleType(l) {
  if (l.type === "combine") return l.nb_selections > 1 ? `Combiné (${l.nb_selections})` : "Combiné";
  if (l.type === "mycombi") return `Combiné même match (${l.nb_selections})`;
  if (l.type === "systeme") return "Système";
  return l.nb_selections > 1 ? `${l.nb_selections} simples` : "Simple";
}

function ticketHTML(l, { actions = true } = {}) {
  const th = themeBk(l.bookmaker);
  const sels = l.selections && l.selections.length ? l.selections : null;
  // Gain potentiel : mise × cote ; un freebet ne rend pas sa mise, mise × (cote − 1).
  const potentiel = l.etat === "en_cours" && l.cote ? miseJouee(l) * (l.freebet ? l.cote - 1 : l.cote) : null;
  const montantFinal = l.etat === "en_cours"
    ? `<small>Gain potentiel</small><b>${potentiel ? euros(potentiel) : "—"}</b>`
    : `<small>${l.etat === "annule" ? "Remboursé" : "Gains"}</small><b class="${l.etat === "gagne" || l.etat === "cashout" ? "gain" : ""}">${euros(l.gains ?? 0)}</b>`;
  return `<article class="ticket etat-${esc(l.etat)}" ${actions ? "data-ouvrable" : ""} style="--bk:${th.fond};--bk-fonce:${th.fonce};--bk-accent:${th.accent}" data-bookmaker="${esc(l.bookmaker)}" data-reference="${esc(l.reference)}">
    <header class="ticket-tete">
      ${logoBk(l.bookmaker)}
      <span class="ticket-type">${esc(libelleType(l))}${l.cote_boostee ? ` <span class="boost" title="Cote boostée">⚡</span>` : ""}</span>
      <span class="ticket-etat">${esc(LIBELLES_ETATS_TICKET[l.etat] || l.etat)}</span>
    </header>
    <div class="ticket-corps">
      ${sels ? sels.map((s) => `<div class="ticket-sel">
          <span class="ticket-sport" aria-hidden="true">${sportEmoji(s.sport || l.sport)}</span>
          <div><b>${esc(s.choix || "—")}</b><span>${esc(s.marche || "")}</span><small>${esc(s.evenement || "")}</small></div>
          ${s.cote ? `<em>${fmtCote(s.cote)}</em>` : ""}
        </div>`).join("")
        : `<div class="ticket-sel"><span class="ticket-sport" aria-hidden="true">${sportEmoji(l.sport)}</span><div><b>${esc(l.resume)}</b><small>Le bookmaker n'affiche pas le détail des sélections.</small></div></div>`}
    </div>
    <div class="ticket-coupure" aria-hidden="true"></div>
    <div class="ticket-pied">
      <div><small>Mise${marqueFreebet(l)}</small><b>${euros(miseJouee(l))}</b>${etat.app.bankroll ? `<span class="pct-ticket">${miseEnPct(miseJouee(l), { seul: true })} de BK</span>` : ""}</div>
      <div><small>Cote</small><b>${coteAffichee(l)}</b></div>
      <div>${montantFinal}</div>
    </div>
    <footer class="ticket-meta">
      <span>${dateEvenement(l) ? `Événement le ${esc(dateEvenement(l))} · pris le ` : ""}${fmtDateHeure.format(new Date(l.date_pari))} · ${esc(l.compte_nom)} · réf. ${esc(l.reference)}</span>
      <span class="ticket-marques">
        ${l.partage ? `<span class="marque-ticket partage" title="Partagé le ${esc(fmtDateHeure.format(new Date(l.partage_le)))}${l.partage_source ? ` (${esc(l.partage_source)})` : ""}">${l.partage_source && l.partage_source.startsWith("Discord") ? "Discord" : "Partagé"}</span>` : ""}
        ${l.modifie_main ? `<span class="marque-ticket modifie" title="Modifié à la main${l.valeurs_import ? ` ; le bookmaker indiquait : ${esc(LIBELLES_ETATS_TICKET[l.valeurs_import.etat] || l.valeurs_import.etat)}` : ""}">Modifié</span>` : ""}
      </span>
    </footer>
    ${actions ? `<div class="ticket-actions">
      <button type="button" class="bouton fantome petit" data-modifier>Modifier</button>
      <button type="button" class="bouton fantome petit" data-partager aria-pressed="${Boolean(l.partage)}">${l.partage ? "Ne plus partager" : "Partager"}</button>
      <button type="button" class="bouton fantome petit danger" data-supprimer-ticket>Supprimer</button>
    </div>` : ""}
  </article>`;
}

/* Rend des tickets et branche leurs boutons. `apres` est rappelé après une modification. */
function brancherTickets(conteneur, lignes, apres) {
  const parCle = new Map(lignes.map((l) => [`${l.bookmaker}|${l.reference}`, l]));
  $$(".ticket", conteneur).forEach((t) => {
    const l = parCle.get(`${t.dataset.bookmaker}|${t.dataset.reference}`);
    if (!l) return;
    const m = $("[data-modifier]", t);
    if (m) m.addEventListener("click", () => ouvrirModification(l, apres));
    const s = $("[data-supprimer-ticket]", t);
    if (s) s.addEventListener("click", () => supprimerPari(l, apres));
    // Toucher l'en-tête ou les sélections ouvre la modification (sans aller chercher le bouton).
    if (t.hasAttribute("data-ouvrable")) $$(".ticket-tete, .ticket-corps", t).forEach((zone) => zone.addEventListener("click", (e) => {
      if (e.target.closest("button, a, select, input")) return;
      ouvrirModification(l, apres);
    }));
    const p = $("[data-partager]", t);
    if (p) p.addEventListener("click", async () => {
      try {
        await api("/api/paris/partage", { methode: "POST", corps: { bookmaker: l.bookmaker, reference: l.reference, partage: !l.partage } });
        toast(l.partage ? "Pari retiré du suivi public" : "Pari ajouté au suivi public");
        etat.dejaAnime = false;
        apres();
      } catch (err) { toast(err.message, true); }
    });
  });
}

/* Supprimer un pari, après confirmation. Un pari importé ne revient pas : l'appli garde sa référence et l'ignore aux
   imports suivants (et sur l'autre appareil, avec la synchronisation). */
async function supprimerPari(l, apres) {
  if (!l) return;
  const quoi = `${l.resume || "ce pari"} (${libelleBookmaker(l.bookmaker)}, réf. ${l.reference})`;
  if (!confirm(`Supprimer ${quoi} ?${l.manuel ? "" : "\n\nIl ne reviendra pas, même si le site l'affiche encore."}`)) return;
  try {
    await api("/api/paris/supprimer", { methode: "POST", corps: { bookmaker: l.bookmaker, reference: l.reference } });
    toast("Pari supprimé");
    etat.dejaAnime = false;
    apres();
  } catch (err) { toast(err.message, true); }
}

function dialogue(contenu, classe = "") {
  const d = document.createElement("dialog");
  d.className = "dialogue " + classe;
  d.innerHTML = contenu;
  document.body.append(d);
  d.addEventListener("close", () => d.remove());
  d.addEventListener("click", (e) => { if (e.target === d) d.close(); }); // clic hors de la fenêtre
  d.showModal();
  return d;
}

/* Ajouter un pari à la main (l absent) ou corriger tout un pari : compte (et site, pour un pari saisi à la main),
   dates, type, sport, sélections, cote, mise, état, gains. */
const TYPES_PARI = [["simple", "Simple"], ["combine", "Combiné"], ["mycombi", "Combiné même match"], ["systeme", "Système"]];
const ETATS_SAISIE = [["en_cours", "En cours"], ["gagne", "Gagné"], ["perdu", "Perdu"], ["annule", "Remboursé"], ["cashout", "Cash-out"]];
const pourChampDate = (iso) => (iso ? String(iso).slice(0, 19) : "");
function maintenantPourChamp() {
  const d = new Date();
  d.setSeconds(0, 0);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function ouvrirModification(l, apres) { formulairePari(l, apres); }

function formulairePari(l, apres) {
  const nouveau = !l;
  const virgule = (x) => (x === null || x === undefined || x === "" ? "" : String(Math.round(x * 100) / 100).replace(".", ","));
  const nombre = (v) => Number(String(v).replace(",", ".").replace(/\s/g, ""));
  // Un pari importé reste chez son bookmaker (l'import le retrouverait) ; un pari saisi à la main va où l'on veut.
  const possibles = nouveau || l.manuel ? etat.app.comptes : etat.app.comptes.filter((c) => c.bookmaker === l.bookmaker);
  const options = etat.app.bookmakers.map((b) => {
    const cs = possibles.filter((c) => c.bookmaker === b.nom);
    return cs.length ? `<optgroup label="${esc(b.libelle)}">${cs.map((c) => `<option value="${c.id}" ${l && c.id === l.compte_id ? "selected" : ""}>${esc(c.nom)} (${esc(b.libelle)})</option>`).join("")}</optgroup>` : "";
  }).join("") + (nouveau || l.manuel ? `<option value="nouveau">＋ Nouveau compte (n'importe quel site)…</option>` : "");
  const sports = [...new Set([l ? l.sport : null, ...etat.app.sports].filter(Boolean))];
  const sportParDefaut = l ? l.sport : ((etat.app.familles || [])[0] || { sports: [sports[0]] }).sports[0] || sports[0];
  const selections = l ? (l.selections && l.selections.length ? l.selections : (l.type === "simple" ? [{ choix: l.resume }] : [])) : [{}];
  let type = l ? l.type : "simple";
  let choix = l ? (l.etat === "inconnu" ? "en_cours" : l.etat) : "gagne";
  const ligneSelection = (x = {}) => `<div class="sel-saisie" data-competition="${esc(x.competition || "")}" data-cote-cachee="${x.cote ?? ""}">
      <input class="saisie" name="sel-evenement" placeholder="Événement (course, match)" value="${esc(x.evenement || "")}" aria-label="Événement">
      <input class="saisie" name="sel-marche" placeholder="Marché (vainqueur, top 10…)" value="${esc(x.marche || "")}" aria-label="Marché">
      <input class="saisie" name="sel-choix" placeholder="Ton choix" value="${esc(x.choix || "")}" aria-label="Choix">
      <input class="saisie sel-cote" name="sel-cote" inputmode="decimal" placeholder="Cote" value="${virgule(x.cote)}" aria-label="Cote de la sélection">
      <button type="button" class="bouton fantome petit sel-retirer" aria-label="Retirer cette sélection">×</button>
    </div>`;
  const d = dialogue(`
    <form method="dialog" class="form-modif form-pari">
      <header><h2>${nouveau ? "Ajouter un pari" : "Modifier le pari"}</h2><button type="button" class="fermer" aria-label="Fermer" data-fermer>×</button></header>
      ${nouveau ? `<p class="discret petit" style="margin:-6px 0 14px">Pour un site que l'appli ne lit pas, ou un pari oublié. Un site manque ? Ajoute-le dans <a href="#/comptes" data-fermer>Comptes</a>.</p>`
        : `<p class="discret petit" style="margin:-6px 0 14px">${esc(libelleBookmaker(l.bookmaker))} · réf. ${esc(l.reference)}${l.manuel ? " · ajouté à la main" : ""}</p>`}
      <div class="grille-pari">
        <label class="champ large"><span>Compte${nouveau || l.manuel ? " (et site)" : ""}</span><select class="saisie" name="compte" autofocus>${options}</select></label>
        <div class="champ large" data-nouveau-compte hidden>
          <div class="grille-pari" style="margin:0">
            <label class="champ"><span>Site</span><input class="saisie" name="nc_site" list="liste-sites" placeholder="ex. Betclic, Parions Sport…" autocomplete="off"></label>
            <label class="champ"><span>Nom du compte</span><input class="saisie" name="nc_nom" placeholder="ex. Thomas" autocomplete="off"></label>
          </div>
          <datalist id="liste-sites">${etat.app.bookmakers.map((b) => `<option value="${esc(b.libelle)}">`).join("")}</datalist>
          <small class="discret">Un site que l'appli ne lit pas est créé ; un site qu'elle connaît (Betclic…) garde sa page.</small>
        </div>
        <label class="champ"><span>Date du pari</span><input class="saisie" type="datetime-local" step="1" name="date_pari" value="${l ? pourChampDate(l.date_pari) : maintenantPourChamp()}" required></label>
        <label class="champ"><span>Date de l'événement</span><input class="saisie" type="datetime-local" step="1" name="date_evenement" value="${l ? pourChampDate(l.date_evenement) : ""}"></label>
        <label class="champ"><span>Sport</span><select class="saisie" name="sport">${sports.map((x) => `<option ${x === sportParDefaut ? "selected" : ""}>${esc(x)}</option>`).join("")}</select></label>
        <label class="champ" data-nb><span>Nombre de sélections</span><input class="saisie" name="nb" inputmode="numeric" value="${l && l.type !== "simple" ? l.nb_selections : ""}"></label>
      </div>
      <div class="bloc-pari"><span class="etiquette-pari">Type de pari</span>
        <div class="segments etats-modif" role="radiogroup" aria-label="Type de pari">${TYPES_PARI.map(([v, t]) =>
          `<button type="button" data-type="${v}" aria-pressed="${type === v}">${t}</button>`).join("")}</div></div>
      <div class="bloc-pari"><span class="etiquette-pari" data-titre-sel>Le pari</span>
        <div class="selections-saisie">${selections.map(ligneSelection).join("")}</div>
        <div><button type="button" class="bouton secondaire petit" data-ajouter-sel>＋ Ajouter une sélection</button></div></div>
      <div class="bloc-pari"><span class="etiquette-pari">Résultat</span>
        <div class="segments etats-modif" role="radiogroup" aria-label="État">${ETATS_SAISIE.map(([v, t]) =>
          `<button type="button" data-etat="${v}" aria-pressed="${choix === v}">${t}</button>`).join("")}</div></div>
      <div class="champs-modif">
        <label class="champ"><span>Mise (<span data-devise-pari>€</span>)</span><input class="saisie" name="mise" inputmode="decimal" value="${l ? virgule(l.mise_devise ?? l.mise) : ""}" required></label>
        <label class="champ"><span>Cote</span><input class="saisie" name="cote" inputmode="decimal" value="${l ? virgule(l.cote) : ""}" placeholder="${l ? "inconnue" : "ex. 2,10"}"></label>
        <label class="champ" data-gains title="Ce que le bookmaker a versé, mise comprise (un freebet ne rend pas sa mise)"><span>Gains (<span data-devise-pari>€</span>)</span><input class="saisie" name="gains" inputmode="decimal" value="${l ? virgule(l.gains_devise ?? l.gains) : ""}"></label>
      </div>
      <div class="pile" style="gap:8px">
        <label class="case"><input type="checkbox" name="boost" ${l && l.cote_boostee ? "checked" : ""}> Cote boostée</label>
        <label class="case" title="La mise était offerte par le bookmaker : elle ne coûte rien si le pari perd, et les gains ne la rendent pas (18,75 € à 13 rapportent 225 €)."><input type="checkbox" name="freebet" ${l && l.freebet ? "checked" : ""}> Freebet (mise offerte : ne coûte rien si perdu)</label>
        <label class="case"><input type="checkbox" name="partage" ${l && l.partage ? "checked" : ""}> Bet partagé (suivi public)</label>
      </div>
      ${l && !l.manuel ? `<p class="note" style="margin-top:12px">Ce que tu corriges ici (dates, sélections, sport, cote boostée, freebet) n'est plus remplacé par les imports. Le résultat (état, mise, cote, gains) suit le bookmaker dès qu'un import montre le pari réglé.${l.modifie_main && l.valeurs_import ? ` Le bookmaker indiquait : ${esc(LIBELLES_ETATS_TICKET[l.valeurs_import.etat] || l.valeurs_import.etat)}, mise ${euros(l.valeurs_import.mise)}${l.valeurs_import.gains !== null ? `, gains ${euros(l.valeurs_import.gains)}` : ""}.` : ""}</p>` : ""}
      <div class="actions"><button class="bouton" type="submit">${nouveau ? "Ajouter le pari" : "Enregistrer"}</button><button class="bouton fantome" type="button" data-fermer>Annuler</button>
        ${l ? `<button class="bouton fantome danger" type="button" data-supprimer-pari style="margin-left:auto">Supprimer ce pari</button>` : ""}</div>
    </form>`);
  const f = $("form", d);
  const zoneSel = $(".selections-saisie", d);
  const majType = () => {
    $$("[data-type]", d).forEach((b) => b.setAttribute("aria-pressed", b.dataset.type === type));
    const simple = type === "simple";
    d.classList.toggle("pari-simple", simple);
    $("[data-nb]", d).hidden = simple;
    $("[data-ajouter-sel]", d).hidden = simple;
    $("[data-titre-sel]", d).textContent = simple ? "Le pari" : "Les sélections (facultatif : le nombre suffit)";
    if (simple && !$$(".sel-saisie", zoneSel).length) zoneSel.insertAdjacentHTML("beforeend", ligneSelection());
    $$(".sel-saisie", zoneSel).forEach((r, i) => { r.hidden = simple && i > 0; });
    brancherSelections();
  };
  const brancherSelections = () => $$(".sel-retirer", zoneSel).forEach((b) => { b.onclick = () => { b.closest(".sel-saisie").remove(); }; });
  const majGains = () => {
    $$("[data-etat]", d).forEach((b) => b.setAttribute("aria-pressed", b.dataset.etat === choix));
    const g = f.gains;
    $("[data-gains]", d).hidden = choix === "perdu" || choix === "en_cours";
    if (choix === "gagne" && !g.value && f.cote.value && f.mise.value) g.value = virgule(nombre(f.mise.value) * nombre(f.cote.value));
    if (choix === "annule" && !g.value) g.value = f.mise.value;
  };
  $$("[data-type]", d).forEach((b) => b.addEventListener("click", () => { type = b.dataset.type; majType(); }));
  $("[data-ajouter-sel]", d).addEventListener("click", () => { zoneSel.insertAdjacentHTML("beforeend", ligneSelection()); brancherSelections(); });
  $$("[data-etat]", d).forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.etat !== choix && (choix === "gagne" || b.dataset.etat === "annule")) f.gains.value = "";
    choix = b.dataset.etat;
    majGains();
  }));
  majType();
  majGains();
  const majCompte = () => {
    $("[data-nouveau-compte]", d).hidden = f.compte.value !== "nouveau";
    // Mise et gains dans la monnaie du compte (francs suisses…), comme sur le site.
    const c = etat.app.comptes.find((x) => String(x.id) === f.compte.value);
    $$("[data-devise-pari]", d).forEach((s) => { s.textContent = symboleDevise(c && c.devise); });
  };
  f.compte.addEventListener("change", () => { majCompte(); if (f.compte.value === "nouveau") f.nc_site.focus(); });
  if (!possibles.length) f.compte.value = "nouveau";  // aucun compte encore : on le crée ici
  majCompte();
  // Une date d'événement connue au jour près (Winamax, ps3838) reste un jour si on n'y touche pas.
  const evtInitial = f.date_evenement.value;
  $$("[data-fermer]", d).forEach((b) => b.addEventListener("click", () => d.close()));
  const supprimer = $("[data-supprimer-pari]", d);
  if (supprimer) supprimer.addEventListener("click", () => supprimerPari(l, () => { d.close(); apres(); }));
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const simple = type === "simple";
    const lignes = $$(".sel-saisie", zoneSel).filter((r) => !r.hidden);
    let compteId = Number(f.compte.value);
    if (f.compte.value === "nouveau") {
      if (!f.nc_site.value.trim() || !f.nc_nom.value.trim()) { toast("Indique le site et le nom du nouveau compte.", true); return; }
      try {
        const c = await api("/api/comptes", { methode: "POST", corps: { site: f.nc_site.value, nom: f.nc_nom.value } });
        await chargerEtat();
        compteId = c.id;
        // Créé : il devient le compte choisi (si l'enregistrement du pari échoue, on ne le recrée pas).
        f.compte.add(new Option(`${c.nom} (${libelleBookmaker(c.bookmaker)})`, c.id, true, true), 0);
        majCompte();
      } catch (err) { toast(err.message, true); return; }
    }
    const jourSeul = l && l.date_evenement && l.evenement_heure === false && f.date_evenement.value === evtInitial;
    const corps = {
      compte_id: compteId, date_pari: f.date_pari.value,
      date_evenement: jourSeul ? String(l.date_evenement).slice(0, 10) : f.date_evenement.value,
      type, sport: f.sport.value, nb_selections: simple ? 1 : f.nb.value,
      selections: lignes.map((r) => ({
        evenement: $("[name=sel-evenement]", r).value, marche: $("[name=sel-marche]", r).value, choix: $("[name=sel-choix]", r).value,
        competition: r.dataset.competition, cote: simple ? r.dataset.coteCachee : $("[name=sel-cote]", r).value,
      })),
      cote: f.cote.value, cote_boostee: f.boost.checked, freebet: f.freebet.checked, mise: f.mise.value, etat: choix,
      gains: choix === "perdu" || choix === "en_cours" ? "" : f.gains.value,
    };
    try {
      const r = nouveau
        ? await api("/api/paris/ajouter", { methode: "POST", corps })
        : await api("/api/paris/editer", { methode: "POST", corps: { ...corps, bookmaker: l.bookmaker, reference: l.reference } });
      if (f.partage.checked !== Boolean(l && l.partage)) {
        await api("/api/paris/partage", { methode: "POST", corps: { bookmaker: r.bookmaker, reference: r.reference, partage: f.partage.checked } });
      }
      d.close();
      toast(nouveau ? "Pari ajouté" : "Pari modifié");
      etat.dejaAnime = false;
      apres();
    } catch (err) { toast(err.message, true); }
  });
}

/* Tous les tickets d'un jour (clic sur le calendrier) */
async function ouvrirJour(jour, filtres = "") {
  const r = await api(`/api/paris?jour=${jour}&par_page=200${filtres ? "&" + filtres : ""}`);
  const regles = r.lignes.filter((l) => l.profit !== null);
  const d = dialogue(`
    <header><div><h2>${esc(new Date(jour + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }))}</h2>
      <p class="discret" style="margin:4px 0 0">${r.total} pari${r.total > 1 ? "s" : ""}, ${euros(r.mise)} misés${regles.length ? `, profit <b class="${classeSigne(r.profit)}">${euros(r.profit, { signe: true })}</b>` : ""}</p></div>
      <button type="button" class="fermer" aria-label="Fermer" data-fermer>×</button></header>
    <div class="grille-tickets">${r.lignes.map((l) => ticketHTML(l)).join("") || `<p class="discret">Aucun pari ce jour-là.</p>`}</div>`, "large");
  $("[data-fermer]", d).addEventListener("click", () => d.close());
  brancherTickets(d, r.lignes, () => { d.close(); ouvrirJour(jour, filtres); router(); });
}

/* ===================================================================== page d'un bookmaker */
async function pageBookmaker(main, nom) {
  await chargerEtat();
  const b = etat.app.bookmakers.find((x) => x.nom === nom);
  if (!b) throw new Error("Bookmaker inconnu.");
  const th = themeBk(nom);
  const comptes = etat.app.comptes.filter((c) => c.bookmaker === nom);
  const [t, r, argent] = await Promise.all([
    api(`/api/tableau?bookmakers=${encodeURIComponent(nom)}`),
    api(`/api/paris?bookmakers=${encodeURIComponent(nom)}&par_page=9`),
    api("/api/argent"),
  ]);
  const ids = new Set(comptes.map((c) => c.id));
  const mouv = argent.comptes.filter((c) => ids.has(c.id));
  const bilanArgent = mouv.length ? mouv.reduce((a, c) => ({ depose: a.depose + c.depose, retire: a.retire + c.retire, bilan: a.bilan + c.bilan }), { depose: 0, retire: 0, bilan: 0 }) : null;
  const style = `--bk:${th.fond};--bk-fonce:${th.fonce};--bk-accent:${th.accent}`;
  if (t.vide || !r.total) {
    main.innerHTML = `<div class="page-bk" style="${style}"><section class="heros-bk"><div class="heros-bk-titre">${logoBk(nom, "grand")}<h1>${esc(b.libelle)}</h1></div><p>Aucun pari enregistré sur ce bookmaker pour l'instant.</p></section></div>`;
    return;
  }
  const k = t.indicateurs;
  const dernier = r.lignes[0];
  const sports = [...t.par_sport].sort((a, c) => c.mise - a.mise).slice(0, 6);
  const maxMise = Math.max(...sports.map((x) => x.mise), 1);

  main.innerHTML = `<div class="page-bk" style="${style}">
    <section class="heros-bk">
      <div class="heros-bk-haut">
        <div class="heros-bk-titre">${logoBk(nom, "grand")}<div><h1>${esc(b.libelle)}</h1>
          <p>${comptes.map((c) => esc(c.nom)).join(", ")} · ${k.n} paris réglés${k.n_en_cours ? ` · <button type="button" class="lien-bouton" data-voir-en-cours>${k.n_en_cours} en cours (${euros(k.engage, { rond: true })})</button>` : ""}</p></div></div>
        ${bandeauDemo()}
      </div>
      <div class="heros-bk-chiffres">
        <div class="principal"><small>Profit</small><b>${euros(k.profit, { signe: true })}</b>${etat.app.bankroll ? `<span class="pct-heros">${k.profit > 0 ? "+" : ""}${miseEnPct(k.profit, { seul: true })} de bankroll</span>` : ""}</div>
        <div><small>ROI</small><b>${pct(k.roi)}</b></div>
        <div><small>Réussite</small><b>${pct(k.reussite, { signe: false })}</b></div>
        <div><small>Misé</small><b>${euros(k.mise, { rond: true })}</b></div>
        ${bilanArgent ? `<div><small>Bilan d'argent</small><b>${euros(bilanArgent.bilan, { signe: true, rond: true })}</b></div>` : ""}
      </div>
      <div class="heros-bk-courbe" id="courbe-bk"></div>
    </section>

    <div class="bk-grille">
      <section>
        <h2 class="titre-section">Dernier pari</h2>
        <div id="dernier-ticket">${ticketHTML(dernier)}</div>
      </section>
      <section>
        <h2 class="titre-section">Ses chiffres</h2>
        <div class="bk-stats">
          <div><small>Meilleur jour</small><b class="gain">${k.meilleur_jour ? euros(k.meilleur_jour.profit, { signe: true, rond: true }) : "—"}</b><span>${k.meilleur_jour ? dateFr(k.meilleur_jour.date) : ""}</span></div>
          <div><small>Plus gros gain</small><b class="gain">${k.meilleur_gain ? euros(k.meilleur_gain, { signe: true, rond: true }) : "—"}</b><span>sur un pari</span></div>
          <div><small>Meilleure série</small><b>${k.meilleure_serie ?? "—"}</b><span>gagnés d'affilée</span></div>
          <div><small>Jours gagnants</small><b>${k.jours_gagnants !== null ? pct(k.jours_gagnants, { signe: false }) : "—"}</b><span>${k.jours_joues ? `${k.jours_joues} jours joués` : ""}</span></div>
          <div><small>Mise moyenne</small><b>${euros(k.mise_moyenne)}</b><span>${etat.app.bankroll ? `${miseEnPct(k.mise_moyenne, { seul: true })} de bankroll` : "par pari réglé"}</span></div>
          <div><small>Cote moyenne</small><b>${k.cote_moyenne_gagnee ? fmtCote(k.cote_moyenne_gagnee) : "—"}</b><span>des paris gagnés</span></div>
          <div><small>Gain moyen</small><b class="gain">${k.gain_moyen !== null ? euros(k.gain_moyen, { signe: true }) : "—"}</b><span>par pari gagné</span></div>
          <div><small>Remboursés</small><b>${k.n_annules}</b><span>annulés ou remboursés</span></div>
        </div>
        ${bilanArgent ? `<p class="note" style="margin-top:12px">Argent : ${euros(bilanArgent.depose)} déposés, ${euros(bilanArgent.retire)} retirés (page <a href="#/soldes">Soldes</a>).</p>` : ""}
        <h3 class="titre-section" style="margin-top:18px">Ses sports</h3>
        <div class="bk-sports">${sports.map((x) => `<div class="bk-sport">
          <span>${sportEmoji(x.cle)} ${esc(x.cle)}</span>
          <div class="barre"><i style="width:${Math.round((x.mise / maxMise) * 100)}%"></i></div>
          <b class="${classeSigne(x.profit)}">${euros(x.profit, { signe: true, rond: true })}</b>
        </div>`).join("")}</div>
      </section>
    </div>

    ${r.lignes.length > 1 ? `<section style="margin-top:24px">
      <header class="entete-section"><h2 class="titre-section">Derniers tickets</h2><a href="#/paris" id="tous-bk" class="bouton secondaire petit">Voir ses ${r.total} paris</a></header>
      <div class="grille-tickets" id="derniers-tickets">${r.lignes.slice(1).map((l) => ticketHTML(l)).join("")}</div>
    </section>` : ""}
  </div>`;

  const recharger = () => pageBookmaker(main, nom).then(() => majBooks(nom));
  brancherTickets(main, r.lignes, recharger);
  const enCoursBk = $("[data-voir-en-cours]", main);
  if (enCoursBk) enCoursBk.addEventListener("click", () => voirEnCours(comptes.map((c) => c.id)));
  const tous = $("#tous-bk");
  if (tous) tous.addEventListener("click", () => { etat.paris.comptes = new Set(comptes.map((c) => c.id)); etat.paris.page = 1; });
  const el = $("#courbe-bk");
  if (el && t.courbe.total.length > 1) {
    const g = nouveauGraphe(el);
    g.setOption({
      animation: !mouvementReduit, grid: { left: 0, right: 0, top: 6, bottom: 0 },
      xAxis: { type: "time", show: false }, yAxis: { type: "value", show: false, scale: true },
      tooltip: { trigger: "axis", backgroundColor: "#0B1020", borderWidth: 0, textStyle: { color: "#fff", fontFamily: "Manrope" },
        formatter: (ps) => `${dateFr(ps[0].value[0])}<br><b>${euros(ps[0].value[1], { signe: true })}</b>` },
      series: [{ type: "line", data: t.courbe.total, smooth: 0.3, showSymbol: false, lineStyle: { width: 3, color: "#fff" },
        itemStyle: { color: "#fff" },
        areaStyle: { origin: "start", color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: "rgba(255,255,255,.35)" }, { offset: 1, color: "rgba(255,255,255,0)" }]) } }],
    });
  }
}

/* ===================================================================== soldes : solde, dépôts et retraits */
const LIBELLES_SENS = { depot: "Dépôt", retrait: "Retrait" };
const dateHeure = (iso) => new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(" ", " ");
const PLURIELS_SENS = { depot: "dépôts", retrait: "retraits", page: "mouvements" };

async function pageArgent(main) {
  await chargerEtat();
  const ar = (etat.argentSaisie ||= { compte_id: null, sens: null, texte: "", apercu: null });
  if (ar.compte_id && !compteParId(ar.compte_id)) ar.compte_id = null;
  if (!ar.compte_id && etat.app.comptes.length) ar.compte_id = etat.app.comptes[0].id;
  const a = await api("/api/argent");
  const t = a.total;
  const nb = (sens) => a.comptes.reduce((n, c) => n + c[sens === "depot" ? "n_depots" : "n_retraits"], 0);
  const signe = (x) => (x > 0 ? "gain" : x < 0 ? "perte" : "");
  const libelleBk = (nom) => (etat.app.bookmakers.find((b) => b.nom === nom) || { libelle: nom }).libelle;
  const distant = etat.app.distant;
  // Un groupe par bookmaker, replié par défaut ; ceux que tu ouvres le restent quand la page se redessine.
  const ouverts = (etat.soldesOuverts ||= new Set());
  const groupes = etat.app.bookmakers.map((b) => ({ nom: b.nom, libelle: b.libelle, comptes: a.comptes.filter((c) => c.bookmaker === b.nom) }))
    .filter((g) => g.comptes.length);

  main.innerHTML = `
    <div class="entete"><div><h1>Soldes</h1><p>Ce qu'il y a sur chaque compte, et ce que tu y as déposé et retiré : ce que les paris t'ont vraiment rapporté ou coûté.</p></div>${bandeauDemo()}</div>
    ${guideBookmakers("mvts")}
    <div class="chiffres chiffres-argent">
      <div class="chiffre large"><small>Bilan d'argent</small><b class="${signe(t.bilan)}">${euros(t.bilan, { signe: true })}</b><span>retiré + encore sur les comptes − déposé</span></div>
      <div class="chiffre"><small>Déposé</small><b>${euros(t.depose)}</b><span>${nb("depot")} dépôt${nb("depot") > 1 ? "s" : ""}</span></div>
      <div class="chiffre"><small>Retiré</small><b>${euros(t.retire)}</b><span>${nb("retrait")} retrait${nb("retrait") > 1 ? "s" : ""}</span></div>
      <div class="chiffre"><small>Sur les comptes</small><b>${euros(t.solde)}</b><span>soldes relevés</span></div>
    </div>
    <div class="etapes">
      <section class="panneau">
        <div class="etape-titre"><span class="num">1</span><h2>Choisis le compte</h2></div>
        ${etat.app.comptes.length ? `<select class="saisie" id="ar-compte" aria-label="Compte">
          ${etat.app.bookmakers.map((b) => {
            const comptes = etat.app.comptes.filter((c) => c.bookmaker === b.nom);
            return comptes.length ? `<optgroup label="${esc(b.libelle)}">${comptes.map((c) =>
              `<option value="${c.id}" ${c.id === ar.compte_id ? "selected" : ""}>${esc(b.libelle)} – ${esc(c.nom)}</option>`).join("")}</optgroup>` : "";
          }).join("")}
        </select>
        <p class="consigne">Un ancien compte sans paris importés ? Crée-le d'abord dans <a href="#/comptes">Comptes</a>.</p>`
        : `<div class="alerte-boite">Crée d'abord le compte dans <a href="#/comptes">Comptes</a> (par exemple « Betclic – Ancien »).</div>`}
        <div class="etape-titre" style="margin-top:22px"><span class="num">2</span><h2>Colle la page</h2></div>
        <div class="zone-collage">
          <textarea id="ar-texte" spellcheck="false" aria-label="Texte de la page des dépôts ou des retraits">${esc(ar.texte)}</textarea>
          <div class="invite" id="ar-invite" ${ar.texte ? "hidden" : ""}><div><b>Colle ici</b>La page de tes dépôts, ou celle de tes retraits : ${etat.app.mobile ? "copiée avec l'extension (Copier le texte de la page), puis touche longuement ici et <b>Coller</b>."
            : "<kbd>Ctrl</kbd> + <kbd>A</kbd>, <kbd>Ctrl</kbd> + <kbd>C</kbd>, puis <kbd>Ctrl</kbd> + <kbd>V</kbd> ici."}</div></div>
        </div>
        <p class="consigne">Une page à la fois : d'abord les dépôts, puis les retraits. Seuls les mouvements validés comptent ; recoller une page ne crée pas de doublon.</p>
        <div id="ar-apercu"></div>
      </section>
      <div class="pile">
        ${(a.soldes_en_attente || []).map((s) => {
          const comptes = etat.app.comptes.filter((c) => c.bookmaker === s.bookmaker);
          return `<section class="panneau solde-attente" data-bk="${esc(s.bookmaker)}">
            <p>${logoBk(s.bookmaker, "mini")} L'extension a lu un solde <b>${esc(libelleBk(s.bookmaker))}</b> de <b>${euros(s.solde)}</b>
              <span class="discret">(le ${esc(fmtDateHeure.format(new Date(s.quand)))})</span>, mais tu as plusieurs comptes ${esc(libelleBk(s.bookmaker))} et le site n'affiche pas lequel est connecté. À qui est-il ?</p>
            <div class="actions">
              <select class="saisie" aria-label="Compte">${comptes.map((c) => `<option value="${c.id}">${esc(c.nom)}</option>`).join("")}</select>
              <button type="button" class="bouton" data-attribuer>Enregistrer</button>
              <button type="button" class="bouton fantome" data-oublier>Ignorer</button>
            </div>
            <p class="note">Pour que ce soit automatique : choisis le compte ${esc(libelleBk(s.bookmaker))} dans l'icône de l'extension (à changer quand tu te connectes à un autre compte).</p>
          </section>`;
        }).join("")}
        ${a.comptes.length ? `<div class="entete-section"><h2>Tes bookmakers</h2>
          <button type="button" class="bouton secondaire petit" id="tout-deplier">${groupes.every((g) => ouverts.has(g.nom)) ? "Tout replier" : "Tout déplier"}</button></div>
          ${groupes.map((g) => groupeArgent(g, a.mouvements, distant, ouverts.has(g.nom))).join("")}`
          : `<section class="panneau vide"><strong>Aucun compte pour l'instant</strong><p>Crée tes comptes dans <a href="#/comptes">Comptes</a> : leur solde, leurs dépôts et leurs retraits apparaîtront ici.</p></section>`}
      </div>
    </div>`;

  brancherGuide(main);
  const zone = $("#ar-texte");
  const choix = $("#ar-compte");
  if (choix) choix.addEventListener("change", () => { ar.compte_id = Number(choix.value); analyserMouvements(main); });
  zone.addEventListener("input", () => {
    ar.texte = zone.value;
    ar.sens = null; // nouvelle page : on laisse l'appli deviner
    $("#ar-invite").hidden = Boolean(zone.value);
    clearTimeout(ar.minuteur);
    ar.minuteur = setTimeout(() => analyserMouvements(main), 350);
  });
  if (ar.texte) analyserMouvements(main);

  $$(".solde-attente", main).forEach((bloc) => {
    const bookmaker = bloc.dataset.bk;
    $("[data-attribuer]", bloc).addEventListener("click", async () => {
      try {
        const r = await api("/api/soldes/attribuer", { methode: "POST", corps: { bookmaker, compte_id: Number($("select", bloc).value) } });
        toast(`Solde de ${euros(r.solde)} enregistré`);
        pageArgent(main);
      } catch (err) { toast(err.message, true); }
    });
    $("[data-oublier]", bloc).addEventListener("click", async () => {
      try { await api("/api/soldes/oublier", { methode: "POST", corps: { bookmaker } }); pageArgent(main); }
      catch (err) { toast(err.message, true); }
    });
  });
  $$(".groupe-argent", main).forEach((d) => d.addEventListener("toggle", () => {
    if (d.open) ouverts.add(d.dataset.bk); else ouverts.delete(d.dataset.bk);
    const bouton = $("#tout-deplier", main);
    if (bouton) bouton.textContent = groupes.every((g) => ouverts.has(g.nom)) ? "Tout replier" : "Tout déplier";
  }));
  const toutDeplier = $("#tout-deplier", main);
  if (toutDeplier) toutDeplier.addEventListener("click", () => {
    const ouvrir = !groupes.every((g) => ouverts.has(g.nom));
    $$(".groupe-argent", main).forEach((d) => { d.open = ouvrir; });
  });
  $$(".carte-argent", main).forEach((carte) => {
    const id = Number(carte.dataset.id);
    const solde = $("[data-solde]", carte);
    solde.addEventListener("change", async () => {
      try { await api(`/api/comptes/${id}`, { methode: "PATCH", corps: { solde: solde.value } }); toast("Solde enregistré"); pageArgent(main); }
      catch (err) { toast(err.message, true); }
    });
    solde.addEventListener("keydown", (e) => { if (e.key === "Enter") solde.blur(); });
    const ajout = $("[data-ajout-mouvement]", carte);
    if (ajout) ajout.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        await api("/api/mouvements/ajouter", { methode: "POST", corps: { compte_id: id, sens: ajout.sens.value, date: ajout.date.value, montant: ajout.montant.value } });
        toast(ajout.sens.value === "depot" ? "Dépôt ajouté" : "Retrait ajouté");
        pageArgent(main);
      } catch (err) { toast(err.message, true); }
    });
    $$("[data-suppr-mouvement]", carte).forEach((b) => b.addEventListener("click", async () => {
      if (!confirm("Supprimer ce mouvement ?")) return;
      try {
        await api("/api/mouvements/supprimer", { methode: "POST", corps: { compte_id: id, ...JSON.parse(b.dataset.supprMouvement) } });
        toast("Mouvement supprimé");
        pageArgent(main);
      } catch (err) { toast(err.message, true); }
    }));
    $$("[data-effacer]", carte).forEach((b) => b.addEventListener("click", async () => {
      const sens = b.dataset.effacer;
      if (!confirm(`Effacer tous les ${PLURIELS_SENS[sens]} de ce compte ? (Une copie de la base est d'abord rangée dans « sauvegardes ».)`)) return;
      try {
        const r = await api("/api/mouvements/effacer", { methode: "POST", corps: { compte_id: id, sens } });
        toast(`${r.effaces} ${PLURIELS_SENS[sens]} effacé${r.effaces > 1 ? "s" : ""}`);
        pageArgent(main);
      } catch (err) { toast(err.message, true); }
    }));
  });
}

/* Un bookmaker, replié : son solde et son bilan d'un coup d'œil ; déplié : la carte de chacun de ses comptes. */
function groupeArgent(g, mouvements, distant, ouvert) {
  const somme = (k) => g.comptes.reduce((s, c) => s + (c[k] || 0), 0);
  const releves = g.comptes.filter((c) => c.solde !== null);
  const bilan = somme("bilan");
  const n = g.comptes.length;
  return `<details class="panneau groupe-argent" data-bk="${esc(g.nom)}" style="--bk:${themeBk(g.nom).fond}" ${ouvert ? "open" : ""}>
    <summary>
      <span class="titre-bk">${logoBk(g.nom, "grand")} ${esc(g.libelle)}</span>
      <span class="discret petit">${n} compte${n > 1 ? "s" : ""}</span>
      <span class="resume-argent">
        <span><small>Solde</small><b>${releves.length ? euros(somme("solde")) : "—"}</b></span>
        <span><small>Bilan</small><b class="${bilan > 0 ? "gain" : bilan < 0 ? "perte" : ""}">${euros(bilan, { signe: true })}</b></span>
      </span>
      <span class="chevron" aria-hidden="true"></span>
    </summary>
    <div class="pile">${g.comptes.map((c) => carteArgent(c, mouvements.filter((m) => m.compte_id === c.id), g.libelle, distant)).join("")}</div>
  </details>`;
}

function carteArgent(c, mouvements, libelleBk, distant) {
  const periode = c.premier ? `${dateFr(c.premier)} → ${dateFr(c.dernier)}` : "";
  const ecart = c.n_paris_regles ? `<p class="note">Paris enregistrés sur ce compte : <b class="${c.profit_paris >= 0 ? "gain" : "perte"}">${euros(c.profit_paris, { signe: true })}</b> sur ${c.n_paris_regles} pari${c.n_paris_regles > 1 ? "s" : ""} réglé${c.n_paris_regles > 1 ? "s" : ""}. Un écart avec le bilan d'argent vient des paris non importés, des bonus ou d'un solde non indiqué.</p>` : "";
  return `<section class="panneau carte-argent" data-id="${c.id}">
    <header><h2 class="titre-bk">${logoBk(c.bookmaker, "grand")} ${esc(libelleBk)} – ${esc(c.nom)}</h2>${periode ? `<span class="discret petit">${periode}</span>` : ""}</header>
    <div class="mini-chiffres">
      <div><small>Déposé</small><b>${euros(c.depose)}</b><span>${c.n_depots} dépôt${c.n_depots > 1 ? "s" : ""}</span></div>
      <div><small>Retiré</small><b>${euros(c.retire)}</b><span>${c.n_retraits} retrait${c.n_retraits > 1 ? "s" : ""}</span></div>
      <div><small>Bilan</small><b class="${c.bilan > 0 ? "gain" : c.bilan < 0 ? "perte" : ""}">${euros(c.bilan, { signe: true })}</b><span>${c.solde ? `dont ${euros(c.solde)} encore sur le compte` : "retiré − déposé"}</span></div>
    </div>
    <label class="champ-solde">Solde actuel <input class="saisie" data-solde inputmode="decimal" value="${c.solde_devise === null || c.solde_devise === undefined ? "" : c.solde_devise.toFixed(2).replace(".", ",")}" placeholder="non relevé" aria-label="Solde actuel du compte ${esc(c.nom)}"> ${esc(symboleDevise(c.devise))}${c.devise && c.devise !== "EUR" && c.solde !== null ? ` <span class="discret petit">(${euros(c.solde)})</span>` : ""}${c.solde_le ? `<span class="discret petit">relevé le ${esc(fmtDateHeure.format(new Date(c.solde_le)))}</span>` : c.solde === null ? `<span class="discret petit">pas encore relevé : ouvre le site connecté, ou tape-le ici</span>` : ""}</label>
    ${ecart}
    ${mouvements.length ? `<details class="liste-mouvements"><summary>Voir les ${mouvements.length} mouvements</summary>
      <div class="table-defile"><table><thead><tr><th>Date</th><th>Type</th><th>Moyen</th><th class="nombre">Montant</th>${distant ? "" : `<th><span class="visuellement-cache">Supprimer</span></th>`}</tr></thead><tbody>
      ${mouvements.map((m) => `<tr><td>${esc(dateHeure(m.date))}</td>
        <td><span class="badge ${m.sens === "retrait" ? "nouveau" : "connu"}">${LIBELLES_SENS[m.sens]}</span></td>
        <td class="discret">${esc(m.moyen || "")}</td>
        <td class="nombre ${m.sens === "retrait" ? "gain" : ""}">${m.sens === "retrait" ? "+" : "−"}${euros(m.montant_eur ?? m.montant)}${m.devise && m.devise !== "EUR" ? `<br><span class="discret petit">${esc(new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(m.montant))} ${esc(m.devise)}</span>` : ""}</td>
        ${distant ? "" : `<td><button type="button" class="bouton fantome petit" data-suppr-mouvement='${esc(JSON.stringify({ sens: m.sens, date: m.date, montant: m.montant, rang: m.rang }))}' aria-label="Supprimer ce mouvement" title="Supprimer ce mouvement">×</button></td>`}</tr>`).join("")}
      </tbody></table></div></details>` : ""}
    ${distant ? "" : `<details class="ajout-mouvement"><summary>＋ Ajouter un dépôt ou un retrait à la main</summary>
      <form class="form-mouvement" data-ajout-mouvement>
        <select class="saisie" name="sens" aria-label="Dépôt ou retrait"><option value="depot">Dépôt</option><option value="retrait">Retrait</option></select>
        <input class="saisie" type="datetime-local" name="date" value="${maintenantPourChamp()}" aria-label="Date" required>
        <input class="saisie" name="montant" inputmode="decimal" placeholder="Montant (${esc(symboleDevise(c.devise))})" aria-label="Montant" required>
        <button class="bouton secondaire" type="submit">Ajouter</button>
      </form></details>`}
    ${distant ? "" : `<div class="actions">
      ${c.n_depots ? `<button class="bouton fantome" data-effacer="depot">Effacer les dépôts</button>` : ""}
      ${c.n_retraits ? `<button class="bouton fantome" data-effacer="retrait">Effacer les retraits</button>` : ""}
    </div>`}
  </section>`;
}

async function analyserMouvements(main) {
  const ar = etat.argentSaisie;
  const el = $("#ar-apercu", main);
  if (!el) return;
  if (!ar.texte.trim()) { ar.apercu = null; el.innerHTML = ""; return; }
  try {
    ar.apercu = await api("/api/mouvements/analyser", { methode: "POST", corps: { texte: ar.texte, compte_id: ar.compte_id, sens: ar.sens } });
  } catch (err) {
    el.innerHTML = `<div class="alerte-boite erreur" style="margin-top:14px">${esc(err.message)}</div>`;
    return;
  }
  const r = ar.apercu;
  const compte = compteParId(ar.compte_id);
  const valides = r.nouveaux + r.deja_connus;
  const pluriel = PLURIELS_SENS[r.sens];
  el.innerHTML = `
    <div class="etape-titre" style="margin-top:22px"><span class="num">3</span><h2>Vérifie et enregistre</h2></div>
    ${r.sens === "page" ? `<p class="petit" style="margin:0">Dépôts et retraits indiqués sur la page : ${euros(r.totaux.depot)} déposés, ${euros(r.totaux.retrait)} retirés.</p>` : `<div class="ligne-sens">
      <span class="petit">Ce sont des</span>
      <div class="segments" role="group" aria-label="Dépôts ou retraits">
        <button type="button" data-sens="depot" aria-pressed="${r.sens === "depot"}">Dépôts</button>
        <button type="button" data-sens="retrait" aria-pressed="${r.sens === "retrait"}">Retraits</button>
      </div>
      ${r.sens === r.sens_devine && !ar.sens ? `<span class="discret petit">deviné d'après la page${r.sens === "depot" ? " (moyens de paiement affichés)" : ""}</span>` : ""}
    </div>`}
    <p style="margin:12px 0 0"><b>${valides} ${pluriel} validés</b>, ${euros(r.total_valide)} au total :
      <span class="badge nouveau">${r.nouveaux} nouveau${r.nouveaux > 1 ? "x" : ""}</span>
      <span class="badge connu">${r.deja_connus} déjà connu${r.deja_connus > 1 ? "s" : ""}</span>
      ${r.ignores ? `<span class="badge alerte">${r.ignores} ignoré${r.ignores > 1 ? "s" : ""} (refusés…)</span>` : ""}</p>
    ${r.avertissements.map((w) => `<div class="alerte-boite" style="margin-top:8px">${esc(w)}</div>`).join("")}
    <div class="table-defile apercu-mouvements"><table><thead><tr><th>Date</th>${r.sens === "page" ? "<th>Type</th>" : ""}<th class="nombre">Montant</th><th>Statut</th></tr></thead><tbody>
      ${r.lignes.map((l) => `<tr><td>${esc(dateHeure(l.date))}</td>
        ${r.sens === "page" ? `<td>${LIBELLES_SENS[l.sens]}</td>` : ""}<td class="nombre">${euros(l.montant)}</td>
        <td><span class="badge ${{ "nouveau": "nouveau", "déjà connu": "connu", "ignoré": "alerte" }[l.statut]}">${l.statut === "ignoré" ? esc(l.statut_site) : esc(l.statut)}</span></td></tr>`).join("")}
    </tbody></table></div>
    <div class="actions">
      <button class="bouton" id="ar-enregistrer" ${r.nouveaux && compte ? "" : "disabled"}>Enregistrer ${r.nouveaux} ${pluriel}${compte ? ` sur ${esc(compte.nom)}` : ""}</button>
      <button class="bouton fantome" id="ar-vider">Vider</button>
    </div>`;
  $$("[data-sens]", el).forEach((b) => b.addEventListener("click", () => { ar.sens = b.dataset.sens; analyserMouvements(main); }));
  $("#ar-vider", el).addEventListener("click", () => { ar.texte = ""; ar.sens = null; ar.apercu = null; pageArgent(main); });
  $("#ar-enregistrer", el).addEventListener("click", async () => {
    try {
      const res = await api("/api/mouvements", { methode: "POST", corps: { texte: ar.texte, compte_id: ar.compte_id, sens: r.sens } });
      toast(`${res.nouveaux} ${PLURIELS_SENS[res.sens]} enregistrés sur ${compte.nom}`);
      ar.texte = ""; ar.sens = null; ar.apercu = null;
      pageArgent(main);
    } catch (err) { toast(err.message, true); }
  });
}

/* ===================================================================== mise à jour */
async function chercherMiseAJour(bouton, zone) {
  bouton.disabled = true;
  bouton.textContent = "Recherche…";
  let info;
  try { info = await api("/api/mise-a-jour"); }
  catch (err) { zone.innerHTML = `<div class="alerte-boite erreur" style="margin-top:12px">${esc(err.message)}</div>`; bouton.disabled = false; bouton.textContent = "Réessayer"; return; }
  if (!info.disponible) {
    bouton.hidden = true;
    zone.innerHTML = `<p class="statut-extension ok" style="margin-top:4px">Tu as la dernière version (${esc(info.actuelle)}).</p>`;
    return;
  }
  bouton.hidden = true;
  zone.innerHTML = `
    <div class="nouvelle-version">
      <p style="margin:0 0 6px"><b>Version ${esc(info.version)} disponible</b> <span class="discret">(tu as la ${esc(info.actuelle)})</span></p>
      ${info.notes ? `<div class="notes-version">${esc(info.notes)}</div>` : ""}
      <div class="actions"><button type="button" class="bouton" id="installer-maj">Installer la mise à jour</button>
        ${info.page ? `<a class="bouton fantome" href="${esc(info.page)}" target="_blank" rel="noopener">Voir sur GitHub</a>` : ""}</div>
    </div>`;
  $("#installer-maj", zone).addEventListener("click", async (e) => {
    const b = e.currentTarget;
    b.disabled = true;
    b.textContent = "Installation…";
    try {
      const r = await api("/api/mise-a-jour", { methode: "POST" });
      zone.innerHTML = `<p class="statut-extension ok" style="margin-top:4px">Version ${esc(r.version)} installée. Suivi Paris redémarre…</p>
        <p class="note">L'extension Chrome se met à jour d'elle-même, à son prochain envoi (au plus tard dans la demi-heure).</p>`;
      await api("/api/redemarrer", { methode: "POST" });
      setTimeout(() => { document.body.innerHTML = `<div class="vide" style="min-height:100vh"><strong>Suivi Paris redémarre</strong><p>La nouvelle version s'ouvre dans une nouvelle fenêtre ; tu peux fermer celle-ci.</p></div>`; }, 1500);
    } catch (err) {
      b.disabled = false;
      b.textContent = "Réessayer";
      zone.insertAdjacentHTML("beforeend", `<div class="alerte-boite erreur" style="margin-top:12px">${esc(err.message)}</div>`);
    }
  });
}

/* ===================================================================== données */
/* La synchronisation avec l'autre appareil (suivi_paris/synchro.py, mobile/mobile.js) : sur l'ordinateur, un jeton
   GitHub l'active et donne le code de liaison ; sur l'iPhone, ce code la branche. */
const quandSynchro = (iso) => (iso ? fmtDateHeure.format(new Date(iso)) : "jamais");
/* Sur l'ordinateur : comment avoir l'appli sur le téléphone. `relie` : la synchronisation est déjà active. */
function explicationTelephone(relie = false) {
  const adresse = etat.app.adresse_iphone;
  return `<details class="explication-telephone" ${relie ? "" : "open"}><summary>L'appli sur ton téléphone</summary>
    <ol class="etapes-favori">
      ${relie ? "" : "<li>Relie l'ordinateur à GitHub, ci-dessous : c'est par là que les paris passent d'un appareil à l'autre.</li>"}
      <li>Sur l'iPhone, ouvre <a href="${esc(adresse)}" target="_blank" rel="noopener">${esc(adresse.replace("https://", ""))}</a> dans <b>Safari</b>, puis <b>Partager → Sur l'écran d'accueil</b>. Ouvre l'appli depuis cette icône : elle tourne dans le téléphone, tes paris y restent.</li>
      <li>Dans l'appli : <b>Mes données → Avec l'ordinateur</b>, colle le code de liaison. Elle récupère alors tous tes paris, et tout ce que tu fais d'un côté arrive de l'autre.</li>
      <li>Pour lire tes paris depuis le téléphone : le navigateur <b>Orion</b> (App Store) avec l'extension Suivi Paris, liée avec le même code.</li>
    </ol>
    <p class="note" style="margin:8px 0 0"><b>Android</b> : l'appli s'ouvre aussi dans Chrome (menu ⋮ → <b>Ajouter à l'écran d'accueil</b>), sans avoir été essayée. L'extension, elle, n'a pas d'équivalent simple : Orion n'existe que sur iPhone ; sur Android, colle les pages dans <b>Importer</b>.</p>
  </details>`;
}
function blocSynchro(sy) {
  const autre = etat.app.mobile ? "l'ordinateur" : "l'iPhone";
  const statut = sy.actif ? `<p class="statut-synchro ${sy.erreur ? "ko" : "ok"}">${sy.erreur ? `⚠ ${esc(sy.erreur)}`
    : `● Synchronisée · envoyée le ${esc(quandSynchro(sy.envoye_le))} · reçue de ${autre} le ${esc(quandSynchro(sy.recu_le))}`}</p>` : "";
  let corps;
  if (!sy.possible) corps = `<p class="note">${etat.app.mobile ? "Ce téléphone ne permet pas le chiffrement (iOS 16.4 ou plus récent)." : "Il manque le module de chiffrement : relance l'appli (il s'installe tout seul)."}</p>`;
  else if (etat.app.mobile && !sy.actif) corps = `<ol class="etapes-favori" style="margin:0 0 12px">
      <li>Sur l'ordinateur : <b>Mes données → Avec l'iPhone</b>, active la synchronisation (jeton GitHub).</li>
      <li>Copie le <b>code de liaison</b> et fais-le passer sur ce téléphone (AirDrop, Notes, un message à toi-même).</li>
      <li>Colle-le ici, puis <b>Lier</b>. Le même code se colle aussi dans l'extension (Orion).</li></ol>
    <form class="actions" id="form-synchro"><input class="saisie" name="code" placeholder="SP1-…" autocomplete="off" aria-label="Code de liaison" style="flex:1;min-width:0">
      <button class="bouton" type="submit">Lier</button></form>`;
  else if (!sy.actif) corps = `${explicationTelephone()}
    <h3 class="sous-titre-synchro">1. Relier par GitHub</h3>
    <p class="discret" style="margin:0 0 10px">GitHub sert de relais : tes paris y passent dans un <b>gist secret</b> (un fichier privé de ton compte), <b>chiffrés</b> ; GitHub ne voit qu'un fichier illisible et la clé n'est que sur tes appareils. Gratuit.</p>
    <ol class="etapes-favori" style="margin-bottom:12px">
      <li>Pas de compte GitHub ? <a href="https://github.com/signup" target="_blank" rel="noopener">Crée-le</a> (gratuit, une adresse e-mail suffit).</li>
      <li><a href="https://github.com/settings/tokens/new?scopes=gist&amp;description=Suivi%20Paris" target="_blank" rel="noopener">Crée un jeton</a> (« Personal access token, classic ») : coche seulement <b>gist</b>, expiration <b>No expiration</b>, puis <b>Generate token</b>.</li>
      <li>Copie le jeton (il commence par <code>ghp_</code>), colle-le ici et active :</li></ol>
    <form class="actions" id="form-synchro"><input class="saisie" name="jeton" placeholder="ghp_…" autocomplete="off" aria-label="Jeton GitHub" style="flex:1;min-width:0">
      <button class="bouton" type="submit">Activer</button></form>`;
  else corps = `${!etat.app.mobile && sy.code ? `${explicationTelephone(true)}<div class="liaison"><div>
      <p class="discret" style="margin:0 0 8px">Le <b>code de liaison</b> relie un appareil à ta synchronisation : fais-le passer sur le téléphone (AirDrop, Notes, un message à toi-même), puis colle-le dans l'appli (<b>Mes données → Avec l'ordinateur</b>) et dans l'extension Orion (<b>Sans l'appli → Lier</b>). Il donne accès à tes paris : ne le partage avec personne.</p>
      <div class="actions" style="margin:0"><button type="button" class="bouton" data-copier-code>Copier le code de liaison</button></div></div></div>` : ""}
    <div class="actions"><button type="button" class="bouton secondaire" data-synchro-maintenant>Synchroniser maintenant</button>
      <button type="button" class="bouton fantome danger" data-synchro-couper>${etat.app.mobile ? "Délier" : "Désactiver"}</button></div>`;
  return `<section class="panneau" id="synchro">
    <h2 style="margin-bottom:8px">Avec ${etat.app.mobile ? "l'ordinateur" : "l'iPhone"}</h2>${statut}${corps}</section>`;
}
function brancherSynchro(main, sy, recharger) {
  const form = $("#form-synchro", main);
  if (form) form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const b = $("button", form);
    b.disabled = true;
    try {
      await api("/api/synchro", { methode: "POST", corps: etat.app.mobile ? { code: form.code.value } : { jeton: form.jeton.value } });
      toast(etat.app.mobile ? "iPhone lié à l'ordinateur" : "Synchronisation activée : copie le code de liaison sur l'iPhone");
      recharger();
    } catch (err) { toast(err.message, true); b.disabled = false; }
  });
  const copier = $("[data-copier-code]", main);
  if (copier) copier.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(sy.code); toast("Code de liaison copié"); } catch { toast("Copie impossible", true); }
  });
  const maintenant = $("[data-synchro-maintenant]", main);
  if (maintenant) maintenant.addEventListener("click", async () => {
    maintenant.disabled = true;
    try { await api("/api/synchro/maintenant", { methode: "POST", corps: {} }); toast("Synchronisation lancée"); setTimeout(recharger, 2500); }
    catch (err) { toast(err.message, true); maintenant.disabled = false; }
  });
  const couper = $("[data-synchro-couper]", main);
  if (couper) couper.addEventListener("click", async () => {
    try { await api("/api/synchro/desactiver", { methode: "POST", corps: {} }); toast("Synchronisation coupée"); recharger(); }
    catch (err) { toast(err.message, true); }
  });
}
// L'iPhone a reçu des paris de l'ordinateur : la page affichée se met à jour.
window.addEventListener("suivi-paris-synchro", (e) => {
  const b = e.detail || {};
  toast(b.boite ? `Lu par l'extension : ${b.boite} page${b.boite > 1 ? "s" : ""} enregistrée${b.boite > 1 ? "s" : ""}, ${b.paris_nouveaux || 0} nouveau${b.paris_nouveaux > 1 ? "x" : ""} pari${b.paris_nouveaux > 1 ? "s" : ""}.`
    : `Reçu de l'ordinateur : ${b.paris_nouveaux || 0} nouveau${b.paris_nouveaux > 1 ? "x" : ""} pari${b.paris_nouveaux > 1 ? "s" : ""}, ${b.paris_mis_a_jour || 0} mis à jour.`);
  if (!document.querySelector("dialog[open]")) { etat.dejaAnime = false; router(); }
});

async function pageDonnees(main) {
  await chargerEtat();
  const imports = await api("/api/imports");
  const sy = etat.app.distant || etat.app.demo ? null : await api("/api/synchro").catch(() => null);
  main.innerHTML = `
    <div class="entete"><div><h1>Mes données</h1><p>${etat.app.mobile
      ? `Tout reste dans ce téléphone : l'appli ne se connecte à aucun bookmaker${sy && sy.actif ? " ; seule la synchronisation avec l'ordinateur passe par Internet, chiffrée" : " et n'envoie rien sur Internet"}.`
      : `Tout reste sur cet ordinateur : l'appli ne se connecte à aucun bookmaker et n'envoie rien sur Internet${sy && sy.actif ? ", sauf la synchronisation chiffrée avec l'iPhone" : ""} (elle contacte aussi GitHub quand tu cherches une mise à jour).`}</p></div>${bandeauDemo()}</div>
    <div class="pile">
      <section class="panneau">
        <h2 style="margin-bottom:8px">Ta base de paris</h2>
        <p class="discret" style="margin:0 0 14px">${etat.app.n_paris} paris, enregistrés ${etat.app.mobile ? "dans ce téléphone" : "sur cet ordinateur"}${etat.app.distant || etat.app.mobile ? "" : ` (<button type="button" class="lien-bouton" data-montrer="base">montrer le fichier</button>)`}. Une mise à jour de l'appli ne touche jamais à ${etat.app.mobile ? "tes paris" : "ce fichier"}.</p>
        <div class="actions">
          <a class="bouton" href="/api/sauvegarde.db" download>Télécharger une sauvegarde</a>
          <a class="bouton secondaire" href="/api/export.csv" download>Exporter en CSV (Excel)</a>
        </div>
      </section>
      ${sy ? blocSynchro(sy) : ""}
      ${etat.app.distant || etat.app.mobile ? "" : `<section class="panneau" id="synchro-fichier">
        <h2 style="margin-bottom:8px">Par un fichier</h2>
        <p class="discret" style="margin:0 0 12px">${etat.app.mobile
          ? "Sans synchronisation : envoie tes paris à l'ordinateur (menu de partage : AirDrop, iCloud Drive…), ou récupère ceux de l'ordinateur."
          : "Sans synchronisation : télécharge la sauvegarde ci-dessus pour l'iPhone, ou ajoute ici le fichier envoyé par l'iPhone."} Rien n'est perdu ni doublé.</p>
        <div class="actions">
          ${etat.app.mobile ? `<a class="bouton secondaire" href="/api/sauvegarde.db" download>Envoyer à l'ordinateur</a>` : ""}
          <label class="bouton secondaire" for="fichier-fusion">${etat.app.mobile ? "Récupérer depuis l'ordinateur" : "Ajouter les paris de l'iPhone"}</label>
          <input type="file" id="fichier-fusion" accept=".db,application/octet-stream,application/x-sqlite3" hidden>
        </div>
      </section>`}
      ${etat.app.distant || etat.app.mobile ? "" : `<section class="panneau" id="version">
        <h2 style="margin-bottom:8px">Version</h2>
        <p class="discret" style="margin:0 0 14px">Suivi Paris <b>${esc(etat.app.version)}</b>. Une mise à jour remplace le code de l'appli, jamais tes paris ni tes réglages.</p>
        ${etat.app.developpement ? `<p class="note" style="margin:0">Copie de développement : mets-la à jour avec <code>git pull</code>.</p>`
          : `<div class="actions" style="margin-top:0"><button type="button" class="bouton secondaire" id="chercher-maj">Rechercher une mise à jour</button></div><div id="maj"></div>`}
      </section>`}
      <section class="panneau">
        <h2 style="margin-bottom:8px">Affichage</h2>
        <p class="discret" style="margin:0 0 14px">Thème clair ou sombre ; « Auto » suit le réglage de ton ordinateur ou de ton téléphone.</p>
        <div class="segments" role="group" aria-label="Thème">${Object.entries(THEMES).map(([cle, nom]) =>
          `<button type="button" data-theme-choix="${cle}" aria-pressed="${themeChoisi() === cle}">${nom}</button>`).join("")}</div>
      </section>
      <section class="panneau">
        <h2 style="margin-bottom:12px">Historique des imports</h2>
        ${imports.length ? `<div class="table-defile"><table>
          <thead><tr><th>Date</th><th>Compte</th><th class="nombre">Paris lus</th><th class="nombre">Nouveaux</th><th class="nombre">Mis à jour</th></tr></thead>
          <tbody>${imports.map((i) => `<tr><td>${fmtDateHeure.format(new Date(i.date))}</td><td>${esc(i.compte || "—")} (${esc(libelleBookmaker(i.bookmaker))})</td>
            <td class="nombre">${i.lus}</td><td class="nombre">${i.nouveaux}</td><td class="nombre">${i.mis_a_jour}</td></tr>`).join("")}</tbody></table></div>`
          : `<p class="discret">Aucun import pour l'instant.</p>`}
      </section>
      <section class="panneau">
        <h2 style="margin-bottom:8px">Tout effacer</h2>
        <p class="discret" style="margin:0 0 12px">Supprime tous les paris, comptes et imports. Une copie de sécurité est faite juste avant, dans le dossier « sauvegardes » à côté de la base. Tape EFFACER pour confirmer.</p>
        <form class="actions" id="effacer" style="margin:0">
          <input class="saisie" name="confirmation" placeholder="EFFACER" autocomplete="off" aria-label="Confirmation">
          <button class="bouton danger" type="submit">Effacer toutes les données</button>
        </form>
      </section>
    </div>`;
  brancherMontrer(main);
  $$("[data-theme-choix]", main).forEach((bt) => bt.addEventListener("click", () => choisirTheme(bt.dataset.themeChoix)));
  const chercher = $("#chercher-maj", main);
  if (chercher) chercher.addEventListener("click", () => chercherMiseAJour(chercher, $("#maj", main)));
  if (sy) brancherSynchro(main, sy, () => pageDonnees(main));
  // Une base de l'autre appareil (iPhone ou ordinateur), ajoutée à celle-ci.
  const fusion = $("#fichier-fusion");
  if (fusion) fusion.addEventListener("change", async () => {
    const f = fusion.files[0];
    if (!f) return;
    try {
      const octets = new Uint8Array(await f.arrayBuffer());
      let bin = "";
      for (let i = 0; i < octets.length; i += 0x8000) bin += String.fromCharCode(...octets.subarray(i, i + 0x8000));
      const r = await api("/api/fusionner", { methode: "POST", corps: { base: btoa(bin) } });
      toast(`Ajouté : ${r.paris_nouveaux} pari${r.paris_nouveaux > 1 ? "s" : ""}, ${r.paris_mis_a_jour} mis à jour, ${r.comptes_nouveaux} compte${r.comptes_nouveaux > 1 ? "s" : ""}, ${r.mouvements_nouveaux} mouvement${r.mouvements_nouveaux > 1 ? "s" : ""}.`);
      etat.dejaAnime = false;
      pageDonnees(main);
    } catch (err) { toast(err.message, true); }
    fusion.value = "";
  });
  $("#effacer").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api("/api/effacer", { methode: "POST", corps: { confirmation: e.target.confirmation.value.trim() } });
      toast("Base vidée. Une copie de sécurité a été faite.");
      pageDonnees(main);
    } catch (err) { toast(err.message === "Confirmation manquante." ? "Tape EFFACER pour confirmer." : err.message, true); }
  });
}

/* ===================================================================== démarrage */
majBoutonTheme();
$("#theme").addEventListener("click", () => {
  const ordre = ["auto", "clair", "sombre"];
  choisirTheme(ordre[(ordre.indexOf(themeChoisi()) + 1) % ordre.length]);
});
$("#quitter").addEventListener("click", async () => {
  if (!confirm("Arrêter Suivi Paris ?")) return;
  try { await api("/api/quitter", { methode: "POST" }); } catch { /* déjà arrêté */ }
  document.body.innerHTML = `<div class="vide" style="min-height:100vh"><strong>Suivi Paris est arrêté</strong><p>Tu peux fermer cette fenêtre.</p></div>`;
});
setInterval(() => api("/api/ping", { methode: "POST" }).catch(() => {}), 15000);
api("/api/ping", { methode: "POST" }).catch(() => {});
/* La fenêtre se ferme : l'appli s'arrête d'elle-même (si aucune page ne se rouvre aussitôt, comme pour un
   rechargement). Sur Mac, fermer la fenêtre ne quitte pas Chrome : sans ce signal, il fallait « Quitter » l'icône. */
window.addEventListener("pagehide", () => {
  if (etat.app && etat.app.distant) return;
  fetch("/api/fermeture", { method: "POST", keepalive: true, headers: { "X-Suivi-Paris": "1" } }).catch(() => {});
});

(async () => {
  await chargerEtat();
  if (etat.app.distant) document.body.classList.add("distant");
  router();
})();
