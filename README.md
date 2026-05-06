# AgriData

Application web de suivi agricole - projet Bachelor 2 (Sup de Vinci),
commandité par la Chambre d'Agriculture.

## Objectif

Permettre aux acteurs agricoles de surveiller leurs cultures et améliorer
leur prise de décision en exploitant des données météo, observations
terrain et suivi des cultures.

## Pages disponibles

- `index.html` - tableau de bord avec stats et dernières observations
- `parcelles.html` - liste des parcelles
- `cultures.html` - cultures associées aux parcelles
- `observations.html` - historique des relevés terrain (avec filtres)
- `alertes.html` - alertes par parcelle avec niveau de gravité (avec filtres + KPIs)

## Stack actuelle

- HTML5 / CSS3
- Bootstrap 5 (CDN) pour le responsive et la navbar
- JavaScript vanilla (pas de framework type React/Vue)
- Données de test en dur dans `js/data.js`
- Backend prévu en Python / Flask (autre membre de l'équipe)

## Structure

```
.
├── index.html
├── parcelles.html
├── cultures.html
├── observations.html
├── alertes.html
├── css/
│   └── style.css
└── js/
    ├── data.js
    └── app.js
```

## Lancement local

```bash
python3 -m http.server 8000
```

Puis ouvrir <http://localhost:8000>.

## Fonctionnalités

- Tableau de bord avec 4 KPIs (parcelles, cultures, observations, alertes)
- Liste des dernières observations sur la page d'accueil
- Filtres dynamiques sur observations (état, parcelle), alertes (type, niveau), cultures (type)
- Codes couleurs cohérents pour les états et niveaux
- Échappement HTML systématique pour éviter les failles XSS
- Responsive mobile / tablette / desktop via Bootstrap

## Auteurs

- À compléter
