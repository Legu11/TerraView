from __future__ import annotations

import os
from datetime import date, datetime
from decimal import Decimal

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

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
        SELECT o.id, o.date, p.nom AS parcelle, o.etat, o.commentaire
        FROM observations o JOIN parcelles p ON p.id = o.parcelle_id
        ORDER BY o.date DESC, o.id DESC
    """))

@app.get("/api/alertes")
def alertes():
    return jsonify(fetch_all("""
        SELECT a.id, a.date, a.type, p.nom AS parcelle, a.niveau
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

@app.post("/api/parcelles")
def parcelles_create():
    d = request.get_json(silent=True) or {}
    nom = (d.get("nom") or "").strip()
    loc = (d.get("localisation") or "").strip()
    surface = d.get("surface_ha")

    if not nom or not loc or surface is None:
        return jsonify({"error": "nom, localisation et surface requis"}), 400
    try:
        surface = float(surface)
    except (TypeError, ValueError):
        return jsonify({"error": "surface invalide"}), 400
    if surface <= 0:
        return jsonify({"error": "surface doit être > 0"}), 400

    with cursor() as (_, cur):

        cur.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM parcelles")
        new_id = cur.fetchone()[0]
        cur.execute(
            "INSERT INTO parcelles (id, nom, localisation, surface_ha) VALUES (%s, %s, %s, %s)",
            (new_id, nom, loc, surface)
        )

    return jsonify({"id": new_id, "nom": nom, "localisation": loc, "surface": surface}), 201

@app.put("/api/parcelles/<int:pid>")
def parcelles_update(pid):
    d = request.get_json(silent=True) or {}
    nom = (d.get("nom") or "").strip()
    loc = (d.get("localisation") or "").strip()
    surface = d.get("surface_ha")

    if not nom or not loc or surface is None:
        return jsonify({"error": "nom, localisation et surface requis"}), 400
    try:
        surface = float(surface)
    except (TypeError, ValueError):
        return jsonify({"error": "surface invalide"}), 400

    with cursor() as (_, cur):
        cur.execute(
            "UPDATE parcelles SET nom=%s, localisation=%s, surface_ha=%s WHERE id=%s",
            (nom, loc, surface, pid)
        )
        if cur.rowcount == 0:
            return jsonify({"error": "parcelle introuvable"}), 404

    return jsonify({"id": pid, "nom": nom, "localisation": loc, "surface": surface})

@app.delete("/api/parcelles/<int:pid>")
def parcelles_delete(pid):
    with cursor() as (_, cur):
        cur.execute("DELETE FROM parcelles WHERE id=%s", (pid,))
        if cur.rowcount == 0:
            return jsonify({"error": "parcelle introuvable"}), 404
    return ("", 204)

@app.post("/api/cultures")
def cultures_create():
    d = request.get_json(silent=True) or {}
    type_culture = (d.get("type") or "").strip()
    date_semis = (d.get("date_semis") or "").strip()
    parcelle_id = d.get("parcelle_id")

    if not type_culture or not date_semis or not parcelle_id:
        return jsonify({"error": "type, date_semis et parcelle_id requis"}), 400

    with cursor() as (_, cur):
        cur.execute("SELECT id FROM parcelles WHERE id=%s", (parcelle_id,))
        if not cur.fetchone():
            return jsonify({"error": "parcelle inconnue"}), 400
        cur.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM cultures")
        new_id = cur.fetchone()[0]
        cur.execute(
            "INSERT INTO cultures (id, type, date_semis, parcelle_id) VALUES (%s, %s, %s, %s)",
            (new_id, type_culture, date_semis, parcelle_id)
        )

    return jsonify({"id": new_id, "type": type_culture, "date_semis": date_semis,
                    "parcelle_id": parcelle_id}), 201

@app.delete("/api/cultures/<int:cid>")
def cultures_delete(cid):
    with cursor() as (_, cur):
        cur.execute("DELETE FROM cultures WHERE id=%s", (cid,))
        if cur.rowcount == 0:
            return jsonify({"error": "culture introuvable"}), 404
    return ("", 204)

@app.post("/api/observations")
def observations_create():
    d = request.get_json(silent=True) or {}
    date_obs = (d.get("date") or "").strip()
    etat = (d.get("etat") or "").strip()
    parcelle_id = d.get("parcelle_id")
    commentaire = (d.get("commentaire") or "").strip() or None

    etats_valides = {"OK", "Stress hydrique", "Risque maladie", "Maladie détectée"}
    if not date_obs or etat not in etats_valides or not parcelle_id:
        return jsonify({"error": "date, etat (valide) et parcelle_id requis"}), 400

    with cursor() as (_, cur):
        cur.execute("SELECT id FROM parcelles WHERE id=%s", (parcelle_id,))
        if not cur.fetchone():
            return jsonify({"error": "parcelle inconnue"}), 400
        cur.execute(
            "INSERT INTO observations (date, etat, parcelle_id, commentaire) VALUES (%s, %s, %s, %s)",
            (date_obs, etat, parcelle_id, commentaire)
        )
        new_id = cur.lastrowid

    return jsonify({"id": new_id, "date": date_obs, "etat": etat,
                    "parcelle_id": parcelle_id, "commentaire": commentaire}), 201

@app.post("/api/alertes/analyser")
def alertes_analyser():
    today = date.today().isoformat()
    creees = 0
    details = []

    with cursor(dictionary=True) as (_, cur):

        cur.execute("""
            SELECT date, temperature, humidite, pluie_mm
            FROM meteo
            ORDER BY date DESC
            LIMIT 14
        """)
        meteo_rows = cur.fetchall()

        if len(meteo_rows) < 7:
            return jsonify({"error": "pas assez de données météo (min 7 jours)"}), 400

        last7 = meteo_rows[:7]
        last14 = meteo_rows[:14]

        pluie_7j = sum(float(r["pluie_mm"]) for r in last7)
        temp_moy_7j = sum(float(r["temperature"]) for r in last7) / 7
        hum_moy_7j = sum(float(r["humidite"]) for r in last7) / 7
        jours_pluie_signif_14j = sum(1 for r in last14 if float(r["pluie_mm"]) > 2)

        cur.execute("""
            SELECT p.id, p.nom, c.type AS culture_type
            FROM parcelles p
            JOIN cultures c ON c.parcelle_id = p.id
        """)
        parcelles_avec_culture = cur.fetchall()

        cultures_sensibles = {"Maïs", "Tournesol"}

        for p in parcelles_avec_culture:
            pid = p["id"]

            if pluie_7j < 15 and temp_moy_7j > 18:
                if _ajouter_si_pas_doublon(cur, today, "Stress hydrique", pid, niveau=2):
                    creees += 1
                    details.append(f"Stress hydrique sur {p['nom']}")

            if hum_moy_7j > 70 and 14 <= temp_moy_7j <= 22:
                if _ajouter_si_pas_doublon(cur, today, "Risque maladie", pid, niveau=1):
                    creees += 1
                    details.append(f"Risque maladie sur {p['nom']}")

            if jours_pluie_signif_14j == 0 and p["culture_type"] in cultures_sensibles:
                if _ajouter_si_pas_doublon(cur, today, "Stress hydrique", pid, niveau=3):
                    creees += 1
                    details.append(f"Sécheresse prolongée sur {p['nom']} ({p['culture_type']})")

    return jsonify({
        "alertes_creees": creees,
        "details": details,
        "indicateurs": {
            "pluie_7j_mm": round(pluie_7j, 1),
            "temp_moy_7j": round(temp_moy_7j, 1),
            "humidite_moy_7j": round(hum_moy_7j, 1),
            "jours_pluie_signif_14j": jours_pluie_signif_14j
        }
    })

def _ajouter_si_pas_doublon(cur, date_alerte, type_alerte, parcelle_id, niveau):
    """Insère une alerte sauf si la même existe déjà aujourd'hui.
    Retourne True si insérée, False sinon."""
    cur.execute(
        "SELECT id FROM alertes WHERE date=%s AND type=%s AND parcelle_id=%s",
        (date_alerte, type_alerte, parcelle_id)
    )
    if cur.fetchone():
        return False
    cur.execute(
        "INSERT INTO alertes (date, type, parcelle_id, niveau) VALUES (%s, %s, %s, %s)",
        (date_alerte, type_alerte, parcelle_id, niveau)
    )
    return True

@app.post("/api/auth/register")
def auth_register():
    data = request.get_json(silent=True) or {}
    nom = (data.get("nom") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not nom or not email or not password:
        return jsonify({"error": "Nom, email et mot de passe requis"}), 400
    if len(password) < 6:
        return jsonify({"error": "Mot de passe trop court (6 caractères min)"}), 400
    if "@" not in email:
        return jsonify({"error": "Email invalide"}), 400

    with cursor(dictionary=True) as (_, cur):
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({"error": "Cet email est déjà utilisé"}), 409

        cur.execute(
            "INSERT INTO users (nom, email, password_hash) VALUES (%s, %s, %s)",
            (nom, email, generate_password_hash(password))
        )
        user_id = cur.lastrowid

    return jsonify({"user": {"id": user_id, "nom": nom, "email": email}}), 201

@app.post("/api/auth/login")
def auth_login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email et mot de passe requis"}), 400

    with cursor(dictionary=True) as (_, cur):
        cur.execute(
            "SELECT id, nom, email, password_hash FROM users WHERE email = %s",
            (email,)
        )
        row = cur.fetchone()

    if not row or not check_password_hash(row["password_hash"], password):
        return jsonify({"error": "Email ou mot de passe incorrect"}), 401

    return jsonify({"user": {"id": row["id"], "nom": row["nom"], "email": row["email"]}})

if __name__ == "__main__":
    app.run(host=os.getenv("API_HOST", "127.0.0.1"),
            port=int(os.getenv("API_PORT", "5000")))
