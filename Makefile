.PHONY: help install clean lint lint-fix typecheck test test-watch test-coverage build verify all publish release

# Default target
.DEFAULT_GOAL := help

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

##@ Help

help: ## Display this help message
	@echo "$(CYAN)MFSM - My Finite State Machine$(NC)"
	@echo ""
	@echo "$(GREEN)Available targets:$(NC)"
	@awk 'BEGIN {FS = ":.*##"; printf ""} /^[a-zA-Z_-]+:.*?##/ { printf "  $(CYAN)%-15s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Dependencies

install: ## Install npm dependencies
	@echo "$(CYAN)Installing dependencies...$(NC)"
	npm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

##@ Development

clean: ## Remove build artifacts and coverage
	@echo "$(CYAN)Cleaning build artifacts...$(NC)"
	rm -rf dist coverage .vitest *.tsbuildinfo
	@echo "$(GREEN)✓ Clean complete$(NC)"

lint: ## Run ESLint
	@echo "$(CYAN)Running ESLint...$(NC)"
	npm run lint
	@echo "$(GREEN)✓ Linting complete$(NC)"

lint-fix: ## Run ESLint with auto-fix
	@echo "$(CYAN)Running ESLint with auto-fix...$(NC)"
	npm run lint:fix
	@echo "$(GREEN)✓ Linting fixed$(NC)"

typecheck: ## Run TypeScript type checking
	@echo "$(CYAN)Running TypeScript type checker...$(NC)"
	npm run typecheck
	@echo "$(GREEN)✓ Type checking complete$(NC)"

##@ Testing

test: ## Run tests
	@echo "$(CYAN)Running tests...$(NC)"
	npm test
	@echo "$(GREEN)✓ Tests complete$(NC)"

test-watch: ## Run tests in watch mode
	@echo "$(CYAN)Running tests in watch mode...$(NC)"
	npm run test:watch

test-coverage: ## Run tests with coverage report
	@echo "$(CYAN)Running tests with coverage...$(NC)"
	npm run test:coverage
	@echo "$(GREEN)✓ Coverage report generated$(NC)"

##@ Build

build: clean ## Build the project
	@echo "$(CYAN)Building project...$(NC)"
	npm run build
	@echo "$(GREEN)✓ Build complete$(NC)"
	@ls -lh dist/

##@ Quality Checks

verify: lint typecheck test build ## Run all quality checks (lint, typecheck, test, build)
	@echo ""
	@echo "$(GREEN)════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  ✓ All verification checks passed!$(NC)"
	@echo "$(GREEN)════════════════════════════════════════$(NC)"

##@ Release

all: verify ## Alias for verify - run all quality checks
	@echo "$(GREEN)✓ Ready for release$(NC)"

publish: verify ## Verify, login to npm, and publish package
	@echo ""
	@echo "$(YELLOW)════════════════════════════════════════$(NC)"
	@echo "$(YELLOW)  Publishing to npm...$(NC)"
	@echo "$(YELLOW)════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(CYAN)Logging into npm...$(NC)"
	npm login
	@echo ""
	@echo "$(CYAN)Publishing package...$(NC)"
	npm publish
	@echo ""
	@echo "$(GREEN)════════════════════════════════════════$(NC)"
	@echo "$(GREEN)  ✓ Package published successfully!$(NC)"
	@echo "$(GREEN)════════════════════════════════════════$(NC)"

release: ## Create a new release (bump version, verify, publish)
	@echo "$(YELLOW)════════════════════════════════════════$(NC)"
	@echo "$(YELLOW)  Creating new release...$(NC)"
	@echo "$(YELLOW)════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(CYAN)Current version:$(NC) $$(node -p "require('./package.json').version")"
	@echo ""
	@read -p "Enter version bump type (patch/minor/major): " bump_type; \
	if [ -z "$$bump_type" ]; then \
		echo "$(RED)✗ Version bump type required$(NC)"; \
		exit 1; \
	fi; \
	echo "$(CYAN)Bumping version ($$bump_type)...$(NC)"; \
	npm version $$bump_type --no-git-tag-version; \
	new_version=$$(node -p "require('./package.json').version"); \
	echo "$(GREEN)✓ Version bumped to $$new_version$(NC)"; \
	echo ""; \
	$(MAKE) verify; \
	echo ""; \
	echo "$(CYAN)Committing version bump...$(NC)"; \
	git add package.json; \
	git commit -m "chore(release): $$new_version"; \
	git tag -a "v$$new_version" -m "Release v$$new_version"; \
	echo "$(GREEN)✓ Version committed and tagged$(NC)"; \
	echo ""; \
	echo "$(CYAN)Pushing to remote...$(NC)"; \
	git push && git push --tags; \
	echo "$(GREEN)✓ Changes pushed to remote$(NC)"; \
	echo ""; \
	$(MAKE) publish; \
	echo ""; \
	echo "$(GREEN)════════════════════════════════════════$(NC)"; \
	echo "$(GREEN)  ✓ Release v$$new_version complete!$(NC)"; \
	echo "$(GREEN)════════════════════════════════════════$(NC)"

##@ Git

status: ## Show git status
	@git status

diff: ## Show git diff
	@git diff

log: ## Show git log (last 10 commits)
	@git log --oneline --graph --decorate -10
