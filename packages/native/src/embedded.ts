// Usage Example:

/*
import { EmbeddedAd } from './path-to-embedded-ad';

// Create a new EmbeddedAd instance with custom settings
const ad = new EmbeddedAd({
  element: 'ad-container', // ID of the DOM element where the ad will be rendered
  spot_id: '12345',        // Your ad spot ID
  JSONPLink: 'https://ads.example.com/getAd', // Your JSONP endpoint
});

// Register event callbacks
ad.on('loading', (embeder, data) => {
  console.log('Ad is loading:', data);
}).on('render', (embeder, data, success) => {
  if (success) {
    console.log('Ad rendered successfully.');
  } else {
    console.log('Ad rendering failed.');
  }
}).on('error', (embeder, error) => {
  console.error('An error occurred while rendering the ad:', error);
});

// Initiate the ad rendering process
ad.render();
*/

////////////////////////////////////////////////////////////////////////////////
// EmbeddedAd Class Implementation with Detailed Comments
////////////////////////////////////////////////////////////////////////////////

// Export all exports from the polyfills library
import { getPrepareURL } from '@adview/core/utils';
import type {
  EmbeddedAdSettings,
  AdCallbacks,
  AdResponse,
  AdItem,
  AdAsset,
} from './types';

export * from './libs/polyfills';

// Import the Render class from the render module
import { Render } from './render';

// Define the default configuration for the EmbeddedAd
const defaultConfig: EmbeddedAdSettings = {
  // URL for JSONP requests, fetched from environment variables
  JSONPLink: process.env.ADSERVER_AD_JSONP_REQUEST_URL,

  // DOM element where the ad will be rendered; initially null
  element: null,

  // Spot ID for ad targeting; initially null
  spot_id: null,

  // Instance of the Render class responsible for rendering ads
  render: new Render(),
};

// Export the EmbeddedAd class for use in other modules
export class EmbeddedAd {
  private settings: EmbeddedAdSettings;
  private callbacks: AdCallbacks;
  private JSONPCallbackName!: string;
  private JSONPScript!: HTMLScriptElement;

  /**
   * Constructor for the EmbeddedAd class
   * @param settings - Configuration settings for the ad
   */
  constructor(settings: EmbeddedAdSettings) {
    // Merge user-provided settings with the default configuration
    this.settings = { ...defaultConfig, ...settings };

    // Ensure the JSONPLink has appropriate query parameter separators
    if (this.settings.JSONPLink && this.settings.JSONPLink.indexOf('?') < 0) {
      // If no query parameters exist, add '?'
      this.settings.JSONPLink += '?';
    } else if (
      this.settings.JSONPLink &&
      !this.settings.JSONPLink.endsWith('&')
    ) {
      // If there are existing query parameters but no trailing '&', add '&'
      this.settings.JSONPLink += '&';
    }

    // Ensure a render instance is present
    if (!this.settings.render) {
      this.settings.render = defaultConfig.render;
    }

    // Initialize callback functions for different events
    this.callbacks = {
      onLoading: null,
      onLoaded: null,
      onRender: null,
      onError: null,
    };
  }

  /**
   * Register callback functions for specific events
   * @param event - The event name ('loading', 'render', 'error')
   * @param callback - The callback function to execute
   * @returns Returns the instance for chaining
   */
  on(event: string, callback: Function | null): EmbeddedAd {
    if (event === 'loading') {
      this.callbacks.onLoading = callback as
        | ((embeddedAd: EmbeddedAd) => void)
        | null;
    }
    if (event === 'loaded') {
      this.callbacks.onLoaded = callback as
        | ((embeddedAd: EmbeddedAd, data: any) => void)
        | null;
    }
    if (event === 'render') {
      this.callbacks.onRender = callback as
        | ((embeddedAd: EmbeddedAd, data: any, success: boolean) => void)
        | null;
    }
    if (event === 'error') {
      this.callbacks.onError = callback as
        | ((embeddedAd: EmbeddedAd, error: any) => void)
        | null;
    }
    return this;
  }

  /**
   * Initiates the rendering process of the ad
   */
  render(): void {
    // If the element is specified by ID (string), retrieve the DOM element
    if (typeof this.settings.element === 'string') {
      this.settings.element = document.getElementById(this.settings.element);
    }
    // Start loading the ad content
    this._load();
  }

  /**
   * Handles the response from the JSONP request and renders the ad
   * @param response - The JSONP response data
   */
  private _renderResponse(response: AdResponse): void {
    let noAd = true;
    if (response.groups && response.groups.length > 0) {
      // Iterate through each ad group in the response
      for (const i in response.groups) {
        const group = response.groups[i];
        // Iterate through each item in the group and render it
        for (const j in group.items) {
          noAd = false;
          this._renderItem(group.items[j]);
        }
      }
    }
    if (noAd) {
      // If no groups, use a default template to render the ad
      this.settings.render?.default(this.settings.element);
    }
  }

  /**
   * Renders an individual ad item based on its type
   * @param it - The ad item to render
   */
  private _renderItem(it: AdItem): void {
    // Ensure the format property exists
    if (!it.format) {
      it.format = {};
    }

    // Render the ad based on its type
    if (it.type === 'proxy') {
      this.settings.render?.proxy(it, this.settings.element);
    } else if (it.type === 'native') {
      this.settings.render?.native(it, this.settings.element);
    } else if (it.type === 'banner') {
      this.settings.render?.banner(it, this.settings.element);
    } else {
      // Throw an error if the ad type is invalid
      throw new Error(
        'invalid advertisement type ' + it.type + ' ' + (it.type == 'proxy'),
      );
    }

    // Track ad impressions or views
    this._tracking(it);
  }

  /**
   * Handles tracking for ad impressions and views
   * @param it - The ad item containing tracking URLs
   */
  private _tracking(it: AdItem): void {
    if (!it || !it.tracker) {
      // Exit if there are no tracking URLs
      return;
    }

    // Array of tracking URL arrays for impressions and views
    const arrs = [it.tracker.impressions, it.tracker.views];

    // Iterate through each tracking array
    for (const i in arrs) {
      const arr = arrs[i];
      if (!arr) continue; // Skip if the array is undefined

      // Create an image request for each tracking URL
      for (const j in arr) {
        try {
          const img = new Image();
          // Set the image source to trigger the tracking request
          img.src = getPrepareURL(arr[j]);

          // The following lines are commented out but can be used to hide the tracking image
          // img.onload = function() { document.body.removeChild(this) };
          // img.style.position = 'absolute';
          // img.style.width = '1px';
          // img.style.height = '1px';
          // img.style.top = '-100px';
          // img.style.left = '-100px';
          // document.body.appendChild(img);
        } catch (err) {
          // Log any errors during tracking image creation
          console.debug('tracking-image', err);
        }
      }
    }
  }

  /**
   * Loads the ad content via a JSONP request
   */
  private _load(): void {
    if (typeof this.settings.onLoading === 'function') {
      // Trigger the onLoading callback if defined
      this.settings.onLoading(this);
    }

    // Render a preloader in the target element
    this.settings.render?.preload(this.settings.element);

    // Generate a unique callback name for the JSONP request
    this.JSONPCallbackName = '_cbf_' + this._randomString(7);

    // Assign the JSONP callback function to the global window object
    (window as any)[this.JSONPCallbackName] = this._JSONPCallback.bind(this);

    // Create a script element for the JSONP request
    const sc = (this.JSONPScript = document.createElement('script'));
    sc.src =
      (this.settings.JSONPLink || '').replace(
        '{<id>}',
        (this.settings.spot_id || '') + '',
      ) + // Replace placeholder with spot ID
      this._collectionParams(); // Append query parameters

    // Append the script to the document body to initiate the request
    document.body.appendChild(sc);
  }

  /**
   * Asserts if an asset with a given name exists in the assets array
   * @param name - The name of the asset to find
   * @param assets - Array of asset objects
   * @returns Returns the asset object if found, else null
   */
  private _assertByName(name: string, assets: AdAsset[]): AdAsset | null {
    for (const i in assets) {
      const assert = assets[i];
      if (assert.name == name) {
        return assert;
      }
    }
    return null;
  }

  /**
   * Collects and formats query parameters for the JSONP request
   * @returns A string of concatenated query parameters
   */
  private _collectionParams(): string {
    const params: string[] = [];

    // Get the current window size
    const ws = this.winSize();

    // Add callback function name to parameters
    params.push('callback=' + this.JSONPCallbackName);

    // Add current UTC date as a timestamp
    params.push('t=' + new Date().getUTCDate());

    // Add window width and height
    params.push('w=' + ws[0]);
    params.push('h=' + ws[1]);

    // Join all parameters with '&'
    return params.join('&');
  }

  /**
   * Callback function executed when the JSONP response is received
   * @param data - The JSONP response data
   */
  private _JSONPCallback(data: AdResponse): void {
    try {
      // Trigger the onLoading callback if defined
      if (typeof this.callbacks.onLoaded === 'function') {
        this.callbacks.onLoaded(this, data);
      }

      // Render the ad based on the response data
      this._renderResponse(data);

      // Trigger the onRender callback if defined
      if (typeof this.callbacks.onRender === 'function') {
        this.callbacks.onRender(this, data, !!data);
      }

      // Remove the JSONP script tag from the DOM
      if (this.JSONPScript.parentNode) {
        this.JSONPScript.parentNode.removeChild(this.JSONPScript);
      }

      // Clean up the global callback function
      (window as any)[this.JSONPCallbackName] = undefined;
    } catch (err) {
      // Log any errors during the callback execution
      console.debug('jsonp-callback', err);

      // Trigger the onError callback if defined
      if (typeof this.callbacks.onError === 'function') {
        this.callbacks.onError(this, err);
      } else {
        // If no onError callback, rethrow the error
        throw err;
      }
    }
  }

  /**
   * Generates a random string of specified length
   * @param num - The length of the random string
   * @returns The generated random string
   */
  private _randomString(num: number): string {
    let text = '';
    const abc =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
    const length = num || 5; // Default length is 5 if not specified

    // Generate a random character from the abc string for each position
    for (let i = 0; i < length; i++) {
      text += abc.charAt(Math.floor(Math.random() * abc.length));
    }

    return text;
  }

  /**
   * Retrieves the current window size (width and height)
   * @returns An array containing the window width and height
   */
  winSize(): [number, number] {
    const w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      // Calculate the width using the available properties
      x = w.innerWidth || e.clientWidth || g.clientWidth,
      // Calculate the height using the available properties
      y = w.innerHeight || e.clientHeight || g.clientHeight;

    return [x, y];
  }
}
