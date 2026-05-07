#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "==> Python"
python3 --version

echo ""
echo "==> venv (.venv)"
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo "    venv créé"
else
    echo "    déjà présent"
fi
source .venv/bin/activate

echo ""
echo "==> install des dépendances"
pip install --quiet --upgrade pip
pip install -r database/requirements.txt

echo ""
echo "==> .env"
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "    .env créé (à adapter si besoin)"
else
    echo "    déjà présent"
fi

echo ""
echo "==> import des CSV en base"
python database/init_db.py

echo ""
echo "Fini. Lance l'API avec ./run-backend.sh"
