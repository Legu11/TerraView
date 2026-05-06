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

    const lastObs = document.getElementById('last-observations');
    if (lastObs) {
        const recent = observations.slice(0, 5);
        lastObs.innerHTML = recent.map(o => `
            <tr>
                <td>${formatDate(o.date)}</td>
                <td>${escapeHtml(getParcelleNom(o.parcelle_id))}</td>
                <td>${badgeEtat(o.etat)}</td>
            </tr>
        `).join('');
    }
}

// ===== Rendu : Parcelles ====================================================

function renderParcelles() {
    const tbody = document.getElementById('parcelles-body');
    tbody.innerHTML = parcelles.map(p => `
        <tr>
            <td>${escapeHtml(p.nom)}</td>
            <td>${escapeHtml(p.localisation)}</td>
            <td>${escapeHtml(p.zone || '—')}</td>
            <td class="text-end">${p.surface.toFixed(1)} ha</td>
        </tr>
    `).join('');
}

// ===== Rendu : Cultures =====================================================

function renderCultures() {
    const tbody = document.getElementById('cultures-body');
    const filterType = document.getElementById('filter-culture-type');

    // Pré-remplir le filtre type
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
                <td>${escapeHtml(getParcelleNom(c.parcelle_id))}</td>
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

    // Pré-remplir le filtre parcelles
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
                <td>${escapeHtml(getParcelleNom(o.parcelle_id))}</td>
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

        renderKpis(alertes); // KPIs sur l'ensemble (pas filtré)

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
                    <td>${escapeHtml(getParcelleNom(a.parcelle_id))}</td>
                    <td>${badgeNiveau(a.niveau)}</td>
                </tr>
            `;
        }).join('');
    }

    if (filterType)   filterType.addEventListener('change', apply);
    if (filterNiveau) filterNiveau.addEventListener('change', apply);
    apply();
}
