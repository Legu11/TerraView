// AgriData - script principal

document.addEventListener("DOMContentLoaded", function () {

    // Met en évidence le lien actif dans la navbar
    const links = document.querySelectorAll("nav a");
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    links.forEach(function (link) {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });

    // Page d'accueil : affichage des stats
    const statsZone = document.getElementById("stats");
    if (statsZone) {
        statsZone.innerHTML =
            '<div class="stat-card"><div class="label">Parcelles</div><div class="value">' + parcelles.length + '</div></div>' +
            '<div class="stat-card"><div class="label">Observations</div><div class="value">' + observations.length + '</div></div>' +
            '<div class="stat-card"><div class="label">Alertes</div><div class="value">' + alertes.length + '</div></div>';
    }

    // Page d'accueil : dernières observations
    const lastObs = document.getElementById("last-observations");
    if (lastObs) {
        let html = "";
        for (let i = 0; i < Math.min(observations.length, 5); i++) {
            const o = observations[i];
            html += "<tr>";
            html += "<td>" + formatDate(o.date) + "</td>";
            html += "<td>" + o.parcelle + "</td>";
            html += "<td>" + badgeEtat(o.etat) + "</td>";
            html += "</tr>";
        }
        lastObs.innerHTML = html;
    }

    // Page parcelles
    const parcellesBody = document.getElementById("parcelles-body");
    if (parcellesBody) {
        let html = "";
        for (let i = 0; i < parcelles.length; i++) {
            const p = parcelles[i];
            html += "<tr>";
            html += "<td>" + p.nom + "</td>";
            html += "<td>" + p.localisation + "</td>";
            html += "<td>" + p.surface.toFixed(1) + " ha</td>";
            html += "</tr>";
        }
        parcellesBody.innerHTML = html;
    }

    // Page observations
    const obsBody = document.getElementById("observations-body");
    if (obsBody) {
        let html = "";
        for (let i = 0; i < observations.length; i++) {
            const o = observations[i];
            html += "<tr>";
            html += "<td>" + formatDate(o.date) + "</td>";
            html += "<td>" + o.parcelle + "</td>";
            html += "<td>" + badgeEtat(o.etat) + "</td>";
            html += "<td>" + o.commentaire + "</td>";
            html += "</tr>";
        }
        obsBody.innerHTML = html;
    }

    // Page alertes
    const alertesBody = document.getElementById("alertes-body");
    if (alertesBody) {
        let html = "";
        for (let i = 0; i < alertes.length; i++) {
            const a = alertes[i];
            html += "<tr>";
            html += "<td>" + formatDate(a.date) + "</td>";
            html += "<td>" + a.type + "</td>";
            html += "<td>" + a.parcelle + "</td>";
            html += '<td><span class="badge niveau-' + a.niveau + '">Niveau ' + a.niveau + "</span></td>";
            html += "</tr>";
        }
        alertesBody.innerHTML = html;
    }
});

// Format JJ/MM/AAAA
function formatDate(iso) {
    const parts = iso.split("-");
    return parts[2] + "/" + parts[1] + "/" + parts[0];
}

// Renvoie le HTML d'un badge d'état
function badgeEtat(etat) {
    let cls = "badge-ok";
    if (etat === "Stress hydrique")  cls = "badge-stress";
    if (etat === "Risque maladie")   cls = "badge-risque";
    if (etat === "Maladie détectée") cls = "badge-maladie";
    return '<span class="badge ' + cls + '">' + etat + "</span>";
}
