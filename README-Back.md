# AgriData - Back

L'API REST en Flask + base MySQL pour le projet AgriData.

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
.\setup.ps1
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
curl http://127.0.0.1:5000/api/parcelles
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
