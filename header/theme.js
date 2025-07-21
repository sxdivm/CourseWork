document.addEventListener('DOMContentLoaded', function() {
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        document.querySelectorAll('.theme').forEach(button => {
            button.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
            });
        });
    }

    if (document.querySelector('header')) {
        initializeTheme();
    } else {

        const observer = new MutationObserver(() => {
            if (document.querySelector('header')) {
                initializeTheme();
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
});