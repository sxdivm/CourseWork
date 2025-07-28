const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitButton = document.getElementById('submit-button');
const formError = document.getElementById('form-error');

function checkFormFilled() {
    const isFilled = emailInput.value.trim() !== '' && passwordInput.value.trim() !== '';
    console.log('Form filled:', isFilled, 'Email:', emailInput.value, 'Password:', passwordInput.value);
    submitButton.disabled = !isFilled;
}

async function validateCredentials(email, password) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, message: 'error_invalid_credentials' };
    }
    try {
        const response = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(email)}`);
        const users = await response.json();
        console.log('Email fetch result:', users);
        if (users.length === 0) {
            return { isValid: false, message: 'error_invalid_credentials' };
        }
        const user = users[0];
        if (password !== user.password) {
            return { isValid: false, message: 'error_invalid_credentials' };
        }
        return { isValid: true, message: '', user };
    } catch (error) {
        console.error('Validation error:', error);
        return { isValid: false, message: 'error_server_unavailable' };
    }
}

function updateLoginTranslations() {
    const currentLang = localStorage.getItem('language') || 'ru';
    loadTranslations(currentLang, 'login', (translations) => {
        if (translations) {
            formError.textContent = translations[formError.getAttribute('data-i18n')] || '';
            console.log('Updated login translations');
        }
    });
}

form.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
        console.log(`Input changed: ${input.id} = ${input.value}`);
        formError.textContent = '';
        checkFormFilled();
    });
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    formError.textContent = '';
    const validation = await validateCredentials(emailInput.value, passwordInput.value);
    console.log('Validation result:', validation);
    if (validation.isValid) {
        if (!validation.user.id || !validation.user.role) {
            console.error('User ID or role is missing in server response');
            formError.setAttribute('data-i18n', 'error_missing_user_data');
            updateLoginTranslations();
            return;
        }
        localStorage.setItem('userId', validation.user.id);
        localStorage.setItem('role', validation.user.role);
        const currentLang = localStorage.getItem('language') || 'ru';
        loadTranslations(currentLang, 'login', (translations) => {
            if (translations && translations.welcome_message) {
                alert(translations.welcome_message.replace('{firstName}', validation.user.firstName));
            } else {
                alert(`Welcome, ${validation.user.firstName}!`);
            }
            form.reset();
            submitButton.disabled = true;
            window.location.href = '../catalog/index.html';
        });
    } else {
        formError.setAttribute('data-i18n', validation.message);
        updateLoginTranslations();
    }
});

window.updateLoginTranslations = updateLoginTranslations;
checkFormFilled();