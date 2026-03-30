import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { getDataLoaderFromConfig, getResolveConfig } from '@adview/core/utils';

import { AdViewProviderContext } from '../../../packages/react/src/AdViewUnit/AdViewProvider';
import useAdViewController from '../../../packages/react/src/AdViewUnit/useAdViewController';

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

  it('loads ad data successfully and returns complete state', async () => {
    const response = { version: '1.0.0', groups: [] };
    fetchAdData.mockResolvedValue(response);

    const { result } = renderHook(
      () => useAdViewController({ srcURL: 'unit-src' }, 'unit-1', 2, 'banner'),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current[2].isComplete).toBe(true);
    });

    expect(getResolveConfig).toHaveBeenCalledWith({ srcURL: 'global-src' });
    expect(fetchAdData).toHaveBeenCalledWith('unit-1', 2, 'banner');
    expect(result.current[0]).toEqual(response);
    expect(result.current[1]).toBeNull();
    expect(result.current[2].isError).toBe(false);
  });

  it('returns error when data loader resolves Error instance', async () => {
    const responseError = new Error('resolved error');
    fetchAdData.mockResolvedValue(responseError);

    const { result } = renderHook(() =>
      useAdViewController({ srcURL: 'unit-src' }, 'unit-2'),
    );

    await waitFor(() => {
      expect(result.current[2].isComplete).toBe(true);
    });

    expect(fetchAdData).toHaveBeenCalledWith('unit-2', 1, undefined);
    expect(result.current[0]).toBeNull();
    expect(result.current[1]).toBe(responseError);
  });

  it('returns error when data loader throws', async () => {
    const thrownError = new Error('thrown error');
    fetchAdData.mockRejectedValue(thrownError);

    const { result } = renderHook(() =>
      useAdViewController({ srcURL: 'unit-src' }, 'unit-3', 0, 'native'),
    );

    await waitFor(() => {
      expect(result.current[2].isComplete).toBe(true);
    });

    expect(fetchAdData).toHaveBeenCalledWith('unit-3', 1, 'native');
    expect(result.current[0]).toBeNull();
    expect(result.current[1]).toBe(thrownError);
    expect(result.current[2].isError).toBe(false);
  });
});
