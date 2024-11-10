document.addEventListener('DOMContentLoaded', function() {
    const title = document.querySelector('.title');
    const mainButton = document.querySelector('.start-button');
    const alternateButton = document.querySelector('.start-button.alternate');
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

    // Handle main button click and transition
    mainButton.addEventListener('click', () => {
        sessionStorage.setItem('pageTransition', 'active');
        
        overlay.style.animation = 'slideOverlay 1s ease forwards';
        
        setTimeout(() => {
            overlay.style.backgroundColor = 'var(--coinbase-dark)';
            
            setTimeout(() => {
                window.location.href = '/main';
            }, 500);
        }, 1000);
    });

    // Handle alternate button click
    alternateButton.addEventListener('click', () => {
        window.location.href = 'http://localhost:3000';
    });
});