import type { AdViewGroupItem } from '@adview/core/typings';

export const sampleBanner: AdViewGroupItem = {
  id: 'demo-banner',
  type: 'banner',
  url: 'https://example.com/offer',
  fields: { title: 'Ebony Banner', description: 'Premium placement' },
  assets: [
    {
      name: 'main',
      path: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=728&h=90&fit=crop',
      type: 'image/jpeg',
      width: 728,
      height: 90,
    },
  ],
  tracker: {
    impressions: ['https://track.example.com/imp?id=demo-banner'],
    clicks: ['https://track.example.com/click?id=demo-banner'],
    views: ['https://track.example.com/view?id=demo-banner'],
  },
};

export const sampleNative: AdViewGroupItem = {
  id: 'demo-native',
  type: 'native',
  url: 'https://example.com/story',
  fields: {
    title: 'Crafted for publishers',
    description: 'Native ads that feel at home in your layout.',
    brandName: 'AdView',
    brandname: 'AdView',
    phone: '+1 555 0100',
    url: 'example.com',
  },
  assets: [
    {
      name: 'main',
      path: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=640&h=360&fit=crop',
      type: 'image/jpeg',
      width: 640,
      height: 360,
    },
  ],
};

export const sampleNativeAlt: AdViewGroupItem = {
  id: 'demo-native-2',
  type: 'native',
  url: 'https://example.com/alt',
  fields: {
    title: 'Second source fill',
    description: 'Filled by the waterfall from a lower-weight source.',
    brandName: 'Fallback Net',
    brandname: 'Fallback Net',
  },
  assets: [
    {
      name: 'main',
      path: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=640&h=360&fit=crop',
      type: 'image/jpeg',
      width: 640,
      height: 360,
    },
  ],
};

export const sampleVideo: AdViewGroupItem = {
  id: 'demo-video',
  type: 'video',
  url: 'https://example.com/preroll',
  fields: {
    title: 'Video preroll spot',
    description: 'Matched by a custom VideoPrerollTemplate (type="video").',
  },
  assets: [
    {
      name: 'main',
      path: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=640&h=360&fit=crop',
      type: 'image/jpeg',
      width: 640,
      height: 360,
    },
  ],
};

/** Unusual format — no typed template, falls through to type="*" */
export const sampleProxySized: AdViewGroupItem = {
  id: 'demo-proxy-300',
  type: 'proxy_300x250',
  url: 'https://example.com/proxy',
  fields: {
    title: 'Proxy 300×250',
    description: 'No banner/video template — caught by GeneralCard type="*".',
  },
  assets: [
    {
      name: 'main',
      path: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&h=250&fit=crop',
      type: 'image/jpeg',
      width: 300,
      height: 250,
    },
  ],
};

/** Build a labeled ad so demos can show which source produced it. */
export function labeledAd(
  base: AdViewGroupItem,
  sourceName: string,
  overrides: Partial<AdViewGroupItem> & {
    fields?: AdViewGroupItem['fields'];
  } = {},
): AdViewGroupItem {
  return {
    ...base,
    ...overrides,
    id: overrides.id || `${sourceName}-${base.id}`,
    fields: {
      ...base.fields,
      ...overrides.fields,
      sourceName,
    },
  };
}
