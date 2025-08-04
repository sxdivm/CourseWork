document.addEventListener('DOMContentLoaded', function() {
    fetch('../header/index.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const header = doc.querySelector('header');
            if (header) {
                document.body.insertBefore(header, document.body.firstChild);
                updateCounts();
                updateLoginText();
                addAccessibilityButton();
            }
        })
        .catch(error => console.error('Error loading header:', error));

    function updateCounts() {
        const userId = localStorage.getItem('userId');
        const phoneElement = document.querySelector('.phone');

        if (!userId) {
            document.querySelectorAll('.cart-count').forEach(el => el.textContent = '');
            document.querySelectorAll('.fav-count').forEach(el => el.textContent = '');
            if (phoneElement) {
                phoneElement.style.paddingLeft = '4.75rem';
            }
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
                updatePhonePadding();
            })
            .catch(error => {
                console.error('Error fetching cart count:', error);
                document.querySelectorAll('.cart-count').forEach(el => el.textContent = '');
                updatePhonePadding();
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
                updatePhonePadding();
            })
            .catch(error => {
                console.error('Error fetching favorites count:', error);
                document.querySelectorAll('.fav-count').forEach(el => el.textContent = '');
                updatePhonePadding();
            });

        function updatePhonePadding() {
            const cartCountText = document.querySelector('.cart-count')?.textContent;
            const favCountText = document.querySelector('.fav-count')?.textContent;
            if (phoneElement) {
                if (cartCountText || favCountText) {
                    phoneElement.style.paddingLeft = '6.2rem';
                } else {
                    phoneElement.style.paddingLeft = '4.75rem';
                }
            }
        }
    }

    function updateLoginText() {
        const userId = localStorage.getItem('userId');
        document.querySelectorAll('.login a').forEach(loginLink => {
            if (userId) {
                loginLink.textContent = 'Профиль';
                loginLink.href = '../profile/index.html';
            } else {
                loginLink.textContent = 'Войти';
                loginLink.href = '../login/index.html';
            }
        });
    }

    function addAccessibilityButton() {
        // Проверяем, что текущая страница — home
        if (window.location.pathname.includes('/home/index.html') || window.location.pathname === '/home/') {
            const leftPart = document.querySelector('.left_part');
            const mobileLeftPart = document.querySelector('.mobile-pre-header .left_part');
            if (leftPart) {
                const accessButton = document.createElement('button');
                accessButton.className = 'accessibility';
                accessButton.innerHTML = '<iconify-icon icon="bi:eye-fill"></iconify-icon>';
                leftPart.appendChild(accessButton);
            }
            if (mobileLeftPart) {
                const mobileAccessButton = document.createElement('button');
                mobileAccessButton.className = 'accessibility';
                mobileAccessButton.innerHTML = '<iconify-icon icon="bi:eye-fill"></iconify-icon>';
                mobileLeftPart.appendChild(mobileAccessButton);
            }

            // Создаем модальное окно
            const modal = document.createElement('div');
            modal.className = 'accessibility-modal';
            modal.style.display = 'none';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Версия для слабовидящих</h2>
                    <div class="option">
                        <label>Размер шрифта:</label>
                        <select id="fontSize">
                            <option value="normal">Обычный</option>
                            <option value="large">Большой</option>
                            <option value="extra-large">Очень большой</option>
                        </select>
                    </div>
                    <div class="option">
                        <label>Цветовая схема:</label>
                        <select id="colorScheme">
                            <option value="default">По умолчанию</option>
                            <option value="black-green">Чёрный фон, зелёный текст</option>
                            <option value="beige-brown">Бежевый фон, коричневый текст</option>
                            <option value="blue-darkblue">Голубой фон, тёмно-синий текст</option>
                        </select>
                    </div>
                    <div class="option">
                        <label>
                            <input type="checkbox" id="hideImages"> Отключить изображения
                        </label>
                    </div>
                    <button id="saveSettings">Сохранить</button>
                </div>
            `;
            document.body.appendChild(modal);

            // Обработчики для модального окна
            const closeModal = modal.querySelector('.close');
            const saveButton = modal.querySelector('#saveSettings');

            const accessButtons = document.querySelectorAll('.accessibility');
            accessButtons.forEach(button => {
                button.addEventListener('click', () => {
                    modal.style.display = 'block';
                });
            });

            closeModal.addEventListener('click', () => {
                modal.style.display = 'none';
            });

            // Передача управления сохранением настроек в accessibility.js
            saveButton.addEventListener('click', () => {
                const fontSizeSelect = modal.querySelector('#fontSize');
                const colorSchemeSelect = modal.querySelector('#colorScheme');
                const hideImagesCheckbox = modal.querySelector('#hideImages');

                const fontSize = fontSizeSelect.value;
                const colorScheme = colorSchemeSelect.value;
                const hideImages = hideImagesCheckbox.checked;

                // Сохраняем настройки в localStorage
                localStorage.setItem('accessibilityFontSize', fontSize);
                localStorage.setItem('accessibilityColorScheme', colorScheme);
                localStorage.setItem('accessibilityHideImages', hideImages);

                // Вызываем функцию из accessibility.js
                if (typeof applyAccessibilitySettings === 'function') {
                    applyAccessibilitySettings();
                }
                modal.style.display = 'none';
            });
        }
    }
});