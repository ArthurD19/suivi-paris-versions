# Suivi Paris

Tableau de bord **gratuit** pour suivre tes paris sportifs sur tous tes bookmakers (Betclic, Winamax, Unibet, PMU,
ps3838, bet365) au même endroit : profit, ROI, courbe de la saison, résultats par sport, par compte, par cote,
soldes, dépôts et retraits.

**Tout reste sur ton ordinateur** : l'appli ne se connecte à aucun bookmaker, ne demande aucun identifiant et
n'envoie tes paris nulle part ([confidentialité](CONFIDENTIALITE.md)).

## Installer (5 minutes, une seule fois)

**1. Télécharge l'appli** : [Suivi-Paris.zip](https://github.com/ArthurD19/suivi-paris-versions/releases/latest/download/Suivi-Paris.zip)
(toujours la dernière version).

**2. Décompresse-la et range le dossier « Suivi Paris »** là où il restera (Documents, par exemple ; sous Windows,
évite OneDrive).

**3. Lance l'installateur** qui est dans le dossier :

| | |
| --- | --- |
| **Windows** | Clic droit sur le ZIP → *Extraire tout*, puis double-clic sur **`Installer Suivi Paris.cmd`**. Si Windows affiche « Windows a protégé votre ordinateur » : *Informations complémentaires* → *Exécuter quand même*. |
| **Mac** | Double-clic sur le ZIP pour le décompresser, puis **clic droit** (ou Ctrl + clic) sur **`Installer Suivi Paris (Mac).command`** → *Ouvrir* → *Ouvrir*. Si macOS refuse quand même (« Apple n'a pas pu vérifier… ») : *Réglages Système* → *Confidentialité et sécurité*, tout en bas → **Ouvrir quand même**, puis relance le fichier. |
| **Linux** | Dans un terminal, depuis le dossier : `sh installer-suivi-paris.sh` |

L'installateur demande la permission d'installer [`uv`](https://docs.astral.sh/uv/) (l'outil qui installe Python ;
appuie sur Entrée), prépare l'appli (une ou deux minutes) et crée l'icône **Suivi Paris** sur le bureau (et dans le
menu Démarrer sous Windows, dans *Applications* sur Mac). C'est fini : double-clique sur cette icône.

**4. L'extension Chrome** (pour que tes paris arrivent tout seuls, gratuite) : dans l'appli, page **Importer** →
**Ouvrir la page des extensions**. Sur la page qui s'ouvre dans Chrome, active le **Mode développeur** (en haut à
droite), puis glisse dessus le dossier **extension** (il s'ouvre à côté). Ensuite, ouvre « Mes paris » sur ton site
de paris : ils arrivent dans l'appli.

Laisse le dossier « Suivi Paris » à sa place : Chrome y lit l'extension.

## Mettre à jour

Dans l'appli : **Mes données** → **Rechercher une mise à jour** → **Installer la mise à jour**. L'appli se relance
toute seule ; tes paris ne bougent pas, et l'extension se met à jour avec elle.

## Un problème ?

- **L'appli ne s'ouvre pas** : relance l'installateur (il ne touche pas à tes paris).
- **Tu as déplacé le dossier « Suivi Paris »** : relance l'installateur depuis son nouvel emplacement.
- **Désinstaller** : supprime le dossier « Suivi Paris » et l'icône du bureau. Tes paris restent dans un dossier à
  part (*Mes données* l'ouvre d'un clic) : supprime-le aussi pour tout effacer.
