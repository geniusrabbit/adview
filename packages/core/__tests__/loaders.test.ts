import { AdViewData } from '../typings';
import DynamicFetcherDataLoader from '../utils/dynamicFetcherDataLoader';
import FuncDataLoader from '../utils/funcDataLoader';
import HardDataLoader from '../utils/hardDataLoader';
import { makeAdItem } from './helpers';

describe('HardDataLoader', () => {
  it('returns fixed items via positional constructor', async () => {
    const items = [
      makeAdItem({ id: '1', type: 'banner' }),
      makeAdItem({ id: '2', type: 'native' }),
    ];
    const loader = new HardDataLoader('1.0', undefined, items);
    const data = (await loader.fetchAdData('unit', 1, 'banner')) as AdViewData;

    expect(data.version).toBe('1.0');
    expect(data.groups?.[0]?.id).toBe('unit');
    expect(data.groups?.[0]?.items).toHaveLength(1);
    expect(data.groups?.[0]?.items[0]?.type).toBe('banner');
  });

  it('accepts AdViewSourceItem constructor shape', async () => {
    const loader = new HardDataLoader({
      name: 'static',
      driver: 'static',
      params: {
        version: '2',
        defaultData: [makeAdItem({ id: 's', type: 'banner' })],
      },
    });

    const data = (await loader.fetchAdData('u', 1)) as AdViewData;
    expect(data.version).toBe('2');
    expect(data.groups?.[0]?.items[0]?.id).toBe('s');
  });
});

describe('FuncDataLoader', () => {
  it('delegates to provided function', async () => {
    const fn = jest.fn(async (unitId: string, limit: number) => ({
      version: 'fn',
      groups: [
        {
          id: unitId,
          items: [makeAdItem({ id: `f-${limit}`, type: 'banner' })],
        },
      ],
    }));

    const loader = new FuncDataLoader(fn);
    const data = (await loader.fetchAdData('u1', 3, 'banner', { q: 1 })) as AdViewData;

    expect(fn).toHaveBeenCalledWith('u1', 3, 'banner', { q: 1 });
    expect(data.groups?.[0]?.items[0]?.id).toBe('f-3');
  });

  it('accepts AdViewSourceItem constructor shape', async () => {
    const loader = new FuncDataLoader({
      name: 'fn',
      driver: 'function',
      params: {
        fetchAdData: async (unitId: string) =>
          ({
            version: 'from-source',
            groups: [
              {
                id: unitId,
                items: [makeAdItem({ id: 'x', type: 'native' })],
              },
            ],
          }) as AdViewData,
      },
    });

    const data = (await loader.fetchAdData('u')) as AdViewData;
    expect(data.version).toBe('from-source');
  });
});

describe('DynamicFetcherDataLoader', () => {
  const originalFetch = global.fetch;
  const originalLocation = (globalThis as { location?: unknown }).location;

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalLocation === undefined) {
      // @ts-expect-error test cleanup
      delete (globalThis as { location?: unknown }).location;
    } else {
      (globalThis as { location: unknown }).location = originalLocation;
    }
  });

  beforeEach(() => {
    (globalThis as { location: unknown }).location = {
      pathname: '/page',
      host: 'example.com',
      hostname: 'example.com',
    };
  });

  it('fetches and returns prepared ad data', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        version: '3',
        groups: [
          {
            id: 'unit-1',
            items: [makeAdItem({ id: 'remote', type: 'banner' })],
          },
        ],
      }),
    });

    const loader = new DynamicFetcherDataLoader(
      'https://ads.example.com/{<id>}?limit={<limit>}',
    );
    const data = (await loader.fetchAdData('unit-1', 1, 'banner')) as AdViewData;

    expect(global.fetch).toHaveBeenCalled();
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('unit-1');
    expect(data.version).toBe('3');
    expect(data.groups?.[0]?.items[0]?.id).toBe('remote');
  });

  it('falls back to defaultData when fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network'));

    const loader = new DynamicFetcherDataLoader({
      name: 'dyn',
      driver: 'dynamic',
      params: {
        url: 'https://ads.example.com/{<id>}',
        defaultData: [makeAdItem({ id: 'fallback', type: 'banner' })],
      },
    });

    const data = (await loader.fetchAdData('unit-1', 1, 'banner')) as AdViewData;
    expect(data.groups?.[0]?.items[0]?.id).toBe('fallback');
  });

  it('appends unmatched query params to the URL', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        version: '1',
        groups: [{ id: 'u', items: [makeAdItem({ id: '1', type: 'banner' })] }],
      }),
    });

    const loader = new DynamicFetcherDataLoader(
      'https://ads.example.com/{<id>}',
    );
    await loader.fetchAdData('u', 1, 'banner', { foo: 'bar' });

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('foo=bar');
  });

  it('does not pad with defaults when fillWithDefaults is false', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        version: '1',
        groups: [{ id: 'unit-1', items: [] }],
      }),
    });

    const loader = new DynamicFetcherDataLoader({
      name: 'dyn',
      driver: 'dynamic',
      params: {
        url: 'https://ads.example.com/{<id>}',
        fillWithDefaults: false,
        defaultData: [makeAdItem({ id: 'fallback', type: 'banner' })],
      },
    });

    const data = (await loader.fetchAdData('unit-1', 2, 'banner')) as AdViewData;
    expect(data.groups?.[0]?.items).toHaveLength(0);
  });

  it('returns Error on failure when fillWithDefaults is false', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network'));

    const loader = new DynamicFetcherDataLoader({
      name: 'dyn',
      driver: 'dynamic',
      params: {
        url: 'https://ads.example.com/{<id>}',
        fillWithDefaults: false,
        defaultData: [makeAdItem({ id: 'fallback', type: 'banner' })],
      },
    });

    const result = await loader.fetchAdData('unit-1', 1, 'banner');
    expect(result).toBeInstanceOf(Error);
  });

  it('uses SSR-safe location headers without referencing window', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        version: '1',
        groups: [{ id: 'u', items: [makeAdItem({ id: '1', type: 'banner' })] }],
      }),
    });

    const loader = new DynamicFetcherDataLoader(
      'https://ads.example.com/{<id>}',
    );
    await loader.fetchAdData('u', 1);

    const init = (global.fetch as jest.Mock).mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers['X-Page-Path']).toBe('/page');
    expect(headers['X-Page-Domain']).toBe('example.com');
  });
});
