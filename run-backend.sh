#!/bin/bash
set -e

cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
    echo "Erreur : .venv pas trouvé. Lance ./setup.sh d'abord."
    exit 1
fi

source .venv/bin/activate

exec ./.venv/bin/python database/api.py
