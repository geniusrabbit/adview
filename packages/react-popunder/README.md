# @adview/react-popunder

React wrapper component for the AdView PopUnder script. This package provides a convenient way to integrate popunder advertisements into React applications.

## Installation

```bash
npm install @adview/react-popunder
# or
yarn add @adview/react-popunder
```

## Features

- React Component: Easy integration with React applications
- TypeScript Support: Full type safety with TypeScript definitions
- Custom Hook: Programmatic control with `usePopunder` hook
- Automatic Cleanup: Proper script cleanup on component unmount
- Performance: Prevents duplicate script loading
- Error Handling: Built-in error handling and loading states

## Usage

### Basic Component Usage

```tsx
import React from 'react';
import Popunder from '@adview/react-popunder';

function App() {
  return (
    <div>
      <h1>My Website</h1>
      <a href="https://example.com">Click me</a>

      <Popunder
        unitid="123456"
        every="1h"
        target="h1"
        template="https://localhost:6666/{unitid}/path"
      />
    </div>
  );
}
```

### Hook Usage

```tsx
import React from 'react';
import Popunder, { usePopunder } from '@adview/react-popunder';

function HookExample() {
  const popunder = usePopunder({
    unitid: '123456',
    every: '1h',
    target: 'h1',
    template: 'https://localhost:6666/{unitid}/path',
    everyDirect: 3,
  });

  // Hook returns PopUnder instance when ready (client-side only)
  if (popunder) {
    console.log('PopUnder instance is ready');
  }

  return <div>My Component</div>;
}
```

### Advanced Component Usage

```tsx
import React from 'react';
import Popunder from '@adview/react-popunder';

function AdvancedApp() {
  return (
    <div>
      <Popunder
        unitid="gaming_banner_001"
        template="https://ads.example.com/{unitid}/click"
        target="a, .btn, .clickable"
        every="2h30m"
        everyDirect={5}
        ignoreFilter={['.no-popup', '#header']}
        categories="gaming,entertainment"
        cookieName="gaming_popunder"
        cookieDomain=".gaming-site.com"
        mode="production"
        params={['source_react', 'campaign_123', 'affiliate_code']}
      />
    </div>
  );
}
```

### Conditional Loading

```tsx
import React, { useState } from 'react';
import Popunder from '@adview/react-popunder';

function ConditionalApp() {
  const [enableAds, setEnableAds] = useState(true);
  const [userConsent, setUserConsent] = useState(false);

  return (
    <div>
      <button onClick={() => setUserConsent(!userConsent)}>
        {userConsent ? 'Revoke' : 'Give'} Consent
      </button>

      <button onClick={() => setEnableAds(!enableAds)}>
        {enableAds ? 'Disable' : 'Enable'} Ads
      </button>

      {enableAds && userConsent && (
        <Popunder
          unitid="conditional_001"
          template="https://ads.example.com/{unitid}"
          target="a"
        />
      )}
    </div>
  );
}
```

## API Reference

### Popunder Component Props

All props from `PopunderProps` interface can be passed directly to the component:

| Prop | Type | Description |
|------|------|-------------|
| `unitid` | `string` | Ad unit identifier |
| `template` | `string` | URL template for the popunder |
| `target` | `string` | CSS selectors for clickable elements |
| `every` | `string` | Time between popunders (e.g., "1h30m", "2h") |
| `everyDirect` | `number` | Show popunder after N direct clicks |
| `ignoreFilter` | `string[]` | Array of CSS selectors to ignore |
| `categories` | `string` | Custom categories |
| `cookieName` | `string` | Custom cookie name |
| `cookieDomain` | `string` | Cookie domain |
| `mode` | `string` | Operating mode |
| `params` | `string[]` | Array of custom parameters |

### PopunderProps Interface

```typescript
interface PopunderProps {
  [key: string]: any;
  cookieName?: string;
  cookieDomain?: string;
  every?: string;
  everyDirect?: number;
  ignoreFilter?: string[];
  target?: string;
  categories?: string;
  template?: string;
  unitid?: string;
  mode?: string;
  params?: string[];
}
```

### usePopunder Hook

```typescript
function usePopunder(config: PopunderProps): PopUnder | null
```

The hook accepts a configuration object and returns:
- `PopUnder` instance when ready (client-side)
- `null` during SSR or before initialization

#### Hook Features

- SSR-safe: Returns `null` on server-side
- Automatic initialization when `window` is available
- Memoized instance creation
- Works with Next.js and other SSR frameworks

## TypeScript Support

This package includes full TypeScript definitions. Import types as needed:

```typescript
import Popunder, { PopunderProps } from '@adview/react-popunder';
```

## Examples

### Basic Implementation

```tsx
import Popunder from '@adview/react-popunder';

<Popunder
  unitid="123456"
  every="1h"
  target="h1"
  template="https://localhost:6666/{unitid}/path"
/>
```

### Hook Implementation

```tsx
import { usePopunder } from '@adview/react-popunder';

const popunder = usePopunder({
  unitid: '123456',
  every: '1h',
  target: 'h1',
  template: 'https://localhost:6666/{unitid}/path',
  everyDirect: 3,
});
```

### With Multiple Parameters

```tsx
<Popunder
  unitid="advanced_001"
  template="https://ads.example.com/{unitid}/redirect"
  target="a, button"
  every="2h"
  everyDirect={3}
  categories="sports,news"
  params={['ref_source', 'campaign_id', 'user_segment']}
/>
```

## Best Practices

1. **Single Instance**: Only use one Popunder component per page
2. **Conditional Rendering**: Use conditional rendering for user consent
3. **SSR Compatibility**: Use the hook for SSR frameworks like Next.js
4. **Performance**: Component automatically prevents duplicate script loading
5. **Cleanup**: Component handles cleanup automatically on unmount

## Troubleshooting

### Script Not Loading
- Check browser console for errors
- Verify the template URL is accessible
- Ensure required props (unitid, template) are provided

### Popunder Not Showing
- Check browser popup blocker settings
- Verify target elements exist on the page
- Check frequency settings (every, everyDirect)

### Next.js SSR Issues
- Use the `usePopunder` hook for SSR compatibility
- Hook automatically handles window availability

### TypeScript Errors
- Ensure you have @types/react installed
- Check that props match PopunderProps interface

## License

MIT
