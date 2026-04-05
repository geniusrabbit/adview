import { AdViewData, AdViewDataLoader, AdViewGroupItem } from 'typings';
import { RandomAdItems } from './getCollectPageData';

/**
 * HardDataLoader is an implementation of AdViewDataLoader that
 * always returns a fixed set of ad items.
 * Useful for testing or fallback scenarios.
 */
class HardDataLoader implements AdViewDataLoader {
  defaultData: AdViewGroupItem[] | undefined;
  constructor(defaultData?: AdViewGroupItem[]) {
    this.defaultData = defaultData;
  }

  async fetchAdData(
    unitId: string,
    limit: number = 1,
    format?: string | string[],
    _query?: { [key: string]: any },
  ): Promise<AdViewData | Error> {
    if (limit <= 0) {
      limit = 1;
    }
    return {
      version: '',
      groups: [
        {
          id: unitId,
          items: RandomAdItems(this.defaultData || [], limit, format),
        },
      ],
    } as AdViewData;
  }
}

export default HardDataLoader;
