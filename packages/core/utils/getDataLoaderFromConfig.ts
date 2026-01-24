import { AdViewConfig, AdViewDataLoader } from 'typings';
import DynamicFetcherDataLoader from './dynamicFetcherDataLoader';

function getDataLoaderFromConfig(config: AdViewConfig): AdViewDataLoader {
  if (!!config.sourceLoader) {
    return config.sourceLoader;
  }
  return new DynamicFetcherDataLoader(
    config.srcURL || '',
    config.defaultAdData,
  );
}

export default getDataLoaderFromConfig;
