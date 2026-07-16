'use client';

import * as AdView from '@adview/react';
import React, { useMemo, useState } from 'react';

import CodeReveal from '@/components/CodeReveal';
import BannerCardTemplate from '@/components/templates/BannerCardTemplate';
import EmptyDefaultTemplate from '@/components/templates/EmptyDefaultTemplate';
import GeneralCardTemplate from '@/components/templates/GeneralCardTemplate';
import VideoPrerollTemplate from '@/components/templates/VideoPrerollTemplate';
import {
  labeledAd,
  sampleBanner,
  sampleProxySized,
  sampleVideo,
} from '@/lib/sampleAds';

const CODE_UNIT = `
<AdView.Unit
  unitId={unitId}
  format={["native", "proxy", "banner", "proxy_300x250", "banner_300x250", "video"]}
  limit={5}
  query={{ locale, ...query }}
  trackingWrapperClassName="w-full h-full"
  acceptedFormatTypes={["*"]}
>
  {/* Specific types first — first match wins */}
  <VideoPrerollTemplate type="video" />
  <BannerCardTemplate type="banner" />

  {/* Catch-all for anything else (proxy_300x250, …) */}
  <GeneralCardTemplate type="*" border />

  {/* Empty inventory / no data */}
  <EmptyDefaultTemplate />
</AdView.Unit>
`;

const CODE_CUSTOM = `
"use client";

import * as AdView from "@adview/react";
import type { AdViewUnitTemplateTypeProps } from "@adview/react";

type VideoPrerollTemplateProps = Omit<AdViewUnitTemplateTypeProps, "type"> & {
  type?: "video";
};

export default function VideoPrerollTemplate({
  type = "video",
  ...props
}: VideoPrerollTemplateProps) {
  return (
    <AdView.Template type={type} {...props}>
      {({ data: ad }) => (
        <div>
          <h1>Ad Video Preroll Template</h1>
          <pre>{JSON.stringify(ad, null, 2)}</pre>
        </div>
      )}
    </AdView.Template>
  );
}

VideoPrerollTemplate.defaults = { type: "video" };
`;

const CODE_STAR = `
<AdView.Template key="default-template" type="*">
  {({ data }) =>
    adItem2(data, {
      itemClassName,
      ageVerificationRequired,
      border: true,
    })
  }
</AdView.Template>
`;

type Mode = 'mixed' | 'empty';

export default function CustomTemplatesPage() {
  const [mode, setMode] = useState<Mode>('mixed');

  const inventory = useMemo(() => {
    if (mode === 'empty') return [];
    return [
      labeledAd(sampleVideo, 'premium', { id: 'tpl-video' }),
      labeledAd(sampleBanner, 'house', { id: 'tpl-banner' }),
      labeledAd(sampleProxySized, 'remnant', { id: 'tpl-proxy' }),
    ];
  }, [mode]);

  return (
    <article>
      <header className="demo-header">
        <p className="demo-kicker">Rendering</p>
        <h2>Custom templates</h2>
        <p>
          A Unit can host several <code>AdView.Template</code> children. The
          library picks the first whose <code>type</code> matches the ad (or{' '}
          <code>&quot;*&quot;</code>), then falls back to{' '}
          <code>DefaultTemplate</code> when there is no data.
        </p>
      </header>

      <div className="demo-grid">
        <section className="panel">
          <div className="panel-head">
            <h3>Live preview · multi-template Unit</h3>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {(['mixed', 'empty'] as const).map(value => (
                <button
                  key={value}
                  type="button"
                  className={`chip${mode === value ? ' warn' : ''}`}
                  onClick={() => setMode(value)}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  {value === 'mixed' ? 'with inventory' : 'empty → default'}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-body">
            <div className="state-row" style={{ marginBottom: '1rem' }}>
              <span className="chip">video → VideoPreroll</span>
              <span className="chip">banner → BannerCard</span>
              <span className="chip">proxy_300x250 → General *</span>
              <span className="chip">no data → DefaultTemplate</span>
            </div>

            <AdView.Provider
              sources={[
                {
                  name: 'templates-demo',
                  driver: 'static',
                  params: { defaultData: inventory },
                },
              ]}
            >
              <AdView.Unit
                key={mode}
                unitId="custom-templates-demo"
                format={[
                  'native',
                  'proxy',
                  'banner',
                  'proxy_300x250',
                  'banner_300x250',
                  'video',
                ]}
                limit={5}
                query={{ locale: 'en' }}
                trackingWrapperClassName="w-full"
                acceptedFormatTypes={['*']}
                wrapper={({ elms }) => (
                  <div
                    style={{
                      display: 'grid',
                      gap: '0.85rem',
                      width: '100%',
                    }}
                  >
                    {elms}
                  </div>
                )}
              >
                <VideoPrerollTemplate />
                <BannerCardTemplate />
                <GeneralCardTemplate type="*" border />
                <EmptyDefaultTemplate />
              </AdView.Unit>
            </AdView.Provider>

            <ul className="feature-list" style={{ marginTop: '1.1rem' }}>
              <li>
                <strong>Order matters</strong>
                <span>
                  First matching template wins. Put specific types before{' '}
                  <code>type=&quot;*&quot;</code>.
                </span>
              </li>
              <li>
                <strong>type=&quot;*&quot;</strong>
                <span>
                  Catch-all for formats you do not specialize (proxy sizes,
                  future types).
                </span>
              </li>
              <li>
                <strong>DefaultTemplate</strong>
                <span>
                  Renders only when <code>data</code> is empty — keep it last for
                  fallback UI.
                </span>
              </li>
              <li>
                <strong>acceptedFormatTypes=[&quot;*&quot;]</strong>
                <span>
                  Lets the Unit accept creatives beyond the request{' '}
                  <code>format</code> list when filtering items client-side.
                </span>
              </li>
            </ul>
          </div>

          <CodeReveal code={CODE_UNIT} title="Show Unit + templates usage" defaultOpen />
          <CodeReveal code={CODE_CUSTOM} title="Show custom template component" />
          <CodeReveal code={CODE_STAR} title="Show type=&quot;*&quot; catch-all" />
        </section>
      </div>
    </article>
  );
}
