# @adview/react-popunder

React wrapper component for the AdView PopUnder script. This package provides a convenient way to integrate popunder advertisements into React applications.

## Installation

```bash
npm install @adview/react-popunder
# or
yarn add @adview/react-popunder
```

## Features

- 🔧 **React Component**: Easy integration with React applications
- 🎯 **TypeScript Support**: Full type safety with TypeScript definitions
- 🪝 **Custom Hook**: Programmatic control with `usePopUnder` hook
- 🔄 **Automatic Cleanup**: Proper script cleanup on component unmount
- ⚡ **Performance**: Prevents duplicate script loading
- 🛡️ **Error Handling**: Built-in error handling and loading states

## Usage

### Basic Component Usage

```tsx
import React from 'react';
import { PopUnder } from '@adview/react-popunder';

function App() {
  const config = {
    template: 'https://ads.example.com/{unitid}/redirect',
    unitid: 'spot_001',
    target: 'a',
    every: '1h30m',
    everyDirect: 3
  };

  return (
    <div>
      <h1>My Website</h1>
      <a href="https://example.com">Click me</a>

      <PopUnder
        config={config}
        onLoad={() => console.log('PopUnder loaded')}
        onError={(error) => console.error('PopUnder error:', error)}
      />
    </div>
  );
}
```

### Advanced Component Usage

```tsx
import React from 'react';
import { PopUnder, PopUnderConfig } from '@adview/react-popunder';

function AdvancedApp() {
  const config: PopUnderConfig = {
    template: 'https://ads.example.com/{unitid}/click',
    unitid: 'gaming_banner_001',
    target: 'a, .btn, .clickable',
    every: '2h30m',
    everyDirect: 5,
    ignoreFilter: '.no-popup, #header',
    categories: 'gaming,entertainment',
    cookieName: 'gaming_popunder',
    cookieDomain: '.gaming-site.com',
    param1: 'source_react',
    param2: 'campaign_123',
    param3: 'affiliate_code'
  };

  return (
    <div>
      <PopUnder
        config={config}
        async={true}
        defer={true}
        onLoad={() => console.log('PopUnder script loaded successfully')}
        onError={(error) => console.error('Failed to load PopUnder:', error)}
      />
    </div>
  );
}
```

### Using the Hook

```tsx
import React, { useEffect } from 'react';
import { usePopUnder } from '@adview/react-popunder';

function HookExample() {
  const { isLoaded, isLoading, error, loadScript, unloadScript } = usePopUnder();

  useEffect(() => {
    const config = {
      template: 'https://ads.example.com/{unitid}',
      unitid: 'hook_example_001',
      target: 'a'
    };

    loadScript(config);

    return () => {
      unloadScript();
    };
  }, [loadScript, unloadScript]);

  if (isLoading) return <div>Loading PopUnder...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (isLoaded) return <div>PopUnder loaded successfully!</div>;

  return <div>PopUnder not loaded</div>;
}
```

### Conditional Loading

```tsx
import React, { useState } from 'react';
import { PopUnder } from '@adview/react-popunder';

function ConditionalApp() {
  const [enableAds, setEnableAds] = useState(true);
  const [userConsent, setUserConsent] = useState(false);

  const config = {
    template: 'https://ads.example.com/{unitid}',
    unitid: 'conditional_001',
    target: 'a'
  };

  return (
    <div>
      <button onClick={() => setUserConsent(!userConsent)}>
        {userConsent ? 'Revoke' : 'Give'} Consent
      </button>

      <button onClick={() => setEnableAds(!enableAds)}>
        {enableAds ? 'Disable' : 'Enable'} Ads
      </button>

      {enableAds && userConsent && (
        <PopUnder config={config} />
      )}
    </div>
  );
}
```

## API Reference

### PopUnder Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `config` | `PopUnderConfig` | - | **Required.** PopUnder configuration object |
| `src` | `string` | auto-detected | Custom script source URL |
| `async` | `boolean` | `true` | Load script asynchronously |
| `defer` | `boolean` | `true` | Defer script execution |
| `onLoad` | `() => void` | - | Callback when script loads successfully |
| `onError` | `(error: Error) => void` | - | Callback when script fails to load |

### PopUnderConfig Interface

```typescript
interface PopUnderConfig {
  template: string;           // Required: URL template
  unitid: string;            // Required: Ad unit ID
  target?: string;           // CSS selectors for clickable elements
  every?: string;            // Time between popunders (e.g., "1h30m")
  everyDirect?: number;      // Show after N clicks
  ignoreFilter?: string;     // CSS selectors to ignore
  categories?: string;       // Custom categories
  cookieName?: string;       // Custom cookie name
  cookieDomain?: string;     // Cookie domain
  mode?: string;             // Operating mode
  param1?: string;           // Custom parameter 1
  param2?: string;           // Custom parameter 2
  param3?: string;           // Custom parameter 3
}
```

### usePopUnder Hook

```typescript
const {
  isLoaded,      // boolean: Whether script is loaded
  isLoading,     // boolean: Whether script is currently loading
  error,         // Error | null: Any loading error
  loadScript,    // (config: PopUnderConfig) => void: Load script
  unloadScript   // () => void: Unload script
} = usePopUnder(options);
```

#### Hook Options

```typescript
interface UsePopUnderOptions {
  autoLoad?: boolean;  // Auto-load on mount (default: false)
  src?: string;        // Custom script source URL
}
```

## TypeScript Support

This package includes full TypeScript definitions. Import types as needed:

```typescript
import { PopUnderConfig, PopUnderProps } from '@adview/react-popunder';
```

## Error Handling

```tsx
import React from 'react';
import { PopUnder } from '@adview/react-popunder';

function ErrorHandlingExample() {
  const handleError = (error: Error) => {
    // Log to your error tracking service
    console.error('PopUnder failed to load:', error);

    // Optionally show user-friendly message
    // or fallback behavior
  };

  const config = {
    template: 'https://ads.example.com/{unitid}',
    unitid: 'error_example_001'
  };

  return (
    <PopUnder
      config={config}
      onError={handleError}
    />
  );
}
```

## Best Practices

1. **Single Instance**: Only use one PopUnder component per page
2. **Conditional Rendering**: Use conditional rendering for user consent
3. **Error Handling**: Always provide onError callback for production apps
4. **Performance**: Component automatically prevents duplicate script loading
5. **Cleanup**: Component handles cleanup automatically on unmount

## Troubleshooting

### Script Not Loading
- Check browser console for errors
- Verify the script source URL is accessible
- Ensure required config properties are provided

### PopUnder Not Showing
- Check browser popup blocker settings
- Verify target elements exist on the page
- Check frequency settings (every, everyDirect)

### TypeScript Errors
- Ensure you have @types/react installed
- Check that config object matches PopUnderConfig interface

## License

MIT

