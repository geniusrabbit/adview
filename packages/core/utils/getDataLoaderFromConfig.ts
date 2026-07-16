import {
  AdViewConfig,
  AdViewDataLoader,
  AdViewDataLoaderAbstractType,
  AdViewStaticData,
} from 'typings';
import buildLoaderFromSources, {
  AdViewSourceFilters,
} from './buildLoaderFromSources';
import DynamicFetcherDataLoader from './dynamicFetcherDataLoader';
import FuncDataLoader, { FuncDataLoaderType } from './funcDataLoader';
import HardDataLoader from './hardDataLoader';
import SmartDataLoader from './smartDataLoader';

/**
 * Retrieves or creates an AdViewDataLoader based on the provided configuration.
 * Supports the declarative `sources` config, custom loaders, smart loaders,
 * and default fetcher loaders.
 *
 * Does not mutate `config` — `config.source` is only honored when the caller
 * explicitly passed a pre-built loader (never written back for shared Provider props).
 */
function getDataLoaderFromConfig(
  config: AdViewConfig,
  filters: AdViewSourceFilters | undefined = undefined,
): AdViewDataLoader {
  // Explicit user-provided loader override
  if (config.source) {
    return config.source;
  }

  // Declarative `sources` — rebuild every call so per-Unit filters stay correct
  if (config.sources && config.sources.length > 0) {
    const loader = buildLoaderFromSources(config.sources, filters);
    if (loader) {
      return loader;
    }
  }

  const sources = filters?.sources;
  let resolved: AdViewDataLoader | undefined;

  if (!config.sourceLoader) {
    if (testSource('default', sources)) {
      if (config.srcURL) {
        resolved = new DynamicFetcherDataLoader(
          config.srcURL || '',
          config.defaultAdData,
        );
      } else {
        resolved = new HardDataLoader('', undefined, config.defaultAdData);
      }
    }
  } else if (Array.isArray(config.sourceLoader)) {
    resolved = wrapLoaders(
      config.sourceLoader as AdViewDataLoaderAbstractType[],
      sources,
    );
  } else {
    resolved = createLoaderFromType(
      config.sourceLoader as AdViewDataLoaderAbstractType,
      sources,
    );
  }

  return resolved || new HardDataLoader('', undefined, config.defaultAdData);
}

function createLoaderFromType(
  tp: AdViewDataLoaderAbstractType,
  sources?: string[] | undefined,
): AdViewDataLoader | undefined {
  if (!tp) {
    return undefined;
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
    // Already an AdViewDataLoader instance
    if ('fetchAdData' in tp && typeof (tp as AdViewDataLoader).fetchAdData === 'function') {
      return tp as AdViewDataLoader;
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
