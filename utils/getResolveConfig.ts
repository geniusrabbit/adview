import { AdViewConfig } from '../typings';

/**
 * Resolves and merges configuration options with environment defaults.
 * Prioritizes passed config over environment variables.
 * 
 * @param config - User-provided configuration object
 * @returns Merged configuration with environment defaults applied
 */
function getResolveConfig(config: AdViewConfig): AdViewConfig {
  // Get default source URL from environment variable
  const srcURL = process.env.ADSERVER_AD_JSONP_REQUEST_URL; // Default source URL for JSONP requests

  return {
    srcURL,
    ...config, // User config overrides environment defaults
  };
}

export default getResolveConfig;
