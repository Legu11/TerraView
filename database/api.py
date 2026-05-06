# API AgriData
from __future__ import annotations

import os
from datetime import date, datetime
from decimal import Decimal

from flask import Flask, jsonify
from flask_cors import CORS

from db import cursor

app = Flask(__name__)
CORS(app)


def serialize(v):
    if isinstance(v, (date, datetime)):
        return v.isoformat()
    if isinstance(v, Decimal):
        return float(v)
    return v


def fetch_all(sql: str) -> list[dict]:
    with cursor(dictionary=True) as (_, cur):
        cur.execute(sql)
        return [{k: serialize(v) for k, v in r.items()} for r in cur.fetchall()]


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/api/stats")
def stats():
    with cursor(dictionary=True) as (_, cur):
        result = {}
        for table in ("parcelles", "observations", "alertes"):
            cur.execute(f"SELECT COUNT(*) AS n FROM {table}")
            result[table] = cur.fetchone()["n"]
    return jsonify(result)


@app.get("/api/parcelles")
def parcelles():
    return jsonify(fetch_all("""
        SELECT id, nom, localisation, surface_ha AS surface
        FROM parcelles ORDER BY id
    """))


@app.get("/api/observations")
def observations():
    return jsonify(fetch_all("""
        SELECT o.date, p.nom AS parcelle, o.etat, o.commentaire
        FROM observations o JOIN parcelles p ON p.id = o.parcelle_id
        ORDER BY o.date DESC, o.id DESC
    """))


@app.get("/api/alertes")
def alertes():
    return jsonify(fetch_all("""
        SELECT a.date, a.type, p.nom AS parcelle, a.niveau
        FROM alertes a JOIN parcelles p ON p.id = a.parcelle_id
        ORDER BY a.date DESC, a.id DESC
    """))


@app.get("/api/cultures")
def cultures():
    return jsonify(fetch_all("""
        SELECT c.id, c.type, c.date_semis, p.nom AS parcelle
        FROM cultures c JOIN parcelles p ON p.id = c.parcelle_id
        ORDER BY c.id
    """))


@app.get("/api/meteo")
def meteo():
    return jsonify(fetch_all("""
        SELECT date, temperature, humidite, pluie_mm
        FROM meteo
        ORDER BY date DESC
        LIMIT 30
    """))


if __name__ == "__main__":
    app.run(host=os.getenv("API_HOST", "127.0.0.1"),
            port=int(os.getenv("API_PORT", "5000")))
