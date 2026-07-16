'use client';

import type { AdViewData, AdViewGroupItem } from '@adview/core/typings';
import * as AdView from '@adview/react';
import React, { useMemo, useState } from 'react';

import AdSlot from '@/components/AdSlot';
import CodeReveal from '@/components/CodeReveal';
import {
  labeledAd,
  sampleBanner,
  sampleNative,
  sampleProxySized,
  sampleVideo,
} from '@/lib/sampleAds';

type DemoMode = 'query' | 'wrapper' | 'filterItems' | 'acceptedFormatTypes';

const MIXED_INVENTORY: AdViewGroupItem[] = [
  labeledAd(sampleBanner, 'demo', {
    id: 'up-banner',
    fields: { title: 'Banner creative', description: 'type=banner' },
  }),
  labeledAd(sampleNative, 'demo', {
    id: 'up-native',
    fields: { title: 'Native creative', description: 'type=native' },
  }),
  labeledAd(sampleVideo, 'demo', {
    id: 'up-video',
    fields: { title: 'Video creative', description: 'type=video' },
  }),
  labeledAd(sampleProxySized, 'demo', {
    id: 'up-proxy',
    fields: { title: 'Proxy 300×250', description: 'type=proxy_300x250' },
  }),
];

const CODE_QUERY = `
<AdView.Unit
  unitId="slot"
  format="banner"
  query={{ locale: "en", w: "300", h: "250", campaign: "spring" }}
>
  {({ data }) => <AdCard data={data} />}
</AdView.Unit>

// query is forwarded to every driver's fetchAdData(..., query)
// Dynamic URLs can use {<locale>}, {<q.key>}, or append unknown keys.
`;

const CODE_WRAPPER = `
<AdView.Unit
  unitId="slot"
  format={["banner", "native"]}
  limit={3}
  wrapper={({ adViewData, groupItems, elms }) => (
    <section className="rail">
      <header>{groupItems.length} ads · v{adViewData?.version}</header>
      <div className="rail-grid">{elms}</div>
    </section>
  )}
>
  {({ data }) => <AdCard data={data} />}
</AdView.Unit>
`;

const CODE_FILTER = `
<AdView.Unit
  unitId="slot"
  format={["banner", "native", "video"]}
  limit={10}
  acceptedFormatTypes={["*"]}
  filterItems={(items) =>
    items.filter((item) => item.type !== "video")
  }
>
  {({ data }) => <AdCard data={data} />}
</AdView.Unit>
`;

const CODE_ACCEPTED = `
// Request formats may be narrow; acceptedFormatTypes widens client-side keep-list.
<AdView.Unit
  unitId="slot"
  format={["banner"]}           // what you ask the backend for
  acceptedFormatTypes={["*"]}   // what you keep after fetch (* | all | explicit)
  limit={5}
>
  {({ data }) => <AdCard data={data} />}
</AdView.Unit>
`;

export default function UnitPropsPage() {
  const [mode, setMode] = useState<DemoMode>('query');
  const [locale, setLocale] = useState('en');
  const [hideVideo, setHideVideo] = useState(true);
  const [accepted, setAccepted] = useState<'strict' | 'star'>('star');

  const [lastQuery, setLastQuery] = useState<Record<string, unknown> | null>(
    null,
  );

  const functionSource = useMemo(
    () => ({
      name: 'probe',
      driver: 'function' as const,
      params: {
        fetchAdData: async (
          unitId: string,
          limit: number,
          format?: string | string[],
          query?: { [key: string]: unknown },
        ): Promise<AdViewData> => {
          setLastQuery(query || null);
          const formats = Array.isArray(format)
            ? format
            : format
              ? [format]
              : null;
          // Ignore request format filter so acceptedFormatTypes demo can show extras
          const pool =
            mode === 'acceptedFormatTypes'
              ? MIXED_INVENTORY
              : MIXED_INVENTORY.filter(
                  item => !formats || formats.includes(item.type),
                );
          return {
            version: 'unit-props-1',
            groups: [
              {
                id: unitId,
                items: pool.slice(0, Math.max(limit, pool.length)),
              },
            ],
          };
        },
      },
    }),
    [mode],
  );

  const code =
    mode === 'query'
      ? CODE_QUERY
      : mode === 'wrapper'
        ? CODE_WRAPPER
        : mode === 'filterItems'
          ? CODE_FILTER
          : CODE_ACCEPTED;

  return (
    <article>
      <header className="demo-header">
        <p className="demo-kicker">Unit API</p>
        <h2>query · wrapper · filterItems · acceptedFormatTypes</h2>
        <p>
          Fine-grained Unit controls: pass request params, reshape the rendered
          list, post-filter items, and widen which creative types survive
          client-side format checks.
        </p>
      </header>

      <div className="demo-grid">
        <section className="panel">
          <div className="panel-head">
            <h3>Live preview</h3>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {(
                [
                  'query',
                  'wrapper',
                  'filterItems',
                  'acceptedFormatTypes',
                ] as const
              ).map(value => (
                <button
                  key={value}
                  type="button"
                  className={`chip${mode === value ? ' warn' : ''}`}
                  onClick={() => setMode(value)}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-body">
            {mode === 'query' && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <span className="muted">locale</span>
                {(['en', 'de', 'uk'] as const).map(value => (
                  <button
                    key={value}
                    type="button"
                    className={`chip${locale === value ? ' on' : ''}`}
                    onClick={() => setLocale(value)}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {value}
                  </button>
                ))}
              </div>
            )}

            {mode === 'filterItems' && (
              <div style={{ marginBottom: '1rem' }}>
                <button
                  type="button"
                  className={`chip${hideVideo ? ' on' : ''}`}
                  onClick={() => setHideVideo(v => !v)}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  filterItems: exclude video = {hideVideo ? 'on' : 'off'}
                </button>
              </div>
            )}

            {mode === 'acceptedFormatTypes' && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  className={`chip${accepted === 'strict' ? ' on' : ''}`}
                  onClick={() => setAccepted('strict')}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  acceptedFormatTypes unset (strict vs format)
                </button>
                <button
                  type="button"
                  className={`chip${accepted === 'star' ? ' on' : ''}`}
                  onClick={() => setAccepted('star')}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  {'acceptedFormatTypes={["*"]}'}
                </button>
              </div>
            )}

            <AdView.Provider key={`${mode}-${locale}-${hideVideo}-${accepted}`} sources={[functionSource]}>
              {mode === 'query' && (
                <AdView.Unit
                  unitId="unit-query"
                  format="banner"
                  limit={1}
                  query={{
                    locale,
                    w: '300',
                    h: '250',
                    campaign: 'spring',
                  }}
                >
                  {({ data, state, error }) => (
                    <AdSlot data={data} state={state} error={error} />
                  )}
                </AdView.Unit>
              )}

              {mode === 'wrapper' && (
                <AdView.Unit
                  unitId="unit-wrapper"
                  format={['banner', 'native', 'video', 'proxy_300x250']}
                  limit={4}
                  acceptedFormatTypes={['*']}
                  wrapper={({ adViewData, groupItems, elms }) => (
                    <section
                      style={{
                        width: '100%',
                        border: '1px solid var(--accent-border)',
                        borderRadius: 10,
                        overflow: 'hidden',
                        background: 'var(--ebony-850)',
                      }}
                    >
                      <header
                        style={{
                          padding: '0.65rem 0.9rem',
                          borderBottom: '1px solid var(--ebony-750)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          fontSize: '0.8rem',
                          color: 'var(--ebony-300)',
                        }}
                      >
                        <span>
                          wrapper · {groupItems.length} item
                          {groupItems.length === 1 ? '' : 's'}
                        </span>
                        <span className="chip warn">
                          version {adViewData?.version || '—'}
                        </span>
                      </header>
                      <div
                        style={{
                          display: 'grid',
                          gap: '0.75rem',
                          padding: '0.9rem',
                        }}
                      >
                        {elms}
                      </div>
                    </section>
                  )}
                >
                  {({ data, state, error }) => (
                    <AdSlot data={data} state={state} error={error} />
                  )}
                </AdView.Unit>
              )}

              {mode === 'filterItems' && (
                <AdView.Unit
                  unitId="unit-filter"
                  format={['banner', 'native', 'video', 'proxy_300x250']}
                  limit={10}
                  acceptedFormatTypes={['*']}
                  filterItems={items =>
                    hideVideo
                      ? items.filter(item => item.type !== 'video')
                      : items
                  }
                >
                  {({ data, state, error }) => (
                    <div style={{ width: '100%', marginBottom: '0.75rem' }}>
                      <AdSlot data={data} state={state} error={error} />
                    </div>
                  )}
                </AdView.Unit>
              )}

              {mode === 'acceptedFormatTypes' && (
                <AdView.Unit
                  unitId="unit-accepted"
                  format={['banner']}
                  limit={10}
                  acceptedFormatTypes={
                    accepted === 'star' ? ['*'] : undefined
                  }
                >
                  {({ data, state, error }) => (
                    <div style={{ width: '100%', marginBottom: '0.75rem' }}>
                      <AdSlot data={data} state={state} error={error} />
                    </div>
                  )}
                </AdView.Unit>
              )}
            </AdView.Provider>

            {mode === 'query' && (
              <div style={{ marginTop: '1rem' }}>
                <div className="panel-head" style={{ borderRadius: 8 }}>
                  <h3>query received by fetchAdData</h3>
                </div>
                <pre className="code-block" style={{ marginTop: 0 }}>
                  {JSON.stringify(lastQuery, null, 2) || '—'}
                </pre>
              </div>
            )}

            <ul className="feature-list" style={{ marginTop: '1.1rem' }}>
              {mode === 'query' && (
                <li>
                  <strong>query</strong>
                  <span>
                    Arbitrary request bag forwarded to{' '}
                    <code>fetchAdData(unitId, limit, format, query)</code>.
                    Useful for locale, sizes, targeting flags.
                  </span>
                </li>
              )}
              {mode === 'wrapper' && (
                <li>
                  <strong>wrapper</strong>
                  <span>
                    Receives <code>adViewData</code>, <code>groupItems</code>,
                    and rendered <code>elms</code> — wrap the whole rail, add
                    chrome, or rearrange layout.
                  </span>
                </li>
              )}
              {mode === 'filterItems' && (
                <li>
                  <strong>filterItems</strong>
                  <span>
                    Runs after fetch / format checks. Drop, reorder, or cap
                    items before templates render.
                  </span>
                </li>
              )}
              {mode === 'acceptedFormatTypes' && (
                <li>
                  <strong>acceptedFormatTypes</strong>
                  <span>
                    When set, replaces the strict <code>format</code> keep-list
                    on the client. Use <code>[&quot;*&quot;]</code> /{' '}
                    <code>[&quot;all&quot;]</code> to accept every returned type
                    while still requesting a primary <code>format</code>.
                  </span>
                </li>
              )}
            </ul>
          </div>

          <CodeReveal code={code} title={`Show ${mode} example`} defaultOpen />
        </section>
      </div>
    </article>
  );
}
