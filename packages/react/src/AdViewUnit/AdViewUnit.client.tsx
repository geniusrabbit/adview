'use client';

import { AdViewGroupItem } from '@adview/core';
import React from 'react';
import { AdViewUnitClientChildren, AdViewUnitPropsBase } from '../types';
import AdViewUnitBannerTemplate from './AdViewUnitBannerTemplate';
import AdViewUnitNativeTemplate from './AdViewUnitNativeTemplate';
import AdViewUnitProxyTemplate from './AdViewUnitProxyTemplate';
import { renderAnyTemplates } from './AdViewUnitTemplate';
import AdViewUnitTracking from './AdViewUnitTracking';
import useAdViewController from './useAdViewController';

export type AdViewUnitClientProps = AdViewUnitPropsBase & {
  children?: AdViewUnitClientChildren;
  wrapper?: (elms: React.ReactNode[]) => React.ReactNode;
  trackingWrapperClassName?: string;
};

// AdViewUnitClient is a client-side component that fetches ad data and renders it
// using the provided children function. It handles loading, error states, and
// tracks ad interactions.
//
// Example usage:
// <AdView.Unit unitId="my-unit" format="banner" srcURL="https://api.example.com/ads/{<id>}">
//   {({ data, state, error }) => (
//     <div>
//       {state.isLoading && <span>Loading...</span>}
//       {error && <span>Error: {error.message}</span>}
//       {data && <img src={data.imageUrl} alt={data.title} />
//     </div>
//   )}
// </AdView.Unit>
//
// Note: This component is designed to be used in a client-side environment where
// ad data can be fetched dynamically. It is not suitable for server-side rendering.
// It uses the AdViewUnitTracking component to handle ad tracking and interactions.
function AdViewUnitClient({
  unitId,
  limit = 1,
  format,
  query,
  children,
  wrapper,
  trackingWrapperClassName,
  ...config
}: AdViewUnitClientProps) {
  const checkFormat = (f: string) => {
    if (!format) {
      return true;
    }
    return Array.isArray(format) ? format.includes(f) : f === format;
  };

  const [response, error, loadState] = useAdViewController(
    config,
    unitId,
    limit || 1,
    format,
    query,
  );

  const {
    responseGroup: _,
    customTracker,
    groupItems,
  } = error
    ? { responseGroup: null, customTracker: {}, groupItems: [] }
    : (() => {
        for (let responseGroup of response?.groups || []) {
          const customTracker = responseGroup?.custom_tracker ?? {};
          const groupItems = (responseGroup?.items || [])
            .map(it => (checkFormat(it.type) ? it : null))
            .filter(Boolean);
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

  if (groupItems && groupItems?.length > 0) {
    return wrapper(
      (groupItems as AdViewGroupItem[]).map(({ tracker, ...data }, index) => {
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
              state: loadState,
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
        state: loadState,
      })}
    </AdViewUnitTracking>,
  ]);
}

export default AdViewUnitClient;
