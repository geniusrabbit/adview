.PHONY: ictx
ictx: ## Initialize the context
	@echo "Initializing context..."
	nvm use

.PHONY: deps
deps: ## Install dependencies
	@echo "Installing dependencies..."
	npm install

.PHONY: build-react
build-react: ## Build the React package
	@echo "Building React package..."
	npm run build

.PHONY: help
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "} {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
