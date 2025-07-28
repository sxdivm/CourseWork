async function loadProject(projectId) {
    const projectContainer = document.querySelector('.project-detail');

    try {
        const lang = localStorage.getItem('language') || 'ru';
        console.log('Загрузка проекта с ID:', projectId, 'на языке:', lang);

        const translations = await new Promise((resolve) => {
            window.loadTranslations(lang, 'project_page', (translations) => {
                console.log('Переводы загружены:', translations);
                resolve(translations || {});
            });
        });

        const response = await fetch(`http://localhost:3000/projects`);
        if (!response.ok) {
            throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
        }
        const data = await response.json();
        console.log('Полученные данные:', data);
        const projects = Array.isArray(data) ? data : data.projects || [];
        const project = projects.find(p => p.id == projectId);

        if (project) {
            console.log('Найден проект:', project);
            console.log('Используемый язык:', lang);

            const elements = {
                name: document.getElementById('project-name'),
                date: document.getElementById('project-date'),
                status: document.getElementById('project-status'),
                location: document.getElementById('project-location'),
                description: document.getElementById('project-description'),
                budget: document.getElementById('project-budget'),
                area: document.getElementById('project-area'),
                client: document.getElementById('project-client'),
                duration: document.getElementById('project-duration'),
                image: document.getElementById('project-image'),
                team: document.getElementById('project-team')
            };

            for (const [key, element] of Object.entries(elements)) {
                if (!element && key !== 'image' && key !== 'team') {
                    console.error(`Элемент с ID project-${key} не найден`);
                }
            }

            const statusKey = `status_${(project.status || '').toLowerCase().replace(/\s+/g, '_')}`;
            const statusText = lang === 'ru' ? project.status : translations[statusKey] || project.status || translations.no_status || 'Статус не указан';
            const budgetText = lang === 'ru' ? project.budget : translations[`budget_${project.budget?.replace(/\s+/g, '_')}`] || project.budget || translations.no_budget || 'Бюджет не указан';
            const areaText = lang === 'ru' ? project.area : translations[`area_${project.area?.replace(/\s+/g, '_')}`] || project.area || translations.no_area || 'Площадь не указана';
            const durationText = lang === 'ru' ? project.duration : translations[`duration_${project.duration?.replace(/\s+/g, '_')}`] || project.duration || translations.no_duration || 'Длительность не указана';

            if (elements.name) {
                elements.name.textContent = lang === 'ru' ? project.name : project.en_name || project.name || translations.no_name || 'Без названия';
                console.log('Название:', elements.name.textContent);
            }
            if (elements.date) {
                elements.date.textContent = project.date || translations.no_date || 'Дата не указана';
                console.log('Дата:', elements.date.textContent);
            }
            if (elements.status) {
                elements.status.textContent = statusText;
                console.log('Статус:', elements.status.textContent);
            }
            if (elements.location) {
                elements.location.textContent = lang === 'ru' ? project.location : project.en_location || project.location || translations.no_location || 'Местоположение не указано';
                console.log('Местоположение:', elements.location.textContent);
            }
            if (elements.description) {
                elements.description.textContent = lang === 'ru' ? project.description : project.en_description || project.description || translations.no_description || 'Описание отсутствует';
                console.log('Описание:', elements.description.textContent);
            }
            if (elements.budget) {
                elements.budget.textContent = budgetText;
                console.log('Бюджет:', elements.budget.textContent);
            }
            if (elements.area) {
                elements.area.textContent = areaText;
                console.log('Площадь:', elements.area.textContent);
            }
            if (elements.client) {
                elements.client.textContent = lang === 'ru' ? project.client : project.en_client || project.client || translations.no_client || 'Клиент не указан';
                console.log('Клиент:', elements.client.textContent);
            }
            if (elements.duration) {
                elements.duration.textContent = durationText;
                console.log('Длительность:', elements.duration.textContent);
            }
            if (elements.image) {
                elements.image.src = `../img/projects/${project.id}.png`;
                console.log('Изображение:', elements.image.src);
            }
            document.title = `${translations.page_title || (lang === 'ru' ? 'Проект' : 'Project')} - ${lang === 'ru' ? project.name : project.en_name || project.name || translations.no_name || 'Без названия'}`;
            console.log('Заголовок страницы:', document.title);

            if (elements.team) {
                elements.team.innerHTML = '';
                const team = lang === 'ru' ? project.team : project.en_team || project.team;
                console.log('Команда:', team);
                if (team && team.length > 0) {
                    team.forEach(member => {
                        const li = document.createElement('li');
                        li.textContent = member;
                        elements.team.appendChild(li);
                    });
                } else {
                    const li = document.createElement('li');
                    li.textContent = translations.no_team || 'Команда не указана';
                    elements.team.appendChild(li);
                }
            }

            window.loadTranslations(lang, 'project_page');
            console.log('Применены статические переводы для:', lang);

            setTimeout(() => {
                projectContainer.classList.add('loaded');
            }, 100);
        } else {
            projectContainer.innerHTML = `<p class="error" data-i18n="error_not_found">${translations.error_not_found || 'Проект не найден.'}</p>`;
            window.loadTranslations(lang, 'project_page');
        }
    } catch (error) {
        console.error('Ошибка загрузки проекта:', error);
        const lang = localStorage.getItem('language') || 'ru';
        await new Promise((resolve) => {
            window.loadTranslations(lang, 'project_page', (translations) => {
                projectContainer.innerHTML = `<p class="error" data-i18n="error_loading">${translations.error_loading || 'Ошибка загрузки проекта. Попробуйте позже.'}</p>`;
                window.loadTranslations(lang, 'project_page');
                resolve();
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    console.log('DOMContentLoaded: ID проекта:', projectId, 'Язык:', localStorage.getItem('language'));

    if (projectId) {
        loadProject(projectId);
    } else {
        const lang = localStorage.getItem('language') || 'ru';
        document.querySelector('.project-detail').innerHTML = `<p class="error" data-i18n="error_no_id">${translations.error_no_id || 'ID проекта не указан.'}</p>`;
        window.loadTranslations(lang, 'project_page');
    }
});

window.addEventListener('languageChanged', (event) => {
    try {
        const newLang = event.detail?.lang || localStorage.getItem('language') || 'ru';
        console.log('Language changed to:', newLang);
        localStorage.setItem('language', newLang);
        location.reload();
    } catch (error) {
        console.error('Error in languageChanged event:', error);
    }
});