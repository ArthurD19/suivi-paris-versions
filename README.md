# Suivi Paris

Tableau de bord **gratuit** pour suivre tes paris sportifs sur tous tes bookmakers (Betclic, Winamax, Unibet, PMU,
ps3838, bet365) au même endroit : profit, ROI, courbe de la saison, résultats par sport, par compte, par cote,
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
  Annulé, Partagés, **Sans sport**, comptes, sports). On y corrige le sport d'un pari, on le change de compte, on le
  modifie (passer un pari en cours en gagné, corriger une mise ou une cote : la modification est signalée) et on le
  **partage** : le filtre *Partagés* donne les stats de tes bets partagés et **Télécharger la page publique** en
  fait une page à envoyer à ta communauté.
- **Soldes** : le vrai bilan d'argent de chaque compte : **retiré + encore sur le compte − déposé**, à côté du profit
  de tes paris. Les soldes et les dépôts et retraits arrivent avec l'extension ; un solde se tape aussi à la main
  dans la carte du compte.
- **Comptes** : créer, renommer, colorer ou supprimer un compte, et indiquer ta **bankroll** (chaque mise s'affiche
  alors aussi en % de bankroll).
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
  Betclic, choisis dans l'icône de l'extension celui qui reçoit les paris et le solde (sinon la page **Soldes**
  demande à qui est le solde lu).
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
  pas le sport (deviné à partir du marché ; sinon « Sans sport », à corriger).
- **Solde** : les pages PMU Sport ne l'affichent pas ; il est relevé sur les autres pages de pmu.fr (passe par
  l'accueil).
- **Dépôts et retraits** : *Mon historique de mouvements*, onglet **Appro / Retrait**.
- **Tout l'historique d'un coup** : le favori PMU clique sur *Voir plus* à ta place jusqu'à la date choisie.

### ps3838

- **Paris** : *Mon compte* → *Mes paris*, statut **Réglé**, puis *Recherche*. Le site limite une recherche à un
  mois : refais-la mois par mois, ou utilise le favori ps3838, qui remonte par tranches de 30 jours.
- **Solde** : relevé à chaque visite.
- **Dépôts et retraits** : pas encore lus. Le solde, lui, entre dans le bilan de la page **Soldes**.

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

### Bon à savoir

- **L'appli est fermée ?** L'extension garde ce qu'elle a lu et l'envoie dès que l'appli s'ouvre (elle réessaie
  chaque minute ; le chiffre sur son icône compte les pages en attente).
- **Plusieurs comptes sur un même site** : choisis dans l'icône de l'extension celui qui reçoit les paris de ce site
  (un « ! » rouge tant que ce n'est pas fait). Winamax reconnaît le compte tout seul.
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
