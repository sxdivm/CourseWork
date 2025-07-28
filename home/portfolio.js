async function loadProjects(type = 'all') {
    try {
        const lang = localStorage.getItem('language') || 'ru';
        const response = await fetch('http://localhost:3000/projects');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const projects = Array.isArray(data) ? data : data.projects || [];

        const projectsContainer = document.getElementById('projects');
        projectsContainer.innerHTML = '';

        const translations = await new Promise(resolve => {
            window.loadTranslations(lang, 'home', (trans) => resolve(trans || {}));
        });

        if (projects.length === 0) {
            projectsContainer.innerHTML = `<p data-i18n="no_projects">${translations.no_projects || 'Проекты не найдены.'}</p>`;
            window.loadTranslations(lang, 'home');
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
        console.log('Projects from API:', projects); 
        projects.forEach(project => {
            if (project.type) {
                const normalizedType = project.type.trim();
                if (categoryCounts.hasOwnProperty(normalizedType)) {
                    categoryCounts[normalizedType]++;
                } else {
                    console.warn(`Unexpected project type: "${project.type}"`); 
                }
            } else {
                console.warn('Project missing type:', project); 
            }
        });
        console.log('Category counts:', categoryCounts); 
        const updateButtonText = (id, key, count) => {
            const button = document.getElementById(id);
            if (button) {
                const categoryText = translations[key] || button.getAttribute('data-i18n');
                button.textContent = `${categoryText} (${count})`;
                console.log(`Updated button ${id} to "${button.textContent}"`);
            } else {
                console.warn(`Button with ID ${id} not found`); 
            }
        };

        updateButtonText('btn-all', 'portfolio_all', categoryCounts.all);
        updateButtonText('btn-street', 'portfolio_street', categoryCounts.Уличное);
        updateButtonText('btn-industrial', 'portfolio_industrial', categoryCounts.Промышленное);
        updateButtonText('btn-interior', 'portfolio_interior', categoryCounts.Интерьерное);
        updateButtonText('btn-retail', 'portfolio_retail', categoryCounts.Ретейл);
        updateButtonText('btn-medical', 'portfolio_medical', categoryCounts.Медицинское);

        const filteredProjects = type === 'all'
            ? projects
            : projects.filter(project =>
                project.type && project.type.trim().toLowerCase() === type.trim().toLowerCase()
            );

        if (filteredProjects.length === 0) {
            const categoryKey = `portfolio_${type.toLowerCase()}`;
            projectsContainer.innerHTML = `<p data-i18n="no_projects_in_category">${translations.no_projects_in_category || `Проекты в категории "${lang === 'ru' ? type : translations[categoryKey] || type}" не найдены.`}</p>`;
            window.loadTranslations(lang, 'home');
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
                    <p class="category">${lang === 'ru' ? project.type : project.en_type || project.type || translations.no_category || 'Без категории'}</p>
                    <h4>${lang === 'ru' ? project.name : project.en_name || project.name || translations.no_name || 'Без названия'}</h4>
                    <div class="read">
                        <p data-i18n="read_more">${translations.read_more || 'Подробнее'}</p>
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
        const lang = localStorage.getItem('language') || 'ru';
        const projectsContainer = document.getElementById('projects');
        projectsContainer.innerHTML = `<p data-i18n="error_loading">${translations.error_loading || 'Ошибка загрузки проектов. Попробуйте позже.'}</p>`;
        window.loadTranslations(lang, 'home');
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

    window.addEventListener('languageChanged', (event) => {
        const newLang = event.detail?.lang || localStorage.getItem('language') || 'ru';
        console.log('Language changed to:', newLang);
        const activeButton = document.querySelector('.type li.active');
        const type = activeButton ? activeButton.getAttribute('data-type') : 'all';
        loadProjects(type);
    });
});