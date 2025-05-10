import { AdViewDataClient, AdViewStyleTokensNative } from '../types';
import prepareURL from '../../../../utils/getPrepareURL';
import getAssertByName from '../../../../utils/getAssertByName';
import srcSetCSSThumbs from '../../../../utils/getSrcSetCSSThumbs';
import React from 'react';

type AdViewUnitBannerProps = AdViewDataClient & {
  classNames?: AdViewStyleTokensNative;
};

function AdViewUnitBanner({ assets, url }: AdViewUnitBannerProps) {
  const asset = getAssertByName('main', assets);

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
