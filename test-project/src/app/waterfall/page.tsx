'use client';

import * as AdView from '@adview/react';
import React from 'react';

import AdSlot from '@/components/AdSlot';
import DemoPage from '@/components/DemoPage';
import { labeledAd, sampleNative, sampleNativeAlt } from '@/lib/sampleAds';

const CODE = `
// Primary only has 1 ad; backup tops up remaining slots to reach limit.
<AdView.Provider
  sources={[
    { name: 'primary', driver: 'static', weight: 10, params: { defaultData: [adA] } },
    { name: 'backup',  driver: 'static', weight: 1,  params: { defaultData: [adB] } },
  ]}
>
  <AdView.Unit unitId="rail" format="native" limit={2}>
    {({ data }) => <AdCard data={data} />}
  </AdView.Unit>
</AdView.Provider>
`;

export default function WaterfallPage() {
  return (
    <DemoPage
      kicker="Fill strategy"
      title="Waterfall top-up"
      description="When the first source cannot satisfy limit alone, the next source fills the gap. Same merge pipeline as Mix, focused on the fallback path."
      code={CODE}
    >
      <AdView.Provider
        sources={[
          {
            name: 'primary',
            driver: 'static',
            weight: 10,
            params: {
              defaultData: [
                labeledAd(sampleNative, 'primary', {
                  id: 'wf-primary',
                  fields: {
                    title: 'Primary hit',
                    description: 'Only one item from the first source.',
                  },
                }),
              ],
            },
          },
          {
            name: 'backup',
            driver: 'static',
            weight: 1,
            params: {
              defaultData: [
                labeledAd(sampleNativeAlt, 'backup', {
                  id: 'wf-backup',
                  fields: {
                    title: 'Backup fill',
                    description: 'Tops up the remaining limit slot.',
                  },
                }),
              ],
            },
          },
        ]}
      >
        <AdView.Unit unitId="waterfall-demo" format="native" limit={2}>
          {({ data, state, error }) => (
            <div style={{ width: '100%', marginBottom: '0.75rem' }}>
              <AdSlot data={data} state={state} error={error} />
            </div>
          )}
        </AdView.Unit>
      </AdView.Provider>
      <p className="muted" style={{ marginTop: '0.5rem' }}>
        limit=2 → primary contributes one item, backup fills the second slot.
      </p>
    </DemoPage>
  );
}
