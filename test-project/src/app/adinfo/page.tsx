'use client';

import type {
  AdViewAdSourceInfo,
  AdViewGroupItem,
} from '@adview/core/typings';
import * as AdView from '@adview/react';
import React from 'react';

import CodeReveal from '@/components/CodeReveal';
import { labeledAd, sampleNative, sampleVideo } from '@/lib/sampleAds';

const ADSOURCE_ID = 'vp-streamflix';

/** Catalog entry for the ad network / platform that served the creative. */
const adsourceInfo = (): AdViewAdSourceInfo => ({
  id: ADSOURCE_ID,
  name: 'StreamFlix',
  icon_url:
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=64&h=64&fit=crop',
  domain: 'streamflix.example',
  description: 'Video platform demand partner',
  metadata: {
    type: 'videoplatform',
  },
});

const inventory: AdViewGroupItem[] = [
  labeledAd(sampleVideo, 'streamflix', {
    id: 'adinfo-video-1',
    fields: {
      title: 'Watch tonight',
      description: 'Creative carries adinfo → links to adsources via adsource_id.',
      brandName: 'StreamFlix Originals',
    },
    adinfo: {
      advertiser: {
        id: 'adv-streamflix',
        name: 'StreamFlix Media',
        about_url: 'https://example.com/about',
        privacy_url: 'https://example.com/privacy',
      },
      ad: {
        id: 'campaign-line-42',
        campaign_id: 'spring-2026',
        adsource_id: ADSOURCE_ID,
        description: 'Preroll · home feed',
        min_age: 13,
      },
      actions: [
        {
          type: 'cta',
          title: 'Start free trial',
          description: 'Advertiser deep link',
          url: 'https://example.com/trial',
        },
      ],
    },
  }),
  labeledAd(sampleNative, 'streamflix', {
    id: 'adinfo-native-1',
    fields: {
      title: 'Same source, native format',
      description: 'Shares the same adsource_id → resolved from adsources[].',
      brandName: 'StreamFlix',
    },
    adinfo: {
      advertiser: {
        id: 'adv-streamflix',
        name: 'StreamFlix Media',
      },
      ad: {
        id: 'campaign-line-99',
        campaign_id: 'spring-2026',
        adsource_id: ADSOURCE_ID,
      },
    },
  }),
];

const CODE = `
const adsourceId = "vp-streamflix";
const brandName = "StreamFlix";
const iconURL = "https://cdn.example/icon.png";

const adsourceInfo = (): AdViewAdSourceInfo => ({
  id: adsourceId,
  name: brandName,
  icon_url: iconURL, // typings use snake_case
  domain: "",
  description: "",
  metadata: { type: "videoplatform" },
});

const ad: AdViewGroupItem = {
  id: "ad-1",
  type: "video",
  // ...assets, fields
  adinfo: {
    advertiser: { id: "adv-1", name: "StreamFlix Media" },
    ad: {
      id: "line-42",
      campaign_id: "spring-2026",
      adsource_id: adsourceId, // links item → adsources[]
    },
    actions: [{ title: "Start trial", url: "https://example.com/trial" }],
  },
};

<AdView.Provider
  sources={[
    {
      name: "partner",
      driver: "static",
      params: {
        adsourceInfo: [adsourceInfo()], // HardDataLoader → response.adsources
        defaultData: [ad],
      },
    },
  ]}
>
  <AdView.Unit
    unitId="slot"
    format={["video", "native"]}
    acceptedFormatTypes={["*"]}
    limit={2}
    wrapper={({ adViewData, groupItems, elms }) => {
      // Catalog lives on the response — look up by adsource_id
      const sourceFor = (item: AdViewGroupItem) =>
        adViewData?.adsources?.find(
          (s) => s.id === item.adinfo?.ad?.adsource_id,
        );

      return (
        <>
          {adViewData?.adsources?.map((src) => (
            <SourceBadge key={src.id} source={src} />
          ))}
          {elms}
          {/* or build custom UI from groupItems + sourceFor(item) */}
        </>
      );
    }}
  >
    {({ data }) => {
      // Per-creative metadata on the item (tracker stripped, adinfo kept)
      const info = data?.adinfo;
      return (
        <article>
          <h3>{data?.fields?.title}</h3>
          <p>advertiser: {info?.advertiser?.name}</p>
          <p>campaign: {info?.ad?.campaign_id}</p>
          <p>adsource_id: {info?.ad?.adsource_id}</p>
          <a href={info?.actions?.[0]?.url}>{info?.actions?.[0]?.title}</a>
        </article>
      );
    }}
  </AdView.Unit>
</AdView.Provider>
`;

function SourceBadge({ source }: { source: AdViewAdSourceInfo }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.65rem 0.85rem',
        marginBottom: '0.9rem',
        borderRadius: 8,
        border: '1px solid var(--accent-border)',
        background: 'var(--ebony-850)',
      }}
    >
      {source.icon_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={source.icon_url}
          alt=""
          width={36}
          height={36}
          style={{ borderRadius: 8, objectFit: 'cover' }}
        />
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--ebony-100)' }}>
          {source.name || source.id}
          {source.metadata?.type != null && (
            <span className="chip warn" style={{ marginLeft: '0.5rem' }}>
              {String(source.metadata.type)}
            </span>
          )}
        </div>
        <div className="muted" style={{ fontSize: '0.78rem' }}>
          adsources[] · id={source.id}
          {source.domain ? ` · ${source.domain}` : ''}
        </div>
      </div>
    </div>
  );
}

export default function AdInfoPage() {
  return (
    <article>
      <header className="demo-header">
        <p className="demo-kicker">Metadata</p>
        <h2>adsourceInfo &amp; adinfo</h2>
        <p>
          Attach a source catalog via <code>params.adsourceInfo</code>, and per-item
          campaign/advertiser details via <code>adinfo</code>. Link them with{' '}
          <code>adinfo.ad.adsource_id</code> → <code>adsources[].id</code>.
        </p>
      </header>

      <div className="demo-grid">
        <section className="panel">
          <div className="panel-head">
            <h3>Live preview</h3>
            <span className="chip">static + adsourceInfo</span>
          </div>
          <div className="panel-body">
            <AdView.Provider
              sources={[
                {
                  name: 'streamflix',
                  driver: 'static',
                  params: {
                    version: 'adinfo-demo-1',
                    adsourceInfo: [adsourceInfo()],
                    defaultData: inventory,
                  },
                },
              ]}
            >
              <AdView.Unit
                unitId="adinfo-demo"
                format={['video', 'native']}
                limit={2}
                acceptedFormatTypes={['*']}
                wrapper={({ adViewData, groupItems, elms }) => (
                  <div style={{ width: '100%' }}>
                    {(adViewData?.adsources || []).map(source => (
                      <SourceBadge key={source.id} source={source} />
                    ))}
                    <div
                      style={{
                        display: 'grid',
                        gap: '0.85rem',
                      }}
                    >
                      {elms}
                    </div>
                    <pre
                      className="code-block"
                      style={{ marginTop: '1rem', fontSize: '0.75rem' }}
                    >
                      {JSON.stringify(
                        {
                          adsources: adViewData?.adsources,
                          items: groupItems.map(item => ({
                            id: item.id,
                            type: item.type,
                            adinfo: item.adinfo,
                          })),
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                )}
              >
                {({ data, state, error }) => {
                  if (state.isLoading) {
                    return <p className="muted">Loading…</p>;
                  }
                  if (error) {
                    return <p className="muted">Error: {error.message}</p>;
                  }
                  if (!data) {
                    return <p className="muted">No ad</p>;
                  }

                  const info = data.adinfo;
                  const image =
                    data.assets?.find(a => a.name === 'main') ||
                    data.assets?.[0];

                  return (
                    <article className="ad-card" style={{ width: '100%' }}>
                      {image?.path && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image.path}
                          alt={String(data.fields?.title || 'Ad')}
                        />
                      )}
                      <div className="ad-body">
                        <div className="ad-label">
                          {data.type} · {data.id}
                        </div>
                        <h4>{String(data.fields?.title || 'Untitled')}</h4>
                        {data.fields?.description != null && (
                          <p>{String(data.fields.description)}</p>
                        )}

                        <div
                          style={{
                            marginTop: '0.75rem',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid var(--ebony-700)',
                            display: 'grid',
                            gap: '0.35rem',
                            fontSize: '0.8rem',
                            color: 'var(--ebony-300)',
                          }}
                        >
                          <div>
                            <strong style={{ color: 'var(--ebony-200)' }}>
                              data.adinfo
                            </strong>
                          </div>
                          <div>
                            advertiser:{' '}
                            <span style={{ color: 'var(--accent)' }}>
                              {info?.advertiser?.name || '—'}
                            </span>{' '}
                            ({info?.advertiser?.id || '—'})
                          </div>
                          <div>
                            campaign:{' '}
                            {info?.ad?.campaign_id || '—'} · adsource_id:{' '}
                            <code>{info?.ad?.adsource_id || '—'}</code>
                          </div>
                          {info?.actions?.[0] && (
                            <div>
                              action:{' '}
                              <a
                                href={info.actions[0].url}
                                style={{ color: 'var(--accent)' }}
                              >
                                {info.actions[0].title || info.actions[0].url}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                }}
              </AdView.Unit>
            </AdView.Provider>

            <ul className="feature-list" style={{ marginTop: '1.1rem' }}>
              <li>
                <strong>params.adsourceInfo</strong>
                <span>
                  Passed into <code>static</code> / HardDataLoader. Matching
                  entries are copied onto the response as{' '}
                  <code>adsources</code> (match by{' '}
                  <code>item.adinfo.ad.adsource_id</code>).
                </span>
              </li>
              <li>
                <strong>item.adinfo</strong>
                <span>
                  Available in Unit children as <code>data.adinfo</code>{' '}
                  (advertiser, campaign meta, CTAs). Tracker is stripped; adinfo
                  is kept.
                </span>
              </li>
              <li>
                <strong>wrapper → adViewData.adsources</strong>
                <span>
                  Resolve icon/name/metadata for badges or reporting without
                  duplicating source fields on every item.
                </span>
              </li>
            </ul>
          </div>

          <CodeReveal code={CODE} title="Show adsourceInfo + adinfo example" defaultOpen />
        </section>
      </div>
    </article>
  );
}
