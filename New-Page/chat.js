document.addEventListener('DOMContentLoaded', function() {
    const chatWindow = document.getElementById('chat-window');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const userForm = document.getElementById('user-form');
    let isFirstMessage = true;

    // Add loading bar to the chat window
    const loadingBar = document.createElement('div');
    loadingBar.className = 'loading-bar';
    chatWindow.parentElement.insertBefore(loadingBar, chatForm);

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        if (!isUser) {
            // Typing animation for bot messages
            const typingDiv = document.createElement('div');
            typingDiv.className = 'typing';
            messageDiv.appendChild(typingDiv);
            
            let index = 0;
            const typeWriter = () => {
                if (index < content.length) {
                    typingDiv.textContent += content.charAt(index);
                    index++;
                    setTimeout(typeWriter, 20);
                }
            };
            typeWriter();
        } else {
            messageDiv.textContent = content;
        }

        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Handle user form submission
    userForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        loadingBar.style.display = 'block';

        const formData = new FormData(userForm);
        try {
            const response = await fetch('/submit_form', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (data.status === 'success') {
                userForm.style.display = 'none';
                addMessage(data.initial_message, false);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            loadingBar.style.display = 'none';
        }
    });

    // Handle chat form submission
    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        chatInput.value = '';
        loadingBar.style.display = 'block';

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });
            const data = await response.json();
            addMessage(data.message, false);
        } catch (error) {
            console.error('Error:', error);
            addMessage('Sorry, there was an error processing your message.', false);
        } finally {
            loadingBar.style.display = 'none';
        }
    });
});