async function loadCategories() {
    try {
        const response = await fetch('http://localhost:3000/products');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const products = await response.json();

        const uniqueTypes = [...new Set(products.map(product => product.type))].filter(type => type);

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
        const categoriesContainer = document.getElementById('categories');
        categoriesContainer.innerHTML = '<p>Ошибка загрузки категорий. Попробуйте позже.</p>';
    }
}

function goToCatalog(type) {
    window.location.href = `../catalog/index.html?type=${type}`;
}

document.addEventListener('DOMContentLoaded', loadCategories);
