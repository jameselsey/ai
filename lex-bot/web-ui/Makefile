.PHONY: help setup build run stop clean logs

CONTAINER_NAME=wombat-tools-web
IMAGE_NAME=wombat-tools-web
PORT=8080
STACK_NAME=lex-bot-demo
REGION_NAME=ap-southeast-2

help:
	@echo "Wombat Tools Web UI - Available Commands:"
	@echo ""
	@echo "  make setup    - Fetch bot IDs from CloudFormation and update config"
	@echo "  make build    - Build Docker image"
	@echo "  make run      - Run container on port $(PORT)"
	@echo "  make stop     - Stop and remove container"
	@echo "  make clean    - Remove container and image"
	@echo "  make logs     - View container logs"
	@echo ""

setup:
	@echo "Fetching bot configuration from CloudFormation..."
	@BOT_ID=$$(aws cloudformation describe-stacks \
		--stack-name $(STACK_NAME) \
		--region $(REGION_NAME) \
		--query "Stacks[0].Outputs[?OutputKey=='LexBotId'].OutputValue" \
		--output text 2>/dev/null || echo ""); \
	BOT_ALIAS_ID=$$(aws cloudformation describe-stacks \
		--stack-name $(STACK_NAME) \
		--region $(REGION_NAME) \
		--query "Stacks[0].Outputs[?OutputKey=='LexBotAliasId'].OutputValue" \
		--output text 2>/dev/null || echo ""); \
	if [ -z "$$BOT_ID" ] || [ -z "$$BOT_ALIAS_ID" ]; then \
		echo "Error: Could not fetch bot IDs from CloudFormation stack '$(STACK_NAME)'"; \
		echo "Please ensure the stack exists and has the required outputs."; \
		exit 1; \
	fi; \
	echo "Bot ID: $$BOT_ID"; \
	echo "Bot Alias ID: $$BOT_ALIAS_ID"; \
	echo "Updating config.js..."; \
	sed -i.bak "s/YOUR_BOT_ID/$$BOT_ID/g" config.js; \
	sed -i.bak "s/YOUR_BOT_ALIAS_ID/$$BOT_ALIAS_ID/g" config.js; \
	rm -f config.js.bak; \
	echo "Configuration updated successfully!"
	@echo ""
	@echo "IMPORTANT: You still need to manually update config.js with:"
	@echo "  - accessKeyId"
	@echo "  - secretAccessKey"

build:
	@echo "Building Docker image..."
	docker build -t $(IMAGE_NAME) .
	@echo "Build complete!"

run: stop
	@echo "Starting container on port $(PORT)..."
	docker run -d --name $(CONTAINER_NAME) -p $(PORT):80 $(IMAGE_NAME)
	@echo "Container started!"
	@echo "Access the web UI at: http://localhost:$(PORT)"

stop:
	@echo "Stopping container..."
	@docker stop $(CONTAINER_NAME) 2>/dev/null || true
	@docker rm $(CONTAINER_NAME) 2>/dev/null || true
	@echo "Container stopped."

clean: stop
	@echo "Removing image..."
	@docker rmi $(IMAGE_NAME) 2>/dev/null || true
	@echo "Cleanup complete!"

logs:
	@docker logs -f $(CONTAINER_NAME)
