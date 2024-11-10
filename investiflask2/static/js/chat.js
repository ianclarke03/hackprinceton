// Initialize chat history if not present in sessionStorage
if (!sessionStorage.getItem('chatHistory')) {
    sessionStorage.setItem('chatHistory', JSON.stringify([]));
}

// Utility function to extract YouTube video ID
function getYouTubeID(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\s]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Create collapsible section
function createCollapsible(title, content) {
    const section = document.createElement('div');
    section.className = 'collapsible fadeIn';
    
    const header = document.createElement('div');
    header.className = 'collapsible-header';
    header.innerHTML = `
        <span>${title}</span>
        <span class="toggle-icon">▼</span>
    `;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'collapsible-content';
    contentDiv.innerHTML = content;
    
    section.appendChild(header);
    section.appendChild(contentDiv);
    
    header.addEventListener('click', () => {
        console.log('Collapsible header clicked');
        const isActive = section.classList.contains('active');
        
        // Close all other sections within the same container
        const parent = section.parentElement;
        parent.querySelectorAll('.collapsible').forEach(el => {
            if (el !== section) {
                el.classList.remove('active');
                el.querySelector('.toggle-icon').textContent = '▼';
            }
        });
        
        // Toggle current section
        console.log('Before toggle:', section.classList.contains('active'));
        section.classList.toggle('active');
        console.log('After toggle:', section.classList.contains('active'));
        
        // Update icon
        const icon = header.querySelector('.toggle-icon');
        icon.textContent = section.classList.contains('active') ? '▲' : '▼';
        
        // Scroll into view if opening
        if (!isActive) {
            setTimeout(() => {
                section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 300);
        }
    });
    
    return section;
}

// Handle initial form submission
document.getElementById('user-form').onsubmit = async function(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        experience: formData.get('experience'),
        risk_level: formData.get('risk_level'),
        tenure: formData.get('tenure'),
        capital: formData.get('capital'),
        sectors: []
    };
    
    // Collect selected sectors
    const sectorCheckboxes = document.querySelectorAll('input[name="sectors"]:checked');
    sectorCheckboxes.forEach(checkbox => {
        data.sectors.push(checkbox.value);
    });
    
    if (data.sectors.length > 3) {
        showNotification("Please select a maximum of 3 sectors.", "error");
        return;
    }
    
    if (data.sectors.length === 0) {
        showNotification("Please select at least one sector.", "error");
        return;
    }
    
    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultsSection = document.getElementById('results-section');
    const submitButton = event.target.querySelector('button[type="submit"]');
    
    loadingIndicator.innerHTML = `
        <img src="/static/images/spinner.gif" alt="Loading..." />
        <p>Analyzing your investment preferences...</p>
    `;
    loadingIndicator.style.display = 'block';
    resultsSection.style.display = 'none';
    submitButton.disabled = true;
    
    try {
        const response = await fetch('/submit_form', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            // Clear previous content
            const investmentAdviceDiv = document.getElementById('investment-advice');
            const videoRecommendationsDiv = document.getElementById('video-recommendations');
            investmentAdviceDiv.innerHTML = '';
            videoRecommendationsDiv.innerHTML = '';
            
            // Create collapsible sections for each sector's information
            result.investment_advice.forEach((advice) => {
                const sectorContent = `
                    <div class="info-section">
                        <div class="info-block">
                            <h3>Overview</h3>
                            <p>${advice.overview}</p>
                        </div>
                        
                        <div class="info-block">
                            <h3>Market Analysis</h3>
                            <p>${advice.market_analysis}</p>
                        </div>
                        
                        <div class="info-block">
                            <h3>Investment Strategies</h3>
                            <p>${advice.strategies}</p>
                        </div>
                        
                        <div class="info-block">
                            <h3>Key Considerations</h3>
                            <p>${advice.considerations}</p>
                        </div>
                        
                        <div class="info-block">
                            <h3>Future Outlook</h3>
                            <p>${advice.outlook}</p>
                        </div>
                        
                        <div class="info-block">
                            <h3>Educational Resources</h3>
                            <ul>
                                ${advice.resources.map(resource => `<li>${resource}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
                
                const sectorSection = createCollapsible(advice.title, sectorContent);
                investmentAdviceDiv.appendChild(sectorSection);
            });
            
            // Create collapsible sections for videos by sector
            Object.entries(result.video_recommendations).forEach(([sector, videos]) => {
                const videoContent = videos.map(videoUrl => {
                    const videoId = getYouTubeID(videoUrl);
                    if (!videoId) return '';
                    
                    return `
                        <div class="video-container">
                            <iframe 
                                src="https://www.youtube.com/embed/${videoId}"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen>
                            </iframe>
                        </div>
                    `;
                }).join('');
                
                const videoSection = createCollapsible(`${sector} Educational Videos`, `
                    <div class="video-grid">
                        ${videoContent}
                    </div>
                `);
                videoRecommendationsDiv.appendChild(videoSection);
            });
            
            // Show results
            resultsSection.style.display = 'block';
            
            // Initialize chat with welcome message
            addChatMessage("I've analyzed your preferences and created detailed information for each sector. Click on the sector headers to expand the information. Feel free to ask any questions!");
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            
        } else {
            showNotification(result.message || 'An error occurred while processing your request.', "error");
        }
    } catch (error) {
        console.error("Error during form submission:", error);
        showNotification('An error occurred while processing your request. Please try again.', "error");
    } finally {
        loadingIndicator.style.display = 'none';
        submitButton.disabled = false;
    }
};

// Chat message handling
function addChatMessage(message, isUser = false) {
    const chatWindow = document.getElementById('chat-window');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = `<strong>${isUser ? 'You' : 'Bot'}:</strong> ${message}`;
    
    messageDiv.appendChild(content);
    chatWindow.appendChild(messageDiv);
    
    // Smooth scroll to bottom
    chatWindow.scrollTo({
        top: chatWindow.scrollHeight,
        behavior: 'smooth'
    });
}

// Handle chat form submission
document.getElementById('chat-form').onsubmit = async function(event) {
    event.preventDefault();
    const messageInput = document.getElementById('chat-input');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Add user message and clear input
    addChatMessage(message, true);
    messageInput.value = '';
    messageInput.disabled = true;
    
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        addChatMessage(data.message);
    } catch (error) {
        console.error('Error:', error);
        addChatMessage('Sorry, I encountered an error. Please try again.');
    } finally {
        messageInput.disabled = false;
        messageInput.focus();
    }
};

// Notification system
function showNotification(message, type = "info") {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove notification after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Limit sector selection to a maximum of 3
const sectorCheckboxes = document.querySelectorAll('input[name="sectors"]');
sectorCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const checked = document.querySelectorAll('input[name="sectors"]:checked');
        if (checked.length > 3) {
            this.checked = false;
            showNotification("You can select a maximum of 3 sectors.", "error");
        }
    });
});

