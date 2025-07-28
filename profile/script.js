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

    if (!form || !nicknameInput || !emailInput || !phoneInput || !passwordInput || 
        !passwordConfirmInput || !submitButton || !logoutButton || !regenerateButton ||
        !nicknameError || !emailError || !phoneError || !passwordError || !passwordConfirmError || !nicknameAttempts) {
        console.error('Form elements not found:', {
            form: !!form,
            nicknameInput: !!nicknameInput,
            emailInput: !!emailInput,
            phoneInput: !!phoneInput,
            passwordInput: !!passwordInput,
            passwordConfirmInput: !!passwordConfirmInput,
            submitButton: !!submitButton,
            logoutButton: !!logoutButton,
            regenerateButton: !!regenerateButton,
            nicknameError: !!nicknameError,
            emailError: !!emailError,
            phoneError: !!phoneError,
            passwordError: !!passwordError,
            passwordConfirmError: !!passwordConfirmError,
            nicknameAttempts: !!nicknameAttempts
        });
        return;
    }

    function setInitialNicknameAttemptsText() {
        const currentLang = localStorage.getItem('language') || 'ru';
        nicknameAttempts.textContent = currentLang === 'ru' 
            ? `Осталось попыток генерации: ${remainingAttempts}` 
            : `Remaining generation attempts: ${remainingAttempts}`;
        console.log(`Set initial nickname attempts text to "${nicknameAttempts.textContent}"`);
    }

    function updateProfileTranslations() {
        const currentLang = localStorage.getItem('language') || 'ru';
        console.log(`Updating translations for language: ${currentLang}, remainingAttempts: ${remainingAttempts}`);
        try {
            window.loadTranslations(currentLang, 'profile', (trans) => {
                translations = trans || {};
                console.log('Translations loaded for profile:', translations);
                nicknameAttempts.textContent = (translations.nickname_attempts || (currentLang === 'ru' ? 'Осталось попыток генерации: {count}' : 'Remaining generation attempts: {count}')).replace('{count}', remainingAttempts);
                regenerateButton.disabled = remainingAttempts <= 0;
                if (remainingAttempts <= 0) {
                    nicknameAttempts.textContent = translations.error_no_attempts || (currentLang === 'ru' ? 'Попытки генерации закончились' : 'No generation attempts left');
                }

                nicknameError.textContent = nicknameError.getAttribute('data-i18n') && translations[nicknameError.getAttribute('data-i18n')] || '';
                emailError.textContent = emailError.getAttribute('data-i18n') && translations[emailError.getAttribute('data-i18n')] || '';
                phoneError.textContent = phoneError.getAttribute('data-i18n') && translations[phoneError.getAttribute('data-i18n')] || '';
                passwordError.textContent = passwordError.getAttribute('data-i18n') && translations[passwordError.getAttribute('data-i18n')] || '';
                passwordConfirmError.textContent = passwordConfirmError.getAttribute('data-i18n') && translations[passwordConfirmError.getAttribute('data-i18n')] || '';
                checkFormFilled();
            });
        } catch (error) {
            console.error('Error in updateProfileTranslations:', error);
            nicknameAttempts.textContent = currentLang === 'ru' ? `Осталось попыток генерации: ${remainingAttempts}` : `Remaining generation attempts: ${remainingAttempts}`;
        }
    }

    function checkFormFilled() {
        const isFilled = nicknameInput.value.trim() !== '' && 
                        emailInput.value.trim() !== '' && 
                        phoneInput.value.trim() !== '' &&
                        (passwordInput.value === '' || passwordInput.value === passwordConfirmInput.value);
        console.log('Form filled:', isFilled, {
            nickname: nicknameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            password: passwordInput.value,
            passwordConfirm: passwordConfirmInput.value
        });
        submitButton.disabled = !isFilled;
    }

    function validateInputs() {
        let isValid = true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+375\s?\(\d{2}\)\s?\d{3}-\d{2}-\d{2}$/;

        if (nicknameInput.value.trim().length < 3) {
            nicknameError.setAttribute('data-i18n', 'error_nickname_length');
            nicknameError.textContent = translations.error_nickname_length || 'Nickname must be at least 3 characters long';
            isValid = false;
        } else {
            nicknameError.textContent = '';
            nicknameError.setAttribute('data-i18n', '');
        }

        if (!emailRegex.test(emailInput.value)) {
            emailError.setAttribute('data-i18n', 'error_email_format');
            emailError.textContent = translations.error_email_format || 'Invalid email format';
            isValid = false;
        } else {
            emailError.textContent = '';
            emailError.setAttribute('data-i18n', '');
        }

        if (!phoneRegex.test(phoneInput.value)) {
            phoneError.setAttribute('data-i18n', 'error_phone_format');
            phoneError.textContent = translations.error_phone_format || 'Invalid phone format (+375 (XX) XXX-XX-XX)';
            isValid = false;
        } else {
            phoneError.textContent = '';
            phoneError.setAttribute('data-i18n', '');
        }

        if (passwordInput.value && passwordInput.value.length < 6) {
            passwordError.setAttribute('data-i18n', 'error_password_length');
            passwordError.textContent = translations.error_password_length || 'Password must be at least 6 characters long';
            isValid = false;
        } else {
            passwordError.textContent = '';
            passwordError.setAttribute('data-i18n', '');
        }

        if (passwordInput.value && passwordInput.value !== passwordConfirmInput.value) {
            passwordConfirmError.setAttribute('data-i18n', 'error_password_mismatch');
            passwordConfirmError.textContent = translations.error_password_mismatch || 'Passwords do not match';
            isValid = false;
        } else {
            passwordConfirmError.textContent = '';
            passwordConfirmError.setAttribute('data-i18n', '');
        }

        updateProfileTranslations();
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
            updateProfileTranslations();
            checkFormFilled();
        } catch (error) {
            console.error('Error generating nickname:', error);
            nicknameError.setAttribute('data-i18n', 'error_server_unavailable');
            nicknameError.textContent = translations.error_server_unavailable || 'Server unavailable';
            updateProfileTranslations();
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
            nicknameInput.value = user.nickname || '';
            emailInput.value = user.email || '';
            phoneInput.value = user.phone || '';
            checkFormFilled();
        } catch (error) {
            console.error('Error loading user data:', error);
            alert(translations.error_server_unavailable || (localStorage.getItem('language') === 'ru' ? 'Сервер недоступен' : 'Server unavailable'));
        }
    }

    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            console.log(`Input changed: ${input.id} = ${input.value}`);
            validateInputs();
            checkFormFilled();
        });
    });

    regenerateButton.addEventListener('click', generateNickname);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateInputs()) return;

        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert(translations.error_not_authorized || (localStorage.getItem('language') === 'ru' ? 'Вы не авторизованы' : 'You are not authorized'));
            window.location.href = '../login/index.html';
            return;
        }

        const updatedData = {
            nickname: nicknameInput.value,
            email: emailInput.value,
            phone: phoneInput.value
        };

        if (passwordInput.value) {
            updatedData.password = passwordInput.value;
        }

        try {
            const response = await fetch(`http://localhost:3000/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert(translations.success_profile_updated || (localStorage.getItem('language') === 'ru' ? 'Профиль успешно обновлён' : 'Profile updated successfully'));
                form.reset();
                remainingAttempts = 5;
                regenerateButton.disabled = false;
                updateProfileTranslations();
                loadUserData();
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

    setInitialNicknameAttemptsText();
    loadUserData();
    updateProfileTranslations();
    window.updateProfileTranslations = updateProfileTranslations;
});