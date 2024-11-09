// dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    // Edit Profile Button Handler
    const editProfileBtn = document.querySelector('.edit-profile-btn');
    editProfileBtn.addEventListener('click', function() {
        console.log('Edit profile clicked');
        // Add edit profile functionality here
    });

    // Trade Item Click Handlers
    const tradeItems = document.querySelectorAll('.trade-item');
    tradeItems.forEach(item => {
        item.addEventListener('click', function() {
            console.log('Trade clicked:', this.querySelector('span').textContent);
            // Add trade item click functionality here
        });
    });

    // Strategy Button Handlers
    const strategyButtons = document.querySelectorAll('.strategy-btn');
    strategyButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            strategyButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            console.log('Strategy selected:', this.textContent);
        });
    });

    // Learn More Button Handler
    const learnMoreBtn = document.querySelector('.learn-more-btn');
    learnMoreBtn.addEventListener('click', function() {
        const activeStrategy = document.querySelector('.strategy-btn.active');
        if (activeStrategy) {
            console.log('Learning more about:', activeStrategy.textContent);
            // Add learn more functionality here
        } else {
            console.log('Please select a strategy first');
            // Add alert or notification for user
        }
    });

    // Trade Details Link Handlers
    const tradeDetailsLinks = document.querySelectorAll('.trade-details-link');
    tradeDetailsLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Trade details clicked for:', this.previousElementSibling.textContent);
            // Add trade details functionality here
        });
    });
});