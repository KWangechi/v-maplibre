# Contributing to @geoql/v-maplibre

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js (LTS version)
- bun 1.3.11
- Git

### Getting Started

1. **Fork and clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/v-maplibre.git
cd v-maplibre
```

2. **Install dependencies**

```bash
bun install
```

3. **Set up git hooks**

```bash
bun prepare
```

This installs Husky hooks for:

- Pre-commit: Runs lint-staged (Oxlint + Prettier on staged files)
- Commit-msg: Validates commit messages against conventional commits

## Development Workflow

### Running the Development Server

> **Note:** Remember to set the API keys for Google Flood Mapping and Maps Guru.
> See [mapcn-vue setup instructions](./apps/mapcn-vue/README.md#setup-api-keys).

```bash
bun run dev:lib      # Watch mode for library
bun run dev:docs     # Docus documentation
bun run dev:mapcn    # mapcn-vue site
```

### Running Tests

```bash
# Run tests in watch mode
bun test

# Run tests once
bun test run

# Run tests with coverage
bun test:coverage

# Run tests with UI
bun test:ui
```

### Linting and Formatting

```bash
# Run Oxlint
bun lint

# Fix lint issues
bun lint:fix

# Format code
bun format

# Check formatting
bun format:check
```

### Building

```bash
bun run build        # Build all packages
bun run build:docs   # Build docs
bun run build:mapcn  # Build mapcn-vue
```

### Documentation

```bash
# Start docs dev server
bun docs:dev

# Build docs
bun docs:build

# Preview docs build
bun docs:preview
```

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Commits must follow this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, semicolons, etc)
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes
- `build:` - Build system changes

### Examples

```bash
feat(map): add cluster layer support

fix(marker): resolve positioning bug on zoom

docs(readme): update installation instructions

test(layers): add geojson layer tests
```

### Breaking Changes

Use `!` after the type or add `BREAKING CHANGE:` in the footer:

```bash
feat(api)!: redesign component props

BREAKING CHANGE: VMap props have been renamed for consistency
```

## Pull Request Process

1. **Create a feature branch**

```bash
git checkout -b feat/my-new-feature
# or
git checkout -b fix/bug-description
```

2. **Make your changes**

- Write tests for new features
- Update documentation
- Follow the existing code style
- Ensure all tests pass
- Maintain or improve test coverage (90%+ required)

3. **Commit your changes**

```bash
git add .
git commit -m "feat: add new feature"
```

The pre-commit hook will:

- Run Oxlint on staged files
- Format staged files with Prettier

The commit-msg hook will:

- Validate your commit message format

4. **Push to your fork**

```bash
git push origin feat/my-new-feature
```

5. **Create a Pull Request**

- Use a clear, descriptive title
- Describe what changes you made and why
- Link any related issues
- Ensure all CI checks pass

### Pull Request Checklist

- [ ] Tests pass locally (`bun test`)
- [ ] Code is linted (`bun lint`)
- [ ] Code is formatted (`bun format`)
- [ ] Test coverage is maintained (90%+)
- [ ] Documentation is updated
- [ ] Commit messages follow conventional commits
- [ ] Branch is up to date with main

## Code Structure

```
v-maplibre/
├── src/                    # Source code
│   ├── constants/         # Event constants
│   ├── controls/          # Map controls
│   ├── layers/            # Layer components
│   ├── map/               # Core map component
│   ├── markers/           # Marker components
│   ├── popups/            # Popup components
│   └── utils/             # Utilities
├── test/                  # Test files
├── docs/                  # Documentation (Docus)
└── .github/               # GitHub workflows
```

## Testing Guidelines

- Write tests for all new features
- Maintain 90%+ code coverage
- Use descriptive test names
- Mock external dependencies (MapLibre GL, PMTiles)
- Test both happy paths and edge cases

### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VMap from '@/map/VMap.vue';

describe('VMap', () => {
  it('renders with default options', () => {
    const wrapper = mount(VMap, {
      props: {
        options: {
          container: 'map',
          style: 'https://example.com/style.json',
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
```

## Documentation Guidelines

- Update relevant documentation when adding features
- Use clear, concise language
- Include code examples
- Follow the existing documentation structure

## Questions?

Feel free to:

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
