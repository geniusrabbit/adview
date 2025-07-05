# @adview/react

[![npm version](https://img.shields.io/npm/v/@adview/react.svg)](https://www.npmjs.com/package/@adview/react)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A modern, type-safe React library for displaying and managing advertisements in web applications. Provides flexible components for multiple ad formats with built-in tracking, error handling, and both client-side and server-side rendering support.

## Features

- 🎯 **Multiple Ad Formats**: Banner, native, and proxy advertisements
- 🔄 **Dual Rendering**: Client-side and server-side rendering support
- 📊 **Built-in Tracking**: Automatic impression and click tracking
- 🛡️ **Type Safety**: Full TypeScript support with comprehensive types
- 🎨 **Customizable**: Flexible styling system with CSS class tokens
- 🚀 **Performance**: Optimized loading states and error handling
- 🔧 **Extensible**: Custom render functions and fallback content

## Installation

```bash
npm install @adview/react
```

```bash
yarn add @adview/react
```

## Quick Start

### Basic Usage

```tsx
import { AdViewUnitClient } from '@adview/react';

function App() {
  return (
    <AdViewUnitClient
      unitId="ca-pub-1234567890123456/9876543210"
      format="banner"
      srcURL="https://your-ad-server.com/ads/{<id>}"
    />
  );
}
```

### With Provider (Recommended)

```tsx
import { AdViewProvider, AdViewUnitClient } from '@adview/react';

function App() {
  return (
    <AdViewProvider srcURL="https://your-ad-server.com/ads/{<id>}">
      <AdViewUnitClient unitId="ca-pub-1234567890123456/1122334455" format="banner" />
      <AdViewUnitClient unitId="ca-pub-1234567890123456/5544332211" format="native" />
    </AdViewProvider>
  );
}
```

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [AdViewUnitClient](#adviewunitclient)
  - [AdViewUnitServer](#adviewunitserver)
  - [AdViewProvider](#adviewprovider)
  - [Component Props](#component-props)
  - [Loading States](#loading-states)
- [Usage Examples](#usage-examples)
  - [Client-Side Rendering](#client-side-rendering)
  - [Server-Side Rendering](#server-side-rendering)
  - [Custom Rendering](#custom-rendering)
  - [Fallback Content](#fallback-content)
  - [Style Customization](#style-customization)
- [Ad Formats](#ad-formats)
- [TypeScript Support](#typescript-support)
- [Migration Guide](#migration-guide)

## API Reference

### AdViewUnitClient

Client-side ad component with loading states and error handling.

```tsx
import { AdViewUnitClient } from '@adview/react';

<AdViewUnitClient
  unitId="ca-pub-1234567890123456/9876543210"
  format="banner"
  srcURL="https://ads.example.com/{<id>}"
  onDefault={() => <div>No ads available</div>}
>
  {({ data, state, error, onDefault }) => {
    // Custom render logic
  }}
</AdViewUnitClient>
```

### AdViewUnitServer

Server-side ad component for SSR applications.

```tsx
import { AdViewUnitServer } from '@adview/react/server';

<AdViewUnitServer
  unitId="ca-pub-1234567890123456/9876543210"
  format="banner"
  srcURL="https://ads.example.com/{<id>}"
/>
```

### AdViewProvider

Context provider for global configuration.

```tsx
import { AdViewProvider } from '@adview/react';

<AdViewProvider srcURL="https://ads.example.com/{<id>}">
  {/* Ad components inherit the srcURL */}
</AdViewProvider>
```

### Component Props

#### AdViewUnitClient & AdViewUnitServer

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `unitId` | `string` | ✓ | Unique identifier for the ad unit |
| `format` | `'banner' \| 'native' \| 'proxy'` | ✗ | Ad format type |
| `srcURL` | `string` | ✗* | Ad server URL template with `{<id>}` placeholder |
| `onDefault` | `ReactNode \| (() => ReactNode)` | ✗ | Fallback content when no ads available |
| `children` | `function \| ReactElement` | ✗ | Custom render function or component |

*Required if not provided by AdViewProvider

### Loading States

The `state` object in client components provides detailed loading information:

```typescript
type AdLoadState = {
  isInitial: boolean;  // Component just mounted
  isLoading: boolean;  // Actively fetching ad data
  isError: boolean;    // Error occurred during loading
  isComplete: boolean; // Loading finished (success or error)
};
```

## Usage Examples

### Client-Side Rendering

#### Basic Ad Unit

```tsx
import { AdViewUnitClient } from '@adview/react';

function HomePage() {
  return (
    <AdViewUnitClient
      unitId="ca-pub-1234567890123456/1234567890"
      format="banner"
      srcURL="https://ads.example.com/b/dynamic/{<id>}"
    />
  );
}
```

#### Using Provider for Multiple Units

```tsx
import { AdViewProvider, AdViewUnitClient } from '@adview/react';

function App() {
  return (
    <AdViewProvider srcURL="https://ads.example.com/b/dynamic/{<id>}">
      <header>
        <AdViewUnitClient
          unitId="ca-pub-1234567890123456/7788990011"
          format="banner"
        />
      </header>
      
      <aside>
        <AdViewUnitClient
          unitId="ca-pub-1234567890123456/1100998877"
          format="native"
        />
      </aside>
    </AdViewProvider>
  );
}
```

### Server-Side Rendering

#### Next.js Server Component

```tsx
import { AdViewUnitServer } from '@adview/react/server';

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to our site</h1>
      <AdViewUnitServer
        unitId="ca-pub-1234567890123456/2233445566"
        format="banner"
        srcURL="https://ads.example.com/b/dynamic/{<id>}"
      />
    </div>
  );
}
```

#### With Tailwind CSS Styling

```tsx
import { AdViewUnitServer } from '@adview/react/server';
import { AdViewUnitTypeSwitch } from '@adview/react';

export default function SidebarAd() {
  return (
    <AdViewUnitServer
      unitId="ca-pub-1234567890123456/6677889900"
      format="native"
      srcURL="https://ads.example.com/b/dynamic/{<id>}"
      onDefault={() => (
        <div className="text-center p-4 bg-gray-100 rounded">
          <h4 className="text-gray-600">Advertisement</h4>
          <p className="text-sm text-gray-500">No ads available</p>
        </div>
      )}
    >
      <AdViewUnitTypeSwitch
        classNames={{
          native: {
            container: 'flex flex-col gap-3 bg-white shadow-lg rounded-lg p-4 border',
            label: 'text-blue-600 text-xs font-semibold px-2 py-1 bg-blue-50 rounded-full self-start',
            titleLink: 'block text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors',
            descriptionLink: 'block text-sm text-gray-600 leading-relaxed',
            image: 'w-full h-48 object-cover rounded-md',
          }
        }}
      />
    </AdViewUnitServer>
  );
}
```

### Custom Rendering

#### Advanced Loading States

```tsx
import { AdViewUnitClient } from '@adview/react';

function CustomAdUnit() {
  return (
    <AdViewUnitClient
      unitId="ca-pub-1234567890123456/4455667788"
      format="banner"
      srcURL="https://ads.example.com/b/dynamic/{<id>}"
    >
      {({ data, state, error, onDefault }) => {
        const { isInitial, isLoading, isComplete, isError } = state;

        if (isLoading) {
          return (
            <div className="animate-pulse bg-gray-200 h-32 rounded flex items-center justify-center">
              <span className="text-gray-500">Loading ad...</span>
            </div>
          );
        }

        if (isError) {
          console.error('Ad loading error:', error);
          return (
            <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
              <p className="text-red-600">Failed to load advertisement</p>
            </div>
          );
        }

        if (isComplete && data) {
          return (
            <div className="custom-ad-container">
              <MyCustomAdRenderer data={data} />
            </div>
          );
        }

        return onDefault();
      }}
    </AdViewUnitClient>
  );
}
```

#### Custom Ad Renderer

```tsx
import { AdData } from '@adview/react';

interface CustomAdRendererProps {
  data: AdData;
}

function MyCustomAdRenderer({ data }: CustomAdRendererProps) {
  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg">
      {data.image && (
        <img
          src={data.image}
          alt={data.title || 'Advertisement'}
          className="w-full h-auto"
        />
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {data.title && (
          <h3 className="text-white font-bold text-lg">{data.title}</h3>
        )}
        {data.description && (
          <p className="text-white/90 text-sm mt-1">{data.description}</p>
        )}
      </div>
    </div>
  );
}
```

### Fallback Content

#### Static Fallback

```tsx
<AdViewUnitClient
  unitId="ca-pub-1234567890123456/3344556677"
  format="banner"
  srcURL="https://ads.example.com/b/dynamic/{<id>}"
  onDefault={
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg text-center">
      <h3 className="text-xl font-bold">Your Brand Here</h3>
      <p className="mt-2">Advertise with us today!</p>
    </div>
  }
/>
```

#### Dynamic Fallback

```tsx
<AdViewUnitClient
  unitId="ca-pub-1234567890123456/8899001122"
  format="native"
  srcURL="https://ads.example.com/b/dynamic/{<id>}"
  onDefault={() => {
    const promoItems = ['Special Offer', 'New Product', 'Limited Time'];
    const randomPromo = promoItems[Math.floor(Math.random() * promoItems.length)];
    
    return (
      <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded-lg">
        <h4 className="font-semibold text-gray-700">{randomPromo}</h4>
        <p className="text-sm text-gray-500 mt-2">Check out our latest updates</p>
      </div>
    );
  }}
/>
```

### Style Customization

#### Native Ad Styling Tokens

The library provides comprehensive styling tokens for native ads:

```typescript
type AdViewStyleTokensNative = {
  container?: string;        // Main container wrapper
  imageLink?: string;        // Image link wrapper
  image?: string;           // Image element
  label?: string;           // "Ad" or sponsor label
  titleLink?: string;       // Title link element
  descriptionLink?: string; // Description link element
  brandNameLink?: string;   // Brand name link
  phoneLink?: string;       // Phone number link
  urlLink?: string;         // URL link element
};
```

#### Complete Styling Example

```tsx
import { AdViewUnitClient, AdViewUnitTypeSwitch } from '@adview/react';

function StyledNativeAd() {
  return (
    <AdViewUnitClient
      unitId="ca-pub-1234567890123456/5566778899"
      format="native"
      srcURL="https://ads.example.com/b/dynamic/{<id>}"
    >
      <AdViewUnitTypeSwitch
        classNames={{
          native: {
            container: 'max-w-sm mx-auto bg-white rounded-xl shadow-md overflow-hidden',
            imageLink: 'block',
            image: 'w-full h-48 object-cover',
            label: 'absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded',
            titleLink: 'block p-4 pb-2 text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors',
            descriptionLink: 'block px-4 pb-4 text-gray-600 text-sm leading-relaxed',
            brandNameLink: 'block px-4 pb-2 text-sm font-medium text-gray-800',
          }
        }}
      />
    </AdViewUnitClient>
  );
}
```

## Ad Formats

### Banner Ads

Banner ads are traditional rectangular advertisements displayed in designated areas of your website.

```tsx
<AdViewUnitClient
  unitId="ca-pub-1234567890123456/1357924680"
  format="banner"
  srcURL="https://ads.example.com/b/dynamic/{<id>}"
/>
```

**Common Banner Sizes:**

- Leaderboard: 728x90
- Medium Rectangle: 300x250
- Wide Skyscraper: 160x600
- Mobile Banner: 320x50

### Native Ads

Native ads blend seamlessly with your content, providing a non-intrusive advertising experience.

```tsx
<AdViewUnitClient
  unitId="ca-pub-1234567890123456/2468013579"
  format="native"
  srcURL="https://ads.example.com/b/dynamic/{<id>}"
>
  <AdViewUnitTypeSwitch
    classNames={{
      native: {
        container: 'border rounded-lg p-4 bg-gray-50',
        titleLink: 'font-semibold text-lg',
        descriptionLink: 'text-gray-600 mt-2',
      }
    }}
  />
</AdViewUnitClient>
```

**Native Ad Components:**

- Title
- Description
- Image
- Brand name
- Call-to-action
- Sponsor label

### Proxy Ads

Proxy ads are served through an intermediary service for additional control and targeting.

```tsx
<AdViewUnitClient
  unitId="ca-pub-1234567890123456/9753102468"
  format="proxy"
  srcURL="https://proxy.ads.example.com/serve/{<id>}"
/>
```

## TypeScript Support

The library is built with TypeScript and provides comprehensive type definitions for all components and data structures.

### Type Definitions

```typescript
import type {
  AdData,
  AdViewUnitProps,
  AdViewStyleTokens,
  AdLoadState,
  AdFormat,
} from '@adview/react';

// Ad data structure
interface AdData {
  id: string;
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  brandName?: string;
  phone?: string;
  // ... other properties
}

// Component props
interface AdViewUnitProps {
  unitId: string;
  format?: AdFormat;
  srcURL?: string;
  onDefault?: React.ReactNode | (() => React.ReactNode);
  children?: React.ReactNode | AdRenderFunction;
}

// Render function signature
type AdRenderFunction = (params: {
  data: AdData | null;
  state: AdLoadState;
  error: Error | null;
  onDefault: () => React.ReactNode;
}) => React.ReactNode;
```

### Custom Hook Types

```typescript
import { useAdData } from '@adview/react';

function MyComponent() {
  const { data, state, error } = useAdData({
    unitId: 'ca-pub-1234567890123456/8642097531',
    srcURL: 'https://ads.example.com/{<id>}'
  });

  // TypeScript infers correct types
  if (data?.title) {
    // data.title is safely typed as string
  }
}
```

## Migration Guide

### From Version 1.x to 2.x

#### Breaking Changes

1. **Component Names**: Updated to be more descriptive

   ```tsx
   // Old
   import { AdUnit } from '@adview/react';
   
   // New
   import { AdViewUnitClient } from '@adview/react';
   ```

2. **Props Restructuring**: Some props have been renamed

   ```tsx
   // Old
   <AdUnit id="ca-pub-1234567890123456/9876543210" type="banner" source="..." />
   
   // New
   <AdViewUnitClient unitId="ca-pub-1234567890123456/9876543210" format="banner" srcURL="..." />
   ```

3. **Server Components**: New separate import

   ```tsx
   // Old
   import { AdUnit } from '@adview/react';
   
   // New
   import { AdViewUnitServer } from '@adview/react/server';
   ```

#### Migration Steps

1. Update component imports
2. Rename props (`id` → `unitId`, `type` → `format`, `source` → `srcURL`)
3. Update server-side usage to use dedicated server components
4. Review and update custom styling tokens if used

### Performance Considerations

- Use `AdViewProvider` for multiple ad units to share configuration
- Implement proper fallback content to prevent layout shifts
- Consider lazy loading for below-the-fold advertisements
- Use server-side rendering for better initial page load performance

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) for details.
