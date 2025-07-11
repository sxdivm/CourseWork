document.addEventListener('DOMContentLoaded', function() {
    fetch('../header/index.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const header = doc.querySelector('header');
            if (header) {
                document.body.insertBefore(header, document.body.firstChild);
            }
        })
        .catch(error => console.error('Error loading header:', error));
});