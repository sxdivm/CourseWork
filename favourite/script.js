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

        loadFavorites();
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
        }

        loadFavorites();
    } catch (error) {
        console.error('Ошибка при удалении из избранного:', error);
        alert('Ошибка при удалении товара из избранного. Попробуйте позже.');
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
        loadFavorites();
    } catch (error) {
        console.error('Ошибка при обновлении количества:', error);
        alert('Ошибка при обновлении количества товара. Попробуйте позже.');
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

        const response = await fetch(`http://localhost:3000/favorites?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const favorites = await response.json();
        console.log('Favorites received:', favorites);

        const catalog = document.getElementById('catalog');
        catalog.innerHTML = '';

        if (favorites.length === 0) {
            catalog.innerHTML = '<p>В избранном пока нет товаров.</p>';
            console.log('No favorites found.');
            return;
        }

        const productIds = favorites.map(fav => fav.productId);
        const productsResponse = await fetch(`http://localhost:3000/products?id=${productIds.join(',')}`);
        if (!productsResponse.ok) {
            throw new Error(`HTTP error! Status: ${productsResponse.status}`);
        }
        const products = await productsResponse.json();

        const cartResponse = await fetch(`http://localhost:3000/cart?userId=${userId}`);
        const cartItems = await cartResponse.json();

        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product';
            const cartItem = cartItems.find(item => item.productId === product.id.toString());
            let buttonContent = '';
            if (cartItem) {
                buttonContent = `
                    <div class="cart-control">
                        <button class="cart-decrement" data-product-id="${product.id}" data-cart-id="${cartItem.id}" aria-label="Уменьшить количество">-</button>
                        <span class="cart-quantity">${cartItem.quantity}</span>
                        <button class="cart-increment" data-product-id="${product.id}" data-cart-id="${cartItem.id}" aria-label="Увеличить количество">+</button>
                    </div>
                `;
            } else {
                buttonContent = `<button class="add-to-cart" data-product-id="${product.id}"><i class="fas fa-shopping-cart"></i></button>`;
            }
            productDiv.innerHTML = `
                <button class="favorite-btn active" data-product-id="${product.id}" aria-label="Удалить из избранного">
                    <i class="fa-solid fa-heart"></i>
                </button>
                <img src="../img/catalog/${product.id}.png" alt="${product.name}" onerror="this.src='../img/catalog/fallback.png'">
                <div class="text-content">
                    <p class="accent">${product.availability ? 'Есть в наличии' : 'Нет в наличии'}</p>
                    <p class="type">${product.type}</p>
                    <p class="name">${product.name}</p>
                    <p class="price">${product.price === null ? 'Цена по запросу' : product.price + ' ₽'}</p>
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
    } catch (error) {
        console.error('Error fetching favorites:', error);
        const catalog = document.getElementById('catalog');
        catalog.innerHTML = '<p>Ошибка загрузки избранного. Попробуйте позже.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
});