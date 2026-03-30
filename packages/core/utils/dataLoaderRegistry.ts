import { AdViewDataLoader, AdViewDataLoaderAbstractType } from 'typings';

/** Checks if a data loader can handle a given type */
export type AdViewDataLoaderItemChecker = (
  type: AdViewDataLoaderAbstractType,
) => boolean;

/** Constructor for instantiating a data loader */
export type AdViewDataLoaderConstructor = new (
  type: AdViewDataLoaderAbstractType,
) => AdViewDataLoader;

/** A registered data loader paired with its type checker */
export interface AdViewDataLoaderItem {
  checker: AdViewDataLoaderItemChecker;
  loader: AdViewDataLoaderConstructor;
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

/** Global registry storing all registered data loaders */
const registryDataLoaders = getGlobalRegistry();

/**
 * Registers a data loader with a type checker
 * @param loader - Constructor for the data loader
 * @param checker - Determines if loader handles the given type
 */
export function registerDataLoader(
  loader: AdViewDataLoaderConstructor,
  checker: AdViewDataLoaderItemChecker,
) {
  if (registryDataLoaders.some(item => item.loader === loader)) {
    return;
  }

  registryDataLoaders.push({ loader, checker });
}

/**
 * Gets all registered data loaders
 * @returns Array of data loader items
 */
export function getRegisteredDataLoaders(): AdViewDataLoaderItem[] {
  return registryDataLoaders;
}

/**
 * Finds and instantiates a data loader for the given type
 * @param type - The type to match
 * @returns A new data loader instance or undefined if no match found
 */
export function findAndCreateDataLoaderForType(
  type: AdViewDataLoaderAbstractType,
): AdViewDataLoader | undefined {
  for (const item of registryDataLoaders) {
    if (item.checker(type)) {
      return new item.loader(type);
    }
  }
  return undefined;
}
