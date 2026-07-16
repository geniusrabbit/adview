import { AdViewDataLoader, AdViewSourceItem } from 'typings';
import { findDataLoaderForSource } from './dataLoaderRegistry';
import SmartDataLoader from './smartDataLoader';

/** Filters applied on top of `AdViewConfig.sources` when resolving a data loader */
export type AdViewSourceFilters = {
  /** Source names to keep; also defines the request priority order */
  sources?: string[];
  /** Keep only sources that have at least one of these tags */
  tags?: string[];
  /** Keep only sources whose `driver` is one of these */
  drivers?: string[];
};

/**
 * Resolves `AdViewConfig.sources` into a single `AdViewDataLoader`,
 * applying the `drivers`/`tags`/`sources` filters and, when several sources
 * match, chaining their loaders so each next one tops up the previous
 * one's results (via `SmartDataLoader`'s sequential fill behavior).
 */
function buildLoaderFromSources(
  items: AdViewSourceItem[],
  filters?: AdViewSourceFilters,
): AdViewDataLoader | undefined {
  let filteredItems = items;

  if (filters?.drivers && filters.drivers.length > 0) {
    filteredItems = filteredItems.filter(item =>
      filters.drivers!.includes(item.driver),
    );
  }

  if (filters?.tags && filters.tags.length > 0) {
    filteredItems = filteredItems.filter(item =>
      item.tags?.some(tag => filters.tags!.includes(tag)),
    );
  }

  if (filters?.sources && filters.sources.length > 0) {
    const byName = new Map(filteredItems.map(item => [item.name, item]));
    filteredItems = filters.sources
      .map(name => byName.get(name))
      .filter(Boolean) as AdViewSourceItem[];
  } else {
    filteredItems = [...filteredItems].sort(
      (a, b) => (b.weight ?? 1) - (a.weight ?? 1),
    );
  }

  // Multi-source chains must not pad with defaults or the next source never runs
  const multiSource = filteredItems.length > 1;
  const resolvedItems = multiSource
    ? filteredItems.map(item => ({
        ...item,
        params: {
          ...item.params,
          fillWithDefaults:
            item.params?.fillWithDefaults !== undefined
              ? item.params.fillWithDefaults
              : false,
        },
      }))
    : filteredItems;

  const loaders = resolvedItems
    .map(item => findDataLoaderForSource(item))
    .filter(Boolean) as AdViewDataLoader[];

  if (loaders.length === 0) {
    return undefined;
  }
  if (loaders.length === 1) {
    return loaders[0];
  }
  return new SmartDataLoader(loaders, 'roundrobin');
}

export default buildLoaderFromSources;
