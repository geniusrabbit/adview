import {
  AdViewData,
  AdViewDataLoader,
  AdViewGroup,
  AdViewGroupItem,
  AdViewSourceItem,
} from 'typings';
import { RandomAdItems } from './getCollectPageData';

type FetcherDataPrepareResponse = (data: any) => AdViewData | Error;

function getPageLocation():
  | { pathname?: string; host?: string; hostname?: string }
  | undefined {
  if (typeof globalThis === 'undefined' || !('location' in globalThis)) {
    return undefined;
  }
  try {
    return (globalThis as { location?: Location }).location;
  } catch {
    return undefined;
  }
}

/**
 * DynamicFetcherDataLoader is an implementation of AdViewDataLoader that
 * fetches ad data from a dynamic URL using the Fetch API.
 * It supports timeout, default data fallback, and custom data preparation.
 */
class DynamicFetcherDataLoader implements AdViewDataLoader {
  srcURL: string;
  defaultData: AdViewGroupItem[] | undefined;
  timeout: number = 5000;
  dataPreparer: FetcherDataPrepareResponse | undefined;
  /** When false, never pad responses with defaultData (waterfall-friendly). */
  fillWithDefaults: boolean = true;

  constructor(source: AdViewSourceItem);
  constructor(
    srcURL: string,
    defaultData?: AdViewGroupItem[],
    timeout?: number,
    dataPreparer?: FetcherDataPrepareResponse,
    fillWithDefaults?: boolean,
  );
  constructor(
    srcURLOrSource: string | AdViewSourceItem,
    defaultData?: AdViewGroupItem[],
    timeout?: number,
    dataPreparer?: FetcherDataPrepareResponse,
    fillWithDefaults?: boolean,
  ) {
    if (typeof srcURLOrSource === 'object') {
      const params = srcURLOrSource.params || {};
      this.srcURL = params.url || '';
      defaultData = params.defaultData;
      timeout = params.timeout;
      dataPreparer = params.dataPreparer;
      fillWithDefaults = params.fillWithDefaults;
    } else {
      this.srcURL = srcURLOrSource;
    }
    this.defaultData = defaultData;
    if (timeout !== undefined) {
      this.timeout = timeout > 0 ? timeout : 5000;
    }
    this.dataPreparer = dataPreparer;
    if (fillWithDefaults !== undefined) {
      this.fillWithDefaults = fillWithDefaults !== false;
    }
  }

  async fetchAdData(
    unitId: string,
    limit: number = 1,
    format?: string | string[],
    query?: { [key: string]: any },
  ): Promise<AdViewData | Error> {
    if (limit <= 0) {
      limit = 1;
    }
    const targetURL = this.prepareURL(unitId, limit, format, query);
    const loc = getPageLocation();

    try {
      const response = await fetch(targetURL, {
        signal: AbortSignal.timeout(this.timeout),
        headers: {
          'X-Page-Path': loc?.pathname || '',
          'X-Page-Domain': loc?.host || loc?.hostname || '',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AdViewData = { version: '0' };

      const responseJson = await response.json();
      if (!responseJson || typeof responseJson !== 'object') {
        if (!this.fillWithDefaults) {
          return { version: '', groups: [{ id: unitId, items: [] }] };
        }
        return {
          version: '',
          groups: [
            { id: unitId, items: this.defaultRandomAdItems(limit, format) },
          ],
        } as AdViewData;
      }

      const preparedData = this.prepareData(responseJson);
      if (preparedData instanceof Error) {
        throw preparedData;
      }

      data.version = preparedData.version || '0';
      data.custom_tracker = preparedData.custom_tracker;
      data.groups = preparedData.groups || [];
      data.adsources = preparedData.adsources;

      if (this.fillWithDefaults) {
        const adGroups = (data.groups || []) as AdViewGroup[];
        const currentGroup = adGroups.find(g => g.id === unitId);

        if (currentGroup == null) {
          data.groups?.push({
            id: unitId,
            items: this.defaultRandomAdItems(limit, format),
          });
        } else if (limit > (currentGroup.items?.length || 0)) {
          currentGroup.items = currentGroup.items || [];
          currentGroup.items.push(
            ...this.defaultRandomAdItems(
              limit - currentGroup.items.length,
              format,
            ),
          );
        }
      } else {
        // Ensure the unit group exists even if empty so callers can count items
        const adGroups = (data.groups || []) as AdViewGroup[];
        if (!adGroups.find(g => g.id === unitId)) {
          data.groups = [...adGroups, { id: unitId, items: [] }];
        }
      }

      return data;
    } catch (error) {
      if (
        this.fillWithDefaults &&
        !!this.defaultData &&
        this.defaultData.length > 0
      ) {
        return {
          version: '',
          groups: [
            { id: unitId, items: this.defaultRandomAdItems(limit, format) },
          ],
        } as AdViewData;
      }
      return error instanceof Error ? error : new Error(String(error));
    }
  }

  private prepareURL(
    unitId: string,
    limit: number,
    format?: string | string[],
    query?: { [key: string]: any },
  ): string {
    const fmt = !format
      ? ''
      : Array.isArray(format)
        ? format.join(',')
        : format;
    let url = this.srcURL
      .replace('{<id>}', unitId)
      .replace('{<format>}', fmt)
      .replace('{<limit>}', limit.toString())
      .replace(`{<locale>}`, query?.locale || 'en');
    if (query) {
      for (const key in query) {
        const value = encodeURIComponent(query[key] + '');
        if (url.includes(`{<q.${key}>}`)) {
          url = url.replace(`{<q.${key}>}`, value);
        } else if (url.includes(`{<query.${key}>}`)) {
          url = url.replace(`{<query.${key}>}`, value);
        } else {
          url += (url.includes('?') ? '&' : '?') + `${key}=${value}`;
        }
      }
    }
    return url;
  }

  private defaultRandomAdItems(
    limit: number,
    format?: string | string[],
  ): AdViewGroupItem[] {
    return RandomAdItems(this.defaultData || [], limit, format);
  }

  private prepareData(data: any): AdViewData | Error {
    if (this.dataPreparer) {
      return this.dataPreparer(data);
    }
    return data as AdViewData;
  }
}

export default DynamicFetcherDataLoader;
