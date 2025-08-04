document.addEventListener('DOMContentLoaded', function() {
    // Очищаем настройки доступности в localStorage при загрузке страницы
    localStorage.removeItem('accessibilityFontSize');
    localStorage.removeItem('accessibilityColorScheme');
    localStorage.removeItem('accessibilityHideImages');

    // Применяем настройки по умолчанию
    applyAccessibilitySettings();
});

function applyAccessibilitySettings() {
    // Получаем настройки из localStorage или используем значения по умолчанию
    const fontSize = localStorage.getItem('accessibilityFontSize') || 'normal';
    const colorScheme = localStorage.getItem('accessibilityColorScheme') || 'default';
    const hideImages = localStorage.getItem('accessibilityHideImages') === 'true';

    // Удаляем предыдущие классы доступности
    document.documentElement.classList.remove('font-normal', 'font-large', 'font-extra-large');
    document.documentElement.classList.remove('scheme-black-green', 'scheme-beige-brown', 'scheme-blue-darkblue');
    document.documentElement.classList.remove('hide-images');

    // Применяем размер шрифта
    if (fontSize !== 'normal') {
        document.documentElement.classList.add(`font-${fontSize}`);
    }

    // Применяем цветовую схему
    if (colorScheme !== 'default') {
        document.documentElement.classList.add(`scheme-${colorScheme}`);
    }

    // Отключение изображений
    if (hideImages) {
        document.documentElement.classList.add('hide-images');
    }
}