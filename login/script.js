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
        return { isValid: false, message: 'Неверный email или пароль' };
    }
    try {
        const response = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(email)}`);
        const users = await response.json();
        console.log('Email fetch result:', users);
        if (users.length === 0) {
            return { isValid: false, message: 'Неверный email или пароль' };
        }
        const user = users[0];
        if (password !== user.password) {
            return { isValid: false, message: 'Неверный email или пароль' };
        }
        return { isValid: true, message: '', user };
    } catch (error) {
        console.error('Validation error:', error);
        return { isValid: false, message: 'Нет доступа к серверу' };
    }
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
            formError.textContent = 'Ошибка: отсутствует идентификатор или роль пользователя';
            return;
        }
        localStorage.setItem('userId', validation.user.id);
        localStorage.setItem('role', validation.user.role);
        alert(`Добро пожаловать, ${validation.user.firstName}!`);
        form.reset();
        submitButton.disabled = true;
        window.location.href = '../catalog/index.html';
    } else {
        formError.textContent = validation.message;
    }
});