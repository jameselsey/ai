# VLM Camera Demo

A minimal web application for interacting with a Vision Language Model using your MacBook's camera feed. Ask questions about what your camera sees and get intelligent responses from a locally-running VLM.

## Prerequisites

- Docker installed on your MacBook
- Python 3.8 or higher
- Modern web browser with camera access

## Setup Instructions

### 1. Install Ollama in Docker

First, pull and run the Ollama Docker container:

```bash
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

This command:
- Runs Ollama in detached mode (`-d`)
- Creates a volume for model storage (`-v ollama:/root/.ollama`)
- Maps port 11434 to your localhost (`-p 11434:11434`)
- Names the container "ollama" (`--name ollama`)

### 2. Pull the VLM Model

Download the LLaVA vision model:

```bash
docker exec -it ollama ollama pull llava:7b
```

**Alternative models** (if you prefer):
- BakLLaVA (lighter/faster): `docker exec -it ollama ollama pull bakllava`
- Llama 3.2 Vision: `docker exec -it ollama ollama pull llama3.2-vision`

Note: The first model download will take several minutes depending on your internet connection. The model is about 4.7 GB.

### 3. Install Python Dependencies

Install required packages:

```bash
pip install -r requirements.txt
```

This installs Flask and requests.

### 4. Start the Backend Server

Run the Flask server:

```bash
python3 server.py
```

You should see:
```
Starting VLM Camera Demo Server...
✓ Ollama connection verified
Server starting on http://localhost:5000
```

If you see a warning about Ollama connection, make sure the Docker container is running.

### 5. Open the Application

Open your web browser and navigate to:

```
http://localhost:5000
```

Grant camera permissions when prompted.

## Usage

1. The left panel shows your live camera feed
2. The right panel is the chat interface
3. Type a question about what the camera sees (e.g., "What objects do you see?")
4. Press Enter or click Send
5. Wait 30-40 seconds for the VLM to analyze the image (you'll see a "Thinking..." indicator)
6. The VLM response will appear in the chat

**Note:** VLM inference on CPU takes time. Expect 30-40 seconds per response on M4 Pro.

## Troubleshooting

### Ollama Connection Failed

If the server can't connect to Ollama:

1. Check if the Docker container is running:
   ```bash
   docker ps | grep ollama
   ```

2. If not running, start it:
   ```bash
   docker start ollama
   ```

3. Verify Ollama is responding:
   ```bash
   curl http://localhost:11434/api/tags
   ```

### Camera Access Denied

If the browser doesn't show your camera:

1. Check browser permissions for camera access
2. Make sure no other application is using the camera
3. Try refreshing the page and granting permissions again

### Model Not Found

If you get a "model not found" error:

1. Verify the model is downloaded:
   ```bash
   docker exec -it ollama ollama list
   ```

2. If not listed, pull the model:
   ```bash
   docker exec -it ollama ollama pull llava:7b
   ```

3. Make sure the model name in `server.py` matches your installed model (currently set to `llava:7b`)

### Slow Responses

VLM inference on CPU takes 30-40 seconds per request. This is normal behavior. The application has a 60-second timeout to accommodate this.

If you want faster responses:
- Use a smaller model like `bakllava`
- Run Ollama on a machine with GPU support

## Stopping the Application

1. Stop the Flask server: Press `Ctrl+C` in the terminal
2. Stop Ollama (optional):
   ```bash
   docker stop ollama
   ```

## Architecture

- **Frontend**: Vanilla HTML/CSS/JavaScript (no frameworks)
- **Backend**: Python Flask server
- **VLM**: Ollama running in Docker
- **Model**: LLaVA 7B (vision language model)

All processing happens locally on your machine. No data is sent to external services.

## Project Structure

```
vlm/
├── server.py          # Flask backend server
├── requirements.txt   # Python dependencies (Flask, requests)
├── README.md         # This file
└── static/
    ├── index.html    # Main UI
    ├── style.css     # Styling
    └── app.js        # Frontend logic
```
