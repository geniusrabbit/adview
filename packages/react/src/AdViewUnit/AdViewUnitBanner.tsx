import { getAssetByName, getPrepareURL, getSrcSetCSSThumbs } from '@adview/core/utils';
import React from 'react';
import { AdViewDataClient, AdViewStyleTokensNative } from '../types';

type AdViewUnitBannerProps = AdViewDataClient & {
  classNames?: AdViewStyleTokensNative;
};

function AdViewUnitBanner({ assets, url }: AdViewUnitBannerProps) {
  const asset = getAssetByName('main', assets);

  return (
    <center>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={getPrepareURL(url)}
        className="banner"
        style={{ fontSize: 0 }}
      >
        {asset && (
          <img
            alt="main"
            src={asset.path}
            srcSet={asset.thumbs ? getSrcSetCSSThumbs(asset.thumbs) : ''}
          />
        )}
      </a>
    </center>
  );
}

export default AdViewUnitBanner;
