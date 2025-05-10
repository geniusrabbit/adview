import { AdViewDataClient, AdViewStyleTokensNative } from '../types';
import getAssertByName from '../../../../utils/getAssertByName';
import prepareURL from '../../../../utils/getPrepareURL';
import srcSetCSSThumbs from '../../../../utils/getSrcSetCSSThumbs';
import React from 'react';

type AdViewUnitNativeProps = AdViewDataClient & {
  classNames?: AdViewStyleTokensNative;
};

function AdViewUnitNative({
  assets,
  fields,
  url,
  classNames,
}: AdViewUnitNativeProps) {
  const asset = getAssertByName('main', assets);

  if (!url) {
    return null;
  }

  return (
    <div className={classNames?.container}>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={prepareURL(url)}
        className={classNames?.imageLink}
      >
        {asset && (
          <img
            alt={fields?.title}
            title={fields?.title}
            src={asset.path}
            srcSet={asset.thumbs ? srcSetCSSThumbs(asset.thumbs) : undefined}
            className={classNames?.image}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        )}
      </a>
      <div className={classNames?.label}>
        {fields?.title && (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={prepareURL(url)}
            data-class="titleLink"
            className={classNames?.titleLink}
          >
            {fields.title}
          </a>
        )}
        {fields?.description && (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={prepareURL(url)}
            data-class="descriptionLink"
            className={classNames?.descriptionLink}
          >
            {fields.description}
          </a>
        )}
        {fields?.brandname && (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={prepareURL(url)}
            data-class="brandNameLink"
            className={classNames?.brandNameLink}
          >
            {fields.brandname}
          </a>
        )}
        {fields?.phone && (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={prepareURL(url)}
            data-class="phoneLink"
            className={classNames?.phoneLink}
          >
            {fields.phone}
          </a>
        )}
        {fields?.url && (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={prepareURL(url)}
            data-class="urlLink"
            className={classNames?.urlLink}
          >
            {fields?.url}
          </a>
        )}
      </div>
    </div>
  );
}

export default AdViewUnitNative;
