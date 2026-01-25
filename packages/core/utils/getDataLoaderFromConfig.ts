import {
  AdViewConfig,
  AdViewDataLoader,
  AdViewDataLoaderAbstractType,
  AdViewGroupItem,
} from 'typings';
import DynamicFetcherDataLoader from './dynamicFetcherDataLoader';
import HardDataLoader from './hardDataLoader';
import SmartDataLoader from './smartDataLoader';

/**
 * Retrieves or creates an AdViewDataLoader based on the provided configuration.
 * Supports custom loaders, smart loaders, and default fetcher loaders.
 */
function getDataLoaderFromConfig(config: AdViewConfig): AdViewDataLoader {
  if (!!config.source) {
    return config.source;
  }
  if (!config.sourceLoader) {
    config.source = new DynamicFetcherDataLoader(
      config.srcURL || '',
      config.defaultAdData,
    );
  } else if (Array.isArray(config.sourceLoader)) {
    if (config.sourceLoader.length === 0) {
      config.source = new HardDataLoader([]);
    } else if (
      typeof config.sourceLoader[0] === 'object' &&
      'loader' in config.sourceLoader[0]
    ) {
      // LoaderItemIface
      config.source = new HardDataLoader(
        config.sourceLoader as AdViewGroupItem[],
      );
    } else {
      if (config.sourceLoader.length === 1) {
        config.source = createLoaderFromType(
          config.sourceLoader[0] as AdViewDataLoaderAbstractType,
        );
      } else {
        config.source = new SmartDataLoader(
          config.sourceLoader.map(item => {
            return createLoaderFromType(item as AdViewDataLoaderAbstractType);
          }),
        );
      }
    }
  } else {
    config.source = createLoaderFromType(
      config.sourceLoader as AdViewDataLoaderAbstractType,
    );
  }
  return config.source;
}

function createLoaderFromType(
  tp: AdViewDataLoaderAbstractType,
): AdViewDataLoader {
  if (typeof tp === 'string') {
    return new DynamicFetcherDataLoader(tp);
  }
  if (Array.isArray(tp)) {
    return new HardDataLoader(tp);
  }
  return tp;
}

export default getDataLoaderFromConfig;
