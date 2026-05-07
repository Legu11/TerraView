---

## organisation du groupe :

Arda : dépôt git, pipeline CI/CD, README (compte rendu globale), UX UI de l’application 

Loevan : dev frontend, il s’est également chargé de la connexion entre la base de donnée et l’application.

Benoît : dev backend/BDD, MCD et MLD 

Lyliane : architecture et infrastructure de l’application. 

## Lien du site hébergé :

https://terraview.loevandev.fr/

---

## Frontend + backend (Loevan)

**Lancer le site en local**

Faut un serveur HTTP local, sinon les `fetch()` vers l'API ne marchent pas
(CORS sur les fichiers `file://`). Le plus simple avec Python :

```
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000` dans le navigateur. Tu arrives sur la
landing page, faut s'inscrire ou se connecter pour accéder au reste.

**Les pages**

**Pages publiques**

- `index.html` - landing page avec le hero, les chiffres clés, les
fonctionnalités, et les boutons connexion / inscription
- `login.html` - formulaire de connexion (email + mdp)
- `signup.html` - formulaire d'inscription (nom + email + mdp)

**Pages applicatives (après connexion)**

- `dashboard.html` - tableau de bord : 4 KPIs en haut, météo + graphique
Chart.js sur 7 jours, dernières observations en cards horizontales
scrollables, et les 10 alertes les plus récentes en colonne à droite
- `parcelles.html` - liste des parcelles + carte Leaflet centrée sur Lille,
avec formulaire d'ajout / modification et boutons supprimer
- `parcelle-detail.html?id=X` - fiche détaillée d'une parcelle (KPIs,
cultures associées, observations récentes, alertes, graphique météo 14j)
- `cultures.html` - liste des cultures, ajout via formulaire, filtre par type
- `observations.html` - historique des relevés terrain, saisie d'une
nouvelle observation, filtres par état et par parcelle
- `alertes.html` - alertes par niveau (1 vigilance, 2 élevé, 3 critique),
avec un bouton "Analyser maintenant" qui déclenche l'analyse côté back

**La techno**

Pas de framework JS. Juste :

- CSS Grid + Flexbox maison pour le layout (top bar + bento grid)
- Chart.js (CDN) pour les graphiques météo (température, humidité, pluie)
- Leaflet + OpenStreetMap (CDN) pour la carte des parcelles

J'ai utilisé des variables CSS dans `style.css` pour la palette histoire
de pouvoir changer toutes les couleurs en un endroit.

**Le design**

Au début j'étais parti sur du Bootstrap avec une palette verte agricole
classique. Mais en discutant avec le groupe je me suis rendu compte qu'on
allait tous avoir le même rendu (vert + Bootstrap), du coup j'ai voulu
faire quelque chose de différent.

J'ai cherché des inspirations sur Dribbble, j'aimais bien le style des
dashboards SaaS modernes (Linear, Vercel, Stripe). J'ai pris une palette
sur Coolors : blanc cassé / bleu nuit / vert olive en accent.

Du coup j'ai viré Bootstrap et j'ai tout refait en CSS Grid pur. C'est
plus de boulot mais ça donne un rendu plus carré et y'a pas de classes
Bootstrap inutiles partout. Les chiffres des KPIs sont en monospace
(`tabular-nums`) parce que ça aligne mieux et ça fait plus "data dashboard".

**L'authentification**

J'ai ajouté un système simple :

- formulaire d'inscription qui crée l'utilisateur en base (mot de passe
hashé côté Python avec `werkzeug.security`, pas en clair)
- formulaire de connexion qui vérifie le hash
- l'utilisateur connecté est stocké en `localStorage` côté front
- la top bar affiche "Bonjour {nom}" + bouton déconnexion quand on est
connecté, sinon les liens connexion / inscription

C'est volontairement simple : pas de JWT, pas de protection serveur des
routes API. Pour un projet d'école c'est suffisant. Si on devait passer
en prod faudrait évidemment durcir tout ça.

**Le CRUD**

J'ai mis des formulaires inline (pas de modal Bootstrap) sur les pages
parcelles, cultures et observations. Tu cliques sur le bouton "+ Ajouter"
en haut, le formulaire apparaît au-dessus du tableau.

- **Parcelles** : créer, modifier, supprimer (avec `confirm()` natif).
La suppression cascade aussi sur les cultures, observations et alertes
liées (vu que c'est défini dans le `schema.sql`).
- **Cultures** : créer, supprimer
- **Observations** : saisir une nouvelle observation (date, parcelle,
état, commentaire optionnel)

**Les règles métier**

C'est un point demandé dans le cahier des charges. Sur la page Alertes,
y'a un bouton "Analyser maintenant" qui appelle un endpoint backend
qui regarde la météo des 14 derniers jours et génère des alertes selon
3 règles :

1. **Stress hydrique** (niveau 2) : pluie cumulée 7j < 15mm ET temp moyenne
7j > 18°C. Toutes les parcelles avec une culture sont concernées.
2. **Risque maladie** (niveau 1) : humidité moyenne 7j > 70% ET temp
moyenne entre 14 et 22°C. Conditions favorables aux champignons.
3. **Sécheresse prolongée** (niveau 3) : 0 jour avec pluie > 2mm sur 14
jours, mais uniquement sur les cultures sensibles (Maïs, Tournesol).

Le backend dédoublonne pour éviter de créer une alerte identique deux fois
le même jour sur la même parcelle.

**Brancher l'API**

Dans `js/api.js`, en haut du fichier, il y a une variable `USE_MOCK` :

- si `true` : le site tourne avec des données de démo en local (pas besoin
que le back tourne)
- si `false` : il appelle l'API Flask sur `http://127.0.0.1:5000/api`

Pour le backend, voir le `README-Back.md`.

Si l'API ne répond pas alors qu'on est en mode `false`, le site affiche
une popup et retombe sur les données de démo, donc ça plante pas.

**Structure des fichiers**

```
.
├── index.html              (landing page publique)
├── login.html
├── signup.html
├── dashboard.html
├── parcelles.html
├── parcelle-detail.html
├── cultures.html
├── observations.html
├── alertes.html
├── css/
│   └── style.css
└── js/
    ├── data.js   (données de démo + mapping coords GPS)
    ├── api.js    (couche qui parle à l'API + switch mock/réel)
    ├── auth.js   (helpers register / login / logout / topbar)
    └── app.js    (rendu de chaque page + CRUD)
```

## Difficultés rencontrés

- **Jointure parcelle_id** : le back renvoie le NOM de la parcelle dans
les observations / alertes / cultures, mais moi j'avais besoin de l'id
pour les liens cliquables vers la fiche détaillée. J'ai dû refaire la
jointure inverse côté JS dans `api.js`.
- **Coordonnées GPS** : la base ne stocke pas les lat/lng, donc j'ai mis
un mapping fixe `id → [lat, lng]` côté front (`PARCELLE_COORDS` dans
`data.js`). Pas idéal mais c'était plus simple que de modifier le
schéma. À terme faudrait que ce soit en base.
- **Niveaux d'alertes** : au début j'avais codé que 2 niveaux (1 et 2)
parce que c'est ce que mon mock contenait. Quand j'ai branché l'API
j'ai vu qu'en vrai y'a aussi des alertes niveau 3, j'ai dû rajouter
le cas après coup.
- **Cache navigateur** : à un moment j'ai changé le CSS et le navigateur
servait toujours l'ancien. J'ai mis des `?v=3` à la fin des `<link>`
et `<script>` pour forcer le rechargement.

## Amélioration possible

- Stocker les coordonnées GPS en base, pas dans le front
- Ajouter une vraie protection des routes (middleware d'auth côté Flask)
- Passer le token utilisateur en JWT plutôt qu'en localStorage simple
- Ajouter une pagination quand y'aura plus de 100 observations
- Tri cliquable sur les colonnes des tableaux
- Mode sombre

---

## BDD/Backend (Benoît)

L'API REST en Flask + base MySQL pour le projet Terraview.

## Ce que ça fait

Le back stocke les données dans une base MySQL et les expose en JSON via une
petite API REST. Le front (HTML/JS) attaque cette API pour afficher les
parcelles, observations, alertes, etc.

Les données partent de fichiers CSV dans `data/` qui sont importés dans la
base à l'init.

## Installation

Sur Linux ou Mac :

```
./setup.sh
```

Sur Windows :

```
.\\setup.ps1
```

Ce script crée un environnement Python (`.venv`), installe les dépendances,
applique le schéma SQL et importe les CSV dans la base.

Avant ça il faut avoir MySQL ou MariaDB installé et démarré.

## Config

Les paramètres de connexion sont dans un fichier `.env` à la racine. Ce
fichier n'est pas commité (mot de passe). Un modèle est dans
`.env.example`, suffit de le copier en `.env` et d'adapter :

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=...
DB_NAME=agriculture
```

Le code charge automatiquement ce fichier (via python-dotenv) donc plus
besoin de faire `export DB_PASSWORD=...` à la main.

## Lancer l'API

Sur Linux :

```
./run-backend.sh
```

Ou manuellement :

```
source .venv/bin/activate
python database/api.py
```

L'API démarre sur `http://127.0.0.1:5000`.

## Les endpoints

- `GET /api/health` - test de vie, renvoie `{"status":"ok"}`
- `GET /api/stats` - compteurs (nb de parcelles, observations, alertes)
- `GET /api/parcelles` - liste des parcelles
- `GET /api/cultures` - cultures avec le nom de la parcelle joint
- `GET /api/observations` - historique des relevés
- `GET /api/alertes` - alertes par parcelle
- `GET /api/meteo` - 30 derniers jours de météo

Tous renvoient du JSON. Test rapide :

```
curl <http://127.0.0.1:5000/api/parcelles>
```

## Réinitialiser la base

Si jamais on veut repartir de zéro :

```
source .venv/bin/activate
python database/init_db.py
```

Ça vide les tables et réimporte les CSV.

## Les fichiers du dossier `database/`

- `api.py` - les endpoints Flask
- `db.py` - helper de connexion MySQL (lit le .env)
- `schema.sql` - structure des 5 tables
- `init_db.py` - applique le schéma puis importe les CSV
- `import_csv.py` - charge les CSV dans la base
- `queries.sql` - quelques requêtes SQL d'analyse
- `run_queries.py` - exécute les requêtes du fichier
- `requirements.txt` - dépendances Python

### Difficultés rencontrés

Plusieurs difficultés techniques ont été rencontrées lors du développement :

- **Connexion à la base de données**
    - Problème lié aux identifiants MySQL
    - Solution : utilisation de variables d’environnement pour sécuriser la configuration
- **Gestion des fichiers de données (CSV)**
    - Problèmes d’encodage (UTF-8 avec BOM)
    - Correction des fichiers pour assurer une bonne importation
- **Contraintes de base de données**
    - Difficultés avec les clés étrangères lors du rechargement des données
    - Solution : gestion temporaire des contraintes lors des imports
- **Communication frontend / backend**
    - Problème de CORS empêchant les appels API
    - Solution : configuration CORS côté serveur
- **Format des données (API)**
    - Problèmes de conversion JSON (dates, nombres)
    - Mise en place d’une sérialisation adaptée
- Problème lié a la connexion entre le backend et frontend
- Problème pour héberger le site

## Amélioration possible

Plusieurs évolutions peuvent être envisagées :

- Ajout d’**endpoints d’écriture** (POST, PUT, DELETE) pour permettre une interaction complète avec l’application
- Mise en place d’une **authentification** pour sécuriser l’accès aux données
- Ajout de **pagination** pour gérer de grands volumes de données
- Mise en place d’un système de **migrations de base de données**
- Amélioration de la gestion des données (temps réel, API externe)

## Schéma du MCD

<img width="862" height="599" alt="image" src="https://github.com/user-attachments/assets/b33657e1-a50d-42a9-9083-b867ce52e52a" />


## Schéma du MLD

<img width="896" height="549" alt="image" src="https://github.com/user-attachments/assets/985b9373-acac-4aa6-8d4b-bc0d4d098ac4" />

---

## Infrastructure & Architecture Technique

**Architecture générale :**

L’architecture repose sur une séparation claire entre les différentes couches : utilisateur, réseau, application et données. Cette organisation permet d’assurer la sécurité, la maintenabilité et l’évolution du système.

**Sécurité et réseau :**

Une DMZ est utilisée pour isoler les services exposés à Internet. Un pare-feu et un WAF filtrent les requêtes. Un reverse proxy assure la distribution du trafic et protège les services internes.

**Segmentation réseau :**

Le réseau est segmenté en plusieurs VLAN afin d’isoler les composants critiques : un VLAN applicatif et un VLAN dédié aux données.

**Hébergement Cloud :**

L’infrastructure est déployée sur Microsoft Azure, permettant une meilleure disponibilité et scalabilité.

**Données :**

Les données sont stockées dans une base SQL et complétées par un stockage pour les fichiers.

**Pipeline CI/CD :** 

Une pipeline CI/CD automatise le déploiement : code → build → tests → mise en production.

## Amélioration possibles

- Kubernetes pour la scalabilité
- Monitoring avancé (Grafana, Prometheus)
- Sécurité renforcée (IDS/IPS)
- Haute disponibilité multi-régions

## Difficultés rencontrées :

- Compréhension de l’archi réseau
- Mise en place de la sécurité
- Configuration CI/CD
- Manque de temps

## Schéma d’architecture globale

<img width="900" height="650" alt="image" src="https://github.com/user-attachments/assets/52a5d332-2e7b-4af2-839c-d55cbdeca433" />

## Schéma détaillé

<img width="995" height="370" alt="image" src="https://github.com/user-attachments/assets/072da689-3bc4-4e85-8126-281c3be1f329" />

---

## Pipeline CI/CD (Arda) :

Schéma de la pipeline 

<img width="260" height="837" alt="image" src="https://github.com/user-attachments/assets/ff00d32b-7526-450b-859d-59663231b9ee" />

Explication de la pipeline :

La pipeline automatise l'intégration et le déploiement du MVP, avec un focus sur la sécurité du code avant toute mise en production. L'ordre des étapes suit le principe du **fail fast** : détecter les problèmes le plus tôt possible pour économiser du temps de build et de test.

1. Commit 

Le développeur pousse ses modifications sur le dépôt Git. Chaque commit déclenche automatiquement la pipeline. 

1. Gitleaks

Cet outils permet de faire un scan de l’ensemble des fichiers présent sur le dépôt git, pour détecter les secrets dans le code qu’on aurait potentiellement oublier. Les secrets peut être par exemple des clés API, des tokens, mots de passe, credentials de la base de donnée. Je l’ai placé en tout premier car il s’agit d’une étape assez rapide et aussi la plus critique. Dès qu’un secret est détecté, la pipeline s’arrête et envoie un alerte. 

1. Snyk

Cet outils permet d’analyser les vulnérabilité dans les dépendances (librairies tierces, packages nmp/pip/composer). Snyk lit les fichiers de gestion de dépendances comme le package.json, requirement.txt… et vérifie pour chaque librairie installée si la version utilisée comporte des failles de sécurité qui sont connue et référencées dans la base de donnée mondiale des CVE (Common Vulnerabilities and Exposures). Si une faille est détecté, snyk recommande la version corrigée à installer. 

1. Test

Cette étape correspond a l’exécution des tests automatisés (unitaires et d’intégration) pour valider la logique métier : règle de détection des risques agricoles, calculs d’indicateurs gestion des parcelles etc..

1. Deepsource

Deepsource va faire une analyse statique de la qualité du code : détection de bugs potentiels, code smells, anti-patterns, problème de performance et de maintenabilité. Cela garanti un code propre et lisible et surtout exploitable par une autre équipe. 

1. Build

C’est l’étape qui transforme le code source en une version déployable de l’application (frontend+backend). Je l’ai placé après les vérifications de sécurité et de qualité pour faire en sorte que le code s’exécute uniquement si le code est propre. 

1. Déploiement sécurisé 

Phase de mise en production automatisée de l’application sur l’infrastructure. Le code déployé est garanti sans secret exposé, sans vulnérabilité connue, testé, conforme aux standards de qualité et correctement build. 

## Amélioration possible  :

- Notifications automatiques (par Teams, Discord, Telegram..) en cas d’échec ou de succès du déploiement.
- Rollback automatique si le déploiement échoue

## Difficultés rencontrées :

- Syntaxe YAML, erreur d’indentation qui font échouer toute la pipeline.
- Mauvais nom de branche : la pipeline était s’enclenchait uniquement dans la branche Pipeline-CI/CD, mais le dépôt utilisait main, a cause de ça la pipeline ne se déclenchait pas correctement. car elle analysait uniquement les fichiers présent dans la branche.
