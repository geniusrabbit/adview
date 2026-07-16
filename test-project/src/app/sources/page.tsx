'use client';

import * as AdView from '@adview/react';
import React from 'react';

import AdSlot from '@/components/AdSlot';
import DemoPage from '@/components/DemoPage';
import { sampleNative } from '@/lib/sampleAds';

const CODE = `
<AdView.Provider
  sources={[
    {
      name: 'primary',
      driver: 'static', // or 'dynamic' | 'function' | custom
      weight: 10,
      tags: ['home'],
      params: {
        defaultData: ads,
        // for dynamic: { url, timeout }
        // for function: { fetchAdData }
      },
    },
  ]}
>
  <AdView.Unit unitId="slot-1" format="native" />
</AdView.Provider>
`;

export default function SourcesPage() {
  return (
    <DemoPage
      kicker="Config"
      title="Declarative sources"
      description="AdViewConfig.sources is the modern way to describe ad backends. Each entry has a name, a registered driver, optional weight/tags, and params passed into the driver constructor."
      code={CODE}
    >
      <AdView.Provider
        sources={[
          {
            name: 'primary',
            driver: 'static',
            weight: 10,
            tags: ['home'],
            params: { defaultData: [sampleNative] },
          },
        ]}
      >
        <AdView.Unit unitId="sources-demo" format="native">
          {({ data, state, error }) => (
            <AdSlot data={data} state={state} error={error} />
          )}
        </AdView.Unit>
      </AdView.Provider>

      <ul className="feature-list" style={{ marginTop: '1.1rem' }}>
        <li>
          <strong>driver: &apos;static&apos;</strong>
          <span>HardDataLoader — fixed items from params.defaultData.</span>
        </li>
        <li>
          <strong>driver: &apos;dynamic&apos;</strong>
          <span>Fetches JSON from params.url with timeout &amp; fallbacks.</span>
        </li>
        <li>
          <strong>driver: &apos;function&apos;</strong>
          <span>Delegates to params.fetchAdData for full control.</span>
        </li>
        <li>
          <strong>registerDataLoader</strong>
          <span>Add custom drivers that accept AdViewSourceItem.</span>
        </li>
      </ul>
    </DemoPage>
  );
}
