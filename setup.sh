#!/bin/bash
# Script d'initialisation pour Linux / macOS
# (équivalent du setup.ps1 pour Windows)

set -e

cd "$(dirname "$0")"

echo "==> Vérification de Python..."
python3 --version

echo ""
echo "==> Création de l'environnement virtuel (.venv)..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo "    Environnement virtuel créé."
else
    echo "    Environnement virtuel déjà présent."
fi
source .venv/bin/activate

echo ""
echo "==> Installation des dépendances Python..."
pip install --quiet --upgrade pip
pip install -r database/requirements.txt

echo ""
echo "==> Vérification du fichier .env..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "    Fichier .env créé depuis .env.example."
    echo "    Adapte le mot de passe MySQL si besoin."
else
    echo "    Fichier .env déjà présent."
fi

echo ""
echo "==> Création du schéma et import des CSV..."
python database/init_db.py

echo ""
echo "Installation terminée."
echo "Lance l'API avec : ./run-backend.sh"
