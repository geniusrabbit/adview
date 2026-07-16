'use client';

import { registerDataLoader } from '@adview/core/utils';
import type {
  AdViewData,
  AdViewDataLoader,
  AdViewGroupItem,
  AdViewSourceItem,
} from '@adview/core/typings';
import * as AdView from '@adview/react';
import React, { useEffect, useState } from 'react';

import AdSlot from '@/components/AdSlot';
import CodeReveal from '@/components/CodeReveal';

/**
 * Minimal custom adapter: reads params.inventory and returns up to `limit` items.
 * Register once with registerDataLoader('mock-network', MockNetworkLoader).
 */
class MockNetworkLoader implements AdViewDataLoader {
  private items: AdViewGroupItem[];
  private label: string;

  constructor(source: AdViewSourceItem) {
    this.label = source.name;
    this.items = (source.params?.inventory || []) as AdViewGroupItem[];
  }

  /** Optional static matcher — extra gate beyond driver name */
  static matchDriver(source: AdViewSourceItem) {
    return Array.isArray(source.params?.inventory);
  }

  async fetchAdData(
    unitId: string,
    limit = 1,
    format?: string | string[],
  ): Promise<AdViewData | Error> {
    const formats = Array.isArray(format) ? format : format ? [format] : null;
    const picked = this.items
      .filter(item => !formats || formats.includes(item.type))
      .slice(0, Math.max(1, limit))
      .map(item => ({
        ...item,
        fields: {
          ...item.fields,
          sourceName: this.label,
          title: item.fields?.title || `From ${this.label}`,
        },
      }));

    if (!picked.length) {
      return new Error(`MockNetworkLoader(${this.label}): empty inventory`);
    }

    return {
      version: 'mock-1',
      groups: [{ id: unitId, items: picked }],
    };
  }
}

const CODE = `
import { registerDataLoader } from '@adview/core/utils';
import type {
  AdViewData,
  AdViewDataLoader,
  AdViewGroupItem,
  AdViewSourceItem,
} from '@adview/core/typings';

class MockNetworkLoader implements AdViewDataLoader {
  private items: AdViewGroupItem[];

  constructor(private source: AdViewSourceItem) {
    this.items = (source.params?.inventory || []) as AdViewGroupItem[];
  }

  // Optional: refine matching beyond source.driver === 'mock-network'
  static matchDriver(source: AdViewSourceItem) {
    return Array.isArray(source.params?.inventory);
  }

  async fetchAdData(
    unitId: string,
    limit = 1,
    format?: string | string[],
  ): Promise<AdViewData | Error> {
    const items = this.items.slice(0, limit);
    return {
      version: 'mock-1',
      groups: [{ id: unitId, items }],
    };
  }
}

// Register once at app bootstrap (safe to call multiple times — first wins)
registerDataLoader('mock-network', MockNetworkLoader);

// Then use it from config.sources
<AdView.Provider
  sources={[
    {
      name: 'partner',
      driver: 'mock-network',
      params: { inventory: [/* AdViewGroupItem[] */] },
    },
  ]}
>
  <AdView.Unit unitId="slot" format="native" />
</AdView.Provider>
`;

export default function CustomDriverPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    registerDataLoader('mock-network', MockNetworkLoader);
    setReady(true);
  }, []);

  return (
    <article>
      <header className="demo-header">
        <p className="demo-kicker">Extensibility</p>
        <h2>Write a custom AdViewDataLoader</h2>
        <p>
          Implement <code>fetchAdData</code>, accept <code>AdViewSourceItem</code>{' '}
          in the constructor, then register the class with{' '}
          <code>registerDataLoader(driverName, Class)</code>. After that, any
          source with <code>driver: &apos;your-name&apos;</code> will use it.
        </p>
      </header>

      <div className="demo-grid">
        <section className="panel">
          <div className="panel-head">
            <h3>Live preview · driver: mock-network</h3>
          </div>
          <div className="panel-body">
            {!ready ? (
              <p className="muted">Registering adapter…</p>
            ) : (
              <AdView.Provider
                sources={[
                  {
                    name: 'partner',
                    driver: 'mock-network',
                    params: {
                      inventory: [
                        {
                          id: 'custom-1',
                          type: 'native',
                          url: 'https://example.com/partner',
                          fields: {
                            title: 'Custom adapter creative',
                            description:
                              'Served by MockNetworkLoader via registerDataLoader.',
                          },
                          assets: [
                            {
                              name: 'main',
                              path: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=640&h=360&fit=crop',
                              type: 'image/jpeg',
                            },
                          ],
                        },
                      ],
                    },
                  },
                ]}
              >
                <AdView.Unit unitId="custom-driver-demo" format="native">
                  {({ data, state, error }) => (
                    <AdSlot data={data} state={state} error={error} />
                  )}
                </AdView.Unit>
              </AdView.Provider>
            )}

            <ul className="feature-list" style={{ marginTop: '1.1rem' }}>
              <li>
                <strong>1. Implement AdViewDataLoader</strong>
                <span>
                  constructor(source: AdViewSourceItem) and async fetchAdData(…).
                </span>
              </li>
              <li>
                <strong>2. registerDataLoader(&apos;name&apos;, Class)</strong>
                <span>
                  Call once at bootstrap. Optional 3rd arg: matcher(source) =&gt;
                  boolean. Class may also define static matchDriver.
                </span>
              </li>
              <li>
                <strong>3. Reference from sources</strong>
                <span>
                  {'{ name, driver: \'name\', params }'} — params are yours to
                  interpret inside the constructor.
                </span>
              </li>
            </ul>
          </div>
          <CodeReveal code={CODE} title="Show full adapter example" defaultOpen />
        </section>
      </div>
    </article>
  );
}
