import React from 'react';
import { AdViewDataClient, AdViewStyleTokensNative } from '../types';

type AdViewUnitProxyProps = AdViewDataClient & {
  classNames?: AdViewStyleTokensNative;
};

function AdViewUnitProxy({
  // assets,
  fields,
  url,
}: AdViewUnitProxyProps) {
  const iframeSrc = fields?.url || url;

  if (!iframeSrc) {
    return null;
  }

  return (
    <iframe
      width="100%"
      height="100%"
      frameBorder="0"
      marginWidth={0}
      marginHeight={0}
      allowTransparency={true}
      scrolling="no"
      allowFullScreen={true}
      style={{ width: '100%', height: '100%' }}
      src={iframeSrc}
    ></iframe>
  );
}

export default AdViewUnitProxy;
