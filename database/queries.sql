USE agriculture;

-- 1. Liste des parcelles avec leur culture en cours
SELECT p.id, p.nom, p.localisation, p.surface_ha, c.type AS culture, c.date_semis
FROM parcelles p
LEFT JOIN cultures c ON c.parcelle_id = p.id
ORDER BY p.id;

-- 2. Nombre d'alertes par parcelle, classé du plus critique au moins critique
SELECT p.nom, p.localisation,
       COUNT(a.id)        AS nb_alertes,
       AVG(a.niveau)      AS niveau_moyen,
       MAX(a.niveau)      AS niveau_max
FROM parcelles p
LEFT JOIN alertes a ON a.parcelle_id = p.id
GROUP BY p.id, p.nom, p.localisation
ORDER BY nb_alertes DESC, niveau_moyen DESC;

-- 3. Répartition des alertes par type et par zone
SELECT p.localisation AS zone, a.type, COUNT(*) AS nb_alertes
FROM alertes a
JOIN parcelles p ON p.id = a.parcelle_id
GROUP BY p.localisation, a.type
ORDER BY zone, nb_alertes DESC;

-- 4. Météo moyenne par semaine
SELECT YEARWEEK(date, 1)            AS semaine,
       MIN(date)                    AS debut_semaine,
       ROUND(AVG(temperature), 1)   AS temp_moy,
       ROUND(AVG(humidite), 1)      AS humidite_moy,
       SUM(pluie_mm)                AS pluie_totale
FROM meteo
GROUP BY YEARWEEK(date, 1)
ORDER BY semaine;

-- 5. Jours secs (pluie nulle) et chauds (>= 25°C)
SELECT date, temperature, humidite, pluie_mm
FROM meteo
WHERE pluie_mm = 0 AND temperature >= 25
ORDER BY date;

-- 6. Parcelles ayant subi un stress hydrique pendant un jour sans pluie
SELECT o.date, p.nom, p.localisation, o.etat, m.temperature, m.pluie_mm
FROM observations o
JOIN parcelles p ON p.id = o.parcelle_id
JOIN meteo m     ON m.date = o.date
WHERE o.etat = 'Stress hydrique' AND m.pluie_mm = 0
ORDER BY o.date;

-- 7. Corrélation pluie / observation : pluie cumulée 3 jours avant chaque observation
SELECT o.date, p.nom, o.etat, o.commentaire,
       (SELECT COALESCE(SUM(m.pluie_mm), 0)
          FROM meteo m
         WHERE m.date BETWEEN DATE_SUB(o.date, INTERVAL 3 DAY) AND o.date
       ) AS pluie_3j
FROM observations o
JOIN parcelles p ON p.id = o.parcelle_id
ORDER BY o.date;

-- 8. Top 3 des cultures les plus touchées par des alertes
SELECT c.type AS culture, COUNT(a.id) AS nb_alertes, AVG(a.niveau) AS niveau_moyen
FROM cultures c
JOIN alertes a ON a.parcelle_id = c.parcelle_id
GROUP BY c.type
ORDER BY nb_alertes DESC, niveau_moyen DESC
LIMIT 3;

-- 9. État le plus fréquent par parcelle
SELECT parcelle_id, etat, nb
FROM (
    SELECT o.parcelle_id, o.etat, COUNT(*) AS nb,
           ROW_NUMBER() OVER (PARTITION BY o.parcelle_id ORDER BY COUNT(*) DESC) AS rang
    FROM observations o
    GROUP BY o.parcelle_id, o.etat
) t
WHERE rang = 1;

-- 10. Alertes critiques (niveau 3) avec contexte météo et culture
SELECT a.date, p.nom, p.localisation, c.type AS culture,
       a.type AS type_alerte, a.niveau,
       m.temperature, m.humidite, m.pluie_mm
FROM alertes a
JOIN parcelles p ON p.id = a.parcelle_id
LEFT JOIN cultures c ON c.parcelle_id = p.id
LEFT JOIN meteo m    ON m.date = a.date
WHERE a.niveau = 3
ORDER BY a.date;

-- 11. Évolution mensuelle du nombre d'alertes par type
SELECT DATE_FORMAT(date, '%Y-%m') AS mois, type, COUNT(*) AS nb
FROM alertes
GROUP BY mois, type
ORDER BY mois, type;

-- 12. Surface totale en alerte par zone (somme des surfaces des parcelles ayant >= 1 alerte)
SELECT p.localisation AS zone,
       COUNT(DISTINCT p.id)              AS nb_parcelles_en_alerte,
       SUM(p.surface_ha)                 AS surface_totale_ha
FROM parcelles p
WHERE EXISTS (SELECT 1 FROM alertes a WHERE a.parcelle_id = p.id)
GROUP BY p.localisation
ORDER BY surface_totale_ha DESC;
