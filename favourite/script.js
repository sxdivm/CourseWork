async function loadFavorites() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.log('Пользователь не авторизован, перенаправление на страницу логина');
            window.location.href = '../login/index.html';
            return;
        }

        const lang = localStorage.getItem('language') || 'ru';
        await new Promise((resolve) => {
            window.loadTranslations(lang, 'favourite', resolve);
        });

        const response = await fetch(`http://localhost:3000/favorites?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const favorites = await response.json();
        console.log('Favorites received:', favorites);

        const catalog = document.getElementById('catalog');
        catalog.innerHTML = '';

        if (favorites.length === 0) {
            catalog.innerHTML = '<p data-i18n="empty_favorites">В избранном пока нет товаров.</p>';
            window.loadTranslations(lang, 'favourite');
            return;
        }

        const productIds = favorites.map(fav => fav.productId);
        
        
        const products = [];
        for (const productId of productIds) {
            try {
                const productResponse = await fetch(`http://localhost:3000/products/${productId}`);
                if (productResponse.ok) {
                    const product = await productResponse.json();
                    products.push(product);
                }
            } catch (error) {
                console.error(`Error loading product ${productId}:`, error);
            }
        }

        console.log('Products received:', products);

        const cartResponse = await fetch(`http://localhost:3000/cart?userId=${userId}`);
        const cartItems = await cartResponse.json();
        console.log('Cart items received:', cartItems);

        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product';
            const cartItem = cartItems.find(item => item.productId === product.id.toString());
            let buttonContent = '';
            if (cartItem) {
                buttonContent = `
                    <div class="cart-control">
                        <button class="cart-decrement" data-product-id="${product.id}" data-cart-id="${cartItem.id}" data-i18n-aria-label="decrease_quantity">-</button>
                        <span class="cart-quantity">${cartItem.quantity}</span>
                        <button class="cart-increment" data-product-id="${product.id}" data-cart-id="${cartItem.id}" data-i18n-aria-label="increase_quantity">+</button>
                    </div>
                `;
            } else {
                buttonContent = `<button class="add-to-cart" data-product-id="${product.id}"><i class="fas fa-shopping-cart"></i></button>`;
            }
            productDiv.innerHTML = `
                <button class="favorite-btn active" data-product-id="${product.id}" data-i18n-aria-label="remove_from_favorites">
                    <i class="fa-solid fa-heart"></i>
                </button>
                <img src="../img/catalog/${product.id}.png" alt="${lang === 'ru' ? product.name : product.en_name || product.name}" onerror="this.src='../img/catalog/fallback.png'">
                <div class="text-content">
                    <p class="accent" data-i18n="${product.availability ? 'availability_in_stock' : 'availability_out_of_stock'}">${product.availability ? 'Есть в наличии' : 'Нет в наличии'}</p>
                    <p class="type">${lang === 'ru' ? product.type : product.en_type || product.type}</p>
                    <p class="name">${lang === 'ru' ? product.name : product.en_name || product.name}</p>
                    <p class="price" data-i18n="${product.price === null ? 'price_on_request' : ''}">${product.price === null ? 'Цена по запросу' : product.price + ' ₽'}</p>
                </div>
                ${buttonContent}
            `;
            catalog.appendChild(productDiv);
        });

        window.loadTranslations(lang, 'favourite');
        setupEventListeners();
        
    } catch (error) {
        console.error('Error fetching favorites:', error);
        const catalog = document.getElementById('catalog');
        const translations = window.translationsCache ? window.translationsCache[`${localStorage.getItem('language') || 'ru'}_favourite`] || {} : {};
        catalog.innerHTML = `<p data-i18n="error_loading">${translations.error_loading || 'Ошибка загрузки избранного. Попробуйте позже.'}</p>`;
        window.loadTranslations(localStorage.getItem('language') || 'ru', 'favourite');
    }
}

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

            updateCartButton(productId, cartItem.id, newQuantity);
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

            const newCartItem = await response.json();
            console.log('Товар добавлен в корзину:', newCartItem);

            updateCartButton(productId, newCartItem.id, 1);
        }
    } catch (error) {
        console.error('Ошибка при добавлении в корзину:', error);
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

        updateQuantityDisplay(cartItemId, newQuantity);
    } catch (error) {
        console.error('Ошибка при обновлении количества:', error);
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

            removeProductFromDOM(productId);
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
        }
    } catch (error) {
        console.error('Ошибка при работе с избранным:', error);
    }
}

function updateCartButton(productId, cartItemId, quantity) {
    const productElement = document.querySelector(`.product [data-product-id="${productId}"]`).closest('.product');
    const buttonContainer = productElement.querySelector('.add-to-cart, .cart-control');
    
    if (quantity === 1) {

        buttonContainer.outerHTML = `
            <div class="cart-control">
                <button class="cart-decrement" data-product-id="${productId}" data-cart-id="${cartItemId}" data-i18n-aria-label="decrease_quantity">-</button>
                <span class="cart-quantity">${quantity}</span>
                <button class="cart-increment" data-product-id="${productId}" data-cart-id="${cartItemId}" data-i18n-aria-label="increase_quantity">+</button>
            </div>
        `;
    } else {

        const quantityElement = productElement.querySelector('.cart-quantity');
        if (quantityElement) {
            quantityElement.textContent = quantity;
        }
    }
}

function updateQuantityDisplay(cartItemId, quantity) {
    const quantityElement = document.querySelector(`[data-cart-id="${cartItemId}"]`).closest('.cart-control').querySelector('.cart-quantity');
    if (quantityElement) {
        quantityElement.textContent = quantity;
    }
}

function removeProductFromDOM(productId) {
    const productElement = document.querySelector(`.product [data-product-id="${productId}"]`).closest('.product');
    if (productElement) {
        productElement.remove();

        const catalog = document.getElementById('catalog');
        if (catalog.children.length === 0) {
            catalog.innerHTML = '<p data-i18n="empty_favorites">В избранном пока нет товаров.</p>';
            window.loadTranslations(localStorage.getItem('language') || 'ru', 'favourite');
        }
    }
}

function setupEventListeners() {
    const catalog = document.getElementById('catalog');
    if (!catalog) return;

    catalog.addEventListener('click', (e) => {
        const addToCartBtn = e.target.closest('.add-to-cart');
        if (addToCartBtn) {
            e.preventDefault();
            e.stopPropagation();
            const productId = addToCartBtn.getAttribute('data-product-id');
            console.log('Add to cart clicked for product:', productId);
            addToCart(productId);
            return;
        }

        const incrementBtn = e.target.closest('.cart-increment');
        if (incrementBtn) {
            e.preventDefault();
            e.stopPropagation();
            const cartId = incrementBtn.getAttribute('data-cart-id');
            const quantityElement = incrementBtn.previousElementSibling;
            const currentQuantity = parseInt(quantityElement.textContent);
            if (currentQuantity < 99) {
                console.log('Increment clicked for cart item:', cartId);
                updateCartItemQuantity(cartId, currentQuantity + 1);
            }
            return;
        }

        const decrementBtn = e.target.closest('.cart-decrement');
        if (decrementBtn) {
            e.preventDefault();
            e.stopPropagation();
            const cartId = decrementBtn.getAttribute('data-cart-id');
            const quantityElement = decrementBtn.nextElementSibling;
            const currentQuantity = parseInt(quantityElement.textContent);
            if (currentQuantity > 1) {
                console.log('Decrement clicked for cart item:', cartId);
                updateCartItemQuantity(cartId, currentQuantity - 1);
            }
            return;
        }

        const favoriteBtn = e.target.closest('.favorite-btn');
        if (favoriteBtn) {
            e.preventDefault();
            e.stopPropagation();
            const productId = favoriteBtn.getAttribute('data-product-id');
            console.log('Favorite toggle clicked for product:', productId);
            toggleFavorite(productId);
            return;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
});

window.addEventListener('languageChanged', (event) => {
    const lang = event.detail.lang;
    loadFavorites(); 
});