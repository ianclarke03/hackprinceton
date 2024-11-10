// Update the click handler in title.js
document.addEventListener('DOMContentLoaded', function() {
    const title = document.querySelector('.title');
    const startButton = document.querySelector('.start-button');
    const overlay = document.querySelector('.transition-overlay');
    const floatingLogos = document.getElementById('floating-logos');
    
    // Set the title text
    title.textContent = 'Welcome to Investimor';

    // Create floating logo with random position
    function createFloatingLogo() {
        const logo = document.createElement('div');
        logo.className = 'floating-logo';
        
        // Random position anywhere on screen
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;
        
        // Random size between 20px and 40px
        const size = 20 + Math.random() * 20;
        
        logo.style.cssText = `
            left: ${posX}px;
            top: ${posY}px;
            width: ${size}px;
            height: ${size}px;
        `;
        
        floatingLogos.appendChild(logo);
        
        // Remove the logo after animation
        logo.addEventListener('animationend', () => {
            logo.remove();
        });
    }

    // Create logos periodically with random interval
    function scheduleNextLogo() {
        const delay = 100 + Math.random() * 200;
        setTimeout(() => {
            createFloatingLogo();
            scheduleNextLogo();
        }, delay);
    }

    scheduleNextLogo();

    // Handle button click and transition
    startButton.addEventListener('click', () => {
        sessionStorage.setItem('pageTransition', 'active');
        
        // First slide in the blue overlay
        overlay.style.animation = 'slideOverlay 1s ease forwards';
        
        // After overlay is in place, fade it to black
        setTimeout(() => {
            overlay.style.backgroundColor = 'var(--coinbase-dark)';
            
            // Change page after the color transition
            setTimeout(() => {
                window.location.href = '/main';
            }, 500);
        }, 1000);
    });
});