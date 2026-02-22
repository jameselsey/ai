# Wombat Tools Web UI

A simple storefront web application with integrated Amazon Lex chatbot for customer support.

## Features

- Professional storefront with product catalog
- Responsive design for mobile and desktop
- Integrated Amazon Lex chatbot for customer inquiries
- Docker containerization for easy deployment
- Automated setup with Makefile

## Prerequisites

- Docker installed
- AWS CLI configured
- AWS credentials with Lex permissions
- CloudFormation stack deployed (for automated setup)

## Quick Start

### 1. Automated Setup (Recommended)

If you have deployed the Lex bot using CloudFormation:

```bash
# Fetch bot IDs from CloudFormation
make setup

# Manually edit config.js to add AWS credentials
# Update accessKeyId and secretAccessKey

# Build and run
make build
make run
```

### 2. Manual Setup

If you prefer to configure manually:

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `config.js` and replace the placeholders:
   - `YOUR_ACCESS_KEY_ID` - Your AWS access key
   - `YOUR_SECRET_ACCESS_KEY` - Your AWS secret key
   - `YOUR_BOT_ID` - Your Lex bot ID
   - `YOUR_BOT_ALIAS_ID` - Your Lex bot alias ID

3. Build and run:
   ```bash
   make build
   make run
   ```

## Configuration

### AWS Credentials

The application requires AWS credentials to communicate with Amazon Lex. You can obtain these from:

1. AWS IAM Console
2. Create a user with `AmazonLexRunBotsOnly` policy
3. Generate access keys

### Bot Configuration

To find your bot IDs:

```bash
# List all bots
aws lexv2-models list-bots

# Get bot alias ID
aws lexv2-models list-bot-aliases --bot-id YOUR_BOT_ID
```

Or use the CloudFormation outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name WombatToolsLexBot \
  --query "Stacks[0].Outputs"
```

## Available Commands

```bash
make help      # Show all available commands
make setup     # Fetch bot IDs from CloudFormation
make build     # Build Docker image
make run       # Run container on port 8080
make stop      # Stop container
make clean     # Remove container and image
make logs      # View container logs
```

## Testing the Application

1. Open your browser to `http://localhost:8080`
2. Click the chat button (💬) in the bottom-right corner
3. Try asking questions like:
   - "What products do you have?"
   - "Tell me about your hammers"
   - "What are your store hours?"
   - "Do you offer warranties?"

## Project Structure

```
lex-bot/web-ui/
├── index.html          # Main HTML page
├── style.css           # Styling and responsive design
├── app.js              # Lex integration logic
├── config.js           # AWS and bot configuration
├── Dockerfile          # Docker container definition
├── Makefile            # Build and deployment commands
├── .env.example        # Environment variable template
└── README.md           # This file
```

## Troubleshooting

### Chat not working

1. Check browser console for errors
2. Verify AWS credentials in `config.js`
3. Ensure bot ID and alias ID are correct
4. Check that your AWS user has Lex permissions

### Container won't start

```bash
# Check if port 8080 is already in use
lsof -i :8080

# View container logs
make logs
```

### Bot not responding

1. Verify the bot is built and published in AWS Console
2. Check the bot alias is active
3. Ensure the locale ID matches your bot configuration

## Security Notes

⚠️ **Important**: This implementation uses client-side AWS credentials for demonstration purposes. In production:

1. Use AWS Cognito for authentication
2. Implement a backend API to proxy Lex requests
3. Never expose AWS credentials in client-side code
4. Use IAM roles with minimal required permissions

## Customization

### Changing Products

Edit the product grid in `index.html` to add/remove products.

### Styling

Modify `style.css` to change colors, fonts, and layout. The current theme uses:
- Primary gradient: `#667eea` to `#764ba2`
- Background: `#f8f9fa`

### Chat Behavior

Edit `app.js` to customize:
- Welcome message
- Error handling
- Message formatting
- Session management

## License

This is a demonstration project for educational purposes.
