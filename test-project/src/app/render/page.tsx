'use client';

import * as AdView from '@adview/react';
import React from 'react';

import DemoPage from '@/components/DemoPage';
import { sampleNative } from '@/lib/sampleAds';

const CODE = `
<AdView.Unit unitId="hero" format="native">
  {({ data, state, error }) => {
    if (state.isLoading) return <Skeleton />;
    if (error || !data) return <Fallback />;
    return (
      <article>
        <h3>{data.fields?.title}</h3>
        <p>{data.fields?.description}</p>
      </article>
    );
  }}
</AdView.Unit>
`;

export default function RenderPage() {
  return (
    <DemoPage
      kicker="API"
      title="Custom render props"
      description="Pass a function as children to fully control loading, error, and success UI. You receive data (without tracker), state flags, and error."
      code={CODE}
    >
      <AdView.Provider
        sources={[
          {
            name: 'render-src',
            driver: 'static',
            params: { defaultData: [sampleNative] },
          },
        ]}
      >
        <AdView.Unit unitId="render-demo" format="native">
          {({ data, state, error }) => {
            if (state.isLoading) {
              return (
                <div className="preview-stage">
                  <p className="muted">Loading custom UI…</p>
                </div>
              );
            }

            if (error) {
              return (
                <div className="preview-stage">
                  <p className="muted">Failed: {error.message}</p>
                </div>
              );
            }

            if (!data) {
              return (
                <div className="preview-stage">
                  <p className="muted">Empty inventory</p>
                </div>
              );
            }

            return (
              <div className="preview-stage">
                <article className="ad-card">
                  <div className="ad-body">
                    <div className="ad-label">Custom render</div>
                    <h4>{String(data.fields?.title)}</h4>
                    <p>{String(data.fields?.description)}</p>
                    <p className="muted" style={{ marginTop: '0.65rem' }}>
                      brand: {String(data.fields?.brandName || '—')}
                    </p>
                  </div>
                </article>
              </div>
            );
          }}
        </AdView.Unit>
      </AdView.Provider>
    </DemoPage>
  );
}
