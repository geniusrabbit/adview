import { AdViewConfig } from '@adview/react/src/types';

function getResolveConfig(config: AdViewConfig): AdViewConfig {
  const srcURL = process.env.ADSERVER_AD_JSONP_REQUEST_URL; // Default source URL for JSONP requests

  return {
    srcURL,
    ...config,
  };
}

export default getResolveConfig;
