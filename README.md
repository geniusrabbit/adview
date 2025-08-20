# AdView

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/geniusrabbit/adview)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

AdView is a modern, type-safe React library for displaying and managing advertisements in web applications. It provides flexible components for multiple ad formats with built-in tracking, error handling, and both client-side and server-side rendering support.

## Features

- 🎯 **Multiple Ad Formats**: Support for banner, native, and proxy advertisements
- 🔄 **Dual Rendering**: Both client-side and server-side rendering capabilities
- 📊 **Built-in Tracking**: Automatic impression and click tracking
- 🛡️ **Type Safety**: Full TypeScript support with comprehensive type definitions
- 🎨 **Customizable Styling**: Flexible styling system for different ad formats
- 🚀 **Performance Optimized**: Lazy loading and efficient bundle splitting
- 🔧 **Extensible**: Plugin-based scraper system for data collection
- ⚡ **Next.js App Router**: Full compatibility with Next.js 13+ App Router

## Packages

This monorepo contains the following packages:

- `@adview/core`: Core utilities, types, and shared functionality
- `@adview/react`: React components and hooks for AdView

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Ad Formats](#ad-formats)
- [Configuration](#configuration)
- [Tracking](#tracking)
- [Server-Side Rendering](#server-side-rendering)
- [Next.js App Router](#nextjs-app-router)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Installation

Install the package using npm or yarn:

```bash
npm install @adview/react
```

```bash
yarn add @adview/react
```

### Import Styles

AdView supports multiple import styles for different use cases:

#### Package-level imports (recommended)

```typescript
// React components - namespace import
import * as AdView from '@adview/react';

// React components - named imports
import { Provider, Unit, Template, DefaultTemplate } from '@adview/react';

// Server components (for Next.js App Router)
import { Unit as ServerUnit } from '@adview/react/server';
```

#### Direct utility imports

```typescript
// Core utilities (tree-shakable)
import { adViewFetcher, getResolveConfig } from '@adview/core/utils';

// TypeScript types
import { AdViewData, AdViewConfig } from '@adview/core/typings';
```

Benefits:

- **Tree-shaking**: Import only what you need
- **Type safety**: Full TypeScript support
- **Intellisense**: Better IDE autocomplete
- **Future-proof**: Ready for framework extensions (@adview/vue, @adview/angular)

## Quick Start

### Basic Usage

```tsx
import * as AdView from '@adview/react';

function MyComponent() {
  return (
    <AdView.Unit
      unitId="your-ad-unit-id"
      srcURL="https://your-ad-server.com/ads/{<id>}"
      format="banner"
    />
  );
}
```

### With Provider (Recommended)

```tsx
import * as AdView from '@adview/react';

function App() {
  return (
    <AdView.Provider srcURL="https://your-ad-server.com/ads/{<id>}">
      <AdView.Unit unitId="header-banner" format="banner" />
      <AdView.Unit unitId="sidebar-native" format="native" />
    </AdView.Provider>
  );
}
```

### Custom Rendering

```tsx
import * as AdView from '@adview/react';

function CustomAd() {
  return (
    <AdView.Unit unitId="custom-ad" format="native">
      {({ data, state, error, onDefault }) => {
        if (state.isLoading) return <div>Loading ad...</div>;
        if (state.isError) return <div>Failed to load ad</div>;
        if (!data) return onDefault?.() || null;
        
        return (
          <div className="custom-ad">
            <h3>{data.fields?.title}</h3>
            <p>{data.fields?.description}</p>
          </div>
        );
      }}
    </AdView.Unit>
  );
}
```

### Advanced Usage with Multiple Formats

```tsx
import * as AdView from '@adview/react';

function AdvancedAd() {
  return (
    <AdView.Unit unitId="multi-format-ad" format={['native', 'banner', 'proxy']}>
      {/* Loading state for all formats */}
      <AdView.Template type="*" isLoading={true}>
        <div className="loading-placeholder">
          Loading ad...
        </div>
      </AdView.Template>
      
      {/* Banner ad template */}
      <AdView.Template type="banner">
        {({ data }) => {
          const mainAsset = data?.assets?.find(asset => asset.name === 'main');
          return (
            <div className="banner-ad">
              <a href={data?.url} target="_blank" rel="noopener">
                <img
                  src={mainAsset?.path}
                  alt={data?.fields?.title}
                  style={{ width: '100%', height: 'auto' }}
                />
              </a>
            </div>
          );
        }}
      </AdView.Template>
      
      {/* Native ad template */}
      <AdView.Template type="native">
        {({ data }) => {
          const mainAsset = data?.assets?.find(asset => asset.name === 'main');
          return (
            <div className="native-ad">
              <a href={data?.fields?.url} target="_blank" rel="noopener">
                <img src={mainAsset?.path} alt={data?.fields?.title} />
                <h3>{data?.fields?.title}</h3>
                <p>{data?.fields?.description}</p>
                <span>{data?.fields?.brandname}</span>
              </a>
            </div>
          );
        }}
      </AdView.Template>
      
      {/* Proxy template for iframe-based ads */}
      <AdView.ProxyTemplate className="proxy-ad-container" />
      
      {/* Fallback template */}
      <AdView.DefaultTemplate>
        <div className="fallback-ad">
          <iframe
            src="https://your-fallback-ad.com"
            width="100%"
            height="240"
            frameBorder="0"
          />
        </div>
      </AdView.DefaultTemplate>
    </AdView.Unit>
  );
}
```

## API Reference

### AdView.Unit

Main component for displaying advertisements.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `unitId` | `string` | ✓ | Unique identifier for the ad unit |
| `format` | `'banner' \| 'native' \| 'proxy' \| string[]` | ✗ | Ad format type or array of formats |
| `srcURL` | `string` | ✗ | Ad server URL template |
| `onDefault` | `() => ReactNode \| ReactNode` | ✗ | Fallback content when no ad is available |
| `children` | `function \| ReactElement` | ✗ | Custom render function or component |

#### Load State

The component provides detailed loading states:

```typescript
type AdLoadState = {
  isInitial: boolean;  // Initial state before loading
  isLoading: boolean;  // Currently fetching ad data
  isError: boolean;    // Error occurred during loading
  isComplete: boolean; // Loading completed (success or error)
};
```

### AdView.Provider

Context provider for global configuration.

#### Provider Props

| Prop | Type | Description |
|------|------|-------------|
| `srcURL` | `string` | Default ad server URL template |
| `children` | `ReactNode` | Child components |

### AdView.Template

Template component for custom ad rendering with specific ad types.

#### Template Props

| Prop | Type | Description |
|------|------|-------------|
| `type` | `'banner' \| 'native' \| 'proxy' \| '*'` | Ad type for template matching. Use `'*'` for all types |
| `isLoading` | `boolean` | Only render when in loading state |
| `isError` | `boolean` | Only render when in error state |
| `isComplete` | `boolean` | Only render when loading is complete |
| `children` | `function` | Render function receiving ad data and state |

### AdView.ProxyTemplate

Pre-built template for proxy (iframe-based) ads.

#### ProxyTemplate Props

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | CSS class for the iframe container |
| `style` | `React.CSSProperties` | Inline styles for the iframe |

#### ProxyTemplate Usage

```tsx
<AdView.Unit unitId="proxy-ad">
  <AdView.ProxyTemplate className="ad-iframe" />
</AdView.Unit>
```

### AdView.DefaultTemplate

Default fallback template when no ad data is available.

#### DefaultTemplate Usage

```tsx
<AdView.Unit unitId="example">
  <AdView.DefaultTemplate>
    <div>No ad available</div>
  </AdView.DefaultTemplate>
</AdView.Unit>
```

## Ad Formats

### Banner Ads

Simple image-based advertisements:

```tsx
<AdView.Unit unitId="banner-300x250" format="banner" />
```

### Native Ads

Content-style ads with structured data:

```tsx
<AdView.Unit unitId="native-article" format="native" />
```

### Proxy Ads

Delegated rendering to external systems:

```tsx
<AdView.Unit unitId="proxy-widget" format="proxy" />
```

## Configuration

### Environment Variables

```bash
# Default ad server URL
ADSERVER_AD_JSONP_REQUEST_URL=https://your-ad-server.com/ads/{<id>}
```

### URL Template

The `srcURL` should contain `{<id>}` placeholder that will be replaced with the `unitId`:

```text
https://ads.example.com/serve/{<id>}?format=json
```

### Data Collection

The library automatically collects browser data for ad targeting:

- Screen dimensions
- Timestamp
- Cache-busting tokens

You can extend data collection by adding custom scrapers:

```typescript
import { pageScrapers } from '@adview/core/utils';

// Add custom scraper
pageScrapers.push(() => ({
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
}));
```

## Tracking

### Automatic Tracking

The library automatically handles:

- **Impression tracking**: When ads become visible
- **Click tracking**: When users interact with ads
- **View tracking**: Custom view events

### Manual Tracking

```tsx
import { AdViewUnitTracking } from '@adview/react';

<AdViewUnitTracking
  impressions={['https://track.example.com/imp?id=123']}
  clicks={['https://track.example.com/click?id=123']}
  views={['https://track.example.com/view?id=123']}
>
  <YourAdComponent />
</AdViewUnitTracking>
```

## Server-Side Rendering

For SSR applications, use the server-specific components:

```tsx
import { Unit as ServerUnit } from '@adview/react/server';

// In your server component
function ServerPage() {
  return (
    <ServerUnit
      unitId="ssr-banner"
      srcURL="https://ads.example.com/serve/{<id>}"
    />
  );
}
```

## Next.js App Router

### Client Components

For interactive ads with loading states and user interactions, mark your component as a client component:

```tsx
'use client';

import * as AdView from '@adview/react';

export default function ClientAdComponent() {
  return (
    <AdView.Provider srcURL="https://ads.example.com/serve/{<id>}">
      <AdView.Unit unitId="interactive-ad" format="native">
        {({ data, state, error }) => {
          if (state.isLoading) return <div>Loading...</div>;
          if (error) return <div>Error: {error.message}</div>;
          if (!data) return null;
          
          return (
            <div className="ad-content">
              <h3>{data.fields?.title}</h3>
              <p>{data.fields?.description}</p>
            </div>
          );
        }}
      </AdView.Unit>
    </AdView.Provider>
  );
}
```

### Server Components

For static ads that don't require client-side interactivity:

```tsx
import { Unit as ServerUnit } from '@adview/react/server';

export default function ServerAdComponent() {
  return (
    <ServerUnit
      unitId="static-banner"
      srcURL="https://ads.example.com/serve/{<id>}"
      format="banner"
    />
  );
}
```

### Common Issues

#### Error: "Functions are not valid as a child of Client Components"

This occurs when using render functions in Server Components. Solution:

1. Add `'use client'` directive to your component
2. Or use server-specific components from `@adview/react/server`

## Development

### Prerequisites

- Node.js ≥ 18
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/geniusrabbit/adview.git
cd adview

# Install dependencies
npm install

# Build all packages
npm run build

# Start development mode
npm run dev
```

### Scripts

```bash
npm run build     # Build all packages
npm run lint      # Run ESLint
npm run test      # Run tests
npm run version   # Version packages
npm run release   # Publish packages
```

### Project Structure

```text
adview/
├── packages/
│   ├── react/              # React components and hooks
│   │   ├── src/
│   │   │   ├── AdViewUnit/ # Core components
│   │   │   ├── types.ts    # TypeScript definitions
│   │   │   ├── index.ts    # Client exports
│   │   │   └── server.ts   # Server exports
│   │   └── package.json
│   └── (future packages: vue, angular, etc.)
├── utils/                  # Shared utilities (@adview/core)
├── typings/               # Global type definitions (@adview/core)
└── package.json          # Core package (@adview/core)
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new features
- Update documentation for API changes
- Run linting before submitting PRs

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 **Email**: [support@geniusrabbit.com](mailto:support@geniusrabbit.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/geniusrabbit/adview/issues)
- 📖 **Documentation**: [GitHub Wiki](https://github.com/geniusrabbit/adview/wiki)

## Publishing to npm

For detailed instructions on publishing packages to npm, see [PUBLISHING.md](./PUBLISHING.md).

**Quick commands:**

```bash
# Check packages are ready for publishing
make publish-check

# Check current versions
make version-check

# Login to npm (first time only)
npm login

# Publish all packages
npm run publish
```

## Creating New Framework Packages

To add support for new frameworks (Vue, Angular, etc.):

```bash
# Create new package structure
make create-package name=vue framework=Vue language=typescript

# Navigate and implement
cd packages/vue
# ... implement Vue components ...

# Build and test
npm run build
npm publish --dry-run
```

## Publishing & CI/CD

### Quick Publishing

The monorepo supports automated publishing with version management:

```bash
# Method 1: Quick publish with changeset
npx changeset add
npx changeset version
npm run publish

# Method 2: Manual version bump and publish
npm version patch  # or minor, major
npm publish
```

### Automated Publishing with Tags

The repository includes GitHub Actions for automated publishing:

1. **Push a version tag** to trigger publishing:

   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

2. **GitHub Actions** automatically:
   - Builds all packages
   - Runs tests and linting
   - Publishes to npm registry
   - Creates GitHub release

### CI/CD Workflows

Three GitHub Actions workflows are configured:

- **`ci.yml`**: Runs tests, lint, build on PRs and pushes
- **`publish.yml`**: Publishes packages when version tags are pushed
- **`release.yml`**: Manages changeset-based releases on main branch

See [PUBLISHING.md](./PUBLISHING.md) for detailed publishing instructions.

## Troubleshooting

### Permission Errors

```bash
npm ERR! code E403
npm ERR! 403 Forbidden - PUT https://registry.npmjs.org/@adview%2freact
```

**Solution**: Ensure you have publishing permissions for the `@adview` scope.

### Authentication Errors

```bash
npm ERR! code E401
npm ERR! 401 Unauthorized
```

**Solution**: Run `npm login` again.

### Package Already Exists

```bash
npm ERR! code E409
npm ERR! Cannot publish over existing version
```

**Solution**: Increment version number in `package.json`.

### Automated CI/CD Publishing

For automated publishing in CI/CD pipelines:

```bash
# Use npm token for authentication
echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc

# Build and publish
npm run build
npm run publish
```
