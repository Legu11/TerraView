// AgriData - données de test (en attendant le backend)

const parcelles = [
    { id: 1, nom: "La Grande Pâture",        localisation: "Lille",            surface: 12.5, zone: "Nord",  coords: [50.6292, 3.0573] },
    { id: 2, nom: "Le Champ du Moulin",      localisation: "Roubaix",          surface: 8.3,  zone: "Nord",  coords: [50.6916, 3.1745] },
    { id: 3, nom: "Les Terres Hautes",       localisation: "Tourcoing",        surface: 15.7, zone: "Nord",  coords: [50.7235, 3.1610] },
    { id: 4, nom: "Le Pré du Bois",          localisation: "Villeneuve-d'Ascq",surface: 9.2,  zone: "Est",   coords: [50.6196, 3.1379] },
    { id: 5, nom: "La Ferme du Vieux Chêne", localisation: "Wattrelos",        surface: 11.8, zone: "Est",   coords: [50.6997, 3.2167] },
    { id: 6, nom: "Le Verger Sud",           localisation: "Marcq-en-Barœul",  surface: 6.4,  zone: "Sud",   coords: [50.6667, 3.0917] },
    { id: 7, nom: "Les Champs de l'Est",     localisation: "Croix",            surface: 13.9, zone: "Est",   coords: [50.6783, 3.1503] },
    { id: 8, nom: "Le Pâturage Bas",         localisation: "Lambersart",       surface: 7.6,  zone: "Ouest", coords: [50.6517, 3.0244] }
];

const cultures = [
    { id: 1, type: "Blé",            date_semis: "2025-10-15", parcelle_id: 1 },
    { id: 2, type: "Maïs",           date_semis: "2026-04-12", parcelle_id: 2 },
    { id: 3, type: "Tournesol",      date_semis: "2026-04-20", parcelle_id: 3 },
    { id: 4, type: "Orge",           date_semis: "2025-10-22", parcelle_id: 4 },
    { id: 5, type: "Colza",          date_semis: "2025-08-30", parcelle_id: 5 },
    { id: 6, type: "Pomme de terre", date_semis: "2026-04-05", parcelle_id: 6 },
    { id: 7, type: "Maïs",           date_semis: "2026-04-18", parcelle_id: 7 },
    { id: 8, type: "Blé",            date_semis: "2025-10-28", parcelle_id: 8 }
];

const observations = [
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

const alertes = [
    { date: "2026-05-04", type: "Stress hydrique", parcelle_id: 3, niveau: 2 },
    { date: "2026-05-03", type: "Risque maladie",  parcelle_id: 4, niveau: 1 },
    { date: "2026-04-29", type: "Stress hydrique", parcelle_id: 2, niveau: 1 },
    { date: "2026-04-28", type: "Risque maladie",  parcelle_id: 6, niveau: 2 },
    { date: "2026-04-25", type: "Stress hydrique", parcelle_id: 5, niveau: 1 },
    { date: "2026-04-22", type: "Risque maladie",  parcelle_id: 8, niveau: 1 },
    { date: "2026-04-20", type: "Stress hydrique", parcelle_id: 3, niveau: 2 }
];

// Météo - 14 derniers jours
const meteo = [
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

// Helper : récupérer le nom d'une parcelle par son id
function getParcelleNom(id) {
    const p = parcelles.find(x => x.id === id);
    return p ? p.nom : "—";
}
