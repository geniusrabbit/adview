'use client';

import * as AdView from '@adview/react';
import type { AdViewUnitTemplateTypeProps } from '@adview/react';
import React from 'react';

type BannerCardTemplateProps = Omit<AdViewUnitTemplateTypeProps, 'type'> & {
  type?: 'banner' | 'banner_300x250';
};

/** Typed template for banner / banner_300x250 creatives. */
export default function BannerCardTemplate({
  type = 'banner',
  ...props
}: BannerCardTemplateProps) {
  return (
    <AdView.Template type={type} {...props}>
      {({ data: ad }) => (
        <article className="ad-card" data-template="banner">
          {ad?.assets?.[0]?.path && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ad.assets[0].path}
              alt={String(ad.fields?.title || 'Banner')}
              style={{ maxHeight: 120, objectFit: 'cover' }}
            />
          )}
          <div className="ad-body">
            <div className="ad-label">Template · {type}</div>
            <h4>{String(ad?.fields?.title || 'Banner')}</h4>
            <p>{String(ad?.fields?.description || '')}</p>
          </div>
        </article>
      )}
    </AdView.Template>
  );
}

BannerCardTemplate.defaults = { type: 'banner' };
