# Initialise la base : applique schema.sql puis importe les CSV
from pathlib import Path

import mysql.connector
from mysql.connector import Error

from db import db_config
from import_csv import main as import_main

SCHEMA = Path(__file__).resolve().parent / "schema.sql"


def apply_schema() -> None:
    # On se connecte sans choisir de base car schema.sql crée la base lui-même
    cfg = {k: v for k, v in db_config().items() if k != "database"}
    try:
        conn = mysql.connector.connect(**cfg)
    except Error as e:
        raise SystemExit(f"Connexion MySQL échouée : {e}")
    cur = conn.cursor()
    try:
        for stmt in SCHEMA.read_text(encoding="utf-8").split(";"):
            if stmt.strip():
                cur.execute(stmt)
        conn.commit()
    finally:
        cur.close()
        conn.close()
    print("Schéma appliqué.")


if __name__ == "__main__":
    apply_schema()
    import_main()
