import React from 'react';
import { AdViewUnitTemplateTypeProps } from '../types';

type AdViewUnitProxyTemplateProps = Omit<AdViewUnitTemplateTypeProps, 'type'> & {
  type?: 'proxy';
  className?: string;
  style?: React.CSSProperties;
};

function AdViewUnitProxyTemplate({className, style, data, state}: AdViewUnitProxyTemplateProps) {
  if (!data || !state?.isComplete) {
    return null;
  }
  const { url, fields } = data;
  const iframeSrc = fields?.url || url;

  if (!iframeSrc) {
    return null;
  }

  return (
    <iframe
      className={className}
      width="100%"
      height="100%"
      frameBorder="0"
      marginWidth={0}
      marginHeight={0}
      allowTransparency={true}
      scrolling="no"
      allowFullScreen={true}
      style={{ width: '100%', height: '100%', border: 'none', ...style }}
      src={iframeSrc}
    ></iframe>
  );
}

export default AdViewUnitProxyTemplate;
