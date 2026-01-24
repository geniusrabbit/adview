'use client';

import { AdViewData, AdViewDataLoader } from '@adview/core/typings';
import { getDataLoaderFromConfig, getResolveConfig } from '@adview/core/utils';
import { useContext, useEffect, useState } from 'react';
import { AdLoadState, AdViewConfig } from '../types';
import { AdViewProviderContext } from './AdViewProvider';

type UseAdViewControllerProps = [AdViewData | null, Error | null, AdLoadState];

function useAdViewController(
  adUnitConfig: AdViewConfig,
  unitId: string,
  limit: number = 1,
  format?: string | string[],
): UseAdViewControllerProps {
  const [adLoadState, setAdLoadState] = useState<string>('initial');
  const [adData, setAdData] = useState<AdViewData | null>(null);
  const [errorMessage, setErrorMessage] = useState<Error | null>(null);
  const globalConfig = useContext(AdViewProviderContext);
  const baseConfig = getResolveConfig({ ...adUnitConfig, ...globalConfig });
  const dataLoader: AdViewDataLoader = getDataLoaderFromConfig(baseConfig);

  const loadAd = async () => {
    setAdLoadState('loading');

    try {
      const response = await dataLoader.fetchAdData(
        unitId,
        limit,
        format || '',
      );

      if (response instanceof Error) {
        setAdLoadState('error');
        setErrorMessage(response);
      } else {
        setAdData(response);
      }
      setAdLoadState('complete');
    } catch (error) {
      setAdLoadState('error');
      setAdLoadState('complete');
      setErrorMessage(error as Error);
    }
  };

  const loadState = {
    isInitial: adLoadState === 'initial',
    isLoading: adLoadState === 'loading',
    isComplete: adLoadState === 'complete',
    isError: adLoadState === 'error',
  };

  useEffect(() => {
    loadAd();
  }, [unitId, limit, format]);

  return [adData, errorMessage, loadState];
}

export default useAdViewController;
