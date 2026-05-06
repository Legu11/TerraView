# Connexion MySQL
from __future__ import annotations

import os
from contextlib import contextmanager

import mysql.connector
from mysql.connector import Error


def db_config() -> dict:
    return {
        "host":     os.getenv("DB_HOST", "localhost"),
        "port":     int(os.getenv("DB_PORT", "3306")),
        "user":     os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", ""),
        "database": os.getenv("DB_NAME", "agriculture"),
    }


# Curseur prêt à l'emploi : commit auto, rollback en cas d'erreur, fermeture garantie
@contextmanager
def cursor(dictionary: bool = False):
    try:
        conn = mysql.connector.connect(**db_config())
    except Error as e:
        raise SystemExit(f"Connexion MySQL échouée : {e}")
    cur = conn.cursor(dictionary=dictionary)
    try:
        yield conn, cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()
