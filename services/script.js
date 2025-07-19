document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.type_selection button.tab');
    const cards = document.querySelectorAll('.card');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const category = tab.getAttribute('data-tab');

            cards.forEach(card => {
                if (card.getAttribute('data-category') === category) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
        tab.addEventListener('touchstart', () => {
            tab.click();
        });
    });
    tabs[0].click();
});