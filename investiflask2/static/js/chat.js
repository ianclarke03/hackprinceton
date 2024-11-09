// static/js/chat.js

document.addEventListener('DOMContentLoaded', () => {
    // Handle user form submission
    const userForm = document.getElementById('user-form');
    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(userForm);
        fetch('/submit_form', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
          .then(data => {
              if (data.status === 'success') {
                  alert('User data submitted successfully!');
              }
          });
    });

    // Handle chat interactions
    const chatForm = document.getElementById('chat-form');
    const chatWindow = document.getElementById('chat-window');

    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const messageInput = document.getElementById('chat-input');
            const message = messageInput.value.trim();
            if (message === '') return;

            // Display user's message
            appendMessage('You', message);
            messageInput.value = '';

            // Send message to server
            fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message })
            }).then(response => response.json())
              .then(data => {
                  // Display bot's message
                  appendMessage('Bot', data.message);
              });
        });
    }

    function appendMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
});
