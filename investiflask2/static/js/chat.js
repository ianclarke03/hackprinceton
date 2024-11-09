// static/js/chat.js

document.addEventListener('DOMContentLoaded', () => {
    // Handle chat interactions
    const chatForm = document.getElementById('chat-form');
    const chatWindow = document.getElementById('chat-window');

    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageInput = document.getElementById('chat-input');
            const message = messageInput.value.trim();
            if (message === '') return;

            // Display user's message
            appendMessage('You', message);
            messageInput.value = '';

            try {
                // Send message to server
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: message })
                });
                const data = await response.json();

                // Display bot's message
                appendMessage('Bot', data.message);
            } catch (error) {
                console.error("Error:", error);
                appendMessage('Error', 'Failed to send message.');
            }
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
