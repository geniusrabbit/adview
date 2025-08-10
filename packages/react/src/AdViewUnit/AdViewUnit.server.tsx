import React from 'react';

import { AdViewGroupItem } from '@adview/core/typings';
import { adViewFetcher, getAdRequestUrl, getResolveConfig } from '@adview/core/utils';
import { AdViewUnitPropsBase, AdViewUnitServerChildren } from '../types';
import { renderAnyTemplates } from './AdViewUnitTemplate';
import AdViewUnitTracking from './AdViewUnitTracking';

export type AdViewUnitServerProps = AdViewUnitPropsBase & {
  children?: AdViewUnitServerChildren;
};

async function AdViewUnitServer({
  unitId,
  format,
  children,
  ...config
}: AdViewUnitServerProps) {
  const baseConfig = getResolveConfig(config);
  const requestUrl = getAdRequestUrl(baseConfig, unitId, format);
  const response = await adViewFetcher(requestUrl);
  const isLoadingError = response instanceof Error;
  const error = isLoadingError ? response : undefined;
  const responseGroup =
    response instanceof Error ? null : response?.groups?.[0];
  const customTracker = responseGroup?.custom_tracker ?? {};
  const groupItems = responseGroup?.items;

  if (groupItems && groupItems.length) {
    return groupItems.map(({ tracker, ...data }: AdViewGroupItem) => {
      return (
        <AdViewUnitTracking key={data.id} {...tracker}>
          {renderAnyTemplates(children, {data, type: data.type || 'default', error, state: {
            isLoading: true,
            isComplete: true,
            isInitial: false,
            isError: isLoadingError,
          }})}
        </AdViewUnitTracking>
      );
    });
  }

  return (
    <AdViewUnitTracking {...customTracker}>
      {renderAnyTemplates(children, {data: null, type: 'default', error, state: {
        isLoading: true,
        isComplete: true,
        isInitial: false,
        isError: isLoadingError,
      }})}
    </AdViewUnitTracking>
  );
}

export default AdViewUnitServer;
