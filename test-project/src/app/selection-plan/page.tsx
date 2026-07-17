'use client';

import type { AdViewSelectionPlan } from '@adview/core/typings';
import * as AdView from '@adview/react';
import React, { useMemo, useState } from 'react';

import AdSlot from '@/components/AdSlot';
import CodeReveal from '@/components/CodeReveal';
import { labeledAd, sampleBanner, sampleNative } from '@/lib/sampleAds';

type Mode = 'waterfall' | 'parallel' | 'weighted' | 'earlyStop' | 'shorthand';

const SOURCES = [
  {
    name: 'main',
    driver: 'static' as const,
    params: {
      defaultData: [
        labeledAd(sampleBanner, 'main', {
          id: 'sp-main-1',
          fields: {
            title: 'Main #1',
            description: 'From source “main” · solo stages keep order',
          },
        }),
        labeledAd(sampleBanner, 'main', {
          id: 'sp-main-2',
          fields: {
            title: 'Main #2',
            description: 'From source “main” · solo stages keep order',
          },
        }),
      ],
    },
  },
  {
    name: 'second',
    driver: 'static' as const,
    weight: 20,
    params: {
      defaultData: [
        labeledAd(sampleNative, 'second', {
          id: 'sp-second-1',
          type: 'banner',
          fields: {
            title: 'Second #1',
            description: 'From “second” · parallel / weighted stages',
          },
          assets: sampleBanner.assets,
        }),
        labeledAd(sampleNative, 'second', {
          id: 'sp-second-2',
          type: 'banner',
          fields: {
            title: 'Second #2',
            description: 'From “second” · parallel / weighted stages',
          },
          assets: sampleBanner.assets,
        }),
      ],
    },
  },
  {
    name: 'other',
    driver: 'static' as const,
    weight: 1,
    params: {
      defaultData: [
        labeledAd(sampleNative, 'other', {
          id: 'sp-other-1',
          type: 'banner',
          fields: {
            title: 'Other #1',
            description: 'From “other” · fallback or parallel peer',
          },
          assets: sampleBanner.assets,
        }),
        labeledAd(sampleNative, 'other', {
          id: 'sp-other-2',
          type: 'banner',
          fields: {
            title: 'Other #2',
            description: 'From “other” · fallback or parallel peer',
          },
          assets: sampleBanner.assets,
        }),
      ],
    },
  },
];

type PlanDemo = {
  label: string;
  selection?: AdViewSelectionPlan;
  /** When set, use sources= shorthand instead of selection */
  sources?: string[];
  defaultLimit: number;
  blurb: string;
  diagram: string;
  code: string;
};

const DEMOS: Record<Mode, PlanDemo> = {
  waterfall: {
    label: 'waterfall',
    defaultLimit: 3,
    selection: ['main', 'second', 'other'],
    blurb:
      'Strict waterfall: main → second → other. Later stages run only while remaining slots R > 0.',
    diagram: `
limit=L, R=L
│
├─ stage[0] "main"
│     FETCH main(limit=R)        ← always
│     result += items (no shuffle)
│     R -= taken
│
├─ if R == 0 → STOP (second/other NOT fetched)
│
├─ stage[1] "second"             ← only if R > 0
│     FETCH second(limit=R)
│     result += items
│     R -= taken
│
└─ stage[2] "other"              ← only if R > 0
      FETCH other(limit=R)
`.trim(),
    code: `
<AdView.Provider sources={[main, second, other]}>
  <AdView.Unit
    unitId="rail"
    format="banner"
    limit={3}
    selection={['main', 'second', 'other']}
  >
    {({ data }) => <AdCard data={data} />}
  </AdView.Unit>
</AdView.Provider>
`.trim(),
  },
  parallel: {
    label: 'parallel',
    defaultLimit: 3,
    selection: ['main', ['second', 'other']],
    blurb:
      'Main first (ordered). If still short, second + other are fetched in parallel, then weighted-shuffled (weight defaults to 1).',
    diagram: `
limit=L, R=L
│
├─ stage[0] "main"                          ← solo
│     FETCH main(limit=R)
│     result += all (no shuffle)
│     R -= taken
│
├─ if R == 0 → STOP
│     second NOT fetched
│     other  NOT fetched
│
└─ stage[1] ["second", "other"]             ← only if R > 0
      ┌─ FETCH second(limit=R) ┐  parallel
      └─ FETCH other(limit=R)  ┘
      pool = second.items + other.items
      picked = weightedShuffle(pool, take=R)
      result += picked
`.trim(),
    code: `
<AdView.Unit
  unitId="rail"
  format="banner"
  limit={3}
  selection={['main', ['second', 'other']]}
/>
`.trim(),
  },
  weighted: {
    label: 'weighted',
    defaultLimit: 4,
    selection: [
      [
        { source: 'main', weight: 90 },
        { source: 'second', weight: 20 },
      ],
      'other',
    ],
    blurb:
      'First stage: fetch main@90 + second@20 in parallel, shuffle by weight. Second stage “other” only if still under limit.',
    diagram: `
limit=L, R=L
│
├─ stage[0] [ main@90, second@20 ]          ← multi, always first
│     ┌─ FETCH main(limit=R)   ┐  parallel
│     └─ FETCH second(limit=R) ┘
│     pool = main(w=90) + second(w=20)
│     picked = weightedShuffle(pool, take=R)
│       // each draw: P(item) ∝ source weight
│     result += picked
│     R -= picked.length
│
├─ if R == 0 → STOP (other NOT fetched)
│
└─ stage[1] "other"                         ← only if R > 0
      FETCH other(limit=R)
      result += all (no shuffle)
`.trim(),
    code: `
<AdView.Unit
  unitId="rail"
  format="banner"
  limit={4}
  selection={[
    [
      { source: 'main', weight: 90 },
      { source: 'second', weight: 20 },
    ],
    'other',
  ]}
/>
`.trim(),
  },
  earlyStop: {
    label: 'early-stop',
    defaultLimit: 2,
    selection: ['main', ['second', 'other']],
    blurb:
      'main already has 2 creatives and limit=2 → parallel stage never runs. Bump limit to 3+ to see second/other appear.',
    diagram: `
main inventory: 2 items · limit=2
│
├─ FETCH main(R=2) → returns 2
│     R = 0
│
└─ STOP
      second NOT fetched
      other  NOT fetched

(Try limit=3 or 4 with the chips below.)
`.trim(),
    code: `
// main has 2 items → with limit={2} backups are skipped
<AdView.Unit
  unitId="rail"
  format="banner"
  limit={2}
  selection={['main', ['second', 'other']]}
/>
`.trim(),
  },
  shorthand: {
    label: 'sources≈selection',
    defaultLimit: 3,
    sources: ['main', 'second', 'other'],
    blurb:
      'Flat sources={[…]} is a sequential selection shorthand — same as selection={[…]} with string stages only.',
    diagram: `
sources={['main', 'second', 'other']}
        ≡
selection={['main', 'second', 'other']}

No parallel stage possible with sources= alone —
use selection= for ['main', ['second', 'other']].
`.trim(),
    code: `
{/* equivalent */}
<AdView.Unit sources={['main', 'second', 'other']} limit={3} />
<AdView.Unit selection={['main', 'second', 'other']} limit={3} />
`.trim(),
  },
};

export default function SelectionPlanPage() {
  const [mode, setMode] = useState<Mode>('waterfall');
  const demo = DEMOS[mode];
  const [limit, setLimit] = useState(demo.defaultLimit);

  const key = useMemo(
    () =>
      `${mode}-${limit}-${JSON.stringify(demo.selection ?? demo.sources)}`,
    [mode, limit, demo.selection, demo.sources],
  );

  return (
    <article>
      <header className="demo-header">
        <p className="demo-kicker">Selection</p>
        <h2>Selection plan</h2>
        <p>
          Staged priority for <code>SmartDataLoader</code>: solo waterfall,
          parallel merge, and weighted shuffle. Unit prop{' '}
          <code>selection</code> — flat <code>sources=&#123;[…]&#125;</code> stays
          a sequential shorthand.
        </p>
      </header>

      <div className="demo-grid">
        <section className="panel">
          <div className="panel-head">
            <h3>Live preview</h3>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {(Object.keys(DEMOS) as Mode[]).map(value => (
                <button
                  key={value}
                  type="button"
                  className={`chip${mode === value ? ' warn' : ''}`}
                  onClick={() => {
                    setMode(value);
                    setLimit(DEMOS[value].defaultLimit);
                  }}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  {DEMOS[value].label}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-body">
            <p className="muted" style={{ marginTop: 0 }}>
              {demo.blurb}
            </p>

            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <span className="muted">limit</span>
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  key={value}
                  type="button"
                  className={`chip${limit === value ? ' on' : ''}`}
                  onClick={() => setLimit(value)}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  {value}
                </button>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
              }}
            >
              <div>
                <div className="panel-head" style={{ borderRadius: 8 }}>
                  <h3>Inventory</h3>
                </div>
                <ul className="feature-list" style={{ marginTop: '0.75rem' }}>
                  <li>
                    <strong>main</strong>
                    <span>2 banners (sp-main-1, sp-main-2)</span>
                  </li>
                  <li>
                    <strong>second</strong>
                    <span>2 banners · source weight 20</span>
                  </li>
                  <li>
                    <strong>other</strong>
                    <span>2 banners · source weight 1</span>
                  </li>
                </ul>

                <div
                  className="panel-head"
                  style={{ borderRadius: 8, marginTop: '1rem' }}
                >
                  <h3>Fetch algorithm</h3>
                </div>
                <pre
                  className="code-block"
                  style={{
                    marginTop: 0,
                    fontSize: '0.72rem',
                    lineHeight: 1.45,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {demo.diagram}
                </pre>
              </div>

              <div>
                <AdView.Provider key={key} sources={SOURCES}>
                  <AdView.Unit
                    unitId="selection-plan"
                    format="banner"
                    limit={limit}
                    selection={demo.selection}
                    sources={demo.sources}
                    acceptedFormatTypes={['*']}
                  >
                    {({ data, state, error }) => (
                      <div style={{ width: '100%', marginBottom: '0.75rem' }}>
                        <AdSlot data={data} state={state} error={error} />
                      </div>
                    )}
                  </AdView.Unit>
                </AdView.Provider>
              </div>
            </div>

            <ul className="feature-list" style={{ marginTop: '1.1rem' }}>
              <li>
                <strong>Solo stage</strong>
                <span>
                  String ref — fetch up to R, append in source order (no
                  shuffle).
                </span>
              </li>
              <li>
                <strong>Multi stage</strong>
                <span>
                  Array of refs — fetch all in parallel, weighted-shuffle pool,
                  take R. Either all peers fetch, or none (if R already 0).
                </span>
              </li>
              <li>
                <strong>Early stop</strong>
                <span>
                  When R hits 0, remaining stages are not called. Try{' '}
                  <em>early-stop</em> with limit 2 vs 4.
                </span>
              </li>
            </ul>
          </div>

          <CodeReveal
            code={demo.code}
            title={`Show ${demo.label} example`}
            defaultOpen
          />
        </section>
      </div>
    </article>
  );
}
