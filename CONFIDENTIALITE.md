# Suivi Paris : confidentialité

*Dernière mise à jour : octobre 2026.*

Suivi Paris (l'application et son extension pour Chrome) sert à suivre ses propres paris sportifs. Tout se passe
**sur ton ordinateur** : il n'y a ni compte Suivi Paris, ni serveur Suivi Paris, ni publicité, ni statistique
d'utilisation.

## Ce que l'extension lit

L'extension ne fonctionne que sur les sites des bookmakers pris en charge (betclic.fr, winamax.fr, unibet.fr,
pmu.fr, ps3838.com, piwi247.com, olybet.fr, bwin.fr, sportaza.com, netbet.fr, orbitxch.com, bet365.fr et bet365.com, et l'historique des
transactions d'AsianConnect). Sur ces sites, et seulement sur les pages que tu ouvres
toi-même, elle lit le texte affiché :

- l'historique de tes paris (date, événement, sélections, cote, mise, gains, état du pari) ;
- le solde affiché en haut de la page une fois connecté ;
- l'historique de tes dépôts et retraits, quand tu ouvres cette page.

Elle ne lit **aucun identifiant ni mot de passe**, ne remplit aucun formulaire, ne prend aucun pari et ne lit rien
sur les autres sites.

## Où vont ces informations

Uniquement vers l'application Suivi Paris **de ton propre ordinateur**, à l'adresse locale `http://127.0.0.1:47830`
(une adresse qui ne sort pas de l'ordinateur). L'application les range dans une base de données sur ce même
ordinateur. **Rien n'est envoyé sur Internet, ni à l'auteur de Suivi Paris, ni à personne d'autre.** Rien n'est
vendu ni partagé.

Si l'application est fermée, l'extension garde les pages lues dans le stockage du navigateur (`chrome.storage`)
et les envoie dès que l'application s'ouvre. Elle y garde aussi tes réglages (le compte qui reçoit les paris de
chaque site, la mise en pause) et la liste des derniers envois affichée dans son icône.

## Les autorisations demandées

| Autorisation | Pourquoi |
| --- | --- |
| Accès aux sites des bookmakers | Lire tes paris, ton solde, tes dépôts et retraits sur les pages que tu ouvres ; après une mise à jour de l'extension, remettre son script dans les onglets de ces sites déjà ouverts (sans recharger la page). |
| `http://127.0.0.1:47830` | Envoyer ces informations à l'application Suivi Paris de ton ordinateur. |
| `storage` | Garder tes réglages, et les pages pas encore envoyées quand l'application est fermée. |
| `alarms` | Réessayer chaque minute d'envoyer ces pages en attente. |
| `notifications` | Prévenir quand de nouveaux paris sont arrivés dans l'application. |
| `clipboardWrite` | Le bouton « Copier le texte de la page », sur les sites qui empêchent de sélectionner le texte. |
| `activeTab` | Savoir, quand tu cliques sur l'icône, sur quel site tu es, pour dire ce que l'extension y voit. |
| Autorisation d'un cadre (demandée au clic) | Certains sites affichent les paris dans un cadre venu d'un autre site (Sportaza). Au clic sur *Copier le texte de la page*, Chrome te demande si l'extension peut lire ce site-là ; sans ton accord, rien n'en est lu. |
| Autorisation d'une adresse de Sportaza (demandée au clic) | Sportaza change d'adresse (« sportaza-5178.com ») : le bouton *Lire ce site automatiquement* demande à Chrome la permission de lire cette adresse-là, et rien d'autre. |
| `scripting` | Avec `activeTab` : quand tu cliques sur *Copier le texte de la page*, lire le texte de l'onglet ouvert si la page ne répond pas (ouverte avant une mise à jour de l'extension, ou site que l'extension ne suit pas). Seulement à ce clic, et le texte va dans ton presse-papiers, nulle part ailleurs. |

## L'application

L'application ne se connecte à aucun bookmaker et ne demande aucun identifiant. Elle ne se connecte à Internet
que si tu cliques sur **Rechercher une mise à jour** (dans *Mes données*) : elle demande alors à GitHub la dernière
version publiée, et la télécharge si tu choisis de l'installer. Aucune de tes données n'est envoyée à cette occasion.

Tes données restent sur ton ordinateur, dans un dossier que *Mes données* ouvre d'un clic. Pour tout effacer :
désinstalle l'application et supprime ce dossier ; désinstaller l'extension efface ce qu'elle gardait.

## Contact

Une question : ouvre une discussion (*Issues*) sur https://github.com/ArthurD19/suivi-paris-versions.

## Synchronisation avec l'iPhone (si tu l'actives)

Désactivée par défaut. Activée (Mes données → Avec l'iPhone), l'ordinateur et l'iPhone s'échangent leur base de
paris par un « gist » secret de **ton** compte GitHub, avec un jeton que tu crées (droit *gist* seulement). Chaque
base y est compressée puis **chiffrée (AES-256-GCM)** avant de partir : la clé est créée sur ton ordinateur et n'est
transmise qu'à ton iPhone, par le code de liaison ; ni GitHub ni personne d'autre ne peut lire le contenu. Le jeton
et la clé restent sur tes deux appareils (fichier de réglages de l'ordinateur, stockage de l'appli sur l'iPhone).
« Désactiver » supprime le gist.

L'extension liée à la synchronisation (code de liaison collé dans sa fenêtre, utile sur l'iPhone avec Orion) dépose
ce qu'elle lit, quand aucune appli ne lui répond, dans ce même gist, chiffré de la même façon ; l'appli (iPhone ou
ordinateur) l'enregistre puis le retire. Sans code de liaison, l'extension n'envoie toujours rien qu'à l'appli de
l'ordinateur.
