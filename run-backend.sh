#!/bin/bash
# Lance l'API Flask en local (avec le venv et le .env)

set -e

cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
    echo "Erreur : .venv introuvable. Lance ./setup.sh d'abord."
    exit 1
fi

# Active le venv (pour que les sous-process trouvent les bons binaires).
# shellcheck disable=SC1091
source .venv/bin/activate

# .env est chargé automatiquement par db.py via python-dotenv.
# On utilise le python du venv explicitement pour être sûr (compatible
# avec les shells non-interactifs).
exec ./.venv/bin/python database/api.py
