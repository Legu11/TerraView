// AgriData - données de test (en attendant le backend)

const parcelles = [
    { id: 1, nom: "La Grande Pâture",        localisation: "Lille",            surface: 12.5 },
    { id: 2, nom: "Le Champ du Moulin",      localisation: "Roubaix",          surface: 8.3  },
    { id: 3, nom: "Les Terres Hautes",       localisation: "Tourcoing",        surface: 15.7 },
    { id: 4, nom: "Le Pré du Bois",          localisation: "Villeneuve-d'Ascq",surface: 9.2  },
    { id: 5, nom: "La Ferme du Vieux Chêne", localisation: "Wattrelos",        surface: 11.8 },
    { id: 6, nom: "Le Verger Sud",           localisation: "Marcq-en-Barœul",  surface: 6.4  }
];

const observations = [
    { date: "2026-05-04", parcelle: "La Grande Pâture",       etat: "OK",               commentaire: "Croissance régulière" },
    { date: "2026-05-03", parcelle: "Les Terres Hautes",      etat: "Stress hydrique",  commentaire: "Sol sec en surface" },
    { date: "2026-05-02", parcelle: "Le Champ du Moulin",     etat: "OK",               commentaire: "Aspect sain" },
    { date: "2026-05-01", parcelle: "Le Pré du Bois",         etat: "Risque maladie",   commentaire: "Humidité élevée" },
    { date: "2026-04-30", parcelle: "La Ferme du Vieux Chêne",etat: "OK",               commentaire: "RAS" },
    { date: "2026-04-28", parcelle: "Le Verger Sud",          etat: "Maladie détectée", commentaire: "Mildiou identifié" },
    { date: "2026-04-26", parcelle: "Les Terres Hautes",      etat: "Stress hydrique",  commentaire: "Plants fanés en milieu de journée" },
    { date: "2026-04-24", parcelle: "La Grande Pâture",       etat: "OK",               commentaire: "Bon développement" }
];

const alertes = [
    { date: "2026-05-04", type: "Stress hydrique", parcelle: "Les Terres Hautes",       niveau: 2 },
    { date: "2026-05-03", type: "Risque maladie", parcelle: "Le Pré du Bois",           niveau: 1 },
    { date: "2026-04-29", type: "Stress hydrique", parcelle: "Le Champ du Moulin",      niveau: 1 },
    { date: "2026-04-28", type: "Risque maladie", parcelle: "Le Verger Sud",            niveau: 2 },
    { date: "2026-04-25", type: "Stress hydrique", parcelle: "La Ferme du Vieux Chêne", niveau: 1 }
];
