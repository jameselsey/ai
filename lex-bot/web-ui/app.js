// Initialize AWS SDK
let lexRuntime;
let sessionId;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeAWS();
    setupEventListeners();
    generateSessionId();
});

function initializeAWS() {
    try {
        AWS.config.update({
            region: CONFIG.region,
            credentials: new AWS.Credentials({
                accessKeyId: CONFIG.accessKeyId,
                secretAccessKey: CONFIG.secretAccessKey
            })
        });
        
        lexRuntime = new AWS.LexRuntimeV2();
        console.log('AWS SDK initialized successfully');
    } catch (error) {
        console.error('Error initializing AWS SDK:', error);
        showStatus('Error: Unable to initialize chat service');
    }
}

function generateSessionId() {
    sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function setupEventListeners() {
    const chatButton = document.getElementById('chatButton');
    const closeChat = document.getElementById('closeChat');
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');
    
    chatButton.addEventListener('click', openChat);
    closeChat.addEventListener('click', closeChat);
    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function openChat() {
    const chatWidget = document.getElementById('chatWidget');
    chatWidget.classList.add('active');
    
    // Show welcome message if chat is empty
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages.children.length === 0) {
        addBotMessage('Hello! I\'m the Wombat Tools assistant. How can I help you today?');
    }
}

function closeChat() {
    const chatWidget = document.getElementById('chatWidget');
    chatWidget.classList.remove('active');
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Display user message
    addUserMessage(message);
    messageInput.value = '';
    
    // Send to Lex
    sendToLex(message);
}

function sendToLex(message) {
    if (!lexRuntime) {
        showStatus('Error: Chat service not initialized');
        addBotMessage('Sorry, the chat service is not available. Please check the configuration.');
        return;
    }
    
    showStatus('Sending...');
    
    const params = {
        botId: CONFIG.botId,
        botAliasId: CONFIG.botAliasId,
        localeId: CONFIG.localeId,
        sessionId: sessionId,
        text: message
    };
    
    lexRuntime.recognizeText(params, function(err, data) {
        if (err) {
            console.error('Lex error:', err);
            showStatus('Error: ' + err.message);
            addBotMessage('Sorry, I encountered an error. Please try again.');
        } else {
            showStatus('');
            
            // Display bot response
            if (data.messages && data.messages.length > 0) {
                data.messages.forEach(msg => {
                    if (msg.content) {
                        addBotMessage(msg.content);
                    }
                });
            } else {
                addBotMessage('I received your message but have no response.');
            }
            
            console.log('Lex response:', data);
        }
    });
}

function addUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function addBotMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function showStatus(status) {
    const chatStatus = document.getElementById('chatStatus');
    chatStatus.textContent = status;
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
