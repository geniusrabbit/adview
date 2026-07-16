import { AdViewData, AdViewDataLoader, AdViewSourceItem } from '../typings';
import {
  findDataLoaderForSource,
  getRegisteredDataLoaders,
  registerDataLoader,
} from '../utils/dataLoaderRegistry';
import DynamicFetcherDataLoader from '../utils/dynamicFetcherDataLoader';
import HardDataLoader from '../utils/hardDataLoader';
import { clearDataLoaderRegistry, makeAdItem } from './helpers';

describe('dataLoaderRegistry', () => {
  beforeEach(() => {
    clearDataLoaderRegistry();
  });

  it('resolves built-in dynamic driver without registration', () => {
    const loader = findDataLoaderForSource({
      name: 'primary',
      driver: 'dynamic',
      params: { url: 'https://ads.example.com/{<id>}' },
    });

    expect(loader).toBeInstanceOf(DynamicFetcherDataLoader);
    expect((loader as DynamicFetcherDataLoader).srcURL).toBe(
      'https://ads.example.com/{<id>}',
    );
  });

  it('resolves built-in static driver without registration', () => {
    const items = [makeAdItem({ id: 'a1', type: 'banner' })];
    const loader = findDataLoaderForSource({
      name: 'fallback',
      driver: 'static',
      params: { defaultData: items },
    });

    expect(loader).toBeInstanceOf(HardDataLoader);
  });

  it('returns undefined for unknown driver', () => {
    expect(
      findDataLoaderForSource({ name: 'x', driver: 'unknown-driver' }),
    ).toBeUndefined();
  });

  it('registers a custom driver and instantiates it from source', async () => {
    class CustomDriver implements AdViewDataLoader {
      constructor(public source: AdViewSourceItem) {}
      async fetchAdData(unitId: string): Promise<AdViewData> {
        return {
          version: 'custom',
          groups: [
            {
              id: unitId,
              items: [makeAdItem({ id: 'c1', type: 'native' })],
            },
          ],
        };
      }
    }

    registerDataLoader('custom', CustomDriver);

    const loader = findDataLoaderForSource({
      name: 'mine',
      driver: 'custom',
      params: { foo: 1 },
    });

    expect(loader).toBeInstanceOf(CustomDriver);
    expect(getRegisteredDataLoaders().map(i => i.driverName)).toContain(
      'custom',
    );

    const data = await loader!.fetchAdData('unit-1', 1);
    expect(data).not.toBeInstanceOf(Error);
    expect((data as AdViewData).version).toBe('custom');
  });

  it('ignores duplicate registerDataLoader for the same name', () => {
    class First implements AdViewDataLoader {
      constructor(_source: AdViewSourceItem) {}
      async fetchAdData(): Promise<AdViewData> {
        return { version: 'first' };
      }
    }
    class Second implements AdViewDataLoader {
      constructor(_source: AdViewSourceItem) {}
      async fetchAdData(): Promise<AdViewData> {
        return { version: 'second' };
      }
    }

    registerDataLoader('once', First);
    registerDataLoader('once', Second);

    const loader = findDataLoaderForSource({ name: 'a', driver: 'once' });
    expect(loader).toBeInstanceOf(First);
    expect(getRegisteredDataLoaders().filter(i => i.driverName === 'once')).toHaveLength(
      1,
    );
  });

  it('applies optional matcher from registerDataLoader', () => {
    class MatchedDriver implements AdViewDataLoader {
      constructor(_source: AdViewSourceItem) {}
      async fetchAdData(): Promise<AdViewData> {
        return { version: 'matched' };
      }
    }

    registerDataLoader(
      'gated',
      MatchedDriver,
      source => source.params?.enabled === true,
    );

    expect(
      findDataLoaderForSource({
        name: 'off',
        driver: 'gated',
        params: { enabled: false },
      }),
    ).toBeUndefined();

    expect(
      findDataLoaderForSource({
        name: 'on',
        driver: 'gated',
        params: { enabled: true },
      }),
    ).toBeInstanceOf(MatchedDriver);
  });

  it('applies static matchDriver on the driver class', () => {
    class SelfMatchingDriver implements AdViewDataLoader {
      static matchDriver(source: AdViewSourceItem) {
        return source.params?.region === 'eu';
      }
      constructor(_source: AdViewSourceItem) {}
      async fetchAdData(): Promise<AdViewData> {
        return { version: 'eu' };
      }
    }

    registerDataLoader('self', SelfMatchingDriver);

    expect(
      findDataLoaderForSource({
        name: 'us',
        driver: 'self',
        params: { region: 'us' },
      }),
    ).toBeUndefined();

    expect(
      findDataLoaderForSource({
        name: 'eu',
        driver: 'self',
        params: { region: 'eu' },
      }),
    ).toBeInstanceOf(SelfMatchingDriver);
  });

  it('lets a registered driver override a built-in name', () => {
    class OverrideDynamic implements AdViewDataLoader {
      constructor(_source: AdViewSourceItem) {}
      async fetchAdData(): Promise<AdViewData> {
        return { version: 'override' };
      }
    }

    registerDataLoader('dynamic', OverrideDynamic);

    const loader = findDataLoaderForSource({
      name: 'primary',
      driver: 'dynamic',
      params: { url: 'https://ignored.example' },
    });

    expect(loader).toBeInstanceOf(OverrideDynamic);
    expect(loader).not.toBeInstanceOf(DynamicFetcherDataLoader);
  });
});
