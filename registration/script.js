const commonPasswords = ['Password123!', 'Qwerty123$', 'Admin2024#', '12345678aA!'];
const suffixes = ['Star', 'Light', 'Glow', 'Spark', 'Flame'];
const form = document.getElementById('registration-form');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');
const birthdateInput = document.getElementById('birthdate');
const passwordAuto = document.getElementById('password-auto');
const passwordManual = document.getElementById('password-manual');
const passwordInput = document.getElementById('password');
const passwordConfirmInput = document.getElementById('password-confirm');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const middleNameInput = document.getElementById('middleName');
const nicknameInput = document.getElementById('nickname');
const regenerateNicknameButton = document.getElementById('regenerate-nickname');
const nicknameAttemptsSpan = document.getElementById('nickname-attempts');
const agreementCheckbox = document.getElementById('agreement');
const agreementLink = document.getElementById('agreement-link');
const submitButton = document.getElementById('submit-button');
const modal = document.getElementById('agreement-modal');
const agreementText = document.getElementById('agreement-text');
const confirmAgreementButton = document.getElementById('confirm-agreement');
const closeModalButton = document.getElementById('close-modal');
let nicknameAttempts = 5;

function setMaxBirthdate() {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
    const maxDateString = maxDate.toISOString().split('T')[0];
    birthdateInput.setAttribute('max', maxDateString);
}

function togglePasswordFields() {
    const passwordFields = document.querySelectorAll('.password-manual');
    passwordFields.forEach(field => {
        field.style.display = passwordManual.checked ? 'block' : 'none';
    });
    validateForm();
}

async function generateNickname(firstName, lastName) {
    const firstPart = firstName.slice(0, Math.floor(Math.random() * 3) + 1);
    const lastPart = lastName.slice(0, Math.floor(Math.random() * 3) + 1);
    const number = Math.floor(Math.random() * 990) + 10;
    const useSuffix = Math.random() > 0.5;
    const suffix = useSuffix ? suffixes[Math.floor(Math.random() * suffixes.length)] : '';
    const nickname = `${firstPart}${lastPart}${number}${suffix}`;

    const response = await fetch('http://localhost:3000/users?nickname=' + encodeURIComponent(nickname));
    const users = await response.json();
    if (users.length > 0) {
        return generateNickname(firstName, lastName);
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
    if (users.length > 0) {
        return { isValid: false, message: 'Этот номер телефона уже зарегистрирован' };
    }
    return { isValid: true, message: '' };
}

async function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, message: 'Введите корректный email' };
    }
    const response = await fetch('http://localhost:3000/users?email=' + encodeURIComponent(email));
    const users = await response.json();
    if (users.length > 0) {
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
    if (users.length > 0) {
        return { isValid: false, message: 'Никнейм уже занят' };
    }
    return { isValid: true, message: '' };
}

function validateBirthdate(birthdate) {
    const today = new Date();
    const birth = new Date(birthdate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        return age - 1 >= 16;
    }
    return age >= 16;
}

function validatePassword(password) {
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

    if (!validateBirthdate(birthdateInput.value)) {
        document.getElementById('birthdate-error').textContent = 'Вам должно быть не менее 16 лет';
        isValid = false;
    }

    if (passwordManual.checked) {
        if (!validatePassword(passwordInput.value)) {
            document.getElementById('password-error').textContent = 'Пароль должен содержать 8-20 символов, включая заглавную букву, строчную букву, цифру и специальный символ';
            isValid = false;
        }
        if (passwordInput.value !== passwordConfirmInput.value) {
            document.getElementById('password-confirm-error').textContent = 'Пароли не совпадают';
            isValid = false;
        }
    }

    if (!firstNameInput.value.trim()) {
        document.getElementById('firstName-error').textContent = 'Имя обязательно';
        isValid = false;
    }
    if (!lastNameInput.value.trim()) {
        document.getElementById('lastName-error').textContent = 'Фамилия обязательна';
        isValid = false;
    }

    const nicknameValidation = await validateNickname(nicknameInput.value);
    if (!nicknameValidation.isValid) {
        document.getElementById('nickname-error').textContent = nicknameValidation.message;
        isValid = false;
    }

    if (!agreementCheckbox.checked) {
        document.getElementById('agreement-error').textContent = 'Необходимо принять соглашение пользователя';
        isValid = false;
    }

    submitButton.disabled = !isValid;
}

agreementText.addEventListener('scroll', () => {
    const scrollTop = agreementText.scrollTop;
    const scrollHeight = agreementText.scrollHeight;
    const clientHeight = agreementText.clientHeight;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
        confirmAgreementButton.disabled = false;
    }
});

agreementLink.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'flex';
});

closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
    confirmAgreementButton.disabled = true;
});

confirmAgreementButton.addEventListener('click', () => {
    if (!confirmAgreementButton.disabled) {
        agreementCheckbox.disabled = false;
        agreementCheckbox.checked = true;
        modal.style.display = 'none';
        validateForm();
    }
});

agreementCheckbox.addEventListener('click', (e) => {
    if (agreementCheckbox.disabled) {
        e.preventDefault();
    }
});

passwordAuto.addEventListener('change', togglePasswordFields);
passwordManual.addEventListener('change', togglePasswordFields);

form.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', validateForm);
});

regenerateNicknameButton.addEventListener('click', async () => {
    if (nicknameAttempts > 0) {
        const nickname = await generateNickname(firstNameInput.value, lastNameInput.value);
        nicknameInput.value = nickname;
        nicknameAttempts--;
        nicknameAttemptsSpan.textContent = `Осталось попыток генерации: ${nicknameAttempts}`;
        if (nicknameAttempts === 0) {
            regenerateNicknameButton.disabled = true;
        }
        validateForm();
    }
});

nicknameInput.addEventListener('input', validateForm);

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!submitButton.disabled) {
        const user = {
            phone: phoneInput.value,
            email: emailInput.value,
            birthdate: birthdateInput.value,
            password: passwordManual.checked ? passwordInput.value : Math.random().toString(36).slice(2, 10) + '@1aA',
            firstName: firstNameInput.value,
            lastName: lastNameInput.value,
            middleName: middleNameInput.value || '',
            nickname: nicknameInput.value,
            role: 'customer'
        };

        try {
            const response = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });
            if (response.ok) {
                alert('Регистрация успешна!');
                form.reset();
                nicknameAttempts = 5;
                nicknameAttemptsSpan.textContent = `Осталось попыток генерации: ${nicknameAttempts}`;
                regenerateNicknameButton.disabled = false;
                agreementCheckbox.disabled = true;
                setMaxBirthdate();
            } else {
                alert('Ошибка при регистрации');
            }
        } catch (error) {
            alert('Ошибка сервера');
        }
    }
});

firstNameInput.addEventListener('input', async () => {
    if (firstNameInput.value && lastNameInput.value && nicknameAttempts > 0 && !nicknameInput.value) {
        const nickname = await generateNickname(firstNameInput.value, lastNameInput.value);
        nicknameInput.value = nickname;
        validateForm();
    }
});

lastNameInput.addEventListener('input', async () => {
    if (firstNameInput.value && lastNameInput.value && nicknameAttempts > 0 && !nicknameInput.value) {
        const nickname = await generateNickname(firstNameInput.value, lastNameInput.value);
        nicknameInput.value = nickname;
        validateForm();
    }
});

setMaxBirthdate();