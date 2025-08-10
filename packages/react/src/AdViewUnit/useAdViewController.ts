'use client';

import { AdViewData } from '@adview/core/typings';
import { adViewFetcher, getAdRequestUrl, getResolveConfig } from '@adview/core/utils';
import { useContext, useEffect, useState } from 'react';
import { AdLoadState, AdViewConfig } from '../types';
import { AdViewProviderContext } from './AdViewProvider';

type UseAdViewControllerProps = [AdViewData | null, Error | null, AdLoadState];

function useAdViewController(
  adUnitConfig: AdViewConfig,
  unitId: string,
  format?: string | string[],
): UseAdViewControllerProps {
  const [adLoadState, setAdLoadState] = useState<string>('initial');
  const [adData, setAdData] = useState<AdViewData | null>(null);
  const [errorMessage, setErrorMessage] = useState<Error | null>(null);
  const globalConfig = useContext(AdViewProviderContext);
  const baseConfig = getResolveConfig({ ...adUnitConfig, ...globalConfig });
  const requestUrl = getAdRequestUrl(baseConfig, unitId,
    typeof format === 'string' ? format : format?.join(',') || '');

  const loadAd = async () => {
    setAdLoadState('loading');

    try {
      console.log('Requesting ad data from:', adViewFetcher, 'with URL:', requestUrl);
      const response = await adViewFetcher(requestUrl, baseConfig.defaultAdData);
      console.log('AdViewController response:', response);

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

  useEffect(() => {loadAd()}, []);

  return [adData, errorMessage, loadState];
}

export default useAdViewController;
