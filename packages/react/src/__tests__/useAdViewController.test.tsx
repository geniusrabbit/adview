import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { getDataLoaderFromConfig, getResolveConfig } from '@adview/core/utils';

import { AdViewProviderContext } from '../AdViewUnit/AdViewProvider';
import useAdViewController from '../AdViewUnit/useAdViewController';

jest.mock('@adview/core/utils', () => ({
  getDataLoaderFromConfig: jest.fn(),
  getResolveConfig: jest.fn(),
}));

describe('useAdViewController', () => {
  const fetchAdData = jest.fn();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AdViewProviderContext.Provider value={{ srcURL: 'global-src' }}>
      {children}
    </AdViewProviderContext.Provider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    (getResolveConfig as jest.Mock).mockImplementation(config => config);
    (getDataLoaderFromConfig as jest.Mock).mockReturnValue({ fetchAdData });
  });

  it('merges unit config over provider (unit wins)', async () => {
    const response = { version: '1.0.0', groups: [] };
    fetchAdData.mockResolvedValue(response);

    const { result } = renderHook(
      () =>
        useAdViewController({ srcURL: 'unit-src' }, 'unit-1', 2, 'banner', {}),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current[2].isComplete).toBe(true);
    });

    expect(getResolveConfig).toHaveBeenCalledWith({ srcURL: 'unit-src' });
    expect(getDataLoaderFromConfig).toHaveBeenCalledWith(
      { srcURL: 'unit-src' },
      undefined,
    );
    expect(fetchAdData).toHaveBeenCalledWith('unit-1', 2, 'banner', {});
    expect(result.current[0]).toEqual(response);
    expect(result.current[1]).toBeNull();
    expect(result.current[2].isError).toBe(false);
  });

  it('passes source filters to getDataLoaderFromConfig', async () => {
    fetchAdData.mockResolvedValue({ version: '1', groups: [] });
    const filters = {
      sources: ['primary'],
      tags: ['sidebar'],
      drivers: ['dynamic'],
    };

    renderHook(
      () =>
        useAdViewController(
          { srcURL: 'unit-src' },
          'unit-1',
          1,
          'banner',
          {},
          filters,
        ),
      { wrapper },
    );

    await waitFor(() => {
      expect(getDataLoaderFromConfig).toHaveBeenCalledWith(
        expect.anything(),
        filters,
      );
    });
  });

  it('returns error when data loader resolves Error instance', async () => {
    const responseError = new Error('resolved error');
    fetchAdData.mockResolvedValue(responseError);

    const { result } = renderHook(() =>
      useAdViewController({ srcURL: 'unit-src' }, 'unit-2', 1, undefined, {}),
    );

    await waitFor(() => {
      expect(result.current[2].isComplete).toBe(true);
    });

    expect(fetchAdData).toHaveBeenCalledWith('unit-2', 1, undefined, {});
    expect(result.current[0]).toBeNull();
    expect(result.current[1]).toBe(responseError);
    expect(result.current[2].isError).toBe(true);
  });

  it('keeps isError true when data loader throws', async () => {
    const thrownError = new Error('thrown error');
    fetchAdData.mockRejectedValue(thrownError);

    const { result } = renderHook(() =>
      useAdViewController({ srcURL: 'unit-src' }, 'unit-3', 0, 'native', {}),
    );

    await waitFor(() => {
      expect(result.current[2].isComplete).toBe(true);
    });

    expect(fetchAdData).toHaveBeenCalledWith('unit-3', 1, 'native', {});
    expect(result.current[0]).toBeNull();
    expect(result.current[1]).toBe(thrownError);
    expect(result.current[2].isError).toBe(true);
  });

  it('reloads when filters change', async () => {
    fetchAdData.mockResolvedValue({ version: '1', groups: [] });

    const { rerender } = renderHook(
      ({ tags }: { tags?: string[] }) =>
        useAdViewController({ srcURL: 'unit-src' }, 'unit-1', 1, 'banner', {}, {
          tags,
        }),
      {
        wrapper,
        initialProps: { tags: ['sidebar'] as string[] | undefined },
      },
    );

    await waitFor(() => {
      expect(fetchAdData).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      rerender({ tags: ['bottom'] });
    });

    await waitFor(() => {
      expect(fetchAdData).toHaveBeenCalledTimes(2);
    });
  });
});
