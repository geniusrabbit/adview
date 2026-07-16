import { AdViewData } from '../typings';
import SmartDataLoader from '../utils/smartDataLoader';
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
});
