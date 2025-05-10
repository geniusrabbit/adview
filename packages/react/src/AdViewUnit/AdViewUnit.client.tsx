'use client';

import React from 'react';
import useAdViewController from './useAdViewController';
import { AdViewUnitClientChildren, AdViewUnitPropsBase } from '../types';
import AdViewUnitWrapperClient from './AdViewUnitWrapper.client';
import AdViewUnitTracking from './AdViewUnitTracking';

export type AdViewUnitClientProps = AdViewUnitPropsBase & {
  children?: AdViewUnitClientChildren;
};

function AdViewUnitClient({
  unitId,
  format,
  children,
  onDefault = () => null,
  ...config
}: AdViewUnitClientProps) {
  const [response, error, loadState] = useAdViewController(
    config,
    unitId,
    format,
  );
  const responseGroup = error ? null : response?.groups?.[0];
  const customTracker = responseGroup?.custom_tracker ?? {};
  const groupItems = responseGroup?.items;

  if (groupItems && groupItems?.length) {
    return groupItems.map(({ tracker, ...data }) => {
      return (
        <AdViewUnitTracking key={data.id} {...tracker}>
          <AdViewUnitWrapperClient
            state={loadState}
            error={error}
            data={data}
            onDefault={onDefault}
          >
            {children}
          </AdViewUnitWrapperClient>
        </AdViewUnitTracking>
      );
    });
  }

  return (
    <AdViewUnitTracking {...customTracker}>
      <AdViewUnitWrapperClient
        state={loadState}
        error={error}
        onDefault={onDefault}
      >
        {children}
      </AdViewUnitWrapperClient>
    </AdViewUnitTracking>
  );
}

export default AdViewUnitClient;
