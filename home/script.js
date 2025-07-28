async function loadCategories() {
    try {
        const lang = localStorage.getItem('language') || 'ru';
        const response = await fetch('http://localhost:3000/products');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const products = await response.json();

        const translations = await new Promise(resolve => {
            window.loadTranslations(lang, 'home', (trans) => resolve(trans || {}));
        });

        const uniqueTypes = [...new Set(products.map(product => lang === 'ru' ? product.type : product.en_type || product.type))].filter(type => type);
        console.log('Unique categories:', uniqueTypes); 

        const categoriesContainer = document.getElementById('categories');
        categoriesContainer.innerHTML = '';

        uniqueTypes.forEach(type => {
            const shortName = type.length > 18 ? type.slice(0, 18) + '...' : type;
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            categoryDiv.innerHTML = `
                <p title="${type}">${shortName}</p>
                <button onclick="goToCatalog('${encodeURIComponent(type)}')">
                    <img src="../img/circle_arrow.svg" alt="arrow">
                </button>
            `;
            categoriesContainer.appendChild(categoryDiv);
        });
    } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
        const lang = localStorage.getItem('language') || 'ru';
        const categoriesContainer = document.getElementById('categories');
        await new Promise(resolve => {
            window.loadTranslations(lang, 'home', (translations) => {
                categoriesContainer.innerHTML = `<p data-i18n="error_loading_categories">${translations.error_loading_categories || 'Ошибка загрузки категорий. Попробуйте позже.'}</p>`;
                resolve();
            });
        });
        window.loadTranslations(lang, 'home');
    }
}

function goToCatalog(type) {
    window.location.href = `../catalog/index.html?type=${type}`;
}

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    window.addEventListener('languageChanged', (event) => {
        const newLang = event.detail?.lang || localStorage.getItem('language') || 'ru';
        console.log('Language changed to:', newLang);
        loadCategories();
    });
});