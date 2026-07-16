import {
  AdViewDataLoader,
  AdViewDriverConstructor,
  AdViewSourceItem,
} from 'typings';
import DynamicFetcherDataLoader from './dynamicFetcherDataLoader';
import FuncDataLoader from './funcDataLoader';
import HardDataLoader from './hardDataLoader';

/** Built-in drivers resolved directly, without needing explicit registration */
const BUILTIN_DRIVERS: { [driverName: string]: AdViewDriverConstructor } = {
  dynamic: DynamicFetcherDataLoader,
  static: HardDataLoader,
  function: FuncDataLoader,
};

/** A registered driver implementation paired with its name and optional matcher */
export interface AdViewDataLoaderItem {
  driverName: string;
  driver: AdViewDriverConstructor;
  matcher?: (source: AdViewSourceItem) => boolean;
}

/** Global key for client-side registry */
const REGISTRY_KEY = '__ADVIEW_DATA_LOADERS_REGISTRY__';

type GlobalWithRegistry = typeof globalThis & {
  [REGISTRY_KEY]?: AdViewDataLoaderItem[];
};

function getGlobalRegistry(): AdViewDataLoaderItem[] {
  const globalRef = globalThis as GlobalWithRegistry;
  if (!globalRef[REGISTRY_KEY]) {
    globalRef[REGISTRY_KEY] = [];
  }
  return globalRef[REGISTRY_KEY];
}

/** Global registry storing all registered drivers */
const registryDataLoaders = getGlobalRegistry();

/**
 * Registers a driver implementation under a given name.
 *
 * Matching a source config against a registered driver always requires
 * `source.driver === driverName` first; `matcher` (and/or a static
 * `matchDriver` implemented on `driver` itself) can further refine that
 * match, but neither can bypass the mandatory name check.
 *
 * @param driverName - Name referenced by `AdViewSourceItem.driver`
 * @param driver - Constructor for the driver implementation
 * @param matcher - Optional extra check to confirm the source config fits this driver
 */
export function registerDataLoader(
  driverName: string,
  driver: AdViewDriverConstructor,
  matcher?: (source: AdViewSourceItem) => boolean,
) {
  if (registryDataLoaders.some(item => item.driverName === driverName)) {
    return;
  }

  registryDataLoaders.push({ driverName, driver, matcher });
}

/**
 * Gets all registered drivers
 * @returns Array of registered driver items
 */
export function getRegisteredDataLoaders(): AdViewDataLoaderItem[] {
  return registryDataLoaders;
}

/**
 * Finds and instantiates the driver implementation for the given source
 * config: explicitly registered drivers are checked first (so a driver
 * name such as 'dynamic' can be overridden), falling back to the built-in
 * drivers ('dynamic', 'static', 'function') resolved directly with no
 * registration step required.
 * @param source - The declarative source config to resolve
 * @returns A new data loader instance, or undefined if no driver matches
 */
export function findDataLoaderForSource(
  source: AdViewSourceItem,
): AdViewDataLoader | undefined {
  for (const item of registryDataLoaders) {
    if (item.driverName !== source.driver) {
      continue;
    }
    if (item.matcher && !item.matcher(source)) {
      continue;
    }
    if (item.driver.matchDriver && !item.driver.matchDriver(source)) {
      continue;
    }
    return new item.driver(source);
  }

  const builtinDriver = BUILTIN_DRIVERS[source.driver];
  if (builtinDriver) {
    return new builtinDriver(source);
  }

  return undefined;
}
