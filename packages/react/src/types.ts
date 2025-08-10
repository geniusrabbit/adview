import { AdViewConfig, AdViewGroupItem } from '@adview/core/typings';
import { JSX, ReactElement, ReactNode } from 'react';

/**
 * CSS class name tokens for styling native ad components.
 * Provides granular control over individual elements within native ads.
 */
export type AdViewStyleTokensNative = {
  /** Container wrapper for the entire native ad */
  container?: string;
  /** Link wrapper around the main image */
  imageLink?: string;
  /** Main image element */
  image?: string;
  /** Ad label/disclaimer text */
  label?: string;
  /** Title/headline link */
  titleLink?: string;
  /** Description text link */
  descriptionLink?: string;
  /** Brand name link */
  brandNameLink?: string;
  /** Phone number link */
  phoneLink?: string;
  /** Call-to-action URL link */
  urlLink?: string;
};

/**
 * CSS class name tokens for styling banner ad components.
 * Banner ads typically only need container styling.
 */
export type AdViewStyleTokensBanner = {
  /** Container wrapper for the banner ad */
  container?: string;
};

/**
 * Conditional style tokens based on ad format.
 * Provides type-safe styling options for different ad types.
 */
export type AdViewStyleTokens = {
  [K in string]?: K extends 'native'
    ? AdViewStyleTokensNative
    : K extends 'banner'
      ? AdViewStyleTokensBanner
      : K extends 'proxy'
        ? AdViewStyleTokensNative
        : never;
};

/**
 * Client-side version of AdViewGroupItem without tracking data.
 * Used in components where tracking is handled separately.
 */
export type AdViewDataClient = Omit<AdViewGroupItem, 'tracker'>;

/**
 * Props passed to client-side custom render functions.
 * Provides ad data, detailed loading state, and error information.
 */
export type AdViewUnitClientChildrenProps = {
  /** Ad data from the server, or null if not loaded */
  data?: AdViewDataClient | null;
  /** Detailed loading state object with boolean flags */
  state: AdLoadState;
  /** Error object if ad loading failed */
  error: Error | null;
};

/**
 * AdViewOptionalDataProps is the type for the optional data props of the AdViewUnitTemplate component
 */
export type AdViewOptionalDataProps = {
  /** Ad data from the server, or null if not loaded */
  data?: AdViewDataClient | null;
  /** Detailed loading state object with boolean flags */
  state?: AdLoadState;
  /** Error object if ad loading failed */
  error?: Error | null;
};

/**
 * AdViewUnitTemplateTypeProps is the type for the props of the AdViewUnitTemplate component
 */
export type AdViewUnitTemplateTypeProps = AdViewOptionalDataProps & {
  type: string;
};

/**
 * AdViewUnitTemplateProps is the type for the props of the AdViewUnitTemplate component
 */
export type AdViewUnitTemplateProps = AdViewUnitTemplateTypeProps & {
  children?: (data: AdViewUnitClientChildrenProps) => (React.ReactNode | JSX.Element | null);
};

/**
 * Custom render function or component for client-side ad rendering.
 * Allows complete control over ad display and loading states.
 */
export type AdViewUnitClientChildren =
  | ((props: AdViewUnitClientChildrenProps) => ReactNode | JSX.Element)
  // | ReactElement<AdViewUnitClientChildrenProps>
  | ReactElement<AdViewUnitTemplateTypeProps>
  | ReactElement<AdViewUnitTemplateTypeProps>[]
  | any[];

/**
 * Props passed to server-side custom render functions.
 * Simplified version without loading states since SSR is synchronous.
 */
export type AdViewUnitServerChildrenProps = {
  /** Ad data or error from server-side rendering */
  data?: AdViewDataClient | Error;
  /** Optional fallback content function */
  onDefault?: AdViewUnitDefault;
};

/**
 * Custom render function or component for server-side ad rendering.
 * Used in SSR contexts where loading states are not applicable.
 */
export type AdViewUnitServerChildren =
  | ((props: AdViewUnitServerChildrenProps) => ReactNode | JSX.Element)
  | ReactElement<AdViewUnitServerChildrenProps>;

/**
 * Fallback content displayed when no ads are available.
 * Can be a static React node or a function that returns content.
 */
export type AdViewUnitDefault = (() => ReactNode) | ReactNode;

/**
 * Base props for all AdViewUnit components.
 * Combines unit identification, configuration, and rendering options.
 */
export type AdViewUnitPropsBase = {
  /** Unique identifier for the ad unit */
  unitId: string;
  /** Optional ad format specification */
  format?: string | string[];
} & AdViewConfig;

/**
 * Detailed loading state for ad requests.
 * Provides boolean flags for different stages of the loading process.
 */
export type AdLoadState = {
  /** True when component is in initial state before any loading */
  isInitial: boolean;
  /** True when actively fetching ad data */
  isLoading: boolean;
  /** True when an error occurred during loading */
  isError: boolean;
  /** True when loading is complete (success or failure) */
  isComplete: boolean;
};

// Re-export core types for React package compatibility
export type { AdViewConfig } from '@adview/core/typings';
