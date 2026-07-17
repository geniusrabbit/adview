import { makeAdItem } from './helpers';
import {
  dedupeById,
  resolveSourceRef,
  weightedShuffle,
} from '../utils/selectionPlan';

describe('selectionPlan helpers', () => {
  it('resolveSourceRef defaults weight to 1', () => {
    expect(resolveSourceRef('main')).toEqual({ source: 'main', weight: 1 });
    expect(resolveSourceRef({ source: 'a', weight: 90 })).toEqual({
      source: 'a',
      weight: 90,
    });
    expect(resolveSourceRef({ source: 'b' }, 5)).toEqual({
      source: 'b',
      weight: 5,
    });
    expect(resolveSourceRef({ source: 'z', weight: 0 })).toEqual({
      source: 'z',
      weight: 0,
    });
  });

  it('weightedShuffle respects weights with mocked random', () => {
    const items = [
      {
        item: makeAdItem({ id: 'heavy', type: 'banner' }),
        weight: 99,
        source: 'a',
      },
      {
        item: makeAdItem({ id: 'light', type: 'banner' }),
        weight: 1,
        source: 'b',
      },
    ];

    // Always pick first eligible ticket → heavy wins every draw while present
    const random = jest.fn(() => 0);
    const picked = weightedShuffle(items, 2, random);
    expect(picked.map(i => i.id)).toEqual(['heavy', 'light']);
  });

  it('weightedShuffle excludes zero-weight items', () => {
    const picked = weightedShuffle(
      [
        {
          item: makeAdItem({ id: 'skip', type: 'banner' }),
          weight: 0,
          source: 'a',
        },
        {
          item: makeAdItem({ id: 'ok', type: 'banner' }),
          weight: 1,
          source: 'b',
        },
      ],
      2,
    );
    expect(picked.map(i => i.id)).toEqual(['ok']);
  });

  it('dedupeById keeps first occurrence', () => {
    const a = makeAdItem({ id: 'x', type: 'banner', fields: { title: '1' } });
    const b = makeAdItem({ id: 'x', type: 'banner', fields: { title: '2' } });
    const c = makeAdItem({ id: 'y', type: 'banner' });
    expect(dedupeById([a, b, c]).map(i => i.id)).toEqual(['x', 'y']);
    expect(dedupeById([a, b, c])[0]?.fields?.title).toBe('1');
  });
});
