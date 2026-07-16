import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as AdView from '@adview/react';
import React from 'react';

/**
 * Full advertising cycle integration tests:
 * Provider config → source resolution → Unit fetch → render → tracking.
 */

const impressionUrl = 'https://track.example.com/imp?id=ad-1';
const clickUrl = 'https://track.example.com/click?id=ad-1';
const viewUrl = 'https://track.example.com/view?id=ad-1';

const bannerAd = {
  id: 'ad-1',
  type: 'banner',
  url: 'https://advertiser.example.com/landing',
  fields: { title: 'Buy Now', description: 'Great offer' },
  tracker: {
    impressions: [impressionUrl],
    clicks: [clickUrl],
    views: [viewUrl],
  },
};

const nativeAd = {
  id: 'ad-2',
  type: 'native',
  url: 'https://advertiser.example.com/native',
  fields: { title: 'Native Story', description: 'Read more' },
};

describe('Full ad cycle', () => {
  let imageSrcSpy: jest.SpyInstance;

  beforeEach(() => {
    // Capture tracking pixel fires (Image.src assignments)
    imageSrcSpy = jest
      .spyOn(global.Image.prototype, 'src', 'set')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    imageSrcSpy.mockRestore();
  });

  it('Provider → sources → Unit: loads and renders a banner ad', async () => {
    render(
      <AdView.Provider
        sources={[
          {
            name: 'primary',
            driver: 'static',
            params: { defaultData: [bannerAd] },
          },
        ]}
      >
        <AdView.Unit unitId="home-banner" format="banner" limit={1}>
          {({ data, state, error }) => (
            <div>
              {state.isLoading && <span data-testid="loading">Loading</span>}
              {error && <span data-testid="error">{error.message}</span>}
              {data && (
                <article data-testid="ad">
                  <h2>{data.fields?.title}</h2>
                  <p>{data.fields?.description}</p>
                </article>
              )}
            </div>
          )}
        </AdView.Unit>
      </AdView.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('ad')).toBeInTheDocument();
    });

    expect(screen.getByText('Buy Now')).toBeInTheDocument();
    expect(screen.getByText('Great offer')).toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  it('fires impression and view tracking pixels on render', async () => {
    render(
      <AdView.Provider
        sources={[
          {
            name: 'primary',
            driver: 'static',
            params: { defaultData: [bannerAd] },
          },
        ]}
      >
        <AdView.Unit unitId="tracked-unit" format="banner">
          {({ data }) => (
            <span data-testid="title">{data?.fields?.title || ''}</span>
          )}
        </AdView.Unit>
      </AdView.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent('Buy Now');
    });

    await waitFor(() => {
      const fired = imageSrcSpy.mock.calls.map(call => call[0] as string);
      expect(fired).toEqual(
        expect.arrayContaining([impressionUrl, viewUrl]),
      );
    });
  });

  it('fires click tracking pixel on ad click', async () => {
    render(
      <AdView.Provider
        sources={[
          {
            name: 'primary',
            driver: 'static',
            params: { defaultData: [bannerAd] },
          },
        ]}
      >
        <AdView.Unit unitId="click-unit" format="banner">
          {({ data }) => (
            <button type="button">{data?.fields?.title || 'ad'}</button>
          )}
        </AdView.Unit>
      </AdView.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Buy Now' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Buy Now' }));

    await waitFor(() => {
      const fired = imageSrcSpy.mock.calls.map(call => call[0] as string);
      expect(fired).toContain(clickUrl);
    });
  });

  it('filters by tags and source name priority', async () => {
    render(
      <AdView.Provider
        sources={[
          {
            name: 'sidebar',
            driver: 'static',
            tags: ['sidebar'],
            params: {
              defaultData: [
                {
                  id: 'side',
                  type: 'banner',
                  fields: { title: 'Sidebar' },
                },
              ],
            },
          },
          {
            name: 'bottom',
            driver: 'static',
            tags: ['bottom'],
            params: {
              defaultData: [
                {
                  id: 'bot',
                  type: 'banner',
                  fields: { title: 'Bottom' },
                },
              ],
            },
          },
        ]}
      >
        <AdView.Unit
          unitId="slot"
          format="banner"
          tags={['bottom']}
          sources={['bottom']}
        >
          {({ data }) => (
            <span data-testid="title">{data?.fields?.title || 'none'}</span>
          )}
        </AdView.Unit>
      </AdView.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent('Bottom');
    });
  });

  it('waterfalls across sources until limit is filled', async () => {
    render(
      <AdView.Provider
        sources={[
          {
            name: 'first',
            driver: 'static',
            weight: 10,
            params: {
              defaultData: [
                { id: 'a', type: 'banner', fields: { title: 'A' } },
              ],
            },
          },
          {
            name: 'second',
            driver: 'static',
            weight: 1,
            params: {
              defaultData: [
                { id: 'b', type: 'banner', fields: { title: 'B' } },
              ],
            },
          },
        ]}
      >
        <AdView.Unit unitId="multi" format="banner" limit={2}>
          {({ data }) => (
            <span data-testid="item">{data?.fields?.title}</span>
          )}
        </AdView.Unit>
      </AdView.Provider>,
    );

    await waitFor(() => {
      const items = screen.getAllByTestId('item').map(el => el.textContent);
      expect(items).toEqual(expect.arrayContaining(['A', 'B']));
      expect(items).toHaveLength(2);
    });
  });

  it('supports function driver for custom fetch in the cycle', async () => {
    const fetchAdData = jest.fn(async (unitId: string) => ({
      version: 'custom',
      groups: [
        {
          id: unitId,
          items: [nativeAd],
        },
      ],
    }));

    render(
      <AdView.Provider
        sources={[
          {
            name: 'custom',
            driver: 'function',
            params: { fetchAdData },
          },
        ]}
      >
        <AdView.Unit unitId="fn-unit" format="native">
          {({ data }) => (
            <span data-testid="title">{data?.fields?.title || ''}</span>
          )}
        </AdView.Unit>
      </AdView.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent('Native Story');
    });
    expect(fetchAdData).toHaveBeenCalledWith(
      'fn-unit',
      1,
      'native',
      undefined,
    );
  });

  it('falls back through sources when the first returns no items', async () => {
    render(
      <AdView.Provider
        sources={[
          {
            name: 'empty',
            driver: 'static',
            weight: 100,
            params: { defaultData: [] },
          },
          {
            name: 'backup',
            driver: 'static',
            weight: 1,
            params: {
              defaultData: [
                {
                  id: 'backup-1',
                  type: 'banner',
                  fields: { title: 'Backup Ad' },
                },
              ],
            },
          },
        ]}
      >
        <AdView.Unit unitId="fallback-unit" format="banner">
          {({ data }) => (
            <span data-testid="title">{data?.fields?.title || 'none'}</span>
          )}
        </AdView.Unit>
      </AdView.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('title')).toHaveTextContent('Backup Ad');
    });
  });
});
