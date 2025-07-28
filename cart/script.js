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
        loadCart();
    } catch (error) {
        console.error('Ошибка при обновлении количества:', error);
        alert('Ошибка при обновлении количества товара. Попробуйте позже.');
    }
}

async function deleteCartItem(cartItemId) {
    try {
        const response = await fetch(`http://localhost:3000/cart/${cartItemId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
        }

        console.log('Товар удален из корзины:', cartItemId);
        alert('Товар удален из корзины!');
        loadCart();
    } catch (error) {
        console.error('Ошибка при удалении товара из корзины:', error);
        alert('Ошибка при удалении товара из корзины. Попробуйте позже.');
    }
}

async function checkout() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.log('Пользователь не авторизован, перенаправление на страницу логина');
            window.location.href = '../login/index.html';
            return;
        }

        const cartResponse = await fetch(`http://localhost:3000/cart?userId=${userId}`);
        const cartItems = await cartResponse.json();

        if (cartItems.length === 0) {
            alert('Корзина пуста!');
            return;
        }

        const productIds = cartItems.map(item => item.productId);
        const productsResponse = await fetch(`http://localhost:3000/products?id=${productIds.join(',')}`);
        const products = await productsResponse.json();

        let totalCost = 0;
        cartItems.forEach(item => {
            const product = products.find(p => p.id.toString() === item.productId);
            if (product && product.price !== null) {
                totalCost += product.price * item.quantity;
            }
        });

        const order = {
            userId,
            totalCost,
            productIds
        };

        const orderResponse = await fetch('http://localhost:3000/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });

        if (!orderResponse.ok) {
            throw new Error(`Ошибка HTTP! Статус: ${orderResponse.status}`);
        }

        for (const item of cartItems) {
            const deleteResponse = await fetch(`http://localhost:3000/cart/${item.id}`, {
                method: 'DELETE'
            });
            if (!deleteResponse.ok) {
                throw new Error(`Ошибка HTTP при очистке корзины! Статус: ${deleteResponse.status}`);
            }
        }

        console.log('Заказ оформлен:', await orderResponse.json());
        alert('Заказ успешно оформлен!');
        loadCart();
    } catch (error) {
        console.error('Ошибка при оформлении заказа:', error);
        alert('Ошибка при оформлении заказа. Попробуйте позже.');
    }
}

let cartItemsData = []; 

async function loadCart() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.log('Пользователь не авторизован, перенаправление на страницу логина');
            window.location.href = '../login/index.html';
            return;
        }

        const isAdmin = localStorage.getItem('role') === 'admin';
        const checkoutButton = document.getElementById('checkout-button');
        const adminMessage = document.getElementById('admin-message');
        const totalCostSpan = document.getElementById('total-cost');

        if (!checkoutButton || !adminMessage || !totalCostSpan) {
            console.error('One or more DOM elements not found:', { checkoutButton, adminMessage, totalCostSpan });
            return;
        }

        if (isAdmin) {
            checkoutButton.disabled = true;
            adminMessage.style.display = 'block';
        } else {
            checkoutButton.disabled = false;
            adminMessage.style.display = 'none';
        }

        const response = await fetch(`http://localhost:3000/cart?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const cartItems = await response.json();
        console.log('Cart items received:', cartItems);

        const cartItemsContainer = document.getElementById('cart-items');
        if (!cartItemsContainer) {
            console.error('Cart items container not found');
            return;
        }

        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<p data-i18n="cart_empty">Корзина пуста.</p>';
            console.log('No cart items found.');
            totalCostSpan.textContent = '0 ₽';
            checkoutButton.disabled = true;
            window.loadTranslations(localStorage.getItem('language') || 'ru', 'cart');
            return;
        }

        const productIds = cartItems.map(item => item.productId);
        const productsResponse = await fetch(`http://localhost:3000/products?id=${productIds.join(',')}`);
        if (!productsResponse.ok) {
            throw new Error(`HTTP error! Status: ${productsResponse.status}`);
        }
        const products = await productsResponse.json();
        cartItemsData = cartItems.map(item => ({
            ...item,
            product: products.find(p => p.id.toString() === item.productId)
        }));

        renderCartItems(localStorage.getItem('language') || 'ru');

        function renderCartItems(lang) {
            console.log('Rendering cart items with language:', lang, 'Data:', cartItemsData);
            const cartItemsContainer = document.getElementById('cart-items');
            if (!cartItemsContainer) {
                console.error('Cart items container not found during render');
                return;
            }
            cartItemsContainer.innerHTML = ''; // Полная перерисовка контейнера

            let totalCost = 0;
            cartItemsData.forEach(item => {
                if (item.product) {
                    const name = lang === 'en' ? item.product.en_name || item.product.name : item.product.name;
                    const type = lang === 'en' ? item.product.en_type || item.product.type : item.product.type;
                    console.log(`Rendering item ${item.id}: name=${name}, type=${type}`);
                    const cartItemDiv = document.createElement('div');
                    cartItemDiv.className = 'cart-item';
                    cartItemDiv.setAttribute('data-cart-id', item.id);
                    cartItemDiv.innerHTML = `
                        <button class="delete-btn" data-cart-id="${item.id}" aria-label="Удалить товар из корзины"><i class="fas fa-trash"></i></button>
                        <img src="../img/catalog/${item.product.id}.png" alt="${name}" onerror="this.src='../img/catalog/fallback.png'">
                        <div class="text-content">
                            <p class="accent" data-i18n="${item.product.availability ? 'in_stock' : 'out_of_stock'}">${item.product.availability ? 'Есть в наличии' : 'Нет в наличии'}</p>
                            <p class="type">${type}</p>
                            <p class="name">${name}</p>
                            <p class="price">${item.product.price === null ? 'Цена по запросу' : item.product.price + ' ₽'}</p>
                        </div>
                        <div class="cart-control">
                            <button class="cart-decrement" data-cart-id="${item.id}" aria-label="Уменьшить количество">-</button>
                            <span class="cart-quantity">${item.quantity}</span>
                            <button class="cart-increment" data-cart-id="${item.id}" aria-label="Увеличить количество">+</button>
                        </div>
                    `;
                    cartItemsContainer.appendChild(cartItemDiv);

                    if (item.product.price !== null) {
                        totalCost += item.product.price * item.quantity;
                    }
                } else {
                    console.warn('Product data not found for item:', item);
                }
            });

            const itemsList = document.getElementById('items-list');
            if (itemsList) {
                itemsList.innerHTML = '';
                cartItemsData.forEach(item => {
                    if (item.product) {
                        const name = lang === 'en' ? item.product.en_name || item.product.name : item.product.name;
                        const li = document.createElement('li');
                        li.innerHTML = `<span class="item-name">${name}</span><span>${item.quantity} .</span>`;
                        itemsList.appendChild(li);
                    }
                });
            }

            const totalCostSpan = document.getElementById('total-cost');
            if (totalCostSpan) {
                totalCostSpan.textContent = totalCost > 0 ? `${totalCost} ₽` : 'Цена по запросу';
            }

            const checkoutButton = document.getElementById('checkout-button');
            if (checkoutButton && !isAdmin && cartItemsData.length > 0) {
                checkoutButton.disabled = false;
            }

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

            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const cartId = button.getAttribute('data-cart-id');
                    if (confirm('Вы уверены, что хотите удалить этот товар из корзины?')) {
                        deleteCartItem(cartId);
                    }
                });
            });

            window.loadTranslations(lang, 'cart');
        }
    } catch (error) {
        console.error('Error fetching cart:', error);
        const cartItemsContainer = document.getElementById('cart-items');
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '<p data-i18n="cart_error">Ошибка загрузки корзины. Попробуйте позже.</p>';
        }
        const totalCostSpan = document.getElementById('total-cost');
        if (totalCostSpan) {
            totalCostSpan.textContent = '0 ₽';
        }
        const checkoutButton = document.getElementById('checkout-button');
        if (checkoutButton) {
            checkoutButton.disabled = true;
        }
        window.loadTranslations(localStorage.getItem('language') || 'ru', 'cart');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCart();

    document.getElementById('checkout-button')?.addEventListener('click', () => {
        checkout();
    });

    window.addEventListener('languageChanged', (event) => {
        try {
            const newLang = event.detail.lang;
            console.log('Language changed to:', newLang);
            location.reload();
        } catch (error) {
            console.error('Error in languageChanged event:', error);
        }
    });
});