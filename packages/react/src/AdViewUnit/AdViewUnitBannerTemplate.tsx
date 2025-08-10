import { getAssetByName, getPrepareURL, getSrcSetCSSThumbs } from '@adview/core/utils';
import React from 'react';
import { AdViewUnitTemplateTypeProps } from '../types';

type AdViewUnitBannerTemplateProps = Omit<AdViewUnitTemplateTypeProps, 'type'> & {
  type?: 'banner';
  className?: string;
  style?: React.CSSProperties;
};

function AdViewUnitBannerTemplate({className="banner", style, data, state}: AdViewUnitBannerTemplateProps) {
  if (!data || !data.assets || !data.assets.length || !state?.isComplete) {
    return null;
  }
  const asset = getAssetByName('main', data.assets);

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={getPrepareURL(data.url)}
      className={className}
      style={{ fontSize: 0, ...style }}
    >
      {asset && (
        <img
          alt="main"
          src={asset.path}
          srcSet={asset.thumbs ? getSrcSetCSSThumbs(asset.thumbs) : ''}
        />
      )}
    </a>
  );
}

export default AdViewUnitBannerTemplate;
