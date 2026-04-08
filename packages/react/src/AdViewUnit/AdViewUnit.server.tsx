import React from 'react';

import { AdViewData, AdViewDataLoader } from '@adview/core';
import { AdViewGroupItem } from '@adview/core/typings';
import { getDataLoaderFromConfig, getResolveConfig } from '@adview/core/utils';
import { AdViewUnitClientChildren, AdViewUnitPropsBase } from '../types';
import AdViewUnitBannerTemplate from './AdViewUnitBannerTemplate';
import AdViewUnitNativeTemplate from './AdViewUnitNativeTemplate';
import AdViewUnitProxyTemplate from './AdViewUnitProxyTemplate';
import { renderAnyTemplates } from './AdViewUnitTemplate';
import AdViewUnitTracking from './AdViewUnitTracking';

export type AdViewUnitServerProps = AdViewUnitPropsBase & {
  children?: AdViewUnitClientChildren;
  wrapper?: (elms: React.ReactNode[]) => React.ReactNode;
  trackingWrapperClassName?: string;
  sources?: string[];
};

async function AdViewUnitServer({
  unitId,
  format,
  children,
  limit,
  query,
  wrapper,
  trackingWrapperClassName,
  sources,
  ...config
}: AdViewUnitServerProps) {
  const checkFormat = (f: string) => {
    if (!format) {
      return true;
    }
    return Array.isArray(format) ? format.includes(f) : f === format;
  };

  const baseConfig = getResolveConfig(config);
  const dataLoader: AdViewDataLoader = getDataLoaderFromConfig(
    baseConfig,
    sources,
  );
  const response = await dataLoader.fetchAdData(
    unitId,
    limit || 1,
    format,
    query,
  );
  const isLoadingError = response instanceof Error;
  const error = isLoadingError ? response : undefined;
  const state = {
    isLoading: true,
    isComplete: true,
    isInitial: false,
    isError: isLoadingError,
  };

  const {
    responseGroup: _,
    customTracker,
    groupItems,
  } = error
    ? { responseGroup: null, customTracker: {}, groupItems: [] }
    : (() => {
        for (let responseGroup of (response as AdViewData)?.groups || []) {
          const customTracker = responseGroup?.custom_tracker ?? {};
          const groupItems = (responseGroup?.items || [])
            .map(it => (checkFormat(it.type) ? it : null))
            .filter(Boolean) as AdViewGroupItem[];
          if (groupItems && groupItems.length > 0) {
            return { responseGroup, customTracker, groupItems };
          }
        }
        return { responseGroup: null, customTracker: {}, groupItems: [] };
      })();

  if (!children) {
    children = [
      <AdViewUnitBannerTemplate />,
      <AdViewUnitNativeTemplate />,
      <AdViewUnitProxyTemplate />,
    ];
  }

  if (!wrapper) {
    wrapper = (elms: React.ReactNode[]) => <>{elms}</>;
  }

  if (groupItems && groupItems.length) {
    return wrapper(
      groupItems.map(({ tracker, ...data }: AdViewGroupItem, index: number) => {
        return (
          <AdViewUnitTracking
            key={data.id}
            {...tracker}
            className={trackingWrapperClassName}
          >
            {renderAnyTemplates(children, {
              unitId,
              index,
              data,
              type: data.type || 'default',
              error,
              state: state,
            })}
          </AdViewUnitTracking>
        );
      }),
    );
  }

  return wrapper([
    <AdViewUnitTracking {...customTracker} className={trackingWrapperClassName}>
      {renderAnyTemplates(children, {
        unitId,
        index: -1,
        data: null,
        type: 'default',
        error,
        state: state,
      })}
    </AdViewUnitTracking>,
  ]);
}

export default AdViewUnitServer;
