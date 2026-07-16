'use client';

import * as AdView from '@adview/react';
import React from 'react';

import AdSlot from '@/components/AdSlot';
import DemoPage from '@/components/DemoPage';
import {
  labeledAd,
  sampleBanner,
  sampleNative,
  sampleNativeAlt,
} from '@/lib/sampleAds';

const CODE = `
// One Unit, three sources — results are merged until limit is filled.
<AdView.Provider
  sources={[
    {
      name: 'premium',
      driver: 'static',
      weight: 30,
      params: { defaultData: [adFromPremium] },
    },
    {
      name: 'house',
      driver: 'static',
      weight: 20,
      params: { defaultData: [adFromHouse] },
    },
    {
      name: 'remnant',
      driver: 'static',
      weight: 10,
      params: { defaultData: [adFromRemnant] },
    },
  ]}
>
  <AdView.Unit unitId="feed" format={['banner', 'native']} limit={3}>
    {({ data }) => <AdCard data={data} />}
  </AdView.Unit>
</AdView.Provider>
`;

export default function MixPage() {
  return (
    <DemoPage
      kicker="Composition"
      title="Mix ads from multiple sources"
      description="Declare several sources on the Provider. The Unit asks for limit items; each source contributes what it can, and SmartDataLoader merges them into one response. Labels below show which source produced each creative."
      code={CODE}
    >
      <AdView.Provider
        sources={[
          {
            name: 'premium',
            driver: 'static',
            weight: 30,
            tags: ['feed'],
            params: {
              defaultData: [
                labeledAd(sampleNative, 'premium', {
                  id: 'mix-premium',
                  fields: {
                    title: 'Premium network',
                    description: 'Highest weight — served first.',
                  },
                }),
              ],
            },
          },
          {
            name: 'house',
            driver: 'static',
            weight: 20,
            tags: ['feed'],
            params: {
              defaultData: [
                labeledAd(sampleBanner, 'house', {
                  id: 'mix-house',
                  type: 'native',
                  fields: {
                    title: 'House promo',
                    description: 'Second source tops up the feed.',
                  },
                  assets: sampleNative.assets,
                }),
              ],
            },
          },
          {
            name: 'remnant',
            driver: 'static',
            weight: 10,
            tags: ['feed'],
            params: {
              defaultData: [
                labeledAd(sampleNativeAlt, 'remnant', {
                  id: 'mix-remnant',
                  fields: {
                    title: 'Remnant fill',
                    description: 'Fills the last slot when others fall short.',
                  },
                }),
              ],
            },
          },
        ]}
      >
        <AdView.Unit
          unitId="mix-feed"
          format={['banner', 'native']}
          limit={3}
          tags={['feed']}
        >
          {({ data, state, error }) => (
            <div style={{ width: '100%', marginBottom: '0.85rem' }}>
              <AdSlot data={data} state={state} error={error} />
            </div>
          )}
        </AdView.Unit>
      </AdView.Provider>

      <ul className="feature-list" style={{ marginTop: '0.75rem' }}>
        <li>
          <strong>weight</strong>
          <span>
            Controls default order when the Unit does not pass sources=[…].
          </span>
        </li>
        <li>
          <strong>limit=3</strong>
          <span>
            Each source returns one creative → the feed shows premium + house +
            remnant.
          </span>
        </li>
      </ul>
    </DemoPage>
  );
}
