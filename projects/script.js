async function loadProjects(type = 'all') {
    const projectsContainer = document.getElementById('projects-container');
    projectsContainer.innerHTML = '';

    try {
        console.log('Загрузка проектов для категории:', type);
        const lang = localStorage.getItem('language') || 'ru';

        const translations = await new Promise((resolve) => {
            window.loadTranslations(lang, 'projects', (translations) => {
                resolve(translations || {});
            });
        });

        const response = await fetch('http://localhost:3000/projects');
        if (!response.ok) {
            throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
        }
        const data = await response.json();
        console.log('Полученные данные:', data);
        const projects = Array.isArray(data) ? data : data.projects || [];
        console.log('Обработанный массив projects:', projects);

        if (projects.length === 0) {
            console.log('Проекты отсутствуют в ответе сервера');
            projectsContainer.innerHTML = `<p data-i18n="projects_not_found">${translations.projects_not_found || 'Проекты не найдены.'}</p>`;
            window.loadTranslations(lang, 'projects');
            return;
        }

        const categoryCounts = {
            all: projects.length,
            street: 0,
            industrial: 0,
            interior: 0,
            retail: 0,
            medical: 0
        };
        projects.forEach(project => {
            const normalizedType = project.en_type ? project.en_type.toLowerCase() : '';
            if (normalizedType && categoryCounts.hasOwnProperty(normalizedType)) {
                categoryCounts[normalizedType]++;
            }
        });
        console.log('Количество проектов по категориям:', categoryCounts);

        document.getElementById('btn-all').setAttribute('data-i18n', 'filter_all');
        document.getElementById('btn-street').setAttribute('data-i18n', 'filter_street');
        document.getElementById('btn-industrial').setAttribute('data-i18n', 'filter_industrial');
        document.getElementById('btn-interior').setAttribute('data-i18n', 'filter_interior');
        document.getElementById('btn-retail').setAttribute('data-i18n', 'filter_retail');
        document.getElementById('btn-medical').setAttribute('data-i18n', 'filter_medical');
        window.loadTranslations(lang, 'projects', () => {
            document.getElementById('btn-all').textContent = `${translations.filter_all || 'Все'} (${categoryCounts.all})`;
            document.getElementById('btn-street').textContent = `${translations.filter_street || 'Уличное'} (${categoryCounts.street})`;
            document.getElementById('btn-industrial').textContent = `${translations.filter_industrial || 'Промышленное'} (${categoryCounts.industrial})`;
            document.getElementById('btn-interior').textContent = `${translations.filter_interior || 'Интеръерное'} (${categoryCounts.interior})`;
            document.getElementById('btn-retail').textContent = `${translations.filter_retail || 'Ретейл'} (${categoryCounts.retail})`;
            document.getElementById('btn-medical').textContent = `${translations.filter_medical || 'Медицинское'} (${categoryCounts.medical})`;
        });


        const filteredProjects = type === 'all' 
            ? projects 
            : projects.filter(project => {
                const normalizedType = project.en_type ? project.en_type.toLowerCase() : '';
                return normalizedType === type.toLowerCase();
            });
        console.log('Отфильтрованные проекты:', filteredProjects);

        if (filteredProjects.length === 0) {
            console.log(`Проекты для категории "${type}" не найдены`);
            const categoryName = translations[`filter_${type}`] || type;
            projectsContainer.innerHTML = `<p data-i18n="projects_not_found_in_category">${translations.projects_not_found_in_category?.replace('%s', categoryName) || `Проекты в категории "${categoryName}" не найдены.`}</p>`;
            window.loadTranslations(lang, 'projects');
            return;
        }

        filteredProjects.forEach(project => {
            const projectDiv = document.createElement('div');
            projectDiv.className = 'project';
            projectDiv.innerHTML = `
                <img src="../img/projects/${project.id}.png" class="image" alt="${lang === 'ru' ? project.name : project.en_name || project.name || 'Проект'}" onerror="this.src='../img/projects/fallback.png'">
                <p class="category">${lang === 'ru' ? project.type : project.en_type || project.type || translations.no_category || 'Без категории'}</p>
                <h4>${lang === 'ru' ? project.name : project.en_name || project.name || translations.no_name || 'Без названия'}</h4>
                <p class="description">${lang === 'ru' ? project.description : project.en_description || project.description || translations.no_description || 'Описание отсутствует'}</p>
                <div class="read">
                    <p data-i18n="read">${translations.read || 'Читать'}</p>
                    <button onclick="window.location.href='../project_page/index.html?id=${project.id}'"><img src="../img/circle_arrow.svg" alt=""></button>
                </div>
            `;
            projectsContainer.appendChild(projectDiv);
        });

        window.loadTranslations(lang, 'projects');
    } catch (error) {
        console.error('Ошибка при загрузке проектов:', error);
        const lang = localStorage.getItem('language') || 'ru';
        window.loadTranslations(lang, 'projects', (translations) => {
            projectsContainer.innerHTML = `<p data-i18n="error_loading">${translations.error_loading || 'Ошибка загрузки проектов. Попробуйте позже.'}</p>`;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Документ загружен, инициализация...');
    loadProjects();

    document.querySelectorAll('.type-btn').forEach(button => {
        button.addEventListener('click', () => {
            console.log('Клик по кнопке:', button.getAttribute('data-type'));
            document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const type = button.getAttribute('data-type');
            loadProjects(type);
        });
    });
});

window.addEventListener('languageChanged', (event) => {
    const lang = event.detail.lang;
    const activeButton = document.querySelector('.type-btn.active');
    const type = activeButton ? activeButton.getAttribute('data-type') : 'all';
    console.log(`Смена языка на ${lang}, перезагрузка проектов для категории ${type}`);
    loadProjects(type);
});