import React from 'react';
import getAssetByName from '../../../../utils/getAssertByName';
import prepareURL from '../../../../utils/getPrepareURL';
import srcSetCSSThumbs from '../../../../utils/getSrcSetCSSThumbs';
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
        href={prepareURL(url)}
        className="banner"
        style={{ fontSize: 0 }}
      >
        {asset && (
          <img
            alt="main"
            src={asset.path}
            srcSet={asset.thumbs ? srcSetCSSThumbs(asset.thumbs) : ''}
          />
        )}
      </a>
    </center>
  );
}

export default AdViewUnitBanner;
