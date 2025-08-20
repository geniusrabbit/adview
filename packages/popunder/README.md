# AD PopUnder

PopUnder.js is a lightweight JavaScript library for creating popunder advertisements. It opens a new window/tab behind the current window when users click on specified elements, providing a non-intrusive advertising experience.

## Features

- Cross-browser compatibility (Chrome, Firefox, Safari, Edge, Opera)
- Mobile device support (iOS, Android, Windows Phone)
- AdBlock detection
- Cookie-based frequency control
- Click-based frequency control
- Flexible targeting with CSS selectors
- Ignore filters to exclude specific elements
- Customizable redirect URLs with template support
- Built-in analytics parameters

## Installation

Include the PopUnder script in your HTML page:

```html
<script
  type="text/javascript"
  src="./dist/popunder.js"
  data-ad-template="https://example.com/{unitid}/redirect"
  data-ad-unitid="your_unit_id"
  data-ad-target="a"
  data-ad-every="1h30m"
  data-ad-every-direct="3"
  async
  defer
></script>
```

## Configuration Attributes

Configure the PopUnder script using `data-ad-*` attributes on the script tag:

### Required Attributes

| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `data-ad-template` | string | URL template for redirect | `https://ads.example.com/{unitid}/click` |
| `data-ad-unitid` | string | Unique identifier for the ad unit | `spot_123` |

### Optional Attributes

| Attribute | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `data-ad-target` | string | - | CSS selectors for clickable elements (comma-separated) | `a, .clickable, #button` |
| `data-ad-every` | string | `6h` | Cookie expiration time | `1h30m`, `2h`, `45m` |
| `data-ad-every-direct` | number | `1` | Show popunder after N clicks on target | `3` |
| `data-ad-ignore-filter` | string | - | CSS selectors to ignore (comma-separated) | `.no-popup, #skip` |
| `data-ad-categories` | string | - | Custom categories for targeting | `gaming,tech,news` |
| `data-ad-cookie-name` | string | `ad_popunder` | Custom cookie name | `my_popup_cookie` |
| `data-ad-cookie-domain` | string | - | Cookie domain | `.example.com` |
| `data-ad-mode` | string | - | Operating mode | `selective` |
| `data-ad-param1` | string | - | Custom parameter 1 | `custom_value_1` |
| `data-ad-param2` | string | - | Custom parameter 2 | `custom_value_2` |
| `data-ad-param3` | string | - | Custom parameter 3 | `custom_value_3` |

## Time Format

The `data-ad-every` attribute supports flexible time formats:

- `1h` - 1 hour
- `30m` - 30 minutes
- `1h30m` - 1 hour and 30 minutes
- `2h15m` - 2 hours and 15 minutes

## Usage Examples

### Basic Setup

```html
<script
  src="./dist/popunder.js"
  data-ad-template="https://ads.example.com/{unitid}"
  data-ad-unitid="spot_001"
  data-ad-target="a"
  async
></script>
```

### Advanced Configuration

```html
<script
  src="./dist/popunder.js"
  data-ad-template="https://ads.example.com/{unitid}/click"
  data-ad-unitid="gaming_banner_001"
  data-ad-target="a, .btn, .link"
  data-ad-every="2h30m"
  data-ad-every-direct="5"
  data-ad-ignore-filter=".no-popup, #header, .footer"
  data-ad-categories="gaming,entertainment"
  data-ad-cookie-name="gaming_popunder"
  data-ad-cookie-domain=".gaming-site.com"
  data-ad-param1="source_website"
  data-ad-param2="campaign_id_123"
  data-ad-param3="affiliate_code"
  async
  defer
></script>
```

### Selective Mode

```html
<script
  src="./dist/popunder.js"
  data-ad-template="https://ads.example.com/{unitid}"
  data-ad-unitid="selective_001"
  data-ad-mode="selective"
  data-ad-target="a[href*='external']"
  async
></script>
```

## HTML Test Example

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PopUnder Test</title>
</head>
<body>
    <h1>PopUnder Test Page</h1>

    <!-- These links will trigger popunder -->
    <a href="https://www.google.com/">Click me - External link</a>
    <a href="/internal-page.html">Internal link</a>

    <!-- This link will be ignored -->
    <a href="https://www.example.com/" class="no-popup">Ignored link</a>

    <!-- Button that triggers popunder -->
    <button class="clickable">Clickable button</button>

    <script
      src="./dist/popunder.js"
      data-ad-template="https://localhost:2222/{unitid}/path"
      data-ad-unitid="test_unit_001"
      data-ad-target="a, .clickable"
      data-ad-every="1h"
      data-ad-every-direct="2"
      data-ad-ignore-filter=".no-popup"
      data-ad-categories="test,demo"
      async
      defer
    ></script>
</body>
</html>
```

## How It Works

1. **Initialization**: Script loads and reads configuration from `data-ad-*` attributes
2. **Event Binding**: Attaches click listeners to the document
3. **Click Detection**: Intercepts clicks on target elements
4. **Filtering**: Checks ignore filters and frequency controls
5. **PopUnder Creation**: Opens new window/tab with redirect URL
6. **Frequency Control**: Sets cookies and localStorage to control showing frequency

## Frequency Control

### Time-based Control (`data-ad-every`)
- Controls how often popunder appears based on time
- Uses cookies to track last show time
- Format: `1h30m` (1 hour 30 minutes)

### Click-based Control (`data-ad-every-direct`)
- Controls popunder appearance based on click count
- Uses localStorage to track click count
- Example: `3` means show on every 3rd click

## URL Parameters

The script automatically includes various parameters in the redirect URL:

- `domain` - Current domain
- `rnd` - Random number
- `x`, `y` - Click coordinates
- `w`, `h` - Screen dimensions (with device pixel ratio applied)
- `tz` - Timezone offset
- `adb` - AdBlock detection status
- `categories` - Page categories
- `param1`, `param2`, `param3` - Custom configurable parameters

### Screen Size Parameters

The `w` and `h` parameters are calculated using:
- Screen width/height from `window.screen`
- Multiplied by `devicePixelRatio` for high-DPI displays
- Converted to integers

Example URL parameters:
```
https://ads.example.com/spot_123?domain=example.com&rnd=0.123456&x=150&y=300&w=1920&h=1080&tz=180&adb=0&categories=gaming,tech&param1=custom_value_1&param2=custom_value_2&param3=custom_value_3
```

### Custom Parameters

Use `data-ad-param1`, `data-ad-param2`, and `data-ad-param3` to pass custom values:

```html
<script
  src="./dist/popunder.js"
  data-ad-template="https://ads.example.com/{unitid}"
  data-ad-unitid="spot_001"
  data-ad-param1="affiliate_123"
  data-ad-param2="campaign_winter_2024"
  data-ad-param3="source_blog"
></script>
```

This will add `&param1=affiliate_123&param2=campaign_winter_2024&param3=source_blog` to the redirect URL.

## Development

### Build Commands

```bash
# Development mode
npm run popunder:dev

# Build for production
npm run popunder:build

# Clean build files
npm run popunder:clean
```

### Testing

Open `test.html` in your browser to test the PopUnder functionality:

```bash
# Serve locally
npx http-server . -p 8080
# Open http://localhost:8080/test.html
```

## API Reference

### Global Variables

- `detectAdBlock` - Boolean indicating AdBlock detection status
- `window.dataPopUnder` - Configuration object (alternative to data attributes)

### Configuration via JavaScript

```javascript
window.dataPopUnder = {
    'template': 'https://ads.example.com/{unitid}',
    'unitid': 'js_configured_unit',
    'target': 'a',
    'every': '1h',
    'every-direct': 3,
    'categories': 'javascript,config'
};
```

## Troubleshooting

### PopUnder Not Showing
1. Check browser popup blocker settings
2. Verify `data-ad-template` and `data-ad-unitid` are set
3. Check console for JavaScript errors
4. Ensure target elements exist on page

### Frequency Issues
1. Clear cookies and localStorage
2. Check `data-ad-every` and `data-ad-every-direct` values
3. Verify time format is correct (e.g., `1h30m`)
