window.DumpCenterApp = (function () {
    const STORAGE_KEY = 'dumpcenter_lang';

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

    async function mountUserMenu(containerId) {
        const box = document.getElementById(containerId || 'user-menu');
        if (!box) return;
        try {
            const res = await fetch('/api/auth/me');
            if (!res.ok) return;
            const data = await res.json();
            if (!data.authenticated || !data.user) {
                box.innerHTML = `<a href="/login" class="btn btn-ghost btn-sm">${t('nav_login')}</a>`;
                return;
            }
            const user = data.user;
            const adminLink = data.isAdmin
                ? `<a href="/admin" class="btn btn-ghost btn-sm">${t('nav_admin')}</a>`
                : '';
            box.innerHTML = `
                <div style="display:flex;align-items:center;gap:10px;">
                    ${adminLink}
                    <img src="${user.avatar_url}" alt="" style="width:28px;height:28px;border-radius:50%;border:1px solid #333;" />
                    <span style="font-size:13px;font-weight:600;">${user.global_name || user.username}</span>
                    <a href="/auth/logout" class="btn btn-ghost btn-sm">${t('nav_logout')}</a>
                </div>`;
        } catch {}
    }

    function initPage(options) {
        const opts = options || {};
        mountLangSelect(opts.langSelectId);
        if (opts.applyI18n !== false) applyI18n();
        if (opts.userMenuId) mountUserMenu(opts.userMenuId);
        window.dumpCenterT = function (_lang, key) { return t(key); };
    }

    return { getLang, setLang, t, applyI18n, mountLangSelect, mountUserMenu, initPage };
})();
