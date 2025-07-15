document.addEventListener('DOMContentLoaded', function() {

    fetch('../header/index.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const header = doc.querySelector('header');
            if (header) {
                document.body.insertBefore(header, document.body.firstChild);
            }
            updateCounts();
        })
        .catch(error => console.error('Error loading header:', error));

    function updateCounts() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            document.querySelectorAll('.cart-count').forEach(el => el.textContent = '');
            document.querySelectorAll('.fav-count').forEach(el => el.textContent = '');
            return;
        }

        fetch(`http://localhost:3000/cart?userId=${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(cartItems => {
                const cartCount = cartItems.length;
                document.querySelectorAll('.cart-count').forEach(el => {
                    el.textContent = cartCount > 0 ? `(${cartCount})` : '';
                });
            })
            .catch(error => {
                console.error('Error fetching cart count:', error);
                document.querySelectorAll('.cart-count').forEach(el => el.textContent = '');
            });

        fetch(`http://localhost:3000/favorites?userId=${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(favorites => {
                const favCount = favorites.length;
                document.querySelectorAll('.fav-count').forEach(el => {
                    el.textContent = favCount > 0 ? `(${favCount})` : '';
                });
            })
            .catch(error => {
                console.error('Error fetching favorites count:', error);
                document.querySelectorAll('.fav-count').forEach(el => el.textContent = '');
            });
    }
});