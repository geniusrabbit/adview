/**
 * TypeScript type definitions for the native ad package
 */

export interface AdAsset {
  name: string;
  path: string;
  width?: number;
  height?: number;
  thumbs?: AdThumbnail[];
}

export interface AdThumbnail {
  path: string;
  width: number;
  height?: number;
}

export interface AdFields {
  title?: string;
  description?: string;
  content?: string;
  brandname?: string;
  phone?: string;
  url?: string;
}

export interface AdFormat {
  w?: string | number;
  h?: string | number;
}

export interface AdTracker {
  impressions?: string[];
  views?: string[];
}

export interface AdItem {
  type: 'proxy' | 'native' | 'banner';
  url?: string;
  content_url?: string;
  content?: string;
  fields?: AdFields;
  assets?: AdAsset[];
  format?: AdFormat;
  tracker?: AdTracker;
}

export interface AdGroup {
  items: AdItem[];
}

export interface AdResponse {
  groups?: AdGroup[];
}

export interface AdCallbacks {
  onLoading?: ((embeddedAd: any) => void) | null;
  onLoaded?: ((embeddedAd: any, data: any) => void) | null;
  onRender?: ((embeddedAd: any, data: any, success: boolean) => void) | null;
  onError?: ((embeddedAd: any, error: any) => void) | null;
}

export interface AdMapperCallbacks {
  render?: ((embeddedAd: any, data: any, success: boolean) => void) | null;
  loading?: ((embeddedAd: any) => void) | null;
  loaded?: ((embeddedAd: any, data: any) => void) | null;
  error?: ((embeddedAd: any, error: any) => void) | null;
}

export interface DataParams {
  slot: string;
  format: string;
  fullWidth: string;
}

export interface MapperConfig {
  srcURL?: string;
  dataParams?: DataParams;
  on?: AdMapperCallbacks;
  render?: any;
}

export interface AdMapper {
  matchPattern: string;
  config: MapperConfig;
}

export interface EmbeddedAdSettings {
  JSONPLink?: string;
  element?: string | HTMLElement | null;
  spot_id?: string | null;
  render?: any;
  format?: string;
  fullWidth?: string;
  onLoading?: (embeddedAd: any) => void;
}

export interface Template {
  name: string;
  template: string;
}

export interface WindowSize {
  0: number;
  1: number;
}

// Global window interface extension for JSONP callbacks
declare global {
  interface Window {
    [key: string]: any;
  }
}
