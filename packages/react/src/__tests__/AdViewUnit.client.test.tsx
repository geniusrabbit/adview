import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import AdViewProvider from '../AdViewUnit/AdViewProvider';
import AdViewUnitClient from '../AdViewUnit/AdViewUnit.client';

const sampleAds = [
  {
    id: 'ad-1',
    type: 'banner',
    url: 'https://example.com/1',
    fields: { title: 'First Ad' },
  },
  {
    id: 'ad-2',
    type: 'native',
    url: 'https://example.com/2',
    fields: { title: 'Second Ad' },
  },
];

describe('AdViewUnitClient', () => {
  it('renders ad data from declarative sources via Provider', async () => {
    render(
      <AdViewProvider
        sources={[
          {
            name: 'static-src',
            driver: 'static',
            params: { defaultData: sampleAds },
          },
        ]}
      >
        <AdViewUnitClient unitId="unit-1" format="banner" limit={1}>
          {({ data, state }) => (
            <div>
              {state.isLoading && <span>Loading</span>}
              {data && <span data-testid="title">{data.fields?.title}</span>}
              {!data && state.isComplete && <span>Empty</span>}
            </div>
          )}
        </AdViewUnitClient>
      </AdViewProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent('First Ad');
    });
  });

  it('filters sources by tags and names', async () => {
    render(
      <AdViewProvider
        sources={[
          {
            name: 'sidebar-src',
            driver: 'static',
            tags: ['sidebar'],
            params: {
              defaultData: [
                {
                  id: 'side',
                  type: 'banner',
                  fields: { title: 'Sidebar Ad' },
                },
              ],
            },
          },
          {
            name: 'bottom-src',
            driver: 'static',
            tags: ['bottom'],
            params: {
              defaultData: [
                {
                  id: 'bottom',
                  type: 'banner',
                  fields: { title: 'Bottom Ad' },
                },
              ],
            },
          },
        ]}
      >
        <AdViewUnitClient
          unitId="unit-1"
          format="banner"
          tags={['bottom']}
          sources={['bottom-src']}
        >
          {({ data }) => (
            <span data-testid="title">{data?.fields?.title || 'none'}</span>
          )}
        </AdViewUnitClient>
      </AdViewProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent('Bottom Ad');
    });
  });

  it('waterfalls across multiple static sources to fill limit', async () => {
    render(
      <AdViewProvider
        sources={[
          {
            name: 'a',
            driver: 'static',
            weight: 10,
            params: {
              defaultData: [
                { id: 'a1', type: 'banner', fields: { title: 'A1' } },
              ],
            },
          },
          {
            name: 'b',
            driver: 'static',
            weight: 1,
            params: {
              defaultData: [
                { id: 'b1', type: 'banner', fields: { title: 'B1' } },
              ],
            },
          },
        ]}
      >
        <AdViewUnitClient unitId="unit-1" format="banner" limit={2}>
          {({ data, state }) => {
            // Client renders one item at a time via map; collect via wrapper instead
            return (
              <span data-testid="state">
                {state.isComplete ? 'done' : 'loading'}
                {data ? `:${data.id}` : ''}
              </span>
            );
          }}
        </AdViewUnitClient>
      </AdViewProvider>,
    );

    await waitFor(() => {
      const nodes = screen.getAllByTestId('state');
      expect(nodes).toHaveLength(2);
      expect(nodes.map(n => n.textContent)).toEqual(
        expect.arrayContaining(['done:a1', 'done:b1']),
      );
    });
  });

  it('gives different creatives to Units with different tags under one Provider', async () => {
    render(
      <AdViewProvider
        sources={[
          {
            name: 'sidebar-src',
            driver: 'static',
            tags: ['sidebar'],
            params: {
              defaultData: [
                {
                  id: 'side',
                  type: 'banner',
                  fields: { title: 'Sidebar Ad' },
                },
              ],
            },
          },
          {
            name: 'bottom-src',
            driver: 'static',
            tags: ['bottom'],
            params: {
              defaultData: [
                {
                  id: 'bot',
                  type: 'banner',
                  fields: { title: 'Bottom Ad' },
                },
              ],
            },
          },
        ]}
      >
        <AdViewUnitClient unitId="u-side" format="banner" tags={['sidebar']}>
          {({ data }) => (
            <span data-testid="side">{data?.fields?.title || 'none'}</span>
          )}
        </AdViewUnitClient>
        <AdViewUnitClient unitId="u-bottom" format="banner" tags={['bottom']}>
          {({ data }) => (
            <span data-testid="bottom">{data?.fields?.title || 'none'}</span>
          )}
        </AdViewUnitClient>
      </AdViewProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('side')).toHaveTextContent('Sidebar Ad');
      expect(screen.getByTestId('bottom')).toHaveTextContent('Bottom Ad');
    });
  });

  it('applies selection plan: main first, then parallel backup stage', async () => {
    render(
      <AdViewProvider
        sources={[
          {
            name: 'main',
            driver: 'static',
            params: {
              defaultData: [
                { id: 'm1', type: 'banner', fields: { title: 'Main' } },
              ],
            },
          },
          {
            name: 'second',
            driver: 'static',
            params: {
              defaultData: [
                { id: 's1', type: 'banner', fields: { title: 'Second' } },
              ],
            },
          },
          {
            name: 'other',
            driver: 'static',
            params: {
              defaultData: [
                { id: 'o1', type: 'banner', fields: { title: 'Other' } },
              ],
            },
          },
        ]}
      >
        <AdViewUnitClient
          unitId="unit-sel"
          format="banner"
          limit={2}
          selection={['main', ['second', 'other']]}
          wrapper={({ elms }) => <div data-testid="rail">{elms}</div>}
        >
          {({ data }) => (
            <span data-testid="item">{data?.id || 'none'}</span>
          )}
        </AdViewUnitClient>
      </AdViewProvider>,
    );

    await waitFor(() => {
      const items = screen.getAllByTestId('item').map(n => n.textContent);
      expect(items).toHaveLength(2);
      expect(items[0]).toBe('m1');
      expect(['s1', 'o1']).toContain(items[1]);
    });
  });
});
