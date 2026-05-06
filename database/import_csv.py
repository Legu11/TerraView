# Importe les fichiers CSV du dossier data/ dans la base MySQL
from __future__ import annotations

import csv
from pathlib import Path

from db import cursor

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# Description de chaque table
TABLES = [
    {
        "name": "parcelles",
        "csv": "parcelles.csv",
        "columns": ["id", "nom", "localisation", "surface_ha"],
        "casts":   [int, str, str, float],
    },
    {
        "name": "cultures",
        "csv": "cultures.csv",
        "columns": ["id", "type", "date_semis", "parcelle_id"],
        "casts":   [int, str, str, int],
    },
    {
        "name": "meteo",
        "csv": "meteo.csv",
        "columns": ["date", "temperature", "humidite", "pluie_mm"],
        "casts":   [str, int, int, int],
    },
    {
        "name": "observations",
        "csv": "observations.csv",
        "columns": ["date", "etat", "parcelle_id", "commentaire"],
        "casts":   [str, str, int, str],
    },
    {
        "name": "alertes",
        "csv": "alertes.csv",
        "columns": ["date", "type", "parcelle_id", "niveau"],
        "casts":   [str, str, int, int],
    },
]


# Lit le CSV et met le bon type
def read_rows(csv_path: Path, columns: list[str], casts: list) -> list[tuple]:
    if not csv_path.exists():
        raise SystemExit(f"Fichier CSV introuvable : {csv_path}")
    rows: list[tuple] = []
    with csv_path.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for r in reader:
            # On saute les lignes vides
            if not any(r.values()):
                continue
            rows.append(tuple(cast(r[col]) for col, cast in zip(columns, casts)))
    return rows


# Met le contenu du CSV
def import_table(cur, table: dict) -> int:
    rows = read_rows(DATA_DIR / table["csv"], table["columns"], table["casts"])
    if not rows:
        return 0
    placeholders = ", ".join(["%s"] * len(table["columns"]))
    cols = ", ".join(f"`{c}`" for c in table["columns"])
    sql = f"INSERT INTO `{table['name']}` ({cols}) VALUES ({placeholders})"
    cur.executemany(sql, rows)
    return len(rows)


def main() -> None:
    with cursor() as (_, cur):
        # On vide les tables pour pas de doublons
        cur.execute("SET FOREIGN_KEY_CHECKS = 0")
        for table in TABLES:
            cur.execute(f"TRUNCATE TABLE `{table['name']}`")
        cur.execute("SET FOREIGN_KEY_CHECKS = 1")

        for table in TABLES:
            n = import_table(cur, table)
            print(f"  {table['name']:<14} {n:>4} lignes importées")
    print("Import terminé.")


if __name__ == "__main__":
    main()
