document.addEventListener('DOMContentLoaded', function() {
    fetch('../footer/index.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const footer = doc.querySelector('footer');
            if (footer) {
                document.body.appendChild(footer);
            }
        })
        .catch(error => console.error('Error loading footer:', error));
});