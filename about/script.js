document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.contact-form');
    
    form.addEventListener('submit', async function (event) {
        event.preventDefault(); 
        const formData = new FormData(form);
        const name = formData.get('name').trim();
        const city = formData.get('city').trim();
        const phone = formData.get('phone').trim();
        const volume = formData.get('volume').trim();



        const phoneRegex = /^\+375(29|33|44|25)\d{7}$/;
        if (!phoneRegex.test(phone)) {
            alert('Телефон должен быть в формате +375 и содержать 9 цифр (например, +375291234567)');
            return;
        }

        if (city.length > 100) {
            alert('Город не должен превышать 100 символов');
            return;
        }
        if (volume.length > 100) {
            alert('Объем продаж не должен превышать 100 символов');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/requests');
            if (!response.ok) {
                throw new Error('Ошибка при получении данных');
            }
            const requests = await response.json();
            const maxId = requests.length > 0 ? Math.max(...requests.map(r => r.id)) : 0;
            const newId = maxId + 1;


            const requestData = {
                id: newId,
                name: name,
                city: city || '',
                phone: phone,
                volume: volume || ''
            };


            const postResponse = await fetch('http://localhost:3000/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (postResponse.ok) {
                alert('Заявка успешно отправлена!');
                form.reset(); 
            } else {
                throw new Error('Ошибка при отправке заявки');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте снова.');
        }
    });
});