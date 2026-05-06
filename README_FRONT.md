# AgriData - Frontend

Partie frontend de l'application web de suivi agricole AgriData, développée
dans le cadre du projet Bachelor 2 (Sup de Vinci), commandité par la
Chambre d'Agriculture.

## Objectif du frontend

Fournir une interface utilisateur claire et responsive permettant aux
acteurs agricoles de visualiser leurs parcelles, suivre leurs cultures,
consulter les observations terrain, surveiller les alertes et lire les
relevés météorologiques.

## Pages disponibles

- `index.html` - tableau de bord avec KPIs, météo 7j (Chart.js) et alertes récentes
- `parcelles.html` - liste des parcelles + carte interactive (Leaflet)
- `parcelle-detail.html?id=X` - fiche détaillée d'une parcelle (cultures, observations, alertes, météo 14j)
- `cultures.html` - cultures associées aux parcelles (avec filtre)
- `observations.html` - historique des relevés terrain (avec filtres)
- `alertes.html` - alertes par parcelle avec niveau de gravité (KPIs + filtres)

## Stack technique

- HTML5 / CSS3 sémantique
- Bootstrap 5 (CDN) - layout responsive et navbar
- Chart.js (CDN) - graphiques météo
- Leaflet + OpenStreetMap (CDN) - carte des parcelles
- JavaScript vanilla (pas de framework type React/Vue)
- Pas de build, pas de bundler - ouverture directe via un serveur HTTP statique

## Structure des fichiers

```
.
├── index.html
├── parcelles.html
├── parcelle-detail.html
├── cultures.html
├── observations.html
├── alertes.html
├── css/
│   └── style.css
└── js/
    ├── data.js     (données de test pour le développement)
    └── app.js      (logique de rendu des pages)
```

## Lancement local

L'application est composée de fichiers statiques. Un serveur HTTP local
suffit pour la servir.

```bash
python3 -m http.server 8000
```

Puis ouvrir <http://localhost:8000> dans le navigateur.

## Fonctionnalités frontend

- Tableau de bord avec 4 KPIs et bloc météo du jour
- Graphique combiné (température + humidité + pluviométrie) sur 7 jours
- Carte Leaflet avec marqueurs par parcelle (Hauts-de-France)
- Fiche détaillée par parcelle accessible via clic sur n'importe quel nom
- Filtres dynamiques sur observations, alertes et cultures
- Codes couleur cohérents pour les états et niveaux d'alerte
- Échappement HTML systématique (protection XSS)
- Responsive mobile / tablette / desktop via Bootstrap

## Compatibilité

Testé sur Chrome, Firefox, Edge - dernières versions.
Mobile-first, breakpoints Bootstrap (576px / 768px / 992px / 1200px).

## Auteurs frontend

- À compléter
