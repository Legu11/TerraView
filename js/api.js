'use strict';

const USE_MOCK = false;
const API_URL  = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:5000/api'
    : '/api';

async function http(path) {
    const res = await fetch(API_URL + path);
    if (!res.ok) throw new Error(`HTTP ${res.status} sur ${path}`);
    return res.json();
}

async function loadData() {
    if (USE_MOCK) {
        console.log('Terraview : mode mock');
        return;
    }
    try {
        const [parc, obs, alt, cult, met] = await Promise.all([
            http('/parcelles'),
            http('/observations'),
            http('/alertes'),
            http('/cultures'),
            http('/meteo')
        ]);

        parcelles = parc.map(p => ({
            id: p.id,
            nom: p.nom,
            localisation: p.localisation,
            surface: Number(p.surface),
            zone: deriveZone(p.localisation),
            coords: PARCELLE_COORDS[p.id] || null
        }));

        observations = obs.map(o => ({
            date: o.date,
            etat: o.etat,
            commentaire: o.commentaire || '',
            parcelle_id: parcelleIdParNom(o.parcelle)
        }));

        alertes = alt.map(a => ({
            date: a.date,
            type: a.type,
            niveau: Number(a.niveau),
            parcelle_id: parcelleIdParNom(a.parcelle)
        }));

        cultures = cult.map(c => ({
            id: c.id,
            type: c.type,
            date_semis: c.date_semis,
            parcelle_id: parcelleIdParNom(c.parcelle)
        }));

        meteo = met.slice().sort((a, b) => a.date.localeCompare(b.date)).map(m => ({
            date: m.date,
            temperature: Number(m.temperature),
            humidite: Number(m.humidite),
            pluie_mm: Number(m.pluie_mm)
        }));

        console.log(`Terraview : données chargées depuis l'API (${parcelles.length} parcelles, ${observations.length} obs, ${alertes.length} alertes, ${cultures.length} cultures, ${meteo.length} jours météo)`);
    } catch (err) {
        console.error('Erreur API, on garde les mocks :', err);
        alert('Impossible de joindre le backend (' + API_URL + '). Vérifie que python database/api.py est lancé. Affichage des données de démo.');
    }
}

function parcelleIdParNom(nom) {
    const p = parcelles.find(x => x.nom === nom);
    return p ? p.id : null;
}

function deriveZone(localisation) {
    if (!localisation) return '—';
    const m = String(localisation).match(/Zone\s+([A-Z0-9]+)/i);
    return m ? m[1] : localisation;
}
