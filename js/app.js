'use strict';

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

    let cls = 'tag-niveau-1';
    if (n === 2) cls = 'tag-niveau-2';
    if (n >= 3) cls = 'tag-niveau-3';
    return `<span class="tag ${cls}">Niveau ${n}</span>`;
}

function lienParcelle(id) {
    return `<a class="lk" href="parcelle-detail.html?id=${encodeURIComponent(id)}">${escapeHtml(getParcelleNom(id))}</a>`;
}

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

document.addEventListener('DOMContentLoaded', async function () {

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.topbar nav a').forEach(function (link) {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    if (currentPage === 'parcelle-detail.html') {
        const parcellesLink = document.querySelector('.topbar nav a[href="parcelles.html"]');
        if (parcellesLink) parcellesLink.classList.add('active');
    }

    if (typeof loadData === 'function') {
        await loadData();
    }

    if (document.getElementById('stats'))             renderDashboard();
    if (document.getElementById('parcelles-body'))    renderParcelles();
    if (document.getElementById('cultures-body'))     renderCultures();
    if (document.getElementById('observations-body')) renderObservations();
    if (document.getElementById('alertes-body'))      renderAlertes();
    if (document.getElementById('parcelle-detail'))   renderParcelleDetail();
});

function renderDashboard() {
    const stats = document.getElementById('stats');
    stats.innerHTML = `
        <div class="card span-3"><div class="kpi"><div class="icon">P</div><div class="label">Parcelles</div><div class="value">${parcelles.length}</div><div class="hint">Total enregistrées</div></div></div>
        <div class="card span-3"><div class="kpi"><div class="icon">C</div><div class="label">Cultures</div><div class="value">${cultures.length}</div><div class="hint">En cours</div></div></div>
        <div class="card span-3"><div class="kpi warn"><div class="icon">O</div><div class="label">Observations</div><div class="value">${observations.length}</div><div class="hint">Relevés terrain</div></div></div>
        <div class="card span-3"><div class="kpi alert"><div class="icon">!</div><div class="label">Alertes</div><div class="value">${alertes.length}</div><div class="hint">À traiter</div></div></div>
    `;

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

    const lastObs = document.getElementById('last-observations');
    if (lastObs) {
        const recent = observations.slice(0, 8);
        lastObs.innerHTML = recent.map(o => `
            <a class="obs-card" href="parcelle-detail.html?id=${encodeURIComponent(o.parcelle_id)}">
                <div class="obs-date">${formatDate(o.date)}</div>
                <div class="obs-parcelle">${escapeHtml(getParcelleNom(o.parcelle_id))}</div>
                <div class="obs-tag">${tagEtat(o.etat)}</div>
                ${o.commentaire ? `<div class="obs-comment">${escapeHtml(o.commentaire)}</div>` : ''}
            </a>
        `).join('');
    }

    const recentAl = document.getElementById('recent-alertes');
    if (recentAl) {
        const recent = alertes.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
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

let _parcellesMap = null;

function renderParcelles() {
    const tbody = document.getElementById('parcelles-body');
    tbody.innerHTML = parcelles.map(p => `
        <tr>
            <td>${lienParcelle(p.id)}</td>
            <td>${escapeHtml(p.localisation)}</td>
            <td>${escapeHtml(p.zone || '—')}</td>
            <td class="num">${p.surface.toFixed(1)} ha</td>
            <td class="actions">
                <button class="btn-mini" data-action="edit" data-id="${p.id}">Modifier</button>
                <button class="btn-mini btn-mini-danger" data-action="delete" data-id="${p.id}">Suppr.</button>
            </td>
        </tr>
    `).join('');

    if (!_parcellesMap) {
        const mapEl = document.getElementById('parcelles-map');
        if (mapEl && typeof L !== 'undefined') {
            _parcellesMap = L.map(mapEl, { scrollWheelZoom: false }).setView([50.65, 3.10], 11);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap',
                maxZoom: 18
            }).addTo(_parcellesMap);
        }
    } else {

        _parcellesMap.eachLayer(l => { if (l instanceof L.Marker) _parcellesMap.removeLayer(l); });
    }
    if (_parcellesMap) {
        parcelles.forEach(p => {
            if (!p.coords) return;
            const marker = L.marker(p.coords).addTo(_parcellesMap);
            marker.bindPopup(
                `<strong>${escapeHtml(p.nom)}</strong><br>` +
                `${escapeHtml(p.localisation)} — ${p.surface.toFixed(1)} ha<br>` +
                `<a href="parcelle-detail.html?id=${encodeURIComponent(p.id)}">Voir le détail</a>`
            );
        });
    }

    setupParcellesForm();
}

let _editingParcelleId = null;

function setupParcellesForm() {
    const btnToggle = document.getElementById('btn-toggle-form');
    const btnCancel = document.getElementById('btn-cancel');
    const formZone = document.getElementById('form-zone');
    const form = document.getElementById('parcelle-form');
    const errBox = document.getElementById('form-error');
    const tbody = document.getElementById('parcelles-body');

    if (!form || form.dataset.bound === '1') return;
    form.dataset.bound = '1';

    function ouvrirForm(parcelle = null) {
        formZone.hidden = false;
        errBox.hidden = true;
        if (parcelle) {
            _editingParcelleId = parcelle.id;
            form.nom.value = parcelle.nom;
            form.localisation.value = parcelle.localisation;
            form.surface_ha.value = parcelle.surface;
            document.getElementById('form-title').textContent = 'Modifier ' + parcelle.nom;
        } else {
            _editingParcelleId = null;
            form.reset();
            document.getElementById('form-title').textContent = 'Nouvelle parcelle';
        }
        form.nom.focus();
    }

    function fermerForm() {
        formZone.hidden = true;
        errBox.hidden = true;
        _editingParcelleId = null;
        form.reset();
    }

    btnToggle.addEventListener('click', () => {
        if (formZone.hidden) ouvrirForm(); else fermerForm();
    });
    btnCancel.addEventListener('click', fermerForm);

    tbody.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const pid = Number(btn.dataset.id);
        const action = btn.dataset.action;

        if (action === 'edit') {
            const p = parcelles.find(x => x.id === pid);
            if (p) ouvrirForm(p);
            window.scrollTo({top: 0, behavior: 'smooth'});
        } else if (action === 'delete') {
            const p = parcelles.find(x => x.id === pid);
            if (!confirm("Supprimer la parcelle « " + (p ? p.nom : pid) + " » ?\nLes cultures, observations et alertes liées seront aussi supprimées.")) return;
            try {
                const res = await fetch(API_URL + '/parcelles/' + pid, { method: 'DELETE' });
                if (!res.ok) throw new Error("Suppression impossible (HTTP " + res.status + ")");
                await loadData();
                renderParcelles();
            } catch (err) {
                alert(err.message);
            }
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errBox.hidden = true;

        const payload = {
            nom: form.nom.value.trim(),
            localisation: form.localisation.value.trim(),
            surface_ha: parseFloat(form.surface_ha.value)
        };

        try {
            let res;
            if (_editingParcelleId) {
                res = await fetch(API_URL + '/parcelles/' + _editingParcelleId, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(API_URL + '/parcelles', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(payload)
                });
            }
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Erreur');

            fermerForm();
            await loadData();
            renderParcelles();
        } catch (err) {
            errBox.textContent = err.message;
            errBox.hidden = false;
        }
    });
}

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
            tbody.innerHTML = `<tr><td colspan="4" class="empty">Aucune culture pour ce filtre.</td></tr>`;
            return;
        }
        tbody.innerHTML = rows.map(c => `
            <tr>
                <td>${escapeHtml(c.type)}</td>
                <td>${lienParcelle(c.parcelle_id)}</td>
                <td>${formatDate(c.date_semis)}</td>
                <td class="actions">
                    <button class="btn-mini btn-mini-danger" data-action="delete" data-id="${c.id}">Suppr.</button>
                </td>
            </tr>
        `).join('');
    }

    if (filterType) filterType.addEventListener('change', apply);
    apply();

    setupCulturesForm(apply);
}

function setupCulturesForm(rerender) {
    const btnToggle = document.getElementById('btn-toggle-form');
    const btnCancel = document.getElementById('btn-cancel');
    const formZone = document.getElementById('form-zone');
    const form = document.getElementById('culture-form');
    const errBox = document.getElementById('form-error');
    const tbody = document.getElementById('cultures-body');
    const selectParcelle = document.getElementById('culture-parcelle');

    if (!form || form.dataset.bound === '1') return;
    form.dataset.bound = '1';

    if (selectParcelle) {
        parcelles.forEach(p => {
            const o = document.createElement('option');
            o.value = p.id;
            o.textContent = p.nom;
            selectParcelle.appendChild(o);
        });
    }

    btnToggle.addEventListener('click', () => {
        formZone.hidden = !formZone.hidden;
        if (!formZone.hidden) form.querySelector('input[name="type"]').focus();
    });
    btnCancel.addEventListener('click', () => {
        formZone.hidden = true;
        errBox.hidden = true;
        form.reset();
    });

    tbody.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-action="delete"]');
        if (!btn) return;
        const cid = Number(btn.dataset.id);
        if (!confirm("Supprimer cette culture ?")) return;
        try {
            const res = await fetch(API_URL + '/cultures/' + cid, { method: 'DELETE' });
            if (!res.ok) throw new Error("Suppression impossible");
            await loadData();
            rerender();
        } catch (err) {
            alert(err.message);
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errBox.hidden = true;
        const payload = {
            type: form.type.value.trim(),
            date_semis: form.date_semis.value,
            parcelle_id: Number(form.parcelle_id.value)
        };
        try {
            const res = await fetch(API_URL + '/cultures', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Erreur');
            formZone.hidden = true;
            form.reset();
            await loadData();
            rerender();
        } catch (err) {
            errBox.textContent = err.message;
            errBox.hidden = false;
        }
    });
}

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

    setupObservationsForm(apply);
}

function setupObservationsForm(rerender) {
    const btnToggle = document.getElementById('btn-toggle-form');
    const btnCancel = document.getElementById('btn-cancel');
    const formZone = document.getElementById('form-zone');
    const form = document.getElementById('obs-form');
    const errBox = document.getElementById('form-error');
    const selectParcelle = document.getElementById('obs-parcelle');

    if (!form || form.dataset.bound === '1') return;
    form.dataset.bound = '1';

    if (selectParcelle) {
        parcelles.forEach(p => {
            const o = document.createElement('option');
            o.value = p.id;
            o.textContent = p.nom;
            selectParcelle.appendChild(o);
        });
    }

    const today = new Date().toISOString().slice(0, 10);
    form.date.value = today;

    btnToggle.addEventListener('click', () => {
        formZone.hidden = !formZone.hidden;
    });
    btnCancel.addEventListener('click', () => {
        formZone.hidden = true;
        errBox.hidden = true;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errBox.hidden = true;
        const payload = {
            date: form.date.value,
            etat: form.etat.value,
            parcelle_id: Number(form.parcelle_id.value),
            commentaire: form.commentaire.value.trim()
        };
        try {
            const res = await fetch(API_URL + '/observations', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Erreur');
            formZone.hidden = true;

            form.commentaire.value = '';
            await loadData();
            rerender();
        } catch (err) {
            errBox.textContent = err.message;
            errBox.hidden = false;
        }
    });
}

function renderAlertes() {
    const tbody = document.getElementById('alertes-body');
    const filterType   = document.getElementById('filter-type');
    const filterNiveau = document.getElementById('filter-niveau');
    const kpisZone     = document.getElementById('alertes-kpis');

    function renderKpis(rows) {
        if (!kpisZone) return;
        const n1 = rows.filter(a => Number(a.niveau) === 1).length;
        const n2 = rows.filter(a => Number(a.niveau) === 2).length;
        const n3 = rows.filter(a => Number(a.niveau) >= 3).length;
        kpisZone.innerHTML = `
            <div class="card span-3"><div class="kpi"><div class="icon">∑</div><div class="label">Total</div><div class="value">${rows.length}</div><div class="hint">alertes</div></div></div>
            <div class="card span-3"><div class="kpi"><div class="icon">1</div><div class="label">Niveau 1</div><div class="value">${n1}</div><div class="hint">vigilance</div></div></div>
            <div class="card span-3"><div class="kpi warn"><div class="icon">2</div><div class="label">Niveau 2</div><div class="value">${n2}</div><div class="hint">élevé</div></div></div>
            <div class="card span-3"><div class="kpi alert"><div class="icon">3</div><div class="label">Niveau 3</div><div class="value">${n3}</div><div class="hint">critique</div></div></div>
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

    setupAnalyserBouton(apply);
}

function setupAnalyserBouton(rerender) {
    const btn = document.getElementById('btn-analyser');
    const resultBox = document.getElementById('analyse-result');
    if (!btn || btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';

    btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = "Analyse en cours...";
        try {
            const res = await fetch(API_URL + '/alertes/analyser', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erreur');

            const ind = data.indicateurs;
            resultBox.innerHTML = `
                <strong>${data.alertes_creees} nouvelle(s) alerte(s) créée(s).</strong>
                <span class="ar-meta">
                    Pluie 7j : ${ind.pluie_7j_mm} mm — Temp moy : ${ind.temp_moy_7j}°C —
                    Humidité moy : ${ind.humidite_moy_7j}% —
                    Jours pluvieux/14 : ${ind.jours_pluie_signif_14j}
                </span>
            `;
            resultBox.hidden = false;

            await loadData();
            rerender();
        } catch (err) {
            resultBox.innerHTML = `<strong style="color:#b91c1c">Erreur : ${escapeHtml(err.message)}</strong>`;
            resultBox.hidden = false;
        } finally {
            btn.disabled = false;
            btn.textContent = "⚡ Analyser maintenant";
        }
    });
}

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
            <div class="card span-3"><div class="kpi"><div class="icon">ha</div><div class="label">Surface</div><div class="value">${parcelle.surface.toFixed(1)}</div><div class="hint">hectares</div></div></div>
            <div class="card span-3"><div class="kpi"><div class="icon">C</div><div class="label">Cultures</div><div class="value">${cult.length}</div><div class="hint">en cours</div></div></div>
            <div class="card span-3"><div class="kpi warn"><div class="icon">O</div><div class="label">Observations</div><div class="value">${obs.length}</div><div class="hint">relevés</div></div></div>
            <div class="card span-3"><div class="kpi alert"><div class="icon">!</div><div class="label">Alertes</div><div class="value">${alt.length}</div><div class="hint">sur la parcelle</div></div></div>
        `;
    }

    const cultZone = document.getElementById('parcelle-cultures');
    if (cultZone) {
        cultZone.innerHTML = cult.length === 0
            ? `<div class="empty">Aucune culture sur cette parcelle.</div>`
            : `<table class="t"><thead><tr><th>Type</th><th>Date de semis</th></tr></thead><tbody>${cult.map(c => `<tr><td>${escapeHtml(c.type)}</td><td>${formatDate(c.date_semis)}</td></tr>`).join('')}</tbody></table>`;
    }

    const obsZone = document.getElementById('parcelle-observations');
    if (obsZone) {
        obsZone.innerHTML = obs.length === 0
            ? `<div class="empty">Aucune observation pour cette parcelle.</div>`
            : `<table class="t"><thead><tr><th>Date</th><th>État</th><th>Commentaire</th></tr></thead><tbody>${obs.slice(0, 10).map(o => `<tr><td>${formatDate(o.date)}</td><td>${tagEtat(o.etat)}</td><td>${escapeHtml(o.commentaire || '')}</td></tr>`).join('')}</tbody></table>`;
    }

    const altZone = document.getElementById('parcelle-alertes');
    if (altZone) {
        altZone.innerHTML = alt.length === 0
            ? `<div class="empty">Aucune alerte sur cette parcelle.</div>`
            : `<ul class="alert-list">${alt.map(a => `<li><a href="#"><div><div class="what">${escapeHtml(a.type)}</div><div class="where">${formatDate(a.date)}</div></div>${tagNiveau(a.niveau)}</a></li>`).join('')}</ul>`;
    }

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
