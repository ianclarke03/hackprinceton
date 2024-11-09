document.addEventListener('DOMContentLoaded', function() {
    const title = document.querySelector('.title');
    const startButton = document.querySelector('.start-button');
    const overlay = document.querySelector('.transition-overlay');
    
    // Set the title text
    title.textContent = 'Welcome to Investabot';

    // Handle button click and transition
    startButton.addEventListener('click', () => {
        overlay.style.animation = 'slideOverlay 1s ease forwards';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 900);
    });
});