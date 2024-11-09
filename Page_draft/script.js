
// script.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const inputs = form.querySelectorAll('input, select');
    
    // Form validation and submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            experienceLevel: document.getElementById('experienceLevel').value,
            riskLevel: document.getElementById('riskLevel').value,
            tenure: document.getElementById('tenure').value,
            maxCapital: document.getElementById('maxCapital').value
        };

        if (validateForm(formData)) {
            handleRegistration(formData);
        }
    });

    // Cancel button handler
    document.querySelector('.btn-outline').addEventListener('click', function() {
        form.reset();
        // Optional: Redirect to home page
        // window.location.href = '/';
    });

    // Form validation
    function validateForm(data) {
        let isValid = true;
        const errors = [];

        for (const [key, value] of Object.entries(data)) {
            if (!value) {
                isValid = false;
                errors.push(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
            }
        }

        if (!isValid) {
            showError(errors.join('\n'));
        }

        return isValid;
    }

    // Registration handler
    function handleRegistration(data) {
        // Show loading state
        const submitButton = form.querySelector('.btn-primary');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Processing...';
        submitButton.disabled = true;

        // Simulate API call
        setTimeout(() => {
            console.log('Registration data:', data);
            
            // Reset form and button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            form.reset();

            // Show success message
            showSuccess('Registration successful!');
        }, 1500);
    }

    // Error message handler
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background-color: #fee2e2;
            color: #dc2626;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
        `;
        errorDiv.textContent = message;

        form.insertBefore(errorDiv, form.firstChild);

        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    // Success message handler
    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            background-color: #dcfce7;
            color: #16a34a;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
        `;
        successDiv.textContent = message;

        form.insertBefore(successDiv, form.firstChild);

        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    // Investment of the Day placeholder content
    function updateInvestmentOfDay() {
        // This function can be used to update the investment section
        // with real data from an API
        const investmentContent = document.querySelector('.investment-content');
        
        // You can replace the loading placeholder with actual content
        // For now, it shows the animated loading state
    }

    // Initialize investment section
    updateInvestmentOfDay();
});