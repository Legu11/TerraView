'use strict';

const AUTH_KEY = 'agridata_user';

const AUTH_API_URL = (typeof API_URL !== 'undefined') ? API_URL : 'http://127.0.0.1:5000/api';

function saveUser(user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function getUser() {
    const raw = localStorage.getItem(AUTH_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'index.html';
}

async function register(nom, email, password) {
    const res = await fetch(AUTH_API_URL + '/auth/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({nom, email, password})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la création du compte');
    saveUser(data.user);
    return data.user;
}

async function login(email, password) {
    const res = await fetch(AUTH_API_URL + '/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la connexion');
    saveUser(data.user);
    return data.user;
}

function updateTopBarAuth() {
    const right = document.querySelector('.topbar-right');
    if (!right) return;
    const user = getUser();

    if (user) {
        right.innerHTML = `
            <span class="user-name">Bonjour ${escapeAuthHtml(user.nom)}</span>
            <a href="#" id="logout-link" class="auth-link">Déconnexion</a>
        `;
        const link = document.getElementById('logout-link');
        if (link) link.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    } else {

        if (!right.querySelector('a')) {
            right.innerHTML = `
                <a href="login.html" class="auth-link">Connexion</a>
                <a href="signup.html" class="auth-link primary">Inscription</a>
            `;
        }
    }
}

function escapeAuthHtml(value) {
    if (value == null) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', updateTopBarAuth);
