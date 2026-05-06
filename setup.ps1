# Script d'initialisation

$ErrorActionPreference = "Stop"

Write-Host "==> Vérification de Python."
python --version

Write-Host "`n==> Installation des dépendances."
pip install -r projet_etude_agriculture_arda_loevan_lyliane_benoit/database/requirements.txt

Write-Host "`n==> Création du schéma et import des CSV."
python projet_etude_agriculture_arda_loevan_lyliane_benoit/database/init_db.py

Write-Host "`nInstallation terminée." -ForegroundColor Green
Write-Host "Lance l'API avec : python projet_etude_agriculture_arda_loevan_lyliane_benoit/database/api.py"
