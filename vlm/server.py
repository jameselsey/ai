"""
VLM Camera Demo - Backend Server

Flask server that interfaces between the frontend and Ollama VLM.
"""

from flask import Flask, request, jsonify, send_from_directory
import requests
import os

app = Flask(__name__, static_folder='static')

OLLAMA_URL = "http://localhost:11434"
VLM_MODEL = "bakllava"


def format_ollama_request(prompt: str, image_base64: str) -> dict:
    """
    Format request according to Ollama API specification.
    
    Args:
        prompt: User's text question about the image
        image_base64: Base64-encoded image data
    
    Returns:
        Dictionary formatted for Ollama API with model, prompt, images, and stream fields
    """
    return {
        "model": VLM_MODEL,
        "prompt": prompt,
        "images": [image_base64],
        "stream": False
    }


def query_ollama(prompt: str, image_base64: str) -> str:
    """
    Send request to Ollama API with image and prompt.
    
    Args:
        prompt: User's text question about the image
        image_base64: Base64-encoded image data
    
    Returns:
        VLM response text
    
    Raises:
        ConnectionError: If unable to connect to Ollama
        ValueError: If Ollama API returns an error
    """
    try:
        # Format the request for Ollama API
        request_data = format_ollama_request(prompt, image_base64)
        
        # Send POST request to Ollama generate endpoint
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json=request_data,
            timeout=90  # VLM inference can take time on CPU
        )
        
        # Check for HTTP errors
        response.raise_for_status()
        
        # Parse JSON response
        response_data = response.json()
        
        # Extract and return the text response
        if "response" in response_data:
            return response_data["response"]
        else:
            raise ValueError("Ollama response missing 'response' field")
            
    except requests.exceptions.ConnectionError as e:
        raise ConnectionError(f"Could not connect to Ollama at {OLLAMA_URL}. Is it running?") from e
    except requests.exceptions.Timeout as e:
        raise ConnectionError("Request to Ollama timed out") from e
    except requests.exceptions.HTTPError as e:
        # Try to extract error message from response
        try:
            error_data = e.response.json()
            error_msg = error_data.get("error", str(e))
        except:
            error_msg = str(e)
        raise ValueError(f"Ollama API error: {error_msg}") from e
    except Exception as e:
        raise ValueError(f"Unexpected error querying Ollama: {str(e)}") from e


def verify_ollama_connection():
    """
    Check if Ollama is accessible on startup.
    Log warning if not available but don't prevent server start.
    """
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            print("✓ Ollama connection verified")
            return True
        else:
            return False
    except Exception as e:
        print(f"⚠ Warning: Could not connect to Ollama: {e}")
        print("  Make sure Ollama is running:")
        print("  docker run -d -p 11434:11434 --name ollama ollama/ollama")
        return False


@app.route('/')
def index():
    """Serve the main HTML page."""
    return send_from_directory('static', 'index.html')


@app.route('/chat', methods=['POST'])
def handle_chat():
    """
    Handle chat requests with message and image.
    
    Expects JSON body with:
        - message: User's text question
        - image: Base64-encoded image data
    
    Returns JSON with:
        - response: VLM's text response (on success)
        - error: Error message (on failure)
    """
    try:
        # Parse JSON request body
        data = request.get_json(force=False, silent=True)
        
        # Validate required fields
        if data is None:
            return jsonify({"error": "Request body must be JSON"}), 400
        
        if "message" not in data:
            return jsonify({"error": "Missing 'message' field in request"}), 400
        
        if "image" not in data:
            return jsonify({"error": "Missing 'image' field in request"}), 400
        
        message = data["message"]
        image_base64 = data["image"]
        
        # Validate non-empty values
        if not message or not isinstance(message, str):
            return jsonify({"error": "'message' must be a non-empty string"}), 400
        
        if not image_base64 or not isinstance(image_base64, str):
            return jsonify({"error": "'image' must be a non-empty string"}), 400
        
        # Strip data URL prefix if present (e.g., "data:image/jpeg;base64,")
        if "," in image_base64:
            image_base64 = image_base64.split(",", 1)[1]
        
        # Call Ollama with the message and image
        response_text = query_ollama(message, image_base64)
        
        # Return successful response
        return jsonify({"response": response_text})
        
    except ConnectionError as e:
        # Ollama connection issues
        return jsonify({"error": f"VLM service unavailable: {str(e)}"}), 503
    
    except ValueError as e:
        # Ollama API errors or validation errors
        return jsonify({"error": str(e)}), 500
    
    except Exception as e:
        # Unexpected errors
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files (CSS, JS, etc.)."""
    return send_from_directory('static', filename)


if __name__ == '__main__':
    print("Starting VLM Camera Demo Server...")
    verify_ollama_connection()
    print("Server starting on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
