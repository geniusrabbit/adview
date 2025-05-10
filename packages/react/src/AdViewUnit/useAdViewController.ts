'use client';

import { useContext, useEffect, useState } from 'react';
import { AdViewProviderContext } from './AdViewProvider';
import { getAdRequestUrl } from '../../../../utils/getCollectPageData';
import { AdLoadState, AdViewConfig } from '../types';
import adViewFetcher from '../../../../utils/adViewFetcher';
import getResolveConfig from '../../../../utils/getResolveConfig';
import { AdViewData } from '../../../../typings';

type UseAdViewControllerProps = [AdViewData | null, Error | null, AdLoadState];

function useAdViewController(
  adUnitConfig: AdViewConfig,
  unitId: string,
  format?: string,
): UseAdViewControllerProps {
  const [adLoadState, setAdLoadState] = useState<string>('initial');
  const [adData, setAdData] = useState<AdViewData | null>(null);
  const [errorMessage, setErrorMessage] = useState<Error | null>(null);
  const globalConfig = useContext(AdViewProviderContext);
  const baseConfig = getResolveConfig({ ...adUnitConfig, ...globalConfig });
  const requestUrl = getAdRequestUrl(baseConfig, unitId, format);
  const loadAd = async () => {
    setAdLoadState('loading');

    try {
      const response = await adViewFetcher(requestUrl);

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
  }, []);

  return [adData, errorMessage, loadState];
}

export default useAdViewController;
