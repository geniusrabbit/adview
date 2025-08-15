import { getAssetByName, getPrepareURL, getSrcSetCSSThumbs } from '@adview/core/utils';
import React from 'react';
import { AdLoadState, AdViewUnitTemplateTypeProps } from '../types';
import { matchExpectedState } from './utils';

type AdViewUnitBannerTemplateProps = Omit<AdViewUnitTemplateTypeProps, 'type'> & {
  type?: 'banner';
  className?: string;
  style?: React.CSSProperties;
};

function AdViewUnitBannerTemplate({className="banner", style, data, state, ...props}: AdViewUnitBannerTemplateProps) {
  const expectState: AdLoadState =
    (props?.isInitial || props?.isLoading || props?.isError || props?.isComplete) ? {
      isInitial: props?.isInitial,
      isLoading: props?.isLoading,
      isError: props?.isError,
      isComplete: props?.isComplete
    } : {isComplete: true};

  if (!data || !data.assets || !data.assets.length) {
    return null;
  }
  
  // Check if the expected state matches the current state
  if (!matchExpectedState(expectState, state)) {
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

AdViewUnitBannerTemplate.defaults = {
  type: 'banner',
};

export default AdViewUnitBannerTemplate;
