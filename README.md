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
- `observations.html` - historique des relevés terrain
- `alertes.html` - alertes par parcelle avec niveau de gravité

## Stack actuelle

- HTML5 / CSS3
- JavaScript vanilla (pas de framework)
- Données de test en dur dans `js/data.js`
- Backend prévu en Python / Flask (autre membre de l'équipe)

## Structure

```
.
├── index.html
├── parcelles.html
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

## Auteurs

- À compléter
