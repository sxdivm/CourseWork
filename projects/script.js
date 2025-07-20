async function loadProjects(type = 'all') {
    try {
        console.log('Загрузка проектов для категории:', type);
        const response = await fetch('http://localhost:3000/projects');
        if (!response.ok) {
            throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
        }
        const data = await response.json();
        console.log('Полученные данные:', data);
        const projects = Array.isArray(data) ? data : data.projects || [];
        console.log('Обработанный массив projects:', projects);

        const projectsContainer = document.getElementById('projects-container');
        projectsContainer.innerHTML = '';

        if (projects.length === 0) {
            console.log('Проекты отсутствуют в ответе сервера');
            projectsContainer.innerHTML = '<p>Проекты не найдены.</p>';
            return;
        }

        const categoryCounts = {
            all: projects.length,
            Уличное: 0,
            Промышленное: 0,
            Интеръерное: 0,
            Ретейл: 0,
            Медицинское: 0
        };
        projects.forEach(project => {
            if (project.type && categoryCounts.hasOwnProperty(project.type)) {
                categoryCounts[project.type]++;
            }
        });
        console.log('Количество проектов по категориям:', categoryCounts);

        document.getElementById('btn-all').textContent = `Все (${categoryCounts.all})`;
        document.getElementById('btn-street').textContent = `Уличное (${categoryCounts.Уличное})`;
        document.getElementById('btn-industrial').textContent = `Промышленное (${categoryCounts.Промышленное})`;
        document.getElementById('btn-interior').textContent = `Интеръерное (${categoryCounts.Интеръерное})`;
        document.getElementById('btn-retail').textContent = `Ретейл (${categoryCounts.Ретейл})`;
        document.getElementById('btn-medical').textContent = `Медицинское (${categoryCounts.Медицинское})`;

        const filteredProjects = type === 'all' 
            ? projects 
            : projects.filter(project => 
                project.type && project.type.trim().toLowerCase() === type.trim().toLowerCase()
            );
        console.log('Отфильтрованные проекты:', filteredProjects);

        if (filteredProjects.length === 0) {
            console.log(`Проекты для категории "${type}" не найдены`);
            projectsContainer.innerHTML = `<p>Проекты в категории "${type}" не найдены.</p>`;
            return;
        }

        filteredProjects.forEach(project => {
            const projectDiv = document.createElement('div');
            projectDiv.className = 'project';
            projectDiv.innerHTML = `
                <img src="../img/projects/${project.id}.png" class="image" alt="${project.name || 'Проект'}" onerror="this.src='../img/projects/fallback.png'">
                <p class="category">${project.type || 'Без категории'}</p>
                <h4>${project.name || 'Без названия'}</h4>
                <p class="description">${project.description || 'Описание отсутствует'}</p>
                <div class="read">
                    <p>Читать</p>
                    <button onclick="window.location.href='../project_page/index.html?id=${project.id}'"><img src="../img/circle_arrow.svg" alt=""></button>
                </div>
            `;
            projectsContainer.appendChild(projectDiv);
        });
    } catch (error) {
        console.error('Ошибка при загрузке проектов:', error);
        const projectsContainer = document.getElementById('projects-container');
        projectsContainer.innerHTML = '<p>Ошибка загрузки проектов. Попробуйте позже.</p>';
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