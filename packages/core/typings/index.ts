import { ReactElement, ReactNode } from 'react';

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
 * Tracking pixel URLs for different ad events.
 * Used to measure ad performance and user interactions.
 */
export interface AdViewGroupItemTracker {
  /** Optional click tracking pixels */
  clicks?: string[];
  /** Optional impression tracking pixels */
  impressions?: string[];
  /** Optional view/visibility tracking pixels */
  views?: string[];
}

/**
 * Thumbnail variant of an ad asset with specific dimensions.
 * Used for responsive images and different screen sizes.
 */
export interface AdViewItemAssetThumb {
  /** URL path to the thumbnail image */
  path: string;
  /** MIME type of the thumbnail (e.g., 'image/jpeg') */
  type?: string;
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
}

/**
 * Ad asset (image, video, etc.) with metadata and thumbnails.
 * Represents media content used within advertisements.
 */
export interface AdViewItemAsset {
  /** Asset identifier (e.g., 'main', 'logo', 'background') */
  name?: string;
  /** URL path to the asset */
  path: string;
  /** MIME type of the asset (e.g., 'image/jpeg', 'video/mp4') */
  type?: string;
  /** Asset width in pixels */
  width?: number;
  /** Asset height in pixels */
  height?: number;
  /** Array of thumbnail variants for responsive display */
  thumbs?: AdViewItemAssetThumb[];
}

/**
 * Information about the particular advertisement.
 * Who bought it, what campaign it belongs to, etc.
 * Useful for advanced use cases like reporting, debugging, or custom handling based on the ad source.
 */
export interface AdViewAdInfo {
  /** Unique identifier for the ad */
  id: string;
  /** Optional source identifier for the ad (e.g., ad network, campaign) */
  adsourceId?: string;
  /** Optional description of the ad */
  description?: string;
  /** Optional additional metadata about the ad */
  metadata?: { [key: string]: any };

  actions?: {
    type?: string;
    title?: string;
    description?: string;
    url: string;
  }[];
}

/**
 * Individual advertisement item within a group.
 * Contains all data needed to display and track a single ad.
 */
export interface AdViewGroupItem {
  /** Unique identifier for this ad item */
  id: string;
  /** Format type of the advertisement */
  type: string;
  /** Click-through URL for the advertisement */
  url?: string;
  /** Custom fields containing ad-specific data (title, description, etc.) */
  fields?: { [key: string]: any };
  /** Media assets (images, videos) associated with the ad */
  assets?: AdViewItemAsset[];
  /** Tracking pixels for measuring ad performance */
  tracker?: AdViewGroupItemTracker;
  /** Optional additional metadata about the ad item */
  metadata?: { [key: string]: any };
  /** Optional information about the ad source or campaign */
  adInfo?: AdViewAdInfo;
}

/**
 * Information about the source of an advertisement, such as the ad network or provider.
 * Useful for advanced use cases like reporting, debugging, or custom handling based on the ad source.
 */
export interface AdViewAdSourceInfo {
  /** Unique identifier for the ad source */
  id: string;
  /** Optional human-readable name for the ad source */
  name?: string;
  /** Optional description of the ad source */
  description?: string;
  /** Optional domain associated with the ad source (e.g., 'example.com') */
  domain?: string;
  /** Optional URL to the ad source's icon */
  iconURL?: string;
  /** Optional URL to the ad source's logo */
  logoURL?: string;
  /** Optional URL to the ad source's website or documentation */
  url?: string;
  /** Optional additional metadata about the ad source */
  metadata?: { [key: string]: any };
}

/**
 * Group of related advertisement items.
 * Typically contains multiple ad variants or a single ad with metadata.
 */
export interface AdViewGroup {
  /** Unique identifier for the ad group */
  id: string;
  /** Optional group-level tracking pixels */
  custom_tracker?: AdViewGroupItemTracker;
  /** Array of individual ad items in this group */
  items: AdViewGroupItem[];
}

/**
 * Client-side version of AdViewGroupItem without tracking data.
 * Used in components where tracking is handled separately.
 */
export type AdViewDataClient = Omit<AdViewGroupItem, 'tracker'>;

/**
 * Props passed to client-side custom render functions.
 * Provides ad data, loading state, and error information.
 */
export type AdViewUnitClientChildrenProps = {
  /** Ad data from the server, or null if not loaded */
  data?: AdViewDataClient | null;
  /** Current loading state as string */
  state: string;
  /** Error object if ad loading failed */
  error: Error | null;
};

/**
 * Custom render function or component for client-side ad rendering.
 * Allows complete control over ad display and loading states.
 */
export type AdViewUnitClientChildren =
  | ((props: AdViewUnitClientChildrenProps) => ReactNode)
  | ReactElement<AdViewUnitClientChildrenProps>;

/**
 * Props passed to server-side custom render functions.
 * Simplified version without loading states since SSR is synchronous.
 */
export type AdViewUnitServerChildrenProps = {
  /** Ad data or error from server-side rendering */
  data?: AdViewDataClient | Error;
};

/**
 * Custom render function or component for server-side ad rendering.
 * Used in SSR contexts where loading states are not applicable.
 */
export type AdViewUnitServerChildren =
  | ((props: AdViewUnitServerChildrenProps) => ReactNode)
  | ReactElement<AdViewUnitServerChildrenProps>;

/**
 * Complete ad response data from the ad server.
 * Contains versioning, groups, and optional global tracking.
 */
export interface AdViewData {
  /** Global tracking pixels applied to all ads */
  custom_tracker?: AdViewGroupItemTracker;
  /** API version for compatibility checking */
  version?: string;
  /** Array of ad groups returned by the server */
  groups?: AdViewGroup[];
  /** Optional array of ad source information for advanced use cases */
  adsources?: AdViewAdSourceInfo[];
}

/**
 * Fallback content displayed when no ads are available.
 * Can be a static React node or a function that returns content.
 */
export type AdViewUnitDefault = (() => ReactNode) | ReactNode;

/**
 * Interface for custom ad data loaders.
 * Allows integration with different data fetching strategies.
 */
export interface AdViewDataLoader {
  /** Fetches ad data from the server */
  fetchAdData: (
    unitId: string,
    limit: number,
    format?: string | string[],
    query?: { [key: string]: any },
  ) => Promise<AdViewData | Error>;
}

// Abstract type for data loader configurations.
export type AdViewDataLoaderAbstractType =
  | AdViewDataLoader
  | string
  | AdViewGroupItem[];

/**
 * Configuration options for AdView components.
 * Contains server URL and other global settings.
 */
export type AdViewConfig = {
  /** Ad server URL template with {<id>} placeholder */
  srcURL?: string;
  /** Default ad data */
  defaultAdData?: AdViewGroupItem[];
  /** Optional custom data loader for fetching ads */
  sourceLoader?: AdViewDataLoaderAbstractType | AdViewDataLoaderAbstractType[];
  /** Optional smart data loader configuration */
  source?: AdViewDataLoader;
};
