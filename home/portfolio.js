async function loadProjects(type = 'all') {
    try {
        const response = await fetch('http://localhost:3000/projects');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const projects = Array.isArray(data) ? data : data.projects || [];

        const projectsContainer = document.getElementById('projects');
        projectsContainer.innerHTML = '';

        if (projects.length === 0) {
            projectsContainer.innerHTML = '<p>Проекты не найдены.</p>';
            return;
        }

        const categoryCounts = {
            all: projects.length,
            Уличное: 0,
            Промышленное: 0,
            Интерьерное: 0,
            Ретейл: 0,
            Медицинское: 0
        };
        projects.forEach(project => {
            if (project.type && categoryCounts.hasOwnProperty(project.type)) {
                categoryCounts[project.type]++;
            }
        });

        const updateButtonText = (id, text) => {
            const button = document.getElementById(id);
            if (button) button.textContent = text;
        };

        updateButtonText('btn-all', `Все (${categoryCounts.all})`);
        updateButtonText('btn-street', `Уличное (${categoryCounts.Уличное})`);
        updateButtonText('btn-industrial', `Промышленное (${categoryCounts.Промышленное})`);
        updateButtonText('btn-interior', `Интерьерное (${categoryCounts.Интерьерное})`);
        updateButtonText('btn-retail', `Ретейл (${categoryCounts.Ретейл})`);
        updateButtonText('btn-medical', `Медицинское (${categoryCounts.Медицинское})`);

        const filteredProjects = type === 'all'
            ? projects
            : projects.filter(project =>
                project.type && project.type.trim().toLowerCase() === type.trim().toLowerCase()
            );

        if (filteredProjects.length === 0) {
            projectsContainer.innerHTML = `<p>Проекты в категории "${type}" не найдены.</p>`;
            return;
        }

        filteredProjects.forEach(project => {
            const projectDiv = document.createElement('div');
            projectDiv.className = 'project';
            projectDiv.style.backgroundImage = `url('../img/projects/${project.id}.png')`;
            projectDiv.style.backgroundSize = 'cover';
            projectDiv.style.backgroundPosition = 'center';
            projectDiv.style.backgroundRepeat = 'no-repeat';
            projectDiv.innerHTML = `
                <div class="info">
                    <p class="category">${project.type || 'Без категории'}</p>
                    <h4>${project.name || 'Без названия'}</h4>
                    <div class="read">
                        <p>Подробнее</p>
                        <button onclick="window.location.href='project_page/index.html?id=${project.id}'">
                            <img src="../img/circle_arrow.svg" alt="arrow">
                        </button>
                    </div>
                </div>
            `;
            projectsContainer.appendChild(projectDiv);
        });

        initializeSlider();
    } catch (error) {
        console.error('Ошибка при загрузке проектов:', error);
        const projectsContainer = document.getElementById('projects');
        projectsContainer.innerHTML = '<p>Ошибка загрузки проектов. Попробуйте позже.</p>';
    }
}

function initializeSlider() {
    const projectsContainer = document.getElementById('projects');
    const prevButton = document.querySelector('.portfolio .prev');
    const nextButton = document.querySelector('.portfolio .next');
    const projectCards = projectsContainer.querySelectorAll('.project');
    let currentIndex = 0;

    function getCardWidth() {
        return projectCards.length > 0 ? projectCards[0].offsetWidth : 0;
    }

    function updateSlider() {
        const cardWidth = getCardWidth();
        const containerWidth = document.querySelector('.projects-slider').offsetWidth;
        const totalWidth = cardWidth * projectCards.length;
        const maxIndex = Math.ceil((totalWidth - containerWidth) / cardWidth);

        const offset = -currentIndex * cardWidth;
        projectsContainer.style.transform = `translateX(${offset}px)`;

        // Показываем кнопки, даже если третья карточка влезает частично
        prevButton.style.display = totalWidth > containerWidth ? 'flex' : 'none';
        nextButton.style.display = totalWidth > containerWidth ? 'flex' : 'none';

        prevButton.disabled = currentIndex <= 0;
        nextButton.disabled = currentIndex >= maxIndex;
    }

    function nextSlide() {
        const cardWidth = getCardWidth();
        const containerWidth = document.querySelector('.projects-slider').offsetWidth;
        const totalWidth = cardWidth * projectCards.length;
        const maxIndex = Math.ceil((totalWidth - containerWidth) / cardWidth);
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateSlider();
        }
    }

    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    }

    window.addEventListener('resize', updateSlider);
    prevButton.addEventListener('click', prevSlide);
    nextButton.addEventListener('click', nextSlide);

    updateSlider();
}

document.addEventListener('DOMContentLoaded', () => {
    loadProjects();

    document.querySelectorAll('.type li').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.type li').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const type = button.getAttribute('data-type');
            loadProjects(type);
        });
    });
});
