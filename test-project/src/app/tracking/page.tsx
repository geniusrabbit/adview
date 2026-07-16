'use client';

import * as AdView from '@adview/react';
import React, { useEffect, useState } from 'react';

import AdSlot from '@/components/AdSlot';
import DemoPage from '@/components/DemoPage';
import { sampleBanner } from '@/lib/sampleAds';

const CODE = `
const ad = {
  id: 'ad-1',
  type: 'banner',
  tracker: {
    impressions: ['https://track.example.com/imp'],
    views: ['https://track.example.com/view'],
    clicks: ['https://track.example.com/click'],
  },
  // ...
};

// Unit wraps each item in AdViewUnitTracking automatically.
// Impressions fire on mount, views on IntersectionObserver,
// clicks on wrapper click.
`;

export default function TrackingPage() {
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    const original = Object.getOwnPropertyDescriptor(
      globalThis.Image.prototype,
      'src',
    );
    const setter = original?.set;

    Object.defineProperty(globalThis.Image.prototype, 'src', {
      configurable: true,
      set(value: string) {
        if (typeof value === 'string' && value.includes('track.example.com')) {
          setEvents(prev =>
            prev.includes(value) ? prev : [...prev, value].slice(-6),
          );
        }
        setter?.call(this, value);
      },
    });

    return () => {
      if (original) {
        Object.defineProperty(globalThis.Image.prototype, 'src', original);
      }
    };
  }, []);

  return (
    <DemoPage
      kicker="Measurement"
      title="Tracking pixels"
      description="Each ad item can carry impression, view, and click trackers. AdViewUnitTracking fires them as Image pixels — inspect the event log below after the ad mounts (and after you click it)."
      code={CODE}
    >
      <AdView.Provider
        sources={[
          {
            name: 'tracked',
            driver: 'static',
            params: { defaultData: [sampleBanner] },
          },
        ]}
      >
        <AdView.Unit unitId="tracking-demo" format="banner">
          {({ data, state, error }) => (
            <AdSlot data={data} state={state} error={error} />
          )}
        </AdView.Unit>
      </AdView.Provider>

      <div style={{ marginTop: '1.1rem' }}>
        <div className="panel-head" style={{ borderRadius: 8, marginBottom: 8 }}>
          <h3>Pixel log</h3>
        </div>
        {events.length === 0 ? (
          <p className="muted">Waiting for tracking pixels…</p>
        ) : (
          <ul className="feature-list">
            {events.map(url => (
              <li key={url}>
                <strong>fired</strong>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  {url}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DemoPage>
  );
}
