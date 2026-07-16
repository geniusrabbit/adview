# AdView monorepo — targets used by local dev and .github/workflows.
# CI runs `npm ci` itself; do not chain `deps` into build/lint/test.

.PHONY: ictx
ictx: ## Initialize the context
	@echo "Initializing context..."
	nvm use

.PHONY: deps
deps: ## Install root workspace dependencies
	@echo "Installing dependencies..."
	npm install

.PHONY: deps-ci
deps-ci: ## Clean install (matches GitHub Actions)
	@echo "Installing dependencies (npm ci)..."
	npm ci

.PHONY: deps-project
deps-project: ## Install test-project dependencies (not in workspaces)
	@echo "Installing test-project dependencies..."
	npm --prefix test-project ci

.PHONY: build
build: ## Build all packages in the monorepo
	@echo "Building all packages..."
	npx turbo run build

.PHONY: clean
clean: ## Clean all build artifacts and node_modules
	@echo "Cleaning all packages..."
	npx turbo run clean
	rm -rf node_modules packages/*/node_modules test-project/node_modules

.PHONY: dev
dev: ## Start development mode for all packages
	@echo "Starting development mode..."
	npx turbo run dev

.PHONY: lint
lint: ## Lint all packages
	@echo "Linting all packages..."
	npx turbo run lint

.PHONY: test
test: test-packages test-project ## Run all tests (packages + integration)

.PHONY: test-packages
test-packages: ## Run unit tests for workspace packages via turbo
	@echo "Running package unit tests..."
	npx turbo run test

.PHONY: test-core
test-core: ## Run @adview/core unit tests
	@echo "Running @adview/core tests..."
	npm test --workspace=@adview/core

.PHONY: test-react
test-react: ## Run @adview/react unit tests
	@echo "Running @adview/react tests..."
	npm test --workspace=@adview/react

.PHONY: test-project
test-project: deps-project ## Run full ad-cycle integration tests in test-project
	@echo "Running test-project integration tests..."
	npm --prefix test-project test

.PHONY: dev-project
dev-project: deps-project ## Start test-project Next.js server (http://localhost:3002)
	@echo "Starting test-project on http://localhost:3002 ..."
	npm --prefix test-project run dev

.PHONY: test-watch-core
test-watch-core: ## Watch @adview/core unit tests
	npm test --workspace=@adview/core -- --watch

.PHONY: test-watch-react
test-watch-react: ## Watch @adview/react unit tests
	npm test --workspace=@adview/react -- --watch

.PHONY: test-watch-project
test-watch-project: deps-project ## Watch test-project integration tests
	npm --prefix test-project run test:watch

.PHONY: publish-check
publish-check: ## Dry-run npm publish for public packages (run make build first)
	@echo "Checking packages for publishing..."
	@for pkg in packages/*; do \
		if [ ! -f "$$pkg/package.json" ]; then continue; fi; \
		if node -e "process.exit(require('./$$pkg/package.json').private ? 0 : 1)"; then \
			echo "Skipping private $$pkg"; \
			continue; \
		fi; \
		echo "Checking $$pkg..."; \
		(cd "$$pkg" && npm publish --dry-run); \
	done

.PHONY: version-check
version-check: ## Show version of all packages
	@echo "Package versions:"
	@node -e "require('fs').readdirSync('./packages').forEach(p => { try { const pkg = require('./packages/' + p + '/package.json'); console.log(pkg.name + ':', pkg.version + (pkg.private ? ' (private)' : '')); } catch (e) {} })"

.PHONY: publish
publish: ## Publish public packages to npm (publish.yml; requires auth)
	@echo "Publishing packages via changesets..."
	npx changeset publish

.PHONY: version
version: ## Apply changeset version bumps (release.yml)
	npm run version

.PHONY: ci
ci: ## Same checks as .github/workflows/ci.yml (after npm ci)
	@echo "Running CI checks..."
	@$(MAKE) lint
	@$(MAKE) build
	@$(MAKE) test
	@$(MAKE) publish-check

.PHONY: help
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "} {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
