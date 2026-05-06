// AgriData - script principal

'use strict';

// ===== Helpers ==============================================================

// Échappement HTML pour éviter les failles XSS lors de l'insertion en DOM
function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Format JJ/MM/AAAA
function formatDate(iso) {
    if (!iso) return '—';
    const parts = iso.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Format JJ/MM (court, pour les axes de graphiques)
function formatDateShort(iso) {
    if (!iso) return '';
    const parts = iso.split('-');
    return `${parts[2]}/${parts[1]}`;
}

// Renvoie le HTML d'un badge d'état
function badgeEtat(etat) {
    const map = {
        'OK': 'badge-ok',
        'Stress hydrique': 'badge-stress',
        'Risque maladie': 'badge-risque',
        'Maladie détectée': 'badge-maladie'
    };
    const cls = map[etat] || 'badge-ok';
    return `<span class="badge-state ${cls}">${escapeHtml(etat)}</span>`;
}

// Renvoie le HTML d'un badge de niveau d'alerte
function badgeNiveau(niveau) {
    const n = Number(niveau);
    const cls = n === 2 ? 'niveau-2' : 'niveau-1';
    return `<span class="badge-state ${cls}">Niveau ${n}</span>`;
}

// Lien cliquable vers la fiche détaillée d'une parcelle
function lienParcelle(id) {
    const nom = getParcelleNom(id);
    return `<a class="agri-link" href="parcelle-detail.html?id=${encodeURIComponent(id)}">${escapeHtml(nom)}</a>`;
}

// Récupère un paramètre dans l'URL
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// ===== Initialisation =======================================================

document.addEventListener('DOMContentLoaded', function () {

    // Met en évidence le lien actif dans la navbar
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(function (link) {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Délègue à la fonction qui correspond à la page courante
    if (document.getElementById('stats'))             renderDashboard();
    if (document.getElementById('parcelles-body'))    renderParcelles();
    if (document.getElementById('cultures-body'))     renderCultures();
    if (document.getElementById('observations-body')) renderObservations();
    if (document.getElementById('alertes-body'))      renderAlertes();
    if (document.getElementById('parcelle-detail'))   renderParcelleDetail();
});

// ===== Rendu : Tableau de bord =============================================

function renderDashboard() {
    const stats = document.getElementById('stats');
    stats.innerHTML = `
        <div class="col-6 col-md-3"><div class="stat-card"><div class="label">Parcelles</div><div class="value">${parcelles.length}</div><div class="hint">Total enregistrées</div></div></div>
        <div class="col-6 col-md-3"><div class="stat-card"><div class="label">Cultures</div><div class="value">${cultures.length}</div><div class="hint">En cours</div></div></div>
        <div class="col-6 col-md-3"><div class="stat-card warning"><div class="label">Observations</div><div class="value">${observations.length}</div><div class="hint">Relevés terrain</div></div></div>
        <div class="col-6 col-md-3"><div class="stat-card danger"><div class="label">Alertes</div><div class="value">${alertes.length}</div><div class="hint">À traiter</div></div></div>
    `;

    // Météo du jour
    const today = meteo[meteo.length - 1];
    const wNow = document.getElementById('weather-now');
    const wLabel = document.getElementById('weather-now-label');
    if (today && wNow) {
        wNow.innerHTML = `
            <span class="temp">${today.temperature.toFixed(1)} °C</span>
            <span class="meta">Humidité ${today.humidite} %</span>
            <span class="meta">Pluie ${today.pluie_mm.toFixed(1)} mm</span>
        `;
        if (wLabel) wLabel.textContent = formatDate(today.date);
    }

    // Graphique météo 7 derniers jours
    const canvas = document.getElementById('chart-weather');
    if (canvas && typeof Chart !== 'undefined') {
        const last7 = meteo.slice(-7);
        new Chart(canvas.getContext('2d'), {
            data: {
                labels: last7.map(r => formatDateShort(r.date)),
                datasets: [
                    { type: 'bar',  label: 'Pluie (mm)',       data: last7.map(r => r.pluie_mm),    backgroundColor: 'rgba(45,90,61,0.25)', borderColor: 'rgba(45,90,61,0.6)', yAxisID: 'y1', order: 3 },
                    { type: 'line', label: 'Température (°C)', data: last7.map(r => r.temperature), borderColor: '#c9a227', backgroundColor: 'rgba(201,162,39,0.15)', tension: 0.3, yAxisID: 'y',  order: 1 },
                    { type: 'line', label: 'Humidité (%)',    data: last7.map(r => r.humidite),    borderColor: '#2d5a3d', backgroundColor: 'rgba(45,90,61,0.15)',  tension: 0.3, yAxisID: 'y',  order: 2 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                scales: {
                    y:  { position: 'left',  title: { display: true, text: '°C / %' } },
                    y1: { position: 'right', beginAtZero: true, grid: { drawOnChartArea: false }, title: { display: true, text: 'mm' } }
                }
            }
        });
    }

    // Dernières observations (si présentes sur la page)
    const lastObs = document.getElementById('last-observations');
    if (lastObs) {
        const recent = observations.slice(0, 5);
        lastObs.innerHTML = recent.map(o => `
            <tr>
                <td>${formatDate(o.date)}</td>
                <td>${lienParcelle(o.parcelle_id)}</td>
                <td>${badgeEtat(o.etat)}</td>
            </tr>
        `).join('');
    }

    // 5 alertes les plus récentes
    const recentAl = document.getElementById('recent-alertes');
    if (recentAl) {
        const recent = alertes.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
        if (recent.length === 0) {
            recentAl.innerHTML = `<div class="empty-state">Aucune alerte récente.</div>`;
        } else {
            recentAl.innerHTML = `<div class="list-group list-group-flush">${recent.map(a => `
                <a href="parcelle-detail.html?id=${encodeURIComponent(a.parcelle_id)}"
                   class="list-group-item list-group-item-action d-flex justify-content-between align-items-start">
                    <div>
                        <div class="fw-semibold">${escapeHtml(a.type)}</div>
                        <div class="text-muted small">${escapeHtml(getParcelleNom(a.parcelle_id))} — ${formatDate(a.date)}</div>
                    </div>
                    ${badgeNiveau(a.niveau)}
                </a>
            `).join('')}</div>`;
        }
    }
}

// ===== Rendu : Parcelles ====================================================

function renderParcelles() {
    const tbody = document.getElementById('parcelles-body');
    tbody.innerHTML = parcelles.map(p => `
        <tr>
            <td>${lienParcelle(p.id)}</td>
            <td>${escapeHtml(p.localisation)}</td>
            <td>${escapeHtml(p.zone || '—')}</td>
            <td class="text-end">${p.surface.toFixed(1)} ha</td>
        </tr>
    `).join('');

    // Carte Leaflet
    const mapEl = document.getElementById('parcelles-map');
    if (mapEl && typeof L !== 'undefined') {
        const map = L.map(mapEl, { scrollWheelZoom: false }).setView([50.65, 3.10], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
            maxZoom: 18
        }).addTo(map);
        parcelles.forEach(p => {
            if (!p.coords) return;
            const marker = L.marker(p.coords).addTo(map);
            marker.bindPopup(
                `<strong>${escapeHtml(p.nom)}</strong><br>` +
                `${escapeHtml(p.localisation)} — ${p.surface.toFixed(1)} ha<br>` +
                `<a href="parcelle-detail.html?id=${encodeURIComponent(p.id)}">Voir le détail</a>`
            );
        });
    }
}

// ===== Rendu : Cultures =====================================================

function renderCultures() {
    const tbody = document.getElementById('cultures-body');
    const filterType = document.getElementById('filter-culture-type');

    if (filterType && filterType.options.length <= 1) {
        const types = [...new Set(cultures.map(c => c.type))].sort();
        types.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            filterType.appendChild(opt);
        });
    }

    function apply() {
        let rows = cultures.slice();
        const t = filterType ? filterType.value : '';
        if (t) rows = rows.filter(c => c.type === t);

        if (rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="empty-state">Aucune culture pour ce filtre.</td></tr>`;
            return;
        }
        tbody.innerHTML = rows.map(c => `
            <tr>
                <td>${escapeHtml(c.type)}</td>
                <td>${lienParcelle(c.parcelle_id)}</td>
                <td>${formatDate(c.date_semis)}</td>
            </tr>
        `).join('');
    }

    if (filterType) filterType.addEventListener('change', apply);
    apply();
}

// ===== Rendu : Observations =================================================

function renderObservations() {
    const tbody = document.getElementById('observations-body');
    const filterEtat = document.getElementById('filter-etat');
    const filterParcelle = document.getElementById('filter-parcelle');

    if (filterParcelle && filterParcelle.options.length <= 1) {
        parcelles.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.nom;
            filterParcelle.appendChild(opt);
        });
    }

    function apply() {
        let rows = observations.slice();
        const e = filterEtat ? filterEtat.value : '';
        const f = filterParcelle ? filterParcelle.value : '';
        if (e) rows = rows.filter(o => o.etat === e);
        if (f) rows = rows.filter(o => String(o.parcelle_id) === f);
        rows.sort((a, b) => b.date.localeCompare(a.date));

        if (rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Aucune observation pour ces filtres.</td></tr>`;
            return;
        }
        tbody.innerHTML = rows.map(o => `
            <tr>
                <td>${formatDate(o.date)}</td>
                <td>${lienParcelle(o.parcelle_id)}</td>
                <td>${badgeEtat(o.etat)}</td>
                <td>${escapeHtml(o.commentaire || '')}</td>
            </tr>
        `).join('');
    }

    if (filterEtat)     filterEtat.addEventListener('change', apply);
    if (filterParcelle) filterParcelle.addEventListener('change', apply);
    apply();
}

// ===== Rendu : Alertes ======================================================

function renderAlertes() {
    const tbody = document.getElementById('alertes-body');
    const filterType   = document.getElementById('filter-type');
    const filterNiveau = document.getElementById('filter-niveau');
    const kpisZone     = document.getElementById('alertes-kpis');

    function renderKpis(rows) {
        if (!kpisZone) return;
        const n1 = rows.filter(a => Number(a.niveau) === 1).length;
        const n2 = rows.filter(a => Number(a.niveau) === 2).length;
        const stress  = rows.filter(a => a.type === 'Stress hydrique').length;
        const maladie = rows.filter(a => a.type === 'Risque maladie').length;
        kpisZone.innerHTML = `
            <div class="col-6 col-md-3"><div class="stat-card"><div class="label">Total</div><div class="value">${rows.length}</div><div class="hint">alertes</div></div></div>
            <div class="col-6 col-md-3"><div class="stat-card warning"><div class="label">Niveau 1</div><div class="value">${n1}</div><div class="hint">vigilance</div></div></div>
            <div class="col-6 col-md-3"><div class="stat-card danger"><div class="label">Niveau 2</div><div class="value">${n2}</div><div class="hint">critique</div></div></div>
            <div class="col-6 col-md-3"><div class="stat-card"><div class="label">Répartition</div><div class="value" style="font-size:1rem;line-height:1.4">${stress} stress<br>${maladie} maladie</div><div class="hint">par type</div></div></div>
        `;
    }

    function apply() {
        let rows = alertes.slice();
        const t = filterType   ? filterType.value   : '';
        const n = filterNiveau ? filterNiveau.value : '';
        if (t) rows = rows.filter(a => a.type === t);
        if (n) rows = rows.filter(a => String(a.niveau) === n);
        rows.sort((a, b) => b.date.localeCompare(a.date));

        renderKpis(alertes);

        if (rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Aucune alerte avec ces filtres.</td></tr>`;
            return;
        }
        tbody.innerHTML = rows.map(a => {
            const rowCls = Number(a.niveau) === 2 ? 'row-risk-2' : 'row-risk-1';
            return `
                <tr class="${rowCls}">
                    <td>${formatDate(a.date)}</td>
                    <td>${escapeHtml(a.type)}</td>
                    <td>${lienParcelle(a.parcelle_id)}</td>
                    <td>${badgeNiveau(a.niveau)}</td>
                </tr>
            `;
        }).join('');
    }

    if (filterType)   filterType.addEventListener('change', apply);
    if (filterNiveau) filterNiveau.addEventListener('change', apply);
    apply();
}

// ===== Rendu : Détail d'une parcelle ========================================

function renderParcelleDetail() {
    const id = Number(getQueryParam('id'));
    const titleEl = document.getElementById('parcelle-title');
    const subtitleEl = document.getElementById('parcelle-subtitle');
    const contentEl = document.getElementById('parcelle-detail');

    if (!id) {
        contentEl.innerHTML = `<div class="empty-state">Paramètre id manquant dans l'URL.</div>`;
        return;
    }

    const parcelle = parcelles.find(p => p.id === id);
    if (!parcelle) {
        contentEl.innerHTML = `<div class="empty-state">Parcelle introuvable.</div>`;
        return;
    }

    if (titleEl) titleEl.textContent = parcelle.nom;
    if (subtitleEl) {
        subtitleEl.textContent = `${parcelle.localisation} — Zone ${parcelle.zone || '—'} — ${parcelle.surface.toFixed(1)} ha`;
    }

    const cult = cultures.filter(c => c.parcelle_id === id);
    const obs  = observations.filter(o => o.parcelle_id === id).sort((a, b) => b.date.localeCompare(a.date));
    const alt  = alertes.filter(a => a.parcelle_id === id).sort((a, b) => b.date.localeCompare(a.date));

    // KPIs
    const kpis = document.getElementById('parcelle-kpis');
    if (kpis) {
        kpis.innerHTML = `
            <div class="col-6 col-md-4"><div class="stat-card"><div class="label">Surface</div><div class="value">${parcelle.surface.toFixed(1)}</div><div class="hint">hectares</div></div></div>
            <div class="col-6 col-md-4"><div class="stat-card"><div class="label">Cultures</div><div class="value">${cult.length}</div><div class="hint">en cours</div></div></div>
            <div class="col-12 col-md-4"><div class="stat-card warning"><div class="label">Alertes</div><div class="value">${alt.length}</div><div class="hint">sur la parcelle</div></div></div>
        `;
    }

    // Cultures
    const cultZone = document.getElementById('parcelle-cultures');
    if (cultZone) {
        cultZone.innerHTML = cult.length === 0
            ? `<div class="empty-state">Aucune culture sur cette parcelle.</div>`
            : `<div class="table-responsive"><table class="table table-agri mb-0"><thead><tr><th>Type</th><th>Date de semis</th></tr></thead><tbody>${cult.map(c => `<tr><td>${escapeHtml(c.type)}</td><td>${formatDate(c.date_semis)}</td></tr>`).join('')}</tbody></table></div>`;
    }

    // Observations
    const obsZone = document.getElementById('parcelle-observations');
    if (obsZone) {
        obsZone.innerHTML = obs.length === 0
            ? `<div class="empty-state">Aucune observation pour cette parcelle.</div>`
            : `<div class="table-responsive"><table class="table table-agri mb-0"><thead><tr><th>Date</th><th>État</th><th>Commentaire</th></tr></thead><tbody>${obs.slice(0, 10).map(o => `<tr><td>${formatDate(o.date)}</td><td>${badgeEtat(o.etat)}</td><td>${escapeHtml(o.commentaire || '')}</td></tr>`).join('')}</tbody></table></div>`;
    }

    // Alertes
    const altZone = document.getElementById('parcelle-alertes');
    if (altZone) {
        altZone.innerHTML = alt.length === 0
            ? `<div class="empty-state">Aucune alerte sur cette parcelle.</div>`
            : `<div class="list-group list-group-flush">${alt.map(a => `<div class="list-group-item d-flex justify-content-between align-items-start"><div><div class="fw-semibold">${escapeHtml(a.type)}</div><div class="text-muted small">${formatDate(a.date)}</div></div>${badgeNiveau(a.niveau)}</div>`).join('')}</div>`;
    }

    // Graphique météo 14 derniers jours
    const canvas = document.getElementById('chart-meteo-detail');
    if (canvas && typeof Chart !== 'undefined') {
        const rows = meteo.slice(-14);
        new Chart(canvas.getContext('2d'), {
            data: {
                labels: rows.map(r => formatDateShort(r.date)),
                datasets: [
                    { type: 'bar',  label: 'Pluie (mm)',       data: rows.map(r => r.pluie_mm),    backgroundColor: 'rgba(45,90,61,0.25)', borderColor: 'rgba(45,90,61,0.6)', yAxisID: 'y1' },
                    { type: 'line', label: 'Température (°C)', data: rows.map(r => r.temperature), borderColor: '#c9a227', backgroundColor: 'rgba(201,162,39,0.15)', tension: 0.3, yAxisID: 'y' },
                    { type: 'line', label: 'Humidité (%)',    data: rows.map(r => r.humidite),    borderColor: '#2d5a3d', backgroundColor: 'rgba(45,90,61,0.15)',  tension: 0.3, yAxisID: 'y' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                scales: {
                    y:  { position: 'left',  title: { display: true, text: '°C / %' } },
                    y1: { position: 'right', beginAtZero: true, grid: { drawOnChartArea: false }, title: { display: true, text: 'mm' } }
                }
            }
        });
    }
}
