import React from 'react';

import { AdViewData } from '@adview/core';
import { AdViewGroupItem } from '@adview/core/typings';
import { adViewFetcher, getAdRequestUrl, getResolveConfig } from '@adview/core/utils';
import { AdViewUnitClientChildren, AdViewUnitPropsBase } from '../types';
import AdViewUnitBannerTemplate from './AdViewUnitBannerTemplate';
import AdViewUnitNativeTemplate from './AdViewUnitNativeTemplate';
import AdViewUnitProxyTemplate from './AdViewUnitProxyTemplate';
import { renderAnyTemplates } from './AdViewUnitTemplate';
import AdViewUnitTracking from './AdViewUnitTracking';

export type AdViewUnitServerProps = AdViewUnitPropsBase & {
  children?: AdViewUnitClientChildren;
};

async function AdViewUnitServer({
  unitId,
  format,
  children,
  ...config
}: AdViewUnitServerProps) {
  const checkFormat = (f: string) => {
    if (!format) { return true; }
    return Array.isArray(format) ? format.includes(f) : f === format;
  };

  const baseConfig = getResolveConfig(config);
  const requestUrl = getAdRequestUrl(baseConfig, unitId, format);
  const response = await adViewFetcher(requestUrl);
  const isLoadingError = response instanceof Error;
  const error = isLoadingError ? response : undefined;
  const state = {
    isLoading: true,
    isComplete: true,
    isInitial: false,
    isError: isLoadingError,
  };

  const { responseGroup: _, customTracker, groupItems } = error ? {responseGroup: null, customTracker: {}, groupItems: []} : (() => {
    for (let responseGroup of (response as AdViewData)?.groups || []) {
      const customTracker = responseGroup?.custom_tracker ?? {};
      const groupItems = responseGroup?.items.map(it => checkFormat(it.type) ? it : null).
        filter(Boolean) as AdViewGroupItem[];
      if (groupItems && groupItems.length > 0) {
        return {responseGroup, customTracker, groupItems};
      }
    }
    return {responseGroup: null, customTracker: {}, groupItems: []};
  })();
  
  if (!children) {
    children = [
      <AdViewUnitBannerTemplate />,
      <AdViewUnitNativeTemplate />,
      <AdViewUnitProxyTemplate />
    ];
  }

  if (groupItems && groupItems.length) {
    return groupItems.map(({ tracker, ...data }: AdViewGroupItem) => {
      return (
        <AdViewUnitTracking key={data.id} {...tracker}>
          {renderAnyTemplates(children, {data, type: data.type || 'default', error, state: state})}
        </AdViewUnitTracking>
      );
    });
  }

  return (
    <AdViewUnitTracking {...customTracker}>
      {renderAnyTemplates(children, {data: null, type: 'default', error, state: state})}
    </AdViewUnitTracking>
  );
}

export default AdViewUnitServer;
