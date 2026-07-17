import {
  AdViewData,
  AdViewDataLoader,
  AdViewGroup,
  AdViewGroupItem,
  AdViewSelectionPlan,
  AdViewSelectionStage,
} from 'typings';
import {
  dedupeById,
  isMultiSourceStage,
  isSelectionPlan,
  normalizeStage,
  resolveSourceRef,
  weightedShuffle,
  type ResolvedSourceRef,
  type WeightedItem,
} from './selectionPlan';

type alghoritmType = 'roundrobin' | 'random' | ((curIndex: number) => number);

export interface LoaderItemIface {
  name?: string;
  weight?: number;
  unitIds?: string[];
  formats?: string[];
  loader: AdViewDataLoader;
}

export class LoaderItem implements LoaderItemIface {
  name?: string;
  weight?: number;
  unitIds?: string[];
  formats?: string[];
  loader: AdViewDataLoader;

  constructor(
    loader: AdViewDataLoader,
    unitIds?: string[],
    formats?: string[],
    name?: string,
    weight?: number,
  );
  constructor(item: LoaderItemIface);
  constructor(
    loaderOrItem: AdViewDataLoader | LoaderItemIface,
    unitIds?: string[],
    formats?: string[],
    name?: string,
    weight?: number,
  ) {
    if (
      loaderOrItem &&
      typeof loaderOrItem === 'object' &&
      'loader' in loaderOrItem &&
      typeof (loaderOrItem as LoaderItemIface).loader?.fetchAdData === 'function'
    ) {
      const item = loaderOrItem as LoaderItemIface;
      this.loader = item.loader;
      this.unitIds = item.unitIds;
      this.formats = item.formats;
      this.name = item.name;
      this.weight = item.weight;
      return;
    }
    this.loader = loaderOrItem as AdViewDataLoader;
    this.unitIds = unitIds;
    this.formats = formats;
    this.name = name;
    this.weight = weight;
  }

  testUnitId(unitId: string): boolean {
    return (
      !this.unitIds ||
      this.unitIds.length === 0 ||
      this.unitIds.includes(unitId)
    );
  }

  testFormat(format: string[]): boolean {
    return (
      !format ||
      format.length === 0 ||
      !this.formats ||
      this.formats.length === 0 ||
      format.some(f => this.formats!.includes(f))
    );
  }
}

/**
 * SmartDataLoader selects from multiple data loaders.
 *
 * - Legacy: second arg `'roundrobin' | 'random' | fn` walks loaders sequentially.
 * - Selection plan: second arg `AdViewSelectionPlan` runs staged waterfall /
 *   parallel weighted-shuffle merge (see typings).
 */
class SmartDataLoader implements AdViewDataLoader {
  private loaders: LoaderItem[] = [];
  private algorithm: (curIndex: number) => number;
  private selection: AdViewSelectionPlan | null = null;
  private useSelectionPlan = false;

  constructor(
    loaders: (LoaderItemIface | AdViewDataLoader)[],
    selectionOrAlgorithm?:
      | AdViewSelectionPlan
      | alghoritmType,
  ) {
    this.loaders = loaders.map((item, index) => {
      if (item instanceof LoaderItem) {
        if (!item.name) {
          item.name = `loader-${index}`;
        }
        return item;
      }
      if (
        item &&
        typeof item === 'object' &&
        'loader' in item &&
        typeof (item as LoaderItemIface).loader?.fetchAdData === 'function'
      ) {
        const iface = item as LoaderItemIface;
        return new LoaderItem({
          ...iface,
          name: iface.name || `loader-${index}`,
        });
      }
      return new LoaderItem(
        item as AdViewDataLoader,
        undefined,
        undefined,
        `loader-${index}`,
      );
    });

    if (isSelectionPlan(selectionOrAlgorithm)) {
      this.useSelectionPlan = true;
      this.selection = selectionOrAlgorithm;
      this.algorithm = (curIndex: number) => curIndex + 1;
      return;
    }

    const algorithm: alghoritmType = selectionOrAlgorithm || 'roundrobin';
    switch (algorithm) {
      case 'roundrobin':
        this.algorithm = (curIndex: number) => curIndex + 1;
        break;
      case 'random':
        this.algorithm = (_: number) =>
          Math.floor(Math.random() * this.loaders.length);
        break;
      default:
        this.algorithm = algorithm;
        break;
    }
  }

  async fetchAdData(
    unitId: string,
    limit: number = 1,
    format?: string | string[],
    query?: { [key: string]: any },
  ): Promise<AdViewData | Error> {
    if (this.useSelectionPlan && this.selection) {
      return this.fetchWithSelectionPlan(unitId, limit, format, query);
    }
    return this.fetchLegacy(unitId, limit, format, query);
  }

  private async fetchWithSelectionPlan(
    unitId: string,
    limit: number,
    format?: string | string[],
    query?: { [key: string]: any },
  ): Promise<AdViewData | Error> {
    let err: Error | null = null;
    let collected: AdViewGroupItem[] = [];
    let adsources: AdViewData['adsources'] = [];
    let version: string | undefined;

    for (const stage of this.selection!) {
      const remaining = Math.max(0, limit - collected.length);
      if (remaining <= 0) {
        break;
      }

      const seenIds = new Set(collected.map(item => item.id));
      const stageResult = await this.runStage(
        stage,
        unitId,
        remaining,
        format,
        query,
        seenIds,
      );

      if (stageResult.error) {
        err = stageResult.error;
      }
      if (stageResult.version) {
        version = version || stageResult.version;
      }
      if (stageResult.adsources?.length) {
        adsources = [...(adsources || []), ...stageResult.adsources];
      }

      if (stageResult.items.length > 0) {
        collected = dedupeById([...collected, ...stageResult.items]).slice(
          0,
          limit,
        );
      }
    }

    if (collected.length > 0) {
      return {
        version,
        adsources,
        groups: [{ id: unitId, items: collected }],
      };
    }

    return (
      err || new Error('No suitable data loader found or all loaders failed.')
    );
  }

  private async runStage(
    stage: AdViewSelectionStage,
    unitId: string,
    remaining: number,
    format?: string | string[],
    query?: { [key: string]: any },
    seenIds: Set<string> = new Set(),
  ): Promise<{
    items: AdViewGroupItem[];
    adsources?: AdViewData['adsources'];
    version?: string;
    error: Error | null;
  }> {
    const refs = normalizeStage(stage)
      .map(ref => {
        const name = typeof ref === 'string' ? ref : ref.source;
        const loader = this.findLoaderByName(name);
        return resolveSourceRef(ref, loader?.weight);
      })
      .filter(ref => {
        if (ref.weight <= 0) {
          return false;
        }
        if (!this.findLoaderByName(ref.source)) {
          if (typeof console !== 'undefined' && console.warn) {
            console.warn(
              `[SmartDataLoader] Unknown source in selection plan: "${ref.source}"`,
            );
          }
          return false;
        }
        return true;
      });

    if (refs.length === 0) {
      return { items: [], error: null };
    }

    const multi = isMultiSourceStage(stage) && refs.length > 1;
    // Over-fetch a bit so duplicates already taken in prior stages can be skipped
    const fetchLimit = remaining + seenIds.size;

    if (!multi) {
      // Solo stage — order preserved, no shuffle
      const ref = refs[0]!;
      const fetched = await this.fetchFromRef(
        ref,
        unitId,
        fetchLimit,
        format,
        query,
      );
      const items = fetched.items
        .filter(item => !seenIds.has(item.id))
        .slice(0, remaining);
      return {
        items,
        adsources: fetched.adsources,
        version: fetched.version,
        error: fetched.error,
      };
    }

    // Parallel fetch each source, then weighted shuffle
    const results = await Promise.all(
      refs.map(ref =>
        this.fetchFromRef(ref, unitId, fetchLimit, format, query),
      ),
    );

    let error: Error | null = null;
    let version: string | undefined;
    let adsources: AdViewData['adsources'] = [];
    const pool: WeightedItem[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i]!;
      const ref = refs[i]!;
      if (result.error) {
        error = result.error;
      }
      if (result.version) {
        version = version || result.version;
      }
      if (result.adsources?.length) {
        adsources = [...(adsources || []), ...result.adsources];
      }
      for (const item of result.items) {
        if (seenIds.has(item.id)) {
          continue;
        }
        pool.push({ item, weight: ref.weight, source: ref.source });
      }
    }

    const items = weightedShuffle(dedupeByIdPool(pool), remaining);
    return { items, adsources, version, error };
  }

  private async fetchFromRef(
    ref: ResolvedSourceRef,
    unitId: string,
    limit: number,
    format?: string | string[],
    query?: { [key: string]: any },
  ): Promise<{
    items: AdViewGroupItem[];
    adsources?: AdViewData['adsources'];
    version?: string;
    error: Error | null;
  }> {
    const loaderItem = this.findLoaderByName(ref.source);
    if (!loaderItem) {
      return { items: [], error: null };
    }

    const formatArray = Array.isArray(format) ? format : format ? [format] : [];
    if (
      !loaderItem.testUnitId(unitId) ||
      !loaderItem.testFormat(formatArray)
    ) {
      return { items: [], error: null };
    }

    try {
      const data = await loaderItem.loader.fetchAdData(
        unitId,
        limit,
        format,
        query,
      );
      if (data instanceof Error) {
        return { items: [], error: data };
      }
      const group =
        data.groups?.find(g => g.id === unitId) || data.groups?.[0];
      return {
        items: [...(group?.items || [])],
        adsources: data.adsources,
        version: data.version,
        error: null,
      };
    } catch (e) {
      return { items: [], error: e as Error };
    }
  }

  private findLoaderByName(name: string): LoaderItem | undefined {
    return this.loaders.find(item => item.name === name);
  }

  private async fetchLegacy(
    unitId: string,
    limit: number = 1,
    format?: string | string[],
    query?: { [key: string]: any },
  ): Promise<AdViewData | Error> {
    const formatArray = Array.isArray(format) ? format : format ? [format] : [];
    let err: Error | null = null;
    let res: AdViewData | null = null;
    const visitedLoaders = new Set<number>();
    let currentIndex = -1;

    while (visitedLoaders.size < this.loaders.length) {
      const nextLoader = this.nextLoader(
        unitId,
        formatArray,
        currentIndex,
        visitedLoaders,
      );

      if (!nextLoader.loader) {
        break;
      }

      currentIndex = nextLoader.index;

      try {
        const newLimit = Math.max(0, limit - this.loadedInGroup(unitId, res));
        if (newLimit === 0 && res) {
          return res;
        }

        const data = await nextLoader.loader.fetchAdData(
          unitId,
          newLimit,
          format,
          query,
        );
        if (data instanceof Error) {
          err = data;
        } else {
          res = this.mergeData(unitId, res, data, limit);
          if (this.isComplete(unitId, limit, res)) {
            return res;
          }
        }
      } catch (e) {
        err = e as Error;
      }
    }

    if (res) {
      return res;
    }
    return (
      err || new Error('No suitable data loader found or all loaders failed.')
    );
  }

  private nextLoader(
    unitId: string,
    format: string[],
    currentIndex: number,
    visited: Set<number>,
  ): { loader: AdViewDataLoader | null; index: number } {
    const total = this.loaders.length;
    const startIndex = ((this.algorithm(currentIndex) % total) + total) % total;
    for (let i = 0; i < total; i++) {
      const index = (i + startIndex) % total;
      const item = this.loaders[index];
      if (!item || visited.has(index)) {
        continue;
      }
      if (item.testUnitId(unitId) && item.testFormat(format)) {
        visited.add(index);
        return { loader: item.loader, index };
      }
    }
    return { loader: null, index: -1 };
  }

  private isComplete(
    unitId: string,
    limit: number = 1,
    data: AdViewData | null,
  ): boolean {
    return this.loadedInGroup(unitId, data) >= limit;
  }

  private mergeData(
    unitId: string,
    base: AdViewData | null,
    addition: AdViewData,
    limit: number,
  ): AdViewData {
    if (!base) {
      return addition;
    }
    const mergedGroups: { [key: string]: AdViewGroup } = {};
    for (const group of base.groups || []) {
      mergedGroups[group.id] = { ...group, items: [...(group.items || [])] };
    }
    for (const group of addition.groups || []) {
      if (!mergedGroups[group.id]) {
        mergedGroups[group.id] = { ...group, items: [...(group.items || [])] };
      } else {
        mergedGroups[group.id]!.items!.push(...(group.items || []));
      }
    }
    if (mergedGroups[unitId] && mergedGroups[unitId].items.length > limit) {
      mergedGroups[unitId].items = mergedGroups[unitId].items.slice(0, limit);
    }
    return {
      ...base,
      adsources: [...(base.adsources || [])].concat(
        ...(addition.adsources || []),
      ),
      groups: Object.values(mergedGroups),
    };
  }

  private loadedInGroup(unitId: string, data: AdViewData | null): number {
    if (!data) {
      return 0;
    }
    const groups = data.groups || [];
    for (const group of groups) {
      if (group.id === unitId) {
        return group.items ? group.items.length : 0;
      }
    }
    return 0;
  }
}

function dedupeByIdPool(pool: WeightedItem[]): WeightedItem[] {
  const seen = new Set<string>();
  const out: WeightedItem[] = [];
  for (const entry of pool) {
    if (seen.has(entry.item.id)) {
      continue;
    }
    seen.add(entry.item.id);
    out.push(entry);
  }
  return out;
}

export default SmartDataLoader;
