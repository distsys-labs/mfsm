# Makefile Reference

This project uses a Makefile to streamline common development tasks.

## Quick Start

```bash
# Show all available commands
make help

# Run all quality checks (lint, typecheck, test, build)
make verify

# Install dependencies
make install
```

## Development Commands

### Linting

```bash
make lint           # Run ESLint
make lint-fix       # Run ESLint with auto-fix
```

### Type Checking

```bash
make typecheck      # Run TypeScript type checker
```

### Testing

```bash
make test           # Run tests once
make test-watch     # Run tests in watch mode
make test-coverage  # Run tests with coverage report
```

### Building

```bash
make clean          # Remove build artifacts and coverage
make build          # Build the project (ESM output to dist/)
```

## Quality Assurance

```bash
make verify         # Run all checks: lint, typecheck, test, build
make all            # Alias for verify
```

## Publishing

### Manual Publish

```bash
make publish        # Verify project, login to npm, and publish
```

This will:
1. Run all verification checks (lint, typecheck, test, build)
2. Prompt for npm login
3. Publish the package to npm

### Full Release Workflow

```bash
make release        # Interactive release workflow
```

This will:
1. Show current version
2. Prompt for version bump type (patch/minor/major)
3. Bump version in package.json
4. Run all verification checks
5. Commit the version bump
6. Create a git tag
7. Push to remote repository
8. Publish to npm

**Version bumps:**
- `patch` - Bug fixes (1.0.0 → 1.0.1)
- `minor` - New features (1.0.0 → 1.1.0)
- `major` - Breaking changes (1.0.0 → 2.0.0)

## Git Helpers

```bash
make status         # Show git status
make diff           # Show git diff
make log            # Show last 10 commits
```

## Example Workflows

### Before committing changes

```bash
make verify         # Ensure everything passes
git add .
git commit -m "your message"
git push
```

### Releasing a patch version

```bash
make release
# When prompted, enter: patch
# This will create version 3.0.1 (from 3.0.0)
```

### Quick iteration during development

```bash
make test-watch     # Keep tests running
# Edit code...
# Tests re-run automatically
```

## Notes

- All commands with colors are terminal-friendly
- The `verify` command is run before publishing to ensure quality
- The `release` command handles the entire release workflow automatically
- Use `make help` anytime to see all available commands
