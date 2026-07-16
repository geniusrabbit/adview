import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { AdViewProviderContext } from '../../../packages/react/src/AdViewUnit/AdViewProvider';
import useAdViewController from '../../../packages/react/src/AdViewUnit/useAdViewController';

/**
 * Integration-style hook test against real @adview/core loaders
 * (unit tests with mocks live in packages/react).
 */
describe('useAdViewController (integration)', () => {
  const wrapper =
    (sources: Parameters<typeof AdViewProviderContext.Provider>[0]['value']) =>
    ({ children }: { children: React.ReactNode }) => (
      <AdViewProviderContext.Provider value={sources}>
        {children}
      </AdViewProviderContext.Provider>
    );

  it('loads ads from Provider sources end-to-end', async () => {
    const { result } = renderHook(
      () => useAdViewController({}, 'unit-1', 1, 'banner'),
      {
        wrapper: wrapper({
          sources: [
            {
              name: 'static',
              driver: 'static',
              params: {
                defaultData: [
                  {
                    id: 'ad-1',
                    type: 'banner',
                    fields: { title: 'Hook Ad' },
                  },
                ],
              },
            },
          ],
        }),
      },
    );

    await waitFor(() => {
      expect(result.current[2].isComplete).toBe(true);
    });

    expect(result.current[1]).toBeNull();
    expect(result.current[0]?.groups?.[0]?.items[0]?.fields?.title).toBe(
      'Hook Ad',
    );
  });

  it('applies filters when resolving sources', async () => {
    const { result } = renderHook(
      () =>
        useAdViewController({}, 'unit-1', 1, 'banner', undefined, {
          tags: ['bottom'],
          sources: ['b'],
        }),
      {
        wrapper: wrapper({
          sources: [
            {
              name: 'a',
              driver: 'static',
              tags: ['sidebar'],
              params: {
                defaultData: [
                  { id: 'a', type: 'banner', fields: { title: 'A' } },
                ],
              },
            },
            {
              name: 'b',
              driver: 'static',
              tags: ['bottom'],
              params: {
                defaultData: [
                  { id: 'b', type: 'banner', fields: { title: 'B' } },
                ],
              },
            },
          ],
        }),
      },
    );

    await waitFor(() => {
      expect(result.current[2].isComplete).toBe(true);
    });

    expect(result.current[0]?.groups?.[0]?.items[0]?.id).toBe('b');
  });
});
