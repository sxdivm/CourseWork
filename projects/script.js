async function loadProjects(type = 'all') {
    const projectsContainer = document.getElementById('projects-container');
    projectsContainer.innerHTML = '';

    try {
        console.log('Загрузка проектов для категории:', type);
        const lang = localStorage.getItem('language') || 'ru';
        const isAdmin = localStorage.getItem('role') === 'admin';

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

        if (isAdmin) {
            document.getElementById('admin-controls').style.display = 'flex';
        }

        filteredProjects.forEach(project => {
            const projectDiv = document.createElement('div');
            projectDiv.className = 'project';
            let adminButtons = '';
            if (isAdmin) {
                adminButtons = `
                    <button class="edit-btn" data-project-id="${project.id}" aria-label="Edit project"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-project-id="${project.id}" aria-label="Delete project"><i class="fas fa-trash"></i></button>
                `;
            }
            projectDiv.innerHTML = `
                ${adminButtons}
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

        if (isAdmin) {
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const projectId = button.getAttribute('data-project-id');
                    openProjectModal(projectId);
                });
            });

            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const projectId = button.getAttribute('data-project-id');
                    if (confirm(translations.confirm_delete_project || 'Вы уверены, что хотите удалить этот проект?')) {
                        deleteProject(projectId);
                    }
                });
            });
        }

        window.loadTranslations(lang, 'projects');
    } catch (error) {
        console.error('Ошибка при загрузке проектов:', error);
        const lang = localStorage.getItem('language') || 'ru';
        window.loadTranslations(lang, 'projects', (translations) => {
            projectsContainer.innerHTML = `<p data-i18n="error_loading">${translations.error_loading || 'Ошибка загрузки проектов. Попробуйте позже.'}</p>`;
        });
    }
}

async function openProjectModal(projectId = null) {
    const modal = document.getElementById('modal');
    const form = document.getElementById('project-form');
    const title = document.getElementById('modal-title');
    const idInput = document.getElementById('project-id');

    if (projectId) {
        title.setAttribute('data-i18n', 'edit_project_title');
        const response = await fetch(`http://localhost:3000/projects/${projectId}`);
        if (!response.ok) {
            throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
        }
        const project = await response.json();
        idInput.value = project.id;
        document.getElementById('project-name').value = project.name || '';
        document.getElementById('project-en-name').value = project.en_name || '';
        document.getElementById('project-type').value = project.type || '';
        document.getElementById('project-en-type').value = project.en_type || '';
        document.getElementById('project-description').value = project.description || '';
        document.getElementById('project-en-description').value = project.en_description || '';
    } else {
        title.setAttribute('data-i18n', 'add_project_title');
        const response = await fetch('http://localhost:3000/projects?_sort=id&_order=desc&_limit=1');
        const lastProject = (await response.json())[0];
        const newId = lastProject ? parseInt(lastProject.id) + 1 : 1;
        idInput.value = newId;
        form.reset();
        document.getElementById('project-id').value = newId;
    }

    window.loadTranslations(localStorage.getItem('language') || 'ru', 'projects', () => {
        console.log('Translations applied to modal form');
        modal.style.display = 'flex';
    });
}

async function saveProject(event) {
    event.preventDefault();
    const id = document.getElementById('project-id').value;
    const project = {
        id: id,
        name: document.getElementById('project-name').value,
        en_name: document.getElementById('project-en-name').value,
        type: document.getElementById('project-type').value,
        en_type: document.getElementById('project-en-type').value,
        description: document.getElementById('project-description').value,
        en_description: document.getElementById('project-en-description').value
    };

    try {
        const existingProjectResponse = await fetch(`http://localhost:3000/projects/${id}`);
        const method = existingProjectResponse.ok ? 'PATCH' : 'POST';
        const url = method === 'PATCH' ? `http://localhost:3000/projects/${id}` : 'http://localhost:3000/projects';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(project)
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
        }

        console.log(method === 'PATCH' ? 'Проект обновлен' : 'Проект добавлен', await response.json());
        const lang = localStorage.getItem('language') || 'ru';
        window.loadTranslations(lang, 'projects', (translations) => {
            alert(method === 'PATCH' ? translations.project_updated || 'Проект обновлен!' : translations.project_added || 'Проект добавлен!');
        });
        document.getElementById('modal').style.display = 'none';
        const activeButton = document.querySelector('.type-btn.active');
        const type = activeButton ? activeButton.getAttribute('data-type') : 'all';
        loadProjects(type);
    } catch (error) {
        console.error('Ошибка при сохранении проекта:', error);
        const lang = localStorage.getItem('language') || 'ru';
        window.loadTranslations(lang, 'projects', (translations) => {
            alert(translations.error_saving_project || 'Ошибка при сохранении проекта. Попробуйте позже.');
        });
    }
}

async function deleteProject(projectId) {
    try {
        const response = await fetch(`http://localhost:3000/projects/${projectId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
        }

        console.log('Проект удален:', projectId);
        const lang = localStorage.getItem('language') || 'ru';
        window.loadTranslations(lang, 'projects', (translations) => {
            alert(translations.project_deleted || 'Проект удален!');
        });
        const activeButton = document.querySelector('.type-btn.active');
        const type = activeButton ? activeButton.getAttribute('data-type') : 'all';
        loadProjects(type);
    } catch (error) {
        console.error('Ошибка при удалении проекта:', error);
        const lang = localStorage.getItem('language') || 'ru';
        window.loadTranslations(lang, 'projects', (translations) => {
            alert(translations.error_deleting_project || 'Ошибка при удалении проекта. Попробуйте позже.');
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

    const isAdmin = localStorage.getItem('role') === 'admin';
    if (isAdmin) {
        document.getElementById('save-projects').addEventListener('click', () => {
            const lang = localStorage.getItem('language') || 'ru';
            window.loadTranslations(lang, 'projects', (translations) => {
                alert(translations.save_not_implemented || 'Функция сохранения проектов пока не реализована.');
            });
        });
        document.getElementById('add-project').addEventListener('click', () => {
            openProjectModal();
        });
    }

    document.getElementById('modal-close').addEventListener('click', () => {
        document.getElementById('modal').style.display = 'none';
    });

    document.getElementById('project-form').addEventListener('submit', saveProject);
});

window.addEventListener('languageChanged', (event) => {
    const lang = event.detail.lang;
    const activeButton = document.querySelector('.type-btn.active');
    const type = activeButton ? activeButton.getAttribute('data-type') : 'all';
    console.log(`Смена языка на ${lang}, перезагрузка проектов для категории ${type}`);
    loadProjects(type);
});

window.updateProjectsTranslations = function() {
    const activeButton = document.querySelector('.type-btn.active');
    const type = activeButton ? activeButton.getAttribute('data-type') : 'all';
    loadProjects(type);
};