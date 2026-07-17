import { AdViewDataLoader, AdViewSelectionPlan, AdViewSourceItem } from 'typings';
import { findDataLoaderForSource } from './dataLoaderRegistry';
import SmartDataLoader, { LoaderItem } from './smartDataLoader';

/** Filters applied on top of `AdViewConfig.sources` when resolving a data loader */
export type AdViewSourceFilters = {
  /** Source names to keep; also defines sequential selection when `selection` is omitted */
  sources?: string[];
  /** Keep only sources that have at least one of these tags */
  tags?: string[];
  /** Keep only sources whose `driver` is one of these */
  drivers?: string[];
  /**
   * Staged selection plan (waterfall / parallel weighted shuffle).
   * When set, overrides the sequential order implied by `sources`.
   */
  selection?: AdViewSelectionPlan;
};

/**
 * Resolves `AdViewConfig.sources` into a single `AdViewDataLoader`,
 * applying the `drivers`/`tags`/`sources` filters and chaining loaders
 * via `SmartDataLoader` with an optional selection plan.
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
    // Keep filter order for pool membership; selection plan may reorder stages
    filteredItems = filters.sources
      .map(name => byName.get(name))
      .filter(Boolean) as AdViewSourceItem[];
  } else if (!filters?.selection) {
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

  const loaderItems = resolvedItems
    .map(item => {
      const loader = findDataLoaderForSource(item);
      if (!loader) {
        return null;
      }
      return new LoaderItem({
        loader,
        name: item.name,
        weight: item.weight,
      });
    })
    .filter(Boolean) as LoaderItem[];

  if (loaderItems.length === 0) {
    return undefined;
  }
  if (loaderItems.length === 1 && !filters?.selection) {
    return loaderItems[0]!.loader;
  }

  const selection: AdViewSelectionPlan | undefined =
    filters?.selection ||
    (filters?.sources && filters.sources.length > 0
      ? filters.sources
      : loaderItems.map(item => item.name!));

  return new SmartDataLoader(loaderItems, selection);
}

export default buildLoaderFromSources;
