# Suivi Paris : confidentialité

*Dernière mise à jour : octobre 2026.*

Suivi Paris (l'application et son extension pour Chrome) sert à suivre ses propres paris sportifs. Tout se passe
**sur ton ordinateur** : il n'y a ni compte Suivi Paris, ni serveur Suivi Paris, ni publicité, ni statistique
d'utilisation.

## Ce que l'extension lit

L'extension ne fonctionne que sur les sites des bookmakers pris en charge (betclic.fr, winamax.fr, unibet.fr,
pmu.fr, ps3838.com, bet365.fr et bet365.com). Sur ces sites, et seulement sur les pages que tu ouvres toi-même,
elle lit le texte affiché :

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
| Accès aux sites des bookmakers | Lire tes paris, ton solde, tes dépôts et retraits sur les pages que tu ouvres. |
| `http://127.0.0.1:47830` | Envoyer ces informations à l'application Suivi Paris de ton ordinateur. |
| `storage` | Garder tes réglages, et les pages pas encore envoyées quand l'application est fermée. |
| `alarms` | Réessayer chaque minute d'envoyer ces pages en attente. |
| `notifications` | Prévenir quand de nouveaux paris sont arrivés dans l'application. |
| `clipboardWrite` | Le bouton « Copier le texte de la page », sur les sites qui empêchent de sélectionner le texte. |
| `activeTab` | Savoir, quand tu cliques sur l'icône, sur quel site tu es, pour dire ce que l'extension y voit. |

## L'application

L'application ne se connecte à aucun bookmaker et ne demande aucun identifiant. Elle ne se connecte à Internet
que si tu cliques sur **Rechercher une mise à jour** (dans *Mes données*) : elle demande alors à GitHub la dernière
version publiée, et la télécharge si tu choisis de l'installer. Aucune de tes données n'est envoyée à cette occasion.

Tes données restent sur ton ordinateur, dans un dossier que *Mes données* ouvre d'un clic. Pour tout effacer :
désinstalle l'application et supprime ce dossier ; désinstaller l'extension efface ce qu'elle gardait.

## Contact

Une question : ouvre une discussion (*Issues*) sur https://github.com/ArthurD19/suivi-paris-versions.
