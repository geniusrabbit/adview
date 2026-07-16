'use client';

import * as AdView from '@adview/react';
import React, { useMemo, useState } from 'react';

import AdSlot from '@/components/AdSlot';
import CodeReveal from '@/components/CodeReveal';
import { labeledAd, sampleBanner, sampleNative } from '@/lib/sampleAds';

const SOURCES = [
  {
    name: 'adxad',
    driver: 'static' as const,
    tags: ['sidebar', 'desktop'],
    params: {
      defaultData: [
        labeledAd(sampleBanner, 'adxad', {
          id: 'sel-adxad',
          fields: {
            title: 'AdXad · sidebar',
            description: 'Selected when tags include sidebar, or by name.',
          },
        }),
      ],
    },
  },
  {
    name: 'house',
    driver: 'static' as const,
    tags: ['bottom', 'mobile'],
    params: {
      defaultData: [
        labeledAd(sampleNative, 'house', {
          id: 'sel-house',
          type: 'banner',
          fields: {
            title: 'House · bottom',
            description: 'Selected when tags include bottom, or by name.',
          },
          assets: sampleBanner.assets,
        }),
      ],
    },
  },
  {
    name: 'direct',
    driver: 'static' as const,
    tags: ['sidebar', 'bottom'],
    params: {
      defaultData: [
        labeledAd(sampleNative, 'direct', {
          id: 'sel-direct',
          type: 'banner',
          fields: {
            title: 'Direct deal',
            description: 'Tagged for both sidebar and bottom.',
          },
          assets: sampleBanner.assets,
        }),
      ],
    },
  },
];

const CODE_TAGS = `
// Conditional by tags — keep sources whose tags intersect the Unit filter
<AdView.Unit unitId="slot" format="banner" tags={['sidebar']} />
`;

const CODE_NAMES = `
// Conditional by source name — also defines request priority order
<AdView.Unit
  unitId="slot"
  format="banner"
  sources={['house', 'adxad']}  // house first, then adxad
/>
`;

type Mode = 'tags' | 'names';

export default function SelectionPage() {
  const [mode, setMode] = useState<Mode>('tags');
  const [tag, setTag] = useState<'sidebar' | 'bottom'>('sidebar');
  const [names, setNames] = useState<string[]>(['house', 'adxad']);

  const unitKey = useMemo(
    () =>
      mode === 'tags'
        ? `tags-${tag}`
        : `names-${names.join('-')}`,
    [mode, tag, names],
  );

  const toggleName = (name: string) => {
    setNames(prev => {
      if (prev.includes(name)) {
        return prev.filter(n => n !== name);
      }
      return [...prev, name];
    });
  };

  return (
    <article>
      <header className="demo-header">
        <p className="demo-kicker">Unit props</p>
        <h2>Conditional source selection</h2>
        <p>
          The same Provider sources can feed different Units. Narrow them with{' '}
          <code>tags</code> (placement) or <code>sources</code> (explicit names
          + priority). Toggle the mode below to compare.
        </p>
      </header>

      <div className="demo-grid">
        <section className="panel">
          <div className="panel-head">
            <h3>Live preview</h3>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {(['tags', 'names'] as const).map(value => (
                <button
                  key={value}
                  type="button"
                  className={`chip${mode === value ? ' warn' : ''}`}
                  onClick={() => setMode(value)}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  by {value}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-body">
            {mode === 'tags' ? (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {(['sidebar', 'bottom'] as const).map(value => (
                  <button
                    key={value}
                    type="button"
                    className={`chip${tag === value ? ' on' : ''}`}
                    onClick={() => setTag(value)}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    tags=[{value}]
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {SOURCES.map(src => (
                  <button
                    key={src.name}
                    type="button"
                    className={`chip${names.includes(src.name) ? ' on' : ''}`}
                    onClick={() => toggleName(src.name)}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {src.name}
                  </button>
                ))}
                <span className="muted" style={{ alignSelf: 'center' }}>
                  order = priority
                </span>
              </div>
            )}

            <AdView.Provider sources={SOURCES}>
              <AdView.Unit
                key={unitKey}
                unitId="selection-demo"
                format="banner"
                limit={2}
                {...(mode === 'tags'
                  ? { tags: [tag] }
                  : { sources: names.length ? names : undefined })}
              >
                {({ data, state, error }) => (
                  <div style={{ width: '100%', marginBottom: '0.75rem' }}>
                    <AdSlot data={data} state={state} error={error} />
                  </div>
                )}
              </AdView.Unit>
            </AdView.Provider>

            <ul className="feature-list" style={{ marginTop: '0.75rem' }}>
              <li>
                <strong>tags</strong>
                <span>
                  Keep sources that share at least one tag with the Unit (e.g.
                  placement: sidebar / bottom).
                </span>
              </li>
              <li>
                <strong>sources=[names]</strong>
                <span>
                  Keep only named sources and run them in that array order —
                  useful for A/B or per-slot priority.
                </span>
              </li>
            </ul>
          </div>

          <CodeReveal
            code={mode === 'tags' ? CODE_TAGS : CODE_NAMES}
            title={
              mode === 'tags'
                ? 'Show tags selection code'
                : 'Show source-name selection code'
            }
          />
        </section>
      </div>
    </article>
  );
}
