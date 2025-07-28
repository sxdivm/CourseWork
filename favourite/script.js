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
        const translations = translationsCache[`${localStorage.getItem('language') || 'ru'}_favourite`] || {};

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
            alert(translations.item_quantity_updated || 'Item quantity updated in cart!');
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
            alert(translations.item_added_to_cart || 'Item added to cart!');
        }

        await loadFavorites();
    } catch (error) {
        console.error('Ошибка при добавлении в корзину:', error);
        const translations = translationsCache[`${localStorage.getItem('language') || 'ru'}_favourite`] || {};
        alert(translations.error_adding_to_cart || 'Error adding item to cart. Please try again later.');
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
        const translations = translationsCache[`${localStorage.getItem('language') || 'ru'}_favourite`] || {};

        if (favorites.length > 0) {
            const favorite = favorites[0];
            const deleteResponse = await fetch(`http://localhost:3000/favorites/${favorite.id}`, {
                method: 'DELETE'
            });

            if (!deleteResponse.ok) {
                throw new Error(`Ошибка HTTP! Статус: ${deleteResponse.status}`);
            }

            console.log('Товар удален из избранного');
            alert(translations.item_removed_from_favorites || 'Item removed from favorites!');
        }

        await loadFavorites();
    } catch (error) {
        console.error('Ошибка при удалении из избранного:', error);
        const translations = translationsCache[`${localStorage.getItem('language') || 'ru'}_favourite`] || {};
        alert(translations.error_removing_from_favorites || 'Error removing item from favorites. Please try again later.');
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
        await loadFavorites();
    } catch (error) {
        console.error('Ошибка при обновлении количества:', error);
        const translations = translationsCache[`${localStorage.getItem('language') || 'ru'}_favourite`] || {};
        alert(translations.error_updating_quantity || 'Error updating item quantity. Please try again later.');
    }
}

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
        const productsResponse = await fetch(`http://localhost:3000/products?id=${productIds.join(',')}`);
        if (!productsResponse.ok) {
            throw new Error(`HTTP error! Status: ${productsResponse.status}`);
        }
        const products = await productsResponse.json();
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
    } catch (error) {
        console.error('Error fetching favorites:', error);
        const catalog = document.getElementById('catalog');
        const translations = translationsCache[`${localStorage.getItem('language') || 'ru'}_favourite`] || {};
        catalog.innerHTML = `<p data-i18n="error_loading">${translations.error_loading || 'Ошибка загрузки избранного. Попробуйте позже.'}</p>`;
        window.loadTranslations(localStorage.getItem('language') || 'ru', 'favourite');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
});


window.addEventListener('languageChanged', (event) => {
    const lang = event.detail.lang;
    loadFavorites(); 
});