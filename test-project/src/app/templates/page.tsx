'use client';

import * as AdView from '@adview/react';
import React from 'react';

import CodeReveal from '@/components/CodeReveal';
import { sampleBanner, sampleNative } from '@/lib/sampleAds';

const CODE = `
<AdView.BannerTemplate data={banner} state={{ isComplete: true }} />
<AdView.NativeTemplate
  data={native}
  state={{ isComplete: true }}
  classNames={{ container: 'my-native' }}
/>
`;

const ready = {
  isComplete: true,
  isLoading: false,
  isError: false,
  isInitial: false,
};

export default function TemplatesPage() {
  return (
    <article>
      <header className="demo-header">
        <p className="demo-kicker">Built-ins</p>
        <h2>Banner &amp; Native templates</h2>
        <p>
          Ready-made renderers for common formats. Use them standalone with mock
          data or as default children inside Unit.
        </p>
      </header>

      <div className="demo-grid">
        <section className="panel">
          <div className="panel-head">
            <h3>BannerTemplate</h3>
          </div>
          <div className="panel-body">
            <div className="preview-stage">
              <div style={{ width: '100%', maxWidth: 728 }}>
                <AdView.BannerTemplate data={sampleBanner} state={ready} />
              </div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>NativeTemplate</h3>
          </div>
          <div className="panel-body">
            <div className="preview-stage">
              <div style={{ width: '100%', maxWidth: 420 }}>
                <AdView.NativeTemplate data={sampleNative} state={ready} />
              </div>
            </div>
          </div>
          <CodeReveal code={CODE} title="Show template usage" />
        </section>
      </div>
    </article>
  );
}
