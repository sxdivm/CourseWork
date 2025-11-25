const ITEMS_PER_PAGE = 12;

let currentFilters = {
    sort: 'name',
    order: 'asc',
    search: '',
    availability: '',
    types: [],
    minPrice: null,
    maxPrice: null,
    minPower: null,
    maxPower: null,
    minLuminousFlux: null,
    maxLuminousFlux: null,
    ip: '',
    minColorTemperature: null,
    maxColorTemperature: null,
    emergencyBlock: '',
    page: 1
};

let realRanges = {
    price: { min: 0, max: 3500 },
    power: { min: 0, max: 100 },
    luminousFlux: { min: 0, max: 6000 },
    colorTemperature: { min: 0, max: 6500 }
};

async function addToCart(productId) {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.log('Пользователь не авторизован, перенаправление на страницу логина');
            window.location.href = '../login/index.html';
            return;
        }

        const cartResponse = await fetch(`http://localhost:3000/cart?userId=${userId}&productId=${productId}`);
        const cartItems = await cartResponse.json();

        if (cartItems.length > 0) {
            const cartItem = cartItems[0];
            const newQuantity = Math.min(cartItem.quantity + 1, 99);
            const updateResponse = await fetch(`http://localhost:3000/cart/${cartItem.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity: newQuantity })
            });

            if (!updateResponse.ok) {
                throw new Error(`Ошибка HTTP! Статус: ${updateResponse.status}`);
            }

            console.log('Количество товара обновлено:', await updateResponse.json());
            alert('Количество товара в корзине обновлено!');
        } else {
            const cartItem = {
                productId: productId,
                userId: userId,
                quantity: 1
            };

            const response = await fetch('http://localhost:3000/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cartItem)
            });

            if (!response.ok) {
                throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
            }

            console.log('Товар добавлен в корзину:', await response.json());
            alert('Товар добавлен в корзину!');
        }

        loadProducts(currentFilters.sort, currentFilters.order, currentFilters.search, currentFilters.availability, currentFilters.types, currentFilters.minPrice, currentFilters.maxPrice, currentFilters.minPower, currentFilters.maxPower, currentFilters.minLuminousFlux, currentFilters.maxLuminousFlux, currentFilters.ip, currentFilters.minColorTemperature, currentFilters.maxColorTemperature, currentFilters.emergencyBlock, currentFilters.page);
    } catch (error) {
        console.error('Ошибка при добавлении в корзину:', error);
        alert('Ошибка при добавлении товара в корзину. Попробуйте позже.');
    }
}

async function toggleFavorite(productId) {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.log('Пользователь не авторизован, перенаправление на страницу логина');
            window.location.href = '../login/index.html';
            return;
        }

        const favoriteResponse = await fetch(`http://localhost:3000/favorites?userId=${userId}&productId=${productId}`);
        const favorites = await favoriteResponse.json();

        if (favorites.length > 0) {
            const favorite = favorites[0];
            const deleteResponse = await fetch(`http://localhost:3000/favorites/${favorite.id}`, {
                method: 'DELETE'
            });

            if (!deleteResponse.ok) {
                throw new Error(`Ошибка HTTP! Статус: ${deleteResponse.status}`);
            }

            console.log('Товар удален из избранного');
            alert('Товар удален из избранного!');
        } else {
            const favoriteItem = {
                productId: productId,
                userId: userId
            };

            const response = await fetch('http://localhost:3000/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(favoriteItem)
            });

            if (!response.ok) {
                throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
            }

            console.log('Товар добавлен в избранное:', await response.json());
            alert('Товар добавлен в избранное!');
        }

        loadProducts(currentFilters.sort, currentFilters.order, currentFilters.search, currentFilters.availability, currentFilters.types, currentFilters.minPrice, currentFilters.maxPrice, currentFilters.minPower, currentFilters.maxPower, currentFilters.minLuminousFlux, currentFilters.maxLuminousFlux, currentFilters.ip, currentFilters.minColorTemperature, currentFilters.maxColorTemperature, currentFilters.emergencyBlock, currentFilters.page);
    } catch (error) {
        console.error('Ошибка при работе с избранным:', error);
        alert('Ошибка при добавлении/удалении товара из избранного. Попробуйте позже.');
    }
}

async function updateCartItemQuantity(cartItemId, newQuantity) {
    try {
        if (newQuantity < 1 || newQuantity > 99) {
            console.log('Количество вне допустимого диапазона:', newQuantity);
            return;
        }

        const response = await fetch(`http://localhost:3000/cart/${cartItemId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity: newQuantity })
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
        }

        console.log('Количество товара обновлено:', await response.json());
        loadProducts(currentFilters.sort, currentFilters.order, currentFilters.search, currentFilters.availability, currentFilters.types, currentFilters.minPrice, currentFilters.maxPrice, currentFilters.minPower, currentFilters.maxPower, currentFilters.minLuminousFlux, currentFilters.maxLuminousFlux, currentFilters.ip, currentFilters.minColorTemperature, currentFilters.maxColorTemperature, currentFilters.emergencyBlock, currentFilters.page);
    } catch (error) {
        console.error('Ошибка при обновлении количества:', error);
        alert('Ошибка при обновлении количества товара. Попробуйте позже.');
    }
}

async function deleteProduct(productId) {
    try {
        const response = await fetch(`http://localhost:3000/products/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
        }

        console.log('Товар удален:', productId);
        alert('Товар удален!');
        loadProducts(currentFilters.sort, currentFilters.order, currentFilters.search, currentFilters.availability, currentFilters.types, currentFilters.minPrice, currentFilters.maxPrice, currentFilters.minPower, currentFilters.maxPower, currentFilters.minLuminousFlux, currentFilters.maxLuminousFlux, currentFilters.ip, currentFilters.minColorTemperature, currentFilters.maxColorTemperature, currentFilters.emergencyBlock, currentFilters.page);
    } catch (error) {
        console.error('Ошибка при удалении товара:', error);
        alert('Ошибка при удалении товара. Попробуйте позже.');
    }
}

async function openProductModal(productId = null) {
    const modal = document.getElementById('modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('modal-title');
    const idInput = document.getElementById('product-id');

    if (productId) {
        title.setAttribute('data-i18n', 'edit_product_title');
        const response = await fetch(`http://localhost:3000/products/${productId}`);
        if (!response.ok) {
            throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
        }
        const product = await response.json();
        idInput.value = product.id;
        document.getElementById('product-name').value = product.name || '';
        document.getElementById('product-en-name').value = product.en_name || '';
        document.getElementById('product-type').value = product.type || '';
        document.getElementById('product-en-type').value = product.en_type || '';
        document.getElementById('product-price').value = product.price || '';
        document.getElementById('product-availability').checked = product.availability || false;
        document.getElementById('product-power').value = product.power || '';
        document.getElementById('product-luminous-flux').value = product['luminous flux'] || '';
        document.getElementById('product-ip').value = product.ip || '';
        document.getElementById('product-color-temperature').value = product['color temperature'] || '';
        document.getElementById('product-emergency-block').checked = product['emergency block'] || false;
    } else {
        title.setAttribute('data-i18n', 'add_product_title');
        const response = await fetch('http://localhost:3000/products?_sort=id&_order=desc&_limit=1');
        const lastProduct = (await response.json())[0];
        const newId = lastProduct ? parseInt(lastProduct.id) + 1 : 1;
        idInput.value = newId;
        form.reset();
        document.getElementById('product-id').value = newId;
    }

    window.loadTranslations(localStorage.getItem('language') || 'ru', 'catalog', () => {
        console.log('Translations applied to modal form');
        modal.style.display = 'flex';
    });
}

async function saveProduct(event) {
    event.preventDefault();
    const id = document.getElementById('product-id').value;
    const product = {
        id: id,
        name: document.getElementById('product-name').value,
        en_name: document.getElementById('product-en-name').value,
        type: document.getElementById('product-type').value,
        en_type: document.getElementById('product-en-type').value,
        price: document.getElementById('product-price').value ? parseFloat(document.getElementById('product-price').value) : null,
        availability: document.getElementById('product-availability').checked,
        power: document.getElementById('product-power').value ? parseFloat(document.getElementById('product-power').value) : null,
        'luminous flux': document.getElementById('product-luminous-flux').value ? parseFloat(document.getElementById('product-luminous-flux').value) : null,
        ip: document.getElementById('product-ip').value || null,
        'color temperature': document.getElementById('product-color-temperature').value ? parseInt(document.getElementById('product-color-temperature').value) : null,
        'emergency block': document.getElementById('product-emergency-block').checked
    };

    try {
        const existingProductResponse = await fetch(`http://localhost:3000/products/${id}`);
        const method = existingProductResponse.ok ? 'PATCH' : 'POST';
        const url = method === 'PATCH' ? `http://localhost:3000/products/${id}` : 'http://localhost:3000/products';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
        }

        console.log(method === 'PATCH' ? 'Товар обновлен' : 'Товар добавлен', await response.json());
        alert(method === 'PATCH' ? 'Товар обновлен!' : 'Товар добавлен!');
        document.getElementById('modal').style.display = 'none';
        loadProducts(currentFilters.sort, currentFilters.order, currentFilters.search, currentFilters.availability, currentFilters.types, currentFilters.minPrice, currentFilters.maxPrice, currentFilters.minPower, currentFilters.maxPower, currentFilters.minLuminousFlux, currentFilters.maxLuminousFlux, currentFilters.ip, currentFilters.minColorTemperature, currentFilters.maxColorTemperature, currentFilters.emergencyBlock, currentFilters.page);
    } catch (error) {
        console.error('Ошибка при сохранении товара:', error);
        alert('Ошибка при сохранении товара. Попробуйте позже.');
    }
}

function calculateRealRanges(products) {
    const validProducts = products.filter(p => p !== null && p !== undefined);

    const prices = validProducts.map(p => p.price).filter(price => price !== null && price !== undefined);
    realRanges.price.min = 0;
    realRanges.price.max = prices.length > 0 ? Math.ceil(Math.max(...prices) / 100) * 100 : 3500;

    const powers = validProducts.map(p => p.power).filter(power => power !== null && power !== undefined);
    realRanges.power.min = 0;
    realRanges.power.max = powers.length > 0 ? Math.ceil(Math.max(...powers)) : 100;

    const luminousFluxes = validProducts.map(p => p['luminous flux']).filter(flux => flux !== null && flux !== undefined);
    realRanges.luminousFlux.min = 0;
    realRanges.luminousFlux.max = luminousFluxes.length > 0 ? Math.ceil(Math.max(...luminousFluxes) / 100) * 100 : 6000;

    const colorTemperatures = validProducts.map(p => p['color temperature']).filter(temp => temp !== null && temp !== undefined);
    realRanges.colorTemperature.min = 0;
    realRanges.colorTemperature.max = colorTemperatures.length > 0 ? Math.ceil(Math.max(...colorTemperatures) / 100) * 100 : 6500;

    console.log('Real ranges calculated:', realRanges);
}

function updateSlidersWithRealRanges() {

    const priceSliderMin = document.getElementById('price-slider-min');
    const priceSliderMax = document.getElementById('price-slider-max');
    if (priceSliderMin && priceSliderMax) {
        priceSliderMin.min = realRanges.price.min;
        priceSliderMin.max = realRanges.price.max;
        priceSliderMax.min = realRanges.price.min;
        priceSliderMax.max = realRanges.price.max;
        priceSliderMin.value = realRanges.price.min;
        priceSliderMax.value = realRanges.price.max;
    }

    const powerSliderMin = document.getElementById('power-slider-min');
    const powerSliderMax = document.getElementById('power-slider-max');
    if (powerSliderMin && powerSliderMax) {
        powerSliderMin.min = realRanges.power.min;
        powerSliderMin.max = realRanges.power.max;
        powerSliderMax.min = realRanges.power.min;
        powerSliderMax.max = realRanges.power.max;
        powerSliderMin.value = realRanges.power.min;
        powerSliderMax.value = realRanges.power.max;
    }

    const luminousFluxSliderMin = document.getElementById('luminous-flux-slider-min');
    const luminousFluxSliderMax = document.getElementById('luminous-flux-slider-max');
    if (luminousFluxSliderMin && luminousFluxSliderMax) {
        luminousFluxSliderMin.min = realRanges.luminousFlux.min;
        luminousFluxSliderMin.max = realRanges.luminousFlux.max;
        luminousFluxSliderMax.min = realRanges.luminousFlux.min;
        luminousFluxSliderMax.max = realRanges.luminousFlux.max;
        luminousFluxSliderMin.value = realRanges.luminousFlux.min;
        luminousFluxSliderMax.value = realRanges.luminousFlux.max;
    }

    const colorTemperatureSliderMin = document.getElementById('color-temperature-slider-min');
    const colorTemperatureSliderMax = document.getElementById('color-temperature-slider-max');
    if (colorTemperatureSliderMin && colorTemperatureSliderMax) {
        colorTemperatureSliderMin.min = realRanges.colorTemperature.min;
        colorTemperatureSliderMin.max = realRanges.colorTemperature.max;
        colorTemperatureSliderMax.min = realRanges.colorTemperature.min;
        colorTemperatureSliderMax.max = realRanges.colorTemperature.max;
        colorTemperatureSliderMin.value = realRanges.colorTemperature.min;
        colorTemperatureSliderMax.value = realRanges.colorTemperature.max;
    }

    console.log('Sliders updated with real ranges');
}

async function loadProducts(sort = 'name', order = 'asc', search = '', availability = '', types = [], minPrice = null, maxPrice = null, minPower = null, maxPower = null, minLuminousFlux = null, maxLuminousFlux = null, ip = '', minColorTemperature = null, maxColorTemperature = null, emergencyBlock = '', page = 1) {

    currentFilters = { sort, order, search, availability, types, minPrice, maxPrice, minPower, maxPower, minLuminousFlux, maxLuminousFlux, ip, minColorTemperature, maxColorTemperature, emergencyBlock, page };

    try {
        const url = new URL('http://localhost:3000/products');
        url.searchParams.append('_sort', sort);
        url.searchParams.append('_order', order);
        if (search) url.searchParams.append('q', search);
        if (availability) url.searchParams.append('availability', availability);
        if (types.length > 0) url.searchParams.append('type_like', types.join('|'));
        if (minPrice !== null) url.searchParams.append('price_gte', minPrice);
        if (maxPrice !== null) url.searchParams.append('price_lte', maxPrice);
        if (minPower !== null) url.searchParams.append('power_gte', minPower);
        if (maxPower !== null) url.searchParams.append('power_lte', maxPower);
        if (minLuminousFlux !== null) url.searchParams.append('luminous flux_gte', minLuminousFlux);
        if (maxLuminousFlux !== null) url.searchParams.append('luminous flux_lte', maxLuminousFlux);
        if (ip) url.searchParams.append('ip', ip);
        if (minColorTemperature !== null) url.searchParams.append('color temperature_gte', minColorTemperature);
        if (maxColorTemperature !== null) url.searchParams.append('color temperature_lte', maxColorTemperature);
        if (emergencyBlock) url.searchParams.append('emergency block', emergencyBlock);
        url.searchParams.append('_page', page);
        url.searchParams.append('_limit', ITEMS_PER_PAGE);

        console.log('Fetching from:', url.toString());
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const products = await response.json();
        console.log('Products received:', products);

        const allProductsUrl = new URL('http://localhost:3000/products');
        const allProductsResponse = await fetch(allProductsUrl);
        if (allProductsResponse.ok) {
            const allProducts = await allProductsResponse.json();
            calculateRealRanges(allProducts);
            updateSlidersWithRealRanges();
            restoreSliderPositions();
        }

        const catalog = document.getElementById('catalog');
        catalog.innerHTML = '';

        if (products.length === 0) {
            catalog.innerHTML = '<p data-i18n="products_not_found">Товары не найдены.</p>';
            console.log('No products found.');
            updatePagination(0, page, sort, order, search, availability, types, minPrice, maxPrice, minPower, maxPower, minLuminousFlux, maxLuminousFlux, ip, minColorTemperature, maxColorTemperature, emergencyBlock);
            window.loadTranslations(localStorage.getItem('language') || 'ru', 'catalog');
            return;
        }

        const userId = localStorage.getItem('userId');
        const isAdmin = localStorage.getItem('role') === 'admin';
        let cartItems = [];
        let favorites = [];
        if (userId) {
            const cartResponse = await fetch(`http://localhost:3000/cart?userId=${userId}`);
            cartItems = await cartResponse.json();
            const favoritesResponse = await fetch(`http://localhost:3000/favorites?userId=${userId}`);
            favorites = await favoritesResponse.json();
        }

        if (isAdmin) {
            document.getElementById('admin-controls').style.display = 'flex';
        }

        const currentLang = localStorage.getItem('language') || 'ru';
        const typeFilterGroup = document.querySelector('#filter-panel .filter-group:nth-child(2)');
        if (typeFilterGroup) {
            // Получаем ВСЕ товары один раз, чтобы знать все возможные типы
            const allResponse = await fetch('http://localhost:3000/products');
            const allProducts = await allResponse.json();

            // Уникальные русские типы (по ним мы всегда фильтруем на сервере)
            const uniqueTypesRu = [...new Set(allProducts.map(p => p.type).filter(Boolean))];

            typeFilterGroup.innerHTML = `<h5 data-i18n="type">${currentLang === 'ru' ? 'Тип' : 'Type'}</h5>`;

            uniqueTypesRu.forEach(typeRu => {
                // Находим любой товар с этим русским типом, чтобы взять перевод
                const example = allProducts.find(p => p.type === typeRu);
                const displayName = currentLang === 'ru'
                    ? typeRu
                    : (example?.en_type?.trim() ? example.en_type : typeRu); // если перевода нет — покажем русский

                const isChecked = types.includes(typeRu); // проверяем по РУССКОМУ значению!

                const label = document.createElement('label');
                label.innerHTML = `
                    <input type="checkbox" name="type" value="${typeRu}" ${isChecked ? 'checked' : ''}>
                    ${displayName}
                `;
                typeFilterGroup.appendChild(label);
            });
        }

        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product';
            const cartItem = cartItems.find(item => item.productId === product.id.toString());
            const isFavorite = favorites.some(item => item.productId === product.id.toString());
            let buttonContent = '';
            if (cartItem) {
                buttonContent = `
                    <div class="cart-control">
                        <button class="cart-decrement" data-product-id="${product.id}" data-cart-id="${cartItem.id}" aria-label="Decrease quantity">-</button>
                        <span class="cart-quantity">${cartItem.quantity}</span>
                        <button class="cart-increment" data-product-id="${product.id}" data-cart-id="${cartItem.id}" aria-label="Increase quantity">+</button>
                    </div>
                `;
            } else {
                buttonContent = `<button class="add-to-cart" data-product-id="${product.id}"><i class="fas fa-shopping-cart"></i></button>`;
            }
            let adminButtons = '';
            if (isAdmin) {
                adminButtons = `
                    <button class="edit-btn" data-product-id="${product.id}" aria-label="Edit product"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-product-id="${product.id}" aria-label="Delete product"><i class="fas fa-trash"></i></button>
                `;
            }
            productDiv.innerHTML = `
                ${adminButtons}
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-product-id="${product.id}" aria-label="Add to favorites">
                    <i class="fa-regular fa-heart"></i>
                    <i class="fa-solid fa-heart"></i>
                </button>
                <img src="../img/catalog/${product.id}.png" alt="${currentLang === 'ru' ? product.name : product.en_name || product.name}" onerror="this.src='../img/catalog/fallback.png'">
                <div class="text-content">
                    <p class="accent" data-i18n="${product.availability ? 'in_stock' : 'out_of_stock'}">${product.availability ? 'Есть в наличии' : 'Нет в наличии'}</p>
                    <p class="type">${currentLang === 'ru' ? product.type : product.en_type || product.type}</p>
                    <p class="name">${currentLang === 'ru' ? product.name : product.en_name || product.name}</p>
                    <p class="price" data-i18n="${product.price === null ? 'price_on_request' : ''}">${product.price === null ? 'Цена по запросу' : product.price + ' ₽'}</p>
                </div>
                ${buttonContent}
            `;
            catalog.appendChild(productDiv);
        });

        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-product-id');
                addToCart(productId);
            });
        });

        document.querySelectorAll('.cart-decrement').forEach(button => {
            button.addEventListener('click', () => {
                const cartId = button.getAttribute('data-cart-id');
                const currentQuantity = parseInt(button.nextElementSibling.textContent);
                if (currentQuantity > 1) {
                    updateCartItemQuantity(cartId, currentQuantity - 1);
                }
            });
        });

        document.querySelectorAll('.cart-increment').forEach(button => {
            button.addEventListener('click', () => {
                const cartId = button.getAttribute('data-cart-id');
                const currentQuantity = parseInt(button.previousElementSibling.textContent);
                if (currentQuantity < 99) {
                    updateCartItemQuantity(cartId, currentQuantity + 1);
                }
            });
        });

        document.querySelectorAll('.favorite-btn').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-product-id');
                toggleFavorite(productId);
            });
        });

        if (isAdmin) {
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const productId = button.getAttribute('data-product-id');
                    openProductModal(productId);
                });
            });

            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const productId = button.getAttribute('data-product-id');
                    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
                        deleteProduct(productId);
                    }
                });
            });
        }

        const totalCountUrl = new URL('http://localhost:3000/products');
        if (search) totalCountUrl.searchParams.append('q', search);
        if (availability) totalCountUrl.searchParams.append('availability', availability);
        if (types.length > 0) totalCountUrl.searchParams.append('type_like', types.join('|'));
        if (minPrice !== null) totalCountUrl.searchParams.append('price_gte', minPrice);
        if (maxPrice !== null) totalCountUrl.searchParams.append('price_lte', maxPrice);
        if (minPower !== null) totalCountUrl.searchParams.append('power_gte', minPower);
        if (maxPower !== null) totalCountUrl.searchParams.append('power_lte', maxPower);
        if (minLuminousFlux !== null) totalCountUrl.searchParams.append('luminous flux_gte', minLuminousFlux);
        if (maxLuminousFlux !== null) totalCountUrl.searchParams.append('luminous flux_lte', maxLuminousFlux);
        if (ip) totalCountUrl.searchParams.append('ip', ip);
        if (minColorTemperature !== null) totalCountUrl.searchParams.append('color temperature_gte', minColorTemperature);
        if (maxColorTemperature !== null) totalCountUrl.searchParams.append('color temperature_lte', maxColorTemperature);
        if (emergencyBlock) totalCountUrl.searchParams.append('emergency block', emergencyBlock);

        const totalCountResponse = await fetch(totalCountUrl);
        const totalCount = (await totalCountResponse.json()).length;
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

        updatePagination(totalPages, page, sort, order, search, availability, types, minPrice, maxPrice, minPower, maxPower, minLuminousFlux, maxLuminousFlux, ip, minColorTemperature, maxColorTemperature, emergencyBlock);
        window.loadTranslations(localStorage.getItem('language') || 'ru', 'catalog');
    } catch (error) {
        console.error('Error fetching products:', error);
        const catalog = document.getElementById('catalog');
        catalog.innerHTML = '<p data-i18n="catalog_error">Ошибка загрузки каталога. Попробуйте позже.</p>';
        window.loadTranslations(localStorage.getItem('language') || 'ru', 'catalog');
    }
}

function updatePagination(totalPages, currentPage, sort, order, search, availability, types, minPrice, maxPrice, minPower, maxPower, minLuminousFlux, maxLuminousFlux, ip, minColorTemperature, maxColorTemperature, emergencyBlock) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    const firstButton = document.createElement('button');
    firstButton.innerHTML = '<i class="fas fa-angle-double-left"></i>';
    firstButton.classList.add('pagination-btn');
    firstButton.disabled = currentPage === 1;
    firstButton.addEventListener('click', () => {
        if (currentPage > 1) {
            loadProducts(sort, order, search, availability, types, minPrice, maxPrice, minPower, maxPower, minLuminousFlux, maxLuminousFlux, ip, minColorTemperature, maxColorTemperature, emergencyBlock, 1);
        }
    });
    pagination.appendChild(firstButton);

    const prevButton = document.createElement('button');
    prevButton.innerHTML = '<i class="fas fa-angle-left"></i>';
    prevButton.classList.add('pagination-btn');
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            loadProducts(sort, order, search, availability, types, minPrice, maxPrice, minPower, maxPower, minLuminousFlux, maxLuminousFlux, ip, minColorTemperature, maxColorTemperature, emergencyBlock, currentPage - 1);
        }
    });
    pagination.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('pagination-btn', 'page-number');
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => {
            if (i !== currentPage) {
                loadProducts(sort, order, search, availability, types, minPrice, maxPrice, minPower, maxPower, minLuminousFlux, maxLuminousFlux, ip, minColorTemperature, maxColorTemperature, emergencyBlock, i);
            }
        });
        pagination.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.innerHTML = '<i class="fas fa-angle-right"></i>';
    nextButton.classList.add('pagination-btn');
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            loadProducts(sort, order, search, availability, types, minPrice, maxPrice, minPower, maxPower, minLuminousFlux, maxLuminousFlux, ip, minColorTemperature, maxColorTemperature, emergencyBlock, currentPage + 1);
        }
    });
    pagination.appendChild(nextButton);

    const lastButton = document.createElement('button');
    lastButton.innerHTML = '<i class="fas fa-angle-double-right"></i>';
    lastButton.classList.add('pagination-btn');
    lastButton.disabled = currentPage === totalPages;
    lastButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            loadProducts(sort, order, search, availability, types, minPrice, maxPrice, minPower, maxPower, minLuminousFlux, maxLuminousFlux, ip, minColorTemperature, maxColorTemperature, emergencyBlock, totalPages);
        }
    });
    pagination.appendChild(lastButton);
}


window.updateCatalogTranslations = function () {
    loadProducts(currentFilters.sort, currentFilters.order, currentFilters.search, currentFilters.availability, currentFilters.types, currentFilters.minPrice, currentFilters.maxPrice, currentFilters.minPower, currentFilters.maxPower, currentFilters.minLuminousFlux, currentFilters.maxLuminousFlux, currentFilters.ip, currentFilters.minColorTemperature, currentFilters.maxColorTemperature, currentFilters.emergencyBlock, currentFilters.page);
};

function updateRange(sliderMin, sliderMax, valueElement, activeRange, unit, minValueElement, maxValueElement) {
    const minPercent = (parseInt(sliderMin.value) / parseInt(sliderMax.max)) * 100;
    const maxPercent = (parseInt(sliderMax.value) / parseInt(sliderMax.max)) * 100;
    activeRange.style.left = `${minPercent}%`;
    activeRange.style.right = `${100 - maxPercent}%`;
    valueElement.textContent = `От ${sliderMin.value} ${unit} до ${sliderMax.value} ${unit}`;
    valueElement.setAttribute('data-i18n', unit === '₽' ? 'price_range' : unit === 'Вт' ? 'power_range' : unit === 'лм' ? 'luminous_flux_range' : 'color_temperature_range');

    if (minValueElement) {
        minValueElement.textContent = `${sliderMin.value} ${unit}`;
    }
    if (maxValueElement) {
        maxValueElement.textContent = `${sliderMax.value} ${unit}`;
    }

    window.loadTranslations(localStorage.getItem('language') || 'ru', 'catalog');
}
function restoreSliderPositions() {
    const saved = sessionStorage.getItem('sliderPositions');
    if (saved) {
        const sliders = JSON.parse(saved);

        const priceSliderMin = document.getElementById('price-slider-min');
        const priceSliderMax = document.getElementById('price-slider-max');
        const powerSliderMin = document.getElementById('power-slider-min');
        const powerSliderMax = document.getElementById('power-slider-max');
        const luminousFluxSliderMin = document.getElementById('luminous-flux-slider-min');
        const luminousFluxSliderMax = document.getElementById('luminous-flux-slider-max');
        const colorTemperatureSliderMin = document.getElementById('color-temperature-slider-min');
        const colorTemperatureSliderMax = document.getElementById('color-temperature-slider-max');

        if (priceSliderMin && sliders.priceMin) priceSliderMin.value = sliders.priceMin;
        if (priceSliderMax && sliders.priceMax) priceSliderMax.value = sliders.priceMax;
        if (powerSliderMin && sliders.powerMin) powerSliderMin.value = sliders.powerMin;
        if (powerSliderMax && sliders.powerMax) powerSliderMax.value = sliders.powerMax;
        if (luminousFluxSliderMin && sliders.luminousFluxMin) luminousFluxSliderMin.value = sliders.luminousFluxMin;
        if (luminousFluxSliderMax && sliders.luminousFluxMax) luminousFluxSliderMax.value = sliders.luminousFluxMax;
        if (colorTemperatureSliderMin && sliders.colorTemperatureMin) colorTemperatureSliderMin.value = sliders.colorTemperatureMin;
        if (colorTemperatureSliderMax && sliders.colorTemperatureMax) colorTemperatureSliderMax.value = sliders.colorTemperatureMax;

        initializeSliders();
    }
}
function initializeSliders() {

    const priceSliderMin = document.getElementById('price-slider-min');
    const priceSliderMax = document.getElementById('price-slider-max');
    const priceValue = document.getElementById('price-value');
    const activeRangePrice = document.querySelector('.price-range .active-range');
    const priceMinValue = document.getElementById('price-min-value');
    const priceMaxValue = document.getElementById('price-max-value');

    if (priceSliderMin && priceSliderMax && priceValue && activeRangePrice) {
        updateRange(priceSliderMin, priceSliderMax, priceValue, activeRangePrice, '₽', priceMinValue, priceMaxValue);

        priceSliderMin.addEventListener('input', () => {
            if (parseInt(priceSliderMin.value) > parseInt(priceSliderMax.value)) {
                priceSliderMin.value = priceSliderMax.value;
            }
            updateRange(priceSliderMin, priceSliderMax, priceValue, activeRangePrice, '₽', priceMinValue, priceMaxValue);
        });

        priceSliderMax.addEventListener('input', () => {
            if (parseInt(priceSliderMax.value) < parseInt(priceSliderMin.value)) {
                priceSliderMax.value = priceSliderMin.value;
            }
            updateRange(priceSliderMin, priceSliderMax, priceValue, activeRangePrice, '₽', priceMinValue, priceMaxValue);
        });
    }

    const powerSliderMin = document.getElementById('power-slider-min');
    const powerSliderMax = document.getElementById('power-slider-max');
    const powerValue = document.getElementById('power-value');
    const activeRangePower = document.querySelector('.power-range .active-range');
    const powerMinValue = document.getElementById('power-min-value');
    const powerMaxValue = document.getElementById('power-max-value');

    if (powerSliderMin && powerSliderMax && powerValue && activeRangePower) {
        updateRange(powerSliderMin, powerSliderMax, powerValue, activeRangePower, 'Вт', powerMinValue, powerMaxValue);

        powerSliderMin.addEventListener('input', () => {
            if (parseInt(powerSliderMin.value) > parseInt(powerSliderMax.value)) {
                powerSliderMin.value = powerSliderMax.value;
            }
            updateRange(powerSliderMin, powerSliderMax, powerValue, activeRangePower, 'Вт', powerMinValue, powerMaxValue);
        });

        powerSliderMax.addEventListener('input', () => {
            if (parseInt(powerSliderMax.value) < parseInt(powerSliderMin.value)) {
                powerSliderMax.value = powerSliderMin.value;
            }
            updateRange(powerSliderMin, powerSliderMax, powerValue, activeRangePower, 'Вт', powerMinValue, powerMaxValue);
        });
    }

    const luminousFluxSliderMin = document.getElementById('luminous-flux-slider-min');
    const luminousFluxSliderMax = document.getElementById('luminous-flux-slider-max');
    const luminousFluxValue = document.getElementById('luminous-flux-value');
    const activeRangeLuminousFlux = document.querySelector('.luminous-flux-range .active-range');
    const luminousFluxMinValue = document.getElementById('luminous-flux-min-value');
    const luminousFluxMaxValue = document.getElementById('luminous-flux-max-value');

    if (luminousFluxSliderMin && luminousFluxSliderMax && luminousFluxValue && activeRangeLuminousFlux) {
        updateRange(luminousFluxSliderMin, luminousFluxSliderMax, luminousFluxValue, activeRangeLuminousFlux, 'лм', luminousFluxMinValue, luminousFluxMaxValue);

        luminousFluxSliderMin.addEventListener('input', () => {
            if (parseInt(luminousFluxSliderMin.value) > parseInt(luminousFluxSliderMax.value)) {
                luminousFluxSliderMin.value = luminousFluxSliderMax.value;
            }
            updateRange(luminousFluxSliderMin, luminousFluxSliderMax, luminousFluxValue, activeRangeLuminousFlux, 'лм', luminousFluxMinValue, luminousFluxMaxValue);
        });

        luminousFluxSliderMax.addEventListener('input', () => {
            if (parseInt(luminousFluxSliderMax.value) < parseInt(luminousFluxSliderMin.value)) {
                luminousFluxSliderMax.value = luminousFluxSliderMin.value;
            }
            updateRange(luminousFluxSliderMin, luminousFluxSliderMax, luminousFluxValue, activeRangeLuminousFlux, 'лм', luminousFluxMinValue, luminousFluxMaxValue);
        });
    }

    const colorTemperatureSliderMin = document.getElementById('color-temperature-slider-min');
    const colorTemperatureSliderMax = document.getElementById('color-temperature-slider-max');
    const colorTemperatureValue = document.getElementById('color-temperature-value');
    const activeRangeColorTemperature = document.querySelector('.color-temperature-range .active-range');
    const colorTemperatureMinValue = document.getElementById('color-temperature-min-value');
    const colorTemperatureMaxValue = document.getElementById('color-temperature-max-value');

    if (colorTemperatureSliderMin && colorTemperatureSliderMax && colorTemperatureValue && activeRangeColorTemperature) {
        updateRange(colorTemperatureSliderMin, colorTemperatureSliderMax, colorTemperatureValue, activeRangeColorTemperature, 'K', colorTemperatureMinValue, colorTemperatureMaxValue);

        colorTemperatureSliderMin.addEventListener('input', () => {
            if (parseInt(colorTemperatureSliderMin.value) > parseInt(colorTemperatureSliderMax.value)) {
                colorTemperatureSliderMin.value = colorTemperatureSliderMax.value;
            }
            updateRange(colorTemperatureSliderMin, colorTemperatureSliderMax, colorTemperatureValue, activeRangeColorTemperature, 'K', colorTemperatureMinValue, colorTemperatureMaxValue);
        });

        colorTemperatureSliderMax.addEventListener('input', () => {
            if (parseInt(colorTemperatureSliderMax.value) < parseInt(colorTemperatureSliderMin.value)) {
                colorTemperatureSliderMax.value = colorTemperatureSliderMin.value;
            }
            updateRange(colorTemperatureSliderMin, colorTemperatureSliderMax, colorTemperatureValue, activeRangeColorTemperature, 'K', colorTemperatureMinValue, colorTemperatureMaxValue);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeFromUrl = urlParams.get('type');
    const initialTypes = typeFromUrl ? [decodeURIComponent(typeFromUrl)] : [];
    loadProducts('name', 'asc', '', '', initialTypes);

    const isAdmin = localStorage.getItem('role') === 'admin';
    if (isAdmin) {
        document.getElementById('admin-controls').style.display = 'flex';
        document.getElementById('save-products').addEventListener('click', () => {
            alert('Функция сохранения каталога пока не реализована.');
        });
        document.getElementById('add-product').addEventListener('click', () => {
            openProductModal();
        });
    }

    document.getElementById('modal-close').addEventListener('click', () => {
        document.getElementById('modal').style.display = 'none';
    });

    document.getElementById('product-form').addEventListener('submit', saveProduct);

    document.getElementById('sort-select').addEventListener('change', (event) => {
        const [sort, order] = event.target.value.split(',');
        const search = document.getElementById('search-input').value.trim();
        const typeCheckboxes = document.querySelectorAll('#filter-panel input[name="type"]:checked');
        const types = Array.from(typeCheckboxes).map(cb => cb.value);
        loadProducts(sort, order, search, currentFilters.availability, types, currentFilters.minPrice, currentFilters.maxPrice, currentFilters.minPower, currentFilters.maxPower, currentFilters.minLuminousFlux, currentFilters.maxLuminousFlux, currentFilters.ip, currentFilters.minColorTemperature, currentFilters.maxColorTemperature, currentFilters.emergencyBlock, currentFilters.page);
    });

    document.getElementById('search-input').addEventListener('input', (event) => {
        const searchQuery = event.target.value.trim();
        const [sort, order] = document.getElementById('sort-select').value.split(',');
        const typeCheckboxes = document.querySelectorAll('#filter-panel input[name="type"]:checked');
        const types = Array.from(typeCheckboxes).map(cb => cb.value);
        loadProducts(sort, order, searchQuery, currentFilters.availability, types, currentFilters.minPrice, currentFilters.maxPrice, currentFilters.minPower, currentFilters.maxPower, currentFilters.minLuminousFlux, currentFilters.maxLuminousFlux, currentFilters.ip, currentFilters.minColorTemperature, currentFilters.maxColorTemperature, currentFilters.emergencyBlock, currentFilters.page);
    });

    const filterButton = document.getElementById('filter-button');
    const filterPanel = document.getElementById('filter-panel');
    const catalog = document.getElementById('catalog');

    filterButton.addEventListener('click', () => {
        console.log('Filter button clicked');
        const isActive = filterPanel.classList.toggle('active');
        catalog.classList.toggle('filter-active', isActive);
        filterButton.classList.toggle('active', isActive);

        if (isActive) {
            const catalogHeight = catalog.scrollHeight;
            filterPanel.style.minHeight = `${catalogHeight}px`;
            catalog.style.height = `${catalogHeight}px`;
        } else {
            filterPanel.style.minHeight = '0';
            catalog.style.height = 'auto';
        }
    });

    document.getElementById('filter-panel').addEventListener('click', (event) => {
        if (event.target.id === 'apply-filters') {
            console.log('Apply filters clicked');

            saveSliderPositions();

            const availability = document.getElementById('availability-in-stock') ? document.getElementById('availability-in-stock').checked : false;
            const typeCheckboxes = document.querySelectorAll('#filter-panel input[name="type"]:checked');
            const types = Array.from(typeCheckboxes).map(cb => cb.value);
            const ipCheckboxes = document.querySelectorAll('input[name="ip"]:checked');
            const ipValues = Array.from(ipCheckboxes).map(cb => cb.value);
            const emergencyBlock = document.getElementById('emergency-block') ? document.getElementById('emergency-block').checked : false;
            const priceSliderMin = document.getElementById('price-slider-min');
            const priceSliderMax = document.getElementById('price-slider-max');
            const powerSliderMin = document.getElementById('power-slider-min');
            const powerSliderMax = document.getElementById('power-slider-max');
            const luminousFluxSliderMin = document.getElementById('luminous-flux-slider-min');
            const luminousFluxSliderMax = document.getElementById('luminous-flux-slider-max');
            const colorTemperatureSliderMin = document.getElementById('color-temperature-slider-min');
            const colorTemperatureSliderMax = document.getElementById('color-temperature-slider-max');

            const minPrice = priceSliderMin ? (parseInt(priceSliderMin.value) === realRanges.price.min ? null : parseInt(priceSliderMin.value)) : null;
            const maxPrice = priceSliderMax ? (parseInt(priceSliderMax.value) === realRanges.price.max ? null : parseInt(priceSliderMax.value)) : null;
            const minPower = powerSliderMin ? (parseInt(powerSliderMin.value) === realRanges.power.min ? null : parseInt(powerSliderMin.value)) : null;
            const maxPower = powerSliderMax ? (parseInt(powerSliderMax.value) === realRanges.power.max ? null : parseInt(powerSliderMax.value)) : null;
            const minLuminousFlux = luminousFluxSliderMin ? (parseInt(luminousFluxSliderMin.value) === realRanges.luminousFlux.min ? null : parseInt(luminousFluxSliderMin.value)) : null;
            const maxLuminousFlux = luminousFluxSliderMax ? (parseInt(luminousFluxSliderMax.value) === realRanges.luminousFlux.max ? null : parseInt(luminousFluxSliderMax.value)) : null;
            const ip = ipValues.length > 0 ? ipValues.join('|') : '';
            const minColorTemperature = colorTemperatureSliderMin ? (parseInt(colorTemperatureSliderMin.value) === realRanges.colorTemperature.min ? null : parseInt(colorTemperatureSliderMin.value)) : null;
            const maxColorTemperature = colorTemperatureSliderMax ? (parseInt(colorTemperatureSliderMax.value) === realRanges.colorTemperature.max ? null : parseInt(colorTemperatureSliderMax.value)) : null;
            const [sort, order] = document.getElementById('sort-select') ? document.getElementById('sort-select').value.split(',') : ['name', 'asc'];
            const search = document.getElementById('search-input') ? document.getElementById('search-input').value.trim() : '';

            console.log('Filters applied:', { types, availability, minPrice, maxPrice, minPower, maxPower, minLuminousFlux, maxLuminousFlux, ip, minColorTemperature, maxColorTemperature, emergencyBlock });
            loadProducts(sort, order, search, availability, types, minPrice, maxPrice, minPower, maxPower, minLuminousFlux, maxLuminousFlux, ip, minColorTemperature, maxColorTemperature, emergencyBlock, 1);

            if (window.innerWidth <= 768) {
                filterPanel.classList.remove('active');
                catalog.classList.remove('filter-active');
                filterButton.classList.remove('active');
                filterPanel.style.minHeight = '0';
                catalog.style.height = 'auto';
            }
        }
    });

    function saveSliderPositions() {
        const sliders = {
            priceMin: document.getElementById('price-slider-min')?.value,
            priceMax: document.getElementById('price-slider-max')?.value,
            powerMin: document.getElementById('power-slider-min')?.value,
            powerMax: document.getElementById('power-slider-max')?.value,
            luminousFluxMin: document.getElementById('luminous-flux-slider-min')?.value,
            luminousFluxMax: document.getElementById('luminous-flux-slider-max')?.value,
            colorTemperatureMin: document.getElementById('color-temperature-slider-min')?.value,
            colorTemperatureMax: document.getElementById('color-temperature-slider-max')?.value
        };
        sessionStorage.setItem('sliderPositions', JSON.stringify(sliders));
    }


    document.getElementById('filter-panel').addEventListener('click', (event) => {
        if (event.target.id === 'reset-filters') {
            console.log('Reset filters clicked');
            sessionStorage.removeItem('sliderPositions');
            const availabilityCheckbox = document.getElementById('availability-in-stock');
            const emergencyBlockCheckbox = document.getElementById('emergency-block');
            if (availabilityCheckbox) availabilityCheckbox.checked = false;
            if (emergencyBlockCheckbox) emergencyBlockCheckbox.checked = false;
            document.querySelectorAll('#filter-panel input[name="type"]').forEach(cb => cb.checked = false);
            document.querySelectorAll('input[name="ip"]').forEach(cb => cb.checked = false);

            const priceSliderMin = document.getElementById('price-slider-min');
            const priceSliderMax = document.getElementById('price-slider-max');
            const powerSliderMin = document.getElementById('power-slider-min');
            const powerSliderMax = document.getElementById('power-slider-max');
            const luminousFluxSliderMin = document.getElementById('luminous-flux-slider-min');
            const luminousFluxSliderMax = document.getElementById('luminous-flux-slider-max');
            const colorTemperatureSliderMin = document.getElementById('color-temperature-slider-min');
            const colorTemperatureSliderMax = document.getElementById('color-temperature-slider-max');

            if (priceSliderMin && priceSliderMax) {
                priceSliderMin.value = realRanges.price.min;
                priceSliderMax.value = realRanges.price.max;
            }
            if (powerSliderMin && powerSliderMax) {
                powerSliderMin.value = realRanges.power.min;
                powerSliderMax.value = realRanges.power.max;
            }
            if (luminousFluxSliderMin && luminousFluxSliderMax) {
                luminousFluxSliderMin.value = realRanges.luminousFlux.min;
                luminousFluxSliderMax.value = realRanges.luminousFlux.max;
            }
            if (colorTemperatureSliderMin && colorTemperatureSliderMax) {
                colorTemperatureSliderMin.value = realRanges.colorTemperature.min;
                colorTemperatureSliderMax.value = realRanges.colorTemperature.max;
            }

            initializeSliders();
            loadProducts();

            if (window.innerWidth <= 768) {
                filterPanel.classList.remove('active');
                catalog.classList.remove('filter-active');
                filterButton.classList.remove('active');
                filterPanel.style.minHeight = '0';
                catalog.style.height = 'auto';
            }
        }
    });
});