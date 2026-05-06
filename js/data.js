// AgriData - données de test (en attendant le backend)

const parcelles = [
    { id: 1, nom: "La Grande Pâture",        localisation: "Lille",            surface: 12.5, zone: "Nord"  },
    { id: 2, nom: "Le Champ du Moulin",      localisation: "Roubaix",          surface: 8.3,  zone: "Nord"  },
    { id: 3, nom: "Les Terres Hautes",       localisation: "Tourcoing",        surface: 15.7, zone: "Nord"  },
    { id: 4, nom: "Le Pré du Bois",          localisation: "Villeneuve-d'Ascq",surface: 9.2,  zone: "Est"   },
    { id: 5, nom: "La Ferme du Vieux Chêne", localisation: "Wattrelos",        surface: 11.8, zone: "Est"   },
    { id: 6, nom: "Le Verger Sud",           localisation: "Marcq-en-Barœul",  surface: 6.4,  zone: "Sud"   },
    { id: 7, nom: "Les Champs de l'Est",     localisation: "Croix",            surface: 13.9, zone: "Est"   },
    { id: 8, nom: "Le Pâturage Bas",         localisation: "Lambersart",       surface: 7.6,  zone: "Ouest" }
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

// Helper : récupérer le nom d'une parcelle par son id
function getParcelleNom(id) {
    const p = parcelles.find(x => x.id === id);
    return p ? p.nom : "—";
}
