// edit-profile.js
document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileForm');
    const profileImage = document.getElementById('profileImage');
    const previewImage = document.getElementById('previewImage');
    const previewName = document.getElementById('previewName');
    const previewTitle = document.getElementById('previewTitle');
    const nameInput = document.getElementById('name');
    const customTitleInput = document.getElementById('customTitle');
    const titleRadios = document.querySelectorAll('input[name="title"]');
    
    // Real-time name update
    nameInput.addEventListener('input', function() {
        previewName.textContent = this.value || 'John Doe';
    });

    // Handle custom title input
    customTitleInput.addEventListener('input', function() {
        const customRadio = document.querySelector('input[name="title"][value="custom"]');
        customRadio.checked = true;
        updatePreviewTitle(this.value);
    });

    // Handle title radio changes
    titleRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'custom') {
                updatePreviewTitle(customTitleInput.value);
                customTitleInput.focus();
            } else {
                updatePreviewTitle(this.value);
            }
        });
    });

    // Profile image upload
    profileImage.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Save Changes button handler
    document.getElementById('saveChanges').addEventListener('click', function() {
        const titleRadio = document.querySelector('input[name="title"]:checked');
        const title = titleRadio.value === 'custom' ? customTitleInput.value : titleRadio.value;
        
        const formData = {
            name: nameInput.value,
            title: title
        };
        
        console.log('Saving personal information:', formData);
        showNotification('Personal information updated successfully!');
    });

    // Update Details button handler
    document.getElementById('updateDetails').addEventListener('click', function() {
        const formData = {
            experience: document.querySelector('input[name="experience"]:checked').value,
            risk: document.querySelector('input[name="risk"]:checked').value,
            capital: document.getElementById('capital').value,
            tenure: document.getElementById('tenure').value
        };
        console.log('Updating trading details:', formData);
        showNotification('Trading details updated successfully!');
    });

    // Experience level update
    document.querySelectorAll('input[name="experience"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updatePreviewBio();
        });
    });

    // Risk level update
    document.querySelectorAll('input[name="risk"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updatePreviewBio();
        });
    });

    // Update preview title
    function updatePreviewTitle(title) {
        previewTitle.textContent = title || 'Trader';
    }

    // Update preview bio based on experience and risk
    function updatePreviewBio() {
        const experience = document.querySelector('input[name="experience"]:checked').value;
        const risk = document.querySelector('input[name="risk"]:checked').value;
        const previewBio = document.getElementById('previewBio');
        previewBio.textContent = `${experience} trader with ${risk.toLowerCase()} risk tolerance`;
    }

    // Notification helper
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--primary-blue);
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Focus custom input when clicking on its container
    document.querySelector('.custom-title').addEventListener('click', function() {
        customTitleInput.focus();
    });

    // Initialize preview states
    updatePreviewBio();
    if (document.querySelector('input[name="title"][value="custom"]').checked) {
        updatePreviewTitle(customTitleInput.value);
    }
});