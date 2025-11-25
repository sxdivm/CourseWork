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

        const uniqueTypesRu = [...new Set(products.map(p => p.type).filter(Boolean))];

        const categoriesContainer = document.getElementById('categories');
        categoriesContainer.innerHTML = '';

        uniqueTypesRu.forEach(typeRu => {
            
            const exampleProduct = products.find(p => p.type === typeRu);

            const displayName = lang === 'ru' 
                ? typeRu 
                : (exampleProduct?.en_type?.trim() || typeRu);

            const shortName = displayName.length > 18 ? displayName.slice(0, 18) + '...' : displayName;

            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            categoryDiv.innerHTML = `
                <p title="${displayName}">${shortName}</p>
                <button onclick="goToCatalog('${encodeURIComponent(typeRu)}')">
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

function goToCatalog(typeRu) {

    window.location.href = `../catalog/index.html?type=${typeRu}`;
}

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();

    window.addEventListener('languageChanged', (event) => {
        const newLang = event.detail?.lang || localStorage.getItem('language') || 'ru';
        console.log('Language changed to:', newLang);
        loadCategories(); 
    });
});