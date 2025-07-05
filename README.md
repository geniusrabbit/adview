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

## Packages

This monorepo contains the following packages:

- `@adview/react`: The main package for the AdView React library.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Ad Formats](#ad-formats)
- [Configuration](#configuration)
- [Tracking](#tracking)
- [Server-Side Rendering](#server-side-rendering)
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

## Quick Start

### Basic Usage

```tsx
import { AdViewUnit } from '@adview/react';

function MyComponent() {
  return (
    <AdViewUnit
      unitId="your-ad-unit-id"
      srcURL="https://your-ad-server.com/ads/{<id>}"
      format="banner"
    />
  );
}
```

### With Provider (Recommended)

```tsx
import { AdViewProvider, AdViewUnit } from '@adview/react';

function App() {
  return (
    <AdViewProvider srcURL="https://your-ad-server.com/ads/{<id>}">
      <AdViewUnit unitId="header-banner" format="banner" />
      <AdViewUnit unitId="sidebar-native" format="native" />
    </AdViewProvider>
  );
}
```

### Custom Rendering

```tsx
import { AdViewUnit } from '@adview/react';

function CustomAd() {
  return (
    <AdViewUnit unitId="custom-ad" format="native">
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
    </AdViewUnit>
  );
}
```

## API Reference

### AdViewUnit

Main component for displaying advertisements.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `unitId` | `string` | ✓ | Unique identifier for the ad unit |
| `format` | `'banner' \| 'native' \| 'proxy'` | ✗ | Ad format type |
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

### AdViewProvider

Context provider for global configuration.

#### Provider Props

| Prop | Type | Description |
|------|------|-------------|
| `srcURL` | `string` | Default ad server URL template |
| `children` | `ReactNode` | Child components |

## Ad Formats

### Banner Ads

Simple image-based advertisements:

```tsx
<AdViewUnit unitId="banner-300x250" format="banner" />
```

### Native Ads

Content-style ads with structured data:

```tsx
<AdViewUnit unitId="native-article" format="native" />
```

### Proxy Ads

Delegated rendering to external systems:

```tsx
<AdViewUnit unitId="proxy-widget" format="proxy" />
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
import { pageScrapers } from '@adview/react/utils';

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
import { AdViewUnitServer } from '@adview/react/server';

// In your server component
function ServerPage() {
  return (
    <AdViewUnitServer
      unitId="ssr-banner"
      srcURL="https://ads.example.com/serve/{<id>}"
    />
  );
}
```

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
│   └── react/              # Main React package
│       ├── src/
│       │   ├── AdViewUnit/ # Core components
│       │   ├── types.ts    # TypeScript definitions
│       │   ├── index.ts    # Client exports
│       │   └── server.ts   # Server exports
│       └── package.json
├── utils/                  # Shared utilities
├── typings/               # Global type definitions
└── package.json          # Monorepo configuration
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
