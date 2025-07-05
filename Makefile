.PHONY: ictx
ictx: ## Initialize the context
	@echo "Initializing context..."
	nvm use

.PHONY: deps
deps: ## Install dependencies
	@echo "Installing dependencies..."
	npm install

.PHONY: build
build: deps ## Build all packages in the monorepo
	@echo "Building all packages..."
	npx turbo run build

.PHONY: clean
clean: ## Clean all build artifacts and node_modules
	@echo "Cleaning all packages..."
	npx turbo run clean
	rm -rf node_modules packages/*/node_modules

.PHONY: dev
dev: deps ## Start development mode for all packages
	@echo "Starting development mode..."
	npx turbo run dev

.PHONY: lint
lint: deps ## Lint all packages
	@echo "Linting all packages..."
	npx turbo run lint

.PHONY: test
test: deps ## Run tests for all packages
	@echo "Running tests for all packages..."
	npx turbo run test

.PHONY: publish-check
publish-check: build ## Check if packages are ready for publishing
	@echo "Checking packages for publishing..."
	@for pkg in . packages/*; do \
		if [ -f "$$pkg/package.json" ]; then \
			echo "Checking $$pkg..."; \
			cd "$$pkg" && npm publish --dry-run && cd - > /dev/null; \
		fi \
	done

.PHONY: version-check
version-check: ## Show version of all packages
	@echo "Package versions:"
	@echo "Root package: $$(jq -r '.version' package.json)"
	@for pkg in packages/*; do \
		if [ -f "$$pkg/package.json" ]; then \
			echo "$$(basename $$pkg): $$(jq -r '.version' $$pkg/package.json)"; \
		fi \
	done

.PHONY: create-package
create-package: ## Create a new framework package (usage: make create-package name=vue framework=Vue)
	@if [ -z "$(name)" ] || [ -z "$(framework)" ]; then \
		echo "Usage: make create-package name=<package-name> framework=<framework-name> [language=<language>]"; \
		echo "Example: make create-package name=vue framework=Vue language=typescript"; \
		exit 1; \
	fi
	@./scripts/create-package.sh $(name) $(framework) $(or $(language),typescript)

.PHONY: help
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "} {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
