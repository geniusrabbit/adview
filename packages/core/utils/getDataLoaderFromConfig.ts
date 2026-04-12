import {
  AdViewConfig,
  AdViewDataLoader,
  AdViewDataLoaderAbstractType,
  AdViewStaticData,
} from 'typings';
import { findAndCreateDataLoaderForType } from './dataLoaderRegistry';
import DynamicFetcherDataLoader from './dynamicFetcherDataLoader';
import FuncDataLoader, { FuncDataLoaderType } from './funcDataLoader';
import HardDataLoader from './hardDataLoader';
import SmartDataLoader from './smartDataLoader';

/**
 * Retrieves or creates an AdViewDataLoader based on the provided configuration.
 * Supports custom loaders, smart loaders, and default fetcher loaders.
 */
function getDataLoaderFromConfig(
  config: AdViewConfig,
  sources: string[] | undefined = undefined,
): AdViewDataLoader {
  if (!!config.source) {
    return config.source;
  }
  // If no source loader is provided, create one based on srcURL or defaultAdData
  if (!config.sourceLoader) {
    if (testSource('default', sources)) {
      if (config.srcURL) {
        config.source = new DynamicFetcherDataLoader(
          config.srcURL || '',
          config.defaultAdData,
        );
      } else {
        config.source = new HardDataLoader('', undefined, config.defaultAdData);
      }
    }
  } else if (Array.isArray(config.sourceLoader)) {
    config.source = wrapLoaders(
      config.sourceLoader as AdViewDataLoaderAbstractType[],
      sources,
    );
  } else {
    config.source = createLoaderFromType(
      config.sourceLoader as AdViewDataLoaderAbstractType,
      sources,
    );
  }
  if (!config.source) {
    config.source = new HardDataLoader('', undefined, config.defaultAdData);
  }
  return config.source;
}

function createLoaderFromType(
  tp: AdViewDataLoaderAbstractType,
  sources?: string[] | undefined,
): AdViewDataLoader | undefined {
  if (!tp) {
    return undefined;
  }
  let loader = findAndCreateDataLoaderForType(tp, sources);
  if (loader) {
    return loader;
  }
  if (typeof tp === 'string') {
    if (testSource('dynamic', sources)) {
      return new DynamicFetcherDataLoader(tp);
    }
    return undefined;
  }
  if (Array.isArray(tp)) {
    if (testSource('static', sources)) {
      return new HardDataLoader('', undefined, tp);
    }
    return undefined;
  }
  if (typeof tp === 'function') {
    if (testSource('function', sources)) {
      return new FuncDataLoader(tp as FuncDataLoaderType);
    }
    return undefined;
  }
  if (typeof tp === 'object') {
    if (testSource('static', sources) && 'defaultData' in tp) {
      const { version, adsourceInfo, defaultData } = tp as AdViewStaticData;
      return new HardDataLoader(version || '', adsourceInfo, defaultData);
    }
    return undefined;
  }
  return tp;
}

function wrapLoaders(
  loaders: AdViewDataLoaderAbstractType[],
  sources?: string[] | undefined,
): AdViewDataLoader | undefined {
  if (loaders.length === 0) {
    return undefined;
  }
  let loaderObjects = loaders
    .map(item => createLoaderFromType(item, sources))
    .filter(Boolean) as AdViewDataLoader[];
  if (loaderObjects.length === 1) {
    return loaderObjects[0];
  }
  if (loaderObjects.length > 1) {
    return new SmartDataLoader(loaderObjects);
  }
  return undefined;
}

function testSource(val: string, sources?: string[] | undefined): boolean {
  return !sources || sources.length < 1 || sources.indexOf(val) >= 0;
}

export default getDataLoaderFromConfig;
