document.addEventListener('DOMContentLoaded', () => {

    const pageName = window.location.pathname.match(/login/) ? 'login' :
                     window.location.pathname.match(/profile/) ? 'profile' :
                     window.location.pathname.match(/contacts/) ? 'contacts' :
                     window.location.pathname.match(/services/) ? 'services' :
                     window.location.pathname.match(/about/) ? 'about' :
                     window.location.pathname.match(/registration/) ? 'registration' :
                     window.location.pathname.match(/catalog/) ? 'catalog' :
                     window.location.pathname.match(/cart/) ? 'cart' :
                     window.location.pathname.match(/favourite/) ? 'favourite' :
                     window.location.pathname.match(/projects/) ? 'projects' :
                     window.location.pathname.match(/project_page/) ? 'project_page' :
                     window.location.pathname.match(/home/) ? 'home' :
                     window.location.pathname.split('/').pop().replace('.html', '') || 'home';
    console.log('Current page:', pageName);

    let currentLang = localStorage.getItem('language') || 'ru';
    const translationsCache = {};

    async function loadTranslations(lang, page, callback) {
        const cacheKey = `${lang}_${page}`;
        console.log(`Loading translations for ${lang}/${page}`);
        
        if (translationsCache[cacheKey]) {
            console.log(`Using cached translations for ${cacheKey}`);
            applyTranslations(translationsCache[cacheKey], page, callback);
            return;
        }

        try {
            const response = await fetch(`../i18n/${lang}/${page}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${lang}/${page}: ${response.status}`);
            }
            const translations = await response.json();
            translationsCache[cacheKey] = translations;
            console.log(`Translations loaded for ${lang}/${page}`);
            applyTranslations(translations, page, callback);
        } catch (error) {
            console.error('Error loading translations:', error);
            applyTranslations({}, page, callback); 
        }
    }

    function applyTranslations(translations, page, callback) {
        const restrictedKeys = ['home', 'about', 'projects', 'services', 'catalog', 'contacts', 
                               'phone', 'nav_title', 'phone_title', 'phone_number', 
                               'email_title', 'email_address', 'copyright'];
        const validKeys = Object.keys(translations);

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (page === 'login' && restrictedKeys.includes(key)) {
                console.log(`Skipping key "${key}" for page ${page}`);
                return;
            }
            if (validKeys.includes(key)) {
                if (key === 'agreement_text' || key === 'no_account' || key.includes('not_found_in_category')) {
                    element.innerHTML = translations[key];
                    console.log(`Updated element with data-i18n="${key}" to HTML: ${translations[key]}`);
                } else if (element.tagName.toLowerCase() === 'label') {
                    const textNode = Array.from(element.childNodes).find(node => node.nodeType === 3 && node.textContent.trim());
                    if (textNode) {
                        textNode.textContent = translations[key];
                        console.log(`Updated label text node with data-i18n="${key}" to "${translations[key]}"`);
                    } else {
                        element.appendChild(document.createTextNode(translations[key]));
                        console.log(`Created text node for label with data-i18n="${key}"`);
                    }
                } else {
                    element.textContent = translations[key];
                    console.log(`Updated element with data-i18n="${key}" to "${translations[key]}"`);
                }
            } else {
                console.warn(`Translation key "${key}" not found for ${page}`);
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (validKeys.includes(key)) {
                element.placeholder = translations[key];
                console.log(`Updated placeholder with data-i18n-placeholder="${key}" to "${translations[key]}"`);
            } else {
                console.warn(`Placeholder translation key "${key}" not found for ${page}`);
            }
        });

        document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria-label');
            if (validKeys.includes(key)) {
                element.setAttribute('aria-label', translations[key]);
                console.log(`Updated aria-label with data-i18n-aria-label="${key}" to "${translations[key]}"`);
            } else {
                console.warn(`Aria-label translation key "${key}" not found for ${page}`);
            }
        });

        const titleElement = document.querySelector('title[data-i18n]');
        if (titleElement && validKeys.includes(titleElement.getAttribute('data-i18n'))) {
            document.title = translations[titleElement.getAttribute('data-i18n')];
            console.log(`Updated title to "${document.title}"`);
        }

        document.querySelectorAll('.lang').forEach(button => {
            button.textContent = currentLang.toUpperCase();
        });

        document.documentElement.lang = currentLang;
        if (callback) callback(translations);
    }

    function updateDynamicContent(lang) {
        const event = new CustomEvent('languageChanged', { detail: { lang } });
        console.log('Отправка события languageChanged:', lang);
        window.dispatchEvent(event);
    }

    function updateLoginText() {
        loadTranslations(currentLang, 'header', (translations) => {
            document.querySelectorAll('.login a').forEach(loginLink => {
                const userId = localStorage.getItem('userId');
                loginLink.textContent = userId ? translations.profile || 'Profile' : translations.login || 'Login';
                loginLink.href = userId ? '../profile/index.html' : '../login/index.html';
                console.log(`Updated login text to "${loginLink.textContent}"`);
            });
        });
    }

    loadTranslations(currentLang, pageName);
    loadTranslations(currentLang, 'header', updateLoginText);
    loadTranslations(currentLang, 'footer');
    window.addEventListener('load', () => {
        console.log('All scripts loaded, reapplying translations');
        loadTranslations(currentLang, pageName);
        loadTranslations(currentLang, 'header', updateLoginText);
        loadTranslations(currentLang, 'footer');
    });

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('lang')) {
            console.log('Language switch triggered');
            currentLang = currentLang === 'ru' ? 'en' : 'ru';
            localStorage.setItem('language', currentLang);
            console.log(`Switched language to ${currentLang}`);
            translationsCache[pageName] = null; 
            loadTranslations(currentLang, pageName, () => {
                const dynamicPages = ['cart', 'favourite', 'projects', 'project_page', 'home']; 
                if (pageName === 'login' && window.updateLoginTranslations) {
                    window.updateLoginTranslations();
                } else if (pageName === 'profile' && window.updateProfileTranslations) {
                    window.updateProfileTranslations();
                } else if (pageName === 'registration' && window.updateRegistrationTranslations) {
                    window.updateRegistrationTranslations();
                } else if (pageName === 'catalog' && window.updateCatalogTranslations) {
                    window.updateCatalogTranslations();
                } else if (dynamicPages.includes(pageName)) {
                    updateDynamicContent(currentLang);
                }
            });
            loadTranslations(currentLang, 'header', updateLoginText);
            loadTranslations(currentLang, 'footer');
        }
    });

    window.loadTranslations = loadTranslations;
});