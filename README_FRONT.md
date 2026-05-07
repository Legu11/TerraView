# Terraview - Front

Le front du projet Terraview. Site web fait en HTML / CSS / JS pur, sans
framework type React ou Vue (c'était dans le sujet, et au final c'est pas
plus mal pour un projet de cette taille).

## Lancer le site en local

Faut un serveur HTTP local, sinon les `fetch()` vers l'API ne marchent pas
(CORS sur les fichiers `file://`). Le plus simple avec Python :

```
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000` dans le navigateur. Tu arrives sur la
landing page, faut s'inscrire ou se connecter pour accéder au reste.

## Les pages

### Pages publiques
- `index.html` - landing page avec le hero, les chiffres clés, les
  fonctionnalités, et les boutons connexion / inscription
- `login.html` - formulaire de connexion (email + mdp)
- `signup.html` - formulaire d'inscription (nom + email + mdp)

### Pages applicatives (après connexion)
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

## La techno

Pas de framework JS. Juste :

- CSS Grid + Flexbox maison pour le layout (top bar + bento grid)
- Chart.js (CDN) pour les graphiques météo (température, humidité, pluie)
- Leaflet + OpenStreetMap (CDN) pour la carte des parcelles

J'ai utilisé des variables CSS dans `style.css` pour la palette histoire
de pouvoir changer toutes les couleurs en un endroit.

## Le design

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

## L'authentification

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

## Le CRUD

J'ai mis des formulaires inline (pas de modal Bootstrap) sur les pages
parcelles, cultures et observations. Tu cliques sur le bouton "+ Ajouter"
en haut, le formulaire apparaît au-dessus du tableau.

- **Parcelles** : créer, modifier, supprimer (avec `confirm()` natif).
  La suppression cascade aussi sur les cultures, observations et alertes
  liées (vu que c'est défini dans le `schema.sql`).
- **Cultures** : créer, supprimer
- **Observations** : saisir une nouvelle observation (date, parcelle,
  état, commentaire optionnel)

## Les règles métier

C'est un point demandé dans le cahier des charges. Sur la page Alertes,
y'a un bouton "⚡ Analyser maintenant" qui appelle un endpoint backend
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

## Brancher l'API

Dans `js/api.js`, en haut du fichier, il y a une variable `USE_MOCK` :

- si `true` : le site tourne avec des données de démo en local (pas besoin
  que le back tourne)
- si `false` : il appelle l'API Flask sur `http://127.0.0.1:5000/api`

Pour le backend, voir le `README-Back.md`.

Si l'API ne répond pas alors qu'on est en mode `false`, le site affiche
une popup et retombe sur les données de démo, donc ça plante pas.

## Structure des fichiers

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

## Quelques galères que j'ai eues

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

## Ce qui pourrait être amélioré

- Stocker les coordonnées GPS en base, pas dans le front
- Ajouter une vraie protection des routes (middleware d'auth côté Flask)
- Passer le token utilisateur en JWT plutôt qu'en localStorage simple
- Ajouter une pagination quand y'aura plus de 100 observations
- Tri cliquable sur les colonnes des tableaux
- Mode sombre

## Auteurs

- Loevan (front)
