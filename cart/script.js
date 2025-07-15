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
        cartItemsContainer.innerHTML = '';

        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<p>Корзина пуста.</p>';
            console.log('No cart items found.');
            document.getElementById('total-cost').textContent = '0 ₽';
            checkoutButton.disabled = true;
            return;
        }

        const productIds = cartItems.map(item => item.productId);
        const productsResponse = await fetch(`http://localhost:3000/products?id=${productIds.join(',')}`);
        if (!productsResponse.ok) {
            throw new Error(`HTTP error! Status: ${productsResponse.status}`);
        }
        const products = await productsResponse.json();

        let totalCost = 0;
        cartItems.forEach(item => {
            const product = products.find(p => p.id.toString() === item.productId);
            if (product) {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.className = 'cart-item';
                cartItemDiv.innerHTML = `
                    <button class="delete-btn" data-cart-id="${item.id}" aria-label="Удалить товар из корзины"><i class="fas fa-trash"></i></button>
                    <img src="../img/catalog/${product.id}.png" alt="${product.name}" onerror="this.src='../img/catalog/fallback.png'">
                    <div class="text-content">
                        <p class="accent">${product.availability ? 'Есть в наличии' : 'Нет в наличии'}</p>
                        <p class="type">${product.type}</p>
                        <p class="name">${product.name}</p>
                        <p class="price">${product.price === null ? 'Цена по запросу' : product.price + ' ₽'}</p>
                    </div>
                    <div class="cart-control">
                        <button class="cart-decrement" data-cart-id="${item.id}" aria-label="Уменьшить количество">-</button>
                        <span class="cart-quantity">${item.quantity}</span>
                        <button class="cart-increment" data-cart-id="${item.id}" aria-label="Увеличить количество">+</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemDiv);

                if (product.price !== null) {
                    totalCost += product.price * item.quantity;
                }
            }
        });

        document.getElementById('total-cost').textContent = totalCost > 0 ? `${totalCost} ₽` : 'Цена по запросу';
        if (!isAdmin && cartItems.length > 0) {
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
    } catch (error) {
        console.error('Error fetching cart:', error);
        const cartItemsContainer = document.getElementById('cart-items');
        cartItemsContainer.innerHTML = '<p>Ошибка загрузки корзины. Попробуйте позже.</p>';
        document.getElementById('total-cost').textContent = '0 ₽';
        document.getElementById('checkout-button').disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCart();

    document.getElementById('checkout-button').addEventListener('click', () => {
        checkout();
    });
});