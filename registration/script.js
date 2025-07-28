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

function setInitialNicknameAttemptsText() {
    const currentLang = localStorage.getItem('language') || 'ru';
    nicknameAttemptsSpan.textContent = currentLang === 'ru' 
        ? `Осталось попыток генерации: ${nicknameAttempts}` 
        : `Remaining generation attempts: ${nicknameAttempts}`;
    console.log(`Set initial nickname attempts text to "${nicknameAttemptsSpan.textContent}"`);
}

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
    return nickname;
}

function validatePhoneFormat(phone) {
    const phoneRegex = /^\+375\s?\(?(?:29|33|44|25)\)?\s?\d{3}-?\d{2}-?\d{2}$/;
    if (!phoneRegex.test(phone)) {
        return { isValid: false, message: 'invalid_phone' };
    }
    return { isValid: true, message: '' };
}

async function validatePhoneExists(phone) {
    try {
        const response = await fetch('http://localhost:3000/users?phone=' + encodeURIComponent(phone));
        const users = await response.json();
        if (users.length > 0) {
            return { isValid: false, message: 'phone_exists' };
        }
        return { isValid: true, message: '' };
    } catch (error) {
        console.error('Error validating phone:', error);
        return { isValid: false, message: 'server_error' };
    }
}

function validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, message: 'invalid_email' };
    }
    return { isValid: true, message: '' };
}

async function validateEmailExists(email) {
    try {
        const response = await fetch('http://localhost:3000/users?email=' + encodeURIComponent(email));
        const users = await response.json();
        if (users.length > 0) {
            return { isValid: false, message: 'email_exists' };
        }
        return { isValid: true, message: '' };
    } catch (error) {
        console.error('Error validating email:', error);
        return { isValid: false, message: 'server_error' };
    }
}

function validateNicknameFormat(nickname) {
    if (!nickname) {
        return { isValid: false, message: 'nickname_required' };
    }
    return { isValid: true, message: '' };
}

async function validateNicknameExists(nickname) {
    try {
        const response = await fetch('http://localhost:3000/users?nickname=' + encodeURIComponent(nickname));
        const users = await response.json();
        if (users.length > 0) {
            return { isValid: false, message: 'nickname_exists' };
        }
        return { isValid: true, message: '' };
    } catch (error) {
        console.error('Error validating nickname:', error);
        return { isValid: false, message: 'server_error' };
    }
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
    const currentLang = localStorage.getItem('language') || 'ru';

    document.querySelectorAll('.error-message').forEach(error => {
        error.setAttribute('data-i18n', '');
        error.textContent = '';
    });

    const phoneValidation = validatePhoneFormat(phoneInput.value);
    if (!phoneValidation.isValid) {
        document.getElementById('phone-error').setAttribute('data-i18n', phoneValidation.message);
        isValid = false;
    }

    const emailValidation = validateEmailFormat(emailInput.value);
    if (!emailValidation.isValid) {
        document.getElementById('email-error').setAttribute('data-i18n', emailValidation.message);
        isValid = false;
    }

    if (!validateBirthdate(birthdateInput.value)) {
        document.getElementById('birthdate-error').setAttribute('data-i18n', 'birthdate_too_young');
        isValid = false;
    }

    if (passwordManual.checked) {
        if (!validatePassword(passwordInput.value)) {
            document.getElementById('password-error').setAttribute('data-i18n', 'invalid_password');
            isValid = false;
        }
        if (passwordInput.value !== passwordConfirmInput.value) {
            document.getElementById('password-confirm-error').setAttribute('data-i18n', 'password_mismatch');
            isValid = false;
        }
    }

    if (!firstNameInput.value.trim()) {
        document.getElementById('firstName-error').setAttribute('data-i18n', 'firstName_required');
        isValid = false;
    }


    if (!lastNameInput.value.trim()) {
        document.getElementById('lastName-error').setAttribute('data-i18n', 'lastName_required');
        isValid = false;
    }

    const nicknameValidation = validateNicknameFormat(nicknameInput.value);
    if (!nicknameValidation.isValid) {
        document.getElementById('nickname-error').setAttribute('data-i18n', nicknameValidation.message);
        isValid = false;
    }

    if (!agreementCheckbox.checked) {
        document.getElementById('agreement-error').setAttribute('data-i18n', 'agreement_required');
        isValid = false;
    }

    submitButton.disabled = !isValid;
    updateRegistrationTranslations();
}

async function validateFormOnSubmit() {
    let isValid = true;
    const currentLang = localStorage.getItem('language') || 'ru';

    const phoneExistsValidation = await validatePhoneExists(phoneInput.value);
    if (!phoneExistsValidation.isValid) {
        document.getElementById('phone-error').setAttribute('data-i18n', phoneExistsValidation.message);
        isValid = false;
    }

    const emailExistsValidation = await validateEmailExists(emailInput.value);
    if (!emailExistsValidation.isValid) {
        document.getElementById('email-error').setAttribute('data-i18n', emailExistsValidation.message);
        isValid = false;
    }

    const nicknameExistsValidation = await validateNicknameExists(nicknameInput.value);
    if (!nicknameExistsValidation.isValid) {
        document.getElementById('nickname-error').setAttribute('data-i18n', nicknameExistsValidation.message);
        isValid = false;
    }

    updateRegistrationTranslations();
    return isValid;
}

function updateRegistrationTranslations() {
    const currentLang = localStorage.getItem('language') || 'ru';
    console.log(`Updating translations for language: ${currentLang}, nicknameAttempts: ${nicknameAttempts}`);
    try {
        loadTranslations(currentLang, 'registration', (translations) => {
            if (translations) {
                document.querySelectorAll('.error-message[data-i18n]').forEach(error => {
                    const key = error.getAttribute('data-i18n');
                    if (key) {
                        error.textContent = translations[key] || '';
                        console.log(`Updated error message with data-i18n="${key}" to "${translations[key]}"`);
                    }
                });

                const attemptsText = translations['nickname_attempts'] || (currentLang === 'ru' ? 'Осталось попыток генерации: {count}' : 'Remaining generation attempts: {count}');
                console.log(`Raw attemptsText: ${attemptsText}, nicknameAttempts: ${nicknameAttempts}`);
                nicknameAttemptsSpan.textContent = attemptsText.replace('{count}', nicknameAttempts);
                console.log(`Updated nickname attempts text to "${nicknameAttemptsSpan.textContent}"`);
            } else {
                console.error('Translations not loaded');
                nicknameAttemptsSpan.textContent = currentLang === 'ru' ? `Осталось попыток генерации: ${nicknameAttempts}` : `Remaining generation attempts: ${nicknameAttempts}`;
            }
        });
    } catch (error) {
        console.error('Error in updateRegistrationTranslations:', error);
        nicknameAttemptsSpan.textContent = currentLang === 'ru' ? `Осталось попыток генерации: ${nicknameAttempts}` : `Remaining generation attempts: ${nicknameAttempts}`;
    }
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
        updateRegistrationTranslations();
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
        const isValid = await validateFormOnSubmit();
        if (!isValid) {
            submitButton.disabled = true;
            return;
        }
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
            const currentLang = localStorage.getItem('language') || 'ru';
            if (response.ok) {
                loadTranslations(currentLang, 'registration', (translations) => {
                    alert(translations.success_message || 'Registration successful!');
                    form.reset();
                    nicknameAttempts = 5;
                    updateRegistrationTranslations();
                    regenerateNicknameButton.disabled = false;
                    agreementCheckbox.disabled = true;
                    setMaxBirthdate();
                    window.location.href = '../login/index.html';
                });
            } else {
                loadTranslations(currentLang, 'registration', (translations) => {
                    alert(translations.error_message || 'Registration error');
                });
            }
        } catch (error) {
            loadTranslations(currentLang, 'registration', (translations) => {
                alert(translations.server_error || 'Server error');
            });
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

setInitialNicknameAttemptsText();
setMaxBirthdate();
updateRegistrationTranslations();
window.updateRegistrationTranslations = updateRegistrationTranslations;