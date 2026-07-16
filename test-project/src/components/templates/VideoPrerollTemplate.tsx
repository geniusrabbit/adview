'use client';

import * as AdView from '@adview/react';
import type { AdViewUnitTemplateTypeProps } from '@adview/react';
import React from 'react';

type VideoPrerollTemplateProps = Omit<AdViewUnitTemplateTypeProps, 'type'> & {
  type?: 'video';
};

/**
 * Custom template component — same pattern as a real-project preroll template:
 * wrap AdView.Template, default type, render via children function.
 */
export default function VideoPrerollTemplate({
  type = 'video',
  ...props
}: VideoPrerollTemplateProps) {
  return (
    <AdView.Template type={type} {...props}>
      {({ data: ad }) => (
        <article className="ad-card" data-template="video">
          {ad?.assets?.[0]?.path && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ad.assets[0].path}
              alt={String(ad.fields?.title || 'Video ad')}
            />
          )}
          <div className="ad-body">
            <div className="ad-label">
              Template · video
              {ad?.fields?.sourceName != null && (
                <>
                  {' '}
                  · source:{' '}
                  <span style={{ color: 'var(--accent)' }}>
                    {String(ad.fields.sourceName)}
                  </span>
                </>
              )}
            </div>
            <h4>{String(ad?.fields?.title || 'Video preroll')}</h4>
            <p>
              {String(
                ad?.fields?.description ||
                  'Custom AdView.Template for type="video".',
              )}
            </p>
          </div>
        </article>
      )}
    </AdView.Template>
  );
}

VideoPrerollTemplate.defaults = { type: 'video' };
