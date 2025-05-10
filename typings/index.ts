import { ReactElement, ReactNode } from 'react';

export type AdViewAdFormat = 'banner' | 'native' | 'proxy';

export type AdViewStyleTokensNative = {
  container?: string;
  imageLink?: string;
  image?: string;
  label?: string;
  titleLink?: string;
  descriptionLink?: string;
  brandNameLink?: string;
  phoneLink?: string;
  urlLink?: string;
};

export type AdViewStyleTokensBanner = {
  container?: string;
};

export type AdViewStyleTokens = {
  [K in AdViewAdFormat]?: K extends 'native'
    ? AdViewStyleTokensNative
    : K extends 'banner'
      ? AdViewStyleTokensBanner
      : K extends 'proxy'
        ? AdViewStyleTokensNative
        : never;
};

export interface AdViewGroupItemTracker {
  clicks?: string[];
  impressions: string[];
  views: string[];
}

export interface AdViewItemAssetThumb {
  path: string;
  type?: string;
  width?: number;
  height?: number;
}

export interface AdViewItemAsset {
  name?: string;
  path: string;
  type?: string; // Type of asset (e.g., image, video).
  width?: number;
  height?: number;
  thumbs?: AdViewItemAssetThumb[];
}

export interface AdViewGroupItem {
  id: string;
  type: AdViewAdFormat;
  url?: string;
  // content?: string;
  // contentURL?: string;
  fields?: { [key: string]: any };
  assets?: AdViewItemAsset[];
  tracker: AdViewGroupItemTracker;
}

export interface AdViewGroup {
  id: string;
  custom_tracker?: AdViewGroupItemTracker;
  items: AdViewGroupItem[];
}

export type AdViewDataClient = Omit<AdViewGroupItem, 'tracker'>;

export type AdViewUnitClientChildrenProps = {
  data?: AdViewDataClient | null;
  state: string;
  error: Error | null;
};

export type AdViewUnitClientChildren =
  | ((props: AdViewUnitClientChildrenProps) => ReactNode)
  | ReactElement<AdViewUnitClientChildrenProps>;

export type AdViewUnitServerChildrenProps = {
  data?: AdViewDataClient | Error;
};

export type AdViewUnitServerChildren =
  | ((props: AdViewUnitServerChildrenProps) => ReactNode)
  | ReactElement<AdViewUnitServerChildrenProps>;

export interface AdViewData {
  custom_tracker?: AdViewGroupItemTracker;
  version: string;
  groups?: AdViewGroup[];
}

export type AdViewUnitDefault = (() => ReactNode) | ReactNode;
