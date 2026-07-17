'use client';

import { AdViewData, AdViewDataLoader } from '@adview/core/typings';
import {
  AdViewSourceFilters,
  getDataLoaderFromConfig,
  getResolveConfig,
} from '@adview/core/utils';
import { useContext, useEffect, useState } from 'react';
import { AdLoadState, AdViewConfig } from '../types';
import { AdViewProviderContext } from './AdViewProvider';

type UseAdViewControllerProps = [AdViewData | null, Error | null, AdLoadState];

function serializeKey(value: unknown): string {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return String(value);
  }
}

function useAdViewController(
  adUnitConfig: AdViewConfig,
  unitId: string,
  limit: number = 1,
  format?: string | string[],
  query?: { [key: string]: any },
  filters?: AdViewSourceFilters,
): UseAdViewControllerProps {
  const [adLoadState, setAdLoadState] = useState<string>('initial');
  const [adData, setAdData] = useState<AdViewData | null>(null);
  const [errorMessage, setErrorMessage] = useState<Error | null>(null);
  const globalConfig = useContext(AdViewProviderContext);
  // Unit config overrides provider
  const baseConfig = getResolveConfig({ ...globalConfig, ...adUnitConfig });
  const dataLoader: AdViewDataLoader = getDataLoaderFromConfig(
    baseConfig,
    filters,
  );

  const formatKey = serializeKey(format);
  const queryKey = serializeKey(query);
  const filtersKey = serializeKey(filters);
  const sourcesKey = serializeKey(
    baseConfig.sources?.map(s => [s.name, s.driver, s.weight, s.tags]),
  );
  const configKey = serializeKey({
    srcURL: baseConfig.srcURL,
    sourceLoader: Boolean(baseConfig.sourceLoader),
    hasSource: Boolean(baseConfig.source),
    defaultAdDataLen: baseConfig.defaultAdData?.length ?? 0,
  });

  useEffect(() => {
    let cancelled = false;
    setAdLoadState('loading');
    setErrorMessage(null);
    setAdData(null);

    const run = async () => {
      try {
        const response = await dataLoader.fetchAdData(
          unitId,
          limit || 1,
          format,
          query,
        );

        if (cancelled) {
          return;
        }

        if (response instanceof Error) {
          setErrorMessage(response);
          setAdData(null);
          setAdLoadState('error');
        } else {
          setErrorMessage(null);
          setAdData(response);
          setAdLoadState('complete');
        }
      } catch (error) {
        if (cancelled) {
          return;
        }
        setErrorMessage(error as Error);
        setAdData(null);
        setAdLoadState('error');
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [unitId, limit, formatKey, queryKey, filtersKey, sourcesKey, configKey]);

  const loadState: AdLoadState = {
    isInitial: adLoadState === 'initial',
    isLoading: adLoadState === 'loading',
    isComplete: adLoadState === 'complete' || adLoadState === 'error',
    isError: errorMessage !== null || adLoadState === 'error',
  };

  return [adData, errorMessage, loadState];
}

export default useAdViewController;
