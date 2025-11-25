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

        // Загружаем переводы один раз
        const translations = await new Promise(resolve => {
            window.loadTranslations(lang, 'home', (trans) => resolve(trans || {}));
        });

        if (projects.length === 0) {
            projectsContainer.innerHTML = `<p data-i18n="no_projects">${translations.no_projects || 'Проекты не найдены.'}</p>`;
            window.loadTranslations(lang, 'home');
            return;
        }

        // Подсчёт проектов по категориям
        const categoryCounts = {
            all: projects.length,
            Уличное: 0,
            Промышленное: 0,
            Интерьерное: 0,
            Ретейл: 0,
            Медицинское: 0
        };

        projects.forEach(project => {
            if (project.type && categoryCounts.hasOwnProperty(project.type.trim())) {
                categoryCounts[project.type.trim()]++;
            }
        });

        // Обновляем текст кнопок (с количеством)
        const updateButtonText = (id, key, count) => {
            const button = document.getElementById(id);
            if (button) {
                const text = translations[key] || button.getAttribute('data-i18n') || key;
                button.textContent = `${text} (${count})`;
            }
        };

        updateButtonText('btn-all', 'portfolio_all', categoryCounts.all);
        updateButtonText('btn-street', 'portfolio_street', categoryCounts.Уличное);
        updateButtonText('btn-industrial', 'portfolio_industrial', categoryCounts.Промышленное);
        updateButtonText('btn-interior', 'portfolio_interior', categoryCounts.Интерьерное);
        updateButtonText('btn-retail', 'portfolio_retail', categoryCounts.Ретейл);
        updateButtonText('btn-medical', 'portfolio_medical', categoryCounts.Медицинское);

        // Фильтрация проектов
        const filteredProjects = type === 'all'
            ? projects
            : projects.filter(p => p.type && p.type.trim() === type.trim());

        if (filteredProjects.length === 0) {
            projectsContainer.innerHTML = `<p data-i18n="no_projects_in_category">Проекты в выбранной категории не найдены.</p>`;
            window.loadTranslations(lang, 'home');
            return;
        }

        // Генерация карточек
        filteredProjects.forEach(project => {
            const projectDiv = document.createElement('div');
            projectDiv.className = 'project';
            projectDiv.style.backgroundImage = `url('../img/projects/${project.id}.png')`;
            projectDiv.style.backgroundSize = 'cover';
            projectDiv.style.backgroundPosition = 'center';
            projectDiv.style.backgroundRepeat = 'no-repeat';
            projectDiv.style.maxWidth = '80vw';

            projectDiv.innerHTML = `
                <div class="info">
                    <p class="category">
                        ${lang === 'ru' 
                            ? (project.type || 'Без категории') 
                            : (project.en_type || project.type || 'No category')
                        }
                    </p>
                    <h4>
                        ${lang === 'ru' 
                            ? (project.name || 'Без названия') 
                            : (project.en_name || project.name || 'No title')
                        }
                    </h4>
                    <div class="read">
                        <p data-i18n="read_more">Подробнее</p>
                        <button onclick="window.location.href='../project_page/index.html?id=${project.id}'">
                            <img src="../img/circle_arrow.svg" alt="arrow">
                        </button>
                    </div>
                </div>
            `;

            projectsContainer.appendChild(projectDiv);
        });

        // КРИТИЧНО: Запускаем перевод для всех новых элементов (включая "Подробнее")
        window.loadTranslations(lang, 'home');

        // Инициализируем слайдер после добавления карточек
        initializeSlider();

    } catch (error) {
        console.error('Ошибка при загрузке проектов:', error);
        const projectsContainer = document.getElementById('projects');
        projectsContainer.innerHTML = `<p data-i18n="error_loading_projects">Ошибка загрузки проектов. Попробуйте позже.</p>`;
        window.loadTranslations(localStorage.getItem('language') || 'ru', 'home');
    }
}

function initializeSlider() {
    const projectsContainer = document.getElementById('projects');
    const prevButton = document.querySelector('.portfolio .prev');
    const nextButton = document.querySelector('.portfolio .next');
    const projectCards = projectsContainer.querySelectorAll('.project');
    let currentIndex = 0;

    function getCardWidth() {
        return projectCards.length > 0 ? projectCards[0].getBoundingClientRect().width : 0;
    }

    function updateSlider() {
        if (projectCards.length === 0) return;

        const cardWidth = getCardWidth();
        const containerWidth = document.querySelector('.projects-slider').offsetWidth;
        const totalWidth = cardWidth * projectCards.length;
        const visibleCards = Math.floor(containerWidth / cardWidth);
        const maxIndex = projectCards.length - visibleCards;

        const offset = -currentIndex * cardWidth;
        projectsContainer.style.transform = `translateX(${offset}px)`;

        prevButton.style.display = totalWidth > containerWidth ? 'flex' : 'none';
        nextButton.style.display = totalWidth > containerWidth ? 'flex' : 'none';

        prevButton.disabled = currentIndex <= 0;
        nextButton.disabled = currentIndex >= maxIndex;
    }

    function nextSlide() {
        const containerWidth = document.querySelector('.projects-slider').offsetWidth;
        const cardWidth = getCardWidth();
        const visibleCards = Math.floor(containerWidth / cardWidth);
        const maxIndex = projectCards.length - visibleCards;

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

    // Обновление при ресайзе
    window.addEventListener('resize', updateSlider);
    prevButton.addEventListener('click', prevSlide);
    nextButton.addEventListener('click', nextSlide);

    // Первичная инициализация
    updateSlider();
}

// === ЗАГРУЗКА ПРИ СТАРТЕ И ПРИ КЛИКЕ ПО КАТЕГОРИЯМ ===
document.addEventListener('DOMContentLoaded', () => {
    loadProjects(); // Загружаем все проекты при старте

    // Обработка кликов по фильтрам
    document.querySelectorAll('.type li').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.type li').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const type = button.getAttribute('data-type');
            loadProjects(type);
        });
    });

    // Перезагрузка при смене языка
    window.addEventListener('languageChanged', () => {
        const activeButton = document.querySelector('.type li.active');
        const type = activeButton ? activeButton.getAttribute('data-type') : 'all';
        loadProjects(type);
    });
});