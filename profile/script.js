document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profile-form');
    const nicknameInput = document.getElementById('nickname');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('password-confirm');
    const submitButton = document.getElementById('submit-button');
    const logoutButton = document.getElementById('logout-button');
    const regenerateButton = document.getElementById('regenerate-nickname');
    const nicknameError = document.getElementById('nickname-error');
    const emailError = document.getElementById('email-error');
    const phoneError = document.getElementById('phone-error');
    const passwordError = document.getElementById('password-error');
    const passwordConfirmError = document.getElementById('password-confirm-error');
    const nicknameAttempts = document.getElementById('nickname-attempts');
    let remainingAttempts = 5;
    let translations = {};
    let initialLoad = true;
    let originalUserData = {}; // Сохраняем оригинальные данные

    // ... существующий код проверки элементов ...

    function setInitialNicknameAttemptsText() {
        const currentLang = localStorage.getItem('language') || 'ru';
        nicknameAttempts.textContent = currentLang === 'ru' 
            ? `Осталось попыток генерации: ${remainingAttempts}` 
            : `Remaining generation attempts: ${remainingAttempts}`;
    }

    function updateProfileTranslations() {
        const currentLang = localStorage.getItem('language') || 'ru';
        try {
            window.loadTranslations(currentLang, 'profile', (trans) => {
                translations = trans || {};
                nicknameAttempts.textContent = (translations.nickname_attempts || (currentLang === 'ru' ? 'Осталось попыток генерации: {count}' : 'Remaining generation attempts: {count}')).replace('{count}', remainingAttempts);
                regenerateButton.disabled = remainingAttempts <= 0;
                if (remainingAttempts <= 0) {
                    nicknameAttempts.textContent = translations.error_no_attempts || (currentLang === 'ru' ? 'Попытки генерации закончились' : 'No generation attempts left');
                }
                
                checkFormFilled();
            });
        } catch (error) {
            console.error('Error in updateProfileTranslations:', error);
            nicknameAttempts.textContent = currentLang === 'ru' ? `Осталось попыток генерации: ${remainingAttempts}` : `Remaining generation attempts: ${remainingAttempts}`;
        }
    }

    function checkFormFilled() {
        // Проверяем, что никнейм заполнен и валиден (единственное обязательное поле)
        const nicknameValid = nicknameInput.value.trim() !== '' && nicknameInput.value.trim().length >= 3;
        
        // Email и phone теперь необязательные, но если заполнены - должны быть валидны
        const emailValid = emailInput.value.trim() === '' || validateEmail(emailInput.value);
        const phoneValid = phoneInput.value.trim() === '' || validatePhone(phoneInput.value);
        
        // Проверяем пароли: либо оба пустые, либо оба заполнены и совпадают
        const passwordsValid = (passwordInput.value === '' && passwordConfirmInput.value === '') || 
                              (passwordInput.value !== '' && passwordInput.value === passwordConfirmInput.value && passwordInput.value.length >= 6);
        
        // При первоначальной загрузке не показываем ошибки
        const noErrors = initialLoad ? true : (
            !nicknameError.textContent && 
            !emailError.textContent && 
            !phoneError.textContent && 
            !passwordError.textContent && 
            !passwordConfirmError.textContent
        );
        
        // Проверяем, есть ли изменения в форме
        const hasChanges = hasFormChanges();
        
        console.log('Form validation:', {
            nicknameValid,
            emailValid,
            phoneValid,
            passwordsValid,
            noErrors,
            hasChanges,
            initialLoad,
            nickname: nicknameInput.value,
            email: emailInput.value,
            phone: phoneInput.value
        });
        
        submitButton.disabled = !(nicknameValid && emailValid && phoneValid && passwordsValid && noErrors && hasChanges);
    }

    // Проверяем, есть ли изменения в форме
    function hasFormChanges() {
        // Проверяем изменения в основных полях
        const nicknameChanged = nicknameInput.value.trim() !== originalUserData.nickname;
        const emailChanged = emailInput.value.trim() !== originalUserData.email;
        const phoneChanged = phoneInput.value.trim() !== originalUserData.phone;
        
        // Проверяем, введен ли новый пароль
        const passwordChanged = passwordInput.value.trim() !== '';
        
        console.log('Form changes:', {
            nicknameChanged,
            emailChanged,
            phoneChanged,
            passwordChanged,
            originalNickname: originalUserData.nickname,
            currentNickname: nicknameInput.value.trim(),
            originalEmail: originalUserData.email,
            currentEmail: emailInput.value.trim(),
            originalPhone: originalUserData.phone,
            currentPhone: phoneInput.value.trim()
        });
        
        return nicknameChanged || emailChanged || phoneChanged || passwordChanged;
    }

    // Вспомогательные функции валидации
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePhone(phone) {
        // Более гибкая валидация телефона
        const phoneRegex = /^\+375\s?\(?\d{2}\)?\s?\d{3}-?\d{2}-?\d{2}$/;
        return phoneRegex.test(phone);
    }

    // Функция для форматирования телефона
    function formatPhoneNumber(phone) {
        // Удаляем все нецифровые символы, кроме +
        let cleaned = phone.replace(/[^\d+]/g, '');
        
        // Если номер начинается с 375, добавляем +
        if (cleaned.startsWith('375') && !cleaned.startsWith('+375')) {
            cleaned = '+' + cleaned;
        }
        
        // Форматируем в нужный формат
        if (cleaned.startsWith('+375') && cleaned.length === 13) {
            const part1 = cleaned.substring(0, 4); // +375
            const part2 = cleaned.substring(4, 6); // 29
            const part3 = cleaned.substring(6, 9); // 531
            const part4 = cleaned.substring(9, 11); // 57
            const part5 = cleaned.substring(11, 13); // 42
            
            return `${part1} (${part2}) ${part3}-${part4}-${part5}`;
        }
        
        return phone;
    }

    function validateInputs() {
        let isValid = true;

        // Валидация никнейма (обязательное поле)
        if (nicknameInput.value.trim().length < 3) {
            nicknameError.textContent = translations.error_nickname_length || 'Nickname must be at least 3 characters long';
            isValid = false;
        } else {
            nicknameError.textContent = '';
        }

        // Валидация email (необязательное поле) - только если заполнен
        if (emailInput.value.trim() !== '' && !validateEmail(emailInput.value)) {
            emailError.textContent = translations.error_email_format || 'Invalid email format';
            isValid = false;
        } else {
            emailError.textContent = '';
        }

        // Валидация телефона (необязательное поле) - только если заполнен
        if (phoneInput.value.trim() !== '' && !validatePhone(phoneInput.value)) {
            phoneError.textContent = translations.error_phone_format || 'Invalid phone format (+375 (XX) XXX-XX-XX)';
            isValid = false;
        } else {
            phoneError.textContent = '';
        }

        // Валидация пароля (только если введен)
        if (passwordInput.value && passwordInput.value.length < 6) {
            passwordError.textContent = translations.error_password_length || 'Password must be at least 6 characters long';
            isValid = false;
        } else {
            passwordError.textContent = '';
        }

        // Валидация подтверждения пароля
        if (passwordInput.value !== passwordConfirmInput.value) {
            passwordConfirmError.textContent = translations.error_password_mismatch || 'Passwords do not match';
            isValid = false;
        } else {
            passwordConfirmError.textContent = '';
        }

        return isValid;
    }

    async function generateNickname() {
        if (remainingAttempts <= 0) {
            regenerateButton.disabled = true;
            nicknameAttempts.textContent = translations.error_no_attempts || (localStorage.getItem('language') === 'ru' ? 'Попытки генерации закончились' : 'No generation attempts left');
            return;
        }

        try {
            const response = await fetch('https://randomuser.me/api/');
            const data = await response.json();
            const nickname = data.results[0].login.username;
            nicknameInput.value = nickname;
            remainingAttempts--;
            
            // После генерации снимаем флаг первоначальной загрузки
            initialLoad = false;
            validateInputs();
            updateProfileTranslations();
            checkFormFilled();
        } catch (error) {
            console.error('Error generating nickname:', error);
            nicknameError.textContent = translations.error_server_unavailable || 'Server unavailable';
            initialLoad = false;
            updateProfileTranslations();
            checkFormFilled();
        }
    }

    async function loadUserData() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert(translations.error_not_authorized || (localStorage.getItem('language') === 'ru' ? 'Вы не авторизованы' : 'You are not authorized'));
            window.location.href = '../login/index.html';
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/users/${userId}`);
            const user = await response.json();
            
            // Сохраняем оригинальные данные
            originalUserData = {
                nickname: user.nickname || '',
                email: user.email || '',
                phone: user.phone || ''
            };
            
            // Заполняем поля данными пользователя
            nicknameInput.value = originalUserData.nickname;
            emailInput.value = originalUserData.email;
            
            // Форматируем телефон при загрузке
            if (originalUserData.phone) {
                phoneInput.value = formatPhoneNumber(originalUserData.phone);
            } else {
                phoneInput.value = '';
            }
            
            console.log('Loaded user data:', user);
            console.log('Original user data:', originalUserData);
            console.log('Formatted phone:', phoneInput.value);
            
            // После загрузки данных проверяем валидацию и состояние формы
            setTimeout(() => {
                validateInputs();
                checkFormFilled();
            }, 100);
            
        } catch (error) {
            console.error('Error loading user data:', error);
            alert(translations.error_server_unavailable || (localStorage.getItem('language') === 'ru' ? 'Сервер недоступен' : 'Server unavailable'));
        }
    }

    // Обработчики событий для реального времени
    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            // При первом взаимодействии с формой снимаем флаг первоначальной загрузки
            if (initialLoad) {
                initialLoad = false;
            }
            validateInputs();
            checkFormFilled();
        });
        
        // Очистка ошибок при фокусе
        input.addEventListener('focus', () => {
            // При фокусе снимаем флаг первоначальной загрузки
            if (initialLoad) {
                initialLoad = false;
            }
            const errorElement = document.getElementById(`${input.id}-error`);
            if (errorElement) {
                errorElement.textContent = '';
            }
            checkFormFilled();
        });
    });

    // Обработчик для форматирования телефона в реальном времени
    phoneInput.addEventListener('input', function(e) {
        if (initialLoad) {
            initialLoad = false;
        }
        
        const cursorPosition = e.target.selectionStart;
        let value = e.target.value;
        
        // Сохраняем позицию курсора
        const isDeleting = value.length < phoneInput.dataset.previousLength;
        phoneInput.dataset.previousLength = value.length;
        
        // Форматируем номер
        const formatted = formatPhoneNumber(value);
        e.target.value = formatted;
        
        // Восстанавливаем позицию курсора с учетом добавленных символов
        if (!isDeleting && cursorPosition) {
            const addedChars = formatted.length - value.length;
            e.target.setSelectionRange(cursorPosition + addedChars, cursorPosition + addedChars);
        }
        
        // После форматирования проверяем валидацию
        validateInputs();
        checkFormFilled();
    });

    regenerateButton.addEventListener('click', generateNickname);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // При отправке формы снимаем флаг первоначальной загрузки
        initialLoad = false;
        
        if (!validateInputs()) {
            alert(translations.error_validation_failed || (localStorage.getItem('language') === 'ru' ? 'Пожалуйста, исправьте ошибки в форме' : 'Please fix form errors'));
            return;
        }

        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert(translations.error_not_authorized || (localStorage.getItem('language') === 'ru' ? 'Вы не авторизованы' : 'You are not authorized'));
            window.location.href = '../login/index.html';
            return;
        }

        // Создаем объект только с измененными полями
        const updatedData = {};
        
        // Проверяем изменения в каждом поле и добавляем только измененные
        if (nicknameInput.value.trim() !== originalUserData.nickname) {
            updatedData.nickname = nicknameInput.value.trim();
        }
        
        if (emailInput.value.trim() !== originalUserData.email) {
            updatedData.email = emailInput.value.trim();
        }
        
        if (phoneInput.value.trim() !== originalUserData.phone) {
            updatedData.phone = phoneInput.value.trim();
        }
        
        // Добавляем пароль только если он введен
        if (passwordInput.value.trim() !== '') {
            updatedData.password = passwordInput.value;
        }

        // Если нет изменений, показываем сообщение
        if (Object.keys(updatedData).length === 0) {
            alert(translations.error_no_changes || (localStorage.getItem('language') === 'ru' ? 'Нет изменений для сохранения' : 'No changes to save'));
            return;
        }

        console.log('Sending updated data:', updatedData);

        try {
            const response = await fetch(`http://localhost:3000/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                alert(translations.success_profile_updated || (localStorage.getItem('language') === 'ru' ? 'Профиль успешно обновлён' : 'Profile updated successfully'));
                
                // Обновляем оригинальные данные
                originalUserData = {
                    nickname: updatedUser.nickname || originalUserData.nickname,
                    email: updatedUser.email || originalUserData.email,
                    phone: updatedUser.phone || originalUserData.phone
                };
                
                // Сбрасываем только поля паролей
                passwordInput.value = '';
                passwordConfirmInput.value = '';
                remainingAttempts = 5;
                regenerateButton.disabled = false;
                
                // Проверяем форму после успешного обновления
                validateInputs();
                updateProfileTranslations();
                checkFormFilled();
            } else {
                alert(translations.error_server_unavailable || (localStorage.getItem('language') === 'ru' ? 'Сервер недоступен' : 'Server unavailable'));
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(translations.error_server_unavailable || (localStorage.getItem('language') === 'ru' ? 'Сервер недоступен' : 'Server unavailable'));
        }
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        alert(translations.success_logout || (localStorage.getItem('language') === 'ru' ? 'Вы успешно вышли из аккаунта' : 'You have successfully logged out'));
        window.location.href = '../login/index.html';
    });

    // Инициализация
    setInitialNicknameAttemptsText();
    loadUserData();
    updateProfileTranslations();
    window.updateProfileTranslations = updateProfileTranslations;
});