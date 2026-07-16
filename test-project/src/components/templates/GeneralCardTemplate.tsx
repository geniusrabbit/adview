'use client';

import * as AdView from '@adview/react';
import type { AdViewUnitTemplateTypeProps } from '@adview/react';
import React from 'react';

type GeneralCardTemplateProps = Omit<AdViewUnitTemplateTypeProps, 'type'> & {
  /** Catch-all when no more specific template matched */
  type?: '*' | string;
  border?: boolean;
};

/**
 * Catch-all template (type="*") — used when banner/video/… did not match.
 * Mirrors the real-project GeneralCardTemplate pattern.
 */
export default function GeneralCardTemplate({
  type = '*',
  border = true,
  ...props
}: GeneralCardTemplateProps) {
  return (
    <AdView.Template type={type} {...props}>
      {({ data: ad }) => {
        // Let DefaultTemplate handle empty inventory (* would otherwise match first)
        if (!ad) return null;
        return (
          <article
            className="ad-card"
            data-template="general"
            style={
              border
                ? { outline: '1px solid var(--accent-border)' }
                : undefined
            }
          >
            {ad.assets?.[0]?.path && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ad.assets[0].path}
                alt={String(ad.fields?.title || 'Ad')}
              />
            )}
            <div className="ad-body">
              <div className="ad-label">
                Template · * (catch-all) · ad.type={ad.type || '—'}
              </div>
              <h4>{String(ad.fields?.title || 'General card')}</h4>
              <p>
                {String(
                  ad.fields?.description ||
                    'Rendered because no type-specific template matched.',
                )}
              </p>
            </div>
          </article>
        );
      }}
    </AdView.Template>
  );
}

GeneralCardTemplate.defaults = { type: '*' };
