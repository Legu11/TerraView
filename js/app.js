// AgriData - script principal

'use strict';

// ===== Helpers ==============================================================

function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatDate(iso) {
    if (!iso) return '—';
    const parts = iso.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatDateShort(iso) {
    if (!iso) return '';
    const parts = iso.split('-');
    return `${parts[2]}/${parts[1]}`;
}

function tagEtat(etat) {
    const map = {
        'OK': 'tag-ok',
        'Stress hydrique': 'tag-stress',
        'Risque maladie': 'tag-risque',
        'Maladie détectée': 'tag-maladie'
    };
    const cls = map[etat] || 'tag-ok';
    return `<span class="tag ${cls}">${escapeHtml(etat)}</span>`;
}

function tagNiveau(niveau) {
    const n = Number(niveau);
    const cls = n === 2 ? 'tag-niveau-2' : 'tag-niveau-1';
    return `<span class="tag ${cls}">Niveau ${n}</span>`;
}

function lienParcelle(id) {
    return `<a class="lk" href="parcelle-detail.html?id=${encodeURIComponent(id)}">${escapeHtml(getParcelleNom(id))}</a>`;
}

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

// ===== Initialisation =======================================================

document.addEventListener('DOMContentLoaded', async function () {

    // Lien actif dans la sidebar
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sidebar nav a').forEach(function (link) {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Cas spécial : sur parcelle-detail, on garde "Parcelles" actif
    if (currentPage === 'parcelle-detail.html') {
        const parcellesLink = document.querySelector('.sidebar nav a[href="parcelles.html"]');
        if (parcellesLink) parcellesLink.classList.add('active');
    }

    // Chargement des données (API ou mock)
    if (typeof loadData === 'function') {
        await loadData();
    }

    // Délégation par page
    if (document.getElementById('stats'))             renderDashboard();
    if (document.getElementById('parcelles-body'))    renderParcelles();
    if (document.getElementById('cultures-body'))     renderCultures();
    if (document.getElementById('observations-body')) renderObservations();
    if (document.getElementById('alertes-body'))      renderAlertes();
    if (document.getElementById('parcelle-detail'))   renderParcelleDetail();
});

// ===== Tableau de bord ======================================================

function renderDashboard() {
    const stats = document.getElementById('stats');
    stats.innerHTML = `
        <div class="kpi"><div class="label">Parcelles</div><div class="value">${parcelles.length}</div><div class="hint">Total enregistrées</div></div>
        <div class="kpi"><div class="label">Cultures</div><div class="value">${cultures.length}</div><div class="hint">En cours</div></div>
        <div class="kpi warn"><div class="label">Observations</div><div class="value">${observations.length}</div><div class="hint">Relevés terrain</div></div>
        <div class="kpi alert"><div class="label">Alertes</div><div class="value">${alertes.length}</div><div class="hint">À traiter</div></div>
    `;

    // Météo du jour
    const today = meteo[meteo.length - 1];
    const wNow = document.getElementById('weather-now');
    if (today && wNow) {
        wNow.innerHTML = `
            <span class="temp">${today.temperature.toFixed(1)}<small>°C</small></span>
            <span class="meta"><b>${today.humidite}%</b>humidité</span>
            <span class="meta"><b>${today.pluie_mm.toFixed(1)} mm</b>pluie</span>
            <span class="label-date">${formatDate(today.date)}</span>
        `;
    }

    // Graphique 7 derniers jours
    const canvas = document.getElementById('chart-weather');
    if (canvas && typeof Chart !== 'undefined') {
        const last7 = meteo.slice(-7);
        new Chart(canvas.getContext('2d'), {
            data: {
                labels: last7.map(r => formatDateShort(r.date)),
                datasets: [
                    { type: 'bar',  label: 'Pluie (mm)',       data: last7.map(r => r.pluie_mm),    backgroundColor: 'rgba(26,31,46,0.12)', borderColor: 'rgba(26,31,46,0.4)', yAxisID: 'y1', order: 3 },
                    { type: 'line', label: 'Température (°C)', data: last7.map(r => r.temperature), borderColor: '#b85c2c', backgroundColor: 'rgba(184,92,44,0.12)', tension: 0.3, yAxisID: 'y',  order: 1, borderWidth: 2 },
                    { type: 'line', label: 'Humidité (%)',     data: last7.map(r => r.humidite),    borderColor: '#1a1f2e', backgroundColor: 'rgba(26,31,46,0.06)',  tension: 0.3, yAxisID: 'y',  order: 2, borderWidth: 2, borderDash: [4, 4] }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: { legend: { labels: { font: { family: 'system-ui', size: 11 } } } },
                scales: {
                    y:  { position: 'left',  title: { display: true, text: '°C / %' } },
                    y1: { position: 'right', beginAtZero: true, grid: { drawOnChartArea: false }, title: { display: true, text: 'mm' } }
                }
            }
        });
    }

    // 5 dernières observations
    const lastObs = document.getElementById('last-observations');
    if (lastObs) {
        const recent = observations.slice(0, 5);
        lastObs.innerHTML = recent.map(o => `
            <tr>
                <td>${formatDate(o.date)}</td>
                <td>${lienParcelle(o.parcelle_id)}</td>
                <td>${tagEtat(o.etat)}</td>
            </tr>
        `).join('');
    }

    // 5 alertes les plus récentes
    const recentAl = document.getElementById('recent-alertes');
    if (recentAl) {
        const recent = alertes.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
        if (recent.length === 0) {
            recentAl.innerHTML = `<div class="empty">Aucune alerte récente.</div>`;
        } else {
            recentAl.innerHTML = `<ul class="alert-list">${recent.map(a => `
                <li>
                    <a href="parcelle-detail.html?id=${encodeURIComponent(a.parcelle_id)}">
                        <div>
                            <div class="what">${escapeHtml(a.type)}</div>
                            <div class="where">${escapeHtml(getParcelleNom(a.parcelle_id))} — ${formatDate(a.date)}</div>
                        </div>
                        ${tagNiveau(a.niveau)}
                    </a>
                </li>
            `).join('')}</ul>`;
        }
    }
}

// ===== Parcelles ============================================================

function renderParcelles() {
    const tbody = document.getElementById('parcelles-body');
    tbody.innerHTML = parcelles.map(p => `
        <tr>
            <td>${lienParcelle(p.id)}</td>
            <td>${escapeHtml(p.localisation)}</td>
            <td>${escapeHtml(p.zone || '—')}</td>
            <td class="num">${p.surface.toFixed(1)} ha</td>
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

// ===== Cultures =============================================================

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
            tbody.innerHTML = `<tr><td colspan="3" class="empty">Aucune culture pour ce filtre.</td></tr>`;
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

// ===== Observations =========================================================

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
            tbody.innerHTML = `<tr><td colspan="4" class="empty">Aucune observation pour ces filtres.</td></tr>`;
            return;
        }
        tbody.innerHTML = rows.map(o => `
            <tr>
                <td>${formatDate(o.date)}</td>
                <td>${lienParcelle(o.parcelle_id)}</td>
                <td>${tagEtat(o.etat)}</td>
                <td>${escapeHtml(o.commentaire || '')}</td>
            </tr>
        `).join('');
    }

    if (filterEtat)     filterEtat.addEventListener('change', apply);
    if (filterParcelle) filterParcelle.addEventListener('change', apply);
    apply();
}

// ===== Alertes ==============================================================

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
            <div class="kpi"><div class="label">Total</div><div class="value">${rows.length}</div><div class="hint">alertes</div></div>
            <div class="kpi warn"><div class="label">Niveau 1</div><div class="value">${n1}</div><div class="hint">vigilance</div></div>
            <div class="kpi alert"><div class="label">Niveau 2</div><div class="value">${n2}</div><div class="hint">critique</div></div>
            <div class="kpi"><div class="label">Stress / Maladie</div><div class="value">${stress} / ${maladie}</div><div class="hint">par type</div></div>
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
            tbody.innerHTML = `<tr><td colspan="4" class="empty">Aucune alerte avec ces filtres.</td></tr>`;
            return;
        }
        tbody.innerHTML = rows.map(a => `
            <tr>
                <td>${formatDate(a.date)}</td>
                <td>${escapeHtml(a.type)}</td>
                <td>${lienParcelle(a.parcelle_id)}</td>
                <td>${tagNiveau(a.niveau)}</td>
            </tr>
        `).join('');
    }

    if (filterType)   filterType.addEventListener('change', apply);
    if (filterNiveau) filterNiveau.addEventListener('change', apply);
    apply();
}

// ===== Détail d'une parcelle ================================================

function renderParcelleDetail() {
    const id = Number(getQueryParam('id'));
    const titleEl    = document.getElementById('parcelle-title');
    const subtitleEl = document.getElementById('parcelle-subtitle');
    const contentEl  = document.getElementById('parcelle-detail');

    if (!id) {
        contentEl.innerHTML = `<div class="empty">Paramètre id manquant dans l'URL.</div>`;
        return;
    }

    const parcelle = parcelles.find(p => p.id === id);
    if (!parcelle) {
        contentEl.innerHTML = `<div class="empty">Parcelle introuvable.</div>`;
        return;
    }

    if (titleEl)    titleEl.textContent    = parcelle.nom;
    if (subtitleEl) subtitleEl.textContent = `${parcelle.localisation} — Zone ${parcelle.zone || '—'} — ${parcelle.surface.toFixed(1)} ha`;

    const cult = cultures.filter(c => c.parcelle_id === id);
    const obs  = observations.filter(o => o.parcelle_id === id).sort((a, b) => b.date.localeCompare(a.date));
    const alt  = alertes.filter(a => a.parcelle_id === id).sort((a, b) => b.date.localeCompare(a.date));

    const kpis = document.getElementById('parcelle-kpis');
    if (kpis) {
        kpis.innerHTML = `
            <div class="kpi"><div class="label">Surface</div><div class="value">${parcelle.surface.toFixed(1)}</div><div class="hint">hectares</div></div>
            <div class="kpi"><div class="label">Cultures</div><div class="value">${cult.length}</div><div class="hint">en cours</div></div>
            <div class="kpi warn"><div class="label">Observations</div><div class="value">${obs.length}</div><div class="hint">relevés</div></div>
            <div class="kpi alert"><div class="label">Alertes</div><div class="value">${alt.length}</div><div class="hint">sur la parcelle</div></div>
        `;
    }

    // Cultures
    const cultZone = document.getElementById('parcelle-cultures');
    if (cultZone) {
        cultZone.innerHTML = cult.length === 0
            ? `<div class="empty">Aucune culture sur cette parcelle.</div>`
            : `<table class="t"><thead><tr><th>Type</th><th>Date de semis</th></tr></thead><tbody>${cult.map(c => `<tr><td>${escapeHtml(c.type)}</td><td>${formatDate(c.date_semis)}</td></tr>`).join('')}</tbody></table>`;
    }

    // Observations
    const obsZone = document.getElementById('parcelle-observations');
    if (obsZone) {
        obsZone.innerHTML = obs.length === 0
            ? `<div class="empty">Aucune observation pour cette parcelle.</div>`
            : `<table class="t"><thead><tr><th>Date</th><th>État</th><th>Commentaire</th></tr></thead><tbody>${obs.slice(0, 10).map(o => `<tr><td>${formatDate(o.date)}</td><td>${tagEtat(o.etat)}</td><td>${escapeHtml(o.commentaire || '')}</td></tr>`).join('')}</tbody></table>`;
    }

    // Alertes
    const altZone = document.getElementById('parcelle-alertes');
    if (altZone) {
        altZone.innerHTML = alt.length === 0
            ? `<div class="empty">Aucune alerte sur cette parcelle.</div>`
            : `<ul class="alert-list">${alt.map(a => `<li><a href="#"><div><div class="what">${escapeHtml(a.type)}</div><div class="where">${formatDate(a.date)}</div></div>${tagNiveau(a.niveau)}</a></li>`).join('')}</ul>`;
    }

    // Graphique météo 14 jours
    const canvas = document.getElementById('chart-meteo-detail');
    if (canvas && typeof Chart !== 'undefined') {
        const rows = meteo.slice(-14);
        new Chart(canvas.getContext('2d'), {
            data: {
                labels: rows.map(r => formatDateShort(r.date)),
                datasets: [
                    { type: 'bar',  label: 'Pluie (mm)',       data: rows.map(r => r.pluie_mm),    backgroundColor: 'rgba(26,31,46,0.12)', borderColor: 'rgba(26,31,46,0.4)', yAxisID: 'y1' },
                    { type: 'line', label: 'Température (°C)', data: rows.map(r => r.temperature), borderColor: '#b85c2c', backgroundColor: 'rgba(184,92,44,0.12)', tension: 0.3, yAxisID: 'y', borderWidth: 2 },
                    { type: 'line', label: 'Humidité (%)',     data: rows.map(r => r.humidite),    borderColor: '#1a1f2e', backgroundColor: 'rgba(26,31,46,0.06)',  tension: 0.3, yAxisID: 'y', borderWidth: 2, borderDash: [4, 4] }
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
