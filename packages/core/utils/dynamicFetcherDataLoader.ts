import {
  AdViewData,
  AdViewDataLoader,
  AdViewGroup,
  AdViewGroupItem,
} from 'typings';
import { RandomAdItems } from './getCollectPageData';

type FetcherDataPrepareResponse = (data: any) => AdViewData | Error;

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

  constructor(
    srcURL: string,
    defaultData?: AdViewGroupItem[],
    timeout?: number,
    dataPreparer?: FetcherDataPrepareResponse,
  ) {
    this.srcURL = srcURL;
    this.defaultData = defaultData;
    if (timeout !== undefined) {
      this.timeout = timeout > 0 ? timeout : 5000;
    }
    this.dataPreparer = dataPreparer;
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

    try {
      // Fetch ad data from the server
      const response = await fetch(targetURL, {
        signal: AbortSignal.timeout(this.timeout),
        headers: {
          'X-Page-Path': window?.location?.pathname || '',
          'X-Page-Domain': window?.location?.hostname || '',
        },
      });
      // Check if the HTTP response was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AdViewData = { version: '0' };

      // Parse JSON response
      const responseJson = await response.json();
      if (!responseJson || typeof responseJson !== 'object') {
        return {
          version: '',
          groups: [
            { id: unitId, items: this.defaultRandomAdItems(limit, format) },
          ],
        } as AdViewData;
      }

      // Prepare and validate data
      const preparedData = this.prepareData(responseJson);
      if (preparedData instanceof Error) {
        throw preparedData;
      }

      // Populate data fields
      data.version = preparedData.version || '0';
      data.custom_tracker = preparedData.custom_tracker;
      data.groups = preparedData.groups || [];

      // Merge default data if necessary
      const adGroups = (data.groups || []) as AdViewGroup[];
      const currentGroup = adGroups.find(g => g.id === unitId);

      if (currentGroup == null) {
        data.groups?.push({
          id: unitId,
          items: this.defaultRandomAdItems(limit, format),
        });
      } else if (limit > currentGroup.items?.length) {
        currentGroup?.items?.push(
          ...this.defaultRandomAdItems(
            limit - currentGroup.items.length,
            format,
          ),
        );
      }

      return data;
    } catch (error) {
      if (!!this.defaultData && this.defaultData.length > 0) {
        return {
          version: '',
          groups: [
            { id: unitId, items: this.defaultRandomAdItems(limit, format) },
          ],
        } as AdViewData;
      }
      // Re-throw to allow caller to handle the error
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
        url = url.replace(`{<q.${key}>}`, encodeURIComponent(query[key] + ''));
        url = url.replace(
          `{<query.${key}>}`,
          encodeURIComponent(query[key] + ''),
        );
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
