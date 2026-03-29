import { AdViewData, AdViewDataLoader, AdViewGroup } from 'typings';

type alghoritmType = 'roundrobin' | 'random' | ((curIndex: number) => number);

export interface LoaderItemIface {
  unitIds?: string[];
  formats?: string[];
  loader: AdViewDataLoader;
}

export class LoaderItem implements LoaderItemIface {
  unitIds?: string[];
  formats?: string[];
  loader: AdViewDataLoader;

  constructor(
    loader: AdViewDataLoader,
    unitIds?: string[],
    formats?: string[],
  ) {
    this.loader = loader;
    this.unitIds = unitIds;
    this.formats = formats;
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
 * SmartDataLoader is an implementation of AdViewDataLoader that
 * selects from multiple data loaders based on unit ID and format.
 * It supports different selection algorithms like round-robin and random.
 */
class SmartDataLoader implements AdViewDataLoader {
  private loaders: LoaderItem[] = [];
  private algorithm: (curIndex: number) => number;

  constructor(
    loaders: (LoaderItemIface | AdViewDataLoader)[],
    algorithm: alghoritmType = 'roundrobin',
  ) {
    this.loaders = loaders.map(item => {
      if (item instanceof LoaderItem) {
        return item;
      }
      if (
        'loader' in item &&
        typeof item.loader === 'object' &&
        typeof item.loader.fetchAdData === 'function'
      ) {
        return new LoaderItem(item.loader, item.unitIds, item.formats);
      }
      return new LoaderItem(item as AdViewDataLoader);
    });
    switch (algorithm) {
      case 'roundrobin':
        this.algorithm = (curIndex: number) => {
          return curIndex + 1;
        };
        break;
      case 'random':
        this.algorithm = (_: number) => {
          return Math.floor(Math.random() * this.loaders.length);
        };
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
  ): Promise<AdViewData | Error> {
    const formatArray = Array.isArray(format) ? format : format ? [format] : [];
    let err: Error | null = null;
    let res: AdViewData | null = null;
    let visitedLoaders = new Set<number>();
    let currentIndex = -1;

    /**
     * Iterate through loaders until we either fulfill the request
     * or exhaust all available loaders.
     */
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
        // We know that group.items is defined because it was set in the previous step
        mergedGroups[group.id]!.items!.push(...(group.items || []));
      }
    }
    if (mergedGroups[unitId] && mergedGroups[unitId].items.length > limit) {
      mergedGroups[unitId].items = mergedGroups[unitId].items.slice(0, limit);
    }
    return {
      ...base,
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

export default SmartDataLoader;
