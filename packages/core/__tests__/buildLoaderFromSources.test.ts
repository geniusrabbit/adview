import { AdViewData, AdViewSourceItem } from '../typings';
import buildLoaderFromSources from '../utils/buildLoaderFromSources';
import HardDataLoader from '../utils/hardDataLoader';
import SmartDataLoader from '../utils/smartDataLoader';
import { clearDataLoaderRegistry, makeAdItem } from './helpers';

const bannerA = makeAdItem({ id: 'a', type: 'banner' });
const bannerB = makeAdItem({ id: 'b', type: 'banner' });
const nativeC = makeAdItem({ id: 'c', type: 'native' });

function sourcesFixture(): AdViewSourceItem[] {
  return [
    {
      name: 'primary',
      driver: 'static',
      weight: 1,
      tags: ['sidebar'],
      params: { defaultData: [bannerA] },
    },
    {
      name: 'secondary',
      driver: 'static',
      weight: 10,
      tags: ['bottom', 'sidebar'],
      params: { defaultData: [bannerB] },
    },
    {
      name: 'native-src',
      driver: 'static',
      weight: 5,
      tags: ['bottom'],
      params: { defaultData: [nativeC] },
    },
  ];
}

describe('buildLoaderFromSources', () => {
  beforeEach(() => {
    clearDataLoaderRegistry();
  });

  it('returns undefined for empty input', () => {
    expect(buildLoaderFromSources([])).toBeUndefined();
  });

  it('returns a single loader when one source matches', () => {
    const loader = buildLoaderFromSources([sourcesFixture()[0]!]);
    expect(loader).toBeInstanceOf(HardDataLoader);
  });

  it('wraps multiple sources in SmartDataLoader', () => {
    const loader = buildLoaderFromSources(sourcesFixture());
    expect(loader).toBeInstanceOf(SmartDataLoader);
  });

  it('filters by drivers', async () => {
    const withFn: AdViewSourceItem[] = [
      ...sourcesFixture(),
      {
        name: 'fn',
        driver: 'function',
        params: {
          fetchAdData: async (unitId: string) =>
            ({
              version: 'fn',
              groups: [
                {
                  id: unitId,
                  items: [makeAdItem({ id: 'fn1', type: 'banner' })],
                },
              ],
            }) as AdViewData,
        },
      },
    ];

    const loader = buildLoaderFromSources(withFn, { drivers: ['function'] });
    expect(loader).not.toBeInstanceOf(SmartDataLoader);

    const data = await loader!.fetchAdData('u1', 1);
    expect((data as AdViewData).version).toBe('fn');
  });

  it('filters by tags (intersection)', async () => {
    const loader = buildLoaderFromSources(sourcesFixture(), {
      tags: ['bottom'],
    });
    expect(loader).toBeInstanceOf(SmartDataLoader);

    const data = (await loader!.fetchAdData('u1', 2)) as AdViewData;
    const ids = data.groups?.[0]?.items.map(i => i.id) || [];
    expect(ids).toEqual(expect.arrayContaining(['b', 'c']));
    expect(ids).not.toContain('a');
  });

  it('filters and reorders by sources names (priority)', async () => {
    const loader = buildLoaderFromSources(sourcesFixture(), {
      sources: ['native-src', 'primary'],
    });

    // Request limit 2 so both sources contribute in name order
    const data = (await loader!.fetchAdData('u1', 2)) as AdViewData;
    const ids = data.groups?.[0]?.items.map(i => i.id) || [];
    expect(ids[0]).toBe('c');
    expect(ids[1]).toBe('a');
  });

  it('orders by weight desc when no sources filter is given', async () => {
    const loader = buildLoaderFromSources([
      {
        name: 'low',
        driver: 'static',
        weight: 1,
        params: { defaultData: [makeAdItem({ id: 'low', type: 'banner' })] },
      },
      {
        name: 'high',
        driver: 'static',
        weight: 100,
        params: { defaultData: [makeAdItem({ id: 'high', type: 'banner' })] },
      },
    ]);

    const data = (await loader!.fetchAdData('u1', 1)) as AdViewData;
    expect(data.groups?.[0]?.items[0]?.id).toBe('high');
  });

  it('drops sources whose driver is not resolvable', () => {
    const loader = buildLoaderFromSources([
      { name: 'bad', driver: 'does-not-exist' },
      {
        name: 'ok',
        driver: 'static',
        params: { defaultData: [bannerA] },
      },
    ]);
    expect(loader).toBeInstanceOf(HardDataLoader);
  });
});
