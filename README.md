# Suivi Paris

Tableau de bord **gratuit** pour suivre tes paris sportifs sur tous tes bookmakers (Betclic, Winamax, Unibet, PMU,
ps3838, bet365, PIWI247, Olybet, bwin) au même endroit : profit, ROI, courbe de la saison, résultats par sport, par compte, par cote,
soldes, dépôts et retraits.

**Tout reste sur ton ordinateur** : l'appli ne se connecte à aucun bookmaker, ne demande aucun identifiant et
n'envoie tes paris nulle part ([confidentialité](CONFIDENTIALITE.md)).

## Installer (5 minutes, une seule fois)

### 1. Télécharger

[**Suivi-Paris.zip**](https://github.com/ArthurD19/suivi-paris-versions/releases/latest/download/Suivi-Paris.zip)
(toujours la dernière version).

### 2. Décompresser et ranger le dossier

Décompresse le ZIP (double-clic sur Mac ; clic droit → *Extraire tout* sous Windows) et range le dossier
**« Suivi Paris »** dans **Documents**. Pas dans *Téléchargements*, et sous Windows pas dans OneDrive : le dossier
doit rester à sa place, l'appli et l'extension y vivent.

### 3. Lancer l'installateur (dans le dossier « Suivi Paris »)

L'installateur est un fichier du dossier qui installe l'appli sur ton ordinateur et crée son icône sur le bureau.
On ne le lance qu'une fois (et de nouveau seulement si tu déplaces le dossier).

**Windows** : double-clic sur **`Installer Suivi Paris.cmd`**. Si Windows affiche « Windows a protégé votre
ordinateur » : *Informations complémentaires* → *Exécuter quand même*.

**Mac** : macOS bloque tout fichier téléchargé qui ne vient pas de l'App Store ou d'un développeur payant chez Apple.
C'est normal, et il y a deux façons de passer :

- *Par les Réglages* : clic droit (ou Ctrl + clic) sur **`Installer Suivi Paris (Mac).command`** → *Ouvrir*.
  Si la fenêtre ne propose que « Placer dans la corbeille » et « Terminé » (« Apple n'a pas pu confirmer… ») :
  clique sur **Terminé** (surtout pas la corbeille), ouvre **Réglages Système → Confidentialité et sécurité**,
  descends tout en bas, clique sur **Ouvrir quand même** à côté du fichier bloqué et entre ton mot de passe. Relance
  le fichier : cette fois, **Ouvrir quand même**.
- *Par le Terminal* (le plus sûr, rien n'y est bloqué) : ouvre le **Terminal** (Cmd + Espace, tape « Terminal »,
  Entrée), tape `sh` suivi d'un espace, **glisse dans la fenêtre le fichier `installer-suivi-paris.sh`** du dossier
  (son chemin s'écrit tout seul), puis Entrée.

**Linux** : dans un terminal, depuis le dossier : `sh installer-suivi-paris.sh`

Une fenêtre noire s'ouvre : elle demande d'appuyer sur **Entrée** pour installer [`uv`](https://docs.astral.sh/uv/)
(l'outil qui installe Python), puis prépare l'appli (une ou deux minutes). À la fin, l'icône **Suivi Paris** est
sur le bureau (et dans le menu Démarrer sous Windows, dans *Applications* sur Mac). C'est elle qu'on ouvre ensuite,
sans plus aucun blocage.

### 4. Créer ses comptes

Ouvre l'appli → **Comptes** → **＋ Ajouter un compte**, un par site où tu joues (« Betclic – Thomas »…). Plusieurs comptes sur
un même site, c'est possible.

### 5. Installer l'extension Chrome (gratuite, pour que tes paris arrivent tout seuls)

Dans l'appli, page **Importer** → bouton **Ouvrir la page des extensions** : la page des extensions s'ouvre dans
Chrome, et le dossier de l'extension à côté. Sur cette page :

1. active le **Mode développeur** (en haut à droite) ;
2. **glisse le dossier « extension »** sur la page (ou *Charger l'extension non empaquetée* et choisis-le) ;
3. épingle l'icône Suivi Paris (la pièce de puzzle en haut de Chrome, puis l'épingle).

Si la page ne s'ouvre pas : tape `chrome://extensions` dans la barre d'adresse de Chrome. Ça marche aussi avec Edge
et Brave.

## Ce que fait l'appli

- **Tableau de bord** : ton profit, ton ROI, ta réussite, tes paris en cours (un clic les liste) et la courbe de la
  saison (au total ou une courbe par compte ; molette pour zoomer). L'intervalle de confiance du ROI dit si ton
  résultat peut encore s'expliquer par la chance. Puis une carte par compte (un clic filtre tout le tableau), tes
  chiffres (forme des 30 derniers jours, meilleur jour, meilleure série, gain et perte moyens…), le **calendrier**
  du profit jour par jour (un clic sur un jour montre ses tickets), les résultats **par sport**, *Ton jeu à la
  loupe* (par marché, simple ou combiné, cote boostée, course, bookmaker, mise, cote, mois, jour, heure,
  anticipation) et tes **plus beaux gains** (un clic ouvre le ticket). Filtres : période, comptes, sports.
- **Une page par bookmaker** (barre de gauche) : ses chiffres, sa courbe, ses sports et ses derniers tickets.
- **Importer** : l'extension (automatique), les favoris qui récupèrent tout un historique d'un coup, ou le
  copier-coller d'une page. On y colle aussi des **messages de pronos Discord** : l'appli retrouve les paris
  correspondants et les marque « partagés ».
- **Mes paris** : tous tes paris, avec recherche (« Pogacar », « Lombardie »…) et filtres (**En cours**, Gagné, Perdu,
  Annulé, Partagés, **Sans sport**, comptes, sports). **＋ Ajouter un pari** saisit un pari à la main (tous les champs :
  site, dates, sport, sélections, cote, mise, résultat), et **Modifier** corrige n'importe quel pari de la même façon,
  **date de l'événement** comprise (le jour où il compte dans le calendrier). La liste est rangée par date de
  l'événement quand le site la donne (Betclic ; Winamax pour les matchs ; ps3838), avec la date du pari en dessous ;
  sinon par date du pari. On y change aussi le sport ou le compte
  d'un pari, et on le **partage** : le filtre *Partagés* donne les stats de tes bets partagés et **Télécharger la page publique** en
  fait une page à envoyer à ta communauté.
- **Soldes** : le vrai bilan d'argent de chaque compte : **retiré + encore sur le compte − déposé**, à côté du profit
  de tes paris. Les soldes et les dépôts et retraits arrivent avec l'extension ; dans la carte de chaque compte, on
  tape aussi le solde, et on ajoute (ou supprime) un dépôt ou un retrait à la main.
- **Comptes** : créer, renommer, colorer ou supprimer un compte, et indiquer ta **bankroll** (chaque mise s'affiche
  alors aussi en % de bankroll). **Un site que l'appli ne lit pas** (Parions Sport, Zebet…) s'ajoute aussi :
  *＋ Ajouter un compte* → *＋ Un autre site…* ; ses paris, son solde, ses dépôts et retraits se saisissent à la main.
- **Mes données** : télécharger une sauvegarde de tes paris (garde-en une ailleurs de temps en temps), exporter en
  CSV pour Excel, l'historique des imports, le thème **clair ou sombre**, et **Rechercher une mise à jour**.

Rien ne se perd ni ne se compte deux fois : chaque pari est reconnu à sa référence chez le bookmaker, un pari en
cours est mis à jour quand il se règle, et un sport corrigé à la main n'est jamais écrasé par un import.

## Site par site : paris, solde, dépôts et retraits

Avec l'extension, connecte-toi au site comme d'habitude et ouvre les pages indiquées : elle lit ce qui s'affiche et
l'envoie à l'appli (une petite bulle le confirme). Sans l'extension, copie la même page (Ctrl/Cmd + A, puis C) et
colle-la dans **Importer** (paris) ou dans **Soldes** (dépôts et retraits).

### Betclic

- **Paris** : *Mes paris* → onglet **Terminés**, et de temps en temps l'onglet **En cours** : c'est le seul endroit
  où se lit la cote d'un pari (gains possibles ÷ mise), gardée ensuite quand il se règle.
- **Solde** : relevé à chaque visite. Betclic n'affiche pas quel compte est connecté : si tu as plusieurs comptes
  Betclic, l'extension te demande sur la page à quel compte vont les paris et le solde (sans réponse, la page
  **Soldes** demande à qui est le solde lu).
- **Dépôts et retraits** : *Mon compte* → l'historique des dépôts, puis celui des retraits.
- **Tout l'historique d'un coup** : le favori Betclic (page *Importer*) fait défiler l'onglet *Terminés* jusqu'à la
  date choisie. Importe le fichier le jour même : Betclic écrit « Aujourd'hui » et « Hier » au lieu des dates.
- **Ce que Betclic n'affiche pas** : la cote d'un simple déjà réglé (connue seulement si tu l'as vu en cours, ou
  pour un pari gagné : gains ÷ mise), le sport (deviné à partir du marché ; sinon « Sans sport », à corriger) et le
  détail des sélections d'un combiné.

### Winamax

- **Paris** : *Mes paris* (onglets **En cours** et **Terminés**, avec les cotes), ou *Mon compte* → *Historique de
  compte* → onglet **Paris Sportifs** (avec le sport et les sélections des combinés, sans les cotes). Les deux se
  complètent. Ouvre l'historique de compte une fois : ensuite, chaque visite sur winamax.fr en relit la première
  page toute seule (au plus toutes les 20 minutes).
- **Solde** : relevé à chaque visite. Le compte est reconnu au pseudo, même avec plusieurs comptes Winamax.
- **Date de l'événement** : *Mes paris* affiche le jour d'un match (« 14/10 ») ; il est retenu (pas pour une course
  cycliste, dont la page ne donne pas la date).
- **Dépôts et retraits** : *Mon compte* → *Historique de compte* → onglets **Dépôts** puis **Retraits**, toutes les
  pages. Un retrait pas encore versé (« en attente ») ne compte pas.
- **Tout l'historique d'un coup** : le favori Winamax lit les pages demandées de l'historique de compte (par exemple
  `1-59`).

### Unibet

- **Paris** : *Mes paris* → onglet **Terminés**. Paris d'avant la fusion avec PSEL : *Mes paris (ancienne version
  Unibet)* → *Mes paris précédents* → *Terminés*. Unibet affiche les cotes, même des paris perdus.
- **Solde** : relevé à chaque visite.
- **Dépôts et retraits** : *Mon compte* → *Transactions*, onglets **Compte** puis **Archivé** (d'avant la fusion). Les
  transferts de la fusion et les bonus ne comptent pas.
- **Tout l'historique d'un coup** : le favori Unibet fait défiler l'onglet *Terminés* jusqu'à la date choisie.

### PMU

- **Paris** : *Sport* → *Mes paris*, onglet **Tous** ; clique sur *Voir plus* pour remonter. PMU affiche les cotes,
  pas le sport (deviné à partir du marché ; sinon « Sans sport », à corriger). **Clique sur un pari** pour l'ouvrir :
  son détail donne la date de l'événement et le vrai sport (« Basketball / Australie / NBL »), lus aussitôt.
- **Solde** : les pages PMU Sport ne l'affichent pas ; il est relevé sur les autres pages de pmu.fr (passe par
  l'accueil).
- **Dépôts et retraits** : *Mon historique de mouvements*, onglet **Appro / Retrait**.
- **Tout l'historique d'un coup** : le favori PMU clique sur *Voir plus* à ta place jusqu'à la date choisie.

### ps3838

- **Paris** : *Mon compte* → *Mes paris*, statut **Réglé**, puis *Recherche*. Le site limite une recherche à un
  mois : refais-la mois par mois, ou utilise le favori ps3838, qui remonte par tranches de 30 jours. Le jour de
  l'événement (« … @ 2025-12-14 ») est retenu.
- **Solde** : relevé à chaque visite.
- **Dépôts et retraits** : ils passent par AsianConnect (voir plus bas).

### bet365

- **Paris** : *Mon compte* → *Mon activité* → **Historique** → *Paris terminés* (et *Paris en cours*). Pas *Mes
  Paris* en haut du site, qui n'affiche le détail qu'après un clic. L'extension clique elle-même sur *Afficher plus*
  jusqu'aux paris déjà connus (la première fois : tout l'historique), puis envoie tout en une fois. Pour remonter
  plus loin, élargis la plage de dates sur le site (6 mois au plus).
- **Solde** : relevé à chaque visite.
- **Dépôts et retraits** : *Historique* → **Dépôts** puis **Retraits** ; l'extension déroule la liste elle-même.
- **Sans l'extension** : le site empêche de sélectionner le texte ; le bouton **Copier le texte de la page** de
  l'icône de l'extension le copie quand même. Pas de favori pour bet365.
- **À savoir** : la page n'a pas de référence de pari ; un pari y est reconnu à sa date (à la seconde) et à sa mise.
  Un simple n'y affiche que la sélection et la cote ; des gains qui ne valent pas mise × cote sont comptés en
  cash-out.

### PIWI247

- **Paris** : même logiciel que ps3838, même page : *Mes paris*, statut **Réglé**, puis *Recherche*. L'extension
  la lit comme celle de ps3838 ; collée à la main, choisis bien le compte PIWI247 (la page ressemble à s'y
  méprendre à celle de ps3838). La partie *exchange* du site n'est pas encore lue.
- **Solde** : relevé à chaque visite, comme sur ps3838.
- **Dépôts et retraits** : ils passent par AsianConnect (voir plus bas).

### Olybet

- **Paris** : *Historique des paris*, choisis la période (90 jours au plus), puis **clique sur chaque pari** pour
  ouvrir son détail : seul le détail donne la référence du pari, sa cote, ses sélections et la date de
  l'événement. L'extension enregistre chaque pari dès qu'il est ouvert ; sans elle, ouvre les paris puis copie la
  page. Un pari dont le détail n'est pas ouvert n'est pas lu.
- **Solde** : relevé à chaque visite (sous le bouton *Dépôt*).
- **Dépôts et retraits** : pas encore lus : ajoute-les à la main dans la carte du compte (page **Soldes**).

### bwin

- **Paris** : *Mes paris*, onglets **Ouvert** puis **Évalué** (*Filtre* : choisis la période, 90 jours au plus à
  la fois). Le site empêche Ctrl+A : l'extension lit la page toute seule (ou son bouton *Copier le texte de la
  page*). bwin n'affiche ni numéro de pari ni sport : un pari est reconnu à sa date (à la minute), sa mise et son
  choix, et un pari ouvert est mis à jour quand il passe dans *Évalué* ; le sport est deviné (sinon « Autre », à
  corriger une fois : les noms déjà vus le corrigent ensuite).
- **Tout l'historique d'un coup** : sur *Mes paris* → *Évalué*, l'icône de l'extension propose **Lire période par
  période** depuis une date de début choisie : l'extension remplit elle-même le filtre (90 jours à la fois), clique
  sur *Afficher résultats*, fait défiler la liste jusqu'en bas (elle se charge au fil du défilement) en envoyant
  les paris, puis passe aux 90 jours suivants jusqu'à aujourd'hui. Elle ne touche
  qu'au filtre ; recliquer sur le bouton arrête.
- **Solde** : relevé à chaque visite (à côté du bouton *Dépôt*).
- **Dépôts et retraits** : pas encore lus : ajoute-les à la main dans la carte du compte (page **Soldes**).

### AsianConnect (dépôts et retraits ps3838 et PIWI247)

- Le courtier par lequel passent l'argent de ps3838 et de PIWI247 (m.ac0188.com). Pas un compte de l'appli :
  ouvre *Historique des transactions* et **clique sur chaque transaction** pour la déplier. Seule une transaction
  dépliée dit quel compte elle concerne (« PS3838 (AC…) », « PIWI247 (PIW_…) ») ; l'extension la range aussitôt
  sur ce compte, reconnu à son numéro (relevé avec le solde sur ps3838 et PIWI247 ; à défaut, le seul compte de ce
  bookmaker prend le numéro).
- Un dépôt va sur le compte, un retrait en sort ; un **transfert** de ps3838 vers PIWI247 est un retrait de l'un et un
  dépôt sur l'autre. Les refus, les bonus et le portefeuille AsianConnect ne comptent pas.

### Sportaza

- **Langue** : le site en français ou en anglais (selon le compte), les deux sont lus.
- **Adresse** : Sportaza change d'adresse (« sportaza-5178.com »…). Sur une nouvelle adresse, clique sur l'icône de
  l'extension puis sur **Lire ce site automatiquement** : Chrome demande la permission, la page se recharge, et
  l'extension la lit comme les autres sites.
- **Solde** : relevé à chaque visite (« Solde réel »). Le compte est reconnu au nom du titulaire affiché dans le
  menu, même avec plusieurs comptes Sportaza.
- **Dépôts et retraits** : *Historique des transactions*, filtre **Dépôt** et **Retraits** ; les retraits annulés ne
  comptent pas.
- **Paris** : *Sport* → *Mes paris*, onglets **Calculé** et **Ouvrir**. L'extension clique elle-même sur *Afficher
  plus de paris* jusqu'aux paris déjà connus (la première fois : toute la liste). La liste ne montre ni le choix (le
  coureur, le joueur) ni la date de l'événement : **clique sur un pari** pour l'ouvrir (un à la fois), son détail
  part aussitôt dans l'appli, et une relecture de la liste fermée ne l'efface pas. Ou laisse faire l'extension :
  bouton **Ouvrir tous les paris de la page** de son icône. Elle clique sur le titre de chaque pari (jamais sur un
  bouton, ni « Retirer » ni cash-out), envoie son détail, passe au suivant, et saute ceux déjà ouverts une fois ;
  recliquer sur le bouton arrête. L'année se déduit du jour de la
  lecture ; le sport est deviné (« Tour d'Italie » : cyclisme).
- **Compte en francs suisses** (ou en livres, en dollars) : dans **Comptes**, choisis sa *Monnaie* et ce que vaut
  1 CHF en euros. Le solde, les dépôts, les retraits et les mises restent en CHF (ceux du site, et ceux que tu tapes),
  tous les chiffres de l'appli sont en euros à ce taux ; changer le taux recalcule tout. Tant que la monnaie n'est pas
  réglée, rien n'est enregistré d'un site qui affiche des CHF.

### Bientôt : NetBet

Sa lecture n'est pas encore écrite. L'extension tourne déjà sur ce site, mais seulement pour son bouton
**Copier le texte de la page** (il empêche Ctrl+A) : ouvre la page voulue (paris terminés dépliés sur NetBet),
copie son texte avec ce bouton et envoie-le pour que la lecture soit ajoutée. En attendant, crée le compte avec
« ＋ Un autre site… » (page **Comptes**) et saisis les paris à la main.

### Bon à savoir

- **L'appli est fermée ?** L'extension garde ce qu'elle a lu et l'envoie dès que l'appli s'ouvre (elle réessaie
  chaque minute ; le chiffre sur son icône compte les pages en attente).
- **Plusieurs comptes sur un même site** : l'extension demande sur la page sur quel compte tu es connecté, et
  n'enregistre rien avant ta réponse (un « ! » rouge sur son icône tant que des pages attendent). La réponse vaut
  pour cet onglet : dans un nouvel onglet, elle redemande, pour ne jamais mettre les paris d'un compte sur un autre.
  Winamax reconnaît le compte tout seul (au pseudo).
- **Rien n'arrive ?** Clique sur l'icône de l'extension : elle dit ce qu'elle voit sur la page ouverte (« 12 paris
  repérés », ou qu'elle ne lit pas ce site) et le solde lu, ou pourquoi elle ne l'a pas lu.
- **Recoller ou rouvrir une page ne crée aucun doublon** ; un pari en cours est mis à jour quand il se règle.
- **Pause** : l'interrupteur de l'icône de l'extension la met en pause.

## Mettre à jour

Dans l'appli : **Mes données** → **Rechercher une mise à jour** → **Installer la mise à jour**. L'appli se relance
toute seule ; tes paris ne bougent pas, et l'extension se met à jour avec elle (à son prochain envoi, au plus tard
dans la demi-heure).

## Un problème ?

- **L'appli ne s'ouvre pas** : relance l'installateur (il ne touche pas à tes paris).
- **Sur Mac, cliquer sur l'icône ne fait rien** : l'appli tourne encore en arrière-plan. Clique dans sa fenêtre et
  fais **Cmd + Q** (ou *Forcer à quitter* : Cmd + Option + Échap), puis rouvre-la.
- **Tu as déplacé le dossier « Suivi Paris »** : relance l'installateur depuis son nouvel emplacement, puis recharge
  l'extension depuis ce nouvel endroit.
- **La page Importer dit que l'extension est en retard** : dans `chrome://extensions`, clique sur la flèche
  circulaire de Suivi Paris.
- **Désinstaller** : supprime le dossier « Suivi Paris » et l'icône du bureau. Tes paris restent dans un dossier à
  part (*Mes données* l'ouvre d'un clic) : supprime-le aussi pour tout effacer.
