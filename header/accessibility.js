document.addEventListener('DOMContentLoaded', function() {

    localStorage.removeItem('accessibilityFontSize');
    localStorage.removeItem('accessibilityColorScheme');
    localStorage.removeItem('accessibilityHideImages');

    applyAccessibilitySettings();

    window.addEventListener('languageChanged', (event) => {
        const lang = event.detail.lang;
        console.log(`Обновление переводов модального окна для языка: ${lang}`);
        window.loadTranslations(lang, 'accessibility');
    });
});

function applyAccessibilitySettings() {
    const fontSize = localStorage.getItem('accessibilityFontSize') || 'normal';
    const colorScheme = localStorage.getItem('accessibilityColorScheme') || 'default';
    const hideImages = localStorage.getItem('accessibilityHideImages') === 'true';

    document.documentElement.classList.remove('font-normal', 'font-large', 'font-extra-large');
    document.documentElement.classList.remove('scheme-black-green', 'scheme-beige-brown', 'scheme-blue-darkblue');
    document.documentElement.classList.remove('hide-images');

    if (fontSize !== 'normal') {
        document.documentElement.classList.add(`font-${fontSize}`);
    }

    if (colorScheme !== 'default') {
        document.documentElement.classList.add(`scheme-${colorScheme}`);
    }

    if (hideImages) {
        document.documentElement.classList.add('hide-images');
    }
}