import { AdViewData, AdViewDataLoader } from 'typings';

export type FuncDataLoaderType = (
  unitId: string,
  limit: number,
  format?: string | string[],
  query?: { [key: string]: any },
) => Promise<AdViewData | Error>;

/**
 * FuncDataLoader is an implementation of AdViewDataLoader that
 * uses a provided function to fetch ad data.
 * This allows for maximum flexibility in how ad data is retrieved.
 */
class FuncDataLoader implements AdViewDataLoader {
  fetchAdDataFnk: FuncDataLoaderType;

  constructor(fetchAdData: FuncDataLoaderType) {
    this.fetchAdDataFnk = fetchAdData;
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
    return this.fetchAdDataFnk(unitId, limit, format, query);
  }
}

export default FuncDataLoader;
