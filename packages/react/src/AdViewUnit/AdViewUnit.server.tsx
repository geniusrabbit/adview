import React from 'react';

import { adViewFetcher, getAdRequestUrl, getResolveConfig } from '@adview/core/utils';
import { AdViewUnitPropsBase, AdViewUnitServerChildren } from '../types';
import AdViewUnitTracking from './/AdViewUnitTracking';
import AdViewUnitWrapperServer from './AdViewUnitWrapper.server';

export type AdViewUnitServerProps = AdViewUnitPropsBase & {
  children?: AdViewUnitServerChildren;
};

async function AdViewUnitServer({
  unitId,
  format,
  children,
  onDefault = () => null,
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
    return groupItems.map(({ tracker, ...data }) => {
      return (
        <AdViewUnitTracking key={data.id} {...tracker}>
          <AdViewUnitWrapperServer data={data} onDefault={onDefault}>
            {children}
          </AdViewUnitWrapperServer>
        </AdViewUnitTracking>
      );
    });
  }

  return (
    <AdViewUnitTracking {...customTracker}>
      <AdViewUnitWrapperServer data={error} onDefault={onDefault}>
        {children}
      </AdViewUnitWrapperServer>
    </AdViewUnitTracking>
  );
}

export default AdViewUnitServer;
