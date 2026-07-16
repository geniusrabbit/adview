import {
  AdViewAdSourceInfo,
  AdViewData,
  AdViewDataLoader,
  AdViewGroupItem,
  AdViewSourceItem,
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

  constructor(source: AdViewSourceItem);
  constructor(
    version?: string,
    adsourceInfo?: AdViewAdSourceInfo[],
    defaultData?: AdViewGroupItem[],
  );
  constructor(
    versionOrSource: string | AdViewSourceItem = '',
    adsourceInfo?: AdViewAdSourceInfo[],
    defaultData?: AdViewGroupItem[],
  ) {
    if (typeof versionOrSource === 'object') {
      const params = versionOrSource.params || {};
      this.version = params.version || '';
      this.adsourceInfo = params.adsourceInfo;
      this.defaultData = params.defaultData;
    } else {
      this.version = versionOrSource;
      this.adsourceInfo = adsourceInfo;
      this.defaultData = defaultData;
    }
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
        items.some(item => item.adinfo?.ad?.adsource_id === info.id),
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
