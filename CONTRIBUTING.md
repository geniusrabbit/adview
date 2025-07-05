# Contributing to @adview

We're excited that you're interested in contributing to @adview! This document provides guidelines and information for contributors to the AdView advertising library ecosystem.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Package Overview](#package-overview)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- Make (for build automation)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/adview.git
   cd adview
   ```

## Development Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up the development environment:**

   ```bash
   # Use the Makefile for common tasks
   make ictx    # Initialize context (nvm use)
   make deps    # Install dependencies
   ```

3. **Build all packages:**

   ```bash
   make build   # Build all packages
   # or
   npm run build
   ```

4. **Run tests:**

   ```bash
   npm test
   ```

## Project Structure

```text
adview/
├── packages/                   # Package modules
│   └── react/                  # React integration package
│       ├── src/                # React components and hooks
│       ├── dist/               # Built React package
│       ├── tests/              # React-specific tests
│       ├── package.json
│       ├── README.md
│       └── CONTRIBUTING.md     # React package specific guidelines
├── utils/                      # Core utility functions
│   ├── executeImpressionsTracking.ts
│   ├── getPrepareURL.ts
│   ├── getRandomString.ts
│   ├── getResolveConfig.ts
│   ├── adViewFetcher.ts
│   ├── getCollectPageData.ts
│   ├── getAssetByName.ts
│   ├── getSrcSetCSSThumbs.ts
│   └── getSrcSetThumbs.ts
├── typings/                    # TypeScript type definitions
│   └── index.ts                # Core type definitions
├── docs/                       # Documentation
├── tests/                      # Core library tests
├── dist/                       # Built files (generated)
├── package.json                # Main package configuration
├── Makefile                    # Build automation
├── README.md                   # Main project documentation
└── CONTRIBUTING.md             # This file
```

## Package Overview

### Core Library (`/`)

The main AdView library containing:

- **Utils**: Core utility functions for ad fetching, tracking, and data processing
- **Typings**: TypeScript definitions for ad data structures and configurations
- **Base functionality**: Platform-agnostic ad management logic

### React Package (`/packages/react`)

React-specific implementation providing:

- **Components**: `AdViewUnitClient`, `AdViewUnitServer`, `AdViewProvider`
- **Hooks**: Custom React hooks for ad data management
- **Type-safe**: Full TypeScript support with React-specific types
- **SSR Support**: Server-side rendering capabilities

### Future Packages

The monorepo structure supports additional framework integrations:

- `packages/vue` - Vue.js integration (planned)
- `packages/angular` - Angular integration (planned)
- `packages/vanilla` - Vanilla JavaScript integration (planned)

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements
- `chore/` - Maintenance tasks

Examples:

- `feat/add-video-ad-support`
- `fix/memory-leak-in-banner-component`
- `docs/update-api-reference`
- `feat/react-ssr-improvements`
- `fix/utils-asset-loading-bug`

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
type(scope): description

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```text
feat(react): add support for video ad format
feat(utils): add new asset loading utility
fix(typings): resolve type definition conflicts
fix(react/server): resolve SSR hydration mismatch
docs(readme): update installation instructions
chore(build): update build pipeline configuration
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code (core utils and packages)
- Provide proper type definitions for all functions and components
- Avoid `any` types - use specific types or generics
- Use strict TypeScript configuration
- Export types from the main typings module

### Core Utils

- Write platform-agnostic utility functions
- Include comprehensive JSDoc documentation
- Use functional programming patterns where appropriate
- Ensure utilities are testable and pure functions where possible

### React Package

- Use functional components with hooks
- Follow React best practices and patterns
- Use proper prop validation with TypeScript
- Implement proper error boundaries where needed

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Code Quality Guidelines

1. **Core Utilities:**

   ```typescript
   /**
    * Fetches advertisement data from the specified URL
    * 
    * @param unitId - The unique identifier for the ad unit
    * @param srcURL - The URL template for fetching ad data
    * @returns Promise resolving to ad data or null if no ads available
    */
   export async function fetchAdData(unitId: string, srcURL: string): Promise<AdData | null> {
     // Implementation
   }
   ```

2. **React Components:**

   ```tsx
   // ✅ Good
   interface AdUnitProps {
     unitId: string;
     format?: AdFormat;
     onLoad?: (data: AdData) => void;
   }

   export function AdUnit({ unitId, format = 'banner', onLoad }: AdUnitProps) {
     // Implementation
   }

   // ❌ Avoid
   export function AdUnit(props: any) {
     // Implementation
   }
   ```

3. **Type Definitions:**

   ```typescript
   // ✅ Good - Export from main typings
   export interface AdData {
     id: string;
     title?: string;
     description?: string;
     image?: string;
     url?: string;
   }

   // ✅ Good - Package-specific extensions
   export interface ReactAdProps extends AdData {
     children?: React.ReactNode;
   }
   ```

4. **Error Handling:**

   ```tsx
   // ✅ Good
   try {
     const adData = await fetchAdData(unitId);
     setData(adData);
   } catch (error) {
     console.error('Failed to fetch ad data:', error);
     setError(error instanceof Error ? error : new Error('Unknown error'));
   }
   ```

## Testing

### Test Structure

- **Core Utils**: Unit tests for utility functions
- **Type Definitions**: Type checking and validation tests  
- **React Package**: Component and hook tests
- **Integration Tests**: Cross-package functionality tests
- **End-to-end Tests**: Full workflow testing

### Writing Tests

1. **Utility Function Tests:**

   ```typescript
   import { getPrepareURL } from '../utils/getPrepareURL';

   describe('getPrepareURL', () => {
     it('should replace placeholder with unit ID', () => {
       const url = getPrepareURL('https://ads.com/{<id>}', 'unit-123');
       expect(url).toBe('https://ads.com/unit-123');
     });

     it('should handle missing placeholder', () => {
       const url = getPrepareURL('https://ads.com/', 'unit-123');
       expect(url).toBe('https://ads.com/');
     });
   });
   ```

2. **React Component Tests:**

   ```tsx
   import { render, screen } from '@testing-library/react';
   import { AdViewUnitClient } from '../packages/react/src/AdViewUnitClient';

   describe('AdViewUnitClient', () => {
     it('renders with basic props', () => {
       render(
         <AdViewUnitClient
           unitId="test-unit"
           srcURL="https://example.com/{<id>}"
         />
       );
       
       expect(screen.getByTestId('ad-unit')).toBeInTheDocument();
     });
   });
   ```

3. **Type Definition Tests:**

   ```typescript
   import type { AdData, AdViewConfig } from '../typings';

   // Type-only test to ensure types compile correctly
   const testAdData: AdData = {
     id: 'test-123',
     title: 'Test Ad',
     description: 'Test Description'
   };

   const testConfig: AdViewConfig = {
     unitId: 'test-unit',
     srcURL: 'https://example.com/{<id>}'
   };
   ```

### Running Tests

```bash
# Run all tests (core + packages)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific package tests
cd packages/react && npm test

# Run specific test file
npm test -- utils/getPrepareURL.test.ts

# Run specific test file in React package
cd packages/react && npm test -- AdViewUnitClient.test.tsx
```

## Documentation

### Code Documentation

- Use JSDoc comments for all public APIs
- Include examples in documentation
- Document complex logic and algorithms

```tsx
/**
 * Fetches advertisement data from the specified URL
 * 
 * @param unitId - The unique identifier for the ad unit
 * @param srcURL - The URL template for fetching ad data
 * @returns Promise resolving to ad data or null if no ads available
 * 
 * @example
 * ```tsx
 * const data = await fetchAdData('unit-123', 'https://ads.com/{<id>}');
 * ```
 */
export async function fetchAdData(unitId: string, srcURL: string): Promise<AdData | null> {
  // Implementation
}
```

### README Updates

When adding new features:

1. Update the main README.md (project overview)
2. Update package-specific README.md files
3. Add examples to the documentation
4. Update the API reference sections
5. Add migration notes if breaking changes
6. Update the project structure documentation

### Documentation Structure

- **Main README.md**: Project overview, installation, basic usage
- **packages/react/README.md**: React-specific documentation
- **utils/**: JSDoc comments for all utility functions
- **typings/**: Type definition documentation
- **docs/**: Additional guides and tutorials

## Pull Request Process

### Before Submitting

1. **Ensure your code follows the coding standards**
2. **Write or update tests** for your changes
3. **Update documentation** as needed
4. **Run the full test suite** and ensure all tests pass
5. **Check that your code builds** without errors

### PR Checklist

- [ ] Code follows the established coding standards
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] Commit messages follow the conventional format
- [ ] No breaking changes (or clearly documented)
- [ ] Performance impact is considered
- [ ] Accessibility requirements are met

### PR Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Include screenshots for UI changes.

## Additional Notes
Any additional information or context.
```

### Review Process

1. Automated checks must pass (CI/CD, linting, tests)
2. At least one maintainer review is required
3. Address feedback and update as needed
4. Maintainer will merge once approved

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected vs actual behavior**
4. **Environment details** (React version, browser, OS)
5. **Code examples** or minimal reproduction
6. **Screenshots** if applicable

### Feature Requests

For feature requests, please provide:

1. **Clear description** of the proposed feature
2. **Use case** or problem it solves
3. **Proposed API** or interface
4. **Examples** of how it would be used
5. **Alternatives considered**

### Issue Templates

Use the provided issue templates when creating new issues on GitHub.

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/) for both the core library and packages:

- **MAJOR**: Breaking changes (affects all packages)
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Package Versioning

- Core library and packages maintain synchronized versions
- Breaking changes in core utilities require major version bump
- Package-specific features can be minor version bumps
- Individual package patches are allowed for package-specific fixes

### Release Steps

1. Update version in main `package.json`
2. Update versions in package `package.json` files
3. Update CHANGELOG.md files (main + packages)
4. Create release notes
5. Tag the release
6. Publish to npm (main package + sub-packages)
7. Update documentation

### Changelog

Maintain CHANGELOG.md files following [Keep a Changelog](https://keepachangelog.com/) format:

**Main CHANGELOG.md:**

```markdown
## [1.2.0] - 2025-01-15

### Added
- New asset loading utility function
- Enhanced TypeScript definitions

### Changed
- Improved error handling in core utilities

### Fixed
- URL preparation edge cases
- Type definition conflicts

### Packages
- @adview/react@1.2.0: Added video ad support
```

**Package-specific CHANGELOG.md:**

```markdown
## [1.2.0] - 2025-01-15

### Added
- Video ad format support
- Advanced tracking options

### Changed
- Improved error handling in client components

### Fixed
- Memory leak in banner component
- SSR hydration issues
```

## Getting Help

- **Documentation**: Check the main README and package-specific documentation
- **Issues**: Search existing issues on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Package-specific**: Check individual package CONTRIBUTING.md files
- **Build Issues**: Use `make help` to see available commands

## Package-Specific Guidelines

For detailed package-specific contribution guidelines, see:

- **React Package**: `packages/react/CONTRIBUTING.md`
- **Future Packages**: Each package will have its own specific guidelines

## Recognition

Contributors will be recognized in:

- Main CONTRIBUTORS.md file
- Package-specific contributor lists
- Release notes
- Package.json contributors field

Thank you for contributing to @adview! 🎉
