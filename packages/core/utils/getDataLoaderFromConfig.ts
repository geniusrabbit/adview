import {
  AdViewConfig,
  AdViewDataLoader,
  AdViewDataLoaderAbstractType,
} from 'typings';
import DynamicFetcherDataLoader from './dynamicFetcherDataLoader';
import FuncDataLoader, { FuncDataLoaderType } from './funcDataLoader';
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
  // If no source loader is provided, create one based on srcURL or defaultAdData
  if (!config.sourceLoader) {
    if (config.srcURL) {
      config.source = new DynamicFetcherDataLoader(
        config.srcURL || '',
        config.defaultAdData,
      );
    } else {
      config.source = new HardDataLoader(config.defaultAdData);
    }
  } else if (Array.isArray(config.sourceLoader)) {
    config.source = wrapLoaders(
      config.sourceLoader as AdViewDataLoaderAbstractType[],
    );
  } else {
    config.source = createLoaderFromType(
      config.sourceLoader as AdViewDataLoaderAbstractType,
    );
  }
  if (!config.source) {
    config.source = new HardDataLoader(config.defaultAdData);
  }
  return config.source;
}

function createLoaderFromType(
  tp: AdViewDataLoaderAbstractType,
): AdViewDataLoader | undefined {
  if (!tp) {
    return undefined;
  }
  if (typeof tp === 'string') {
    return new DynamicFetcherDataLoader(tp);
  }
  if (Array.isArray(tp)) {
    return new HardDataLoader(tp);
  }
  if (typeof tp === 'function') {
    return new FuncDataLoader(tp as FuncDataLoaderType);
  }
  return tp;
}

function wrapLoaders(
  loaders: AdViewDataLoaderAbstractType[],
): AdViewDataLoader | undefined {
  if (loaders.length === 0) {
    return undefined;
  }
  let loaderObjects = loaders
    .map(item => createLoaderFromType(item))
    .filter(Boolean) as AdViewDataLoader[];
  if (loaderObjects.length === 1) {
    return loaderObjects[0];
  }
  if (loaderObjects.length > 1) {
    return new SmartDataLoader(loaderObjects);
  }
  return undefined;
}

export default getDataLoaderFromConfig;
