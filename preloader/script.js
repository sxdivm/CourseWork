const preloader = document.querySelector('.preloader');
const mainContent = document.querySelector('main');

if (!preloader) {
    const fallbackPreloader = document.createElement('div');
    fallbackPreloader.className = 'preloader';
    fallbackPreloader.innerHTML = '<div class="spinner"></div>';
    document.body.prepend(fallbackPreloader);
}

if (mainContent) {
    mainContent.style.visibility = 'hidden';
    mainContent.style.opacity = '0';
}

function hidePreloader() {
    const actualPreloader = preloader || document.querySelector('.preloader');
    const header = document.querySelector('header');

    setTimeout(() => {
        if (actualPreloader) {
            actualPreloader.classList.add('hidden');
        }
        if (mainContent) {
            mainContent.style.visibility = '';
            mainContent.style.opacity = '';
            mainContent.classList.add('loaded');
        }
        if (header) {
            header.style.visibility = '';
            header.style.opacity = '';
        }
        document.body.classList.add('loaded');
    }, 1000); 
}


window.addEventListener('load', () => {
    const header = document.querySelector('header');
    if (header) {
        header.style.visibility = 'hidden';
        header.style.opacity = '0';
        hidePreloader();
    } else {
        const observer = new MutationObserver((mutations, obs) => {
            if (document.querySelector('header')) {
                const header = document.querySelector('header');
                header.style.visibility = 'hidden';
                header.style.opacity = '0';
                hidePreloader();
                obs.disconnect(); 
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
});