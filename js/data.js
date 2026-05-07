let parcelles = [
    { id: 1,  nom: "Parcelle 1",  localisation: "Zone A", surface: 2.45, zone: "A", coords: [50.6292, 3.0573] },
    { id: 2,  nom: "Parcelle 2",  localisation: "Zone B", surface: 4.49, zone: "B", coords: [50.6916, 3.1745] },
    { id: 3,  nom: "Parcelle 3",  localisation: "Zone C", surface: 2.15, zone: "C", coords: [50.7235, 3.1610] },
    { id: 4,  nom: "Parcelle 4",  localisation: "Zone D", surface: 2.49, zone: "D", coords: [50.6196, 3.1379] },
    { id: 5,  nom: "Parcelle 5",  localisation: "Zone E", surface: 3.20, zone: "E", coords: [50.6997, 3.2167] },
    { id: 6,  nom: "Parcelle 6",  localisation: "Zone A", surface: 4.06, zone: "A", coords: [50.6667, 3.0917] },
    { id: 7,  nom: "Parcelle 7",  localisation: "Zone B", surface: 2.45, zone: "B", coords: [50.6783, 3.1503] },
    { id: 8,  nom: "Parcelle 8",  localisation: "Zone C", surface: 3.88, zone: "C", coords: [50.6347, 3.1097] },
    { id: 9,  nom: "Parcelle 9",  localisation: "Zone D", surface: 4.07, zone: "D", coords: [50.6517, 3.0244] },
    { id: 10, nom: "Parcelle 10", localisation: "Zone E", surface: 2.37, zone: "E", coords: [50.6589, 3.1900] }
];

const PARCELLE_COORDS = {
    1:  [50.6292, 3.0573],
    2:  [50.6916, 3.1745],
    3:  [50.7235, 3.1610],
    4:  [50.6196, 3.1379],
    5:  [50.6997, 3.2167],
    6:  [50.6667, 3.0917],
    7:  [50.6783, 3.1503],
    8:  [50.6347, 3.1097],
    9:  [50.6517, 3.0244],
    10: [50.6589, 3.1900]
};

let cultures = [
    { id: 1, type: "Blé",            date_semis: "2025-10-15", parcelle_id: 1 },
    { id: 2, type: "Maïs",           date_semis: "2026-04-12", parcelle_id: 2 },
    { id: 3, type: "Tournesol",      date_semis: "2026-04-20", parcelle_id: 3 },
    { id: 4, type: "Orge",           date_semis: "2025-10-22", parcelle_id: 4 },
    { id: 5, type: "Colza",          date_semis: "2025-08-30", parcelle_id: 5 },
    { id: 6, type: "Pomme de terre", date_semis: "2026-04-05", parcelle_id: 6 },
    { id: 7, type: "Maïs",           date_semis: "2026-04-18", parcelle_id: 7 },
    { id: 8, type: "Blé",            date_semis: "2025-10-28", parcelle_id: 8 }
];

let observations = [
    { date: "2026-05-04", parcelle_id: 1, etat: "OK",               commentaire: "Croissance régulière" },
    { date: "2026-05-03", parcelle_id: 3, etat: "Stress hydrique",  commentaire: "Sol sec en surface" },
    { date: "2026-05-02", parcelle_id: 2, etat: "OK",               commentaire: "Aspect sain" },
    { date: "2026-05-01", parcelle_id: 4, etat: "Risque maladie",   commentaire: "Humidité élevée" },
    { date: "2026-04-30", parcelle_id: 5, etat: "OK",               commentaire: "RAS" },
    { date: "2026-04-28", parcelle_id: 6, etat: "Maladie détectée", commentaire: "Mildiou identifié" },
    { date: "2026-04-26", parcelle_id: 3, etat: "Stress hydrique",  commentaire: "Plants fanés en milieu de journée" },
    { date: "2026-04-24", parcelle_id: 1, etat: "OK",               commentaire: "Bon développement" },
    { date: "2026-04-22", parcelle_id: 7, etat: "OK",               commentaire: "Levée homogène" },
    { date: "2026-04-20", parcelle_id: 8, etat: "Risque maladie",   commentaire: "Présence de taches sur feuilles" },
    { date: "2026-04-18", parcelle_id: 2, etat: "OK",               commentaire: "Feuillage vigoureux" },
    { date: "2026-04-15", parcelle_id: 5, etat: "Stress hydrique",  commentaire: "Manque d'eau visible" }
];

let alertes = [
    { date: "2026-05-04", type: "Stress hydrique", parcelle_id: 3, niveau: 2 },
    { date: "2026-05-03", type: "Risque maladie",  parcelle_id: 4, niveau: 1 },
    { date: "2026-04-29", type: "Stress hydrique", parcelle_id: 2, niveau: 1 },
    { date: "2026-04-28", type: "Risque maladie",  parcelle_id: 6, niveau: 2 },
    { date: "2026-04-25", type: "Stress hydrique", parcelle_id: 5, niveau: 1 },
    { date: "2026-04-22", type: "Risque maladie",  parcelle_id: 8, niveau: 1 },
    { date: "2026-04-20", type: "Stress hydrique", parcelle_id: 3, niveau: 2 }
];

let meteo = [
    { date: "2026-04-21", temperature: 12.4, humidite: 78, pluie_mm: 3.2 },
    { date: "2026-04-22", temperature: 13.1, humidite: 75, pluie_mm: 0.0 },
    { date: "2026-04-23", temperature: 14.8, humidite: 68, pluie_mm: 0.0 },
    { date: "2026-04-24", temperature: 15.2, humidite: 71, pluie_mm: 1.4 },
    { date: "2026-04-25", temperature: 13.6, humidite: 82, pluie_mm: 6.8 },
    { date: "2026-04-26", temperature: 12.9, humidite: 84, pluie_mm: 4.1 },
    { date: "2026-04-27", temperature: 14.4, humidite: 77, pluie_mm: 0.5 },
    { date: "2026-04-28", temperature: 16.2, humidite: 69, pluie_mm: 0.0 },
    { date: "2026-04-29", temperature: 17.8, humidite: 62, pluie_mm: 0.0 },
    { date: "2026-04-30", temperature: 18.3, humidite: 65, pluie_mm: 0.0 },
    { date: "2026-05-01", temperature: 16.7, humidite: 73, pluie_mm: 2.6 },
    { date: "2026-05-02", temperature: 15.4, humidite: 80, pluie_mm: 5.3 },
    { date: "2026-05-03", temperature: 17.1, humidite: 72, pluie_mm: 0.8 },
    { date: "2026-05-04", temperature: 18.9, humidite: 68, pluie_mm: 0.0 }
];

function getParcelleNom(id) {
    const p = parcelles.find(x => x.id === id);
    return p ? p.nom : "—";
}
