import { ReactElement, ReactNode } from 'react';
import { AdViewAdFormat, AdViewGroupItem } from '../../../typings';

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

export type AdViewDataClient = Omit<AdViewGroupItem, 'tracker'>;

export type AdViewUnitClientChildrenProps = {
  data?: AdViewDataClient | null;
  state: AdLoadState;
  error: Error | null;
  onDefault?: AdViewUnitDefault;
};

export type AdViewUnitClientChildren =
  | ((props: AdViewUnitClientChildrenProps) => ReactNode)
  | ReactElement<AdViewUnitClientChildrenProps>;

export type AdViewUnitServerChildrenProps = {
  data?: AdViewDataClient | Error;
  onDefault?: AdViewUnitDefault;
};

export type AdViewUnitServerChildren =
  | ((props: AdViewUnitServerChildrenProps) => ReactNode)
  | ReactElement<AdViewUnitServerChildrenProps>;

export type AdViewUnitDefault = (() => ReactNode) | ReactNode;

export type AdViewConfig = {
  srcURL?: string;
};

export type AdViewUnitPropsBase = {
  unitId: string;
  format?: AdViewAdFormat;
  onDefault?: AdViewUnitDefault;
} & AdViewConfig;

export type AdLoadState = {
  isInitial: boolean;
  isLoading: boolean;
  isError: boolean;
  isComplete: boolean;
};
