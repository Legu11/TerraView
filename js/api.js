// AgriData - couche d'accès aux données (API REST ou mock)

'use strict';

// ====== Configuration =======================================================

// USE_MOCK = true  : utilise les tableaux définis dans data.js (sans backend)
// USE_MOCK = false : appelle l'API REST Flask sur API_URL
const USE_MOCK = false;
const API_URL  = 'http://127.0.0.1:5000/api';

// ====== Helpers HTTP ========================================================

async function http(path) {
    const res = await fetch(API_URL + path);
    if (!res.ok) throw new Error(`HTTP ${res.status} sur ${path}`);
    return res.json();
}

// ====== Chargement des données depuis le backend ============================
// Les variables globales `parcelles`, `cultures`, `observations`, `alertes`,
// `meteo` sont déclarées dans data.js (avec des données mock par défaut).
// Cette fonction les remplace par les données réelles si USE_MOCK = false.

async function loadData() {
    if (USE_MOCK) {
        console.log('AgriData : mode MOCK actif (data.js)');
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

        // Parcelles : on enrichit avec zone (depuis localisation) + coords GPS
        // car ces champs ne sont pas en BDD côté backend.
        parcelles = parc.map(p => ({
            id: p.id,
            nom: p.nom,
            localisation: p.localisation,
            surface: Number(p.surface),
            zone: deriveZone(p.localisation),
            coords: PARCELLE_COORDS[p.id] || null
        }));

        // Observations : le backend renvoie le NOM de parcelle dans `parcelle`.
        // On rejoint pour ajouter `parcelle_id` que le frontend utilise partout.
        observations = obs.map(o => ({
            date: o.date,
            etat: o.etat,
            commentaire: o.commentaire || '',
            parcelle_id: parcelleIdParNom(o.parcelle)
        }));

        // Alertes : même normalisation.
        alertes = alt.map(a => ({
            date: a.date,
            type: a.type,
            niveau: Number(a.niveau),
            parcelle_id: parcelleIdParNom(a.parcelle)
        }));

        // Cultures : jointure inverse aussi (backend renvoie le nom de parcelle).
        cultures = cult.map(c => ({
            id: c.id,
            type: c.type,
            date_semis: c.date_semis,
            parcelle_id: parcelleIdParNom(c.parcelle)
        }));

        // Météo : le backend renvoie en ordre DESC, le graphique veut ASC.
        meteo = met.slice().sort((a, b) => a.date.localeCompare(b.date)).map(m => ({
            date: m.date,
            temperature: Number(m.temperature),
            humidite: Number(m.humidite),
            pluie_mm: Number(m.pluie_mm)
        }));

        console.log(`AgriData : données chargées depuis l'API (${parcelles.length} parcelles, ${observations.length} obs, ${alertes.length} alertes, ${cultures.length} cultures, ${meteo.length} jours météo)`);
    } catch (err) {
        console.error('Erreur API, repli sur les données mock :', err);
        alert('⚠ Impossible de joindre le backend (' + API_URL + '). Vérifie que python database/api.py est lancé. Affichage des données de démonstration.');
    }
}

// ====== Helpers de jointure =================================================

// Récupère l'id d'une parcelle à partir de son nom (utile pour la jointure
// frontend après réception des observations/alertes côté API).
function parcelleIdParNom(nom) {
    const p = parcelles.find(x => x.nom === nom);
    return p ? p.id : null;
}

// Dérive une zone courte depuis "Zone A" → "A".
function deriveZone(localisation) {
    if (!localisation) return '—';
    const m = String(localisation).match(/Zone\s+([A-Z0-9]+)/i);
    return m ? m[1] : localisation;
}
