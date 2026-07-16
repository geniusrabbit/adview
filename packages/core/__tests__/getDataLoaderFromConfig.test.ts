import { AdViewConfig, AdViewData } from '../typings';
import DynamicFetcherDataLoader from '../utils/dynamicFetcherDataLoader';
import getDataLoaderFromConfig from '../utils/getDataLoaderFromConfig';
import HardDataLoader from '../utils/hardDataLoader';
import SmartDataLoader from '../utils/smartDataLoader';
import {
  clearDataLoaderRegistry,
  makeAdItem,
  makeLoader,
} from './helpers';

describe('getDataLoaderFromConfig', () => {
  beforeEach(() => {
    clearDataLoaderRegistry();
  });

  it('returns explicit config.source when provided', () => {
    const source = makeLoader([makeAdItem({ id: 'x', type: 'banner' })]);
    const config: AdViewConfig = { source, srcURL: 'https://ignored' };
    expect(getDataLoaderFromConfig(config)).toBe(source);
  });

  it('prefers declarative sources over legacy srcURL', () => {
    const config: AdViewConfig = {
      srcURL: 'https://legacy.example/{<id>}',
      sources: [
        {
          name: 'static-src',
          driver: 'static',
          params: {
            defaultData: [makeAdItem({ id: 's1', type: 'banner' })],
          },
        },
      ],
    };

    const loader = getDataLoaderFromConfig(config);
    expect(loader).toBeInstanceOf(HardDataLoader);
    expect(loader).not.toBeInstanceOf(DynamicFetcherDataLoader);
  });

  it('applies filters to declarative sources', async () => {
    const config: AdViewConfig = {
      sources: [
        {
          name: 'a',
          driver: 'static',
          tags: ['sidebar'],
          params: {
            defaultData: [makeAdItem({ id: 'a', type: 'banner' })],
          },
        },
        {
          name: 'b',
          driver: 'static',
          tags: ['bottom'],
          params: {
            defaultData: [makeAdItem({ id: 'b', type: 'banner' })],
          },
        },
      ],
    };

    const loader = getDataLoaderFromConfig(config, {
      tags: ['bottom'],
      sources: ['b'],
    });
    const data = (await loader.fetchAdData('u1', 1)) as AdViewData;
    expect(data.groups?.[0]?.items[0]?.id).toBe('b');
  });

  it('falls back to DynamicFetcherDataLoader for legacy srcURL', () => {
    const config: AdViewConfig = {
      srcURL: 'https://ads.example.com/{<id>}',
    };
    expect(getDataLoaderFromConfig(config)).toBeInstanceOf(
      DynamicFetcherDataLoader,
    );
  });

  it('falls back to HardDataLoader for legacy defaultAdData', async () => {
    const config: AdViewConfig = {
      defaultAdData: [makeAdItem({ id: 'd1', type: 'native' })],
    };
    const loader = getDataLoaderFromConfig(config);
    expect(loader).toBeInstanceOf(HardDataLoader);

    const data = (await loader.fetchAdData('u1', 1, 'native')) as AdViewData;
    expect(data.groups?.[0]?.items[0]?.id).toBe('d1');
  });

  it('builds SmartDataLoader from array sourceLoader', () => {
    const config: AdViewConfig = {
      sourceLoader: [
        'https://a.example/{<id>}',
        [makeAdItem({ id: 's', type: 'banner' })],
      ],
    };
    expect(getDataLoaderFromConfig(config)).toBeInstanceOf(SmartDataLoader);
  });

  it('does not mutate config.source when resolving declarative sources', () => {
    const config: AdViewConfig = {
      sources: [
        {
          name: 'a',
          driver: 'static',
          params: {
            defaultData: [makeAdItem({ id: 'a', type: 'banner' })],
          },
        },
      ],
    };

    getDataLoaderFromConfig(config);
    expect(config.source).toBeUndefined();
  });

  it('rebuilds loaders per filters on the same config object', async () => {
    const config: AdViewConfig = {
      sources: [
        {
          name: 'a',
          driver: 'static',
          tags: ['sidebar'],
          params: {
            defaultData: [makeAdItem({ id: 'a', type: 'banner' })],
          },
        },
        {
          name: 'b',
          driver: 'static',
          tags: ['bottom'],
          params: {
            defaultData: [makeAdItem({ id: 'b', type: 'banner' })],
          },
        },
      ],
    };

    const sidebar = getDataLoaderFromConfig(config, { tags: ['sidebar'] });
    const bottom = getDataLoaderFromConfig(config, { tags: ['bottom'] });

    const sideData = (await sidebar.fetchAdData('u1', 1)) as AdViewData;
    const bottomData = (await bottom.fetchAdData('u1', 1)) as AdViewData;

    expect(sideData.groups?.[0]?.items[0]?.id).toBe('a');
    expect(bottomData.groups?.[0]?.items[0]?.id).toBe('b');
  });
});
