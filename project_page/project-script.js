document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (projectId) {
        fetch(`http://localhost:3000/projects`)
            .then(response => response.json())
            .then(data => {
                const projects = Array.isArray(data) ? data : data.projects || [];
                const project = projects.find(p => p.id == projectId);
                if (project) {
                    document.getElementById('project-name').textContent = project.name;
                    document.getElementById('project-date').textContent = project.date || 'Дата не указана';
                    document.getElementById('project-status').textContent = project.status || 'Статус не указан';
                    document.getElementById('project-location').textContent = project.location || 'Местоположение не указано';
                    document.getElementById('project-description').textContent = project.description || 'Описание отсутствует';
                    document.getElementById('project-budget').textContent = project.budget || 'Бюджет не указан';
                    document.getElementById('project-area').textContent = project.area || 'Площадь не указана';
                    document.getElementById('project-client').textContent = project.client || 'Клиент не указан';
                    document.getElementById('project-duration').textContent = project.duration || 'Длительность не указана';
                    document.getElementById('project-image').src = `../img/projects/${project.id}.png`;
                    document.title = `Проект - ${project.name}`;

                    const teamList = document.getElementById('project-team');
                    if (project.team && project.team.length > 0) {
                        project.team.forEach(member => {
                            const li = document.createElement('li');
                            li.textContent = member;
                            teamList.appendChild(li);
                        });
                    } else {
                        const li = document.createElement('li');
                        li.textContent = 'Команда не указана';
                        teamList.appendChild(li);
                    }

                    setTimeout(() => {
                        document.querySelector('.project-detail').classList.add('loaded');
                    }, 100);
                } else {
                    document.querySelector('.project-detail').innerHTML = '<p class="error">Проект не найден.</p>';
                }
            })
            .catch(error => {
                console.error('Ошибка загрузки проекта:', error);
                document.querySelector('.project-detail').innerHTML = '<p class="error">Ошибка загрузки проекта. Попробуйте позже.</p>';
            });
    } else {
        document.querySelector('.project-detail').innerHTML = '<p class="error">ID проекта не указан.</p>';
    }
});