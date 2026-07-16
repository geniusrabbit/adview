import { AdViewData, AdViewDataLoader, AdViewGroupItem } from '../typings';

const REGISTRY_KEY = '__ADVIEW_DATA_LOADERS_REGISTRY__';

/** Clears the global data-loader registry between tests. */
export function clearDataLoaderRegistry() {
  const globalRef = globalThis as typeof globalThis & {
    [REGISTRY_KEY]?: unknown[];
  };
  if (Array.isArray(globalRef[REGISTRY_KEY])) {
    globalRef[REGISTRY_KEY]!.length = 0;
  }
}

export function makeAdItem(
  overrides: Partial<AdViewGroupItem> & { id: string; type: string },
): AdViewGroupItem {
  return {
    url: `https://example.com/ads/${overrides.id}`,
    fields: { title: `Ad ${overrides.id}` },
    ...overrides,
  };
}

export function makeLoader(
  items: AdViewGroupItem[] | ((limit: number) => AdViewGroupItem[]),
): AdViewDataLoader {
  return {
    fetchAdData: async (unitId, limit = 1) => {
      const resolved = typeof items === 'function' ? items(limit) : items;
      return {
        version: '1',
        groups: [{ id: unitId, items: resolved.slice(0, limit) }],
      } as AdViewData;
    },
  };
}

export function makeFailingLoader(message = 'loader failed'): AdViewDataLoader {
  return {
    fetchAdData: async () => new Error(message),
  };
}
