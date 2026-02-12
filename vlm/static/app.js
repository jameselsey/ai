// VLM Camera Demo - Frontend Logic
console.log('VLM Camera Demo loaded');

// Track camera state
let cameraStream = null;
let isRecoveringCamera = false;

// Camera initialization
async function initCamera() {
    const video = document.getElementById('camera');
    
    try {
        // Request camera access with video constraints
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: false
        });
        
        // Store stream reference for monitoring
        cameraStream = stream;
        
        // Set video element's source to camera stream
        video.srcObject = stream;
        console.log('Camera initialized successfully');
        
        // Set up camera loss detection
        setupCameraLossDetection(stream);
        
        // Enable send button if it was disabled
        const sendButton = document.getElementById('send-button');
        if (sendButton) {
            sendButton.disabled = false;
        }
        
        // Remove any existing camera error notifications
        const existingError = document.getElementById('camera-loss-notification');
        if (existingError) {
            existingError.remove();
        }
        
    } catch (error) {
        console.error('Camera access error:', error);
        
        // Handle permission denied or other camera errors
        let errorMessage = 'Camera access is required for this application. ';
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            errorMessage += 'Please grant camera permissions in your browser settings and reload the page.';
        } else if (error.name === 'NotFoundError') {
            errorMessage += 'No camera device found on this system.';
        } else if (error.name === 'NotReadableError') {
            errorMessage += 'Camera is already in use by another application.';
        } else {
            errorMessage += `Error: ${error.message}`;
        }
        
        // Display error message in the video panel
        const videoPanel = document.querySelector('.video-panel');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message camera-error';
        errorDiv.textContent = errorMessage;
        videoPanel.appendChild(errorDiv);
        
        // Hide the video element since camera is not available
        video.style.display = 'none';
        
        // Disable send button
        const sendButton = document.getElementById('send-button');
        if (sendButton) {
            sendButton.disabled = true;
        }
    }
}

// Set up camera loss detection
function setupCameraLossDetection(stream) {
    // Listen for track ended events on all video tracks
    const videoTracks = stream.getVideoTracks();
    
    videoTracks.forEach(track => {
        track.addEventListener('ended', () => {
            console.warn('Camera stream ended unexpectedly');
            handleCameraLoss();
        });
    });
}

// Handle camera loss and attempt recovery
async function handleCameraLoss() {
    // Prevent multiple simultaneous recovery attempts
    if (isRecoveringCamera) {
        return;
    }
    
    isRecoveringCamera = true;
    
    // Disable send button
    const sendButton = document.getElementById('send-button');
    if (sendButton) {
        sendButton.disabled = true;
    }
    
    // Display notification to user
    displayCameraLossNotification();
    
    // Attempt to reinitialize camera after a short delay
    console.log('Attempting to reinitialize camera...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
        await initCamera();
        console.log('Camera successfully reinitialized');
        
        // Display success message in chat
        displayError('Camera connection restored');
        
    } catch (error) {
        console.error('Failed to reinitialize camera:', error);
        
        // Display failure message in chat
        displayError('Failed to restore camera connection. Please check your camera and refresh the page.');
    } finally {
        isRecoveringCamera = false;
    }
}

// Display camera loss notification in video panel
function displayCameraLossNotification() {
    const videoPanel = document.querySelector('.video-panel');
    
    // Remove existing notification if present
    const existingNotification = document.getElementById('camera-loss-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'camera-loss-notification';
    notification.className = 'error-message camera-error';
    notification.textContent = 'Camera connection lost. Attempting to reconnect...';
    
    videoPanel.appendChild(notification);
}

// Capture current frame from video feed
function captureFrame() {
    const video = document.getElementById('camera');
    
    try {
        // Verify video is ready and has valid dimensions
        if (!video.videoWidth || !video.videoHeight) {
            throw new Error('Video stream not ready');
        }
        
        // Create canvas element with video dimensions
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Get canvas context and draw current video frame
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to base64 JPEG (80% quality for balance)
        const base64String = canvas.toDataURL('image/jpeg', 0.8);
        
        console.log('Frame captured successfully');
        return base64String;
        
    } catch (error) {
        console.error('Image capture error:', error);
        throw new Error(`Failed to capture image: ${error.message}`);
    }
}

// Display message in chat interface
function displayMessage(sender, text, responseTime = null) {
    const messagesContainer = document.getElementById('messages');
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    // Create text content
    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    messageDiv.appendChild(textSpan);
    
    // Add response time for assistant messages
    if (sender === 'assistant' && responseTime !== null) {
        const timeSpan = document.createElement('span');
        timeSpan.className = 'response-time';
        timeSpan.textContent = ` (${responseTime.toFixed(1)}s)`;
        messageDiv.appendChild(timeSpan);
    }
    
    // Append to messages container
    messagesContainer.appendChild(messageDiv);
    
    // Auto-scroll to latest message
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    console.log(`Message displayed: ${sender}`);
}

// Display error message in chat interface
function displayError(message) {
    const messagesContainer = document.getElementById('messages');
    
    // Create error message element with distinct styling
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message error';
    errorDiv.textContent = message;
    
    // Append to messages container
    messagesContainer.appendChild(errorDiv);
    
    // Auto-scroll to show error message
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    console.error(`Error displayed: ${message}`);
}

// Show loading indicator in chat
let loadingTimerInterval = null;

function showLoading() {
    const messagesContainer = document.getElementById('messages');
    
    // Create loading indicator element
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message loading';
    loadingDiv.id = 'loading-indicator';
    
    // Create timer display
    const timerSpan = document.createElement('span');
    timerSpan.id = 'loading-timer';
    timerSpan.textContent = 'Thinking... 0s';
    loadingDiv.appendChild(timerSpan);
    
    // Append to messages container
    messagesContainer.appendChild(loadingDiv);
    
    // Auto-scroll to show loading indicator
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Start timer
    let seconds = 0;
    loadingTimerInterval = setInterval(() => {
        seconds++;
        const timerElement = document.getElementById('loading-timer');
        if (timerElement) {
            timerElement.textContent = `Thinking... ${seconds}s`;
        }
    }, 1000);
    
    console.log('Loading indicator shown');
}

// Hide loading indicator from chat
function hideLoading() {
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // Clear timer interval
    if (loadingTimerInterval) {
        clearInterval(loadingTimerInterval);
        loadingTimerInterval = null;
    }
    
    if (loadingIndicator) {
        loadingIndicator.remove();
        console.log('Loading indicator hidden');
    }
}

// Send message and image to backend
async function sendMessage(text, imageBase64) {
    try {
        console.log('Sending message to backend...');
        
        // Create abort controller for manual timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout
        
        try {
            // Send POST request to /chat endpoint with JSON payload
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: text,
                    image: imageBase64
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            // Check if response was successful
            if (!response.ok) {
                console.error('HTTP error:', response.status);
                // Try to parse error from response body
                try {
                    const data = await response.json();
                    if (data.error) {
                        return { error: data.error };
                    }
                } catch (e) {
                    // Ignore JSON parse errors
                }
                return { error: `Server error: ${response.status}` };
            }
            
            // Parse JSON response
            const data = await response.json();
            
            // Check if response contains an error
            if (data.error) {
                console.error('Backend returned error:', data.error);
                return { error: data.error };
            }
            
            // Return successful response text
            console.log('Message sent successfully');
            return { response: data.response };
            
        } catch (fetchError) {
            clearTimeout(timeoutId);
            throw fetchError;
        }
        
    } catch (error) {
        console.error('Network error:', error);
        
        // Handle specific error types
        if (error.name === 'AbortError') {
            return { error: 'Request timed out after 90 seconds. The VLM service may be slow or unavailable.' };
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return { error: 'Failed to connect to server. Please check that the backend is running.' };
        } else {
            return { error: `Network error: ${error.message}` };
        }
    }
}

// Handle send button click
async function handleSendClick() {
    const input = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const messageText = input.value.trim();
    
    // Validate message is not empty
    if (!messageText) {
        return;
    }
    
    try {
        // Disable send button to prevent multiple submissions
        sendButton.disabled = true;
        
        // Capture current video frame
        const imageBase64 = captureFrame();
        
        // Display user message immediately
        displayMessage('user', messageText);
        
        // Clear input field
        input.value = '';
        
        // Show loading indicator and start timer
        showLoading();
        const startTime = performance.now();
        
        // Send message and image to backend
        const result = await sendMessage(messageText, imageBase64);
        
        // Calculate response time
        const endTime = performance.now();
        const responseTime = (endTime - startTime) / 1000; // Convert to seconds
        
        // Hide loading indicator
        hideLoading();
        
        // Display response or error
        if (result.error) {
            displayError(result.error);
        } else if (result.response) {
            displayMessage('assistant', result.response, responseTime);
        } else {
            displayError('Received invalid response from server');
        }
        
    } catch (error) {
        // Hide loading indicator if shown
        hideLoading();
        
        // Display error message
        displayError(`Failed to capture image: ${error.message}`);
        
    } finally {
        // Re-enable send button
        sendButton.disabled = false;
    }
}

// Initialize camera when page loads
document.addEventListener('DOMContentLoaded', () => {
    initCamera();
    
    // Attach send button click handler
    const sendButton = document.getElementById('send-button');
    sendButton.addEventListener('click', handleSendClick);
    
    // Attach Enter key handler to input field
    const input = document.getElementById('message-input');
    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSendClick();
        }
    });
});
