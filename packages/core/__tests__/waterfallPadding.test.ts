import { AdViewConfig, AdViewData } from '../typings';
import getDataLoaderFromConfig from '../utils/getDataLoaderFromConfig';
import { clearDataLoaderRegistry, makeAdItem } from './helpers';

describe('multi-source waterfall without dynamic padding', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    clearDataLoaderRegistry();
  });

  beforeEach(() => {
    clearDataLoaderRegistry();
  });

  it('lets static backup fill when dynamic returns empty (fillWithDefaults off)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        version: '1',
        groups: [{ id: 'u1', items: [] }],
      }),
    });

    const config: AdViewConfig = {
      sources: [
        {
          name: 'remote',
          driver: 'dynamic',
          weight: 10,
          params: {
            url: 'https://ads.example.com/{<id>}',
            defaultData: [makeAdItem({ id: 'should-not-pad', type: 'banner' })],
          },
        },
        {
          name: 'house',
          driver: 'static',
          weight: 1,
          params: {
            defaultData: [makeAdItem({ id: 'house-1', type: 'banner' })],
          },
        },
      ],
    };

    const loader = getDataLoaderFromConfig(config);
    const data = (await loader.fetchAdData('u1', 1, 'banner')) as AdViewData;

    expect(data.groups?.[0]?.items.map(i => i.id)).toEqual(['house-1']);
  });

  it('continues to static when dynamic fails and fillWithDefaults is off', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('down'));

    const config: AdViewConfig = {
      sources: [
        {
          name: 'remote',
          driver: 'dynamic',
          weight: 10,
          params: {
            url: 'https://ads.example.com/{<id>}',
            defaultData: [makeAdItem({ id: 'pad', type: 'banner' })],
          },
        },
        {
          name: 'house',
          driver: 'static',
          weight: 1,
          params: {
            defaultData: [makeAdItem({ id: 'backup', type: 'banner' })],
          },
        },
      ],
    };

    const loader = getDataLoaderFromConfig(config);
    const data = (await loader.fetchAdData('u1', 1, 'banner')) as AdViewData;

    expect(data.groups?.[0]?.items[0]?.id).toBe('backup');
  });
});
