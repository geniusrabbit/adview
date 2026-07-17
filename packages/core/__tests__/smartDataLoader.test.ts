import { AdViewData } from '../typings';
import SmartDataLoader, { LoaderItem } from '../utils/smartDataLoader';
import {
  makeAdItem,
  makeFailingLoader,
  makeLoader,
} from './helpers';

describe('SmartDataLoader', () => {
  it('returns first loader result when it already satisfies limit', async () => {
    const first = makeLoader([
      makeAdItem({ id: '1', type: 'banner' }),
      makeAdItem({ id: '2', type: 'banner' }),
    ]);
    const second = makeLoader([makeAdItem({ id: '3', type: 'banner' })]);
    const secondSpy = jest.spyOn(second, 'fetchAdData');

    const smart = new SmartDataLoader([first, second], 'roundrobin');
    const data = (await smart.fetchAdData('u', 2, 'banner')) as AdViewData;

    expect(data.groups?.[0]?.items.map(i => i.id)).toEqual(['1', '2']);
    expect(secondSpy).not.toHaveBeenCalled();
  });

  it('waterfalls to the next loader to fill remaining slots', async () => {
    const first = makeLoader([makeAdItem({ id: '1', type: 'banner' })]);
    const second = makeLoader([
      makeAdItem({ id: '2', type: 'banner' }),
      makeAdItem({ id: '3', type: 'banner' }),
    ]);

    const smart = new SmartDataLoader([first, second], 'roundrobin');
    const data = (await smart.fetchAdData('u', 2, 'banner')) as AdViewData;

    expect(data.groups?.[0]?.items.map(i => i.id)).toEqual(['1', '2']);
  });

  it('skips failing loaders and continues with the next', async () => {
    const smart = new SmartDataLoader(
      [
        makeFailingLoader('boom'),
        makeLoader([makeAdItem({ id: 'ok', type: 'banner' })]),
      ],
      'roundrobin',
    );

    const data = (await smart.fetchAdData('u', 1)) as AdViewData;
    expect(data.groups?.[0]?.items[0]?.id).toBe('ok');
  });

  it('returns Error when every loader fails', async () => {
    const smart = new SmartDataLoader(
      [makeFailingLoader('a'), makeFailingLoader('b')],
      'roundrobin',
    );

    const result = await smart.fetchAdData('u', 1);
    expect(result).toBeInstanceOf(Error);
  });

  describe('selection plan', () => {
    const named = (
      name: string,
      items: ReturnType<typeof makeAdItem>[],
      weight?: number,
    ) =>
      new LoaderItem({
        name,
        weight,
        loader: makeLoader(items),
      });

    it('runs strict waterfall and skips later stages when limit is met', async () => {
      const other = named('other', [
        makeAdItem({ id: 'o1', type: 'banner' }),
      ]);
      const otherSpy = jest.spyOn(other.loader, 'fetchAdData');

      const smart = new SmartDataLoader(
        [
          named('main', [
            makeAdItem({ id: 'm1', type: 'banner' }),
            makeAdItem({ id: 'm2', type: 'banner' }),
            makeAdItem({ id: 'm3', type: 'banner' }),
          ]),
          named('second', [makeAdItem({ id: 's1', type: 'banner' })]),
          other,
        ],
        ['main', 'second', 'other'],
      );

      const data = (await smart.fetchAdData('u', 3)) as AdViewData;
      expect(data.groups?.[0]?.items.map(i => i.id)).toEqual([
        'm1',
        'm2',
        'm3',
      ]);
      expect(otherSpy).not.toHaveBeenCalled();
    });

    it('fills from second after partial main (ordered solo stages)', async () => {
      const smart = new SmartDataLoader(
        [
          named('main', [makeAdItem({ id: 'm1', type: 'banner' })]),
          named('second', [
            makeAdItem({ id: 's1', type: 'banner' }),
            makeAdItem({ id: 's2', type: 'banner' }),
          ]),
        ],
        ['main', 'second'],
      );

      const data = (await smart.fetchAdData('u', 3)) as AdViewData;
      expect(data.groups?.[0]?.items.map(i => i.id)).toEqual([
        'm1',
        's1',
        's2',
      ]);
    });

    it('fetches parallel stage sources together after main', async () => {
      const second = named('second', [
        makeAdItem({ id: 's1', type: 'banner' }),
        makeAdItem({ id: 's2', type: 'banner' }),
      ]);
      const other = named('other', [
        makeAdItem({ id: 'o1', type: 'banner' }),
        makeAdItem({ id: 'o2', type: 'banner' }),
      ]);
      const secondSpy = jest.spyOn(second.loader, 'fetchAdData');
      const otherSpy = jest.spyOn(other.loader, 'fetchAdData');

      const smart = new SmartDataLoader(
        [
          named('main', [makeAdItem({ id: 'm1', type: 'banner' })]),
          second,
          other,
        ],
        ['main', ['second', 'other']],
      );

      const data = (await smart.fetchAdData('u', 3)) as AdViewData;
      const ids = data.groups?.[0]?.items.map(i => i.id) || [];

      expect(ids[0]).toBe('m1');
      expect(ids).toHaveLength(3);
      expect(secondSpy).toHaveBeenCalled();
      expect(otherSpy).toHaveBeenCalled();
      // Both remaining slots come from the parallel pool
      expect(ids.slice(1).every(id => id.startsWith('s') || id.startsWith('o'))).toBe(
        true,
      );
    });

    it('skips parallel stage entirely when main already fills limit', async () => {
      const second = named('second', [
        makeAdItem({ id: 's1', type: 'banner' }),
      ]);
      const secondSpy = jest.spyOn(second.loader, 'fetchAdData');

      const smart = new SmartDataLoader(
        [
          named('main', [
            makeAdItem({ id: 'm1', type: 'banner' }),
            makeAdItem({ id: 'm2', type: 'banner' }),
          ]),
          second,
        ],
        ['main', ['second', 'other']],
      );

      await smart.fetchAdData('u', 2);
      expect(secondSpy).not.toHaveBeenCalled();
    });

    it('uses weighted shuffle in multi-source stage (mocked random)', async () => {
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

      const smart = new SmartDataLoader(
        [
          named('main', [
            makeAdItem({ id: 'm1', type: 'banner' }),
            makeAdItem({ id: 'm2', type: 'banner' }),
          ]),
          named('second', [
            makeAdItem({ id: 's1', type: 'banner' }),
            makeAdItem({ id: 's2', type: 'banner' }),
          ]),
        ],
        [[{ source: 'main', weight: 90 }, { source: 'second', weight: 1 }]],
      );

      const data = (await smart.fetchAdData('u', 2)) as AdViewData;
      // random=0 always draws from the heavy side first while present
      expect(data.groups?.[0]?.items.map(i => i.id)).toEqual(['m1', 'm2']);

      randomSpy.mockRestore();
    });

    it('falls back to later solo stage when weighted stage is short', async () => {
      const smart = new SmartDataLoader(
        [
          named('main', [makeAdItem({ id: 'm1', type: 'banner' })]),
          named('second', []),
          named('other', [
            makeAdItem({ id: 'o1', type: 'banner' }),
            makeAdItem({ id: 'o2', type: 'banner' }),
          ]),
        ],
        [
          [
            { source: 'main', weight: 90 },
            { source: 'second', weight: 20 },
          ],
          'other',
        ],
      );

      const data = (await smart.fetchAdData('u', 3)) as AdViewData;
      const ids = data.groups?.[0]?.items.map(i => i.id) || [];
      expect(ids).toContain('m1');
      expect(ids).toEqual(expect.arrayContaining(['m1', 'o1', 'o2']));
      expect(ids).toHaveLength(3);
    });

    it('dedupes by id across stages', async () => {
      const smart = new SmartDataLoader(
        [
          named('main', [makeAdItem({ id: 'dup', type: 'banner' })]),
          named('second', [
            makeAdItem({ id: 'dup', type: 'banner' }),
            makeAdItem({ id: 's2', type: 'banner' }),
          ]),
        ],
        ['main', 'second'],
      );

      const data = (await smart.fetchAdData('u', 2)) as AdViewData;
      expect(data.groups?.[0]?.items.map(i => i.id)).toEqual(['dup', 's2']);
    });

    it('skips unknown source names without throwing', async () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const smart = new SmartDataLoader(
        [named('main', [makeAdItem({ id: 'm1', type: 'banner' })])],
        ['missing', 'main'],
      );

      const data = (await smart.fetchAdData('u', 1)) as AdViewData;
      expect(data.groups?.[0]?.items[0]?.id).toBe('m1');
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });
  });
});
