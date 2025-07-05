import { AdViewConfig } from '../typings';

// Type declaration for process object when available
declare const process: any;

/**
 * Resolves and merges configuration options with environment defaults.
 * Prioritizes passed config over environment variables.
 * 
 * @param config - User-provided configuration object
 * @returns Merged configuration with environment defaults applied
 */
function getResolveConfig(config: AdViewConfig): AdViewConfig {
  // Get default source URL from environment variable (Node.js only)
  const srcURL = typeof process !== 'undefined' ? process.env?.ADSERVER_AD_JSONP_REQUEST_URL : undefined;

  return {
    srcURL,
    ...config, // User config overrides environment defaults
  };
}

export default getResolveConfig;
