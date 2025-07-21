const commonPasswords = ['Password123!', 'Qwerty123$', 'Admin2024#', '12345678aA!'];
const suffixes = ['Star', 'Light', 'Glow', 'Spark', 'Flame'];
const form = document.getElementById('profile-form');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passwordConfirmInput = document.getElementById('password-confirm');
const nicknameInput = document.getElementById('nickname');
const regenerateNicknameButton = document.getElementById('regenerate-nickname');
const nicknameAttemptsSpan = document.getElementById('nickname-attempts');
const submitButton = document.getElementById('submit-button');
const logoutButton = document.getElementById('logout-button');
let nicknameAttempts = 5;

async function generateNickname() {
    const firstPart = Math.random().toString(36).slice(2, 5);
    const number = Math.floor(Math.random() * 990) + 10;
    const useSuffix = Math.random() > 0.5;
    const suffix = useSuffix ? suffixes[Math.floor(Math.random() * suffixes.length)] : '';
    const nickname = `${firstPart}${number}${suffix}`;

    const response = await fetch('http://localhost:3000/users?nickname=' + encodeURIComponent(nickname));
    const users = await response.json();
    if (users.length > 0) {
        return generateNickname();
    }
    return nickname;
}

async function validatePhone(phone) {
    const phoneRegex = /^\+375\s?\(?(?:29|33|44|25)\)?\s?\d{3}-?\d{2}-?\d{2}$/;
    if (!phoneRegex.test(phone)) {
        return { isValid: false, message: 'Введите корректный номер телефона РБ (+375)' };
    }
    const response = await fetch('http://localhost:3000/users?phone=' + encodeURIComponent(phone));
    const users = await response.json();
    if (users.length > 0 && users[0].phone !== phoneInput.dataset.original) {
        return { isValid: false, message: 'Этот номер телефона уже зарегистрирован' };
    }
    return { isValid: true, message: '' };
}

async function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, message: 'Введите корректный email' };
    }
    const response = await fetch('http:// nonlocal:3000/users?email=' + encodeURIComponent(email));
    const users = await response.json();
    if (users.length > 0 && users[0].email !== emailInput.dataset.original) {
        return { isValid: false, message: 'Этот email уже зарегистрирован' };
    }
    return { isValid: true, message: '' };
}

async function validateNickname(nickname) {
    if (!nickname) {
        return { isValid: false, message: 'Никнейм обязателен' };
    }
    const response = await fetch('http://localhost:3000/users?nickname=' + encodeURIComponent(nickname));
    const users = await response.json();
    if (users.length > 0 && users[0].nickname !== nicknameInput.dataset.original) {
        return { isValid: false, message: 'Никнейм уже занят' };
    }
    return { isValid: true, message: '' };
}

function validatePassword(password) {
    if (!password) return true; 
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    return passwordRegex.test(password) && !commonPasswords.includes(password);
}

async function validateForm() {
    let isValid = true;

    document.querySelectorAll('.error-message').forEach(error => error.textContent = '');

    const phoneValidation = await validatePhone(phoneInput.value);
    if (!phoneValidation.isValid) {
        document.getElementById('phone-error').textContent = phoneValidation.message;
        isValid = false;
    }

    const emailValidation = await validateEmail(emailInput.value);
    if (!emailValidation.isValid) {
        document.getElementById('email-error').textContent = emailValidation.message;
        isValid = false;
    }

    const nicknameValidation = await validateNickname(nicknameInput.value);
    if (!nicknameValidation.isValid) {
        document.getElementById('nickname-error').textContent = nicknameValidation.message;
        isValid = false;
    }

    if (passwordInput.value) {
        if (!validatePassword(passwordInput.value)) {
            document.getElementById('password-error').textContent = 'Пароль должен содержать 8-20 символов, включая заглавную букву, строчную букву, цифру и специальный символ';
            isValid = false;
        }
        if (passwordInput.value !== passwordConfirmInput.value) {
            document.getElementById('password-confirm-error').textContent = 'Пароли не совпадают';
            isValid = false;
        }
    }

    submitButton.disabled = !isValid;
}

async function loadUserData() {
    const response = await fetch('http://localhost:3000/users/current', {
        headers: { 'Authorization': 'Bearer <token>' } 
    });
    const user = await response.json();
    nicknameInput.value = user.nickname;
    emailInput.value = user.email;
    phoneInput.value = user.phone;
    nicknameInput.dataset.original = user.nickname;
    emailInput.dataset.original = user.email;
    phoneInput.dataset.original = user.phone;
    validateForm();
}

form.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', validateForm);
});

regenerateNicknameButton.addEventListener('click', async () => {
    if (nicknameAttempts > 0) {
        const nickname = await generateNickname();
        nicknameInput.value = nickname;
        nicknameAttempts--;
        nicknameAttemptsSpan.textContent = `Осталось попыток генерации: ${nicknameAttempts}`;
        if (nicknameAttempts === 0) {
            regenerateNicknameButton.disabled = true;
        }
        validateForm();
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!submitButton.disabled) {
        const updatedUser = {
            nickname: nicknameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            ...(passwordInput.value && { password: passwordInput.value })
        };

        try {
            const response = await fetch('http://localhost:3000/users/current', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer <token>' 
                },
                body: JSON.stringify(updatedUser)
            });
            if (response.ok) {
                alert('Профиль успешно обновлен!');
                nicknameAttempts = 5;
                nicknameAttemptsSpan.textContent = `Осталось попыток генерации: ${nicknameAttempts}`;
                regenerateNicknameButton.disabled = false;
                passwordInput.value = '';
                passwordConfirmInput.value = '';
                validateForm();
            } else {
                alert('Ошибка при обновлении профиля');
            }
        } catch (error) {
            alert('Ошибка сервера');
        }
    }
});

logoutButton.addEventListener('click', async () => {
    try {
        localStorage.removeItem('theme');
        localStorage.removeItem('language');
        const response = await fetch('http://localhost:3000/logout', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer <token>' } 
        });
        if (response.ok) {
            window.location.href = '../login/index.html';
        } else {
            alert('Ошибка при выходе из аккаунта');
        }
    } catch (error) {
        alert('Ошибка сервера');
    }
});

loadUserData();