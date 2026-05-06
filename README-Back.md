# Backend AgriData

Base de données MySQL + API REST Flask pour le projet AgriData.

## À quoi ça sert

Ce backend centralise les données de l'exploitation (parcelles, cultures, observations terrain, alertes, météo) et les expose au frontend via une API REST. Il permet :

- de stocker les relevés terrain dans une base relationnelle propre
- d'analyser les données via des requêtes SQL prêtes à l'emploi (corrélations pluie/observations, alertes par zone, etc.)
- de fournir au frontend (HTML/JS) des données consolidées en JSON, sans qu'il ait à connaître la structure de la base

## Contenu du dossier `database/`

| Fichier            | Rôle                                                     |
|--------------------|----------------------------------------------------------|
| `schema.sql`       | Crée la base `agriculture` et les 5 tables               |
| `db.py`            | Helper de connexion MySQL (charge `.env` automatiquement)|
| `import_csv.py`    | Charge les CSV du dossier `data/` dans la base           |
| `init_db.py`       | Applique `schema.sql` + lance l'import                   |
| `queries.sql`      | 12 requêtes d'exploitation                               |
| `run_queries.py`   | Exécute les requêtes et affiche les résultats            |
| `api.py`           | API REST Flask                                           |
| `requirements.txt` | Dépendances Python                                       |

## Configuration

Les paramètres de connexion sont lus depuis un fichier `.env` à la racine du projet (chargé automatiquement par `python-dotenv`). Un modèle est fourni dans `.env.example` :

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=0000
DB_NAME=agriculture
API_HOST=127.0.0.1
API_PORT=5000
```

Le fichier `.env` est ignoré par Git (ne jamais le committer, il contient le mot de passe).

## Installation

### Sur Linux / macOS

```bash
./setup.sh
```

Ce script :
- crée un environnement virtuel `.venv`
- installe les dépendances Python
- crée le `.env` depuis `.env.example` si absent
- applique le schéma SQL et importe les CSV

### Sur Windows

```powershell
.\setup.ps1
```

## Lancement de l'API

### Linux / macOS

```bash
./run-backend.sh
```

(Le script active automatiquement le venv et lance Flask. Le `.env` est chargé par `db.py`.)

### Windows ou lancement manuel

```bash
# Activer le venv
source .venv/bin/activate    # Linux/macOS
.venv\Scripts\activate        # Windows

# Lancer l'API
python database/api.py
```

L'API démarre sur <http://127.0.0.1:5000>.

## Endpoints disponibles

| Méthode | URL                  | Description                                |
|---------|----------------------|--------------------------------------------|
| GET     | `/api/health`        | Test de vie                                |
| GET     | `/api/stats`         | Compteurs (parcelles, observations, alertes)|
| GET     | `/api/parcelles`     | Liste des parcelles                        |
| GET     | `/api/cultures`      | Liste des cultures (avec nom de parcelle)  |
| GET     | `/api/observations`  | Historique des observations                |
| GET     | `/api/alertes`       | Liste des alertes                          |
| GET     | `/api/meteo`         | 30 derniers jours de météo                 |

## Test rapide

```bash
curl http://127.0.0.1:5000/api/health
# {"status":"ok"}

curl http://127.0.0.1:5000/api/parcelles
# [{"id":1,"nom":"Parcelle 1","localisation":"Zone A","surface":2.45}, ...]
```

## Réinitialiser la base

```bash
source .venv/bin/activate
python database/init_db.py
```

Tronque toutes les tables et réimporte les CSV depuis `data/`.
