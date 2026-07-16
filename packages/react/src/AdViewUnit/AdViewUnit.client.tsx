'use client';

import { AdViewData, AdViewGroupItem } from '@adview/core';
import React from 'react';
import { AdViewUnitClientChildren, AdViewUnitPropsBase } from '../types';
import AdViewUnitBannerTemplate from './AdViewUnitBannerTemplate';
import AdViewUnitNativeTemplate from './AdViewUnitNativeTemplate';
import AdViewUnitProxyTemplate from './AdViewUnitProxyTemplate';
import { renderAnyTemplates } from './AdViewUnitTemplate';
import AdViewUnitTracking from './AdViewUnitTracking';
import useAdViewController from './useAdViewController';

export type AdViewUnitClientWrapperParams = {
  adViewData: AdViewData | null;
  groupItems: AdViewGroupItem[];
  elms: React.ReactNode[];
};

export type AdViewUnitClientProps = Omit<AdViewUnitPropsBase, 'sources'> & {
  children?: AdViewUnitClientChildren;
  filterItems?: (items: AdViewGroupItem[]) => AdViewGroupItem[];
  wrapper?: (params: AdViewUnitClientWrapperParams) => React.ReactNode;
  trackingWrapperClassName?: string;
  /** Filters/prioritizes sources by name (see `AdViewConfig.sources`) */
  sources?: string[];
  /** Filters sources by tag (see `AdViewConfig.sources`) */
  tags?: string[];
  /** Filters sources by driver name (see `AdViewConfig.sources`) */
  drivers?: string[];
  acceptedFormatTypes?: string[];
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
  filterItems,
  wrapper,
  trackingWrapperClassName,
  sources,
  tags,
  drivers,
  acceptedFormatTypes,
  ...config
}: AdViewUnitClientProps) {
  const checkFormat = (f: string) => {
    if (!format) {
      return true;
    }
    if (acceptedFormatTypes && acceptedFormatTypes.length > 0) {
      return (
        acceptedFormatTypes.includes(f) ||
        acceptedFormatTypes.includes('all') ||
        acceptedFormatTypes.includes('*')
      );
    }
    return Array.isArray(format) ? format.includes(f) : f === format;
  };

  const [response, error, loadState] = useAdViewController(
    config,
    unitId,
    limit || 1,
    format,
    query,
    { sources, tags, drivers },
  );

  let {
    responseGroup: _,
    customTracker,
    groupItems,
    adViewData,
  } = error
    ? {
        responseGroup: null,
        customTracker: {},
        groupItems: [],
        adViewData: null,
      }
    : (() => {
        for (let responseGroup of response?.groups || []) {
          const customTracker = responseGroup?.custom_tracker ?? {};
          const groupItems = (responseGroup?.items || [])
            .map(it => (checkFormat(it.type) ? it : null))
            .filter(Boolean);
          if (groupItems && groupItems.length > 0) {
            return {
              responseGroup,
              customTracker,
              groupItems,
              adViewData: response,
            };
          }
        }
        return {
          responseGroup: null,
          customTracker: {},
          groupItems: [],
          adViewData: response,
        };
      })();

  if (!children) {
    children = [
      <AdViewUnitBannerTemplate key="banner-template" />,
      <AdViewUnitNativeTemplate key="native-template" />,
      <AdViewUnitProxyTemplate key="proxy-template" />,
    ];
  }

  if (!wrapper) {
    wrapper = ({ elms }: AdViewUnitClientWrapperParams) => <>{elms}</>;
  }

  if (filterItems && groupItems && groupItems.length > 0) {
    groupItems = filterItems(groupItems as AdViewGroupItem[]);
  }

  if (groupItems && groupItems?.length > 0) {
    return wrapper({
      adViewData,
      groupItems: groupItems as AdViewGroupItem[],
      elms: (groupItems as AdViewGroupItem[]).map(
        ({ tracker, ...data }, index) => {
          return (
            <AdViewUnitTracking
              key={data.id || `${unitId}-${index}`}
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
        },
      ),
    });
  }

  return wrapper({
    adViewData,
    groupItems: [],
    elms: [
      <AdViewUnitTracking
        key={`${unitId}-empty`}
        {...customTracker}
        className={trackingWrapperClassName}
      >
        {renderAnyTemplates(children, {
          unitId,
          index: -1,
          data: null,
          type: 'default',
          error,
          state: loadState,
        })}
      </AdViewUnitTracking>,
    ],
  });
}

export default AdViewUnitClient;
