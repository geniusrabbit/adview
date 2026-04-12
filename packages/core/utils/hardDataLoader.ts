import {
  AdViewAdSourceInfo,
  AdViewData,
  AdViewDataLoader,
  AdViewGroupItem,
} from 'typings';
import { RandomAdItems } from './getCollectPageData';

/**
 * HardDataLoader is an implementation of AdViewDataLoader that
 * always returns a fixed set of ad items.
 * Useful for testing or fallback scenarios.
 */
class HardDataLoader implements AdViewDataLoader {
  version = '';
  adsourceInfo: AdViewAdSourceInfo[] | undefined;
  defaultData: AdViewGroupItem[] | undefined;
  constructor(
    version: string = '',
    adsourceInfo?: AdViewAdSourceInfo[],
    defaultData?: AdViewGroupItem[],
  ) {
    this.version = version;
    this.adsourceInfo = adsourceInfo;
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
    const items = RandomAdItems(this.defaultData || [], limit, format);
    if (!items || items.length === 0) {
      return {}; // Empty response if no items available
    }
    return {
      version: this.version,
      adsources: this.adsourceInfo?.filter(info =>
        items.some(item => item.adInfo?.adsourceId === info.id),
      ),
      groups: [
        {
          id: unitId,
          items: items,
        },
      ],
    } as AdViewData;
  }
}

export default HardDataLoader;
