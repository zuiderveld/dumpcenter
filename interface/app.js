window.DumpCenterApp = (function () {
    const STORAGE_KEY = 'dumpcenter_lang';
    const SESSION_KEY = 'dumpcenter_session';

    function cfg() {
        return window.DUMP_CENTER_CONFIG || {};
    }

    function getApiBase() {
        const base = (cfg().apiBase || '').trim();
        return base.replace(/\/$/, '');
    }

    function getFrontendUrl() {
        const custom = (cfg().frontendUrl || '').trim();
        if (custom) return custom.replace(/\/$/, '');
        return window.location.origin;
    }

    function apiUrl(path) {
        const p = path.startsWith('/') ? path : '/' + path;
        const base = getApiBase();
        return base ? base + p : p;
    }

    function getLang() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && window.DUMP_CENTER_I18N && window.DUMP_CENTER_I18N[saved]) return saved;
        return 'nl';
    }

    function setLang(lang) {
        if (!window.DUMP_CENTER_I18N || !window.DUMP_CENTER_I18N[lang]) return;
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang === 'nl' ? 'nl' : lang;
        applyI18n(lang);
        document.querySelectorAll('.dc-user-menu').forEach((el) => {
            if (el._dcRefresh) el._dcRefresh();
        });
    }

    function t(key, lang) {
        const active = lang || getLang();
        const dict = window.DUMP_CENTER_I18N || {};
        const table = dict[active] || dict.nl || dict.en || {};
        return table[key] || (dict.nl && dict.nl[key]) || (dict.en && dict.en[key]) || key;
    }

    function applyI18n(lang) {
        const active = lang || getLang();
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (!key) return;
            const value = t(key, active);
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.hasAttribute('placeholder')) el.placeholder = value;
            } else {
                el.textContent = value;
            }
        });
        document.querySelectorAll('[data-i18n-html]').forEach((el) => {
            const key = el.getAttribute('data-i18n-html');
            if (key) el.innerHTML = t(key, active);
        });
        document.title = t('app_title', active);
    }

    function mountLangSelect(selectId) {
        const select = document.getElementById(selectId || 'lang-select');
        if (!select) return;
        select.value = getLang();
        select.addEventListener('change', () => setLang(select.value));
    }

    function loadSession() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (!data || !data.user) return null;
            return data;
        } catch {
            return null;
        }
    }

    function saveSession(data) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    }

    function clearSession() {
        localStorage.removeItem(SESSION_KEY);
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    const ICON = {
        panel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
        admin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>',
        home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
        logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>',
        discord: '<svg viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.08,56.6.34,80.11h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.8,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>',
    };

    function panelHref() {
        const base = getApiBase();
        return base ? base + '/panel' : '/panel';
    }

    function adminHref() {
        const base = getApiBase();
        return base ? base + '/admin' : '/admin';
    }

    function loginHref() {
        return '/login.html';
    }

    function renderLoggedOut(box) {
        box.innerHTML = `
            <a href="${loginHref()}" class="dc-btn-login">
                ${ICON.discord}
                <span>${t('nav_login')}</span>
            </a>`;
        togglePanelBtn(false);
    }

    function renderLoggedIn(box, data) {
        const user = data.user || {};
        const name = escapeHtml(user.global_name || user.username || 'User');
        const license = data.license || {};
        const licenseText = license.max_servers != null
            ? `${license.used_servers || 0}/${license.max_servers} ${t('nav_servers')}`
            : '';
        const badge = data.isAdmin
            ? `<span class="dc-user-badge admin">${t('nav_admin_badge')}</span>`
            : (license.license_label ? `<span class="dc-user-badge">${escapeHtml(license.license_label)}</span>` : '');

        box.innerHTML = `
            <div class="dc-user-menu" id="dc-user-dropdown-root">
                <button type="button" class="dc-user-trigger" aria-expanded="false" aria-haspopup="true">
                    <img src="${escapeHtml(user.avatar_url)}" alt="" />
                    <span class="dc-user-name">${name}</span>
                    <svg class="dc-user-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                <div class="dc-user-dropdown" role="menu">
                    <div class="dc-user-dropdown-head">
                        <div class="name">${name}</div>
                        <div class="sub">${licenseText || t('nav_logged_in')}</div>
                        ${badge}
                    </div>
                    <a href="/" role="menuitem">${ICON.home}<span>${t('nav_home')}</span></a>
                    <a href="${panelHref()}" role="menuitem">${ICON.panel}<span>${t('nav_panel')}</span></a>
                    ${data.isAdmin ? `<a href="${adminHref()}" role="menuitem">${ICON.admin}<span>${t('nav_admin')}</span></a>` : ''}
                    <div class="dc-user-dropdown-divider"></div>
                    <button type="button" class="danger" id="dc-logout-btn" role="menuitem">${ICON.logout}<span>${t('nav_logout')}</span></button>
                </div>
            </div>`;

        togglePanelBtn(true);

        const root = box.querySelector('#dc-user-dropdown-root');
        const trigger = root.querySelector('.dc-user-trigger');
        const logoutBtn = box.querySelector('#dc-logout-btn');

        function closeMenu() {
            root.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
        }

        function openMenu() {
            root.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
        }

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (root.classList.contains('open')) closeMenu();
            else openMenu();
        });

        logoutBtn.addEventListener('click', async () => {
            clearSession();
            closeMenu();
            try {
                await fetch(apiUrl('/api/auth/logout'), { credentials: 'include' });
            } catch {}
            window.location.href = '/';
        });

        root._dcRefresh = () => renderLoggedIn(box, loadSession() || data);

        if (!window._dcUserMenuBound) {
            window._dcUserMenuBound = true;
            document.addEventListener('click', () => {
                document.querySelectorAll('.dc-user-menu.open').forEach((m) => {
                    m.classList.remove('open');
                    const btn = m.querySelector('.dc-user-trigger');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                });
            });
        }
    }

    function togglePanelBtn(loggedIn) {
        document.querySelectorAll('[data-dc-panel-btn]').forEach((el) => {
            el.classList.toggle('hidden', loggedIn);
        });
    }

    async function fetchAuthMe() {
        const res = await fetch(apiUrl('/api/auth/me'), { credentials: 'include' });
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.authenticated || !data.user) return null;
        return data;
    }

    async function mountUserMenu(containerId) {
        const box = document.getElementById(containerId || 'user-menu');
        if (!box) return;

        const stored = loadSession();
        if (stored && stored.user) {
            renderLoggedIn(box, stored);
        } else {
            renderLoggedOut(box);
        }

        try {
            const live = await fetchAuthMe();
            if (live && live.user) {
                saveSession(live);
                renderLoggedIn(box, live);
            } else if (!loadSession()) {
                renderLoggedOut(box);
            }
        } catch {
            if (!loadSession()) renderLoggedOut(box);
        }
    }

    async function resolveSession() {
        try {
            const live = await fetchAuthMe();
            if (live && live.user) {
                saveSession(live);
                return live;
            }
        } catch {}
        clearSession();
        return null;
    }

    function lockPage() {
        if (document.getElementById('dc-auth-guard')) return;
        document.documentElement.classList.add('dc-page-locked');
        const el = document.createElement('div');
        el.id = 'dc-auth-guard';
        el.className = 'dc-auth-guard';
        el.innerHTML = `<div class="dc-auth-guard-spin"></div><span>${t('auth_checking')}</span>`;
        document.body.appendChild(el);
    }

    function unlockPage() {
        document.documentElement.classList.remove('dc-page-locked');
        const el = document.getElementById('dc-auth-guard');
        if (el) el.remove();
    }

    function loginRedirect(nextPath, error) {
        const next = encodeURIComponent(nextPath || window.location.pathname + window.location.search);
        let url = '/login.html?next=' + next;
        if (error) url += '&error=' + encodeURIComponent(error);
        window.location.replace(url);
    }

    async function guardPage(options) {
        const opts = options || {};
        lockPage();

        const session = await resolveSession();
        const returnPath = window.location.pathname + window.location.search;

        if (!session || !session.user) {
            loginRedirect(returnPath, 'login_required');
            return null;
        }

        if (opts.requireAdmin && !session.isAdmin) {
            clearSession();
            loginRedirect(returnPath, 'no_access');
            return null;
        }

        unlockPage();
        return session;
    }

    function handleAuthFailure(status) {
        if (status === 401 || status === 403) {
            clearSession();
            loginRedirect(window.location.pathname, status === 403 ? 'no_access' : 'login_required');
            return true;
        }
        return false;
    }

    function getLoginUrl(nextPath) {
        const next = encodeURIComponent(nextPath || window.location.origin + '/panel.html');
        return apiUrl('/api/auth/discord?next=' + next);
    }

    function initPage(options) {
        const opts = options || {};
        mountLangSelect(opts.langSelectId);
        if (opts.applyI18n !== false) applyI18n();
        if (opts.userMenuId) mountUserMenu(opts.userMenuId);
        window.dumpCenterT = function (_lang, key) { return t(key); };
    }

    return {
        getLang, setLang, t, applyI18n, mountLangSelect, mountUserMenu, initPage,
        apiUrl, getApiBase, getFrontendUrl, getLoginUrl,
        loadSession, saveSession, clearSession,
        guardPage, lockPage, unlockPage, handleAuthFailure, resolveSession,
    };
})();
