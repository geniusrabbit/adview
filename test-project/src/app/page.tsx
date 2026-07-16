'use client';

import * as AdView from '@adview/react';
import React from 'react';

import AdSlot from '@/components/AdSlot';
import DemoPage from '@/components/DemoPage';
import { sampleBanner, sampleNative } from '@/lib/sampleAds';

const CODE = `
import * as AdView from '@adview/react';

export function Page() {
  return (
    <AdView.Provider
      sources={[
        {
          name: 'demo',
          driver: 'static',
          params: { defaultData: [/* ads */] },
        },
      ]}
    >
      <AdView.Unit unitId="home" format={['banner', 'native']} limit={1}>
        {({ data, state, error }) => (
          <AdSlot data={data} state={state} error={error} />
        )}
      </AdView.Unit>
    </AdView.Provider>
  );
}
`;

export default function OverviewPage() {
  return (
    <DemoPage
      kicker="Basics"
      title="Provider + Unit"
      description="Wrap your tree in AdView.Provider, then place AdView.Unit where ads should appear. The unit resolves a data loader from config and renders via a children function."
      code={CODE}
      defaultCodeOpen
    >
      <AdView.Provider
        sources={[
          {
            name: 'demo',
            driver: 'static',
            params: { defaultData: [sampleBanner, sampleNative] },
          },
        ]}
      >
        <AdView.Unit unitId="overview" format={['banner', 'native']} limit={1}>
          {({ data, state, error }) => (
            <AdSlot data={data} state={state} error={error} />
          )}
        </AdView.Unit>
      </AdView.Provider>

      <ul className="feature-list" style={{ marginTop: '1.1rem' }}>
        <li>
          <strong>AdView.Provider</strong>
          <span>Shares global config (sources, srcURL, …) with every Unit.</span>
        </li>
        <li>
          <strong>AdView.Unit</strong>
          <span>
            Fetches ads for a unitId and exposes data, state, and error to your
            render function.
          </span>
        </li>
      </ul>
    </DemoPage>
  );
}
